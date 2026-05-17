import request from '@/utils/request'

/**
 * 爬虫任务API
 */
export class CrawlerTaskApi {
  /**
   * 分页查询任务列表
   */
  static getTaskList(params: any) {
    return request({
      url: '/api/crawler/task/list',
      method: 'post',
      data: params
    })
  }

  /**
   * 创建任务
   */
  static createTask(data: any) {
    return request({
      url: '/api/crawler/task/create',
      method: 'post',
      data
    })
  }

  /**
   * 更新任务
   */
  static updateTask(data: any) {
    return request({
      url: '/api/crawler/task/update',
      method: 'put',
      data
    })
  }

  /**
   * 获取任务详情
   */
  static getTaskById(id: string) {
    return request({
      url: `/api/crawler/task/get/${id}`,
      method: 'get'
    })
  }

  /**
   * 删除任务
   */
  static deleteTask(id: string) {
    return request({
      url: `/api/crawler/task/delete/${id}`,
      method: 'delete'
    })
  }

  /**
   * 启用/禁用任务
   */
  static toggleTask(id: string, enabled: boolean) {
    return request({
      url: `/api/crawler/task/toggle/${id}`,
      method: 'put',
      params: { enabled }
    })
  }

  /**
   * 查询所有任务
   */
  static getAllTasks() {
    return request({
      url: '/api/crawler/task/all',
      method: 'get'
    })
  }

  /**
   * 立即执行任务
   */
  static executeTask(id: string) {
    return request({
      url: `/api/crawler/task/execute/${id}`,
      method: 'post'
    })
  }

}

/**
 * CrawlerAgent API（G8）
 */
export class CrawlerAgentApi {
  /**
   * 同步执行 CrawlerAgent
   */
  static execute(data: {
    taskId?: string
    websiteUrl: string
    loginUsername?: string
    loginPassword?: string
    instructions?: string
    modelId: string
    assistantId?: string
    playwrightConnectorId?: string
    enabledMcpServerIds?: string[]
    maxSteps?: number
    temperature?: number
  }) {
    return request({
      url: '/api/crawler/task/agent/execute',
      method: 'post',
      data
    })
  }

  /**
   * 流式执行 CrawlerAgent（SSE）
   * 返回 EventSource 实例，前端使用
   */
  static streamUrl(data: object): string {
    // SSE 接口需要通过 POST 发起，并携带 body
    // 前端使用 fetch + ReadableStream 实现 SSE 读取
    return '/api/crawler/task/agent/stream'
  }

  /**
   * 流式执行 CrawlerAgent - 使用 fetch + SSE
   */
  static streamExecute(
    data: object,
    onEvent: (eventType: string, data: any) => void,
    onDone?: () => void,
    onError?: (err: any) => void
  ) {
    const controller = new AbortController()
    const token = localStorage.getItem('token') || ''

    fetch('/api/crawler/task/agent/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data),
      signal: controller.signal
    })
      .then(async (response) => {
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        if (!reader) return

        let buffer = ''
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value } = await reader.read()
          if (done) {
            onDone?.()
            break
          }
          buffer += decoder.decode(value, { stream: true })
          // SSE 協议用\n\n分隔事件块，先按块切割避免跨chunk丢失
          const blocks = buffer.split('\n\n')
          // 最后一块可能不完整，留到下次继续拼
          buffer = blocks.pop() || ''
          for (const block of blocks) {
            if (!block.trim()) continue
            const blockLines = block.split('\n')
            let dataStr = ''
            for (const line of blockLines) {
              if (line.startsWith('data:')) {
                dataStr += line.substring(5)
              }
            }
            if (dataStr.trim()) {
              try {
                const eventData = JSON.parse(dataStr.trim())
                onEvent(eventData.type || 'event', eventData)
              } catch (e) {
                // ignore parse error
              }
            }
          }
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          onError?.(err)
        }
      })

    // 返回控制器，允许外部中断
    return controller
  }
}

/**
 * 爬虫执行历史API
 */
export class CrawlerExecutionApi {
  /**
   * 分页查询执行历史
   */
  static getExecutionList(params: any) {
    return request({
      url: '/api/crawler/execution/list',
      method: 'post',
      data: params
    })
  }

