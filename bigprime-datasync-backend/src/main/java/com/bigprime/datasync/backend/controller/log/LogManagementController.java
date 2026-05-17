package com.bigprime.datasync.backend.controller.log;

import com.bigprime.connector.core.BaseConnector;
import com.bigprime.datasync.core.model.Result;
import com.bigprime.log.api.dto.LogQueryRequest;
import com.bigprime.log.core.client.LokiHttpClient;
import com.bigprime.log.core.service.LogConfigService;
import com.bigprime.connector.manager.ConnectorManager;
import com.bigprime.connector.core.IConnector;
import com.bigprime.connector.entities.ConnectorMetaEntity;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.web.bind.annotation.*;

import java.time.ZoneId;
import java.util.HashMap;
import java.util.Map;

/**
 * 日志管理控制器
 * 提供日志查询、异常管理等功能
 *
 * @author bigprime
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/log")
@Tag(name = "日志管理", description = "日志查询、异常管理、统计分析")
public class LogManagementController {

    private final LokiHttpClient lokiHttpClient;
    private final LogConfigService logConfigService;
    private final ConnectorManager connectorManager;
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @Value("${loki.url}")
    private String lokiUrl;
    
    // 注释掉固定的 SkyWalking URL 配置，改为从连接器动态获取
    // @Value("${skywalking.ui.url:http://localhost:8080}")
    // private String skyWalkingUrl;

    public LogManagementController(LokiHttpClient lokiHttpClient, LogConfigService logConfigService, ConnectorManager connectorManager) {
        this.lokiHttpClient = lokiHttpClient;
        this.logConfigService = logConfigService;
        this.connectorManager = connectorManager;
    }

    /**
     * 查询日志
     */
    @PostMapping("/query")
    @Operation(summary = "查询日志", description = "根据条件查询日志")
    public Result<String> queryLogs(@RequestBody LogQueryRequest request) {
        try {
            // 构建 LogQL 查询语句
            String logql = buildLogQL(request);
            
            // 时间转换为纳秒时间戳
            long start = request.getStartTime().atZone(ZoneId.systemDefault()).toInstant().toEpochMilli() * 1_000_000;
            long end = request.getEndTime().atZone(ZoneId.systemDefault()).toInstant().toEpochMilli() * 1_000_000;
            
            // 获取 limit，如果为 null 则使用默认值 100
            int limit = request.getLimit() != null ? request.getLimit() : 100;
            if (limit <= 0) {
                limit = 100;
            }
            
            // 调用 Loki 查询
            String result = lokiHttpClient.queryRange(logql, start, end, limit);
            
            log.info("日志查询成功: logql={}, start={}, end={}, limit={}", logql, start, end, limit);
            return Result.ok(result);
            
        } catch (Exception e) {
            log.error("日志查询失败", e);
            return Result.error("日志查询失败: " + e.getMessage());
        }
    }

    /**
     * 获取 Loki 配置信息
     */
    @GetMapping("/loki-info")
    @Operation(summary = "获取Loki配置信息", description = "获取当前系统配置的Loki连接信息")
    public Result<Map<String, Object>> getLokiInfo() {
        Map<String, Object> result = new HashMap<>();
        try {
            // 从配置文件获取 Loki URL（去掉 push 路径，只保留基础地址）
            String baseUrl = lokiUrl;
            if (baseUrl.contains("/loki/api")) {
                baseUrl = baseUrl.substring(0, baseUrl.indexOf("/loki/api"));
            }
            
            result.put("url", baseUrl);
            
            // 测试连接状态
            try {
                long now = System.currentTimeMillis() * 1_000_000;
                long oneHourAgo = (System.currentTimeMillis() - 3600000) * 1_000_000;
                lokiHttpClient.labels(oneHourAgo, now);
                result.put("status", "connected");
            } catch (Exception e) {
                log.warn("Loki连接状态检测失败", e);
                result.put("status", "disconnected");
            }
            
            result.put("version", "Loki 2.x");
            
            return Result.ok(result);
        } catch (Exception e) {
            log.error("获取Loki配置信息失败", e);
            return Result.error("获取Loki配置信息失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取系统配置（Loki 地址等）
     * 注意：SkyWalking 配置已移至前端日志配置页面，此接口不再返回 skyWalkingUrl
     */
    @GetMapping("/system-config")
    @Operation(summary = "获取系统配置", description = "获取系统相关配置信息")
    public Result<Map<String, Object>> getSystemConfig() {
        Map<String, Object> config = new HashMap<>();
        config.put("lokiUrl", lokiUrl);
        return Result.ok(config);
    }
    
    /**
     * 日志统计查询（使用聚合，不受 limit 限制）
     * 使用缓存提升性能，相同时间范围的查询结果会被缓存 5 分钟
     */
    @PostMapping("/statistics")
    @Operation(summary = "日志统计", description = "使用聚合查询统计日志数据，不受条数限制")
    @Cacheable(value = "logStatistics", key = "#request.startTime.toString() + '-' + #request.endTime.toString()", unless = "#result == null || #result.code != 0")
    public Result<Map<String, Object>> queryStatistics(@RequestBody LogQueryRequest request) {
        Map<String, Object> result = new HashMap<>();
        try {
            long start = request.getStartTime().atZone(ZoneId.systemDefault()).toInstant().toEpochMilli() * 1_000_000;
            long end = request.getEndTime().atZone(ZoneId.systemDefault()).toInstant().toEpochMilli() * 1_000_000;
            
            // 计算时间范围（小时）
            long durationHours = (end - start) / 1_000_000_000 / 3600;
            if (durationHours < 1) durationHours = 1;
            
            // 1. 查询总数（使用 count_over_time 聚合）
            String totalQuery = String.format("sum(count_over_time({service_name=~\".*bigprime.*\"}[%dh]))", durationHours);
            String totalResult = lokiHttpClient.query(totalQuery, end, 1);
            int totalCount = parseCountResult(totalResult);
            
            // 2. 按级别统计
            Map<String, Integer> levelCounts = new HashMap<>();
            for (String level : new String[]{"ERROR", "WARN", "INFO", "DEBUG"}) {
                String levelQuery = String.format(
                    "sum(count_over_time({service_name=~\".*bigprime.*\", level=\"%s\"}[%dh]))",
                    level, durationHours
                );
                String levelResult = lokiHttpClient.query(levelQuery, end, 1);
                int count = parseCountResult(levelResult);
                levelCounts.put(level, count);
            }
            
            // 3. 按服务统计（Top 10）
            Map<String, Integer> serviceCounts = new HashMap<>();
            String servicesQuery = String.format(
                "sum by (service_name) (count_over_time({service_name=~\".*bigprime.*\"}[%dh]))",
                durationHours
            );
            String servicesResult = lokiHttpClient.query(servicesQuery, end, 100);
            serviceCounts = parseServiceCountResult(servicesResult);
            
            // 4. 时间趋势数据（按小时分段）
            Map<String, Object> trendData = queryTrendData(start, end, durationHours);
            
            result.put("success", true);
            result.put("total", totalCount);
            result.put("levelCounts", levelCounts);
            result.put("serviceCounts", serviceCounts);
            result.put("trendData", trendData);
            
            log.info("日志统计查询成功: total={}, levels={}", totalCount, levelCounts);
            return Result.ok(result);
        } catch (Exception e) {
            log.error("日志统计查询失败", e);
            return Result.error("日志统计查询失败: " + e.getMessage());
        }
    }
    
    /**
     * 解析 Loki count 查询结果
     */
    private int parseCountResult(String jsonResult) {
        try {
            JsonNode root = objectMapper.readTree(jsonResult);
            JsonNode data = root.path("data").path("result");
            if (data.isArray() && data.size() > 0) {
                JsonNode value = data.get(0).path("value");
                if (value.isArray() && value.size() >= 2) {
                    return value.get(1).asInt();
                }
            }
        } catch (Exception e) {
            log.warn("解析 Loki 统计结果失败: {}", e.getMessage());
        }
        return 0;
    }
    
    /**
     * 解析 Loki 服务统计结果
     */
    private Map<String, Integer> parseServiceCountResult(String jsonResult) {
        Map<String, Integer> result = new HashMap<>();
        try {
            JsonNode root = objectMapper.readTree(jsonResult);
            JsonNode data = root.path("data").path("result");
            if (data.isArray()) {
                for (JsonNode item : data) {
                    String serviceName = item.path("metric").path("service_name").asText();
                    JsonNode value = item.path("value");
                    if (value.isArray() && value.size() >= 2) {
                        int count = value.get(1).asInt();
                        result.put(serviceName, count);
                    }
                }
            }
        } catch (Exception e) {
            log.warn("解析服务统计结果失败: {}", e.getMessage());
        }
        return result;
    }
    
    /**
     * 查询时间趋势数据（按小时分段）
     */
    private Map<String, Object> queryTrendData(long start, long end, long durationHours) {
        Map<String, Object> trendData = new HashMap<>();
        try {
            // 计算步长（step）：根据时间范围动态调整
            long step;
            if (durationHours <= 6) {
                step = 300;  // 5分钟
            } else if (durationHours <= 24) {
                step = 900;  // 15分钟
            } else if (durationHours <= 168) { // 7天
                step = 3600; // 1小时
            } else {
                step = 7200; // 2小时
            }
            
            // 按级别查询时间趋势
            Map<String, Object> levelTrends = new HashMap<>();
            for (String level : new String[]{"ERROR", "WARN", "INFO", "DEBUG"}) {
                String query = String.format(
                    "sum(rate({service_name=~\".*bigprime.*\", level=\"%s\"}[5m]))",
                    level
                );
                String queryResult = lokiHttpClient.queryRange(query, start, end, 11000);
                levelTrends.put(level, parseTrendResult(queryResult));
            }
            
            trendData.put("levelTrends", levelTrends);
            trendData.put("step", step);
            
        } catch (Exception e) {
            log.warn("查询时间趋势数据失败: {}", e.getMessage());
        }
        return trendData;
    }
    
    /**
     * 解析趋势查询结果
     */
    private Map<String, Object> parseTrendResult(String jsonResult) {
        Map<String, Object> result = new HashMap<>();
        try {
            JsonNode root = objectMapper.readTree(jsonResult);
            JsonNode data = root.path("data").path("result");
            if (data.isArray() && data.size() > 0) {
                JsonNode values = data.get(0).path("values");
                if (values.isArray()) {
                    result.put("timestamps", new java.util.ArrayList<>());
                    result.put("values", new java.util.ArrayList<>());
                    
                    for (JsonNode value : values) {
                        if (value.isArray() && value.size() >= 2) {
                            ((java.util.List<Long>) result.get("timestamps")).add(value.get(0).asLong());
                            ((java.util.List<Double>) result.get("values")).add(value.get(1).asDouble());
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.warn("解析趋势结果失败: {}", e.getMessage());
        }
        return result;
    }

    /**
     * 测试 Loki 连接
     */
    @GetMapping("/test-connection")
    @Operation(summary = "测试Loki连接", description = "测试Loki服务是否可用")
    public Result<Map<String, Object>> testConnection() {
        Map<String, Object> result = new HashMap<>();
        try {
            long now = System.currentTimeMillis() * 1_000_000;
            long oneHourAgo = (System.currentTimeMillis() - 3600000) * 1_000_000;
            
            lokiHttpClient.labels(oneHourAgo, now);
            
            result.put("status", "success");
            result.put("message", "Loki连接成功");
            return Result.ok(result);
        } catch (Exception e) {
            log.error("Loki连接测试失败", e);
            return Result.error("连接失败: " + e.getMessage());
        }
    }

    /**
     * 构建 LogQL 查询语句
     */
    private String buildLogQL(LogQueryRequest request) {
        StringBuilder logql = new StringBuilder("{");
        
        boolean hasCondition = false;
        
        // 服务名称（使用 service_name 标签，支持模糊匹配）
        if (request.getServiceName() != null && !request.getServiceName().isEmpty()) {
            logql.append("service_name=~\".*").append(request.getServiceName()).append(".*\"");
            hasCondition = true;
        }
        
        // 日志级别
        if (request.getLevel() != null && !request.getLevel().isEmpty()) {
            if (hasCondition) logql.append(", ");
            logql.append("level=\"").append(request.getLevel()).append("\"");
            hasCondition = true;
        }
        
        // 如果没有任何标签条件，添加一个默认的非空匹配
        if (!hasCondition) {
            // 使用 service_name 标签，匹配所有包含 bigprime 的服务
            logql.append("service_name=~\".*bigprime.*\"");
        }
        
        logql.append("}");
        
        // 关键字过滤
        if (request.getKeyword() != null && !request.getKeyword().isEmpty()) {
            logql.append(" |= \"").append(request.getKeyword()).append("\"");
        }
        
        // TraceID 过滤
        if (request.getTraceId() != null && !request.getTraceId().isEmpty()) {
            logql.append(" |= \"").append(request.getTraceId()).append("\"");
        }
        
        return logql.toString();
    }

    /**
     * 生成 SkyWalking 追踪链接
     */
    @GetMapping("/skywalking-link/{traceId}")
    @Operation(summary = "生成SkyWalking追踪链接", description = "根据TraceId生成SkyWalking UI链接")
    public Result<Map<String, Object>> getSkyWalkingLink(@PathVariable String traceId) {
        Map<String, Object> result = new HashMap<>();
        try {
            // 从日志配置获取 SkyWalking URL（如果没有配置则返回错误）
            String skyWalkingUrl = logConfigService.getConfigValue("skywalking.url");
            
            if (skyWalkingUrl == null || skyWalkingUrl.isEmpty()) {
                return Result.error("SkyWalking URL未配置，请在日志配置页面配置");
            }
            
            // 构建完整的追踪链接
            String link = skyWalkingUrl + "/trace/" + traceId;
            result.put("link", link);
            result.put("traceId", traceId);
            
            return Result.ok(result);
        } catch (Exception e) {
            log.error("生成SkyWalking链接失败: traceId={}", traceId, e);
            return Result.error("生成SkyWalking链接失败: " + e.getMessage());
        }
    }

    /**
     * 查询日志上下文
     * 查询指定日志前后的N条日志
     */
    @PostMapping("/context")
    @Operation(summary = "查询日志上下文", description = "查询指定日志前后的N条日志")
    public Result<Map<String, Object>> queryLogContext(@RequestBody Map<String, Object> request) {
        Map<String, Object> result = new HashMap<>();
        try {
            // 解析参数
            String timestampStr = (String) request.get("timestamp");
            Integer contextSize = (Integer) request.getOrDefault("contextSize", 10);
            String serviceName = (String) request.get("serviceName");
            
            // 转换时间戳
            long centerTime = Long.parseLong(timestampStr); // 毫秒时间戳
            long beforeTime = (centerTime - (5 * 60 * 1000)) * 1_000_000; // 前5分钟，转为纳秒
            long afterTime = (centerTime + (5 * 60 * 1000)) * 1_000_000; // 后5分钟，转为纳秒
            
            // 构建查询
            String logql = "{service_name=~\".*" + serviceName + ".*\"}";
            
            // 查询前后日志
            String lokiResult = lokiHttpClient.queryRange(logql, beforeTime, afterTime, contextSize * 2);
            
            result.put("data", lokiResult);
            
            return Result.ok(result);
        } catch (Exception e) {
            log.error("查询日志上下文失败", e);
            return Result.error("查询日志上下文失败: " + e.getMessage());
        }
    }
}
