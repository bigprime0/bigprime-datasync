<template>
  <div class="execution-history-container">
    <Breadcrumb :items="['爬虫管理', '执行历史']" />
    <div class="contain">
      <tiny-grid
        ref="gridRef"
        :data="gridData"
        :fit="true"
        :height="tableHeight"
        :loading="loading"
        :stripe="true"
        border
        highlight-hover-row
        show-header-overflow="tooltip"
        show-overflow="tooltip"
        size="small"
      >
        <template #toolbar>
          <tiny-grid-toolbar class="grid-toolbar" full-screen setting size="small">
            <template #buttons>
              <tiny-form :model="searchForm" inline>
                <tiny-form-item label="任务名称">
                  <tiny-search
                    v-model="searchForm.taskId"
                    clearable
                    is-enter-search
                    placeholder="按任务ID筛选"
                    style="width: 220px"
                    @search="handleSearch"
                  ></tiny-search>
                </tiny-form-item>
                <tiny-form-item label="执行状态">
                  <tiny-select
                    v-model="searchForm.status"
                    clearable
                    placeholder="请选择状态"
                    style="width: 120px"
                    @change="handleSearch"
                  >
                    <tiny-option label="全部" value=""></tiny-option>
                    <tiny-option label="成功" value="SUCCESS"></tiny-option>
                    <tiny-option label="失败" value="FAILED"></tiny-option>
                    <tiny-option label="运行中" value="RUNNING"></tiny-option>
                  </tiny-select>
                </tiny-form-item>
                <tiny-form-item>
                  <tiny-button size="small" @click="handleRefresh">刷新</tiny-button>
                </tiny-form-item>
              </tiny-form>
            </template>
          </tiny-grid-toolbar>
        </template>

        <tiny-grid-column fixed="left" type="index" width="50"></tiny-grid-column>

        <tiny-grid-column title="任务名称" field="taskName" fixed="left" min-width="150"></tiny-grid-column>

        <tiny-grid-column title="目标URL" field="websiteUrl" min-width="200" show-overflow="tooltip"></tiny-grid-column>

        <tiny-grid-column title="执行状态" field="status" align="center" width="90">
          <template #default="{ row }">
            <tiny-tag v-if="row.status === 'SUCCESS'" type="success">成功</tiny-tag>
            <tiny-tag v-else-if="row.status === 'FAILED'" type="danger">失败</tiny-tag>
            <tiny-tag v-else-if="row.status === 'RUNNING'" type="warning">运行中</tiny-tag>
            <tiny-tag v-else type="info">{{ row.status }}</tiny-tag>
          </template>
        </tiny-grid-column>

        <tiny-grid-column title="步骤数" field="totalSteps" align="center" width="80">
          <template #default="{ row }">
            <span>{{ row.totalSteps || 0 }}</span>
          </template>
        </tiny-grid-column>

        <tiny-grid-column title="数据条数" align="center" width="90">
          <template #default="{ row }">
            <span :style="row.resultCount > 0 ? 'color:#52c41a;font-weight:500' : ''">
              {{ row.resultCount ?? '-' }}
            </span>
          </template>
        </tiny-grid-column>

        <tiny-grid-column title="耗时" align="center" width="100">
          <template #default="{ row }">
            <span>{{ formatMs(row.durationMs) }}</span>
          </template>
        </tiny-grid-column>

        <tiny-grid-column title="开始时间" field="startedAt" align="center" width="160"></tiny-grid-column>

        <tiny-grid-column title="完成时间" field="completedAt" align="center" width="160"></tiny-grid-column>

        <tiny-grid-column title="操作" align="center" fixed="right" width="90">
          <template #default="{ row }">
            <div style="display: flex; gap: 10px; justify-content: center; align-items: center;">
              <div title="查看详情">
                <tiny-icon-eyeopen
                  @click="handleView(row)"
                  style="font-size: 20px; cursor: pointer; fill: #409eff; color: #409eff;"
                />
              </div>
              <div title="删除">
                <tiny-icon-del
                  @click="handleDelete(row)"
                  style="font-size: 20px; cursor: pointer; fill: #f56c6c; color: #f56c6c;"
                />
              </div>
            </div>
          </template>
        </tiny-grid-column>
      </tiny-grid>

      <!-- 分页 -->
      <tiny-pager
        :align="formPage.align"
        :current-page="formPage.page"
        :layout="formPage.layout"
        :page-size="formPage.pageSize"
        :page-sizes="formPage.pageSizes"
        :total="formPage.total"
        @current-change="pageChange"
        @size-change="limitChange"
      ></tiny-pager>
    </div>

    <!-- 详情对话框 -->
    <tiny-dialog-box
      v-model:visible="detailVisible"
      :append-to-body="true"
      :show-footer="false"
      title="执行详情"
      width="900px"
    >
      <div v-if="currentDetail" class="detail-content">
        <!-- 基本信息 -->
        <div class="detail-section">
          <div class="detail-info-grid">
            <div class="di-item">
              <span class="di-label">任务名称</span>
              <span class="di-value">{{ currentDetail.taskName || '-' }}</span>
            </div>
            <div class="di-item">
              <span class="di-label">执行状态</span>
              <tiny-tag v-if="currentDetail.status === 'SUCCESS'" type="success">成功</tiny-tag>
              <tiny-tag v-else-if="currentDetail.status === 'FAILED'" type="danger">失败</tiny-tag>
              <tiny-tag v-else type="warning">{{ currentDetail.status }}</tiny-tag>
            </div>
            <div class="di-item">
              <span class="di-label">执行步骤</span>
              <span class="di-value">{{ currentDetail.totalSteps || 0 }} 步</span>
            </div>
            <div class="di-item">
              <span class="di-label">数据条数</span>
              <span class="di-value" :style="currentDetail.resultCount > 0 ? 'color:#52c41a;font-weight:600' : ''">
                {{ currentDetail.resultCount ?? '-' }}
              </span>
            </div>
            <div class="di-item">
              <span class="di-label">耗时</span>
              <span class="di-value">{{ formatMs(currentDetail.durationMs) }}</span>
            </div>
            <div class="di-item">
              <span class="di-label">开始时间</span>
              <span class="di-value">{{ currentDetail.startedAt }}</span>
            </div>
            <div class="di-item">
              <span class="di-label">完成时间</span>
              <span class="di-value">{{ currentDetail.completedAt || '-' }}</span>
            </div>
            <div class="di-item">
              <span class="di-label">目标URL</span>
              <a :href="currentDetail.websiteUrl" target="_blank" class="di-link">{{ currentDetail.websiteUrl }}</a>
            </div>
          </div>

          <!-- 爬取指令 -->
          <div v-if="currentDetail.instructions" class="di-instructions">
            <span class="di-label">爬取指令</span>
            <div class="instructions-body">{{ currentDetail.instructions }}</div>
          </div>

          <!-- 错误信息 -->
          <div v-if="currentDetail.errorMessage" class="di-error">
            <span class="di-label">错误信息</span>
            <div class="error-body">{{ currentDetail.errorMessage }}</div>
          </div>
        </div>

        <!-- 提取结果 -->
        <div v-if="currentDetail.resultData" class="detail-section">
          <div class="section-header">
            <span class="section-title">提取结果</span>
            <div class="section-actions">
              <tiny-button size="mini" @click="copyResult(currentDetail.resultData)">复制 JSON</tiny-button>
              <tiny-button size="mini" type="primary" @click="downloadJson(currentDetail.resultData, currentDetail.taskName)">下载 JSON</tiny-button>
              <tiny-button
                v-if="isArray(currentDetail.resultData)"
                size="mini"
                type="success"
                @click="downloadCsv(currentDetail.resultData, currentDetail.taskName)"
              >下载 CSV</tiny-button>
            </div>
          </div>
          <!-- 表格预览（数组类型） -->
          <div v-if="isArray(currentDetail.resultData)" class="result-table-wrap">
            <table class="result-table">
              <thead>
                <tr>
                  <th v-for="col in getColumns(currentDetail.resultData)" :key="col">{{ col }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, i) in getRows(currentDetail.resultData)" :key="i">
                  <td v-for="col in getColumns(currentDetail.resultData)" :key="col">{{ row[col] ?? '' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- JSON 预览 -->
          <pre v-else class="result-json">{{ formatJson(currentDetail.resultData) }}</pre>
        </div>

        <!-- 执行步骤回放 -->
        <div v-if="currentDetail.parsedEvents && currentDetail.parsedEvents.length" class="detail-section">
          <div class="section-header" @click="stepsExpanded = !stepsExpanded" style="cursor:pointer">
            <span class="section-title">执行步骤（{{ currentDetail.parsedEvents.length }} 步）</span>
            <span class="section-toggle">{{ stepsExpanded ? '收起' : '展开' }}</span>
          </div>
          <div v-if="stepsExpanded" class="steps-replay">
            <div
              v-for="(ev, i) in currentDetail.parsedEvents"
              :key="i"
              :class="['replay-item', 'replay-' + (ev.type || '').toLowerCase()]"
            >
              <div class="replay-header">
                <span class="replay-icon">{{ stepIcon(ev.type) }}</span>
                <span class="replay-type">{{ stepLabel(ev.type) }}</span>
                <span v-if="ev.step" class="replay-step">Step {{ ev.step }}</span>
                <span v-if="ev.toolName" class="replay-tool">{{ ev.toolName }}</span>
              </div>
              <div v-if="ev.content" class="replay-content">
                <img
                  v-if="String(ev.content).startsWith('data:image')"
                  :src="ev.content"
                  class="replay-screenshot"
                  alt="截图"
                />
                <span v-else>{{ truncate(ev.content, 300) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </tiny-dialog-box>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import {
  Grid as TinyGrid,
  Modal,
  Tag as TinyTag,
  TinyButton,
  TinyDialogBox,
  TinyForm,
  TinyFormItem,
  TinyGridColumn,
  TinyGridToolbar,
  TinyOption,
  TinyPager,
  TinySearch,
  TinySelect
} from '@opentiny/vue'
import { iconEyeopen, iconDel } from '@opentiny/vue-icon'
import { AiCrawlerExecutionApi } from '@/api/crawler'
import { formatDateTime } from '@/utils/date'
import Breadcrumb from '@/components/breadcrumb/index.vue'
import { PageUtils } from '@/utils/page'

const TinyIconEyeopen = iconEyeopen()
const TinyIconDel = iconDel()

const route = useRoute()
const loading = ref(false)
const tableHeight = ref(600)
const gridRef = ref(null)
const gridData = ref<any[]>([])
const detailVisible = ref(false)
const currentDetail = ref<any>(null)
const stepsExpanded = ref(false)

const searchForm = reactive({
  taskId: '',
  status: ''
})

const formPage = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
  align: 'right',
  layout: 'total, prev, pager, next, jumper, sizes',
  pageSizes: [10, 20, 50, 100]
})

// ==================== 数据加载 ====================

const parseResultCount = (resultData?: string): number | null => {
  if (!resultData) return null
  try {
    const parsed = JSON.parse(resultData)
    // 支持 {data:[...]} 或直接数组
    if (Array.isArray(parsed)) return parsed.length
    if (parsed && Array.isArray(parsed.data)) return parsed.data.length
  } catch { /* ignore */ }
  return null
}

const loadExecutionList = async () => {
  loading.value = true
  try {
    const params = {
      taskId: (route.query.taskId as string) || searchForm.taskId || '',
      status: searchForm.status,
      page: formPage.page,
      pageSize: formPage.pageSize
    }
    const res: any = await AiCrawlerExecutionApi.list(params)
    if (res.code === 0 || res.code === 200) {
      const pageData = res.data
      const list = pageData.list || pageData.data || pageData.records || []
      formPage.total = pageData.total || 0
      gridData.value = list.map((item: any) => ({
        ...item,
        startedAt: item.startedAt ? formatDateTime(item.startedAt) : '-',
        completedAt: item.completedAt ? formatDateTime(item.completedAt) : '-',
        resultCount: parseResultCount(item.resultData)
      }))
    }
  } catch (error) {
    console.error('加载执行历史失败:', error)
    Modal.message({ message: '加载执行历史失败', status: 'error' })
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  formPage.page = 1
  loadExecutionList()
}

const handleRefresh = () => {
  searchForm.taskId = ''
  searchForm.status = ''
  formPage.page = 1
  loadExecutionList()
}

// ==================== 详情 ====================

const handleView = async (row: any) => {
  try {
    const res: any = await AiCrawlerExecutionApi.getById(row.id)
    if (res.code === 0 || res.code === 200) {
      const d = res.data
      let parsedEvents: any[] = []
      if (d.events) {
        try { parsedEvents = JSON.parse(d.events) } catch { /* ignore */ }
      }
      currentDetail.value = {
        ...d,
        startedAt: d.startedAt ? formatDateTime(d.startedAt) : '-',
        completedAt: d.completedAt ? formatDateTime(d.completedAt) : '-',
        resultCount: parseResultCount(d.resultData),
        parsedEvents
      }
      stepsExpanded.value = false
      detailVisible.value = true
    }
  } catch (error) {
    Modal.message({ message: '获取详情失败', status: 'error' })
  }
}

// ==================== 删除 ====================

const handleDelete = (row: any) => {
  Modal.confirm({
    message: `确定删除此条执行记录吗？`,
    status: 'warning'
  }).then(async () => {
    try {
      await AiCrawlerExecutionApi.deleteById(row.id)
      Modal.message({ message: '删除成功', status: 'success' })
      loadExecutionList()
    } catch {
      Modal.message({ message: '删除失败', status: 'error' })
    }
  })
}

// ==================== 结果工具函数 ====================

const isArray = (s?: string): boolean => {
  if (!s) return false
  try {
    const v = JSON.parse(s)
    if (Array.isArray(v)) return true
    if (v && Array.isArray(v.data)) return true
  } catch { /* ignore */ }
  return false
}

const getRows = (s?: string): any[] => {
  if (!s) return []
  try {
    const v = JSON.parse(s)
    if (Array.isArray(v)) return v
    if (v && Array.isArray(v.data)) return v.data
  } catch { /* ignore */ }
  return []
}

const getColumns = (s?: string): string[] => {
  const arr = getRows(s)
  if (!arr.length) return []
  const keys = new Set<string>()
  arr.forEach((row: any) => Object.keys(row).forEach(k => keys.add(k)))
  return Array.from(keys)
}

const formatJson = (s?: string): string => {
  if (!s) return ''
  try { return JSON.stringify(JSON.parse(s), null, 2) } catch { return s }
}

const copyResult = (data: string) => {
  navigator.clipboard.writeText(data)
    .then(() => Modal.message({ message: '已复制到剪贴板', status: 'success' }))
    .catch(() => Modal.message({ message: '复制失败', status: 'error' }))
}

const downloadBlob = (content: string, filename: string, mime: string) => {
  const bom = mime.includes('csv') ? '\uFEFF' : ''
  const blob = new Blob([bom + content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

const downloadJson = (data: string, name = 'result') => {
  const formatted = formatJson(data)
  downloadBlob(formatted, `${name || 'result'}.json`, 'application/json;charset=utf-8')
}

const downloadCsv = (data: string, name = 'result') => {
  const arr = getRows(data)
  if (!arr.length) return
  const cols = getColumns(data)
  const escape = (v: any) => {
    const s = v == null ? '' : String(v)
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s
  }
  const lines = [cols.join(','), ...arr.map((row: any) => cols.map((c: string) => escape(row[c])).join(','))]
  downloadBlob(lines.join('\n'), `${name || 'result'}.csv`, 'text/csv;charset=utf-8')
}

// ==================== 步骤回放工具 ====================

const stepIcon = (type?: string): string => {
  const m: Record<string, string> = {
    PLANNING: '📋', THINKING: '💭', ACTION: '⚡',
    OBSERVATION: '👁', RESULT: '✅', ERROR: '❌'
  }
  return m[type || ''] || '•'
}

const stepLabel = (type?: string): string => {
  const m: Record<string, string> = {
    PLANNING: '规划', THINKING: '思考', ACTION: '执行工具',
    OBSERVATION: '观察结果', RESULT: '最终结果', ERROR: '错误'
  }
  return m[type || ''] || type || ''
}

const truncate = (s?: string, max = 300): string => {
  if (!s) return ''
  return s.length > max ? s.substring(0, max) + `...[共${s.length}字符]` : s
}

// ==================== 格式化 ====================

const formatMs = (ms?: number): string => {
  if (!ms) return '-'
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`
}

// ==================== 分页 ====================

const pageChange = (page: number) => {
  formPage.page = page
  loadExecutionList()
}

const limitChange = (limit: number) => {
  formPage.pageSize = limit
  formPage.page = 1
  loadExecutionList()
}

onMounted(() => {
  loadExecutionList()
  tableHeight.value = PageUtils.setTableHeight(null)
})
</script>

<style scoped lang="scss">
.execution-history-container {
  height: 100%;
  display: flex;
  flex-direction: column;

  .contain {
    flex: 1;
    padding: 16px;
    background: #fff;
    display: flex;
    flex-direction: column;

    :deep(.tiny-grid) { flex: 1; }
    :deep(.tiny-pager) { margin-top: 16px; }
  }
}

// ==================== 详情弹框 ====================
.detail-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 70vh;
  overflow-y: auto;
  padding: 4px 2px;
}

.detail-section {
  background: #fafafa;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  padding: 14px 16px;
}

.detail-info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 12px;
}

.di-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.di-label {
  font-size: 11px;
  color: #909399;
}

.di-value {
  font-size: 13px;
  color: #303133;
}

.di-link {
  font-size: 13px;
  color: #409eff;
  text-decoration: none;
  word-break: break-all;
  &:hover { text-decoration: underline; }
}

.di-instructions {
  margin-top: 8px;
  .instructions-body {
    margin-top: 4px;
    background: #f5f7fa;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 13px;
    color: #606266;
    white-space: pre-wrap;
    line-height: 1.6;
  }
}

.di-error {
  margin-top: 8px;
  .error-body {
    margin-top: 4px;
    background: #fff2f0;
    border: 1px solid #ffccc7;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 12px;
    color: #cf1322;
    white-space: pre-wrap;
    word-break: break-all;
  }
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;

  .section-title {
    font-size: 13px;
    font-weight: 600;
    color: #303133;
  }

  .section-toggle {
    font-size: 12px;
    color: #409eff;
  }

  .section-actions {
    display: flex;
    gap: 6px;
  }
}

.result-table-wrap {
  overflow-x: auto;
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.result-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;

  th {
    background: #f5f7fa;
    color: #606266;
    font-weight: 600;
    padding: 8px 10px;
    text-align: left;
    border-bottom: 1px solid #e4e7ed;
    white-space: nowrap;
    position: sticky;
    top: 0;
    z-index: 1;
  }

  td {
    padding: 7px 10px;
    border-bottom: 1px solid #f0f0f0;
    color: #303133;
    max-width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  tr:last-child td { border-bottom: none; }
  tr:hover td { background: #f5f7fa; }
}

.result-json {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 12px 14px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  overflow: auto;
  max-height: 300px;
  margin: 0;
  white-space: pre;
}

// ==================== 步骤回放 ====================
.steps-replay {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 300px;
  overflow-y: auto;
}

.replay-item {
  border-radius: 4px;
  padding: 7px 10px;
  border-left: 3px solid #d9d9d9;
  background: #fff;

  &.replay-planning  { border-color: #722ed1; background: #f9f0ff; }
  &.replay-thinking  { border-color: #1677ff; background: #e6f4ff; }
  &.replay-action    { border-color: #fa8c16; background: #fff7e6; }
  &.replay-observation { border-color: #52c41a; background: #f6ffed; }
  &.replay-result    { border-color: #52c41a; background: #f0fff4; }
  &.replay-error     { border-color: #f5222d; background: #fff2f0; }
}

.replay-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 3px;
  font-size: 12px;

  .replay-icon { font-size: 13px; }
  .replay-type { font-weight: 600; color: #303133; }
  .replay-step { color: #909399; }
  .replay-tool { color: #1677ff; font-family: monospace; font-size: 11px; background: #e6f4ff; padding: 1px 5px; border-radius: 3px; }
}

.replay-content {
  font-size: 12px;
  color: #606266;
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.5;
}

.replay-screenshot {
  max-width: 100%;
  max-height: 160px;
  border-radius: 3px;
  border: 1px solid #e4e7ed;
}
</style>
