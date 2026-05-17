package com.bigprime.datasync.backend.gateway.service;

import com.bigprime.datasync.backend.gateway.entity.GatewayReadRuleEntity;
import com.bigprime.datasync.backend.gateway.repository.GatewayReadRuleRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 网关读取规则服务
 * 
 * @author bigprime
 * @version 1.0
 */
@Slf4j
@Service
@AllArgsConstructor
public class GatewayReadRuleService {
    
    private final GatewayReadRuleRepository readRuleRepository;
    
    /**
     * 创建读取规则
     */
    public Long createReadRule(GatewayReadRuleEntity rule) {
        log.info("创建读取规则: gatewayId={}, ruleType={}", rule.getGatewayId(), rule.getRuleType());
        
        // 设置默认值
        if (rule.getEnabled() == null) {
            rule.setEnabled(true);
        }
        if (rule.getPriority() == null) {
            rule.setPriority(100);
        }
        
        return readRuleRepository.save(rule);
    }
    
    /**
     * 更新读取规则
     */
    public void updateReadRule(GatewayReadRuleEntity rule) {
        log.info("更新读取规则: id={}, gatewayId={}", rule.getId(), rule.getGatewayId());
        readRuleRepository.update(rule);
    }
    
    /**
     * 获取规则详情
     */
    public GatewayReadRuleEntity getReadRuleById(Long id) {
        return readRuleRepository.findById(id);
    }
    
    /**
     * 根据网关ID获取读取规则列表
     */
    public List<GatewayReadRuleEntity> getReadRulesByGatewayId(Long gatewayId) {
        log.debug("查询网关读取规则: gatewayId={}", gatewayId);
        return readRuleRepository.findByGatewayId(gatewayId);
    }
    
    /**
     * 获取所有读取规则
     */
    public List<GatewayReadRuleEntity> getAllReadRules() {
        return readRuleRepository.findAll();
    }
    
    /**
     * 删除读取规则
     */
    public void deleteReadRule(Long id) {
        log.info("删除读取规则: id={}", id);
        readRuleRepository.deleteById(id);
    }
    
    /**
     * 启用/禁用读取规则
     */
    public void toggleReadRule(Long id, Boolean enabled) {
        log.info("切换读取规则状态: id={}, enabled={}", id, enabled);
        readRuleRepository.updateEnabled(id, enabled);
    }
    
    /**
     * 根据网关ID删除所有读取规则
     */
    public void deleteReadRulesByGatewayId(Long gatewayId) {
        log.info("删除网关所有读取规则: gatewayId={}", gatewayId);
        
        List<GatewayReadRuleEntity> rules = readRuleRepository.findByGatewayId(gatewayId);
        for (GatewayReadRuleEntity rule : rules) {
            readRuleRepository.deleteById(rule.getId());
        }
    }
    
    /**
     * 批量创建读取规则
     */
    public void batchCreateReadRules(List<GatewayReadRuleEntity> rules) {
        log.info("批量创建读取规则: count={}", rules.size());
        
        for (GatewayReadRuleEntity rule : rules) {
            createReadRule(rule);
        }
    }
    
    /**
     * 获取启用的读取规则
     */
    public List<GatewayReadRuleEntity> getEnabledReadRules(Long gatewayId) {
        log.debug("查询启用的读取规则: gatewayId={}", gatewayId);
        
        List<GatewayReadRuleEntity> allRules = readRuleRepository.findByGatewayId(gatewayId);
        return allRules.stream()
                .filter(rule -> rule.getEnabled() != null && rule.getEnabled())
                .sorted((r1, r2) -> {
                    int p1 = r1.getPriority() != null ? r1.getPriority() : 100;
                    int p2 = r2.getPriority() != null ? r2.getPriority() : 100;
                    return Integer.compare(p1, p2);
                })
                .collect(java.util.stream.Collectors.toList());
    }
}
