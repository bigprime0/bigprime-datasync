package com.bigprime.datasync.backend.service.trigger;

import cn.hutool.core.util.StrUtil;
import cn.hutool.json.JSONUtil;
import com.bigprime.datasync.core.model.MyPageResult;
import com.bigprime.datasync.backend.handler.model.trigger.DagTrigger;
import com.bigprime.datasync.backend.handler.trigger.DagTriggerHandler;
import com.bigprime.datasync.dag.service.DagExecutionService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.support.CronExpression;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * DAG触发器服务
 */
@Slf4j
@Service
@AllArgsConstructor
public class DagTriggerService {
    
    private final DagTriggerHandler triggerHandler;
    private final DagExecutionService dagExecutionService;

    /**
     * 创建触发器
     */
    public Long create(DagTrigger trigger) {
        // 参数校验
        validateTrigger(trigger);
        
        // 计算下一次触发时间
        if ("CRON".equals(trigger.getType()) && StrUtil.isNotBlank(trigger.getCronExpression())) {
            trigger.setNextFireTime(calculateNextFireTime(trigger.getCronExpression()));
        }
        
        // 初始化统计字段
        if (trigger.getFireCount() == null) {
            trigger.setFireCount(0L);
        }
        if (trigger.getEnabled() == null) {
            trigger.setEnabled(false);
        }
        
        triggerHandler.save(trigger);
        return trigger.getId();
    }
    
    /**
     * 更新触发器
     */
    public void update(DagTrigger trigger) {
        validateTrigger(trigger);
        
        // 如果cron表达式变更，重新计算下一次触发时间
        if ("CRON".equals(trigger.getType()) && StrUtil.isNotBlank(trigger.getCronExpression())) {
            trigger.setNextFireTime(calculateNextFireTime(trigger.getCronExpression()));
        }
        
        triggerHandler.update(trigger);
    }
    
    /**
     * 启用触发器
     */
    public void enable(Long triggerId) {
        DagTrigger trigger = triggerHandler.getById(triggerId);
        if (trigger == null) {
            throw new RuntimeException("触发器不存在: " + triggerId);
        }
        
        trigger.setEnabled(true);
        
        // 重新计算下一次触发时间
        if ("CRON".equals(trigger.getType())) {
            trigger.setNextFireTime(calculateNextFireTime(trigger.getCronExpression()));
        }
        
        triggerHandler.update(trigger);
        log.info("启用触发器: id={}, name={}", triggerId, trigger.getName());
    }
    
    /**
     * 停用触发器
     */
    public void disable(Long triggerId) {
        DagTrigger trigger = triggerHandler.getById(triggerId);
        if (trigger == null) {
            throw new RuntimeException("触发器不存在: " + triggerId);
        }
        
        trigger.setEnabled(false);
        triggerHandler.update(trigger);
        log.info("停用触发器: id={}, name={}", triggerId, trigger.getName());
    }
    
    /**
     * 立即触发一次（手动触发）
     */
    public String fireNow(Long triggerId) {
        DagTrigger trigger = triggerHandler.getById(triggerId);
        if (trigger == null) {
            throw new RuntimeException("触发器不存在: " + triggerId);
        }
        
        log.info("手动触发DAG: triggerId={}, dagDefinitionId={}", triggerId, trigger.getDagDefinitionId());
        
        // 执行触发逻辑
        return executeTrigger(trigger, true);
    }
    
    /**
     * 执行触发器（提交DAG执行）
     * 
     * @param trigger 触发器
     * @param isManual 是否手动触发
     * @return 执行ID，如果被并发策略拦截则返回null
     */
    public String executeTrigger(DagTrigger trigger, boolean isManual) {
        // 并发策略检查
        if (!isManual && !checkConcurrencyPolicy(trigger)) {
            log.warn("触发器被并发策略拦截: triggerId={}, policy={}", 
                    trigger.getId(), trigger.getConcurrencyPolicy());
            return null;
        }
        
        // 构造执行上下文
        Map<String, Object> executionContext = buildExecutionContext(trigger, isManual);
        
        // 调用DAG执行入口，传入触发器信息
        String executionId = dagExecutionService.createExecution(
                trigger.getDagDefinitionId(),
                "Trigger-" + trigger.getName(),
                "由触发器触发: " + trigger.getName(),
                Integer.valueOf(0),
                JSONUtil.toJsonStr(executionContext)
        );
        
        // 更新触发器统计信息
        trigger.setLastFireTime(new Date());
        trigger.setFireCount(trigger.getFireCount() + 1);
        
        // 如果是定时触发，计算下一次触发时间
        if ("CRON".equals(trigger.getType()) && !isManual) {
            trigger.setNextFireTime(calculateNextFireTime(trigger.getCronExpression()));
        }
        
        triggerHandler.update(trigger);
        
        log.info("触发器执行成功: triggerId={}, executionId={}", trigger.getId(), executionId);
        return executionId;
    }
    
    /**
     * 分页查询触发器
     */
    public MyPageResult<DagTrigger> getPage(String search, Integer page, Integer limit) {
        return triggerHandler.getPage(search, page, limit);
    }
    
    /**
     * 根据DAG定义ID查询触发器列表
     */
    public List<DagTrigger> listByDagDefinitionId(String dagDefinitionId) {
        return triggerHandler.listByDagDefinitionId(dagDefinitionId);
    }
    
