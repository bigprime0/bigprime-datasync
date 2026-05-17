package com.bigprime.datasync.backend.python.controller;

import com.bigprime.datasync.core.model.Result;
import com.bigprime.datasync.backend.python.entity.PythonServiceEntity;
import com.bigprime.datasync.backend.python.service.PythonServicePublishService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;
import java.util.Map;

/**
 * Python 脚本发布服务 API 控制器
 *
 * 管理端（需鉴权）：
 *   POST   /api/python/service/publish           发布脚本为 HTTP 服务
 *   GET    /api/python/service/list/{workspaceId} 查询 Workspace 下所有服务
 *   POST   /api/python/service/update-time/{id}  更新生效时间
 *   POST   /api/python/service/enable/{id}       启用
 *   POST   /api/python/service/disable/{id}      停用
 *   DELETE /api/python/service/delete/{id}       删除
 *
 * 调用端（无需登录鉴权，仅校验 X-API-Key Header）：
 *   POST   /api/python/invoke                HTTP 服务调用入口
 *
 * @author bigprime
 * @version 1.0
 */
@Slf4j
@RestController
@Tag(name = "Python 脚本发布服务")
@AllArgsConstructor
public class PythonServiceController {

    private final PythonServicePublishService publishService;

    // ==================== 管理端接口 ====================

    /**
     * 发布脚本为 HTTP 服务
     * 请求体示例：
     * {
     *   "workspaceId": "xxx",
     *   "scriptName": "main.py",
     *   "serviceName": "我的数据处理服务",
     *   "apiKey": "a1b2c3d4...",         // 前端生成的 32 位 hex
     *   "description": "处理 CSV 数据",
     *   "effectiveStart": "2026-03-01 00:00:00",  // 可选
     *   "effectiveEnd": "2026-12-31 23:59:59"      // 可选
     * }
     */
    @PostMapping("/api/python/service/publish")
    @Operation(summary = "发布脚本为 HTTP 服务")
    public Result<PythonServiceEntity> publish(@RequestBody Map<String, Object> params) {
        try {
            String workspaceId = getRequired(params, "workspaceId");
            String scriptName = getRequired(params, "scriptName");
            String serviceName = getRequired(params, "serviceName");
            String apiKey = getRequired(params, "apiKey");
            String description = params.getOrDefault("description", "").toString();

            Date effectiveStart = parseDate(params.get("effectiveStart"));
            Date effectiveEnd = parseDate(params.get("effectiveEnd"));

            // MCP 发布参数
            Integer publishAsMcp = params.containsKey("publishAsMcp")
                    ? (Boolean.TRUE.equals(params.get("publishAsMcp")) || "true".equals(String.valueOf(params.get("publishAsMcp"))) ? 1 : 0)
                    : 0;
            String mcpToolName = params.containsKey("mcpToolName") ? String.valueOf(params.get("mcpToolName")) : null;

            PythonServiceEntity entity = publishService.publish(workspaceId, scriptName, serviceName,
                    apiKey, description, effectiveStart, effectiveEnd, publishAsMcp, mcpToolName);
            return Result.ok(entity);
        } catch (Exception e) {
            log.error("发布服务失败", e);
            return Result.error("发布服务失败: " + e.getMessage());
        }
    }

    /**
     * 查询 Workspace 下所有发布服务
     */
    @GetMapping("/api/python/service/list/{workspaceId}")
    @Operation(summary = "查询 Workspace 下所有发布服务")
    public Result<List<PythonServiceEntity>> list(@PathVariable String workspaceId) {
        try {
            return Result.ok(publishService.listByWorkspace(workspaceId));
        } catch (Exception e) {
            log.error("查询发布服务列表失败", e);
            return Result.error("查询失败: " + e.getMessage());
        }
    }

    /**
     * 查询单个服务详情
     */
    @GetMapping("/api/python/service/get/{id}")
    @Operation(summary = "查询服务详情")
    public Result<PythonServiceEntity> get(@PathVariable String id) {
        try {
            return Result.ok(publishService.getById(id));
        } catch (Exception e) {
            log.error("查询服务详情失败", e);
            return Result.error("查询失败: " + e.getMessage());
        }
    }

