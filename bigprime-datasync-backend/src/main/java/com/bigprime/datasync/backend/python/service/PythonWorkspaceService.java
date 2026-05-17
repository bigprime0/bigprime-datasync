package com.bigprime.datasync.backend.python.service;

import com.bigprime.datasync.core.model.MyPageResult;
import com.bigprime.datasync.core.model.SecurityUser;
import com.bigprime.datasync.core.model.UserDetail;
import com.bigprime.datasync.backend.python.config.PythonProperties;
import com.bigprime.datasync.backend.python.entity.PythonWorkspaceEntity;
import com.bigprime.datasync.backend.python.service.repository.PythonWorkspaceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Python Workspace 服务
 *
 * @author bigprime
 * @version 1.0
 */
@Slf4j
@Service
public class PythonWorkspaceService {

    private final PythonWorkspaceRepository workspaceRepository;
    private final PythonProperties pythonProperties;
    private final PythonExecutionService executionService;

    public PythonWorkspaceService(PythonWorkspaceRepository workspaceRepository,
                                   PythonProperties pythonProperties,
                                   @Lazy PythonExecutionService executionService) {
        this.workspaceRepository = workspaceRepository;
        this.pythonProperties = pythonProperties;
        this.executionService = executionService;
    }

    /**
     * 创建 Workspace
     */
    @Transactional(rollbackFor = Exception.class)
    public PythonWorkspaceEntity createWorkspace(String name, String description) {
        UserDetail user = SecurityUser.getUser();
        String userId = user.getId().toString();

        // 检查数量限制
        long count = workspaceRepository.countByUserId(userId);
        if (count >= pythonProperties.getWorkspace().getMaxCountPerUser()) {
            throw new RuntimeException("Workspace 数量已达上限（最多 " + pythonProperties.getWorkspace().getMaxCountPerUser() + " 个）");
        }

        // 检查名称重复
        if (workspaceRepository.existsByUserIdAndName(userId, name)) {
            throw new RuntimeException("Workspace 名称已存在");
        }

        // 生成唯一 ID 和相对路径（只存 workspace 子目录名，不含 basePath，避免路径和机器绑定）
        String workspaceId = UUID.randomUUID().toString().replace("-", "");
        String relPath = "workspace-" + workspaceId;  // 相对路径，存入DB
        String basePath = resolveBasePath();
        String workspacePath = Paths.get(basePath, relPath).toString();  // 用于本次创建目录

        // 创建目录结构
        createWorkspaceDirectories(workspacePath);

        // 保存到数据库
        PythonWorkspaceEntity workspace = new PythonWorkspaceEntity();
        workspace.setUserId(userId);
        workspace.setName(name);
        workspace.setDescription(description);
        workspace.setWorkspacePath(relPath);  // 只存相对路径 workspace-{id}，不存绑定到永久化的系统路径
        workspace.setStatus("INACTIVE");

        String id = workspaceRepository.save(workspace);
        workspace.setId(id);

        return workspace;
    }

    /**
     * 更新 Workspace
     */
    @Transactional(rollbackFor = Exception.class)
    public PythonWorkspaceEntity updateWorkspace(String id, String name, String description) {
        UserDetail user = SecurityUser.getUser();
        String userId = user.getId().toString();

        PythonWorkspaceEntity workspace = workspaceRepository.findByIdAndUserId(id, userId);
        if (workspace == null) {
            throw new RuntimeException("Workspace 不存在或无权访问");
        }

        // 如果修改了名称，检查是否重复
        if (!workspace.getName().equals(name)) {
            if (workspaceRepository.existsByUserIdAndName(userId, name)) {
                throw new RuntimeException("Workspace 名称已存在");
            }
            workspace.setName(name);
        }

        workspace.setDescription(description);
        workspaceRepository.save(workspace);

        return workspace;
    }

