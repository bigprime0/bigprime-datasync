package com.bigprime.datasync.backend.controller.lineage;

import com.bigprime.datasync.core.model.Result;
import com.bigprime.lineage.entity.LineageColumnEntity;
import com.bigprime.lineage.entity.LineageDataSourceEntity;
import com.bigprime.lineage.entity.LineageRelationEntity;
import com.bigprime.lineage.entity.LineageTableEntity;
import com.bigprime.lineage.service.ManualLineageService;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 手动血缘维护Controller
 * 
 * @author bigprime
 * @version 1.0
 */
@RestController
@RequestMapping("/api/lineage/manual")
@AllArgsConstructor
public class ManualLineageController {
    
    private final ManualLineageService manualLineageService;
    
    // ==================== 数据源节点API ====================
    
    /**
     * 创建或更新数据源节点
     */
    @PostMapping("/datasource/save")
    public Result<LineageDataSourceEntity> saveDataSource(@RequestBody LineageDataSourceEntity entity) {
        return Result.ok(manualLineageService.saveDataSource(entity));
    }
    
    /**
     * 获取数据源节点
     */
    @GetMapping("/datasource/{id}")
    public Result<LineageDataSourceEntity> getDataSource(@PathVariable String id) {
        return Result.ok(manualLineageService.getDataSource(id)
                .orElseThrow(() -> new RuntimeException("数据源不存在: " + id)));
    }
    
    /**
     * 查询所有数据源
     */
    @GetMapping("/datasource/list")
    public Result<List<LineageDataSourceEntity>> listDataSources() {
        return Result.ok(manualLineageService.listDataSources());
    }
    
    /**
     * 删除数据源节点
     */
    @DeleteMapping("/datasource/{id}")
    public Result<Void> deleteDataSource(@PathVariable String id) {
        manualLineageService.deleteDataSource(id);
        return Result.ok();
    }
    
    // ==================== 表节点API ====================
    
    /**
     * 创建或更新表节点
     */
    @PostMapping("/table/save")
    public Result<LineageTableEntity> saveTable(@RequestBody LineageTableEntity entity) {
        return Result.ok(manualLineageService.saveTable(entity));
    }
    
    /**
     * 获取表节点
     */
    @GetMapping("/table/{id}")
    public Result<LineageTableEntity> getTable(@PathVariable String id) {
        return Result.ok(manualLineageService.getTable(id)
                .orElseThrow(() -> new RuntimeException("表不存在: " + id)));
    }
    
    /**
     * 查询数据源下的所有表
     */
    @GetMapping("/table/list/{datasourceId}")
    public Result<List<LineageTableEntity>> listTablesByDataSource(@PathVariable String datasourceId) {
        return Result.ok(manualLineageService.listTablesByDataSource(datasourceId));
    }
    
    /**
     * 删除表节点
     */
    @DeleteMapping("/table/{id}")
    public Result<Void> deleteTable(@PathVariable String id) {
        manualLineageService.deleteTable(id);
        return Result.ok();
    }
    
    // ==================== 字段节点API ====================
    
    /**
     * 创建或更新字段节点
     */
    @PostMapping("/column/save")
    public Result<LineageColumnEntity> saveColumn(@RequestBody LineageColumnEntity entity) {
        return Result.ok(manualLineageService.saveColumn(entity));
    }
    
    /**
     * 获取字段节点
     */
    @GetMapping("/column/{id}")
    public Result<LineageColumnEntity> getColumn(@PathVariable String id) {
        return Result.ok(manualLineageService.getColumn(id)
                .orElseThrow(() -> new RuntimeException("字段不存在: " + id)));
    }
    
    /**
     * 查询表下的所有字段
     */
    @GetMapping("/column/list/{tableId}")
    public Result<List<LineageColumnEntity>> listColumnsByTable(@PathVariable String tableId) {
        return Result.ok(manualLineageService.listColumnsByTable(tableId));
    }
    
    /**
     * 删除字段节点
     */
    @DeleteMapping("/column/{id}")
    public Result<Void> deleteColumn(@PathVariable String id) {
        manualLineageService.deleteColumn(id);
        return Result.ok();
    }
    
    // ==================== 血缘关系API ====================
    
    /**
     * 查询血缘关系列表
     */
    @GetMapping("/relation/list")
    public Result<List<LineageRelationEntity>> listRelations(
            @RequestParam(required = false) String sourceType,
            @RequestParam(required = false) String targetType,
            @RequestParam(required = false) String lineageType) {
        return Result.ok(manualLineageService.listRelations(sourceType, targetType, lineageType));
    }
    
    /**
     * 创建血缘关系
     */
    @PostMapping("/relation/create")
    public Result<LineageRelationEntity> createRelation(@RequestBody LineageRelationEntity entity) {
        return Result.ok(manualLineageService.createRelation(entity));
    }
    
    /**
     * 更新血缘关系
     */
    @PostMapping("/relation/update")
    public Result<LineageRelationEntity> updateRelation(@RequestBody LineageRelationEntity entity) {
        return Result.ok(manualLineageService.updateRelation(entity));
    }
    
    /**
     * 获取血缘关系
     */
    @GetMapping("/relation/{id}")
    public Result<LineageRelationEntity> getRelation(@PathVariable String id) {
        return Result.ok(manualLineageService.getRelation(id)
                .orElseThrow(() -> new RuntimeException("血缘关系不存在: " + id)));
    }
    
    /**
     * 查询上游血缘
     */
    @GetMapping("/relation/upstream/{targetType}/{targetId}")
    public Result<List<LineageRelationEntity>> findUpstream(
            @PathVariable String targetType,
            @PathVariable String targetId) {
        return Result.ok(manualLineageService.findUpstream(targetId, targetType));
    }
    
    /**
     * 查询下游血缘
     */
    @GetMapping("/relation/downstream/{sourceType}/{sourceId}")
    public Result<List<LineageRelationEntity>> findDownstream(
            @PathVariable String sourceType,
            @PathVariable String sourceId) {
        return Result.ok(manualLineageService.findDownstream(sourceId, sourceType));
    }
    
    /**
     * 删除血缘关系
     */
    @DeleteMapping("/relation/{id}")
    public Result<Void> deleteRelation(@PathVariable String id) {
        manualLineageService.deleteRelation(id);
        return Result.ok();
    }
}
