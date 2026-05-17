package com.bigprime.datasync.backend.handler.model.lineage;

import com.bigprime.datasync.core.model.BaseModel;
import com.bigprime.datasync.backend.handler.model.lineage.proxy.DataLineageProxy;
import com.easy.query.core.annotation.Column;
import com.easy.query.core.annotation.EntityProxy;
import com.easy.query.core.annotation.Table;
import com.easy.query.core.proxy.ProxyEntityAvailable;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 数据血缘关系实体类
 * 记录数据从源端到目标端的完整流转链路
 *
 * @author bigprime
 * @version 1.0
 */
@EqualsAndHashCode(callSuper = true)
@Data
@Table("data_lineage")
@EntityProxy
public class DataLineage extends BaseModel implements ProxyEntityAvailable<DataLineage, DataLineageProxy> {

    /**
     * 血缘关系名称
     */
    @Column(value = "name")
    private String name;

    /**
     * 源端类型（MySQL/PostgreSQL/Kafka/File等）
     */
    @Column(value = "source_type")
    private String sourceType;

    /**
     * 源端连接器ID
     */
    @Column(value = "source_connector_id")
    private String sourceConnectorId;

    /**
     * 源端数据库名
     */
    @Column(value = "source_database")
    private String sourceDatabase;

    /**
     * 源端表名/Topic名/文件路径
     */
    @Column(value = "source_table")
    private String sourceTable;

    /**
     * 源端字段列表（JSON格式）
     * 示例：["id", "name", "email", "created_at"]
     */
    @Column(value = "source_fields", large = true)
    private String sourceFields;

    /**
     * 目标端类型
     */
    @Column(value = "target_type")
    private String targetType;

    /**
     * 目标端连接器ID
     */
    @Column(value = "target_connector_id")
    private String targetConnectorId;

    /**
     * 目标端数据库名
     */
    @Column(value = "target_database")
    private String targetDatabase;

    /**
     * 目标端表名/Topic名/文件路径
     */
    @Column(value = "target_table")
    private String targetTable;

    /**
     * 目标端字段列表（JSON格式）
     */
    @Column(value = "target_fields", large = true)
    private String targetFields;

    /**
     * 字段映射关系（JSON格式）
     * 示例：{"id": "user_id", "name": "username", "email": "email_address"}
     */
    @Column(value = "field_mapping", large = true)
    private String fieldMapping;

    /**
     * 数据转换逻辑（JSON格式）
     * 示例：{"filter": "status='active'", "transform": "UPPER(name)"}
     */
    @Column(value = "transform_logic", large = true)
    private String transformLogic;

    /**
     * 关联的DAG执行ID
     */
    @Column(value = "dag_execution_id")
    private String dagExecutionId;

    /**
     * 关联的DAG定义ID
     */
    @Column(value = "dag_definition_id")
    private String dagDefinitionId;

    /**
     * 关联的节点ID
     */
    @Column(value = "node_id")
    private String nodeId;

    /**
     * 节点名称
     */
    @Column(value = "node_name")
    private String nodeName;

    /**
     * 处理的记录数
     */
    @Column(value = "record_count")
    private Long recordCount;

    /**
     * 数据质量得分（0-100）
     */
    @Column(value = "quality_score")
    private Integer qualityScore;

    /**
     * 执行状态（SUCCESS/FAILED/RUNNING）
     */
    @Column(value = "status")
    private String status;

    /**
     * 开始时间
     */
    @Column(value = "start_time")
    private LocalDateTime startTime;

    /**
     * 结束时间
     */
    @Column(value = "end_time")
    private LocalDateTime endTime;

    /**
     * 执行耗时（毫秒）
     */
    @Column(value = "duration_ms")
    private Long durationMs;

    /**
     * 错误信息
     */
    @Column(value = "error_message", large = true)
    private String errorMessage;

    /**
     * 血缘层级（0表示原始数据源，1表示一次转换，以此类推）
     */
    @Column(value = "lineage_level")
    private Integer lineageLevel;

    /**
     * 父血缘ID（用于构建血缘链路）
     */
    @Column(value = "parent_lineage_id")
    private String parentLineageId;

    /**
     * 备注
     */
    @Column(value = "remark", large = true)
    private String remark;
}
