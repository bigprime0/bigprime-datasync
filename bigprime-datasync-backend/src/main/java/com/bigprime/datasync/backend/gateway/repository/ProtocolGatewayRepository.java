package com.bigprime.datasync.backend.gateway.repository;

import com.bigprime.datasync.core.config.BigprimeEntityQuery;
import com.bigprime.datasync.core.model.MyPageResult;
import com.bigprime.datasync.core.model.MyPager;
import com.bigprime.datasync.backend.gateway.entity.ProtocolGatewayEntity;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.List;

/**
 * 协议网关Repository
 * 
 * @author bigprime
 * @version 1.0
 */
@Slf4j
@Component
@AllArgsConstructor
public class ProtocolGatewayRepository {

    private final BigprimeEntityQuery proxy;

    public Long save(ProtocolGatewayEntity entity) {
        if (entity.getId() == null) {
            entity.setCreatedTime(new Date());
            entity.setDeleted(false);
        }
        entity.setUpdatedTime(new Date());
        
        proxy.insertable(entity).executeRows();
        log.info("保存网关配置: id={}, name={}", entity.getId(), entity.getName());
        return entity.getId();
    }

    public Long update(ProtocolGatewayEntity entity) {
        entity.setUpdatedTime(new Date());
        return proxy.updatable(entity)
                .whereColumns(e -> e.id())
                .executeRows();
    }

    public ProtocolGatewayEntity findById(Long id) {
        return proxy.queryable(ProtocolGatewayEntity.class)
                .where(w -> {
                    w.id().eq(id);
                    w.deleted().eq(false);
                })
                .firstOrNull();
    }

    public List<ProtocolGatewayEntity> findAll() {
        return proxy.queryable(ProtocolGatewayEntity.class)
                .where(w -> w.deleted().eq(false))
                .orderBy(t -> t.createdTime().desc())
                .toList();
    }

    public MyPageResult<ProtocolGatewayEntity> getPageList(String name, String protocolType, String status, 
                                                            Integer page, Integer limit) {
        return proxy.queryable(ProtocolGatewayEntity.class)
                .where(w -> {
                    w.deleted().eq(false);
                    if (name != null && !name.isEmpty()) {
                        w.name().like(name);
                    }
                    if (protocolType != null && !protocolType.isEmpty()) {
                        w.protocolType().eq(protocolType);
                    }
                    if (status != null && !status.isEmpty()) {
                        w.status().eq(status);
                    }
                })
                .orderBy(t -> t.createdTime().desc())
                .toPageResult(new MyPager<>(page, limit));
    }

    public Long updateStatus(Long id, String status) {
        return proxy.updatable(ProtocolGatewayEntity.class)
                .setColumns(e -> {
                    e.status().set(status);
                    e.updatedTime().set(new Date());
                })
                .where(e -> e.id().eq(id))
                .executeRows();
    }

    public Long updateStatistics(Long id, Long messageCount, Long errorCount) {
        return proxy.updatable(ProtocolGatewayEntity.class)
                .setColumns(e -> {
                    e.messageCount().set(messageCount);
                    e.errorCount().set(errorCount);
                    e.lastActiveTime().set(new Date());
                    e.updatedTime().set(new Date());
                })
                .where(e -> e.id().eq(id))
                .executeRows();
    }

    public Long deleteById(Long id) {
        return proxy.updatable(ProtocolGatewayEntity.class)
                .setColumns(e -> {
                    e.deleted().set(true);
                    e.updatedTime().set(new Date());
                })
                .where(e -> e.id().eq(id))
                .executeRows();
    }

    public List<ProtocolGatewayEntity> findByAutoStart(Boolean autoStart) {
        return proxy.queryable(ProtocolGatewayEntity.class)
                .where(w -> {
                    w.autoStart().eq(autoStart);
                    w.deleted().eq(false);
                })
                .toList();
    }

    public List<ProtocolGatewayEntity> findByStatus(String status) {
        return proxy.queryable(ProtocolGatewayEntity.class)
                .where(w -> {
                    w.status().eq(status);
                    w.deleted().eq(false);
                })
                .toList();
    }
}
