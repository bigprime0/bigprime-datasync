package com.bigprime.datasync.backend.python.kernel;

import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONObject;
import lombok.extern.slf4j.Slf4j;

import java.io.*;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.SocketTimeoutException;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.function.Consumer;

/**
 * DAP over TCP 服务端 —— 开放 ServerSocket 等待 debugpy 主动连入。
 *
 * <p>debugpy 的 listen 模式：
 * 1. 我们开 ServerSocket，拿到端口
 * 2. 通过 attach 命令把端口告知 debugpy
 * 3. debugpy 主动连入我们的端口
 * 4. 通过这条连接发 DAP 命令（setBreakpoints/configurationDone）
 * 5. 接收 stopped 事件并推给前端
 */
@Slf4j
public class DebugpyTcpClient implements Closeable {

    private ServerSocket serverSocket;
    private Socket clientSocket;  // debugpy 连入后的连接
    private BufferedWriter writer;
    private Thread readerThread;
    private volatile boolean running = false;
    private int listenPort;

    private final AtomicInteger seqCounter = new AtomicInteger(1);
    private final Map<Integer, Consumer<JSONObject>> responseCallbacks = new ConcurrentHashMap<>();
    private Consumer<JSONObject> eventListener;
    /** pydevdAuthorize 授权完成信号 */
    private final CompletableFuture<Void> authorizedFuture = new CompletableFuture<>();

    /** 主动连接 debugpy 监听的 TCP 端口（debugpySockets 事件中的 internal=false 端口） */
    public void connectTo(String host, int port) throws IOException {
        clientSocket = new Socket(host, port);
        clientSocket.setSoTimeout(0);
        writer = new BufferedWriter(new OutputStreamWriter(clientSocket.getOutputStream(), StandardCharsets.UTF_8));
        running = true;
        readerThread = new Thread(this::readLoop, "debugpy-tcp-reader-" + port);
        readerThread.setDaemon(true);
        readerThread.start();
        log.info("DebugpyTcpClient 主动连接成功: {}:{}", host, port);
    }

    /** 开启 ServerSocket 并返回分配到的端口号 */
    public int startListening() throws IOException {
        serverSocket = new ServerSocket(0); // 端口 0 = 让 OS 分配空闲端口
        listenPort = serverSocket.getLocalPort();
        serverSocket.setSoTimeout(15000); // 15 秒超时等待 debugpy 连入
        log.info("DebugpyTcpClient 开启监听: port={}", listenPort);
        return listenPort;
    }

    /** 阵塞等待 debugpy 连入（调用前必须先 startListening） */
    public void acceptConnection() throws IOException {
        log.info("等待 debugpy 连入: port={}", listenPort);
        clientSocket = serverSocket.accept();
        clientSocket.setSoTimeout(0);
        writer = new BufferedWriter(new OutputStreamWriter(clientSocket.getOutputStream(), StandardCharsets.UTF_8));
        running = true;
        readerThread = new Thread(this::readLoop, "debugpy-tcp-reader-" + listenPort);
        readerThread.setDaemon(true);
        readerThread.start();
        log.info("debugpy 已连入: remoteAddr={}", clientSocket.getRemoteSocketAddress());
    }

    public int getListenPort() {
        return listenPort;
    }

    /** 发送请求并等待对应 response */
    public JSONObject sendRequestAndWait(String command, Map<String, Object> args, long timeoutMs)
            throws IOException, InterruptedException {
        CompletableFuture<JSONObject> future = new CompletableFuture<>();
        int seq = seqCounter.getAndIncrement();
        responseCallbacks.put(seq, future::complete);

        Map<String, Object> msg = new java.util.LinkedHashMap<>();
        msg.put("seq", seq);
        msg.put("type", "request");
        msg.put("command", command);
        msg.put("arguments", args != null ? args : Map.of());
        sendRaw(JSON.toJSONString(msg));
        log.debug("DAP TCP 发送: seq={}, command={}", seq, command);

        try {
            return future.get(timeoutMs, TimeUnit.MILLISECONDS);
        } catch (java.util.concurrent.TimeoutException e) {
            responseCallbacks.remove(seq);
            log.warn("DAP TCP 等待 {} response 超时 ({}ms)", command, timeoutMs);
            return null;
        } catch (java.util.concurrent.ExecutionException e) {
            responseCallbacks.remove(seq);
            throw new IOException("DAP TCP request failed: " + command, e.getCause());
        }
    }

    public void setEventListener(Consumer<JSONObject> listener) {
        this.eventListener = listener;
    }

