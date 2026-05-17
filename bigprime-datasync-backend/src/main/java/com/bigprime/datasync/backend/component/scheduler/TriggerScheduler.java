package com.bigprime.datasync.backend.component.scheduler;

import com.bigprime.datasync.backend.handler.model.trigger.DagTrigger;
import com.bigprime.datasync.backend.handler.trigger.DagTriggerHandler;
import com.bigprime.datasync.backend.service.trigger.DagTriggerService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.List;

/**
 * DAG触发器调度器
 * <p>
 * 轻量级调度器，使用Spring Scheduling定时扫描启用的触发器，
 * 基于Cron表达式计算到期触发时间，并提交DAG执行。
 * </p>
 * 
 * <p>策略：</p>
 * <ul>
 *   <li>每30秒扫描一次启用的触发器</li>
 *   <li>分批处理避免瞬时高并发</li>
 *   <li>异常隔离，单个触发器失败不影响其他</li>
 *   <li>支持并发策略与去重策略</li>
 * </ul>
 */
@Slf4j
@Component
@AllArgsConstructor
public class TriggerScheduler {
    
    private final DagTriggerHandler triggerHandler;
    private final DagTriggerService triggerService;
    
    /**
     * 每30秒扫描一次触发器
     * <p>
     * fixedDelay保证上一次执行完成后才开始下一次，避免并发执行
     * </p>
     */
    @Scheduled(fixedDelay = 30000, initialDelay = 10000)
    public void scanTriggers() {
        try {
            // 查询所有启用的CRON触发器
            List<DagTrigger> triggers = triggerHandler.listEnabledCronTriggers();
            
            if (triggers.isEmpty()) {
                log.debug("当前无启用的定时触发器");
                return;
            }
            
            log.debug("开始扫描触发器，共{}个", triggers.size());
            
            // 分批处理避免高并发
            int batchSize = 10;
            int batchDelay = 100; // 批次间延迟100ms
            
            for (int i = 0; i < triggers.size(); i += batchSize) {
                int end = Math.min(i + batchSize, triggers.size());
                List<DagTrigger> batch = triggers.subList(i, end);
                
                // 处理当前批次
                processTriggerBatch(batch);
                
                // 批次间延迟
                if (end < triggers.size()) {
                    try {
                        Thread.sleep(batchDelay);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                        log.warn("批次间延迟被中断");
                    }
                }
            }
            
        } catch (Exception e) {
            log.error("扫描触发器失败", e);
        }
    }
    
    /**
     * 处理一批触发器
     */
    private void processTriggerBatch(List<DagTrigger> triggers) {
        Date now = new Date();
        
        for (DagTrigger trigger : triggers) {
            try {
                // 检查是否到期
                if (trigger.getNextFireTime() == null || trigger.getNextFireTime().after(now)) {
                    continue;
                }
                
                log.info("触发器到期，准备执行: triggerId={}, name={}, nextFireTime={}", 
                        trigger.getId(), trigger.getName(), trigger.getNextFireTime());
                
                // 执行触发（包含并发策略检查）
                String executionId = triggerService.executeTrigger(trigger, false);
                
                if (executionId != null) {
                    log.info("触发器执行成功: triggerId={}, executionId={}", trigger.getId(), executionId);
                } else {
                    log.warn("触发器被并发策略拦截: triggerId={}", trigger.getId());
                }
                
            } catch (Exception e) {
                // 异常隔离，单个触发器失败不影响其他
                log.error("触发器执行失败: triggerId={}, name={}", 
                        trigger.getId(), trigger.getName(), e);
            }
        }
    }
}
