package com.bigprime.datasync.backend.config;

import com.bigprime.connector.core.IRdbConnector;
import com.bigprime.connector.manager.ConnectorManager;
import com.bigprime.datasync.query.entity.SqlApiEntity;
import com.bigprime.datasync.query.repository.SqlApiRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.tool.ToolCallback;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.ai.tool.definition.DefaultToolDefinition;
import org.springframework.ai.tool.definition.ToolDefinition;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 动态 SQL MCP 工具提供器
 * <p>
 * 从 ds_sql_api 表加载 publish_as_mcp=1 且 enabled=true 的 SQL，
 * 将每条 SQL 包装为一个 ToolCallback 注册到本地 MCP Server 供 AI 调用。
 * 执行时通过 ConnectorManager 使用各 SQL 绑定的 starRocksConnectorId 连接器。
 * </p>
 * <p>
 * SQL 支持 {{paramName}} 占位符（与现有 SQL 开发功能一致）。
 * </p>
 */
@Slf4j
@Component
@AllArgsConstructor
public class DynamicMcpSqlToolProvider implements ToolCallbackProvider {

    private final SqlApiRepository sqlApiRepository;
    private final ConnectorManager connectorManager;
    private final ObjectMapper objectMapper;

    @Override
    public ToolCallback[] getToolCallbacks() {
        try {
            List<SqlApiEntity> published = sqlApiRepository.findPublishedAsMcp();
            log.debug("加载 MCP SQL 工具: {} 个", published.size());
            return published.stream()
                    .filter(e -> StringUtils.hasText(e.getMcpToolName()))
                    .map(e -> new SqlToolCallback(e, connectorManager, objectMapper))
                    .toArray(ToolCallback[]::new);
        } catch (Exception e) {
            log.warn("加载 MCP SQL 工具失败: {}", e.getMessage());
            return new ToolCallback[0];
        }
    }

    /**
     * SQL MCP 工具 ToolCallback 实现
     */
    private static class SqlToolCallback implements ToolCallback {

        private final SqlApiEntity api;
        private final ConnectorManager connectorManager;
        private final ObjectMapper objectMapper;

        SqlToolCallback(SqlApiEntity api, ConnectorManager connectorManager, ObjectMapper objectMapper) {
            this.api = api;
            this.connectorManager = connectorManager;
            this.objectMapper = objectMapper;
        }

        @Override
        public ToolDefinition getToolDefinition() {
            return DefaultToolDefinition.builder()
                    .name(api.getMcpToolName())
                    .description(StringUtils.hasText(api.getDescription())
                            ? api.getDescription()
                            : "SQL 查询工具: " + api.getApiName())
                    .inputSchema(buildInputSchema())
                    .build();
        }

        @Override
        public String call(String toolInput) {
            log.info("执行 SQL MCP 工具: tool={}, input={}", api.getMcpToolName(), toolInput);
            try {
                Map<String, Object> args = parseArgs(toolInput);
                String result = executeSql(args);
                log.info("SQL MCP 工具执行成功: tool={}", api.getMcpToolName());
                return result;
            } catch (Exception e) {
                log.error("SQL MCP 工具执行失败: tool={}", api.getMcpToolName(), e);
                return "{\"error\": \"" + e.getMessage().replace("\"", "'") + "\"}";
            }
        }

        private String buildInputSchema() {
            if (StringUtils.hasText(api.getParameters())) {
                try {
                    List<Map<String, Object>> params = objectMapper.readValue(
                            api.getParameters(), new TypeReference<>() {});
                    if (!params.isEmpty()) {
                        Map<String, Object> properties = new LinkedHashMap<>();
                        List<String> required = new ArrayList<>();
                        for (Map<String, Object> p : params) {
                            String name = (String) p.get("name");
                            if (name == null) continue;
                            Map<String, Object> propDef = new LinkedHashMap<>();
                            propDef.put("type", mapType((String) p.get("type")));
                            if (p.containsKey("description")) propDef.put("description", p.get("description"));
                            properties.put(name, propDef);
                            if (Boolean.TRUE.equals(p.get("required"))) required.add(name);
                        }
                        Map<String, Object> schema = new LinkedHashMap<>();
                        schema.put("type", "object");
                        schema.put("properties", properties);
                        if (!required.isEmpty()) schema.put("required", required);
                        return objectMapper.writeValueAsString(schema);
                    }
                } catch (Exception e) {
                    log.warn("解析参数定义失败: tool={}", api.getMcpToolName());
                }
            }
            return buildSchemaFromSqlTemplate();
        }

