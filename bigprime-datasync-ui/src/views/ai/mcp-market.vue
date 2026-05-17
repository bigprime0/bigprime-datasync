<template>
  <div class="mcp-market-container">
    <Breadcrumb :items="['AI 中心', 'MCP 市场']" />
    <div class="contain">
      <!-- 页头 -->
      <div class="market-header">
        <div class="header-title">
          <h2>MCP 服务市场</h2>
          <p>探索并安装常用的 MCP 服务，扩展 AI 助手能力</p>
        </div>
        <div class="header-actions">
          <tiny-button @click="openJsonImportDialog">JSON 导入</tiny-button>
          <tiny-button type="primary" @click="openAddDialog()">+ 添加服务</tiny-button>
        </div>
      </div>

      <!-- 分类标签 -->
      <div class="category-tabs">
        <div 
          v-for="cat in categories" 
          :key="cat.value"
          class="tab-item"
          :class="{ active: currentCategory === cat.value }"
          @click="currentCategory = cat.value"
        >
          {{ cat.label }}
        </div>
      </div>

      <!-- 服务卡片网格 -->
      <div v-if="loading" class="loading-tip">加载中...</div>
      <div v-else-if="filteredServices.length === 0" class="empty-tip">
        暂无服务，可以添加自定义 MCP 服务
      </div>
      <div v-else class="service-grid">
        <div v-for="service in filteredServices" :key="service.id" class="service-card">
          <div class="card-header">
            <div class="service-icon">{{ service.icon || '🔧' }}</div>
            <div class="service-info">
              <div class="service-name">
                {{ service.name }}
                <span v-if="service.isOfficial" class="official-badge">官方</span>
              </div>
              <div class="service-meta">
                <span class="badge category">{{ categoryLabel(service.category) }}</span>
                <span class="badge transport">{{ service.transport }}</span>
              </div>
            </div>
          </div>
          <div class="service-desc">{{ service.description }}</div>
          <div class="service-footer">
            <div class="footer-left">
              <span class="install-count">💾 {{ service.installCount || 0 }} 次安装</span>
              <span v-if="service.author" class="author">by {{ service.author }}</span>
            </div>
            <div class="footer-right">
              <tiny-button
                v-if="service.sourceUrl"
                text
                @click="openSource(service.sourceUrl)"
              >
                文档
              </tiny-button>
              <tiny-button type="primary" @click="openInstallDialog(service)">
                安装
              </tiny-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 更多 MCP 外部市场 -->
      <div class="more-market-section">
        <div class="more-market-title">更多 MCP</div>
        <div class="more-market-grid">
          <div
            v-for="site in externalMarkets"
            :key="site.url"
            class="more-market-card"
            @click="openExternal(site.url)"
          >
            <div class="more-market-icon">{{ site.icon }}</div>
            <div class="more-market-info">
              <div class="more-market-name">{{ site.name }}</div>
              <div class="more-market-desc">{{ site.desc }}</div>
            </div>
            <span class="more-market-link">↗</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 安装配置弹窗 -->
    <tiny-dialog-box
      v-model:visible="installDialogVisible"
      :title="`安装 - ${currentService?.name}`"
      width="520px"
    >
      <div v-if="currentService?.configSchema" class="config-form">
        <tiny-form :model="installConfig" label-width="140px">
          <tiny-form-item 
            v-for="(schema, key) in parsedConfigSchema" 
            :key="key"
            :label="schema.title || key"
            :required="isRequired(key)"
          >
            <tiny-input 
              v-model="installConfig[key]" 
              :placeholder="schema.description || ''"
            />
          </tiny-form-item>
        </tiny-form>
      </div>
      <div v-else class="no-config-tip">
        此服务无需配置，点击确认直接安装
      </div>
      <template #footer>
        <tiny-button @click="installDialogVisible = false">取消</tiny-button>
        <tiny-button type="primary" :loading="installing" @click="confirmInstall">
          确认安装
        </tiny-button>
      </template>
    </tiny-dialog-box>

    <!-- 添加服务弹窗 -->
    <tiny-dialog-box
      v-model:visible="addDialogVisible"
      title="添加 MCP 服务"
      width="600px"
      @close="resetAddForm"
    >
      <tiny-form :model="addForm" label-width="120px">
        <tiny-form-item label="服务名称" required>
          <tiny-input v-model="addForm.name" placeholder="例如：Weather" />
        </tiny-form-item>
        <tiny-form-item label="描述">
          <tiny-input v-model="addForm.description" type="textarea" :rows="2" />
        </tiny-form-item>
        <tiny-form-item label="图标">
          <tiny-input v-model="addForm.icon" placeholder="emoji 或 URL，例如：☀️" />
        </tiny-form-item>
        <tiny-form-item label="分类" required>
          <tiny-select v-model="addForm.category" style="width: 100%">
            <tiny-option value="search" label="搜索" />
            <tiny-option value="data" label="数据库" />
            <tiny-option value="dev" label="开发工具" />
            <tiny-option value="weather" label="天气" />
            <tiny-option value="other" label="其他" />
          </tiny-select>
        </tiny-form-item>
        <tiny-form-item label="传输协议" required>
          <tiny-select v-model="addForm.transport" style="width: 100%">
            <tiny-option value="STDIO" label="STDIO（本地进程）" />
            <tiny-option value="SSE" label="SSE（服务端推送）" />
            <tiny-option value="HTTP" label="HTTP" />
          </tiny-select>
        </tiny-form-item>
        <tiny-form-item v-if="addForm.transport === 'STDIO'" label="启动命令">
          <tiny-input v-model="addForm.command" placeholder="例如：npx" />
        </tiny-form-item>
        <tiny-form-item v-if="addForm.transport === 'STDIO'" label="命令参数">
          <tiny-input v-model="addForm.args" type="textarea" :rows="2" placeholder='JSON数组，例如：["-y", "@modelcontextprotocol/server-weather"]' />
        </tiny-form-item>
        <tiny-form-item v-if="addForm.transport !== 'STDIO'" label="连接地址">
          <tiny-input v-model="addForm.endpoint" placeholder="http://localhost:3000" />
        </tiny-form-item>
        <tiny-form-item label="作者">
          <tiny-input v-model="addForm.author" placeholder="您的名字" />
        </tiny-form-item>
        <tiny-form-item label="文档地址">
          <tiny-input v-model="addForm.sourceUrl" placeholder="GitHub 或文档链接" />
        </tiny-form-item>
      </tiny-form>
      <template #footer>
        <tiny-button @click="addDialogVisible = false">取消</tiny-button>
        <tiny-button type="primary" :loading="saving" @click="saveService">保存</tiny-button>
      </template>
    </tiny-dialog-box>

    <!-- JSON 导入弹窗 -->
    <tiny-dialog-box
      v-model:visible="jsonImportVisible"
      title="从 JSON 导入 MCP 服务器"
      width="640px"
      @close="jsonText = ''; jsonPreview = []"
    >
      <div class="json-import-tip">
        支持 Claude Desktop / Cursor 格式（mcpServers 对象）或单个 MCP 配置对象。<br/>
        粘贴后点击「解析」预览，确认无误后点击「导入」。
      </div>
      <tiny-input
        v-model="jsonText"
        type="textarea"
        :rows="10"
        placeholder='{
  "mcpServers": {
    "weather": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-weather"],
      "env": { "API_KEY": "your-key" }
    }
  }
}'
        style="font-family: monospace; font-size: 12px;"
      />
      <tiny-button style="margin-top: 10px;" @click="parseJsonMcp">解析预览</tiny-button>

      <!-- 解析预览 -->
      <div v-if="jsonPreview.length > 0" class="json-preview">
        <div class="preview-title">解析到 {{ jsonPreview.length }} 个服务器：</div>
        <div v-for="(item, idx) in jsonPreview" :key="idx" class="preview-item">
          <span class="preview-name">{{ item.name }}</span>
          <span class="preview-transport">{{ item.transport }}</span>
          <span class="preview-cmd" v-if="item.command">{{ item.command }} {{ (item.args || []).join(' ') }}</span>
          <span class="preview-url" v-if="item.endpoint">{{ item.endpoint }}</span>
        </div>
      </div>
      <div v-if="jsonParseError" class="json-error">{{ jsonParseError }}</div>

      <template #footer>
        <tiny-button @click="jsonImportVisible = false">取消</tiny-button>
        <tiny-button type="primary" :loading="jsonImporting" :disabled="jsonPreview.length === 0" @click="confirmJsonImport">
          导入 {{ jsonPreview.length > 0 ? `(${jsonPreview.length} 个)` : '' }}
        </tiny-button>
      </template>
    </tiny-dialog-box>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import {
  Button as TinyButton,
  DialogBox as TinyDialogBox,
  Form as TinyForm,
  FormItem as TinyFormItem,
  Input as TinyInput,
  Select as TinySelect,
  Option as TinyOption,
  Modal
} from '@opentiny/vue'
import { McpMarketApi, McpServerApi } from '@/api/ai'

