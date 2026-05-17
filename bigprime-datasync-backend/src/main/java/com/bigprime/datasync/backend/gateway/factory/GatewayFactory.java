package com.bigprime.datasync.backend.gateway.factory;

import com.bigprime.connector.core.IConnector;
import com.bigprime.connector.manager.ConnectorManager;
import com.bigprime.datasync.backend.gateway.entity.ProtocolGatewayEntity;
import com.bigprime.gateway.core.AbstractGateway;
import com.bigprime.gateway.core.GatewayConfig;
import com.bigprime.gateway.core.protocol.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * 网关工厂 - 根据协议类型创建对应的网关实例
 * 
 * @author bigprime
 * @version 1.0
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class GatewayFactory {

    private final ConnectorManager connectorManager;
    
    /**
     * 根据实体创建网关实例
     */
    public AbstractGateway createGateway(ProtocolGatewayEntity entity, String kafkaBootstrapServers) {
        // 构建配置
        GatewayConfig config = buildConfig(entity, kafkaBootstrapServers);
        
        // 根据协议类型创建网关
        String protocolType = entity.getProtocolType();
        if (protocolType == null || protocolType.isEmpty()) {
            log.error("协议类型为空: gatewayId={}", entity.getId());
            throw new IllegalArgumentException("协议类型不能为空");
        }
        
        // 转换为大写统一处理
        String upperProtocol = protocolType.toUpperCase();
        
        switch (upperProtocol) {
            // 工业协议
            case "MODBUS":
                return createModbusGateway(config);
                
            case "COAP":
                return createCoapGateway(config);
                
            case "OPCUA":
            case "OPC-UA":
                return createOpcuaGateway(config);
                
            case "TCP":
                return createTcpGateway(config);
                
            case "UDP":
                return createUdpGateway(config);
                
            case "MQTT":
                return createMqttGateway(config);
            
            // IoT协议
            case "KNX":
            case "KNX-TEST":  // 兼容测试连接器
                return createKnxGateway(config);
                
            case "BACNET":
                return createBacnetGateway(config);
                
            case "DNP3":
                return createDnp3Gateway(config);
                
            case "IEC61850":
            case "IEC-61850":
                return createIec61850Gateway(config);
                
            case "LORAWAN":
            case "LORA-WAN":
                return createLoRaWanGateway(config);
                
            case "ZIGBEE":
                return createZigbeeGateway(config);
                
            case "NBIOT":
            case "NB-IOT":
                return createNbIotGateway(config);
                
            case "BLE":
            case "BLUETOOTH":
                return createBleGateway(config);
            
            // HTTP相关
            case "HTTP":
            case "HTTPS":
                return createHttpGateway(config);
                
            case "WEBSOCKET":
            case "WS":
                return createWebSocketGateway(config);
                
            default:
                log.warn("不支持的协议类型，使用Mock网关: {}", protocolType);
                return new MockGateway(config, protocolType);
        }
    }
    
    /**
     * 构建网关配置
     */
    private GatewayConfig buildConfig(ProtocolGatewayEntity entity, String kafkaBootstrapServers) {
        GatewayConfig.GatewayConfigBuilder builder = GatewayConfig.builder()
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
                .autoStart(entity.getAutoStart());

        // 注入源连接器实例（MQTT/CoAP 等协议网关需要）
        if (entity.getSourceConnectorId() != null) {
            try {
                IConnector sourceConnector = connectorManager.getConnector(
                        entity.getSourceConnectorId(), IConnector.class);
                builder.sourceConnector(sourceConnector);
                log.info("注入源连接器实例: gatewayId={}, connectorId={}",
                        entity.getId(), entity.getSourceConnectorId());
            } catch (Exception e) {
                log.warn("注入源连接器实例失败，将在 onStart 时重试: gatewayId={}, connectorId={}, error={}",
                        entity.getId(), entity.getSourceConnectorId(), e.getMessage());
            }
        }

        return builder.build();
    }
    
    /**
     * 创建Modbus网关
     */
    private AbstractGateway createModbusGateway(GatewayConfig config) {
        log.info("创建Modbus网关: gatewayId={}", config.getGatewayId());
        return new ModbusGateway(config);
    }
    
    /**
     * 创建CoAP网关
     */
    private AbstractGateway createCoapGateway(GatewayConfig config) {
        log.info("创建CoAP网关: gatewayId={}", config.getGatewayId());
        return new CoapGateway(config);
    }
    
    /**
     * 创建OPC-UA网关
     */
    private AbstractGateway createOpcuaGateway(GatewayConfig config) {
        log.info("创建OPC-UA网关: gatewayId={}", config.getGatewayId());
        return new OpcUaGateway(config);
    }
    
    /**
     * 创建TCP网关
     */
    private AbstractGateway createTcpGateway(GatewayConfig config) {
        log.info("创建TCP网关: gatewayId={}", config.getGatewayId());
        return new TcpGateway(config);
    }
    
    /**
     * 创建UDP网关
     */
    private AbstractGateway createUdpGateway(GatewayConfig config) {
        log.info("创建UDP网关: gatewayId={}", config.getGatewayId());
        return new UdpGateway(config);
    }
    
    /**
     * 创建MQTT网关
     */
    private AbstractGateway createMqttGateway(GatewayConfig config) {
        log.info("创建MQTT网关: gatewayId={}", config.getGatewayId());
        return new MqttGateway(config);
    }
    
    /**
     * 创建KNX网关
     */
    private AbstractGateway createKnxGateway(GatewayConfig config) {
        log.info("创建KNX网关: gatewayId={}", config.getGatewayId());
        return new KnxGateway(config);
    }
    
    /**
     * 创建BACnet网关
     */
    private AbstractGateway createBacnetGateway(GatewayConfig config) {
        log.info("创建BACnet网关: gatewayId={}", config.getGatewayId());
        return new BacnetGateway(config);
    }
    
    /**
     * 创建DNP3网关
     */
    private AbstractGateway createDnp3Gateway(GatewayConfig config) {
        log.info("创建DNP3网关: gatewayId={}", config.getGatewayId());
        return new Dnp3Gateway(config);
    }
    
    /**
     * 创建IEC 61850网关
     */
    private AbstractGateway createIec61850Gateway(GatewayConfig config) {
        log.info("创建IEC 61850网关: gatewayId={}", config.getGatewayId());
        return new Iec61850Gateway(config);
    }
    
    /**
     * 创建LoRaWAN网关
     */
    private AbstractGateway createLoRaWanGateway(GatewayConfig config) {
        log.info("创建LoRaWAN网关: gatewayId={}", config.getGatewayId());
        return new LoRaWanGateway(config);
    }
    
    /**
     * 创建Zigbee网关
     */
    private AbstractGateway createZigbeeGateway(GatewayConfig config) {
        log.info("创建Zigbee网关: gatewayId={}", config.getGatewayId());
        return new ZigbeeGateway(config);
    }
    
    /**
     * 创建NB-IoT网关
     */
    private AbstractGateway createNbIotGateway(GatewayConfig config) {
        log.info("创建NB-IoT网关: gatewayId={}", config.getGatewayId());
        return new NbIotGateway(config);
    }
    
    /**
     * 创建BLE网关
     */
    private AbstractGateway createBleGateway(GatewayConfig config) {
        log.info("创建BLE网关: gatewayId={}", config.getGatewayId());
        return new BleGateway(config);
    }
    
    /**
     * 创建HTTP网关
     */
    private AbstractGateway createHttpGateway(GatewayConfig config) {
        log.info("创建HTTP网关: gatewayId={}", config.getGatewayId());
        return new HttpGateway(config);
    }
    
    /**
     * 创建WebSocket网关
     */
    private AbstractGateway createWebSocketGateway(GatewayConfig config) {
        log.info("创建WebSocket网关: gatewayId={}", config.getGatewayId());
        return new WebSocketGateway(config);
    }
    
    /**
     * Mock网关实现（临时）
     */
    private static class MockGateway extends AbstractGateway {
        private final String protocolName;
        
        public MockGateway(GatewayConfig config, String protocolName) {
            super(config);
            this.protocolName = protocolName;
        }
        
        @Override
        protected String collectData() throws Exception {
            // 模拟数据采集
            return String.format("{\"protocol\":\"%s\",\"gatewayId\":%d,\"timestamp\":%d,\"value\":%.2f}",
                    protocolName, gatewayId, System.currentTimeMillis(), Math.random() * 100);
        }
        
        @Override
        protected void onStart() {
            log.info("{}网关启动初始化: gatewayId={}", protocolName, gatewayId);
        }
        
        @Override
        protected void onStop() {
            log.info("{}网关停止清理: gatewayId={}", protocolName, gatewayId);
        }
    }
}
