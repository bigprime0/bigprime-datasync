package com.bigprime.datasync.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Dashboard失败任务VO
 * 
 * Created by BigPrime DataSync Team
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardFailedTaskVO {

    /**
     * 任务ID
     */
    private String id;

    /**
     * 任务名称
     */
    private String dagName;

    /**
     * 任务类型
     */
    private String taskType;

    /**
     * 失败时间（格式：yyyy-MM-dd HH:mm:ss）
     */
    private String failedTime;

    /**
     * 错误信息
     */
    private String errorMessage;
}
