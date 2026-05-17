package com.bigprime.datasync.backend.service.flow;

import com.bigprime.datasync.core.model.MyPageResult;
import com.bigprime.datasync.backend.config.DagExecutorConfig;
import com.bigprime.datasync.backend.handler.flow.FlowHandler;
import com.bigprime.datasync.backend.handler.model.flow.DataSyncFlow;
import com.bigprime.datasync.dag.core.DagEngine;
import com.bigprime.cluster.dto.WorkerNodeDTO;
import com.bigprime.datasync.backend.service.worker.WorkerSelector;
import com.bigprime.datasync.dag.core.action.ActionExecutor;
import com.bigprime.datasync.dag.core.action.HttpActionExecutor;
import com.bigprime.datasync.dag.core.action.MqActionExecutor;
import com.bigprime.datasync.dag.core.builder.ActionRegistry;
import com.bigprime.datasync.dag.core.builder.DagBuilder;
import com.bigprime.datasync.dag.core.builder.DagDefinition;
import com.bigprime.connector.manager.ConnectorManager;
import com.bigprime.datasync.dag.core.monitor.ExternalJobMonitorService;
import com.bigprime.datasync.dag.core.transform.PipelineTransformer;
import com.bigprime.datasync.dag.core.wrapper.OperatorWrapper;
import com.bigprime.datasync.dag.service.DagExecutionService;
import com.bigprime.datasync.dag.service.DagExecutionWebSocketService;
import com.bigprime.datasync.dag.core.persistence.DagEngineWithWebSocket;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * 流程编排Service
 *
 * @author bigprime
 * @version 1.0
 */
@Slf4j
@Service
public class FlowService {

    private final FlowHandler flowHandler;
    private final DagExecutionService dagExecutionService;
    private final DagExecutionWebSocketService webSocketService;
    private final ExternalJobMonitorService monitorService;
    private final ConnectorManager connectorManager;
    private final WorkerSelector workerSelector;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final ExecutorService dagExecutor = Executors.newFixedThreadPool(10);
    
    @Autowired
    private DagExecutorConfig executorConfig;
    
    @Autowired(required = false)
    private ConnectionFactory connectionFactory;

    public FlowService(FlowHandler flowHandler, 
                      DagExecutionService dagExecutionService, 
                      DagExecutionWebSocketService webSocketService,
                      ExternalJobMonitorService monitorService,
                      ConnectorManager connectorManager,
                      WorkerSelector workerSelector) {
        this.flowHandler = flowHandler;
        this.dagExecutionService = dagExecutionService;
        this.webSocketService = webSocketService;
        this.monitorService = monitorService;
        this.connectorManager = connectorManager;
        this.workerSelector = workerSelector;
    }

    /**
     * 创建流程
     */
    public DataSyncFlow createFlow(DataSyncFlow flow) {
        flowHandler.insert(flow);
        return flow;
    }

    /**
     * 更新流程
     */
    public DataSyncFlow updateFlow(DataSyncFlow flow) {
        flowHandler.update(flow);
        return flow;
    }

    /**
     * 删除流程
     */
    public void deleteFlow(String id) {
        flowHandler.deleteById(id);
    }

    /**
     * 根据ID获取流程
     */
    public DataSyncFlow getFlowById(String id) {
        return flowHandler.getById(id);
    }

    /**
     * 分页查询流程列表
     */
    public MyPageResult<DataSyncFlow> getFlowPage(String search, String taskSource, Integer page, Integer pageSize) {
        return flowHandler.getPage(search, taskSource, page, pageSize);
    }

    /** @deprecated 使用 {@link #getFlowPage(String, String, Integer, Integer)} */
    @Deprecated
    public MyPageResult<DataSyncFlow> getFlowPage(String search, Integer page, Integer pageSize) {
        return flowHandler.getPage(search, null, page, pageSize);
    }

