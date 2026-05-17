import request from '@/utils/request'

/**
 * DAG触发器管理API
 */

// 创建触发器
export function createTrigger(data: any) {
  return request({
    url: '/api/trigger/create',
    method: 'post',
    data
  })
}

// 更新触发器
export function updateTrigger(data: any) {
  return request({
    url: '/api/trigger/update',
    method: 'put',
    data
  })
}

// 启用触发器
export function enableTrigger(id: string) {
  return request({
    url: `/api/trigger/enable/${id}`,
    method: 'put'
  })
}

// 停用触发器
export function disableTrigger(id: string) {
  return request({
    url: `/api/trigger/disable/${id}`,
    method: 'put'
  })
}

// 立即触发一次
export function fireNow(id: string) {
  return request({
    url: `/api/trigger/fireNow/${id}`,
    method: 'post'
  })
}

// 分页查询触发器列表
export function getTriggerList(params: any) {
  return request({
    url: '/api/trigger/list',
    method: 'post',
    data: params
  })
}

// 根据DAG定义ID查询触发器列表
export function getTriggersByDagId(dagDefinitionId: string) {
  return request({
    url: `/api/trigger/list/${dagDefinitionId}`,
    method: 'get'
  })
}

// 获取触发器详情
export function getTrigger(id: string) {
  return request({
    url: `/api/trigger/get/${id}`,
    method: 'get'
  })
}

// 删除触发器
export function deleteTrigger(id: string) {
  return request({
    url: `/api/trigger/delete/${id}`,
    method: 'delete'
  })
}

// 预览Cron表达式触发时间
export function previewCron(cronExpression: string, count: number = 5) {
  return request({
    url: '/api/trigger/preview',
    method: 'post',
    data: { cronExpression, count }
  })
}
