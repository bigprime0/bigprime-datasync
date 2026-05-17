package com.bigprime.datasync.backend.gateway.runtime;

import com.bigprime.connector.manager.ConnectorManager;
import com.bigprime.datasync.backend.gateway.entity.GatewayReadRuleEntity;
import com.bigprime.datasync.backend.gateway.entity.ProtocolGatewayEntity;
import com.bigprime.gateway.core.GatewayConfig;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.serialization.StringSerializer;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * 网关运行时 - 管理读取规则执行器和数据发送
 * 
 * @author bigprime
 * @version 1.0
 */
@Slf4j
public class GatewayRuntime {
    
    private final Long gatewayId;
    private final GatewayConfig config;
    private final List<GatewayReadRuleEntity> rules;
    private final ConnectorManager connectorManager;
    
    private final Map<Long, ReadRuleExecutor> executors = new ConcurrentHashMap<>();
    private KafkaProducer<String, String> kafkaProducer;
    
    private final AtomicLong messageCount = new AtomicLong(0);
    private final AtomicLong errorCount = new AtomicLong(0);
    
    private volatile boolean running = false;
    
    public GatewayRuntime(
            ProtocolGatewayEntity gateway,
            GatewayConfig config,
            List<GatewayReadRuleEntity> rules,
            ConnectorManager connectorManager) {
        this.gatewayId = gateway.getId();
        this.config = config;
        this.rules = rules != null ? rules : new ArrayList<>();
        this.connectorManager = connectorManager;
    }
    
    /**
     * 启动网关运行时
     */
    public void start() throws Exception {
        if (running) {
            log.warn("网关运行时已经启动: gatewayId={}", gatewayId);
            return;
        }
        
        log.info("启动网关运行时: gatewayId={}, rules={}", gatewayId, rules.size());
        
        // 初始化Kafka生产者
        initKafkaProducer();
        
        // 启动所有启用的读取规则执行器
        for (GatewayReadRuleEntity rule : rules) {
            if (rule.getEnabled() != null && rule.getEnabled()) {
                startRuleExecutor(rule);
            }
        }
        
        running = true;
        log.info("网关运行时启动成功: gatewayId={}, activeRules={}", 
                gatewayId, executors.size());
    }
    
    /**
     * 停止网关运行时
     */
    public void stop() {
        if (!running) {
            return;
        }
        
        log.info("停止网关运行时: gatewayId={}", gatewayId);
        running = false;
        
        // 停止所有规则执行器
        for (ReadRuleExecutor executor : executors.values()) {
            try {
                executor.stop();
            } catch (Exception e) {
                log.error("停止规则执行器失败: ruleId={}", executor.getRuleId(), e);
            }
        }
        executors.clear();
        
        // 关闭Kafka生产者
        if (kafkaProducer != null) {
            try {
                kafkaProducer.close();
            } catch (Exception e) {
                log.error("关闭Kafka生产者失败: gatewayId={}", gatewayId, e);
            }
            kafkaProducer = null;
        }
        
        log.info("网关运行时已停止: gatewayId={}", gatewayId);
    }
    
    /**
     * 启动规则执行器
     */
    private void startRuleExecutor(GatewayReadRuleEntity rule) {
        try {
            ReadRuleExecutor executor = new ReadRuleExecutor(
                    rule,
                    connectorManager,
                    config.getSourceConnectorId().toString(),
                    config.getPollingInterval(),
                    new ReadRuleExecutor.DataCollectCallback() {
                        @Override
                        public void onDataCollected(Map<String, Object> data) {
                            handleDataCollected(rule, data);
                        }
                        
                        @Override
                        public void onError(Exception e) {
                            handleError(rule, e);
                        }
                    }
            );
            
            executor.start();
            executors.put(rule.getId(), executor);
            
            log.info("规则执行器已启动: gatewayId={}, ruleId={}, ruleName={}", 
                    gatewayId, rule.getId(), rule.getRuleName());
        } catch (Exception e) {
            log.error("启动规则执行器失败: ruleId={}, ruleName={}", 
                    rule.getId(), rule.getRuleName(), e);
        }
    }
    
