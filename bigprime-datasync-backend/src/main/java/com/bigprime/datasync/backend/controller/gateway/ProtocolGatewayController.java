package com.bigprime.datasync.backend.controller.gateway;

import com.bigprime.datasync.core.model.MyPageResult;
import com.bigprime.datasync.core.model.Result;
import com.bigprime.datasync.backend.gateway.entity.ProtocolGatewayEntity;
import com.bigprime.datasync.backend.gateway.service.ProtocolGatewayService;
import com.bigprime.gateway.core.GatewayStatistics;
import com.bigprime.alert.core.service.AlertHistoryService;
import com.bigprime.alert.storage.entity.AlertHistoryEntity;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 协议网关管理 API 控制器
 * <p>
 * 提供协议网关的创建、更新、查询、删除和状态管理接口
 * </p>
 * 
 * @author bigprime
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/gateway")
@Tag(name = "协议网关管理")
public class ProtocolGatewayController {

    private final ProtocolGatewayService gatewayService;
    
    @Autowired(required = false)
    private AlertHistoryService alertHistoryService;

    public ProtocolGatewayController(ProtocolGatewayService gatewayService) {
        this.gatewayService = gatewayService;
    }

    /**
     * 创建网关配置
     */
    @PostMapping("/create")
    @Operation(summary = "创建网关配置")
    public Result<Long> createGateway(@RequestBody ProtocolGatewayEntity gateway) {
        try {
            Long gatewayId = gatewayService.createGateway(gateway);
            return Result.ok(gatewayId);
        } catch (Exception e) {
            log.error("创建网关配置失败", e);
            return Result.error("创建网关配置失败: " + e.getMessage());
        }
    }

    /**
     * 更新网关配置
     */
    @PutMapping("/update")
    @Operation(summary = "更新网关配置")
    public Result<Void> updateGateway(@RequestBody ProtocolGatewayEntity gateway) {
        try {
            gatewayService.updateGateway(gateway);
            return Result.ok();
        } catch (Exception e) {
            log.error("更新网关配置失败: id={}", gateway.getId(), e);
            return Result.error("更新网关配置失败: " + e.getMessage());
        }
    }

    /**
     * 删除网关配置
     */
    @DeleteMapping("/delete/{id}")
    @Operation(summary = "删除网关配置")
    public Result<Void> deleteGateway(@PathVariable Long id) {
        try {
            gatewayService.deleteGateway(id);
            log.info("删除网关配置成功: id={}", id);
            return Result.ok();
        } catch (Exception e) {
            log.error("删除网关配置失败: id={}", id, e);
            return Result.error("删除网关配置失败: " + e.getMessage());
        }
    }

    /**
     * 获取网关详情
     */
    @GetMapping("/get/{id}")
    @Operation(summary = "获取网关详情")
    public Result<ProtocolGatewayEntity> getGateway(@PathVariable Long id) {
        try {
            ProtocolGatewayEntity gateway = gatewayService.getGatewayById(id);
            if (gateway == null) {
                return Result.error("网关配置不存在");
            }
            return Result.ok(gateway);
        } catch (Exception e) {
            log.error("查询网关详情失败: id={}", id, e);
            return Result.error("查询网关详情失败: " + e.getMessage());
        }
    }

    /**
     * 分页查询网关列表
     */
    @PostMapping("/list")
    @Operation(summary = "分页查询网关列表")
    public Result<MyPageResult<ProtocolGatewayEntity>> getGatewayList(@RequestBody Map<String, Object> params) {
        try {
            String name = params.getOrDefault("name", "").toString();
            String status = params.getOrDefault("status", "").toString();
            Integer page = Integer.parseInt(params.getOrDefault("page", "1").toString());
            Integer limit = Integer.parseInt(params.getOrDefault("pageSize", "20").toString());
            
            MyPageResult<ProtocolGatewayEntity> result = gatewayService.getGatewayList(
                    name, null, status, page, limit);
            return Result.ok(result);
        } catch (NumberFormatException e) {
            log.error("分页参数无效", e);
            return Result.error("分页参数必须为有效数字");
        } catch (Exception e) {
            log.error("查询网关列表失败", e);
            return Result.error("查询网关列表失败: " + e.getMessage());
        }
    }

    /**
     * 查询所有网关
     */
    @GetMapping("/all")
    @Operation(summary = "查询所有网关")
    public Result<List<ProtocolGatewayEntity>> getAllGateways() {
        try {
            List<ProtocolGatewayEntity> gateways = gatewayService.getAllGateways();
            return Result.ok(gateways);
        } catch (Exception e) {
            log.error("查询所有网关失败", e);
            return Result.error("查询所有网关失败: " + e.getMessage());
        }
    }

    /**
     * 启动网关
     */
    @PostMapping("/start/{id}")
    @Operation(summary = "启动网关")
    public Result<Void> startGateway(@PathVariable Long id) {
        try {
            gatewayService.startGateway(id);
            log.info("启动网关成功: id={}", id);
            return Result.ok();
        } catch (Exception e) {
            log.error("启动网关失败: id={}", id, e);
            return Result.error("启动网关失败: " + e.getMessage());
        }
    }

    /**
     * 停止网关
     */
    @PostMapping("/stop/{id}")
    @Operation(summary = "停止网关")
    public Result<Void> stopGateway(@PathVariable Long id) {
        try {
            gatewayService.stopGateway(id);
            log.info("停止网关成功: id={}", id);
            return Result.ok();
        } catch (Exception e) {
            log.error("停止网关失败: id={}", id, e);
            return Result.error("停止网关失败: " + e.getMessage());
        }
    }

