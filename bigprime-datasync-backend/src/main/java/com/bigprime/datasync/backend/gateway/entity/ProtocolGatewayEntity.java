package com.bigprime.datasync.backend.gateway.entity;

import com.easy.query.core.annotation.Column;
import com.easy.query.core.annotation.EntityProxy;
import com.easy.query.core.annotation.Table;
import com.easy.query.core.annotation.UpdateIgnore;
import com.easy.query.core.proxy.ProxyEntityAvailable;
import com.bigprime.datasync.backend.gateway.entity.proxy.ProtocolGatewayEntityProxy;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

/**
 * 协议网关配置实体
 * 
 * @author bigprime
 * @version 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityProxy
@Table("data_sync_protocol_gateway")
public class ProtocolGatewayEntity implements ProxyEntityAvailable<ProtocolGatewayEntity, ProtocolGatewayEntityProxy> {
    
    /**
     * 主键ID
     */
    @Column(primaryKey = true)
    private Long id;
    
    /**
     * 网关名称
     */
    private String name;
    
    /**
     * 源连接器ID
     */
    private String sourceConnectorId;
    
    /**
     * 协议类型:MODBUS,COAP,OPCUA,TCP,UDP,MQTT
     */
    private String protocolType;
    
    /**
     * Kafka连接器ID
     */
    private String kafkaConnectorId;
    
    /**
     * Kafka主题
     */
    private String kafkaTopic;
    
    /**
     * 分区策略
     */
    private String partitionStrategy;
    
    /**
     * 轮询间隔(ms)
     */
    private Integer pollingInterval;
    
    /**
     * 状态:STOPPED,RUNNING,ERROR
     */
    private String status;
    
    /**
     * 系统启动时自动启动
     */
    private Boolean autoStart;
    
    /**
     * 最大TPS限流
     */
    private Integer maxTps;
    
    /**
     * 背压策略:DROP,BLOCK,BUFFER
     */
    private String backpressureStrategy;
    
    /**
     * 启用熔断器
     */
    private Boolean enableCircuitBreaker;
    
    /**
     * 熔断失败率阈值(%)
     */
    private Integer failureThreshold;
    
    /**
     * 熔断恢复窗口(ms)
     */
    private Integer circuitSleepWindow;
    
    /**
     * 内存缓冲大小
     */
    private Integer memoryBufferSize;
    
    /**
     * 启用磁盘缓冲
     */
    private Boolean diskBufferEnabled;
    
    /**
     * 磁盘缓冲路径
     */
    private String diskBufferPath;
    
    /**
     * 最大重试次数
     */
    private Integer maxRetryCount;
    
    /**
     * 累计消息数
     */
    private Long messageCount;
    
    /**
     * 累计错误数
     */
    private Long errorCount;
    
    /**
     * 最后活跃时间
     */
    private Date lastActiveTime;
    
    /**
     * 创建人
     */
    @UpdateIgnore
    private String createdBy;
    
    /**
     * 创建时间
     */
    @UpdateIgnore
    private Date createdTime;
    
    /**
     * 更新人
     */
    private String updatedBy;
    
    /**
     * 更新时间
     */
    private Date updatedTime;
    
    /**
     * 逻辑删除
     */
    private Boolean deleted;
}
