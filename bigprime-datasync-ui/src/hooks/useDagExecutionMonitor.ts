/**
 * DAG执行监控Hook
 * 提供DAG执行状态的实时监控能力
 */
import { ref, onMounted, onUnmounted, type Ref } from 'vue'
import { dagExecutionWebSocket, type DagExecutionEvent } from '@/services/dag-execution-websocket'
import { getDagExecutionDetail, getDagExecutionNodes } from '@/api/dag-execution'
import type { DagExecutionRecord, DagNodeExecutionRecord } from '@/api/dag-execution'

export interface UseDagExecutionMonitorOptions {
  /**
   * 执行ID
   */
  executionId: string
  
  /**
   * 是否自动连接WebSocket（默认true）
   */
  autoConnect?: boolean
  
  /**
   * 轮询间隔（ms），默认5000
   */
  pollingInterval?: number
  
  /**
   * 事件回调
   */
  onEvent?: (event: DagExecutionEvent) => void
  
  /**
   * DAG开始回调
   */
  onDagStarted?: () => void
  
  /**
   * DAG完成回调
   */
  onDagCompleted?: (success: boolean) => void
  
  /**
   * 节点开始回调
   */
  onNodeStarted?: (nodeId: string) => void
  
  /**
   * 节点完成回调
   */
  onNodeCompleted?: (nodeId: string, success: boolean) => void
}

