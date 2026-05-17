package com.bigprime.datasync.backend.controller.lineage;

import com.bigprime.datasync.core.model.Result;
import com.bigprime.lineage.service.LineageQueryService;
import com.bigprime.lineage.storage.model.LineageQueryResult;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.web.bind.annotation.*;

/**
 * 血缘查询与分析Controller
 * 
 * @author bigprime
 * @version 1.0
 */
@RestController
@RequestMapping("/api/lineage/query")
@AllArgsConstructor
public class LineageQueryController {
    
    private final LineageQueryService lineageQueryService;
    
    /**
     * 溯源分析（查询上游血缘）
     */
    @PostMapping("/upstream")
    public Result<LineageQueryResult> traceUpstream(@RequestBody LineageQueryRequest request) {
        return Result.ok(lineageQueryService.traceUpstream(
                request.getNodeId(),
                request.getNodeType(),
                request.getDepth() == null ? 0 : request.getDepth()
        ));
    }
    
    /**
     * 影响分析（查询下游血缘）
     */
    @PostMapping("/downstream")
    public Result<LineageQueryResult> analyzeImpact(@RequestBody LineageQueryRequest request) {
        return Result.ok(lineageQueryService.analyzeImpact(
                request.getNodeId(),
                request.getNodeType(),
                request.getDepth() == null ? 0 : request.getDepth()
        ));
    }
    
    /**
     * 查询完整血缘链路
     */
    @PostMapping("/full")
    public Result<LineageQueryResult> queryFullLineage(@RequestBody FullLineageQueryRequest request) {
        return Result.ok(lineageQueryService.queryFullLineage(
                request.getNodeId(),
                request.getNodeType(),
                request.getUpDepth() == null ? 1 : request.getUpDepth(),
                request.getDownDepth() == null ? 1 : request.getDownDepth()
        ));
    }
    
    /**
     * 根据表名查询血缘
     */
    @GetMapping("/table/{tableName}")
    public Result<LineageQueryResult> queryByTableName(
            @PathVariable String tableName,
            @RequestParam(required = false, defaultValue = "1") Integer upDepth,
            @RequestParam(required = false, defaultValue = "1") Integer downDepth) {
        return Result.ok(lineageQueryService.queryLineageByTableName(tableName, upDepth, downDepth));
    }
    
    /**
     * 根据字段名查询血缘
     */
    @GetMapping("/column/{columnName}")
    public Result<LineageQueryResult> queryByColumnName(
            @PathVariable String columnName,
            @RequestParam(required = false, defaultValue = "1") Integer upDepth,
            @RequestParam(required = false, defaultValue = "1") Integer downDepth) {
        return Result.ok(lineageQueryService.queryLineageByColumnName(columnName, upDepth, downDepth));
    }
    
    /**
     * 血缘查询请求
     */
    @Data
    public static class LineageQueryRequest {
        /**
         * 节点ID
         */
        private String nodeId;
        
        /**
         * 节点类型 (DATASOURCE/TABLE/COLUMN)
         */
        private String nodeType;
        
        /**
         * 查询深度（0=不限制）
         */
        private Integer depth;
    }
    
    /**
     * 完整血缘查询请求
     */
    @Data
    public static class FullLineageQueryRequest {
        /**
         * 节点ID
         */
        private String nodeId;
        
        /**
         * 节点类型
         */
        private String nodeType;
        
        /**
         * 上游深度
         */
        private Integer upDepth;
        
        /**
         * 下游深度
         */
        private Integer downDepth;
    }
}
