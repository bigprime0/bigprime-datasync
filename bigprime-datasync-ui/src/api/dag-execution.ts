/**
 * DAG执行相关API
 */
import request from '@/utils/request'

export interface DagExecutionRecord {
  id: string
  dagId: string
  dagName: string
  status: string
  totalNodes: number
  completedNodes: number
  failedNodes: number
  progress: number
  startTime: string
  endTime?: string
  duration?: number
  collapsedNodes?: string
  dagConfig?: string
}

export interface DagNodeExecutionRecord {
  id: string
  executionId: string
  nodeId: string
  nodeName: string
  nodeType: string
  status: string
  startTime: string
  endTime?: string
  duration?: number
  errorMessage?: string
  metadata?: string
  // 外部任务相关字段
  externalJobId?: string
  externalJobStatus?: string
  externalJobUrl?: string
  externalMetrics?: string
}

/**
 * 获取DAG执行记录列表
 */
export function getDagExecutionList(params?: {
  dagId?: string
  status?: string
  page?: number
  pageSize?: number
}) {
  return request({
    url: '/dag/execution/list',
    method: 'get',
    params
  })
}

/**
 * 获取DAG执行详情
 */
export function getDagExecutionDetail(executionId: string) {
  return request({
    url: `/api/dag/execution/get/${executionId}`,
    method: 'get'
  })
}

/**
 * 获取DAG执行的节点列表
 */
export function getDagExecutionNodes(executionId: string) {
  return request({
    url: `/api/dag/execution/nodes/${executionId}`,
    method: 'get'
  })
}

/**
 * 暂停DAG执行
 */
export function pauseDagExecution(executionId: string) {
  return request({
    url: `/api/dag/execution/pause/${executionId}`,
    method: 'post'
  })
}

/**
 * 恢复DAG执行
 */
export function resumeDagExecution(executionId: string) {
  return request({
    url: `/api/dag/execution/resume/${executionId}`,
    method: 'post'
  })
}

/**
 * 取消DAG执行
 */
export function cancelDagExecution(executionId: string) {
  return request({
    url: `/api/dag/execution/cancel/${executionId}`,
    method: 'post'
  })
}

/**
 * 获取收拢映射关系
 */
export function getCollapsedMappings(executionId: string) {
  return request({
    url: `/api/dag/execution/${executionId}/collapsed-mappings`,
    method: 'get'
  })
}

/**
 * 删除DAG执行记录
 */
export function deleteDagExecution(executionId: string) {
  return request({
    url: `/api/dag/execution/${executionId}`,
    method: 'delete'
  })
}

/**
 * DAG执行API对象（使用POST请求的分页查询）
 */
export const dagExecutionApi = {
  /**
   * 分页查询执行历史（POST请求）
   */
  list(params?: {
    flowId?: string
    status?: string
    page?: number
    pageSize?: number
  }) {
    return request({
      url: '/api/dag/execution/list',
      method: 'post',
      data: params
    })
  },

  /**
   * 获取执行详情
   */
  getDetail(executionId: string) {
    return request({
      url: `/api/dag/execution/get/${executionId}`,
      method: 'get'
    })
  },

  /**
   * 获取节点执行记录
   */
  getNodes(executionId: string) {
    return request({
      url: `/api/dag/execution/nodes/${executionId}`,
      method: 'get'
    })
  },

  /**
   * 删除执行记录
   */
  delete(executionId: string) {
    return request({
      url: `/api/dag/execution/delete/${executionId}`,
      method: 'delete'
    })
  },

  /**
   * 暂停执行
   */
  pause(executionId: string) {
    return request({
      url: `/api/dag/execution/pause/${executionId}`,
      method: 'post'
    })
  },

  /**
   * 恢复执行
   */
  resume(executionId: string) {
    return request({
      url: `/api/dag/execution/resume/${executionId}`,
      method: 'post'
    })
  },

  /**
   * 取消执行
   */
  cancel(executionId: string) {
    return request({
      url: `/api/dag/execution/cancel/${executionId}`,
      method: 'post'
    })
  },
  
  /**
   * 获取外部任务历史日志（内存缓存）
   */
  getExternalLogs(executionId: string) {
    return request({
      url: `/api/dag/execution/external-logs/${executionId}`,
      method: 'get'
    })
  },
  
  /**
   * 获取DAG执行日志（数据库持久化）
   */
  getExecutionLogs(executionId: string) {
    return request({
      url: `/api/dag/execution/logs/${executionId}`,
      method: 'get'
    })
  },
  
  /**
   * 重新查询统一日志（从Loki重新查询，解决日志延迟问题）
   */
  refreshUnifiedLogs(executionId: string) {
    return request({
      url: `/api/dag/execution/unified-logs/${executionId}`,
      method: 'get'
    })
  }
}
