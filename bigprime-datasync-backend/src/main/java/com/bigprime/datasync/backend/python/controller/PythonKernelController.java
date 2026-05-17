package com.bigprime.datasync.backend.python.controller;

import com.bigprime.datasync.core.model.Result;
import com.bigprime.datasync.backend.python.kernel.KernelGatewayManager;
import com.bigprime.datasync.backend.python.service.PythonExecutionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Python Kernel 管理 API 控制器
 *
 * @author bigprime
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/python/kernel")
@Tag(name = "Python Kernel 管理")
@AllArgsConstructor
public class PythonKernelController {

    private final KernelGatewayManager gatewayManager;
    private final PythonExecutionService executionService;

    /**
     * 查询 KernelGateway 运行状态
     */
    @GetMapping("/gateway/status")
    @Operation(summary = "查询 KernelGateway 运行状态")
    public Result<Map<String, Object>> gatewayStatus() {
        Map<String, Object> status = new HashMap<>();
        boolean running = gatewayManager.isRunning();
        status.put("running", running);
        status.put("wsBaseUrl", gatewayManager.getGatewayWsBaseUrl());
        status.put("httpBaseUrl", gatewayManager.getGatewayHttpBaseUrl());
        return Result.ok(status);
    }

    /**
     * 手动启动 KernelGateway（auto-start=false 时使用）
     */
    @PostMapping("/gateway/start")
    @Operation(summary = "手动启动 KernelGateway")
    public Result<String> startGateway() {
        try {
            gatewayManager.start();
            return Result.ok("KernelGateway 启动成功");
        } catch (Exception e) {
            log.error("启动 KernelGateway 失败", e);
            return Result.error("启动 KernelGateway 失败: " + e.getMessage());
        }
    }

    /**
     * 停止 KernelGateway
     */
    @PostMapping("/gateway/stop")
    @Operation(summary = "停止 KernelGateway")
    public Result<String> stopGateway() {
        try {
            gatewayManager.stop();
            return Result.ok("KernelGateway 已停止");
        } catch (Exception e) {
            log.error("停止 KernelGateway 失败", e);
            return Result.error("停止 KernelGateway 失败: " + e.getMessage());
        }
    }

    /**
     * 查询指定 Workspace 的 Kernel 是否已连接
     */
    @GetMapping("/status/{workspaceId}")
    @Operation(summary = "查询 Workspace Kernel 连接状态")
    public Result<Map<String, Object>> kernelStatus(@PathVariable String workspaceId) {
        var client = executionService.getKernelClient(workspaceId);
        Map<String, Object> status = new HashMap<>();
        status.put("connected", client != null && client.isConnected());
        return Result.ok(status);
    }

    /**
     * 为 Workspace 启动 Kernel
     */
    @PostMapping("/start/{workspaceId}")
    @Operation(summary = "为 Workspace 启动 Kernel")
    public Result<Map<String, Object>> startKernel(@PathVariable String workspaceId) {
        try {
            String kernelId = executionService.createKernel(workspaceId);
            Map<String, Object> result = new HashMap<>();
            result.put("kernelId", kernelId);
            result.put("wsUrl", gatewayManager.getGatewayWsBaseUrl() + "/api/kernels/" + kernelId + "/channels");
            return Result.ok(result);
        } catch (Exception e) {
            log.error("启动 Kernel 失败: workspaceId={}", workspaceId, e);
            return Result.error("启动 Kernel 失败: " + e.getMessage());
        }
    }

    /**
     * 停止 Workspace 的 Kernel
     */
    @PostMapping("/stop/{workspaceId}")
    @Operation(summary = "停止 Workspace 的 Kernel")
    public Result<String> stopKernel(@PathVariable String workspaceId) {
        try {
            executionService.stopKernel(workspaceId);
            return Result.ok("Kernel 已停止");
        } catch (Exception e) {
            log.error("停止 Kernel 失败: workspaceId={}", workspaceId, e);
            return Result.error("停止 Kernel 失败: " + e.getMessage());
        }
    }
}
