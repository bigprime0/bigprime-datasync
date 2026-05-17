import axios from 'axios'
import { getToken } from '@/utils/token'

const baseURL = import.meta.env.VITE_API_URL

/**
 * OCR文档解析API
 * 使用FormData上传文件，不使用通用request（需要multipart/form-data）
 */
function uploadRequest(url: string, formData: FormData) {
  return axios.post(`${baseURL}${url}`, formData, {
    headers: {
      'Authorization': getToken() || '',
      'Content-Type': 'multipart/form-data'
    }
  }).then(res => {
    if (res.data.code === 0 || res.data.code === 200) {
      return res.data.data
    }
    throw new Error(res.data.msg || '请求失败')
  })
}

export const OcrApi = {
  /**
   * 通用OCR文字识别（图片）
   */
  recognize(file: File, outputFormat = 'JSON') {
    const form = new FormData()
    form.append('file', file)
    form.append('outputFormat', outputFormat)
    return uploadRequest('/ocr/recognize', form)
  },

  /**
   * 手写OCR识别
   */
  recognizeHandwritten(file: File, outputFormat = 'JSON') {
    const form = new FormData()
    form.append('file', file)
    form.append('outputFormat', outputFormat)
    return uploadRequest('/ocr/recognize/handwritten', form)
  },

  /**
   * 表格检测与识别（输出HTML）
   */
  tableExtract(file: File, outputFormat = 'HTML') {
    const form = new FormData()
    form.append('file', file)
    form.append('outputFormat', outputFormat)
    return uploadRequest('/ocr/table-extract', form)
  },

  /**
   * 文档版面分析
   */
  layoutAnalysis(file: File) {
    const form = new FormData()
    form.append('file', file)
    return uploadRequest('/ocr/layout-analysis', form)
  },

  /**
   * PDF文字识别
   */
  recognizePdf(file: File, outputFormat = 'JSON') {
    const form = new FormData()
    form.append('file', file)
    form.append('outputFormat', outputFormat)
    return uploadRequest('/ocr/recognize/pdf', form)
  }
}
