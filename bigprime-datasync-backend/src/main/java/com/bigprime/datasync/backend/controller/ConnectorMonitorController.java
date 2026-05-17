package com.bigprime.datasync.backend.controller;

import com.bigprime.connector.entities.HealthCheckConfigEntity;
import com.bigprime.connector.entities.HealthCheckHistoryEntity;
import com.bigprime.connector.monitor.aggregation.MetricsAggregationService;
import com.bigprime.connector.monitor.query.ConnectorMonitorQueryService;
import com.bigprime.connector.monitor.scheduler.HealthCheckScheduler;
import com.bigprime.connector.service.HealthCheckConfigService;
import com.bigprime.connector.service.HistoryDataService;
import com.bigprime.connector.vo.HealthCheckResult;
import com.bigprime.datasync.core.model.MyPageResult;
import com.bigprime.datasync.core.model.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

/**
 * 连接器监控API控制器
 * 提供监控数据查询、健康检查配置、趋势分析等接口
 *
 * @author bigprime
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/connector/monitor")
@Tag(name = "连接器监控")
@AllArgsConstructor
public class ConnectorMonitorController {

    private final ConnectorMonitorQueryService monitorQueryService;
    private final HealthCheckConfigService configService;
    private final HistoryDataService historyDataService;
    private final MetricsAggregationService aggregationService;
    private final HealthCheckScheduler healthCheckScheduler;

    /**
     * 获取监控概览统计
     */
    @GetMapping("/overview")
    @Operation(summary = "获取监控概览统计")
    public Result<Map<String, Object>> getOverview() {
        try {
            Map<String, Object> stats = monitorQueryService.getOverviewStats();
            return Result.ok(stats);
        } catch (Exception e) {
            log.error("获取监控概览失败", e);
            return Result.error("获取监控概览失败: " + e.getMessage());
        }
    }

    /**
     * 获取健康趋势数据
     */
    @GetMapping("/trend/{connectorId}")
    @Operation(summary = "获取健康趋势数据")
    public Result<List<Map<String, Object>>> getHealthTrend(
            @PathVariable String connectorId,
            @RequestParam(defaultValue = "24") int hours) {
        try {
            List<Map<String, Object>> trend = monitorQueryService.getHealthTrend(connectorId, hours);
            return Result.ok(trend);
        } catch (Exception e) {
            log.error("获取健康趋势失败: connectorId={}", connectorId, e);
            return Result.error("获取健康趋势失败: " + e.getMessage());
        }
    }

    /**
     * 获取响应时间TOP10慢连接器
     */
    @GetMapping("/top10/slow")
    @Operation(summary = "获取响应时间TOP10")
    public Result<List<Map<String, Object>>> getTop10Slow() {
        try {
            List<Map<String, Object>> top10 = monitorQueryService.getTop10SlowConnectors();
            return Result.ok(top10);
        } catch (Exception e) {
            log.error("获取TOP10慢连接器失败", e);
            return Result.error("获取TOP10慢连接器失败: " + e.getMessage());
        }
    }

    /**
     * 获取成功率排行
     */
    @GetMapping("/ranking/success-rate")
    @Operation(summary = "获取成功率排行")
    public Result<List<Map<String, Object>>> getSuccessRateRanking(
            @RequestParam(defaultValue = "10") int limit) {
        try {
            List<Map<String, Object>> ranking = monitorQueryService.getSuccessRateRanking(limit);
            return Result.ok(ranking);
        } catch (Exception e) {
            log.error("获取成功率排行失败", e);
            return Result.error("获取成功率排行失败: " + e.getMessage());
        }
    }

    /**
     * 获取连接器详细监控数据
     */
    @GetMapping("/detail/{connectorId}")
    @Operation(summary = "获取连接器详细监控数据")
    public Result<Map<String, Object>> getMonitorDetail(
            @PathVariable String connectorId,
            @RequestParam(defaultValue = "24") int hours) {
        try {
            Map<String, Object> detail = monitorQueryService.getConnectorMonitorDetail(connectorId, hours);
            return Result.ok(detail);
        } catch (Exception e) {
            log.error("获取连接器监控详情失败: connectorId={}", connectorId, e);
            return Result.error("获取监控详情失败: " + e.getMessage());
        }
    }

    /**
     * 获取健康检查历史（分页）
     */
    @PostMapping("/history/page")
    @Operation(summary = "分页查询健康检查历史")
    public Result<MyPageResult<HealthCheckHistoryEntity>> getHistoryPage(@RequestBody Map<String, Object> params) {
        try {
            String connectorId = (String) params.get("connectorId");
            Integer page = (Integer) params.getOrDefault("page", 1);
            Integer limit = (Integer) params.getOrDefault("limit", 20);
            
            MyPageResult<HealthCheckHistoryEntity> result = historyDataService.getHistoryPage(connectorId, page, limit);
            return Result.ok(result);
        } catch (Exception e) {
            log.error("分页查询健康检查历史失败", e);
            return Result.error("查询失败: " + e.getMessage());
        }
    }

    /**
     * 获取最近检查记录
     */
    @GetMapping("/history/latest/{connectorId}")
    @Operation(summary = "获取最近一次检查记录")
    public Result<HealthCheckHistoryEntity> getLatestHistory(@PathVariable String connectorId) {
        try {
            HealthCheckHistoryEntity history = historyDataService.getLatestHistory(connectorId);
            return Result.ok(history);
        } catch (Exception e) {
            log.error("获取最近检查记录失败: connectorId={}", connectorId, e);
            return Result.error("获取失败: " + e.getMessage());
        }
    }

    /**
     * 手动触发健康检查
     */
    @PostMapping("/check/trigger/{connectorId}")
    @Operation(summary = "手动触发健康检查")
    public Result<String> triggerHealthCheck(@PathVariable String connectorId) {
        try {
            CompletableFuture<HealthCheckResult> future = healthCheckScheduler.triggerCheck(connectorId);
            
            // 异步触发，立即返回
            return Result.ok("健康检查已触发");
        } catch (Exception e) {
            log.error("触发健康检查失败: connectorId={}", connectorId, e);
            return Result.error("触发失败: " + e.getMessage());
        }
    }

    /**
     * 获取健康检查配置
     */
    @GetMapping("/config/{connectorId}")
    @Operation(summary = "获取健康检查配置")
    public Result<HealthCheckConfigEntity> getConfig(@PathVariable String connectorId) {
        try {
            HealthCheckConfigEntity config = configService.getConfigByConnectorId(connectorId);
            return Result.ok(config);
        } catch (Exception e) {
            log.error("获取健康检查配置失败: connectorId={}", connectorId, e);
            return Result.error("获取配置失败: " + e.getMessage());
        }
    }

    /**
     * 保存健康检查配置
     */
    @PostMapping("/config/save")
    @Operation(summary = "保存健康检查配置")
    public Result<Long> saveConfig(@RequestBody HealthCheckConfigEntity config) {
        try {
            Long result = configService.saveConfig(config);
            return Result.ok(result);
        } catch (Exception e) {
            log.error("保存健康检查配置失败", e);
            return Result.error("保存配置失败: " + e.getMessage());
        }
    }

    /**
     * 启用/禁用健康检查
     */
    @PostMapping("/config/toggle/{connectorId}")
    @Operation(summary = "启用/禁用健康检查")
    public Result<Long> toggleHealthCheck(
            @PathVariable String connectorId,
            @RequestParam boolean enabled) {
        try {
            Long result = configService.toggleEnabled(connectorId, enabled);
            return Result.ok(result);
        } catch (Exception e) {
            log.error("切换健康检查状态失败: connectorId={}", connectorId, e);
            return Result.error("操作失败: " + e.getMessage());
        }
    }

    /**
     * 导出监控报表
     */
    @GetMapping("/export/{connectorId}")
    @Operation(summary = "导出监控报表")
    public Result<List<Map<String, Object>>> exportReport(
            @PathVariable String connectorId,
            @RequestParam(defaultValue = "7") int days) {
        try {
            List<Map<String, Object>> report = monitorQueryService.exportReport(connectorId, days);
            return Result.ok(report);
        } catch (Exception e) {
            log.error("导出监控报表失败: connectorId={}", connectorId, e);
            return Result.error("导出失败: " + e.getMessage());
        }
    }

    /**
     * 获取实时指标
     */
    @GetMapping("/metrics/realtime/{connectorId}")
    @Operation(summary = "获取实时指标")
    public Result<Object> getRealTimeMetrics(@PathVariable String connectorId) {
        try {
            Object metrics = aggregationService.getRealTimeMetrics(connectorId);
            return Result.ok(metrics);
        } catch (Exception e) {
            log.error("获取实时指标失败: connectorId={}", connectorId, e);
            return Result.error("获取失败: " + e.getMessage());
        }
    }
}
