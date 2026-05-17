package com.bigprime.datasync.backend.controller.trigger;

import com.bigprime.datasync.core.model.MyPageResult;
import com.bigprime.datasync.core.model.Result;
import com.bigprime.datasync.backend.handler.model.trigger.DagTrigger;
import com.bigprime.datasync.backend.service.trigger.DagTriggerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;
import java.util.Map;

/**
 * DAG触发器管理 API 控制器
 */
@Slf4j
@RestController
@RequestMapping("/api/trigger")
@Tag(name = "DAG触发器管理")
@AllArgsConstructor
public class DagTriggerController {
    
    private final DagTriggerService triggerService;

    /**
     * 创建触发器
     */
    @PostMapping("/create")
    @Operation(summary = "创建触发器")
    public Result<Long> create(@RequestBody DagTrigger trigger) {
        try {
            Long id = triggerService.create(trigger);
            return Result.ok(id);
        } catch (Exception e) {
            log.error("创建触发器失败", e);
            return Result.error("创建触发器失败: " + e.getMessage());
        }
    }
    
    /**
     * 更新触发器
     */
    @PutMapping("/update")
    @Operation(summary = "更新触发器")
    public Result<Void> update(@RequestBody DagTrigger trigger) {
        try {
            triggerService.update(trigger);
            return Result.ok();
        } catch (Exception e) {
            log.error("更新触发器失败", e);
            return Result.error("更新触发器失败: " + e.getMessage());
        }
    }
    
    /**
     * 启用触发器
     */
    @PutMapping("/enable/{id}")
    @Operation(summary = "启用触发器")
    public Result<Void> enable(@PathVariable Long id) {
        try {
            triggerService.enable(id);
            return Result.ok();
        } catch (Exception e) {
            log.error("启用触发器失败: id={}", id, e);
            return Result.error("启用触发器失败: " + e.getMessage());
        }
    }
    
    /**
     * 停用触发器
     */
    @PutMapping("/disable/{id}")
    @Operation(summary = "停用触发器")
    public Result<Void> disable(@PathVariable Long id) {
        try {
            triggerService.disable(id);
            return Result.ok();
        } catch (Exception e) {
            log.error("停用触发器失败: id={}", id, e);
            return Result.error("停用触发器失败: " + e.getMessage());
        }
    }
    
    /**
     * 立即触发一次
     */
    @PostMapping("/fireNow/{id}")
    @Operation(summary = "立即触发一次")
    public Result<String> fireNow(@PathVariable Long id) {
        try {
            String executionId = triggerService.fireNow(id);
            return Result.ok(executionId);
        } catch (Exception e) {
            log.error("立即触发失败: id={}", id, e);
            return Result.error("立即触发失败: " + e.getMessage());
        }
    }
    
    /**
     * 分页查询触发器列表
     */
    @PostMapping("/list")
    @Operation(summary = "分页查询触发器列表")
    public Result<MyPageResult<DagTrigger>> list(@RequestBody Map<String, Object> params) {
        try {
            String search = params.getOrDefault("search", "").toString();
            Integer page = Integer.parseInt(params.getOrDefault("page", "1").toString());
            Integer limit = Integer.parseInt(params.getOrDefault("pageSize", "10").toString());
            
            MyPageResult<DagTrigger> result = triggerService.getPage(search, page, limit);
            return Result.ok(result);
        } catch (Exception e) {
            log.error("查询触发器列表失败", e);
            return Result.error("查询触发器列表失败: " + e.getMessage());
        }
    }
    
    /**
     * 根据DAG定义ID查询触发器列表
     */
    @GetMapping("/list/{dagDefinitionId}")
    @Operation(summary = "查询指定DAG的触发器列表")
    public Result<List<DagTrigger>> listByDagDefinitionId(@PathVariable String dagDefinitionId) {
        try {
            List<DagTrigger> triggers = triggerService.listByDagDefinitionId(dagDefinitionId);
            return Result.ok(triggers);
        } catch (Exception e) {
            log.error("查询触发器列表失败: dagDefinitionId={}", dagDefinitionId, e);
            return Result.error("查询触发器列表失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取触发器详情
     */
    @GetMapping("/get/{id}")
    @Operation(summary = "获取触发器详情")
    public Result<DagTrigger> get(@PathVariable Long id) {
        try {
            DagTrigger trigger = triggerService.getById(id);
            if (trigger == null) {
                return Result.error("触发器不存在");
            }
            return Result.ok(trigger);
        } catch (Exception e) {
            log.error("查询触发器详情失败: id={}", id, e);
            return Result.error("查询触发器详情失败: " + e.getMessage());
        }
    }
    
    /**
     * 删除触发器
     */
    @DeleteMapping("/delete/{id}")
    @Operation(summary = "删除触发器")
    public Result<Void> delete(@PathVariable Long id) {
        try {
            triggerService.deleteById(id);
            return Result.ok();
        } catch (Exception e) {
            log.error("删除触发器失败: id={}", id, e);
            return Result.error("删除触发器失败: " + e.getMessage());
        }
    }
    
    /**
     * 预览Cron表达式的下N次触发时间
     */
    @PostMapping("/preview")
    @Operation(summary = "预览Cron表达式触发时间")
    public Result<List<Date>> previewCron(@RequestBody Map<String, Object> params) {
        try {
            String cronExpression = params.get("cronExpression").toString();
            Integer count = Integer.parseInt(params.getOrDefault("count", "5").toString());
            
            List<Date> times = triggerService.previewNextFireTimes(cronExpression, count);
            return Result.ok(times);
        } catch (Exception e) {
            log.error("预览Cron表达式失败", e);
            return Result.error("预览Cron表达式失败: " + e.getMessage());
        }
    }
}
