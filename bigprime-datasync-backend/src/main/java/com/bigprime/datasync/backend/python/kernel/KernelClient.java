package com.bigprime.datasync.backend.python.kernel;

import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONObject;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.net.URI;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.function.Consumer;

/**
 * Jupyter Kernel WebSocket 客户端
 * 负责与单个 Kernel 的全双工通信
 *
 * @author bigprime
 * @version 1.0
 */
@Slf4j
public class KernelClient extends TextWebSocketHandler {

    /**
     * 会话 ID（每个 Kernel 连接唯一）
     */
    private final String sessionId;

    /**
     * WebSocket URL
     */
    private final String wsUrl;

    /**
     * WebSocket 会话
     */
    private WebSocketSession wsSession;

    /**
     * 消息回调：msgId -> consumer
     */
    private final Map<String, Consumer<JSONObject>> messageCallbacks = new ConcurrentHashMap<>();

    /**
     * 全局消息监听器（用于流式输出推送到前端）
     */
    private Consumer<JSONObject> globalMessageListener;

    /**
     * 连接就绪 Future
     */
    private final CompletableFuture<Void> connectFuture = new CompletableFuture<>();

    public KernelClient(String wsUrl) {
        this.sessionId = UUID.randomUUID().toString().replace("-", "");
        // KernelGateway 要求 URL 带 session_id 参数，否则报 "No session ID specified"
        this.wsUrl = wsUrl + (wsUrl.contains("?") ? "&" : "?") + "session_id=" + this.sessionId;
    }

    /**
     * 建立 WebSocket 连接
     * maxTextMessageSize=10MB：debugpy variables 回复可能包含大量变量数据，
     * 默认 64KB 会触发 CloseStatus[1009]（message too big），导致连接断开。
     */
    public void connect() throws Exception {
        StandardWebSocketClient client = new StandardWebSocketClient();
        // 配置最大文本消息缓冲区为 10MB（Tomcat/Jetty 容器均支持此 property）
        client.getUserProperties().put("org.apache.tomcat.websocket.textBufferSize", 10 * 1024 * 1024);
        client.getUserProperties().put("org.eclipse.jetty.websocket.textBufferSize", 10 * 1024 * 1024);
        client.execute(this, wsUrl).get(10, TimeUnit.SECONDS);
        connectFuture.get(10, TimeUnit.SECONDS);
        log.info("KernelClient 连接成功: {}", wsUrl);
    }

    /**
     * 发送消息到 Kernel
     */
    public void sendMessage(KernelMessage message) throws IOException {
        if (wsSession == null || !wsSession.isOpen()) {
            throw new IllegalStateException("KernelClient 未连接");
        }
        String json = JSON.toJSONString(toWireFormat(message));
        wsSession.sendMessage(new TextMessage(json));
        log.debug("发送 Kernel 消息: type={}, msgId={}", message.getHeader().getMsgType(), message.getHeader().getMsgId());
    }

    /**
     * 注册消息回调（根据 parentMsgId 匹配响应）
     */
    public void registerCallback(String msgId, Consumer<JSONObject> callback) {
        messageCallbacks.put(msgId, callback);
    }

    /**
     * 移除消息回调
     */
    public void removeCallback(String msgId) {
        messageCallbacks.remove(msgId);
    }

    /**
     * 清除所有残留的回调（调试会话初始化完成后调用，避免旧请求残留 callback 干扰新命令）
     */
    public void clearAllCallbacks() {
        int size = messageCallbacks.size();
        messageCallbacks.clear();
        if (size > 0) {
            log.info("clearAllCallbacks: 清除 {} 个残留 callback", size);
        }
    }

    /**
     * 设置全局消息监听器
     */
    public void setGlobalMessageListener(Consumer<JSONObject> listener) {
        this.globalMessageListener = listener;
    }

    /**
     * 获取会话 ID
     */
    public String getSessionId() {
        return sessionId;
    }

    /**
     * 是否已连接
     */
    public boolean isConnected() {
        return wsSession != null && wsSession.isOpen();
    }

    /**
     * 关闭连接
     */
    public void close() {
        if (wsSession != null && wsSession.isOpen()) {
            try {
                wsSession.close();
            } catch (IOException e) {
                log.warn("关闭 KernelClient 时出错", e);
            }
        }
    }

