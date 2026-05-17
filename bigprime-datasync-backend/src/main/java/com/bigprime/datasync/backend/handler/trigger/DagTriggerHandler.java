package com.bigprime.datasync.backend.handler.trigger;

import cn.hutool.core.util.StrUtil;
import com.bigprime.datasync.core.config.BigprimeEntityQuery;
import com.bigprime.datasync.core.model.MyPageResult;
import com.bigprime.datasync.core.model.MyPager;
import com.bigprime.datasync.backend.handler.model.trigger.DagTrigger;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * DAG触发器Handler
 */
@Slf4j
@Component
@AllArgsConstructor
public class DagTriggerHandler {
    
    private final BigprimeEntityQuery query;

    /**
     * 插入触发器
     */
    public long insert(DagTrigger trigger) {
        log.info("插入触发器: name={}, dagDefinitionId={}", trigger.getName(), trigger.getDagDefinitionId());
        return query.insertable(trigger).executeRows(true);
    }
    
    /**
     * 保存触发器（插入或更新）
     */
    public long save(DagTrigger trigger) {
        if (trigger.getId() == null) {
            return insert(trigger);
        }
        return update(trigger);
    }
    
    /**
     * 更新触发器
     */
    public long update(DagTrigger trigger) {
        log.info("更新触发器: id={}", trigger.getId());
        return query.updatable(trigger).executeRows();
    }
    
    /**
     * 根据ID查询
     */
    public DagTrigger getById(Long id) {
        return query.queryable(DagTrigger.class)
                .whereById(id)
                .firstOrNull();
    }
    
    /**
     * 根据dagDefinitionId查询触发器列表
     */
    public List<DagTrigger> listByDagDefinitionId(String dagDefinitionId) {
        return query.queryable(DagTrigger.class)
                .where(t -> t.dagDefinitionId().eq(dagDefinitionId))
                .orderBy(t -> t.createTime().desc())
                .toList();
    }
    
    /**
     * 查询启用的定时触发器（供调度器扫描）
     */
    public List<DagTrigger> listEnabledCronTriggers() {
        return query.queryable(DagTrigger.class)
                .where(t -> {
                    t.enabled().eq(true);
                    t.and(() -> t.type().eq("CRON"));
                })
                .toList();
    }
    
    /**
     * 分页查询
     */
    public MyPageResult<DagTrigger> getPage(String search, Integer page, Integer limit) {
        return query.queryable(DagTrigger.class)
                .where(StrUtil.isNotBlank(search), t -> {
                    t.or(() -> {
                        t.name().like(search);
                        t.description().like(search);
                    });
                })
                .orderBy(t -> t.createTime().desc())
                .toPageResult(new MyPager<>(page, limit));
    }
    
    /**
     * 删除触发器
     */
    public long deleteById(Long id) {
        log.info("删除触发器: id={}", id);
        return query.deletable(DagTrigger.class)
                .whereById(id)
                .executeRows();
    }
}
