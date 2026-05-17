package com.bigprime.datasync.backend.controller.crawler;

import com.bigprime.datasync.backend.handler.model.crawler.AiCrawlerExecutionEntity;
import com.bigprime.datasync.core.config.BigprimeEntityQuery;
import com.bigprime.datasync.core.model.MyPageResult;
import com.bigprime.datasync.core.model.MyPager;
import com.bigprime.datasync.core.model.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * AI 爬虫 Agent 执行历史 Controller
 * 对应表：ai_crawler_execution
 */
@Slf4j
@RestController
@RequestMapping("/api/crawler/agent/execution")
@AllArgsConstructor
@Tag(name = "AI 爬虫执行历史", description = "AI 爬虫 Agent 执行记录管理")
public class AiCrawlerExecutionController {

    private final BigprimeEntityQuery proxy;

    /**
     * 分页查询执行历史
     */
    @PostMapping("/list")
    @Operation(summary = "分页查询 Agent 执行历史")
    public Result<MyPageResult<AiCrawlerExecutionEntity>> list(@RequestBody Map<String, Object> params) {
        try {
            String taskId = params.getOrDefault("taskId", "").toString();
            String status = params.getOrDefault("status", "").toString();
            int page = Integer.parseInt(params.getOrDefault("page", "1").toString());
            int pageSize = Integer.parseInt(params.getOrDefault("pageSize", "20").toString());

            MyPageResult<AiCrawlerExecutionEntity> result = proxy.queryable(AiCrawlerExecutionEntity.class)
                    .where(w -> w.deleted().eq(0))
                    .where(!taskId.isEmpty(), w -> w.taskId().eq(taskId))
                    .where(!status.isEmpty(), w -> w.status().eq(status))
                    .orderBy(w -> w.startedAt().desc())
                    .toPageResult(new MyPager<>(page, pageSize));
            return Result.ok(result);
        } catch (Exception e) {
            log.error("查询 Agent 执行历史失败", e);
            return Result.error("查询失败: " + e.getMessage());
        }
    }

    /**
     * 获取执行详情（含完整 events 和 result_data）
     */
    @GetMapping("/{id}")
    @Operation(summary = "获取执行详情")
    public Result<AiCrawlerExecutionEntity> getById(@PathVariable String id) {
        try {
            AiCrawlerExecutionEntity entity = proxy.queryable(AiCrawlerExecutionEntity.class)
                    .where(w -> w.id().eq(id))
                    .firstOrNull();
            if (entity == null) {
                return Result.error("记录不存在");
            }
            return Result.ok(entity);
        } catch (Exception e) {
            log.error("查询执行详情失败: id={}", id, e);
            return Result.error("查询失败: " + e.getMessage());
        }
    }

    /**
     * 查询某任务的近期执行历史
     */
    @GetMapping("/task/{taskId}")
    @Operation(summary = "查询某任务的近期执行历史")
    public Result<java.util.List<AiCrawlerExecutionEntity>> listByTask(
            @PathVariable String taskId,
            @RequestParam(defaultValue = "10") int limit) {
        try {
            java.util.List<AiCrawlerExecutionEntity> list = proxy.queryable(AiCrawlerExecutionEntity.class)
                    .where(w -> w.taskId().eq(taskId))
                    .where(w -> w.deleted().eq(0))
                    .orderBy(w -> w.startedAt().desc())
                    .limit(limit)
                    .toList();
            return Result.ok(list);
        } catch (Exception e) {
            log.error("查询任务执行历史失败: taskId={}", taskId, e);
            return Result.error("查询失败: " + e.getMessage());
        }
    }

    /**
     * 统计数据（今日成功/失败/运行中）
     */
    @GetMapping("/statistics")
    @Operation(summary = "获取执行统计数据")
    public Result<Map<String, Object>> statistics() {
        try {
            Date todayStart = Date.from(LocalDate.now().atStartOfDay(ZoneId.systemDefault()).toInstant());

            long runningCount = proxy.queryable(AiCrawlerExecutionEntity.class)
                    .where(w -> w.deleted().eq(0))
                    .where(w -> w.status().eq("RUNNING"))
                    .count();

            long todaySuccess = proxy.queryable(AiCrawlerExecutionEntity.class)
                    .where(w -> w.deleted().eq(0))
                    .where(w -> w.status().eq("SUCCESS"))
                    .where(w -> w.startedAt().ge(todayStart))
                    .count();

            long todayFailed = proxy.queryable(AiCrawlerExecutionEntity.class)
                    .where(w -> w.deleted().eq(0))
                    .where(w -> w.status().eq("FAILED"))
                    .where(w -> w.startedAt().ge(todayStart))
                    .count();

            Map<String, Object> stats = new HashMap<>();
            stats.put("runningCount", runningCount);
            stats.put("todaySuccessCount", todaySuccess);
            stats.put("todayFailedCount", todayFailed);
            return Result.ok(stats);
        } catch (Exception e) {
            log.error("获取统计数据失败", e);
            return Result.error("获取统计数据失败: " + e.getMessage());
        }
    }

    /**
     * 删除执行记录（逻辑删除）
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "删除执行记录")
    public Result<Void> deleteById(@PathVariable String id) {
        try {
            AiCrawlerExecutionEntity entity = proxy.queryable(AiCrawlerExecutionEntity.class)
                    .where(w -> w.id().eq(id))
                    .firstOrNull();
            if (entity == null) {
                return Result.error("记录不存在");
            }
            entity.setDeleted(1);
            proxy.updatable(entity).executeRows();
            return Result.ok();
        } catch (Exception e) {
            log.error("删除执行记录失败: id={}", id, e);
            return Result.error("删除失败: " + e.getMessage());
        }
    }
}
