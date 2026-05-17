<template>
  <div class="agent-container">
    <Breadcrumb :items="['AI 中心', 'Agent 执行台']" />
    <div class="contain">
      <div class="agent-layout">
        <!-- 左侧：配置区 -->
        <div class="config-panel">
          <div class="panel-title">Agent 配置</div>

          <tiny-form label-width="90px">
            <tiny-form-item label="选择助手">
              <tiny-select v-model="form.assistantId" placeholder="选择助手（可选）" style="width: 100%"
                @change="onAssistantChange">
                <tiny-option v-for="a in assistants" :key="a.id" :value="a.id" :label="a.name" />
              </tiny-select>
            </tiny-form-item>

            <tiny-form-item label="最大步骤">
              <tiny-numeric v-model="form.maxSteps" :min="1" :max="30" style="width: 120px" />
            </tiny-form-item>

            <tiny-form-item :show-label="false" label-width="0">
              <tiny-input v-model="form.systemPrompt" type="textarea" :rows="27"
                placeholder="可覆盖助手默认系统提示词" />
            </tiny-form-item>
          </tiny-form>
        </div>

        <!-- 右侧：TinyRobot 执行区 -->
        <div class="exec-panel">
          <!-- 消息列表 -->
          <div class="events-area" ref="eventsRef">
            <div v-if="events.length === 0 && !running" class="empty-hint">
              在下方输入任务，点击「执行」开始 Agent 推理
            </div>

            <!-- 每条事件独立渲染，避免 consecutive 分组合并 -->
            <div class="bubble-feed">
              <template v-for="(ev, idx) in events" :key="idx">
                <!-- 用户消息 -->
                <tr-bubble
                  v-if="ev.type === 'USER'"
                  :content="ev.content"
                  :avatar="userAvatar"
                  placement="end"
                  class="user-bubble"
                />

                <!-- Agent 事件：手写 avatar + 卡片行布局 -->
                <div v-else class="agent-row">
                  <span class="agent-avatar">
                    <component :is="aiAvatarComp" />
                  </span>
                  <div class="agent-event-card" :class="`ev-${ev.type?.toLowerCase()}`">
                    <div class="ev-header">
                      <span class="ev-icon">{{ eventIcon(ev.type) }}</span>
                      <span class="ev-label">{{ eventLabel(ev) }}</span>
                    </div>
                    <div v-if="ev.type === 'ACTION'" class="ev-code">{{ tryFormat(ev.toolInput) }}</div>
                    <div v-else class="ev-content markdown-body" v-html="renderMd(ev.content)" />
                  </div>
                </div>
              </template>
            </div>

            <div v-if="running" class="running-hint">
              <span class="spinner">⏳</span> Agent 推理中...
            </div>
          </div>

          <!-- TinyRobot Sender 输入区 -->
          <div class="input-area">
            <tr-sender
              v-model="userMessage"
              :placeholder="running ? '正在推理中，请稍候...' : '输入任务，Enter 执行，Shift+Enter 换行'"
              :loading="running"
              :clearable="true"
              @submit="doExecute"
              @cancel="cancelExecution"
            />
            <div class="input-footer">
              <button class="clear-btn" @click="clearEvents">清空记录</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, reactive, h } from 'vue'
import { marked } from 'marked'
import {
  Form as TinyForm, FormItem as TinyFormItem,
  Input as TinyInput, Select as TinySelect, Option as TinyOption,
  Numeric as TinyNumeric, Modal
} from '@opentiny/vue'
import {
  TrBubble,
  TrSender
} from '@opentiny/tiny-robot'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import '@opentiny/tiny-robot/dist/style.css'
import { AiAssistantApi, AgentApi } from '@/api/ai'
import Breadcrumb from '@/components/breadcrumb/index.vue'
import useUserStore from '@/store/modules/user'

const userStore = useUserStore()

/** 头像组件引用（用于 template 中 :is 渲染） */
const aiAvatarComp = IconAi
/** 用户头像 VNode（TrBubble prop） */
const userAvatar = h(IconUser, { style: { fontSize: '28px' } })