    /**
     * 删除 Workspace
     */
    @Transactional(rollbackFor = Exception.class)
    public void deleteWorkspace(String id) {
        UserDetail user = SecurityUser.getUser();
        String userId = user.getId().toString();

        PythonWorkspaceEntity workspace = workspaceRepository.findByIdAndUserId(id, userId);
        if (workspace == null) {
            throw new RuntimeException("Workspace 不存在或无权访问");
        }

        // 如果 Kernel 运行中，先停止
        if ("ACTIVE".equals(workspace.getStatus())) {
            try {
                executionService.stopKernel(id);
            } catch (Exception e) {
                log.warn("停止 Kernel 时出错，继续删除: {}", e.getMessage());
            }
        }

        // 逻辑删除
        workspaceRepository.delete(id);

        // 物理删除目录（可选，这里保留用于恢复）
        // deleteWorkspaceDirectory(workspace.getWorkspacePath());

        log.info("删除 Workspace 成功: id={}", id);
    }

    /**
     * 获取 Workspace 详情
     */
    public PythonWorkspaceEntity getWorkspace(String id) {
        UserDetail user = SecurityUser.getUser();
        String userId = user.getId().toString();

        PythonWorkspaceEntity workspace = workspaceRepository.findByIdAndUserId(id, userId);
        if (workspace == null) {
            throw new RuntimeException("Workspace 不存在或无权访问");
        }

        return workspace;
    }

    /**
     * 分页查询 Workspace 列表
     */
    public MyPageResult<PythonWorkspaceEntity> listWorkspaces(String search, Integer page, Integer limit) {
        UserDetail user = SecurityUser.getUser();
        String userId = user.getId().toString();

        return workspaceRepository.getPageList(userId, search, page, limit);
    }

    /**
     * 查询所有 Workspace
     */
    public List<PythonWorkspaceEntity> listAllWorkspaces() {
        UserDetail user = SecurityUser.getUser();
        String userId = user.getId().toString();
        log.info("[listAllWorkspaces] userId={}", userId);

        List<PythonWorkspaceEntity> result = workspaceRepository.findByUserId(userId);
        log.info("[listAllWorkspaces] 查询结果数量={}", result.size());
        return result;
    }

    /**
     * 删除 Workspace 下的代码文件（支持子目录相对路径）
     */
    public void deleteCode(String workspaceId, String relPath) {
        Path scriptsDir = resolveScriptsDir(workspaceId);
        Path target = safeResolve(scriptsDir, relPath);
        if (!target.getFileName().toString().endsWith(".py")) {
            throw new RuntimeException("仅支持删除 .py 文件");
        }
        try {
            if (Files.exists(target)) {
                Files.delete(target);
                log.info("删除代码文件成功: workspaceId={}, path={}", workspaceId, relPath);
            }
        } catch (IOException e) {
            log.error("删除代码文件失败: workspaceId={}, path={}", workspaceId, relPath, e);
            throw new RuntimeException("删除文件失败: " + e.getMessage(), e);
        }
    }

    /**
     * 重命名 Workspace 下的代码文件（支持子目录相对路径）
     */
    public void renameCode(String workspaceId, String oldRelPath, String newRelPath) {
        Path scriptsDir = resolveScriptsDir(workspaceId);
        Path oldPath = safeResolve(scriptsDir, oldRelPath);
        Path newPath = safeResolve(scriptsDir, newRelPath);
        if (!oldPath.getFileName().toString().endsWith(".py") || !newPath.getFileName().toString().endsWith(".py")) {
            throw new RuntimeException("仅支持重命名 .py 文件");
        }
        if (!Files.exists(oldPath)) {
            throw new RuntimeException("文件不存在: " + oldRelPath);
        }
        if (Files.exists(newPath)) {
            throw new RuntimeException("文件名已存在: " + newRelPath);
        }
        try {
            Files.createDirectories(newPath.getParent());
            Files.move(oldPath, newPath);
            log.info("重命名代码文件成功: workspaceId={}, {} -> {}", workspaceId, oldRelPath, newRelPath);
        } catch (IOException e) {
            log.error("重命名代码文件失败: workspaceId={}", workspaceId, e);
            throw new RuntimeException("重命名文件失败: " + e.getMessage(), e);
        }
    }

