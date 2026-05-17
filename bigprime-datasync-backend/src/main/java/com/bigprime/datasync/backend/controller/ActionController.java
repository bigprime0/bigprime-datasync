package com.bigprime.datasync.backend.controller;

import com.bigprime.action.entities.ActionEntity;
import com.bigprime.action.service.ActionService;
import com.bigprime.datasync.core.model.MyPageResult;
import com.bigprime.datasync.core.model.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

/**
 * Action管理API控制器
 * 提供Action管理的REST API接口
 *
 * @author bigprime
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/action")
@Tag(name = "Action管理")
@AllArgsConstructor
public class ActionController {
    private final ActionService actionService;

    /**
     * 保存Action
     *
     * @param entity Action实体
     * @return 操作结果
     */
    @PostMapping("/save")
    @Operation(summary = "保存Action")
    public Result<Long> saveAction(@RequestBody ActionEntity entity) {
        try {
            return Result.ok(actionService.saveAction(entity));
        } catch (Exception e) {
            log.error("保存Action失败", e);
            return Result.error("保存Action失败: " + e.getMessage());
        }
    }

    /**
     * 删除Action
     *
     * @param id Action ID
     * @return 操作结果
     */
    @DeleteMapping("/delete/{id}")
    @Operation(summary = "删除Action")
    public Result<Long> deleteAction(@PathVariable String id) {
        try {
            return Result.ok(actionService.deleteAction(id));
        } catch (Exception e) {
            log.error("删除Action失败", e);
            return Result.error("删除Action失败: " + e.getMessage());
        }
    }

    /**
     * 获取Action列表
     *
     * @param params 查询参数
     * @return 分页结果
     */
    @PostMapping("/list")
    @Operation(summary = "获取Action列表")
    public Result<MyPageResult<ActionEntity>> getActionList(@RequestBody Map<String, Object> params) {
        try {
            String search = params.getOrDefault("search", "").toString();
            Integer page = 1;
            Integer limit = 10;
            
            try {
                page = Integer.parseInt(params.getOrDefault("page", 1).toString());
                limit = Integer.parseInt(params.getOrDefault("pageSize", 10).toString());
            } catch (NumberFormatException e) {
                log.warn("分页参数无效，使用默认值: page=1, pageSize=10");
            }
            
            MyPageResult<ActionEntity> actionList = actionService.getActionPage(search, page, limit);
            return Result.ok(actionList);
        } catch (Exception e) {
            log.error("获取Action列表失败", e);
            return Result.error("获取Action列表失败: " + e.getMessage());
        }
    }

    /**
     * 获取单个Action
     *
     * @param id Action ID
     * @return Action实体
     */
    @GetMapping("/get/{id}")
    @Operation(summary = "获取单个Action")
    public Result<ActionEntity> getActionById(@PathVariable String id) {
        try {
            return Result.ok(actionService.getActionById(id));
        } catch (Exception e) {
            log.error("获取Action详情失败", e);
            return Result.error("获取Action详情失败: " + e.getMessage());
        }
    }

    /**
     * 上传并注册Jar包
     *
     * @param file Jar文件
     * @return 操作结果
     */
    @PostMapping("/uploadJar")
    @Operation(summary = "上传并注册Jar包")
    public Result<Map<String, Object>> uploadAndRegisterJar(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return Result.error("请选择要上传的Jar文件");
            }
            Map<String, Object> result = actionService.uploadAndRegisterJar(file);
            return Result.ok(result);
        } catch (Exception e) {
            log.error("上传并注册Jar包失败", e);
            return Result.error("上传并注册Jar包失败: " + e.getMessage());
        }
    }
    
    /**
     * 根据实现类的全路径名称获取Action信息和参数信息
     *
     * @param params 实现类的clazz全路径
     * @return ActionEntity对象，包含参数列表
     */
    @PostMapping("/getByClassName")
    @Operation(summary = "根据实现类名称获取Action信息")
    public Result<ActionEntity> getActionByClassName(@RequestBody Map<String, Object> params) {
        try {
            String className = params.getOrDefault("clazz", "").toString();
            if (className == null || className.isEmpty()) {
                return Result.error("类名不能为空");
            }
            ActionEntity actionEntity = actionService.getActionByClassName(className);
            if (actionEntity == null) {
                return Result.error("未找到类名为" + className + "的Action");
            }
            return Result.ok(actionEntity);
        } catch (Exception e) {
            log.error("根据类名获取Action信息失败", e);
            return Result.error("根据类名获取Action信息失败: " + e.getMessage());
        }
    }
    
    /**
     * 自动扫描并注册当前项目中的所有Action实现类
     * 前端点击更新按钮时调用，后端自动扫描并保存到数据库
     * 当数据库中已存在相同Action时，跳过不重复注册
     *
     * @return 扫描结果统计信息
     */
    @PostMapping("/scan")
    @Operation(summary = "自动扫描并注册Action")
    public Result<Map<String, Object>> scanAndRegisterActions() {
        try {
            log.info("开始自动扫描并注册Action...");
            Map<String, Object> result = actionService.scanAndRegisterActions();
            log.info("Action扫描完成: {}", result);
            return Result.ok(result);
        } catch (Exception e) {
            log.error("自动扫描并注册Action失败", e);
            return Result.error("自动扫描并注册Action失败: " + e.getMessage());
        }
    }
}