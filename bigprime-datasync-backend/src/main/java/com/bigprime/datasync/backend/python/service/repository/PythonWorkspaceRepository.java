package com.bigprime.datasync.backend.python.service.repository;

import cn.hutool.core.util.IdUtil;
import com.bigprime.datasync.core.config.BigprimeEntityQuery;
import com.bigprime.datasync.core.model.MyPageResult;
import com.bigprime.datasync.core.model.MyPager;
import com.bigprime.datasync.core.model.SecurityUser;
import com.bigprime.datasync.core.model.UserDetail;
import com.bigprime.datasync.backend.python.entity.PythonWorkspaceEntity;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.List;

/**
 * Python Workspace Repository
 *
 * @author bigprime
 * @version 1.0
 */
@Slf4j
@Component
@AllArgsConstructor
public class PythonWorkspaceRepository {

    private final BigprimeEntityQuery proxy;

    /**
     * 保存或更新 Workspace
     */
    public String save(PythonWorkspaceEntity entity) {
        UserDetail user = SecurityUser.getUser();
        entity.setUpdateTime(new Date());
        entity.setUpdater(user.getId().toString());
        entity.setUpdaterName(user.getUsername());

        if (entity.getId() == null) {
            // 新建
            entity.setId(IdUtil.getSnowflakeNextIdStr());
            entity.setCreateTime(new Date());
            entity.setCreator(user.getId().toString());
            entity.setCreatorName(user.getUsername());
            entity.setDeleted(0);
            entity.setStatus("INACTIVE");

            proxy.insertable(entity).executeRows();
            log.info("创建 Python Workspace 成功: id={}, name={}", entity.getId(), entity.getName());
        } else {
            // 更新
            proxy.updatable(entity).executeRows();
            log.info("更新 Python Workspace 成功: id={}, name={}", entity.getId(), entity.getName());
        }

        return entity.getId();
    }

    /**
     * 根据 ID 查询
     */
    public PythonWorkspaceEntity findById(String id) {
        log.debug("查询 Python Workspace: id={}", id);
        return proxy.queryable(PythonWorkspaceEntity.class)
                .where(w -> w.id().eq(id))
                .firstOrNull();
    }

    /**
     * 根据 ID 和用户 ID 查询
     */
    public PythonWorkspaceEntity findByIdAndUserId(String id, String userId) {
        return proxy.queryable(PythonWorkspaceEntity.class)
                .where(w -> {
                    w.id().eq(id);
                    w.userId().eq(userId);
                    w.deleted().eq(0);
                })
                .firstOrNull();
    }

    /**
     * 删除 Workspace（逻辑删除）
     */
    public Long delete(String id) {
        log.info("删除 Python Workspace: id={}", id);
        PythonWorkspaceEntity entity = findById(id);
        if (entity != null) {
            entity.setDeleted(1);
            entity.setUpdateTime(new Date());
            return proxy.updatable(entity).executeRows();
        }
        return 0L;
    }

    /**
     * 分页查询用户的 Workspace
     */
    public MyPageResult<PythonWorkspaceEntity> getPageList(String userId, String search, Integer page, Integer limit) {
        return proxy.queryable(PythonWorkspaceEntity.class)
                .where(w -> {
                    w.userId().eq(userId);
                    w.deleted().eq(0);
                })
                .where(!search.isEmpty(), w -> {
                    w.or(() -> {
                        w.name().like(search);
                        w.description().like(search);
                    });
                })
                .orderBy(t -> t.createTime().desc())
                .toPageResult(new MyPager<>(page, limit));
    }

    /**
     * 查询用户的所有 Workspace
     */
    public List<PythonWorkspaceEntity> findByUserId(String userId) {
        return proxy.queryable(PythonWorkspaceEntity.class)
                .where(w -> {
                    w.userId().eq(userId);
                    w.deleted().eq(0);
                })
                .orderBy(t -> t.createTime().desc())
                .toList();
    }

    /**
     * 统计用户的 Workspace 数量
     */
    public long countByUserId(String userId) {
        return proxy.queryable(PythonWorkspaceEntity.class)
                .where(w -> {
                    w.userId().eq(userId);
                    w.deleted().eq(0);
                })
                .count();
    }

    /**
     * 检查名称是否已存在
     */
    public boolean existsByUserIdAndName(String userId, String name) {
        return proxy.queryable(PythonWorkspaceEntity.class)
                .where(w -> {
                    w.userId().eq(userId);
                    w.name().eq(name);
                    w.deleted().eq(0);
                })
                .any();
    }

    /**
     * 更新 Workspace 状态
     */
    public Long updateStatus(String id, String status) {
        log.info("更新 Workspace 状态: id={}, status={}", id, status);
        return proxy.updatable(PythonWorkspaceEntity.class)
                .setColumns(e -> {
                    e.status().set(status);
                    e.updateTime().set(new Date());
                })
                .where(e -> e.id().eq(id))
                .executeRows();
    }

    /**
     * 更新 Kernel 信息
     */
    public Long updateKernelInfo(String id, String kernelId, String kernelGatewayUrl) {
        log.info("更新 Workspace Kernel 信息: id={}, kernelId={}", id, kernelId);
        return proxy.updatable(PythonWorkspaceEntity.class)
                .setColumns(e -> {
                    e.kernelId().set(kernelId);
                    e.kernelGatewayUrl().set(kernelGatewayUrl);
                    e.status().set("ACTIVE");
                    e.updateTime().set(new Date());
                })
                .where(e -> e.id().eq(id))
                .executeRows();
    }

    /**
     * 清除 Kernel 信息（停止时调用）
     */
    public Long clearKernelInfo(String id) {
        log.info("清除 Workspace Kernel 信息: id={}", id);
        return proxy.updatable(PythonWorkspaceEntity.class)
                .setColumns(e -> {
                    e.kernelId().set((String) null);
                    e.kernelGatewayUrl().set((String) null);
                    e.status().set("INACTIVE");
                    e.updateTime().set(new Date());
                })
                .where(e -> e.id().eq(id))
                .executeRows();
    }
}
