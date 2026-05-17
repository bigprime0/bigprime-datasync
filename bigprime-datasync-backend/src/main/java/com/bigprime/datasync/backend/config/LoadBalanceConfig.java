package com.bigprime.datasync.backend.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Worker负载均衡配置
 * 
 * @author bigprime
 */
@Data
@Component
@ConfigurationProperties(prefix = "worker.loadbalance")
public class LoadBalanceConfig {

    /**
     * 负载均衡策略: RANDOM, ROUND_ROBIN, LEAST_ACTIVE, WEIGHTED, RESOURCE_BASED
     */
    private String strategy = "LEAST_ACTIVE";
    
    /**
     * 是否启用容量预留（默认启用）
     */
    private Boolean capacityReserve = true;
    
    /**
     * 容量预留百分比（0-100），默认20%
     */
    private Integer reservePercentage = 20;
    
    /**
     * 是否启用健康检查（默认启用）
     */
    private Boolean healthCheck = true;
    
    /**
     * 健康检查超时时间（秒），默认3秒
     */
    private Integer healthCheckTimeout = 3;
    
    /**
     * 故障转移最大重试次数，默认3次
     */
    private Integer maxRetry = 3;
    
    /**
     * 是否启用基于资源的调度（默认启用）
     */
    private Boolean resourceBased = true;
    
    /**
     * CPU使用率阈值（0-100），超过此值降低优先级，默认80%
     */
    private Integer cpuThreshold = 80;
    
    /**
     * 内存使用率阈值（0-100），超过此值降低优先级，默认80%
     */
    private Integer memoryThreshold = 80;
    
    /**
     * Worker标签优先级配置
     * 例如: {"high-performance": 100, "normal": 50, "low-cost": 10}
     */
    private Map<String, Integer> tagPriority = new HashMap<>();
    
    /**
     * 是否启用告警（默认启用）
     */
    private Boolean alertEnabled = true;
    
    /**
     * Worker不可用告警阈值（连续失败次数），默认3次
     */
    private Integer alertThreshold = 3;
    
    /**
     * 资源使用率权重配置（用于综合评分）
     */
    private ResourceWeight resourceWeight = new ResourceWeight();
    
    @Data
    public static class ResourceWeight {
        /**
         * CPU权重（0-1），默认0.3
         */
        private Double cpu = 0.3;
        
        /**
         * 内存权重（0-1），默认0.3
         */
        private Double memory = 0.3;
        
        /**
         * 任务负载权重（0-1），默认0.4
         */
        private Double taskLoad = 0.4;
    }
    
    /**
     * 获取标签优先级，默认50
     */
    public int getTagPriority(String tag) {
        return tagPriority.getOrDefault(tag, 50);
    }
    
    /**
     * 计算有效容量（考虑预留）
     */
    public int getEffectiveCapacity(int maxConcurrentTasks) {
        if (!capacityReserve) {
            return maxConcurrentTasks;
        }
        return (int) (maxConcurrentTasks * (100 - reservePercentage) / 100.0);
    }
}
