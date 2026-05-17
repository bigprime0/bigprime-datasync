package com.bigprime.datasync.backend.python.kernel;

import com.bigprime.datasync.backend.python.service.PythonLspService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.BinaryMessage;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Java WebSocket ↔ pylsp TCP 双向转发处理器
 *
 * <p>前端 monaco-languageclient 通过 WebSocket 连接到此处理器，
 * 后端将消息转发到 pylsp TCP 进程（LSP JSON-RPC over TCP），
 * pylsp 的响应再通过 WebSocket 回传给前端。</p>
 *
 * <p>pylsp TCP 帧格式：Content-Length: N\r\n\r\nJSON，与 DAP 协议相同。</p>
 *
 * @author bigprime
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PythonLspWebSocketHandler extends TextWebSocketHandler {

    private final PythonLspService lspService;

    /** sessionId → pylsp TCP 连接 */
    private final Map<String, TcpBridge> bridges = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String workspaceId = extractWorkspaceId(session);
        if (workspaceId == null) {
            log.warn("[LSP-WS] 无法解析 workspaceId，关闭连接");
            session.close(CloseStatus.BAD_DATA);
            return;
        }

        try {
            int port = lspService.ensureStarted(workspaceId);
            Socket tcpSocket = new Socket("127.0.0.1", port);
            TcpBridge bridge = new TcpBridge(session, tcpSocket, workspaceId);
            bridges.put(session.getId(), bridge);
            bridge.startReading();
            log.info("[LSP-WS] WebSocket 连接建立: sessionId={}, workspaceId={}, port={}", session.getId(), workspaceId, port);
        } catch (Exception e) {
            log.error("[LSP-WS] 启动 pylsp 失败: workspaceId={}", workspaceId, e);
            session.close(new CloseStatus(CloseStatus.SERVER_ERROR.getCode(), "pylsp 启动失败: " + e.getMessage()));
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        TcpBridge bridge = bridges.get(session.getId());
        if (bridge == null) return;

        // 前端发来的是原始 LSP JSON，需要包装成 Content-Length 帧
        String json = message.getPayload();
        byte[] jsonBytes = json.getBytes(StandardCharsets.UTF_8);
        String header = "Content-Length: " + jsonBytes.length + "\r\n\r\n";
        byte[] headerBytes = header.getBytes(StandardCharsets.UTF_8);

        synchronized (bridge.out) {
            bridge.out.write(headerBytes);
            bridge.out.write(jsonBytes);
            bridge.out.flush();
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        TcpBridge bridge = bridges.remove(session.getId());
        if (bridge != null) {
            bridge.close();
            log.info("[LSP-WS] WebSocket 连接关闭: sessionId={}, status={}", session.getId(), status);
        }
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) {
        log.warn("[LSP-WS] 传输错误: sessionId={}, err={}", session.getId(), exception.getMessage());
        TcpBridge bridge = bridges.remove(session.getId());
        if (bridge != null) bridge.close();
    }

    // ==================== 内部工具 ====================

    private String extractWorkspaceId(WebSocketSession session) {
        // URI 格式: /lsp/{workspaceId}
        String uri = session.getUri() != null ? session.getUri().getPath() : "";
        String[] parts = uri.split("/");
        // parts = ["", "lsp", "{workspaceId}"]
        if (parts.length >= 3) {
            return parts[parts.length - 1];
        }
        return null;
    }

    // ==================== TCP 桥接内部类 ====================

    private class TcpBridge {
        final WebSocketSession wsSession;
        final Socket tcpSocket;
        final OutputStream out;
        final InputStream in;
        final String workspaceId;

        TcpBridge(WebSocketSession wsSession, Socket tcpSocket, String workspaceId) throws IOException {
            this.wsSession = wsSession;
            this.tcpSocket = tcpSocket;
            this.out = tcpSocket.getOutputStream();
            this.in = tcpSocket.getInputStream();
            this.workspaceId = workspaceId;
        }

        /** 启动后台线程持续读取 pylsp → 转发给 WebSocket */
        void startReading() {
            Thread t = new Thread(() -> {
                try {
                    readLoop();
                } catch (Exception e) {
                    if (tcpSocket.isConnected() && !tcpSocket.isClosed()) {
                        log.warn("[LSP-WS] TCP 读取异常: workspaceId={}, err={}", workspaceId, e.getMessage());
                    }
                } finally {
                    close();
                    try {
                        if (wsSession.isOpen()) wsSession.close(CloseStatus.GOING_AWAY);
                    } catch (IOException ignored) {}
                }
            }, "lsp-bridge-" + workspaceId);
            t.setDaemon(true);
            t.start();
        }

        /**
         * 读取 pylsp TCP 流，解析 Content-Length 帧，提取 JSON 正文后通过 WebSocket 发送给前端
         */
        private void readLoop() throws Exception {
            byte[] headerBuf = new byte[4096];
            while (!tcpSocket.isClosed()) {
                // 逐字节读取 header，直到 \r\n\r\n
                int headerLen = readUntilDoubleNewline(headerBuf);
                if (headerLen <= 0) break;

                String headerStr = new String(headerBuf, 0, headerLen, StandardCharsets.UTF_8);
                int contentLength = parseContentLength(headerStr);
                if (contentLength <= 0) {
                    log.warn("[LSP-WS] 无效 Content-Length: {}", headerStr);
                    continue;
                }

                // 读取 JSON 正文
                byte[] body = readFully(contentLength);
                String json = new String(body, StandardCharsets.UTF_8);

                // 发送给前端 WebSocket
                if (wsSession.isOpen()) {
                    synchronized (wsSession) {
                        wsSession.sendMessage(new TextMessage(json));
                    }
                }
            }
        }

        /** 逐字节读取直到 \r\n\r\n，返回 header 字节数 */
        private int readUntilDoubleNewline(byte[] buf) throws IOException {
            int pos = 0;
            int b;
            while ((b = in.read()) != -1) {
                buf[pos++] = (byte) b;
                if (pos >= 4
                        && buf[pos - 4] == '\r' && buf[pos - 3] == '\n'
                        && buf[pos - 2] == '\r' && buf[pos - 1] == '\n') {
                    return pos - 4; // 返回不含 \r\n\r\n 的长度
                }
                if (pos >= buf.length) {
                    log.warn("[LSP-WS] header 过长，截断");
                    return pos;
                }
            }
            return -1;
        }

        /** 解析 "Content-Length: N" */
        private int parseContentLength(String header) {
            for (String line : header.split("\r\n")) {
                if (line.toLowerCase().startsWith("content-length:")) {
                    try {
                        return Integer.parseInt(line.substring("content-length:".length()).trim());
                    } catch (NumberFormatException ignored) {}
                }
            }
            return -1;
        }

        /** 读取 exactly n 字节 */
        private byte[] readFully(int n) throws IOException {
            byte[] buf = new byte[n];
            int read = 0;
            while (read < n) {
                int r = in.read(buf, read, n - read);
                if (r == -1) throw new IOException("流已关闭，期望 " + n + " 字节，只读到 " + read);
                read += r;
            }
            return buf;
        }

        void close() {
            try { tcpSocket.close(); } catch (IOException ignored) {}
        }
    }
}