// 分类选项
const categories = [
  { value: 'all', label: '全部' },
  { value: 'search', label: '搜索' },
  { value: 'data', label: '数据库' },
  { value: 'dev', label: '开发工具' },
  { value: 'weather', label: '天气' },
  { value: 'other', label: '其他' }
]

const currentCategory = ref('all')
const services = ref<any[]>([])
const loading = ref(false)

// 过滤后的服务列表
const filteredServices = computed(() => {
  if (currentCategory.value === 'all') return services.value
  return services.value.filter(s => s.category === currentCategory.value)
})

// 分类标签转换
const categoryLabel = (category: string) => {
  const map: Record<string, string> = {
    search: '搜索',
    data: '数据库',
    dev: '开发',
    weather: '天气',
    other: '其他'
  }
  return map[category] || category
}

// 加载服务列表
const loadServices = async () => {
  loading.value = true
  try {
    const res: any = await McpMarketApi.list()
    services.value = res.data || []
  } finally {
    loading.value = false
  }
}

// 打开文档
const openSource = (url: string) => {
  window.open(url, '_blank')
}

// 打开外部 MCP 市场
const openExternal = (url: string) => {
  window.open(url, '_blank')
}

// 外部 MCP 市场列表
const externalMarkets = [
  { icon: '🌐', name: 'mcp.so', desc: 'MCP 服务器发现平台', url: 'https://mcp.so' },
  { icon: '⚒️', name: 'smithery.ai', desc: 'Smithery MCP 工具', url: 'https://smithery.ai' },
  { icon: '✨', name: 'glama.ai', desc: 'Glama MCP 服务器目录', url: 'https://glama.ai/mcp/servers' },
  { icon: '🔴', name: 'mcp.higress.ai', desc: 'Higress MCP 服务器', url: 'https://mcp.higress.ai' },
  { icon: '⚡', name: 'mcp.composio.dev', desc: 'Composio MCP 开发工具', url: 'https://mcp.composio.dev' },
  { icon: '📡', name: 'pulsemcp.com', desc: 'Pulse MCP 服务器', url: 'https://www.pulsemcp.com' },
  { icon: '🔮', name: 'modelscope.cn', desc: '魔搭社区 MCP 服务器', url: 'https://modelscope.cn/mcp' },
  { icon: '📋', name: 'Model Context Protocol Servers', desc: '官方 MCP 服务器集合', url: 'https://github.com/modelcontextprotocol/servers' },
  { icon: '⭐', name: 'Awesome MCP Servers', desc: '精选的 MCP 服务器列表', url: 'https://github.com/punkpeye/awesome-mcp-servers' },
]

