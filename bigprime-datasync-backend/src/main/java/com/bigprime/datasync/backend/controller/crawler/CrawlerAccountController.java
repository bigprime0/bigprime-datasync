package com.bigprime.datasync.backend.controller.crawler;

import com.bigprime.datasync.core.model.MyPageResult;
import com.bigprime.datasync.core.model.Result;
import com.bigprime.datasync.backend.handler.model.crawler.CrawlerAccountEntity;
import com.bigprime.datasync.backend.service.crawler.CrawlerAccountService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 爬虫账号管理Controller
 *
 * @author bigprime
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/crawler/account")
@AllArgsConstructor
@Tag(name = "爬虫账号管理", description = "爬虫账号池管理接口")
public class CrawlerAccountController {

    private final CrawlerAccountService accountService;

    /**
     * 分页查询账号列表
     */
    @PostMapping("/list")
    @Operation(summary = "分页查询账号列表")
    public Result<MyPageResult<CrawlerAccountEntity>> getAccountList(@RequestBody Map<String, Object> params) {
        try {
            String search = params.getOrDefault("search", "").toString();
            String status = params.getOrDefault("status", "").toString();
            Integer page = Integer.parseInt(params.getOrDefault("page", "1").toString());
            Integer limit = Integer.parseInt(params.getOrDefault("pageSize", "20").toString());

            MyPageResult<CrawlerAccountEntity> result = accountService.getAccountList(search, status, page, limit);
            return Result.ok(result);
        } catch (NumberFormatException e) {
            log.error("分页参数无效", e);
            return Result.error("分页参数必须为有效数字");
        } catch (Exception e) {
            log.error("查询账号列表失败", e);
            return Result.error("查询账号列表失败: " + e.getMessage());
        }
    }

    /**
     * 创建账号
     */
    @PostMapping("/create")
    @Operation(summary = "创建账号")
    public Result<String> createAccount(@RequestBody CrawlerAccountEntity account) {
        try {
            String accountId = accountService.createAccount(account);
            return Result.ok(accountId);
        } catch (Exception e) {
            log.error("创建账号失败", e);
            return Result.error("创建账号失败: " + e.getMessage());
        }
    }

    /**
     * 更新账号
     */
    @PutMapping("/update")
    @Operation(summary = "更新账号")
    public Result<Void> updateAccount(@RequestBody CrawlerAccountEntity account) {
        try {
            accountService.updateAccount(account);
            return Result.ok();
        } catch (Exception e) {
            log.error("更新账号失败: id={}", account.getId(), e);
            return Result.error("更新账号失败: " + e.getMessage());
        }
    }

    /**
     * 删除账号
     */
    @DeleteMapping("/delete/{id}")
    @Operation(summary = "删除账号")
    public Result<Void> deleteAccount(@PathVariable String id) {
        try {
            accountService.deleteAccount(id);
            log.info("删除账号成功: id={}", id);
            return Result.ok();
        } catch (Exception e) {
            log.error("删除账号失败: id={}", id, e);
            return Result.error("删除账号失败: " + e.getMessage());
        }
    }

    /**
     * 获取账号详情
     */
    @GetMapping("/get/{id}")
    @Operation(summary = "获取账号详情")
    public Result<CrawlerAccountEntity> getAccount(@PathVariable String id) {
        try {
            CrawlerAccountEntity account = accountService.getAccountById(id);
            if (account == null) {
                return Result.error("账号不存在");
            }
            return Result.ok(account);
        } catch (Exception e) {
            log.error("查询账号详情失败: id={}", id, e);
            return Result.error("查询账号详情失败: " + e.getMessage());
        }
    }

    /**
     * 启用/禁用账号
     */
    @PutMapping("/toggle/{id}")
    @Operation(summary = "启用/禁用账号")
    public Result<Void> toggleAccount(@PathVariable String id, @RequestParam String status) {
        try {
            accountService.toggleAccountStatus(id, status);
            log.info("切换账号状态成功: id={}, status={}", id, status);
            return Result.ok();
        } catch (Exception e) {
            log.error("切换账号状态失败: id={}, status={}", id, status, e);
            return Result.error("切换账号状态失败: " + e.getMessage());
        }
    }
}
