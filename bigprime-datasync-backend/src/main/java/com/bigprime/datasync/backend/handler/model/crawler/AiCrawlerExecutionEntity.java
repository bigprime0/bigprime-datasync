package com.bigprime.datasync.backend.handler.model.crawler;

import com.bigprime.datasync.backend.handler.model.crawler.proxy.AiCrawlerExecutionEntityProxy;
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
 * AI 爬虫 Agent 执行记录实体
 * 对应表：ai_crawler_execution
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityProxy
@Table("ai_crawler_execution")
public class AiCrawlerExecutionEntity implements ProxyEntityAvailable<AiCrawlerExecutionEntity, AiCrawlerExecutionEntityProxy> {

    @Column(primaryKey = true)
    private String id;

    /** 关联的爬虫任务 ID */
    private String taskId;

    /** 任务名称（冗余） */
    private String taskName;

    /** 状态: RUNNING / SUCCESS / FAILED / CANCELLED */
    private String status;

    /** 使用的 AI 模型 ID */
    private String modelId;

    /** 爬取的目标 URL */
    private String websiteUrl;

    /** 执行时的自然语言指令 */
    private String instructions;

    /** 总步骤数 */
    private Integer totalSteps;

    /** Agent 执行事件列表（JSON 数组） */
    private String events;

    /** 最终提取的数据（JSON） */
    private String resultData;

    /** 失败时的错误信息 */
    private String errorMessage;

    /** 执行耗时（毫秒） */
    private Long durationMs;

    /** 开始时间 */
    private Date startedAt;

    /** 完成时间 */
    private Date completedAt;

    /** 创建人 */
    private String creator;

    /** 创建时间 */
    private Date createTime;

    /** 逻辑删除 */
    private Integer deleted;
}
