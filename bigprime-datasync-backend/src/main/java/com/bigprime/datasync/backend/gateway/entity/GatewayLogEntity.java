package com.bigprime.datasync.backend.gateway.entity;

import com.easy.query.core.annotation.Column;
import com.easy.query.core.annotation.EntityProxy;
import com.easy.query.core.annotation.Table;
import com.easy.query.core.proxy.ProxyEntityAvailable;
import com.bigprime.datasync.backend.gateway.entity.proxy.GatewayLogEntityProxy;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Date;

/**
 * 网关运行日志实体
 * 
 * @author bigprime
 * @version 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityProxy
@Table("data_sync_gateway_log")
public class GatewayLogEntity implements ProxyEntityAvailable<GatewayLogEntity, GatewayLogEntityProxy> {
    
    /**
     * 主键ID
     */
    @Column(primaryKey = true)
    private Long id;
    
    /**
     * 网关ID
     */
    private Long gatewayId;
    
    /**
     * 日志级别:INFO,WARN,ERROR
     */
    private String logLevel;
    
    /**
     * 日志内容
     */
    private String logMessage;
    
    /**
     * 异常堆栈
     */
    private String exceptionStack;
    
    /**
     * 当前TPS
     */
    private Integer currentTps;
    
    /**
     * 错误率(%)
     */
    private BigDecimal errorRate;
    
    /**
     * Kafka消费延迟
     */
    private Long kafkaLag;
    
    /**
     * 日志时间
     */
    private Date logTime;
}
