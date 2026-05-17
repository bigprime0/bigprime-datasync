<template>
  <div class="ai-chat-container" :class="{ 'chat-fullscreen': chatFullscreen }">
    <!-- 左侧：会话列表 -->
    <div class="sidebar">
      <div class="sidebar-header">
        <span class="sidebar-title">AI 对话</span>
        <tiny-button type="primary" size="mini" @click="openNewSession">+ 新建</tiny-button>
      </div>
      <div class="session-list">
        <div
          v-for="s in sessions"
          :key="s.id"
          class="session-item"
          :class="{ active: currentSessionId === s.id }"
          @click="selectSession(s)"
        >
          <div class="session-title">{{ s.title || '新对话' }}</div>
          <div class="session-meta">
            {{ s.messageCount || 0 }} 条消息
            <span v-if="s.assistantName" class="assistant-tag">{{ s.assistantName }}</span>
          </div>
          <tiny-button
            class="del-btn"
            size="mini"
            type="text"
            @click.stop="deleteSession(s)"
          >✕</tiny-button>
        </div>
        <div v-if="sessions.length === 0" class="empty-sessions">
          暂无对话，点击「新建」开始
        </div>
      </div>
    </div>

    <!-- 右侧：GenuiChat 对话区 -->
    <div class="chat-main">
      <!-- 顶部标题 -->
      <div class="chat-header">
        <span>{{ currentSession?.title || '新对话' }}</span>
        <span v-if="currentSession?.assistantName" class="assistant-badge">
          🤖 {{ currentSession.assistantName }}
        </span>
        <span v-else-if="currentSession" class="model-tag">
          {{ allModels.find((m: any) => m.id === currentSession.modelId)?.displayName
            || allModels.find((m: any) => m.id === currentSession.modelId)?.modelName
            || currentSession.modelId }}
        </span>
        <!-- 全屏切换按钮 -->
        <button class="chat-fullscreen-btn" :title="chatFullscreen ? '退出全屏' : '全屏模式'" @click="toggleChatFullscreen">
          <svg v-if="!chatFullscreen" viewBox="0 0 20 20" width="16" height="16">
            <path d="M3 7V3h4M13 3h4v4M17 13v4h-4M7 17H3v-4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <svg v-else viewBox="0 0 20 20" width="16" height="16">
            <path d="M7 3v4H3M17 7h-4V3M3 13h4v4M13 17v-4h4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <!-- 无会话提示 -->
      <div v-if="!currentSessionId" class="no-session-tip">
        请先选择或新建一个对话
      </div>

      <!-- GenuiChat 接管对话区：displaySessionId 就绪后首次挂载，之后单例常驻，切换会话调内部 API -->
      <div v-else class="genui-wrapper">
        <div v-if="sessionLoading || !displaySessionId" class="session-loading">加载历史消息中...</div>
        <GenuiConfigProvider v-if="displaySessionId" v-show="!sessionLoading" :theme="'light'">
          <GenuiChat
            :key="displaySessionId"
            ref="genuiChatRef"
            :url="genuiChatUrl"
            :model="currentSession?.modelId || 'default'"
            :temperature="currentSession?.temperature ?? 0.7"
            :custom-fetch="customFetch"
            :renderer-slots="rendererSlots"
            @error="onGenuiError"
          />
        </GenuiConfigProvider>
      </div>
    </div>

    <!-- 全屏预览遮罩：直接铺满，无 Card 包裹 -->
    <Teleport to="body">
      <div v-if="fullscreenVisible" class="schema-fullscreen-overlay">
        <button class="schema-fullscreen-close-btn" title="关闭全屏" @click="closeFullscreen">
          <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M7 3v4H3M17 7h-4V3M3 13h4v4M13 17v-4h4"/>
          </svg>
        </button>
        <div class="schema-fullscreen-content">
          <GenuiConfigProvider :theme="'light'">
            <GenuiRenderer
              v-if="fullscreenSchema"
              :key="fullscreenKey"
              :content="fullscreenSchema"
              :generating="false"
            />
          </GenuiConfigProvider>
        </div>
      </div>
    </Teleport>

    <!-- 新建会话弹窗 -->
    <tiny-dialog-box
      v-model:visible="newSessionVisible"
      title="新建对话"
      width="520px"
      @close="resetNewForm"
    >
      <tiny-form :model="newForm" label-width="100px">
        <!-- 选择助手 -->
        <tiny-form-item label="选择助手">
          <tiny-select v-model="newForm.assistantId" placeholder="选择AI助手（可选，优先于模型配置）" style="width: 100%" clearable @change="onAssistantChange">
            <tiny-option
              v-for="a in allAssistants"
              :key="a.id"
              :value="a.id"
              :label="a.name"
            />
          </tiny-select>
          <div class="tip-text">选择助手后将自动使用助手绑定的模型、提示词和MCP工具</div>
        </tiny-form-item>

        <!-- 选择模型（未选助手时必填） -->
        <tiny-form-item label="选择模型" :required="!newForm.assistantId">
          <tiny-select v-model="newForm.modelId" placeholder="请选择模型" style="width: 100%" :disabled="!!newForm.assistantId">
            <tiny-option
              v-for="m in allModels"
              :key="m.id"
              :value="m.id"
              :label="m.displayName || m.modelName"
            />
          </tiny-select>
        </tiny-form-item>

        <tiny-form-item label="对话标题">
          <tiny-input v-model="newForm.title" placeholder="留空则自动生成" />
        </tiny-form-item>

        <tiny-form-item label="系统提示词">
          <tiny-input v-model="newForm.systemPrompt" type="textarea" :rows="3"
            placeholder="如：你是一个专业的数据分析助手" :disabled="!!newForm.assistantId" />
          <div v-if="newForm.assistantId" class="tip-text">已选择助手，系统提示词由助手配置决定</div>
        </tiny-form-item>

        <tiny-form-item label="温度">
          <tiny-numeric v-model="newForm.temperature" :min="0" :max="2" :step="0.1" :disabled="!!newForm.assistantId" />
          <div v-if="newForm.assistantId" class="tip-text">已选择助手，温度参数由助手配置决定</div>
        </tiny-form-item>
      </tiny-form>
      <template #footer>
        <tiny-button @click="newSessionVisible = false">取消</tiny-button>
        <tiny-button type="primary" :loading="creating" @click="createSession">创建</tiny-button>
      </template>
    </tiny-dialog-box>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref, reactive, computed, nextTick, h } from 'vue'
