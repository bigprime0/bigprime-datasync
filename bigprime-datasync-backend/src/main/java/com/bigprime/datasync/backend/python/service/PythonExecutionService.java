package com.bigprime.datasync.backend.python.service;

import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONObject;
import com.bigprime.datasync.backend.python.config.PythonProperties;
import com.bigprime.datasync.backend.python.kernel.KernelClient;
import com.bigprime.datasync.backend.python.kernel.KernelGatewayManager;
import com.bigprime.datasync.backend.python.kernel.KernelMessage;
import com.bigprime.datasync.backend.python.service.repository.PythonWorkspaceRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

/**
 * Python 代码执行服务
 * 通过 KernelGateway REST API 创建 Kernel，通过 WebSocket 执行代码并流式返回输出
 *
 * @author bigprime
 * @version 1.0
 */
@Slf4j
@Service
public class PythonExecutionService {

    private final KernelGatewayManager gatewayManager;
    private final PythonWorkspaceRepository workspaceRepository;
    private final RestTemplate restTemplate;
    private final PythonProperties pythonProperties;
    private PythonLspService lspService;

    public PythonExecutionService(KernelGatewayManager gatewayManager,
                                   PythonWorkspaceRepository workspaceRepository,
                                   PythonProperties pythonProperties) {
        this.gatewayManager = gatewayManager;
        this.workspaceRepository = workspaceRepository;
        this.restTemplate = new RestTemplate();
        this.pythonProperties = pythonProperties;
    }

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    public void setLspService(PythonLspService lspService) {
        this.lspService = lspService;
    }

    /**
     * workspaceId -> KernelClient
     */
    private final Map<String, KernelClient> kernelClients = new ConcurrentHashMap<>();

    /**
     * 为 Workspace 创建 Kernel（通过 KernelGateway REST API）
     * 若已有连接且连接正常，直接返回现有 kernelId；否则停止旧的再新建
     *
     * @return kernelId
     */
    public String createKernel(String workspaceId) throws Exception {
        if (!gatewayManager.isRunning()) {
            throw new RuntimeException("KernelGateway 未运行，请先启动");
        }

        // 如果内存中已有连接正常的 client，直接返回
        KernelClient existing = kernelClients.get(workspaceId);
        if (existing != null && existing.isConnected()) {
            String existingKernelId = getKernelIdFromWorkspace(workspaceId);
            log.info("Kernel 已运行，跳过重建: workspaceId={}, kernelId={}", workspaceId, existingKernelId);
            return existingKernelId;
        }

        // 停止旧的（如有）
        stopKernel(workspaceId);

        String url = gatewayManager.getGatewayHttpBaseUrl() + "/api/kernels";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        Map<String, String> body = new HashMap<>();
        body.put("name", "python3");

        HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);
        String response = restTemplate.postForObject(url, request, String.class);

        JSONObject kernelInfo = JSON.parseObject(response);
        String kernelId = kernelInfo.getString("id");

        log.info("创建 Kernel 成功: workspaceId={}, kernelId={}", workspaceId, kernelId);

        // 建立 WebSocket 连接
        connectKernelClient(workspaceId, kernelId);

        // 更新数据库
        String gatewayUrl = gatewayManager.getGatewayWsBaseUrl();
        workspaceRepository.updateKernelInfo(workspaceId, kernelId, gatewayUrl);

        // 异步确保 pylsp 已安装（不阻塞 Kernel 启动流程）
        if (lspService != null) {
            lspService.ensurePylspInstalled(workspaceId);
        }

