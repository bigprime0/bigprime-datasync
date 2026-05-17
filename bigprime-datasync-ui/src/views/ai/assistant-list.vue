<template>
  <div class="assistant-container">
    <Breadcrumb :items="['AI 中心', 'AI 助手']" />
    <div class="contain">
      <!-- 工具栏 -->
      <div class="toolbar">
        <tiny-button type="primary" @click="openDialog()">+ 新建助手</tiny-button>
      </div>

      <!-- 空状态 -->
      <div v-if="assistants.length === 0 && !loading" class="empty-tip">
        暂无助手，点击「新建助手」创建你的第一个 AI 助手
      </div>

      <!-- 助手卡片列表 -->
      <div class="assistant-grid">
        <div
          v-for="item in assistants"
          :key="item.id"
          class="assistant-card"
          :class="{ disabled: item.status === 0 }"
        >
          <!-- 头像 + 名称 -->
          <div class="card-top">
            <div class="avatar-circle">{{ item.avatar || '🤖' }}</div>
            <div class="card-info">
              <div class="assistant-name">{{ item.name }}</div>
              <div class="assistant-model">{{ item.modelId }}</div>
            </div>
            <span v-if="item.category" class="badge category">{{ categoryLabel(item.category) }}</span>
            <span v-if="item.isPublic === 1" class="badge public">公开</span>
          </div>

          <!-- 描述 -->
          <div class="assistant-desc">{{ item.description || '暂无描述' }}</div>

          <!-- 开场白预览 -->
          <div v-if="item.openingMessage" class="opening-msg">
            💬
            {{
              item.openingMessage.length > 60
                ? item.openingMessage.slice(0, 60) + '...'
                : item.openingMessage
            }}
          </div>

          <!-- 操作按钮 -->
          <div class="card-actions">
            <tiny-button size="mini" @click="openDialog(item)">编辑</tiny-button>
            <tiny-button size="mini" type="info" @click="openApiKeyDialog(item)"
              >API Key</tiny-button
            >
            <tiny-button size="mini" type="danger" @click="deleteAssistant(item)">删除</tiny-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 新建/编辑弹窗 -->
    <tiny-dialog-box
      v-model:visible="dialogVisible"
      :title="form.id ? '编辑助手' : '新建助手'"
      width="800px"
      @close="resetForm"
    >
      <tiny-form :model="form" label-width="150px">
        <tiny-form-item label="助手名称" required>
          <tiny-input v-model="form.name" placeholder="如：数据分析助手" />
        </tiny-form-item>
        <tiny-form-item label="别名">
          <tiny-input
            v-model="form.alias"
            placeholder="唯一英文标识，供其他模块调用，如: crawler-assistant"
          />
          <div class="tip-text">
            其他模块可通过 <code>AssistantInvoker.ask("别名", "问题")</code> 直接调用此助手
          </div>
        </tiny-form-item>
        <tiny-form-item label="助手分类">
          <tiny-input
            v-model="form.category"
            placeholder="输入分类，如 medical、finance、etl、code..."
            style="width: 100%"
          />
          <div class="category-presets">
            <span class="category-preset-label">快捷选择：</span>
            <span
              v-for="preset in CATEGORY_PRESETS"
              :key="preset.value"
              class="category-preset-tag"
              :class="{ active: form.category === preset.value }"
              @click="form.category = preset.value"
            >{{ preset.label }}</span>
          </div>
          <div class="tip-text">分类用于在各功能页面按场景筛选助手，可自由输入任意分类</div>
        </tiny-form-item>
        <tiny-form-item label="助手图标">
          <div class="avatar-picker-row">
            <div class="avatar-preview" @click="avatarPickerVisible = true">
              {{ form.avatar || '🤖' }}
            </div>
            <span class="tip-text" style="margin-left:10px;cursor:pointer;color:#409eff" @click="avatarPickerVisible = true">点击选择图标</span>
          </div>
          <!-- 图标选择弹出层 -->
          <div v-if="avatarPickerVisible" class="avatar-picker-popup">
            <div class="picker-header">
              <span>选择图标</span>
              <span class="picker-close" @click="avatarPickerVisible = false">✕</span>
            </div>
            <div
              v-for="group in AVATAR_GROUPS"
              :key="group.label"
              class="picker-group"
            >
              <div class="picker-group-label">{{ group.label }}</div>
              <div class="picker-grid">
                <div
                  v-for="emoji in group.items"
                  :key="emoji"
                  class="picker-item"
                  :class="{ selected: form.avatar === emoji }"
                  @click="form.avatar = emoji; avatarPickerVisible = false"
                >{{ emoji }}</div>
              </div>
            </div>
          </div>
        </tiny-form-item>
        <tiny-form-item label="描述">
          <tiny-input
            v-model="form.description"
            type="textarea"
            :rows="2"
            placeholder="助手的用途说明"
          />
        </tiny-form-item>
        <tiny-form-item label="绑定模型" required>
          <tiny-select v-model="form.modelId" placeholder="请选择模型" style="width: 100%">
            <tiny-option
              v-for="m in allModels"
              :key="m.id"
              :value="m.id"
              :label="m.displayName || m.modelName"
            />
          </tiny-select>
        </tiny-form-item>
        <tiny-form-item label="系统提示词">
          <tiny-input
            v-model="form.systemPrompt"
            type="textarea"
            :rows="4"
            placeholder="你是一名专业的数据分析师，擅长..."
          />
          <div style="margin-top: 6px;">
            <tiny-button size="mini" plain @click="openPromptPicker">📚 从提示词库选择</tiny-button>
          </div>
        </tiny-form-item>
        <tiny-form-item label="开场白">
          <tiny-input
            v-model="form.openingMessage"
            type="textarea"
            :rows="2"
            placeholder="你好！我是你的数据分析助手，请告诉我你需要分析什么数据？"
          />
        </tiny-form-item>
        <tiny-form-item label="启用 MCP 服务器">
          <tiny-select
            v-model="form.mcpServerIds"
            multiple
            placeholder="选择要绑定的 MCP 服务器"
            style="width: 100%"
          >
            <tiny-option v-for="m in allMcpServers" :key="m.id" :value="m.id" :label="m.name" />
          </tiny-select>
          <div class="tip-text">助手对话时可调用这些 MCP 工具</div>
        </tiny-form-item>
        <tiny-form-item label="启用技能">
          <tiny-select
            v-model="form.skillIds"
            multiple
            placeholder="选择要绑定的技能"
            style="width: 100%"
          >
            <tiny-option
              v-for="s in allSkills"
              :key="s.id"
              :value="s.id"
              :label="s.displayName || s.name"
            />
          </tiny-select>
          <div class="tip-text">助手可调用这些技能能力（如搜索、计算、爬取等）</div>
        </tiny-form-item>
        <tiny-form-item label="绑定知识库">
          <tiny-select
            v-model="form.kbIds"
            multiple
            placeholder="选择要绑定的知识库"
            style="width: 100%"
          >
            <tiny-option
              v-for="kb in allKnowledgeBases"
              :key="kb.id"
              :value="kb.id"
              :label="kb.name"
            />
          </tiny-select>
          <div class="tip-text">对话时将从知识库中检索相关内容</div>
        </tiny-form-item>
        <tiny-form-item label="绑定文档库">
          <tiny-select
            v-model="form.docLibIds"
            multiple
            placeholder="选择要绑定的文档库"
            style="width: 100%"
          >
            <tiny-option
              v-for="lib in allDocLibs"
              :key="lib.id"
              :value="lib.id"
              :label="lib.displayName || lib.name"
            />
          </tiny-select>
          <div class="tip-text">助手可浏览和搜索文档库内容（如产品文档、API 文档等）</div>
        </tiny-form-item>
        <tiny-form-item label="启用记忆">
          <tiny-switch v-model="form.memoryEnabledBool" />
          <span class="tip-text">开启后助手将记住对话关键信息</span>
        </tiny-form-item>
        <tiny-form-item label="启用网络搜索">
          <tiny-switch v-model="form.webSearchEnabledBool" />
          <span class="tip-text">开启后助手在无法回答时会自动搜索互联网（需已配置默认搜索引擎）</span>
        </tiny-form-item>
        <tiny-form-item label="温度">
          <tiny-numeric v-model="form.temperature" :min="0" :max="2" :step="0.1" />
          <span class="tip-text">越高越有创意，越低越精确（0.0~2.0）</span>
        </tiny-form-item>
        <tiny-form-item label="是否公开">
          <tiny-switch v-model="form.isPublicBool" />
          <span class="tip-text">公开后其他用户也可以看到并使用此助手</span>
        </tiny-form-item>
      </tiny-form>
      <template #footer>
        <tiny-button @click="dialogVisible = false">取消</tiny-button>
        <tiny-button type="primary" :loading="saving" @click="saveAssistant">保存</tiny-button>
      </template>
    </tiny-dialog-box>

    <!-- 提示词库选择弹窗 -->
    <tiny-dialog-box
      v-model:visible="promptPickerVisible"
      title="从提示词库选择"
      width="720px"
      @close="promptPickerVisible = false"
    >
      <!-- 搜索栏 -->
      <div style="display: flex; gap: 8px; margin-bottom: 14px;">
        <tiny-input
          v-model="promptSearchKeyword"
          placeholder="搜索提示词..."
          style="flex: 1"
          @keyup.enter="loadPromptList"
        />
        <tiny-select v-model="promptFilterCategory" placeholder="全部分类" style="width: 130px" @change="loadPromptList">
          <tiny-option value="" label="全部分类" />
          <tiny-option value="general" label="通用" />
          <tiny-option value="coding" label="编程" />
          <tiny-option value="writing" label="写作" />
          <tiny-option value="analysis" label="分析" />
          <tiny-option value="custom" label="自定义" />
        </tiny-select>
        <tiny-button @click="loadPromptList">搜索</tiny-button>
      </div>
      <!-- 提示词列表 -->
      <div v-if="promptLoading" style="text-align: center; padding: 40px; color: #9ca3af;">加载中...</div>
      <div v-else-if="promptList.length === 0" style="text-align: center; padding: 40px; color: #9ca3af;">暂无提示词</div>
      <div v-else class="prompt-picker-grid">
        <div v-for="item in promptList" :key="item.id" class="prompt-picker-card">
          <div class="prompt-picker-header">
            <span class="prompt-picker-title">{{ item.title }}</span>
            <span class="badge category">{{ promptCategoryLabel(item.category) }}</span>
          </div>
          <div class="prompt-picker-desc">{{ item.description || '暂无描述' }}</div>
          <div class="prompt-picker-content">{{ item.content?.slice(0, 120) }}{{ item.content?.length > 120 ? '...' : '' }}</div>
          <div class="prompt-picker-footer">
            <span class="usage-count">使用 {{ item.usageCount || 0 }} 次</span>
            <tiny-button size="mini" type="primary" @click="selectPrompt(item)">使用</tiny-button>
          </div>
        </div>
      </div>
      <template #footer>
        <tiny-button @click="promptPickerVisible = false">关闭</tiny-button>
      </template>
    </tiny-dialog-box>

    <!-- API Key 管理弹窗 -->
    <tiny-dialog-box
      v-model:visible="apiKeyDialogVisible"
      :title="`「${apiKeyAssistant?.name || ''}」API Key 管理`"
      width="680px"
      @close="apiKeyDialogVisible = false"
    >
      <!-- 生成新 Key 表单 -->
      <div class="apikey-generate-form">
        <tiny-input
          v-model="newKeyName"
          placeholder="Key 名称（如：医疗App生产环境）"
          style="width: 260px"
        />
        <tiny-select v-model="newKeyExpireDays" placeholder="有效期" style="width: 140px">
          <tiny-option :value="0" label="永不过期" />
          <tiny-option :value="30" label="30 天" />
          <tiny-option :value="90" label="90 天" />
          <tiny-option :value="180" label="180 天" />
          <tiny-option :value="365" label="1 年" />
        </tiny-select>
        <tiny-button type="primary" :loading="generatingKey" @click="generateApiKey"
          >生成 Key</tiny-button
        >
      </div>

      <!-- 刚生成的 Key 提示（只展示一次） -->
      <div v-if="newKeyValue" class="apikey-new-banner">
        <span class="apikey-new-label">新 Key（请立即复制，关闭后不再显示）：</span>
        <code class="apikey-value">{{ newKeyValue }}</code>
        <tiny-button size="mini" @click="copyKey(newKeyValue)">复制</tiny-button>
      </div>

      <!-- Key 列表 -->
      <tiny-grid :data="apiKeys" style="margin-top: 12px">
        <tiny-grid-column field="name" title="名称" width="160" />
        <tiny-grid-column field="apiKey" title="Key（掩码）" min-width="180">
          <template #default="{ row }">
            <code>{{ maskKey(row.apiKey) }}</code>
          </template>
        </tiny-grid-column>
        <tiny-grid-column field="expireTime" title="过期时间" width="160">
          <template #default="{ row }">
            {{ row.expireTime ? row.expireTime.replace('T', ' ').substring(0, 16) : '永不过期' }}
          </template>
        </tiny-grid-column>
        <tiny-grid-column field="callCount" title="调用次数" width="90" />
        <tiny-grid-column field="status" title="状态" width="80">
          <template #default="{ row }">
            <span :class="row.status === 1 ? 'status-on' : 'status-off'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </span>
          </template>
        </tiny-grid-column>
        <tiny-grid-column title="操作" width="140">
          <template #default="{ row }">
            <tiny-button
              size="mini"
              :type="row.status === 1 ? 'warning' : 'success'"
              @click="toggleKeyStatus(row)"
              >{{ row.status === 1 ? '禁用' : '启用' }}</tiny-button
            >
            <tiny-button size="mini" type="danger" @click="deleteApiKey(row)">删除</tiny-button>
          </template>
        </tiny-grid-column>
      </tiny-grid>

      <!-- 接入说明 -->
      <div class="apikey-usage-tip">
        <div class="tip-title">接入说明</div>
        <div class="tip-item">
          创建会话：<code>POST /open/v1/session</code>，Body:
          <code>{ "assistantId": "xxx", "externalUserId": "患者ID", "title": "患者姓名" }</code>
        </div>
        <div class="tip-item">
          发起对话：<code>POST /open/v1/chat</code>，Header:
          <code>Authorization: Bearer &lt;api-key&gt;</code>
        </div>
        <div class="tip-item">
          流式对话：<code
            >GET /open/v1/chat/stream?apiKey=&lt;api-key&gt;&amp;sessionId=xxx&amp;message=xxx</code
          >
        </div>
      </div>

      <template #footer>
        <tiny-button @click="apiKeyDialogVisible = false">关闭</tiny-button>
      </template>
    </tiny-dialog-box>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, reactive } from 'vue'