    /**
     * 列出 scripts/ 下的文件树（递归），返回树节点列表
     * 节点结构: { name, path(相对scripts的路径), type(file/dir), children }
     */
    public List<Map<String, Object>> listFiles(String workspaceId) {
        Path scriptsDir = resolveScriptsDir(workspaceId);
        if (!Files.exists(scriptsDir)) {
            return new ArrayList<>();
        }
        return buildTree(scriptsDir, scriptsDir);
    }

    /**
     * 在 scripts/ 下创建新 .py 文件
     */
    public void createFile(String workspaceId, String relPath) {
        Path scriptsDir = resolveScriptsDir(workspaceId);
        Path target = safeResolve(scriptsDir, relPath);
        if (!target.getFileName().toString().endsWith(".py")) {
            throw new RuntimeException("仅支持创建 .py 文件");
        }
        if (Files.exists(target)) {
            throw new RuntimeException("文件已存在: " + relPath);
        }
        try {
            Files.createDirectories(target.getParent());
            Files.writeString(target, "# " + target.getFileName() + "\n");
            log.info("创建文件成功: workspaceId={}, path={}", workspaceId, relPath);
        } catch (IOException e) {
            log.error("创建文件失败: workspaceId={}, path={}", workspaceId, relPath, e);
            throw new RuntimeException("创建文件失败: " + e.getMessage(), e);
        }
    }

    /**
     * 在 scripts/ 下创建 Python 包（目录 + __init__.py）
     */
    public void createPackage(String workspaceId, String relDirPath) {
        Path scriptsDir = resolveScriptsDir(workspaceId);
        Path pkgDir = safeResolve(scriptsDir, relDirPath);
        if (Files.exists(pkgDir) && !Files.isDirectory(pkgDir)) {
            throw new RuntimeException("路径已存在且不是目录: " + relDirPath);
        }
        try {
            Files.createDirectories(pkgDir);
            Path initFile = pkgDir.resolve("__init__.py");
            if (!Files.exists(initFile)) {
                Files.writeString(initFile, "# " + pkgDir.getFileName() + " package\n");
            }
            log.info("创建包成功: workspaceId={}, path={}", workspaceId, relDirPath);
        } catch (IOException e) {
            log.error("创建包失败: workspaceId={}, path={}", workspaceId, relDirPath, e);
            throw new RuntimeException("创建包失败: " + e.getMessage(), e);
        }
    }

    // ========== 私有工具方法 ==========

    /**
     * 获取 scripts/ 目录的绝对路径。
     * 兼容旧数据：若 workspacePath 是绝对路径则直接使用；若是相对路径则拼接当前 basePath。
     */
    private Path resolveScriptsDir(String workspaceId) {
        PythonWorkspaceEntity workspace = workspaceRepository.findById(workspaceId);
        if (workspace == null) {
            throw new RuntimeException("Workspace 不存在");
        }
        String path = workspace.getWorkspacePath();
        Path workspacePath = Paths.get(path).isAbsolute()
                ? Paths.get(path)                                  // 旧数据：绝对路径直接用
                : Paths.get(resolveBasePath(), path);              // 新数据：相对路径拼接 basePath
        return workspacePath.resolve("scripts");
    }

    /**
     * 安全解析相对路径，防止路径穿越攻击
     */
    private Path safeResolve(Path baseDir, String relPath) {
        // 去掉开头斜杠，防止绝对路径注入
        String cleaned = relPath.replaceAll("^[/\\\\]+", "");
        Path resolved = baseDir.resolve(cleaned).normalize();
        if (!resolved.startsWith(baseDir.normalize())) {
            throw new RuntimeException("非法路径: " + relPath);
        }
        return resolved;
    }

