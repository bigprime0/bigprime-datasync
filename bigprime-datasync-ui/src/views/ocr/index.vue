<template>
  <div class="ocr-page">
    <div class="ocr-header">
      <h2 class="ocr-title">OCR 文档解析</h2>
      <span class="ocr-subtitle">上传图片或PDF文件，即时识别文字、表格、版面结构</span>
    </div>

    <!-- 功能选项卡 + 识别按钮同行 -->
    <div class="ocr-tabs-bar">
      <div class="ocr-tabs">
        <div
          v-for="tab in tabs"
          :key="tab.key"
          class="ocr-tab"
          :class="{ active: activeTab === tab.key }"
          @click="switchTab(tab.key)"
        >
          <span class="tab-icon">{{ tab.icon }}</span>
          <span class="tab-label">{{ tab.label }}</span>
        </div>
      </div>
      <!-- 识别按钮 -->
      <button
        class="btn-recognize"
        :disabled="!currentFile || loading"
        @click="doRecognize"
      >
        <span v-if="loading" class="loading-spinner"></span>
        {{ loading ? '识别中...' : '开始识别' }}
      </button>
    </div>

    <!-- 主体区域：左右布局 -->
    <div class="ocr-body">
      <!-- 左侧：上传区域 -->
      <div class="ocr-upload-panel">
        <div
          class="upload-dropzone"
          :class="{ 'drag-over': isDragOver, 'has-file': !!currentFile }"
          @dragover.prevent="isDragOver = true"
          @dragleave="isDragOver = false"
          @drop.prevent="onDrop"
          @click="triggerFileInput"
        >
          <input
            ref="fileInputRef"
            type="file"
            :accept="acceptedTypes"
            style="display:none"
            @change="onFileChange"
          />

          <template v-if="!currentFile">
            <div class="upload-icon">📁</div>
            <p class="upload-hint">点击或拖拽文件到此区域</p>
            <p class="upload-accept">{{ acceptHint }}</p>
          </template>

          <template v-else>
            <!-- 图片预览 -->
            <img
              v-if="previewUrl && isImageFile"
              :src="previewUrl"
              class="preview-image"
              alt="预览"
            />
            <!-- PDF / 非图片 -->
            <div v-else class="file-info-card">
              <div class="file-icon">{{ fileIconEmoji }}</div>
              <div class="file-details">
                <p class="file-name">{{ currentFile.name }}</p>
                <p class="file-size">{{ formatFileSize(currentFile.size) }}</p>
              </div>
            </div>
            <button class="btn-clear" @click.stop="clearFile">✕ 重新选择</button>
          </template>
        </div>

        <!-- 选项面板 -->
        <div class="options-panel" v-if="activeTab === 'ocr' || activeTab === 'pdf'">
          <label class="option-label">识别类型</label>
          <div class="option-group">
            <label>
              <input type="radio" v-model="ocrType" value="GENERAL" /> 通用印刷体
            </label>
            <label v-if="activeTab === 'ocr'">
              <input type="radio" v-model="ocrType" value="HANDWRITTEN" /> 手写体
            </label>
          </div>
          <label class="option-label">输出格式</label>
          <div class="option-group">
            <label>
              <input type="radio" v-model="outputFormat" value="JSON" /> JSON（含坐标）
            </label>
            <label>
              <input type="radio" v-model="outputFormat" value="TEXT" /> 纯文本
            </label>
          </div>
        </div>
      </div>

      <!-- 右侧：结果区域 -->
      <div class="ocr-result-panel">
        <div class="result-toolbar">
          <span class="result-title">识别结果</span>
          <div class="result-actions" v-if="resultData">
            <button class="btn-copy" @click="copyResult">复制</button>
            <button class="btn-download" @click="downloadResult">下载</button>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="!resultData && !loading" class="result-empty">
          <div class="empty-icon">🔍</div>
          <p>上传文件后点击「开始识别」查看结果</p>
        </div>

        <!-- 加载中 -->
        <div v-if="loading" class="result-loading">
          <div class="loading-wave">
            <span></span><span></span><span></span><span></span>
          </div>
          <p>正在识别，请稍候...</p>
        </div>

        <!-- OCR文字识别结果 -->
        <div v-if="resultData && activeTab === 'ocr'" class="result-content">
          <div class="result-stats">
            <span>文本块：{{ resultData.blockCount || 0 }} 个</span>
          </div>
          <div class="result-full-text">
            <label>全文</label>
            <textarea readonly :value="resultData.text || resultData" class="text-output"></textarea>
          </div>
          <div v-if="resultData.blocks && resultData.blocks.length" class="result-blocks">
            <label>文本块详情</label>
            <div class="block-list">
              <div v-for="(block, idx) in resultData.blocks" :key="idx" class="block-item">
                <span class="block-index">{{ idx + 1 }}</span>
                <span class="block-text">{{ block.text }}</span>
                <span v-if="block.box" class="block-box">{{ block.box }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 表格识别结果 -->
        <div v-if="resultData && activeTab === 'table'" class="result-content">
          <div v-if="typeof resultData === 'string'" class="table-html-result">
            <div class="table-html-preview" v-html="resultData"></div>
            <details>
              <summary>查看原始HTML</summary>
              <textarea readonly :value="resultData" class="text-output small"></textarea>
            </details>
          </div>
          <div v-else>
            <div v-for="(table, idx) in (resultData.tables || [])" :key="idx" class="table-item">
              <p class="table-caption">表格 {{ idx + 1 }}（{{ table.cellCount || 0 }} 个单元格）</p>
              <div class="table-html-preview" v-html="table.htmlContent"></div>
            </div>
          </div>
        </div>

        <!-- 版面分析结果 -->
        <div v-if="resultData && activeTab === 'layout'" class="result-content">
          <div class="result-stats">
            <span>识别元素：{{ resultData.elementCount || 0 }} 个</span>
          </div>
          <div class="layout-elements">
            <div
              v-for="(el, idx) in (resultData.elements || [])"
              :key="idx"
              class="layout-element"
              :class="`label-${el.label?.toLowerCase().replace(' ','_')}`"
            >
              <span class="el-label">{{ el.label }}</span>
              <span class="el-confidence">{{ (el.confidence * 100).toFixed(1) }}%</span>
              <span v-if="el.bbox" class="el-bbox">
                [{{ el.bbox.x1?.toFixed(0) }}, {{ el.bbox.y1?.toFixed(0) }},
                {{ el.bbox.x2?.toFixed(0) }}, {{ el.bbox.y2?.toFixed(0) }}]
              </span>
            </div>
          </div>
        </div>

        <!-- PDF识别结果 -->
        <div v-if="resultData && activeTab === 'pdf'" class="result-content">
          <div v-if="typeof resultData === 'string'">
            <textarea readonly :value="resultData" class="text-output"></textarea>
          </div>
          <div v-else>
            <div class="result-stats">
              <span>共 {{ resultData.pageCount }} 页</span>
            </div>
            <div class="result-full-text">
              <label>全文</label>
              <textarea readonly :value="resultData.fullText" class="text-output"></textarea>
            </div>
            <div class="pdf-pages">
              <details v-for="page in (resultData.pages || [])" :key="page.page">
                <summary>第 {{ page.page }} 页（{{ (page.text || page).length }} 字符）</summary>
                <pre class="page-text">{{ page.text || page }}</pre>
              </details>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Modal } from '@opentiny/vue'
