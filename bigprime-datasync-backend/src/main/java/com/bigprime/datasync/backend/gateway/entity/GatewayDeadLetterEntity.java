package com.bigprime.datasync.backend.gateway.entity;

import com.easy.query.core.annotation.Column;
import com.easy.query.core.annotation.EntityProxy;
import com.easy.query.core.annotation.Table;
import com.easy.query.core.proxy.ProxyEntityAvailable;
import com.bigprime.datasync.backend.gateway.entity.proxy.GatewayDeadLetterEntityProxy;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

/**
 * 死信队列实体
 * 
 * @author bigprime
 * @version 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityProxy
@Table("data_sync_gateway_dead_letter")
public class GatewayDeadLetterEntity implements ProxyEntityAvailable<GatewayDeadLetterEntity, GatewayDeadLetterEntityProxy> {
    
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
     * 原始消息内容(JSON格式)
     */
    private String originalMessage;
    
    /**
     * 失败原因
     */
    private String failureReason;
    
    /**
     * 失败时间
     */
    private Date failureTime;
    
    /**
     * 重试次数
     */
    private Integer retryCount;
    
    /**
     * 最大重试次数
     */
    private Integer maxRetryCount;
    
    /**
     * 最后重试时间
     */
    private Date lastRetryTime;
    
    /**
     * 状态:PENDING,REPLAYED,ARCHIVED
     */
    private String status;
    
    /**
     * 处理人
     */
    private String handledBy;
    
    /**
     * 处理时间
     */
    private Date handledTime;
}
