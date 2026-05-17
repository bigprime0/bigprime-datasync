import request from '@/utils/request'
import axios from 'axios'
import { getToken } from '@/utils/token'

/**
 * 文档库（DocLibrary）API
 *
 * 文档库 = 指向文件系统目录的实体配置，助手绑定后自动注册 list/read/search 三个工具。
 */
export class AiDocLibraryApi {
  /**
   * 查询文档库列表
   * @param params.category 分类过滤
   * @param params.status   状态过滤（1-启用 0-禁用）
   */
  static list(params?: { category?: string; status?: number }) {
    return request({ url: '/api/ai/doc-library/list', method: 'get', params })
  }

  /** 查询所有启用的文档库（供助手绑定选择） */
  static listEnabled() {
    return request({ url: '/api/ai/doc-library/enabled', method: 'get' })
  }

  /** 获取文档库详情 */
  static get(id: string) {
    return request({ url: `/api/ai/doc-library/${id}`, method: 'get' })
  }

  /**
   * 新增文档库
   * @param data 文档库表单数据
   */
  static save(data: {
    id?: string
    name: string
    displayName?: string
    description?: string
    docPath: string
    fileFilter?: string
    maxReadLength?: number
    maxSearchResults?: number
    contextLines?: number
    category?: string
    icon?: string
    status?: number
    sortOrder?: number
  }) {
    return request({ url: '/api/ai/doc-library/save', method: 'post', data })
  }

  /**
   * 更新文档库
   * @param data 文档库表单数据（含 id）
   */
  static update(data: {
    id: string
    name?: string
    displayName?: string
    description?: string
    docPath?: string
    fileFilter?: string
    maxReadLength?: number
    maxSearchResults?: number
    contextLines?: number
    category?: string
    icon?: string
    status?: number
    sortOrder?: number
  }) {
    return request({ url: '/api/ai/doc-library/update', method: 'put', data })
  }

  /** 删除文档库 */
  static delete(id: string) {
    return request({ url: `/api/ai/doc-library/${id}`, method: 'delete' })
  }

  /** 连通性测试：检查文档目录是否可访问，返回文件数量和消息 */
  static testConnect(id: string) {
    return request({ url: `/api/ai/doc-library/${id}/test-connect`, method: 'get' })
  }

  /** 刷新文档数量统计 */
  static refreshFileCount(id: string) {
    return request({ url: `/api/ai/doc-library/${id}/refresh-count`, method: 'post' })
  }

  /**
   * 上传 ZIP 文档包并解压到文档库目录
   *
   * ZIP 内的目录结构将原样解压到文档库 docPath 目录下。
   * 例如 ZIP 内有 source/mysql-cdc.md，解压后变成 {docPath}/source/mysql-cdc.md。
   *
   * @param id   文档库 ID
   * @param file ZIP 文件对象
   * @returns 解压后新增的文件数量
   */
  static uploadDocs(id: string, file: File) {
    const formData = new FormData()
    formData.append('file', file)
    const baseURL = (import.meta.env.VITE_API_URL as string) || ''
    return axios.post(`${baseURL}/api/ai/doc-library/${id}/upload-docs`, formData, {
      headers: {
        'Authorization': getToken() || '',
        'Content-Type': 'multipart/form-data'
      }
    }).then(res => res.data)
  }
}
