package com.bigprime.datasync.backend.query.lineage;

import lombok.Data;

/**
 * 数据血缘查询条件
 *
 * @author lyw
 * @version 1.0
 */
@Data
public class DataLineageQuery {

    /**
     * 血缘关系名称（模糊查询）
     */
    private String name;

    /**
     * 源端类型
     */
    private String sourceType;

    /**
     * 源端连接器ID
     */
    private String sourceConnectorId;

    /**
     * 源端数据库名
     */
    private String sourceDatabase;

    /**
     * 源端表名
     */
    private String sourceTable;

    /**
     * 目标端类型
     */
    private String targetType;

    /**
     * 目标端连接器ID
     */
    private String targetConnectorId;

    /**
     * 目标端数据库名
     */
    private String targetDatabase;

    /**
     * 目标端表名
     */
    private String targetTable;

    /**
     * DAG执行ID
     */
    private String dagExecutionId;

    /**
     * DAG定义ID
     */
    private String dagDefinitionId;

    /**
     * 节点ID
     */
    private String nodeId;

    /**
     * 执行状态
     */
    private String status;

    /**
     * 开始时间（起）
     */
    private String startTimeBegin;

    /**
     * 开始时间（止）
     */
    private String startTimeEnd;

    /**
     * 血缘层级
     */
    private Integer lineageLevel;

    /**
     * 父血缘ID
     */
    private String parentLineageId;
}
