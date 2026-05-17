package com.bigprime.datasync.backend.gateway.entity;

import com.easy.query.core.annotation.Column;
import com.easy.query.core.annotation.EntityProxy;
import com.easy.query.core.annotation.Table;
import com.easy.query.core.annotation.UpdateIgnore;
import com.easy.query.core.proxy.ProxyEntityAvailable;
import com.bigprime.datasync.backend.gateway.entity.proxy.GatewayReadRuleEntityProxy;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

/**
 * 网关读取规则实体
 * 
 * @author bigprime
 * @version 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityProxy
@Table("data_sync_gateway_read_rule")
public class GatewayReadRuleEntity implements ProxyEntityAvailable<GatewayReadRuleEntity, GatewayReadRuleEntityProxy> {
    
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
     * 规则名称
     */
    private String ruleName;
    
    /**
     * 规则类型:MODBUS_REGISTER,COAP_RESOURCE,OPCUA_NODE
     */
    private String ruleType;
    
    /**
     * 规则配置(JSON格式)
     */
    private String ruleConfig;
    
    /**
     * 字段名称
     */
    private String fieldName;
    
    /**
     * 字段类型
     */
    private String fieldType;
    
    /**
     * 默认值
     */
    private String defaultValue;
    
    /**
     * 排序
     */
    private Integer sortOrder;
    
    /**
     * 优先级（数字越小优先级越高）
     */
    private Integer priority;
    
    /**
     * 描述
     */
    private String description;
    
    /**
     * 启用状态
     */
    private Boolean enabled;
    
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
}
