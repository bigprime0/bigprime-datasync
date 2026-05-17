package com.bigprime.datasync.backend.controller;

import com.bigprime.connector.core.IRdbConnector;
import com.bigprime.connector.manager.ConnectorManager;
import com.bigprime.datasync.core.model.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

/**
 * 连接器元数据API控制器
 * 提供关系型数据库元数据查询接口，用于前端配置映射
 *
 * @author bigprime
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/connector/metadata")
@Tag(name = "连接器元数据管理")
@AllArgsConstructor
public class ConnectorMetadataController {
    
    private final ConnectorManager connectorManager;

    /**
     * 连接器ID请求参数
     */
    @Data
    public static class ConnectorIdRequest {
        @Parameter(description = "连接器ID")
        private String connectorId;
    }

    /**
     * 表名请求参数
     */
    @Data
    public static class TableRequest {
        @Parameter(description = "连接器ID")
        private String connectorId;
        @Parameter(description = "表名")
        private String tableName;
    }

    /**
     * 获取数据库的所有表名
     *
     * @param request 请求参数
     * @return 表名列表
     */
    @PostMapping("/tables")
    @Operation(summary = "获取数据库的所有表名")
    public Result<List<String>> getTableNames(@RequestBody ConnectorIdRequest request) {
        try {
            String connectorId = request.getConnectorId();
            log.info("API - 获取表名列表: connectorId={}", connectorId);
            
            // 获取连接器实例
            IRdbConnector connector = connectorManager.getConnector(connectorId, IRdbConnector.class);
            
            // 获取表名列表
            CompletableFuture<List<String>> future = connector.getTableNames();
            List<String> tableNames = future.join();
            
            log.info("获取表名列表成功: connectorId={}, 表数量={}", connectorId, tableNames.size());
            return Result.ok(tableNames);
            
        } catch (Exception e) {
            log.error("获取表名列表失败: connectorId={}", request.getConnectorId(), e);
            return Result.error("获取表名列表失败: " + e.getMessage());
        }
    }

    /**
     * 获取表的字段元数据
     *
     * @param request 请求参数
     * @return 表字段元数据列表
     */
    @PostMapping("/table-columns")
    @Operation(summary = "获取表的字段元数据")
    public Result<List<Map<String, Object>>> getTableMetadata(@RequestBody TableRequest request) {
        try {
            String connectorId = request.getConnectorId();
            String tableName = request.getTableName();
            log.info("API - 获取表字段元数据: connectorId={}, tableName={}", connectorId, tableName);
            
            // 获取连接器实例
            IRdbConnector connector = connectorManager.getConnector(connectorId, IRdbConnector.class);
            
            // 获取表元数据
            CompletableFuture<List<Map<String, Object>>> future = connector.getTableMetadata(tableName);
            List<Map<String, Object>> metadata = future.join();
            
            log.info("获取表字段元数据成功: connectorId={}, tableName={}, 字段数量={}", 
                    connectorId, tableName, metadata.size());
            return Result.ok(metadata);
            
        } catch (Exception e) {
            log.error("获取表字段元数据失败: connectorId={}, tableName={}", 
                    request.getConnectorId(), request.getTableName(), e);
            return Result.error("获取表字段元数据失败: " + e.getMessage());
        }
    }

    /**
     * 获取表的主键列
     *
     * @param request 请求参数
     * @return 主键列名列表
     */
    @PostMapping("/primary-keys")
    @Operation(summary = "获取表的主键列")
    public Result<List<String>> getPrimaryKeys(@RequestBody TableRequest request) {
        try {
            String connectorId = request.getConnectorId();
            String tableName = request.getTableName();
            log.info("API - 获取表主键: connectorId={}, tableName={}", connectorId, tableName);
            
            // 获取连接器实例
            IRdbConnector connector = connectorManager.getConnector(connectorId, IRdbConnector.class);
            
            // 获取主键列表
            CompletableFuture<List<String>> future = connector.getPrimaryKeys(tableName);
            List<String> primaryKeys = future.join();
            
            log.info("获取表主键成功: connectorId={}, tableName={}, 主键数量={}", 
                    connectorId, tableName, primaryKeys.size());
            return Result.ok(primaryKeys);
            
        } catch (Exception e) {
            log.error("获取表主键失败: connectorId={}, tableName={}", 
                    request.getConnectorId(), request.getTableName(), e);
            return Result.error("获取表主键失败: " + e.getMessage());
        }
    }

    /**
     * 获取数据库元数据
     *
     * @param request 请求参数
     * @return 数据库元数据
     */
    @PostMapping("/database-info")
    @Operation(summary = "获取数据库元数据")
    public Result<Map<String, Object>> getDatabaseMetadata(@RequestBody ConnectorIdRequest request) {
        try {
            String connectorId = request.getConnectorId();
            log.info("API - 获取数据库元数据: connectorId={}", connectorId);
            
            // 获取连接器实例
            IRdbConnector connector = connectorManager.getConnector(connectorId, IRdbConnector.class);
            
            // 获取数据库元数据
            CompletableFuture<Map<String, Object>> future = connector.getDatabaseMetadata();
            Map<String, Object> metadata = future.join();
            
            log.info("获取数据库元数据成功: connectorId={}, 数据库产品={}", 
                    connectorId, metadata.get("databaseProductName"));
            return Result.ok(metadata);
            
        } catch (Exception e) {
            log.error("获取数据库元数据失败: connectorId={}", request.getConnectorId(), e);
            return Result.error("获取数据库元数据失败: " + e.getMessage());
        }
    }

    /**
     * 获取表的索引信息
     *
     * @param request 请求参数
     * @return 索引信息列表
     */
    @PostMapping("/indexes")
    @Operation(summary = "获取表的索引信息")
    public Result<List<Map<String, Object>>> getIndexInfo(@RequestBody TableRequest request) {
        try {
            String connectorId = request.getConnectorId();
            String tableName = request.getTableName();
            log.info("API - 获取表索引信息: connectorId={}, tableName={}", connectorId, tableName);
            
            // 获取连接器实例
            IRdbConnector connector = connectorManager.getConnector(connectorId, IRdbConnector.class);
            
            // 获取索引信息
            CompletableFuture<List<Map<String, Object>>> future = connector.getIndexInfo(tableName);
            List<Map<String, Object>> indexes = future.join();
            
            log.info("获取表索引信息成功: connectorId={}, tableName={}, 索引数量={}", 
                    connectorId, tableName, indexes.size());
            return Result.ok(indexes);
            
        } catch (Exception e) {
            log.error("获取表索引信息失败: connectorId={}, tableName={}", 
                    request.getConnectorId(), request.getTableName(), e);
            return Result.error("获取表索引信息失败: " + e.getMessage());
        }
    }

    /**
     * 获取表的外键信息
     *
     * @param request 请求参数
     * @return 外键信息列表
     */
    @PostMapping("/foreign-keys")
    @Operation(summary = "获取表的外键信息")
    public Result<List<Map<String, Object>>> getForeignKeys(@RequestBody TableRequest request) {
        try {
            String connectorId = request.getConnectorId();
            String tableName = request.getTableName();
            log.info("API - 获取表外键信息: connectorId={}, tableName={}", connectorId, tableName);
            
            // 获取连接器实例
            IRdbConnector connector = connectorManager.getConnector(connectorId, IRdbConnector.class);
            
            // 获取外键信息
            CompletableFuture<List<Map<String, Object>>> future = connector.getForeignKeys(tableName);
            List<Map<String, Object>> foreignKeys = future.join();
            
            log.info("获取表外键信息成功: connectorId={}, tableName={}, 外键数量={}", 
                    connectorId, tableName, foreignKeys.size());
            return Result.ok(foreignKeys);
            
        } catch (Exception e) {
            log.error("获取表外键信息失败: connectorId={}, tableName={}", 
                    request.getConnectorId(), request.getTableName(), e);
            return Result.error("获取表外键信息失败: " + e.getMessage());
        }
    }
}
