<template>
  <div class="page-container">
    <Breadcrumb :items="['AI 中心', '用量统计']" />
    <div class="contain">
      <!-- 汇总卡片 -->
      <div class="summary-cards">
        <div class="summary-card">
          <div class="card-label">总调用次数</div>
          <div class="card-value blue">{{ summary.totalCalls || 0 }}</div>
        </div>
        <div class="summary-card">
          <div class="card-label">总Token用量</div>
          <div class="card-value green">{{ formatNumber(summary.totalTokens || 0) }}</div>
        </div>
        <div class="summary-card">
          <div class="card-label">预估费用（USD）</div>
          <div class="card-value purple">{{ summary.totalCost ? Number(summary.totalCost).toFixed(4) : '0.0000' }}</div>
        </div>
        <div class="summary-card">
          <div class="card-label">历史记录数</div>
          <div class="card-value orange">{{ formPage.total }}</div>
        </div>
      </div>

      <!-- 筛选工具栏 -->
      <div class="toolbar">
        <div class="toolbar-left">
          <tiny-input v-model="filterParams.startDate" type="date" placeholder="开始日期" style="width: 150px; margin-right: 8px" />
          <tiny-input v-model="filterParams.endDate" type="date" placeholder="结束日期" style="width: 150px; margin-right: 8px" />
          <tiny-button type="primary" size="small" @click="handlerSearch">查询</tiny-button>
          <tiny-button size="small" @click="resetFilter">重置</tiny-button>
        </div>
        <tiny-button size="small" plain @click="exportData">导出</tiny-button>
      </div>

      <!-- 用量记录表格 -->
      <tiny-grid :data="records" border size="small" :height="tableHeight">
        <tiny-grid-column field="createTime" title="时间" width="200">
          <template #default="{ row }">
            {{ formatTime(row.createTime) }}
          </template>
        </tiny-grid-column>
        <tiny-grid-column field="userName" title="用户" width="120" />
        <tiny-grid-column field="modelName" title="模型" />
        <tiny-grid-column field="promptTokens" title="输入Token" width="150" />
        <tiny-grid-column field="completionTokens" title="输出Token" width="150" />
        <tiny-grid-column field="totalTokens" title="总Token" width="150" />
        <tiny-grid-column field="estimatedCost" title="预估费用" width="150" />
      </tiny-grid>

      <!-- 分页 -->
      <tiny-pager
        :align="formPage.align"
        :current-page="formPage.page"
        :layout="formPage.layout"
        :page-size="formPage.limit"
        :page-sizes="formPage.pageSizes"
        :total="formPage.total"
        @current-change="pageChange"
        @size-change="limitChange"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, reactive } from 'vue'
import {
  Button as TinyButton,
  Input as TinyInput,
  Grid as TinyGrid,
  GridColumn as TinyGridColumn,
  Pager as TinyPager,
  Modal
} from '@opentiny/vue'
import { AiUsageApi } from '@/api/ai'
import Breadcrumb from '@/components/breadcrumb/index.vue'
import {PageUtils} from "@/utils/page";
const tableHeight = ref(300)
const records = ref<any[]>([])
const summary = ref<any>({})
const filterParams = reactive({ startDate: '', endDate: '', modelId: '' })

const formPage = reactive({
  page: 1,
  limit: 15,
  total: 0,
  align: 'right',
  layout: 'total, prev, pager, next, jumper, sizes',
  pageSizes: [10, 20, 50, 100]
})

const formatTime = (val: any) => {
  if (!val) return ''
  const d = new Date(typeof val === 'number' ? val : val)
  if (isNaN(d.getTime())) return val
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

const formatNumber = (n: number) => {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return String(n)
}

const loadSummary = async () => {
  try {
    const res: any = await AiUsageApi.summary()
    summary.value = res.data?.data || res.data || {}
  } catch { /* ignore */ }
}

const loadRecords = async () => {
  try {
    const params: any = { page: formPage.page, limit: formPage.limit }
    if (filterParams.startDate) params.startDate = filterParams.startDate
    if (filterParams.endDate) params.endDate = filterParams.endDate
    if (filterParams.modelId) params.modelId = filterParams.modelId
    const res: any = await AiUsageApi.recordsPage(params)
    const pageData = res.data?.data || res.data || {}
    records.value = pageData.list || []
    formPage.total = pageData.total || 0
  } catch (e: any) {
    Modal.message({ message: e?.message || '加载失败', status: 'error' })
  }
}

const handlerSearch = () => {
  formPage.page = 1
  loadRecords()
}

const resetFilter = () => {
  Object.assign(filterParams, { startDate: '', endDate: '', modelId: '' })
  formPage.page = 1
  loadRecords()
}

const pageChange = (page: number) => {
  formPage.page = page
  loadRecords()
}

const limitChange = (limit: number) => {
  formPage.limit = limit
  formPage.page = 1
  loadRecords()
}

const exportData = () => {
  Modal.message({ message: '导出功能开发中', status: 'info' })
}

onMounted(async () => {
  await Promise.all([loadSummary(), loadRecords()])
  tableHeight.value = PageUtils.setTableHeight(420)
})
</script>

<style scoped>
.page-container { padding: 16px; min-height: 100%; background: #f5f7fa; }
.contain { background: #fff; border-radius: 8px; padding: 20px; }
.summary-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 20px; }
.summary-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px 20px; }
.card-label { font-size: 13px; color: #6b7280; margin-bottom: 8px; }
.card-value { font-size: 28px; font-weight: 700; }
.card-value.blue { color: #2563eb; }
.card-value.green { color: #16a34a; }
.card-value.purple { color: #7c3aed; }
.card-value.orange { color: #d97706; }
.toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.toolbar-left { display: flex; align-items: center; gap: 8px; }
</style>