import { getToken } from '@/utils/token'
import {
  Button as TinyButton,
  DialogBox as TinyDialog,
  Form as TinyForm,
  FormItem as TinyFormItem,
  Input as TinyInput,
  Numeric as TinyInputNumber,
  Select as TinySelect,
  Option as TinyOption,
  Modal
} from '@opentiny/vue'
import { GenuiChat, GenuiConfigProvider, GenuiRenderer, type IMessage } from '@opentiny/genui-sdk-vue'
import { AiChatApi, AiModelApi, AiAssistantApi } from '@/api/ai'
import { useAppStore } from '@/store'

const appStore = useAppStore()

// ==================== 窗口全屏（隐藏顶栏+左侧菜单） ====================
const chatFullscreen = ref(false)

const toggleChatFullscreen = () => {
  chatFullscreen.value = !chatFullscreen.value
  appStore.updateSettings({
    navbar: !chatFullscreen.value,
    menu: !chatFullscreen.value,
  })
}

// ==================== 卡片全屏预览 ====================
const fullscreenVisible = ref(false)
const fullscreenSchema = ref<any>(null)
const fullscreenKey = ref(0)  // 每次打开递增，强制重建 GenuiRenderer（DeltaPatcher 有状态）

/**
 * 检测节点是否为图表或表格组件
 * 用 startsWith 而不是精确匹配，兼容所有 TinyChart* 变体
 */
const isChartOrTableNode = (name: string): boolean => {
  if (!name) return false
  return name.startsWith('TinyChart') || name === 'TinyGrid'
}

