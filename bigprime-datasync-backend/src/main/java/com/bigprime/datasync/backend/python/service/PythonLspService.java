package com.bigprime.datasync.backend.python.service;

import com.bigprime.datasync.backend.python.config.PythonProperties;
import com.bigprime.datasync.backend.python.service.repository.PythonWorkspaceRepository;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.ServerSocket;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Python LSP 服务管理
 * <p>
 * 每个 workspaceId 对应一个 pylsp 进程（--tcp 模式），监听独立端口。
 * Java 后端通过 TCP 连接 pylsp，再通过 WebSocket 转发给前端 monaco-languageclient。
 * </p>
 *
 * @author bigprime
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PythonLspService {

    private final PythonProperties pythonProperties;
    private final PythonWorkspaceRepository workspaceRepository;

    /** workspaceId → pylsp 进程信息 */
    private final Map<String, LspProcess> processes = new ConcurrentHashMap<>();

    // ==================== 公开 API ====================

    /**
     * 确保指定 workspace 的 pylsp 进程已启动，返回其 TCP 端口。
     * 如果进程已运行则直接返回缓存端口。
     */
    public int ensureStarted(String workspaceId) throws IOException, InterruptedException {
        LspProcess existing = processes.get(workspaceId);
        if (existing != null && existing.isAlive()) {
            return existing.port;
        }
        // 清理僵尸记录
        if (existing != null) {
            processes.remove(workspaceId);
        }
        return startLsp(workspaceId);
    }

    /**
     * 停止指定 workspace 的 pylsp 进程
     */
    public void stop(String workspaceId) {
        LspProcess lsp = processes.remove(workspaceId);
        if (lsp != null) {
            lsp.destroy();
            log.info("[LSP] 已停止 workspaceId={}", workspaceId);
        }
    }

    /**
     * 查询 pylsp 是否运行中
     */
    public boolean isRunning(String workspaceId) {
        LspProcess lsp = processes.get(workspaceId);
        return lsp != null && lsp.isAlive();
    }

    /**
     * 在 workspace venv 中异步安装 python-lsp-server（幂等，已安装时跳过）。
     * 由 startKernel 后调用，不阻塞主流程。
     */
    /**
     * 异步确保 python-lsp-server 已安装。
     * - embedded 模式：安装到 plugins/python-runtime，不使用 venv pip
     * - system   模式：使用系统 pip3
     * 如果已安装则跳过，不阻塞主流程。
     */
    public void ensurePylspInstalled(String workspaceId) {
        Thread t = new Thread(() -> {
            try {
                String pipExe = resolvePipExe();

                // 检查是否已安装
                ProcessBuilder checkPb = new ProcessBuilder(pipExe, "show", "python-lsp-server",
                        "--root-user-action=ignore");
                checkPb.redirectErrorStream(true);
                Process checkProc = checkPb.start();
                // 消耗输出防止 pipe 堕诊
                try (var r = new java.io.BufferedReader(new java.io.InputStreamReader(checkProc.getInputStream()))) {
                    r.lines().forEach(l -> {});
                }
                int checkExit = checkProc.waitFor();
                if (checkExit == 0) {
                    log.debug("[LSP] python-lsp-server 已安装，跳过: workspaceId={}", workspaceId);
                    return;
                }

                // 安装
                log.info("[LSP] 安装 python-lsp-server: workspaceId={}, pip={}", workspaceId, pipExe);
                ProcessBuilder pb = new ProcessBuilder(pipExe, "install", "python-lsp-server[all]",
                        "--quiet", "--disable-pip-version-check", "--root-user-action=ignore");
                pb.redirectErrorStream(true);
                Process proc = pb.start();

                try (var reader = new java.io.BufferedReader(new java.io.InputStreamReader(proc.getInputStream()))) {
                    reader.lines().forEach(line -> log.debug("[LSP][install] {}", line));
                }
                int exit = proc.waitFor();
                if (exit == 0) {
                    log.info("[LSP] python-lsp-server 安装成功: workspaceId={}", workspaceId);
                } else {
                    log.warn("[LSP] python-lsp-server 安装失败，exit={}: workspaceId={}", exit, workspaceId);
                }
            } catch (Exception e) {
                log.warn("[LSP] ensurePylspInstalled 异常: workspaceId={}, err={}", workspaceId, e.getMessage());
            }
        }, "lsp-install-" + workspaceId);
        t.setDaemon(true);
        t.start();
    }

    // ==================== 内部实现 ====================

    private int startLsp(String workspaceId) throws IOException, InterruptedException {
        String workspacePath = resolveWorkspacePath(workspaceId);
        String pythonExe = resolvePythonExe();
        int port = findFreePort();

        // 优先使用 workspace venv 内的 pylsp
        String venvPylsp = workspacePath + "/venv/bin/pylsp";
        String venvPylspWin = workspacePath + "/venv/Scripts/pylsp.exe";
        boolean isWindows = System.getProperty("os.name", "").toLowerCase().contains("win");

        String pylspExe;
        java.io.File venvFile = new java.io.File(isWindows ? venvPylspWin : venvPylsp);
        if (venvFile.exists()) {
            pylspExe = venvFile.getAbsolutePath();
        } else {
            // fallback1: 使用 python-runtime 内的 pylsp
            String appHome = resolveAppHome();
            String runtimePylsp = isWindows
                    ? appHome + "/plugins/python-runtime/Scripts/pylsp.exe"
                    : appHome + "/plugins/python-runtime/bin/pylsp";
            java.io.File runtimeFile = new java.io.File(runtimePylsp);
            if (runtimeFile.exists()) {
                pylspExe = runtimeFile.getAbsolutePath();
                log.info("[LSP] 使用 python-runtime 内的 pylsp: {}", pylspExe);
            } else {
                // fallback2: python -m pylsp
                pylspExe = null;
            }
        }

        ProcessBuilder pb;
        if (pylspExe != null) {
            pb = new ProcessBuilder(pylspExe, "--tcp", "--host", "127.0.0.1", "--port", String.valueOf(port));
        } else {
            pb = new ProcessBuilder(pythonExe, "-m", "pylsp", "--tcp", "--host", "127.0.0.1", "--port", String.valueOf(port));
        }

        // 设置工作目录为 workspace 的 scripts 目录
        java.io.File scriptsDir = new java.io.File(workspacePath, "scripts");
        if (!scriptsDir.exists()) scriptsDir = new java.io.File(workspacePath);
        pb.directory(scriptsDir);

        // 合并 stderr 到 stdout，便于日志
        pb.redirectErrorStream(true);

        Process process = pb.start();

        // 异步消耗 stdout/stderr，防止 pipe buffer 死锁
        Thread logThread = new Thread(() -> {
            try (var reader = new java.io.BufferedReader(new java.io.InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    log.debug("[LSP][{}] {}", workspaceId, line);
                }
            } catch (IOException ignored) {}
        }, "lsp-log-" + workspaceId);
        logThread.setDaemon(true);
        logThread.start();

        // 等待 pylsp 监听端口就绪（最多 10 秒）
        waitForPort("127.0.0.1", port, 10_000);

        if (!process.isAlive()) {
            throw new IOException("pylsp 进程已退出，可能未安装。请在 workspace venv 中执行: pip install python-lsp-server");
        }

        processes.put(workspaceId, new LspProcess(process, port));
        log.info("[LSP] 已启动 workspaceId={}, port={}", workspaceId, port);
        return port;
    }

    /** 等待 TCP 端口可连接 */
    private void waitForPort(String host, int port, long timeoutMs) throws IOException, InterruptedException {
        long deadline = System.currentTimeMillis() + timeoutMs;
        while (System.currentTimeMillis() < deadline) {
            try (java.net.Socket s = new java.net.Socket(host, port)) {
                return; // 连接成功
            } catch (IOException ignored) {
                Thread.sleep(200);
            }
        }
        throw new IOException("pylsp 未在 " + timeoutMs + "ms 内就绪，port=" + port);
    }

    /** 找一个可用的本地端口 */
    private int findFreePort() throws IOException {
        try (ServerSocket ss = new ServerSocket(0)) {
            ss.setReuseAddress(true);
            return ss.getLocalPort();
        }
    }

    private String resolveWorkspacePath(String workspaceId) {
        var ws = workspaceRepository.findById(workspaceId);
        if (ws == null) throw new RuntimeException("Workspace 不存在: " + workspaceId);
        String path = ws.getWorkspacePath();
        // 兴容旧数据：绝对路径直接用；相对路径拼接当前 basePath
        if (java.nio.file.Paths.get(path).isAbsolute()) {
            return path;
        }
        // 相对路径：拼接 basePath（进行占位符解析）
        String basePath = pythonProperties.getWorkspace().getBasePath();
        String appHome = resolveAppHome();
        basePath = basePath
                .replace("${APP_HOME}", appHome)
                .replaceAll("\\$\\{APP_HOME:[^}]+}", appHome)
                .replace("${user.dir}", System.getProperty("user.dir"));
        return java.nio.file.Paths.get(basePath, path).toString();
    }

    /**
     * 解析应用根目录。
     * 优先使用 APP_HOME 环境变量，但若该目录下找不到 plugins/python-runtime，
     * 说明 APP_HOME 配置的是旧目录，回退到当前工作目录 user.dir。
     */
    private String resolveAppHome() {
        // 1. OS 环境变量（生产环境手动设置时）
        String appHome = System.getenv("APP_HOME");
        // 2. JVM 参数（start.sh/bat 通过 -DAPP_HOME 传入）
        if (appHome == null) {
            appHome = System.getProperty("APP_HOME");
        }
        // 验证有效性：目录下必须存在 plugins/python-runtime
        if (appHome != null) {
            java.io.File runtimeDir = new java.io.File(appHome, "plugins/python-runtime");
            if (runtimeDir.exists()) {
                return appHome;
            }
            log.warn("[Python] APP_HOME 指向的目录下找不到 plugins/python-runtime，" +
                    "回退到 user.dir： APP_HOME={}, user.dir={}", appHome, System.getProperty("user.dir"));
        }
        // 3. 兑底：当前工作目录（IDE 本地开发时）
        return System.getProperty("user.dir");
    }

    private String resolvePythonExe() {
        String runtimeType = pythonProperties.getRuntimeType();
        String rawPath = "system".equalsIgnoreCase(runtimeType)
                ? pythonProperties.getSystem().getPythonPath()
                : pythonProperties.getEmbedded().getPythonPath();
        return resolvePath(rawPath);
    }

    /**
     * 解析 pip 路径：embedded 模式使用 runtime 自带 pip，确保包不会安装到系统
     */
    private String resolvePipExe() {
        String runtimeType = pythonProperties.getRuntimeType();
        String rawPath = "system".equalsIgnoreCase(runtimeType)
                ? pythonProperties.getSystem().getPipPath()
                : pythonProperties.getEmbedded().getPipPath();
        return resolvePath(rawPath);
    }

    /**
     * 解析路径占位符 + Windows .exe/Scripts 兼容
     */
    private String resolvePath(String rawPath) {
        String appHome = resolveAppHome();
        String path = rawPath
                .replace("${APP_HOME}", appHome)
                .replaceAll("\\$\\{APP_HOME:[^}]+}", appHome)
                .replace("${user.dir}", System.getProperty("user.dir"));

        if (System.getProperty("os.name", "").toLowerCase().contains("win")) {
            path = path.replace("/bin/python3", "/python.exe")
                       .replace("/bin/pip3", "/Scripts/pip.exe")
                       .replace("/bin/jupyter-kernelgateway", "/Scripts/jupyter-kernelgateway.exe");
            java.io.File f = new java.io.File(path);
            if (!f.exists()) {
                java.io.File exe = new java.io.File(path.endsWith(".exe") ? path : path + ".exe");
                if (exe.exists()) return exe.getAbsolutePath();
            }
        }
        return path;
    }

    @PreDestroy
    public void shutdownAll() {
        processes.forEach((id, lsp) -> lsp.destroy());
        processes.clear();
        log.info("[LSP] 所有 pylsp 进程已停止");
    }

    // ==================== 内部数据类 ====================

    private static class LspProcess {
        final Process process;
        final int port;

        LspProcess(Process process, int port) {
            this.process = process;
            this.port = port;
        }

        boolean isAlive() {
            return process.isAlive();
        }

        void destroy() {
            process.destroyForcibly();
        }
    }
}
