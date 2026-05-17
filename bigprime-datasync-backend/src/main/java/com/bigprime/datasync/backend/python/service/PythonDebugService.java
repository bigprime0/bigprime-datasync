package com.bigprime.datasync.backend.python.service;

import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONObject;
import com.bigprime.datasync.backend.python.entity.PythonWorkspaceEntity;
import com.bigprime.datasync.backend.python.kernel.KernelClient;
import com.bigprime.datasync.backend.python.kernel.KernelMessage;
import com.bigprime.datasync.backend.python.service.repository.PythonWorkspaceRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

/**
 * 基于 Jupyter Debug Adapter Protocol (DAP) 实现断点调试。
 * <p>
 * 参考 JupyterLab 官方实现（packages/debugger/src/session.ts）：
 * 所有 DAP 命令（initialize/attach/setBreakpoints/configurationDone）均通过 WebSocket debug_request 发送。
 * debugpySockets 里的 TCP 端口仅供外部 IDE（VS Code）使用，本实现不需要也不使用 TCP。
 */
@Slf4j
@Service
public class PythonDebugService {

    /** ipykernel murmur2_x86 的固定 seed：0xC70F6907 */
    private static final long MURMUR2_SEED = 0xC70F6907L;

    private final PythonExecutionService executionService;
    private final PythonWorkspaceRepository workspaceRepository;
    /** 断点缓存：workspaceId -> 断点行号列表 */
    private final Map<String, List<Integer>> breakpointCache = new ConcurrentHashMap<>();
    /** Kernel 临时目录缓存：workspaceId -> ipykernel tmp 目录（不随每次调试清除，保持 sourcePath 稳定） */
    private final Map<String, String> kernelTmpDirCache = new ConcurrentHashMap<>();
    /** 内部 probe 消息 ID 集合：这些 execute_reply 不应被当作调试执行完成推给前端 */
    private final java.util.Set<String> internalMsgIds = java.util.Collections.newSetFromMap(new ConcurrentHashMap<>());
    /** 活跃调试 SSE emitter：workspaceId -> 当前 emitter，新调试到来时强制结束旧会话 */
    private final Map<String, SseEmitter> activeDebugEmitters = new ConcurrentHashMap<>();
    /** debugCell 发出的 execute_request msgId：只有它的 execute_reply 才推 execution_done */
    private final Map<String, String> debugCellMsgIds = new ConcurrentHashMap<>();
    /** 上次调试使用的 KernelClient 引用：检测 Kernel 是否已重启，变化时清 tmpDirCache */
    private final Map<String, KernelClient> lastKernelClients = new ConcurrentHashMap<>();


    public PythonDebugService(PythonExecutionService executionService,
                               PythonWorkspaceRepository workspaceRepository) {
        this.executionService = executionService;
        this.workspaceRepository = workspaceRepository;
    }