const hasChartOrTable = (node: any): boolean => {
  if (!node) return false
  if (isChartOrTableNode(node.componentName)) return true
  if (Array.isArray(node.children)) {
    return node.children.some((child: any) => hasChartOrTable(child))
  }
  return false
}

/**
 * 递归收集 schema 中所有图表/表格节点
 */
const collectChartTableNodes = (node: any, result: any[] = []): any[] => {
  if (!node) return result
  if (isChartOrTableNode(node.componentName)) {
    result.push(node)
  }
  // 无论是否是图表节点，都继续递归 children（处理嵌套情况）
  if (Array.isArray(node.children)) {
    node.children.forEach((child: any) => collectChartTableNodes(child, result))
  }
  return result
}

/**
 * 打开全屏预览：提取 schema 中的图表/表格节点，直接铺满屏幕
 * 关键：把原始 schema 的 state 一起带入，图表 JSExpression 引用 this.state.* 才能正常渲染
 */
const openFullscreen = (schema: any) => {
  const nodes = collectChartTableNodes(schema)
  if (nodes.length === 0) return

  const fullscreenChildren = nodes.map((n: any) => {
    const cloned = JSON.parse(JSON.stringify(n))
    if (cloned.componentName !== 'TinyGrid') {
      cloned.props = { ...cloned.props, width: '100%', height: 'calc(100vh - 48px)' }
    } else {
      cloned.props = { ...cloned.props, 'max-height': 'calc(100vh - 48px)', 'auto-resize': true }
    }
    return cloned
  })

  const schemaObj: any = {
    componentName: 'Page',
    props: { style: 'padding: 16px 24px; width: 100%; height: 100%; box-sizing: border-box;' },
    children: fullscreenChildren
  }
  if (schema.state) {
    schemaObj.state = JSON.parse(JSON.stringify(schema.state))
  }
  fullscreenSchema.value = schemaObj
  fullscreenKey.value++
  fullscreenVisible.value = true
}

const closeFullscreen = () => {
  fullscreenVisible.value = false
  fullscreenSchema.value = null
}

/**
 * rendererSlots：
 * - header 插槽注入全屏按钮，用 height:0 + absolute 不占文档流高度
 * - 仅当 isFinished=true 且 schema 包含图表/表格组件时才显示
 */
const rendererSlots = {
  header: (props: { schema: any; isError: boolean; isFinished: boolean }) => {
    if (!props.isFinished || props.isError) return null
    if (!hasChartOrTable(props.schema)) return null
    return h('div', { style: 'height:0; overflow:visible; position:relative; z-index:20;' }, [
      h('div', { style: 'position:absolute; top:6px; right:8px; opacity:0; transition:opacity 0.2s;', class: 'schema-fullscreen-trigger' }, [
        h('button', {
          class: 'schema-fullscreen-btn',
          title: '全屏查看图表',
          onClick: () => openFullscreen(props.schema)
        }, [
          h('svg', { viewBox: '0 0 20 20', width: '16', height: '16', fill: 'none', stroke: 'currentColor', 'stroke-width': '1.8', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
            h('path', { d: 'M3 7V3h4M13 3h4v4M17 13v4h-4M7 17H3v-4' })
          ])
        ])
      ])
    ])
  }
}

const sessions = ref<any[]>([])
const currentSessionId = ref<string | null>(null)
const currentSession = ref<any>(null)
const allModels = ref<any[]>([])
const allAssistants = ref<any[]>([])
const sessionLoading = ref(false)
const genuiChatRef = ref<any>(null)
// URL 里的时间戳，每次切换会话更新，确保 GenuiChat 认为是新端点
const chatUrlTs = ref(Date.now())
// displaySessionId：已就绪的会话 ID，驱动 genuiChatUrl
const displaySessionId = ref<string | null>(null)

/**
 * GenuiChat 与后端对接的关键：
 * 指向我们的 OpenAI SSE 格式适配接口
 * sessionId 通过 URL 参数传入，后端识别对应会话
 * _t 时间戳确保每次切换会话 GenuiChat 内部不使用 url 缓存
 */
