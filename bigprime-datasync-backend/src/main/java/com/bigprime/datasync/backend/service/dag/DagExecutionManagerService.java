package com.bigprime.datasync.backend.service.dag;

import cn.hutool.json.JSONUtil;
import com.bigprime.action.api.ActionResult;
import com.bigprime.datasync.backend.service.lineage.DataLineageService;
import com.bigprime.datasync.dag.core.DagEngine;
import com.bigprime.datasync.dag.core.builder.ActionRegistry;
import com.bigprime.datasync.dag.core.builder.DagBuilder;
import com.bigprime.datasync.dag.core.builder.DagDefinition;
import com.bigprime.datasync.dag.core.enums.ResultState;
import com.bigprime.datasync.dag.core.message.ActionFutureManager;
import com.bigprime.datasync.dag.core.message.DagMQCenter;
import com.bigprime.datasync.dag.core.persistence.DagPersistenceManager;
import com.bigprime.datasync.dag.core.wrapper.OperatorWrapper;
import com.bigprime.datasync.dag.service.DagExecutionService;
import com.bigprime.datasync.backend.handler.model.lineage.DataLineage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * DAG执行管理服务
 */
@Slf4j
@Service
public class DagExecutionManagerService {

    @Autowired
    private DagExecutionService dagExecutionService;
    
    @Autowired
    private DataLineageService dataLineageService;
    
    @Autowired
    private ActionRegistry actionRegistry;
    
    @Autowired
    private DagMQCenter dagMQCenter;
    
    @Autowired
    private ActionFutureManager actionFutureManager;
    
    private final ExecutorService dagExecutor = Executors.newFixedThreadPool(10);
    private final Map<String, DagEngine> runningEngines = new HashMap<>();

    /**
     * 提交并执行DAG
     */
    public String submitAndExecute(DagDefinition definition) {
        log.info("接收DAG提交: dagId={}, 节点数={}", definition.getDagId(), definition.getNodes().size());
        
        try {
            String executionId = dagExecutionService.createExecution(
                    definition.getDagId(),
                    definition.getName(),
                    "前端提交",
                    definition.getNodes().size(),
                    JSONUtil.toJsonStr(definition)
            );
            
            dagExecutor.submit(() -> executeDAG(definition, executionId));
            return executionId;
            
        } catch (Exception e) {
            log.error("提交DAG失败", e);
            throw new RuntimeException("提交DAG失败: " + e.getMessage(), e);
        }
    }

    private void executeDAG(DagDefinition definition, String executionId) {
        log.info("开始构建DAG引擎: executionId={}", executionId);
        
        try {
            DagBuilder builder = new DagBuilder(actionRegistry, dagMQCenter, actionFutureManager);
            DagEngine engine = builder.build(definition, dagExecutor);
            
            runningEngines.put(executionId, engine);
            setupPersistenceCallbacks(engine, executionId, definition);
            
            dagExecutionService.startExecution(executionId);
            log.info("DAG开始执行: executionId={}", executionId);
            
            engine.runAndWait(definition.getTimeout());
            
            // 收集所有节点的执行结果（ActionResult 含 extraInfo: plugin/connectorId/table 等）
            Map<String, ActionResult> nodeResults = collectNodeResults(engine);
            
            runningEngines.remove(executionId);
            
            // 检查是否有失败节点，若有则整体标记为失败
            boolean hasFailed = hasFailedNodes(engine);
            if (hasFailed) {
                String failedNodeInfo = getFailedNodeSummary(engine);
                dagExecutionService.failExecution(executionId, "存在失败节点: " + failedNodeInfo, null);
                log.warn("DAG执行完成但存在失败节点: executionId={}, failedNodes={}", executionId, failedNodeInfo);
            } else {
                dagExecutionService.completeExecution(executionId);
                log.info("DAG执行成功: executionId={}", executionId);
            }
            
            // 上报数据血缘关系
            reportDataLineage(executionId, definition, nodeResults);
            
        } catch (Exception e) {
            log.error("DAG执行失败: executionId={}", executionId, e);
            runningEngines.remove(executionId);
            dagExecutionService.failExecution(executionId, e.getMessage(), getStackTrace(e));
        }
    }

