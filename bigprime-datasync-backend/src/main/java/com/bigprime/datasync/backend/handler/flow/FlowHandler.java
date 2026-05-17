package com.bigprime.datasync.backend.handler.flow;

import cn.hutool.core.util.StrUtil;
import com.bigprime.datasync.core.config.BigprimeEntityQuery;
import com.bigprime.datasync.core.model.MyPageResult;
import com.bigprime.datasync.core.model.MyPager;
import com.bigprime.datasync.core.model.SecurityUser;
import com.bigprime.datasync.core.model.UserDetail;
import com.bigprime.datasync.backend.handler.model.flow.DataSyncFlow;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Date;

/**
 * 流程编排Handler
 *
 * @author bigprime
 * @version 1.0
 */
@Slf4j
@Component
@AllArgsConstructor
public class FlowHandler {
    
    private final BigprimeEntityQuery query;

    /**
     * 插入流程
     */
    public long insert(DataSyncFlow flow) {
        log.info("[FlowHandler] 开始插入流程: name={}, status={}, taskSource={}",
                flow.getName(), flow.getStatus(), flow.getTaskSource());
        Date now = new Date();
        flow.setCreateTime(now);
        flow.setUpdateTime(now);
        if (StrUtil.isBlank(flow.getStatus())) {
            flow.setStatus("DRAFT");
        }
        // 写入创建人信息
        try {
            UserDetail user = SecurityUser.getUser();
            if (user != null && user.getId() != null && user.getId() > 0) {
                flow.setCreator(user.getId());
                flow.setCreatorName(user.getUsername());
                flow.setUpdater(user.getId());
                flow.setUpdaterName(user.getUsername());
            }
        } catch (Exception ignored) { /* 非 HTTP 上下文（如 AI 工具调用）忽略 */ }
        long rows = query.insertable(flow).executeRows(true);
        log.info("[FlowHandler] 插入流程完成: name={}, id={}, rows={}",
                flow.getName(), flow.getId(), rows);
        return rows;
    }

    /**
     * 更新流程
     */
    public long update(DataSyncFlow flow) {
        log.info("更新流程: {}", flow.getId());
        flow.setUpdateTime(new Date());
        // 写入更新人信息
        try {
            UserDetail user = SecurityUser.getUser();
            if (user != null && user.getId() != null && user.getId() > 0) {
                flow.setUpdater(user.getId());
                flow.setUpdaterName(user.getUsername());
            }
        } catch (Exception ignored) { /* 非 HTTP 上下文忽略 */ }
        // 若前端未传 taskSource，从数据库补上，防止被覆盖为空
        if (StrUtil.isBlank(flow.getTaskSource())) {
            DataSyncFlow existing = getById(String.valueOf(flow.getId()));
            if (existing != null && StrUtil.isNotBlank(existing.getTaskSource())) {
                flow.setTaskSource(existing.getTaskSource());
            }
        }
        return query.updatable(flow).executeRows();
    }

    /**
     * 分页查询流程列表（排除爬虫任务 CRAWLER，显示 MANUAL/ETL 等手动任务）
     */
    public MyPageResult<DataSyncFlow> getPage(String search, String taskSource, Integer page, Integer limit) {
        return query.queryable(DataSyncFlow.class)
                .where(a -> {
                    // 始终排除爬虫自动创建的任务
                    a.taskSource().ne("CRAWLER");
                    if (StrUtil.isNotBlank(search)) {
                        a.or(() -> {
                            a.name().like(search);
                            a.description().like(search);
                        });
                    }
                })
                .orderBy(o -> o.updateTime().desc())
                .toPageResult(new MyPager<>(page, limit));
    }

    /**
     * @deprecated 使用 {@link #getPage(String, String, Integer, Integer)} 代替
     */
    @Deprecated
    public MyPageResult<DataSyncFlow> getPage(String search, Integer page, Integer limit) {
        return getPage(search, null, page, limit);
    }

    /**
     * 根据ID获取流程
     */
    public DataSyncFlow getById(String id) {
        return query.queryable(DataSyncFlow.class)
                .whereById(id)
                .firstOrNull();
    }

    /**
     * 根据ID删除流程（物理删除）
     */
    public long deleteById(String id) {
        log.info("[FlowHandler] 物理删除流程: id={}", id);
        return query.deletable(DataSyncFlow.class)
                .disableLogicDelete()
                .allowDeleteStatement(true)
                .whereById(id)
                .executeRows();
    }

    /**
     * 更新流程状态
     */
    public long updateStatus(String id, String status) {
        log.info("更新流程状态: {} -> {}", id, status);
        return query.updatable(DataSyncFlow.class)
                .setColumns(a -> {
                    a.status().set(status);
                    a.updateTime().set(new Date());
                })
                .whereById(id)
                .executeRows();
    }

    /**
     * 按taskSource分页查询流程列表
     */
    public MyPageResult<DataSyncFlow> getPageByTaskSource(String taskSource, String search, Integer page, Integer limit) {
        return query.queryable(DataSyncFlow.class)
                .where(a -> {
                    a.taskSource().eq(taskSource);
                    if (StrUtil.isNotBlank(search)) {
                        a.or(() -> {
                            a.name().like(search);
                            a.description().like(search);
                        });
                    }
                })
                .orderBy(o -> o.updateTime().desc())
                .toPageResult(new MyPager<>(page, limit));
    }
}
