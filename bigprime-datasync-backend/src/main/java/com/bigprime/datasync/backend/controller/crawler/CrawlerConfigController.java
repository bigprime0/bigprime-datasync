package com.bigprime.datasync.backend.controller.crawler;

import com.bigprime.datasync.core.model.Result;
import com.bigprime.datasync.backend.service.crawler.CrawlerConfigService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 爬虫配置控制器
 * 
 * @author bigprime
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/crawler/config")
@Tag(name = "爬虫配置")
@AllArgsConstructor
public class CrawlerConfigController {

    private final CrawlerConfigService configService;

    @GetMapping("/get")
    @Operation(summary = "获取爬虫配置")
    public Result<Map<String, Object>> getConfig() {
        try {
            Map<String, Object> config = configService.getConfig();
            return Result.ok(config);
        } catch (Exception e) {
            log.error("获取配置失败", e);
            return Result.error("获取配置失败: " + e.getMessage());
        }
    }

    @PostMapping("/save")
    @Operation(summary = "保存爬虫配置")
    public Result<String> saveConfig(@RequestBody Map<String, Object> config) {
        try {
            configService.saveConfig(config);
            return Result.ok("保存成功");
        } catch (Exception e) {
            log.error("保存配置失败", e);
            return Result.error("保存配置失败: " + e.getMessage());
        }
    }
}
