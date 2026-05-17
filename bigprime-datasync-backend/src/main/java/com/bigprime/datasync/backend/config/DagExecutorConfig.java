package com.bigprime.datasync.backend.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * DAG执行器配置
 * 
 * @author bigprime
 */
@Data
@Component
@ConfigurationProperties(prefix = "dag.executor")
public class DagExecutorConfig {
    
    /**
     * 执行模式：http(同步) 或 mq(异步)
     */
    private String mode = "http";
    
    /**
     * MQ配置(仅在mode=mq时生效)
     */
    private MqConfig mq = new MqConfig();
    
    @Data
    public static class MqConfig {
        private String exchange = "dag.execution.exchange";
        private String requestQueue = "dag.execution.request";
        private String responseQueue = "dag.execution.response";
        private String requestRoutingKey = "dag.execution.request";
        private String responseRoutingKey = "dag.execution.response";
    }
}
