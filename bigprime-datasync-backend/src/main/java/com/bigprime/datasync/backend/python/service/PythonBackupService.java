package com.bigprime.datasync.backend.python.service;

import com.bigprime.datasync.backend.python.config.PythonProperties;
import com.bigprime.datasync.backend.python.entity.PythonBackupEntity;
import com.bigprime.datasync.backend.python.entity.PythonWorkspaceEntity;
import com.bigprime.datasync.backend.python.service.repository.PythonBackupRepository;
import com.bigprime.datasync.backend.python.service.repository.PythonWorkspaceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Python 版本备份服务（手动触发）
 *
 * @author bigprime
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PythonBackupService {

    private final PythonBackupRepository backupRepository;
    private final PythonWorkspaceRepository workspaceRepository;
    private final PythonProperties pythonProperties;

    /**
     * 最大备份数量（超过后删除最旧的）
     */
    private static final int MAX_BACKUP_COUNT = 20;

    /**
     * 创建备份（手动触发）
     *
     * @param workspaceId Workspace ID
     * @param remark      备注说明
     */
    @Transactional(rollbackFor = Exception.class)
    public PythonBackupEntity createBackup(String workspaceId, String remark) throws IOException {
        PythonWorkspaceEntity workspace = workspaceRepository.findById(workspaceId);
        if (workspace == null || workspace.getDeleted() == 1) {
            throw new RuntimeException("Workspace 不存在");
        }

        // 检查备份数量限制，超过则删除最旧的
        pruneOldBackupsIfNeeded(workspaceId, workspace.getWorkspacePath());

        // 创建备份目录
        String timestamp = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
        String backupDirName = "backup_" + timestamp;
        Path backupPath = Paths.get(workspace.getWorkspacePath(), "backups", backupDirName);
        Files.createDirectories(backupPath);

        // 复制 scripts 目录
        Path scriptsDir = Paths.get(workspace.getWorkspacePath(), "scripts");
        AtomicInteger fileCount = new AtomicInteger(0);
        if (Files.exists(scriptsDir)) {
            Files.walk(scriptsDir).forEach(src -> {
                try {
                    Path relative = scriptsDir.relativize(src);
                    Path dest = backupPath.resolve(relative);
                    if (Files.isDirectory(src)) {
                        Files.createDirectories(dest);
                    } else {
                        Files.copy(src, dest, StandardCopyOption.REPLACE_EXISTING);
                        fileCount.incrementAndGet();
                    }
                } catch (IOException e) {
                    log.error("备份文件失败: {}", src, e);
                }
            });
        }

        // 保存备份记录
        PythonBackupEntity backup = new PythonBackupEntity();
        backup.setWorkspaceId(workspaceId);
        backup.setRemark(remark);
        backup.setBackupPath(backupPath.toString());
        backup.setFileCount(fileCount.get());

        backupRepository.save(backup);
        log.info("创建备份成功: workspaceId={}, path={}, files={}", workspaceId, backupPath, fileCount.get());

        return backup;
    }

    /**
     * 查询 Workspace 的备份列表
     */
    public List<PythonBackupEntity> listBackups(String workspaceId) {
        return backupRepository.findByWorkspaceId(workspaceId);
    }

    /**
     * 恢复备份
     *
     * @param workspaceId Workspace ID
     * @param backupId    备份ID
     */
    public void restoreBackup(String workspaceId, String backupId) throws IOException {
        PythonBackupEntity backup = backupRepository.findById(backupId);
        if (backup == null || !backup.getWorkspaceId().equals(workspaceId)) {
            throw new RuntimeException("备份不存在或不属于该 Workspace");
        }

        PythonWorkspaceEntity workspace = workspaceRepository.findById(workspaceId);
        if (workspace == null) {
            throw new RuntimeException("Workspace 不存在");
        }

        Path backupPath = Paths.get(backup.getBackupPath());
        if (!Files.exists(backupPath)) {
            throw new RuntimeException("备份文件不存在: " + backup.getBackupPath());
        }

        // 清空 scripts 目录并恢复
        Path scriptsDir = Paths.get(workspace.getWorkspacePath(), "scripts");

        // 删除现有 scripts
        if (Files.exists(scriptsDir)) {
            Files.walk(scriptsDir)
                    .sorted(java.util.Comparator.reverseOrder())
                    .forEach(p -> {
                        try {
                            Files.delete(p);
                        } catch (IOException e) {
                            log.warn("删除文件失败: {}", p);
                        }
                    });
        }
        Files.createDirectories(scriptsDir);

        // 从备份恢复
        Files.walk(backupPath).forEach(src -> {
            try {
                Path relative = backupPath.relativize(src);
                Path dest = scriptsDir.resolve(relative);
                if (Files.isDirectory(src)) {
                    Files.createDirectories(dest);
                } else {
                    Files.copy(src, dest, StandardCopyOption.REPLACE_EXISTING);
                }
            } catch (IOException e) {
                log.error("恢复文件失败: {}", src, e);
            }
        });

        log.info("恢复备份成功: workspaceId={}, backupId={}", workspaceId, backupId);
    }

    /**
     * 删除备份
     */
    public void deleteBackup(String workspaceId, String backupId) throws IOException {
        PythonBackupEntity backup = backupRepository.findById(backupId);
        if (backup == null || !backup.getWorkspaceId().equals(workspaceId)) {
            throw new RuntimeException("备份不存在或不属于该 Workspace");
        }

        // 删除物理文件
        Path backupPath = Paths.get(backup.getBackupPath());
        if (Files.exists(backupPath)) {
            Files.walk(backupPath)
                    .sorted(java.util.Comparator.reverseOrder())
                    .forEach(p -> {
                        try {
                            Files.delete(p);
                        } catch (IOException e) {
                            log.warn("删除备份文件失败: {}", p);
                        }
                    });
        }

        // 逻辑删除记录
        backupRepository.delete(backupId);
        log.info("删除备份成功: id={}", backupId);
    }

    /**
     * 超出最大备份数时清理最旧的备份
     */
    private void pruneOldBackupsIfNeeded(String workspaceId, String workspacePath) throws IOException {
        long count = backupRepository.countByWorkspaceId(workspaceId);
        if (count >= MAX_BACKUP_COUNT) {
            List<PythonBackupEntity> backups = backupRepository.findByWorkspaceId(workspaceId);
            // 列表已按 createTime desc 排序，删除最后一个（最旧）
            PythonBackupEntity oldest = backups.get(backups.size() - 1);
            deleteBackup(workspaceId, oldest.getId());
            log.info("超出备份上限，删除最旧备份: id={}", oldest.getId());
        }
    }
}