// ==================== 安装逻辑 ====================
const installDialogVisible = ref(false)
const currentService = ref<any>(null)
const installConfig = ref<Record<string, any>>({})
const installing = ref(false)

// 解析配置项schema
const parsedConfigSchema = computed(() => {
  if (!currentService.value?.configSchema) return {}
  try {
    const schema = JSON.parse(currentService.value.configSchema)
    return schema.properties || {}
  } catch {
    return {}
  }
})

// 检查是否必填
const isRequired = (key: string) => {
  if (!currentService.value?.configSchema) return false
  try {
    const schema = JSON.parse(currentService.value.configSchema)
    return schema.required?.includes(key) || false
  } catch {
    return false
  }
}

const openInstallDialog = (service: any) => {
  currentService.value = service
  installConfig.value = {}
  installDialogVisible.value = true
}

const confirmInstall = async () => {
  // 校验必填项
  const schema = parsedConfigSchema.value
  for (const key in schema) {
    if (isRequired(key) && !installConfig.value[key]) {
      Modal.message({ message: `请填写 ${schema[key].title || key}`, status: 'warning' })
      return
    }
  }

  installing.value = true
  try {
    await McpMarketApi.install(currentService.value.id, installConfig.value)
    Modal.message({ message: '安装成功！请到 MCP 服务器页面查看', status: 'success' })
    installDialogVisible.value = false
  } catch {
    Modal.message({ message: '安装失败', status: 'error' })
  } finally {
    installing.value = false
  }
}