import { OcrApi } from '@/api/ocr'

// ============ 状态 ============
const activeTab = ref<'ocr' | 'table' | 'layout' | 'pdf'>('ocr')
const currentFile = ref<File | null>(null)
const previewUrl = ref<string | null>(null)
const loading = ref(false)
const resultData = ref<any>(null)
const isDragOver = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)
const ocrType = ref('GENERAL')
const outputFormat = ref('JSON')

// ============ 标签配置 ============
const tabs = [
  { key: 'ocr', label: '文字识别', icon: '📝' },
  { key: 'table', label: '表格识别', icon: '📊' },
  { key: 'layout', label: '版面分析', icon: '📋' },
  { key: 'pdf', label: 'PDF识别', icon: '📄' }
]

// ============ 计算属性 ============
const isImageFile = computed(() => {
  if (!currentFile.value) return false
  return /\.(jpg|jpeg|png|bmp|tiff|tif|gif)$/i.test(currentFile.value.name)
})

const acceptedTypes = computed(() => {
  if (activeTab.value === 'pdf') return '.pdf'
  return '.jpg,.jpeg,.png,.bmp,.tiff,.tif,.gif'
})

const acceptHint = computed(() => {
  if (activeTab.value === 'pdf') return '支持 PDF 文件'
  return '支持 JPG / PNG / BMP / TIFF 图片'
})

const fileIconEmoji = computed(() => {
  if (!currentFile.value) return '📁'
  const name = currentFile.value.name.toLowerCase()
  if (name.endsWith('.pdf')) return '📄'
  return '🖼️'
})

// ============ 切换标签 ============
function switchTab(tab: any) {
  activeTab.value = tab
  clearFile()
  resultData.value = null
}

// ============ 文件操作 ============
function triggerFileInput() {
  fileInputRef.value?.click()
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files?.[0]) {
    setFile(input.files[0])
  }
}

function onDrop(e: DragEvent) {
  isDragOver.value = false
  const file = e.dataTransfer?.files[0]
  if (file) setFile(file)
}