    private void setupPersistenceCallbacks(DagEngine engine, String executionId, DagDefinition definition) {
        DagPersistenceManager pm = new DagPersistenceManager(dagExecutionService);
        pm.setEnabled(false); // 不使用pm的initExecution，因为外层已创建执行记录
        
        // 设置节点执行前回调
        engine.beforeOp(wrapper -> {
            try {
                // 创建节点执行记录
                String nodeId = wrapper.getId();
                String nodeType = wrapper.getOperator().getClass().getName();
                dagExecutionService.createNodeExecution(executionId, nodeId, nodeId, nodeType, 0);
                dagExecutionService.startNodeExecution(executionId + "_" + nodeId);
            } catch (Exception e) {
                log.warn("节点执行前回调失败", e);
            }
        });
        
        // 设置节点执行后回调（根据结果状态调用不同方法）
        engine.afterOp(wrapper -> {
            try {
                String nodeId = wrapper.getId();
                String nodeExecutionId = executionId + "_" + nodeId;
                
                // 判断节点是否真正成功：
                // 1. ResultState 必须是 SUCCESS（抛异常时会被设为 EXCEPTION）
                // 2. 如果返回值是 ActionResult，则 ActionResult.isSuccess() 也必须为 true
                //    （如 SeaTunnelSubmitJobAction 失败时返回 ActionResult.failure()，ResultState 仍是 SUCCESS）
                boolean nodeSuccess = false;
                String errorMsg = "执行失败";
                String errorStack = null;
                String externalMetricsJson = null;
                
                if (wrapper.getOperatorResult() != null) {
                    ResultState state = wrapper.getOperatorResult().getResultState();
                    if (state == ResultState.SUCCESS) {
                        Object result = wrapper.getOperatorResult().getResult();
                        if (result instanceof ActionResult) {
                            ActionResult actionResult = (ActionResult) result;
                            if (actionResult.isSuccess()) {
                                nodeSuccess = true;
                                // 提取 externalMetrics（SeaTunnel/Flink 任务的真实读写行数）
                                Map<String, Object> extra = actionResult.getExtraInfo();
                                if (extra != null) {
                                    // readRowCount / writeRowCount 由 SeaTunnelSubmitJobAction 在轮询结束后写入
                                    Object readCount = extra.get("readRowCount");
                                    Object writeCount = extra.get("writeRowCount");
                                    if (readCount != null || writeCount != null) {
                                        Map<String, Object> metricsMap = new java.util.HashMap<>();
                                        if (readCount != null) metricsMap.put("readRowCount", readCount);
                                        if (writeCount != null) metricsMap.put("writeRowCount", writeCount);
                                        externalMetricsJson = cn.hutool.json.JSONUtil.toJsonStr(metricsMap);
                                    }
                                }
                            } else {
                                errorMsg = actionResult.getErrorMessage() != null ? actionResult.getErrorMessage() : "ActionResult.failure()";
                            }
                        } else {
                            nodeSuccess = true;
                        }
                    } else {
                        if (wrapper.getOperatorResult().getEx() != null) {
                            errorMsg = wrapper.getOperatorResult().getEx().getMessage();
                        }
                    }
                }
                
                if (nodeSuccess) {
                    dagExecutionService.completeNodeExecution(nodeExecutionId, externalMetricsJson);
                    // 若有外部指标，同步写入 externalMetrics 字段
                    if (externalMetricsJson != null) {
                        dagExecutionService.updateNodeExternalJobInfo(nodeExecutionId, null, null, null, externalMetricsJson);
                    }
                } else {
                    dagExecutionService.failNodeExecution(nodeExecutionId, errorMsg, errorStack);
                }
            } catch (Exception e) {
                log.warn("节点执行后回调失败", e);
            }
        });
    }

    public void stopExecution(String executionId) {
        DagEngine engine = runningEngines.get(executionId);
        if (engine != null) {
            runningEngines.remove(executionId);
            dagExecutionService.cancelExecution(executionId);
        }
    }

    private String getStackTrace(Throwable t) {
        if (t == null) return null;
        StringBuilder sb = new StringBuilder();
        sb.append(t.getClass().getName()).append(": ").append(t.getMessage()).append("\n");
        for (StackTraceElement e : t.getStackTrace()) {
            sb.append("\tat ").append(e.toString()).append("\n");
            if (sb.length() > 4000) break;
        }
        return sb.toString();
    }
    
