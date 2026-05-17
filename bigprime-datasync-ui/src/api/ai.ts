import request from '@/utils/request'

/**
 * AI 提供商 API
 */
export class AiProviderApi {
  static list() {
    return request({ url: '/api/ai/provider/list', method: 'get' })
  }
  static get(id: string) {
    return request({ url: `/api/ai/provider/${id}`, method: 'get' })
  }
  static save(data: any) {
    return request({ url: '/api/ai/provider/save', method: 'post', data })
  }
  static delete(id: string) {
    return request({ url: `/api/ai/provider/${id}`, method: 'delete' })
  }
}

/**
 * AI 模型 API
 */
export class AiModelApi {
  static list(providerId?: string) {
    return request({
      url: '/api/ai/provider/model/list',
      method: 'get',
      params: providerId ? { providerId } : {}
    })
  }
  static listByType(modelType: string) {
    return request({ url: '/api/ai/provider/model/list', method: 'get', params: { modelType } })
  }
  static save(data: any) {
    return request({ url: '/api/ai/provider/model/save', method: 'post', data })
  }
  static delete(id: string) {
    return request({ url: `/api/ai/provider/model/${id}`, method: 'delete' })
  }
}

/**
 * MCP 服务市场 API
 */
export class McpMarketApi {
  static list() {
    return request({ url: '/api/ai/mcp-market/list', method: 'get' })
  }
  static listByCategory(category: string) {
    return request({ url: `/api/ai/mcp-market/list/${category}`, method: 'get' })
  }
  static get(id: string) {
    return request({ url: `/api/ai/mcp-market/${id}`, method: 'get' })
  }
  static install(id: string, configValues?: Record<string, any>) {
    return request({ 
      url: `/api/ai/mcp-market/${id}/install`, 
      method: 'post',
      data: configValues || {}
    })
  }
  static save(data: any) {
    return request({ url: '/api/ai/mcp-market/save', method: 'post', data })
  }
  static delete(id: string) {
    return request({ url: `/api/ai/mcp-market/${id}`, method: 'delete' })
  }
}
export class McpServerApi {
  static list() {
    return request({ url: '/api/ai/mcp/list', method: 'get' })
  }
  static get(id: string) {
    return request({ url: `/api/ai/mcp/${id}`, method: 'get' })
  }
  static save(data: any) {
    return request({ url: '/api/ai/mcp/save', method: 'post', data })
  }
  static delete(id: string) {
    return request({ url: `/api/ai/mcp/${id}`, method: 'delete' })
  }
  static configure(id: string, configValues: string) {
    return request({
      url: `/api/ai/mcp/${id}/configure`,
      method: 'post',
      data: { configValues }
    })
  }
  /** 获取指定服务器的工具列表 */
  static listTools(id: string) {
    return request({ url: `/api/ai/mcp/${id}/tools`, method: 'get' })
  }
  /** 获取所有已启用服务器的工具列表 */
  static listAllTools() {
    return request({ url: '/api/ai/mcp/tools', method: 'get' })
  }
  /** 连通性测试：返回 { success, latencyMs, toolCount, message } */
  static testConnect(id: string) {
    return request({ url: `/api/ai/mcp/${id}/test-connect`, method: 'get' })
  }
  /** Debug 工具调用：返回原始 JSON 响应 */
  static debugCallTool(id: string, toolName: string, arguments_: Record<string, any> = {}) {
    return request({ url: `/api/ai/mcp/${id}/debug-tool`, method: 'post', data: { toolName, arguments: arguments_ } })
  }
  /** 注册本地内置 MCP Server */
  static registerLocal() {
    return request({ url: '/api/ai/mcp/register-local', method: 'post' })
  }
}

/**
 * 动态 MCP 工具 API（SQL/Python 发布为 MCP 工具）
 */
export class DynamicMcpToolApi {
  /** 查询已发布为 MCP 工具的 SQL API 列表 */
  static listSqlMcpTools() {
    return request({ url: '/api/sql-api/mcp-list', method: 'get' })
  }
  /** 取消 SQL API 的 MCP 发布 */
  static disableSqlMcp(id: number) {
    return request({ url: `/api/sql-api/${id}/disable-mcp`, method: 'post' })
  }
  /** 查询已发布为 MCP 工具的 Python 服务列表 */
  static listPythonMcpTools() {
    return request({ url: '/api/python/service/mcp-list', method: 'get' })
  }
  /** 取消 Python 服务的 MCP 发布 */
  static disablePythonMcp(id: string) {
    return request({ url: `/api/python/service/${id}/disable-mcp`, method: 'post' })
  }
}

