package com.bigprime.datasync.backend.controller;

import com.bigprime.connector.entities.AlertHistoryEntity;
import com.bigprime.connector.entities.AlertRuleEntity;
import com.bigprime.connector.service.AlertHistoryService;
import com.bigprime.connector.service.AlertRuleService;
import com.bigprime.datasync.core.model.MyPageResult;
import com.bigprime.datasync.core.model.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Map;

/**
 * 连接器告警API控制器
 * 提供告警规则管理、告警历史查询等接口
 *
 * @author bigprime
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/connector/alert")
@Tag(name = "连接器告警")
@AllArgsConstructor
public class ConnectorAlertController {

    private final AlertRuleService ruleService;
    private final AlertHistoryService alertHistoryService;

    // ==================== 告警规则管理 ====================

    /**
     * 获取所有启用的规则
     */
    @GetMapping("/rule/enabled")
    @Operation(summary = "获取所有启用的告警规则")
    public Result<List<AlertRuleEntity>> getAllEnabledRules() {
        try {
            List<AlertRuleEntity> rules = ruleService.getAllEnabledRules();
            return Result.ok(rules);
        } catch (Exception e) {
            log.error("获取启用规则失败", e);
            return Result.error("获取失败: " + e.getMessage());
        }
    }

    /**
     * 根据连接器ID获取规则
     */
    @GetMapping("/rule/connector/{connectorId}")
    @Operation(summary = "获取连接器的告警规则")
    public Result<List<AlertRuleEntity>> getRulesByConnector(@PathVariable String connectorId) {
        try {
            List<AlertRuleEntity> rules = ruleService.getRulesByConnectorId(connectorId);
            return Result.ok(rules);
        } catch (Exception e) {
            log.error("获取连接器规则失败: connectorId={}", connectorId, e);
            return Result.error("获取失败: " + e.getMessage());
        }
    }

    /**
     * 分页查询规则
     */
    @PostMapping("/rule/page")
    @Operation(summary = "分页查询告警规则")
    public Result<MyPageResult<AlertRuleEntity>> getRulesPage(@RequestBody Map<String, Object> params) {
        try {
            String search = (String) params.getOrDefault("search", "");
            Integer page = (Integer) params.getOrDefault("page", 1);
            Integer limit = (Integer) params.getOrDefault("limit", 20);
            
            MyPageResult<AlertRuleEntity> result = ruleService.getRulesPage(search, page, limit);
            return Result.ok(result);
        } catch (Exception e) {
            log.error("分页查询规则失败", e);
            return Result.error("查询失败: " + e.getMessage());
        }
    }

    /**
     * 保存告警规则
     */
    @PostMapping("/rule/save")
    @Operation(summary = "保存告警规则")
    public Result<Long> saveRule(@RequestBody AlertRuleEntity rule) {
        try {
            Long result = ruleService.saveRule(rule);
            return Result.ok(result);
        } catch (Exception e) {
            log.error("保存告警规则失败", e);
            return Result.error("保存失败: " + e.getMessage());
        }
    }

    /**
     * 启用/禁用规则
     */
    @PostMapping("/rule/toggle/{id}")
    @Operation(summary = "启用/禁用告警规则")
    public Result<Long> toggleRule(@PathVariable String id, @RequestParam boolean enabled) {
        try {
            Long result = ruleService.toggleRule(id, enabled);
            return Result.ok(result);
        } catch (Exception e) {
            log.error("切换规则状态失败: id={}", id, e);
            return Result.error("操作失败: " + e.getMessage());
        }
    }

    /**
     * 删除规则
     */
    @DeleteMapping("/rule/delete/{id}")
    @Operation(summary = "删除告警规则")
    public Result<Long> deleteRule(@PathVariable String id) {
        try {
            Long result = ruleService.deleteRule(id);
            return Result.ok(result);
        } catch (Exception e) {
            log.error("删除规则失败: id={}", id, e);
            return Result.error("删除失败: " + e.getMessage());
        }
    }

    /**
     * 初始化默认规则
     */
    @PostMapping("/rule/init/{connectorId}")
    @Operation(summary = "初始化默认告警规则")
    public Result<String> initDefaultRules(@PathVariable String connectorId) {
        try {
            ruleService.initializeDefaultRules(connectorId);
            return Result.ok("默认规则初始化成功");
        } catch (Exception e) {
            log.error("初始化默认规则失败: connectorId={}", connectorId, e);
            return Result.error("初始化失败: " + e.getMessage());
        }
    }

    // ==================== 告警历史管理 ====================

    /**
     * 获取活跃告警
     */
    @GetMapping("/history/active")
    @Operation(summary = "获取所有活跃告警")
    public Result<List<AlertHistoryEntity>> getActiveAlerts() {
        try {
            List<AlertHistoryEntity> alerts = alertHistoryService.getActiveAlerts();
            return Result.ok(alerts);
        } catch (Exception e) {
            log.error("获取活跃告警失败", e);
            return Result.error("获取失败: " + e.getMessage());
        }
    }

    /**
     * 获取连接器的活跃告警
     */
    @GetMapping("/history/active/{connectorId}")
    @Operation(summary = "获取连接器的活跃告警")
    public Result<List<AlertHistoryEntity>> getActiveAlertsByConnector(@PathVariable String connectorId) {
        try {
            List<AlertHistoryEntity> alerts = alertHistoryService.getActiveAlertsByConnector(connectorId);
            return Result.ok(alerts);
        } catch (Exception e) {
            log.error("获取连接器活跃告警失败: connectorId={}", connectorId, e);
            return Result.error("获取失败: " + e.getMessage());
        }
    }

    /**
     * 分页查询告警历史
     */
    @PostMapping("/history/page")
    @Operation(summary = "分页查询告警历史")
    public Result<MyPageResult<AlertHistoryEntity>> getAlertsPage(@RequestBody Map<String, Object> params) {
        try {
            String connectorId = (String) params.get("connectorId");
            Boolean resolved = (Boolean) params.get("resolved");
            Integer page = (Integer) params.getOrDefault("page", 1);
            Integer limit = (Integer) params.getOrDefault("limit", 20);
            
            // 解析时间参数
            Date startTime = null;
            Date endTime = null;
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            
            if (params.get("startTime") != null) {
                startTime = sdf.parse(params.get("startTime").toString());
            }
            if (params.get("endTime") != null) {
                endTime = sdf.parse(params.get("endTime").toString());
            }
            
            MyPageResult<AlertHistoryEntity> result = alertHistoryService.getAlertsPage(
                    connectorId, resolved, startTime, endTime, page, limit);
            return Result.ok(result);
        } catch (Exception e) {
            log.error("分页查询告警历史失败", e);
            return Result.error("查询失败: " + e.getMessage());
        }
    }

    /**
     * 获取最近告警
     */
    @GetMapping("/history/recent")
    @Operation(summary = "获取最近告警")
    public Result<List<AlertHistoryEntity>> getRecentAlerts(@RequestParam(defaultValue = "10") int limit) {
        try {
            List<AlertHistoryEntity> alerts = alertHistoryService.getRecentAlerts(limit);
            return Result.ok(alerts);
        } catch (Exception e) {
            log.error("获取最近告警失败", e);
            return Result.error("获取失败: " + e.getMessage());
        }
    }

    /**
     * 手动解决告警
     */
    @PostMapping("/history/resolve/{id}")
    @Operation(summary = "手动解决告警")
    public Result<Long> resolveAlert(
            @PathVariable String id,
            @RequestParam String resolver,
            @RequestParam String resolverName,
            @RequestParam(required = false) String remark) {
        try {
            Long result = alertHistoryService.resolveAlert(id, resolver, resolverName, remark);
            return Result.ok(result);
        } catch (Exception e) {
            log.error("解决告警失败: id={}", id, e);
            return Result.error("操作失败: " + e.getMessage());
        }
    }

    /**
     * 批量解决告警
     */
    @PostMapping("/history/resolve/batch")
    @Operation(summary = "批量解决告警")
    public Result<Integer> batchResolveAlerts(@RequestBody Map<String, Object> params) {
        try {
            @SuppressWarnings("unchecked")
            List<String> alertIds = (List<String>) params.get("alertIds");
            String resolver = (String) params.get("resolver");
            String resolverName = (String) params.get("resolverName");
            String remark = (String) params.get("remark");
            
            int count = alertHistoryService.batchResolveAlerts(alertIds, resolver, resolverName, remark);
            return Result.ok(count);
        } catch (Exception e) {
            log.error("批量解决告警失败", e);
            return Result.error("操作失败: " + e.getMessage());
        }
    }

    /**
     * 获取告警统计
     */
    @GetMapping("/statistics/{connectorId}")
    @Operation(summary = "获取告警统计")
    public Result<Map<String, Object>> getAlertStatistics(
            @PathVariable String connectorId,
            @RequestParam(required = false) String startTime,
            @RequestParam(required = false) String endTime) {
        try {
            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            Date start = startTime != null ? sdf.parse(startTime) : null;
            Date end = endTime != null ? sdf.parse(endTime) : null;
            
            Map<String, Object> stats = alertHistoryService.getAlertStatistics(connectorId, start, end);
            return Result.ok(stats);
        } catch (Exception e) {
            log.error("获取告警统计失败: connectorId={}", connectorId, e);
            return Result.error("获取失败: " + e.getMessage());
        }
    }
}