export function useDagExecutionMonitor(options: UseDagExecutionMonitorOptions) {
  const {
    executionId,
    autoConnect = true,
    pollingInterval = 5000,
    onEvent,
    onDagStarted,
    onDagCompleted,
    onNodeStarted,
    onNodeCompleted
  } = options

  // 响应式状态
  const executionDetail: Ref<DagExecutionRecord | null> = ref(null)
  const nodeRecords: Ref<DagNodeExecutionRecord[]> = ref([])
  const wsConnected = ref(false)
  const loading = ref(false)
  const usePolling = ref(false)  // 是否使用轮询模式
  let pollingTimer: ReturnType<typeof setTimeout> | null = null
  let wsRetryCount = 0
  const maxWsRetries = 3

  /**
   * 加载执行详情
   */
  const loadExecutionDetail = async () => {
    loading.value = true
    try {
      const res = await getDagExecutionDetail(executionId)
      executionDetail.value = res.data
    } catch (error) {
      console.error('[DAG监控] 加载执行详情失败:', error)
    } finally {
      loading.value = false
    }
  }

  /**
   * 加载节点记录
   */
  const loadNodeRecords = async () => {
    try {
      const res = await getDagExecutionNodes(executionId)
      nodeRecords.value = res.data
    } catch (error) {
      console.error('[DAG监控] 加载节点记录失败:', error)
    }
  }

  /**
   * 处理WebSocket事件
   */
  const handleWebSocketEvent = (event: DagExecutionEvent) => {
    console.log('[DAG监控] 收到事件:', event)
    
    // 调用通用事件回调
    onEvent?.(event)
    
    // 根据事件类型处理
    switch (event.eventType) {
      case 'DAG_STARTED':
        handleDagStarted(event)
        break
      case 'DAG_COMPLETED':
        handleDagCompleted(event, true)
        break
      case 'DAG_FAILED':
        handleDagCompleted(event, false)
        break
      case 'NODE_STARTED':
        handleNodeStarted(event)
        break
      case 'NODE_COMPLETED':
        handleNodeCompleted(event, true)
        break
      case 'NODE_FAILED':
        handleNodeCompleted(event, false)
        break
    }
    
    // 在处理完事件后刷新数据以确保状态同步
    // 注意：只在WebSocket连接正常时刷新，避免与轮询冲突
    if (wsConnected.value && !usePolling.value) {
      setTimeout(() => {
        refresh()
      }, 500) // 延迟500ms确保状态更新完成
    }
  }

  /**
   * 处理DAG开始事件
   */
  const handleDagStarted = (event: DagExecutionEvent) => {
    if (executionDetail.value) {
      executionDetail.value.status = event.status
      executionDetail.value.startTime = event.startTime!
    }
    onDagStarted?.()
  }

  /**
   * 处理DAG完成事件
   */
  const handleDagCompleted = (event: DagExecutionEvent, success: boolean) => {
    if (executionDetail.value) {
      executionDetail.value.status = event.status
      executionDetail.value.endTime = event.endTime
      executionDetail.value.duration = event.duration
      executionDetail.value.progress = 100
    }
    onDagCompleted?.(success)
  }

  /**
   * 处理节点开始事件
   */
  const handleNodeStarted = (event: DagExecutionEvent) => {
    const nodeId = event.nodeId!
    
    // 更新节点记录
    const node = nodeRecords.value.find(n => n.nodeId === nodeId)
    if (node) {
      node.status = event.status
      node.startTime = event.startTime!
    }
    
    onNodeStarted?.(nodeId)
  }

  /**
   * 处理节点完成事件
   */
  const handleNodeCompleted = (event: DagExecutionEvent, success: boolean) => {
    const nodeId = event.nodeId!
    
    // 更新节点记录
    const node = nodeRecords.value.find(n => n.nodeId === nodeId)
    if (node) {
      node.status = event.status
      node.endTime = event.endTime
      node.duration = event.duration
      node.errorMessage = event.errorMessage
    }
    
    // 更新执行详情的统计
    if (executionDetail.value) {
      if (success) {
        executionDetail.value.completedNodes = (executionDetail.value.completedNodes || 0) + 1
      } else {
        executionDetail.value.failedNodes = (executionDetail.value.failedNodes || 0) + 1
      }
      
      // 更新进度
      const totalNodes = executionDetail.value.totalNodes || 1
      const completed = (executionDetail.value.completedNodes || 0) + (executionDetail.value.failedNodes || 0)
      executionDetail.value.progress = Math.floor((completed / totalNodes) * 100)
    }
    
    onNodeCompleted?.(nodeId, success)
  }

  /**
   * 连接WebSocket
   */
  const connect = () => {
    console.log('[DAG监控] 尝试连接WebSocket，当前连接状态:', dagExecutionWebSocket.isConnected())
    if (!dagExecutionWebSocket.isConnected()) {
      dagExecutionWebSocket.connect(
        () => {
          console.log('[DAG监控] WebSocket连接成功')
          wsConnected.value = true
          wsRetryCount = 0  // 重置重试计数
          usePolling.value = false  // 关闭轮询
          stopPolling()  // 停止轮询
          // 连接成功后订阅
          console.log('[DAG监控] 订阅执行事件:', executionId)
          dagExecutionWebSocket.subscribeExecution(executionId, handleWebSocketEvent)
        },
        (error) => {
          console.error('[DAG监控] WebSocket连接失败:', error)
          wsConnected.value = false
          wsRetryCount++
          
          // 超过最大重试次数，降级为轮询
          if (wsRetryCount >= maxWsRetries) {
            console.log('[DAG监控] WebSocket重试失败，降级为轮询模式')
            usePolling.value = true
            startPolling()
          }
        }
      )
    } else {
      console.log('[DAG监控] WebSocket已连接，直接订阅')
      wsConnected.value = true
      dagExecutionWebSocket.subscribeExecution(executionId, handleWebSocketEvent)
    }
  }

  /**
   * 启动轮询
   */
  const startPolling = () => {
    if (pollingTimer) return
    
    console.log('[DAG监控] 启动轮询模式，间隔:', pollingInterval, 'ms')
    
    const poll = async () => {
      await refresh()
      
      // 如果执行已完成，停止轮询
      if (executionDetail.value?.status === 'SUCCESS' || 
          executionDetail.value?.status === 'FAILED' ||
          executionDetail.value?.status === 'CANCELLED') {
        console.log('[DAG监控] 执行已结束，停止轮询')
        stopPolling()
        return
      }
      
      // 继续轮询
      pollingTimer = setTimeout(poll, pollingInterval)
    }
    
    poll()
  }

  /**
   * 停止轮询
   */
  const stopPolling = () => {
    if (pollingTimer) {
      clearTimeout(pollingTimer)
      pollingTimer = null
      console.log('[DAG监控] 停止轮询')
    }
  }

  /**
   * 断开WebSocket
   */
  const disconnect = () => {
    dagExecutionWebSocket.unsubscribeExecution(executionId)
    wsConnected.value = false
    stopPolling()  // 停止轮询
  }

  /**
   * 刷新数据
   */
  const refresh = async () => {
    await Promise.all([
      loadExecutionDetail(),
      loadNodeRecords()
    ])
  }

  // 组件挂载时初始化
  onMounted(async () => {
    // 加载初始数据
    await refresh()
    
    // 自动连接WebSocket
    if (autoConnect) {
      connect()
    }
  })

  // 组件卸载时清理
  onUnmounted(() => {
    disconnect()
    stopPolling()
  })

  return {
    // 状态
    executionDetail,
    nodeRecords,
    wsConnected,
    loading,
    usePolling,  // 暴露轮询状态
    
    // 方法
    connect,
    disconnect,
    refresh,
    loadExecutionDetail,
    loadNodeRecords,
    startPolling,
    stopPolling
  }
}
