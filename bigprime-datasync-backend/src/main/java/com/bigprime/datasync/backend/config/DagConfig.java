package com.bigprime.datasync.backend.config;

import com.bigprime.datasync.dag.core.builder.ActionRegistry;
import com.bigprime.datasync.dag.core.operator.IOperator;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Map;

/**
 * DAG配置类
 * <p>
 * 配置DAG引擎所需的核心组件
 * </p>
 * 
 * Created by BigPrime DataSync Team
 */
@Slf4j
@Configuration
public class DagConfig {

    @Autowired
    private ApplicationContext applicationContext;

    /**
     * 配置ActionRegistry为Spring Bean
     * ActionRegistry本身是单例模式，这里将其注册到Spring容器以便注入使用
     * 并自动扫描注册所有 IOperator 实现类
     */
    @Bean
    public ActionRegistry actionRegistry() {
        log.info("初始化ActionRegistry...");
        ActionRegistry registry = ActionRegistry.getInstance();
        
        // 自动扫描并注册所有 IOperator 实现类
        Map<String, IOperator> actionBeans = applicationContext.getBeansOfType(IOperator.class);
        log.info("发现 {} 个 IOperator 实现类", actionBeans.size());
        
        // 同时将 Bean 实例保存到 ApplicationContext 以便 DagBuilder 获取
        for (Map.Entry<String, IOperator> entry : actionBeans.entrySet()) {
            IOperator action = entry.getValue();
            String actionClass = action.getClass().getName();
            
            // 使用完整类名作为 actionType
            registry.register(actionClass, (Class<? extends IOperator>) action.getClass());
            log.info("自动注册 Action: {}", actionClass);
        }
        
        log.info("ActionRegistry初始化完成，共注册 {} 个 Action", actionBeans.size());
        return registry;
    }
}
