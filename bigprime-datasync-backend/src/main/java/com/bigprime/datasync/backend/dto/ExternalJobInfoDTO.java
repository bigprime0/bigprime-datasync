package com.bigprime.datasync.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * 外部任务信息 DTO
 * <p>
 * 用于返回 Pipeline 收拢节点对应的外部任务（Flink/SeaTunnel）的监控信息
 * </p>
 * 
 * Created by BigPrime DataSync Team
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExternalJobInfoDTO {

    /**
     * 外部任务ID（如 Flink Job ID）
     */
    private String externalJobId;

    /**
     * 外部任务访问 URL
     */
    private String externalJobUrl;

    /**
     * 任务状态（RUNNING, FINISHED, FAILED 等）
     */
    private String status;

    /**
     * 任务类型（FLINK, SEATUNNEL 等）
     */
    private String jobType;

    /**
     * 收拢节点ID
     */
    private String collapsedNodeId;

    /**
     * 实时指标
     */
    private ExternalJobMetrics metrics;

    /**
     * 外部任务实时指标
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExternalJobMetrics {
        /**
         * 输入记录数
         */
        private Long recordsIn;

        /**
         * 输出记录数
         */
        private Long recordsOut;

        /**
         * 吞吐量（记录/秒）
         */
        private Double throughput;

        /**
         * 反压状态（OK, LOW, HIGH）
         */
        private String backpressure;

        /**
         * 任务运行时长（毫秒）
         */
        private Long duration;

        /**
         * 扩展指标（可选）
         */
        private Map<String, Object> additionalMetrics;
    }
}
