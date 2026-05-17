package com.bigprime.datasync.backend.config;

import com.bigprime.datasync.backend.service.DashboardService;
import com.bigprime.datasync.backend.service.EtlAgentService;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.ai.tool.method.MethodToolCallbackProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * MCP Server 工具注册配置
 * 将标注了 @Tool 的 Service 方法暴露为标准 MCP 工具。
 * 动态 SQL MCP 工具由 DynamicMcpSqlToolProvider（@Component）自动注册，无需在此手动配置。
 *
 * 新增静态工具步骤：
 * 1. 在对应 Service 方法上加 @Tool(description = "...") 注解
 * 2. 在 mcpTools() 的 toolObjects(...) 中加入该 Service Bean
 */
@Configuration
public class McpServerConfig {

    @Bean
    public ToolCallbackProvider mcpTools(DashboardService dashboardService,
                                         EtlAgentService etlAgentService) {
        return MethodToolCallbackProvider.builder()
                .toolObjects(dashboardService, etlAgentService)
                .build();
    }
}