const genuiChatUrl = computed(() => {
  if (!displaySessionId.value) return ''
  return `/api/ai/chat/openai/completions?sessionId=${displaySessionId.value}&_t=${chatUrlTs.value}`
})

/**
 * 自定义 fetch：注入 Authorization Header
 * GenuiChat 内部用原生 fetch，不经过 axios 拦截器，需手动注入 token
 */
const customFetch = (url: string, options: { method: string; headers: Record<string, string>; body: string; signal?: AbortSignal }) => {
  const token = getToken() || ''
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': token
    }
  })
}

const onGenuiError = (err: any) => {
  console.error('[GenuiChat error]', err)
  Modal.message({ message: 'AI 对话出错，请检查接口配置', status: 'error' })
}

// ==================== 会话列表 ====================
const loadSessions = async () => {
  try {
    const res: any = await AiChatApi.listSessions('chat')
    sessions.value = res.data || []
  } catch {
    sessions.value = []
  }
}

/** 将 assistant content 解析为 IMessageItem[]，正确区分 markdown 和 schema-card */
const parseAssistantContent = (content: string): any[] => {
  // 先剔除 <think>...</think> 块（推理模型的思维链，不展示给用户）
  const cleanContent = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim()
  const items: any[] = []
  const schemaJsonRegex = /```schemaJson\s*([\s\S]*?)```/g
  let lastIndex = 0
  let match

  while ((match = schemaJsonRegex.exec(cleanContent)) !== null) {
    // 代码块前的文本 → markdown
    const before = cleanContent.slice(lastIndex, match.index).trim()
    if (before) {
      items.push({ type: 'markdown', content: before })
    }
    // schemaJson 代码块 → schema-card（只传 JSON 内容，不含 ```schemaJson 标记）
    const schemaContent = match[1].trim()
    if (schemaContent) {
      items.push({ type: 'schema-card', content: schemaContent })
    }
    lastIndex = match.index + match[0].length
  }

  // 剩余文本 → markdown
  const remaining = cleanContent.slice(lastIndex).trim()
  if (remaining) {
    items.push({ type: 'markdown', content: remaining })
  }

  // 没有 schemaJson 块，整条消息就是 markdown
  if (items.length === 0) {
    items.push({ type: 'markdown', content: cleanContent })
  }

  return items
}

/** 加载指定会话的历史消息，转换为 GenuiChat 的 IMessage[] 格式 */
const loadHistoryMessages = async (sessionId: string): Promise<any[]> => {
  try {
    const res: any = await AiChatApi.listMessages(sessionId)
    const rawMsgs: any[] = res.data || []
    return rawMsgs
      .filter((m: any) => (m.role === 'USER' || m.role === 'ASSISTANT') && m.content)
      .map((m: any) => {
        if (m.role === 'USER') {
          return { role: 'user', content: m.content }
        } else {
          // ASSISTANT 消息：解析 schemaJson 代码块，生成结构化 messages
          const parsedItems = parseAssistantContent(m.content)
          return {
            role: 'assistant',
            content: m.content,
            messages: parsedItems
          }
        }
      })
  } catch {
    return []
  }
}

const selectSession = async (s: any) => {
  if (sessionLoading.value) return
  if (currentSessionId.value === String(s.id) && displaySessionId.value === String(s.id)) return
  currentSessionId.value = s.id
  currentSession.value = s
  sessionLoading.value = true

  try {
    // 1. 加载历史消息
    const msgs = await loadHistoryMessages(s.id)

    // 2. 更新 URL 时间戳，让 GenuiChat 用新的 endpoint
    chatUrlTs.value = Date.now()
    displaySessionId.value = String(s.id)

    // 3. 等 DOM 更新后，通过 ref 调用 GenuiChat 内部 API 重置会话
    await nextTick()
    const chat = genuiChatRef.value
    if (chat) {
      const conv = chat.getConversation?.()
      if (conv) {
        // 创建一个新的内部会话（SDK 内部管理，与我们的 sessionId 无关）
        const newId = conv.createConversation()
        // 把从后端加载的历史消息写入这个新内部会话的消息列表
        if (msgs.length > 0) {
          const mgr = conv.messageManager?.value
          if (mgr?.messages?.value) {
            mgr.messages.value.splice(0, mgr.messages.value.length, ...msgs as any)
          }
        }
      } else {
        // fallback：SDK 不支持则用 handleNewConversation
        chat.handleNewConversation?.()
      }
    }
  } catch {
    displaySessionId.value = String(s.id)
  } finally {
    sessionLoading.value = false
  }
}

