package com.bigprime.datasync.backend.controller.alert;

import com.bigprime.alert.core.service.AlertHistoryService;
import com.bigprime.alert.storage.entity.AlertHistoryEntity;
import com.bigprime.datasync.core.model.MyPageResult;
import com.bigprime.datasync.core.model.Result;
import com.bigprime.datasync.core.model.SecurityUser;
import com.bigprime.datasync.core.model.UserDetail;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 告警历史管理 API 控制器
 * 
 * @author bigprime
 */
@Slf4j
@RestController
@RequestMapping("/api/alert/history")
@Tag(name = "告警历史管理")
public class AlertHistoryController {

    private final AlertHistoryService alertHistoryService;

    public AlertHistoryController(AlertHistoryService alertHistoryService) {
        this.alertHistoryService = alertHistoryService;
    }

    /**
     * 分页查询告警历史
     */
    @PostMapping("/list")
    @Operation(summary = "分页查询告警历史")
    public Result<MyPageResult<AlertHistoryEntity>> getHistoryList(@RequestBody Map<String, Object> params) {
        try {
            String status = params.getOrDefault("status", "").toString();
            String sourceModule = params.getOrDefault("sourceModule", "").toString();
            Integer page = Integer.parseInt(params.getOrDefault("page", "1").toString());
            Integer limit = Integer.parseInt(params.getOrDefault("pageSize", "20").toString());
            
            MyPageResult<AlertHistoryEntity> result = alertHistoryService.getPageList(
                status, sourceModule, page, limit
            );
            
            return Result.ok(result);
        } catch (Exception e) {
            log.error("查询告警历史列表失败", e);
            return Result.error("查询失败: " + e.getMessage());
        }
    }
    
    /**
     * 统计告警数据（带环比）
     */
    @GetMapping("/stats/trend")
    @Operation(summary = "统计告警数据带环比")
    public Result<Map<String, Object>> getAlertStatsWithTrend(@RequestParam(defaultValue = "24") Integer hours) {
        try {
            Map<String, Object> stats = alertHistoryService.getAlertStatsWithTrend(hours);
            return Result.ok(stats);
        } catch (Exception e) {
            log.error("统计告警数据失败: hours={}", hours, e);
            return Result.error("统计失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取按小时统计的趋势数据
     */
    @GetMapping("/stats/hourly-trend")
    @Operation(summary = "获取按小时统计的趋势数据")
    public Result<List<Map<String, Object>>> getHourlyTrend(@RequestParam(defaultValue = "24") Integer hours) {
        try {
            List<Map<String, Object>> trend = alertHistoryService.getHourlyTrend(hours);
            return Result.ok(trend);
        } catch (Exception e) {
            log.error("获取趋势数据失败: hours={}", hours, e);
            return Result.error("获取失败: " + e.getMessage());
        }
    }
    
    /**
     * 查询活跃告警
     */
    @GetMapping("/active")
    @Operation(summary = "查询所有活跃告警")
    public Result<List<AlertHistoryEntity>> getActiveAlerts() {
        try {
            List<AlertHistoryEntity> alerts = alertHistoryService.getActiveAlerts();
            return Result.ok(alerts);
        } catch (Exception e) {
            log.error("查询活跃告警失败", e);
            return Result.error("查询失败: " + e.getMessage());
        }
    }

    /**
     * 按模块查询活跃告警
     */
    @GetMapping("/active/module/{module}")
    @Operation(summary = "查询指定模块的活跃告警")
    public Result<List<AlertHistoryEntity>> getActiveAlertsByModule(@PathVariable String module) {
        try {
            List<AlertHistoryEntity> alerts = alertHistoryService.getActiveAlertsByModule(module);
            return Result.ok(alerts);
        } catch (Exception e) {
            log.error("查询模块活跃告警失败: module={}", module, e);
            return Result.error("查询失败: " + e.getMessage());
        }
    }

    /**
     * 查询告警详情
     */
    @GetMapping("/{alertId}")
    @Operation(summary = "查询告警详情")
    public Result<AlertHistoryEntity> getAlertById(@PathVariable String alertId) {
        try {
            AlertHistoryEntity alert = alertHistoryService.getByAlertId(alertId);
            if (alert == null) {
                return Result.error("告警不存在");
            }
            return Result.ok(alert);
        } catch (Exception e) {
            log.error("查询告警详情失败: alertId={}", alertId, e);
            return Result.error("查询失败: " + e.getMessage());
        }
    }

    /**
     * 解决告警
     */
    @PostMapping("/{alertId}/resolve")
    @Operation(summary = "解决告警")
    public Result<Boolean> resolveAlert(@PathVariable String alertId, @RequestBody Map<String, String> params) {
        try {
            UserDetail user = SecurityUser.getUser();
            String remark = params.getOrDefault("remark", "");
            
            boolean success = alertHistoryService.resolveAlert(
                alertId, 
                user.getId().toString(), 
                user.getUsername(), 
                remark
            );
            
            return success ? Result.ok(true) : Result.error("解决失败");
        } catch (Exception e) {
            log.error("解决告警失败: alertId={}", alertId, e);
            return Result.error("解决失败: " + e.getMessage());
        }
    }

    /**
     * 忽略告警
     */
    @PostMapping("/{alertId}/ignore")
    @Operation(summary = "忽略告警")
    public Result<Boolean> ignoreAlert(@PathVariable String alertId, @RequestBody(required = false) Map<String, String> params) {
        try {
            UserDetail user = SecurityUser.getUser();
            
            boolean success = alertHistoryService.ignoreAlert(
                alertId, 
                user.getId().toString(), 
                user.getUsername()
            );
            
            return success ? Result.ok(true) : Result.error("忽略失败");
        } catch (Exception e) {
            log.error("忽略告警失败: alertId={}", alertId, e);
            return Result.error("忽略失败: " + e.getMessage());
        }
    }

    /**
     * 统计活跃告警数
     */
    @GetMapping("/stats/active-count")
    @Operation(summary = "统计活跃告警总数")
    public Result<Long> countActiveAlerts() {
        try {
            long count = alertHistoryService.countActiveAlerts();
            return Result.ok(count);
        } catch (Exception e) {
            log.error("统计活跃告警数失败", e);
            return Result.error("统计失败: " + e.getMessage());
        }
    }

    /**
     * 按级别统计告警
     */
    @GetMapping("/stats/active-count/{level}")
    @Operation(summary = "按级别统计活跃告警")
    public Result<Long> countActiveAlertsByLevel(@PathVariable String level) {
        try {
            long count = alertHistoryService.countActiveAlertsByLevel(level);
            return Result.ok(count);
        } catch (Exception e) {
            log.error("按级别统计告警失败: level={}", level, e);
            return Result.error("统计失败: " + e.getMessage());
        }
    }
}
