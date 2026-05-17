package com.bigprime.datasync.backend.config;

import com.bigprime.ai.core.service.McpServerService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/**
 * 后端启动后自动确保本地内置 MCP 服务器已注册到 ai_mcp_server 表中，
 * 避免用户新建助手时看不到「BigPrime DataSync (本地内置)」选项。
 */
@Slf4j
@Component
public class LocalMcpServerInitializer implements ApplicationRunner {

    @Value("${server.port:6506}")
    private int serverPort;

    @Autowired(required = false)
    private McpServerService mcpServerService;

    @Override
    public void run(ApplicationArguments args) {
        if (mcpServerService == null) {
            log.debug("McpServerService 未加载，跳过本地内置 MCP Server 自动注册");
            return;
        }
        try {
            mcpServerService.ensureLocalBuiltinRegistered(serverPort);
        } catch (Exception e) {
            // 不影响主流程启动
            log.warn("自动注册本地内置 MCP Server 失败（不影响启动）: {}", e.getMessage());
        }
    }
}
