package com.bigprime.datasync.backend.handler.lineage.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 血缘关系图
 *
 * @author lyw
 * @version 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LineageGraph {

    /**
     * 节点列表
     */
    private List<LineageNode> nodes;

    /**
     * 边列表
     */
    private List<LineageEdge> edges;

    /**
     * 根节点ID（查询的起始节点）
     */
    private String rootNodeId;

    /**
     * 图的方向（upstream/downstream/full）
     */
    private String direction;

    /**
     * 最大深度
     */
    private Integer maxDepth;

    /**
     * 统计信息
     */
    private LineageStatistics statistics;
}