const deleteSession = (s: any) => {
  Modal.confirm({ message: `确认删除「${s.title || '新对话'}」？`, title: '删除确认' }).then(async (res: any) => {
    if (res === 'confirm') {
      await AiChatApi.deleteSession(s.id)
      if (currentSessionId.value === s.id) {
        currentSessionId.value = null
        displaySessionId.value = null
        currentSession.value = null
      }
      await loadSessions()
    }
  })
}

// ==================== 新建会话 ====================
const newSessionVisible = ref(false)
const creating = ref(false)
const newForm = reactive<any>({
  assistantId: '', modelId: '', title: '', systemPrompt: '', temperature: 0.7
})

const openNewSession = async () => {
  resetNewForm()
  if (allModels.value.length === 0) {
    const res: any = await AiModelApi.list()
    allModels.value = res.data || []
  }
  if (allAssistants.value.length === 0) {
    const res: any = await AiAssistantApi.list()
    allAssistants.value = res.data || []
  }
  newSessionVisible.value = true
}

const resetNewForm = () => {
  Object.assign(newForm, { assistantId: '', modelId: '', title: '', systemPrompt: '', temperature: 0.7 })
}

const onAssistantChange = (assistantId: string) => {
  if (!assistantId) {
    newForm.modelId = ''
    newForm.systemPrompt = ''
    newForm.temperature = 0.7
    return
  }
  const assistant = allAssistants.value.find((a: any) => a.id === assistantId)
  if (assistant) {
    newForm.modelId = assistant.modelId
    newForm.systemPrompt = assistant.systemPrompt || ''
    newForm.temperature = assistant.temperature ?? 0.7
  }
}

const createSession = async () => {
  if (!newForm.assistantId && !newForm.modelId) {
    Modal.message({ message: '请选择模型或助手', status: 'warning' })
    return
  }
  creating.value = true
  try {
    const res: any = await AiChatApi.createSession({
      assistantId: newForm.assistantId || undefined,
      modelId: newForm.modelId,
      title: newForm.title,
      systemPrompt: newForm.systemPrompt,
      temperature: newForm.temperature,
      source: 'chat'
    })
    newSessionVisible.value = false
    await loadSessions()
    // 优先从列表找，找不到则用响应数据构造最小对象
    const newSes = sessions.value.find((s: any) => s.id === res.data || String(s.id) === String(res.data))
      || { id: res.data, modelId: newForm.modelId, title: newForm.title || '新对话', temperature: newForm.temperature, messageCount: 0 }
    await selectSession(newSes)
  } catch {
    Modal.message({ message: '创建失败', status: 'error' })
  } finally {
    creating.value = false
  }
}

