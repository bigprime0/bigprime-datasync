package com.bigprime.datasync.backend.gateway.listener;

import com.bigprime.gateway.core.GatewayManager;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextClosedEvent;
import org.springframework.stereotype.Component;

/**
 * 网关关闭监听器 - 应用停止时优雅关闭所有网关
 * 
 * @author bigprime
 * @version 1.0
 */
@Slf4j
@Component
public class GatewayShutdownListener implements ApplicationListener<ContextClosedEvent> {
    
    private final GatewayManager gatewayManager = GatewayManager.getInstance();
    
    @Override
    public void onApplicationEvent(ContextClosedEvent event) {
        log.info("========================================");
        log.info("应用即将关闭，停止所有网关...");
        log.info("========================================");
        
        try {
            int count = gatewayManager.getGatewayCount();
            if (count == 0) {
                log.info("当前无运行中的网关");
                return;
            }
            
            log.info("正在关闭{}个网关...", count);
            
            // 关闭所有网关
            gatewayManager.shutdownAll();
            
            log.info("========================================");
            log.info("✅ 所有网关已优雅关闭");
            log.info("========================================");
            
        } catch (Exception e) {
            log.error("关闭网关异常", e);
        }
    }
}
