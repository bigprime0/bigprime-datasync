package com.bigprime.datasync.backend.service.lineage;

import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.TypeReference;
import com.bigprime.datasync.backend.handler.lineage.DataLineageHandler;
import com.bigprime.datasync.backend.handler.lineage.dto.*;
import com.bigprime.datasync.backend.handler.model.lineage.DataLineage;
import com.bigprime.datasync.backend.query.lineage.DataLineageQuery;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 数据血缘服务类
 *
 * @author lyw
 * @version 1.0
 */
@Slf4j
@Service
@AllArgsConstructor
public class DataLineageService {

    private final DataLineageHandler handler;

    /**
     * 保存血缘记录
     */
    public long save(DataLineage lineage) {
        return handler.insert(lineage);
    }

    /**
     * 查询血缘列表
     */
    public List<DataLineage> list(DataLineageQuery query) {
        return handler.list(query);
    }

    /**
     * 构建节点唯一ID
     */
    private String buildNodeId(String type, String database, String table) {
        return String.format("%s:%s:%s", 
            type != null ? type : "unknown", 
            database != null ? database : "default", 
            table != null ? table : "unknown");
    }

    /**
     * 查询上游血缘（数据来源）
     *
     * @param type 数据源类型
     * @param database 数据库名
     * @param table 表名
     * @param maxDepth 最大深度（-1表示无限制）
     * @return 血缘图
     */
    public LineageGraph getUpstreamLineage(String type, String database, String table, Integer maxDepth) {
        log.info("查询上游血缘: type={}, database={}, table={}, maxDepth={}", type, database, table, maxDepth);

        String rootNodeId = buildNodeId(type, database, table);
        Set<LineageNode> nodeSet = new LinkedHashSet<>();
        Set<LineageEdge> edgeSet = new LinkedHashSet<>();
        
        // 递归查询上游
        queryUpstreamRecursive(type, database, table, 0, maxDepth, nodeSet, edgeSet);

        // 构建统计信息
        LineageStatistics statistics = buildStatistics(nodeSet, edgeSet);

        return LineageGraph.builder()
                .nodes(new ArrayList<>(nodeSet))
                .edges(new ArrayList<>(edgeSet))
                .rootNodeId(rootNodeId)
                .direction("upstream")
                .maxDepth(maxDepth)
                .statistics(statistics)
                .build();
    }

    /**
     * 递归查询上游
     */
    private void queryUpstreamRecursive(String targetType, String targetDatabase, String targetTable,
                                       int currentDepth, int maxDepth,
                                       Set<LineageNode> nodes, Set<LineageEdge> edges) {
        // 检查深度限制
        if (maxDepth != -1 && currentDepth > maxDepth) {
            return;
        }

        // 查询以当前节点为目标的所有血缘记录
        DataLineageQuery query = new DataLineageQuery();
        query.setTargetType(targetType);
        query.setTargetDatabase(targetDatabase);
        query.setTargetTable(targetTable);
        
        List<DataLineage> lineages = handler.list(query);
        
        if (lineages == null || lineages.isEmpty()) {
            // 没有上游了，创建源节点
            LineageNode sourceNode = createNodeFromTarget(targetType, targetDatabase, targetTable, currentDepth);
            nodes.add(sourceNode);
            return;
        }

        for (DataLineage lineage : lineages) {
            // 创建源节点
            LineageNode sourceNode = createNodeFromSource(lineage, currentDepth);
            nodes.add(sourceNode);

            // 创建目标节点
            LineageNode targetNode = createNodeFromTarget(lineage, currentDepth + 1);
            nodes.add(targetNode);

            // 创建边
            LineageEdge edge = createEdge(lineage, sourceNode.getId(), targetNode.getId());
            edges.add(edge);

            // 递归查询上游
            queryUpstreamRecursive(
                    lineage.getSourceType(),
                    lineage.getSourceDatabase(),
                    lineage.getSourceTable(),
                    currentDepth + 1,
                    maxDepth,
                    nodes,
                    edges
            );
        }
    }

