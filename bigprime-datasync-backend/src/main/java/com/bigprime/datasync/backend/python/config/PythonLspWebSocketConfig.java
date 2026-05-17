package com.bigprime.datasync.backend.python.config;

import com.bigprime.datasync.backend.python.kernel.PythonLspWebSocketHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

/**
 * Python LSP WebSocket 配置
 * <p>
 * 注册 /lsp/{workspaceId} 端点，供前端 monaco-languageclient 连接。
 * 注意：不能使用 /ws/ 前缀，否则会被 SockJS 的 HandlerMapping 拦截。
 * 已在 auth.yml 白名单中放行 /lsp/**，无需 JWT 验证。
 * </p>
 *
 * @author bigprime
 */
@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class PythonLspWebSocketConfig implements WebSocketConfigurer {

    private final PythonLspWebSocketHandler lspHandler;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(lspHandler, "/lsp/**")
                .setAllowedOrigins("*");
    }
}
