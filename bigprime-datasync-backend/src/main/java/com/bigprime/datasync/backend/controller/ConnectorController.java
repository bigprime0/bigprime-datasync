package com.bigprime.datasync.backend.controller;

import com.bigprime.connector.entities.ConnectorMetaEntity;
import com.bigprime.connector.service.ConnectorService;
import com.bigprime.connector.vo.ConnectionPoolInfo;
import com.bigprime.connector.vo.ConnectorBasicInfo;
import com.bigprime.connector.vo.ConnectorDetailInfo;
import com.bigprime.connector.vo.ConnectorEventHistory;
import com.bigprime.datasync.core.model.MyPageResult;
import com.bigprime.datasync.core.model.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * 连接中心API控制器
 * 提供连接器管理的REST API接口
 *
 * @author bigprime
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/connector")
@Tag(name = "连接中心管理")
@AllArgsConstructor
public class ConnectorController {
    private final ConnectorService connectorService;

    /**
     * 注册连接器
     *
     * @param entity 连接器配置
     * @return 操作结果
     */
    @PostMapping("/register")
    @Operation(summary = "注册连接器")
    public Result<Long> registerConnector(@RequestBody ConnectorMetaEntity entity) {
        return Result.ok(connectorService.saveConnector(entity));
    }

    @PostMapping("/list")
    @Operation(summary = "注册连接器")
    public Result<MyPageResult<ConnectorMetaEntity>> getConnectorList(@RequestBody Map<String, Object> params) {
        try {
            String search = params.getOrDefault("search", "").toString();
            Integer page = Integer.parseInt(params.getOrDefault("page", "1").toString());
            Integer limit = Integer.parseInt(params.getOrDefault("pageSize", "20").toString());
            MyPageResult<ConnectorMetaEntity> connectorList = connectorService.getConnectorPage(search, page, limit);
            return Result.ok(connectorList);
        } catch (NumberFormatException e) {
            log.error("分页参数无效", e);
            return Result.error("分页参数必须为有效数字");
        } catch (Exception e) {
            log.error("获取连接器列表失败", e);
            return Result.error("获取连接器列表失败: " + e.getMessage());
        }
    }

    /**
     * 测试连接器
     *
     * @param entity 测试连接器配置
     * @return 操作结果
     */
    @PostMapping("/test")
    @Operation(summary = "测试连接器")
    public Result<Boolean> testConnector(@RequestBody ConnectorMetaEntity entity) {
        try {
            return Result.ok(connectorService.testConnection(entity));
        } catch (Exception e) {
            log.error("测试连接器失败", e);
            return Result.error("测试连接器失败");
        }
    }

    /**
     * 获取单个连接器
     *
     * @param id 获取单个连接器
     * @return 操作结果
     */

    @GetMapping("/get/{id}")
    @Operation(summary = "获取单个连接器实体")
    public Result<ConnectorMetaEntity> getConnectorById(@PathVariable String id) {
        return Result.ok(connectorService.getConnectorById(id));
    }

    /**
     * 删除连接器
     *
     * @param id 删除连接器
     * @return 操作结果
     */
    @DeleteMapping("/delete/{id}")
    @Operation(summary = "删除连接器")
    public Result<Long> deleteConnector(@PathVariable String id) {
        return Result.ok(connectorService.deleteConnector(id));
    }

    /**
     * 获取连接器基本信息
     *
     * @param id 连接器ID
     * @return 连接器基本信息
     */
    @GetMapping("/basic-info/{id}")
    @Operation(summary = "获取连接器基本信息")
    public Result<ConnectorBasicInfo> getConnectorBasicInfo(@PathVariable String id) {
        return Result.ok(connectorService.getConnectorBasicInfo(id));
    }

    /**
     * 获取连接器连接池信息
     *
     * @param id 连接器ID
     * @return 连接池信息
     */
    @GetMapping("/pool-info/{id}")
    @Operation(summary = "获取连接器连接池信息")
    public Result<ConnectionPoolInfo> getConnectorConnectionPoolInfo(@PathVariable String id) {
        return Result.ok(connectorService.getConnectorConnectionPoolInfo(id));
    }

    /**
     * 获取连接器事件历史
     *
     * @param id 连接器ID
     * @param maxSize 最大历史记录数量，默认为50
     * @return 事件历史列表
     */
    @GetMapping("/event-history/{id}")
    @Operation(summary = "获取连接器事件历史")
    public Result<List<ConnectorEventHistory>> getConnectorEventHistory(@PathVariable String id, 
                                                                       @RequestParam(defaultValue = "50") int maxSize) {
        return Result.ok(connectorService.getConnectorEventHistory(id, maxSize));
    }

    /**
     * 获取连接器完整详细信息
     *
     * @param id 连接器ID
     * @param includeEventHistory 是否包含事件历史，默认为true
     * @param maxHistorySize 最大历史记录数量，默认为50
     * @return 连接器详细信息
     */
    @GetMapping("/detail-info/{id}")
    @Operation(summary = "获取连接器完整详细信息")
    public Result<ConnectorDetailInfo> getConnectorDetailInfo(@PathVariable String id, 
                                                             @RequestParam(defaultValue = "true") boolean includeEventHistory, 
                                                             @RequestParam(defaultValue = "50") int maxHistorySize) {
        return Result.ok(connectorService.getConnectorDetailInfo(id, includeEventHistory, maxHistorySize));
    }

    /**
     * 获取所有连接器的ID列表
     *
     * @return 连接器ID列表
     */
    @GetMapping("/all-ids")
    @Operation(summary = "获取所有连接器的ID列表")
    public Result<Set<String>> getAllConnectorIds() {
        return Result.ok(connectorService.getAllConnectorIds());
    }

    /**
     * 获取连接器综合连接信息
     * 包含基本信息、连接配置、连接池信息、事件历史等所有信息
     *
     * @param id 连接器ID
     * @param includeEventHistory 是否包含事件历史，默认为true
     * @param maxHistorySize 最大历史记录数量，默认为50
     * @return 综合连接信息
     */
    @GetMapping("/info/{id}")
    @Operation(summary = "获取连接器综合连接信息")
    public Result<Map<String, Object>> getConnectorComprehensiveInfo(@PathVariable String id, 
                                                                   @RequestParam(defaultValue = "true") boolean includeEventHistory, 
                                                                   @RequestParam(defaultValue = "50") int maxHistorySize) {
        Map<String, Object> comprehensiveInfo = new HashMap<>();
        
        // 添加基本信息
        comprehensiveInfo.put("basicInfo", connectorService.getConnectorBasicInfo(id));
        
        // 添加连接配置信息
        comprehensiveInfo.put("connectionConfig", connectorService.getConnectorConnectionConfig(id));
        
        // 添加连接池信息
        comprehensiveInfo.put("connectionPool", connectorService.getConnectorConnectionPoolInfo(id));
        
        // 可选添加事件历史
        if (includeEventHistory) {
            comprehensiveInfo.put("eventHistory", connectorService.getConnectorEventHistory(id, maxHistorySize));
        }
        
        // 添加完整详细信息
        comprehensiveInfo.put("detailInfo", connectorService.getConnectorDetailInfo(id, includeEventHistory, maxHistorySize));
        
        return Result.ok(comprehensiveInfo);
    }

    /**
     * 获取连接器实现类集合
     *
     * @return 操作结果
     */
    @GetMapping("/impl/list")
    @Operation(summary = "获取连接器实现类集合")
    public Result<List<Map<String, Object>>> getConnectorImplClasses() {
        return Result.ok(connectorService.getConnectorImplClasses());
    }
}