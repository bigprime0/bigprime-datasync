package com.bigprime.datasync.backend.controller;

import com.bigprime.datasync.core.model.Result;
import com.bigprime.datasync.backend.dto.*;
import com.bigprime.datasync.backend.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Dashboard数据统计API控制器
 * 
 * Created by BigPrime DataSync Team
 */
@Slf4j
@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "Dashboard数据统计")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    /**
     * 获取Dashboard核心指标概览
     */
    @GetMapping("/overview")
    @Operation(summary = "获取Dashboard核心指标概览")
    public Result<DashboardOverviewVO> getOverview() {
        try {
            return Result.ok(dashboardService.getOverview());
        } catch (Exception e) {
            log.error("获取Dashboard概览失败", e);
            return Result.error("获取Dashboard概览失败: " + e.getMessage());
        }
    }

    /**
     * 获取任务执行趋势
     */
    @GetMapping("/execution-trend")
    @Operation(summary = "获取任务执行趋势")
    public Result<List<DashboardTrendDataVO>> getExecutionTrend(@RequestParam(defaultValue = "24h") String timeRange) {
        try {
            return Result.ok(dashboardService.getExecutionTrend(timeRange));
        } catch (Exception e) {
            log.error("获取任务执行趋势失败", e);
            return Result.error("获取任务执行趋势失败: " + e.getMessage());
        }
    }

    /**
     * 获取数据传输趋势
     */
    @GetMapping("/transfer-trend")
    @Operation(summary = "获取数据传输趋势")
    public Result<List<DashboardTrendDataVO>> getTransferTrend(@RequestParam(defaultValue = "24h") String timeRange) {
        try {
            return Result.ok(dashboardService.getTransferTrend(timeRange));
        } catch (Exception e) {
            log.error("获取数据传输趋势失败", e);
            return Result.error("获取数据传输趋势失败: " + e.getMessage());
        }
    }

    /**
     * 获取连接器健康分布
     */
    @GetMapping("/connector-health")
    @Operation(summary = "获取连接器健康分布")
    public Result<Map<String, Integer>> getConnectorHealth() {
        try {
            return Result.ok(dashboardService.getConnectorHealth());
        } catch (Exception e) {
            log.error("获取连接器健康分布失败", e);
            return Result.error("获取连接器健康分布失败: " + e.getMessage());
        }
    }

    /**
     * 获取TOP连接器
     */
    @GetMapping("/top-connectors")
    @Operation(summary = "获取TOP连接器")
    public Result<List<DashboardStatisticsVO>> getTopConnectors(@RequestParam(defaultValue = "10") int limit) {
        try {
            return Result.ok(dashboardService.getTopConnectors(limit));
        } catch (Exception e) {
            log.error("获取TOP连接器失败", e);
            return Result.error("获取TOP连接器失败: " + e.getMessage());
        }
    }

    /**
     * 获取任务类型分布
     */
    @GetMapping("/task-distribution")
    @Operation(summary = "获取任务类型分布")
    public Result<Map<String, Integer>> getTaskDistribution() {
        try {
            return Result.ok(dashboardService.getTaskDistribution());
        } catch (Exception e) {
            log.error("获取任务类型分布失败", e);
            return Result.error("获取任务类型分布失败: " + e.getMessage());
        }
    }

    /**
     * 获取运行中任务列表
     */
    @GetMapping("/running-tasks")
    @Operation(summary = "获取运行中任务列表")
    public Result<List<DashboardRunningTaskVO>> getRunningTasks(@RequestParam(defaultValue = "10") int limit) {
        try {
            return Result.ok(dashboardService.getRunningTasks(limit));
        } catch (Exception e) {
            log.error("获取运行中任务列表失败", e);
            return Result.error("获取运行中任务列表失败: " + e.getMessage());
        }
    }

    /**
     * 获取失败任务列表
     */
    @GetMapping("/failed-tasks")
    @Operation(summary = "获取失败任务列表")
    public Result<List<DashboardFailedTaskVO>> getFailedTasks(@RequestParam(defaultValue = "10") int limit) {
        try {
            return Result.ok(dashboardService.getFailedTasks(limit));
        } catch (Exception e) {
            log.error("获取失败任务列表失败", e);
            return Result.error("获取失败任务列表失败: " + e.getMessage());
        }
    }
}
