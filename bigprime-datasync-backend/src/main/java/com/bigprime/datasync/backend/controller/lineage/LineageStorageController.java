package com.bigprime.datasync.backend.controller.lineage;

import com.bigprime.datasync.core.model.Result;
import com.bigprime.lineage.entity.LineageStorageConfigEntity;
import com.bigprime.lineage.service.LineageStorageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 血缘存储配置Controller
 * 
 * @author bigprime
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/lineage/storage")
public class LineageStorageController {
    
    @Autowired
    private LineageStorageService storageService;
    
    /**
     * 创建存储配置
     */
    @PostMapping("/create")
    public Result<LineageStorageConfigEntity> createStorageConfig(@RequestBody LineageStorageConfigEntity config) {
        try {
            return Result.ok(storageService.createStorageConfig(config));
        } catch (Exception e) {
            log.error("创建血缘存储配置失败", e);
            return Result.error("创建失败: " + e.getMessage());
        }
    }
    
    /**
     * 更新存储配置
     */
    @PostMapping("/update")
    public Result<Void> updateStorageConfig(@RequestBody LineageStorageConfigEntity config) {
        try {
            storageService.updateStorageConfig(config);
            return Result.ok();
        } catch (Exception e) {
            log.error("更新血缘存储配置失败", e);
            return Result.error("更新失败: " + e.getMessage());
        }
    }
    
    /**
     * 删除存储配置
     */
    @DeleteMapping("/{id}")
    public Result<Void> deleteStorageConfig(@PathVariable String id) {
        try {
            storageService.deleteStorageConfig(id);
            return Result.ok();
        } catch (Exception e) {
            log.error("删除血缘存储配置失败", e);
            return Result.error("删除失败: " + e.getMessage());
        }
    }
    
    /**
     * 获取默认存储配置
     */
    @GetMapping("/default")
    public Result<LineageStorageConfigEntity> getDefaultStorageConfig() {
        try {
            return Result.ok(storageService.getDefaultStorageConfig());
        } catch (Exception e) {
            log.error("获取默认血缘存储配置失败", e);
            return Result.error("获取失败: " + e.getMessage());
        }
    }
    
    /**
     * 查询所有启用的存储配置
     */
    @GetMapping("/list")
    public Result<List<LineageStorageConfigEntity>> listEnabledConfigs() {
        try {
            return Result.ok(storageService.listEnabledConfigs());
        } catch (Exception e) {
            log.error("查询血缘存储配置列表失败", e);
            return Result.error("查询失败: " + e.getMessage());
        }
    }
    
    /**
     * 根据ID查询
     */
    @GetMapping("/{id}")
    public Result<LineageStorageConfigEntity> getById(@PathVariable String id) {
        try {
            return Result.ok(storageService.getById(id));
        } catch (Exception e) {
            log.error("查询血缘存储配置失败: id={}", id, e);
            return Result.error("查询失败: " + e.getMessage());
        }
    }
    
    /**
     * 设置默认配置
     */
    @PostMapping("/{id}/set-default")
    public Result<Void> setDefaultConfig(@PathVariable String id) {
        try {
            storageService.setDefaultConfig(id);
            return Result.ok();
        } catch (Exception e) {
            log.error("设置默认血缘存储配置失败: id={}", id, e);
            return Result.error("设置失败: " + e.getMessage());
        }
    }
    
    /**
     * 测试存储连接
     */
    @PostMapping("/{id}/test")
    public Result<Boolean> testConnection(@PathVariable String id) {
        try {
            boolean success = storageService.testConnection(id);
            if (success) {
                return Result.ok(true);
            } else {
                return Result.error("连接失败");
            }
        } catch (Exception e) {
            log.error("测试血缘存储连接失败: id={}", id, e);
            return Result.error("测试失败: " + e.getMessage());
        }
    }
}
