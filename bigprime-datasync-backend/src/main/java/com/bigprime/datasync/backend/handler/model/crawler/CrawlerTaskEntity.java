package com.bigprime.datasync.backend.handler.model.crawler;

import com.bigprime.datasync.backend.handler.model.crawler.proxy.CrawlerTaskEntityProxy;
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
 * 爬虫任务实体
 * 
 * @author bigprime
 * @version 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityProxy
@Table("data_crawler_task")
public class CrawlerTaskEntity implements ProxyEntityAvailable<CrawlerTaskEntity, CrawlerTaskEntityProxy> {

    /**
     * 主键ID
     */
    @Column(primaryKey = true)
    private String id;

    /**
     * 任务名称
     */
    private String name;

    /**
     * 任务描述
     */
    private String description;

    /**
     * 任务类型: SINGLE(单次), SCHEDULED(定时), MANUAL(手动)
     */
    private String taskType;

    /**
     * 模板ID(如果基于模板创建)
     */
    private String templateId;

    /**
     * 模板名称
     */
    private String templateName;

    /**
     * DAG配置(JSON格式)
     */
    private String dagConfig;

    /**
     * 目标URL或URL模式
     */
    private String targetUrl;

    /**
     * 目标网站 URL（AI Agent 爬虫使用）
     */
    private String websiteUrl;

    /**
     * 登录用户名（可选）
     */
    private String loginUsername;

    /**
     * 登录密码（AES-256 加密存储）
     */
    private String loginPassword;

    /**
     * 自然语言爬取指令
     */
    private String instructions;

    /**
     * 绑定的 AI 助手 ID
     */
    private String assistantId;

    /**
     * 绑定的 Playwright Connector ID
     */
    private String playwrightConnectorId;

    /**
     * 使用的 AI 模型 ID（关联 ai_model 表）
     */
    private String modelId;

    /**
     * 任务模式: DAG（旧）/ AGENT（AI Agent 模式）
     */
    private String taskMode;

    /**
     * 调度表达式(Cron格式)
     */
    private String cronExpression;

    /**
     * 任务状态: DRAFT(草稿), READY(就绪), RUNNING(运行中), PAUSED(暂停), STOPPED(停止)
     */
    private String status;

    /**
     * 是否启用
     */
    private Boolean enabled;

    /**
     * 重试次数
     */
    private Integer retryCount;

    /**
     * 超时时间(秒)
     */
    private Integer timeout;

    /**
     * 并发数
     */
    private Integer concurrency;

    /**
     * 总执行次数
     */
    private Long totalExecutions;

    /**
     * 成功执行次数
     */
    private Long successExecutions;

    /**
     * 失败执行次数
     */
    private Long failedExecutions;

    /**
     * 最后执行时间
     */
    private Date lastExecutionTime;

    /**
     * 下次执行时间
     */
    private Date nextExecutionTime;

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
