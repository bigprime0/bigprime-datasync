package com.bigprime.datasync.backend.gateway.service;

import com.bigprime.connector.entities.ConnectorMetaEntity;
import com.bigprime.connector.manager.ConnectorManager;
import com.bigprime.connector.param.KafkaParam;
import com.bigprime.connector.service.ConnectorService;
import com.bigprime.datasync.core.model.MyPageResult;
import com.bigprime.datasync.backend.gateway.entity.GatewayReadRuleEntity;
import com.bigprime.datasync.backend.gateway.entity.ProtocolGatewayEntity;
import com.bigprime.datasync.backend.gateway.factory.GatewayFactory;
import com.bigprime.datasync.backend.gateway.repository.ProtocolGatewayRepository;
import com.bigprime.datasync.backend.gateway.runtime.GatewayRuntime;
import com.bigprime.gateway.core.AbstractGateway;
import com.bigprime.gateway.core.GatewayConfig;
import com.bigprime.gateway.core.GatewayManager;
import com.bigprime.gateway.core.GatewayStatistics;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 协议网关服务
 * 
 * @author bigprime
 * @version 1.0
 */
@Slf4j
@Service
@AllArgsConstructor
public class ProtocolGatewayService {

    private final ProtocolGatewayRepository gatewayRepository;
    private final GatewayFactory gatewayFactory;
    private final ConnectorService connectorService;
    private final GatewayReadRuleService readRuleService;
    private final ConnectorManager connectorManager;
    private final GatewayManager gatewayManager = GatewayManager.getInstance();
    
    // 网关运行时实例缓存
    private final Map<Long, GatewayRuntime> runtimeCache = new ConcurrentHashMap<>();

    /**
     * 创建网关配置
     */
    public Long createGateway(ProtocolGatewayEntity gateway) {
        log.info("创建网关配置: name={}", gateway.getName());
        
        // 从源连接器自动填充协议类型
        if (gateway.getSourceConnectorId() != null) {
            try {
                ConnectorMetaEntity sourceConnector = connectorService.getConnectorById(
                    gateway.getSourceConnectorId().toString());
                if (sourceConnector != null) {
                    gateway.setProtocolType(sourceConnector.getProduct().toUpperCase());
                    log.info("从连接器自动填充协议类型: {}", gateway.getProtocolType());
                }
            } catch (Exception e) {
                log.warn("获取源连接器失败: connectorId={}", gateway.getSourceConnectorId(), e);
            }
        }
        
        // 设置默认值
        if (gateway.getStatus() == null) {
            gateway.setStatus("STOPPED");
        }
        if (gateway.getPollingInterval() == null) {
            gateway.setPollingInterval(1000);
        }
        if (gateway.getMaxTps() == null) {
            gateway.setMaxTps(1000);
        }
        if (gateway.getBackpressureStrategy() == null) {
            gateway.setBackpressureStrategy("BLOCK");
        }
        if (gateway.getEnableCircuitBreaker() == null) {
            gateway.setEnableCircuitBreaker(true);
        }
        if (gateway.getFailureThreshold() == null) {
            gateway.setFailureThreshold(50);
        }
        if (gateway.getCircuitSleepWindow() == null) {
            gateway.setCircuitSleepWindow(60000);
        }
        if (gateway.getMemoryBufferSize() == null) {
            gateway.setMemoryBufferSize(10000);
        }
        if (gateway.getDiskBufferEnabled() == null) {
            gateway.setDiskBufferEnabled(true);
        }
        if (gateway.getMaxRetryCount() == null) {
            gateway.setMaxRetryCount(3);
        }
        if (gateway.getAutoStart() == null) {
            gateway.setAutoStart(false);
        }
        if (gateway.getMessageCount() == null) {
            gateway.setMessageCount(0L);
        }
        if (gateway.getErrorCount() == null) {
            gateway.setErrorCount(0L);
        }
        
        return gatewayRepository.save(gateway);
    }