function setFile(file: File) {
  currentFile.value = file
  resultData.value = null
  if (/\.(jpg|jpeg|png|bmp|tiff|tif|gif)$/i.test(file.name)) {
    previewUrl.value = URL.createObjectURL(file)
  } else {
    previewUrl.value = null
  }
}

function clearFile() {
  currentFile.value = null
  previewUrl.value = null
  resultData.value = null
  if (fileInputRef.value) fileInputRef.value.value = ''
}

// ============ 执行识别 ============
async function doRecognize() {
  if (!currentFile.value || loading.value) return
  loading.value = true
  resultData.value = null

  try {
    let result: any
    const file = currentFile.value

    if (activeTab.value === 'ocr') {
      if (ocrType.value === 'HANDWRITTEN') {
        result = await OcrApi.recognizeHandwritten(file, outputFormat.value)
      } else {
        result = await OcrApi.recognize(file, outputFormat.value)
      }
    } else if (activeTab.value === 'table') {
      result = await OcrApi.tableExtract(file)
    } else if (activeTab.value === 'layout') {
      result = await OcrApi.layoutAnalysis(file)
    } else if (activeTab.value === 'pdf') {
      result = await OcrApi.recognizePdf(file, outputFormat.value)
    }

    resultData.value = result
  } catch (err: any) {
    Modal.message({ message: err.message || '识别失败', status: 'error' })
  } finally {
    loading.value = false
  }
}

// ============ 结果操作 ============
function getResultText(): string {
  if (!resultData.value) return ''
  if (typeof resultData.value === 'string') return resultData.value
  return JSON.stringify(resultData.value, null, 2)
}

function copyResult() {
  const text = getResultText()
  navigator.clipboard.writeText(text).then(() => {
    Modal.message({ message: '已复制到剪贴板', status: 'success' })
  })
}

function downloadResult() {
  const text = getResultText()
  const ext = typeof resultData.value === 'string' && resultData.value.startsWith('<') ? 'html' : 'json'
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `ocr_result_${Date.now()}.${ext}`
  a.click()
  URL.revokeObjectURL(url)
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1024 / 1024).toFixed(1) + ' MB'
}
</script>

<style scoped>
.ocr-page {
  padding: 20px;
  min-height: 100%;
  background: #f5f7fa;
}

.ocr-header {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 12px;
}
.ocr-title {
  font-size: 18px;
  font-weight: 600;
  color: #1d2129;
  margin: 0;
  flex-shrink: 0;
}
.ocr-subtitle {
  font-size: 12px;
  color: #86909c;
}

