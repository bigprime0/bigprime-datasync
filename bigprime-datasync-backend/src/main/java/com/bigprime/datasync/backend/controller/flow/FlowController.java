package com.bigprime.datasync.backend.controller.flow;

import com.bigprime.datasync.core.model.MyPageResult;
import com.bigprime.datasync.core.model.Result;
import com.bigprime.datasync.backend.handler.model.flow.DataSyncFlow;
import com.bigprime.datasync.backend.service.flow.FlowService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 流程编排API控制器
 * 提供流程编排管理的REST API接口
 *
 * @author bigprime
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/flow")
@Tag(name = "流程编排管理")
@AllArgsConstructor
public class FlowController {

    private final FlowService flowService;

    /**
     * 创建流程
     *
     * @param flow 流程实体
     * @return 操作结果
     */
    @PostMapping("/create")
    @Operation(summary = "创建流程")
    public Result<DataSyncFlow> createFlow(@RequestBody DataSyncFlow flow) {
        try {
            // 确保ID为空，强制创建新流程
            flow.setId(null);
            DataSyncFlow created = flowService.createFlow(flow);
            return Result.ok(created);
        } catch (Exception e) {
            log.error("创建流程失败", e);
            return Result.error("创建流程失败: " + e.getMessage());
        }
    }

    /**
     * 更新流程
     *
     * @param flow 流程实体
     * @return 操作结果
     */
    @PostMapping("/update")
    @Operation(summary = "更新流程")
    public Result<DataSyncFlow> updateFlow(@RequestBody DataSyncFlow flow) {
        try {
            DataSyncFlow updated = flowService.updateFlow(flow);
            return Result.ok(updated);
        } catch (Exception e) {
            log.error("更新流程失败", e);
            return Result.error("更新流程失败: " + e.getMessage());
        }
    }

    /**
     * 删除流程
     *
     * @param id 流程ID
     * @return 操作结果
     */
    @DeleteMapping("/delete/{id}")
    @Operation(summary = "删除流程")
    public Result<Void> deleteFlow(@PathVariable String id) {
        try {
            flowService.deleteFlow(id);
            return Result.ok();
        } catch (Exception e) {
            log.error("删除流程失败", e);
            return Result.error("删除流程失败: " + e.getMessage());
        }
    }

    /**
     * 获取流程列表
     *
     * @param params 查询参数
     * @return 分页结果
     */
    @PostMapping("/list")
    @Operation(summary = "获取流程列表")
    public Result<MyPageResult<DataSyncFlow>> getFlowList(@RequestBody Map<String, Object> params) {
        try {
            String search = params.getOrDefault("search", "").toString();
            String taskSource = params.containsKey("taskSource") ? params.get("taskSource").toString() : null;
            Integer page = 1;
            Integer limit = 10;
            
            try {
                page = Integer.parseInt(params.getOrDefault("page", 1).toString());
                limit = Integer.parseInt(params.getOrDefault("pageSize", 10).toString());
            } catch (NumberFormatException e) {
                log.warn("分页参数无效，使用默认值: page=1, pageSize=10");
            }
            
            MyPageResult<DataSyncFlow> flowList = flowService.getFlowPage(search, taskSource, page, limit);
            return Result.ok(flowList);
        } catch (Exception e) {
            log.error("获取流程列表失败", e);
            return Result.error("获取流程列表失败: " + e.getMessage());
        }
    }

    /**
     * 获取单个流程
     *
     * @param id 流程ID
     * @return 流程实体
     */
    @GetMapping("/{id}")
    @Operation(summary = "获取单个流程")
    public Result<DataSyncFlow> getFlowById(@PathVariable String id) {
        try {
            DataSyncFlow flow = flowService.getFlowById(id);
            if (flow == null) {
                return Result.error("流程不存在: " + id);
            }
            return Result.ok(flow);
        } catch (Exception e) {
            log.error("获取流程详情失败", e);
            return Result.error("获取流程详情失败: " + e.getMessage());
        }
    }

    /**
     * 运行流程
     *
     * @param id 流程ID
     * @return 执行 ID
     */
    @PostMapping("/run/{id}")
    @Operation(summary = "运行流程")
    public Result<String> runFlow(@PathVariable String id) {
        try {
            flowService.runFlow(id);
            return Result.ok("");
        } catch (Exception e) {
            log.error("运行流程失败", e);
            return Result.error("运行流程失败: " + e.getMessage());
        }
    }

    /**
     * 停止流程
     *
     * @param executionId 执行 ID
     * @return 操作结果
     */
    @PostMapping("/stop/{executionId}")
    @Operation(summary = "停止流程")
    public Result<Void> stopFlow(@PathVariable String executionId) {
        try {
            flowService.stopFlow(executionId);
            return Result.ok();
        } catch (Exception e) {
            log.error("停止流程失败", e);
            return Result.error("停止流程失败: " + e.getMessage());
        }
    }
}