    /**
     * 初始化调试会话（与 JupyterLab session.ts start() 一致）：
     * WebSocket: initialize → attach → 监听 IOPub debug_event → 推 debug_ready
     */
    public void initDebugSession(String workspaceId, SseEmitter emitter) throws Exception {
        KernelClient client = getClient(workspaceId);

        // 强制结束旧调试会话：直接推 session_expired 给旧 SSE，前端自动结束
        SseEmitter oldEmitter = activeDebugEmitters.put(workspaceId, emitter);
        if (oldEmitter != null && oldEmitter != emitter) {
            try {
                oldEmitter.send(SseEmitter.event().name("session_expired").data("{\"reason\":\"new_session\"}"));
                oldEmitter.complete();
            } catch (Exception ignored) { /* 旧连接可能已断开，忽略 */ }
            log.info("强制结束旧调试会话: workspaceId={}", workspaceId);
        }

        // 清理残留 callback（不清 tmpDirCache，保持 sourcePath hash 稳定）
        client.clearAllCallbacks();

        // 发 disconnect 不等回复（直接重置 debugpy 状态，不管旧会话是否存在）
        try {
            Map<String, Object> disconnectArgs = new HashMap<>();
            disconnectArgs.put("restart", false);
            disconnectArgs.put("terminateDebuggee", false);
            sendDebugRequest(client, "disconnect", disconnectArgs);
            Thread.sleep(300); // 给 debugpy 短暂时间处理 disconnect
            client.clearAllCallbacks(); // 清掉 disconnect 可能残留的 reply callback
        } catch (Exception e) {
            log.info("disconnect 旧会话跳过: {}", e.getMessage());
        }

        // 注册全局监听器（转发 debug_event、stream、execute_reply 等消息给前端）
        client.setGlobalMessageListener(json -> {
            try {
                JSONObject header = json.getJSONObject("header");
                if (header == null) return;
                String msgType = header.getString("msg_type");
                if (msgType == null) return;

                // debug_event：推调试状态
                if (KernelMessage.DEBUG_EVENT.equals(msgType)) {
                    JSONObject content = json.getJSONObject("content");
                    String eventType = content != null ? content.getString("event") : "";
                    log.info("[iopub debug_event] 收到: {}", eventType);
                    if ("stopped".equals(eventType) || "continued".equals(eventType)
                            || "terminated".equals(eventType) || "thread".equals(eventType)
                            || "output".equals(eventType) || "process".equals(eventType)) {
                        JSONObject wrapped = new JSONObject();
                        wrapped.put("event", eventType);
                        wrapped.put("body", content.get("body"));
                        sendSseData(emitter, "debug_event", JSON.toJSONString(wrapped));
                    }
                    if ("stopped".equals(eventType)) {
                        Object bodyObj = content != null ? content.get("body") : null;
                        int threadId = 1;
                        if (bodyObj instanceof JSONObject) {
                            Integer tid = ((JSONObject) bodyObj).getInteger("threadId");
                            if (tid != null) threadId = tid;
                        }
                        final int finalThreadId = threadId;
                        final KernelClient asyncClient = client;
                        new Thread(() -> {
                            try {
                                pushDebugState(workspaceId, asyncClient, finalThreadId, emitter);
                            } catch (Exception ex) {
                                log.warn("后台推送 debug_state 失败: {}", ex.getMessage());
                            }
                        }, "debug-state-pusher-" + workspaceId).start();
                    }
                }

                // stream（print 输出）
                if (KernelMessage.STREAM.equals(msgType)) {
                    JSONObject content = json.getJSONObject("content");
                    String text = content != null ? content.getString("text") : "";
                    if (text != null && !text.isBlank()) {
                        JSONObject out = new JSONObject();
                        out.put("text", text);
                        sendSseData(emitter, "output", JSON.toJSONString(out));
                    }
                }

                // execute_result（表达式结果）
                if (KernelMessage.EXECUTE_RESULT.equals(msgType)) {
                    JSONObject content = json.getJSONObject("content");
                    com.alibaba.fastjson2.JSONObject data = content != null ? content.getJSONObject("data") : null;
                    String text = data != null ? data.getString("text/plain") : null;
                    if (text != null && !text.isBlank()) {
                        JSONObject out = new JSONObject();
                        out.put("text", text);
                        sendSseData(emitter, "output", JSON.toJSONString(out));
                    }
                }

                // execute_reply：只处理 debugCell 发出的那条 execute_request 的回复
                if (KernelMessage.EXECUTE_REPLY.equals(msgType)) {
                    JSONObject parentHeader = json.getJSONObject("parent_header");
                    String parentMsgId = parentHeader != null ? parentHeader.getString("msg_id") : null;
                    String expectedMsgId = debugCellMsgIds.get(workspaceId);
                    if (expectedMsgId == null || !expectedMsgId.equals(parentMsgId)) {
                        // 不是本次调试的 execute_reply（残留旧回复或 probe 回复），直接忽略
                        log.debug("[debug] 忽略非调试 execute_reply: parentMsgId={}, expected={}", parentMsgId, expectedMsgId);
                        return;
                    }
                    debugCellMsgIds.remove(workspaceId); // 消费后清除
                    JSONObject content = json.getJSONObject("content");
                    String status = content != null ? content.getString("status") : "";
                    log.info("[debug] execute_reply status={}", status);
                    if ("error".equals(status)) {
                        String ename = content.getString("ename");
                        String evalue = content.getString("evalue");
                        JSONObject out = new JSONObject();
                        out.put("text", ename + ": " + evalue);
                        sendSseData(emitter, "error", JSON.toJSONString(out));
                    }
                    sendSseData(emitter, "execution_done", "{\"status\":\"" + status + "\"}");
                }

            } catch (Exception e) {
                log.error("处理调试消息出错", e);
            }
        });

        // Step 1: initialize
        Map<String, Object> initArgs = new HashMap<>();
        initArgs.put("clientID", "bigprime-ide");
        initArgs.put("clientName", "BigPrime IDE");
        initArgs.put("adapterID", "python");
        initArgs.put("pathFormat", "path");
        initArgs.put("linesStartAt1", true);
        initArgs.put("columnsStartAt1", true);
        initArgs.put("supportsVariableType", true);
        initArgs.put("supportsVariablePaging", true);
        initArgs.put("supportsRunInTerminalRequest", true);
        JSONObject initReply = sendDebugRequestAndWait(client, "initialize", initArgs, 6000);
        log.info("调试 initialize 回复: success={}", initReply != null ? initReply.getBoolean("success") : "null");

        // Step 2: attach
        JSONObject attachReply = sendDebugRequestAndWait(client, "attach", new HashMap<>(), 6000);
        boolean attachOk = attachReply != null && Boolean.TRUE.equals(attachReply.getBoolean("success"));
        log.info("调试 attach 回复: success={}", attachOk);
        if (!attachOk) {
            if (attachReply != null) {
                String attachMsg = attachReply.getString("message");
                if (attachMsg != null && attachMsg.contains("Session is already started")) {
                    log.info("debugpy Session 已存在，复用");
                } else {
                    log.warn("attach 失败: {}，继续尝试", attachMsg);
                }
            } else {
                log.warn("attach 等待超时，继续执行");
            }
        }

        // 同步获取 Kernel 临时目录
        try {
            String dir = fetchKernelTmpDirSync(workspaceId, client);
            log.info("调试会话 tmpDir 就绪: workspaceId={}, dir={}", workspaceId, dir);
        } catch (Exception e) {
            log.warn("获取 Kernel tmp 目录失败: {}", e.getMessage());
        }

        sendSseData(emitter, "debug_ready", "{\"status\":\"ready\"}");
        // 注意：不在此处 clearAllCallbacks，debug_ready 推出后前端立即发 debugRun，
        // debugCell 里会注册 setBreakpoints/configurationDone 的 callback，
        // 如果此处清空会产生竞争导致 callback 被误删、setBreakpoints 超时。
        log.info("调试会话初始化完成: workspaceId={}", workspaceId);

        // SSE 结束时自动从活跃表中移除（连接正常关闭、超时、客户端断开均触发）
        emitter.onCompletion(() -> activeDebugEmitters.remove(workspaceId, emitter));
        emitter.onTimeout(() -> activeDebugEmitters.remove(workspaceId, emitter));
        emitter.onError(e -> activeDebugEmitters.remove(workspaceId, emitter));
    }

