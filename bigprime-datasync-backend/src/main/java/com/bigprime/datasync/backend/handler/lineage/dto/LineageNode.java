package com.bigprime.datasync.backend.handler.lineage.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 血缘图节点
 *
 * @author lyw
 * @version 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LineageNode {

    /**
     * 节点唯一标识（格式：{type}:{database}:{table}）
     */
    private String id;

    /**
     * 节点名称
     */
    private String name;

    /**
     * 节点类型（source/target/intermediate）
     */
    private String nodeType;

    /**
     * 数据源类型（MySQL/PostgreSQL/Kafka/File等）
     */
    private String dataSourceType;

    /**
     * 连接器ID
     */
    private String connectorId;

    /**
     * 数据库名
     */
    private String database;

    /**
     * 表名/Topic名/文件路径
     */
    private String table;

    /**
     * 字段列表
     */
    private List<String> fields;

    /**
     * 血缘层级
     */
    private Integer level;

    /**
     * 节点额外信息
     */
    private Object metadata;
}
