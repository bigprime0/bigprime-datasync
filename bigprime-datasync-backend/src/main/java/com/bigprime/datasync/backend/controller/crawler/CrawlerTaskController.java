package com.bigprime.datasync.backend.controller.crawler;

import com.bigprime.datasync.core.model.MyPageResult;
import com.bigprime.datasync.core.model.Result;
import com.bigprime.datasync.core.model.SecurityUser;
import com.bigprime.datasync.backend.handler.model.crawler.AiCrawlerExecutionEntity;
import com.bigprime.datasync.backend.handler.model.crawler.CrawlerTaskEntity;
import com.bigprime.datasync.backend.service.crawler.CrawlerTaskService;
import com.bigprime.datasync.core.config.BigprimeEntityQuery;
import com.bigprime.ai.core.service.CrawlerAgentService;
import com.bigprime.ai.core.agent.AgentEvent;
import com.bigprime.ai.core.agent.AgentResponse;
import cn.hutool.core.util.IdUtil;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;

/**
 * 爬虫任务管理 API 控制器
 * <p>
 * 提供爬虫任务的创建、更新、查询、删除和状态管理接口
 * </p>
 * 
 * @author bigprime
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/crawler/task")
@Tag(name = "爬虫任务管理")
@AllArgsConstructor
public class CrawlerTaskController {

    private final CrawlerTaskService crawlerTaskService;
    private final CrawlerAgentService crawlerAgentService;
    private final BigprimeEntityQuery proxy;
    private final ObjectMapper objectMapper;

    /**
     * CrawlerAgent 同步执行（等待最终结果）
     */
    @PostMapping("/agent/execute")
    @Operation(summary = "CrawlerAgent 同步执行")
    public Result<AgentResponse> agentExecute(
            @RequestBody CrawlerAgentService.CrawlerTaskRequest request) {
        try {
            AgentResponse response = crawlerAgentService.execute(request);
            return Result.ok(response);
        } catch (Exception e) {
            log.error("CrawlerAgent 执行失败", e);
            return Result.error("CrawlerAgent 执行失败: " + e.getMessage());
        }
    }

    /**
     * CrawlerAgent 流式执行（SSE 实时推送每一步 AgentEvent）
     * 执行完成后自动写入 ai_crawler_execution 并更新任务执行统计
     */
    @PostMapping(value = "/agent/stream", produces = "text/event-stream")
    @Operation(summary = "CrawlerAgent 流式执行")
    public SseEmitter agentStream(
            @RequestBody CrawlerAgentService.CrawlerTaskRequest request) {
        SseEmitter emitter = new SseEmitter(0L);

        // 收集执行过程中的数据
        List<ObjectNode> eventNodes = new ArrayList<>();
        AtomicBoolean hasError = new AtomicBoolean(false);
        AtomicReference<String> resultData = new AtomicReference<>(null);
        AtomicReference<String> errorMessage = new AtomicReference<>(null);
        AtomicInteger stepCount = new AtomicInteger(0);
        long startMs = System.currentTimeMillis();
        Date startedAt = new Date();

        // 获取任务名称（用于冒余存储）
        String taskName = null;
        if (request.getTaskId() != null) {
            try {
                CrawlerTaskEntity task = crawlerTaskService.getTaskById(request.getTaskId());
                if (task != null) taskName = task.getName();
            } catch (Exception ignore) {}
        }
        final String finalTaskName = taskName;

        Thread sseThread = new Thread(() -> {
            try {
                crawlerAgentService.streamExecute(request, event -> {
                    try {
                        ObjectNode node = objectMapper.createObjectNode();
                        node.put("type", event.getType() != null ? event.getType().name() : "UNKNOWN");
                        if (event.getContent() != null) node.put("content", event.getContent());
                        if (event.getToolName() != null) node.put("toolName", event.getToolName());
                        if (event.getToolInput() != null) node.put("toolInput", event.getToolInput());
                        if (event.getStep() != null) node.put("step", event.getStep());
                        if (event.getTimestamp() != null) node.put("timestamp", event.getTimestamp().getTime());

                        // 收集事件
                        eventNodes.add(node);
                        String evType = event.getType() != null ? event.getType().name() : "";
                        if ("ACTION".equals(evType) || "THINKING".equals(evType)) {
                            stepCount.incrementAndGet();
                        }
                        if ("RESULT".equals(evType)) {
                            resultData.set(event.getContent());
                        }
                        if ("ERROR".equals(evType)) {
                            hasError.set(true);
                            errorMessage.set(event.getContent());
                        }

                        emitter.send(SseEmitter.event()
                                .name(event.getType() != null ? event.getType().name().toLowerCase() : "event")
                                .data(node.toString()));
                    } catch (Exception ex) {
                        log.warn("SSE 发送失败", ex);
                        emitter.completeWithError(ex);
                    }
                });
                emitter.complete();
            } catch (Exception e) {
                log.error("CrawlerAgent 流式执行失败", e);
                hasError.set(true);
                errorMessage.set(e.getMessage());
                emitter.completeWithError(e);
            } finally {
                // 异步写入执行历史和更新任务统计
                saveExecutionRecord(request, finalTaskName, eventNodes, resultData.get(),
                        errorMessage.get(), hasError.get(), stepCount.get(), startedAt, startMs);
            }
        });
        sseThread.setDaemon(true);
        sseThread.start();
        return emitter;
    }

    /**
     * 写入 ai_crawler_execution 执行记录并更新任务统计
     */
    private void saveExecutionRecord(
            CrawlerAgentService.CrawlerTaskRequest request,
            String taskName,
            List<ObjectNode> eventNodes,
            String resultData,
            String errorMessage,
            boolean hasError,
            int stepCount,
            Date startedAt,
            long startMs) {
        try {
            long durationMs = System.currentTimeMillis() - startMs;
            String status = hasError ? "FAILED" : "SUCCESS";

            // 序列化事件列表
            String eventsJson = "[]";
            try {
                eventsJson = objectMapper.writeValueAsString(eventNodes);
            } catch (JsonProcessingException ignore) {}

            // 获取当前用户
            String creator = null;
            try {
                creator = SecurityUser.getUser().getId().toString();
            } catch (Exception ignore) {}

            AiCrawlerExecutionEntity execution = AiCrawlerExecutionEntity.builder()
                    .id(IdUtil.getSnowflakeNextIdStr())
                    .taskId(request.getTaskId())
                    .taskName(taskName)
                    .status(status)
                    .modelId(request.getModelId())
                    .websiteUrl(request.getWebsiteUrl())
                    .instructions(request.getInstructions())
                    .totalSteps(stepCount)
                    .events(eventsJson)
                    .resultData(resultData)
                    .errorMessage(errorMessage)
                    .durationMs(durationMs)
                    .startedAt(startedAt)
                    .completedAt(new Date())
                    .creator(creator)
                    .createTime(new Date())
                    .deleted(0)
                    .build();
            proxy.insertable(execution).executeRows();
            log.info("写入执行记录成功: taskId={}, status={}, steps={}",
                    request.getTaskId(), status, stepCount);

            // 更新任务执行统计（taskId 存在时）
            if (request.getTaskId() != null) {
                try {
                    crawlerTaskService.updateExecutionStats(request.getTaskId(), !hasError);
                } catch (Exception ex) {
                    log.warn("更新任务统计失败: taskId={}", request.getTaskId(), ex);
                }
            }
        } catch (Exception e) {
            log.error("写入执行记录失败", e);
        }
    }


    /**
     * 创建爬虫任务
     */
    @PostMapping("/create")
    @Operation(summary = "创建爬虫任务")
    public Result<String> createTask(@RequestBody CrawlerTaskEntity task) {
        try {
            String taskId = crawlerTaskService.createTask(task);
            return Result.ok(taskId);
        } catch (Exception e) {
            log.error("创建爬虫任务失败", e);
            return Result.error("创建爬虫任务失败: " + e.getMessage());
        }
    }

    /**
     * 更新爬虫任务
     */
    @PutMapping("/update")
    @Operation(summary = "更新爬虫任务")
    public Result<Void> updateTask(@RequestBody CrawlerTaskEntity task) {
        try {
            crawlerTaskService.updateTask(task);
            return Result.ok();
        } catch (Exception e) {
            log.error("更新爬虫任务失败: id={}", task.getId(), e);
            return Result.error("更新爬虫任务失败: " + e.getMessage());
        }
    }

    /**
     * 删除爬虫任务
     */
    @DeleteMapping("/delete/{id}")
    @Operation(summary = "删除爬虫任务")
    public Result<Void> deleteTask(@PathVariable String id) {
        try {
            crawlerTaskService.deleteTask(id);
            log.info("删除爬虫任务成功: id={}", id);
            return Result.ok();
        } catch (Exception e) {
            log.error("删除爬虫任务失败: id={}", id, e);
            return Result.error("删除爬虫任务失败: " + e.getMessage());
        }
    }

    /**
     * 获取任务详情
     */
    @GetMapping("/get/{id}")
    @Operation(summary = "获取任务详情")
    public Result<CrawlerTaskEntity> getTask(@PathVariable String id) {
        try {
            CrawlerTaskEntity task = crawlerTaskService.getTaskById(id);
            if (task == null) {
                return Result.error("任务不存在");
            }
            return Result.ok(task);
        } catch (Exception e) {
            log.error("查询任务详情失败: id={}", id, e);
            return Result.error("查询任务详情失败: " + e.getMessage());
        }
    }

    /**
     * 分页查询任务列表
     */
    @PostMapping("/list")
    @Operation(summary = "分页查询爬虫任务列表")
    public Result<MyPageResult<CrawlerTaskEntity>> getTaskList(@RequestBody Map<String, Object> params) {
        try {
            String search = params.getOrDefault("search", "").toString();
            Integer page = Integer.parseInt(params.getOrDefault("page", "1").toString());
            Integer limit = Integer.parseInt(params.getOrDefault("pageSize", "20").toString());
            
            MyPageResult<CrawlerTaskEntity> result = crawlerTaskService.getTaskList(search, page, limit);
            return Result.ok(result);
        } catch (NumberFormatException e) {
            log.error("分页参数无效", e);
            return Result.error("分页参数必须为有效数字");
        } catch (Exception e) {
            log.error("查询任务列表失败", e);
            return Result.error("查询任务列表失败: " + e.getMessage());
        }
    }

    /**
     * 查询所有任务
     */
    @GetMapping("/all")
    @Operation(summary = "查询所有任务")
    public Result<List<CrawlerTaskEntity>> getAllTasks() {
        try {
            List<CrawlerTaskEntity> tasks = crawlerTaskService.getAllTasks();
            return Result.ok(tasks);
        } catch (Exception e) {
            log.error("查询所有任务失败", e);
            return Result.error("查询所有任务失败: " + e.getMessage());
        }
    }

    /**
     * 启用/禁用任务
     */
    @PutMapping("/toggle/{id}")
    @Operation(summary = "启用/禁用任务")
    public Result<Void> toggleEnabled(@PathVariable String id, @RequestParam Boolean enabled) {
        try {
            crawlerTaskService.toggleTaskEnabled(id, enabled);
            log.info("切换任务启用状态成功: id={}, enabled={}", id, enabled);
            return Result.ok();
        } catch (Exception e) {
            log.error("切换任务启用状态失败: id={}, enabled={}", id, enabled, e);
            return Result.error("切换任务启用状态失败: " + e.getMessage());
        }
    }

    /**
     * 更新任务状态
     */
    @PutMapping("/status/{id}")
    @Operation(summary = "更新任务状态")
    public Result<Void> updateStatus(@PathVariable String id, @RequestParam String status) {
        try {
            crawlerTaskService.updateTaskStatus(id, status);
            log.info("更新任务状态成功: id={}, status={}", id, status);
            return Result.ok();
        } catch (Exception e) {
            log.error("更新任务状态失败: id={}, status={}", id, status, e);
            return Result.error("更新任务状态失败: " + e.getMessage());
        }
    }

    /**
     * 立即执行爬虫任务
     */
    @PostMapping("/execute/{id}")
    @Operation(summary = "立即执行爬虫任务")
    public Result<String> executeTask(@PathVariable String id) {
        try {
            String executionId = crawlerTaskService.executeTask(id);
            log.info("任务执行启动成功: taskId={}, executionId={}", id, executionId);
            return Result.ok(executionId);
        } catch (Exception e) {
            log.error("任务执行失败: taskId={}", id, e);
            return Result.error("任务执行失败: " + e.getMessage());
        }
    }
}
