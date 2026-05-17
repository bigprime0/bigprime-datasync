import request from '@/utils/request'

/**
 * 告警规则API
 */
export const AlertRuleApi = {
  /**
   * 分页查询规则列表
   */
  getRuleList(params: any) {
    return request({
      url: '/api/alert/rule/list',
      method: 'post',
      data: params
    })
  },

  /**
   * 获取规则详情
   */
  getRuleById(id: number) {
    return request({
      url: `/api/alert/rule/get/${id}`,
      method: 'get'
    })
  },

  /**
   * 创建规则
   */
  createRule(data: any) {
    return request({
      url: '/api/alert/rule/create',
      method: 'post',
      data
    })
  },

  /**
   * 更新规则
   */
  updateRule(data: any) {
    return request({
      url: '/api/alert/rule/update',
      method: 'post',
      data
    })
  },

  /**
   * 删除规则
   */
  deleteRule(id: number) {
    return request({
      url: `/api/alert/rule/delete/${id}`,
      method: 'post'
    })
  },

  /**
   * 启用/禁用规则
   */
  toggleRule(id: number, data: any) {
    return request({
      url: `/api/alert/rule/toggle/${id}`,
      method: 'post',
      data
    })
  },

  /**
   * 验证表达式
   */
  validateExpression(data: any) {
    return request({
      url: '/api/alert/rule/validate',
      method: 'post',
      data
    })
  },

  /**
   * 测试表达式
   */
  testExpression(data: any) {
    return request({
      url: '/api/alert/rule/test',
      method: 'post',
      data
    })
  },

  /**
   * 按模块查询规则
   */
  getRulesByModule(module: string) {
    return request({
      url: `/api/alert/rule/module/${module}`,
      method: 'get'
    })
  }
}

/**
 * 告警历史API
 */
export const AlertHistoryApi = {
  /**
   * 分页查询告警历史
   */
  getHistoryList(params: any) {
    return request({
      url: '/api/alert/history/list',
      method: 'post',
      data: params
    })
  },

  /**
   * 查询活跃告警
   */
  getActiveAlerts() {
    return request({
      url: '/api/alert/history/active',
      method: 'get'
    })
  },

  /**
   * 按模块查询活跃告警
   */
  getActiveAlertsByModule(module: string) {
    return request({
      url: `/api/alert/history/active/module/${module}`,
      method: 'get'
    })
  },

  /**
   * 查询告警详情
   */
  getAlertById(alertId: string) {
    return request({
      url: `/api/alert/history/${alertId}`,
      method: 'get'
    })
  },

  /**
   * 解决告警
   */
  resolveAlert(alertId: string, data: any) {
    return request({
      url: `/api/alert/history/${alertId}/resolve`,
      method: 'post',
      data
    })
  },

  /**
   * 忽略告警
   */
  ignoreAlert(alertId: string, data: any) {
    return request({
      url: `/api/alert/history/${alertId}/ignore`,
      method: 'post',
      data
    })
  },

  /**
   * 统计活跃告警数
   */
  countActiveAlerts() {
    return request({
      url: '/api/alert/history/stats/active-count',
      method: 'get'
    })
  },

  /**
   * 按级别统计告警
   */
  countActiveAlertsByLevel(level: string) {
    return request({
      url: `/api/alert/history/stats/active-count/${level}`,
      method: 'get'
    })
  },

  /**
   * 统计告警数据（带环比）
   */
  getAlertStatsWithTrend(hours: number = 24) {
    return request({
      url: '/api/alert/history/stats/trend',
      method: 'get',
      params: { hours }
    })
  },

  /**
   * 获取按小时统计的趋势数据
   */
  getHourlyTrend(hours: number = 24) {
    return request({
      url: '/api/alert/history/stats/hourly-trend',
      method: 'get',
      params: { hours }
    })
  }
}

/**
 * 告警消息模板API
 */
export const AlertTemplateApi = {
  /**
   * 分页查询模板列表
   */
  getTemplateList(params: any) {
    return request({
      url: '/api/alert/template/page',
      method: 'get',
      params
    })
  },

  /**
   * 获取所有模板
   */
  getAllTemplates() {
    return request({
      url: '/api/alert/template/list',
      method: 'get'
    })
  },

  /**
   * 获取启用的模板
   */
  getEnabledTemplates() {
    return request({
      url: '/api/alert/template/list/enabled',
      method: 'get'
    })
  },

  /**
   * 根据ID获取模板
   */
  getTemplateById(id: number) {
    return request({
      url: `/api/alert/template/get/${id}`,
      method: 'get'
    })
  },

  /**
   * 创建模板
   */
  createTemplate(data: any) {
    return request({
      url: '/api/alert/template/create',
      method: 'post',
      data
    })
  },

  /**
   * 更新模板
   */
  updateTemplate(data: any) {
    return request({
      url: '/api/alert/template/update',
      method: 'post',
      data
    })
  },

  /**
   * 删除模板
   */
  deleteTemplate(id: number) {
    return request({
      url: `/api/alert/template/delete/${id}`,
      method: 'delete'
    })
  },

  /**
   * 设置默认模板
   */
  setDefaultTemplate(id: number) {
    return request({
      url: `/api/alert/template/setDefault/${id}`,
      method: 'post'
    })
  },

  /**
   * 提取模板变量
   */
  extractVariables(templateContent: string) {
    return request({
      url: '/api/alert/template/extractVariables',
      method: 'post',
      data: { templateContent }
    })
  },

  /**
   * 初始化默认模板
   */
  initDefaultTemplates() {
    return request({
      url: '/api/alert/template/initDefaults',
      method: 'post'
    })
  },

  /**
   * 获取支持的变量列表
   */
  getSupportedVariables() {
    return request({
      url: '/api/alert/template/variables',
      method: 'get'
    })
  }
}
