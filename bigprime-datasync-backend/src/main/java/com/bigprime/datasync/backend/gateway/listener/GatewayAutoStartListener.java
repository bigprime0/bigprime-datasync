package com.bigprime.datasync.backend.gateway.listener;

import com.bigprime.datasync.backend.gateway.entity.ProtocolGatewayEntity;
import com.bigprime.datasync.backend.gateway.service.ProtocolGatewayService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * 网关自动启动监听器
 * 
 * @author bigprime
 * @version 1.0
 */
@Slf4j
@Component
@AllArgsConstructor
public class GatewayAutoStartListener implements ApplicationListener<ApplicationReadyEvent> {
    
    private final ProtocolGatewayService gatewayService;
    
    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        log.info("========================================");
        log.info("应用启动完成，检查自动启动网关...");
        log.info("========================================");
        
        try {
            // 获取所有自动启动的网关
            List<ProtocolGatewayEntity> autoStartGateways = gatewayService.getAutoStartGateways();
            
            // 同时恢复上次运行状态为 RUNNING 的网关（服务重启后内存丢失，需从数据库恢复）
            List<ProtocolGatewayEntity> runningGateways = gatewayService.getGatewaysByStatus("RUNNING");
            
            // 合并去重（autoStart 且 RUNNING 的只启动一次）
            java.util.Set<Long> toStartIds = new java.util.LinkedHashSet<>();
            autoStartGateways.forEach(g -> toStartIds.add(g.getId()));
            runningGateways.forEach(g -> toStartIds.add(g.getId()));
            
            if (toStartIds.isEmpty()) {
                log.info("无需自动启动的网关");
                return;
            }
            
            log.info("需要启动的网关数: autoStart={}, lastRunning={}, total={}",
                    autoStartGateways.size(), runningGateways.size(), toStartIds.size());
            
            // 逐个启动
            for (Long gatewayId : toStartIds) {
                try {
                    gatewayService.startGateway(gatewayId);
                    log.info("✅ 网关启动成功: id={}", gatewayId);
                } catch (Exception e) {
                    log.error("❌ 网关启动失败: id={}", gatewayId, e);
                    // 启动失败则将数据库状态重置为 STOPPED，避免下次误恢复
                    try {
                        gatewayService.resetGatewayStatus(gatewayId, "STOPPED");
                    } catch (Exception ex) {
                        log.warn("重置网关状态失败: id={}", gatewayId, ex);
                    }
                }
            }
            
            log.info("========================================");
            log.info("网关自动启动完成");
            log.info("========================================");
            
        } catch (Exception e) {
            log.error("网关自动启动异常", e);
        }
    }
}
