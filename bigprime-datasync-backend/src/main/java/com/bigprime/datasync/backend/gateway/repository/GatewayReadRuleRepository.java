package com.bigprime.datasync.backend.gateway.repository;

import com.bigprime.datasync.core.config.BigprimeEntityQuery;
import com.bigprime.datasync.backend.gateway.entity.GatewayReadRuleEntity;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.List;

/**
 * 网关读取规则Repository
 * 
 * @author bigprime
 * @version 1.0
 */
@Slf4j
@Component
@AllArgsConstructor
public class GatewayReadRuleRepository {

    private final BigprimeEntityQuery proxy;

    public Long save(GatewayReadRuleEntity entity) {
        if (entity.getId() == null) {
            entity.setCreatedTime(new Date());
        }
        entity.setUpdatedTime(new Date());
        
        proxy.insertable(entity).executeRows();
        log.info("保存读取规则: id={}, gatewayId={}, ruleName={}", 
                entity.getId(), entity.getGatewayId(), entity.getRuleName());
        return entity.getId();
    }

    public Long update(GatewayReadRuleEntity entity) {
        entity.setUpdatedTime(new Date());
        return proxy.updatable(entity)
                .whereColumns(e -> e.id())
                .executeRows();
    }

    public GatewayReadRuleEntity findById(Long id) {
        return proxy.queryable(GatewayReadRuleEntity.class)
                .where(w -> w.id().eq(id))
                .firstOrNull();
    }

    public List<GatewayReadRuleEntity> findByGatewayId(Long gatewayId) {
        return proxy.queryable(GatewayReadRuleEntity.class)
                .where(w -> {
                    w.gatewayId().eq(gatewayId);
                    w.enabled().eq(true);
                })
                .orderBy(t -> t.sortOrder().asc())
                .toList();
    }

    public Long deleteById(Long id) {
        return proxy.deletable(GatewayReadRuleEntity.class)
                .where(e -> e.id().eq(id))
                .executeRows();
    }

    public Long deleteByGatewayId(Long gatewayId) {
        return proxy.deletable(GatewayReadRuleEntity.class)
                .where(e -> e.gatewayId().eq(gatewayId))
                .executeRows();
    }

    /**
     * 查询所有规则
     */
    public List<GatewayReadRuleEntity> findAll() {
        return proxy.queryable(GatewayReadRuleEntity.class)
                .orderBy(t -> t.createdTime().desc())
                .toList();
    }

    /**
     * 更新启用状态
     */
    public Long updateEnabled(Long id, Boolean enabled) {
        return proxy.updatable(GatewayReadRuleEntity.class)
                .setColumns(e -> {
                    e.enabled().set(enabled);
                    e.updatedTime().set(new Date());
                })
                .where(e -> e.id().eq(id))
                .executeRows();
    }
}
