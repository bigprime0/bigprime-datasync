package com.bigprime.datasync.backend.service.worker;

import com.bigprime.cluster.constant.WorkerStatus;
import com.bigprime.cluster.dto.WorkerNodeDTO;
import com.bigprime.cluster.entity.WorkerNodeEntity;
import com.bigprime.cluster.repository.WorkerNodeRepository;
import com.bigprime.cluster.service.WorkerNodeService;
import com.bigprime.datasync.backend.config.LoadBalanceConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.net.URI;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

/**
 * Worker节点选择器 - 负载均衡
 * 
 * @author bigprime
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class WorkerSelector {

    private final WorkerNodeService workerNodeService;
    private final WorkerNodeRepository workerNodeRepository;
    private final LoadBalanceConfig loadBalanceConfig;
    private final RestTemplate restTemplate = new RestTemplate();
    
    // 轮询计数器
    private final AtomicInteger roundRobinCounter = new AtomicInteger(0);
    
    // Worker失败计数（用于告警）
    private final Map<String, AtomicInteger> failureCountMap = new ConcurrentHashMap<>();
    
    /**
     * 负载均衡策略枚举
     */
    public enum LoadBalanceStrategy {
        /**
         * 随机选择
         */
        RANDOM,
        
        /**
         * 轮询选择
         */
        ROUND_ROBIN,
        
        /**
         * 最少任务优先
         */
        LEAST_ACTIVE,
        
        /**
         * 加权负载均衡
         */
        WEIGHTED,
        
        /**
         * 基于资源使用率的智能调度
         */
        RESOURCE_BASED
    }
    
    /**
     * 根据策略选择Worker
     * 
     * @param strategy 负载均衡策略
     * @return Worker节点，如果没有可用节点返回null
     */
    public WorkerNodeDTO selectWorker(LoadBalanceStrategy strategy) {
        // 获取所有在线且启用的Worker节点
        List<WorkerNodeDTO> availableWorkers = getAvailableWorkers();
        
        if (availableWorkers.isEmpty()) {
            log.warn("没有可用的Worker节点");
            return null;
        }
        
        WorkerNodeDTO selected = null;
        switch (strategy) {
            case RANDOM:
                selected = selectRandomWorker(availableWorkers);
                break;
            case ROUND_ROBIN:
                selected = selectRoundRobinWorker(availableWorkers);
                break;
            case LEAST_ACTIVE:
                selected = selectLeastActiveWorker(availableWorkers);
                break;
            case WEIGHTED:
                selected = selectWeightedWorker(availableWorkers);
                break;
            case RESOURCE_BASED:
                selected = selectResourceBasedWorker(availableWorkers);
                break;
            default:
                selected = selectLeastActiveWorker(availableWorkers);
        }
        
        if (selected != null) {
            log.info("选择Worker节点: id={}, host={}:{}, strategy={}, activeTasks={}/{}, score={}", 
                    selected.getId(), selected.getHost(), selected.getPort(), strategy,
                    selected.getActiveTasks(), selected.getMaxConcurrentTasks(),
                    calculateWorkerScore(selected));
        }
        
        return selected;
    }
    
    /**
     * 使用默认策略（从配置读取）选择Worker
     * 带故障转移：如果选中Worker不可用，自动重试。
     * 若无在线节点，则对OFFLINE节点做探活恢复后重试——用于 backend 重启后的自动恢复场景。
     */
    public WorkerNodeDTO selectWorker() {
        LoadBalanceStrategy strategy = LoadBalanceStrategy.valueOf(
                loadBalanceConfig.getStrategy().toUpperCase());
        WorkerNodeDTO selected = selectWorkerWithRetry(strategy, loadBalanceConfig.getMaxRetry());
        if (selected != null) {
            return selected;
        }
        // 无可用 ONLINE 节点：尝试对 OFFLINE 节点探活，恢复后重新选择
        int recovered = tryRecoverOfflineWorkers();
        if (recovered > 0) {
            log.info("探活恢复 {} 个 OFFLINE Worker 节点，重新尝试选择", recovered);
            selected = selectWorkerWithRetry(strategy, loadBalanceConfig.getMaxRetry());
        }
        return selected;
    }

    /**
     * 对所有 OFFLINE 且 enabled=true 的节点发起健康检查，健康则恢复为 ONLINE。
     * 主要用于 backend 重启后、心跳尚未到达前的自动恢复。
     *
     * @return 成功恢复的节点数量
     */
    public int tryRecoverOfflineWorkers() {
        List<WorkerNodeEntity> offlineNodes = workerNodeRepository.findByStatus(WorkerStatus.OFFLINE);
        if (offlineNodes.isEmpty()) {
            return 0;
        }
        int recovered = 0;
        LocalDateTime now = LocalDateTime.now();
        for (WorkerNodeEntity node : offlineNodes) {
            if (!Boolean.TRUE.equals(node.getEnabled())) {
                continue;
            }
            // 构造 DTO 仅用于健康检查
            WorkerNodeDTO dto = workerNodeService.getWorkerNodeById(node.getId());
            if (dto == null) {
                continue;
            }
            if (checkWorkerHealth(dto)) {
                node.setStatus(WorkerStatus.ONLINE);
                node.setLastHeartbeatTime(now);
                node.setUpdateTime(now);
                workerNodeRepository.updateById(node);
                log.info("探活恢复 Worker 节点: id={}, host={}:{}", node.getId(), node.getHost(), node.getPort());
                recovered++;
            }
        }
        return recovered;
    }
    
    /**
     * 选择Worker并支持故障转移
     * 
     * @param strategy 负载均衡策略
     * @param maxRetry 最大重试次数
     * @return Worker节点
     */
    public WorkerNodeDTO selectWorkerWithRetry(LoadBalanceStrategy strategy, int maxRetry) {
        int retryCount = 0;
        WorkerNodeDTO selectedWorker = null;
        
        while (retryCount < maxRetry) {
            selectedWorker = selectWorker(strategy);
            if (selectedWorker == null) {
                log.warn("没有可用Worker节点，第{}\u6b21尝试", retryCount + 1);
                retryCount++;
                continue;
            }
            
            // 健康检查
            if (checkWorkerHealth(selectedWorker)) {
                return selectedWorker;
            }
            
            log.warn("Worker节点健康检查失败，尝试选择其他节点: id={}, 第{}\u6b21尝试", 
                    selectedWorker.getId(), retryCount + 1);
            retryCount++;
        }
        
        // 所有重试都失败，返回最后一次选择的Worker（即使健康检查失败）
        log.error("所有Worker节点健康检查失败，将尝试使用最后选择的节点: {}", 
                selectedWorker != null ? selectedWorker.getId() : "null");
        return selectedWorker;
    }
    
    /**
     * Worker健康检查
     * 
     * @param worker Worker节点
     * @return 是否健康
     */
    public boolean checkWorkerHealth(WorkerNodeDTO worker) {
        if (worker == null) {
            return false;
        }
            
        // 如果禁用健康检查，直接返回true
        if (!loadBalanceConfig.getHealthCheck()) {
            return true;
        }
            
        try {
            String healthUrl = buildWorkerUrl(worker) + "/actuator/health";
                
            // 设置超时时间（从配置读取）
            int timeout = loadBalanceConfig.getHealthCheckTimeout() * 1000;
            SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
            requestFactory.setConnectTimeout(timeout);
            requestFactory.setReadTimeout(timeout);
            restTemplate.setRequestFactory(requestFactory);
                
            String response = restTemplate.getForObject(healthUrl, String.class);
                
            // 简单判断：响应包含"UP"即为健康
            boolean healthy = response != null && response.contains("UP");
                
            if (healthy) {
                log.debug("Worker健康检查成功: id={}, url={}", worker.getId(), healthUrl);
                // 清除失败计数
                resetFailureCount(worker.getId());
            } else {
                log.warn("Worker健康检查失败: id={}, response={}", worker.getId(), response);
                // 增加失败计数并检查是否需要告警
                incrementFailureCount(worker);
            }
                
            return healthy;
        } catch (Exception e) {
            log.error("Worker健康检查异常: id={}, error={}", worker.getId(), e.getMessage());
            // 增加失败计数并检查是否需要告警
            incrementFailureCount(worker);
            return false;
        }
    }
    
    /**
     * 增加Worker失败计数，并检查是否需要告警
     */
    private void incrementFailureCount(WorkerNodeDTO worker) {
        String workerId = worker.getId();
        AtomicInteger count = failureCountMap.computeIfAbsent(workerId, k -> new AtomicInteger(0));
        int currentCount = count.incrementAndGet();
        
        // 检查是否达到告警阈值
        if (currentCount >= loadBalanceConfig.getAlertThreshold() && loadBalanceConfig.getAlertEnabled()) {
            sendWorkerUnavailableAlert(worker, currentCount);
        }
    }
    
    /**
     * 重置Worker失败计数
     */
    private void resetFailureCount(String workerId) {
        failureCountMap.remove(workerId);
    }
    
    /**
     * 发送Worker不可用告警（简化版，使用日志记录）
     */
    private void sendWorkerUnavailableAlert(WorkerNodeDTO worker, int failureCount) {
        // TODO: 集成告警中心 API
        log.error("===========================================" +
                "\n[告警] Worker节点连续健康检查失败" +
                "\n  Worker ID: {}" +
                "\n  Worker名称: {}" +
                "\n  主机地址: {}:{}" +
                "\n  失败次数: {}" +
                "\n  建议: 请检查Worker节点状态或网络连接" +
                "\n==========================================",
                worker.getId(),
                worker.getName(),
                worker.getHost(),
                worker.getPort(),
                failureCount
        );
            
        // 发送告警后重置计数，避免重复告警
        resetFailureCount(worker.getId());
    }
    
    /**
     * 获取所有可用的Worker节点
     * 条件：在线 且 启用 且 有剩余任务容量（考虑预留）
     */
    private List<WorkerNodeDTO> getAvailableWorkers() {
        List<WorkerNodeDTO> onlineWorkers = workerNodeService.getOnlineWorkers();
        
        // 过滤：启用 且 有剩余容量
        return onlineWorkers.stream()
                .filter(w -> Boolean.TRUE.equals(w.getEnabled()))
                .filter(w -> {
                    int activeTasks = w.getActiveTasks() != null ? w.getActiveTasks() : 0;
                    int maxTasks = w.getMaxConcurrentTasks() != null ? w.getMaxConcurrentTasks() : 10;
                    // 使用配置的容量预留机制
                    int effectiveCapacity = loadBalanceConfig.getEffectiveCapacity(maxTasks);
                    return activeTasks < effectiveCapacity;
                })
                .collect(Collectors.toList());
    }
    
    /**
     * 随机选择Worker
     */
    private WorkerNodeDTO selectRandomWorker(List<WorkerNodeDTO> workers) {
        int index = ThreadLocalRandom.current().nextInt(workers.size());
        return workers.get(index);
    }
    
    /**
     * 轮询选择Worker
     */
    private WorkerNodeDTO selectRoundRobinWorker(List<WorkerNodeDTO> workers) {
        int index = roundRobinCounter.getAndIncrement() % workers.size();
        // 防止溢出
        if (roundRobinCounter.get() > 1000000) {
            roundRobinCounter.set(0);
        }
        return workers.get(index);
    }
    
    /**
     * 选择活跃任务数最少的Worker
     */
    private WorkerNodeDTO selectLeastActiveWorker(List<WorkerNodeDTO> workers) {
        return workers.stream()
                .min(Comparator.comparingInt(w -> {
                    int activeTasks = w.getActiveTasks() != null ? w.getActiveTasks() : 0;
                    int maxTasks = w.getMaxConcurrentTasks() != null ? w.getMaxConcurrentTasks() : 10;
                    // 计算任务负载率（百分比），优先选择负载率低的
                    return (activeTasks * 100) / maxTasks;
                }))
                .orElse(null);
    }
    
    /**
     * 加权选择Worker（从数据库读取权重）
     */
    private WorkerNodeDTO selectWeightedWorker(List<WorkerNodeDTO> workers) {
        // 计算每个Worker的权重（从 Worker 实体中获取）
        List<WeightedWorker> weightedWorkers = workers.stream()
                .map(w -> {
                    // 从数据库字段获取权重，默认100
                    int weight = w.getWeight() != null ? w.getWeight() : 100;
                    return new WeightedWorker(w, weight);
                })
                .collect(Collectors.toList());
        
        // 计算总权重
        int totalWeight = weightedWorkers.stream()
                .mapToInt(ww -> ww.weight)
                .sum();
        
        if (totalWeight == 0) {
            return selectRandomWorker(workers);
        }
        
        // 随机选择（按权重）
        int randomWeight = ThreadLocalRandom.current().nextInt(totalWeight);
        int currentWeight = 0;
        
        for (WeightedWorker ww : weightedWorkers) {
            currentWeight += ww.weight;
            if (randomWeight < currentWeight) {
                log.debug("加权选择: workerId={}, weight={}, totalWeight={}", 
                        ww.worker.getId(), ww.weight, totalWeight);
                return ww.worker;
            }
        }
        
        return weightedWorkers.get(0).worker;
    }
    
    /**
     * 基于资源使用率的智能选择（综合考虑CPU、内存、任务负载、标签优先级）
     */
    private WorkerNodeDTO selectResourceBasedWorker(List<WorkerNodeDTO> workers) {
        // 计算每个Worker的综合评分
        return workers.stream()
                .min(Comparator.comparingDouble(this::calculateWorkerScore))
                .orElse(null);
    }
    
    /**
     * 计算Worker综合评分（分数越低越好）
     * 综合考虑：
     * 1. CPU使用率
     * 2. 内存使用率
     * 3. 任务负载率
     * 4. 标签优先级
     * 5. 配置权重
     */
    private double calculateWorkerScore(WorkerNodeDTO worker) {
        LoadBalanceConfig.ResourceWeight weights = loadBalanceConfig.getResourceWeight();
        
        // 1. CPU使用率得分 (0-100)
        double cpuScore = getCpuScore(worker);
        
        // 2. 内存使用率得分 (0-100)
        double memoryScore = getMemoryScore(worker);
        
        // 3. 任务负载率得分 (0-100)
        double taskLoadScore = getTaskLoadScore(worker);
        
        // 4. 综合评分 = 加权平均
        double baseScore = cpuScore * weights.getCpu() 
                + memoryScore * weights.getMemory() 
                + taskLoadScore * weights.getTaskLoad();
        
        // 5. 标签优先级调整（优先级越高，分数越低）
        int tagPriority = getMaxTagPriority(worker);
        double tagFactor = 100.0 / Math.max(tagPriority, 1);
        
        // 6. 配置权重调整（从数据库获取，权重越高，分数越低）
        int weight = worker.getWeight() != null ? worker.getWeight() : 100;
        double weightFactor = 100.0 / Math.max(weight, 1);
        
        // 7. 最终评分 = 基础分 * 标签因子 * 权重因子
        double finalScore = baseScore * tagFactor * weightFactor;
        
        log.debug("Worker评分: id={}, cpu={}, mem={}, task={}, tag={}, weight={}, final={}",
                worker.getId(), cpuScore, memoryScore, taskLoadScore, tagPriority, weight, finalScore);
        
        return finalScore;
    }
    
    /**
     * 获取CPU使用率得分
     */
    private double getCpuScore(WorkerNodeDTO worker) {
        if (worker.getCpuUsage() == null) {
            return 50.0; // 默认中等分数
        }
        double cpuUsage = worker.getCpuUsage().doubleValue();
        
        // 超过阈值的惩罚
        if (cpuUsage > loadBalanceConfig.getCpuThreshold()) {
            return 100.0 + (cpuUsage - loadBalanceConfig.getCpuThreshold());
        }
        
        return cpuUsage;
    }
    
    /**
     * 获取内存使用率得分
     */
    private double getMemoryScore(WorkerNodeDTO worker) {
        if (worker.getMemoryUsage() == null) {
            return 50.0;
        }
        double memoryUsage = worker.getMemoryUsage().doubleValue();
        
        // 超过阈值的惩罚
        if (memoryUsage > loadBalanceConfig.getMemoryThreshold()) {
            return 100.0 + (memoryUsage - loadBalanceConfig.getMemoryThreshold());
        }
        
        return memoryUsage;
    }
    
    /**
     * 获取任务负载率得分
     */
    private double getTaskLoadScore(WorkerNodeDTO worker) {
        int activeTasks = worker.getActiveTasks() != null ? worker.getActiveTasks() : 0;
        int maxTasks = worker.getMaxConcurrentTasks() != null ? worker.getMaxConcurrentTasks() : 10;
        return (activeTasks * 100.0) / maxTasks;
    }
    
    /**
     * 获取Worker最高标签优先级
     */
    private int getMaxTagPriority(WorkerNodeDTO worker) {
        if (worker.getTags() == null || worker.getTags().isEmpty()) {
            return 50; // 默认优先级
        }
        
        return worker.getTags().stream()
                .mapToInt(loadBalanceConfig::getTagPriority)
                .max()
                .orElse(50);
    }
    
    /**
     * 加权Worker包装类
     */
    private static class WeightedWorker {
        WorkerNodeDTO worker;
        int weight;
        
        WeightedWorker(WorkerNodeDTO worker, int weight) {
            this.worker = worker;
            this.weight = weight;
        }
    }
    
    /**
     * 构建Worker URL
     */
    public String buildWorkerUrl(WorkerNodeDTO worker) {
        if (worker == null) {
            return null;
        }
        return String.format("http://%s:%d", worker.getHost(), worker.getPort());
    }
    
    /**
     * 获取可用Worker数量
     */
    public int getAvailableWorkerCount() {
        return getAvailableWorkers().size();
    }
}
