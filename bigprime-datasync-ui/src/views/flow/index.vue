<template>
  <div class="container-list">
    <Breadcrumb :items="['任务中心']" />
    <!-- 页面主体：列表区 + AI 侧边栏 -->
    <div class="flow-page-body">
    <div ref="contain" class="contain" :class="{ 'contain-with-ai': aiPanelVisible }">
      <tiny-grid
        v-if="!showEditor"
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
                <tiny-form-item>
                  <tiny-search
                    v-model="searchForm.search"
                    clearable
                    is-enter-search
                    placeholder="请输入关键词"
                    style="width: 300px"
                    @search="handleSearch"
                  />
                </tiny-form-item>
                <tiny-form-item>
                  <tiny-button size="small" type="primary" @click="handleCreate">创建</tiny-button>
                  <tiny-button size="small" @click="handleRefresh">刷新</tiny-button>
                  <!-- ETL AI 助手入口（仅列表视图） -->
                  <tiny-button
                    v-if="!showEditor"
                    size="small"
                    type="success"
                    :class="{ 'etl-ai-fab--active': aiPanelVisible }"
                    class="etl-ai-fab"
                    @click="toggleAiPanel"
                  >
                    <svg viewBox="0 0 20 20" width="14" height="14" style="margin-right:4px;flex-shrink:0;vertical-align:middle">
                      <rect x="3" y="4" width="14" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="1.5" />
                      <circle cx="7.5" cy="9" r="1.3" fill="currentColor" />
                      <circle cx="12.5" cy="9" r="1.3" fill="currentColor" />
                      <path d="M7 12.5 Q10 14.5 13 12.5" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
                      <line x1="6" y1="4" x2="5" y2="1.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
                      <line x1="14" y1="4" x2="15" y2="1.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" />
                    </svg>
                    <span style="vertical-align:middle">AI 助手</span>
                  </tiny-button>
                </tiny-form-item>
              </tiny-form>
            </template>
          </tiny-grid-toolbar>
        </template>

        <tiny-grid-column fixed="left" type="index" width="50" />

        <tiny-grid-column title="任务名称" field="name" fixed="left" width="256" />

        <tiny-grid-column title="任务描述" field="description" show-overflow="tooltip" />

