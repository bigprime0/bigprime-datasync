package com.bigprime.datasync.backend.controller.lineage;

import com.bigprime.datasync.core.model.Result;
import com.bigprime.lineage.entity.SqlParseHistoryEntity;
import com.bigprime.lineage.parser.model.LineageParseResult;
import com.bigprime.lineage.service.SqlLineageParseService;
import com.bigprime.lineage.service.LineageDataService;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * SQL血缘解析Controller
 * 
 * @author bigprime
 * @version 1.0
 */
@RestController
@RequestMapping("/api/lineage/sql-parse")
@AllArgsConstructor
public class SqlLineageParseController {
    
    private final SqlLineageParseService sqlLineageParseService;
    private final LineageDataService lineageDataService;
    
    /**
     * 解析SQL获取血缘关系
     */
    @PostMapping("/parse")
    public Result<LineageParseResult> parseSql(@RequestBody SqlParseRequest request) {
        LineageParseResult result = sqlLineageParseService.parseSql(
                request.getSql(),
                request.getDatabaseType(),
                request.getDefaultDatabase(),
                request.getDefaultSchema()
        );
        return Result.ok(result);
    }
    
    /**
     * 获取支持的数据库类型
     */
    @GetMapping("/supported-databases")
    public Result<String[]> getSupportedDatabases() {
        return Result.ok(sqlLineageParseService.getSupportedDatabases());
    }
    
    /**
     * 获取解析历史
     */
    @GetMapping("/history")
    public Result<List<SqlParseHistoryEntity>> getParseHistory(
            @RequestParam(defaultValue = "10") int pageSize) {
        List<SqlParseHistoryEntity> history = sqlLineageParseService.getParseHistory(pageSize);
        return Result.ok(history);
    }
    
    /**
     * 保存解析结果到血缘存储
     */
    @PostMapping("/save")
    public Result<Void> saveLineage(@RequestBody LineageParseResult parseResult) {
        lineageDataService.saveLineageFromParseResult(parseResult);
        return Result.ok();
    }
    
    /**
     * SQL解析请求
     */
    @Data
    public static class SqlParseRequest {
        /**
         * SQL语句
         */
        private String sql;
        
        /**
         * 数据库类型 (MYSQL/ORACLE/POSTGRESQL/HIVE/STARROCKS等)
         */
        private String databaseType;
        
        /**
         * 默认数据库名
         */
        private String defaultDatabase;
        
        /**
         * 默认Schema名
         */
        private String defaultSchema;
    }
}