    /**
     * 查询下游血缘（数据流向）
     *
     * @param type 数据源类型
     * @param database 数据库名
     * @param table 表名
     * @param maxDepth 最大深度
     * @return 血缘图
     */
    public LineageGraph getDownstreamLineage(String type, String database, String table, Integer maxDepth) {
        log.info("查询下游血缘: type={}, database={}, table={}, maxDepth={}", type, database, table, maxDepth);

        String rootNodeId = buildNodeId(type, database, table);
        Set<LineageNode> nodeSet = new LinkedHashSet<>();
        Set<LineageEdge> edgeSet = new LinkedHashSet<>();

        // 递归查询下游
        queryDownstreamRecursive(type, database, table, 0, maxDepth, nodeSet, edgeSet);

        // 构建统计信息
        LineageStatistics statistics = buildStatistics(nodeSet, edgeSet);

        return LineageGraph.builder()
                .nodes(new ArrayList<>(nodeSet))
                .edges(new ArrayList<>(edgeSet))
                .rootNodeId(rootNodeId)
                .direction("downstream")
                .maxDepth(maxDepth)
                .statistics(statistics)
                .build();
    }

    /**
     * 递归查询下游
     */
    private void queryDownstreamRecursive(String sourceType, String sourceDatabase, String sourceTable,
                                         int currentDepth, int maxDepth,
                                         Set<LineageNode> nodes, Set<LineageEdge> edges) {
        // 检查深度限制
        if (maxDepth != -1 && currentDepth > maxDepth) {
            return;
        }

        // 查询以当前节点为源的所有血缘记录
        DataLineageQuery query = new DataLineageQuery();
        query.setSourceType(sourceType);
        query.setSourceDatabase(sourceDatabase);
        query.setSourceTable(sourceTable);

        List<DataLineage> lineages = handler.list(query);

        if (lineages == null || lineages.isEmpty()) {
            // 没有下游了，创建终点节点
            LineageNode endNode = createNodeFromSource(sourceType, sourceDatabase, sourceTable, currentDepth);
            nodes.add(endNode);
            return;
        }

        for (DataLineage lineage : lineages) {
            // 创建源节点
            LineageNode sourceNode = createNodeFromSource(lineage, currentDepth);
            nodes.add(sourceNode);

            // 创建目标节点
            LineageNode targetNode = createNodeFromTarget(lineage, currentDepth + 1);
            nodes.add(targetNode);

            // 创建边
            LineageEdge edge = createEdge(lineage, sourceNode.getId(), targetNode.getId());
            edges.add(edge);

            // 递归查询下游
            queryDownstreamRecursive(
                    lineage.getTargetType(),
                    lineage.getTargetDatabase(),
                    lineage.getTargetTable(),
                    currentDepth + 1,
                    maxDepth,
                    nodes,
                    edges
            );
        }
    }

    /**
     * 查询完整血缘（上下游）
     *
     * @param type 数据源类型
     * @param database 数据库名
     * @param table 表名
     * @param maxDepth 最大深度
     * @return 血缘图
     */
    public LineageGraph getFullLineage(String type, String database, String table, Integer maxDepth) {
        log.info("查询完整血缘: type={}, database={}, table={}, maxDepth={}", type, database, table, maxDepth);

        String rootNodeId = buildNodeId(type, database, table);
        Set<LineageNode> nodeSet = new LinkedHashSet<>();
        Set<LineageEdge> edgeSet = new LinkedHashSet<>();

        // 查询上游
        queryUpstreamRecursive(type, database, table, 0, maxDepth, nodeSet, edgeSet);
        
        // 查询下游
        queryDownstreamRecursive(type, database, table, 0, maxDepth, nodeSet, edgeSet);

        // 构建统计信息
        LineageStatistics statistics = buildStatistics(nodeSet, edgeSet);

        return LineageGraph.builder()
                .nodes(new ArrayList<>(nodeSet))
                .edges(new ArrayList<>(edgeSet))
                .rootNodeId(rootNodeId)
                .direction("full")
                .maxDepth(maxDepth)
                .statistics(statistics)
                .build();
    }