    /**
     * 设置断点 —— 仅更新内存缓存。
     */
    public Map<String, Object> setBreakpoints(String workspaceId, String filename, List<Integer> lines) {
        breakpointCache.put(workspaceId, new ArrayList<>(lines));
        log.info("断点已缓存: workspaceId={}, file={}, lines={}", workspaceId, filename, lines);
        return Map.of("status", "cached", "lines", lines);
    }

    /**
     * 以调试模式执行代码（纯 WebSocket，与 JupyterLab 一致）：
     * 写源文件 → setBreakpoints → configurationDone → execute_request
     */
    public void debugCell(String workspaceId, String code, String filename) throws Exception {
        KernelClient client = getClient(workspaceId);
        List<Integer> cachedLines = breakpointCache.getOrDefault(workspaceId, List.of());

        // 获取 kernel tmpDir
        String tmpDir = kernelTmpDirCache.get(workspaceId);
        if (tmpDir == null) tmpDir = fetchKernelTmpDirSync(workspaceId, client);

        // 计算 sourcePath
        long hash = murmur2x86(code, MURMUR2_SEED);
        String sourcePath = tmpDir + java.io.File.separator + hash + ".py";
        log.info("debugCell sourcePath={}, lines={}", sourcePath, cachedLines);

        // 写入源文件
        java.io.File srcFile = new java.io.File(sourcePath);
        if (!srcFile.getParentFile().exists()) srcFile.getParentFile().mkdirs();
        java.nio.file.Files.writeString(srcFile.toPath(), code,
                java.nio.charset.StandardCharsets.UTF_8,
                java.nio.file.StandardOpenOption.CREATE,
                java.nio.file.StandardOpenOption.TRUNCATE_EXISTING);
        log.info("Java 写入源文件: path={}, size={}bytes", sourcePath, srcFile.length());

        // 等待 Kernel 空闲（避免上次执行未完全结束时 DAP 命令被忽略）
        Thread.sleep(300);

        // setBreakpoints（WebSocket）
        if (!cachedLines.isEmpty()) {
            List<Map<String, Object>> bps = cachedLines.stream()
                    .map(l -> Map.<String, Object>of("line", l))
                    .collect(java.util.stream.Collectors.toList());
            Map<String, Object> bpArgs = new HashMap<>();
            bpArgs.put("source", Map.of("path", sourcePath));
            bpArgs.put("breakpoints", bps);
            bpArgs.put("sourceModified", false);
            JSONObject bpReply = sendDebugRequestAndWait(client, "setBreakpoints", bpArgs, 8000);
            if (bpReply == null) {
                // 超时重试一次
                log.warn("setBreakpoints 超时，500ms 后重试");
                Thread.sleep(500);
                bpReply = sendDebugRequestAndWait(client, "setBreakpoints", bpArgs, 8000);
            }
            log.info("WebSocket setBreakpoints 回复: {}", bpReply);
        }

        // configurationDone（WebSocket）
        JSONObject cdReply = sendDebugRequestAndWait(client, "configurationDone", new HashMap<>(), 5000);
        log.info("WebSocket configurationDone 回复: {}", cdReply);

        // execute_request 触发执行（记录 msgId，globalMessageListener 只响应它的 execute_reply）
        KernelMessage execMsg = KernelMessage.buildExecuteRequest(client.getSessionId(), code);
        debugCellMsgIds.put(workspaceId, execMsg.getHeader().getMsgId());
        client.sendMessage(execMsg);
        log.info("debugCell execute_request 已发送: workspaceId={}, msgId={}", workspaceId, execMsg.getHeader().getMsgId());
    }

