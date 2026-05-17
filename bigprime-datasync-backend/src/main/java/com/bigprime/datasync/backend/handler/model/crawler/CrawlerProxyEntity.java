package com.bigprime.datasync.backend.handler.model.crawler;

import com.bigprime.datasync.backend.handler.model.crawler.proxy.CrawlerProxyEntityProxy;
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
 * 爬虫代理IP实体
 * 
 * @author bigprime
 * @version 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityProxy
@Table("data_crawler_proxy")
public class CrawlerProxyEntity implements ProxyEntityAvailable<CrawlerProxyEntity, CrawlerProxyEntityProxy> {

    /**
     * 主键ID
     */
    @Column(primaryKey = true)
    private String id;

    /**
     * 代理名称
     */
    private String name;

    /**
     * 代理服务器地址
     */
    private String host;

    /**
     * 代理服务器端口
     */
    private Integer port;

    /**
     * 代理类型: HTTP, HTTPS, SOCKS4, SOCKS5
     */
    private String proxyType;

    /**
     * 用户名(如需认证)
     */
    private String username;

    /**
     * 密码(如需认证)
     */
    private String password;

    /**
     * 代理状态: ACTIVE(可用), INACTIVE(不可用), TESTING(检测中)
     */
    private String status;

    /**
     * 地区/国家
     */
    private String region;

    /**
     * 供应商
     */
    private String provider;

    /**
     * 响应时间(毫秒)
     */
    private Integer responseTime;

    /**
     * 成功次数
     */
    private Long successCount;

    /**
     * 失败次数
     */
    private Long failureCount;

    /**
     * 最后成功时间
     */
    private Date lastSuccessTime;

    /**
     * 最后失败时间
     */
    private Date lastFailureTime;

    /**
     * 最后检测时间
     */
    private Date lastCheckTime;

    /**
     * 优先级(数值越大优先级越高)
     */
    private Integer priority;

    /**
     * 备注
     */
    private String remark;

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
