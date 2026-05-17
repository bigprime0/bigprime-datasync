package com.bigprime.datasync.backend.dto;

import lombok.Data;

import java.util.List;

/**
 * Worker日志上报请求DTO
 * 
 * @author BigPrime DataSync Team
 */
@Data
public class WorkerLogRequest {
    
    /**
     * DAG执行ID
     */
    private String dagExecutionId;
    
    /**
     * 节点ID
     */
    private String nodeId;
    
    /**
     * 节点名称
     */
    private String nodeName;
    
    /**
     * Worker ID
     */
    private String workerId;
    
    /**
     * 日志级别（DEBUG/INFO/WARNING/ERROR）
     */
    private String level = "INFO";
    
    /**
     * 日志消息
     */
    private String message;
    
    /**
     * 时间戳（可选，由Worker提供）
     */
    private String timestamp;
    
    /**
     * 批量上报请求
     */
    @Data
    public static class BatchRequest {
        /**
         * DAG执行ID（批量日志共用）
         */
        private String dagExecutionId;
        
        /**
         * 日志列表
         */
        private List<WorkerLogRequest> logs;
    }
}
