import request from '@/utils/request'
import { getToken } from '@/utils/token'

const BASE_URL = '/api/python'

// Workspace 管理
export const pythonWorkspaceApi = {
  // 创建 Workspace
  create: (data: { name: string; description?: string }) =>
    request.post(`${BASE_URL}/workspace/create`, data),

  // 更新 Workspace
  update: (data: { id: string; name: string; description?: string }) =>
    request.post(`${BASE_URL}/workspace/update`, data),

  // 删除 Workspace
  remove: (id: string) => request.delete(`${BASE_URL}/workspace/delete/${id}`),

  // 获取详情
  get: (id: string) => request.get(`${BASE_URL}/workspace/get/${id}`),

  // 分页列表
  list: (params?: { search?: string; page?: number; pageSize?: number }) =>
    request.post(`${BASE_URL}/workspace/list`, params || {}),

  // 全量列表（用于下拉选择）
  listAll: () => request.get(`${BASE_URL}/workspace/listAll`),

  // 保存代码到 Workspace 文件
  saveCode: (workspaceId: string, filename: string, content: string) =>
    request.post(`${BASE_URL}/workspace/save-code/${workspaceId}`, { filename, content }),

  // 加载 Workspace 文件代码
  loadCode: (workspaceId: string, filename?: string) =>
    request.get(`${BASE_URL}/workspace/load-code/${workspaceId}`, {
      params: { filename: filename || 'main.py' }
    }),

  // 删除 Workspace 下的代码文件
  deleteCode: (workspaceId: string, filename: string) =>
    request.delete(`${BASE_URL}/workspace/delete-code/${workspaceId}`, {
      params: { filename }
    }),

  // 重命名 Workspace 下的代码文件
  renameCode: (workspaceId: string, oldName: string, newName: string) =>
    request.post(`${BASE_URL}/workspace/rename-code/${workspaceId}`, { oldName, newName }),

  // 列出 scripts/ 下的文件树
  listFiles: (workspaceId: string) =>
    request.get(`${BASE_URL}/workspace/list-files/${workspaceId}`),

  // 创建新 .py 文件（指定相对路径）
  createFile: (workspaceId: string, path: string) =>
    request.post(`${BASE_URL}/workspace/create-file/${workspaceId}`, { path }),

  // 创建 Python 包（目录 + __init__.py）
  createPackage: (workspaceId: string, path: string) =>
    request.post(`${BASE_URL}/workspace/create-package/${workspaceId}`, { path })
}

// Kernel 网关管理
export const pythonKernelApi = {
  // 查询 KernelGateway 运行状态
  gatewayStatus: () => request.get(`${BASE_URL}/kernel/gateway/status`),
  
  // 查询指定 Workspace 的 Kernel 连接状态
  kernelStatus: (workspaceId: string) => request.get(`${BASE_URL}/kernel/status/${workspaceId}`),

  // 手动启动 KernelGateway
  gatewayStart: () => request.post(`${BASE_URL}/kernel/gateway/start`),

  // 手动停止 KernelGateway
  gatewayStop: () => request.post(`${BASE_URL}/kernel/gateway/stop`),

  // 启动 Workspace Kernel
  startKernel: (workspaceId: string) =>
    request.post(`${BASE_URL}/kernel/start/${workspaceId}`),

  // 停止 Workspace Kernel
  stopKernel: (workspaceId: string) =>
    request.post(`${BASE_URL}/kernel/stop/${workspaceId}`)
}

