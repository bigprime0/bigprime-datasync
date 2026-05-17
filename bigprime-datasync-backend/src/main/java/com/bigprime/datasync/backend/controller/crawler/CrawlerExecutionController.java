package com.bigprime.datasync.backend.controller.crawler;

import com.bigprime.datasync.core.model.MyPageResult;
import com.bigprime.datasync.core.model.Result;
import com.bigprime.datasync.backend.service.crawler.CrawlerExecutionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 爬虫执行历史Controller
 *
 * @author bigprime
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/crawler/execution")
@AllArgsConstructor
@Tag(name = "爬虫执行历史管理", description = "爬虫执行历史相关接口")
public class CrawlerExecutionController {

    private final CrawlerExecutionService executionService;

    /**
     * 分页查询执行历史
     */
    @PostMapping("/list")
    @Operation(summary = "分页查询执行历史列表")
    public Result<MyPageResult<Map<String, Object>>> getExecutionList(@RequestBody Map<String, Object> params) {
        try {
            String search = params.getOrDefault("search", "").toString();
            String status = params.getOrDefault("status", "").toString();
            String taskId = params.getOrDefault("taskId", "").toString();
            Integer page = Integer.parseInt(params.getOrDefault("page", "1").toString());
            Integer limit = Integer.parseInt(params.getOrDefault("pageSize", "20").toString());

            MyPageResult<Map<String, Object>> result = executionService.getExecutionList(search, status, taskId, page, limit);
            return Result.ok(result);
        } catch (NumberFormatException e) {
            log.error("分页参数无效", e);
            return Result.error("分页参数必须为有效数字");
        } catch (Exception e) {
            log.error("查询执行历史列表失败", e);
            return Result.error("查询执行历史列表失败: " + e.getMessage());
        }
    }

    /**
     * 获取执行历史详情
     */
    @GetMapping("/get/{id}")
    @Operation(summary = "获取执行历史详情")
    public Result<Map<String, Object>> getExecutionById(@PathVariable String id) {
        try {
            Map<String, Object> execution = executionService.getExecutionById(id);
            if (execution == null) {
                return Result.error("执行历史不存在");
            }
            return Result.ok(execution);
        } catch (Exception e) {
            log.error("查询执行历史详情失败: id={}", id, e);
            return Result.error("查询执行历史详情失败: " + e.getMessage());
        }
    }

    /**
     * 查询指定任务的执行历史
     */
    @GetMapping("/list/{taskId}")
    @Operation(summary = "查询指定任务的执行历史")
    public Result<MyPageResult<Map<String, Object>>> getExecutionsByTaskId(
            @PathVariable String taskId,
            @RequestParam(defaultValue = "10") Integer limit) {
        try {
            MyPageResult<Map<String, Object>> result = executionService.getExecutionsByTaskId(taskId, limit);
            return Result.ok(result);
        } catch (Exception e) {
            log.error("查询任务执行历史失败: taskId={}", taskId, e);
            return Result.error("查询任务执行历史失败: " + e.getMessage());
        }
    }

    /**
     * 获取统计数据
     */
    @GetMapping("/statistics")
    @Operation(summary = "获取爬虫执行统计数据")
    public Result<Map<String, Object>> getStatistics() {
        try {
            Map<String, Object> stats = executionService.getStatistics();
            return Result.ok(stats);
        } catch (Exception e) {
            log.error("获取统计数据失败", e);
            return Result.error("获取统计数据失败: " + e.getMessage());
        }
    }

    /**
     * 获取运行中的任务
     */
    @GetMapping("/running")
    @Operation(summary = "获取运行中的任务列表")
    public Result<java.util.List<Map<String, Object>>> getRunningTasks() {
        try {
            java.util.List<Map<String, Object>> tasks = executionService.getRunningTasks();
            return Result.ok(tasks);
        } catch (Exception e) {
            log.error("获取运行中任务失败", e);
            return Result.error("获取运行中任务失败: " + e.getMessage());
        }
    }
}
