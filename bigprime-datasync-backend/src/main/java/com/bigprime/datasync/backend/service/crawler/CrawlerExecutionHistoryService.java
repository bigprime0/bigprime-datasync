package com.bigprime.datasync.backend.service.crawler;

import com.bigprime.datasync.core.model.MyPageResult;
import com.bigprime.datasync.backend.handler.model.crawler.CrawlerExecutionHistoryEntity;
import com.bigprime.datasync.backend.service.crawler.repository.CrawlerExecutionHistoryRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

/**
 * 爬虫执行历史服务
 * 
 * @author bigprime
 * @version 1.0
 */
@Slf4j
@Service
@AllArgsConstructor
public class CrawlerExecutionHistoryService {

    private final CrawlerExecutionHistoryRepository executionHistoryRepository;

    /**
     * 创建执行历史记录
     */
    public String createExecutionHistory(CrawlerExecutionHistoryEntity history) {
        log.info("创建执行历史记录: taskId={}", history.getTaskId());
        
        if (history.getStatus() == null) {
            history.setStatus("INIT");
        }
        if (history.getStartTime() == null) {
            history.setStartTime(new Date());
        }
        if (history.getProgress() == null) {
            history.setProgress(0);
        }
        
        return executionHistoryRepository.save(history);
    }

    /**
     * 更新执行历史
     */
    public void updateExecutionHistory(CrawlerExecutionHistoryEntity history) {
        log.info("更新执行历史: id={}", history.getId());
        
        // 如果状态变为完成或失败，计算耗时
        if (("SUCCESS".equals(history.getStatus()) || "FAILED".equals(history.getStatus())) 
                && history.getEndTime() == null) {
            history.setEndTime(new Date());
            if (history.getStartTime() != null) {
                history.setDuration(history.getEndTime().getTime() - history.getStartTime().getTime());
            }
        }
        
        executionHistoryRepository.save(history);
    }

    /**
     * 获取执行历史详情
     */
    public CrawlerExecutionHistoryEntity getExecutionHistoryById(String id) {
        return executionHistoryRepository.findById(id);
    }

    /**
     * 分页查询执行历史
     */
    public MyPageResult<CrawlerExecutionHistoryEntity> getExecutionHistoryList(
            String taskId, Integer page, Integer limit) {
        log.debug("查询执行历史列表: taskId={}, page={}, limit={}", taskId, page, limit);
        
        if (page == null || page < 1) {
            page = 1;
        }
        if (limit == null || limit < 1) {
            limit = 20;
        }
        
        return executionHistoryRepository.getPageList(taskId, page, limit);
    }

    /**
     * 获取最近的执行历史
     */
    public List<CrawlerExecutionHistoryEntity> getRecentExecutions(String taskId, int limit) {
        return executionHistoryRepository.findByTaskId(taskId, limit);
    }

    /**
     * 更新执行状态
     */
    public void updateExecutionStatus(String executionId, String status) {
        log.info("更新执行状态: id={}, status={}", executionId, status);
        executionHistoryRepository.updateStatus(executionId, status);
    }
}
