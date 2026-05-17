package com.bigprime.datasync.backend.service.crawler;

import cn.hutool.core.util.StrUtil;
import com.bigprime.datasync.core.model.MyPageResult;
import com.bigprime.datasync.backend.handler.model.crawler.CrawlerTaskEntity;
import com.bigprime.datasync.backend.service.crawler.repository.CrawlerTaskRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * 爬虫任务服务（直接操作 data_crawler_task 表）
 */
@Slf4j
@Service
@AllArgsConstructor
public class CrawlerTaskService {

    private final CrawlerTaskRepository crawlerTaskRepository;

    /**
     * 创建爬虫任务
     */
    @Transactional(rollbackFor = Exception.class)
    public String createTask(CrawlerTaskEntity task) {
        log.info("创建爬虫任务: name={}, websiteUrl={}", task.getName(), task.getWebsiteUrl());
        if (StrUtil.isBlank(task.getName())) {
            throw new IllegalArgumentException("任务名称不能为空");
        }
        if (task.getTaskMode() == null) {
            task.setTaskMode("AGENT");
        }
        if (task.getTaskType() == null) {
            task.setTaskType("MANUAL");
        }
        if (task.getStatus() == null) {
            task.setStatus("READY");
        }
        String id = crawlerTaskRepository.save(task);
        log.info("爬虫任务创建成功: id={}", id);
        return id;
    }

    /**
     * 更新爬虫任务
     */
    @Transactional(rollbackFor = Exception.class)
    public void updateTask(CrawlerTaskEntity task) {
        log.info("更新爬虫任务: id={}", task.getId());
        if (StrUtil.isBlank(task.getId())) {
            throw new IllegalArgumentException("任务ID不能为空");
        }
        CrawlerTaskEntity existing = crawlerTaskRepository.findById(task.getId());
        if (existing == null) {
            throw new IllegalArgumentException("任务不存在: " + task.getId());
        }
        crawlerTaskRepository.save(task);
    }

    /**
     * 删除爬虫任务（逻辑删除）
     */
    @Transactional(rollbackFor = Exception.class)
    public void deleteTask(String id) {
        log.info("删除爬虫任务: id={}", id);
        CrawlerTaskEntity task = crawlerTaskRepository.findById(id);
        if (task == null) {
            throw new IllegalArgumentException("任务不存在: " + id);
        }
        if ("RUNNING".equals(task.getStatus())) {
            throw new IllegalStateException("运行中的任务不能删除");
        }
        crawlerTaskRepository.delete(id);
    }

    /**
     * 获取任务详情
     */
    public CrawlerTaskEntity getTaskById(String id) {
        log.debug("查询任务详情: id={}", id);
        return crawlerTaskRepository.findById(id);
    }

    /**
     * 分页查询任务列表
     */
    public MyPageResult<CrawlerTaskEntity> getTaskList(String search, Integer page, Integer limit) {
        log.debug("查询任务列表: search={}, page={}, limit={}", search, page, limit);
        if (page == null || page < 1) page = 1;
        if (limit == null || limit < 1) limit = 20;
        if (search == null) search = "";
        return crawlerTaskRepository.getPageList(search, page, limit);
    }

    /**
     * 查询所有任务
     */
    public List<CrawlerTaskEntity> getAllTasks() {
        return crawlerTaskRepository.findAll();
    }

    /**
     * 启用/禁用任务
     */
    @Transactional(rollbackFor = Exception.class)
    public void toggleTaskEnabled(String id, boolean enabled) {
        log.info("切换任务启用状态: id={}, enabled={}", id, enabled);
        CrawlerTaskEntity task = crawlerTaskRepository.findById(id);
        if (task == null) {
            throw new IllegalArgumentException("任务不存在: " + id);
        }
        task.setEnabled(enabled);
        crawlerTaskRepository.save(task);
    }

    /**
     * 更新任务状态
     */
    @Transactional(rollbackFor = Exception.class)
    public void updateTaskStatus(String id, String status) {
        log.info("更新任务状态: id={}, status={}", id, status);
        CrawlerTaskEntity task = crawlerTaskRepository.findById(id);
        if (task == null) {
            throw new IllegalArgumentException("任务不存在: " + id);
        }
        task.setStatus(status);
        crawlerTaskRepository.save(task);
    }

    /**
     * 执行任务（预留，Agent 执行由前端直接调 /api/crawler/agent/stream）
     */
    public String executeTask(String id) {
        CrawlerTaskEntity task = crawlerTaskRepository.findById(id);
        if (task == null) {
            throw new IllegalArgumentException("任务不存在: " + id);
        }
        return id;
    }

    /**
     * 更新任务执行统计：总次数+1、成功/失败+1、更新最后执行时间
     */
    public void updateExecutionStats(String id, boolean success) {
        log.info("更新任务执行统计: id={}, success={}", id, success);
        crawlerTaskRepository.updateExecutionStats(id, success);
    }
}