// 代码执行（SSE 流式，需手动创建 EventSource）
export const pythonExecuteApi = {
  // 获取 SSE 执行地址（由调用方创建 EventSource）
  getExecuteUrl: (workspaceId: string) =>
    `${import.meta.env.VITE_API_URL}${BASE_URL}/ide/execute/${workspaceId}`,

  // 代码补全
  complete: (workspaceId: string, data: { code: string; cursorPos: number }) =>
    request.post(`${BASE_URL}/ide/complete/${workspaceId}`, data),

  // 获取调试 SSE 地址
  getDebugUrl: (workspaceId: string) =>
    `${import.meta.env.VITE_API_URL}${BASE_URL}/ide/debug/init/${workspaceId}`,

  // 设置断点
  setBreakpoints: (workspaceId: string, data: { filePath: string; lines: number[] }) =>
    request.post(`${BASE_URL}/ide/debug/breakpoints/${workspaceId}`, data),

  // 继续执行
  debugContinue: (workspaceId: string, data?: { threadId?: number }) =>
    request.post(`${BASE_URL}/ide/debug/continue/${workspaceId}`, data || {}),

  // 单步跳过
  stepOver: (workspaceId: string, data?: { threadId?: number }) =>
    request.post(`${BASE_URL}/ide/debug/stepOver/${workspaceId}`, data || {}),

  // 单步进入
  stepIn: (workspaceId: string, data?: { threadId?: number }) =>
    request.post(`${BASE_URL}/ide/debug/stepIn/${workspaceId}`, data || {}),

  // 单步跳出
  stepOut: (workspaceId: string, data?: { threadId?: number }) =>
    request.post(`${BASE_URL}/ide/debug/stepOut/${workspaceId}`, data || {}),

  // 获取变量
  getVariables: (workspaceId: string, frameId: number) =>
    request.post(`${BASE_URL}/ide/debug/variables/${workspaceId}`, { frameId }),

  // 获取调用栈
  getStackTrace: (workspaceId: string, threadId: number) =>
    request.post(`${BASE_URL}/ide/debug/stackTrace/${workspaceId}`, { threadId }),

  // 停止调试
  stopDebug: (workspaceId: string) =>
    request.post(`${BASE_URL}/ide/debug/stop/${workspaceId}`),

  // 以调试模式执行代码（debugCell）
  // 必须先调用 initDebug SSE 建立会话并设好断点，再调用此接口
  debugRun: (workspaceId: string, code: string, filename: string) =>
    request.post(`${BASE_URL}/ide/debug/run/${workspaceId}`, { code, filename }),

  // 获取已安装的 pip 包列表
  listPackages: (workspaceId: string) =>
    request.get(`${BASE_URL}/ide/packages/${workspaceId}`)
}

// 版本备份
export const pythonBackupApi = {
  // 创建备份
  create: (workspaceId: string, remark: string) =>
    request.post(`${BASE_URL}/ide/backup/create/${workspaceId}`, null, { params: { remark } }),

  // 备份列表
  list: (workspaceId: string) =>
    request.get(`${BASE_URL}/ide/backup/list/${workspaceId}`),

  // 恢复备份
  restore: (workspaceId: string, backupId: string) =>
    request.post(`${BASE_URL}/ide/backup/restore/${workspaceId}`, null, { params: { backupId } }),

  // 删除备份
  remove: (workspaceId: string, backupId: string) =>
    request.delete(`${BASE_URL}/ide/backup/delete/${workspaceId}`, { params: { backupId } })
}

// 脚本发布服务
export const pythonServiceApi = {
  // 发布脚本为 HTTP 服务
  publish: (data: {
    workspaceId: string
    scriptName: string
    serviceName: string
    apiKey: string
    description?: string
    effectiveStart?: string | null
    effectiveEnd?: string | null
  }) => request.post(`${BASE_URL}/service/publish`, data),

  // 查询 Workspace 下所有发布服务
  list: (workspaceId: string) =>
    request.get(`${BASE_URL}/service/list/${workspaceId}`),

  // 查询服务详情
  get: (id: string) => request.get(`${BASE_URL}/service/get/${id}`),

  // 更新生效时间
  updateTime: (id: string, data: { effectiveStart?: string | null; effectiveEnd?: string | null }) =>
    request.post(`${BASE_URL}/service/update-time/${id}`, data),

  // 启用服务
  enable: (id: string) => request.post(`${BASE_URL}/service/enable/${id}`),

  // 停用服务
  disable: (id: string) => request.post(`${BASE_URL}/service/disable/${id}`),

  // 删除服务
  remove: (id: string) => request.delete(`${BASE_URL}/service/delete/${id}`)
}

/**
 * 创建 SSE 执行连接（POST + SSE，使用 fetch 实现）
 * @param workspaceId workspace ID
 * @param code 执行代码
 * @param onMessage 消息回调
 * @param onComplete 完成回调
 * @param onError 错误回调
 * @returns 取消函数
 */
export function createExecuteSse(
  workspaceId: string,
  code: string,
  onMessage: (data: string) => void,
  onComplete: () => void,
  onError: (err: string) => void
): () => void {
  const controller = new AbortController()
  const url = `${import.meta.env.VITE_API_URL}${BASE_URL}/ide/execute/${workspaceId}`

  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: getToken() || '',
      'Accept-Language': 'zh'
    },
    body: JSON.stringify({ code }),
    signal: controller.signal
  })
    .then(async (response) => {
      if (!response.ok) {
        onError(`请求失败: ${response.status}`)
        return
      }
      const reader = response.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          onComplete()
          break
        }
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        for (const line of lines) {
          if (line.startsWith('data:')) {
            const data = line.slice(5).trim()
            if (data === '[DONE]') {
              onComplete()
              return
            }
            onMessage(data)
          }
        }
      }
    })
    .catch((err) => {
      if (err.name !== 'AbortError') {
        onError(err.message)
      }
    })

  return () => controller.abort()
}
