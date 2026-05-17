package com.bigprime.datasync.backend.controller.lineage;

import com.bigprime.datasync.core.model.Result;
import com.bigprime.datasync.backend.handler.lineage.dto.LineageGraph;
import com.bigprime.datasync.backend.handler.model.lineage.DataLineage;
import com.bigprime.datasync.backend.query.lineage.DataLineageQuery;
import com.bigprime.datasync.backend.service.lineage.DataLineageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 数据血缘API接口
 *
 * @author lyw
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/lineage")
@Tag(name = "数据血缘管理", description = "提供数据血缘追踪、查询和可视化功能")
@AllArgsConstructor
public class DataLineageController {

    private final DataLineageService dataLineageService;

    /**
     * 查询上游血缘（数据来源）
     *
     * @param type 数据源类型（如MySQL、PostgreSQL、Kafka等）
     * @param database 数据库名
     * @param table 表名/Topic名
     * @param maxDepth 最大追溯深度，-1表示无限制，默认为3
     * @return 血缘关系图
     */
    @GetMapping("/upstream")
    @Operation(summary = "查询上游血缘", description = "追溯数据的来源，返回完整的上游依赖关系图")
    public Result<LineageGraph> getUpstreamLineage(
            @Parameter(description = "数据源类型", example = "MySQL")
            @RequestParam String type,
            
            @Parameter(description = "数据库名", example = "user_db")
            @RequestParam String database,
            
            @Parameter(description = "表名", example = "users")
            @RequestParam String table,
            
            @Parameter(description = "最大深度，-1表示无限", example = "3")
            @RequestParam(defaultValue = "3") Integer maxDepth) {
        
        log.info("查询上游血缘: type={}, database={}, table={}, maxDepth={}", 
                 type, database, table, maxDepth);
        
        LineageGraph graph = dataLineageService.getUpstreamLineage(type, database, table, maxDepth);
        return Result.ok(graph);
    }

    /**
     * 查询下游血缘（数据流向）
     *
     * @param type 数据源类型
     * @param database 数据库名
     * @param table 表名/Topic名
     * @param maxDepth 最大追溯深度
     * @return 血缘关系图
     */
    @GetMapping("/downstream")
    @Operation(summary = "查询下游血缘", description = "追踪数据的流向，返回完整的下游依赖关系图")
    public Result<LineageGraph> getDownstreamLineage(
            @Parameter(description = "数据源类型", example = "MySQL")
            @RequestParam String type,
            
            @Parameter(description = "数据库名", example = "user_db")
            @RequestParam String database,
            
            @Parameter(description = "表名", example = "users")
            @RequestParam String table,
            
            @Parameter(description = "最大深度，-1表示无限", example = "3")
            @RequestParam(defaultValue = "3") Integer maxDepth) {
        
        log.info("查询下游血缘: type={}, database={}, table={}, maxDepth={}", 
                 type, database, table, maxDepth);
        
        LineageGraph graph = dataLineageService.getDownstreamLineage(type, database, table, maxDepth);
        return Result.ok(graph);
    }

    /**
     * 查询完整血缘（上下游）
     *
     * @param type 数据源类型
     * @param database 数据库名
     * @param table 表名/Topic名
     * @param maxDepth 最大追溯深度
     * @return 血缘关系图
     */
    @GetMapping("/full")
    @Operation(summary = "查询完整血缘", description = "同时返回上游和下游的完整血缘关系图")
    public Result<LineageGraph> getFullLineage(
            @Parameter(description = "数据源类型", example = "MySQL")
            @RequestParam String type,
            
            @Parameter(description = "数据库名", example = "user_db")
            @RequestParam String database,
            
            @Parameter(description = "表名", example = "users")
            @RequestParam String table,
            
            @Parameter(description = "最大深度，-1表示无限", example = "3")
            @RequestParam(defaultValue = "3") Integer maxDepth) {
        
        log.info("查询完整血缘: type={}, database={}, table={}, maxDepth={}", 
                 type, database, table, maxDepth);
        
        LineageGraph graph = dataLineageService.getFullLineage(type, database, table, maxDepth);
        return Result.ok(graph);
    }

