<template>
  <div class="agent-monitor" :class="{ 'embedded': embedded }">
    <Breadcrumb v-if="!embedded" :items="['爬虫管理', 'Agent 执行监控']" />
    <div class="contain" ref="containRef">
      <!-- 任务配置区 -->
      <div class="config-card">
        <!-- 嵌入模式：只读任务信息展示 + 按钮同行 -->
        <template v-if="embedded">
          <div class="task-meta-bar">
            <span class="meta-chip meta-chip--task">
              <span class="chip-icon">📋</span>
              <span class="chip-label">任务</span>
              <span class="chip-value">{{ initTaskName || '-' }}</span>
            </span>
            <span class="meta-chip meta-chip--model">
              <span class="chip-icon">🤖</span>
              <span class="chip-label">助手</span>
              <span class="chip-value">{{ form.assistantId ? assistantDisplayName : (modelDisplayName !== '-' ? modelDisplayName : '-') }}</span>
            </span>
            <span class="meta-chip meta-chip--connector">
              <span class="chip-icon">🌐</span>
              <span class="chip-label">Playwright</span>
              <span class="chip-value">{{ connectorDisplayName }}</span>
            </span>
            <span class="meta-chip meta-chip--url" :title="form.websiteUrl">
              <span class="chip-icon">🔗</span>
              <span class="chip-label">URL</span>
              <span class="chip-value chip-value--url">{{ form.websiteUrl || '-' }}</span>
            </span>
            <span class="meta-sep--push"></span>
            <tiny-button size="small" type="primary" :disabled="isRunning" @click="startAgent">
              {{ isRunning ? '执行中...' : '开始执行' }}
            </tiny-button>
            <tiny-button size="small" v-if="isRunning" type="danger" @click="stopAgent">停止</tiny-button>
            <tiny-button size="small" v-if="events.length > 0" @click="clearEvents">清空记录</tiny-button>
          </div>
        </template>

        <!-- 独立页面模式：可编辑表单 -->
        <template v-else>
          <h3>新建 Agent 爬取任务</h3>
          <div class="form-row">
            <div class="form-item">
              <label>目标网站 URL <span class="required">*</span></label>
              <tiny-input v-model="form.websiteUrl" placeholder="https://example.com" clearable />
            </div>
            <div class="form-item">
              <label>AI 模型</label>
              <tiny-input v-model="form.modelId" placeholder="模型 ID（如 gpt-4o）" clearable />
            </div>
          </div>
          <div class="form-row">
            <div class="form-item">
              <label>登录用户名</label>
              <tiny-input v-model="form.loginUsername" placeholder="可选" clearable />
            </div>
            <div class="form-item">
              <label>登录密码</label>
              <tiny-input v-model="form.loginPassword" type="password" placeholder="可选" clearable />
            </div>
          </div>
          <div class="form-row">
            <div class="form-item full-width">
              <label>爬取指令 <span class="required">*</span></label>
              <tiny-input
                v-model="form.instructions"
                type="textarea"
                :rows="3"
                placeholder="用自然语言描述要提取的数据，如：提取产品列表，包含名称、价格、描述"
              />
            </div>
          </div>
          <div class="form-row">
            <div class="form-item">
              <label>Playwright Connector ID</label>
              <tiny-input v-model="form.playwrightConnectorId" placeholder="浏览器连接器 ID（可选）" clearable />
            </div>
            <div class="form-item">
              <label>最大步骤数</label>
              <tiny-input-number v-model="form.maxSteps" :min="5" :max="50" />
            </div>
          </div>
          <div class="form-actions">
            <tiny-button type="primary" :disabled="isRunning" @click="startAgent">
              {{ isRunning ? '执行中...' : '开始执行' }}
            </tiny-button>
            <tiny-button v-if="isRunning" type="danger" @click="stopAgent">停止</tiny-button>
            <tiny-button v-if="events.length > 0" @click="clearEvents">清空记录</tiny-button>
          </div>
        </template>
      </div>

      <!-- 执行状态 -->
      <div v-if="isRunning || events.length > 0" class="execution-panel">
        <!-- 状态栏 -->
        <div class="status-bar">
          <div class="status-item">
            <span class="label">状态：</span>
            <tiny-tag :type="statusTagType">{{ statusText }}</tiny-tag>
          </div>
          <div class="status-item">
            <span class="label">步骤：</span>
            <span class="value">{{ currentStep }}</span>
          </div>
          <div class="status-item">
            <span class="label">耗时：</span>
            <span class="value">{{ elapsedTime }}</span>
          </div>
        </div>

        <!-- Agent 思考步骤实时展示 -->
        <div class="steps-panel">
          <h4>Agent 执行步骤</h4>
          <div class="steps-list" ref="stepsListRef">
            <div
              v-for="(event, index) in events"
              :key="index"
              :class="['step-item', `step-${event.type?.toLowerCase()}`]"
            >
              <!-- PLANNING -->
              <div v-if="event.type === 'PLANNING'" class="step-planning">
                <div class="step-header">
                  <span class="step-icon">📋</span>
                  <span class="step-label">规划任务</span>
                  <span class="step-time">{{ formatTime(event.timestamp) }}</span>
                </div>
                <div class="step-content planning-content">{{ event.content }}</div>
              </div>

              <!-- THINKING -->
              <div v-else-if="event.type === 'THINKING'" class="step-thinking">
                <div class="step-header">
                  <span class="step-icon">💭</span>
                  <span class="step-label">思考 (Step {{ event.step }})</span>
                  <span class="step-time">{{ formatTime(event.timestamp) }}</span>
                </div>
                <div class="step-content thinking-content">{{ event.content }}</div>
              </div>

              <!-- ACTION -->
              <div v-else-if="event.type === 'ACTION'" class="step-action">
                <div class="step-header">
                  <span class="step-icon">⚡</span>
                  <span class="step-label">
                    执行工具 (Step {{ event.step }}):
                    <code class="tool-name">{{ event.toolName }}</code>
                  </span>
                  <span class="step-time">{{ formatTime(event.timestamp) }}</span>
                </div>
                <pre v-if="event.toolInput" class="step-content action-input">{{ formatJson(event.toolInput) }}</pre>
              </div>

              <!-- OBSERVATION -->
              <div v-else-if="event.type === 'OBSERVATION'" class="step-observation">
                <div class="step-header">
                  <span class="step-icon">👁️</span>
                  <span class="step-label">
                    观察结果:
                    <code class="tool-name">{{ event.toolName }}</code>
                  </span>
                  <span class="step-time">{{ formatTime(event.timestamp) }}</span>
                </div>
                <div class="step-content observation-content">
                  <!-- 图片截图展示 -->
                  <img
                    v-if="event.content?.startsWith('data:image')"
                    :src="event.content"
                    class="screenshot-img"
                    alt="页面截图"
                  />
                  <span v-else>{{ truncate(event.content, 500) }}</span>
                </div>
              </div>

              <!-- RESULT -->
              <div v-else-if="event.type === 'RESULT'" class="step-result">
                <div class="step-header">
                  <span class="step-icon">✅</span>
                  <span class="step-label">最终结果</span>
                  <span class="step-time">{{ formatTime(event.timestamp) }}</span>
                </div>
                <pre class="step-content result-content">{{ formatJson(event.content) }}</pre>
              </div>

              <!-- ERROR -->
              <div v-else-if="event.type === 'ERROR'" :class="['step-error', isModelLimitError(event.content) ? 'step-error--limit' : '']">
                <div class="step-header">
                  <span class="step-icon">{{ isModelLimitError(event.content) ? '⚠️' : '❌' }}</span>
                  <span class="step-label">{{ isModelLimitError(event.content) ? '模型限制' : '执行错误' }}</span>
                  <span class="step-time">{{ formatTime(event.timestamp) }}</span>
                </div>
                <div class="step-content error-content">{{ event.content }}</div>
                <div v-if="isModelLimitError(event.content)" class="error-action-tip">
                  💡 请在上方切换为其他模型后重新执行任务
                </div>
              </div>
            </div>

            <!-- 运行中动画 -->
            <div v-if="isRunning" class="running-indicator">
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
              <span>Agent 正在思考中...</span>
            </div>
          </div>
        </div>

        <!-- 最终数据预览 -->
        <div v-if="finalResult" class="result-preview">
          <h4>提取结果</h4>
          <div class="result-toolbar">
            <tiny-button size="small" @click="copyResult">复制 JSON</tiny-button>
            <tiny-button size="small" type="primary" @click="downloadJson(finalResult, 'result')">下载 JSON</tiny-button>
            <tiny-button
              v-if="isParsedArray(finalResult)"
              size="small"
              type="success"
              @click="downloadCsv(finalResult, 'result')"
            >下载 CSV</tiny-button>
          </div>
          <div v-if="isParsedArray(finalResult)" class="result-table-wrap">
            <table class="result-table">
              <thead>
                <tr>
                  <th v-for="col in getColumns(finalResult)" :key="col">{{ col }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, i) in getParsedArray(finalResult)" :key="i">
                  <td v-for="col in getColumns(finalResult)" :key="col">{{ row[col] ?? '' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <pre v-else class="result-json">{{ formatJson(finalResult) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { nextTick, reactive, ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  Button as TinyButton,
  Input as TinyInput,
  Numeric as TinyInputNumber,
  Tag as TinyTag,
  Modal
} from '@opentiny/vue'
import Breadcrumb from '@/components/breadcrumb/index.vue'
import { CrawlerAgentApi } from '@/api/crawler'
import { AiModelApi, AiAssistantApi } from '@/api/ai'
import request from '@/utils/request'

// ==================== Props（支持嵌入Drawer模式） ====================
const props = withDefaults(defineProps<{
  embedded?: boolean
  initTaskId?: string
  initTaskName?: string
  initWebsiteUrl?: string
  initInstructions?: string
  initAssistantId?: string
  initModelId?: string
  initConnectorId?: string
}>(), {
  embedded: false
})

// ==================== 状态 ====================

const route = useRoute()

const form = reactive({
  websiteUrl: '',
  loginUsername: '',
  loginPassword: '',
  instructions: '',
  assistantId: '',
  modelId: '',
  playwrightConnectorId: '',
  maxSteps: 20
})

// 当前执行的任务 ID
const currentTaskId = ref<string | undefined>(undefined)

// 助手列表（用于显示名称）
const crawlerAssistants = ref<any[]>([])
const assistantDisplayName = computed(() => {
  if (!form.assistantId) return '-'
  const found = crawlerAssistants.value.find(a => a.id === form.assistantId)
  return found ? found.name : form.assistantId
})

// 模型列表（兑容旧配置）
const aiModels = ref<any[]>([])
const modelDisplayName = computed(() => {
  if (!form.modelId) return '-'
  const found = aiModels.value.find(m => m.id === form.modelId)
  return found ? (found.displayName || found.modelName || form.modelId) : form.modelId
})

// 连接器列表（用于显示名称）
const playwrightConnectors = ref<any[]>([])
const connectorDisplayName = computed(() => {
  if (!form.playwrightConnectorId) return '-'
  const found = playwrightConnectors.value.find(c => c.id === form.playwrightConnectorId)
  if (!found) return form.playwrightConnectorId
  return found.host ? found.name + ' (' + found.host + ')' : found.name
})

interface AgentEvent {
  type: string
  content?: string
  toolName?: string
  toolInput?: string
  step?: number
  timestamp?: number
}

const events = ref<AgentEvent[]>([])
const isRunning = ref(false)
const currentStep = ref(0)
const finalResult = ref<string | null>(null)
const startTime = ref<number | null>(null)
const endTime = ref<number | null>(null)
const containRef = ref<HTMLElement | null>(null)
const stepsListRef = ref<HTMLElement | null>(null)

let abortController: AbortController | null = null

// ==================== 计算属性 ====================

const statusText = computed(() => {
  if (isRunning.value) return '执行中'
  if (events.value.some((e) => e.type === 'ERROR')) return '执行失败'
  if (finalResult.value) return '执行完成'
  if (events.value.length > 0) return '已停止'
  return '待执行'
})

const statusTagType = computed(() => {
  if (isRunning.value) return 'warning'
  if (events.value.some((e) => e.type === 'ERROR')) return 'danger'
  if (finalResult.value) return 'success'
  return 'info'
})

const elapsedTime = computed(() => {
  if (!startTime.value) return '-'
  const end = endTime.value || Date.now()
  const diff = Math.floor((end - startTime.value) / 1000)
  if (diff < 60) return `${diff} 秒`
  return `${Math.floor(diff / 60)} 分 ${diff % 60} 秒`
})

// ==================== 方法 ====================

const startAgent = () => {
  if (!form.websiteUrl.trim()) {
    Modal.message({ message: '请填写目标网站 URL', status: 'warning' })
    return
  }
  if (!form.assistantId.trim() && !form.modelId.trim()) {
    Modal.message({ message: '请选择爬虫助手或填写 AI 模型 ID', status: 'warning' })
    return
  }
  if (!form.instructions.trim()) {
    Modal.message({ message: '请填写爬取指令', status: 'warning' })
    return
  }
  if (!form.playwrightConnectorId?.trim()) {
    Modal.message({
      message: '请配置 Playwright Connector ID（到连接器管理中将 Browserless 连接器 ID 复制到这里）',
      status: 'warning'
    })
    return
  }

  events.value = []
  finalResult.value = null
  currentStep.value = 0
  isRunning.value = true
  startTime.value = Date.now()
  endTime.value = null

  const requestData = {
    taskId: currentTaskId.value,
    websiteUrl: form.websiteUrl,
    loginUsername: form.loginUsername || undefined,
    loginPassword: form.loginPassword || undefined,
    instructions: form.instructions,
    assistantId: form.assistantId || undefined,
    modelId: form.assistantId ? undefined : form.modelId,
    playwrightConnectorId: form.playwrightConnectorId || undefined,
    maxSteps: form.maxSteps,
    temperature: 0.2
  }

  abortController = CrawlerAgentApi.streamExecute(
    requestData,
    (eventType, data) => {
      // data.type 来自 Jackson 序列化的枚举名（如 "THINKING"），做 toString() 防御
      const rawType = data.type != null ? String(data.type) : eventType.toUpperCase()
      const event: AgentEvent = {
        type: rawType,
        content: data.content,
        toolName: data.toolName,
        toolInput: data.toolInput,
        step: data.step,
        // timestamp 可能是 Date 对象序列化后的毫秒数或 ISO 字符串，统一转 number
        timestamp: data.timestamp ? new Date(data.timestamp).getTime() : Date.now()
      }

      events.value.push(event)

      if (event.type === 'ACTION' || event.type === 'THINKING') {
        currentStep.value = event.step || currentStep.value + 1
      }

      if (event.type === 'RESULT') {
        finalResult.value = event.content || null
        isRunning.value = false
        endTime.value = Date.now()
      }

      if (event.type === 'ERROR') {
        isRunning.value = false
        endTime.value = Date.now()
      }

      // 自动滚动到最新
      nextTick(() => {
        if (stepsListRef.value) {
          stepsListRef.value.scrollTop = stepsListRef.value.scrollHeight
        }
      })
    },
    () => {
      isRunning.value = false
      endTime.value = Date.now()
    },
    (err) => {
      isRunning.value = false
      endTime.value = Date.now()
      events.value.push({
        type: 'ERROR',
        content: `请求失败: ${err.message}`,
        timestamp: Date.now()
      })
    }
  )
}

const stopAgent = () => {
  abortController?.abort()
  isRunning.value = false
  endTime.value = Date.now()
  events.value.push({
    type: 'ERROR',
    content: '用户手动停止执行',
    timestamp: Date.now()
  })
}

const clearEvents = () => {
  events.value = []
  finalResult.value = null
  currentStep.value = 0
  startTime.value = null
  endTime.value = null
}

const copyResult = () => {
  if (finalResult.value) {
    navigator.clipboard.writeText(finalResult.value)
      .then(() => Modal.message({ message: '已复制到剪贴板', status: 'success' }))
      .catch(() => Modal.message({ message: '复制失败，请手动复制', status: 'error' }))
  }
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

const formatJson = (str?: string | null): string => {
  if (!str) return ''
  try {
    const obj = typeof str === 'string' ? JSON.parse(str) : str
    return JSON.stringify(obj, null, 2)
  } catch {
    return str
  }
}

const formatTime = (ts?: number): string => {
  if (!ts) return ''
  return new Date(ts).toLocaleTimeString('zh-CN')
}

const isModelLimitError = (content?: string): boolean => {
  if (!content) return false
  return content.includes('rate_limit') || content.includes('频率超限') ||
         content.includes('上下文窗口') || content.includes('context_length') ||
         content.includes('API Key') || content.includes('无效或未授权')
}

const truncate = (str?: string, maxLen = 500): string => {
  if (!str) return ''
  if (str.length <= maxLen) return str
  return str.substring(0, maxLen) + `... [共 ${str.length} 字符]`
}

const fillFromParams = (taskId?: string, websiteUrl?: string, instructions?: string, assistantId?: string, modelId?: string, connectorId?: string) => {
  if (taskId) currentTaskId.value = taskId
  if (websiteUrl) form.websiteUrl = websiteUrl
  if (instructions) form.instructions = instructions
  if (assistantId) form.assistantId = assistantId
  if (modelId) form.modelId = modelId
  if (connectorId) form.playwrightConnectorId = connectorId
}

const loadModels = async () => {
  if (aiModels.value.length > 0) return
  try {
    const res: any = await AiModelApi.list()
    aiModels.value = res.data || []
  } catch { /* ignore */ }
}

const loadAssistants = async () => {
  if (crawlerAssistants.value.length > 0) return
  try {
    const res: any = await AiAssistantApi.list()
    crawlerAssistants.value = res.data || []
  } catch { /* ignore */ }
}

const loadConnectors = async () => {
  if (playwrightConnectors.value.length > 0) return
  try {
    const res: any = await request({ url: '/api/connector/list', method: 'post', data: { page: 1, pageSize: 100 } })
    const list = res.data?.list || res.data?.data || []
    playwrightConnectors.value = list.filter((c: any) => {
      const product = (c.product || '').toLowerCase()
      return product === 'playwright' || product === 'browser'
    })
  } catch { /* ignore */ }
}

onMounted(() => {
  if (props.embedded) {
    // 嵌入模式：从 props 读取
    fillFromParams(props.initTaskId, props.initWebsiteUrl, props.initInstructions, props.initAssistantId, props.initModelId, props.initConnectorId)
    loadAssistants()
    loadModels()
    loadConnectors()
  } else {
    // 独立页面模式：从路由 query 读取
    const q = route.query
    fillFromParams(q.taskId as string, q.websiteUrl as string, q.instructions as string, q.assistantId as string, q.modelId as string)
  }
})

// 当 props 变化时（Drawer 重新打开不同任务）重置并预填
watch(() => props.initTaskId, () => {
  if (props.embedded) {
    clearEvents()
    fillFromParams(props.initTaskId, props.initWebsiteUrl, props.initInstructions, props.initAssistantId, props.initModelId, props.initConnectorId)
  }
})

onUnmounted(() => {
  abortController?.abort()
})
</script>

<style lang="scss" scoped>
.agent-monitor {
  display: flex;
  flex-direction: column;

  .contain {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
}

.task-meta-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 4px 0;

  .meta-sep--push { flex: 1; }
}

.meta-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px 3px 7px;
  border-radius: 12px;
  font-size: 12px;
  line-height: 1;
  white-space: nowrap;
  border: 1px solid transparent;

  .chip-icon { font-size: 13px; }
  .chip-label {
    font-size: 11px;
    opacity: 0.7;
    margin-right: 2px;
  }
  .chip-value { font-weight: 500; }
  .chip-value--url {
    max-width: 240px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: inline-block;
    vertical-align: middle;
  }

  &.meta-chip--task {
    background: #ecf5ff;
    border-color: #b3d8ff;
    color: #409eff;
  }
  &.meta-chip--model {
    background: #f0f9eb;
    border-color: #b3e19d;
    color: #67c23a;
  }
  &.meta-chip--connector {
    background: #fdf6ec;
    border-color: #fcd17d;
    color: #e6a23c;
  }
  &.meta-chip--url {
    background: #f4f4f5;
    border-color: #d3d4d6;
    color: #606266;
  }
}

.config-card {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px;

  h3 {
    margin: 0 0 16px 0;
    font-size: 16px;
    color: #303133;
  }

  .form-row {
    display: flex;
    gap: 16px;
    margin-bottom: 12px;

    .form-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;

      &.full-width {
        flex: 2;
      }

      label {
        font-size: 13px;
        color: #606266;
        font-weight: 500;

        .required {
          color: #f56c6c;
          margin-left: 2px;
        }
      }
    }
  }

  .form-actions {
    margin-top: 16px;
    display: flex;
    gap: 8px;
  }

  .task-info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px 24px;
    margin-bottom: 16px;

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;

      &.full {
        grid-column: 1 / -1;
      }

      .info-label {
        font-size: 12px;
        color: #909399;
      }

      .info-value {
        font-size: 14px;
        color: #303133;
        word-break: break-all;
        line-height: 1.5;
      }
    }
  }
}

.execution-panel {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
}

.status-bar {
  display: flex;
  gap: 24px;
  padding: 12px 20px;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;

  .status-item {
    display: flex;
    align-items: center;
    gap: 6px;

    .label {
      font-size: 13px;
      color: #606266;
    }

    .value {
      font-size: 14px;
      color: #303133;
      font-weight: 600;
    }
  }
}

.steps-panel {
  padding: 20px;
  border-bottom: 1px solid #e4e7ed;

  h4 {
    margin: 0 0 12px 0;
    font-size: 14px;
    color: #303133;
  }

  .steps-list {
    max-height: calc(100vh - 280px);
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
}

.step-item {
  border-radius: 6px;

  .step-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    font-size: 13px;

    .step-icon {
      font-size: 16px;
    }

    .step-label {
      flex: 1;
      font-weight: 500;
    }

    .tool-name {
      background: rgba(0, 0, 0, 0.08);
      padding: 1px 6px;
      border-radius: 3px;
      font-size: 12px;
      font-family: monospace;
    }

    .step-time {
      font-size: 12px;
      color: #909399;
    }
  }

  .step-content {
    padding: 8px 12px;
    font-size: 13px;
    word-break: break-all;
  }
}

.step-planning {
  background: #f4f4f5;
  border: 1px solid #dcdfe6;

  .step-header { background: #e4e7ed; }
  .planning-content {
    color: #606266;
    white-space: pre-wrap;
  }
}

.step-thinking {
  background: #f0f9eb;
  border: 1px solid #c2e7b0;

  .step-header { background: #e1f3d8; }
  .thinking-content { color: #4a7c3f; white-space: pre-wrap; }
}

.step-action {
  background: #ecf5ff;
  border: 1px solid #b3d8ff;

  .step-header { background: #d9ecff; }

  .action-input {
    background: #1e1e1e;
    color: #9cdcfe;
    border-radius: 4px;
    font-family: monospace;
    font-size: 12px;
    overflow-x: auto;
    margin: 0;
  }
}

.step-observation {
  background: #fdf6ec;
  border: 1px solid #faecd8;

  .step-header { background: #faecd8; }
  .observation-content { color: #606266; }

  .screenshot-img {
    max-width: 100%;
    border-radius: 4px;
    border: 1px solid #dcdfe6;
  }
}

.step-result {
  background: #f0f9eb;
  border: 1px solid #67c23a;
  border-left: 4px solid #67c23a;

  .step-header { background: #d4edda; }

  .result-content {
    background: #1e1e1e;
    color: #4ec9b0;
    border-radius: 4px;
    font-family: monospace;
    font-size: 12px;
    overflow-x: auto;
    margin: 0;
  }
}

.step-error {
  background: #fef0f0;
  border: 1px solid #fbc4c4;

  .step-header { background: #fde2e2; }
  .error-content { color: #f56c6c; }

  &.step-error--limit {
    background: #fdf6ec;
    border: 1px solid #f5a623;
    border-left: 4px solid #f5a623;

    .step-header { background: #faecd8; }
    .error-content { color: #e6720a; font-weight: 500; }
  }

  .error-action-tip {
    padding: 8px 12px 10px;
    font-size: 12px;
    color: #606266;
    background: #fffbe6;
    border-top: 1px dashed #f5a623;
  }
}

.running-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px;
  color: #909399;
  font-size: 13px;

  .dot {
    width: 6px;
    height: 6px;
    background: #409eff;
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out;

    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.4s; }
  }
}

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

.result-preview {
  padding: 20px;

  h4 {
    margin: 0 0 12px 0;
    font-size: 14px;
    color: #303133;
  }

  .result-toolbar {
    margin-bottom: 8px;
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .result-table-wrap {
    overflow: auto;
    max-height: 400px;
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
        max-width: 300px;
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
    font-size: 13px;
    overflow: auto;
    max-height: 400px;
    margin: 0;
  }
}
</style>
