package com.bigprime.datasync.backend.controller;

import com.bigprime.datasync.core.model.MyPageResult;
import com.bigprime.datasync.core.model.Result;
import com.bigprime.datasync.backend.dto.ExternalJobInfoDTO;
import com.bigprime.datasync.dag.core.monitor.ExternalJobMonitorService;
import com.bigprime.datasync.dag.entity.DagExecutionRecordEntity;
import com.bigprime.datasync.dag.entity.DagNodeExecutionRecordEntity;
import com.bigprime.datasync.dag.service.DagExecutionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * DAG 执行管理 API 控制器
 * <p>
 * 提供 DAG 执行记录的查询、状态管理和控制接口
 * </p>
 * 
 * Created by BigPrime DataSync Team
 */
@Slf4j
@RestController
@RequestMapping("/api/dag/execution")
@Tag(name = "DAG执行管理")
@AllArgsConstructor
public class DagExecutionController {

    private final DagExecutionService dagExecutionService;
    private final ExternalJobMonitorService monitorService;

    /**
     * 分页查询执行记录
     */
    @PostMapping("/list")
    @Operation(summary = "分页查询DAG执行记录")
    public Result<MyPageResult<DagExecutionRecordEntity>> getExecutionList(@RequestBody Map<String, Object> params) {
        try {
            String search = params.getOrDefault("search", "").toString();
            String flowId = params.getOrDefault("flowId", "").toString();
            String status = params.getOrDefault("status", "").toString();
            Integer page = 1;
            Integer limit = 10;
            
            try {
                page = Integer.parseInt(params.getOrDefault("page", "1").toString());
                limit = Integer.parseInt(params.getOrDefault("pageSize", "10").toString());
            } catch (NumberFormatException e) {
                log.warn("分页参数无效，使用默认值: page=1, pageSize=10");
            }
            
            MyPageResult<DagExecutionRecordEntity> result = dagExecutionService.getExecutionPage(search, flowId, status, page, limit);
            return Result.ok(result);
        } catch (Exception e) {
            log.error("查询DAG执行记录失败", e);
            return Result.error("查询DAG执行记录失败: " + e.getMessage());
        }
    }

    /**
     * 根据 dagId 查询执行记录列表
     */
    @GetMapping("/list/{dagId}")
    @Operation(summary = "查询指定DAG的执行记录列表")
    public Result<List<DagExecutionRecordEntity>> getExecutionsByDagId(@PathVariable String dagId) {
        List<DagExecutionRecordEntity> executions = dagExecutionService.listExecutions(dagId);
        return Result.ok(executions);
    }

    /**
     * 获取单个执行记录详情
     */
    @GetMapping("/get/{executionId}")
    @Operation(summary = "获取执行记录详情")
    public Result<DagExecutionRecordEntity> getExecution(@PathVariable String executionId) {
        DagExecutionRecordEntity execution = dagExecutionService.getExecution(executionId);
        if (execution == null) {
            return Result.error("执行记录不存在");
        }
        return Result.ok(execution);
    }

    /**
     * 获取 DAG 的最新执行记录
     */
    @GetMapping("/latest/{dagId}")
    @Operation(summary = "获取DAG最新执行记录")
    public Result<DagExecutionRecordEntity> getLatestExecution(@PathVariable String dagId) {
        DagExecutionRecordEntity execution = dagExecutionService.getLatestExecution(dagId);
        if (execution == null) {
            return Result.error("未找到执行记录");
        }
        return Result.ok(execution);
    }

    /**
     * 暂停执行
     */
    @PostMapping("/pause/{executionId}")
    @Operation(summary = "暂停DAG执行")
    public Result<Void> pauseExecution(@PathVariable String executionId) {
        try {
            dagExecutionService.pauseExecution(executionId);
            log.info("暂停DAG执行成功: executionId={}", executionId);
            return Result.ok();
        } catch (Exception e) {
            log.error("暂停DAG执行失败: executionId={}", executionId, e);
            return Result.error(e.getMessage());
        }
    }

