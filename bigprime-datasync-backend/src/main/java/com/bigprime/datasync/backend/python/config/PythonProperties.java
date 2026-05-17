package com.bigprime.datasync.backend.python.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Python Web 模块配置属性
 *
 * @author bigprime
 * @version 1.0
 */
@Data
@Component
@ConfigurationProperties(prefix = "python")
public class PythonProperties {

    /**
     * 运行时类型：embedded(内置，随包自带) | system(系统已安装)
     * embedded 模式：使用 ${APP_HOME}/plugins/python-runtime/ 内的 Python，与系统 Python 完全隔离
     * system  模式：使用系统 PATH 中的 python3/pip3
     */
    private String runtimeType = "embedded";

    /**
     * 内置 Python 配置
     */
    private EmbeddedConfig embedded = new EmbeddedConfig();

    /**
     * 系统 Python 配置
     */
    private SystemConfig system = new SystemConfig();

    /**
     * KernelGateway 配置
     */
    private KernelGatewayConfig kernelGateway = new KernelGatewayConfig();

    /**
     * Workspace 配置
     */
    private WorkspaceConfig workspace = new WorkspaceConfig();

    @Data
    public static class EmbeddedConfig {
        /**
         * Python 解释器路径（嵌入式，随部署包自带）
         * Windows: plugins/python-runtime/python.exe
         * Linux:   plugins/python-runtime/bin/python3
         */
        private String pythonPath = "${APP_HOME:${user.dir}}/plugins/python-runtime/bin/python3";

        /**
         * pip 可执行路径（嵌入式环境专用，确保 pip install 安装到 runtime 而非系统）
         * Windows: plugins/python-runtime/Scripts/pip.exe
         * Linux:   plugins/python-runtime/bin/pip3
         */
        private String pipPath = "${APP_HOME:${user.dir}}/plugins/python-runtime/bin/pip3";

        /**
         * Jupyter KernelGateway 路径
         */
        private String kernelGatewayPath = "${APP_HOME:${user.dir}}/plugins/python-runtime/bin/jupyter-kernelgateway";
    }

    @Data
    public static class SystemConfig {
        /**
         * Python 解释器路径（系统已安装）
         */
        private String pythonPath = "python3";

        /**
         * pip 路径（系统已安装）
         */
        private String pipPath = "pip3";

        /**
         * Jupyter KernelGateway 路径
         */
        private String kernelGatewayPath = "jupyter-kernelgateway";
    }

    @Data
    public static class KernelGatewayConfig {
        /**
         * 主机地址
         */
        private String host = "localhost";

        /**
         * 端口号
         */
        private int port = 8888;

        /**
         * 是否自动启动 KernelGateway
         */
        private boolean autoStart = true;

        /**
         * 启动超时时间（秒）
         */
        private int startTimeout = 30;

        /**
         * 空闲超时关闭时间（分钟，0 表示不自动关闭）
         */
        private int idleTimeoutMinutes = 30;
    }

    @Data
    public static class WorkspaceConfig {
        /**
         * Workspace 基础路径
         */
        private String basePath = "${APP_HOME:${user.dir}}/python/workspaces";

        /**
         * 每个用户最大 Workspace 数量
         */
        private int maxCountPerUser = 10;

        /**
         * 单个 Workspace 最大存储（MB）
         */
        private int maxStorageMb = 500;
    }
}
