package com.bigprime.datasync.backend.python.kernel;

import com.bigprime.datasync.backend.python.config.PythonProperties;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.net.Socket;
import java.util.concurrent.TimeUnit;

/**
 * Jupyter KernelGateway 进程管理器
 * 负责 KernelGateway 进程的启动、停止和健康检查
 *
 * @author bigprime
 * @version 1.0
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class KernelGatewayManager {

    private final PythonProperties pythonProperties;

    /**
     * KernelGateway 进程引用
     */
    private Process gatewayProcess;

    /**
     * 应用就绪后自动启动（如果配置了 auto-start）
     */
    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        if (pythonProperties.getKernelGateway().isAutoStart()) {
            log.info("auto-start=true，自动启动 KernelGateway...");
            try {
                start();
            } catch (Exception e) {
                log.error("自动启动 KernelGateway 失败，请检查 Python 环境配置", e);
            }
        } else {
            log.info("auto-start=false，请手动启动 KernelGateway（端口: {}）",
                    pythonProperties.getKernelGateway().getPort());
        }
    }

    /**
     * 启动 KernelGateway
     */
    public synchronized void start() throws IOException, InterruptedException {
        int port = pythonProperties.getKernelGateway().getPort();

        // 检查是否已经运行
        if (isRunning()) {
            log.info("KernelGateway 已在运行（端口: {}）", port);
            return;
        }

        String kernelGatewayPath = resolveKernelGatewayPath();
        log.info("启动 KernelGateway: {} --port={}", kernelGatewayPath, port);

        ProcessBuilder pb = new ProcessBuilder(
                kernelGatewayPath,
                "--port=" + port,
                "--KernelGatewayApp.allow_origin=*",
                // 3.0.x 将 JupyterWebsocketPersonality 重命名为 NotebookHTTPPersonality
                "--NotebookHTTPPersonality.list_kernels=true"
        );
        // 将 KernelGateway stdout/stderr 均重定向到日志文件（追加模式）
        // 避免 inheritIO() 在 Windows 下引起 IO 绑定异常，同时确保 Linux 下错误日志可查
        java.io.File logDir = new java.io.File(resolveAppHome(), "logs");
        logDir.mkdirs();
        java.io.File gwLog = new java.io.File(logDir, "kernel-gateway.log");
        pb.redirectErrorStream(true);   // stderr 合并到 stdout
        pb.redirectOutput(ProcessBuilder.Redirect.appendTo(gwLog));  // 追加模式，重启后历史日志不丢失

        gatewayProcess = pb.start();

        // 记录 KernelGateway PID 到文件，供 stop 脚本使用
        try {
            long pid = gatewayProcess.pid();
            java.io.File pidFile = new java.io.File(logDir, "kernelgateway.pid");
            java.nio.file.Files.writeString(pidFile.toPath(), String.valueOf(pid));
            log.info("KernelGateway PID {} 已写入: {}", pid, pidFile.getAbsolutePath());
        } catch (Exception e) {
            log.warn("写入 kernelgateway.pid 失败（不影响运行）: {}", e.getMessage());
        }

        // 等待 KernelGateway 就绪
        int timeout = pythonProperties.getKernelGateway().getStartTimeout();
        boolean ready = waitUntilReady(port, timeout);

        if (!ready) {
            gatewayProcess.destroy();
            gatewayProcess = null;
            throw new RuntimeException("KernelGateway 启动超时（" + timeout + "s），请检查 Python 环境");
        }

        log.info("KernelGateway 启动成功，端口: {}", port);
    }

    /**
     * 停止 KernelGateway
     */
    public synchronized void stop() {
        if (gatewayProcess != null && gatewayProcess.isAlive()) {
            log.info("停止 KernelGateway...");
            gatewayProcess.destroy();
            try {
                gatewayProcess.waitFor(10, TimeUnit.SECONDS);
                if (gatewayProcess.isAlive()) {
                    gatewayProcess.destroyForcibly();
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                gatewayProcess.destroyForcibly();
            }
            gatewayProcess = null;
            log.info("KernelGateway 已停止");
        }
    }

    /**
     * 检查 KernelGateway 是否运行中（通过端口连通性检查）
     */
    public boolean isRunning() {
        int port = pythonProperties.getKernelGateway().getPort();
        String host = pythonProperties.getKernelGateway().getHost();
        try (Socket socket = new Socket(host, port)) {
            return true;
        } catch (IOException e) {
            return false;
        }
    }

    /**
     * 获取 KernelGateway WebSocket 基础地址
     */
    public String getGatewayWsBaseUrl() {
        return "ws://" + pythonProperties.getKernelGateway().getHost()
                + ":" + pythonProperties.getKernelGateway().getPort();
    }

    /**
     * 获取 KernelGateway HTTP 基础地址
     */
    public String getGatewayHttpBaseUrl() {
        return "http://" + pythonProperties.getKernelGateway().getHost()
                + ":" + pythonProperties.getKernelGateway().getPort();
    }

    /**
     * 应用关闭时停止 KernelGateway
     */
    @PreDestroy
    public void onDestroy() {
        stop();
    }

    /**
     * 等待端口就绪
     */
    private boolean waitUntilReady(int port, int timeoutSeconds) throws InterruptedException {
        String host = pythonProperties.getKernelGateway().getHost();
        long deadline = System.currentTimeMillis() + timeoutSeconds * 1000L;
        while (System.currentTimeMillis() < deadline) {
            try (Socket socket = new Socket(host, port)) {
                return true;
            } catch (IOException e) {
                TimeUnit.MILLISECONDS.sleep(500);
            }
        }
        return false;
    }

    /**
     * 解析 KernelGateway 可执行文件路径
     */
    private String resolveKernelGatewayPath() {
        String path;
        if ("embedded".equalsIgnoreCase(pythonProperties.getRuntimeType())) {
            path = pythonProperties.getEmbedded().getKernelGatewayPath();
            path = resolvePlaceholders(path);
        } else {
            path = pythonProperties.getSystem().getKernelGatewayPath();
        }

        // Windows 兼容：嵌入式 Python 在 Windows 下目录结构不同
        // Linux:   plugins/python-runtime/bin/jupyter-kernelgateway
        // Windows: plugins\python-runtime\Scripts\jupyter-kernelgateway.exe
        if (System.getProperty("os.name").toLowerCase().contains("win")) {
            // 先尝试将 Linux 风格路径转为 Windows Scripts 路径
            String winPath = path
                    .replace("/bin/jupyter-kernelgateway", "/Scripts/jupyter-kernelgateway.exe")
                    .replace("\\", "/");
            // 统一分隔符
            winPath = winPath.replace("/", File.separator);
            File winFile = new File(winPath);
            if (winFile.exists()) {
                return winFile.getAbsolutePath();
            }
            // 再尝试原始路径直接加 .exe
            File execFile = new File(path);
            if (!execFile.exists()) {
                File exeFile = new File(path + ".exe");
                if (exeFile.exists()) {
                    return exeFile.getAbsolutePath();
                }
                log.error("KernelGateway 可执行文件不存在，请先执行 build-python-runtime.bat 构建嵌入式 Python 运行时！\n" +
                        "  检查路径: {}\n  Windows路径: {}", path, winPath);
            }
        }
        return path;
    }

    /**
     * 解析路径中的占位符
     */
    private String resolvePlaceholders(String path) {
        if (path.contains("${APP_HOME}") || path.contains("${APP_HOME:")) {
            String appHome = resolveAppHome();
            path = path.replace("${APP_HOME}", appHome)
                       .replaceAll("\\$\\{APP_HOME:[^}]+}", appHome);
        }
        if (path.contains("${user.dir}")) {
            path = path.replace("${user.dir}", System.getProperty("user.dir"));
        }
        return path;
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
        // 验证有效性：APP_HOME 目录本身必须存在（python-runtime 是运行时安装的，首次部署时可能尚未存在）
        if (appHome != null) {
            java.io.File appHomeDir = new java.io.File(appHome);
            if (appHomeDir.exists() && appHomeDir.isDirectory()) {
                return appHome;
            }
            log.warn("[KernelGateway] APP_HOME 目录不存在，回退到 user.dir： APP_HOME={}, user.dir={}",
                    appHome, System.getProperty("user.dir"));
        }
        // 3. 兑底：当前工作目录（IDE 本地开发时）
        return System.getProperty("user.dir");
    }
}