    /** 继续执行（continue） */
    public void continueExecution(String workspaceId, int threadId) throws Exception {
        KernelClient client = getClient(workspaceId);
        Map<String, Object> args = new HashMap<>();
        args.put("threadId", threadId);
        sendDebugRequestAndWait(client, "continue", args, 5000);
        log.info("continue 已确认: workspaceId={}", workspaceId);
    }

    /** 单步执行（next，步过） */
    public void stepOver(String workspaceId, int threadId) throws Exception {
        KernelClient client = getClient(workspaceId);
        Map<String, Object> args = new HashMap<>();
        args.put("threadId", threadId);
        sendDebugRequestAndWait(client, "next", args, 5000);
        log.info("next 已确认: workspaceId={}", workspaceId);
    }

    /** 步入（stepIn） */
    public void stepIn(String workspaceId, int threadId) throws Exception {
        KernelClient client = getClient(workspaceId);
        Map<String, Object> args = new HashMap<>();
        args.put("threadId", threadId);
        sendDebugRequestAndWait(client, "stepIn", args, 5000);
        log.info("stepIn 已确认: workspaceId={}", workspaceId);
    }

    /** 步出（stepOut） */
    public void stepOut(String workspaceId, int threadId) throws Exception {
        KernelClient client = getClient(workspaceId);
        Map<String, Object> args = new HashMap<>();
        args.put("threadId", threadId);
        sendDebugRequestAndWait(client, "stepOut", args, 5000);
        log.info("stepOut 已确认: workspaceId={}", workspaceId);
    }

