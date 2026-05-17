package com.bigprime.datasync.backend.controller.crawler;

import com.bigprime.datasync.core.model.MyPageResult;
import com.bigprime.datasync.core.model.Result;
import com.bigprime.datasync.backend.handler.model.crawler.CrawlerProxyEntity;
import com.bigprime.datasync.backend.service.crawler.CrawlerProxyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 爬虫代理管理Controller
 *
 * @author bigprime
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/crawler/proxy")
@AllArgsConstructor
@Tag(name = "爬虫代理管理", description = "爬虫代理IP管理接口")
public class CrawlerProxyController {

    private final CrawlerProxyService proxyService;

    /**
     * 分页查询代理列表
     */
    @PostMapping("/list")
    @Operation(summary = "分页查询代理列表")
    public Result<MyPageResult<CrawlerProxyEntity>> getProxyList(@RequestBody Map<String, Object> params) {
        try {
            String search = params.getOrDefault("search", "").toString();
            String status = params.getOrDefault("status", "").toString();
            Integer page = Integer.parseInt(params.getOrDefault("page", "1").toString());
            Integer limit = Integer.parseInt(params.getOrDefault("pageSize", "20").toString());

            MyPageResult<CrawlerProxyEntity> result = proxyService.getProxyList(search, status, page, limit);
            return Result.ok(result);
        } catch (NumberFormatException e) {
            log.error("分页参数无效", e);
            return Result.error("分页参数必须为有效数字");
        } catch (Exception e) {
            log.error("查询代理列表失败", e);
            return Result.error("查询代理列表失败: " + e.getMessage());
        }
    }

    /**
     * 创建代理
     */
    @PostMapping("/create")
    @Operation(summary = "创建代理")
    public Result<String> createProxy(@RequestBody CrawlerProxyEntity proxy) {
        try {
            String proxyId = proxyService.createProxy(proxy);
            return Result.ok(proxyId);
        } catch (Exception e) {
            log.error("创建代理失败", e);
            return Result.error("创建代理失败: " + e.getMessage());
        }
    }

    /**
     * 更新代理
     */
    @PutMapping("/update")
    @Operation(summary = "更新代理")
    public Result<Void> updateProxy(@RequestBody CrawlerProxyEntity proxy) {
        try {
            proxyService.updateProxy(proxy);
            return Result.ok();
        } catch (Exception e) {
            log.error("更新代理失败: id={}", proxy.getId(), e);
            return Result.error("更新代理失败: " + e.getMessage());
        }
    }

    /**
     * 删除代理
     */
    @DeleteMapping("/delete/{id}")
    @Operation(summary = "删除代理")
    public Result<Void> deleteProxy(@PathVariable String id) {
        try {
            proxyService.deleteProxy(id);
            log.info("删除代理成功: id={}", id);
            return Result.ok();
        } catch (Exception e) {
            log.error("删除代理失败: id={}", id, e);
            return Result.error("删除代理失败: " + e.getMessage());
        }
    }

    /**
     * 获取代理详情
     */
    @GetMapping("/get/{id}")
    @Operation(summary = "获取代理详情")
    public Result<CrawlerProxyEntity> getProxy(@PathVariable String id) {
        try {
            CrawlerProxyEntity proxy = proxyService.getProxyById(id);
            if (proxy == null) {
                return Result.error("代理不存在");
            }
            return Result.ok(proxy);
        } catch (Exception e) {
            log.error("查询代理详情失败: id={}", id, e);
            return Result.error("查询代理详情失败: " + e.getMessage());
        }
    }

    /**
     * 启用/禁用代理
     */
    @PutMapping("/toggle/{id}")
    @Operation(summary = "启用/禁用代理")
    public Result<Void> toggleProxy(@PathVariable String id, @RequestParam String status) {
        try {
            proxyService.toggleProxyStatus(id, status);
            log.info("切换代理状态成功: id={}, status={}", id, status);
            return Result.ok();
        } catch (Exception e) {
            log.error("切换代理状态失败: id={}, status={}", id, status, e);
            return Result.error("切换代理状态失败: " + e.getMessage());
        }
    }
}