        private String mapType(String type) {
            if (type == null) return "string";
            return switch (type.toLowerCase()) {
                case "int", "long" -> "integer";
                case "double" -> "number";
                case "boolean" -> "boolean";
                default -> "string";
            };
        }

        private String buildSchemaFromSqlTemplate() {
            try {
                Pattern p = Pattern.compile("\\{\\{(\\w+)\\}\\}");
                Matcher m = p.matcher(api.getSqlTemplate());
                Set<String> params = new LinkedHashSet<>();
                while (m.find()) params.add(m.group(1));

                Map<String, Object> properties = new LinkedHashMap<>();
                for (String param : params) {
                    properties.put(param, Map.of("type", "string", "description", param));
                }
                Map<String, Object> schema = new LinkedHashMap<>();
                schema.put("type", "object");
                schema.put("properties", properties);
                if (!params.isEmpty()) schema.put("required", new ArrayList<>(params));
                return objectMapper.writeValueAsString(schema);
            } catch (Exception e) {
                return "{\"type\":\"object\",\"properties\":{}}";
            }
        }

        private Map<String, Object> parseArgs(String toolInput) {
            if (!StringUtils.hasText(toolInput)) return Map.of();
            try {
                return objectMapper.readValue(toolInput, new TypeReference<>() {});
            } catch (Exception e) {
                return Map.of();
            }
        }

        private String executeSql(Map<String, Object> args) throws Exception {
            String sql = api.getSqlTemplate();
            Pattern p = Pattern.compile("\\{\\{(\\w+)\\}\\}");
            Matcher m = p.matcher(sql);
            StringBuffer sb = new StringBuffer();
            while (m.find()) {
                String paramName = m.group(1);
                Object value = args.getOrDefault(paramName, "");
                String valueStr = (value instanceof String)
                        ? "'" + value.toString().replace("'", "''") + "'"
                        : String.valueOf(value);
                m.appendReplacement(sb, Matcher.quoteReplacement(valueStr));
            }
            m.appendTail(sb);
            String finalSql = sb.toString();

            int maxRows = api.getMaxRows() != null ? api.getMaxRows() : 1000;
            if (!finalSql.trim().toLowerCase().contains("limit")) {
                finalSql = finalSql + " LIMIT " + maxRows;
            }

            log.debug("SQL MCP 执行: connector={}, sql={}", api.getStarRocksConnectorId(), finalSql);

            IRdbConnector connector = connectorManager.getConnector(
                    api.getStarRocksConnectorId(), IRdbConnector.class);
            Connection conn = connector.getConnection(api.getStarRocksConnectorId());

            try (conn;
                 PreparedStatement stmt = conn.prepareStatement(finalSql);
                 ResultSet rs = stmt.executeQuery()) {

                ResultSetMetaData meta = rs.getMetaData();
                int colCount = meta.getColumnCount();
                List<String> columns = new ArrayList<>();
                for (int i = 1; i <= colCount; i++) columns.add(meta.getColumnName(i));

                List<Map<String, Object>> rows = new ArrayList<>();
                while (rs.next()) {
                    Map<String, Object> row = new LinkedHashMap<>();
                    for (int i = 1; i <= colCount; i++) row.put(columns.get(i - 1), rs.getObject(i));
                    rows.add(row);
                }

                Map<String, Object> result = new LinkedHashMap<>();
                result.put("columns", columns);
                result.put("rows", rows);
                result.put("count", rows.size());
                return objectMapper.writeValueAsString(result);
            }
        }
    }
}