/**
 * AI 对话 - 会话管理 API
 */
export class AiChatApi {
  static listSessions(source?: string) {
    return request({ url: '/api/ai/chat/session/list', method: 'get', params: source ? { source } : {} })
  }
  static createSession(data: { 
    assistantId?: string
    modelId: string
    title?: string
    systemPrompt?: string
    temperature?: number
    maxTokens?: number
    source?: string
  }) {
    return request({ url: '/api/ai/chat/session/create', method: 'post', data })
  }
  static deleteSession(id: string) {
    return request({ url: `/api/ai/chat/session/${id}`, method: 'delete' })
  }
  static listMessages(sessionId: string) {
    return request({ url: `/api/ai/chat/session/${sessionId}/messages`, method: 'get' })
  }
  static chat(sessionId: string, message: string) {
    return request({ url: `/api/ai/chat/session/${sessionId}/chat`, method: 'post', data: { message } })
  }
  /** 返回 SSE 流式 URL，前端自行创建 EventSource */
  static streamUrl(sessionId: string, message: string, token: string) {
    const encoded = encodeURIComponent(message)
    return `/api/ai/chat/session/${sessionId}/stream?message=${encoded}&token=${encodeURIComponent(token)}`
  }
}

/**
 * AI 助手 API
 */
export class AiAssistantApi {
  static list(category?: string) {
    return request({ url: '/api/ai/assistant/list', method: 'get', params: { category } })
  }
  static get(id: string) {
    return request({ url: `/api/ai/assistant/${id}`, method: 'get' })
  }
  static save(data: any) {
    return request({ url: '/api/ai/assistant/save', method: 'post', data })
  }
  static delete(id: string) {
    return request({ url: `/api/ai/assistant/${id}`, method: 'delete' })
  }
}

/**
 * AI 提示词 API
 */
export class AiPromptApi {
  static list(params?: { category?: string; isPublic?: number; keyword?: string }) {
    return request({ url: '/api/ai/prompt/list', method: 'get', params })
  }
  static publicList() {
    return request({ url: '/api/ai/prompt/public', method: 'get' })
  }
  static get(id: string) {
    return request({ url: `/api/ai/prompt/${id}`, method: 'get' })
  }
  static save(data: any) {
    return request({ url: '/api/ai/prompt/save', method: 'post', data })
  }
  static use(id: string) {
    return request({ url: `/api/ai/prompt/${id}/use`, method: 'post' })
  }
  static delete(id: string) {
    return request({ url: `/api/ai/prompt/${id}`, method: 'delete' })
  }
}

/**
 * AI 知识库 API
 */