import {
  Button as TinyButton,
  DialogBox as TinyDialog,
  Form as TinyForm,
  FormItem as TinyFormItem,
  Input as TinyInput,
  Numeric as TinyInputNumber,
  Select as TinySelect,
  Option as TinyOption,
  Switch as TinySwitch,
  Grid as TinyGrid,
  GridColumn as TinyGridColumn,
  Modal
} from '@opentiny/vue'
import {
  AiAssistantApi,
  AiModelApi,
  McpServerApi,
  AiKnowledgeApi,
  AiApiKeyApi,
  AiPromptApi
} from '@/api/ai'
import { AiSkillApi } from '@/api/skill'
import { AiDocLibraryApi } from '@/api/doc-library'
import Breadcrumb from '@/components/breadcrumb/index.vue'

const loading = ref(false)
const saving = ref(false)
const assistants = ref<any[]>([])
const allModels = ref<any[]>([])
const allMcpServers = ref<any[]>([])
const allKnowledgeBases = ref<any[]>([])
const allSkills = ref<any[]>([])
const allDocLibs = ref<any[]>([])

// ==================== 加载 ====================
const loadAssistants = async () => {
  loading.value = true
  try {
    const res: any = await AiAssistantApi.list()
    assistants.value = res.data || []
  } finally {
    loading.value = false
  }
}

