package com.bigprime.datasync.backend.handler.model.crawler;

import com.bigprime.datasync.backend.handler.model.crawler.proxy.CrawlerAccountEntityProxy;
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
 * 爬虫账号池实体
 * 
 * @author bigprime
 * @version 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityProxy
@Table("data_crawler_account")
public class CrawlerAccountEntity implements ProxyEntityAvailable<CrawlerAccountEntity, CrawlerAccountEntityProxy> {

    /**
     * 主键ID
     */
    @Column(primaryKey = true)
    private String id;

    /**
     * 账号名称/标识
     */
    private String name;

    /**
     * 所属平台/网站
     */
    private String platform;

    /**
     * 登录用户名
     */
    private String username;

    /**
     * 登录密码(加密存储)
     */
    private String password;

    /**
     * Cookie信息
     */
    @Column(large = true)
    private String cookies;

    /**
     * Token信息
     */
    private String token;

    /**
     * 账号状态: ACTIVE(可用), INACTIVE(不可用), LOCKED(锁定), EXPIRED(过期)
     */
    private String status;

    /**
     * 登录状态: LOGGED_IN(已登录), LOGGED_OUT(未登录), LOGIN_FAILED(登录失败)
     */
    private String loginStatus;

    /**
     * 账号等级/会员类型
     */
    private String accountLevel;

    /**
     * 使用次数
     */
    private Long useCount;

    /**
     * 成功次数
     */
    private Long successCount;

    /**
     * 失败次数
     */
    private Long failureCount;

    /**
     * 最后登录时间
     */
    private Date lastLoginTime;

    /**
     * 最后使用时间
     */
    private Date lastUseTime;

    /**
     * Token过期时间
     */
    private Date tokenExpireTime;

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