export class AiKnowledgeApi {
  static list() {
    return request({ url: '/api/ai/knowledge/list', method: 'get' })
  }
  static get(id: string) {
    return request({ url: `/api/ai/knowledge/${id}`, method: 'get' })
  }
  static save(data: any) {
    return request({ url: '/api/ai/knowledge/save', method: 'post', data })
  }
  static delete(id: string) {
    return request({ url: `/api/ai/knowledge/${id}`, method: 'delete' })
  }
  static listDocuments(kbId: string) {
    return request({ url: `/api/ai/knowledge/${kbId}/documents`, method: 'get' })
  }
  static uploadDocument(kbId: string, data: any) {
    return request({ url: `/api/ai/knowledge/${kbId}/documents`, method: 'post', data })
  }
  static uploadFile(kbId: string, file: File) {
    const formData = new FormData()
    formData.append('file', file)
    return request({ url: `/api/ai/knowledge/${kbId}/documents/upload`, method: 'post', data: formData, headers: { 'Content-Type': 'multipart/form-data' } })
  }
  static getDocStatus(kbId: string, docId: string) {
    return request({ url: `/api/ai/knowledge/${kbId}/documents/${docId}/status`, method: 'get' })
  }
  static deleteDocument(kbId: string, docId: string) {
    return request({ url: `/api/ai/knowledge/${kbId}/documents/${docId}`, method: 'delete' })
  }
  static reVectorize(kbId: string, docId: string) {
    return request({ url: `/api/ai/knowledge/${kbId}/documents/${docId}/revectorize`, method: 'post' })
  }
  static getDocumentContent(kbId: string, docId: string) {
    return request({ url: `/api/ai/knowledge/${kbId}/documents/${docId}/content`, method: 'get' })
  }
  static updateDocumentContent(kbId: string, docId: string, content: string) {
    return request({ url: `/api/ai/knowledge/${kbId}/documents/${docId}/content`, method: 'put', data: { content } })
  }
  static search(kbId: string, query: string) {
    return request({ url: `/api/ai/knowledge/${kbId}/search`, method: 'get', params: { query } })
  }
  // 知识图谱相关
  static listGraphSchemas(kbId: string) {
    return request({ url: `/api/ai/knowledge/${kbId}/graph/schemas`, method: 'get' })
  }
  static saveGraphSchema(kbId: string, data: any) {
    return request({ url: `/api/ai/knowledge/${kbId}/graph/schemas`, method: 'post', data })
  }
  static updateGraphSchema(kbId: string, schemaId: string, data: any) {
    return request({ url: `/api/ai/knowledge/${kbId}/graph/schemas/${schemaId}`, method: 'put', data })
  }
  static deleteGraphSchema(kbId: string, schemaId: string) {
    return request({ url: `/api/ai/knowledge/${kbId}/graph/schemas/${schemaId}`, method: 'delete' })
  }
  static listGraphEntities(kbId: string, params?: { type?: string; keyword?: string; page?: number; pageSize?: number }) {
    return request({ url: `/api/ai/knowledge/${kbId}/graph/entities`, method: 'get', params })
  }
  static listGraphRelations(kbId: string, params?: { entityId?: string; relationType?: string; page?: number; pageSize?: number }) {
    return request({ url: `/api/ai/knowledge/${kbId}/graph/relations`, method: 'get', params })
  }
  static extractGraph(kbId: string, docId: string) {
    return request({ url: `/api/ai/knowledge/${kbId}/graph/extract`, method: 'post', params: { docId } })
  }
  static deleteGraphEntity(kbId: string, entityId: string) {
    return request({ url: `/api/ai/knowledge/${kbId}/graph/entities/${entityId}`, method: 'delete' })
  }
  static getGraphData(kbId: string, params?: { type?: string; limit?: number }) {
    return request({ url: `/api/ai/knowledge/${kbId}/graph/data`, method: 'get', params })
  }
}

/**
 * AI 记忆 API
 */
export class AiMemoryApi {
  static list(params?: { sessionId?: string; memoryType?: string }) {
    return request({ url: '/api/ai/memory/list', method: 'get', params })
  }
  static save(data: any) {
    return request({ url: '/api/ai/memory/save', method: 'post', data })
  }
  static delete(id: string) {
    return request({ url: `/api/ai/memory/${id}`, method: 'delete' })
  }
  static clear(sessionId?: string) {
    return request({ url: '/api/ai/memory/clear', method: 'delete', params: sessionId ? { sessionId } : {} })
  }
}

/**
 * AI 用量统计 API
 */
export class AiUsageApi {
  static recordsPage(params?: { startDate?: string; endDate?: string; modelId?: string; page?: number; limit?: number }) {
    return request({ url: '/api/ai/usage/records/page', method: 'get', params })
  }
  static records(params?: { startDate?: string; endDate?: string; modelId?: string }) {
    return request({ url: '/api/ai/usage/records', method: 'get', params })
  }
  static adminRecords(params?: { userId?: string; startDate?: string; endDate?: string }) {
    return request({ url: '/api/ai/usage/admin/records', method: 'get', params })
  }
  static summary() {
    return request({ url: '/api/ai/usage/summary', method: 'get' })
  }
}

/**
 * AI 网络搜索 API
 */
export class AiSearchApi {
  static listConfigs() {
    return request({ url: '/api/ai/search/configs', method: 'get' })
  }
  static saveConfig(data: any) {
    return request({ url: '/api/ai/search/config', method: 'post', data })
  }
  static deleteConfig(id: string) {
    return request({ url: `/api/ai/search/config/${id}`, method: 'delete' })
  }
  static test(keyword: string, engine?: string) {
    return request({ url: '/api/ai/search/test', method: 'get', params: { keyword, engine } })
  }
}

