package com.bigprime.datasync.backend.config;

import com.bigprime.datasync.core.model.McpToolsRefreshEvent;
import io.modelcontextprotocol.server.McpSyncServer;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * MCP 工具列表动态刷新通知器
 * <p>
 * 监听 {@link McpToolsRefreshEvent}，当 SQL API 或 Python 服务发布/取消 MCP 工具时，
 * 立即调用 {@code McpSyncServer.notifyToolsListChanged()} 通知所有已连接的 MCP Client
 * 重新拉取工具列表，实现<b>无需重启</b>的动态刷新。
 * </p>
 *
 * @author bigprime
 */
@Slf4j
@Component
public class McpToolsNotifier {

    /**
     * 注入本地 MCP Server（optional：若未启用 MCP Server 则跳过）
     */
    @Autowired(required = false)
    private McpSyncServer mcpSyncServer;

    /**
     * 监听工具刷新事件，通知 MCP Client 重新拉取工具列表
     */
    @EventListener
    public void onMcpToolsRefresh(McpToolsRefreshEvent event) {
        if (mcpSyncServer == null) {
            log.debug("McpSyncServer 未启用，跳过工具列表刷新通知");
            return;
        }
        try {
            mcpSyncServer.notifyToolsListChanged();
            log.info("MCP 工具列表已刷新: source={}, action={}", event.getToolSource(), event.getAction());
        } catch (Exception e) {
            log.warn("MCP 工具列表刷新通知失败（不影响发布流程）: {}", e.getMessage());
        }
    }
}
