package com.bigprime.datasync.backend.handler.model.trigger;

import com.bigprime.datasync.core.model.BaseModel;
import com.bigprime.datasync.backend.handler.model.trigger.proxy.DagTriggerProxy;
import com.easy.query.core.annotation.Column;
import com.easy.query.core.annotation.EntityProxy;
import com.easy.query.core.annotation.Table;
import com.easy.query.core.proxy.ProxyEntityAvailable;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.Date;

/**
 * DAG触发器实体
 * <p>
 * 定义DAG的触发规则（定时、手动等），不作为DAG图上的节点
 * </p>
 */
@Data
@EqualsAndHashCode(callSuper = true)
@Table("dag_trigger")
@EntityProxy
public class DagTrigger extends BaseModel implements ProxyEntityAvailable<DagTrigger, DagTriggerProxy> {
    
    /**
     * DAG定义ID（关联FlowDefinition）
     */
    @Column("dag_definition_id")
    private String dagDefinitionId;
    
    /**
     * 触发器名称
     */
    @Column("name")
    private String name;
    
    /**
     * 触发器类型: CRON(定时), MANUAL(手动)
     */
    @Column("type")
    private String type;
    
    /**
     * Cron表达式（type=CRON时必填）
     */
    @Column("cron_expression")
    private String cronExpression;
    
    /**
     * 是否启用
     */
    @Column("enabled")
    private Boolean enabled;
    
    /**
     * 并发策略: FORBID(不允许并发), REPLACE(取消旧的), ALLOW(允许并行)
     */
    @Column("concurrency_policy")
    private String concurrencyPolicy;
    
    /**
     * 最大并行执行数（concurrencyPolicy=ALLOW时有效）
     */
    @Column("max_parallel")
    private Integer maxParallel;
    
    /**
     * 去重键表达式（可选，用于避免重复触发）
     */
    @Column("dedup_key_expression")
    private String dedupKeyExpression;
    
    /**
     * 触发上下文（JSON格式，传递给DAG执行的初始参数）
     */
    @Column(value = "trigger_context", large = true)
    private String triggerContext;
    
    /**
     * 下一次触发时间（系统计算）
     */
    @Column("next_fire_time")
    private Date nextFireTime;
    
    /**
     * 上一次触发时间
     */
    @Column("last_fire_time")
    private Date lastFireTime;
    
    /**
     * 触发次数统计
     */
    @Column("fire_count")
    private Long fireCount;
    
    /**
     * 触发器所有者
     */
    @Column("owner")
    private String owner;
    
    /**
     * 描述
     */
    @Column(value = "description", large = true)
    private String description;
}