/**
 * AI 技能管理 API —— 已迁移至 @/api/skill.ts，请使用 AiSkillApi from '@/api/skill'
 * @deprecated 请勿再引用此类
 */
// AiSkillApi 已移除，详见 src/api/skill.ts


/**
 * Agent 执行 API
 */
export class AgentApi {
  /** 同步执行 Agent */
  static execute(data: {
    assistantId?: string
    modelId?: string
    userMessage: string
    enabledMcpServerIds?: string[]
    maxSteps?: number
    systemPrompt?: string
  }) {
    return request({ url: '/api/ai/agent/execute', method: 'post', data })
  }

  /**
   * 流式执行 Agent - 返回 SSE URL（先端自行创建 EventSource）
   * 参数中需传入 token（与对话流式接口一致）
   */
  static streamUrl(params: {
    assistantId: string
    userMessage: string
    sessionId?: string
    mcpServerIds?: string
    maxSteps?: number
    token: string
  }) {
    const { assistantId, userMessage, sessionId, mcpServerIds, maxSteps, token } = params
    const query = new URLSearchParams()
    query.set('assistantId', assistantId)
    query.set('userMessage', userMessage)
    query.set('token', token)
    if (sessionId) query.set('sessionId', sessionId)
    if (mcpServerIds) query.set('mcpServerIds', mcpServerIds)
    if (maxSteps) query.set('maxSteps', String(maxSteps))
    return `/api/ai/agent/stream?${query.toString()}`
  }
}

/**
 * 外部 Agent 平台配置 API
 */
export class AiExternalAgentApi {
  static list() {
    return request({ url: '/api/ai/external-agent/list', method: 'get' })
  }
  static get(id: string) {
    return request({ url: `/api/ai/external-agent/${id}`, method: 'get' })
  }
  static save(data: any) {
    return request({ url: '/api/ai/external-agent/save', method: 'post', data })
  }
  static delete(id: string) {
    return request({ url: `/api/ai/external-agent/${id}`, method: 'delete' })
  }
  static setEnabled(id: string, enabled: boolean) {
    return request({ url: `/api/ai/external-agent/${id}/enabled`, method: 'post', params: { enabled } })
  }
  static test(data: { provider: string; baseUrl: string; apiKey: string; agentId?: string }) {
    return request({ url: '/api/ai/external-agent/test', method: 'post', data })
  }
}

/**
 * 外部 API Key 管理
 */
export class AiApiKeyApi {
  /** 获取 API Key 列表（不传 assistantId 则查当前用户所有） */
  static list(assistantId?: string) {
    const params: any = {}
    if (assistantId) params.assistantId = assistantId
    return request({ url: '/api/ai/apikey/list', method: 'get', params })
  }
  /** 生成新 API Key */
  static generate(data: { assistantId?: string; name: string; expireDays?: number }) {
    return request({ url: '/api/ai/apikey/generate', method: 'post', data })
  }
  /** 启用/禁用 Key */
  static setStatus(id: string, status: number) {
    return request({ url: `/api/ai/apikey/${id}/status`, method: 'post', params: { status } })
  }
  /** 删除 Key */
  static delete(id: string) {
    return request({ url: `/api/ai/apikey/${id}`, method: 'delete' })
  }
}

/**
 * SQL API 管理（复用 SQL 开发功能）
 * 用于 MCP 管理页展示已发布为 MCP 工具的 SQL API
 */
export class SqlApiApi {
  /** 查询已发布为 MCP 工具的 SQL API 列表 */
  static listPublishedAsMcp() {
    return request({ url: '/api/sql-api/mcp-list', method: 'get' })
  }
  /** 取消发布为 MCP 工具 */
  static disableMcp(id: string) {
    return request({ url: `/api/sql-api/${id}/disable-mcp`, method: 'post' })
  }
}

/**
 * AI 代码补全 API
 */
export class AiCodeApi {
  /** 请求代码补全建议 */
  static complete(data: {
    assistantId: string
    prefix: string
    suffix: string
    language: string
    importedFiles?: { name: string; content: string }[]
    installedPackages?: string
  }) {
    return request({ url: '/api/ai/code/complete', method: 'post', data })
  }
}
