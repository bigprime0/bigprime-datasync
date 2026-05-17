import request from '@/utils/request'

const BASE_URL = '/api'

// Catalog API
export const catalogApi = {
  // 创建Catalog
  create: (data: any) => {
    return request.post(`${BASE_URL}/catalog/create`, data)
  },
  
  // 删除Catalog
  delete: (catalogName: string) => {
    return request.delete(`${BASE_URL}/catalog/${catalogName}`)
  },
  
  // 查询Catalog列表
  list: () => {
    return request.get(`${BASE_URL}/catalog/list`)
  },
  
  // 刷新Catalog
  refresh: (catalogName: string) => {
    return request.post(`${BASE_URL}/catalog/${catalogName}/refresh`)
  },
  
  // 获取数据库列表
  getDatabases: (catalogName: string) => {
    return request.get(`${BASE_URL}/catalog/${catalogName}/databases`)
  },
  
  // 获取表列表
  getTables: (catalogName: string, database: string) => {
    return request.get(`${BASE_URL}/catalog/${catalogName}/${database}/tables`)
  },
  
  // 获取字段列表
  getColumns: (catalogName: string, database: string, table: string) => {
    return request.get(`${BASE_URL}/catalog/${catalogName}/${database}/${table}/columns`)
  }
}

// Query API
export const queryApi = {
  // 执行查询
  execute: (data: any) => {
    return request.post(`${BASE_URL}/query/execute`, data)
  },
  
  // 查看执行计划
  explain: (data: any) => {
    return request.post(`${BASE_URL}/query/explain`, data)
  },
  
  // 获取查询历史
  getHistory: (limit: number = 20) => {
    return request.get(`${BASE_URL}/query/history`, { params: { limit } })
  }
}

// Metadata API
export const metadataApi = {
  // 获取数据库列表
  getDatabases: (catalogName: string) => {
    return request.get(`${BASE_URL}/metadata/${catalogName}/databases`)
  },
  
  // 获取表列表
  getTables: (catalogName: string, database: string) => {
    return request.get(`${BASE_URL}/metadata/${catalogName}/${database}/tables`)
  },
  
  // 获取字段列表
  getColumns: (catalogName: string, database: string, table: string) => {
    return request.get(`${BASE_URL}/metadata/${catalogName}/${database}/${table}/columns`)
  }
}

// Connector API (用于获取连接器列表)
export const connectorApi = {
  list: () => {
    return request.post('/api/connector/list', {
      search: '',
      page: 1,
      pageSize: 1000
    })
  }
}

// SQL API管理
export const sqlApiApi = {
  publish: (data: any) => request.post(`${BASE_URL}/sql-api/publish`, data),
  list: () => request.get(`${BASE_URL}/sql-api/list`),
  get: (id: number) => request.get(`${BASE_URL}/sql-api/${id}`),
  update: (id: number, data: any) => request.put(`${BASE_URL}/sql-api/${id}`, data),
  delete: (id: number) => request.delete(`${BASE_URL}/sql-api/${id}`),
  toggle: (id: number, enabled: boolean) => request.put(`${BASE_URL}/sql-api/${id}/toggle`, null, { params: { enabled } }),
  invoke: (path: string, params: any) => request.post(`${BASE_URL}/sql-api/invoke${path}`, params)
}

// 慢查询API
export const slowQueryApi = {
  // 分页查询慢查询列表
  list: (params: any) => request.get(`${BASE_URL}/query/slow/list`, { params }),
  
  // 获取慢查询统计
  statistics: () => request.get(`${BASE_URL}/query/slow/statistics`),
  
  // 删除慢查询记录
  delete: (id: number) => request.delete(`${BASE_URL}/query/slow/${id}`),
  
  // 获取慢查询配置
  getConfig: () => request.get(`${BASE_URL}/query/slow/config`),
  
  // 更新慢查询配置
  updateConfig: (data: any) => request.post(`${BASE_URL}/query/slow/config`, data)
}

// 执行计划分析API
export const executionPlanApi = {
  // 分析执行计划
  analyze: (data: any) => request.post(`${BASE_URL}/query/explain/analyze`, data)
}
