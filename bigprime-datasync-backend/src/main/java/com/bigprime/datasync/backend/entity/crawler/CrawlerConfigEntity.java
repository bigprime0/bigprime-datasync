package com.bigprime.datasync.backend.entity.crawler;

import com.bigprime.datasync.backend.entity.crawler.proxy.CrawlerConfigEntityProxy;
import com.easy.query.core.annotation.Column;
import com.easy.query.core.annotation.EntityProxy;
import com.easy.query.core.annotation.Table;
import com.easy.query.core.proxy.ProxyEntityAvailable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

/**
 * 爬虫配置实体
 * KV形式存储各类配置
 * 
 * @author bigprime
 * @version 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityProxy
@Table("data_crawler_config")
public class CrawlerConfigEntity implements ProxyEntityAvailable<CrawlerConfigEntity, CrawlerConfigEntityProxy> {

    /**
     * 主键ID
     */
    @Column(primaryKey = true)
    private String id;

    /**
     * 配置键
     * 示例：PLAYWRIGHT_CONNECTOR, ENABLE_PLAYWRIGHT, RENDER_WAIT_TIME, RENDER_TIMEOUT
     */
    private String configKey;

    /**
     * 配置值
     * 示例：连接器ID、true/false、2000、30000
     */
    private String configValue;

    /**
     * 扩展字段1
     * 根据具体配置类型使用，如：连接器名称、配置分类等
     */
    private String extend1;

    /**
     * 扩展字段2
     * 根据具体配置类型使用
     */
    private String extend2;

    /**
     * 扩展字段3
     * 根据具体配置类型使用
     */
    private String extend3;

    /**
     * 配置说明
     */
    private String description;

    /**
     * 配置状态: ACTIVE(启用), INACTIVE(禁用)
     */
    private String status;

    /**
     * 创建者
     */
    private String creator;

    /**
     * 创建者名称
     */
    private String creatorName;

    /**
     * 创建时间
     */
    private Date createTime;

    /**
     * 更新者
     */
    private String updater;

    /**
     * 更新者名称
     */
    private String updaterName;

    /**
     * 更新时间
     */
    private Date updateTime;

    /**
     * 逻辑删除标识(0-未删除, 1-已删除)
     */
    private Integer deleted;
}