/* 标签 */
.ocr-tabs-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 12px;
}
.ocr-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.ocr-tab {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  background: #fff;
  border: 1px solid #e5e6eb;
  color: #4e5969;
  transition: all .2s;
  user-select: none;
}
.ocr-tab:hover { border-color: #165dff; color: #165dff; }
.ocr-tab.active { background: #165dff; color: #fff; border-color: #165dff; }
.tab-icon { font-size: 16px; }

/* 主体 */
.ocr-body {
  display: grid;
  grid-template-columns: 420px 1fr;
  gap: 16px;
  height: calc(100vh - 200px);
  min-height: 500px;
}

/* 上传面板 */
.ocr-upload-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.upload-dropzone {
  flex: 1;
  min-height: 180px;
  border: 2px dashed #c9cdd4;
  border-radius: 10px;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all .2s;
  position: relative;
  overflow: hidden;
  padding: 16px;
}
.upload-dropzone:hover, .upload-dropzone.drag-over {
  border-color: #165dff;
  background: #f0f5ff;
}
.upload-dropzone.has-file { border-style: solid; border-color: #e5e6eb; }

.upload-icon { font-size: 40px; margin-bottom: 12px; }
.upload-hint { font-size: 14px; color: #4e5969; margin: 0 0 4px; }
.upload-accept { font-size: 12px; color: #86909c; margin: 0; }

.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 6px;
}

.file-info-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
  width: 100%;
}
.file-icon { font-size: 36px; }
.file-name { font-size: 14px; font-weight: 500; color: #1d2129; margin: 0 0 4px; word-break: break-all; }
.file-size { font-size: 12px; color: #86909c; margin: 0; }

.btn-clear {
  position: absolute;
  top: 8px; right: 8px;
  background: rgba(0,0,0,.5);
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 3px 8px;
  font-size: 12px;
  cursor: pointer;
}

.btn-recognize {
  white-space: nowrap;
  padding: 5px 20px;
  background: #165dff;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex-shrink: 0;
  transition: background .2s;
}
.btn-recognize:hover:not(:disabled) { background: #0e42d2; }
.btn-recognize:disabled { background: #c9cdd4; cursor: not-allowed; }

.loading-spinner {
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin .8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* 选项面板 */
.options-panel {
  background: #fff;
  border-radius: 8px;
  padding: 12px 16px;
  border: 1px solid #e5e6eb;
}
.option-label {
  display: block;
  font-size: 12px;
  color: #86909c;
  margin-bottom: 6px;
  margin-top: 10px;
}
.option-label:first-child { margin-top: 0; }
.option-group {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #4e5969;
}
.option-group label { display: flex; align-items: center; gap: 4px; cursor: pointer; }

/* 结果面板 */
.ocr-result-panel {
  background: #fff;
  border-radius: 10px;
  border: 1px solid #e5e6eb;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.result-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}
.result-title { font-size: 14px; font-weight: 600; color: #1d2129; }
.result-actions { display: flex; gap: 8px; }
.btn-copy, .btn-download {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  border: 1px solid #e5e6eb;
  background: #fff;
  color: #4e5969;
  transition: all .15s;
}
.btn-copy:hover { border-color: #165dff; color: #165dff; }
.btn-download:hover { border-color: #165dff; color: #165dff; }

.result-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #86909c;
  gap: 12px;
}
.empty-icon { font-size: 48px; }

.result-loading {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: #4e5969;
}
.loading-wave {
  display: flex;
  gap: 6px;
  align-items: center;
}
.loading-wave span {
  width: 8px; height: 24px;
  background: #165dff;
  border-radius: 4px;
  animation: wave 1s ease-in-out infinite;
}
.loading-wave span:nth-child(2) { animation-delay: .1s; }
.loading-wave span:nth-child(3) { animation-delay: .2s; }
.loading-wave span:nth-child(4) { animation-delay: .3s; }
@keyframes wave {
  0%, 100% { transform: scaleY(.4); }
  50% { transform: scaleY(1); }
}

.result-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.result-stats {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #86909c;
  padding-bottom: 8px;
  border-bottom: 1px solid #f5f5f5;
}

.result-full-text label {
  display: block;
  font-size: 12px;
  color: #86909c;
  margin-bottom: 6px;
}
.text-output {
  width: 100%;
  min-height: 200px;
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  padding: 10px;
  font-size: 13px;
  font-family: 'Monaco', 'Menlo', monospace;
  resize: vertical;
  background: #fafafa;
  color: #1d2129;
  box-sizing: border-box;
}
.text-output.small { min-height: 100px; }

/* 文本块列表 */
.result-blocks label {
  display: block;
  font-size: 12px;
  color: #86909c;
  margin-bottom: 6px;
}
.block-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 300px;
  overflow-y: auto;
}
.block-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 6px 8px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 13px;
}
.block-index {
  min-width: 20px;
  height: 20px;
  background: #165dff;
  color: #fff;
  border-radius: 50%;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.block-text { flex: 1; color: #1d2129; }
.block-box { font-size: 11px; color: #86909c; font-family: monospace; }

/* 表格结果 */
.table-html-preview {
  overflow-x: auto;
  border: 1px solid #e5e6eb;
  border-radius: 6px;
  padding: 12px;
}
.table-html-preview :deep(table) {
  border-collapse: collapse;
  width: 100%;
  font-size: 13px;
}
.table-html-preview :deep(td),
.table-html-preview :deep(th) {
  border: 1px solid #e5e6eb;
  padding: 6px 10px;
  text-align: left;
}
.table-html-preview :deep(th) { background: #f5f7fa; font-weight: 600; }
.table-item { margin-bottom: 16px; }
.table-caption { font-size: 13px; color: #4e5969; margin: 0 0 8px; font-weight: 500; }

/* 版面分析 */
.layout-elements {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.layout-element {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 6px;
  background: #f5f7fa;
  font-size: 13px;
}
.el-label {
  min-width: 80px;
  font-weight: 500;
  color: #165dff;
  background: #e8f3ff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  text-align: center;
}
.el-confidence { color: #86909c; font-size: 12px; }
.el-bbox { font-size: 11px; color: #c0c4cc; font-family: monospace; margin-left: auto; }

/* PDF */
.pdf-pages { display: flex; flex-direction: column; gap: 8px; }
.pdf-pages details { border: 1px solid #e5e6eb; border-radius: 6px; overflow: hidden; }
.pdf-pages summary {
  padding: 8px 12px;
  font-size: 13px;
  cursor: pointer;
  background: #fafafa;
  color: #4e5969;
}
.page-text {
  margin: 0;
  padding: 12px;
  font-size: 13px;
  font-family: inherit;
  white-space: pre-wrap;
  word-break: break-all;
  background: #fff;
  border-top: 1px solid #f0f0f0;
}
</style>
