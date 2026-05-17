package com.bigprime.datasync.backend.gateway.task;

import com.bigprime.datasync.backend.gateway.repository.ProtocolGatewayRepository;
import com.bigprime.gateway.core.AbstractGateway;
import com.bigprime.gateway.core.GatewayManager;
import com.bigprime.gateway.core.GatewayStatistics;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * 网关统计更新定时任务
 * 
 * @author bigprime
 * @version 1.0
 */
@Slf4j
@Component
@AllArgsConstructor
public class GatewayStatisticsUpdateTask {
    
    private final ProtocolGatewayRepository gatewayRepository;
    private final GatewayManager gatewayManager = GatewayManager.getInstance();
    
    /**
     * 每30秒更新一次统计数据
     */
    @Scheduled(fixedRate = 30000)
    public void updateStatistics() {
        try {
            int gatewayCount = gatewayManager.getGatewayCount();
            if (gatewayCount == 0) {
                return;
            }
            
            log.debug("开始更新网关统计数据: count={}", gatewayCount);
            
            // 遍历所有网关，更新统计
            for (int i = 1; i <= 1000; i++) { // 假设ID范围
                AbstractGateway gateway = gatewayManager.getGateway((long) i);
                if (gateway == null) {
                    continue;
                }
                
                GatewayStatistics statistics = gateway.getStatistics();
                if (statistics != null) {
                    // 更新数据库
                    gatewayRepository.updateStatistics(
                            statistics.getGatewayId(),
                            statistics.getMessageCount(),
                            statistics.getErrorCount()
                    );
                    
                    log.debug("更新网关统计: gatewayId={}, messageCount={}, errorCount={}", 
                            statistics.getGatewayId(), 
                            statistics.getMessageCount(), 
                            statistics.getErrorCount());
                }
            }
            
        } catch (Exception e) {
            log.error("更新网关统计数据失败", e);
        }
    }
    
    /**
     * 每分钟输出一次运行状态
     */
    @Scheduled(fixedRate = 60000)
    public void reportStatus() {
        try {
            int totalCount = gatewayManager.getGatewayCount();
            long runningCount = gatewayManager.getRunningGatewayCount();
            
            if (totalCount > 0) {
                log.info("=== 网关运行状态 ===");
                log.info("总网关数: {}", totalCount);
                log.info("运行中: {}", runningCount);
                log.info("停止中: {}", totalCount - runningCount);
                log.info("===================");
            }
        } catch (Exception e) {
            log.error("输出网关状态失败", e);
        }
    }
}
