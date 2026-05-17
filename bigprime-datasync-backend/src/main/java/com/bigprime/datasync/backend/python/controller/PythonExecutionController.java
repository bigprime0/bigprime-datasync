package com.bigprime.datasync.backend.python.controller;

import com.bigprime.datasync.core.model.Result;
import com.bigprime.datasync.backend.python.entity.PythonBackupEntity;
import com.bigprime.datasync.backend.python.service.PythonBackupService;
import com.bigprime.datasync.backend.python.service.PythonDebugService;
import com.bigprime.datasync.backend.python.service.PythonExecutionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Map;

/**
 * Python 代码执行、调试、补全、备份 API 控制器
 *
 * @author bigprime
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/python/ide")
@Tag(name = "Python IDE")
@AllArgsConstructor
public class PythonExecutionController {

    private final PythonExecutionService executionService;
    private final PythonDebugService debugService;
    private final PythonBackupService backupService;

    // ==================== 代码执行 ====================

    /**
     * 执行代码（SSE 流式返回）
     */
    @PostMapping(value = "/execute/{workspaceId}", produces = "text/event-stream;charset=UTF-8")
    @Operation(summary = "执行代码（SSE 流式）")
    public SseEmitter executeCode(@PathVariable String workspaceId,
                                  @RequestBody Map<String, Object> params) {
        String code = params.getOrDefault("code", "").toString();
        SseEmitter emitter = new SseEmitter(5 * 60 * 1000L); // 5 分钟超时
        emitter.onTimeout(emitter::complete);
        emitter.onError(e -> emitter.complete());

        // 异步执行，避免阻塞 HTTP 线程
        new Thread(() -> executionService.executeCode(workspaceId, code, emitter)).start();

        return emitter;
    }

    // ==================== 代码补全 ====================

    /**
     * 代码补全
     */
    @PostMapping("/complete/{workspaceId}")
    @Operation(summary = "代码补全")
    public Result<List<String>> complete(@PathVariable String workspaceId,
                                         @RequestBody Map<String, Object> params) {
        try {
            String code = params.getOrDefault("code", "").toString();
            int cursorPos = Integer.parseInt(params.getOrDefault("cursorPos", "0").toString());
            List<String> completions = executionService.complete(workspaceId, code, cursorPos);
            return Result.ok(completions);
        } catch (Exception e) {
            log.error("代码补全失败: workspaceId={}", workspaceId, e);
            return Result.error("代码补全失败: " + e.getMessage());
        }
    }

    // ==================== 调试 ====================

    /**
     * 初始化调试会话（SSE 推送调试事件）
     */
    @GetMapping(value = "/debug/init/{workspaceId}", produces = "text/event-stream;charset=UTF-8")
    @Operation(summary = "初始化调试会话（SSE）")
    public SseEmitter initDebug(@PathVariable String workspaceId) {
        SseEmitter emitter = new SseEmitter(30 * 60 * 1000L); // 30 分钟
        emitter.onTimeout(emitter::complete);
        emitter.onError(e -> emitter.complete());

        Thread debugThread = new Thread(() -> {
            try {
                debugService.initDebugSession(workspaceId, emitter);
            } catch (Exception e) {
                log.error("初始化调试会话失败", e);
                emitter.completeWithError(e);
            }
        });
        debugThread.setDaemon(true);
        debugThread.start();

        return emitter;
    }

    /**
     * 设置断点
     */
    @PostMapping("/debug/breakpoints/{workspaceId}")
    @Operation(summary = "设置断点")
    public Result<Map<String, Object>> setBreakpoints(@PathVariable String workspaceId,
                                                       @RequestBody Map<String, Object> params) {
        try {
            String filePath = params.getOrDefault("filePath", "").toString();
            // JSON 数字可能被反序列化为 Integer 或 Long，用山转换一下
            Object rawLines = params.getOrDefault("lines", List.of());
            List<Integer> lines;
            if (rawLines instanceof List<?> rawList) {
                lines = rawList.stream()
                        .map(o -> ((Number) o).intValue())
                        .collect(java.util.stream.Collectors.toList());
            } else {
                lines = List.of();
            }
            Map<String, Object> result = debugService.setBreakpoints(workspaceId, filePath, lines);
            return Result.ok(result);
        } catch (Exception e) {
            log.error("设置断点失败: workspaceId={}", workspaceId, e);
            return Result.error("设置断点失败: " + e.getMessage());
        }
    }

    /**
     * 继续执行
     */
    @PostMapping("/debug/continue/{workspaceId}")
    @Operation(summary = "继续执行")
    public Result<String> continueExecution(@PathVariable String workspaceId,
                                             @RequestBody Map<String, Object> params) {
        try {
            int threadId = Integer.parseInt(params.getOrDefault("threadId", "1").toString());
            debugService.continueExecution(workspaceId, threadId);
            return Result.ok("继续执行");
        } catch (Exception e) {
            log.error("继续执行失败", e);
            return Result.error("继续执行失败: " + e.getMessage());
        }
    }

    /**
     * 单步执行（步过）
     */
    @PostMapping("/debug/stepOver/{workspaceId}")
    @Operation(summary = "单步步过")
    public Result<String> stepOver(@PathVariable String workspaceId,
                                    @RequestBody Map<String, Object> params) {
        try {
            int threadId = Integer.parseInt(params.getOrDefault("threadId", "1").toString());
            debugService.stepOver(workspaceId, threadId);
            return Result.ok("步过");
        } catch (Exception e) {
            log.error("单步执行失败", e);
            return Result.error("单步执行失败: " + e.getMessage());
        }
    }

    /**
     * 步入
     */
    @PostMapping("/debug/stepIn/{workspaceId}")
    @Operation(summary = "步入")
    public Result<String> stepIn(@PathVariable String workspaceId,
                                  @RequestBody Map<String, Object> params) {
        try {
            int threadId = Integer.parseInt(params.getOrDefault("threadId", "1").toString());
            debugService.stepIn(workspaceId, threadId);
            return Result.ok("步入");
        } catch (Exception e) {
            log.error("步入失败", e);
            return Result.error("步入失败: " + e.getMessage());
        }
    }

    /**
     * 步出
     */
    @PostMapping("/debug/stepOut/{workspaceId}")
    @Operation(summary = "步出")
    public Result<String> stepOut(@PathVariable String workspaceId,
                                   @RequestBody Map<String, Object> params) {
        try {
            int threadId = Integer.parseInt(params.getOrDefault("threadId", "1").toString());
            debugService.stepOut(workspaceId, threadId);
            return Result.ok("步出");
        } catch (Exception e) {
            log.error("步出失败", e);
            return Result.error("步出失败: " + e.getMessage());
        }
    }

    /**
     * 获取变量
     */
    @PostMapping("/debug/variables/{workspaceId}")
    @Operation(summary = "获取变量")
    public Result<Map<String, Object>> getVariables(@PathVariable String workspaceId,
                                                     @RequestBody Map<String, Object> params) {
        try {
            int frameId = Integer.parseInt(params.getOrDefault("frameId", "0").toString());
            Map<String, Object> variables = debugService.getVariables(workspaceId, frameId);
            return Result.ok(variables);
        } catch (Exception e) {
            log.error("获取变量失败", e);
            return Result.error("获取变量失败: " + e.getMessage());
        }
    }

    /**
     * 获取调用栈
     */
    @PostMapping("/debug/stackTrace/{workspaceId}")
    @Operation(summary = "获取调用栈")
    public Result<Map<String, Object>> getStackTrace(@PathVariable String workspaceId,
                                                      @RequestBody Map<String, Object> params) {
        try {
            int threadId = Integer.parseInt(params.getOrDefault("threadId", "1").toString());
            Map<String, Object> stackTrace = debugService.getStackTrace(workspaceId, threadId);
            return Result.ok(stackTrace);
        } catch (Exception e) {
            log.error("获取调用栈失败", e);
            return Result.error("获取调用栈失败: " + e.getMessage());
        }
    }

    /**
     * 以调试模式执行代码（debugCell）
     * 内部使用 DAP debugCell 命令，代码将在断点处暂停并通过 SSE 推送 debug_event
     */
    @PostMapping("/debug/run/{workspaceId}")
    @Operation(summary = "调试执行代码")
    public Result<String> debugRun(@PathVariable String workspaceId,
                                    @RequestBody Map<String, Object> params) {
        try {
            String code = params.getOrDefault("code", "").toString();
            String filename = params.getOrDefault("filename", "main.py").toString();
            if (code.isEmpty()) {
                return Result.error("代码不能为空");
            }
            debugService.debugCell(workspaceId, code, filename);
            return Result.ok("调试执行已启动");
        } catch (Exception e) {
            log.error("调试执行失败: workspaceId={}", workspaceId, e);
            return Result.error("调试执行失败: " + e.getMessage());
        }
    }

    /**
     * 停止调试
     */
    @PostMapping("/debug/stop/{workspaceId}")
    @Operation(summary = "停止调试")
    public Result<String> stopDebug(@PathVariable String workspaceId) {
        try {
            debugService.stopDebug(workspaceId);
            return Result.ok("调试已停止");
        } catch (Exception e) {
            log.error("停止调试失败", e);
            return Result.error("停止调试失败: " + e.getMessage());
        }
    }

    // ==================== 包管理 ====================

    /**
     * 获取已安装的 pip 包列表
     */
    @GetMapping("/packages/{workspaceId}")
    @Operation(summary = "获取已安装的包列表")
    public Result<List<Map<String, String>>> listPackages(@PathVariable String workspaceId) {
        try {
            return Result.ok(executionService.listPackages(workspaceId));
        } catch (Exception e) {
            log.warn("获取包列表失败: workspaceId={}, err={}", workspaceId, e.getMessage());
            return Result.ok(List.of());
        }
    }

    // ==================== 版本备份 ====================

    /**
     * 创建备份
     */
    @PostMapping("/backup/create/{workspaceId}")
    @Operation(summary = "创建版本备份")
    public Result<PythonBackupEntity> createBackup(@PathVariable String workspaceId,
                                                    @RequestBody Map<String, Object> params) {
        try {
            String remark = params.getOrDefault("remark", "").toString();
            PythonBackupEntity backup = backupService.createBackup(workspaceId, remark);
            return Result.ok(backup);
        } catch (Exception e) {
            log.error("创建备份失败: workspaceId={}", workspaceId, e);
            return Result.error("创建备份失败: " + e.getMessage());
        }
    }

    /**
     * 查询备份列表
     */
    @GetMapping("/backup/list/{workspaceId}")
    @Operation(summary = "查询备份列表")
    public Result<List<PythonBackupEntity>> listBackups(@PathVariable String workspaceId) {
        try {
            List<PythonBackupEntity> list = backupService.listBackups(workspaceId);
            return Result.ok(list);
        } catch (Exception e) {
            log.error("查询备份列表失败", e);
            return Result.error("查询备份列表失败: " + e.getMessage());
        }
    }

    /**
     * 恢复备份
     */
    @PostMapping("/backup/restore/{workspaceId}/{backupId}")
    @Operation(summary = "恢复备份")
    public Result<String> restoreBackup(@PathVariable String workspaceId,
                                         @PathVariable String backupId) {
        try {
            backupService.restoreBackup(workspaceId, backupId);
            return Result.ok("备份恢复成功");
        } catch (Exception e) {
            log.error("恢复备份失败", e);
            return Result.error("恢复备份失败: " + e.getMessage());
        }
    }

    /**
     * 删除备份
     */
    @DeleteMapping("/backup/delete/{workspaceId}/{backupId}")
    @Operation(summary = "删除备份")
    public Result<String> deleteBackup(@PathVariable String workspaceId,
                                        @PathVariable String backupId) {
        try {
            backupService.deleteBackup(workspaceId, backupId);
            return Result.ok("备份删除成功");
        } catch (Exception e) {
            log.error("删除备份失败", e);
            return Result.error("删除备份失败: " + e.getMessage());
        }
    }
}
