package com.bigprime.datasync.backend.handler.model.flow;

import com.bigprime.datasync.core.model.BaseModel;
import com.bigprime.datasync.backend.handler.model.flow.proxy.DataSyncFlowProxy;
import com.easy.query.core.annotation.Column;
import com.easy.query.core.annotation.EntityProxy;
import com.easy.query.core.annotation.Table;
import com.easy.query.core.proxy.ProxyEntityAvailable;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 流程编排实体类
 *
 * @author bigprime
 * @version 1.0
 */
@EqualsAndHashCode(callSuper = true)
@Data
@Table("data_sync_flow")
@EntityProxy
public class DataSyncFlow extends BaseModel implements ProxyEntityAvailable<DataSyncFlow, DataSyncFlowProxy> {

    /**
     * 流程名称
     */
    @Column(value = "name")
    private String name;

    /**
     * 流程描述
     */
    @Column(value = "description")
    private String description;

    /**
     * 流程图数据(JSON格式)
     */
    @Column(value = "flow_data", large = true)
    private String flowData;

    /**
     * DAG执行数据(JSON格式)
     */
    @Column(value = "dag_data", large = true)
    private String dagData;

    /**
     * 流程状态: DRAFT-草稿, RUNNING-运行中, STOPPED-已停止, FAILED-失败
     */
    @Column(value = "status")
    private String status;

    /**
     * 执行模式: http(同步) 或 mq(异步)
     */
    @Column(value = "execution_mode")
    private String executionMode;

    /**
     * 任务来源: MANUAL(手动创建), CRAWLER(爬虫), ETL(数据集成), API(接口调度)
     */
    @Column(value = "task_source")
    private String taskSource;

    /**
     * 扩展配置(JSON格式，存储各类任务的特有配置)
     */
    @Column(value = "ext_config", large = true)
    private String extConfig;

    /**
     * 创建人名称
     */
    @Column(value = "creator_name")
    private String creatorName;

    /**
     * 更新人名称
     */
    @Column(value = "updater_name")
    private String updaterName;
}