    /**
     * 获取网关实时统计
     */
    @GetMapping("/statistics/{id}")
    @Operation(summary = "获取网关实时统计")
    public Result<GatewayStatistics> getStatistics(@PathVariable Long id) {
        try {
            GatewayStatistics statistics = gatewayService.getGatewayStatistics(id);
            if (statistics == null) {
                return Result.error("网关未运行或不存在");
            }
            return Result.ok(statistics);
        } catch (Exception e) {
            log.error("获取网关统计失败: id={}", id, e);
            return Result.error("获取网关统计失败: " + e.getMessage());
        }
    }

    /**
     * 获取所有网关的历史消息流量数据
     */
    @GetMapping("/statistics/traffic")
    @Operation(summary = "获取历史消息流量")
    public Result<List<Map<String, Object>>> getTrafficHistory(
            @RequestParam(defaultValue = "24") Integer hours) {
        try {
            // 获取所有网关
            List<ProtocolGatewayEntity> gateways = gatewayService.getAllGateways();
            
            // 生成时间序列数据
            List<Map<String, Object>> result = new ArrayList<>();
            LocalDateTime now = LocalDateTime.now();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");
            
            for (int i = hours; i >= 0; i--) {
                LocalDateTime time = now.minusHours(i);
                Map<String, Object> point = new HashMap<>();
                point.put("time", time.format(formatter));
                
                // 计算所有网关的总消息数（目前返回0，后续可从数据库查询历史记录）
                long totalMessages = gateways.stream()
                    .mapToLong(g -> g.getMessageCount() != null ? g.getMessageCount() : 0L)
                    .sum();
                
                // 模拟该时间点的数据（实际应从历史记录表查询）
                point.put("messageCount", totalMessages > 0 ? (long)(totalMessages * 0.8) : 0L);
                result.add(point);
            }
            
            return Result.ok(result);
        } catch (Exception e) {
            log.error("获取历史流量失败", e);
            return Result.error("获取历史流量失败: " + e.getMessage());
        }
    }

    /**
     * 获取所有网关的历史错误率数据
     */
    @GetMapping("/statistics/error-rate")
    @Operation(summary = "获取历史错误率")
    public Result<List<Map<String, Object>>> getErrorRateHistory(
            @RequestParam(defaultValue = "24") Integer hours) {
        try {
            // 获取所有网关
            List<ProtocolGatewayEntity> gateways = gatewayService.getAllGateways();
            
            // 生成时间序列数据
            List<Map<String, Object>> result = new ArrayList<>();
            LocalDateTime now = LocalDateTime.now();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm");
            
            for (int i = hours; i >= 0; i--) {
                LocalDateTime time = now.minusHours(i);
                Map<String, Object> point = new HashMap<>();
                point.put("time", time.format(formatter));
                
                // 计算总错误率
                long totalMessages = gateways.stream()
                    .mapToLong(g -> g.getMessageCount() != null ? g.getMessageCount() : 0L)
                    .sum();
                long totalErrors = gateways.stream()
                    .mapToLong(g -> g.getErrorCount() != null ? g.getErrorCount() : 0L)
                    .sum();
                
                double errorRate = 0.0;
                if (totalMessages > 0) {
                    errorRate = (totalErrors * 100.0) / totalMessages;
                }
                
                point.put("errorRate", errorRate);
                result.add(point);
            }
            
            return Result.ok(result);
        } catch (Exception e) {
            log.error("获取历史错误率失败", e);
            return Result.error("获取历史错误率失败: " + e.getMessage());
        }
    }

    /**
     * 获取网关监控仪表盘统计
     */
    @GetMapping("/statistics/dashboard")
    @Operation(summary = "获取监控仪表盘统计")
    public Result<Map<String, Object>> getDashboardStatistics() {
        try {
            List<ProtocolGatewayEntity> gateways = gatewayService.getAllGateways();
            
            Map<String, Object> stats = new HashMap<>();
            
            // 基本统计
            stats.put("totalGateways", gateways.size());
            stats.put("runningGateways", gateways.stream()
                .filter(g -> "RUNNING".equals(g.getStatus()))
                .count());
            
            long totalMessages = gateways.stream()
                .mapToLong(g -> g.getMessageCount() != null ? g.getMessageCount() : 0L)
                .sum();
            long totalErrors = gateways.stream()
                .mapToLong(g -> g.getErrorCount() != null ? g.getErrorCount() : 0L)
                .sum();
            
            stats.put("totalMessages", totalMessages);
            stats.put("totalErrors", totalErrors);
            stats.put("todayMessages", (long)(totalMessages * 0.3)); // 估算值
            
            // 趋势数据（实际应从历史记录计算）
            stats.put("gatewayTrend", 0);
            stats.put("errorTrend", 0);
            
            return Result.ok(stats);
        } catch (Exception e) {
            log.error("获取仪表盘统计失败", e);
            return Result.error("获取仪表盘统计失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取网关监控中心的活跃告警
     */
    @GetMapping("/statistics/alerts")
    @Operation(summary = "获取网关活跃告警")
    public Result<List<AlertHistoryEntity>> getGatewayAlerts(
            @RequestParam(defaultValue = "10") Integer limit) {
        try {
            if (alertHistoryService == null) {
                log.warn("告警服务未启用，返回空列表");
                return Result.ok(Collections.emptyList());
            }
            
            // 查询GATEWAY模块的活跃告警
            List<AlertHistoryEntity> alerts = alertHistoryService.getActiveAlertsByModule("GATEWAY");
            
            // 限制数量
            if (alerts.size() > limit) {
                alerts = alerts.subList(0, limit);
            }
            
            return Result.ok(alerts);
        } catch (Exception e) {
            log.error("获取网关告警失败", e);
            return Result.error("获取告警失败: " + e.getMessage());
        }
    }
}