    /**
     * 检查是否存在失败节点
     */
    private boolean hasFailedNodes(DagEngine engine) {
        try {
            for (Map.Entry<String, OperatorWrapper<?, ?>> entry : engine.getWrapperMap().entrySet()) {
                OperatorWrapper<?, ?> wrapper = entry.getValue();
                if (wrapper.getOperatorResult() != null) {
                    ResultState state = wrapper.getOperatorResult().getResultState();
                    if (state == ResultState.EXCEPTION || state == ResultState.TIMEOUT) {
                        return true;
                    }
                    // ActionResult 本身是失败的
                    Object result = wrapper.getOperatorResult().getResult();
                    if (result instanceof ActionResult && !((ActionResult) result).isSuccess()) {
                        return true;
                    }
                }
            }
        } catch (Exception e) {
            log.warn("检查失败节点时出错", e);
        }
        return false;
    }
    
    /**
     * 获取失败节点摘要信息
     */
    private String getFailedNodeSummary(DagEngine engine) {
        StringBuilder sb = new StringBuilder();
        try {
            for (Map.Entry<String, OperatorWrapper<?, ?>> entry : engine.getWrapperMap().entrySet()) {
                String nodeId = entry.getKey();
                OperatorWrapper<?, ?> wrapper = entry.getValue();
                if (wrapper.getOperatorResult() != null) {
                    ResultState state = wrapper.getOperatorResult().getResultState();
                    boolean failed = false;
                    String reason = "";
                    if (state == ResultState.EXCEPTION || state == ResultState.TIMEOUT) {
                        failed = true;
                        reason = state.name();
                        if (wrapper.getOperatorResult().getEx() != null) {
                            reason += ": " + wrapper.getOperatorResult().getEx().getMessage();
                        }
                    } else {
                        Object result = wrapper.getOperatorResult().getResult();
                        if (result instanceof ActionResult && !((ActionResult) result).isSuccess()) {
                            failed = true;
                            reason = ((ActionResult) result).getErrorMessage();
                        }
                    }
                    if (failed) {
                        if (sb.length() > 0) sb.append("; ");
                        sb.append(nodeId).append("(").append(reason).append(")");
                    }
                }
            }
        } catch (Exception e) {
            log.warn("获取失败节点摘要时出错", e);
        }
        return sb.length() > 0 ? sb.toString() : "未知失败";
    }
    
    /**
     * 从 DagEngine 的 wrapperMap 中收集每个节点的 ActionResult
     */
    private Map<String, ActionResult> collectNodeResults(DagEngine engine) {
        Map<String, ActionResult> nodeResults = new ConcurrentHashMap<>();
        try {
            for (Map.Entry<String, OperatorWrapper<?, ?>> entry : engine.getWrapperMap().entrySet()) {
                String nodeId = entry.getKey();
                OperatorWrapper<?, ?> wrapper = entry.getValue();
                if (wrapper.getOperatorResult() != null) {
                    Object result = wrapper.getOperatorResult().getResult();
                    if (result instanceof ActionResult) {
                        nodeResults.put(nodeId, (ActionResult) result);
                    }
                }
            }
        } catch (Exception e) {
            log.warn("收集节点执行结果失败", e);
        }
        return nodeResults;
    }

    /**
     * 上报数据血缘关系
     */
    private void reportDataLineage(String executionId, DagDefinition definition, Map<String, ActionResult> nodeResults) {
        try {
            log.info("开始上报数据血缘: executionId={}", executionId);
            
            // 遍历DAG节点，寻找数据流转关系（如Source -> Sink等）
            for (DagDefinition.NodeDefinition node : definition.getNodes()) {
                // 检查是否是数据传输相关的Action
                String actionClass = node.getType();
                if (actionClass != null && (actionClass.contains("Submit") || actionClass.contains("Source") || actionClass.contains("Sink"))) {
                    // 解析Action参数，提取Source和Sink信息（优先使用节点执行结果）
                    ActionResult nodeResult = nodeResults.get(node.getId());
                    extractAndSaveLineage(executionId, node, nodeResult);
                }
            }
            
            log.info("数据血缘上报完成: executionId={}", executionId);
        } catch (Exception e) {
            log.error("上报数据血缘失败: executionId={}", executionId, e);
        }
    }
    