const assistants = ref<any[]>([])
const events = ref<any[]>([])
const running = ref(false)
const userMessage = ref('')
const eventsRef = ref<HTMLElement>()
let currentEventSource: EventSource | null = null

const form = reactive({
  assistantId: '',
  maxSteps: 10,
  systemPrompt: ''
})

onMounted(async () => {
  const res = await AiAssistantApi.list()
  assistants.value = res.data || []
})

const onAssistantChange = (_id: string) => {}

// ==================== 事件类型辅助方法 ====================

const eventIcon = (type?: string) => {
  const map: Record<string, string> = {
    PLANNING: '📋', THINKING: '💭', ACTION: '⚡',
    OBSERVATION: '👁', RESULT: '✅', ERROR: '❌', PING: '📡'
  }
  return map[type || ''] || '•'
}

const eventLabel = (meta?: any) => {
  if (!meta) return ''
  switch (meta.type) {
    case 'PLANNING':    return '执行计划'
    case 'THINKING':    return `思考 (Step ${meta.step})`
    case 'ACTION':      return `调用工具：${meta.toolName} (Step ${meta.step})`
    case 'OBSERVATION': return `观察结果：${meta.toolName}`
    case 'RESULT':      return '最终答案'
    case 'ERROR':       return '执行错误'
    default:            return meta.type || ''
  }
}

// ==================== Agent 执行 ====================

const doExecute = async (content: string) => {
  const msg = content || userMessage.value.trim()
  if (!msg) return
  if (!form.assistantId && !form.systemPrompt) {
    Modal.message({ message: '请选择助手或填写系统提示词', status: 'warning' })
    return
  }

  events.value.push({ type: 'USER', content: msg })
  userMessage.value = ''
  running.value = true

  const token = userStore.token
  const url = AgentApi.streamUrl({
    assistantId: form.assistantId,
    userMessage: msg,
    maxSteps: form.maxSteps,
    token
  })

  const es = new EventSource(url)
  currentEventSource = es

  es.addEventListener('agent_event', (e: MessageEvent) => {
    try {
      const ev = JSON.parse(e.data)
      // PING 事件不显示到执行台
      if (ev.type === 'PING') return
      events.value.push(ev)
      if (ev.type === 'RESULT' || ev.type === 'ERROR') {
        running.value = false
        es.close()
        currentEventSource = null
      }
    } catch {}
  })

  es.onerror = () => {
    running.value = false
    es.close()
    currentEventSource = null
  }
}

const cancelExecution = () => {
  if (currentEventSource) {
    currentEventSource.close()
    currentEventSource = null
  }
  running.value = false
  events.value.push({ type: 'ERROR', content: '用户已取消执行' })
}

const clearEvents = () => {
  events.value = []
  userMessage.value = ''
}

const tryFormat = (json?: string) => {
  if (!json) return ''
  try { return JSON.stringify(JSON.parse(json), null, 2) } catch { return json }
}

const renderMd = (text?: string) => {
  if (!text) return ''
  return marked.parse(text) as string
}
</script>

<style scoped>
.agent-container { padding: 16px; }
.contain { margin-top: 12px; }
.agent-layout { display: flex; gap: 16px; height: calc(100vh - 130px); }

/* 左侧配置区 */
.config-panel {
  width: 300px; flex-shrink: 0;
  background: #fff; border: 1px solid #e5e7eb; border-radius: 8px;
  padding: 16px; overflow-y: auto;
}
.panel-title { font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 16px; }

/* 右侧执行区 */
.exec-panel {
  flex: 1; display: flex; flex-direction: column;
  background: #fff; border: 1px solid #e5e7eb; border-radius: 8px;
  overflow: hidden; min-width: 0;
}

