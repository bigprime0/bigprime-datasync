package com.bigprime.datasync.backend.controller;

import com.bigprime.datasync.core.model.Result;
import com.bigprime.datasync.backend.dto.WorkerLogRequest;
import com.bigprime.datasync.dag.core.monitor.ExternalJobMonitorService;
import com.bigprime.datasync.dag.core.monitor.UnifiedLogEntry;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

/**
 * Worker日志上报接口
 * Worker执行任务时通过此接口推送日志到DAG平台
 * 
 * @author BigPrime DataSync Team
 */
@Slf4j
@RestController
@RequestMapping("/worker/log")
@Tag(name = "Worker日志管理", description = "Worker日志上报接口")
public class WorkerLogController {
    
    private final ExternalJobMonitorService monitorService;
    
    public WorkerLogController(ExternalJobMonitorService monitorService) {
        this.monitorService = monitorService;
    }
    
    /**
     * Worker上报日志
     */
    @PostMapping("/report")
    @Operation(summary = "Worker上报日志")
    public Result<Void> reportLog(@RequestBody WorkerLogRequest request) {
        try {
            log.info("[Worker日志] 接收单条日志: dagExecutionId={}, nodeId={}, workerId={}, level={}", 
                    request.getDagExecutionId(), request.getNodeId(), request.getWorkerId(), request.getLevel());
            
            // 验证必填字段
            if (request.getDagExecutionId() == null || request.getDagExecutionId().isEmpty()) {
                log.warn("[Worker日志] dagExecutionId为空");
                return Result.error("dagExecutionId不能为空");
            }
            if (request.getNodeId() == null || request.getNodeId().isEmpty()) {
                log.warn("[Worker日志] nodeId为空");
                return Result.error("nodeId不能为空");
            }
            if (request.getWorkerId() == null || request.getWorkerId().isEmpty()) {
                log.warn("[Worker日志] workerId为空");
                return Result.error("workerId不能为空");
            }
            if (request.getMessage() == null || request.getMessage().isEmpty()) {
                log.warn("[Worker日志] message为空");
                return Result.error("message不能为空");
            }
            
            // 解析日志级别
            UnifiedLogEntry.LogLevel level;
            try {
                level = UnifiedLogEntry.LogLevel.valueOf(request.getLevel().toUpperCase());
            } catch (Exception e) {
                log.warn("[Worker日志] 日志级别解析失败，使用INFO: {}", request.getLevel());
                level = UnifiedLogEntry.LogLevel.INFO;
            }
            
            log.debug("[Worker日志] 调用monitorService.addWorkerLog: dagExecutionId={}, nodeId={}, level={}", 
                    request.getDagExecutionId(), request.getNodeId(), level);
            
            // 调用监控服务添加Worker日志
            monitorService.addWorkerLog(
                    request.getDagExecutionId(),
                    request.getNodeId(),
                    request.getNodeName(),
                    request.getWorkerId(),
                    level,
                    request.getMessage()
            );
            
            log.info("[Worker日志] 日志处理完成: dagExecutionId={}, nodeId={}", 
                    request.getDagExecutionId(), request.getNodeId());
            
            return Result.ok();
        } catch (Exception e) {
            log.error("[Worker日志] 日志上报失败", e);
            return Result.error("日志上报失败: " + e.getMessage());
        }
    }
    
    /**
     * 批量上报日志
     */
    @PostMapping("/report/batch")
    @Operation(summary = "批量上报Worker日志")
    public Result<Void> reportBatchLogs(@RequestBody WorkerLogRequest.BatchRequest batchRequest) {
        try {
            log.info("[Worker日志] 接收批量日志: dagExecutionId={}, logCount={}", 
                    batchRequest.getDagExecutionId(), 
                    batchRequest.getLogs() != null ? batchRequest.getLogs().size() : 0);
            
            if (batchRequest.getLogs() == null || batchRequest.getLogs().isEmpty()) {
                log.warn("[Worker日志] 批量日志为空");
                return Result.ok();
            }
            
            int successCount = 0;
            for (WorkerLogRequest logRequest : batchRequest.getLogs()) {
                // 继承批量请求的dagExecutionId
                if (logRequest.getDagExecutionId() == null || logRequest.getDagExecutionId().isEmpty()) {
                    logRequest.setDagExecutionId(batchRequest.getDagExecutionId());
                }
                
                log.debug("[Worker日志] 处理日志项: nodeId={}, level={}, message={}", 
                        logRequest.getNodeId(), logRequest.getLevel(), logRequest.getMessage());
                
                Result<Void> result = reportLog(logRequest);
                if (result.getCode() == 0) {
                    successCount++;
                }
            }
            
            log.info("[Worker日志] 批量上报完成: dagExecutionId={}, 成功={}/{}", 
                    batchRequest.getDagExecutionId(), successCount, batchRequest.getLogs().size());
            
            return Result.ok();
        } catch (Exception e) {
            log.error("[Worker日志] 批量日志上报失败", e);
            return Result.error("批量日志上报失败: " + e.getMessage());
        }
    }
}
