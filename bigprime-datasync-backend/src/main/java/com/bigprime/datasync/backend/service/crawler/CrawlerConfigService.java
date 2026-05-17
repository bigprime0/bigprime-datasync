package com.bigprime.datasync.backend.service.crawler;

import cn.hutool.core.util.IdUtil;
import cn.hutool.core.util.StrUtil;
import com.bigprime.datasync.core.config.BigprimeEntityQuery;
import com.bigprime.datasync.backend.entity.crawler.CrawlerConfigEntity;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 爬虫配置服务
 * 使用数据库KV形式存储配置
 * 
 * @author bigprime
 * @version 1.0
 */
@Slf4j
@Service
@AllArgsConstructor
public class CrawlerConfigService {

    private final BigprimeEntityQuery proxy;

    // 配置键常量
    private static final String KEY_PLAYWRIGHT_CONNECTOR = "PLAYWRIGHT_CONNECTOR";
    private static final String KEY_ENABLE_PLAYWRIGHT = "ENABLE_PLAYWRIGHT";
    private static final String KEY_RENDER_WAIT_TIME = "RENDER_WAIT_TIME";
    private static final String KEY_RENDER_TIMEOUT = "RENDER_TIMEOUT";

    /**
     * 获取所有配置
     */
    public Map<String, Object> getConfig() {
        try {
            List<CrawlerConfigEntity> configs = proxy.queryable(CrawlerConfigEntity.class)
                    .where(c -> {
                        c.status().eq("ACTIVE");
                        c.deleted().eq(0);
                    })
                    .toList();

            Map<String, Object> result = new HashMap<>();
            
            // 转换为Map
            for (CrawlerConfigEntity config : configs) {
                String key = config.getConfigKey();
                String value = config.getConfigValue();
                
                // 根据配置类型转换值
                switch (key) {
                    case KEY_PLAYWRIGHT_CONNECTOR:
                        result.put("defaultPlaywrightConnector", StrUtil.isNotBlank(value) ? value : "");
                        break;
                    case KEY_ENABLE_PLAYWRIGHT:
                        result.put("enablePlaywright", Boolean.parseBoolean(value));
                        break;
                    case KEY_RENDER_WAIT_TIME:
                        result.put("renderWaitTime", StrUtil.isNotBlank(value) ? Integer.parseInt(value) : 2000);
                        break;
                    case KEY_RENDER_TIMEOUT:
                        result.put("renderTimeout", StrUtil.isNotBlank(value) ? Integer.parseInt(value) : 30000);
                        break;
                }
            }

            // 填充默认值
            result.putIfAbsent("defaultPlaywrightConnector", "");
            result.putIfAbsent("enablePlaywright", false);
            result.putIfAbsent("renderWaitTime", 2000);
            result.putIfAbsent("renderTimeout", 30000);

            return result;

        } catch (Exception e) {
            log.error("读取配置失败", e);
            return getDefaultConfig();
        }
    }

    /**
     * 保存配置
     */
    @Transactional(rollbackFor = Exception.class)
    public void saveConfig(Map<String, Object> config) {
        try {
            // 保存Playwright连接器
            saveOrUpdateConfig(
                KEY_PLAYWRIGHT_CONNECTOR,
                config.getOrDefault("defaultPlaywrightConnector", "").toString(),
                "默认Playwright连接器ID"
            );

            // 保存启用Playwright
            saveOrUpdateConfig(
                KEY_ENABLE_PLAYWRIGHT,
                String.valueOf(config.getOrDefault("enablePlaywright", false)),
                "是否启用Playwright渲染"
            );

            // 保存渲染等待时间
            saveOrUpdateConfig(
                KEY_RENDER_WAIT_TIME,
                String.valueOf(config.getOrDefault("renderWaitTime", 2000)),
                "渲染等待时间(毫秒)"
            );

            // 保存渲染超时
            saveOrUpdateConfig(
                KEY_RENDER_TIMEOUT,
                String.valueOf(config.getOrDefault("renderTimeout", 30000)),
                "渲染超时(毫秒)"
            );

            log.info("爬虫配置保存成功");

        } catch (Exception e) {
            log.error("保存配置失败", e);
            throw new RuntimeException("保存配置失败: " + e.getMessage(), e);
        }
    }

    /**
     * 保存或更新单个配置
     */
    private void saveOrUpdateConfig(String configKey, String configValue, String description) {
        CrawlerConfigEntity existingConfig = proxy.queryable(CrawlerConfigEntity.class)
                .where(c -> {
                    c.configKey().eq(configKey);
                    c.deleted().eq(0);
                })
                .firstOrNull();

        if (existingConfig != null) {
            // 更新
            existingConfig.setConfigValue(configValue);
            existingConfig.setUpdateTime(new Date());
            proxy.updatable(existingConfig).executeRows();
        } else {
            // 新增
            CrawlerConfigEntity newConfig = new CrawlerConfigEntity();
            newConfig.setId(IdUtil.getSnowflakeNextIdStr());
            newConfig.setConfigKey(configKey);
            newConfig.setConfigValue(configValue);
            newConfig.setDescription(description);
            newConfig.setStatus("ACTIVE");
            newConfig.setCreateTime(new Date());
            newConfig.setUpdateTime(new Date());
            newConfig.setDeleted(0);
            proxy.insertable(newConfig).executeRows();
        }
    }

    /**
     * 根据Key获取配置值
     */
    public String getConfigValue(String configKey) {
        CrawlerConfigEntity config = proxy.queryable(CrawlerConfigEntity.class)
                .where(c -> {
                    c.configKey().eq(configKey);
                    c.status().eq("ACTIVE");
                    c.deleted().eq(0);
                })
                .firstOrNull();
        
        return config != null ? config.getConfigValue() : null;
    }

    /**
     * 获取Playwright连接器ID
     */
    public String getPlaywrightConnectorId() {
        Map<String, Object> config = getConfig();
        boolean enablePlaywright = Boolean.TRUE.equals(config.get("enablePlaywright"));
        if (enablePlaywright) {
            String connectorId = (String) config.get("defaultPlaywrightConnector");
            if (StrUtil.isNotBlank(connectorId)) {
                log.debug("使用配置的Playwright连接器: {}", connectorId);
                return connectorId;
            }
        }
        return null;
    }

    /**
     * 获取默认配置
     */
    private Map<String, Object> getDefaultConfig() {
        Map<String, Object> config = new HashMap<>();
        config.put("defaultPlaywrightConnector", "");
        config.put("enablePlaywright", false);
        config.put("renderWaitTime", 2000);
        config.put("renderTimeout", 30000);
        return config;
    }
}