    /**
     * 根据DAG执行ID查询血缘
     *
     * @param dagExecutionId DAG执行ID
     * @return 血缘图
     */
    public LineageGraph getLineageByDagExecution(String dagExecutionId) {
        log.info("根据DAG执行ID查询血缘: dagExecutionId={}", dagExecutionId);

        DataLineageQuery query = new DataLineageQuery();
        query.setDagExecutionId(dagExecutionId);
        
        List<DataLineage> lineages = handler.list(query);

        Set<LineageNode> nodeSet = new LinkedHashSet<>();
        Set<LineageEdge> edgeSet = new LinkedHashSet<>();

        for (DataLineage lineage : lineages) {
            // 创建源节点
            LineageNode sourceNode = createNodeFromSource(lineage, lineage.getLineageLevel());
            nodeSet.add(sourceNode);

            // 创建目标节点
            LineageNode targetNode = createNodeFromTarget(lineage, lineage.getLineageLevel() + 1);
            nodeSet.add(targetNode);

            // 创建边
            LineageEdge edge = createEdge(lineage, sourceNode.getId(), targetNode.getId());
            edgeSet.add(edge);
        }

        // 构建统计信息
        LineageStatistics statistics = buildStatistics(nodeSet, edgeSet);

        return LineageGraph.builder()
                .nodes(new ArrayList<>(nodeSet))
                .edges(new ArrayList<>(edgeSet))
                .rootNodeId(null)
                .direction("dag")
                .maxDepth(null)
                .statistics(statistics)
                .build();
    }

    /**
     * 从源端信息创建节点
     */
    private LineageNode createNodeFromSource(DataLineage lineage, int level) {
        String nodeId = buildNodeId(lineage.getSourceType(), lineage.getSourceDatabase(), lineage.getSourceTable());
        
        List<String> fields = null;
        if (StringUtils.hasText(lineage.getSourceFields())) {
            fields = JSON.parseObject(lineage.getSourceFields(), new TypeReference<List<String>>() {});
        }

        return LineageNode.builder()
                .id(nodeId)
                .name(lineage.getSourceTable())
                .nodeType("source")
                .dataSourceType(lineage.getSourceType())
                .connectorId(lineage.getSourceConnectorId())
                .database(lineage.getSourceDatabase())
                .table(lineage.getSourceTable())
                .fields(fields)
                .level(level)
                .build();
    }

    /**
     * 从源端类型信息创建节点
     */
    private LineageNode createNodeFromSource(String type, String database, String table, int level) {
        String nodeId = buildNodeId(type, database, table);

        return LineageNode.builder()
                .id(nodeId)
                .name(table)
                .nodeType("source")
                .dataSourceType(type)
                .database(database)
                .table(table)
                .level(level)
                .build();
    }

    /**
     * 从目标端信息创建节点
     */
    private LineageNode createNodeFromTarget(DataLineage lineage, int level) {
        String nodeId = buildNodeId(lineage.getTargetType(), lineage.getTargetDatabase(), lineage.getTargetTable());
        
        List<String> fields = null;
        if (StringUtils.hasText(lineage.getTargetFields())) {
            fields = JSON.parseObject(lineage.getTargetFields(), new TypeReference<List<String>>() {});
        }

        return LineageNode.builder()
                .id(nodeId)
                .name(lineage.getTargetTable())
                .nodeType("target")
                .dataSourceType(lineage.getTargetType())
                .connectorId(lineage.getTargetConnectorId())
                .database(lineage.getTargetDatabase())
                .table(lineage.getTargetTable())
                .fields(fields)
                .level(level)
                .build();
    }

    /**
     * 从目标端类型信息创建节点
     */
    private LineageNode createNodeFromTarget(String type, String database, String table, int level) {
        String nodeId = buildNodeId(type, database, table);

        return LineageNode.builder()
                .id(nodeId)
                .name(table)
                .nodeType("target")
                .dataSourceType(type)
                .database(database)
                .table(table)
                .level(level)
                .build();
    }