const loadModels = async () => {
  const res: any = await AiModelApi.list()
  allModels.value = res.data || []
}

const loadMcpServers = async () => {
  const res: any = await McpServerApi.list()
  allMcpServers.value = res.data || []
}

const loadKnowledgeBases = async () => {
  const res: any = await AiKnowledgeApi.list()
  allKnowledgeBases.value = res.data || []
}

const loadSkills = async () => {
  const res: any = await AiSkillApi.listEnabled()
  allSkills.value = res.data || []
}

const loadDocLibs = async () => {
  const res: any = await AiDocLibraryApi.listEnabled()
  allDocLibs.value = res.data || []
}

// ==================== 提示词库选择器 ====================
const promptPickerVisible = ref(false)
const promptList = ref<any[]>([])
const promptSearchKeyword = ref('')
const promptFilterCategory = ref('')
const promptLoading = ref(false)

const promptCategoryLabel = (cat: string) => {
  const map: Record<string, string> = {
    general: '通用', coding: '编程', writing: '写作', analysis: '分析', custom: '自定义'
  }
  return map[cat] || cat || '未分类'
}

const openPromptPicker = async () => {
  promptSearchKeyword.value = ''
  promptFilterCategory.value = ''
  promptPickerVisible.value = true
  await loadPromptList()
}