// ==================== 添加服务 ====================
const addDialogVisible = ref(false)
const saving = ref(false)
const addForm = ref({
  name: '',
  description: '',
  icon: '',
  category: 'other',
  transport: 'STDIO',
  command: 'npx',
  args: '',
  endpoint: '',
  author: '',
  sourceUrl: ''
})

const openAddDialog = () => {
  resetAddForm()
  addDialogVisible.value = true
}

const resetAddForm = () => {
  addForm.value = {
    name: '',
    description: '',
    icon: '',
    category: 'other',
    transport: 'STDIO',
    command: 'npx',
    args: '',
    endpoint: '',
    author: '',
    sourceUrl: ''
  }
}

const saveService = async () => {
  if (!addForm.value.name) {
    Modal.message({ message: '请填写服务名称', status: 'warning' })
    return
  }

  saving.value = true
  try {
    const data = { ...addForm.value }
    // 处理参数
    if (data.args) {
      try {
        data.args = JSON.stringify(JSON.parse(data.args))
      } catch {
        Modal.message({ message: '参数格式不正确，请输入JSON数组', status: 'warning' })
        saving.value = false
        return
      }
    }
    await McpMarketApi.save(data)
    Modal.message({ message: '添加成功', status: 'success' })
    addDialogVisible.value = false
    await loadServices()
  } catch {
    Modal.message({ message: '添加失败', status: 'error' })
  } finally {
    saving.value = false
  }
}

onMounted(loadServices)

// ==================== JSON 导入 ====================
const jsonImportVisible = ref(false)
const jsonText = ref('')
const jsonPreview = ref<any[]>([])
const jsonParseError = ref('')
const jsonImporting = ref(false)

const openJsonImportDialog = () => {
  jsonText.value = ''
  jsonPreview.value = []
  jsonParseError.value = ''
  jsonImportVisible.value = true
}

/**
 * 解析 MCP JSON，支持：
 * 1. { mcpServers: { name: { command, args, env, url } } }  — Claude Desktop 格式
 * 2. 单个对象 { command, args, env }  — 直接配置
 * 3. 数组 [{ name, command, ... }]
 */
const parseJsonMcp = () => {
  jsonParseError.value = ''
  jsonPreview.value = []
  if (!jsonText.value.trim()) {
    jsonParseError.value = '请粘贴 JSON 内容'
    return
  }
  let parsed: any
  try {
    parsed = JSON.parse(jsonText.value)
  } catch (e: any) {
    jsonParseError.value = 'JSON 格式错误：' + e.message
    return
  }

  const result: any[] = []

  const toTransport = (item: any): string => {
    if (item.command) return 'STDIO'
    if (item.url || item.endpoint) return 'SSE'
    return 'HTTP'
  }

  const toItem = (name: string, cfg: any) => ({
    name,
    transport: toTransport(cfg),
    command: cfg.command || '',
    args: Array.isArray(cfg.args) ? cfg.args : (cfg.args ? [cfg.args] : []),
    endpoint: cfg.url || cfg.endpoint || '',
    envVars: cfg.env ? JSON.stringify(cfg.env) : '',
    type: 'CUSTOM',
    description: cfg.description || '',
    status: 1
  })

  // 格式1：mcpServers
  if (parsed.mcpServers && typeof parsed.mcpServers === 'object') {
    for (const [name, cfg] of Object.entries<any>(parsed.mcpServers)) {
      result.push(toItem(name, cfg))
    }
  }
  // 格式2：数组
  else if (Array.isArray(parsed)) {
    parsed.forEach((item: any, idx: number) => {
      result.push(toItem(item.name || `server-${idx + 1}`, item))
    })
  }
  // 格式3：单个对象（有 command 或 url）
  else if (parsed.command || parsed.url || parsed.endpoint) {
    result.push(toItem(parsed.name || 'imported-server', parsed))
  } else {
    jsonParseError.value = '无法识别的格式，请参考提示中的示例'
    return
  }

  if (result.length === 0) {
    jsonParseError.value = '未解析到任何服务器配置'
    return
  }
  jsonPreview.value = result
}

