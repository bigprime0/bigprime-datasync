package com.bigprime.datasync.backend.handler.model.crawler;

import com.bigprime.datasync.backend.handler.model.crawler.proxy.CrawlerRobotsCacheEntityProxy;
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
 * Robots协议缓存实体
 * 
 * @author bigprime
 * @version 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityProxy
@Table("data_crawler_robots_cache")
public class CrawlerRobotsCacheEntity implements ProxyEntityAvailable<CrawlerRobotsCacheEntity, CrawlerRobotsCacheEntityProxy> {

    /**
     * 主键ID
     */
    @Column(primaryKey = true)
    private String id;

    /**
     * 域名
     */
    private String domain;

    /**
     * robots.txt内容
     */
    private String robotsContent;

    /**
     * 是否允许爬取
     */
    private Boolean allowed;

    /**
     * 爬取延迟(毫秒)
     */
    private Long crawlDelay;

    /**
     * User-Agent
     */
    private String userAgent;

    /**
     * robots.txt URL
     */
    private String robotsUrl;

    /**
     * HTTP状态码
     */
    private Integer statusCode;

    /**
     * 缓存时间
     */
    private Date cacheTime;

    /**
     * 过期时间
     */
    private Date expireTime;

    /**
     * 创建时间
     */
    private Date createTime;

    /**
     * 更新时间
     */
    private Date updateTime;
}
