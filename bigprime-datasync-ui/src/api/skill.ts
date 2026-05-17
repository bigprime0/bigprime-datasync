import request from '@/utils/request'
import axios from 'axios'
import { getToken } from '@/utils/token'

/**
 * AI 技能（Skill）API
 *
 * 技能 = SKILL.md 规范文本，注入助手 System Prompt，不承担工具调用职责。
 */
export class AiSkillApi {
  /**
   * 查询技能列表
   * @param params.category   分类过滤
   * @param params.sourceType 来源类型过滤（IMPORTED / CUSTOM / BUILTIN）
   * @param params.status     状态过滤（1-启用 0-禁用）
   */
  static list(params?: { category?: string; sourceType?: string; status?: number }) {
    return request({ url: '/api/ai/skill/list', method: 'get', params })
  }

  /** 查询所有启用的技能（供助手绑定选择） */
  static listEnabled() {
    return request({ url: '/api/ai/skill/enabled', method: 'get' })
  }

  /** 获取技能详情 */
  static get(id: string) {
    return request({ url: `/api/ai/skill/${id}`, method: 'get' })
  }

  /**
   * 新增或更新技能（在线编写）
   * @param data 技能表单数据（含 skillMd 字段）
   */
  static save(data: {
    id?: string
    name: string
    displayName?: string
    description?: string
    skillMd?: string
    category?: string
    tags?: string
    sourceType?: string
    version?: string
    icon?: string
    isPublic?: number
    status?: number
    sortOrder?: number
  }) {
    return request({ url: '/api/ai/skill/save', method: 'post', data })
  }

  /** 删除技能（同时级联删除附件文件） */
  static delete(id: string) {
    return request({ url: `/api/ai/skill/${id}`, method: 'delete' })
  }

  // ==================== ZIP 导入 ====================

  /**
   * 从 ZIP 包导入技能
   * ZIP 包需包含 SKILL.md（YAML frontmatter + Markdown 正文）
   * 可选包含 references/ 目录（参考文档）
   * @param file ZIP 文件对象
   * @returns 导入成功的 Skill ID 列表
   */
  static importZip(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    // request 封装层全局固定了 Content-Type: application/json，上传文件必须用原生 axios 并手动指定 multipart/form-data
    const baseURL = (import.meta.env.VITE_API_URL as string) || ''
    return axios.post(`${baseURL}/api/ai/skill/import`, formData, {
      headers: {
        'Authorization': getToken() || '',
        'Content-Type': 'multipart/form-data'
      }
    }).then(res => res.data)
  }

  // ==================== 附件文件 ====================

  /** 查询技能的所有附件文件 */
  static listFiles(id: string) {
    return request({ url: `/api/ai/skill/${id}/files`, method: 'get' })
  }

  /**
   * 查询技能指定类型的附件文件
   * @param fileType REFERENCE | SCRIPT | ASSET
   */
  static listFilesByType(id: string, fileType: 'REFERENCE' | 'SCRIPT' | 'ASSET') {
    return request({ url: `/api/ai/skill/${id}/files/${fileType}`, method: 'get' })
  }

  /**
   * 读取指定路径的文件内容（精确读取，不走向量检索）
   * @param id       Skill ID
   * @param filePath 相对路径，如 references/connectors/source/mysql-cdc.md
   */
  static readFileContent(id: string, filePath: string) {
    return request({
      url: `/api/ai/skill/${id}/file/content`,
      method: 'get',
      params: { filePath }
    })
  }

  /**
   * 在线创建或更新单个 reference 文件
   * @param id       Skill ID
   * @param filePath 文件相对路径（如 references/xxx.md）
   * @param content  文件内容
   */
  static saveFile(id: string, filePath: string, content: string) {
    return request({
      url: `/api/ai/skill/${id}/file/save`,
      method: 'post',
      params: { filePath },
      data: content,
      headers: { 'Content-Type': 'text/plain' }
    })
  }

  /**
   * 上传单个文件到 Skill（multipart）
   * @param id       Skill ID
   * @param filePath 文件相对路径（可选，默认使用上传文件名）
   * @param file     上传的文件
   */
  static uploadFile(id: string, file: File, filePath?: string) {
    const formData = new FormData()
    formData.append('file', file)
    const baseURL = (import.meta.env.VITE_API_URL as string) || ''
    const params = filePath ? `?filePath=${encodeURIComponent(filePath)}` : ''
    return axios.post(`${baseURL}/api/ai/skill/${id}/file/upload${params}`, formData, {
      headers: {
        'Authorization': getToken() || '',
        'Content-Type': 'multipart/form-data'
      }
    }).then(res => res.data)
  }

  /**
   * 更新文件内容（在线编辑保存）
   * @param fileId   文件记录 ID
   * @param content  文件内容
   */
  static updateFileContent(fileId: string, content: string) {
    return request({
      url: `/api/ai/skill/file/${fileId}/content`,
      method: 'put',
      data: content,
      headers: { 'Content-Type': 'text/plain' }
    })
  }

  /**
   * 删除单个附件文件
   * @param fileId 文件记录 ID
   */
  static deleteFile(fileId: string) {
    return request({ url: `/api/ai/skill/file/${fileId}`, method: 'delete' })
  }

  // ==================== 批量加载 skill_md ====================

  /**
   * 按 ID 列表批量加载 skill_md（供对话注入用，一般由后端自动处理）
   * @param ids Skill ID 列表
   */
  static loadSkillMdBatch(ids: string[]) {
    return request({ url: '/api/ai/skill/skill-md/batch', method: 'post', data: ids })
  }
}