    /** 获取变量（scopes → variables）：完整 DAP 二步查询 */
    public Map<String, Object> getVariables(String workspaceId, int frameId) throws Exception {
        KernelClient client = getClient(workspaceId);

        // Step1: scopes(frameId)
        Map<String, Object> scopesArgs = new HashMap<>();
        scopesArgs.put("frameId", frameId);
        JSONObject scopesReply = sendDebugRequestAndWait(client, "scopes", scopesArgs, 5000);
        log.info("scopes 回复: {}", scopesReply);

        com.alibaba.fastjson2.JSONArray scopesArr = null;
        if (scopesReply != null) {
            JSONObject body = scopesReply.getJSONObject("body");
            scopesArr = body != null ? body.getJSONArray("scopes") : scopesReply.getJSONArray("scopes");
        }
        if (scopesArr == null || scopesArr.isEmpty()) {
            log.warn("scopes 为空，返回空变量列表");
            return Map.of("scopes", List.of());
        }

        // 取 Locals scope（第一个）
        JSONObject firstScope = scopesArr.getJSONObject(0);
        int variablesRef = firstScope.getIntValue("variablesReference");
        log.info("Locals variablesReference={}", variablesRef);
        if (variablesRef == 0) {
            return Map.of("scopes", List.of());
        }

        // Step2: variables(variablesReference)
        Map<String, Object> varsArgs = new HashMap<>();
        varsArgs.put("variablesReference", variablesRef);
        JSONObject varsReply = sendDebugRequestAndWait(client, "variables", varsArgs, 5000);
        log.info("variables 回复: {}", varsReply);

        com.alibaba.fastjson2.JSONArray variables = null;
        if (varsReply != null) {
            JSONObject varsBody = varsReply.getJSONObject("body");
            variables = varsBody != null ? varsBody.getJSONArray("variables") : varsReply.getJSONArray("variables");
        }

        java.util.List<Map<String, Object>> scopeList = new java.util.ArrayList<>();
        Map<String, Object> localsScope = new java.util.LinkedHashMap<>(firstScope.toJavaObject(Map.class));
        localsScope.put("variables", variables != null ? variables : List.of());
        scopeList.add(localsScope);
        return Map.of("scopes", scopeList);
    }

    /** 获取调用栈 */
    public Map<String, Object> getStackTrace(String workspaceId, int threadId) throws Exception {
        KernelClient client = getClient(workspaceId);
        Map<String, Object> args = new HashMap<>();
        args.put("threadId", threadId);
        JSONObject reply = sendDebugRequestAndWait(client, "stackTrace", args, 5000);
        log.info("stackTrace 回复: {}", reply);
        return reply != null ? reply.toJavaObject(Map.class) : new HashMap<>();
    }

    /** 停止调试 */
    public void stopDebug(String workspaceId) throws Exception {
        KernelClient client = executionService.getKernelClient(workspaceId);
        if (client != null) {
            // 注意：不发送 DAP disconnect，在 Windows 上会触发 ipykernel disconnect_tcp_socket 导致 ZMQError
            // 只清除全局监听器，让 debugpy 保持当前状态以便下次复用
            client.setGlobalMessageListener(null);
            log.info("调试会话已关闭监听: workspaceId={}", workspaceId);
        }
    }