/* TrBubble 字体对齐 chat.vue */
.events-area {
  --tr-bubble-text-font-size: 13px;
  flex: 1; overflow-y: auto; padding: 16px;
  background: #f9fafb; min-height: 0;
}
.empty-hint { color: #9ca3af; text-align: center; margin-top: 80px; font-size: 14px; }
.running-hint { text-align: center; color: #6366f1; padding: 12px; font-size: 13px; }
.spinner { animation: spin 1s linear infinite; display: inline-block; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.bubble-feed { display: flex; flex-direction: column; gap: 4px; }
.agent-row { display: flex; align-items: flex-start; gap: 8px; padding: 2px 0; }
.agent-avatar { flex-shrink: 0; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 28px; color: #6366f1; }

/* Agent 事件卡片（在 agent-event 气泡中渲染） */
.agent-event-card {
  border-radius: 8px; overflow: hidden;
  border: 1px solid #e5e7eb; min-width: 300px; max-width: 100%;
}
.ev-header {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 12px; background: #f3f4f6;
  font-size: 13px; font-weight: 500;
}
.ev-icon { font-size: 16px; }
.ev-content {
  padding: 10px 12px; font-size: 13px;
  line-height: 1.6; white-space: pre-wrap;
}
.ev-code {
  margin: 0; padding: 10px 12px;
  background: #1e1e2e; color: #cdd6f4;
  font-size: 12px; overflow-x: auto;
  font-family: monospace; white-space: pre;
}

/* 各事件类型配色 */
.ev-planning .ev-header  { background: #e0f2fe; color: #0369a1; }
.ev-planning .ev-content { background: #f0f9ff; color: #0c4a6e; }
.ev-thinking .ev-header  { background: #ede9fe; color: #5b21b6; }
.ev-thinking .ev-content { background: #f5f3ff; }
.ev-action .ev-header    { background: #dbeafe; color: #1d4ed8; }
.ev-observation .ev-header  { background: #dcfce7; color: #15803d; }
.ev-observation .ev-content { background: #f0fdf4; }
.ev-result .ev-header    { background: #fef3c7; color: #92400e; }
.ev-result .ev-content   { background: #fffbeb; font-weight: 500; font-size: 14px; }
.ev-error .ev-header     { background: #fee2e2; color: #b91c1c; }
.ev-error .ev-content    { background: #fff1f2; color: #b91c1c; }

/* 输入区 */
.input-area {
  border-top: 1px solid #e5e7eb;
  background: #fff;
  padding: 12px 16px 8px;
}
.input-footer {
  display: flex; justify-content: flex-end;
  margin-top: 6px;
}
.clear-btn {
  background: none; border: none;
  color: #9ca3af; font-size: 13px;
  cursor: pointer; padding: 4px 8px;
  border-radius: 6px; transition: color 0.15s;
}
.clear-btn:hover { color: #374151; }

/* TrSender 样式微调 */
.input-area :deep(.tr-sender) {
  border-radius: 10px;
}

/* Markdown 渲染样式 */
.markdown-body { white-space: normal; font-size: 13px; line-height: 1.7; word-break: break-word; }
.markdown-body :deep(p) { margin: 0 0 6px 0; }
.markdown-body :deep(p:last-child) { margin-bottom: 0; }
.markdown-body :deep(code) {
  background: #f3f4f6; color: #e83e8c;
  padding: 2px 5px; border-radius: 4px;
  font-size: 12px; font-family: monospace;
}
.markdown-body :deep(pre) {
  background: #1e293b; color: #e2e8f0;
  padding: 10px; border-radius: 6px; overflow-x: auto; margin: 6px 0;
}
.markdown-body :deep(pre code) { background: none; color: inherit; padding: 0; }
.markdown-body :deep(ul), .markdown-body :deep(ol) { margin: 4px 0 6px 0; padding-left: 18px; }
.markdown-body :deep(li) { margin: 2px 0; }
.markdown-body :deep(strong) { font-weight: 600; }
.markdown-body :deep(table) { border-collapse: collapse; width: 100%; font-size: 12px; }
.markdown-body :deep(th), .markdown-body :deep(td) {
  border: 1px solid #e5e7eb; padding: 5px 8px;
}
.markdown-body :deep(th) { background: #f9fafb; font-weight: 600; }
.markdown-body :deep(blockquote) {
  border-left: 3px solid #e5e7eb; margin: 6px 0;
  padding: 3px 10px; color: #6b7280;
}
</style>
