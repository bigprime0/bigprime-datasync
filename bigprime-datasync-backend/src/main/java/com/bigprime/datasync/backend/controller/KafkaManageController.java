package com.bigprime.datasync.backend.controller;

import com.bigprime.connector.core.IMqConnector;
import com.bigprime.connector.impl.KafkaConnector;
import com.bigprime.connector.manager.ConnectorManager;
import com.bigprime.datasync.core.model.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;

/**
 * Kafka 管理 API 控制器
 * 提供 Topic 管理、消费者组监控、Lag 查询等接口
 *
 * @author bigprime
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/kafka/manage")
@Tag(name = "Kafka管理")
@RequiredArgsConstructor
public class KafkaManageController {

    private final ConnectorManager connectorManager;

    // =================== 请求体 ===================

    @Data
    public static class ConnectorIdRequest {
        @Parameter(description = "Kafka连接器ID")
        private String connectorId;
    }

    @Data
    public static class TopicRequest {
        @Parameter(description = "Kafka连接器ID")
        private String connectorId;
        @Parameter(description = "Topic名称")
        private String topic;
    }

    @Data
    public static class CreateTopicRequest {
        @Parameter(description = "Kafka连接器ID")
        private String connectorId;
        @Parameter(description = "Topic名称")
        private String topic;
        @Parameter(description = "分区数，默认1")
        private Integer numPartitions = 1;
        @Parameter(description = "副本数，默认1")
        private Short replicationFactor = 1;
    }

    @Data
    public static class ConsumerGroupRequest {
        @Parameter(description = "Kafka连接器ID")
        private String connectorId;
        @Parameter(description = "消费者组ID")
        private String groupId;
    }

    @Data
    public static class SendMessageRequest {
        @Parameter(description = "Kafka连接器ID")
        private String connectorId;
        @Parameter(description = "Topic名称")
        private String topic;
        @Parameter(description = "消息内容")
        private String message;
    }

    /** SSE会话存储：sessionId -> SseEmitter */
    private final Map<String, SseEmitter> sseEmitters = new ConcurrentHashMap<>();
    /** SSE订阅ID存储：sessionId -> subscriptionId */
    private final Map<String, String> sseSubscriptions = new ConcurrentHashMap<>();
    /** SSE连接器ID存储：sessionId -> connectorId，用于断连时正确取消订阅 */
    private final Map<String, String> sseConnectorIds = new ConcurrentHashMap<>();

    // =================== Topic 管理 ===================

    /**
     * 获取 Topic 列表
     */
    @PostMapping("/topics")
    @Operation(summary = "获取Topic列表")
    public Result<List<String>> getTopics(@RequestBody ConnectorIdRequest request) {
        try {
            KafkaConnector connector = connectorManager.getConnector(request.getConnectorId(), KafkaConnector.class);
            List<String> topics = connector.getTopics().join();
            log.info("获取Kafka Topic列表成功: connectorId={}, topicCount={}", request.getConnectorId(), topics.size());
            return Result.ok(topics);
        } catch (Exception e) {
            log.error("获取Kafka Topic列表失败: connectorId={}", request.getConnectorId(), e);
            return Result.error("获取Topic列表失败: " + e.getMessage());
        }
    }

    /**
     * 获取 Topic 详情（分区、副本、ISR 等）
     */
    @PostMapping("/topic-info")
    @Operation(summary = "获取Topic详情")
    public Result<Map<String, Object>> getTopicInfo(@RequestBody TopicRequest request) {
        try {
            KafkaConnector connector = connectorManager.getConnector(request.getConnectorId(), KafkaConnector.class);
            Map<String, Object> info = connector.getTopicInfo(request.getTopic()).join();
            return Result.ok(info);
        } catch (Exception e) {
            log.error("获取Kafka Topic详情失败: connectorId={}, topic={}", request.getConnectorId(), request.getTopic(), e);
            return Result.error("获取Topic详情失败: " + e.getMessage());
        }
    }

    /**
     * 创建 Topic
     */
    @PostMapping("/topic/create")
    @Operation(summary = "创建Topic")
    public Result<Boolean> createTopic(@RequestBody CreateTopicRequest request) {
        try {
            KafkaConnector connector = connectorManager.getConnector(request.getConnectorId(), KafkaConnector.class);
            Map<String, Object> props = Map.of(
                    "numPartitions", request.getNumPartitions(),
                    "replicationFactor", request.getReplicationFactor()
            );
            Boolean result = connector.createTopic(request.getTopic(), props).join();
            log.info("创建Kafka Topic: connectorId={}, topic={}, result={}", request.getConnectorId(), request.getTopic(), result);
            return Result.ok(result);
        } catch (Exception e) {
            log.error("创建Kafka Topic失败: connectorId={}, topic={}", request.getConnectorId(), request.getTopic(), e);
            return Result.error("创建Topic失败: " + e.getMessage());
        }
    }

    /**
     * 删除 Topic
     */
    @PostMapping("/topic/delete")
    @Operation(summary = "删除Topic")
    public Result<Boolean> deleteTopic(@RequestBody TopicRequest request) {
        try {
            KafkaConnector connector = connectorManager.getConnector(request.getConnectorId(), KafkaConnector.class);
            Boolean result = connector.deleteTopic(request.getTopic()).join();
            log.info("删除Kafka Topic: connectorId={}, topic={}, result={}", request.getConnectorId(), request.getTopic(), result);
            return Result.ok(result);
        } catch (Exception e) {
            log.error("删除Kafka Topic失败: connectorId={}, topic={}", request.getConnectorId(), request.getTopic(), e);
            return Result.error("删除Topic失败: " + e.getMessage());
        }
    }

    // =================== 消息发送 ===================

    /**
     * 发送单条消息到 Topic
     */
    @PostMapping("/send")
    @Operation(summary = "发送消息到Topic")
    public Result<Boolean> sendMessage(@RequestBody SendMessageRequest request) {
        try {
            KafkaConnector connector = connectorManager.getConnector(request.getConnectorId(), KafkaConnector.class);
            Boolean result = connector.publish(request.getTopic(), request.getMessage()).join();
            log.info("发送消息到Topic: connectorId={}, topic={}", request.getConnectorId(), request.getTopic());
            return Result.ok(result);
        } catch (Exception e) {
            log.error("发送消息失败: connectorId={}, topic={}", request.getConnectorId(), request.getTopic(), e);
            return Result.error("发送消息失败: " + e.getMessage());
        }
    }

    /**
     * SSE 流式消费 Topic 消息
     * GET /api/kafka/manage/consume/stream?connectorId=&topic=&groupId=&sessionId=
     */
    @GetMapping(value = "/consume/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "SSE流式消费Topic消息")
    public SseEmitter consumeStream(
            @RequestParam String connectorId,
            @RequestParam String topic,
            @RequestParam String groupId,
            @RequestParam String sessionId) {

        // 幂等检查：同一 sessionId 已有活跃订阅，直接拒绝重复创建（防止 EventSource 重连触发多余订阅）
        if (sseSubscriptions.containsKey(sessionId)) {
            log.warn("SSE重复订阅被拒绝: sessionId={} 已存在活跃订阅", sessionId);
            SseEmitter dummyEmitter = new SseEmitter(0L);
            cleanupExecutor.submit(() -> { try { dummyEmitter.complete(); } catch (Exception ignore) {} });
            return dummyEmitter;
        }

        SseEmitter emitter = new SseEmitter(0L); // 不超时
        sseEmitters.put(sessionId, emitter);

        try {
            KafkaConnector connector = connectorManager.getConnector(connectorId, KafkaConnector.class);
            String subscriptionId = connector.subscribeWithGroup(topic, groupId, new IMqConnector.MessageConsumer() {
                @Override
                public void onMessage(String message) {
                    try {
                        emitter.send(SseEmitter.event().data(message));
                    } catch (IOException e) {
                        log.warn("SSE推送消息失败，sessionId={}: {}", sessionId, e.getMessage());
                        cleanup(connector, sessionId);
                    }
                }
                @Override
                public void onError(Throwable error) {
                    try {
                        emitter.send(SseEmitter.event().name("error").data(error.getMessage()));
                    } catch (IOException ignore) {}
                    cleanup(connector, sessionId);
                }
            });
            sseSubscriptions.put(sessionId, subscriptionId);
            sseConnectorIds.put(sessionId, connectorId);
            log.info("SSE消费开始: connectorId={}, topic={}, groupId={}, sessionId={}", connectorId, topic, groupId, sessionId);
        } catch (Exception e) {
            log.error("SSE消费启动失败: {}", e.getMessage(), e);
            emitter.completeWithError(e);
            sseEmitters.remove(sessionId);
            return emitter;
        }

        emitter.onCompletion(() -> cleanupBySessionId(sessionId));
        emitter.onTimeout(() -> cleanupBySessionId(sessionId));
        emitter.onError(ex -> cleanupBySessionId(sessionId));
        return emitter;
    }

    /**
     * 停止 SSE 消费
     */
    @PostMapping("/consume/stop")
    @Operation(summary = "停止SSE消费")
    public Result<Boolean> stopConsume(@RequestParam String connectorId, @RequestParam String sessionId) {
        try {
            KafkaConnector connector = connectorManager.getConnector(connectorId, KafkaConnector.class);
            cleanup(connector, sessionId);
            return Result.ok(true);
        } catch (Exception e) {
            return Result.ok(true);
        }
    }

    /**
     * 停止所有 SSE 消费（页面刷新/重进时清理残留订阅）
     */
    @PostMapping("/consume/stop-all")
    @Operation(summary = "停止所有SSE消费")
    public Result<Integer> stopAllConsume() {
        // 第一步：通过 sessionId map 正常清理已追踪的订阅
        int count = sseSubscriptions.size();
        for (String sid : new java.util.ArrayList<>(sseSubscriptions.keySet())) {
            cleanupBySessionId(sid);
        }
        // 第二步：兜底 —— 遍历所有 Kafka 连接器，强制取消所有残留订阅
        // 防止 sseSubscriptions 因之前的异常/重连已被清空，但消费者线程仍活着的情况
        int forceCount = 0;
        for (String connectorId : connectorManager.getAllConnectorIds()) {
            try {
                KafkaConnector kafkaConnector = connectorManager.getConnector(connectorId, KafkaConnector.class);
                java.util.Set<String> subIds = new java.util.HashSet<>(kafkaConnector.getSubscriptions().keySet());
                for (String subId : subIds) {
                    kafkaConnector.unsubscribe(subId);
                    forceCount++;
                }
            } catch (Exception ignore) {
                // 非 Kafka 连接器或其他错误，忽略
            }
        }
        log.info("停止所有SSE消费: 正常清理{}个会话, 强制关闭{}个残留订阅", count, forceCount);
        return Result.ok(count + forceCount);
    }

    /** 用于异步执行 emitter.complete() 的线程池，避免在中断线程中 flush Tomcat 输出流 */
    private final java.util.concurrent.ExecutorService cleanupExecutor =
            Executors.newSingleThreadExecutor(r -> {
                Thread t = new Thread(r, "sse-cleanup");
                t.setDaemon(true);
                return t;
            });

    /** 通过 sessionId 自动查找 connector 进行清理（用于 SSE 断连/超时回调） */
    private void cleanupBySessionId(String sessionId) {
        String connectorId = sseConnectorIds.remove(sessionId);
        KafkaConnector connector = null;
        if (connectorId != null) {
            try { connector = connectorManager.getConnector(connectorId, KafkaConnector.class); } catch (Exception ignore) {}
        }
        cleanup(connector, sessionId);
    }

    private void cleanup(KafkaConnector connector, String sessionId) {
        sseConnectorIds.remove(sessionId); // 确保清理 connectorId 记录
        String subscriptionId = sseSubscriptions.remove(sessionId);
        if (subscriptionId != null && connector != null) {
            try { connector.unsubscribe(subscriptionId); } catch (Exception ignore) {}
        }
        SseEmitter emitter = sseEmitters.remove(sessionId);
        if (emitter != null) {
            // 异步完成：避免在已中断的消费者线程中直接 flush Tomcat 输出流
            cleanupExecutor.submit(() -> {
                try { emitter.complete(); } catch (Exception ignore) {}
            });
        }
    }

    // =================== 消费者组监控 ===================

    /**
     * 获取消费者组列表
     */
    @PostMapping("/consumer-groups")
    @Operation(summary = "获取消费者组列表")
    public Result<List<String>> getConsumerGroups(@RequestBody ConnectorIdRequest request) {
        try {
            KafkaConnector connector = connectorManager.getConnector(request.getConnectorId(), KafkaConnector.class);
            List<String> groups = connector.getConsumerGroups().join();
            log.info("获取消费者组列表成功: connectorId={}, groupCount={}", request.getConnectorId(), groups.size());
            return Result.ok(groups);
        } catch (Exception e) {
            log.error("获取消费者组列表失败: connectorId={}", request.getConnectorId(), e);
            return Result.error("获取消费者组列表失败: " + e.getMessage());
        }
    }

    /**
     * 获取消费者组 Lag（积压量）监控
     */
    @PostMapping("/consumer-group/lag")
    @Operation(summary = "获取消费者组Lag监控")
    public Result<List<Map<String, Object>>> getConsumerGroupLag(@RequestBody ConsumerGroupRequest request) {
        try {
            KafkaConnector connector = connectorManager.getConnector(request.getConnectorId(), KafkaConnector.class);
            List<Map<String, Object>> lag = connector.getConsumerGroupLag(request.getGroupId()).join();
            log.info("获取消费者组Lag成功: connectorId={}, groupId={}, partitionCount={}",
                    request.getConnectorId(), request.getGroupId(), lag.size());
            return Result.ok(lag);
        } catch (Exception e) {
            log.error("获取消费者组Lag失败: connectorId={}, groupId={}", request.getConnectorId(), request.getGroupId(), e);
            return Result.error("获取消费者组Lag失败: " + e.getMessage());
        }
    }
}
