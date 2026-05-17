package com.bigprime.datasync.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * Dashboard统计数据VO（通用）
 * 
 * Created by BigPrime DataSync Team
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatisticsVO {

    /**
     * 统计类型（用于标识不同的统计维度）
     */
    private String type;

    /**
     * 统计名称
     */
    private String name;

    /**
     * 统计值
     */
    private Long value;

    /**
     * 扩展属性（灵活存储额外信息）
     */
    private Map<String, Object> extra;
}
