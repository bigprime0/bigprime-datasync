package com.bigprime.datasync.backend.controller.gateway;

import com.bigprime.datasync.core.model.MyPageResult;
import com.bigprime.datasync.core.model.Result;
import com.bigprime.datasync.backend.gateway.entity.GatewayDeadLetterEntity;
import com.bigprime.datasync.backend.gateway.service.GatewayDeadLetterService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 网关死信队列控制器
 * 
 * @author bigprime
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/gateway/dead-letter")
@AllArgsConstructor
@Tag(name = "网关死信队列管理")
public class GatewayDeadLetterController {
    
    private final GatewayDeadLetterService deadLetterService;
    
    /**
     * 分页查询死信消息
     */
    @PostMapping("/list")
    @Operation(summary = "分页查询死信消息")
    public Result<MyPageResult<GatewayDeadLetterEntity>> getDeadLetterList(@RequestBody Map<String, Object> params) {
        try {
            Long gatewayId = params.get("gatewayId") != null ? 
                    Long.parseLong(params.get("gatewayId").toString()) : null;
            String status = params.getOrDefault("status", "").toString();
            Integer page = Integer.parseInt(params.getOrDefault("page", "1").toString());
            Integer limit = Integer.parseInt(params.getOrDefault("pageSize", "20").toString());
            
            MyPageResult<GatewayDeadLetterEntity> result = deadLetterService.getDeadLetterPage(
                    gatewayId, status, page, limit);
            return Result.ok(result);
        } catch (Exception e) {
            log.error("查询死信消息失败", e);
            return Result.error("查询死信消息失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取网关的死信列表
     */
    @GetMapping("/gateway/{gatewayId}")
    @Operation(summary = "获取网关的死信列表")
    public Result<List<GatewayDeadLetterEntity>> getDeadLettersByGatewayId(@PathVariable Long gatewayId) {
        try {
            List<GatewayDeadLetterEntity> deadLetters = deadLetterService.getDeadLettersByGatewayId(gatewayId);
            return Result.ok(deadLetters);
        } catch (Exception e) {
            log.error("查询网关死信列表失败: gatewayId={}", gatewayId, e);
            return Result.error("查询网关死信列表失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取待处理的死信消息
     */
    @GetMapping("/pending")
    @Operation(summary = "获取待处理的死信消息")
    public Result<List<GatewayDeadLetterEntity>> getPendingDeadLetters(
            @RequestParam(required = false, defaultValue = "100") Integer limit) {
        try {
            List<GatewayDeadLetterEntity> deadLetters = deadLetterService.getPendingDeadLetters(limit);
            return Result.ok(deadLetters);
        } catch (Exception e) {
            log.error("获取待处理死信失败", e);
            return Result.error("获取待处理死信失败: " + e.getMessage());
        }
    }
    
    /**
     * 重试死信消息
     */
    @PostMapping("/retry/{id}")
    @Operation(summary = "重试死信消息")
    public Result<Boolean> retryDeadLetter(@PathVariable Long id) {
        try {
            boolean success = deadLetterService.retryDeadLetter(id);
            return Result.ok(success);
        } catch (Exception e) {
            log.error("重试死信失败: id={}", id, e);
            return Result.error("重试死信失败: " + e.getMessage());
        }
    }
    
    /**
     * 批量重试死信消息
     */
    @PostMapping("/batch-retry")
    @Operation(summary = "批量重试死信消息")
    public Result<Integer> batchRetryDeadLetters(@RequestBody List<Long> ids) {
        try {
            int successCount = deadLetterService.batchRetryDeadLetters(ids);
            return Result.ok(successCount);
        } catch (Exception e) {
            log.error("批量重试死信失败: count={}", ids.size(), e);
            return Result.error("批量重试死信失败: " + e.getMessage());
        }
    }
    
    /**
     * 删除死信记录
     */
    @DeleteMapping("/delete/{id}")
    @Operation(summary = "删除死信记录")
    public Result<String> deleteDeadLetter(@PathVariable Long id) {
        try {
            deadLetterService.deleteDeadLetter(id);
            return Result.ok("删除成功");
        } catch (Exception e) {
            log.error("删除死信失败: id={}", id, e);
            return Result.error("删除死信失败: " + e.getMessage());
        }
    }
    
    /**
     * 清理旧的死信记录
     */
    @PostMapping("/clean")
    @Operation(summary = "清理旧的死信记录")
    public Result<Long> cleanOldDeadLetters(
            @RequestParam(required = false, defaultValue = "30") int days) {
        try {
            long count = deadLetterService.cleanOldDeadLetters(days);
            return Result.ok(count);
        } catch (Exception e) {
            log.error("清理旧死信失败: days={}", days, e);
            return Result.error("清理旧死信失败: " + e.getMessage());
        }
    }
}
