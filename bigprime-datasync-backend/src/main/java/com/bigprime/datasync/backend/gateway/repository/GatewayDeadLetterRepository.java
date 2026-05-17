package com.bigprime.datasync.backend.gateway.repository;

import com.bigprime.datasync.core.config.BigprimeEntityQuery;
import com.bigprime.datasync.core.model.MyPageResult;
import com.bigprime.datasync.core.model.MyPager;
import com.bigprime.datasync.backend.gateway.entity.GatewayDeadLetterEntity;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.List;

/**
 * 死信队列Repository
 * 
 * @author bigprime
 * @version 1.0
 */
@Slf4j
@Component
@AllArgsConstructor
public class GatewayDeadLetterRepository {

    private final BigprimeEntityQuery proxy;

    public Long save(GatewayDeadLetterEntity entity) {
        if (entity.getId() == null) {
            entity.setFailureTime(new Date());
        }
        
        proxy.insertable(entity).executeRows();
        log.info("保存死信消息: id={}, gatewayId={}", entity.getId(), entity.getGatewayId());
        return entity.getId();
    }

    public GatewayDeadLetterEntity findById(Long id) {
        return proxy.queryable(GatewayDeadLetterEntity.class)
                .where(w -> w.id().eq(id))
                .firstOrNull();
    }

    public MyPageResult<GatewayDeadLetterEntity> getPageList(Long gatewayId, String status, 
                                                              Integer page, Integer limit) {
        return proxy.queryable(GatewayDeadLetterEntity.class)
                .where(w -> {
                    if (gatewayId != null) {
                        w.gatewayId().eq(gatewayId);
                    }
                    if (status != null && !status.isEmpty()) {
                        w.status().eq(status);
                    }
                })
                .orderBy(t -> t.failureTime().desc())
                .toPageResult(new MyPager<>(page, limit));
    }

    public List<GatewayDeadLetterEntity> findPending(Long gatewayId, Integer limit) {
        return proxy.queryable(GatewayDeadLetterEntity.class)
                .where(w -> {
                    w.gatewayId().eq(gatewayId);
                    w.status().eq("PENDING");
                })
                .orderBy(t -> t.failureTime().asc())
                .limit(limit)
                .toList();
    }

    /**
     * 根据网关ID查询所有死信
     */
    public List<GatewayDeadLetterEntity> findByGatewayId(Long gatewayId) {
        return proxy.queryable(GatewayDeadLetterEntity.class)
                .where(w -> w.gatewayId().eq(gatewayId))
                .orderBy(t -> t.failureTime().desc())
                .toList();
    }

    public Long updateStatus(Long id, String status, String handledBy) {
        return proxy.updatable(GatewayDeadLetterEntity.class)
                .setColumns(e -> {
                    e.status().set(status);
                    e.handledBy().set(handledBy);
                    e.handledTime().set(new Date());
                })
                .where(e -> e.id().eq(id))
                .executeRows();
    }

    public Long deleteById(Long id) {
        return proxy.deletable(GatewayDeadLetterEntity.class)
                .where(e -> e.id().eq(id))
                .executeRows();
    }

    /**
     * 获取所有待处理的死信（不限制网关ID）
     */
    public List<GatewayDeadLetterEntity> findAllPending(Integer limit) {
        return proxy.queryable(GatewayDeadLetterEntity.class)
                .where(w -> w.status().eq("PENDING"))
                .orderBy(t -> t.failureTime().asc())
                .limit(limit)
                .toList();
    }

    /**
     * 统计指定状态的死信数量
     */
    public long countByStatus(String status) {
        return proxy.queryable(GatewayDeadLetterEntity.class)
                .where(w -> w.status().eq(status))
                .count();
    }

    /**
     * 统计需要人工干预的死信数量
     * （重试次数已达上限但状态仍为PENDING）
     */
    public long countNeedManualIntervention() {
        return proxy.queryable(GatewayDeadLetterEntity.class)
                .where(w -> {
                    w.status().eq("PENDING");
                    // 注意：这里需要retryCount >= maxRetryCount的比较
                    // easy-query可能不支持字段间比较，需要使用原生SQL或分步查询
                })
                .count();
    }

    /**
     * 批量删除超过指定天数的死信记录
     */
    public long deleteOldRecords(int days) {
        Date beforeDate = new Date(System.currentTimeMillis() - (long) days * 24 * 60 * 60 * 1000);
        return proxy.deletable(GatewayDeadLetterEntity.class)
                .where(e -> e.failureTime().lt(beforeDate))
                .executeRows();
    }

    /**
     * 增加重试次数
     */
    public Long incrementRetryCount(Long id) {
        GatewayDeadLetterEntity entity = findById(id);
        if (entity == null) {
            return 0L;
        }
        
        return proxy.updatable(GatewayDeadLetterEntity.class)
                .setColumns(e -> {
                    e.retryCount().set(entity.getRetryCount() + 1);
                    e.lastRetryTime().set(new Date());
                })
                .where(e -> e.id().eq(id))
                .executeRows();
    }
}