    /**
     * 更新网关配置
     */
    public void updateGateway(ProtocolGatewayEntity gateway) {
        log.info("更新网关配置: id={}, name={}", gateway.getId(), gateway.getName());
        
        // 如果更改了源连接器,重新填充协议类型
        if (gateway.getSourceConnectorId() != null) {
            try {
                ConnectorMetaEntity sourceConnector = connectorService.getConnectorById(
                    gateway.getSourceConnectorId().toString());
                if (sourceConnector != null) {
                    gateway.setProtocolType(sourceConnector.getProduct().toUpperCase());
                    log.info("更新协议类型: {}", gateway.getProtocolType());
                }
            } catch (Exception e) {
                log.warn("获取源连接器失败: connectorId={}", gateway.getSourceConnectorId(), e);
            }
        }
        
        gatewayRepository.update(gateway);
    }

    /**
     * 获取网关详情
     */
    public ProtocolGatewayEntity getGatewayById(Long id) {
        return gatewayRepository.findById(id);
    }

    /**
     * 获取所有网关
     */
    public List<ProtocolGatewayEntity> getAllGateways() {
        return gatewayRepository.findAll();
    }

    /**
     * 分页查询网关列表
     */
    public MyPageResult<ProtocolGatewayEntity> getGatewayList(
            String name, String protocolType, String status, Integer page, Integer limit) {
        log.debug("查询网关列表: name={}, protocolType={}, status={}, page={}, limit={}", 
                name, protocolType, status, page, limit);
        
        if (page == null || page < 1) {
            page = 1;
        }
        if (limit == null || limit < 1) {
            limit = 20;
        }
        
        MyPageResult<ProtocolGatewayEntity> result = gatewayRepository.getPageList(
            name, protocolType, status, page, limit);
        
        // 为每个网关添加连接器名称(通过protocolType字段传递)
        if (result != null && result.getList() != null) {
            for (ProtocolGatewayEntity gateway : result.getList()) {
                if (gateway.getSourceConnectorId() != null) {
                    try {
                        ConnectorMetaEntity connector = connectorService.getConnectorById(
                            gateway.getSourceConnectorId().toString());
                        if (connector != null) {
                            // 使用protocolType字段传递连接器名称(前端已映射为sourceConnectorName)
                            gateway.setProtocolType(connector.getName());
                        }
                    } catch (Exception e) {
                        log.warn("获取连接器名称失败: connectorId={}", 
                            gateway.getSourceConnectorId(), e);
                    }
                }
            }
        }
        
        return result;
    }

    /**
     * 启动网关
     */
    public void startGateway(Long id) {
        log.info("启动网关: id={}", id);
        
        // 从数据库加载配置
        ProtocolGatewayEntity entity = gatewayRepository.findById(id);
        if (entity == null) {
            throw new IllegalArgumentException("网关不存在: " + id);
        }
        
        // 从连接器获取Kafka地址
        String kafkaBootstrapServers = getKafkaBootstrapServers(entity.getKafkaConnectorId());
        if (kafkaBootstrapServers == null || kafkaBootstrapServers.isEmpty()) {
            throw new IllegalStateException(
                    String.format("无法获取Kafka连接器地址: connectorId=%s", entity.getKafkaConnectorId()));
        }
        
        log.info("获取Kafka地址: gatewayId={}, kafkaConnectorId={}, bootstrapServers={}", 
                id, entity.getKafkaConnectorId(), kafkaBootstrapServers);
        
        // 构建网关配置
        GatewayConfig config = buildGatewayConfig(entity, kafkaBootstrapServers);
        
        // 加载读取规则
        List<GatewayReadRuleEntity> rules = readRuleService.getEnabledReadRules(id);
        log.info("加载读取规则: gatewayId={}, rulesCount={}", id, rules.size());
        
        try {
            // 创建并启动网关运行时
            GatewayRuntime runtime = new GatewayRuntime(
                    entity,
                    config,
                    rules,
                    connectorManager
            );
            runtime.start();
            
            // 缓存运行时实例
            runtimeCache.put(id, runtime);
            
            // 同时启动原有的网关(兼容老版本)
            AbstractGateway gateway = gatewayFactory.createGateway(entity, kafkaBootstrapServers);
            gatewayManager.registerGateway(gateway);
            gatewayManager.startGateway(id);
            
            // 更新数据库状态
            gatewayRepository.updateStatus(id, "RUNNING");
            
            log.info("网关启动成功: gatewayId={}, activeRules={}", 
                    id, runtime.getActiveRulesCount());
        } catch (Exception e) {
            log.error("网关启动失败: gatewayId={}", id, e);
            throw new RuntimeException("网关启动失败: " + e.getMessage(), e);
        }
    }
    