        return kernelId;
    }

    /**
     * 停止 Workspace 的 Kernel
     */
    public void stopKernel(String workspaceId) {
        KernelClient client = kernelClients.get(workspaceId);
        if (client != null) {
            String kernelId = getKernelIdFromWorkspace(workspaceId);
            client.close();
            kernelClients.remove(workspaceId);

            if (kernelId != null) {
                try {
                    String url = gatewayManager.getGatewayHttpBaseUrl() + "/api/kernels/" + kernelId;
                    restTemplate.delete(url);
                } catch (Exception e) {
                    log.warn("删除 Kernel 时出错: {}", kernelId, e);
                }
            }

            workspaceRepository.clearKernelInfo(workspaceId);
            log.info("停止 Kernel 成功: workspaceId={}", workspaceId);
        }
    }

    /**
     * 执行代码（SSE 流式返回）
     *
     * @param workspaceId Workspace ID
     * @param code        要执行的代码
     * @param emitter     SSE 发射器，用于向前端推送输出
     */
    public void executeCode(String workspaceId, String code, SseEmitter emitter) {
        KernelClient client = getOrCreateClientIfNeeded(workspaceId);
        if (client == null) {
            sendSseError(emitter, "Kernel 未启动，请先启动 Kernel");
            return;
        }

        KernelMessage execMsg = KernelMessage.buildExecuteRequest(client.getSessionId(), code);
        String msgId = execMsg.getHeader().getMsgId();

        CountDownLatch latch = new CountDownLatch(1);

        client.registerCallback(msgId, json -> {
            try {
                String msgType = json.getJSONObject("header").getString("msg_type");
                JSONObject content = json.getJSONObject("content");

                switch (msgType) {
                    case KernelMessage.STREAM -> {
                        // print 输出
                        String text = content.getString("text");
                        sendSseData(emitter, "stream", text);
                    }
                    case KernelMessage.EXECUTE_RESULT -> {
                        // 表达式结果
                        JSONObject data = content.getJSONObject("data");
                        String result = data != null ? data.getString("text/plain") : "";
                        sendSseData(emitter, "result", result);
                    }
                    case KernelMessage.ERROR -> {
                        // 异常
                        String ename = content.getString("ename");
                        String evalue = content.getString("evalue");
                        List<String> traceback = content.getList("traceback", String.class);
                        Map<String, Object> errData = new HashMap<>();
                        errData.put("ename", ename);
                        errData.put("evalue", evalue);
                        errData.put("traceback", traceback);
                        sendSseData(emitter, "error", JSON.toJSONString(errData));
                        latch.countDown();
                    }
                    case KernelMessage.EXECUTE_REPLY -> {
                        // 执行完成
                        String status = content.getString("status");
                        sendSseData(emitter, "done", status);
                        latch.countDown();
                    }
                    default -> {
                        // 忽略其他消息
                    }
                }
            } catch (Exception e) {
                log.error("处理执行结果出错", e);
                latch.countDown();
            }
        });

        try {
            client.sendMessage(execMsg);
            // 最长等待 5 分钟
            boolean finished = latch.await(5, TimeUnit.MINUTES);
            if (!finished) {
                sendSseData(emitter, "timeout", "执行超时（5分钟）");
            }
        } catch (Exception e) {
            log.error("执行代码出错", e);
            sendSseError(emitter, "执行代码出错: " + e.getMessage());
        } finally {
            try {
                emitter.complete();
            } catch (Exception ignored) {
            }
        }
    }

    /**
     * 获取当前 Workspace 已安装的 pip 包列表。
     * <ul>
     *   <li>当 KernelGateway 部署在本机（localhost / 127.x / ::1 / 本机网卡IP）时，
     *       直接通过 {@link ProcessBuilder} 执行 {@code python -m pip list}，响应快且不依赖 Kernel 状态。</li>
     *   <li>当 KernelGateway 部署在远程机器时，通过 Kernel 的 execute_request 执行
     *       pip list 命令，确保读取到的是实际执行环境的包列表。</li>
     * </ul>
     *
     * @return [{"name":"...","version":"..."},...]
     */
    public List<Map<String, String>> listPackages(String workspaceId) throws Exception {
        if (isGatewayLocal()) {
            return listPackagesLocal();
        } else {
            return listPackagesViaKernel(workspaceId);
        }
    }

    /**
     * 判断 KernelGateway 是否部署在本机。
     * 满足以下任意条件即认为是本机：
     * <ul>
     *   <li>host 为 localhost</li>
     *   <li>host 为 127.x.x.x 或 ::1（IPv4/IPv6 loopback）</li>
     *   <li>host 与本机任意网卡 IP 相同</li>
     * </ul>
     */
    private boolean isGatewayLocal() {
        String host = pythonProperties.getKernelGateway().getHost();
        if (host == null || host.isBlank()) return true;
        // loopback 名称/地址
        if ("localhost".equalsIgnoreCase(host) || "127.0.0.1".equals(host) || "::1".equals(host)
                || host.startsWith("127.")) {
            return true;
        }
        // 与本机所有网卡 IP 对比
        try {
            java.net.InetAddress target = java.net.InetAddress.getByName(host);
            java.util.Enumeration<java.net.NetworkInterface> ifaces =
                    java.net.NetworkInterface.getNetworkInterfaces();
            if (ifaces != null) {
                while (ifaces.hasMoreElements()) {
                    java.net.NetworkInterface iface = ifaces.nextElement();
                    java.util.Enumeration<java.net.InetAddress> addrs = iface.getInetAddresses();
                    while (addrs.hasMoreElements()) {
                        if (addrs.nextElement().equals(target)) {
                            return true;
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.warn("isGatewayLocal 判断失败，降级为本机模式: host={}, err={}", host, e.getMessage());
            return true;
        }
        return false;
    }

    /**
     * 本机模式：通过 ProcessBuilder 直接执行 pip list，不依赖 Kernel 状态
     */
    private List<Map<String, String>> listPackagesLocal() throws Exception {
        String pythonExe = resolvePythonExecutable();
        ProcessBuilder pb = new ProcessBuilder(pythonExe, "-m", "pip", "list", "--format=json", "--root-user-action=ignore");
        pb.redirectErrorStream(false);
        Process process = pb.start();

        String jsonStr;
        try (java.io.InputStream is = process.getInputStream()) {
            jsonStr = new String(is.readAllBytes(), java.nio.charset.StandardCharsets.UTF_8).trim();
        }
        boolean finished = process.waitFor(15, TimeUnit.SECONDS);
        if (!finished) {
            process.destroyForcibly();
            log.warn("pip list (local) 超时");
            return List.of();
        }
        return parsePipListJson(jsonStr);
    }

    /**
     * 远程模式：通过 Kernel execute_request 执行 pip list，读取远程实际执行环境的包列表。
     * 使用与用户 Workspace 相同的 Kernel（复用 kernelClients 中已有连接），
     * 通过专用 msgId 回调隔离，不影响用户正在执行的代码。
     */
    private List<Map<String, String>> listPackagesViaKernel(String workspaceId) {
        KernelClient client = kernelClients.get(workspaceId);
        if (client == null || !client.isConnected()) {
            log.warn("pip list (remote) Kernel 未连接，workspaceId={}", workspaceId);
            return List.of();
        }

        // 在 Kernel 中执行 pip list --format=json，通过 subprocess 调用保证输出纯净
        String code = "import subprocess as _s, sys as _sys\n"
                + "_r = _s.run([_sys.executable, '-m', 'pip', 'list', '--format=json'],"
                + " capture_output=True, text=True, timeout=20)\n"
                + "print(_r.stdout.strip())";

        KernelMessage execMsg = KernelMessage.buildExecuteRequest(client.getSessionId(), code);
        String msgId = execMsg.getHeader().getMsgId();

        java.util.concurrent.CompletableFuture<String> resultFuture = new java.util.concurrent.CompletableFuture<>();

        client.registerCallback(msgId, json -> {
            try {
                String msgType = json.getJSONObject("header").getString("msg_type");
                JSONObject content = json.getJSONObject("content");
                if (KernelMessage.STREAM.equals(msgType)) {
                    String text = content.getString("text");
                    if (text != null && text.trim().startsWith("[")) {
                        resultFuture.complete(text.trim());
                    }
                } else if (KernelMessage.EXECUTE_RESULT.equals(msgType)) {
                    JSONObject data = content.getJSONObject("data");
                    if (data != null) {
                        String plain = data.getString("text/plain");
                        if (plain != null && plain.trim().startsWith("[")) {
                            resultFuture.complete(plain.trim());
                        }
                    }
                } else if (KernelMessage.ERROR.equals(msgType)) {
                    resultFuture.complete("[]");
                } else if (KernelMessage.EXECUTE_REPLY.equals(msgType)) {
                    // 执行完成但结果未捕获时，给一个空结果
                    resultFuture.completeExceptionally(new RuntimeException("no output"));
                }
            } catch (Exception e) {
                resultFuture.completeExceptionally(e);
            }
        });

        try {
            client.sendMessage(execMsg);
            String jsonStr = resultFuture.get(30, TimeUnit.SECONDS);
            return parsePipListJson(jsonStr);
        } catch (java.util.concurrent.TimeoutException e) {
            log.warn("pip list (remote) 超时，workspaceId={}", workspaceId);
            client.removeCallback(msgId);
            return List.of();
        } catch (Exception e) {
            log.warn("pip list (remote) 失败，workspaceId={}, err={}", workspaceId, e.getMessage());
            client.removeCallback(msgId);
            return List.of();
        }
    }

    /**
     * 解析 pip list --format=json 的输出
     */
    private List<Map<String, String>> parsePipListJson(String jsonStr) {
        if (jsonStr == null || jsonStr.isBlank()) return List.of();
        try {
            com.alibaba.fastjson2.JSONArray arr = com.alibaba.fastjson2.JSON.parseArray(jsonStr);
            List<Map<String, String>> result = new java.util.ArrayList<>();
            for (int i = 0; i < arr.size(); i++) {
                JSONObject item = arr.getJSONObject(i);
                Map<String, String> pkg = new java.util.LinkedHashMap<>();
                pkg.put("name", item.getString("name"));
                pkg.put("version", item.getString("version"));
                result.add(pkg);
            }
            return result;
        } catch (Exception e) {
            log.warn("pip list JSON 解析失败: {}", jsonStr.length() > 200 ? jsonStr.substring(0, 200) : jsonStr);
            return List.of();
        }
    }

    /**
     * 解析 Python 可执行文件路径。
     * - embedded 模式：使用部署包内的 plugins/python-runtime/，与系统 Python 完全隔离
     * - system   模式：使用系统 PATH 中的 python3
     */
    private String resolvePythonExecutable() {
        return resolvePath(pythonProperties.getRuntimeType().equalsIgnoreCase("embedded")
                ? pythonProperties.getEmbedded().getPythonPath()
                : pythonProperties.getSystem().getPythonPath(), false);
    }

    /**
     * 解析 pip 可执行文件路径。
     * embedded 模式下使用 runtime 自带的 pip，确保包安装到 runtime 而不污染系统。
     */
    String resolvePipExecutable() {
        return resolvePath(pythonProperties.getRuntimeType().equalsIgnoreCase("embedded")
                ? pythonProperties.getEmbedded().getPipPath()
                : pythonProperties.getSystem().getPipPath(), false);
    }

    /**
     * 解析路径占位符，并处理 Windows .exe 后缀兼容。
     *
     * @param rawPath      待解析的路径（可能含 ${APP_HOME} 占位符）
     * @param allowFallback embedded 模式下找不到文件时是否退化为系统命令（一般不应退化）
     */
    private String resolvePath(String rawPath, boolean allowFallback) {
        // 解析 ${APP_HOME:default} 占位符
        String appHome = System.getenv("APP_HOME");
        if (appHome == null) appHome = System.getProperty("user.dir");
        String path = rawPath
                .replace("${APP_HOME}", appHome)
                .replaceAll("\\$\\{APP_HOME:[^}]+}", appHome)
                .replace("${user.dir}", System.getProperty("user.dir"));

        // Windows 兼容：尝试 .exe 后缀
        if (System.getProperty("os.name", "").toLowerCase().contains("win")) {
            // Windows 下 Scripts 目录代替 bin 目录
            path = path.replace("/bin/python3", "/python.exe")
                       .replace("/bin/pip3", "/Scripts/pip.exe")
                       .replace("/bin/jupyter-kernelgateway", "/Scripts/jupyter-kernelgateway.exe");
            java.io.File f = new java.io.File(path);
            if (!f.exists()) {
                java.io.File exe = new java.io.File(path.endsWith(".exe") ? path : path + ".exe");
                if (exe.exists()) return exe.getAbsolutePath();
                if (allowFallback) {
                    log.warn("[Python] embedded 文件不存在，降级为系统命令: {}", path);
                    return "python";
                }
                log.error("[Python] embedded Python 不存在，请先执行 build-python-runtime 脚本构建运行时！ path={}", path);
            }
        }
        return path;
    }

    /**
     * 代码补全
     *
     * @param workspaceId Workspace ID
     * @param code        当前代码
     * @param cursorPos   光标位置
     * @return 补全候选列表
     */
    @SuppressWarnings("unchecked")
    public List<String> complete(String workspaceId, String code, int cursorPos) throws Exception {
        KernelClient client = kernelClients.get(workspaceId);
        if (client == null || !client.isConnected()) {
            return List.of();
        }

        KernelMessage completeMsg = KernelMessage.buildCompleteRequest(client.getSessionId(), code, cursorPos);
        String msgId = completeMsg.getHeader().getMsgId();

        CompletableFutureHolder<List<String>> holder = new CompletableFutureHolder<>();

        client.registerCallback(msgId, json -> {
            String msgType = json.getJSONObject("header").getString("msg_type");
            if (KernelMessage.COMPLETE_REPLY.equals(msgType)) {
                JSONObject content = json.getJSONObject("content");
                List<String> matches = content.getList("matches", String.class);
                holder.complete(matches != null ? matches : List.of());
                client.removeCallback(msgId);
            }
        });

        client.sendMessage(completeMsg);

        return holder.get(5, TimeUnit.SECONDS);
    }

    /**
     * 获取已有或在需要时自动重连的 KernelClient
     * 若内存中 client 已断开，尝试从数据库恢复 WebSocket 连接
     */
    public KernelClient getOrCreateClientIfNeeded(String workspaceId) {
        KernelClient client = kernelClients.get(workspaceId);
        if (client != null && client.isConnected()) {
            return client;
        }
        // 尝试从数据库恢复（应用重启/连接断开后自动重连）
        String kernelId = getKernelIdFromWorkspace(workspaceId);
        if (kernelId != null && !kernelId.isEmpty()) {
            try {
                log.info("Kernel 连接已断开，尝试自动重连: workspaceId={}, kernelId={}", workspaceId, kernelId);
                // 先清理旧 client
                if (client != null) {
                    try { client.close(); } catch (Exception ignored) {}
                    kernelClients.remove(workspaceId);
                }
                // 检查 KernelGateway 中 Kernel 是否还存活
                String kernelInfoUrl = gatewayManager.getGatewayHttpBaseUrl() + "/api/kernels/" + kernelId;
                restTemplate.getForObject(kernelInfoUrl, String.class); // 若 Kernel 不存在会抛异常
                connectKernelClient(workspaceId, kernelId);
                KernelClient newClient = kernelClients.get(workspaceId);
                if (newClient != null && newClient.isConnected()) {
                    log.info("自动重连成功: workspaceId={}", workspaceId);
                    return newClient;
                }
            } catch (Exception e) {
                log.warn("自动重连失败，需要重新创建 Kernel: workspaceId={}, reason={}", workspaceId, e.getMessage());
                // 清理数据库中失效的 kernelId
                workspaceRepository.clearKernelInfo(workspaceId);
                kernelClients.remove(workspaceId);
            }
        }
        return null;
    }

    /**
     * 建立 WebSocket 连接到指定 Kernel
     */
    private void connectKernelClient(String workspaceId, String kernelId) throws Exception {
        String wsUrl = gatewayManager.getGatewayWsBaseUrl()
                + "/api/kernels/" + kernelId + "/channels";

        KernelClient client = new KernelClient(wsUrl);
        client.connect();
        kernelClients.put(workspaceId, client);
    }

    /**
     * 从数据库获取 KernelId
     */
    private String getKernelIdFromWorkspace(String workspaceId) {
        var workspace = workspaceRepository.findById(workspaceId);
        return workspace != null ? workspace.getKernelId() : null;
    }

    /**
     * 获取 Kernel 客户端（供调试服务使用）
     * 自动尝试重连断线的 Kernel（后端重启后可恢复）
     */
    public KernelClient getKernelClient(String workspaceId) {
        return getOrCreateClientIfNeeded(workspaceId);
    }

    /**
     * 恢复已有 Kernel 的 WebSocket 连接（应用重启后恢复）
     */
    public void reconnectKernel(String workspaceId, String kernelId) throws Exception {
        connectKernelClient(workspaceId, kernelId);
    }

    // ==================== SSE 工具方法 ====================

    private void sendSseData(SseEmitter emitter, String event, String data) {
        try {
            emitter.send(SseEmitter.event()
                    .name(event)
                    .data(data));
        } catch (IOException e) {
            log.warn("SSE 发送失败，客户端可能已断开");
        }
    }

    private void sendSseError(SseEmitter emitter, String message) {
        try {
            emitter.send(SseEmitter.event().name("error").data(message));
            emitter.completeWithError(new RuntimeException(message));
        } catch (IOException e) {
            log.warn("SSE 错误发送失败");
        }
    }

    // ==================== 内部工具类 ====================

    /**
     * 简单的 CompletableFuture 包装，用于回调场景
     */
    private static class CompletableFutureHolder<T> {
        private final java.util.concurrent.CompletableFuture<T> future = new java.util.concurrent.CompletableFuture<>();

        void complete(T value) {
            future.complete(value);
        }

        boolean isDone() {
            return future.isDone();
        }

        T get(long timeout, TimeUnit unit) throws Exception {
            return future.get(timeout, unit);
        }
    }
}
