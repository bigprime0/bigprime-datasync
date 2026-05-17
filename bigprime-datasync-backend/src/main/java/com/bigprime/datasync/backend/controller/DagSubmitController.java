package com.bigprime.datasync.backend.controller;

import com.bigprime.datasync.core.model.Result;
import com.bigprime.datasync.backend.service.dag.DagExecutionManagerService;
import com.bigprime.datasync.dag.core.builder.DagDefinition;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

/**
 * DAG提交执行Controller
 */
@Slf4j
@RestController
@RequestMapping("/api/dag")
@Tag(name = "DAG提交与执行")
@AllArgsConstructor
public class DagSubmitController {
    
    private final DagExecutionManagerService dagExecutionManagerService;

    @PostMapping("/submit")
    @Operation(summary = "提交DAG编排并执行")
    public Result<String> submitDAG(@RequestBody DagDefinition definition) {
        try {
            if (definition.getDagId() == null || definition.getDagId().trim().isEmpty()) {
                return Result.error("DAG ID不能为空");
            }
            if (definition.getNodes() == null || definition.getNodes().isEmpty()) {
                return Result.error("DAG节点不能为空");
            }
            
            String executionId = dagExecutionManagerService.submitAndExecute(definition);
            log.info("DAG提交成功: dagId={}, executionId={}", definition.getDagId(), executionId);
            return Result.ok(executionId);
            
        } catch (Exception e) {
            log.error("提交DAG失败", e);
            return Result.error("提交DAG失败: " + e.getMessage());
        }
    }

    @PostMapping("/stop/{executionId}")
    @Operation(summary = "停止DAG执行")
    public Result<Void> stopDAG(@PathVariable String executionId) {
        try {
            dagExecutionManagerService.stopExecution(executionId);
            return Result.ok();
        } catch (Exception e) {
            log.error("停止DAG失败", e);
            return Result.error("停止DAG失败: " + e.getMessage());
        }
    }
}