const loadPromptList = async () => {
  promptLoading.value = true
  try {
    const res: any = await AiPromptApi.list({
      keyword: promptSearchKeyword.value || undefined,
      category: promptFilterCategory.value || undefined
    })
    promptList.value = res.data || []
  } finally {
    promptLoading.value = false
  }
}

const selectPrompt = (item: any) => {
  form.systemPrompt = item.content
  promptPickerVisible.value = false
  AiPromptApi.use(item.id)
  Modal.message({ message: `已应用提示词「${item.title}」`, status: 'success' })
}

// ==================== 弹窗 ====================
const dialogVisible = ref(false)
const form = reactive<any>({
  id: null,
  name: '',
  alias: '',
  avatar: '🤖',
  description: '',
  modelId: '',
  category: 'general',
  systemPrompt: '',
  openingMessage: '',
  mcpServerIds: [] as string[],
  skillIds: [] as string[],
  kbIds: [] as string[],
  docLibIds: [] as string[],
  memoryEnabledBool: false,
  temperature: 0.7,
  maxTokens: null,
  isPublicBool: false,
  webSearchEnabledBool: false,
  status: 1,
  sortOrder: 0
})

const resetForm = () => {
  Object.assign(form, {
    id: null,
    name: '',
    alias: '',
    avatar: '🤖',
    description: '',
    modelId: '',
    category: 'general',
    systemPrompt: '',
    openingMessage: '',
    mcpServerIds: [],
    skillIds: [],
    kbIds: [],
    docLibIds: [],
    memoryEnabledBool: false,
    temperature: 0.7,
    maxTokens: null,
    isPublicBool: false,
    webSearchEnabledBool: false,
    status: 1,
    sortOrder: 0
  })
}