    // ==================== WebSocket 回调 ====================

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        this.wsSession = session;
        // 放大接收缓冲区限制：防止 variables 等大体积 DAP 回复触发 1009
        session.setTextMessageSizeLimit(10 * 1024 * 1024);
        connectFuture.complete(null);
        log.info("Kernel WebSocket 连接建立: {}", wsUrl);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        try {
            JSONObject json = JSON.parseObject(message.getPayload());
            String msgType = json.getJSONObject("header") != null
                    ? json.getJSONObject("header").getString("msg_type") : "";
            String parentMsgId = json.getJSONObject("parent_header") != null
                    ? json.getJSONObject("parent_header").getString("msg_id") : "";

            log.debug("收到 Kernel 消息: type={}, parentMsgId={}", msgType, parentMsgId);

            // 打印所有 debug 相关消息
            if (msgType != null && (msgType.startsWith("debug") || KernelMessage.DEBUG_EVENT.equals(msgType))) {
                log.info("[WebSocket收到 debug消息] type={}, parentMsgId={}, payload={}",
                        msgType, parentMsgId, message.getPayload());
            }

            // 触发全局监听器
            if (globalMessageListener != null) {
                globalMessageListener.accept(json);
            }

            // 触发特定回调：先尝试 parentMsgId 匹配
            boolean matched = false;
            if (parentMsgId != null && !parentMsgId.isBlank() && messageCallbacks.containsKey(parentMsgId)) {
                messageCallbacks.get(parentMsgId).accept(json);
                matched = true;
                if (KernelMessage.EXECUTE_REPLY.equals(msgType) || KernelMessage.ERROR.equals(msgType)) {
                    messageCallbacks.remove(parentMsgId);
                }
            }

            // debug_reply 等 DAP 回复消息：
            // 优先通过 parentMsgId 精确匹配（已在上面处理），
            // 降级时只通过 content.command 名称匹配（不再盲目取第一个，防止误消费）
            if (!matched && KernelMessage.DEBUG_REPLY.equals(msgType) && !messageCallbacks.isEmpty()) {
                String replyCommand = json.getJSONObject("content") != null
                        ? json.getJSONObject("content").getString("command") : null;
                if (replyCommand != null && !replyCommand.isBlank()) {
                    String matchedKey = null;
                    for (String key : messageCallbacks.keySet()) {
                        if (key.contains(":" + replyCommand)) {
                            matchedKey = key;
                            break;
                        }
                    }
                    if (matchedKey != null) {
                        Consumer<JSONObject> cb = messageCallbacks.remove(matchedKey);
                        if (cb != null) cb.accept(json);
                    } else {
                        log.warn("[debug_reply] 命令 {} 无匹配 callback，当前等待: {}", replyCommand, messageCallbacks.keySet());
                    }
                } else {
                    log.warn("[debug_reply] 无 parentMsgId 且无 command，消息丢弃: {}", message.getPayload().length() > 200 ? message.getPayload().substring(0, 200) : message.getPayload());
                }
            }

        } catch (Exception e) {
            log.error("处理 Kernel 消息出错", e);
        }
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) {
        log.error("Kernel WebSocket 传输错误", exception);
        connectFuture.completeExceptionally(exception);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        log.info("Kernel WebSocket 连接关闭: status={}", status);
        this.wsSession = null;
    }

    // ==================== 私有工具 ====================

    /**
     * 将 KernelMessage 转换为 Jupyter Wire Protocol 格式
     */
    private Map<String, Object> toWireFormat(KernelMessage msg) {
        Map<String, Object> wire = new ConcurrentHashMap<>();

        Map<String, Object> header = new ConcurrentHashMap<>();
        header.put("msg_id", msg.getHeader().getMsgId());
        header.put("session", msg.getHeader().getSession());
        header.put("msg_type", msg.getHeader().getMsgType());
        header.put("username", msg.getHeader().getUsername());
        header.put("version", msg.getHeader().getVersion());
        header.put("date", msg.getHeader().getDate());

        Map<String, Object> parentHeader = new ConcurrentHashMap<>();
        if (msg.getParentHeader() != null && msg.getParentHeader().getMsgId() != null) {
            parentHeader.put("msg_id", msg.getParentHeader().getMsgId());
        }

        wire.put("header", header);
        wire.put("parent_header", parentHeader);
        wire.put("metadata", msg.getMetadata());
        wire.put("content", msg.getContent());
        wire.put("channel", resolveChannel(msg.getHeader().getMsgType()));

        return wire;
    }

    /**
     * 根据消息类型解析通道
     */
    private String resolveChannel(String msgType) {
        if (msgType.endsWith("_reply") || msgType.equals(KernelMessage.STATUS)
                || msgType.equals(KernelMessage.STREAM)
                || msgType.equals(KernelMessage.EXECUTE_RESULT)
                || msgType.equals(KernelMessage.EXECUTE_INPUT)
                || msgType.equals(KernelMessage.ERROR)
                || msgType.equals(KernelMessage.DEBUG_EVENT)) {
            return "iopub";
        }
        // ipykernel 6.x 要求 debug_request 必须走 control channel
        if (KernelMessage.DEBUG_REQUEST.equals(msgType)) {
            return "control";
        }
        return "shell";
    }
}
