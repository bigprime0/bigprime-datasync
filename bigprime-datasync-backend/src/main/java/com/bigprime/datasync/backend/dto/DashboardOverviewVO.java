package com.bigprime.datasync.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Dashboard核心指标概览VO
 * 
 * Created by BigPrime DataSync Team
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardOverviewVO {

    /**
     * 连接器总览
     */
    private ConnectorOverview connectorOverview;

    /**
     * 任务执行概况
     */
    private TaskExecutionOverview taskExecutionOverview;

    /**
     * 数据传输量
     */
    private DataTransferOverview dataTransferOverview;

    /**
     * 协议网关状态
     */
    private GatewayOverview gatewayOverview;

    /**
     * 连接器总览
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConnectorOverview {
        /**
         * 连接器总数
         */
        private Integer totalCount;

        /**
         * 在线数量
         */
        private Integer onlineCount;

        /**
         * 离线数量
         */
        private Integer offlineCount;

        /**
         * 异常数量
         */
        private Integer errorCount;

        /**
         * 连接成功率
         */
        private Double successRate;

        /**
         * 环比变化（正数为增长，负数为下降）
         */
        private Double changeRate;
    }

    /**
     * 任务执行概况
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TaskExecutionOverview {
        /**
         * 今日执行总数
         */
        private Integer totalCount;

        /**
         * 成功数量
         */
        private Integer successCount;

        /**
         * 失败数量
         */
        private Integer failedCount;

        /**
         * 运行中数量
         */
        private Integer runningCount;

        /**
         * 成功率
         */
        private Double successRate;

        /**
         * 环比变化
         */
        private Double changeRate;
    }

    /**
     * 数据传输概览
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DataTransferOverview {
        /**
         * 今日传输记录数
         */
        private Long totalRecords;

        /**
         * 今日传输数据量（字节）
         */
        private Long totalBytes;

        /**
         * 峰值速率（记录/秒）
         */
        private Long peakRate;

        /**
         * 环比变化
         */
        private Double changeRate;
    }

    /**
     * 网关概览
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GatewayOverview {
        /**
         * 网关总数
         */
        private Integer totalCount;

        /**
         * 运行中数量
         */
        private Integer runningCount;

        /**
         * 今日消息量
         */
        private Long messageCount;

        /**
         * 死信队列数量
         */
        private Integer deadLetterCount;
    }
}
