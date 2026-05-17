import {Client} from '@stomp/stompjs'
import SockJS from 'sockjs-client'

export interface WebSocketMessage {
  type: string
  data: any
}

export interface MessageCallback {
  (message: any): void
}

class WebSocketClient {
  private client: Client | null = null
  private subscriptions: Map<string, any> = new Map()
  private messageCallbacks: Map<string, MessageCallback[]> = new Map()
  private reconnectTimer: any = null
  private isConnecting = false

  /**
   * 连接WebSocket服务器
   */
  connect(url: string, onConnected?: () => void, onError?: (error: any) => void) {
    console.log('[WebSocket] 开始连接:', url)
    
    if (this.client && this.client.connected) {
      console.log('[WebSocket] 已连接')
      return
    }

    if (this.isConnecting) {
      console.log('[WebSocket] 正在连接中...')
      return
    }

    this.isConnecting = true

    this.client = new Client({
      webSocketFactory: () => {
        console.log('[WebSocket] 创建SockJS连接:', url)
        const sockjs = new SockJS(url, null, {
          transports: ['websocket'],  // 只使用WebSocket
          timeout: 10000
        })
        return sockjs
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => {
        console.log('[STOMP Debug]', str)
      },
      onConnect: () => {
        console.log('[WebSocket] 连接成功')
        this.isConnecting = false
        onConnected?.()
        // 重新订阅之前的主题
        this.resubscribe()
      },
      onDisconnect: () => {
        console.log('[WebSocket] 断开连接')
        this.isConnecting = false
      },
      onStompError: (frame) => {
        console.error('[WebSocket] STOMP错误:', frame)
        this.isConnecting = false
        onError?.(frame)
      },
      onWebSocketError: (event) => {
        console.error('[WebSocket] WebSocket错误:', event)
        this.isConnecting = false
        onError?.(event)
      }
    })

    this.client.activate()
    console.log('[WebSocket] 激活连接')
  }

  /**
   * 断开连接
   */
  disconnect() {
    if (this.client) {
      this.subscriptions.clear()
      this.messageCallbacks.clear()
      this.client.deactivate()
      this.client = null
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  /**
   * 订阅主题
   */
  subscribe(topic: string, callback: MessageCallback) {
    if (!this.client) {
      console.warn('WebSocket未连接，无法订阅主题:', topic)
      return
    }

    // 保存回调函数
    if (!this.messageCallbacks.has(topic)) {
      this.messageCallbacks.set(topic, [])
    }
    this.messageCallbacks.get(topic)!.push(callback)

    // 如果已连接，立即订阅
    if (this.client.connected && !this.subscriptions.has(topic)) {
      const subscription = this.client.subscribe(topic, (message) => {
        const body = JSON.parse(message.body)
        const callbacks = this.messageCallbacks.get(topic) || []
        callbacks.forEach(cb => cb(body))
      })
      this.subscriptions.set(topic, subscription)
      console.log('订阅主题:', topic)
    }
  }

  /**
   * 取消订阅
   */
  unsubscribe(topic: string) {
    const subscription = this.subscriptions.get(topic)
    if (subscription) {
      subscription.unsubscribe()
      this.subscriptions.delete(topic)
      this.messageCallbacks.delete(topic)
      console.log('取消订阅主题:', topic)
    }
  }

  /**
   * 重新订阅所有主题
   */
  private resubscribe() {
    if (!this.client || !this.client.connected) {
      return
    }

    // 清除旧的订阅
    this.subscriptions.clear()

    // 重新订阅
    this.messageCallbacks.forEach((callbacks, topic) => {
      const subscription = this.client!.subscribe(topic, (message) => {
        const body = JSON.parse(message.body)
        callbacks.forEach(cb => cb(body))
      })
      this.subscriptions.set(topic, subscription)
      console.log('重新订阅主题:', topic)
    })
  }

  /**
   * 发送消息
   */
  send(destination: string, body: any) {
    if (!this.client || !this.client.connected) {
      console.warn('WebSocket未连接，无法发送消息')
      return
    }
    this.client.publish({
      destination,
      body: JSON.stringify(body)
    })
  }

  /**
   * 判断是否已连接
   */
  isConnected(): boolean {
    return this.client?.connected || false
  }
}

// 导出单例
export const wsClient = new WebSocketClient()
