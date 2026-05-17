package com.bigprime.datasync.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Dashboard运行中任务VO
 * 
 * Created by BigPrime DataSync Team
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardRunningTaskVO {

    /**
     * 任务ID
     */
    private String id;

    /**
     * 任务名称
     */
    private String dagName;

    /**
     * 任务类型（流程编排/爬虫/网关/其他）
     */
    private String taskType;

    /**
     * 进度（0-100）
     */
    private Integer progress;

    /**
     * 已耗时（毫秒）
     */
    private Long elapsedTime;

    /**
     * 开始时间（格式：yyyy-MM-dd HH:mm:ss）
     */
    private String startTime;
}
