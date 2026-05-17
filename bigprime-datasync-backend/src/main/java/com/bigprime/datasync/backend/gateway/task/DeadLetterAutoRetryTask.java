package com.bigprime.datasync.backend.gateway.task;

import com.bigprime.datasync.backend.gateway.entity.GatewayDeadLetterEntity;
import com.bigprime.datasync.backend.gateway.repository.GatewayDeadLetterRepository;
import com.bigprime.datasync.backend.gateway.service.GatewayDeadLetterService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * 死信自动重试定时任务
 * 
 * 功能：
 * 1. 每5分钟扫描一次待处理的死信消息
 * 2. 对未达到最大重试次数的死信进行自动重试
 * 3. 统计重试成功率并输出日志
 * 
 * @author bigprime
 * @since 2026-01-20
 */
@Slf4j
@Component
@AllArgsConstructor
public class DeadLetterAutoRetryTask {
    
    private final GatewayDeadLetterRepository deadLetterRepository;
    private final GatewayDeadLetterService deadLetterService;
    
    /**
     * 每5分钟执行一次自动重试
     * cron: 0 *&#47;5 * * * ? (每5分钟的0秒执行)
     */
    @Scheduled(cron = "0 */5 * * * ?")
    public void autoRetryDeadLetters() {
        try {
            log.info("========================================");
            log.info("开始执行死信自动重试任务...");
            log.info("========================================");
            
            // 获取待处理的死信列表（限制100条，避免一次性处理太多）
            List<GatewayDeadLetterEntity> pendingDeadLetters = getPendingDeadLetters(100);
            
            if (pendingDeadLetters.isEmpty()) {
                log.info("没有待重试的死信消息");
                log.info("========================================");
                return;
            }
            
            log.info("发现 {} 条待重试的死信消息", pendingDeadLetters.size());
            
            int successCount = 0;
            int failedCount = 0;
            int skippedCount = 0;
            
            // 逐个重试
            for (GatewayDeadLetterEntity deadLetter : pendingDeadLetters) {
                try {
                    // 检查重试次数
                    if (deadLetter.getRetryCount() >= deadLetter.getMaxRetryCount()) {
                        log.warn("死信已达最大重试次数，跳过: id={}, retryCount={}, maxRetryCount={}", 
                                deadLetter.getId(), deadLetter.getRetryCount(), deadLetter.getMaxRetryCount());
                        skippedCount++;
                        
                        // 标记为失败
                        deadLetterService.updateDeadLetterStatus(deadLetter.getId(), "FAILED", "重试次数已达上限");
                        continue;
                    }
                    
                    // 执行重试
                    log.debug("重试死信: id={}, gatewayId={}, retryCount={}", 
                            deadLetter.getId(), deadLetter.getGatewayId(), deadLetter.getRetryCount());
                    
                    boolean success = deadLetterService.retryDeadLetter(deadLetter.getId());
                    
                    if (success) {
                        successCount++;
                        log.debug("✅ 死信重试成功: id={}", deadLetter.getId());
                    } else {
                        failedCount++;
                        log.debug("❌ 死信重试失败: id={}", deadLetter.getId());
                    }
                    
                    // 避免过快执行，每条消息间隔100ms
                    Thread.sleep(100);
                    
                } catch (Exception e) {
                    failedCount++;
                    log.error("死信重试异常: id={}", deadLetter.getId(), e);
                }
            }
            
            // 输出统计信息
            log.info("========================================");
            log.info("死信自动重试完成:");
            log.info("  总数: {}", pendingDeadLetters.size());
            log.info("  成功: {} ({:.2f}%)", successCount, calculatePercentage(successCount, pendingDeadLetters.size()));
            log.info("  失败: {} ({:.2f}%)", failedCount, calculatePercentage(failedCount, pendingDeadLetters.size()));
            log.info("  跳过: {} ({:.2f}%)", skippedCount, calculatePercentage(skippedCount, pendingDeadLetters.size()));
            log.info("========================================");
            
        } catch (Exception e) {
            log.error("死信自动重试任务执行失败", e);
        }
    }
    
    /**
     * 每小时输出一次死信统计
     * cron: 0 0 * * * ? (每小时的第0分0秒执行)
     */
    @Scheduled(cron = "0 0 * * * ?")
    public void reportDeadLetterStatistics() {
        try {
            log.info("========================================");
            log.info("死信队列统计报告");
            log.info("========================================");
            
            // 统计各状态的死信数量
            long pendingCount = countByStatus("PENDING");
            long successCount = countByStatus("SUCCESS");
            long failedCount = countByStatus("FAILED");
            long totalCount = pendingCount + successCount + failedCount;
            
            log.info("总死信数: {}", totalCount);
            log.info("待处理: {} ({:.2f}%)", pendingCount, calculatePercentage(pendingCount, totalCount));
            log.info("已成功: {} ({:.2f}%)", successCount, calculatePercentage(successCount, totalCount));
            log.info("已失败: {} ({:.2f}%)", failedCount, calculatePercentage(failedCount, totalCount));
            
            // 统计需要人工干预的死信（达到最大重试次数但仍未成功）
            long needManualIntervention = countNeedManualIntervention();
            if (needManualIntervention > 0) {
                log.warn("⚠️  需要人工干预的死信: {} 条", needManualIntervention);
            }
            
            log.info("========================================");
            
        } catch (Exception e) {
            log.error("死信统计报告生成失败", e);
        }
    }
    
    /**
     * 获取待处理的死信列表
     */
    private List<GatewayDeadLetterEntity> getPendingDeadLetters(int limit) {
        try {
            return deadLetterRepository.findAllPending(limit);
        } catch (Exception e) {
            log.error("获取待处理死信列表失败", e);
            return new ArrayList<>();
        }
    }
    
    /**
     * 统计指定状态的死信数量
     */
    private long countByStatus(String status) {
        try {
            return deadLetterRepository.countByStatus(status);
        } catch (Exception e) {
            log.error("统计死信数量失败: status={}", status, e);
            return 0L;
        }
    }
    
    /**
     * 统计需要人工干预的死信数量
     * （重试次数已达上限但状态仍为PENDING的记录）
     */
    private long countNeedManualIntervention() {
        try {
            return deadLetterRepository.countNeedManualIntervention();
        } catch (Exception e) {
            log.error("统计需人工干预的死信数量失败", e);
            return 0L;
        }
    }
    
    /**
     * 计算百分比
     */
    private double calculatePercentage(long part, long total) {
        if (total == 0) {
            return 0.0;
        }
        return (part * 100.0) / total;
    }
}
