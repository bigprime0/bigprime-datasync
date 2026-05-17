package com.bigprime.datasync.backend.service;

import com.bigprime.action.repository.ActionParamRepository;
import com.bigprime.action.repository.ActionRepository;
import com.bigprime.action.entities.ActionEntity;
import com.bigprime.action.entities.ActionParamEntity;
import com.bigprime.connector.manager.ConnectorManager;
import com.bigprime.connector.core.IRdbConnector;
import com.bigprime.connector.entities.ConnectorMetaEntity;
import com.bigprime.connector.service.ConnectorService;
import com.bigprime.datasync.backend.handler.model.flow.DataSyncFlow;
import com.bigprime.datasync.backend.service.flow.FlowService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * ETL Agent 工具集（MCP 工具服务）
 *
 * <p>通过 @Tool 注解将业务方法暴露为 MCP 工具，供 AI Agent 在对话中调用，
 * 辅助用户完成数据同步任务的查询、规划与创建。</p>
 *
 * <p>工具列表：
 * <ul>
 *   <li>etl_list_connectors        — 列出所有已配置的数据源连接器</li>
 *   <li>etl_list_actions           — 列出所有已注册的 Action（ETL 任务执行器）</li>
 *   <li>etl_get_action_params      — 获取指定 Action 的详细参数描述（含字段含义、类型、默认值）</li>
 *   <li>etl_get_connector_tables   — 查询指定连接器下的数据库表列表</li>
 * </ul>
 * </p>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EtlAgentService {

    private final ConnectorService connectorService;
    private final ConnectorManager connectorManager;
    private final ActionRepository actionRepository;
    private final ActionParamRepository actionParamRepository;
    private final FlowService flowService;
    private final ObjectMapper objectMapper;

    // ==================== 连接器相关 ====================

    /**
     * 列出所有已配置的数据源连接器（MySQL、ClickHouse、Kafka 等）。
     * 返回每个连接器的 ID、名称、分类、产品、状态信息，供后续选择 Source/Sink。
     */
    @Tool(description = "列出系统中所有已配置的数据源连接器（MySQL、ClickHouse、Hive、Kafka、StarRocks 等）。" +
            "返回字段：id（连接器ID）、name（名称）、category（分类）、product（数据库产品）、status（连接状态）。" +
            "《重要》创建 ETL 任务时，Source 节点和 Sink 节点的 connectorId 都必须来自此工具返回的 id 字段，" +
            "禁止自行填写 host/port 等原始连接参数，必须先调用此工具获取系统已配置的连接器 ID。" +
            "《字段配对规则》：nodesJson 里的连接器类型字段必须同时传两个子字段：" +
            "connectorId（实际 UUID值，来自此工具返回的 id）和 connectorIdLabel（显示名称，使用返回的 name 字段）。" +
            "示例：{\"originalType\":\"...\",\"connectorId\":\"<工具返回的id>\",\"connectorIdLabel\":\"<工具返回的name>\"}。")
    public String etl_list_connectors() {
        try {
            List<ConnectorMetaEntity> list = connectorService.listConnectors();
            if (list == null || list.isEmpty()) {
                return "当前系统没有已配置的连接器，请先在「连接中心」添加数据源连接器。";
            }
            StringBuilder sb = new StringBuilder();
            sb.append("## 已配置的数据源连接器列表（共 ").append(list.size()).append(" 个）\n\n");
            sb.append("| ID | 名称 | 分类 | 产品 | 状态 |\n");
            sb.append("|---|---|---|---|---|\n");
            for (ConnectorMetaEntity c : list) {
                sb.append("| ").append(safe(c.getId()))
                  .append(" | ").append(safe(c.getName()))
                  .append(" | ").append(safe(c.getCategory()))
                  .append(" | ").append(safe(c.getProduct()))
                  .append(" | ").append(safe(c.getStatus()))
                  .append(" |\n");
            }
            sb.append("\n> 使用 etl_get_connector_tables 可查询指定连接器的表列表。");
            return sb.toString();
        } catch (Exception e) {
            log.error("ETL工具[etl_list_connectors]执行失败", e);
            return "获取连接器列表失败: " + e.getMessage();
        }
    }

    /**
     * 查询指定连接器下的数据库表列表。
     * 用于在规划 ETL 任务时确认 Source/Sink 表是否存在。
     */
    @Tool(description = "查询指定连接器下的数据库表列表（仅支持 RDBMS 类型连接器）。" +
            "参数 connectorId 为 etl_list_connectors 返回的 id 值。" +
            "返回表名列表，帮助确认 Source/Sink 的目标表是否存在。")
    public String etl_get_connector_tables(
            @ToolParam(description = "连接器ID，来自 etl_list_connectors 返回的 id 字段") String connectorId) {
        try {
            if (connectorId == null || connectorId.isBlank()) {
                return "错误：connectorId 不能为空，请先调用 etl_list_connectors 获取连接器列表。";
            }
            ConnectorMetaEntity connector = connectorService.getConnectorById(connectorId);
            if (connector == null) {
                return "未找到 ID 为 [" + connectorId + "] 的连接器，请检查 connectorId 是否正确。";
            }
            IRdbConnector rdbConnector = connectorManager.getConnector(connectorId, IRdbConnector.class);
            List<String> tables = rdbConnector.getTableNames().join();
            if (tables == null || tables.isEmpty()) {
                return "连接器 [" + connector.getName() + "] 下未查询到数据库表，可能该连接器类型不支持表元数据查询，或连接器未正常连接。";
            }
            StringBuilder sb = new StringBuilder();
            sb.append("## 连接器 [").append(connector.getName()).append("] 的表列表（共 ").append(tables.size()).append(" 张）\n\n");
            for (int i = 0; i < Math.min(tables.size(), 100); i++) {
                sb.append("- `").append(tables.get(i)).append("`\n");
            }
            if (tables.size() > 100) {
                sb.append("\n> 表数量较多，仅展示前 100 张，实际共 ").append(tables.size()).append(" 张。");
            }
            return sb.toString();
        } catch (Exception e) {
            log.error("ETL工具[etl_get_connector_tables]执行失败: connectorId={}", connectorId, e);
            return "查询表列表失败: " + e.getMessage();
        }
    }

    // ==================== Action 相关 ====================

    /**
     * 列出所有已注册的 Action（ETL 任务执行器）。
     * Action 是 ETL 任务的执行单元，如 SeaTunnelSubmitJob、FlinkSubmitJob 等。
     */
    @Tool(description = "列出系统中所有已注册的 Action（ETL 任务执行器）。" +
            "每个 Action 对应一种数据同步任务类型，如 SeaTunnel 全量/增量同步、Flink CDC 等。" +
            "返回字段：code（调用代码）、clazz（全类名，创建任务时 originalType 必须用此值）、name（名称）、description（描述）、分类。" +
            "在创建 ETL 任务前，先调用此工具了解可用的 Action 类型，再用 etl_get_action_params 获取参数详情。")
    public String etl_list_actions() {
        try {
            List<ActionEntity> list = actionRepository.getList();
            if (list == null || list.isEmpty()) {
                return "当前系统没有已注册的 Action，请先在「Action 管理」中注册 ETL 执行器。";
            }
            // 过滤启用状态
            List<ActionEntity> enabled = list.stream()
                    .filter(a -> a.getStatus() == null || a.getStatus() == 1)
                    .collect(Collectors.toList());

            StringBuilder sb = new StringBuilder();
            sb.append("## 已注册的 Action 列表（共 ").append(enabled.size()).append(" 个）\n\n");
            sb.append("| code | clazz（originalType）| name | 分类 | 描述 |\n");
            sb.append("|---|---|---|---|---|\n");
            for (ActionEntity a : enabled) {
                String category = buildCategory(a.getFstCategory(), a.getSndCategory());
                sb.append("| `").append(safe(a.getCode())).append("`")
                  .append(" | `").append(safe(a.getClazz())).append("`")
                  .append(" | ").append(safe(a.getName()))
                  .append(" | ").append(category)
                  .append(" | ").append(safe(a.getDescription()))
                  .append(" |\n");
            }
            sb.append("\n> 创建任务时，nodesJson 里每个节点的 originalType 必须使用上表中的 clazz 值（全类名）。");
            sb.append("\n> 使用 etl_get_action_params(actionCode) 获取指定 Action 的详细参数说明。");
            return sb.toString();
        } catch (Exception e) {
            log.error("ETL工具[etl_list_actions]执行失败", e);
            return "获取 Action 列表失败: " + e.getMessage();
        }
    }

    /**
     * 获取指定 Action 的详细参数描述（字段名、标题、类型、是否必填、可选值、默认值、说明）。
     * 这是 AI 理解 ETL 配置参数含义的核心工具。
     */
    @Tool(description = "获取指定 Action 的详细参数描述。" +
            "返回每个参数的：字段名（name）、显示标题（title）、值类型（valueType）、" +
            "是否必填（isRequired）、控件类型（componentType）、可选值（来自 componentConfig.dataSource）、" +
            "默认值（defaultValue）、参数说明（description）。" +
            "这是 AI 理解 ETL 配置参数含义的核心工具，在向用户推荐配置前必须调用。" +
            "actionCode 来自 etl_list_actions 返回的 code 字段。")
    public String etl_get_action_params(
            @ToolParam(description = "Action 编码，来自 etl_list_actions 返回的 code 字段，例如 'SeaTunnelSubmitJob'") String actionCode) {
        try {
            if (actionCode == null || actionCode.isBlank()) {
                return "错误：actionCode 不能为空，请先调用 etl_list_actions 获取 Action 列表。";
            }
            // 先找到 Action 的 paramClazz
            List<ActionEntity> all = actionRepository.getList();
            ActionEntity action = all.stream()
                    .filter(a -> actionCode.equalsIgnoreCase(a.getCode()))
                    .findFirst()
                    .orElse(null);
            if (action == null) {
                return "未找到 code 为 [" + actionCode + "] 的 Action，请先调用 etl_list_actions 确认正确的 code。";
            }
            String paramClazz = action.getParamClazz();
            if (paramClazz == null || paramClazz.isBlank()) {
                return "Action [" + actionCode + "] 未配置参数类，无法获取参数描述。";
            }

            List<ActionParamEntity> params = actionParamRepository.getActionParamsByClazz(paramClazz);
            if (params == null || params.isEmpty()) {
                return "Action [" + actionCode + "] 的参数列表为空（paramClazz=" + paramClazz + "），" +
                        "请先在「Action 管理」中刷新 Action 注册信息。";
            }

            // 按 position 排序
            params.sort((a, b) -> {
                int pa = a.getPosition() != null ? a.getPosition() : 999;
                int pb = b.getPosition() != null ? b.getPosition() : 999;
                return Integer.compare(pa, pb);
            });

            StringBuilder sb = new StringBuilder();
            sb.append("## Action [").append(action.getName()).append("] 参数说明\n\n");
            sb.append("**描述**：").append(safe(action.getDescription())).append("\n\n");
            sb.append("| 字段名 | 标题 | 类型 | 必填 | 可选值 | 默认值 | 说明 |\n");
            sb.append("|---|---|---|---|---|---|---|\n");

            for (ActionParamEntity p : params) {
                if (Boolean.TRUE.equals(p.getIsHidden())) continue;
                String dataSource = extractDataSource(p.getComponentConfig());
                sb.append("| `").append(safe(p.getName())).append("`")
                  .append(" | ").append(safe(p.getTitle()))
                  .append(" | ").append(safe(p.getValueType()))
                  .append(" | ").append(Boolean.TRUE.equals(p.getIsRequired()) ? "✅ 必填" : "否")
                  .append(" | ").append(safe(dataSource))
                  .append(" | ").append(safe(p.getDefaultValue()))
                  .append(" | ").append(safe(p.getDescription()))
                  .append(" |\n");
            }
            sb.append("\n> 共 ").append(params.size()).append(" 个参数（已隐藏 isHidden=true 的字段）");
            return sb.toString();
        } catch (Exception e) {
            log.error("ETL工具[etl_get_action_params]执行失败: actionCode={}", actionCode, e);
            return "获取 Action 参数失败: " + e.getMessage();
        }
    }

    // ==================== 任务创建 ====================

    /**
     * 根据用户描述的 Source/Transform/Sink/Submit 节点配置，创建 ETL 数据同步任务。
     * 工具会自动构建 TinyFlow 画布节点 JSON，写入数据库，任务默认为草稿状态。
     *
     * <p>nodesJson 格式示例（JSON 数组字符串）：
     * <pre>
     * [
     *   {"originalType": "com.bigprime.action.impl.seatunnel.source.SeaTunnelMySQLSourceAction",
     *    "connectorId": "xxx", "connectorIdLabel": "MySQL连接器名称", "query": "SELECT * FROM t"},
     *   {"originalType": "com.bigprime.action.impl.seatunnel.sink.SeaTunnelStarRocksSinkAction",
     *    "connectorId": "yyy", "connectorIdLabel": "StarRocks连接器名称", "table": "target_table"},
     *   {"originalType": "com.bigprime.action.impl.seatunnel.SeaTunnelSubmitJobAction",
     *    "connectorId": "zzz", "connectorIdLabel": "SeaTunnel连接器名称", "jobName": "job1", "engineType": "cluster"}
     * ]
     * </pre>
     * 每个节点必须包含 originalType（Action 全类名），其余参数按用户需求填写，未提到的参数可不传。
     * </p>
     */
    @Tool(description = "根据用户需求创建 ETL 数据同步任务，写入数据库，任务默认为草稿（DRAFT）状态，用户可在前端编辑后提交运行。" +
            "【调用前必读】：1) 必须先调用 etl_list_actions 获取真实的 clazz 字段；" +
            "2) 必须先调用 etl_list_connectors 获取连接器真实 ID。" +
            "【严禁自行编造】：originalType 必须是 etl_list_actions 返回的 clazz 字段真实全类名，" +
            "connectorId 必须是 etl_list_connectors 返回的 id（UUID格式），禁止自行编造任何字段。" +
            "参数说明：" +
            "- taskName：任务名称；" +
            "- taskDescription：任务描述（可选）；" +
            "- nodesJson：JSON 数组字符串，每个元素代表一个节点，必须包含 originalType（来自 etl_list_actions clazz 字段的 Action 全类名），" +
            "  其余字段为该 Action 的业务参数（connectorId、query、table 等，用户未提及的参数不传）。" +
            "节点顺序按 Source → Transform（可选）→ Sink → Submit 排列。" +
            "调用成功后返回任务 ID，用户可在「数据同步 > 流程管理」中查看和编辑。")
    public String etl_create_task(
            @ToolParam(description = "ETL 任务名称，例如 'MySQL同步StarRocks'")
            String taskName,
            @ToolParam(description = "ETL 任务描述（可选），例如 '每日全量同步 data_sync_action 表'")
            String taskDescription,
            @ToolParam(description = "节点配置 JSON 数组字符串，每个节点含 originalType + 业务参数")
            String nodesJson) {
        try {
            if (taskName == null || taskName.isBlank()) {
                return "错误：taskName 不能为空。";
            }
            if (nodesJson == null || nodesJson.isBlank()) {
                return "错误：nodesJson 不能为空，请提供节点配置。";
            }

            // 解析节点参数列表
            List<Map<String, Object>> nodeParamsList;
            try {
                nodeParamsList = objectMapper.readValue(nodesJson, new TypeReference<>() {});
            } catch (Exception e) {
                return "错误：nodesJson 格式不合法，请确保是合法的 JSON 数组。原因：" + e.getMessage();
            }
            if (nodeParamsList == null || nodeParamsList.isEmpty()) {
                return "错误：nodesJson 节点列表不能为空。";
            }

            // 加载所有 Action 定义（按 clazz 和 code 双索引，方便查找）
            List<ActionEntity> allActions = actionRepository.getList();
            Map<String, ActionEntity> actionByClazz = allActions.stream()
                    .filter(a -> a.getClazz() != null)
                    .collect(Collectors.toMap(ActionEntity::getClazz, a -> a, (a, b) -> a));
            Map<String, ActionEntity> actionByCode = allActions.stream()
                    .filter(a -> a.getCode() != null)
                    .collect(Collectors.toMap(ActionEntity::getCode, a -> a, (a, b) -> a));
            // 按 originalType 查找 Action（先精确匹配 clazz，再尝试 code）
            java.util.function.Function<String, ActionEntity> findAction = (originalType) -> {
                ActionEntity found = actionByClazz.get(originalType);
                if (found == null) {
                    // originalType 可能是 code 值，尝试按 code 查
                    found = actionByCode.get(originalType);
                }
                if (found == null) {
                    // 最后按 clazz 包含匹配（处理大小写差异）
                    String lowerType = originalType.toLowerCase();
                    found = allActions.stream()
                            .filter(a -> a.getClazz() != null && a.getClazz().equalsIgnoreCase(originalType))
                            .findFirst().orElse(null);
                }
                return found;
            };

            // 构建 TinyFlow nodes 数组
            List<Map<String, Object>> tinyNodes = new ArrayList<>();
            List<Map<String, Object>> tinyEdges = new ArrayList<>();
            List<String> nodeIds = new ArrayList<>();

            double xOffset = 315.0;
            double yBase = 100.0;

            for (int i = 0; i < nodeParamsList.size(); i++) {
                Map<String, Object> params = nodeParamsList.get(i);
                String originalType = (String) params.get("originalType");
                if (originalType == null || originalType.isBlank()) {
                    return "错误：第 " + (i + 1) + " 个节点缺少 originalType 字段。";
                }

                // 查找 Action 元数据
                ActionEntity action = findAction.apply(originalType);
                // 如果找到了 Action，用数据库存的 clazz 覆盖 originalType（保证格式正确）
                if (action != null && action.getClazz() != null) {
                    originalType = action.getClazz();
                }
                String title = action != null ? action.getName() : originalType;
                String description = action != null ? action.getDescription() : "";
                String trdCategory = action != null ? action.getTrdCategory() : "";

                // 构建 forms（从 ActionParamEntity 动态生成）
                List<Map<String, Object>> forms = buildForms(action);

                // 生成节点 ID
                String nodeId = "node_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
                nodeIds.add(nodeId);

                // 构建 data 对象：先放元数据字段，再平铺用户参数
                Map<String, Object> data = new LinkedHashMap<>();
                data.put("title", title);
                data.put("description", description);
                data.put("originalType", originalType);
                data.put("icon", DEFAULT_ICON);
                data.put("forms", forms);
                data.put("expand", true);
                data.put("trdCategory", trdCategory != null ? trdCategory : "");
                // 平铺用户业务参数（排除 originalType，已放入 data）
                for (Map.Entry<String, Object> entry : params.entrySet()) {
                    if (!"originalType".equals(entry.getKey())) {
                        data.put(entry.getKey(), entry.getValue());
                    }
                }

                // 自动补充 connectorIdLabel（chosen 控件显示名）
                // 规则：找所有 chosen 类型字段（如 connectorId、engineConnectorId 等），
                // 如果 params 里有对应的 value（UUID），查 connector 名称补 Label
                if (action != null && action.getParamClazz() != null && !action.getParamClazz().isBlank()) {
                    try {
                        List<ActionParamEntity> actionParams = actionParamRepository.getActionParamsByClazz(action.getParamClazz());
                        if (actionParams != null) {
                            for (ActionParamEntity p : actionParams) {
                                if (!"DATASOURCE".equalsIgnoreCase(p.getComponentType())) continue;
                                String fieldName = p.getName();           // e.g. "connectorId"
                                String labelKey  = fieldName + "Label";  // e.g. "connectorIdLabel"
                                // 只在 params 里有该字段值、且 data 里还没有 Label 时补充
                                if (params.containsKey(fieldName) && !data.containsKey(labelKey)) {
                                    Object idVal = params.get(fieldName);
                                    if (idVal instanceof String connId && !connId.isBlank()) {
                                        try {
                                            ConnectorMetaEntity conn = connectorService.getConnectorById(connId);
                                            if (conn != null && conn.getName() != null) {
                                                data.put(labelKey, conn.getName());
                                                log.debug("[etl_create_task] 自动补充 {}={}", labelKey, conn.getName());
                                            }
                                        } catch (Exception ex) {
                                            log.warn("[etl_create_task] 查询连接器名称失败: {}={}", fieldName, idVal, ex);
                                        }
                                    }
                                }
                            }
                        }
                    } catch (Exception ex) {
                        log.warn("[etl_create_task] 补充 connectorLabel 失败，已跳过", ex);
                    }
                }

                // 构建节点
                Map<String, Object> node = new LinkedHashMap<>();
                node.put("id", nodeId);
                Map<String, Object> position = new LinkedHashMap<>();
                position.put("x", xOffset + i * 480.0);
                position.put("y", yBase);
                node.put("position", position);
                node.put("data", data);
                node.put("type", "customNode");
                node.put("selected", false);
                Map<String, Object> measured = new LinkedHashMap<>();
                measured.put("width", 380);
                measured.put("height", 500);
                node.put("measured", measured);
                node.put("dragging", false);

                tinyNodes.add(node);
            }

            // 构建 edges（按节点顺序依次连接）
            for (int i = 0; i < nodeIds.size() - 1; i++) {
                Map<String, Object> edge = new LinkedHashMap<>();
                edge.put("source", nodeIds.get(i));
                edge.put("target", nodeIds.get(i + 1));
                edge.put("id", UUID.randomUUID().toString().replace("-", "").substring(0, 16));
                tinyEdges.add(edge);
            }

            // 构建完整 flowData
            Map<String, Object> flowData = new LinkedHashMap<>();
            flowData.put("nodes", tinyNodes);
            flowData.put("edges", tinyEdges);
            Map<String, Object> viewport = new LinkedHashMap<>();
            viewport.put("x", 0);
            viewport.put("y", 0);
            viewport.put("zoom", 1);
            flowData.put("viewport", viewport);

            String flowDataJson = objectMapper.writeValueAsString(flowData);

            // 创建 DataSyncFlow 并写入数据库
            DataSyncFlow flow = new DataSyncFlow();
            flow.setName(taskName);
            flow.setDescription(taskDescription != null ? taskDescription : "");
            flow.setFlowData(flowDataJson);
            flow.setStatus("DRAFT");
            flow.setTaskSource("ETL");

            DataSyncFlow created = flowService.createFlow(flow);

            return "ETL 任务创建成功！" +
                    "\n- 任务ID：" + created.getId() +
                    "\n- 任务名称：" + created.getName() +
                    "\n- 节点数量：" + tinyNodes.size() +
                    "\n- 状态：草稿（DRAFT）" +
                    "\n\n请前往「数据同步 > 流程管理」查看和编辑该任务，确认参数无误后可手动触发运行。";

        } catch (Exception e) {
            log.error("ETL工具[etl_create_task]执行失败: taskName={}", taskName, e);
            return "创建 ETL 任务失败：" + e.getMessage();
        }
    }

    /** 默认节点图标（通用圆形占位符 SVG） */
    private static final String DEFAULT_ICON = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"currentColor\"><path d=\"M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5528 2 12 2ZM12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20Z\"></path></svg>";

    /**
     * 根据 Action 元数据构建 TinyFlow 表单字段列表（forms），
     * 供前端渲染节点配置面板使用。
     */
    private List<Map<String, Object>> buildForms(ActionEntity action) {
        if (action == null || action.getParamClazz() == null) {
            return Collections.emptyList();
        }
        try {
            List<ActionParamEntity> params = actionParamRepository.getActionParamsByClazz(action.getParamClazz());
            if (params == null || params.isEmpty()) {
                return Collections.emptyList();
            }
            params.sort(Comparator.comparingInt(p -> p.getPosition() != null ? p.getPosition() : 999));

            List<Map<String, Object>> forms = new ArrayList<>();
            for (ActionParamEntity p : params) {
                if (Boolean.TRUE.equals(p.getIsHidden())) continue;
                Map<String, Object> field = new LinkedHashMap<>();
                field.put("label", p.getTitle() != null ? p.getTitle() : p.getName());
                field.put("name", p.getName());
                field.put("placeholder", "请输入" + (p.getTitle() != null ? p.getTitle() : p.getName()));
                field.put("required", Boolean.TRUE.equals(p.getIsRequired()));

                // 控件类型映射
                String ct = p.getComponentType();
                String formType = mapComponentType(ct);
                field.put("type", formType);

                // 默认值
                if (p.getDefaultValue() != null && !p.getDefaultValue().isBlank()) {
                    field.put("defaultValue", p.getDefaultValue());
                }

                // select / chosen 的可选项
                if ("select".equals(formType)) {
                    List<Map<String, Object>> options = extractOptions(p.getComponentConfig());
                    if (!options.isEmpty()) {
                        field.put("options", options);
                    } else if ("SWITCH".equalsIgnoreCase(ct) || "BOOLEAN".equalsIgnoreCase(ct)) {
                        // SWITCH 类型自动生成 true/false 选项
                        List<Map<String, Object>> boolOptions = new ArrayList<>();
                        Map<String, Object> trueOpt = new LinkedHashMap<>();
                        trueOpt.put("value", "true"); trueOpt.put("label", "开启");
                        Map<String, Object> falseOpt = new LinkedHashMap<>();
                        falseOpt.put("value", "false"); falseOpt.put("label", "关闭");
                        boolOptions.add(trueOpt); boolOptions.add(falseOpt);
                        field.put("options", boolOptions);
                    }
                }
                if ("chosen".equals(formType)) {
                    Map<String, Object> chosen = new LinkedHashMap<>();
                    chosen.put("labelDataKey", p.getName() + "Label");
                    chosen.put("valueDataKey", p.getName());
                    chosen.put("buttonText", "选择" + (p.getTitle() != null ? p.getTitle() : p.getName()) + "...");
                    field.put("chosen", chosen);
                }

                // input 类型附加 attrs（对齐前端：NUMBER用 number，TEXT用 text）
                if ("input".equals(formType)) {
                    Map<String, Object> attrs = new LinkedHashMap<>();
                    attrs.put("type", "NUMBER".equalsIgnoreCase(ct) ? "number" : "text");
                    field.put("attrs", attrs);
                }

                forms.add(field);
            }
            return forms;
        } catch (Exception e) {
            log.warn("构建 forms 失败: action={}", action.getCode(), e);
            return Collections.emptyList();
        }
    }

    /** 将 ActionParamEntity.componentType 映射到 TinyFlow form type（对齐前端 FlowEditor.vue 的 componentTypeMap） */
    private String mapComponentType(String componentType) {
        if (componentType == null) return "input";
        return switch (componentType.toUpperCase()) {
            case "DATASOURCE" -> "chosen";
            case "SELECT", "RADIO" -> "select";
            case "SWITCH" -> "select";
            case "TEXTAREA" -> "textarea";
            case "NUMBER" -> "input"; // attrs.type=number
            case "TEXT" -> "input";   // attrs.type=text
            default -> "input";
        };
    }

    /** 从 componentConfig JSON 中提取 options（对齐前端：dataSource 字符串按 | 或 , 分割） */
    private List<Map<String, Object>> extractOptions(String componentConfig) {
        if (componentConfig == null || componentConfig.isBlank()) return Collections.emptyList();
        try {
            Map<String, Object> cfg = objectMapper.readValue(componentConfig, new TypeReference<>() {});
            Object ds = cfg.get("dataSource");
            if (ds == null) return Collections.emptyList();

            // dataSource 可能是字符串（用 | 或 , 分割）
            if (ds instanceof String dsStr && !dsStr.isBlank()) {
                String separator = dsStr.contains("|") ? "\\|" : ",";
                List<Map<String, Object>> options = new ArrayList<>();
                for (String item : dsStr.split(separator)) {
                    String val = item.trim();
                    if (!val.isEmpty()) {
                        Map<String, Object> opt = new LinkedHashMap<>();
                        opt.put("value", val);
                        opt.put("label", val);
                        options.add(opt);
                    }
                }
                return options;
            }
            // dataSource 也可能是 JSON 数组
            if (ds instanceof List<?> list) {
                List<Map<String, Object>> options = new ArrayList<>();
                for (Object item : list) {
                    if (item instanceof Map<?, ?> map) {
                        Map<String, Object> opt = new LinkedHashMap<>();
                        Object val = map.get("value");
                        Object lbl = map.get("label");
                        if (val != null) opt.put("value", val.toString());
                        if (lbl != null) opt.put("label", lbl.toString());
                        if (!opt.isEmpty()) options.add(opt);
                    }
                }
                return options;
            }
            return Collections.emptyList();
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    // ==================== 辅助方法 ====================

    /** 从 componentConfig JSON 中提取 dataSource 字段 */
    private String extractDataSource(String componentConfig) {
        if (componentConfig == null || componentConfig.isBlank() || "{}".equals(componentConfig.trim())) {
            return "";
        }
        try {
            Map<String, Object> cfg = objectMapper.readValue(componentConfig, new TypeReference<>() {});
            Object ds = cfg.get("dataSource");
            return ds != null ? ds.toString() : "";
        } catch (Exception e) {
            return "";
        }
    }

    private String buildCategory(String fst, String snd) {
        if (fst == null && snd == null) return "";
        if (fst == null) return snd;
        if (snd == null) return fst;
        return fst + " / " + snd;
    }

    private String safe(String s) {
        return s == null ? "" : s;
    }
}