    public boolean isConnected() {
        return clientSocket != null && !clientSocket.isClosed() && clientSocket.isConnected();
    }

    /**
     * 等待 pydevdAuthorize 授权握手完成。
     * 必须在授权完成后才能发送 DAP 命令，否则 debugpy 会关闭连接。
     */
    public void waitForAuthorized(long timeoutMs) throws Exception {
        authorizedFuture.get(timeoutMs, TimeUnit.MILLISECONDS);
    }

    @Override
    public void close() {
        running = false;
        try { if (clientSocket != null && !clientSocket.isClosed()) clientSocket.close(); } catch (IOException ignored) {}
        try { if (serverSocket != null && !serverSocket.isClosed()) serverSocket.close(); } catch (IOException ignored) {}
        log.info("DebugpyTcpClient 已关闭: port={}", listenPort);
    }

    // ===================== 私有方法 =====================

    private void sendRaw(String json) throws IOException {
        byte[] body = json.getBytes(StandardCharsets.UTF_8);
        String header = "Content-Length: " + body.length + "\r\n\r\n";
        synchronized (this) {
            writer.write(header);
            writer.write(json);
            writer.flush();
        }
    }

    private void readLoop() {
        try {
            InputStream in = clientSocket.getInputStream();
            while (running) {
                String headerLine = readLine(in);
                if (headerLine == null) break;
                if (!headerLine.startsWith("Content-Length:")) continue;

                int contentLength = Integer.parseInt(headerLine.substring("Content-Length:".length()).trim());
                readLine(in); // 空行

                byte[] body = in.readNBytes(contentLength);
                String jsonStr = new String(body, StandardCharsets.UTF_8);
                log.info("[DebugpyTCP收到] {}", jsonStr);
                handleMessage(JSON.parseObject(jsonStr));
            }
        } catch (SocketTimeoutException ignored) {
        } catch (Exception e) {
            if (running) log.warn("DebugpyTcpClient 读取中断: {}", e.getMessage());
        }
        log.info("DebugpyTcpClient 读取线程结束");
    }

    private String readLine(InputStream in) throws IOException {
        StringBuilder sb = new StringBuilder();
        int b;
        while ((b = in.read()) != -1) {
            if (b == '\n') {
                if (sb.length() > 0 && sb.charAt(sb.length() - 1) == '\r') sb.deleteCharAt(sb.length() - 1);
                return sb.toString();
            }
            sb.append((char) b);
        }
        return null;
    }

    private void handleMessage(JSONObject json) {
        String type = json.getString("type");
        log.info("[DebugpyTCP] type={}, seq={}, json={}", type, json.getInteger("seq"), json.toJSONString());
        if ("response".equals(type)) {
            Integer reqSeq = json.getInteger("request_seq");
            if (reqSeq != null && responseCallbacks.containsKey(reqSeq)) {
                responseCallbacks.remove(reqSeq).accept(json);
            }
        } else if ("event".equals(type)) {
            if (eventListener != null) eventListener.accept(json);
        } else if ("request".equals(type)) {
            // pydevd 安全授权握手：必须回复否则后续命令被忽略
            String command = json.getString("command");
            Integer reqSeq = json.getInteger("seq");
            if ("pydevdAuthorize".equals(command)) {
                try {
                    // pydevd 双向认证：clientAccessToken 必须与 debugServerAccessToken 相同（本地调试默认两者相同）
                    JSONObject arguments = json.getJSONObject("arguments");
                    String serverToken = arguments != null ? arguments.getString("debugServerAccessToken") : "";
                    log.info("[DebugpyTCP] 收到 pydevdAuthorize, serverToken={}", serverToken);
                    Map<String, Object> resp = new java.util.LinkedHashMap<>();
                    resp.put("seq", seqCounter.getAndIncrement());
                    resp.put("type", "response");
                    resp.put("request_seq", reqSeq);
                    resp.put("success", true);
                    resp.put("command", "pydevdAuthorize");
                    resp.put("message", "");
                    // 回传相同的 token，ipykernel 本地调试不需要真正鉴权
                    Map<String, Object> body = new java.util.LinkedHashMap<>();
                    body.put("clientAccessToken", serverToken != null ? serverToken : "");
                    resp.put("body", body);
                    sendRaw(JSON.toJSONString(resp));
                    log.info("[DebugpyTCP] 已回复 pydevdAuthorize, clientToken={}", serverToken);
                    authorizedFuture.complete(null);
                } catch (IOException e) {
                    log.error("[DebugpyTCP] 回复 pydevdAuthorize 失败", e);
                    authorizedFuture.completeExceptionally(e);
                }
            }
        }
    }
}