    /**
     * 根据DAG执行ID查询血缘
     *
     * @param dagExecutionId DAG执行ID
     * @return 血缘关系图
     */
    @GetMapping("/dag/{dagExecutionId}")
    @Operation(summary = "根据DAG执行查询血缘", description = "查询指定DAG执行过程中产生的所有血缘关系")
    public Result<LineageGraph> getLineageByDagExecution(
            @Parameter(description = "DAG执行ID", example = "exec-20241119-001")
            @PathVariable String dagExecutionId) {
        
        log.info("根据DAG执行ID查询血缘: dagExecutionId={}", dagExecutionId);
        
        LineageGraph graph = dataLineageService.getLineageByDagExecution(dagExecutionId);
        return Result.ok(graph);
    }

    /**
     * 查询字段级血缘
     *
     * @param type 数据源类型
     * @param database 数据库名
     * @param table 表名
     * @param field 字段名
     * @return 字段血缘链路
     */
    @GetMapping("/field")
    @Operation(summary = "查询字段级血缘", description = "查询单个字段的血缘关系，包括字段映射和转换逻辑")
    public Result<List<Map<String, Object>>> getFieldLineage(
            @Parameter(description = "数据源类型", example = "MySQL")
            @RequestParam String type,
            
            @Parameter(description = "数据库名", example = "user_db")
            @RequestParam String database,
            
            @Parameter(description = "表名", example = "users")
            @RequestParam String table,
            
            @Parameter(description = "字段名", example = "email")
            @RequestParam String field) {
        
        log.info("查询字段级血缘: type={}, database={}, table={}, field={}", 
                 type, database, table, field);
        
        List<Map<String, Object>> fieldLineage = dataLineageService.getFieldLineage(type, database, table, field);
        return Result.ok(fieldLineage);
    }

    /**
     * 批量创建血缘记录
     *
     * @param lineages 血缘记录列表
     * @return 创建结果
     */
    @PostMapping("/batch")
    @Operation(summary = "批量创建血缘记录", description = "在DAG执行过程中批量记录血缘关系")
    public Result<Integer> batchCreate(@RequestBody List<DataLineage> lineages) {
        log.info("批量创建血缘记录，数量: {}", lineages.size());
        
        int count = 0;
        for (DataLineage lineage : lineages) {
            dataLineageService.save(lineage);
            count++;
        }
        
        return Result.ok(count);
    }

    /**
     * 根据条件查询血缘记录列表
     *
     * @param query 查询条件
     * @return 血缘记录列表
     */
    @PostMapping("/list")
    @Operation(summary = "查询血缘记录列表", description = "根据各种条件查询血缘记录")
    public Result<List<DataLineage>> listLineages(@RequestBody DataLineageQuery query) {
        log.info("查询血缘记录列表: {}", query);
        
        List<DataLineage> lineages = dataLineageService.list(query);
        return Result.ok(lineages);
    }

    /**
     * 统计血缘信息
     *
     * @param type 数据源类型（可选）
     * @param database 数据库名（可选）
     * @return 统计信息
     */
    @GetMapping("/statistics")
    @Operation(summary = "统计血缘信息", description = "统计指定范围内的血缘记录数量和状态")
    public Result<Map<String, Object>> getStatistics(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String database) {
        
        log.info("统计血缘信息: type={}, database={}", type, database);
        
        DataLineageQuery query = new DataLineageQuery();
        if (type != null) {
            query.setSourceType(type);
        }
        if (database != null) {
            query.setSourceDatabase(database);
        }
        
        List<DataLineage> lineages = dataLineageService.list(query);
        
        long totalCount = lineages.size();
        long successCount = lineages.stream().filter(l -> "SUCCESS".equals(l.getStatus())).count();
        long failedCount = lineages.stream().filter(l -> "FAILED".equals(l.getStatus())).count();
        long totalRecords = lineages.stream()
                .mapToLong(l -> l.getRecordCount() != null ? l.getRecordCount() : 0L)
                .sum();
        
        Map<String, Object> statistics = Map.of(
                "totalCount", totalCount,
                "successCount", successCount,
                "failedCount", failedCount,
                "totalRecordCount", totalRecords
        );
        
        return Result.ok(statistics);
    }
}