    /**
     * 处理采集到的数据
     */
    private void handleDataCollected(GatewayReadRuleEntity rule, Map<String, Object> data) {
        try {
            // 添加网关和规则信息
            data.put("gatewayId", gatewayId);
            data.put("gatewayName", config.getGatewayName());
            data.put("ruleId", rule.getId());
            data.put("ruleName", rule.getRuleName());
            
            // 转换为JSON字符串
            String jsonData = com.alibaba.fastjson2.JSON.toJSONString(data);
            
            // 发送到Kafka
            sendToKafka(jsonData);
            
            // 更新统计
            messageCount.incrementAndGet();
            
            log.debug("数据已采集并发送: gatewayId={}, ruleId={}, data={}", 
                    gatewayId, rule.getId(), jsonData);
        } catch (Exception e) {
            log.error("处理采集数据失败: gatewayId={}, ruleId={}", 
                    gatewayId, rule.getId(), e);
            errorCount.incrementAndGet();
        }
    }
    
    /**
     * 处理错误
     */
    private void handleError(GatewayReadRuleEntity rule, Exception e) {
        errorCount.incrementAndGet();
        log.error("规则执行出错: gatewayId={}, ruleId={}, ruleName={}", 
                gatewayId, rule.getId(), rule.getRuleName(), e);
    }
    
    /**
     * 初始化Kafka生产者
     */
    private void initKafkaProducer() {
        Properties props = new Properties();
        props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, config.getKafkaBootstrapServers());
        props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
        props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
        props.put(ProducerConfig.ACKS_CONFIG, "1");
        props.put(ProducerConfig.RETRIES_CONFIG, 3);
        props.put(ProducerConfig.BATCH_SIZE_CONFIG, 16384);
        props.put(ProducerConfig.LINGER_MS_CONFIG, 10);
        props.put(ProducerConfig.BUFFER_MEMORY_CONFIG, 33554432);
        
        kafkaProducer = new KafkaProducer<>(props);
        log.info("Kafka生产者初始化成功: gatewayId={}, topic={}, servers={}", 
                gatewayId, config.getKafkaTopic(), config.getKafkaBootstrapServers());
    }
    
    /**
     * 发送数据到Kafka
     */
    private void sendToKafka(String data) {
        if (kafkaProducer == null) {
            log.warn("Kafka生产者未初始化，跳过发送: gatewayId={}", gatewayId);
            return;
        }
        
        try {
            ProducerRecord<String, String> record = new ProducerRecord<>(
                    config.getKafkaTopic(),
                    String.valueOf(gatewayId),
                    data
            );
            
            kafkaProducer.send(record, (metadata, exception) -> {
                if (exception != null) {
                    log.error("发送数据到Kafka失败: gatewayId={}, topic={}", 
                            gatewayId, config.getKafkaTopic(), exception);
                    errorCount.incrementAndGet();
                }
            });
        } catch (Exception e) {
            log.error("发送Kafka消息异常: gatewayId={}", gatewayId, e);
            errorCount.incrementAndGet();
        }
    }
    
    /**
     * 添加规则执行器（动态添加规则）
     */
    public void addRule(GatewayReadRuleEntity rule) {
        if (!running) {
            log.warn("网关运行时未启动，无法添加规则: gatewayId={}", gatewayId);
            return;
        }
        
        if (rule.getEnabled() != null && rule.getEnabled()) {
            startRuleExecutor(rule);
        }
    }
    
    /**
     * 移除规则执行器（动态移除规则）
     */
    public void removeRule(Long ruleId) {
        ReadRuleExecutor executor = executors.remove(ruleId);
        if (executor != null) {
            executor.stop();
            log.info("规则执行器已移除: gatewayId={}, ruleId={}", gatewayId, ruleId);
        }
    }
    
    public boolean isRunning() {
        return running;
    }
    
    public long getMessageCount() {
        return messageCount.get();
    }
    
    public long getErrorCount() {
        return errorCount.get();
    }
    
    public int getActiveRulesCount() {
        return executors.size();
    }
}