    /**
     * 从节点参数（及执行结果 extraInfo）中提取并保存血缘信息
     */
    private void extractAndSaveLineage(String executionId, DagDefinition.NodeDefinition node, ActionResult nodeResult) {
        try {
            // 根据Action参数解析数据源和目标信息
            Map<String, Object> params = node.getConfig();
            
            DataLineage lineage = new DataLineage();
            lineage.setDagExecutionId(executionId);
            lineage.setNodeId(node.getId());
            lineage.setNodeName(node.getName());
            
            // 根据不同Action类型提取血缘信息
            String actionClass = node.getType();
            if (actionClass != null) {
                if (actionClass.contains("SeaTunnelSubmit")) {
                    extractSeaTunnelLineage(params, lineage);
                } else if (actionClass.contains("Source")) {
                    extractSourceLineage(params, lineage, nodeResult);
                } else if (actionClass.contains("Sink")) {
                    extractSinkLineage(params, lineage, nodeResult);
                }
            }
            
            // 保存血缘记录
            if (lineage.getSourceType() != null || lineage.getTargetType() != null) {
                dataLineageService.save(lineage);
                log.debug("保存血缘记录: {} -> {}", lineage.getSourceTable(), lineage.getTargetTable());
            }
        } catch (Exception e) {
            log.error("提取并保存血缘信息失败: nodeId={}", node.getId(), e);
        }
    }
    