    // ==================== 私有方法 ====================

    private KernelClient getClient(String workspaceId) {
        KernelClient client = executionService.getKernelClient(workspaceId);
        if (client == null || !client.isConnected()) {
            throw new RuntimeException("Kernel 未启动，请先启动 Kernel");
        }
        // 检测 Kernel 是否已重启（client 对象变化），变化时清除 tmpDirCache 和 debugCellMsgId
        KernelClient last = lastKernelClients.get(workspaceId);
        if (last != null && last != client) {
            kernelTmpDirCache.remove(workspaceId);
            debugCellMsgIds.remove(workspaceId);
            log.info("检测到 Kernel 已重启，清除 tmpDirCache: workspaceId={}", workspaceId);
        }
        lastKernelClients.put(workspaceId, client);
        return client;
    }

    private void sendDebugRequest(KernelClient client, String command, Map<String, Object> args) throws Exception {
        KernelMessage msg = KernelMessage.buildDebugRequest(client.getSessionId(), command, args);
        client.sendMessage(msg);
        log.debug("发送调试命令: {}", command);
    }

    /**
     * 发送 debug_request 并等待 debug_reply。
     * callback 通过 parentMsgId（精确）或 content.command（降级）路由，每条命令独立持有自己的 future，互不干扰。
     */
    private JSONObject sendDebugRequestAndWait(KernelClient client, String command,
                                               Map<String, Object> args, long timeoutMs) throws Exception {
        CompletableFuture<JSONObject> future = new CompletableFuture<>();
        KernelMessage msg = KernelMessage.buildDebugRequest(client.getSessionId(), command, args);
        String msgId = msg.getHeader().getMsgId();
        // callback key 格式：msgId:command，KernelClient 通过 parentMsgId 或命令名路由时均可命中
        String callbackKey = msgId + ":" + command;
        client.registerCallback(callbackKey, json -> {
            String msgType = json.getJSONObject("header") != null
                    ? json.getJSONObject("header").getString("msg_type") : "";
            if (KernelMessage.DEBUG_REPLY.equals(msgType)) {
                if (!future.isDone()) future.complete(json.getJSONObject("content"));
                client.removeCallback(callbackKey);
                client.removeCallback(msgId);
            }
        });
        // 同时注册原始 msgId 的 callback，parentMsgId 精确匹配时命中
        client.registerCallback(msgId, json -> {
            String msgType = json.getJSONObject("header") != null
                    ? json.getJSONObject("header").getString("msg_type") : "";
            if (KernelMessage.DEBUG_REPLY.equals(msgType)) {
                if (!future.isDone()) future.complete(json.getJSONObject("content"));
                client.removeCallback(msgId);
                client.removeCallback(callbackKey);
            }
        });
        client.sendMessage(msg);
        try {
            return future.get(timeoutMs, TimeUnit.MILLISECONDS);
        } catch (java.util.concurrent.TimeoutException e) {
            client.removeCallback(callbackKey);
            client.removeCallback(msgId);
            log.warn("调试命令 {} 等待回复超时 ({}ms)", command, timeoutMs);
            return null;
        }
    }

