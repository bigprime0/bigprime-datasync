package com.bigprime.datasync.backend.python.service.repository;

import cn.hutool.core.util.IdUtil;
import com.bigprime.datasync.core.config.BigprimeEntityQuery;
import com.bigprime.datasync.core.model.SecurityUser;
import com.bigprime.datasync.core.model.UserDetail;
import com.bigprime.datasync.backend.python.entity.PythonBackupEntity;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.List;

/**
 * Python 版本备份 Repository
 *
 * @author bigprime
 * @version 1.0
 */
@Slf4j
@Component
@AllArgsConstructor
public class PythonBackupRepository {

    private final BigprimeEntityQuery proxy;

    /**
     * 保存备份记录
     */
    public String save(PythonBackupEntity entity) {
        UserDetail user = SecurityUser.getUser();
        entity.setId(IdUtil.getSnowflakeNextIdStr());
        entity.setCreateTime(new Date());
        entity.setCreator(user.getId().toString());
        entity.setCreatorName(user.getUsername());
        entity.setDeleted(0);

        proxy.insertable(entity).executeRows();
        log.info("创建备份记录成功: id={}, workspaceId={}", entity.getId(), entity.getWorkspaceId());
        return entity.getId();
    }

    /**
     * 根据 ID 查询
     */
    public PythonBackupEntity findById(String id) {
        return proxy.queryable(PythonBackupEntity.class)
                .where(w -> {
                    w.id().eq(id);
                    w.deleted().eq(0);
                })
                .firstOrNull();
    }

    /**
     * 查询 Workspace 的所有备份
     */
    public List<PythonBackupEntity> findByWorkspaceId(String workspaceId) {
        return proxy.queryable(PythonBackupEntity.class)
                .where(w -> {
                    w.workspaceId().eq(workspaceId);
                    w.deleted().eq(0);
                })
                .orderBy(t -> t.createTime().desc())
                .toList();
    }

    /**
     * 统计 Workspace 的备份数量
     */
    public long countByWorkspaceId(String workspaceId) {
        return proxy.queryable(PythonBackupEntity.class)
                .where(w -> {
                    w.workspaceId().eq(workspaceId);
                    w.deleted().eq(0);
                })
                .count();
    }

    /**
     * 删除备份（逻辑删除）
     */
    public Long delete(String id) {
        return proxy.updatable(PythonBackupEntity.class)
                .setColumns(e -> {
                    e.deleted().set(1);
                    e.createTime().set(new Date());
                })
                .where(e -> e.id().eq(id))
                .executeRows();
    }
}
