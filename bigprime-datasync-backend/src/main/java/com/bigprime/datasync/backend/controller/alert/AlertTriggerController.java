package com.bigprime.datasync.backend.controller.alert;

import com.bigprime.alert.api.dto.AlertTriggerRequest;
import com.bigprime.alert.api.dto.AlertTriggerResponse;
import com.bigprime.alert.core.engine.AlertRuleEvaluator;
import com.bigprime.alert.core.service.AlertRuleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 告警触发控制器
 * 对外提供告警触发API
 * 
 * @author bigprime
 */
@Slf4j
@RestController
@RequestMapping("/api/alert/trigger")
@Tag(name = "告警触发", description = "告警触发相关接口")
public class AlertTriggerController {

    private final AlertRuleService ruleService;

    public AlertTriggerController(AlertRuleService ruleService) {
        this.ruleService = ruleService;
    }

    /**
     * 触发告警
     * 各业务模块调用此接口上报指标并触发告警评估
     */
    @PostMapping
    @Operation(summary = "触发告警", description = "业务模块调用此接口上报指标数据")
    public AlertTriggerResponse trigger(@Validated @RequestBody AlertTriggerRequest request) {
        log.info("收到告警触发请求: module={}, sourceId={}", 
            request.getSourceModule(), request.getSourceId());
        
        return ruleService.triggerAlert(request);
    }

    /**
     * 验证表达式
     */
    @PostMapping("/validate")
    @Operation(summary = "验证表达式", description = "验证告警规则表达式语法是否正确")
    public AlertRuleEvaluator.ValidationResult validateExpression(@RequestBody Map<String, String> params) {
        String expression = params.get("expression");
        return ruleService.validateExpression(expression);
    }

    /**
     * 测试表达式
     */
    @PostMapping("/test")
    @Operation(summary = "测试表达式", description = "使用测试数据测试表达式执行结果")
    public AlertRuleEvaluator.TestResult testExpression(@RequestBody Map<String, Object> params) {
        String expression = (String) params.get("expression");
        @SuppressWarnings("unchecked")
        Map<String, Object> testData = (Map<String, Object>) params.get("testData");
        
        return ruleService.testExpression(expression, testData);
    }
}