<!--        <tiny-grid-column title="状态" align="center" field="statusLabel" width="100" />-->

        <tiny-grid-column title="创建人" align="center" field="creatorName" width="130" />

        <tiny-grid-column title="创建时间" align="center" field="createTime" width="180" />

        <tiny-grid-column title="更新时间" align="center" field="updateTime" width="180" />

        <tiny-grid-column title="操作" align="center" width="170">
          <template #default="data">
            <div style="display: flex; gap: 10px; justify-content: center; align-items: center;">
              <div title="调度配置">
                <tiny-icon-time
                  @click="handleSchedule(data.row)"
                  style="font-size: 20px; cursor: pointer; fill: #faad14; color: #faad14;"
                />
              </div>
              <div title="编辑">
                <tiny-icon-edit
                  @click="handleEdit(data.row)"
                  style="font-size: 20px; cursor: pointer; fill: #52c41a; color: #52c41a;"
                />
              </div>
              <div title="运行">
                <tiny-icon-start
                  @click="handleRun(data.row)"
                  style="font-size: 20px; cursor: pointer; fill: #52c41a; color: #52c41a;"
                />
              </div>
              <div title="停止">
                <tiny-icon-stop
                  @click="handleStop(data.row)"
                  style="font-size: 20px; cursor: pointer; fill: #faad14; color: #faad14;"
                />
              </div>
              <div title="删除">
                <tiny-icon-del
                  @click="handleDelete(data.row)"
                  style="font-size: 20px; cursor: pointer; fill: #f56c6c; color: #f56c6c;"
                />
              </div>
            </div>
          </template>
        </tiny-grid-column>
      </tiny-grid>

      <!-- 分页 -->
      <tiny-pager
        v-if="!showEditor"
        :align="formPage.align"
        :current-page="formPage.page"
        :layout="formPage.layout"
        :page-size="formPage.limit"
        :page-sizes="formPage.pageSizes"
        :total="formPage.total"
        @current-change="pageChange"
        @size-change="limitChange"
      />

      <!-- 流程编辑器 -->
      <div v-if="showEditor">
        <FlowEditor :current-row="currentRow" @back="handleBack" />
      </div>

      
    </div>


    <!-- AI 助手抽屉（右侧，70% 宽度） -->
    <tiny-drawer
      v-model:visible="aiPanelVisible"
      :title="selectedAssistant ? (selectedAssistant.avatar || '\uD83E\uDD16') + ' ' + selectedAssistant.name : 'AI 助手'"
      placement="right"
      width="70%"
      :mask-closable="true"
      class="etl-ai-drawer"
      @open="onAiDialogOpen"
      @close="onAiDialogClose"
    >
      <!-- 对话区域 -->
      <div class="etl-ai-genui-wrap">
        <div v-if="etlSessionCreating || (!etlSessionId && etlAssistantList.length === 0)" class="etl-ai-loading">正在加载助手...</div>
        <GenuiConfigProvider v-else-if="etlSessionId" :theme="'light'">
          <GenuiChat
            :key="etlSessionId"
            ref="etlGenuiRef"
            :url="etlChatUrl"
            :model="etlModelId"
            :custom-fetch="etlCustomFetch"
          />
        </GenuiConfigProvider>
        <div v-else class="etl-ai-loading">暂无可用的 ETL 助手，请先在《AI 助手》页面配置分类为「etl」的助手</div>
      </div>
      <!-- 底部切换区（多个 ETL 助手时显示） -->
      <div v-if="etlSessionId && etlAssistantList.length > 1" class="etl-ai-switch-bar">
        <span class="etl-ai-switch-label">切换助手：</span>
        <div class="etl-ai-switch-tabs">
          <span
            v-for="item in etlAssistantList"
            :key="item.id"
            class="etl-ai-switch-tab"
            :class="{ active: etlSelectedAssistantId === item.id }"
            @click="onSwitchAssistant(item)"
          >
            <span class="tab-avatar">{{ item.avatar || '🤖' }}</span>
            {{ item.name }}
          </span>
        </div>
      </div>
    </tiny-drawer>

    </div><!-- end flow-page-body -->

      <!-- 触发器配置对话框 -->
      <tiny-dialog-box
        :visible="showTriggerDialog"
        :title="'调度配置 - ' + (currentRow?.name || '')"
        width="700px"
        @update:visible="showTriggerDialog = $event"
        @close="handleTriggerDialogClose"
      >
        <tiny-form ref="triggerFormRef" :model="triggerForm" :rules="triggerRules" label-width="120px">
          <tiny-form-item label="触发器名称" prop="name">
            <tiny-input v-model="triggerForm.name" placeholder="请输入触发器名称" />
          </tiny-form-item>
          
          <tiny-form-item label="Cron表达式" prop="cronExpression">
            <tiny-input v-model="triggerForm.cronExpression" placeholder="例：0 0 2 * * ?（每天2点执行）" />
            <div class="form-tip">
              示例：0 0/5 * * * ? (每5分钟) | 0 0 2 * * ? (每天2点) | 0 0 0 * * ? (每天0点)
            </div>
          </tiny-form-item>
          
          <tiny-form-item label="并发策略">
            <tiny-select v-model="triggerForm.concurrencyPolicy" placeholder="请选择并发策略">
              <tiny-option label="禁止并发" value="FORBID" />
              <tiny-option label="替换旧的" value="REPLACE" />
              <tiny-option label="允许并行" value="ALLOW" />
            </tiny-select>
          </tiny-form-item>
          
          <tiny-form-item v-if="triggerForm.concurrencyPolicy === 'ALLOW'" label="最大并行数">
            <tiny-numeric v-model="triggerForm.maxParallel" :min="1" :max="10" />
          </tiny-form-item>
          
          <tiny-form-item label="预览执行时间">
            <tiny-button size="small" @click="handlePreviewCron">预览</tiny-button>
            <div v-if="previewTimes.length > 0" class="preview-times">
              <div v-for="(time, index) in previewTimes" :key="index" class="preview-time-item">
                {{ index + 1 }}. {{ time }}
              </div>
            </div>
          </tiny-form-item>
          
          <tiny-form-item label="描述">
            <tiny-input v-model="triggerForm.description" type="textarea" :rows="3" placeholder="请输入触发器描述" />
          </tiny-form-item>
        </tiny-form>
        
        <template #footer>
          <tiny-button @click="showTriggerDialog = false">取消</tiny-button>
          <tiny-button type="primary" @click="handleSaveTrigger">保存</tiny-button>
        </template>
      </tiny-dialog-box>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, computed } from 'vue'