const openDialog = async (row?: any) => {
  resetForm()
  if (allModels.value.length === 0) await loadModels()
  if (allMcpServers.value.length === 0) await loadMcpServers()
  if (allKnowledgeBases.value.length === 0) await loadKnowledgeBases()
  if (allSkills.value.length === 0) await loadSkills()
  if (allDocLibs.value.length === 0) await loadDocLibs()
  if (row) {
    // 解析 JSON 数组字段
    let mcpIds: string[] = []
    let skillIds: string[] = []
    let kbIds: string[] = []
    let docLibIds: string[] = []
    try {
      mcpIds = row.enabledMcpServers ? JSON.parse(row.enabledMcpServers) : []
    } catch (e) {
      console.log(e)
    }
    try {
      skillIds = row.enabledSkills ? JSON.parse(row.enabledSkills) : []
    } catch (e) {
      console.log(e)
    }
    try {
      kbIds = row.knowledgeBaseIds ? JSON.parse(row.knowledgeBaseIds) : []
    } catch (e) {
      console.log(e)
    }
    try {
      docLibIds = row.enabledDocLibs ? JSON.parse(row.enabledDocLibs) : []
    } catch (e) {
      console.log(e)
    }
    Object.assign(form, {
      id: row.id,
      name: row.name,
      alias: row.alias || '',
      avatar: row.avatar || '🤖',
      description: row.description || '',
      modelId: row.modelId,
      category: row.category || 'general',
      systemPrompt: row.systemPrompt || '',
      openingMessage: row.openingMessage || '',
      mcpServerIds: mcpIds,
      skillIds: skillIds,
      kbIds: kbIds,
      docLibIds: docLibIds,
      memoryEnabledBool: row.memoryEnabled === 1,
      temperature: row.temperature ?? 0.7,
      maxTokens: row.maxTokens,
      isPublicBool: row.isPublic === 1,
      webSearchEnabledBool: row.webSearchEnabled === 1,
      status: row.status,
      sortOrder: row.sortOrder || 0
    })
  }
  dialogVisible.value = true
}

