package com.bigprime.datasync.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Dashboard趋势数据VO
 * 
 * Created by BigPrime DataSync Team
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardTrendDataVO {

    /**
     * 时间点（格式：yyyy-MM-dd HH:mm）
     */
    private String time;

    /**
     * 数值
     */
    private Long value;

    /**
     * 类型（用于分组，如：success/failed/running）
     */
    private String type;
}