    /**
     * 恢复执行
     */
    @PostMapping("/resume/{executionId}")
    @Operation(summary = "恢复DAG执行")
    public Result<Void> resumeExecution(@PathVariable String executionId) {
        try {
            dagExecutionService.resumeExecution(executionId);
            log.info("恢复DAG执行成功: executionId={}", executionId);
            return Result.ok();
        } catch (Exception e) {
            log.error("恢复DAG执行失败: executionId={}", executionId, e);
            return Result.error(e.getMessage());
        }
    }

    /**
     * 取消执行
     */
    @PostMapping("/cancel/{executionId}")
    @Operation(summary = "取消DAG执行")
    public Result<Void> cancelExecution(@PathVariable String executionId) {
        try {
            dagExecutionService.cancelExecution(executionId);
            log.info("取消DAG执行成功: executionId={}", executionId);
            return Result.ok();
        } catch (Exception e) {
            log.error("取消DAG执行失败: executionId={}", executionId, e);
            return Result.error(e.getMessage());
        }
    }

    /**
     * 重试执行（创建新的执行记录）
     */
    @PostMapping("/retry/{executionId}")
    @Operation(summary = "重试DAG执行")
    public Result<String> retryExecution(@PathVariable String executionId) {
        try {
            String newExecutionId = dagExecutionService.retryExecution(executionId);
            log.info("重试DAG执行成功: oldExecutionId={}, newExecutionId={}", executionId, newExecutionId);
            return Result.ok(newExecutionId);
        } catch (Exception e) {
            log.error("重试DAG执行失败: executionId={}", executionId, e);
            return Result.error(e.getMessage());
        }
    }

    /**
     * 删除执行记录
     */
    @DeleteMapping("/delete/{executionId}")
    @Operation(summary = "删除执行记录")
    public Result<Void> deleteExecution(@PathVariable String executionId) {
        try {
            dagExecutionService.deleteExecution(executionId);
            log.info("删除DAG执行记录成功: executionId={}", executionId);
            return Result.ok();
        } catch (Exception e) {
            log.error("删除DAG执行记录失败: executionId={}", executionId, e);
            return Result.error(e.getMessage());
        }
    }

    /**
     * 查询节点执行记录列表
     */
    @GetMapping("/nodes/{executionId}")
    @Operation(summary = "查询节点执行记录列表")
    public Result<List<DagNodeExecutionRecordEntity>> getNodeExecutions(@PathVariable String executionId) {
        List<DagNodeExecutionRecordEntity> nodeExecutions = dagExecutionService.listNodeExecutions(executionId);
        return Result.ok(nodeExecutions);
    }

    /**
     * 查询可恢复的执行记录
     */
    @GetMapping("/recoverable/{dagId}")
    @Operation(summary = "查询可恢复的执行记录")
    public Result<List<DagExecutionRecordEntity>> getRecoverableExecutions(@PathVariable String dagId) {
        List<DagExecutionRecordEntity> executions = dagExecutionService.listRecoverableExecutions(dagId);
        return Result.ok(executions);
    }

    /**
     * 查询运行中的执行记录
     */
    @GetMapping("/running")
    @Operation(summary = "查询运行中的执行记录")
    public Result<List<DagExecutionRecordEntity>> getRunningExecutions() {
        List<DagExecutionRecordEntity> executions = dagExecutionService.listRunningExecutions();
        return Result.ok(executions);
    }

    // ==================== 节点级别操作 ====================

    /**
     * 重试单个节点
     */
    @PostMapping("/node/retry/{nodeExecutionId}")
    @Operation(summary = "重试节点执行")
    public Result<Void> retryNode(@PathVariable String nodeExecutionId) {
        try {
            dagExecutionService.retryNode(nodeExecutionId);
            log.info("重试节点执行成功: nodeExecutionId={}", nodeExecutionId);
            return Result.ok();
        } catch (Exception e) {
            log.error("重试节点执行失败: nodeExecutionId={}", nodeExecutionId, e);
            return Result.error(e.getMessage());
        }
    }

