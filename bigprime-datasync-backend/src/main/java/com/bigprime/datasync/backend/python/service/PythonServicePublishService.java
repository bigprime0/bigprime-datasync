package com.bigprime.datasync.backend.python.service;

import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONObject;
import com.bigprime.datasync.core.model.McpToolsRefreshEvent;
import com.bigprime.datasync.backend.python.entity.PythonServiceEntity;
import com.bigprime.datasync.backend.python.entity.PythonWorkspaceEntity;
import com.bigprime.datasync.backend.python.kernel.KernelClient;
import com.bigprime.datasync.backend.python.kernel.KernelMessage;
import com.bigprime.datasync.backend.python.service.repository.PythonServiceRepository;
import com.bigprime.datasync.backend.python.service.repository.PythonWorkspaceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

/**
 * Python 脚本发布服务
 * 负责发布管理和 HTTP 调用执行
 *
 * @author bigprime
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PythonServicePublishService {

    private final PythonServiceRepository serviceRepository;
    private final PythonWorkspaceRepository workspaceRepository;
    private final PythonExecutionService executionService;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * 发布脚本为 HTTP 服务
     *
     * @param workspaceId    Workspace ID
     * @param scriptName     脚本文件名（如 main.py）
     * @param serviceName    服务显示名称
     * @param apiKey         前端生成的 API Key（32 位 hex）
     * @param description    服务描述
     * @param effectiveStart 生效开始时间（null=立即）
     * @param effectiveEnd   生效结束时间（null=永久）
     * @param publishAsMcp   是否发布为 MCP 工具（0=否 1=是）
     * @param mcpToolName    MCP 工具名（publishAsMcp=1 时使用）
     * @return 已创建的服务实体
     */
    public PythonServiceEntity publish(String workspaceId, String scriptName, String serviceName,
                                       String apiKey, String description, Date effectiveStart, Date effectiveEnd,
                                       Integer publishAsMcp, String mcpToolName) {
        PythonWorkspaceEntity workspace = workspaceRepository.findById(workspaceId);
        if (workspace == null) {
            throw new RuntimeException("Workspace 不存在: " + workspaceId);
        }

        // 校验脚本文件存在
        String safeName = Paths.get(scriptName).getFileName().toString();
        if (!safeName.endsWith(".py")) {
            safeName = safeName + ".py";
        }
        Path scriptPath = Paths.get(workspace.getWorkspacePath(), "scripts", safeName);
        if (!Files.exists(scriptPath)) {
            throw new RuntimeException("脚本文件不存在: " + safeName);
        }

        // 校验 apiKey 格式（32位十六进制）
        if (apiKey == null || !apiKey.matches("[0-9a-fA-F]{32}")) {
            throw new RuntimeException("无效的 API Key 格式，应为 32 位十六进制字符串");
        }

        PythonServiceEntity entity = new PythonServiceEntity();
        entity.setWorkspaceId(workspaceId);
        entity.setScriptName(safeName);
        entity.setServiceName(serviceName);
        entity.setDescription(description);
        entity.setApiKey(apiKey);
        entity.setStatus("ACTIVE");
        entity.setEffectiveStart(effectiveStart);
        entity.setEffectiveEnd(effectiveEnd);
        entity.setPublishAsMcp(publishAsMcp != null ? publishAsMcp : 0);
        if (publishAsMcp != null && publishAsMcp == 1 && mcpToolName != null) {
            entity.setMcpToolName(mcpToolName);
        }

        serviceRepository.save(entity);
        log.info("发布 Python 服务成功: workspaceId={}, scriptName={}, serviceId={}", workspaceId, safeName, entity.getId());
        // 若开启 MCP，通知 MCP Server 刷新工具列表（无需重启）
        if (publishAsMcp != null && publishAsMcp == 1) {
            eventPublisher.publishEvent(new McpToolsRefreshEvent(this, "python", "publish"));
        }
        return entity;
    }

    /**
     * 停用服务
     */
    public void disable(String serviceId) {
        PythonServiceEntity entity = serviceRepository.findById(serviceId);
        if (entity == null) {
            throw new RuntimeException("服务不存在: " + serviceId);
        }
        serviceRepository.updateStatus(serviceId, "INACTIVE");
        log.info("停用 Python 服务: serviceId={}", serviceId);
    }

    /**
     * 启用服务
     */
    public void enable(String serviceId) {
        PythonServiceEntity entity = serviceRepository.findById(serviceId);
        if (entity == null) {
            throw new RuntimeException("服务不存在: " + serviceId);
        }
        serviceRepository.updateStatus(serviceId, "ACTIVE");
        log.info("启用 Python 服务: serviceId={}", serviceId);
    }

    /**
     * 删除发布服务
     */
    public void delete(String serviceId) {
        PythonServiceEntity entity = serviceRepository.findById(serviceId);
        if (entity == null) {
            throw new RuntimeException("服务不存在: " + serviceId);
        }
        serviceRepository.delete(serviceId);
        log.info("删除 Python 服务: serviceId={}", serviceId);
    }

    /**
     * 更新生效时间
     */
    public void updateEffectiveTime(String serviceId, Date effectiveStart, Date effectiveEnd) {
        PythonServiceEntity entity = serviceRepository.findById(serviceId);
        if (entity == null) {
            throw new RuntimeException("服务不存在: " + serviceId);
        }
        serviceRepository.updateEffectiveTime(serviceId, effectiveStart, effectiveEnd);
        log.info("更新 Python 服务生效时间: serviceId={}, start={}, end={}", serviceId, effectiveStart, effectiveEnd);
    }

    /**
     * 查询 Workspace 下所有发布服务
     */
    public List<PythonServiceEntity> listByWorkspace(String workspaceId) {
        return serviceRepository.findByWorkspaceId(workspaceId);
    }

    /**
     * 查询单个服务详情
     */
    public PythonServiceEntity getById(String serviceId) {
        PythonServiceEntity entity = serviceRepository.findById(serviceId);
        if (entity == null) {
            throw new RuntimeException("服务不存在: " + serviceId);
        }
        return entity;
    }

    /**
     * 查询已发布为 MCP 工具的服务列表
     */
    public List<PythonServiceEntity> listPublishedAsMcp() {
        return serviceRepository.findPublishedAsMcp();
    }

    /**
     * 取消发布为 MCP 工具
     */
    public void disableMcp(String serviceId) {
        PythonServiceEntity entity = serviceRepository.findById(serviceId);
        if (entity == null) {
            throw new RuntimeException("服务不存在: " + serviceId);
        }
        serviceRepository.disableMcp(serviceId);
        log.info("取消 Python 服务 MCP 发布: serviceId={}", serviceId);
        // 通知 MCP Server 刷新工具列表
        eventPublisher.publishEvent(new McpToolsRefreshEvent(this, "python", "disable"));
    }

    /**
     * 通过 API Key 调用服务执行脚本，同步返回结果
     *
     * @param apiKey    Header 中传入的 API Key
     * @param inputData 调用方传入的 JSON 参数（注入为 __input__ 变量）
     * @return 执行结果 Map（包含 output、result、error）
     */
    public Map<String, Object> invoke(String apiKey, Map<String, Object> inputData) {
        // 1. 鉴权：按 apiKey 查找服务
        PythonServiceEntity service = serviceRepository.findByApiKey(apiKey);
        if (service == null) {
            throw new RuntimeException("无效的 API Key");
        }

        // 2. 状态校验
        if (!"ACTIVE".equals(service.getStatus())) {
            throw new RuntimeException("服务已停用");
        }

        // 3. 生效时间校验
        Date now = new Date();
        if (service.getEffectiveStart() != null && now.before(service.getEffectiveStart())) {
            throw new RuntimeException("服务尚未到生效时间");
        }
        if (service.getEffectiveEnd() != null && now.after(service.getEffectiveEnd())) {
            throw new RuntimeException("服务已过期");
        }

        // 4. 获取脚本内容
        PythonWorkspaceEntity workspace = workspaceRepository.findById(service.getWorkspaceId());
        if (workspace == null) {
            throw new RuntimeException("Workspace 不存在");
        }
        Path scriptPath = Paths.get(workspace.getWorkspacePath(), "scripts", service.getScriptName());
        if (!Files.exists(scriptPath)) {
            throw new RuntimeException("脚本文件不存在: " + service.getScriptName());
        }

        String scriptContent;
        try {
            scriptContent = Files.readString(scriptPath);
        } catch (Exception e) {
            throw new RuntimeException("读取脚本文件失败: " + e.getMessage(), e);
        }

        // 5. 构造执行代码：先注入 __input__，再执行脚本，最后将 __output__ 序列化输出
        String inputJson = inputData != null ? JSON.toJSONString(inputData) : "{}";
        String wrappedCode = String.format(
                "import json as __json__\n" +
                "__input__ = __json__.loads('%s')\n" +
                "%s\n" +
                "if '__output__' in dir():\n" +
                "    print('__RESULT__:' + __json__.dumps(__output__, ensure_ascii=False, default=str))\n",
                inputJson.replace("'", "\\'"),
                scriptContent
        );

        // 6. 执行
        return executeSync(service.getWorkspaceId(), wrappedCode);
    }

    /**
     * 同步执行代码，收集所有输出后返回
     */
    private Map<String, Object> executeSync(String workspaceId, String code) {
        KernelClient client = executionService.getKernelClient(workspaceId);
        if (client == null || !client.isConnected()) {
            throw new RuntimeException("Kernel 未启动，请先在 IDE 中启动 Kernel");
        }

        KernelMessage execMsg = KernelMessage.buildExecuteRequest(client.getSessionId(), code);
        String msgId = execMsg.getHeader().getMsgId();

        StringBuilder outputBuilder = new StringBuilder();
        String[] resultHolder = {null};
        String[] errorHolder = {null};
        CountDownLatch latch = new CountDownLatch(1);

        client.registerCallback(msgId, json -> {
            try {
                String msgType = json.getJSONObject("header").getString("msg_type");
                JSONObject content = json.getJSONObject("content");

                switch (msgType) {
                    case KernelMessage.STREAM -> {
                        String text = content.getString("text");
                        if (text != null) {
                            if (text.contains("__RESULT__:")) {
                                // 提取脚本设置的 __output__
                                for (String line : text.split("\n")) {
                                    if (line.startsWith("__RESULT__:")) {
                                        resultHolder[0] = line.substring("__RESULT__:".length()).trim();
                                    } else if (!line.isEmpty()) {
                                        outputBuilder.append(line).append("\n");
                                    }
                                }
                            } else {
                                outputBuilder.append(text);
                            }
                        }
                    }
                    case KernelMessage.EXECUTE_RESULT -> {
                        JSONObject data = content.getJSONObject("data");
                        if (data != null) {
                            String plainText = data.getString("text/plain");
                            if (plainText != null && !plainText.isEmpty()) {
                                if (resultHolder[0] == null) {
                                    resultHolder[0] = plainText;
                                }
                            }
                        }
                    }
                    case KernelMessage.ERROR -> {
                        String ename = content.getString("ename");
                        String evalue = content.getString("evalue");
                        errorHolder[0] = ename + ": " + evalue;
                        latch.countDown();
                    }
                    case KernelMessage.EXECUTE_REPLY -> {
                        latch.countDown();
                    }
                    default -> {
                        // 忽略其他消息
                    }
                }
            } catch (Exception e) {
                log.error("处理调用结果出错", e);
                latch.countDown();
            }
        });

        try {
            client.sendMessage(execMsg);
            boolean finished = latch.await(5, TimeUnit.MINUTES);
            if (!finished) {
                throw new RuntimeException("脚本执行超时（5分钟）");
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("执行被中断", e);
        } catch (Exception e) {
            throw new RuntimeException("执行失败: " + e.getMessage(), e);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("output", outputBuilder.toString().trim());

        if (errorHolder[0] != null) {
            result.put("status", "error");
            result.put("error", errorHolder[0]);
        } else {
            result.put("status", "success");
            if (resultHolder[0] != null) {
                // 尝试解析 JSON，否则返回字符串
                try {
                    result.put("result", JSON.parse(resultHolder[0]));
                } catch (Exception e) {
                    result.put("result", resultHolder[0]);
                }
            }
        }

        return result;
    }
}
