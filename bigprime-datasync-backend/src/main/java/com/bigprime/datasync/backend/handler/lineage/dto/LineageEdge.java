package com.bigprime.datasync.backend.handler.lineage.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * 血缘图边（关系）
 *
 * @author lyw
 * @version 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LineageEdge {

    /**
     * 边唯一标识
     */
    private String id;

    /**
     * 源节点ID
     */
    private String sourceId;

    /**
     * 目标节点ID
     */
    private String targetId;

    /**
     * 边类型（data_flow/dependency）
     */
    private String edgeType;

    /**
     * 字段映射关系
     * key: 源端字段, value: 目标端字段
     */
    private Map<String, String> fieldMapping;

    /**
     * 转换逻辑描述
     */
    private String transformLogic;

    /**
     * 关联的DAG执行ID
     */
    private String dagExecutionId;

    /**
     * 关联的节点ID
     */
    private String nodeId;

    /**
     * 处理的记录数
     */
    private Long recordCount;

    /**
     * 执行状态
     */
    private String status;

    /**
     * 边额外信息
     */
    private Object metadata;
}