onMounted(async () => {
  await loadSessions()
  // 预加载模型列表，用于顶部标题显示模型名称
  try {
    const res: any = await AiModelApi.list()
    allModels.value = res.data || []
  } catch { /* ignore */ }

  // 注册全局桥接函数：供 GenUI 表单提交按钮调用
  // GenUI 渲染的 JSFunction 运行在浏览器沙箋，无法直接调用后端工具；
  // 通过将表单数据构造成自然语言写入输入框并触发发送，由 AI 调用 MCP 工具落库
  ;(window as any).__genuiSendMessage = (text: string) => {
    console.log('[GenUI Bridge] 收到提交请求:', text)
    // 找到 genui-wrapper 内的 textarea 输入框
    const wrapper = document.querySelector('.genui-wrapper')
    if (!wrapper) {
      console.warn('[GenUI Bridge] 找不到 .genui-wrapper，确认 GenuiChat 已挂载')
      return
    }
    console.log('[GenUI Bridge] wrapper 找到:', wrapper)
    // 尝试多种 selector 找 textarea
    let textarea: HTMLTextAreaElement | null = wrapper.querySelector('textarea')
    if (!textarea) {
      // 尝试找 input
      const input = wrapper.querySelector('input[type="text"]') as HTMLInputElement | null
      if (input) {
        console.log('[GenUI Bridge] 找到 input 替代 textarea')
        const nativeSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
        if (nativeSetter) nativeSetter.call(input, text)
        else input.value = text
        input.dispatchEvent(new Event('input', { bubbles: true }))
        setTimeout(() => {
          input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true }))
          input.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true }))
        }, 100)
        return
      }
      console.warn('[GenUI Bridge] 找不到输入框 textarea 和 input，当前 DOM:', wrapper.innerHTML.substring(0, 500))
      return
    }
    console.log('[GenUI Bridge] textarea 找到:', textarea)
    // 通过 Vue 内部机制设置输入框的値并触发 input 事件
    const nativeInputSetter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set
    if (nativeInputSetter) {
      nativeInputSetter.call(textarea, text)
    } else {
      textarea.value = text
    }
    // 触发 input 事件，让 Vue 双向绑定感知到变化
    textarea.dispatchEvent(new Event('input', { bubbles: true }))
    console.log('[GenUI Bridge] 已写入文本，准备触发 Enter')
    // 短暂延迟后触发 Enter 键，触发发送
    setTimeout(() => {
      textarea!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true }))
      textarea!.dispatchEvent(new KeyboardEvent('keypress', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true }))
      textarea!.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true }))
      console.log('[GenUI Bridge] Enter 已触发')
    }, 100)
  }
})

onUnmounted(() => {
  if (chatFullscreen.value) {
    appStore.updateSettings({ navbar: true, menu: true })
  }
  // 清理全局桥接
  delete (window as any).__genuiSendMessage
})
</script>

<style scoped>
.ai-chat-container {
  display: flex;
  height: 100%;
  min-height: 0;
  background: #f5f7fa;
}