import {
  Grid as TinyGrid,
  Modal,
  TinyActionMenu,
  TinyButton,
  TinyForm,
  TinyFormItem,
  TinyGridColumn,
  TinyGridToolbar,
  TinySearch,
  Pager as TinyPager,
  DialogBox as TinyDialogBox,
  Drawer as TinyDrawer,
  Input as TinyInput,
  Select as TinySelect,
  Option as TinyOption,
  Numeric as TinyNumeric
} from '@opentiny/vue'
import { iconDel, iconEdit,iconStart,iconStop, iconTime } from '@opentiny/vue-icon'
import { formatDateTime } from '@/utils/date'
import { formPage } from '@/utils/tool'
import { PageUtils } from '@/utils/page'
import { FlowService } from '@/services/flow'
import { createTrigger, previewCron } from '@/api/trigger'
import { AiAssistantApi, AiChatApi } from '@/api/ai'
import { getToken } from '@/utils/token'
import { GenuiChat, GenuiConfigProvider } from '@opentiny/genui-sdk-vue'
import FlowEditor from './components/FlowEditor.vue'
import Breadcrumb from '@/components/breadcrumb/index.vue'

const TinyIconTime = iconTime()
const TinyIconEdit = iconEdit()
const TinyIconStart = iconStart()
const TinyIconStop = iconStop()
const TinyIconDel = iconDel()

const loading = ref(false)
const tableHeight = ref(500)
const gridRef = ref(null)
const gridData = ref<any[]>([])
const showEditor = ref(false)
const currentRow = ref<any>(null)
const showTriggerDialog = ref(false)
const triggerFormRef = ref(null)
const previewTimes = ref<string[]>([])

// 触发器表单
const triggerForm = ref({
  name: '',
  dagDefinitionId: '',
  type: 'CRON',
  cronExpression: '',
  enabled: false,
  concurrencyPolicy: 'FORBID',
  maxParallel: 3,
  description: ''
})

// 触发器表单验证规则
const triggerRules = ref({
  name: [{ required: true, message: '请输入触发器名称', trigger: 'blur' }],
  cronExpression: [{ required: true, message: '请输入Cron表达式', trigger: 'blur' }]
})

// 搜索表单
const searchForm = ref({
  search: ''
})

// 流程状态
const flowStatus = ref([
  { name: 'DRAFT', label: '草稿' },
  { name: 'RUNNING', label: '运行中' },
  { name: 'STOPPED', label: '已停止' },
  { name: 'FAILED', label: '失败' }
])

// 组件挂载时加载数据
onMounted(() => {
  loadData()
  tableHeight.value = PageUtils.setTableHeight(null)
})

// 格式化时间戳
const formatTimestamp = (timestamp: any) => {
  if (timestamp) {
    const date = new Date(timestamp)
    return formatDateTime(date)
  }
  return timestamp
}

