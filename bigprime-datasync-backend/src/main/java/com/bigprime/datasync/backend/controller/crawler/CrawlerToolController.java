package com.bigprime.datasync.backend.controller.crawler;

import com.bigprime.datasync.core.model.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.stream.Collectors;

/**
 * 爬虫工具Controller
 *
 * @author bigprime
 */
@Slf4j
@RestController
@RequestMapping("/api/crawler/tool")
@Tag(name = "爬虫工具", description = "爬虫辅助工具接口")
public class CrawlerToolController {

    /**
     * 代理获取网页内容（用于选择器生成器）
     */
    @GetMapping("/proxy")
    @Operation(summary = "代理获取网页内容")
    public Result<String> proxyPage(@RequestParam String url) {
        try {
            // 验证URL
            if (url == null || url.trim().isEmpty()) {
                return Result.error("URL不能为空");
            }
            
            if (!url.startsWith("http://") && !url.startsWith("https://")) {
                return Result.error("URL格式不正确，必须以http://或https://开头");
            }

            // 发起HTTP请求
            URL targetUrl = new URL(url);
            HttpURLConnection connection = (HttpURLConnection) targetUrl.openConnection();
            connection.setRequestMethod("GET");
            connection.setConnectTimeout(10000);
            connection.setReadTimeout(10000);
            
            // 设置User-Agent，避免被反爬
            connection.setRequestProperty("User-Agent", 
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
            
            int responseCode = connection.getResponseCode();
            if (responseCode != HttpURLConnection.HTTP_OK) {
                return Result.error("获取页面失败，HTTP状态码: " + responseCode);
            }

            // 读取响应内容
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(connection.getInputStream(), StandardCharsets.UTF_8))) {
                String content = reader.lines().collect(Collectors.joining("\n"));
                
                // 添加base标签，确保页面资源正确加载
                String baseUrl = targetUrl.getProtocol() + "://" + targetUrl.getHost();
                if (targetUrl.getPort() != -1) {
                    baseUrl += ":" + targetUrl.getPort();
                }
                
                // 在head标签后插入base标签
                if (content.toLowerCase().contains("<head>")) {
                    content = content.replaceFirst("(?i)<head>", 
                        "<head><base href=\"" + baseUrl + "\">");
                }
                
                return Result.ok(content);
            }
            
        } catch (Exception e) {
            log.error("代理获取网页失败: {}", e.getMessage(), e);
            return Result.error("代理获取网页失败: " + e.getMessage());
        }
    }
}