    /**
     * 更新生效时间
     * 请求体示例：
     * {
     *   "effectiveStart": "2026-03-01 00:00:00",  // 可选，null=立即
     *   "effectiveEnd": "2026-12-31 23:59:59"      // 可选，null=永久
     * }
     */
    @PostMapping("/api/python/service/update-time/{id}")
    @Operation(summary = "更新服务生效时间")
    public Result<String> updateTime(@PathVariable String id, @RequestBody Map<String, Object> params) {
        try {
            Date effectiveStart = parseDate(params.get("effectiveStart"));
            Date effectiveEnd = parseDate(params.get("effectiveEnd"));
            publishService.updateEffectiveTime(id, effectiveStart, effectiveEnd);
            return Result.ok("更新成功");
        } catch (Exception e) {
            log.error("更新生效时间失败", e);
            return Result.error("更新失败: " + e.getMessage());
        }
    }

    /**
     * 启用服务
     */
    @PostMapping("/api/python/service/enable/{id}")
    @Operation(summary = "启用服务")
    public Result<String> enable(@PathVariable String id) {
        try {
            publishService.enable(id);
            return Result.ok("启用成功");
        } catch (Exception e) {
            log.error("启用服务失败", e);
            return Result.error("启用失败: " + e.getMessage());
        }
    }

    /**
     * 停用服务
     */
    @PostMapping("/api/python/service/disable/{id}")
    @Operation(summary = "停用服务")
    public Result<String> disable(@PathVariable String id) {
        try {
            publishService.disable(id);
            return Result.ok("停用成功");
        } catch (Exception e) {
            log.error("停用服务失败", e);
            return Result.error("停用失败: " + e.getMessage());
        }
    }

    /**
     * 删除发布服务
     */
    @DeleteMapping("/api/python/service/delete/{id}")
    @Operation(summary = "删除发布服务")
    public Result<String> delete(@PathVariable String id) {
        try {
            publishService.delete(id);
            return Result.ok("删除成功");
        } catch (Exception e) {
            log.error("删除服务失败", e);
            return Result.error("删除失败: " + e.getMessage());
        }
    }

    // ==================== 调用端接口 ====================

    /**
     * HTTP 服务调用入口
     * 调用方需在 Header 中传递：X-API-Key: {apiKey}
     * 请求体为调用参数 JSON，注入为脚本内的 __input__ 变量
     * 脚本通过设置 __output__ 变量返回 JSON 结果
     *
     * 示例：
     *   POST /api/python/invoke
     *   Header: X-API-Key: abc123...
     *   Body: {"csv_path": "/data/orders.csv"}
     *
     * 响应：
     *   {"status":"success","output":"...", "result":{...}}
     */
    @PostMapping("/api/python/invoke")
    @Operation(summary = "调用已发布的 Python 服务")
    public Map<String, Object> invoke(
            @RequestHeader(value = "X-API-Key", required = false) String apiKey,
            @RequestBody(required = false) Map<String, Object> inputData) {
        if (apiKey == null || apiKey.isBlank()) {
            return Map.of("status", "error", "error", "缺少 X-API-Key Header");
        }
        try {
            return publishService.invoke(apiKey, inputData);
        } catch (Exception e) {
            log.error("调用 Python 服务失败: apiKey={}", apiKey, e);
            return Map.of("status", "error", "error", e.getMessage());
        }
    }

    /**
     * 查询已发布为 MCP 工具的 Python 服务列表
     */
    @GetMapping("/api/python/service/mcp-list")
    @Operation(summary = "查询已发布为 MCP 工具的服务列表")
    public Result<List<PythonServiceEntity>> listMcp() {
        try {
            return Result.ok(publishService.listPublishedAsMcp());
        } catch (Exception e) {
            log.error("查询 MCP 工具列表失败", e);
            return Result.error("查询失败: " + e.getMessage());
        }
    }

    /**
     * 取消发布为 MCP 工具
     */
    @PostMapping("/api/python/service/{id}/disable-mcp")
    @Operation(summary = "取消发布为 MCP 工具")
    public Result<String> disableMcp(@PathVariable String id) {
        try {
            publishService.disableMcp(id);
            return Result.ok("取消成功");
        } catch (Exception e) {
            log.error("取消 MCP 工具失败", e);
            return Result.error("取消失败: " + e.getMessage());
        }
    }

    // ==================== PyPI 搜索代理（绕开浏览器 CORS 限制）====================

