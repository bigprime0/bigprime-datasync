package com.bigprime.datasync.backend.handler.model.crawler;

import com.bigprime.datasync.backend.handler.model.crawler.proxy.CrawlerExecutionHistoryEntityProxy;
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
 * 爬虫执行历史实体
 * 
 * @author bigprime
 * @version 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityProxy
@Table("data_crawler_execution_history")
public class CrawlerExecutionHistoryEntity implements ProxyEntityAvailable<CrawlerExecutionHistoryEntity, CrawlerExecutionHistoryEntityProxy> {

    /**
     * 主键ID
     */
    @Column(primaryKey = true)
    private String id;

    /**
     * 爬虫任务ID
     */
    private String taskId;

    /**
     * 任务名称
     */
    private String taskName;

    /**
     * DAG执行ID(关联DAG执行记录)
     */
    private String dagExecutionId;

    /**
     * 执行状态: INIT(初始化), RUNNING(运行中), SUCCESS(成功), FAILED(失败), CANCELLED(取消)
     */
    private String status;

    /**
     * 开始时间
     */
    private Date startTime;

    /**
     * 结束时间
     */
    private Date endTime;

    /**
     * 执行耗时(毫秒)
     */
    private Long duration;

    /**
     * 爬取的URL数量
     */
    private Integer urlCount;

    /**
     * 成功爬取的URL数量
     */
    private Integer successUrlCount;

    /**
     * 失败的URL数量
     */
    private Integer failedUrlCount;

    /**
     * 提取的数据记录数
     */
    private Long recordCount;

    /**
     * 存储的数据记录数
     */
    private Long storedRecordCount;

    /**
     * 执行进度(0-100)
     */
    private Integer progress;

    /**
     * 错误信息
     */
    private String errorMessage;

    /**
     * 错误堆栈
     */
    private String errorStack;

    /**
     * 触发方式: MANUAL(手动), SCHEDULED(定时), API(接口)
     */
    private String triggerType;

    /**
     * 触发人
     */
    private String triggerUser;

    /**
     * 创建时间
     */
    private Date createTime;

    /**
     * 更新时间
     */
    private Date updateTime;
}
