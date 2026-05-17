<template>
  <!-- 执行详情弹窗 -->
  <tiny-dialog-box
    v-model:visible="detailVisible"
    title="Agent 执行详情"
    width="900px"
    @close="detailVisible = false"
  >
    <div v-if="currentDetail" class="detail-content">
      <!-- 基本信息 -->
      <div class="detail-meta">
        <span class="meta-item"><strong>任务：</strong>{{ currentDetail.taskName || '-' }}</span>
        <span class="meta-item"><strong>状态：</strong>
          <tiny-tag :type="statusType(currentDetail.status)">{{ statusLabel(currentDetail.status) }}</tiny-tag>
        </span>
        <span class="meta-item"><strong>耗时：</strong>{{ formatDuration(currentDetail.durationMs) }}</span>
        <span class="meta-item"><strong>URL：</strong>{{ currentDetail.websiteUrl || '-' }}</span>
      </div>
      <!-- 执行步骤 -->
      <div v-if="parsedEvents.length > 0" class="events-list">
        <h4>执行步骤（{{ parsedEvents.length }} 步）</h4>
        <div
          v-for="(ev, idx) in parsedEvents"
          :key="idx"
          :class="['ev-item', `ev-${ev.type?.toLowerCase()}`]"
        >
          <span class="ev-icon">{{ evIcon(ev.type) }}</span>
          <span class="ev-type">{{ ev.type }}</span>
          <span v-if="ev.toolName" class="ev-tool">{{ ev.toolName }}</span>
          <span class="ev-content">{{ truncate(ev.content, 200) }}</span>
        </div>
      </div>
      <!-- 结果数据 -->
      <div v-if="currentDetail.resultData" class="result-area">
        <div class="result-header">
          <h4>提取结果</h4>
          <div class="result-actions">
            <tiny-button size="small" @click="copyResult(currentDetail.resultData)">复制 JSON</tiny-button>
            <tiny-button size="small" type="primary" @click="downloadJson(currentDetail.resultData, currentDetail.taskName || 'result')">下载 JSON</tiny-button>
            <tiny-button
              v-if="isParsedArray(currentDetail.resultData)"
              size="small"
              type="success"
              @click="downloadCsv(currentDetail.resultData, currentDetail.taskName || 'result')"
            >下载 CSV</tiny-button>
          </div>
        </div>
        <div v-if="isParsedArray(currentDetail.resultData)" class="result-table-wrap">
          <table class="result-table">
            <thead>
              <tr>
                <th v-for="col in getColumns(currentDetail.resultData)" :key="col">{{ col }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in getParsedArray(currentDetail.resultData)" :key="i">
                <td v-for="col in getColumns(currentDetail.resultData)" :key="col">{{ row[col] ?? '' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <pre v-else class="result-json">{{ formatJson(currentDetail.resultData) }}</pre>
      </div>
    </div>
    <template #footer>
      <tiny-button @click="detailVisible = false">关闭</tiny-button>
    </template>
  </tiny-dialog-box>

  <!-- 主页面 -->
  <div class="execution-list-page">
    <Breadcrumb v-if="!embedded" :items="['爬虫管理', '执行历史']" />
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
          <tiny-grid-toolbar class="grid-toolbar" size="small">
            <template #buttons>
              <tiny-form :model="searchForm" inline>
                <tiny-form-item>
                  <tiny-input
                    v-model="searchForm.taskId"
                    clearable
                    placeholder="任务 ID（可选）"
                    style="width: 200px"
                  />
                </tiny-form-item>
                <tiny-form-item>
                  <tiny-select v-model="searchForm.status" clearable placeholder="全部状态">
                    <tiny-option label="运行中" value="RUNNING" />
                    <tiny-option label="成功" value="SUCCESS" />
                    <tiny-option label="失败" value="FAILED" />
                    <tiny-option label="已取消" value="CANCELLED" />
                  </tiny-select>
                </tiny-form-item>
                <tiny-form-item>
                  <tiny-button size="small" type="primary" @click="handleSearch">搜索</tiny-button>
                  <tiny-button size="small" @click="handleRefresh">刷新</tiny-button>
                </tiny-form-item>
              </tiny-form>
            </template>
          </tiny-grid-toolbar>
        </template>

        <tiny-grid-column fixed="left" type="index" width="50" />
        <tiny-grid-column title="任务名称" field="taskName" min-width="140" />
        <tiny-grid-column title="目标 URL" field="websiteUrl" min-width="200" show-overflow="tooltip" />
        <tiny-grid-column title="状态" field="status" align="center" width="90">
          <template #default="{ row }">
            <tiny-tag :type="statusType(row.status)">{{ statusLabel(row.status) }}</tiny-tag>
          </template>
        </tiny-grid-column>
        <tiny-grid-column title="步骤数" field="totalSteps" align="center" width="80" />
        <tiny-grid-column title="耗时" field="durationMs" align="center" width="90">
          <template #default="{ row }">{{ formatDuration(row.durationMs) }}</template>
        </tiny-grid-column>
        <tiny-grid-column title="开始时间" field="startedAt" align="center" width="160" />
        <tiny-grid-column title="完成时间" field="completedAt" align="center" width="160" />
        <tiny-grid-column title="操作" align="center" fixed="right" width="120">
          <template #default="{ row }">
            <div style="display:flex;gap:8px;justify-content:center;align-items:center">
              <div title="查看详情">
                <tiny-icon-eyeopen
                  @click="viewDetail(row)"
                  style="font-size:20px;cursor:pointer;fill:#409eff;color:#409eff"
                />
              </div>
              <div title="删除">
                <tiny-icon-del
                  @click="handleDelete(row)"
                  style="font-size:20px;cursor:pointer;fill:#f56c6c;color:#f56c6c"
                />
              </div>
            </div>
          </template>
        </tiny-grid-column>
      </tiny-grid>

      <tiny-pager
        :align="formPage.align"
        :current-page="formPage.page"
        :layout="formPage.layout"
        :page-size="formPage.pageSize"
        :page-sizes="formPage.pageSizes"
        :total="formPage.total"
        @current-change="pageChange"
        @size-change="limitChange"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref, computed } from 'vue'

const props = withDefaults(defineProps<{
  embedded?: boolean
  taskId?: string
}>(), { embedded: false })
import {
  Button as TinyButton,
  DialogBox as TinyDialogBox,
  Form as TinyForm,
  FormItem as TinyFormItem,
  Grid as TinyGrid,
  GridColumn as TinyGridColumn,
  GridToolbar as TinyGridToolbar,
  Input as TinyInput,
  Modal,
  Option as TinyOption,
  Pager as TinyPager,
  Select as TinySelect,
  Tag as TinyTag
} from '@opentiny/vue'
import { iconDel, iconEyeopen } from '@opentiny/vue-icon'
import Breadcrumb from '@/components/breadcrumb/index.vue'
import { AiCrawlerExecutionApi } from '@/api/crawler'
import { formatDateTime } from '@/utils/date'
import { PageUtils } from '@/utils/page'

const TinyIconEyeopen = iconEyeopen()
const TinyIconDel = iconDel()

const loading = ref(false)
const tableHeight = ref(600)
const gridRef = ref(null)
const gridData = ref<any[]>([])

const searchForm = reactive({ taskId: props.taskId || '', status: '' })
const formPage = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
  align: 'right',
  layout: 'total, prev, pager, next, jumper, sizes',
  pageSizes: [10, 20, 50, 100]
})