    /**
     * PyPI 包搜索代理
     * 由后端请求 pypi.org/search 并解析 HTML，返回包列表给前端
     * GET /api/python/pypi/search?q=logg&limit=8
     */
    @GetMapping("/api/python/pypi/search")
    @Operation(summary = "PyPI 包搜索代理")
    public ResponseEntity<Result<List<Map<String, String>>>> pypiSearch(
            @RequestParam String q,
            @RequestParam(defaultValue = "8") int limit) {
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setCacheControl("no-cache, no-store, must-revalidate");
        headers.setPragma("no-cache");
        headers.setExpires(0);
        if (q == null || q.isBlank() || q.length() < 2) {
            return ResponseEntity.ok().headers(headers).body(Result.ok(List.of()));
        }
        try {
            List<Map<String, String>> results = pypiSearchWithFallback(q.trim(), limit);
            return ResponseEntity.ok().headers(headers).body(Result.ok(results));
        } catch (Exception e) {
            log.warn("PyPI 搜索代理失败: q={}, err={}", q, e.getMessage());
            return ResponseEntity.ok().headers(headers).body(Result.ok(List.of()));
        }
    }

    // ==================== PyPI 搜索内部实现 ====================

    /**
     * 多源降级搜索：
     *  1. 主源： pypi.org/search HTML 解析（5s 超时）
     *  2. 备源： PyPI XMLRPC API（search 方法，5s 超时）
     *  3. 长朾隆： 第一条结果用精准匹配（pypi.org/pypi/{q}/json）
     */
    private List<Map<String, String>> pypiSearchWithFallback(String q, int limit) {
        // 主源： HTML 搜索
        try {
            List<Map<String, String>> results = pypiHtmlSearch(q, limit, 5);
            if (!results.isEmpty()) return results;
        } catch (Exception e) {
            log.debug("PyPI HTML 搜索失败，尝试 XMLRPC: {}", e.getMessage());
        }
        // 备源： XMLRPC
        try {
            List<Map<String, String>> results = pypiXmlRpcSearch(q, limit, 5);
            if (!results.isEmpty()) return results;
        } catch (Exception e) {
            log.debug("PyPI XMLRPC 搜索失败: {}", e.getMessage());
        }
        return List.of();
    }

    /** 方案一：请求 pypi.org/search HTML 并用正则解析包名+描述 */
    private List<Map<String, String>> pypiHtmlSearch(String q, int limit, int timeoutSec) throws Exception {
        String url = "https://pypi.org/search/?q=" + java.net.URLEncoder.encode(q, java.nio.charset.StandardCharsets.UTF_8);
        java.net.http.HttpClient client = java.net.http.HttpClient.newBuilder()
                .connectTimeout(java.time.Duration.ofSeconds(timeoutSec))
                .followRedirects(java.net.http.HttpClient.Redirect.NORMAL)
                .build();
        java.net.http.HttpRequest request = java.net.http.HttpRequest.newBuilder()
                .uri(java.net.URI.create(url))
                .header("User-Agent", "Mozilla/5.0 (compatible; BigprimeBot/1.0; +https://bigprime.com)")
                .timeout(java.time.Duration.ofSeconds(timeoutSec))
                .GET()
                .build();
        java.net.http.HttpResponse<String> response = client.send(request,
                java.net.http.HttpResponse.BodyHandlers.ofString());
        String html = response.body();
        List<Map<String, String>> results = new java.util.ArrayList<>();
        java.util.regex.Pattern snippetPat = java.util.regex.Pattern.compile(
                "<a[^>]+class=\"package-snippet\"[^>]*>[\\s\\S]*?</a>",
                java.util.regex.Pattern.CASE_INSENSITIVE);
        java.util.regex.Pattern namePat = java.util.regex.Pattern.compile(
                "class=\"package-snippet__name\"[^>]*>([^<]+)<",
                java.util.regex.Pattern.CASE_INSENSITIVE);
        java.util.regex.Pattern descPat = java.util.regex.Pattern.compile(
                "class=\"package-snippet__description\"[^>]*>([^<]*)<",
                java.util.regex.Pattern.CASE_INSENSITIVE);
        java.util.regex.Matcher m = snippetPat.matcher(html);
        while (m.find() && results.size() < limit) {
            String snippet = m.group();
            java.util.regex.Matcher nm = namePat.matcher(snippet);
            java.util.regex.Matcher dm = descPat.matcher(snippet);
            if (nm.find()) {
                String name = nm.group(1).trim();
                String desc = dm.find() ? dm.group(1).trim() : "";
                if (!name.isEmpty()) {
                    Map<String, String> item = new java.util.LinkedHashMap<>();
                    item.put("name", name);
                    item.put("desc", desc);
                    results.add(item);
                }
            }
        }
        return results;
    }