    /**
     * 运行流程
     */
    public void runFlow(String id) {
        DataSyncFlow flow = flowHandler.getById(id);
        if (flow == null) {
            throw new RuntimeException("流程不存在: " + id);
        }
        
        try {
            // 1. 解析flowData JSON（前端Tinyflow格式）
            Map<String, Object> flowDataMap = objectMapper.readValue(flow.getFlowData(), new TypeReference<Map<String, Object>>() {});
            
            // 2. 转换前端格式为后端DagDefinition格式
            DagDefinition flowDefinition = convertTinyflowToDagDefinition(flowDataMap);
            
            // 3. Pipeline转换：识别并收拢Pipeline节点
            PipelineTransformer.TransformResult transformResult = PipelineTransformer.transform(flowDefinition);
            
            if (!transformResult.isSuccess()) {
                throw new RuntimeException("Pipeline转换失败: " + transformResult.getErrorMessage());
            }
            
            DagDefinition transformedDag = transformResult.getTransformedDag();
            DagDefinition originalDag = transformResult.getOriginalDag();
            String collapsedMappingsJson = transformResult.getCollapsedMappingsJson();
            
            // 4. 构建DAG引擎（根据流程配置选择执行模式）
            ActionRegistry actionRegistry = ActionRegistry.getInstance();
            String executionMode = flow.getExecutionMode() != null ? flow.getExecutionMode() : "http";
            DagBuilder dagBuilder = createDagBuilder(actionRegistry, executionMode);
            
            // 使用支持WebSocket的DAG引擎
            DagEngineWithWebSocket engine = new DagEngineWithWebSocket(dagExecutor, dagExecutionService, webSocketService, monitorService, connectorManager);
            
            // 5. 创建执行记录（包含收拢映射）- 先创建执行记录获取executionId
            // 构建包含原始节点和执行节点的 dagConfig
            Map<String, Object> dagConfigMap = new HashMap<>();
            dagConfigMap.put("originalDag", originalDag);  // 原始 6 个节点（用于前端显示）
            dagConfigMap.put("executionDag", transformedDag);  // 收拢后的节点（用于后台执行）
            
            // 为了保持兼容性，也放入 nodes 和 topology 字段（使用原始节点）
            dagConfigMap.put("nodes", originalDag.getNodes());
            
            // 将 edges 转换为 topology 格式
            Map<String, List<String>> topology = new HashMap<>();
            if (originalDag.getEdges() != null) {
                for (DagDefinition.EdgeDefinition edge : originalDag.getEdges()) {
                    // 跳过 null 的 from 或 to
                    if (edge == null || edge.getTo() == null || edge.getFrom() == null) {
                        log.warn("发现无效的 edge，跳过: edge={}", edge);
                        continue;
                    }
                    topology.computeIfAbsent(edge.getTo(), k -> new ArrayList<>()).add(edge.getFrom());
                }
            }
            dagConfigMap.put("topology", topology);
            
            String dagConfigJson = objectMapper.writeValueAsString(dagConfigMap);
            String executionId = dagExecutionService.createExecutionWithCollapsedNodes(
                    flow.getId().toString(),
                    flow.getName(),
                    flow.getDescription(),
                    transformedDag.getNodes().size(),
                    dagConfigJson,
                    collapsedMappingsJson
            );
            
            // 初始化引擎持久化 - 使用已创建的executionId
            engine.initWithExistingExecutionId(executionId, flow.getId().toString(), flow.getName(), flow.getDescription());
            
            // 构建DAG定义到当前引擎中
            ActionExecutor actionExecutor = dagBuilder.getActionExecutor();
            engine.buildFromDefinition(transformedDag, actionRegistry, actionExecutor);
            
            // 6. 推送DAG开始事件 - 不需要重复推送，initWithExistingExecutionId中已经推送了
            
            // 7. 异步提交DAG执行（超时时间设为1小时，SeaTunnel等数据同步任务耗时较长）
            engine.runWithCallbackAndWebSocket(3600000, () -> {
                log.info("流程执行完成: flow={}, executionId={}", flow.getId(), executionId);
                
                flowHandler.updateStatus(id, "STOPPED");
            });
            
            // 9. 更新Flow状态为运行中
            flowHandler.updateStatus(id, "RUNNING");
            
            log.info("流程已启动: flow={}, executionId={}", flow.getId(), executionId);
        } catch (Exception e) {
            log.error("启动流程失败: flowId={}", id, e);
            
            // 推送DAG失败事件
            try {
                String executionId = dagExecutionService.createExecutionWithCollapsedNodes(
                        flow.getId().toString(),
                        flow.getName(),
                        flow.getDescription(),
                        0,
                        "",
                        ""
                );
                webSocketService.pushDagCompleted(executionId, flow.getId().toString(), false);
            } catch (Exception ex) {
                log.error("推送DAG失败事件失败", ex);
            }
            
            flowHandler.updateStatus(id, "FAILED");
            throw new RuntimeException("启动流程失败: " + e.getMessage(), e);
        }
    }

    /**
     * 停止流程
     */
    public void stopFlow(String id) {
        DataSyncFlow flow = flowHandler.getById(id);
        if (flow == null) {
            throw new RuntimeException("流程不存在: " + id);
        }
        
        // TODO: 实现流程停止逻辑
        // 1. 查找正在运行的作业
        // 2. 停止作业执行
        
        // 更新状态为已停止
        flowHandler.updateStatus(id, "STOPPED");
        
        log.info("流程已停止: {} - {}", flow.getId(), flow.getName());
    }

