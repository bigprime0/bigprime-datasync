import request from '@/utils/request'
import { getToken } from '@/utils/token'

const BASE_URL = '/api/kafka/manage'

export interface TopicInfo {
  name: string
  isInternal: boolean
  partitions: number
  partitionInfo: PartitionInfo[]
}

export interface PartitionInfo {
  partition: number
  leader: number
  replicas: number
  isr: number
}

export interface ConsumerGroupLagRow {
  topic: string
  partition: number
  committedOffset: number
  latestOffset: number
  lag: number
}

export const KafkaApi = {
  /** 获取 Topic 列表 */
  getTopics(connectorId: string) {
    return request.post<string[]>(`${BASE_URL}/topics`, { connectorId })
  },

  /** 获取 Topic 详情 */
  getTopicInfo(connectorId: string, topic: string) {
    return request.post<TopicInfo>(`${BASE_URL}/topic-info`, { connectorId, topic })
  },

  /** 创建 Topic */
  createTopic(connectorId: string, topic: string, numPartitions = 1, replicationFactor = 1) {
    return request.post<boolean>(`${BASE_URL}/topic/create`, {
      connectorId,
      topic,
      numPartitions,
      replicationFactor
    })
  },

  /** 删除 Topic */
  deleteTopic(connectorId: string, topic: string) {
    return request.post<boolean>(`${BASE_URL}/topic/delete`, { connectorId, topic })
  },

  /** 获取消费者组列表 */
  getConsumerGroups(connectorId: string) {
    return request.post<string[]>(`${BASE_URL}/consumer-groups`, { connectorId })
  },

  /** 获取消费者组 Lag 监控 */
  getConsumerGroupLag(connectorId: string, groupId: string) {
    return request.post<ConsumerGroupLagRow[]>(`${BASE_URL}/consumer-group/lag`, {
      connectorId,
      groupId
    })
  },

  /** 发送单条消息到 Topic */
  sendMessage(connectorId: string, topic: string, message: string) {
    return request.post<boolean>(`${BASE_URL}/send`, { connectorId, topic, message })
  },

  /**
   * 创建 SSE 消费连接
   * 返回 EventSource 对象，调用方负责关闭
   * 注意：出错时主动 close()、阻止浏览器自动重连
   */
  createConsumeStream(
    connectorId: string,
    topic: string,
    groupId: string,
    sessionId: string,
    onMessage: (msg: string) => void,
    onError?: (err: Event) => void
  ): EventSource {
    const token = getToken() || ''
    const url = `${import.meta.env.VITE_API_URL}${BASE_URL}/consume/stream?connectorId=${encodeURIComponent(connectorId)}&topic=${encodeURIComponent(topic)}&groupId=${encodeURIComponent(groupId)}&sessionId=${encodeURIComponent(sessionId)}&token=${encodeURIComponent(token)}`
    const es = new EventSource(url)
    es.onmessage = (e) => onMessage(e.data)
    es.onerror = (e) => {
      // 主动关闭，阻止浏览器自动重连行为（防止新消费者不断占用 Broker 资源）
      es.close()
      if (onError) onError(e)
    }
    return es
  },

  /** 停止 SSE 消费 */
  stopConsume(connectorId: string, sessionId: string) {
    return request.post<boolean>(`${BASE_URL}/consume/stop?connectorId=${encodeURIComponent(connectorId)}&sessionId=${encodeURIComponent(sessionId)}`, {})
  },

  /** 停止所有 SSE 消费（清理后端残留订阅） */
  stopAllConsume() {
    return request.post<number>(`${BASE_URL}/consume/stop-all`, {})
  }
}