    /**
     * 方案二： PyPI XMLRPC 搜索
     * POST https://pypi.org/pypi
     * 请求体为 XML-RPC 格式： methodCall/search
     */
    private List<Map<String, String>> pypiXmlRpcSearch(String q, int limit, int timeoutSec) throws Exception {
        String body = "<?xml version='1.0'?>\n" +
                "<methodCall>\n" +
                "  <methodName>search</methodName>\n" +
                "  <params>\n" +
                "    <param><value><struct>\n" +
                "      <member><name>name</name><value><array><data><value><string>" + escapeXml(q) + "</string></value></data></array></value></member>\n" +
                "      <member><name>summary</name><value><array><data><value><string>" + escapeXml(q) + "</string></value></data></array></value></member>\n" +
                "    </struct></value></param>\n" +
                "    <param><value><string>or</string></value></param>\n" +
                "  </params>\n" +
                "</methodCall>";
        java.net.http.HttpClient client = java.net.http.HttpClient.newBuilder()
                .connectTimeout(java.time.Duration.ofSeconds(timeoutSec))
                .build();
        java.net.http.HttpRequest request = java.net.http.HttpRequest.newBuilder()
                .uri(java.net.URI.create("https://pypi.org/pypi"))
                .header("Content-Type", "text/xml")
                .header("User-Agent", "Mozilla/5.0 (compatible; BigprimeBot/1.0)")
                .timeout(java.time.Duration.ofSeconds(timeoutSec))
                .POST(java.net.http.HttpRequest.BodyPublishers.ofString(body))
                .build();
        java.net.http.HttpResponse<String> response = client.send(request,
                java.net.http.HttpResponse.BodyHandlers.ofString());
        String xml = response.body();
        // 解析 XMLRPC 响应：提取 name 和 summary
        List<Map<String, String>> results = new java.util.ArrayList<>();
        java.util.regex.Pattern structPat = java.util.regex.Pattern.compile(
                "<struct>([\\s\\S]*?)</struct>");
        java.util.regex.Pattern memberPat = java.util.regex.Pattern.compile(
                "<name>([^<]+)</name>[\\s\\S]*?<string>([^<]*)</string>");
        java.util.regex.Matcher sm = structPat.matcher(xml);
        while (sm.find() && results.size() < limit) {
            String struct = sm.group(1);
            java.util.regex.Matcher mm = memberPat.matcher(struct);
            String pkgName = "", summary = "";
            while (mm.find()) {
                if ("name".equals(mm.group(1))) pkgName = mm.group(2).trim();
                if ("summary".equals(mm.group(1))) summary = mm.group(2).trim();
            }
            if (!pkgName.isEmpty()) {
                Map<String, String> item = new java.util.LinkedHashMap<>();
                item.put("name", pkgName);
                item.put("desc", summary);
                results.add(item);
            }
        }
        return results;
    }

    /** XML 特殊字符转义 */
    private String escapeXml(String s) {
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;");
    }

    // ==================== 工具方法 ====================

    private String getRequired(Map<String, Object> params, String key) {
        Object val = params.get(key);
        if (val == null || val.toString().isBlank()) {
            throw new IllegalArgumentException("参数 [" + key + "] 不能为空");
        }
        return val.toString().trim();
    }

    /**
     * 解析日期：支持字符串（yyyy-MM-dd HH:mm:ss 或 yyyy-MM-dd）和 Long 时间戳
     */
    @SuppressWarnings("unchecked")
    private Date parseDate(Object val) {
        if (val == null || val.toString().isBlank() || "null".equals(val.toString())) {
            return null;
        }
        try {
            if (val instanceof Long ts) {
                return new Date(ts);
            }
            if (val instanceof Integer ts) {
                return new Date((long) ts * 1000);
            }
            String str = val.toString().trim();
            // 支持 ISO 格式中的 T 分隔符
            str = str.replace("T", " ");
            if (str.length() == 10) {
                str = str + " 00:00:00";
            }
            java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
            return sdf.parse(str);
        } catch (Exception e) {
            throw new IllegalArgumentException("日期格式错误: " + val + "，请使用 yyyy-MM-dd HH:mm:ss");
        }
    }
}
