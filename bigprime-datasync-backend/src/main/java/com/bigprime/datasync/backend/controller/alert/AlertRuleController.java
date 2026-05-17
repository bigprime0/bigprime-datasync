package com.bigprime.datasync.backend.controller.alert;

import com.bigprime.alert.core.engine.AlertRuleEvaluator;
import com.bigprime.alert.core.service.AlertRuleService;
import com.bigprime.alert.storage.entity.AlertRuleEntity;
import com.bigprime.alert.storage.repository.AlertRuleRepository;
import com.bigprime.datasync.core.model.MyPageResult;
import com.bigprime.datasync.core.model.MyPager;
import com.bigprime.datasync.core.model.Result;
import com.bigprime.datasync.core.model.SecurityUser;
import com.bigprime.datasync.core.model.UserDetail;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;
import java.util.Map;

/**
 * 告警规则管理 API 控制器
 * 
 * @author bigprime
 */
@Slf4j
@RestController
@RequestMapping("/api/alert/rule")
@Tag(name = "告警规则管理")
public class AlertRuleController {

    private final AlertRuleService alertRuleService;
    private final AlertRuleRepository alertRuleRepository;

    public AlertRuleController(AlertRuleService alertRuleService,
                              AlertRuleRepository alertRuleRepository) {
        this.alertRuleService = alertRuleService;
        this.alertRuleRepository = alertRuleRepository;
    }

    /**
     * 分页查询规则列表
     */
    @PostMapping("/list")
    @Operation(summary = "分页查询告警规则列表")
    public Result<MyPageResult<AlertRuleEntity>> getRuleList(@RequestBody Map<String, Object> params) {
        try {
            String search = params.getOrDefault("search", "").toString();
            String sourceModule = params.getOrDefault("sourceModule", "").toString();
            Integer page = Integer.parseInt(params.getOrDefault("page", "1").toString());
            Integer limit = Integer.parseInt(params.getOrDefault("pageSize", "20").toString());

            MyPageResult<AlertRuleEntity> result = alertRuleRepository.getPageList(search, sourceModule, page, limit);
            return Result.ok(result);
        } catch (Exception e) {
            log.error("查询规则列表失败", e);
            return Result.error("查询规则列表失败: " + e.getMessage());
        }
    }

    /**
     * 获取规则详情
     */
    @GetMapping("/get/{id}")
    @Operation(summary = "获取规则详情")
    public Result<AlertRuleEntity> getRule(@PathVariable Long id) {
        try {
            AlertRuleEntity rule = alertRuleService.getRuleById(id);
            if (rule == null) {
                return Result.error("规则不存在");
            }
            return Result.ok(rule);
        } catch (Exception e) {
            log.error("查询规则详情失败: id={}", id, e);
            return Result.error("查询规则详情失败: " + e.getMessage());
        }
    }

    /**
     * 创建规则
     */
    @PostMapping("/create")
    @Operation(summary = "创建告警规则")
    public Result<Long> createRule(@RequestBody AlertRuleEntity rule) {
        try {
            UserDetail user = SecurityUser.getUser();
            rule.setCreateTime(new Date());
            rule.setUpdateTime(new Date());
            rule.setCreator(user.getId().toString());
            rule.setCreatorName(user.getUsername());
            rule.setUpdater(user.getId().toString());
            rule.setUpdaterName(user.getUsername());

            // 验证并保存
            alertRuleService.saveRule(rule);
            return Result.ok(rule.getId());
        } catch (IllegalArgumentException e) {
            log.warn("创建规则参数错误: {}", e.getMessage());
            return Result.error(e.getMessage());
        } catch (Exception e) {
            log.error("创建规则失败", e);
            return Result.error("创建规则失败: " + e.getMessage());
        }
    }

    /**
     * 更新规则
     */
    @PostMapping("/update")
    @Operation(summary = "更新告警规则")
    public Result<Boolean> updateRule(@RequestBody AlertRuleEntity rule) {
        try {
            UserDetail user = SecurityUser.getUser();
            rule.setUpdateTime(new Date());
            rule.setUpdater(user.getId().toString());
            rule.setUpdaterName(user.getUsername());

            boolean success = alertRuleService.updateRule(rule);
            return success ? Result.ok(true) : Result.error("更新失败");
        } catch (IllegalArgumentException e) {
            log.warn("更新规则参数错误: {}", e.getMessage());
            return Result.error(e.getMessage());
        } catch (Exception e) {
            log.error("更新规则失败", e);
            return Result.error("更新规则失败: " + e.getMessage());
        }
    }

    /**
     * 删除规则
     */
    @PostMapping("/delete/{id}")
    @Operation(summary = "删除告警规则")
    public Result<Boolean> deleteRule(@PathVariable Long id) {
        try {
            boolean success = alertRuleService.deleteRule(id);
            return success ? Result.ok(true) : Result.error("删除失败");
        } catch (Exception e) {
            log.error("删除规则失败: id={}", id, e);
            return Result.error("删除规则失败: " + e.getMessage());
        }
    }

    /**
     * 启用/禁用规则
     */
    @PostMapping("/toggle/{id}")
    @Operation(summary = "启用/禁用规则")
    public Result<Boolean> toggleRule(@PathVariable Long id, @RequestBody Map<String, Object> params) {
        try {
            Boolean enabled = (Boolean) params.get("enabled");
            boolean success = alertRuleService.toggleRule(id, enabled);
            return success ? Result.ok(true) : Result.error("操作失败");
        } catch (Exception e) {
            log.error("切换规则状态失败: id={}", id, e);
            return Result.error("切换规则状态失败: " + e.getMessage());
        }
    }

    /**
     * 验证表达式
     */
    @PostMapping("/validate")
    @Operation(summary = "验证规则表达式")
    public Result<AlertRuleEvaluator.ValidationResult> validateExpression(@RequestBody Map<String, String> params) {
        try {
            String expression = params.get("expression");
            AlertRuleEvaluator.ValidationResult result = alertRuleService.validateExpression(expression);
            return Result.ok(result);
        } catch (Exception e) {
            log.error("验证表达式失败", e);
            return Result.error("验证表达式失败: " + e.getMessage());
        }
    }

    /**
     * 测试表达式
     */
    @PostMapping("/test")
    @Operation(summary = "测试规则表达式")
    public Result<AlertRuleEvaluator.TestResult> testExpression(@RequestBody Map<String, Object> params) {
        try {
            String expression = (String) params.get("expression");
            @SuppressWarnings("unchecked")
            Map<String, Object> testData = (Map<String, Object>) params.get("testData");
            
            AlertRuleEvaluator.TestResult result = alertRuleService.testExpression(expression, testData);
            return Result.ok(result);
        } catch (Exception e) {
            log.error("测试表达式失败", e);
            return Result.error("测试表达式失败: " + e.getMessage());
        }
    }

    /**
     * 按模块查询规则
     */
    @GetMapping("/module/{module}")
    @Operation(summary = "查询指定模块的规则")
    public Result<List<AlertRuleEntity>> getRulesByModule(@PathVariable String module) {
        try {
            List<AlertRuleEntity> rules = alertRuleService.getRulesByModule(module);
            return Result.ok(rules);
        } catch (Exception e) {
            log.error("查询模块规则失败: module={}", module, e);
            return Result.error("查询模块规则失败: " + e.getMessage());
        }
    }
}