const confirmJsonImport = async () => {
  if (jsonPreview.value.length === 0) return
  jsonImporting.value = true
  let successCount = 0
  let failCount = 0
  for (const item of jsonPreview.value) {
    try {
      await McpServerApi.save({
        name: item.name,
        description: item.description,
        transport: item.transport,
        command: item.command,
        args: item.args.length > 0 ? JSON.stringify(item.args) : '',
        endpoint: item.endpoint,
        envVars: item.envVars,
        type: 'CUSTOM',
        status: 1
      })
      successCount++
    } catch {
      failCount++
    }
  }
  jsonImporting.value = false
  if (failCount === 0) {
    Modal.message({ message: `成功导入 ${successCount} 个 MCP 服务器`, status: 'success' })
  } else {
    Modal.message({ message: `成功 ${successCount} 个，失败 ${failCount} 个`, status: 'warning' })
  }
  jsonImportVisible.value = false
  await loadServices()
}
</script>

<style scoped>
.mcp-market-container {
  padding: 16px;
}
.contain {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  min-height: calc(100vh - 140px);
}

/* 页头 */
.market-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}
.header-title h2 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
}
.header-title p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

/* 分类标签 */
.category-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.tab-item {
  padding: 6px 16px;
  border-radius: 16px;
  background: #f3f4f6;
  color: #4b5563;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}
.tab-item:hover {
  background: #e5e7eb;
}
.tab-item.active {
  background: #3b82f6;
  color: #fff;
}

/* 服务卡片 */
.service-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}
.service-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  transition: all 0.2s;
}
.service-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  border-color: #d1d5db;
}
.card-header {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}
.service-icon {
  width: 48px;
  height: 48px;
  font-size: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  border-radius: 10px;
}
.service-info {
  flex: 1;
  min-width: 0;
}
.service-name {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 8px;
}
.official-badge {
  font-size: 11px;
  background: #dbeafe;
  color: #1d4ed8;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}
.service-meta {
  display: flex;
  gap: 6px;
  margin-top: 6px;
}
.badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
}
.badge.category {
  background: #f3e8ff;
  color: #7c3aed;
}
.badge.transport {
  background: #dcfce7;
  color: #15803d;
}
.service-desc {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
  margin-bottom: 16px;
  min-height: 40px;
}
.service-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
}
.footer-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.install-count {
  font-size: 12px;
  color: #6b7280;
}
.author {
  font-size: 11px;
  color: #9ca3af;
}
.footer-right {
  display: flex;
  gap: 8px;
}

/* 空状态 */
.empty-tip, .loading-tip {
  text-align: center;
  padding: 60px 20px;
  color: #9ca3af;
}

/* 配置表单 */
.config-form {
  padding: 8px 0;
}
.no-config-tip {
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
  background: #f9fafb;
  border-radius: 8px;
}

/* 外部 MCP 市场 */
.more-market-section {
  margin-top: 40px;
  padding-top: 28px;
  border-top: 1px solid #f3f4f6;
}
.more-market-title {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 16px;
}
.more-market-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
}
.more-market-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  background: #fafafa;
}
.more-market-card:hover {
  border-color: #93c5fd;
  background: #eff6ff;
  box-shadow: 0 2px 8px rgba(59,130,246,0.08);
}
.more-market-icon {
  font-size: 22px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  flex-shrink: 0;
}
.more-market-info {
  flex: 1;
  min-width: 0;
}
.more-market-name {
  font-size: 13px;
  font-weight: 600;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.more-market-desc {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
}
.more-market-link {
  font-size: 14px;
  color: #9ca3af;
  flex-shrink: 0;
}

/* JSON 导入 */
.json-import-tip {
  font-size: 12px;
  color: #6b7280;
  background: #f9fafb;
  border-radius: 6px;
  padding: 8px 12px;
  margin-bottom: 10px;
  line-height: 1.7;
}
.json-preview {
  margin-top: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}
.preview-title {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  background: #f9fafb;
  padding: 8px 12px;
  border-bottom: 1px solid #e5e7eb;
}
.preview-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid #f3f4f6;
  font-size: 12px;
}
.preview-item:last-child { border-bottom: none; }
.preview-name { font-weight: 600; color: #111827; min-width: 100px; }
.preview-transport { background: #dcfce7; color: #15803d; padding: 1px 6px; border-radius: 4px; }
.preview-cmd { color: #6366f1; font-family: monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 300px; }
.preview-url { color: #0ea5e9; font-family: monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 300px; }
.json-error {
  margin-top: 8px;
  color: #ef4444;
  font-size: 12px;
  padding: 6px 10px;
  background: #fef2f2;
  border-radius: 4px;
}
</style>
