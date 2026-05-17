package com.bigprime.datasync.backend.service;

import com.bigprime.connector.entities.ConnectorMetaEntity;
import com.bigprime.datasync.core.config.BigprimeEntityQuery;
import com.bigprime.datasync.backend.dto.*;
import com.bigprime.datasync.backend.gateway.entity.GatewayDeadLetterEntity;
import com.bigprime.datasync.backend.gateway.entity.ProtocolGatewayEntity;
import com.bigprime.datasync.dag.entity.DagExecutionRecordEntity;
import com.bigprime.datasync.dag.entity.DagNodeExecutionRecordEntity;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Service;

import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Dashboard数据统计服务
 * 
 * Created by BigPrime DataSync Team
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardService {

    private final BigprimeEntityQuery proxy;
    private final SimpleDateFormat dateTimeFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
    private final SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH");

    /**
     * 获取Dashboard核心指标概览（MCP 工具）
     */
    @Tool(description = "获取数据同步平台概览数据，包括：连接器总数/在线/离线/异常数量、今日任务执行次数/成功/失败/运行中数量及成功率、数据传输量、网关概况等关键指标。无需任何参数。")
    public DashboardOverviewVO getOverview() {
        return DashboardOverviewVO.builder()
                .connectorOverview(getConnectorOverview())
                .taskExecutionOverview(getTaskExecutionOverview())
                .dataTransferOverview(getDataTransferOverview())
                .gatewayOverview(getGatewayOverview())
                .build();
    }

    /**
     * 获取连接器总览
     */
    private DashboardOverviewVO.ConnectorOverview getConnectorOverview() {
        // 连接器总数
        Long totalCount = proxy.queryable(ConnectorMetaEntity.class).count();
        
        // 按状态统计
        List<ConnectorMetaEntity> connectors = proxy.queryable(ConnectorMetaEntity.class).toList();
        int onlineCount = 0;
        int offlineCount = 0;
        int errorCount = 0;
        
        for (ConnectorMetaEntity c : connectors) {
            String status = c.getStatus();
            if ("ACTIVE".equals(status)) {
                onlineCount++;
            } else if ("INACTIVE".equals(status)) {
                offlineCount++;
            } else if ("ERROR".equals(status)) {
                errorCount++;
            }
        }
        
        // 计算成功率
        Double successRate = totalCount > 0 ? (onlineCount * 100.0 / totalCount) : 0.0;
        
        // 昨日连接器总数（计算环比）
        Date yesterday = Date.from(LocalDate.now().minusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant());
        long yesterdayCount = proxy.queryable(ConnectorMetaEntity.class)
                .where(w -> w.createTime().le(yesterday))
                .count();
        
        Double changeRate = yesterdayCount > 0 ? 
                ((totalCount - yesterdayCount) * 100.0 / yesterdayCount) : 0.0;
        
        return DashboardOverviewVO.ConnectorOverview.builder()
                .totalCount(totalCount.intValue())
                .onlineCount(onlineCount)
                .offlineCount(offlineCount)
                .errorCount(errorCount)
                .successRate(Math.round(successRate * 100) / 100.0)
                .changeRate(Math.round(changeRate * 100) / 100.0)
                .build();
    }

    /**
     * 获取任务执行概况
     */
    private DashboardOverviewVO.TaskExecutionOverview getTaskExecutionOverview() {
        Date todayStart = Date.from(LocalDate.now().atStartOfDay(ZoneId.systemDefault()).toInstant());
        
        // 今日任务统计
        List<DagExecutionRecordEntity> todayRecords = proxy.queryable(DagExecutionRecordEntity.class)
                .where(w -> w.startTime().ge(todayStart))
                .toList();
        
        int totalCount = todayRecords.size();
        int successCount = 0;
        int failedCount = 0;
        int runningCount = 0;
        
        for (DagExecutionRecordEntity r : todayRecords) {
            String status = r.getStatus();
            if ("SUCCESS".equals(status)) {
                successCount++;
            } else if ("FAILED".equals(status)) {
                failedCount++;
            } else if ("RUNNING".equals(status)) {
                runningCount++;
            }
        }
        
        Double successRate = totalCount > 0 ? (successCount * 100.0 / totalCount) : 0.0;
        
        // 昨日任务总数
        Date yesterdayStart = Date.from(LocalDate.now().minusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant());
        long yesterdayCount = proxy.queryable(DagExecutionRecordEntity.class)
                .where(w -> {
                    w.startTime().ge(yesterdayStart);
                    w.startTime().lt(todayStart);
                })
                .count();
        
        Double changeRate = yesterdayCount > 0 ? 
                ((totalCount - yesterdayCount) * 100.0 / yesterdayCount) : 0.0;
        
        return DashboardOverviewVO.TaskExecutionOverview.builder()
                .totalCount(totalCount)
                .successCount(successCount)
                .failedCount(failedCount)
                .runningCount(runningCount)
                .successRate(Math.round(successRate * 100) / 100.0)
                .changeRate(Math.round(changeRate * 100) / 100.0)
                .build();
    }

    /**
     * 获取数据传输概览（基于 externalMetrics 真实读写行数）
     */
    private DashboardOverviewVO.DataTransferOverview getDataTransferOverview() {
        Date todayStart = Date.from(LocalDate.now().atStartOfDay(ZoneId.systemDefault()).toInstant());
            
        // 今日完成的节点执行记录（有 externalMetrics 的才是真实数据传输节点）
        List<DagNodeExecutionRecordEntity> todayNodes = proxy.queryable(DagNodeExecutionRecordEntity.class)
                .where(w -> {
                    w.startTime().ge(todayStart);
                    w.status().eq("SUCCESS");
                })
                .toList();
            
        long totalReadRows = 0;
        long totalWriteRows = 0;
        int metricsCount = 0;
            
        for (DagNodeExecutionRecordEntity node : todayNodes) {
            String metricsJson = node.getExternalMetrics();
            if (metricsJson != null && !metricsJson.isEmpty()) {
                try {
                    JSONObject metrics = JSONUtil.parseObj(metricsJson);
                    // 兼容两种字段名：SeaTunnelJobMonitor写入的是sourceReceivedCount/sinkWriteCount
                    // submit_and_wait模式写入的是readRowCount/writeRowCount
                    Long read = metrics.getLong("readRowCount");
                    if (read == null) read = metrics.getLong("sourceReceivedCount");
                    Long write = metrics.getLong("writeRowCount");
                    if (write == null) write = metrics.getLong("sinkWriteCount");
                    if (read != null && read >= 0) totalReadRows += read;
                    if (write != null && write >= 0) totalWriteRows += write;
                    if (read != null || write != null) metricsCount++;
                } catch (Exception e) {
                    log.debug("解析 externalMetrics 失败跳过: {}", metricsJson);
                }
            }
        }
            
        // totalRecords: 今日所有成功节点共处理的读取行数
        long totalRecords = totalReadRows;
        // totalBytes: 用写入行数 * 预估平均大小（512 字节/行）作为传输量估算
        long totalBytes = totalWriteRows * 512;
        // 峰値速率：按 24 小时均摩的每小时写入行数
        long peakRate = totalWriteRows > 0 ? Math.max(1L, totalWriteRows / 24) : 0L;
            
        // 昨日对比（用写入行数计算环比）
        Date yesterdayStart = Date.from(LocalDate.now().minusDays(1).atStartOfDay(ZoneId.systemDefault()).toInstant());
        List<DagNodeExecutionRecordEntity> yesterdayNodes = proxy.queryable(DagNodeExecutionRecordEntity.class)
                .where(w -> {
                    w.startTime().ge(yesterdayStart);
                    w.startTime().lt(todayStart);
                    w.status().eq("SUCCESS");
                })
                .toList();
            
        long yesterdayWriteRows = 0;
        for (DagNodeExecutionRecordEntity node : yesterdayNodes) {
            String metricsJson = node.getExternalMetrics();
            if (metricsJson != null && !metricsJson.isEmpty()) {
                try {
                    JSONObject metrics = JSONUtil.parseObj(metricsJson);
                    Long write = metrics.getLong("writeRowCount");
                    if (write == null) write = metrics.getLong("sinkWriteCount");
                    if (write != null && write >= 0) yesterdayWriteRows += write;
                } catch (Exception ignored) {}
            }
        }
            
        Double changeRate = yesterdayWriteRows > 0 ?
                ((totalWriteRows - yesterdayWriteRows) * 100.0 / yesterdayWriteRows) : 0.0;
            
        return DashboardOverviewVO.DataTransferOverview.builder()
                .totalRecords(totalRecords)
                .totalBytes(totalBytes)
                .peakRate(peakRate)
                .changeRate(Math.round(changeRate * 100) / 100.0)
                .build();
    }

    /**
     * 获取网关概览
     */
    private DashboardOverviewVO.GatewayOverview getGatewayOverview() {
        // 网关总数
        long totalCount = proxy.queryable(ProtocolGatewayEntity.class)
                .where(w -> w.deleted().eq(false))
                .count();
        
        // 运行中数量
        long runningCount = proxy.queryable(ProtocolGatewayEntity.class)
                .where(w -> {
                    w.status().eq("RUNNING");
                    w.deleted().eq(false);
                })
                .count();
        
        // 今日消息量（从网关实体累计统计）
        List<ProtocolGatewayEntity> gateways = proxy.queryable(ProtocolGatewayEntity.class)
                .where(w -> w.deleted().eq(false))
                .toList();
        
        long messageCount = 0;
        for (ProtocolGatewayEntity g : gateways) {
            if (g.getMessageCount() != null) {
                messageCount += g.getMessageCount();
            }
        }
        
        // 死信队列数量
        long deadLetterCount = proxy.queryable(GatewayDeadLetterEntity.class)
                .where(w -> w.status().eq("PENDING"))
                .count();
        
        return DashboardOverviewVO.GatewayOverview.builder()
                .totalCount((int) totalCount)
                .runningCount((int) runningCount)
                .messageCount(messageCount)
                .deadLetterCount((int) deadLetterCount)
                .build();
    }

    /**
     * 获取任务执行趋势（最近24小时）
     */
    public List<DashboardTrendDataVO> getExecutionTrend(String timeRange) {
        int hours = "24h".equals(timeRange) ? 24 : 7 * 24;
        Date startTime = new Date(System.currentTimeMillis() - hours * 3600 * 1000);
        
        List<DagExecutionRecordEntity> records = proxy.queryable(DagExecutionRecordEntity.class)
                .where(w -> w.startTime().ge(startTime))
                .toList();
        
        // 按小时分组统计
        Map<String, Map<String, Long>> hourlyStats = new TreeMap<>();
        
        for (DagExecutionRecordEntity record : records) {
            if (record.getStartTime() == null) continue;
            
            String hourKey = dateFormat.format(record.getStartTime()) + ":00";
            String status = record.getStatus();
            
            hourlyStats.putIfAbsent(hourKey, new HashMap<>());
            Map<String, Long> statusCount = hourlyStats.get(hourKey);
            statusCount.put(status, statusCount.getOrDefault(status, 0L) + 1);
        }
        
        // 转换为VO列表
        List<DashboardTrendDataVO> result = new ArrayList<>();
        for (Map.Entry<String, Map<String, Long>> entry : hourlyStats.entrySet()) {
            String time = entry.getKey();
            for (Map.Entry<String, Long> statusEntry : entry.getValue().entrySet()) {
                result.add(DashboardTrendDataVO.builder()
                        .time(time)
                        .type(statusEntry.getKey())
                        .value(statusEntry.getValue())
                        .build());
            }
        }
        
        return result;
    }

    /**
     * 获取数据传输趋势（最近24小时）
     */
    public List<DashboardTrendDataVO> getTransferTrend(String timeRange) {
        int hours = "24h".equals(timeRange) ? 24 : 7 * 24;
        Date startTime = new Date(System.currentTimeMillis() - (long) hours * 3600 * 1000);
        
        List<DagNodeExecutionRecordEntity> records = proxy.queryable(DagNodeExecutionRecordEntity.class)
                .where(w -> {
                    w.startTime().ge(startTime);
                    w.status().eq("SUCCESS");
                })
                .toList();
        
        // 按小时分组累加写入行数
        Map<String, Long> hourlyWriteRows = new TreeMap<>();
        
        for (DagNodeExecutionRecordEntity record : records) {
            if (record.getStartTime() == null) continue;
            String hourKey = dateFormat.format(record.getStartTime()) + ":00";
            long writeRows = 0;
            String metricsJson = record.getExternalMetrics();
            if (metricsJson != null && !metricsJson.isEmpty()) {
                try {
                    JSONObject metrics = JSONUtil.parseObj(metricsJson);
                    Long write = metrics.getLong("writeRowCount");
                    if (write == null) write = metrics.getLong("sinkWriteCount");
                    if (write != null && write >= 0) writeRows = write;
                } catch (Exception ignored) {}
            }
            hourlyWriteRows.merge(hourKey, writeRows, Long::sum);
        }
        
        return hourlyWriteRows.entrySet().stream()
                .map(entry -> DashboardTrendDataVO.builder()
                        .time(entry.getKey())
                        .type("writeRows")
                        .value(entry.getValue())
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * 获取连接器健康分布
     */
    public Map<String, Integer> getConnectorHealth() {
        List<ConnectorMetaEntity> connectors = proxy.queryable(ConnectorMetaEntity.class).toList();
        
        Map<String, Integer> result = new HashMap<>();
        result.put("ONLINE", 0);
        result.put("OFFLINE", 0);
        result.put("ERROR", 0);
        result.put("UNKNOWN", 0);
        
        for (ConnectorMetaEntity c : connectors) {
            String status = c.getStatus();
            // 映射数据库字段值到前端展示值
            String displayStatus = "UNKNOWN";
            if ("ACTIVE".equals(status)) {
                displayStatus = "ONLINE";
            } else if ("INACTIVE".equals(status)) {
                displayStatus = "OFFLINE";
            } else if ("ERROR".equals(status)) {
                displayStatus = "ERROR";
            }
            result.put(displayStatus, result.getOrDefault(displayStatus, 0) + 1);
        }
        
        return result;
    }

    /**
     * 获取TOP连接器（按使用频次）
     */
    public List<DashboardStatisticsVO> getTopConnectors(int limit) {
        // 从节点执行记录统计（使用节点名称作为近似）
        List<DagNodeExecutionRecordEntity> nodes = proxy.queryable(DagNodeExecutionRecordEntity.class)
                .toList();
        
        // 按节点名称分组统计
        Map<String, Long> nodeCountMap = new HashMap<>();
        for (DagNodeExecutionRecordEntity node : nodes) {
            String nodeName = node.getNodeName();
            if (nodeName != null) {
                nodeCountMap.put(nodeName, nodeCountMap.getOrDefault(nodeName, 0L) + 1);
            }
        }
        
        return nodeCountMap.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(limit)
                .map(entry -> DashboardStatisticsVO.builder()
                        .type("connector")
                        .name(entry.getKey())
                        .value(entry.getValue())
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * 获取任务类型分布（MANUAL 对应 triggerType字段）
     */
    public Map<String, Integer> getTaskDistribution() {
        List<DagExecutionRecordEntity> records = proxy.queryable(DagExecutionRecordEntity.class).toList();
            
        int manualCount = 0;
        int scheduleCount = 0;
            
        for (DagExecutionRecordEntity r : records) {
            String triggerType = r.getTriggerType();
            if ("SCHEDULE".equals(triggerType)) {
                scheduleCount++;
            } else {
                // 未设置或为 MANUAL 都算手动触发
                manualCount++;
            }
        }
            
        Map<String, Integer> result = new HashMap<>();
        result.put("MANUAL", manualCount);
        result.put("SCHEDULE", scheduleCount);
            
        return result;
    }

    /**
     * 获取运行中任务列表
     */
    public List<DashboardRunningTaskVO> getRunningTasks(int limit) {
        List<DagExecutionRecordEntity> records = proxy.queryable(DagExecutionRecordEntity.class)
                .where(w -> w.status().eq("RUNNING"))
                .orderBy(o -> o.startTime().desc())
                .limit(limit)
                .toList();
        
        List<DashboardRunningTaskVO> result = new ArrayList<>();
        for (DagExecutionRecordEntity r : records) {
            Long elapsedTime = System.currentTimeMillis() - (r.getStartTime() != null ? r.getStartTime().getTime() : 0);
                    
            result.add(DashboardRunningTaskVO.builder()
                    .id(r.getId())
                    .dagName(r.getDagName())
                    .taskType(r.getTriggerType() != null ? r.getTriggerType() : "MANUAL")
                    .progress(r.getProgress())
                    .elapsedTime(elapsedTime)
                    .startTime(r.getStartTime() != null ? dateTimeFormat.format(r.getStartTime()) : "")
                    .build());
        }
        
        return result;
    }

    /**
     * 获取失败任务列表
     */
    public List<DashboardFailedTaskVO> getFailedTasks(int limit) {
        List<DagExecutionRecordEntity> records = proxy.queryable(DagExecutionRecordEntity.class)
                .where(w -> w.status().eq("FAILED"))
                .orderBy(o -> o.endTime().desc())
                .limit(limit)
                .toList();
        
        List<DashboardFailedTaskVO> result = new ArrayList<>();
        for (DagExecutionRecordEntity r : records) {
            result.add(DashboardFailedTaskVO.builder()
                    .id(r.getId())
                    .dagName(r.getDagName())
                    .taskType(r.getTriggerType() != null ? r.getTriggerType() : "MANUAL")
                    .failedTime(r.getEndTime() != null ? dateTimeFormat.format(r.getEndTime()) : "")
                    .errorMessage(r.getErrorMessage())
                    .build());
        }
        
        return result;
    }
}
