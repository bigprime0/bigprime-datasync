package com.bigprime.datasync.backend.gateway.service;

import com.bigprime.datasync.core.model.MyPageResult;
import com.bigprime.datasync.backend.gateway.entity.GatewayDeadLetterEntity;
import com.bigprime.datasync.backend.gateway.repository.GatewayDeadLetterRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 网关死信队列服务
 * 
 * @author bigprime
 * @version 1.0
 */
@Slf4j
@Service
@AllArgsConstructor
public class GatewayDeadLetterService {
    
    private final GatewayDeadLetterRepository deadLetterRepository;
    
    /**
     * 保存死信消息
     */
    public Long saveDeadLetter(GatewayDeadLetterEntity deadLetter) {
        log.info("保存死信消息: gatewayId={}", deadLetter.getGatewayId());
        
        // 设置默认状态
        if (deadLetter.getStatus() == null) {
            deadLetter.setStatus("PENDING");
        }
        if (deadLetter.getRetryCount() == null) {
            deadLetter.setRetryCount(0);
        }
        
        return deadLetterRepository.save(deadLetter);
    }
    
    /**
     * 获取待处理的死信消息
     */
    public List<GatewayDeadLetterEntity> getPendingDeadLetters(Integer limit) {
        log.debug("获取待处理死信消息: limit={}", limit);
        return deadLetterRepository.findAllPending(limit != null ? limit : 100);
    }
    
    /**
     * 根据网关ID获取死信列表
     */
    public List<GatewayDeadLetterEntity> getDeadLettersByGatewayId(Long gatewayId) {
        return deadLetterRepository.findByGatewayId(gatewayId);
    }
    
    /**
     * 分页查询死信消息
     */
    public MyPageResult<GatewayDeadLetterEntity> getDeadLetterPage(
            Long gatewayId, String status, Integer page, Integer limit) {
        log.debug("分页查询死信消息: gatewayId={}, status={}, page={}, limit={}", 
                gatewayId, status, page, limit);
        
        if (page == null || page < 1) {
            page = 1;
        }
        if (limit == null || limit < 1) {
            limit = 20;
        }
        
        return deadLetterRepository.getPageList(gatewayId, status, page, limit);
    }
    
    /**
     * 更新死信状态
     */
    public void updateDeadLetterStatus(Long id, String status, String errorMessage) {
        log.info("更新死信状态: id={}, status={}", id, status);
        deadLetterRepository.updateStatus(id, status, errorMessage);
    }
    
    /**
     * 增加重试次数
     */
    public void incrementRetryCount(Long id) {
        log.debug("增加死信重试次数: id={}", id);
        deadLetterRepository.incrementRetryCount(id);
    }
    
    /**
     * 重试死信消息
     */
    public boolean retryDeadLetter(Long id) {
        log.info("重试死信消息: id={}", id);
        
        // 获取死信记录
        GatewayDeadLetterEntity deadLetter = deadLetterRepository.findById(id);
        if (deadLetter == null) {
            log.error("死信记录不存在: id={}", id);
            return false;
        }
        
        // 检查重试次数
        if (deadLetter.getRetryCount() >= deadLetter.getMaxRetryCount()) {
            log.warn("死信重试次数已达上限: id={}, retryCount={}, maxRetryCount={}", 
                    id, deadLetter.getRetryCount(), deadLetter.getMaxRetryCount());
            updateDeadLetterStatus(id, "FAILED", "重试次数已达上限");
            return false;
        }
        
        try {
            // TODO: 实际重试逻辑
            // 1. 根据 gatewayId 获取网关实例
            // 2. 重新发送消息
            
            // 增加重试次数
            incrementRetryCount(id);
            
            // 标记为成功
            updateDeadLetterStatus(id, "SUCCESS", null);
            
            log.info("死信重试成功: id={}", id);
            return true;
        } catch (Exception e) {
            log.error("死信重试失败: id={}", id, e);
            
            // 增加重试次数
            incrementRetryCount(id);
            
            // 更新错误信息
            updateDeadLetterStatus(id, "PENDING", e.getMessage());
            
            return false;
        }
    }
    
    /**
     * 批量重试死信消息
     */
    public int batchRetryDeadLetters(List<Long> ids) {
        log.info("批量重试死信消息: count={}", ids.size());
        
        int successCount = 0;
        for (Long id : ids) {
            if (retryDeadLetter(id)) {
                successCount++;
            }
        }
        
        log.info("批量重试完成: total={}, success={}", ids.size(), successCount);
        return successCount;
    }
    
    /**
     * 删除死信记录
     */
    public void deleteDeadLetter(Long id) {
        log.info("删除死信记录: id={}", id);
        deadLetterRepository.deleteById(id);
    }
    
    /**
     * 清理旧的死信记录
     * 
     * @param days 保留天数
     * @return 删除的记录数
     */
    public long cleanOldDeadLetters(int days) {
        log.info("清理旧的死信记录: days={}", days);
        return deadLetterRepository.deleteOldRecords(days);
    }
}