// 加载数据
const loadData = async () => {
  try {
    loading.value = true
    const params = {
      ...searchForm.value,
      page: formPage.value.page,
      pageSize: formPage.value.limit
    }
    const res: any = await FlowService.getFlowList(params)
    if (res.msg === 'success') {
      res.data.list.forEach((item: any) => {
        item.createTime = formatTimestamp(item.createTime)
        item.updateTime = formatTimestamp(item.updateTime)
        const findStatus = flowStatus.value.find((x) => x.name === item.status)
        if (findStatus) {
          item.statusLabel = findStatus.label
        }
      })
      gridData.value = res.data.list
      formPage.value.total = res.data.total || 0
    }
  } catch (error) {
    console.error('Failed to load flows:', error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = async () => await loadData()

// 刷新
const handleRefresh = async () => await loadData()

// 分页变化
const pageChange = (page: number) => {
  formPage.value.page = page
  loadData()
}

const limitChange = (limit: number) => {
  formPage.value.limit = limit
  loadData()
}

// 创建流程
const handleCreate = () => {
  currentRow.value = null
  showEditor.value = true
}

// 调度操作
const handleSchedule = (row: any) => {
  currentRow.value = row
  triggerForm.value = {
    name: `${row.name}_定时任务`,
    dagDefinitionId: row.id,
    type: 'CRON',
    cronExpression: '0 0 2 * * ?',
    enabled: false,
    concurrencyPolicy: 'FORBID',
    maxParallel: 3,
    description: ''
  }
  previewTimes.value = []
  showTriggerDialog.value = true
}

// 编辑操作
const handleEdit = (row: any) => {
  currentRow.value = row
  showEditor.value = true
}

// 运行操作
const handleRun = (row: any) => {
  const name = row.name
  const id = row.id
  Modal.confirm({
    title: '运行确认',
    message: '确定要运行流程 [' + name + '] 吗？',
    showHeader: true,
    showFooter: true,
    events: {
      confirm() {
        FlowService.runFlow(id).then((response: any) => {
          if (response.msg === 'success') {
            Modal.message({ status: 'success', message: '任务提交成功，正在执行...', top: 20 })
            loadData()
          } else {
            Modal.message({ status: 'error', message: response.msg, top: 20 })
          }
        })
      }
    }
  })
}

// 停止操作
const handleStop = (row: any) => {
  const name = row.name
  const id = row.id
  Modal.confirm({
    title: '停止确认',
    message: '确定要停止流程 [' + name + '] 吗？',
    showHeader: true,
    showFooter: true,
    events: {
      confirm() {
        FlowService.stopFlow(id).then((response: any) => {
          if (response.msg === 'success') {
            Modal.message({ status: 'success', message: '停止成功!', top: 20 })
            loadData()
          } else {
            Modal.message({ status: 'error', message: response.msg, top: 20 })
          }
        })
      }
    }
  })
}

// 删除操作
const handleDelete = (row: any) => {
  const name = row.name
  const id = row.id
  Modal.confirm({
    title: '删除确认',
    message: '确定要删除流程 [' + name + '] 吗？',
    showHeader: true,
    showFooter: true,
    resize: true,
    events: {
      confirm() {
        FlowService.deleteFlow(id).then((response: any) => {
          if (response.msg === 'success') {
            Modal.message({ status: 'success', message: '删除成功!', top: 20 })
            loadData()
          } else {
            Modal.message({ status: 'error', message: response.msg, top: 20 })
          }
        })
      }
    }
  })
}

// 预览Cron表达式
const handlePreviewCron = async () => {
  if (!triggerForm.value.cronExpression) {
    Modal.message({ status: 'warning', message: '请先输入Cron表达式', top: 20 })
    return
  }
  
  try {
    const res: any = await previewCron(triggerForm.value.cronExpression, 5)
    if (res.msg === 'success') {
      previewTimes.value = res.data.map((time: string) => formatTimestamp(time))
    } else {
      Modal.message({ status: 'error', message: res.msg, top: 20 })
    }
  } catch (error: any) {
    Modal.message({ status: 'error', message: error.message || 'Cron表达式无效', top: 20 })
  }
}

// 保存触发器
const handleSaveTrigger = async () => {
  try {
    const valid = await (triggerFormRef.value as any)?.validate()
    if (!valid) return
    
    const res: any = await createTrigger(triggerForm.value)
    if (res.msg === 'success') {
      Modal.message({ status: 'success', message: '触发器创建成功！', top: 20 })
      showTriggerDialog.value = false
    } else {
      Modal.message({ status: 'error', message: res.msg, top: 20 })
    }
  } catch (error: any) {
    Modal.message({ status: 'error', message: error.message || '创建失败', top: 20 })
  }
}

// 关闭触发器对话框
const handleTriggerDialogClose = () => {
  previewTimes.value = []
  triggerFormRef.value?.resetFields()
}

// 返回列表
const handleBack = () => {
  showEditor.value = false
  currentRow.value = null
  loadData()
}

// ===================== ETL AI 助手面板（GenUI 版） =====================
const aiPanelVisible = ref(false)
const etlSessionId = ref('')
const etlModelId = ref('default')
const etlGenuiRef = ref<any>(null)
const etlAssistantList = ref<any[]>([])
const etlSelectedAssistantId = ref('')
const etlSessionCreating = ref(false)
const selectedAssistant = computed(() =>
  etlAssistantList.value.find((a) => a.id === etlSelectedAssistantId.value)
)

// GenUI 标准 OpenAI 兼容接口 URL
const etlChatUrl = computed(() =>
  etlSessionId.value
    ? `/api/ai/chat/openai/completions?sessionId=${etlSessionId.value}&_t=${Date.now()}`
    : ''
)

// 注入 Authorization Header
const etlCustomFetch = (input: RequestInfo | URL, init?: RequestInit) => {
  const token = getToken() || ''
  return fetch(input, {
    ...init,
    headers: { ...(init?.headers || {}), Authorization: token }
  })
}

async function toggleAiPanel() {
  aiPanelVisible.value = !aiPanelVisible.value
}

// 对话框打开：加载 ETL 助手列表，自动选中第一个并直接进入对话
async function onAiDialogOpen() {
  if (etlSessionId.value) return
  try {
    etlSessionCreating.value = true
    const res: any = await AiAssistantApi.list('etl')
    etlAssistantList.value = res?.data || []
    if (etlAssistantList.value.length === 0) {
      etlSessionCreating.value = false
      return
    }
    // 默认选中第一个，自动开始对话
    const first = etlAssistantList.value[0]
    etlSelectedAssistantId.value = first.id
    await _createSession(first)
  } catch (e: any) {
    console.error('加载 ETL 助手失败:', e)
    etlSessionCreating.value = false
  }
}

// 内部：创建对话
async function _createSession(assistant: any) {
  etlSessionCreating.value = true
  etlSessionId.value = ''
  try {
    etlModelId.value = assistant.modelId || 'default'
    const sessionRes: any = await AiChatApi.createSession({
      assistantId: assistant.id,
      modelId: assistant.modelId || '',
      title: assistant.name + ' 对话',
      source: 'etl'
    })
    etlSessionId.value = sessionRes?.data?.id || sessionRes?.data || ''
  } catch (e: any) {
    console.error('创建会话失败:', e)
  } finally {
    etlSessionCreating.value = false
  }
}

// 切换助手（直接为指定助手创建新会话，无需返回选择页）
async function onSwitchAssistant(assistant: any) {
  if (etlSelectedAssistantId.value === assistant.id) return
  etlSelectedAssistantId.value = assistant.id
  await _createSession(assistant)
}

// 对话框关闭时重置状态
function onAiDialogClose() {
  etlSessionId.value = ''
  etlSelectedAssistantId.value = ''
  etlAssistantList.value = []
  etlSessionCreating.value = false
}

function handleRefreshAfterCreate() {
  loadData()
  Modal.message({ status: 'success', message: '列表已刷新，新任务在列表中显示为「草稿」状态', top: 20 })
}
</script>

<style lang="less" scoped>
.container-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.contain {
  flex: 1 1 auto;
  margin: 8px 10px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 0 8px 8px rgba(169, 174, 184, 0.05);
  padding: 10px;
  overflow: auto;
  position: relative;

  .grid-toolbar {
    .tiny-select {
      width: 280px;
    }
  }
}

.form-tip {
  margin-top: 4px;
  font-size: 12px;
  color: #999;
  line-height: 1.5;
}

.preview-times {
  margin-top: 8px;
  padding: 8px;
  background: #f5f7fa;
  border-radius: 4px;
  max-height: 150px;
  overflow-y: auto;
}

.preview-time-item {
  padding: 4px 0;
  font-size: 12px;
  color: #606266;
}

// ===================== 页面布局 =====================
.flow-page-body {
  display: flex;
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

.contain {
  flex: 1;
  min-width: 0;
  transition: none;
  position: relative;
}

// ===================== ETL AI 助手入口按鈕 =====================
.etl-ai-fab {
  display: inline-flex !important;
  align-items: center;

  &--active,
  &.etl-ai-fab--active {
    color: #1677ff !important;
    border-color: #1677ff !important;
    background: #e6f4ff !important;
  }
}

// ===================== ETL AI 抽屉样式 =====================
:global(.etl-ai-drawer) {
  .tiny-drawer__body {
    padding: 0 !important;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    height: 100%;
  }
}

.etl-ai-genui-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;

  :deep(.tiny-config-provider) {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  --tr-bubble-text-font-size: 14px;
}

.etl-ai-loading {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 13px;
}

// ===================== 已删除选择面板，改为底部切换标签栏 =====================

// ===================== 底部切换助手工具栏 =====================
.etl-ai-switch-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: #f8fafc;
  border-top: 1px solid #f0f0f0;
}

.etl-ai-switch-label {
  font-size: 12px;
  color: #9ca3af;
  flex-shrink: 0;
}

.etl-ai-switch-tabs {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.etl-ai-switch-tab {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 14px;
  font-size: 12px;
  cursor: pointer;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #374151;
  transition: all 0.15s;
  user-select: none;

  &:hover {
    background: #eff6ff;
    border-color: #bfdbfe;
    color: #1d4ed8;
  }

  &.active {
    background: #dbeafe;
    border-color: #3b82f6;
    color: #1d4ed8;
    font-weight: 500;
  }
}

.tab-avatar {
  font-size: 14px;
  line-height: 1;
}
</style>