    /**
     * 构建网关配置
     */
    private GatewayConfig buildGatewayConfig(ProtocolGatewayEntity entity, String kafkaBootstrapServers) {
        return GatewayConfig.builder()
                .gatewayId(entity.getId())
                .gatewayName(entity.getName())
                .sourceConnectorId(entity.getSourceConnectorId())
                .protocolType(entity.getProtocolType())
                .kafkaConnectorId(entity.getKafkaConnectorId())
                .kafkaBootstrapServers(kafkaBootstrapServers)
                .kafkaTopic(entity.getKafkaTopic())
                .partitionStrategy(entity.getPartitionStrategy())
                .pollingInterval(entity.getPollingInterval())
                .maxTps(entity.getMaxTps())
                .backpressureStrategy(entity.getBackpressureStrategy())
                .enableCircuitBreaker(entity.getEnableCircuitBreaker())
                .failureThreshold(entity.getFailureThreshold())
                .circuitSleepWindow(entity.getCircuitSleepWindow().longValue())
                .memoryBufferSize(entity.getMemoryBufferSize())
                .diskBufferEnabled(entity.getDiskBufferEnabled())
                .diskBufferPath(entity.getDiskBufferPath())
                .maxRetryCount(entity.getMaxRetryCount())
                .autoStart(entity.getAutoStart())
                .build();
    }

    /**
     * 从连接器获取Kafka Bootstrap Servers地址
     */
    private String getKafkaBootstrapServers(String kafkaConnectorId) {
        try {
            // 获取Kafka连接器配置
            ConnectorMetaEntity kafkaConnector = connectorService.getConnectorById(kafkaConnectorId);
            if (kafkaConnector == null) {
                log.error("Kafka连接器不存在: connectorId={}", kafkaConnectorId);
                return null;
            }
            
            // 解析连接器参数
            String paramsJson = kafkaConnector.getConnectorParams();
            if (paramsJson == null || paramsJson.isEmpty()) {
                log.error("Kafka连接器参数为空: connectorId={}", kafkaConnectorId);
                return null;
            }
            
            // 使用FastJSON解析
            com.alibaba.fastjson.JSONObject paramsObj = com.alibaba.fastjson.JSON.parseObject(paramsJson);
            String bootstrapServers = paramsObj.getString("bootstrapServers");
            
            if (bootstrapServers == null || bootstrapServers.isEmpty()) {
                log.error("Kafka bootstrapServers为空: connectorId={}", kafkaConnectorId);
                return null;
            }
            
            return bootstrapServers;
        } catch (Exception e) {
            log.error("获取Kafka连接器地址失败: connectorId={}", kafkaConnectorId, e);
            return null;
        }
    }

    /**
     * 停止网关
     */
    public void stopGateway(Long id) {
        log.info("停止网关: id={}", id);
        
        // 停止网关运行时
        GatewayRuntime runtime = runtimeCache.remove(id);
        if (runtime != null) {
            runtime.stop();
            log.info("网关运行时已停止: gatewayId={}", id);
        }
        
        // 停止原有网关
        gatewayManager.stopGateway(id);
        
        // 更新数据库状态
        gatewayRepository.updateStatus(id, "STOPPED");
    }
    
    /**
     * 获取网关实时统计
     */
    public GatewayStatistics getGatewayStatistics(Long id) {
        return gatewayManager.getStatistics(id);
    }

    /**
     * 更新统计信息
     */
    public void updateStatistics(Long id, Long messageCount, Long errorCount) {
        gatewayRepository.updateStatistics(id, messageCount, errorCount);
    }

    /**
     * 删除网关
     */
    public void deleteGateway(Long id) {
        log.info("删除网关: id={}", id);
        gatewayRepository.deleteById(id);
    }

    /**
     * 获取自动启动的网关
     */
    public List<ProtocolGatewayEntity> getAutoStartGateways() {
        return gatewayRepository.findByAutoStart(true);
    }

    /**
     * 按状态查询网关列表（用于服务重启后恢复 RUNNING 状态的网关）
     */
    public List<ProtocolGatewayEntity> getGatewaysByStatus(String status) {
        return gatewayRepository.findByStatus(status);
    }

    /**
     * 强制重置网关状态（启动失败时回滚为 STOPPED）
     */
    public void resetGatewayStatus(Long id, String status) {
        gatewayRepository.updateStatus(id, status);
    }
}
