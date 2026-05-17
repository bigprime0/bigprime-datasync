package com.bigprime.datasync.backend.handler.lineage.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 血缘统计信息
 *
 * @author lyw
 * @version 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LineageStatistics {

    /**
     * 节点总数
     */
    private Integer totalNodes;

    /**
     * 边总数
     */
    private Integer totalEdges;

    /**
     * 最大深度
     */
    private Integer maxDepth;

    /**
     * 数据源总数
     */
    private Integer totalDataSources;

    /**
     * 目标端总数
     */
    private Integer totalTargets;

    /**
     * 中间节点数
     */
    private Integer totalIntermediateNodes;

    /**
     * 总记录数
     */
    private Long totalRecordCount;

    /**
     * 成功的血缘记录数
     */
    private Integer successCount;

    /**
     * 失败的血缘记录数
     */
    private Integer failedCount;
}