// 详情弹窗
const detailVisible = ref(false)
const currentDetail = ref<any>(null)
const parsedEvents = computed(() => {
  if (!currentDetail.value?.events) return []
  try {
    return JSON.parse(currentDetail.value.events)
  } catch {
    return []
  }
})

// 加载列表
const loadList = async () => {
  loading.value = true
  try {
    const res: any = await AiCrawlerExecutionApi.list({
      taskId: searchForm.taskId || undefined,
      status: searchForm.status || undefined,
      page: formPage.page,
      pageSize: formPage.pageSize
    })
    if (res.code === 0 || res.code === 200) {
      const d = res.data
      gridData.value = (d.list || d.records || d.data || []).map((item: any) => ({
        ...item,
        startedAt: item.startedAt ? formatDateTime(item.startedAt) : '-',
        completedAt: item.completedAt ? formatDateTime(item.completedAt) : '-'
      }))
      formPage.total = d.total || 0
    }
  } catch (e) {
    Modal.message({ message: '加载失败', status: 'error' })
  } finally {
    loading.value = false
  }
}

const handleSearch = () => { formPage.page = 1; loadList() }
const handleRefresh = () => { Object.assign(searchForm, { taskId: '', status: '' }); formPage.page = 1; loadList() }
const pageChange = (p: number) => { formPage.page = p; loadList() }
const limitChange = (s: number) => { formPage.pageSize = s; formPage.page = 1; loadList() }

// 查看详情
const viewDetail = async (row: any) => {
  try {
    const res: any = await AiCrawlerExecutionApi.getById(row.id)
    if (res.code === 0 || res.code === 200) {
      currentDetail.value = res.data
      detailVisible.value = true
    } else {
      Modal.message({ message: res.msg || '获取详情失败', status: 'error' })
    }
  } catch {
    Modal.message({ message: '获取详情失败', status: 'error' })
  }
}

// 删除
const handleDelete = (row: any) => {
  Modal.confirm({
    message: `确定要删除此执行记录吗？`,
    status: 'warning'
  }).then(async () => {
    try {
      await AiCrawlerExecutionApi.deleteById(row.id)
      Modal.message({ message: '删除成功', status: 'success' })
      loadList()
    } catch {
      Modal.message({ message: '删除失败', status: 'error' })
    }
  })
}

const copyResult = (data: string) => {
  navigator.clipboard.writeText(data)
    .then(() => Modal.message({ message: '已复制', status: 'success' }))
    .catch(() => Modal.message({ message: '复制失败', status: 'error' }))
}

// ==================== 导出工具函数 ====================

const isParsedArray = (s?: string | null): boolean => {
  if (!s) return false
  try { return Array.isArray(JSON.parse(s)) } catch { return false }
}