    /**
     * 后台异步推送 debug_state：stackTrace + scopes + variables。
     * 在 stopped 事件触发后由后台线程调用，避免前端发 HTTP 请求时 control channel 延迟超时。
     */
    private void pushDebugState(String workspaceId, KernelClient client, int threadId, SseEmitter emitter) {
        try {
            // Step1: stackTrace
            Map<String, Object> stArgs = new HashMap<>();
            stArgs.put("threadId", threadId);
            JSONObject stReply = sendDebugRequestAndWait(client, "stackTrace", stArgs, 3000);
            log.info("[debug_state] stackTrace 回复: {}", stReply);

            com.alibaba.fastjson2.JSONArray frames = null;
            if (stReply != null) {
                JSONObject stBody = stReply.getJSONObject("body");
                frames = stBody != null ? stBody.getJSONArray("stackFrames") : stReply.getJSONArray("stackFrames");
            }
            if (frames == null || frames.isEmpty()) {
                log.warn("[debug_state] stackTrace 为空，跳过变量查询");
                JSONObject state = new JSONObject();
                state.put("stackFrames", List.of());
                state.put("scopes", List.of());
                sendSseData(emitter, "debug_state", JSON.toJSONString(state));
                return;
            }

            JSONObject topFrame = frames.getJSONObject(0);
            int frameId = topFrame != null ? topFrame.getIntValue("id") : 0;

            // Step2: scopes
            Map<String, Object> scopesArgs = new HashMap<>();
            scopesArgs.put("frameId", frameId);
            JSONObject scopesReply = sendDebugRequestAndWait(client, "scopes", scopesArgs, 3000);
            log.info("[debug_state] scopes 回复: {}", scopesReply);

            com.alibaba.fastjson2.JSONArray scopesArr = null;
            if (scopesReply != null) {
                JSONObject scopesBody = scopesReply.getJSONObject("body");
                scopesArr = scopesBody != null ? scopesBody.getJSONArray("scopes") : scopesReply.getJSONArray("scopes");
            }
            if (scopesArr == null || scopesArr.isEmpty()) {
                JSONObject state = new JSONObject();
                state.put("stackFrames", frames);
                state.put("scopes", List.of());
                sendSseData(emitter, "debug_state", JSON.toJSONString(state));
                return;
            }

            JSONObject firstScope = scopesArr.getJSONObject(0);
            int variablesRef = firstScope != null ? firstScope.getIntValue("variablesReference") : 0;

            // Step3: variables（variablesRef > 0 时才查）
            com.alibaba.fastjson2.JSONArray variables = null;
            if (variablesRef > 0) {
                Map<String, Object> varsArgs = new HashMap<>();
                varsArgs.put("variablesReference", variablesRef);
                JSONObject varsReply = sendDebugRequestAndWait(client, "variables", varsArgs, 3000);
                log.info("[debug_state] variables 回复: {}", varsReply);
                if (varsReply != null) {
                    JSONObject varsBody = varsReply.getJSONObject("body");
                    variables = varsBody != null ? varsBody.getJSONArray("variables") : varsReply.getJSONArray("variables");
                }
            }

            // 组装 scope（含 variables 字段）
            java.util.List<Map<String, Object>> scopeList = new java.util.ArrayList<>();
            Map<String, Object> localsScope = new java.util.LinkedHashMap<>(firstScope.toJavaObject(Map.class));
            localsScope.put("variables", variables != null ? variables : List.of());
            scopeList.add(localsScope);

            JSONObject state = new JSONObject();
            state.put("stackFrames", frames);
            state.put("scopes", scopeList);
            sendSseData(emitter, "debug_state", JSON.toJSONString(state));
            log.info("[debug_state] 推送完成: workspaceId={}, frames={}, vars={}",
                    workspaceId, frames.size(), variables != null ? variables.size() : 0);
        } catch (Exception e) {
            log.warn("[debug_state] 查询失败: {}", e.getMessage());
        }
    }

    private void sendSseData(SseEmitter emitter, String event, String data) {
        try {
            emitter.send(SseEmitter.event().name(event).data(data));
        } catch (IOException e) {
            log.warn("SSE 发送失败，客户端可能已断开");
        } catch (IllegalStateException e) {
            // SseEmitter 已完成（前端主动关闭 SSE 连接），忽略即可
            log.debug("SSE 已完成，忽略 {} 事件", event);
        }
    }