const saveAssistant = async () => {
  if (!form.name?.trim()) {
    Modal.message({ message: '助手名称不能为空', status: 'warning' })
    return
  }
  if (!form.modelId) {
    Modal.message({ message: '请选择绑定模型', status: 'warning' })
    return
  }
  saving.value = true
  try {
    await AiAssistantApi.save({
      id: form.id,
      name: form.name,
      alias: form.alias,
      avatar: form.avatar,
      description: form.description,
      modelId: form.modelId,
      category: form.category,
      systemPrompt: form.systemPrompt,
      openingMessage: form.openingMessage,
      enabledMcpServers: JSON.stringify(form.mcpServerIds || []),
      enabledSkills: JSON.stringify(form.skillIds || []),
      knowledgeBaseIds: JSON.stringify(form.kbIds || []),
      enabledDocLibs: JSON.stringify(form.docLibIds || []),
      memoryEnabled: form.memoryEnabledBool ? 1 : 0,
      webSearchEnabled: form.webSearchEnabledBool ? 1 : 0,
      temperature: form.temperature,
      maxTokens: form.maxTokens,
      isPublic: form.isPublicBool ? 1 : 0,
      status: form.status,
      sortOrder: form.sortOrder
    })
    Modal.message({ message: '保存成功', status: 'success' })
    dialogVisible.value = false
    await loadAssistants()
  } catch {
    Modal.message({ message: '保存失败', status: 'error' })
  } finally {
    saving.value = false
  }
}

const deleteAssistant = (row: any) => {
  Modal.confirm({ message: `确认删除助手「${row.name}」？`, title: '删除确认' }).then(
    async (res: any) => {
      if (res === 'confirm') {
        try {
          await AiAssistantApi.delete(row.id)
          Modal.message({ message: '删除成功', status: 'success' })
          await loadAssistants()
        } catch (e: any) {
          Modal.message({ message: e?.message || '删除失败', status: 'error' })
        }
      }
    }
  )
}

onMounted(loadAssistants)

// ==================== API Key 管理 ====================
const apiKeyDialogVisible = ref(false)
const apiKeyAssistant = ref<any>(null)
const apiKeys = ref<any[]>([])
const newKeyName = ref('')
const newKeyExpireDays = ref<number>(0)
const newKeyValue = ref('')
const generatingKey = ref(false)

const openApiKeyDialog = async (assistant: any) => {
  apiKeyAssistant.value = assistant
  newKeyName.value = ''
  newKeyExpireDays.value = 0
  newKeyValue.value = ''
  apiKeys.value = []
  apiKeyDialogVisible.value = true
  const res: any = await AiApiKeyApi.list(assistant.id)
  apiKeys.value = res.data || []
}

const generateApiKey = async () => {
  if (!newKeyName.value?.trim()) {
    Modal.message({ message: '请输入 Key 名称', status: 'warning' })
    return
  }
  generatingKey.value = true
  try {
    const res: any = await AiApiKeyApi.generate({
      assistantId: apiKeyAssistant.value.id,
      name: newKeyName.value.trim(),
      expireDays: newKeyExpireDays.value || undefined
    })
    newKeyValue.value = res.data?.apiKey || res.data || ''
    newKeyName.value = ''
    // 刷新列表
    const listRes: any = await AiApiKeyApi.list(apiKeyAssistant.value.id)
    apiKeys.value = listRes.data || []
    Modal.message({ message: 'Key 生成成功，请立即复制', status: 'success' })
  } catch {
    Modal.message({ message: '生成失败', status: 'error' })
  } finally {
    generatingKey.value = false
  }
}

const toggleKeyStatus = async (row: any) => {
  const newStatus = row.status === 1 ? 0 : 1
  try {
    await AiApiKeyApi.setStatus(row.id, newStatus)
    row.status = newStatus
    Modal.message({ message: newStatus === 1 ? '已启用' : '已禁用', status: 'success' })
  } catch {
    Modal.message({ message: '操作失败', status: 'error' })
  }
}

const deleteApiKey = (row: any) => {
  Modal.confirm({ message: `确认删除 Key「${row.name}」？`, title: '删除确认' }).then(
    async (res: any) => {
      if (res === 'confirm') {
        try {
          await AiApiKeyApi.delete(row.id)
          const listRes: any = await AiApiKeyApi.list(apiKeyAssistant.value.id)
          apiKeys.value = listRes.data || []
          Modal.message({ message: '删除成功', status: 'success' })
        } catch {
          Modal.message({ message: '删除失败', status: 'error' })
        }
      }
    }
  )
}