    /**
     * 将Tinyflow格式转换为DagDefinition格式
     * Tinyflow格式：
     * - 节点：{id, type: 'customNode', position: {x, y}, data: {originalType, trdCategory, ...config}}
     * - 边：{source, target}
     * DagDefinition格式：
     * - 节点：{id, type: ActionClass, name, trdCategory, config}
     * - 边：{from, to}
     */
    private DagDefinition convertTinyflowToDagDefinition(Map<String, Object> flowDataMap) {
        DagDefinition dagDefinition = new DagDefinition();
        
        // 转换节点
        List<Map<String, Object>> tinyflowNodes = (List<Map<String, Object>>) flowDataMap.get("nodes");
        if (tinyflowNodes != null) {
            List<DagDefinition.NodeDefinition> dagNodes = new ArrayList<>();
            
            for (Map<String, Object> tinyflowNode : tinyflowNodes) {
                String nodeId = (String) tinyflowNode.get("id");
                Map<String, Object> nodeData = (Map<String, Object>) tinyflowNode.get("data");
                
                if (nodeData == null) {
                    log.warn("节点[{}]缺少data字段，跳过", nodeId);
                    continue;
                }
                
                // 提取字段
                String originalType = (String) nodeData.get("originalType");
                String title = (String) nodeData.get("title");
                String trdCategory = (String) nodeData.get("trdCategory");
                
                if (originalType == null || originalType.isEmpty()) {
                    log.warn("节点[{}]缺少originalType字段，跳过", nodeId);
                    continue;
                }
                
                // 提取配置字段（排除内置字段）
                Map<String, Object> config = new HashMap<>();
                for (Map.Entry<String, Object> entry : nodeData.entrySet()) {
                    String key = entry.getKey();
                    // 排除Tinyflow的内置字段
                    if (!key.equals("title") && !key.equals("originalType") && 
                        !key.equals("trdCategory") && !key.equals("icon") && 
                        !key.equals("expand") && !key.equals("forms") && 
                        !key.equals("selected") && !key.equals("description")) {
                        config.put(key, entry.getValue());
                    }
                }
                
                // 构建DagNode
                DagDefinition.NodeDefinition dagNode = new DagDefinition.NodeDefinition();
                dagNode.setId(nodeId);
                dagNode.setType(originalType);
                dagNode.setName(title != null ? title : nodeId);
                dagNode.setTrdCategory(trdCategory);
                dagNode.setConfig(config);
                
                dagNodes.add(dagNode);
            }
            
            dagDefinition.setNodes(dagNodes);
            log.info("转换了 {} 个节点", dagNodes.size());
        }
        
        // 转换边
        List<Map<String, Object>> tinyflowEdges = (List<Map<String, Object>>) flowDataMap.get("edges");
        if (tinyflowEdges != null) {
            List<DagDefinition.EdgeDefinition> dagEdges = new ArrayList<>();
            
            for (Map<String, Object> tinyflowEdge : tinyflowEdges) {
                String source = (String) tinyflowEdge.get("source");
                String target = (String) tinyflowEdge.get("target");
                String edgeId = (String) tinyflowEdge.get("id");
                
                if (source == null || target == null) {
                    log.warn("边[{}]缺少source或target字段，跳过", edgeId);
                    continue;
                }
                
                DagDefinition.EdgeDefinition dagEdge = new DagDefinition.EdgeDefinition();
                dagEdge.setFrom(source);
                dagEdge.setTo(target);
                
                dagEdges.add(dagEdge);
            }
            
            dagDefinition.setEdges(dagEdges);
            log.info("转换了 {} 条边", dagEdges.size());
        }
        
        return dagDefinition;
    }
    
    /**
     * 根据配置创建DagBuilder
     */
    private DagBuilder createDagBuilder(ActionRegistry actionRegistry, String executionMode) {
        log.info("使用DAG执行模式: {}", executionMode);
        
        if ("mq".equalsIgnoreCase(executionMode)) {
            // MQ异步模式
            if (connectionFactory == null) {
                log.error("MQ模式需要RabbitMQ配置，但ConnectionFactory为空，降级到HTTP模式");
                return createHttpDagBuilder(actionRegistry);
            }
            
            DagExecutorConfig.MqConfig mqConfig = executorConfig.getMq();
            com.bigprime.datasync.dag.core.action.MqActionExecutor.MqConfig execMqConfig = 
                new com.bigprime.datasync.dag.core.action.MqActionExecutor.MqConfig(
                    mqConfig.getExchange(),
                    mqConfig.getRequestRoutingKey(),
                    mqConfig.getResponseQueue()
                );
            
            MqActionExecutor mqExecutor = new MqActionExecutor(execMqConfig, connectionFactory);
            log.info("MQ异步模式: exchange={}, requestQueue={}, responseQueue={}",
                mqConfig.getExchange(), mqConfig.getRequestQueue(), mqConfig.getResponseQueue());
            
            return new DagBuilder(actionRegistry, mqExecutor);
        } else {
            // HTTP同步模式(默认)
            return createHttpDagBuilder(actionRegistry);
        }
    }
    
    /**
     * 创建HTTP模式的DagBuilder
     * 使用集群管理中心动态选择Worker节点
     */
    private DagBuilder createHttpDagBuilder(ActionRegistry actionRegistry) {
        // 从集群管理中心动态选择Worker节点
        WorkerNodeDTO worker = workerSelector.selectWorker();
        if (worker == null) {
            throw new RuntimeException("没有可用的Worker节点，请检查集群状态");
        }
        
        String workerUrl = workerSelector.buildWorkerUrl(worker);
        HttpActionExecutor httpExecutor = new HttpActionExecutor(workerUrl);
        log.info("HTTP同步模式 - 动态选择Worker: id={}, url={}, activeTasks={}/{}", 
                worker.getId(), workerUrl, worker.getActiveTasks(), worker.getMaxConcurrentTasks());
        return new DagBuilder(actionRegistry, httpExecutor);
    }
}