    /**
     * 跳过节点
     */
    @PostMapping("/node/skip/{nodeExecutionId}")
    @Operation(summary = "跳过节点执行")
    public Result<Void> skipNode(@PathVariable String nodeExecutionId) {
        try {
            dagExecutionService.skipNode(nodeExecutionId);
            log.info("跳过节点执行成功: nodeExecutionId={}", nodeExecutionId);
            return Result.ok();
        } catch (Exception e) {
            log.error("跳过节点执行失败: nodeExecutionId={}", nodeExecutionId, e);
            return Result.error(e.getMessage());
        }
    }

    /**
     * 获取节点执行日志
     */
    @GetMapping("/node/logs/{nodeExecutionId}")
    @Operation(summary = "获取节点执行日志")
    public Result<String> getNodeLogs(@PathVariable String nodeExecutionId) {
        try {
            String logs = dagExecutionService.getNodeLogs(nodeExecutionId);
            return Result.ok(logs);
        } catch (Exception e) {
            log.error("获取节点日志失败: nodeExecutionId={}", nodeExecutionId, e);
            return Result.error(e.getMessage());
        }
    }

    // ==================== 外部任务监控 ====================

    /**
     * 获取外部任务信息（Pipeline 收拢节点对应的 Flink/SeaTunnel 任务）
     */
    @GetMapping("/external-job/{executionId}/{collapsedNodeId}")
    @Operation(summary = "获取外部任务信息")
    public Result<Map<String, Object>> getExternalJobInfo(
            @PathVariable String executionId,
            @PathVariable String collapsedNodeId) {
        try {
            Map<String, Object> jobInfo = dagExecutionService.getExternalJobInfo(executionId, collapsedNodeId);
            log.info("获取外部任务信息成功: executionId={}, collapsedNodeId={}", executionId, collapsedNodeId);
            return Result.ok(jobInfo);
        } catch (Exception e) {
            log.error("获取外部任务信息失败: executionId={}, collapsedNodeId={}", 
                    executionId, collapsedNodeId, e);
            return Result.error(e.getMessage());
        }
    }
    
    /**
     * 获取DAG执行的外部任务历史日志（内存缓存）
     */
    @GetMapping("/external-logs/{executionId}")
    @Operation(summary = "获取外部任务历史日志")
    public Result<List<String>> getExternalJobLogs(@PathVariable String executionId) {
        try {
            List<String> logs = monitorService.getLogHistory(executionId);
            log.info("获取外部任务历史日志成功: executionId={}, logCount={}", executionId, logs.size());
            return Result.ok(logs);
        } catch (Exception e) {
            log.error("获取外部任务历史日志失败: executionId={}", executionId, e);
            return Result.error(e.getMessage());
        }
    }
    
    /**
     * 获取DAG执行的持久化日志（数据库）
     */
    @GetMapping("/logs/{executionId}")
    @Operation(summary = "获取DAG执行日志")
    public Result<String> getExecutionLogs(@PathVariable String executionId) {
        try {
            String logs = dagExecutionService.getExecutionLogs(executionId);
            log.info("获取DAG执行日志成功: executionId={}", executionId);
            return Result.ok(logs);
        } catch (Exception e) {
            log.error("获取DAG执行日志失败: executionId={}", executionId, e);
            return Result.error(e.getMessage());
        }
    }
    
    /**
     * 重新从Loki查询统一日志（解决日志延迟问题）
     */
    @GetMapping("/unified-logs/{executionId}")
    @Operation(summary = "重新查询统一日志")
    public Result<List<com.bigprime.datasync.dag.core.monitor.UnifiedLogEntry>> refreshUnifiedLogs(@PathVariable String executionId) {
        try {
            List<com.bigprime.datasync.dag.core.monitor.UnifiedLogEntry> logs = monitorService.getUnifiedLogHistory(executionId);
            log.info("重新查询统一日志成功: executionId={}, logCount={}", executionId, logs.size());
            return Result.ok(logs);
        } catch (Exception e) {
            log.error("重新查询统一日志失败: executionId={}", executionId, e);
            return Result.error(e.getMessage());
        }
    }
}
