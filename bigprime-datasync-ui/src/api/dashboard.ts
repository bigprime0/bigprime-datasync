import request from '@/utils/request'

const BASE_URL = '/api'

// Dashboard API
export const dashboardApi = {
  // 获取Dashboard核心指标概览
  getOverview: () => {
    return request.get(`${BASE_URL}/dashboard/overview`)
  },

  // 获取任务执行趋势
  getExecutionTrend: (timeRange: string = '24h') => {
    return request.get(`${BASE_URL}/dashboard/execution-trend`, { params: { timeRange } })
  },

  // 获取数据传输趋势
  getTransferTrend: (timeRange: string = '24h') => {
    return request.get(`${BASE_URL}/dashboard/transfer-trend`, { params: { timeRange } })
  },

  // 获取连接器健康分布
  getConnectorHealth: () => {
    return request.get(`${BASE_URL}/dashboard/connector-health`)
  },

  // 获取TOP连接器
  getTopConnectors: (limit: number = 10) => {
    return request.get(`${BASE_URL}/dashboard/top-connectors`, { params: { limit } })
  },

  // 获取任务类型分布
  getTaskDistribution: () => {
    return request.get(`${BASE_URL}/dashboard/task-distribution`)
  },

  // 获取运行中任务列表
  getRunningTasks: (limit: number = 10) => {
    return request.get(`${BASE_URL}/dashboard/running-tasks`, { params: { limit } })
  },

  // 获取失败任务列表
  getFailedTasks: (limit: number = 10) => {
    return request.get(`${BASE_URL}/dashboard/failed-tasks`, { params: { limit } })
  }
}
