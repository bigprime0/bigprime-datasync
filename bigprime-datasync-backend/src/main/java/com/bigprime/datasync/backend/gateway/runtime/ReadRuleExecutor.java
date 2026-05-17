package com.bigprime.datasync.backend.gateway.runtime;

import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONObject;
import com.bigprime.connector.manager.ConnectorManager;
import com.bigprime.datasync.backend.gateway.entity.GatewayReadRuleEntity;
import lombok.extern.slf4j.Slf4j;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * 读取规则执行器
 * 根据规则配置执行数据读取
 * 
 * @author bigprime
 * @version 1.0
 */
@Slf4j
public class ReadRuleExecutor {
    
    private final GatewayReadRuleEntity rule;
    private final ConnectorManager connectorManager;
    private final String sourceConnectorId;
    private final int defaultPollingInterval;
    private final DataCollectCallback callback;
    
    private ScheduledExecutorService scheduler;
    private volatile boolean running = false;
    
    /**
     * 数据采集回调接口
     */
    public interface DataCollectCallback {
        void onDataCollected(Map<String, Object> data);
        void onError(Exception e);
    }
    
    public ReadRuleExecutor(
            GatewayReadRuleEntity rule,
            ConnectorManager connectorManager,
            String sourceConnectorId,
            int defaultPollingInterval,
            DataCollectCallback callback) {
        this.rule = rule;
        this.connectorManager = connectorManager;
        this.sourceConnectorId = sourceConnectorId;
        this.defaultPollingInterval = defaultPollingInterval;
        this.callback = callback;
    }
    
    /**
     * 启动执行器
     */
    public void start() {
        if (running) {
            log.warn("规则执行器已经在运行: ruleId={}", rule.getId());
            return;
        }
        
        running = true;
        log.info("启动规则执行器: ruleId={}, ruleName={}, ruleType={}", 
                rule.getId(), rule.getRuleName(), rule.getRuleType());
        
        String ruleType = rule.getRuleType();
        
        switch (ruleType) {
            case "POLLING":
                startPolling();
                break;
            case "SUBSCRIBE":
                startSubscribe();
                break;
            case "EVENT":
                startEventTrigger();
                break;
            case "CONDITION":
                startConditionCheck();
                break;
            default:
                log.warn("不支持的规则类型: {}", ruleType);
        }
    }
    
    /**
     * 停止执行器
     */
    public void stop() {
        if (!running) {
            return;
        }
        
        running = false;
        log.info("停止规则执行器: ruleId={}, ruleName={}", rule.getId(), rule.getRuleName());
        
        if (scheduler != null) {
            scheduler.shutdownNow();
            scheduler = null;
        }
    }
    
    /**
     * 启动定时轮询
     */
    private void startPolling() {
        // 解析规则配置
        int interval = defaultPollingInterval;
        JSONObject config = parseRuleConfig();
        
        if (config != null && config.containsKey("interval")) {
            interval = config.getInteger("interval");
        }
        
        log.info("启动定时轮询: ruleId={}, interval={}ms", rule.getId(), interval);
        
        // 创建定时任务
        scheduler = Executors.newSingleThreadScheduledExecutor();
        scheduler.scheduleWithFixedDelay(() -> {
            try {
                Map<String, Object> data = collectData(config);
                if (data != null && !data.isEmpty()) {
                    callback.onDataCollected(data);
                }
            } catch (Exception e) {
                log.error("轮询数据读取失败: ruleId={}", rule.getId(), e);
                callback.onError(e);
            }
        }, 0, interval, TimeUnit.MILLISECONDS);
    }
    
    /**
     * 启动订阅模式（暂未实现）
     */
    private void startSubscribe() {
        log.info("订阅模式暂未实现: ruleId={}", rule.getId());
        // TODO: 实现MQTT订阅等
    }
    
    /**
     * 启动事件触发模式（暂未实现）
     */
    private void startEventTrigger() {
        log.info("事件触发模式暂未实现: ruleId={}", rule.getId());
        // TODO: 实现事件监听
    }
    
    /**
     * 启动条件检查模式（暂未实现）
     */
    private void startConditionCheck() {
        log.info("条件检查模式暂未实现: ruleId={}", rule.getId());
        // TODO: 实现条件判断循环
    }
    
    /**
     * 执行数据采集
     */
    private Map<String, Object> collectData(JSONObject config) throws Exception {
        // 调用连接器的readData方法
        Map<String, Object> params = new HashMap<>();
        
        if (config != null) {
            params.putAll(config);
        }
        
        // TODO: 根据协议类型调用对应的readData实现
        // 当前先返回模拟数据
        Map<String, Object> data = new HashMap<>();
        data.put("ruleName", rule.getRuleName());
        data.put("ruleId", rule.getId());
        data.put("timestamp", System.currentTimeMillis());
        data.put("value", Math.random() * 100);
        
        // 添加字段映射
        if (rule.getFieldName() != null) {
            data.put("fieldName", rule.getFieldName());
            data.put("fieldType", rule.getFieldType());
        }
        
        return data;
    }
    
    /**
     * 解析规则配置
     */
    private JSONObject parseRuleConfig() {
        if (rule.getRuleConfig() == null || rule.getRuleConfig().trim().isEmpty()) {
            return null;
        }
        
        try {
            return JSON.parseObject(rule.getRuleConfig());
        } catch (Exception e) {
            log.error("解析规则配置失败: ruleId={}, config={}", 
                    rule.getId(), rule.getRuleConfig(), e);
            return null;
        }
    }
    
    public boolean isRunning() {
        return running;
    }
    
    public Long getRuleId() {
        return rule.getId();
    }
    
    public String getRuleName() {
        return rule.getRuleName();
    }
}
