package com.bigprime.datasync.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;
import java.io.IOException;

/**
 * SPA（单页应用）Web配置
 *
 * <p>功能：
 * <ul>
 *   <li>支持Vue Router的HTML5 History模式</li>
 *   <li>将前端静态资源打包到JAR中，通过Backend统一端口访问</li>
 *   <li>所有非API请求都返回index.html，由前端路由处理</li>
 * </ul>
 *
 * <p>重要说明：
 * 静态资源通过 spring.web.resources.static-locations 配置（bootstrap.yml），
 * 指向 BACKEND_HOME/static/，Spring Boot 自动注册 ResourceHandler。
 * SpaFallbackController 仅负责 HTML5 History 路由回退（返回 index.html）。
 * 不可使用 /** 通配符注册 ResourceHandler，因为 ResourceHttpRequestHandler 只支持
 * GET/HEAD 方法，对 PUT/DELETE 等请求会抛出 405 Method Not Allowed，导致
 * @PutMapping / @DeleteMapping 的 Controller 接口无法被正常调用。
 *
 * @author BigPrime DataSync
 * @since 1.0.0
 */
@Configuration
public class SpaWebConfig implements WebMvcConfigurer {

    /**
     * SPA Fallback Controller：处理 HTML5 History 模式的前端路由。
     * 所有不含「.」（即非静态文件扩展名）的 GET 请求都返回 index.html，
     * 由前端 Vue Router 接管路由解析。
     * /api/** 路径由各 RestController 处理，不会匹配此 Fallback。
     * /mcp/** 路径由 Spring AI MCP RouterFunction 处理，必须排除。
     * /ws/**  路径由 STOMP WebSocket 处理，必须排除（SockJS 抓手不能被拦截）。
     * /assets/** 路径由 Spring Boot 静态资源处理，必须排除。
     */
    @RestController
    public static class SpaFallbackController {
        @GetMapping(
                value = {"/", "/{path:(?!mcp|ws|api|assets)[^\\.]*}", "/{path:(?!mcp|ws|api|assets)[^\\.]*}/**"},
                produces = MediaType.TEXT_HTML_VALUE
        )
        public Resource fallback() throws IOException {
            String backendHome = System.getProperty("BACKEND_HOME");
            if (backendHome != null && !backendHome.isEmpty()) {
                File indexFile = new File(backendHome, "static/index.html");
                if (indexFile.exists()) {
                    return new FileSystemResource(indexFile);
                }
            }
            return new ClassPathResource("/static/index.html");
        }
    }
}
