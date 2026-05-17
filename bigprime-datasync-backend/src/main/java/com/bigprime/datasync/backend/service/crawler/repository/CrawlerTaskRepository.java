package com.bigprime.datasync.backend.service.crawler.repository;

import cn.hutool.core.util.IdUtil;
import com.bigprime.datasync.core.config.BigprimeEntityQuery;
import com.bigprime.datasync.core.model.MyPageResult;
import com.bigprime.datasync.core.model.MyPager;
import com.bigprime.datasync.core.model.SecurityUser;
import com.bigprime.datasync.core.model.UserDetail;
import com.bigprime.datasync.backend.handler.model.crawler.CrawlerTaskEntity;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.List;

/**
 * 爬虫任务Repository
 * 
 * @author bigprime
 * @version 1.0
 */
@Slf4j
@Component
@AllArgsConstructor
public class CrawlerTaskRepository {

    private final BigprimeEntityQuery proxy;

    /**
     * 保存或更新爬虫任务
     */
    public String save(CrawlerTaskEntity entity) {
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
            entity.setEnabled(true);
            entity.setTotalExecutions(0L);
            entity.setSuccessExecutions(0L);
            entity.setFailedExecutions(0L);
            
            proxy.insertable(entity).executeRows();
            log.info("创建爬虫任务成功: id={}, name={}", entity.getId(), entity.getName());
        } else {
            // 更新：先查出原记录，将只读字段（createTime/creator/creatorName/deleted）安全补回
            CrawlerTaskEntity existing = findById(entity.getId());
            if (existing != null) {
                entity.setCreateTime(existing.getCreateTime());
                entity.setCreator(existing.getCreator());
                entity.setCreatorName(existing.getCreatorName());
                entity.setDeleted(existing.getDeleted());
                if (entity.getTotalExecutions() == null) entity.setTotalExecutions(existing.getTotalExecutions());
                if (entity.getSuccessExecutions() == null) entity.setSuccessExecutions(existing.getSuccessExecutions());
                if (entity.getFailedExecutions() == null) entity.setFailedExecutions(existing.getFailedExecutions());
            }
            proxy.updatable(entity).executeRows();
            log.info("更新爬虫任务成功: id={}, name={}", entity.getId(), entity.getName());
        }
        
        return entity.getId();
    }

    /**
     * 根据ID查询
     */
    public CrawlerTaskEntity findById(String id) {
        log.debug("查询爬虫任务: id={}", id);
        return proxy.queryable(CrawlerTaskEntity.class)
                .where(w -> w.id().eq(id))
                .firstOrNull();
    }

    /**
     * 删除任务(逻辑删除)
     */
    public Long delete(String id) {
        log.info("删除爬虫任务: id={}", id);
        CrawlerTaskEntity entity = findById(id);
        if (entity != null) {
            entity.setDeleted(1);
            entity.setUpdateTime(new Date());
            return proxy.updatable(entity).executeRows();
        }
        return 0L;
    }

    /**
     * 分页查询
     */
    public MyPageResult<CrawlerTaskEntity> getPageList(String search, Integer page, Integer limit) {
        return proxy.queryable(CrawlerTaskEntity.class)
                .where(w -> w.deleted().eq(0))
                .where(!search.isEmpty(), w -> {
                    w.or(() -> {
                        w.name().like(search);
                        w.description().like(search);
                        w.targetUrl().like(search);
                    });
                })
                .orderBy(t -> t.createTime().desc())
                .toPageResult(new MyPager<>(page, limit));
    }

    /**
     * 查询所有任务
     */
    public List<CrawlerTaskEntity> findAll() {
        return proxy.queryable(CrawlerTaskEntity.class)
                .where(w -> w.deleted().eq(0))
                .toList();
    }

    /**
     * 根据状态查询
     */
    public List<CrawlerTaskEntity> findByStatus(String status) {
        return proxy.queryable(CrawlerTaskEntity.class)
                .where(w -> {
                    w.deleted().eq(0);
                    w.status().eq(status);
                })
                .toList();
    }

    /**
     * 更新任务状态
     */
    public Long updateStatus(String id, String status) {
        log.info("更新任务状态: id={}, status={}", id, status);
        return proxy.updatable(CrawlerTaskEntity.class)
                .setColumns(e -> {
                    e.status().set(status);
                    e.updateTime().set(new Date());
                })
                .where(e -> e.id().eq(id))
                .executeRows();
    }

    /**
     * 更新执行统计
     */
    public void updateExecutionStats(String id, boolean success) {
        CrawlerTaskEntity entity = findById(id);
        if (entity != null) {
            entity.setTotalExecutions(entity.getTotalExecutions() + 1);
            if (success) {
                entity.setSuccessExecutions(entity.getSuccessExecutions() + 1);
            } else {
                entity.setFailedExecutions(entity.getFailedExecutions() + 1);
            }
            entity.setLastExecutionTime(new Date());
            proxy.updatable(entity).executeRows();
        }
    }
}
