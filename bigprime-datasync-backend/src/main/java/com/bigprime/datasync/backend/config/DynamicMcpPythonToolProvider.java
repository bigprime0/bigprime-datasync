package com.bigprime.datasync.backend.config;

import com.bigprime.datasync.backend.python.entity.PythonServiceEntity;
import com.bigprime.datasync.backend.python.service.PythonServicePublishService;
import com.bigprime.datasync.backend.python.service.repository.PythonServiceRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.tool.ToolCallback;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.ai.tool.definition.DefaultToolDefinition;
import org.springframework.ai.tool.definition.ToolDefinition;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;

/**
 * 动态 Python MCP 工具提供器
 * <p>
 * 从 data_python_service 表加载 publish_as_mcp=1 且 status=ACTIVE 的服务，
 * 将每个服务包装为一个 ToolCallback 注册到本地 MCP Server 供 AI 调用。
 * 执行时通过 POST /api/python/invoke + X-API-Key Header 调用对应脚本。
 * </p>
 */
@Slf4j
@Component
public class DynamicMcpPythonToolProvider implements ToolCallbackProvider {

    private final PythonServiceRepository serviceRepository;
    private final ObjectMapper objectMapper;
    private final String serverBaseUrl;

    public DynamicMcpPythonToolProvider(
            PythonServiceRepository serviceRepository,
            ObjectMapper objectMapper,
            @Value("${server.python-mcp.base-url:http://localhost:6506}") String serverBaseUrl) {
        this.serviceRepository = serviceRepository;
        this.objectMapper = objectMapper;
        this.serverBaseUrl = serverBaseUrl;
    }

    @Override
    public ToolCallback[] getToolCallbacks() {
        try {
            List<PythonServiceEntity> published = serviceRepository.findPublishedAsMcp();
            log.debug("加载 MCP Python 工具: {} 个", published.size());
            return published.stream()
                    .map(e -> new PythonToolCallback(e, objectMapper, serverBaseUrl))
                    .toArray(ToolCallback[]::new);
        } catch (Exception e) {
            log.warn("加载 MCP Python 工具失败: {}", e.getMessage());
            return new ToolCallback[0];
        }
    }

    /**
     * Python MCP 工具 ToolCallback 实现
     */
    private static class PythonToolCallback implements ToolCallback {

        private final PythonServiceEntity service;
        private final ObjectMapper objectMapper;
        private final String serverBaseUrl;

        PythonToolCallback(PythonServiceEntity service, ObjectMapper objectMapper, String serverBaseUrl) {
            this.service = service;
            this.objectMapper = objectMapper;
            this.serverBaseUrl = serverBaseUrl;
        }

        @Override
        public ToolDefinition getToolDefinition() {
            return DefaultToolDefinition.builder()
                    .name(service.getMcpToolName())
                    .description(StringUtils.hasText(service.getDescription())
                            ? service.getDescription()
                            : "Python 脚本工具: " + service.getServiceName())
                    .inputSchema("{\"type\":\"object\",\"properties\":{\"input\":{\"type\":\"object\",\"description\":\"传入脚本 __input__ 变量的 JSON 参数\"}},\"required\":[]}")
                    .build();
        }

        @Override
        public String call(String toolInput) {
            log.info("执行 Python MCP 工具: tool={}, input={}", service.getMcpToolName(), toolInput);
            try {
                // toolInput 直接作为 inputData 发给 /api/python/invoke
                Map<String, Object> inputData;
                if (StringUtils.hasText(toolInput)) {
                    try {
                        inputData = objectMapper.readValue(toolInput,
                                new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>() {});
                    } catch (Exception e) {
                        inputData = Map.of("input", toolInput);
                    }
                } else {
                    inputData = Map.of();
                }

                String requestBody = objectMapper.writeValueAsString(inputData);
                String invokeUrl = serverBaseUrl.replaceAll("/+$", "") + "/api/python/invoke";

                HttpClient client = HttpClient.newBuilder()
                        .connectTimeout(Duration.ofSeconds(10))
                        .build();

                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(invokeUrl))
                        .header("Content-Type", "application/json")
                        .header("X-API-Key", service.getApiKey())
                        .timeout(Duration.ofMinutes(5))
                        .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                        .build();

                HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
                log.info("Python MCP 工具执行成功: tool={}, status={}", service.getMcpToolName(), response.statusCode());
                return response.body();
            } catch (Exception e) {
                log.error("Python MCP 工具执行失败: tool={}", service.getMcpToolName(), e);
                return "{\"error\": \"" + e.getMessage().replace("\"", "'") + "\"}";
            }
        }
    }
}