// ==================== 头像选择器 ====================
const avatarPickerVisible = ref(false)

const AVATAR_GROUPS = [
  {
    label: '🤖 AI & 机器人',
    items: ['🤖', '🦾', '🧠', '⚡', '🔮', '🌐', '💡', '🛸', '👾', '🎯']
  },
  {
    label: '👤 角色',
    items: ['👨‍💻', '👩‍💻', '🧑‍💼', '👨‍🔬', '👩‍🔬', '🧑‍🏫', '👨‍🎨', '👩‍🎨', '🧑‍⚕️', '🕵️']
  },
  {
    label: '📊 数据 & 分析',
    items: ['📊', '📈', '📉', '🗃️', '🗄️', '💾', '📋', '🔢', '📐', '🔬']
  },
  {
    label: '⚙️ 技术 & 开发',
    items: ['⚙️', '🔧', '🛠️', '💻', '🖥️', '⌨️', '🖱️', '📡', '🔌', '🧩']
  },
  {
    label: '🌐 数据传输 & 集成',
    items: ['🌐', '🔄', '📥', '📤', '🔗', '🚀', '🛤️', '📦', '🗺️', '🔀']
  },
  {
    label: '🕷️ 爬虫 & 采集',
    items: ['🕷️', '🕸️', '🦎', '🐍', '🔍', '🔎', '📌', '🗂️', '📂', '🗃️']
  },
  {
    label: '🎓 知识 & 学习',
    items: ['🎓', '📚', '📖', '🧾', '✏️', '🗒️', '💬', '🗣️', '🧭', '🏫']
  },
  {
    label: '🌍 行业 & 领域',
    items: ['🏥', '🏦', '🏭', '🛒', '🏗️', '⚖️', '🎬', '🎵', '🌾', '✈️']
  },
  {
    label: '⭐ 其他常用',
    items: ['⭐', '🔥', '💎', '🎁', '🏆', '🎯', '🎲', '🧲', '🪄', '🌟']
  }
]

const CATEGORY_PRESETS = [
  { value: 'general', label: '通用' },
  { value: 'etl', label: 'ETL同步' },
  { value: 'code', label: '代码开发' },
  { value: 'data', label: '数据分析' },
  { value: 'crawler', label: '爬虫采集' },
  { value: 'medical', label: '医疗健康' },
  { value: 'finance', label: '金融财务' },
  { value: 'legal', label: '法律合规' },
  { value: 'education', label: '教育培训' },
  { value: 'hr', label: '人力资源' },
  { value: 'marketing', label: '营销运营' },
  { value: 'customer', label: '客户服务' },
  { value: 'ops', label: '运维监控' },
  { value: 'security', label: '安全合规' },
  { value: 'logistics', label: '物流供应链' },
  { value: 'realestate', label: '房地产' },
  { value: 'agriculture', label: '农业农村' },
  { value: 'energy', label: '能源环保' },
]

const CATEGORY_MAP: Record<string, string> = {
  general: '通用',
  etl: 'ETL',
  code: '代码',
  data: '数据',
  crawler: '爬虫'
}
const categoryLabel = (cat: string) => CATEGORY_MAP[cat] || cat

const maskKey = (key: string) => {
  if (!key) return ''
  if (key.length <= 12) return key.substring(0, 4) + '****'
  return key.substring(0, 8) + '...' + key.substring(key.length - 4)
}

const copyKey = (key: string) => {
  navigator.clipboard
    .writeText(key)
    .then(() => {
      Modal.message({ message: '已复制到剪贴板', status: 'success' })
    })
    .catch(() => {
      Modal.message({ message: '复制失败，请手动复制', status: 'warning' })
    })
}
</script>