    private void fetchKernelTmpDirAsync(String workspaceId, KernelClient client) {
        new Thread(() -> {
            try {
                String dir = fetchKernelTmpDirSync(workspaceId, client);
                log.info("Kernel 临时目录获取完成: workspaceId={}, dir={}", workspaceId, dir);
            } catch (Exception e) {
                log.warn("Kernel 临时目录获取失败: {}", e.getMessage());
            }
        }, "kernel-tmpdir-fetcher-" + workspaceId).start();
    }

    private String fetchKernelTmpDirSync(String workspaceId, KernelClient client) throws Exception {
        String cached = kernelTmpDirCache.get(workspaceId);
        if (cached != null) return cached;

        String probeCode = "from ipykernel.compiler import get_tmp_directory; print('__IPYKERNEL_TMPDIR__:' + get_tmp_directory())";
        CompletableFuture<String> future = new CompletableFuture<>();
        KernelMessage probeMsg = KernelMessage.buildExecuteRequest(client.getSessionId(), probeCode);
        // 标记为内部消息，globalMessageListener 会跳过它的 execute_reply，不推 execution_done
        internalMsgIds.add(probeMsg.getHeader().getMsgId());
        client.registerCallback(probeMsg.getHeader().getMsgId(), json -> {
            try {
                String msgType = json.getJSONObject("header").getString("msg_type");
                if (KernelMessage.STREAM.equals(msgType)) {
                    String text = json.getJSONObject("content").getString("text");
                    if (text != null && text.contains("__IPYKERNEL_TMPDIR__:")) {
                        String dir = text.substring(text.indexOf("__IPYKERNEL_TMPDIR__:") + 21).trim();
                        dir = dir.split("[\r\n]")[0].trim();
                        kernelTmpDirCache.put(workspaceId, dir);
                        future.complete(dir);
                        client.removeCallback(probeMsg.getHeader().getMsgId());
                    }
                } else if (KernelMessage.EXECUTE_REPLY.equals(msgType) || KernelMessage.ERROR.equals(msgType)) {
                    if (!future.isDone()) future.completeExceptionally(new RuntimeException("获取 tmp 目录失败"));
                    client.removeCallback(probeMsg.getHeader().getMsgId());
                }
            } catch (Exception e) {
                future.completeExceptionally(e);
            }
        });
        client.sendMessage(probeMsg);
        try {
            return future.get(5, TimeUnit.SECONDS);
        } catch (Exception e) {
            log.warn("获取 Kernel tmp 目录超时，回退默认路径");
            String fallback = System.getenv("TEMP") + java.io.File.separator + "ipykernel_unknown";
            kernelTmpDirCache.put(workspaceId, fallback);
            return fallback;
        }
    }

    private static long murmur2x86(String data, long seed) {
        final long M = 0x5BD1E995L;
        byte[] bytes = data.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        int length = bytes.length;
        long h = (seed ^ length) & 0xFFFFFFFFL;
        int roundedEnd = length & 0xFFFFFFFC;
        for (int i = 0; i < roundedEnd; i += 4) {
            long k = ((bytes[i] & 0xFFL))
                    | ((bytes[i + 1] & 0xFFL) << 8)
                    | ((bytes[i + 2] & 0xFFL) << 16)
                    | ((bytes[i + 3] & 0xFFL) << 24);
            k = (k * M) & 0xFFFFFFFFL;
            k ^= (k >> 24) & 0xFFFFFFFFL;
            k = (k * M) & 0xFFFFFFFFL;
            h = (h * M) & 0xFFFFFFFFL;
            h ^= k;
        }
        int val = length & 0x03;
        long k = 0;
        if (val == 3) k = (bytes[roundedEnd + 2] & 0xFFL) << 16;
        if (val == 2 || val == 3) k |= (bytes[roundedEnd + 1] & 0xFFL) << 8;
        if (val >= 1) { k |= (bytes[roundedEnd] & 0xFFL); h ^= k; h = (h * M) & 0xFFFFFFFFL; }
        h ^= (h >> 13);
        h = (h * M) & 0xFFFFFFFFL;
        h ^= (h >> 15);
        return h;
    }
}