    /**
     * 创建边
     */
    private LineageEdge createEdge(DataLineage lineage, String sourceId, String targetId) {
        Map<String, String> fieldMapping = null;
        if (StringUtils.hasText(lineage.getFieldMapping())) {
            fieldMapping = JSON.parseObject(lineage.getFieldMapping(), new TypeReference<Map<String, String>>() {});
        }

        return LineageEdge.builder()
                .id(lineage.getId() != null ? lineage.getId().toString() : null)
                .sourceId(sourceId)
                .targetId(targetId)
                .edgeType("data_flow")
                .fieldMapping(fieldMapping)
                .transformLogic(lineage.getTransformLogic())
                .dagExecutionId(lineage.getDagExecutionId())
                .nodeId(lineage.getNodeId())
                .recordCount(lineage.getRecordCount())
                .status(lineage.getStatus())
                .build();
    }

    /**
     * 构建统计信息
     */
    private LineageStatistics buildStatistics(Set<LineageNode> nodes, Set<LineageEdge> edges) {
        int sourceCount = (int) nodes.stream()
                .filter(n -> "source".equals(n.getNodeType()))
                .count();
        
        int targetCount = (int) nodes.stream()
                .filter(n -> "target".equals(n.getNodeType()))
                .count();

        int maxDepth = nodes.stream()
                .mapToInt(n -> n.getLevel() != null ? n.getLevel() : 0)
                .max()
                .orElse(0);

        long totalRecords = edges.stream()
                .mapToLong(e -> e.getRecordCount() != null ? e.getRecordCount() : 0L)
                .sum();

        int successCount = (int) edges.stream()
                .filter(e -> "SUCCESS".equals(e.getStatus()))
                .count();

        int failedCount = (int) edges.stream()
                .filter(e -> "FAILED".equals(e.getStatus()))
                .count();

        return LineageStatistics.builder()
                .totalNodes(nodes.size())
                .totalEdges(edges.size())
                .maxDepth(maxDepth)
                .totalDataSources(sourceCount)
                .totalTargets(targetCount)
                .totalIntermediateNodes(nodes.size() - sourceCount - targetCount)
                .totalRecordCount(totalRecords)
                .successCount(successCount)
                .failedCount(failedCount)
                .build();
    }

    /**
     * 查询字段级血缘
     *
     * @param type 数据源类型
     * @param database 数据库名
     * @param table 表名
     * @param fieldName 字段名
     * @return 字段血缘链路
     */
    public List<Map<String, Object>> getFieldLineage(String type, String database, String table, String fieldName) {
        log.info("查询字段血缘: type={}, database={}, table={}, field={}", type, database, table, fieldName);

        List<Map<String, Object>> result = new ArrayList<>();

        // 查询上游血缘
        DataLineageQuery query = new DataLineageQuery();
        query.setTargetType(type);
        query.setTargetDatabase(database);
        query.setTargetTable(table);

        List<DataLineage> lineages = handler.list(query);

        for (DataLineage lineage : lineages) {
            if (!StringUtils.hasText(lineage.getFieldMapping())) {
                continue;
            }

            Map<String, String> mapping = JSON.parseObject(lineage.getFieldMapping(), 
                new TypeReference<Map<String, String>>() {});

            // 查找字段映射
            for (Map.Entry<String, String> entry : mapping.entrySet()) {
                if (fieldName.equals(entry.getValue())) {
                    Map<String, Object> fieldLineage = new HashMap<>();
                    fieldLineage.put("sourceType", lineage.getSourceType());
                    fieldLineage.put("sourceDatabase", lineage.getSourceDatabase());
                    fieldLineage.put("sourceTable", lineage.getSourceTable());
                    fieldLineage.put("sourceField", entry.getKey());
                    fieldLineage.put("targetField", entry.getValue());
                    fieldLineage.put("transformLogic", lineage.getTransformLogic());
                    result.add(fieldLineage);
                }
            }
        }

        return result;
    }
}