  /**
   * 获取执行历史详情
   */
  static getExecutionById(id: string) {
    return request({
      url: `/api/crawler/execution/get/${id}`,
      method: 'get'
    })
  }

  /**
   * 查询指定任务的执行历史
   */
  static getExecutionsByTaskId(taskId: string, limit = 10) {
    return request({
      url: `/api/crawler/execution/list/${taskId}`,
      method: 'get',
      params: { limit }
    })
  }

  /**
   * 获取统计数据
   */
  static getStatistics() {
    return request({
      url: '/api/crawler/execution/statistics',
      method: 'get'
    })
  }

  /**
   * 获取运行中的任务
   */
  static getRunningTasks() {
    return request({
      url: '/api/crawler/execution/running',
      method: 'get'
    })
  }
}

/**
 * 爬虫代理IP管理API
 */
export class CrawlerProxyApi {
  /**
   * 分页查询代理列表
   */
  static getProxyList(params: any) {
    return request({
      url: '/api/crawler/proxy/list',
      method: 'post',
      data: params
    })
  }

  /**
   * 创建代理
   */
  static createProxy(data: any) {
    return request({
      url: '/api/crawler/proxy/create',
      method: 'post',
      data
    })
  }

  /**
   * 更新代理
   */
  static updateProxy(data: any) {
    return request({
      url: '/api/crawler/proxy/update',
      method: 'put',
      data
    })
  }

  /**
   * 删除代理
   */
  static deleteProxy(id: string) {
    return request({
      url: `/api/crawler/proxy/delete/${id}`,
      method: 'delete'
    })
  }

  /**
   * 测试代理
   */
  static testProxy(id: string) {
    return request({
      url: `/api/crawler/proxy/test/${id}`,
      method: 'post'
    })
  }

  /**
   * 启用/禁用代理
   */
  static toggleProxy(id: string, status: string) {
    return request({
      url: `/api/crawler/proxy/toggle/${id}`,
      method: 'put',
      params: { status }
    })
  }
}

/**
 * 爬虫账号池管理API
 */
export class CrawlerAccountApi {
  /**
   * 分页查询账号列表
   */
  static getAccountList(params: any) {
    return request({
      url: '/api/crawler/account/list',
      method: 'post',
      data: params
    })
  }

  /**
   * 创建账号
   */
  static createAccount(data: any) {
    return request({
      url: '/api/crawler/account/create',
      method: 'post',
      data
    })
  }

  /**
   * 更新账号
   */
  static updateAccount(data: any) {
    return request({
      url: '/api/crawler/account/update',
      method: 'put',
      data
    })
  }

  /**
   * 删除账号
   */
  static deleteAccount(id: string) {
    return request({
      url: `/api/crawler/account/delete/${id}`,
      method: 'delete'
    })
  }

  /**
   * 启用/禁用账号
   */
  static toggleAccount(id: string, status: string) {
    return request({
      url: `/api/crawler/account/toggle/${id}`,
      method: 'put',
      params: { status }
    })
  }
}

/**
 * AI 爬虫 Agent 执行历史 API
 * 对应表：ai_crawler_execution
 */
export class AiCrawlerExecutionApi {
  /**
   * 分页查询 Agent 执行历史
   */
  static list(params: {
    taskId?: string
    status?: string
    page?: number
    pageSize?: number
  }) {
    return request({
      url: '/api/crawler/agent/execution/list',
      method: 'post',
      data: params
    })
  }

  /**
   * 获取执行详情（含完整 events 和 result_data）
   */
  static getById(id: string) {
    return request({
      url: `/api/crawler/agent/execution/${id}`,
      method: 'get'
    })
  }

  /**
   * 查询某任务的近期执行历史
   */
  static listByTask(taskId: string, limit = 10) {
    return request({
      url: `/api/crawler/agent/execution/task/${taskId}`,
      method: 'get',
      params: { limit }
    })
  }

  /**
   * 删除执行记录
   */
  static deleteById(id: string) {
    return request({
      url: `/api/crawler/agent/execution/${id}`,
      method: 'delete'
    })
  }

  /**
   * 统计数据（今日成功/失败/运行中）
   */
  static statistics() {
    return request({
      url: '/api/crawler/agent/execution/statistics',
      method: 'get'
    })
  }
}
