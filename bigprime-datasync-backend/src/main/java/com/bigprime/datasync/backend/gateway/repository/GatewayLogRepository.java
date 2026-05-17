package com.bigprime.datasync.backend.gateway.repository;

import com.bigprime.datasync.core.config.BigprimeEntityQuery;
import com.bigprime.datasync.core.model.MyPageResult;
import com.bigprime.datasync.core.model.MyPager;
import com.bigprime.datasync.backend.gateway.entity.GatewayLogEntity;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Date;

/**
 * 网关运行日志Repository
 * 
 * @author bigprime
 * @version 1.0
 */
@Slf4j
@Component
@AllArgsConstructor
public class GatewayLogRepository {

    private final BigprimeEntityQuery proxy;

    public Long save(GatewayLogEntity entity) {
        if (entity.getId() == null) {
            entity.setLogTime(new Date());
        }
        
        proxy.insertable(entity).executeRows();
        return entity.getId();
    }

    public MyPageResult<GatewayLogEntity> getPageList(Long gatewayId, String logLevel, 
                                                       Integer page, Integer limit) {
        return proxy.queryable(GatewayLogEntity.class)
                .where(w -> {
                    if (gatewayId != null) {
                        w.gatewayId().eq(gatewayId);
                    }
                    if (logLevel != null && !logLevel.isEmpty()) {
                        w.logLevel().eq(logLevel);
                    }
                })
                .orderBy(t -> t.logTime().desc())
                .toPageResult(new MyPager<>(page, limit));
    }

    public Long deleteByGatewayId(Long gatewayId) {
        return proxy.deletable(GatewayLogEntity.class)
                .where(e -> e.gatewayId().eq(gatewayId))
                .executeRows();
    }
}