<style lang="less" scoped>
.assistant-container {
  padding: 16px;
  min-height: 100%;
  background: #f5f7fa;
}
.contain {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
}
.toolbar {
  margin-bottom: 16px;
}
.empty-tip {
  color: #9ca3af;
  text-align: center;
  padding: 60px 0;
  font-size: 14px;
}
.assistant-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}
.assistant-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  background: #fff;
  transition: box-shadow 0.2s;
}
.assistant-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}
.assistant-card.disabled {
  opacity: 0.5;
}
.card-top {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.avatar-circle {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #eff6ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}
.card-info {
  flex: 1;
  min-width: 0;
}
.assistant-name {
  font-weight: 600;
  font-size: 15px;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.assistant-model {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
}
.badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  flex-shrink: 0;
}
.badge.public {
  background: #dcfce7;
  color: #166534;
}
.badge.category {
  background: #eff6ff;
  color: #1d4ed8;
}
.assistant-desc {
  font-size: 13px;
  color: #6b7280;
  min-height: 36px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 8px;
}
.opening-msg {
  font-size: 12px;
  color: #3b82f6;
  background: #eff6ff;
  border-radius: 6px;
  padding: 6px 10px;
  margin-bottom: 10px;
  line-height: 1.5;
}
.card-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}
.tip-text {
  font-size: 12px;
  color: #9ca3af;
  margin-left: 8px;
}

// ==================== 分类快捷标签 ====================
.category-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
  align-items: center;
}

.category-preset-label {
  font-size: 12px;
  color: #9ca3af;
  flex-shrink: 0;
}

.category-preset-tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  background: #f3f4f6;
  color: #374151;
  cursor: pointer;
  border: 1px solid #e5e7eb;
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

// ==================== 头像选择器 ====================
.avatar-picker-row {
  display: flex;
  align-items: center;
}

.avatar-preview {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #eff6ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  cursor: pointer;
  border: 2px solid #e5e7eb;
  transition: border-color 0.2s;
  flex-shrink: 0;

  &:hover {
    border-color: #409eff;
  }
}

.avatar-picker-popup {
  position: absolute;
  z-index: 9999;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.12);
  width: 420px;
  max-height: 360px;
  overflow-y: auto;
  padding: 12px;
  margin-top: 4px;
}

.picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f3f4f6;
}

.picker-close {
  cursor: pointer;
  color: #9ca3af;
  font-size: 16px;
  line-height: 1;

  &:hover {
    color: #374151;
  }
}

.picker-group {
  margin-bottom: 10px;
}

.picker-group-label {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 6px;
  font-weight: 500;
}

.picker-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.picker-item {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  border-radius: 6px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.15s;

  &:hover {
    background: #f0f7ff;
    border-color: #bfdbfe;
  }

  &.selected {
    background: #dbeafe;
    border-color: #3b82f6;
  }
}
.apikey-generate-form {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}
.apikey-new-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fefce8;
  border: 1px solid #fde047;
  border-radius: 6px;
  padding: 8px 12px;
  margin-bottom: 8px;
  font-size: 13px;
}
.apikey-new-label {
  color: #92400e;
  flex-shrink: 0;
}
.apikey-value {
  flex: 1;
  font-family: monospace;
  font-size: 13px;
  color: #1e40af;
  word-break: break-all;
}
.status-on {
  color: #166534;
  background: #dcfce7;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
}
.status-off {
  color: #991b1b;
  background: #fee2e2;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
}
.apikey-usage-tip {
  margin-top: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 12px 16px;
  font-size: 13px;
}
.apikey-usage-tip .tip-title {
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}
.apikey-usage-tip .tip-item {
  color: #6b7280;
  margin-bottom: 4px;
  line-height: 1.6;
}
.apikey-usage-tip code {
  background: #e5e7eb;
  padding: 1px 5px;
  border-radius: 3px;
  font-family: monospace;
  font-size: 12px;
  color: #1e40af;
}
.prompt-picker-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  max-height: 420px;
  overflow-y: auto;
  padding-right: 4px;
}
.prompt-picker-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: box-shadow 0.2s;
  cursor: pointer;
  &:hover {
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    border-color: #93c5fd;
  }
}
.prompt-picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.prompt-picker-title {
  font-weight: 600;
  font-size: 14px;
  color: #111827;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 6px;
}
.prompt-picker-desc {
  font-size: 12px;
  color: #9ca3af;
}
.prompt-picker-content {
  font-size: 12px;
  color: #374151;
  background: #f9fafb;
  border-radius: 4px;
  padding: 8px;
  line-height: 1.5;
  flex: 1;
  min-height: 48px;
  word-break: break-all;
}
.prompt-picker-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
}
</style>
