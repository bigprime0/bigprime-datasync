package com.bigprime.datasync.backend.python.kernel;

import lombok.Data;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Jupyter Kernel 消息协议模型
 * 参考：https://jupyter-client.readthedocs.io/en/stable/messaging.html
 *
 * @author bigprime
 * @version 1.0
 */
@Data
public class KernelMessage {

    /**
     * 消息头
     */
    private Header header;

    /**
     * 父消息头
     */
    private Header parentHeader;

    /**
     * 元数据
     */
    private Map<String, Object> metadata = new HashMap<>();

    /**
     * 消息内容
     */
    private Map<String, Object> content = new HashMap<>();

    /**
     * 消息类型常量
     */
    public static final String EXECUTE_REQUEST = "execute_request";
    public static final String EXECUTE_REPLY = "execute_reply";
    public static final String EXECUTE_INPUT = "execute_input";
    public static final String EXECUTE_RESULT = "execute_result";
    public static final String STREAM = "stream";
    public static final String ERROR = "error";
    public static final String STATUS = "status";
    public static final String COMPLETE_REQUEST = "complete_request";
    public static final String COMPLETE_REPLY = "complete_reply";
    public static final String INSPECT_REQUEST = "inspect_request";
    public static final String INSPECT_REPLY = "inspect_reply";
    public static final String DEBUG_REQUEST = "debug_request";
    public static final String DEBUG_REPLY = "debug_reply";
    public static final String DEBUG_EVENT = "debug_event";
    public static final String COMM_INFO_REQUEST = "comm_info_request";
    public static final String COMM_INFO_REPLY = "comm_info_reply";
    public static final String KERNEL_INFO_REQUEST = "kernel_info_request";
    public static final String KERNEL_INFO_REPLY = "kernel_info_reply";

    /**
     * 构建执行请求消息
     */
    public static KernelMessage buildExecuteRequest(String sessionId, String code) {
        KernelMessage msg = new KernelMessage();
        msg.header = new Header(UUID.randomUUID().toString(), sessionId, EXECUTE_REQUEST);
        msg.parentHeader = new Header();
        msg.content.put("code", code);
        msg.content.put("silent", false);
        msg.content.put("store_history", true);
        msg.content.put("user_expressions", new HashMap<>());
        msg.content.put("allow_stdin", false);
        return msg;
    }

    /**
     * 构建代码补全请求消息
     */
    public static KernelMessage buildCompleteRequest(String sessionId, String code, int cursorPos) {
        KernelMessage msg = new KernelMessage();
        msg.header = new Header(UUID.randomUUID().toString(), sessionId, COMPLETE_REQUEST);
        msg.parentHeader = new Header();
        msg.content.put("code", code);
        msg.content.put("cursor_pos", cursorPos);
        return msg;
    }

    /** DAP seq 计数器，全局递增，每条 debug_request 必须带上单调递增的 seq */
    private static final AtomicInteger DAP_SEQ = new AtomicInteger(1);

    /**
     * 构建调试请求消息
     */
    public static KernelMessage buildDebugRequest(String sessionId, String command, Map<String, Object> args) {
        KernelMessage msg = new KernelMessage();
        msg.header = new Header(UUID.randomUUID().toString(), sessionId, DEBUG_REQUEST);
        msg.parentHeader = new Header();
        msg.content.put("seq", DAP_SEQ.getAndIncrement());
        msg.content.put("type", "request");
        msg.content.put("command", command);
        msg.content.put("arguments", args != null ? args : new HashMap<>());
        return msg;
    }

    /**
     * 构建 kernel_info 请求（用于心跳检测）
     */
    public static KernelMessage buildKernelInfoRequest(String sessionId) {
        KernelMessage msg = new KernelMessage();
        msg.header = new Header(UUID.randomUUID().toString(), sessionId, KERNEL_INFO_REQUEST);
        msg.parentHeader = new Header();
        return msg;
    }

    /**
     * 消息头
     */
    @Data
    public static class Header {
        private String msgId;
        private String session;
        private String msgType;
        private String username = "bigprime";
        private String version = "5.3";
        private String date;

        public Header() {
        }

        public Header(String msgId, String session, String msgType) {
            this.msgId = msgId;
            this.session = session;
            this.msgType = msgType;
            this.date = java.time.Instant.now().toString();
        }
    }
}
