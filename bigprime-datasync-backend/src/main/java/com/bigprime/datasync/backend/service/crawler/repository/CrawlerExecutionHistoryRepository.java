package com.bigprime.datasync.backend.service.crawler.repository;

import cn.hutool.core.util.IdUtil;
import com.bigprime.datasync.core.config.BigprimeEntityQuery;
import com.bigprime.datasync.core.model.MyPageResult;
import com.bigprime.datasync.core.model.MyPager;
import com.bigprime.datasync.backend.handler.model.crawler.CrawlerExecutionHistoryEntity;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.List;

/**
 * 爬虫执行历史Repository
 * 
 * @author bigprime
 * @version 1.0
 */
@Slf4j
@Component
@AllArgsConstructor
public class CrawlerExecutionHistoryRepository {

    private final BigprimeEntityQuery proxy;

    public String save(CrawlerExecutionHistoryEntity entity) {
        if (entity.getId() == null) {
            entity.setId(IdUtil.getSnowflakeNextIdStr());
            entity.setCreateTime(new Date());
        }
        entity.setUpdateTime(new Date());
        
        proxy.insertable(entity).executeRows();
        log.info("保存执行历史: id={}, taskId={}", entity.getId(), entity.getTaskId());
        return entity.getId();
    }

    public CrawlerExecutionHistoryEntity findById(String id) {
        return proxy.queryable(CrawlerExecutionHistoryEntity.class)
                .where(w -> w.id().eq(id))
                .firstOrNull();
    }

    public MyPageResult<CrawlerExecutionHistoryEntity> getPageList(String taskId, Integer page, Integer limit) {
        return proxy.queryable(CrawlerExecutionHistoryEntity.class)
                .where(w -> w.taskId().eq(taskId))
                .orderBy(t -> t.createTime().desc())
                .toPageResult(new MyPager<>(page, limit));
    }

    public List<CrawlerExecutionHistoryEntity> findByTaskId(String taskId, int limit) {
        return proxy.queryable(CrawlerExecutionHistoryEntity.class)
                .where(w -> w.taskId().eq(taskId))
                .orderBy(t -> t.createTime().desc())
                .limit(limit)
                .toList();
    }

    public Long updateStatus(String id, String status) {
        return proxy.updatable(CrawlerExecutionHistoryEntity.class)
                .setColumns(e -> {
                    e.status().set(status);
                    e.updateTime().set(new Date());
                })
                .where(e -> e.id().eq(id))
                .executeRows();
    }
}
