package com.bigprime.datasync.backend.controller.gateway;

import com.bigprime.datasync.core.model.Result;
import com.bigprime.datasync.backend.gateway.entity.GatewayReadRuleEntity;
import com.bigprime.datasync.backend.gateway.service.GatewayReadRuleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 网关读取规则控制器
 * 
 * @author bigprime
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/gateway/read-rule")
@AllArgsConstructor
@Tag(name = "网关读取规则管理")
public class GatewayReadRuleController {
    
    private final GatewayReadRuleService readRuleService;
    
    /**
     * 创建读取规则
     */
    @PostMapping("/create")
    @Operation(summary = "创建读取规则")
    public Result<Long> createReadRule(@RequestBody GatewayReadRuleEntity rule) {
        try {
            Long id = readRuleService.createReadRule(rule);
            return Result.ok(id);
        } catch (Exception e) {
            log.error("创建读取规则失败", e);
            return Result.error("创建读取规则失败: " + e.getMessage());
        }
    }
    
    /**
     * 更新读取规则
     */
    @PutMapping("/update")
    @Operation(summary = "更新读取规则")
    public Result<String> updateReadRule(@RequestBody GatewayReadRuleEntity rule) {
        try {
            readRuleService.updateReadRule(rule);
            return Result.ok("更新成功");
        } catch (Exception e) {
            log.error("更新读取规则失败: id={}", rule.getId(), e);
            return Result.error("更新读取规则失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取规则详情
     */
    @GetMapping("/get/{id}")
    @Operation(summary = "获取规则详情")
    public Result<GatewayReadRuleEntity> getReadRuleById(@PathVariable Long id) {
        try {
            GatewayReadRuleEntity rule = readRuleService.getReadRuleById(id);
            if (rule == null) {
                return Result.error("读取规则不存在");
            }
            return Result.ok(rule);
        } catch (Exception e) {
            log.error("查询读取规则失败: id={}", id, e);
            return Result.error("查询读取规则失败: " + e.getMessage());
        }
    }
    
    /**
     * 根据网关ID获取读取规则列表
     */
    @GetMapping("/gateway/{gatewayId}")
    @Operation(summary = "获取网关的读取规则列表")
    public Result<List<GatewayReadRuleEntity>> getReadRulesByGatewayId(@PathVariable Long gatewayId) {
        try {
            List<GatewayReadRuleEntity> rules = readRuleService.getReadRulesByGatewayId(gatewayId);
            return Result.ok(rules);
        } catch (Exception e) {
            log.error("查询网关读取规则失败: gatewayId={}", gatewayId, e);
            return Result.error("查询网关读取规则失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取启用的读取规则
     */
    @GetMapping("/enabled/{gatewayId}")
    @Operation(summary = "获取启用的读取规则")
    public Result<List<GatewayReadRuleEntity>> getEnabledReadRules(@PathVariable Long gatewayId) {
        try {
            List<GatewayReadRuleEntity> rules = readRuleService.getEnabledReadRules(gatewayId);
            return Result.ok(rules);
        } catch (Exception e) {
            log.error("查询启用的读取规则失败: gatewayId={}", gatewayId, e);
            return Result.error("查询启用的读取规则失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取所有读取规则
     */
    @GetMapping("/all")
    @Operation(summary = "获取所有读取规则")
    public Result<List<GatewayReadRuleEntity>> getAllReadRules() {
        try {
            List<GatewayReadRuleEntity> rules = readRuleService.getAllReadRules();
            return Result.ok(rules);
        } catch (Exception e) {
            log.error("查询所有读取规则失败", e);
            return Result.error("查询所有读取规则失败: " + e.getMessage());
        }
    }
    
    /**
     * 删除读取规则
     */
    @DeleteMapping("/delete/{id}")
    @Operation(summary = "删除读取规则")
    public Result<String> deleteReadRule(@PathVariable Long id) {
        try {
            readRuleService.deleteReadRule(id);
            return Result.ok("删除成功");
        } catch (Exception e) {
            log.error("删除读取规则失败: id={}", id, e);
            return Result.error("删除读取规则失败: " + e.getMessage());
        }
    }
    
    /**
     * 启用/禁用读取规则
     */
    @PostMapping("/toggle")
    @Operation(summary = "启用/禁用读取规则")
    public Result<String> toggleReadRule(@RequestBody Map<String, Object> params) {
        try {
            Long id = Long.parseLong(params.get("id").toString());
            Boolean enabled = Boolean.parseBoolean(params.get("enabled").toString());
            
            readRuleService.toggleReadRule(id, enabled);
            return Result.ok(enabled ? "已启用" : "已禁用");
        } catch (Exception e) {
            log.error("切换读取规则状态失败", e);
            return Result.error("切换读取规则状态失败: " + e.getMessage());
        }
    }
    
    /**
     * 批量创建读取规则
     */
    @PostMapping("/batch-create")
    @Operation(summary = "批量创建读取规则")
    public Result<String> batchCreateReadRules(@RequestBody List<GatewayReadRuleEntity> rules) {
        try {
            readRuleService.batchCreateReadRules(rules);
            return Result.ok(String.format("批量创建成功: %d条规则", rules.size()));
        } catch (Exception e) {
            log.error("批量创建读取规则失败: count={}", rules.size(), e);
            return Result.error("批量创建读取规则失败: " + e.getMessage());
        }
    }
}