/* 左侧边栏 */
.sidebar {
  width: 240px;
  min-width: 200px;
  background: #fff;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 12px 12px;
  border-bottom: 1px solid #e5e7eb;
}
.sidebar-title {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
}
.session-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}
.session-item {
  position: relative;
  padding: 10px 14px;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.15s;
}
.session-item:hover { background: #f3f4f6; }
.session-item.active { background: #eff6ff; border-left: 3px solid #3b82f6; }
.session-title {
  font-size: 13px;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 160px;
}
.session-meta {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 2px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.assistant-tag {
  background: #ede9fe;
  color: #7c3aed;
  padding: 1px 5px;
  border-radius: 6px;
  font-size: 10px;
}
.del-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0;
  color: #ef4444 !important;
}
.session-item:hover .del-btn { opacity: 1; }
.empty-sessions {
  text-align: center;
  color: #9ca3af;
  font-size: 13px;
  padding: 32px 16px;
}

/* 右侧主区域 */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}
.chat-header {
  padding: 14px 20px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  font-size: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}
/* 全屏按钮：靠右对齐，平时半透明，hover 时显示 */
.chat-fullscreen-btn {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.2s, background 0.15s, color 0.15s;
  flex-shrink: 0;
}
.chat-fullscreen-btn:hover {
  opacity: 1;
  background: #f3f4f6;
  color: #111827;
  border-color: #9ca3af;
}

/* ===== 全屏模式：覆盖整个视口 ===== */
.chat-fullscreen {
  position: fixed !important;
  inset: 0 !important;
  z-index: 1000 !important;
  background: #f5f7fa;
  /* 覆盖顶部 navbar 高度偏移 */
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
}
.model-tag {
  font-size: 12px;
  color: #6b7280;
  background: #f3f4f6;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 400;
}
.assistant-badge {
  font-size: 12px;
  color: #7c3aed;
  background: #ede9fe;
  padding: 2px 10px;
  border-radius: 10px;
  font-weight: 500;
}
.no-session-tip {
  text-align: center;
  color: #9ca3af;
  font-size: 14px;
  margin: auto;
  padding: 80px 0;
}

/* GenuiChat 容器：占满剩余空间 */
.genui-wrapper {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.session-loading {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 14px;
}
.genui-wrapper :deep(.tiny-config-provider) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* ===== 覆盖 GenuiChat 内部字体，与系统保持一致 ===== */
/* 通过官方 CSS 变量设置气泡字体大小（tiny-robot 官方支持） */
.genui-wrapper {
  --tr-bubble-text-font-size: 13px;
}
/* 兜底深度覆盖：针对气泡内所有文字元素（排除代码块、SVG） */
.genui-wrapper :deep([class*="bubble"] p),
.genui-wrapper :deep([class*="bubble"] span),
.genui-wrapper :deep([class*="bubble"] div) {
  font-size: 13px;
  font-weight: 400;
}
/* 输入框 */
.genui-wrapper :deep([class*="sender"] input),
.genui-wrapper :deep([class*="sender"] textarea) {
  font-size: 13px;
}

/* ===== 含 schema-card 的气泡：宽度由 System Prompt 中 Page props.style 控制 ===== */

/* ===== SchemaJson 渲染卡片：精确命中 schema-render-container ===== */
/* SDK 的渲染容器 class 是 schema-render-container（来自 SchemaCardRenderer.vue） */
.genui-wrapper :deep(.schema-render-container) {
  font-size: 13px;
  position: relative; /* 为悬浮全屏按钮提供定位基准 */
}
/* 容器内所有文字元素 */
.genui-wrapper :deep(.schema-render-container p),
.genui-wrapper :deep(.schema-render-container span),
.genui-wrapper :deep(.schema-render-container div),
.genui-wrapper :deep(.schema-render-container label),
.genui-wrapper :deep(.schema-render-container td),
.genui-wrapper :deep(.schema-render-container th) {
  font-size: 13px;
}
/* h 标签限制，防止默认标题字体过大 */
.genui-wrapper :deep(.schema-render-container h1),
.genui-wrapper :deep(.schema-render-container h2),
.genui-wrapper :deep(.schema-render-container h3),
.genui-wrapper :deep(.schema-render-container h4) {
  font-size: 14px !important;
  font-weight: 600;
  margin: 0 0 8px;
}

/* ===== 卡片全屏按钮：hover 时显示 ===== */
/* schema-card 气泡整体 hover 时，显示悬浮按钮 */
.genui-wrapper :deep(.schema-render-container:hover) .schema-fullscreen-trigger {
  opacity: 1 !important;
}
/* 确保 schema-render-container 是定位基准 */
.genui-wrapper :deep(.schema-render-container) {
  position: relative;
}

.schema-fullscreen-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  outline: none;
  appearance: none;
  border-radius: 6px;
  background: transparent;
  color: #374151;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.schema-fullscreen-btn:hover {
  background: rgba(0, 0, 0, 0.08);
  color: #111827;
}

/* 弹窗提示文字 */
.tip-text {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 4px;
}

/* ===== 全屏遮罩：铺满屏幕，无 Card 包裹 ===== */
.schema-fullscreen-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: #fff;
  display: flex;
  flex-direction: column;
}
/* 右上角关闭按钮 */
.schema-fullscreen-close-btn {
  position: absolute;
  top: 12px;
  right: 16px;
  z-index: 10000;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  outline: none;
  appearance: none;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.06);
  color: #374151;
  cursor: pointer;
  transition: background 0.15s;
}
.schema-fullscreen-close-btn:hover {
  background: rgba(0, 0, 0, 0.12);
  color: #111827;
}
/* 内容区：铺满全部空间 */
.schema-fullscreen-content {
  flex: 1;
  overflow: auto;
  width: 100%;
  height: 100%;
}
</style>
