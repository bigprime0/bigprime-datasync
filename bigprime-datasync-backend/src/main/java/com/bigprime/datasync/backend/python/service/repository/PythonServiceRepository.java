package com.bigprime.datasync.backend.python.service.repository;

import cn.hutool.core.util.IdUtil;
import com.bigprime.datasync.core.config.BigprimeEntityQuery;
import com.bigprime.datasync.core.model.SecurityUser;
import com.bigprime.datasync.core.model.UserDetail;
import com.bigprime.datasync.backend.python.entity.PythonServiceEntity;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.List;

/**
 * Python 发布服务 Repository
 *
 * @author bigprime
 * @version 1.0
 */
@Slf4j
@Component
@AllArgsConstructor
public class PythonServiceRepository {

    private final BigprimeEntityQuery proxy;

    /**
     * 保存或更新发布服务
     */
    public String save(PythonServiceEntity entity) {
        UserDetail user = SecurityUser.getUser();
        entity.setUpdateTime(new Date());
        entity.setUpdater(user.getId().toString());
        entity.setUpdaterName(user.getUsername());

        if (entity.getId() == null) {
            entity.setId(IdUtil.getSnowflakeNextIdStr());
            entity.setCreateTime(new Date());
            entity.setCreator(user.getId().toString());
            entity.setCreatorName(user.getUsername());
            entity.setDeleted(0);
            proxy.insertable(entity).executeRows();
            log.info("创建 Python 发布服务成功: id={}, serviceName={}", entity.getId(), entity.getServiceName());
        } else {
            proxy.updatable(entity).executeRows();
            log.info("更新 Python 发布服务成功: id={}, serviceName={}", entity.getId(), entity.getServiceName());
        }

        return entity.getId();
    }

    /**
     * 按 ID 查询
     */
    public PythonServiceEntity findById(String id) {
        return proxy.queryable(PythonServiceEntity.class)
                .where(w -> {
                    w.id().eq(id);
                    w.deleted().eq(0);
                })
                .firstOrNull();
    }

    /**
     * 按 API Key 查询（调用鉴权用，不过滤 deleted，需校验 status）
     */
    public PythonServiceEntity findByApiKey(String apiKey) {
        return proxy.queryable(PythonServiceEntity.class)
                .where(w -> {
                    w.apiKey().eq(apiKey);
                    w.deleted().eq(0);
                })
                .firstOrNull();
    }

    /**
     * 按 workspaceId 查询该 Workspace 下所有发布服务
     */
    public List<PythonServiceEntity> findByWorkspaceId(String workspaceId) {
        return proxy.queryable(PythonServiceEntity.class)
                .where(w -> {
                    w.workspaceId().eq(workspaceId);
                    w.deleted().eq(0);
                })
                .orderBy(t -> t.createTime().desc())
                .toList();
    }

    /**
     * 逻辑删除
     */
    public void delete(String id) {
        proxy.updatable(PythonServiceEntity.class)
                .setColumns(e -> {
                    e.deleted().set(1);
                    e.updateTime().set(new Date());
                })
                .where(e -> e.id().eq(id))
                .executeRows();
        log.info("删除 Python 发布服务: id={}", id);
    }

    /**
     * 更新状态
     */
    public void updateStatus(String id, String status) {
        proxy.updatable(PythonServiceEntity.class)
                .setColumns(e -> {
                    e.status().set(status);
                    e.updateTime().set(new Date());
                })
                .where(e -> e.id().eq(id))
                .executeRows();
    }

    /**
     * 更新生效时间
     */
    public void updateEffectiveTime(String id, Date effectiveStart, Date effectiveEnd) {
        proxy.updatable(PythonServiceEntity.class)
                .setColumns(e -> {
                    e.effectiveStart().set(effectiveStart);
                    e.effectiveEnd().set(effectiveEnd);
                    e.updateTime().set(new Date());
                })
                .where(e -> e.id().eq(id))
                .executeRows();
    }

    /**
     * 查询已发布为 MCP 工具的 Python 服务列表
     */
    public List<PythonServiceEntity> findPublishedAsMcp() {
        return proxy.queryable(PythonServiceEntity.class)
                .where(w -> {
                    w.status().eq("ACTIVE");
                    w.deleted().eq(0);
                })
                .toList()
                .stream()
                .filter(e -> e.getPublishAsMcp() != null && e.getPublishAsMcp() == 1
                        && e.getMcpToolName() != null && !e.getMcpToolName().isBlank())
                .sorted((a, b) -> b.getCreateTime().compareTo(a.getCreateTime()))
                .collect(java.util.stream.Collectors.toList());
    }

    /**
     * 取消发布为 MCP 工具
     */
    public void disableMcp(String id) {
        proxy.updatable(PythonServiceEntity.class)
                .setColumns(e -> {
                    e.publishAsMcp().set(0);
                    e.updateTime().set(new Date());
                })
                .where(e -> e.id().eq(id))
                .executeRows();
    }
}