    /**
     * 根据ID查询触发器
     */
    public DagTrigger getById(Long id) {
        return triggerHandler.getById(id);
    }
    
    /**
     * 删除触发器
     */
    public void deleteById(Long id) {
        triggerHandler.deleteById(id);
    }
    
    /**
     * 预览Cron表达式的下N次触发时间
     */
    public List<Date> previewNextFireTimes(String cronExpression, int count) {
        try {
            CronExpression cron = CronExpression.parse(cronExpression);
            LocalDateTime now = LocalDateTime.now();
            List<Date> times = new java.util.ArrayList<>();
            
            for (int i = 0; i < count; i++) {
                LocalDateTime next = cron.next(now);
                if (next == null) {
                    break;
                }
                times.add(Date.from(next.atZone(ZoneId.systemDefault()).toInstant()));
                now = next;
            }
            
            return times;
        } catch (Exception e) {
            throw new RuntimeException("Cron表达式无效: " + e.getMessage());
        }
    }
    
    // ============= 私有方法 =============
    
    /**
     * 参数校验
     */
    private void validateTrigger(DagTrigger trigger) {
        if (StrUtil.isBlank(trigger.getDagDefinitionId())) {
            throw new IllegalArgumentException("DAG定义ID不能为空");
        }
        if (StrUtil.isBlank(trigger.getName())) {
            throw new IllegalArgumentException("触发器名称不能为空");
        }
        if (StrUtil.isBlank(trigger.getType())) {
            throw new IllegalArgumentException("触发器类型不能为空");
        }
        
        // CRON类型必须有cron表达式
        if ("CRON".equals(trigger.getType())) {
            if (StrUtil.isBlank(trigger.getCronExpression())) {
                throw new IllegalArgumentException("定时触发器必须配置Cron表达式");
            }
            // 校验cron表达式合法性
            try {
                CronExpression.parse(trigger.getCronExpression());
            } catch (Exception e) {
                throw new IllegalArgumentException("Cron表达式格式错误: " + e.getMessage());
            }
        }
        
        // 并发策略校验
        if (StrUtil.isNotBlank(trigger.getConcurrencyPolicy())) {
            if (!List.of("FORBID", "REPLACE", "ALLOW").contains(trigger.getConcurrencyPolicy())) {
                throw new IllegalArgumentException("并发策略无效，必须是FORBID、REPLACE或ALLOW");
            }
        }
    }
    
    /**
     * 计算下一次触发时间
     */
    private Date calculateNextFireTime(String cronExpression) {
        try {
            CronExpression cron = CronExpression.parse(cronExpression);
            LocalDateTime next = cron.next(LocalDateTime.now());
            if (next == null) {
                return null;
            }
            return Date.from(next.atZone(ZoneId.systemDefault()).toInstant());
        } catch (Exception e) {
            log.error("计算下一次触发时间失败: cronExpression={}", cronExpression, e);
            return null;
        }
    }
    
    /**
     * 检查并发策略
     */
    private boolean checkConcurrencyPolicy(DagTrigger trigger) {
        String policy = trigger.getConcurrencyPolicy();
        if (StrUtil.isBlank(policy)) {
            policy = "FORBID"; // 默认不允许并发
        }
        
        // 查询DAG是否有运行中的执行
        List<com.bigprime.datasync.dag.entity.DagExecutionRecordEntity> runningExecutions = 
                dagExecutionService.listRunningExecutions();
        
        long runningCount = runningExecutions.stream()
                .filter(e -> trigger.getDagDefinitionId().equals(e.getDagId()))
                .count();
        
        switch (policy) {
            case "FORBID":
                // 有运行中的则不允许触发
                return runningCount == 0;
                
            case "REPLACE":
                // 取消所有运行中的，允许新的触发
                if (runningCount > 0) {
                    runningExecutions.stream()
                            .filter(e -> trigger.getDagDefinitionId().equals(e.getDagId()))
                            .forEach(e -> {
                                try {
                                    dagExecutionService.cancelExecution(e.getId());
                                } catch (Exception ex) {
                                    log.error("取消执行失败: executionId={}", e.getId(), ex);
                                }
                            });
                }
                return true;
                
            case "ALLOW":
                // 检查是否超过最大并行数
                Integer maxParallel = trigger.getMaxParallel();
                if (maxParallel == null || maxParallel <= 0) {
                    maxParallel = 3; // 默认最多3个并行
                }
                return runningCount < maxParallel;
                
            default:
                return false;
        }
    }
    
    /**
     * 构造执行上下文
     */
    private Map<String, Object> buildExecutionContext(DagTrigger trigger, boolean isManual) {
        Map<String, Object> context = new HashMap<>();
        
        // 触发器信息
        context.put("triggerId", trigger.getId());
        context.put("triggerName", trigger.getName());
        context.put("triggerType", trigger.getType());
        context.put("triggerTime", new Date());
        context.put("isManual", isManual);
        
        // 合并触发器预设的上下文
        if (StrUtil.isNotBlank(trigger.getTriggerContext())) {
            try {
                Map<String, Object> presetContext = JSONUtil.toBean(trigger.getTriggerContext(), Map.class);
                context.putAll(presetContext);
            } catch (Exception e) {
                log.warn("解析触发器上下文失败: triggerId={}", trigger.getId(), e);
            }
        }
        
        return context;
    }
}