    /**
     * 从SeaTunnel参数中提取血缘信息
     */
    private void extractSeaTunnelLineage(Map<String, Object> params, DataLineage lineage) {
        try {
            // 提取source配置
            Object sourceConfigParam = params.get("sourceConfig");
            if (sourceConfigParam != null) {
                String sourceConfigStr = sourceConfigParam.toString();
                // 解析JSON字符串为Map
                Map<String, Object> sourceConfigMap = JSONUtil.toBean(sourceConfigStr, Map.class);
                // 如果sourceConfigMap是单个配置，直接处理
                if (sourceConfigMap.containsKey("plugin_name")) {
                    lineage.setSourceType((String) sourceConfigMap.get("plugin_name"));
                    lineage.setSourceDatabase((String) sourceConfigMap.get("database"));
                    lineage.setSourceTable((String) sourceConfigMap.get("table"));
                } else {
                    // 如果是数组格式，转换为列表处理
                    List sourceConfigs = JSONUtil.toList(sourceConfigStr, Object.class);
                    for (Object sourceConfigItem : sourceConfigs) {
                        if (sourceConfigItem instanceof Map) {
                            @SuppressWarnings("unchecked")
                            Map<String, Object> sourceConfig = (Map<String, Object>) sourceConfigItem;
                            lineage.setSourceType((String) sourceConfig.get("plugin_name"));
                            lineage.setSourceDatabase((String) sourceConfig.get("database"));
                            lineage.setSourceTable((String) sourceConfig.get("table"));
                            break; // 只处理第一个source
                        }
                    }
                }
            }
            
            // 提取sink配置
            Object sinkConfigParam = params.get("sinkConfig");
            if (sinkConfigParam != null) {
                String sinkConfigStr = sinkConfigParam.toString();
                // 解析JSON字符串为Map
                Map<String, Object> sinkConfigMap = JSONUtil.toBean(sinkConfigStr, Map.class);
                // 如果sinkConfigMap是单个配置，直接处理
                if (sinkConfigMap.containsKey("plugin_name")) {
                    lineage.setTargetType((String) sinkConfigMap.get("plugin_name"));
                    lineage.setTargetDatabase((String) sinkConfigMap.get("database"));
                    lineage.setTargetTable((String) sinkConfigMap.get("table"));
                } else {
                    // 如果是数组格式，转换为列表处理
                    List sinkConfigs = JSONUtil.toList(sinkConfigStr, Object.class);
                    for (Object sinkConfigItem : sinkConfigs) {
                        if (sinkConfigItem instanceof Map) {
                            @SuppressWarnings("unchecked")
                            Map<String, Object> sinkConfig = (Map<String, Object>) sinkConfigItem;
                            lineage.setTargetType((String) sinkConfig.get("plugin_name"));
                            lineage.setTargetDatabase((String) sinkConfig.get("database"));
                            lineage.setTargetTable((String) sinkConfig.get("table"));
                            break; // 只处理第一个sink
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.warn("解析SeaTunnel血缘信息失败", e);
        }
    }
    
    /**
     * 从Source参数中提取血缘信息
     * <p>优先级：ActionResult.extraInfo > params.plugin_name > params.config.plugin_name</p>
     * <p>各 Source Action 在 execute() 末尾通过 addExtraInfo("plugin",xxx) 标记插件类型，
     * extraInfo 中 "table"/"database" 字段取自 params（Param 类里有 connectorId+table）</p>
     */
    private void extractSourceLineage(Map<String, Object> params, DataLineage lineage, ActionResult nodeResult) {
        try {
            // 优先从 ActionResult.extraInfo 中获取（所有 Source Action 已统一写入）
            if (nodeResult != null && nodeResult.getExtraInfo() != null) {
                Map<String, Object> extra = nodeResult.getExtraInfo();
                String plugin = (String) extra.get("plugin");
                if (plugin != null) {
                    lineage.setSourceType(plugin);
                    if (extra.containsKey("database")) {
                        lineage.setSourceDatabase((String) extra.get("database"));
                    }
                    // 统一从 extraInfo.table 取表名
                    if (extra.containsKey("table")) {
                        Object tableVal = extra.get("table");
                        if (tableVal != null) {
                            lineage.setSourceTable(tableVal.toString());
                        }
                    }
                    return;
                }
            }
            // Fallback：从 params 直接找 plugin_name（SeaTunnel Submit 场景）
            if (params.containsKey("plugin_name")) {
                lineage.setSourceType((String) params.get("plugin_name"));
                lineage.setSourceDatabase((String) params.get("database"));
                // 兼容多种字段名
                lineage.setSourceTable(resolveTableName(params));
            } else {
                // 尝试从 config 嵌套结构中获取
                Object configObj = params.get("config");
                if (configObj != null) {
                    Map<String, Object> config = JSONUtil.toBean(configObj.toString(), Map.class);
                    lineage.setSourceType((String) config.get("plugin_name"));
                    lineage.setSourceDatabase((String) config.get("database"));
                    lineage.setSourceTable(resolveTableName(config));
                }
            }
        } catch (Exception e) {
            log.warn("解析Source血缘信息失败", e);
        }
    }
    
    /**
     * 从Sink参数中提取血缘信息
     * <p>优先级：ActionResult.extraInfo > params.plugin_name > params.config.plugin_name</p>
     */
    private void extractSinkLineage(Map<String, Object> params, DataLineage lineage, ActionResult nodeResult) {
        try {
            // 优先从 ActionResult.extraInfo 中获取（所有 Sink Action 已统一写入）
            if (nodeResult != null && nodeResult.getExtraInfo() != null) {
                Map<String, Object> extra = nodeResult.getExtraInfo();
                String plugin = (String) extra.get("plugin");
                if (plugin != null) {
                    lineage.setTargetType(plugin);
                    if (extra.containsKey("database")) {
                        lineage.setTargetDatabase((String) extra.get("database"));
                    }
                    // 统一从 extraInfo.table 取表名
                    if (extra.containsKey("table")) {
                        Object tableVal = extra.get("table");
                        if (tableVal != null) {
                            lineage.setTargetTable(tableVal.toString());
                        }
                    }
                    // Column 级血缘：从 extraInfo.fieldMapping 取字段映射（JSON 字符串）
                    if (extra.containsKey("fieldMapping") && extra.get("fieldMapping") != null) {
                        lineage.setFieldMapping(extra.get("fieldMapping").toString());
                    }
                    return;
                }
            }
            // Fallback：从 params 直接找 plugin_name
            if (params.containsKey("plugin_name")) {
                lineage.setTargetType((String) params.get("plugin_name"));
                lineage.setTargetDatabase((String) params.get("database"));
                lineage.setTargetTable(resolveTableName(params));
            } else {
                Object configObj = params.get("config");
                if (configObj != null) {
                    Map<String, Object> config = JSONUtil.toBean(configObj.toString(), Map.class);
                    lineage.setTargetType((String) config.get("plugin_name"));
                    lineage.setTargetDatabase((String) config.get("database"));
                    lineage.setTargetTable(resolveTableName(config));
                }
            }
        } catch (Exception e) {
            log.warn("解析Sink血缘信息失败", e);
        }
    }

    /**
     * 从 params/config Map 中兼容多种字段名解析表名
     * 按优先级: table > tableList > topics > collection > index > stable > collectionName
     */
    private String resolveTableName(Map<String, Object> map) {
        for (String key : new String[]{"table", "tableList", "table_list", "topics", "collection", "index", "stable", "collectionName"}) {
            if (map.containsKey(key) && map.get(key) != null) {
                return map.get(key).toString();
            }
        }
        return null;
    }
}