package com.bigprime.datasync.backend.service.trigger;

import com.bigprime.datasync.backend.handler.model.trigger.DagTrigger;
import com.bigprime.datasync.backend.handler.trigger.DagTriggerHandler;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

/**
 * DAG定时调度器
 * <p>
 * 负责扫描并执行到期的定时触发器
 * </p>
 */
@Slf4j
@Service
@AllArgsConstructor
public class DagScheduler {
    
    private final DagTriggerHandler triggerHandler;
    private final DagTriggerService triggerService;

    /**
     * 每分钟扫描一次到期的触发器
     */
    @Scheduled(cron = "0 * * * * ?")
    public void scanAndExecuteTriggers() {
        try {
            log.debug("开始扫描定时触发器...");
            
            // 查询所有启用的CRON类型触发器
            List<DagTrigger> triggers = triggerHandler.listEnabledCronTriggers();
            
            if (triggers.isEmpty()) {
                log.debug("没有启用的定时触发器");
                return;
            }
            
            Date now = new Date();
            int executedCount = 0;
            
            for (DagTrigger trigger : triggers) {
                try {
                    // 检查是否到达触发时间
                    if (trigger.getNextFireTime() != null && 
                        !now.before(trigger.getNextFireTime())) {
                        
                        log.info("触发定时任务: triggerId={}, name={}, nextFireTime={}", 
                                trigger.getId(), trigger.getName(), trigger.getNextFireTime());
                        
                        // 执行触发器
                        String executionId = triggerService.executeTrigger(trigger, false);
                        
                        if (executionId != null) {
                            executedCount++;
                            log.info("定时任务执行成功: triggerId={}, executionId={}", 
                                    trigger.getId(), executionId);
                        } else {
                            log.warn("定时任务被并发策略拦截: triggerId={}", trigger.getId());
                        }
                    }
                } catch (Exception e) {
                    log.error("执行定时触发器失败: triggerId={}, name={}", 
                            trigger.getId(), trigger.getName(), e);
                }
            }
            
            if (executedCount > 0) {
                log.info("定时触发器扫描完成: 共{}个启用触发器, 执行了{}个", 
                        triggers.size(), executedCount);
            }
            
        } catch (Exception e) {
            log.error("扫描定时触发器失败", e);
        }
    }
}