    /**
     * 递归构建文件树
     */
    private List<Map<String, Object>> buildTree(Path baseDir, Path currentDir) {
        List<Map<String, Object>> result = new ArrayList<>();
        try (var stream = Files.list(currentDir)) {
            stream.sorted((a, b) -> {
                // 目录优先，同类型按名称排序
                boolean aDir = Files.isDirectory(a);
                boolean bDir = Files.isDirectory(b);
                if (aDir != bDir) return aDir ? -1 : 1;
                return a.getFileName().toString().compareTo(b.getFileName().toString());
            }).forEach(path -> {
                Map<String, Object> node = new HashMap<>();
                String name = path.getFileName().toString();
                String relPath = baseDir.relativize(path).toString().replace("\\", "/");
                node.put("name", name);
                node.put("path", relPath);
                if (Files.isDirectory(path)) {
                    node.put("type", "dir");
                    node.put("children", buildTree(baseDir, path));
                } else {
                    node.put("type", "file");
                }
                result.add(node);
            });
        } catch (IOException e) {
            log.error("读取目录失败: {}", currentDir, e);
        }
        return result;
    }

    /**
     * 解析基础路径（处理 ${} 占位符）
     */
    private String resolveBasePath() {
        String basePath = pythonProperties.getWorkspace().getBasePath();

        // 处理 ${APP_HOME} 和 ${APP_HOME:defaultVal}
        if (basePath.contains("${APP_HOME}") || basePath.contains("${APP_HOME:")) {
            String appHome = resolveAppHome();
            basePath = basePath.replace("${APP_HOME}", appHome)
                               .replaceAll("\\$\\{APP_HOME:[^}]+}", appHome);
        }

        if (basePath.contains("${user.dir}")) {
            basePath = basePath.replace("${user.dir}", System.getProperty("user.dir"));
        }

        return basePath;
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
            log.warn("[Workspace] APP_HOME 指向的目录下找不到 plugins/python-runtime，" +
                    "回退到 user.dir： APP_HOME={}, user.dir={}", appHome, System.getProperty("user.dir"));
        }
        // 3. 兑底：当前工作目录（IDE 本地开发时）
        return System.getProperty("user.dir");
    }

    /**
     * 创建 Workspace 目录结构
     */
    private void createWorkspaceDirectories(String workspacePath) {
        try {
            Path path = Paths.get(workspacePath);
            Files.createDirectories(path);
            Files.createDirectories(path.resolve("scripts"));
            Files.createDirectories(path.resolve("data"));
            Files.createDirectories(path.resolve("backups"));

            // 创建 meta.json
            String metaContent = "{\"created\": \"" + java.time.Instant.now() + "\"}";
            Files.writeString(path.resolve("meta.json"), metaContent);

            log.info("创建 Workspace 目录成功: {}", workspacePath);
        } catch (IOException e) {
            log.error("创建 Workspace 目录失败: {}", workspacePath, e);
            throw new RuntimeException("创建 Workspace 目录失败: " + e.getMessage(), e);
        }
    }

    /**
     * 保存代码文件到 Workspace 目录（支持子目录相对路径）
     */
    public void saveCode(String workspaceId, String relPath, String content) {
        Path scriptsDir = resolveScriptsDir(workspaceId);
        // 兼容旧接口：只传文件名（不含目录）时直接放 scripts 根
        Path target = safeResolve(scriptsDir, relPath);
        if (!target.getFileName().toString().endsWith(".py")) {
            throw new RuntimeException("仅支持保存 .py 文件");
        }
        try {
            Files.createDirectories(target.getParent());
            Files.writeString(target, content == null ? "" : content);
            log.info("保存代码成功: workspaceId={}, path={}", workspaceId, relPath);
        } catch (IOException e) {
            log.error("保存代码失败: workspaceId={}, path={}", workspaceId, relPath, e);
            throw new RuntimeException("保存代码失败: " + e.getMessage(), e);
        }
    }

    /**
     * 从 Workspace 目录加载代码文件内容
    /**
     * 从 Workspace 目录加载代码文件内容（支持子目录相对路径）
     */
    public String loadCode(String workspaceId, String relPath) {
        Path scriptsDir = resolveScriptsDir(workspaceId);
        Path target = safeResolve(scriptsDir, relPath);
        try {
            if (Files.exists(target)) {
                return Files.readString(target);
            }
            // 文件不存在返回空内容（前端创建时已写入模板）
            return "";
        } catch (IOException e) {
            log.error("加载代码失败: workspaceId={}, path={}", workspaceId, relPath, e);
            throw new RuntimeException("加载代码失败: " + e.getMessage(), e);
        }
    }
}