const getParsedArray = (s?: string | null): any[] => {
  if (!s) return []
  try {
    const v = JSON.parse(s)
    return Array.isArray(v) ? v : []
  } catch { return [] }
}

const getColumns = (s?: string | null): string[] => {
  const arr = getParsedArray(s)
  if (!arr.length) return []
  const keys = new Set<string>()
  arr.forEach(row => Object.keys(row).forEach(k => keys.add(k)))
  return Array.from(keys)
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

const downloadJson = (data?: string | null, name = 'result') => {
  if (!data) return
  const formatted = (() => { try { return JSON.stringify(JSON.parse(data), null, 2) } catch { return data } })()
  downloadBlob(formatted, `${name}.json`, 'application/json;charset=utf-8')
}

const downloadCsv = (data?: string | null, name = 'result') => {
  const arr = getParsedArray(data)
  if (!arr.length) return
  const cols = getColumns(data)
  const escape = (v: any) => {
    const s = v == null ? '' : String(v)
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s
  }
  const lines = [cols.join(','), ...arr.map(row => cols.map(c => escape(row[c])).join(','))]
  downloadBlob(lines.join('\n'), `${name}.csv`, 'text/csv;charset=utf-8')
}

// 工具函数
const statusType = (s: string) => {
  const m: Record<string, string> = { RUNNING: 'warning', SUCCESS: 'success', FAILED: 'danger', CANCELLED: 'info' }
  return m[s] || 'info'
}
const statusLabel = (s: string) => {
  const m: Record<string, string> = { RUNNING: '运行中', SUCCESS: '成功', FAILED: '失败', CANCELLED: '已取消' }
  return m[s] || s
}
const formatDuration = (ms?: number) => {
  if (!ms) return '-'
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`
}
const evIcon = (t?: string) => {
  const m: Record<string, string> = { THINKING: '💭', ACTION: '⚡', OBSERVATION: '👁️', RESULT: '✅', ERROR: '❌', PLANNING: '🗺️' }
  return m[t || ''] || '•'
}
const truncate = (s?: string, max = 200) => {
  if (!s) return ''
  return s.length > max ? s.substring(0, max) + '...' : s
}
const formatJson = (s?: string) => {
  if (!s) return ''
  try { return JSON.stringify(JSON.parse(s), null, 2) } catch { return s }
}

onMounted(() => {
  loadList()
  if (!props.embedded) {
    tableHeight.value = PageUtils.setTableHeight(null)
  }
})
</script>

<style scoped lang="scss">
.execution-list-page {
  height: 100%;
  display: flex;
  flex-direction: column;

  .contain {
    flex: 1;
    padding: 16px;
    background: #fff;
    display: flex;
    flex-direction: column;

    :deep(.tiny-pager) { margin-top: 16px; }
  }
}

.detail-content {
  max-height: 60vh;
  overflow-y: auto;
}

.detail-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 6px;
  margin-bottom: 16px;
  font-size: 13px;

  .meta-item { display: flex; align-items: center; gap: 4px; }
}

.events-list {
  margin-bottom: 16px;

  h4 { font-size: 14px; margin: 0 0 8px; color: #303133; }

  .ev-item {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 6px 10px;
    border-radius: 4px;
    margin-bottom: 4px;
    font-size: 12px;
    background: #f9fafb;
    border-left: 3px solid #dcdfe6;

    &.ev-thinking { border-left-color: #67c23a; background: #f0f9eb; }
    &.ev-action { border-left-color: #409eff; background: #ecf5ff; }
    &.ev-observation { border-left-color: #e6a23c; background: #fdf6ec; }
    &.ev-result { border-left-color: #67c23a; background: #f0f9eb; }
    &.ev-error { border-left-color: #f56c6c; background: #fef0f0; }
    &.ev-planning { border-left-color: #909399; background: #f4f4f5; }

    .ev-icon { font-size: 14px; flex-shrink: 0; }
    .ev-type { font-weight: 600; flex-shrink: 0; color: #606266; }
    .ev-tool { color: #409eff; font-family: monospace; flex-shrink: 0; }
    .ev-content { color: #606266; word-break: break-all; }
  }
}

.result-area {
  .result-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;

    h4 { font-size: 14px; margin: 0; color: #303133; }

    .result-actions {
      display: flex;
      gap: 8px;
    }
  }

  .result-table-wrap {
    overflow: auto;
    max-height: 300px;
    border: 1px solid #e4e7ed;
    border-radius: 4px;

    .result-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;

      th {
        position: sticky;
        top: 0;
        background: #f5f7fa;
        color: #303133;
        font-weight: 600;
        padding: 8px 12px;
        text-align: left;
        border-bottom: 1px solid #e4e7ed;
        white-space: nowrap;
      }

      td {
        padding: 6px 12px;
        color: #606266;
        border-bottom: 1px solid #f0f2f5;
        word-break: break-all;
        max-width: 250px;
      }

      tr:hover td { background: #f5f7fa; }
      tr:last-child td { border-bottom: none; }
    }
  }

  .result-json {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 16px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 12px;
    overflow: auto;
    max-height: 300px;
    margin: 0;
  }
}
</style>
