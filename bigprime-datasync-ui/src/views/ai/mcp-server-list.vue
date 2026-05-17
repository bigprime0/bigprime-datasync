<template>
  <div class="mcp-container">
    <Breadcrumb :items="['AI 中心', 'MCP 管理']" />

    <!-- 页面 Tab 切换 -->
    <div class="page-tabs">
      <span :class="['page-tab', pageTab === 'servers' ? 'active' : '']" @click="pageTab = 'servers'">MCP 服务器</span>
      <span :class="['page-tab', pageTab === 'dynamic' ? 'active' : '']" @click="pageTab = 'dynamic'; loadDynamicTools()">&#128295; 动态工具</span>
    </div>

    <!-- Tab1: MCP 服务器 -->
    <div v-show="pageTab === 'servers'" class="contain">
      <!-- 工具栏 -->
      <div class="toolbar">
        <tiny-button type="primary" @click="openDialog()">+ 添加服务器</tiny-button>
        <tiny-button @click="openJsonImportDialog">JSON 导入</tiny-button>
        <tiny-button type="success" @click="registerLocal">🔌 注册本地内置</tiny-button>
        <tiny-button @click="loadServers" :loading="loading">↻ 刷新</tiny-button>
      </div>

      <!-- 服务器卡片网格 -->
      <div v-if="servers.length === 0 && !loading" class="empty-tip">
        暂无 MCP 服务器，请先添加
      </div>
      <div class="server-grid">
        <div v-for="server in servers" :key="server.id" class="server-card">
          <div class="card-header">
            <div class="server-icon">
              <img v-if="server.iconUrl" :src="server.iconUrl" alt="" />
              <span v-else class="icon-placeholder">🔧</span>
            </div>
            <div class="server-info">
              <div class="server-name">{{ server.name }}</div>
              <div class="server-transport">
                <span class="badge" :class="'transport-' + server.transport.toLowerCase()">
                  {{ server.transport }}
                </span>
                <span class="badge" :class="'type-' + server.type.toLowerCase()">
                  {{ typeLabel(server.type) }}
                </span>
                <!-- 连通状态指示 -->
                <span v-if="connectStatus[server.id]" class="badge"
                  :class="connectStatus[server.id].success ? 'status-ok' : 'status-fail'">
                  {{ connectStatus[server.id].success
                    ? `✔ ${connectStatus[server.id].latencyMs}ms / ${connectStatus[server.id].toolCount}个工具`
                    : '✘ 不可达' }}
                </span>
              </div>
            </div>
            <div class="card-switch">
              <tiny-switch :model-value="server.status === 1" @change="toggleStatus(server)" />
            </div>
          </div>
          <div class="server-desc">{{ server.description || '暂无描述' }}</div>

          <!-- 配置状态 -->
          <div class="config-status" :class="server.isConfigured ? 'configured' : 'not-configured'">
            {{ server.isConfigured ? '✓ 已配置' : '⚠ 未配置' }}
          </div>

          <!-- 操作按钮 -->
          <div class="card-footer">
            <tiny-button size="mini" @click="openDialog(server)">编辑</tiny-button>
            <tiny-button v-if="!server.isConfigured && server.configSchema" size="mini" type="primary"
              @click="openConfigDialog(server)">配置</tiny-button>
            <tiny-button size="mini" type="info" @click="viewTools(server)">工具</tiny-button>
            <tiny-button size="mini" type="warning" @click="testConnect(server)"
              :loading="testingIds.includes(server.id)">测试</tiny-button>
            <tiny-button size="mini" type="danger" @click="deleteServer(server)">删除</tiny-button>
          </div>
        </div>
      </div>

      <!-- 发现更多 MCP -->
      <div class="more-mcp-section">
        <div class="more-mcp-title">发现更多 MCP 服务器</div>
        <div class="more-mcp-tip">在以下平台找到你需要的 MCP 服务器，复制 JSON 配置后点击上方「JSON 导入」一键接入</div>
        <div class="more-mcp-grid">
          <div v-for="site in externalMarkets" :key="site.url" class="more-mcp-card" @click="openExternal(site.url)">
            <div class="more-mcp-icon">{{ site.icon }}</div>
            <div class="more-mcp-info">
              <div class="more-mcp-name">{{ site.name }}</div>
              <div class="more-mcp-desc">{{ site.desc }}</div>
            </div>
            <span class="more-mcp-link">↗</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 弹窗区 -->
    <!-- 服务器 新增/编辑弹窗 -->
    <tiny-dialog-box
      v-model:visible="dialogVisible"
      :title="form.id ? '编辑 MCP 服务器' : '添加 MCP 服务器'"
      width="640px"
      @close="resetForm"
    >
      <!-- 新增时显示 Tab，编辑时直接显示表单 -->
      <template v-if="!form.id">
        <div class="add-tabs">
          <span :class="['tab-item', addTab === 'manual' ? 'active' : '']" @click="switchTab('manual')">手动添加</span>
          <span :class="['tab-item', addTab === 'market' ? 'active' : '']" @click="switchTab('market')">从市场选择</span>
        </div>

        <!-- 市场选择面板 -->
        <div v-if="addTab === 'market'" class="market-panel">
          <div class="market-filter">
            <span
              v-for="cat in marketCategories" :key="cat.value"
              :class="['cat-tag', marketCategory === cat.value ? 'active' : '']"
              @click="marketCategory = cat.value; filterMarket()"
            >{{ cat.label }}</span>
          </div>
          <div v-if="marketLoading" class="market-loading">加载中...</div>
          <div v-else class="market-grid">
            <div
              v-for="item in filteredMarket" :key="item.id"
              :class="['market-item', selectedMarketId === item.id ? 'selected' : '']"
              @click="selectMarket(item)"
            >
              <div class="mi-icon">{{ item.icon || '🔧' }}</div>
              <div class="mi-info">
                <div class="mi-name">{{ item.name }}<span v-if="item.isOfficial" class="mi-official">官方</span></div>
                <div class="mi-desc">{{ item.description }}</div>
                <div class="mi-meta">{{ item.transport }} · {{ item.author }}</div>
              </div>
            </div>
          </div>
          <div v-if="selectedMarketItem && selectedMarketItem.configSchema" class="market-config">
            <div class="mc-title">需要填写配置</div>
            <div v-for="(schema, key) in parsedConfigSchema" :key="key" class="mc-field">
              <label class="mc-label">{{ key }}<span v-if="isRequired(key)" class="mc-req">*</span></label>
              <tiny-input v-model="marketConfigValues[key]" :placeholder="schema.description || key" />
            </div>
          </div>
        </div>
      </template>

      <!-- 手动表单（新增手动 or 编辑） -->
      <tiny-form v-if="form.id || addTab === 'manual'" :model="form" label-width="110px">
        <tiny-form-item label="名称" required>
          <tiny-input v-model="form.name" placeholder="服务器名称" />
        </tiny-form-item>
        <tiny-form-item label="描述">
          <tiny-input v-model="form.description" type="textarea" :rows="2" />
        </tiny-form-item>
        <tiny-form-item label="类型" required>
          <tiny-select v-model="form.type" style="width: 100%">
            <tiny-option value="BUILTIN" label="内置" />
            <tiny-option value="MARKET" label="市场" />
            <tiny-option value="CUSTOM" label="自定义" />
          </tiny-select>
        </tiny-form-item>
        <tiny-form-item label="传输协议" required>
          <tiny-select v-model="form.transport" style="width: 100%">
            <tiny-option value="STDIO" label="STDIO（进程标准输入输出）" />
            <tiny-option value="SSE" label="SSE（服务端推送）" />
            <tiny-option value="HTTP" label="HTTP" />
          </tiny-select>
        </tiny-form-item>
        <tiny-form-item v-if="form.transport === 'STDIO'" label="命令">
          <tiny-input v-model="form.command" placeholder="如：npx -y @modelcontextprotocol/server-filesystem" />
        </tiny-form-item>
        <tiny-form-item v-if="form.transport === 'STDIO'" label="命令参数">
          <tiny-input v-model="form.args" type="textarea" :rows="2"
            placeholder='JSON 数组，如：["/path/to/dir"]' />
        </tiny-form-item>
        <tiny-form-item v-if="form.transport !== 'STDIO'" label="连接地址">
          <tiny-input v-model="form.endpoint" placeholder="http://localhost:3000/sse" />
        </tiny-form-item>
        <tiny-form-item label="环境变量">
          <tiny-input v-model="form.envVars" type="textarea" :rows="2"
            placeholder='JSON 对象，如：{"KEY": "value"}' />
        </tiny-form-item>
      </tiny-form>

      <template #footer>
        <tiny-button @click="dialogVisible = false">取消</tiny-button>
        <tiny-button v-if="addTab === 'market' && !form.id" type="primary" :loading="saving" :disabled="!selectedMarketId" @click="installFromMarket">安装</tiny-button>
        <tiny-button v-else type="primary" :loading="saving" @click="saveServer">保存</tiny-button>
      </template>
    </tiny-dialog-box>

    <!-- 配置值 弹窗 -->
    <tiny-dialog-box
      v-model:visible="configDialogVisible"
      title="服务器配置"
      width="480px"
    >
      <div class="config-hint">请根据服务器要求填写配置项（JSON 格式）</div>
      <tiny-input v-model="configValues" type="textarea" :rows="8"
        placeholder='{"api_key": "your-key", "workspace": "/path"}' />
      <template #footer>
        <tiny-button @click="configDialogVisible = false">取消</tiny-button>
        <tiny-button type="primary" :loading="saving" @click="saveConfig">保存配置</tiny-button>
      </template>
    </tiny-dialog-box>

    <!-- 工具列表 + Debug 弹窗 -->
    <tiny-dialog-box
      v-model:visible="toolsDialogVisible"
      :title="'工具列表 - ' + currentServerName"
      width="820px"
    >
      <div v-if="toolsLoading" class="tools-loading">加载中...</div>
      <div v-else-if="tools.length === 0" class="tools-empty">暂无工具（请确认服务器已启动）</div>
      <div v-else class="tools-list">
        <div v-for="tool in tools" :key="tool.name" class="tool-item">
          <div class="tool-header">
            <div class="tool-name-row">
              <span class="tool-name">{{ tool.name }}</span>
              <tiny-button size="mini" type="primary" @click="openDebug(tool)">调试</tiny-button>
            </div>
            <div class="tool-desc">{{ tool.description || '无描述' }}</div>
          </div>
          <!-- 参数 Schema 展示 -->
          <div v-if="tool.inputSchema && tool.inputSchema.properties" class="tool-schema">
            <div v-for="(schema, param) in tool.inputSchema.properties" :key="param" class="schema-param">
              <span class="param-name">{{ param }}</span>
              <span class="param-type">{{ schema.type || 'any' }}</span>
              <span v-if="(tool.inputSchema.required || []).includes(param)" class="param-req">*必填</span>
              <span class="param-desc">{{ schema.description || '' }}</span>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <tiny-button @click="toolsDialogVisible = false">关闭</tiny-button>
      </template>
    </tiny-dialog-box>

    <!-- Debug 工具调用弹窗 -->
    <tiny-dialog-box
      v-model:visible="debugDialogVisible"
      :title="`🔧 Debug: ${debugTool ? debugTool.name : ''}`"
      width="900px"
    >
      <div class="debug-layout">
        <!-- 左侧：参数输入 -->
        <div class="debug-left">
          <div class="debug-section-title">输入参数</div>
          <div class="debug-params">
            <div v-if="!debugTool || !debugTool.inputSchema || !debugTool.inputSchema.properties" class="debug-no-params">该工具无需入参</div>
            <template v-else>
              <div v-for="(schema, param) in debugTool.inputSchema.properties" :key="param" class="debug-param-item">
                <label class="debug-param-label">
                  {{ param }}
                  <span class="param-type-badge">{{ schema.type || 'any' }}</span>
                  <span v-if="(debugTool.inputSchema.required || []).includes(param)" class="param-req">*</span>
                </label>
                <div class="debug-param-desc">{{ schema.description || '' }}</div>
                <tiny-input
                  v-model="debugArgs[param]"
                  :placeholder="(schema.type === 'object' || schema.type === 'array') ? 'JSON 格式' : (schema.description || String(param))"
                  :type="(schema.type === 'object' || schema.type === 'array') ? 'textarea' : 'text'"
                  :rows="3"
                />
              </div>
            </template>
          </div>
          <div class="debug-actions">
            <tiny-button type="primary" :loading="debugLoading" @click="runDebug">▶ 执行调用</tiny-button>
            <tiny-button @click="debugArgs = {}">&#10006; 清空</tiny-button>
          </div>
        </div>
        <!-- 右侧：响应结果 -->
        <div class="debug-right">
          <div class="debug-section-title">
            响应结果
            <span v-if="debugLatency > 0" class="debug-latency">{{ debugLatency }}ms</span>
          </div>
          <div v-if="!debugResult && !debugLoading" class="debug-empty">点击《执行调用》查看响应</div>
          <div v-if="debugLoading" class="debug-running">⚡ 执行中...</div>
          <div v-if="debugResult" class="debug-result">
            <div class="debug-tabs">
              <span :class="['debug-tab', debugResultTab === 'pretty' ? 'active' : '']" @click="debugResultTab = 'pretty'">格式化</span>
              <span :class="['debug-tab', debugResultTab === 'raw' ? 'active' : '']" @click="debugResultTab = 'raw'">原始 JSON</span>
            </div>
            <div v-if="debugResultTab === 'pretty'" class="debug-pretty">
              <pre>{{ formatDebugResult() }}</pre>
            </div>
            <div v-else class="debug-raw">
              <pre>{{ debugResult }}</pre>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <tiny-button @click="debugDialogVisible = false">关闭</tiny-button>
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

    <!-- Tab2: 动态工具 -->
    <div v-show="pageTab === 'dynamic'" class="contain dynamic-tab">
      <div class="toolbar">
        <tiny-button @click="loadDynamicTools" :loading="dynamicLoading">↻ 刷新</tiny-button>
        <span style="font-size:12px; color:#6b7280; margin-left:8px">显示在 StarRocks 执行器和 Python IDE 中「发布为MCP工具」的项目。修改后需重启应用以刷新工具列表。</span>
      </div>

      <!-- SQL 工具卡片 -->
      <div class="dynamic-section">
        <div class="dynamic-section-title">⚡ SQL 工具 <span class="dynamic-count">{{ sqlMcpTools.length }} 个</span></div>
        <div v-if="!sqlMcpTools.length" class="dynamic-empty">暂无 SQL MCP 工具——在 StarRocks 执行器发布 API 时勾选「发布为MCP工具」即可</div>
        <div class="dynamic-tool-grid" v-else>
          <div v-for="tool in sqlMcpTools" :key="tool.id" class="dynamic-tool-card">
            <div class="dtc-header">
              <span class="dtc-type sql-type">SQL</span>
              <span class="dtc-name">{{ tool.mcpToolName }}</span>
              <tiny-button size="mini" type="danger" @click="disableSqlMcp(tool)">取消发布</tiny-button>
            </div>
            <div class="dtc-api-name">{{ tool.apiName }}</div>
            <div class="dtc-desc">{{ tool.description || '无描述' }}</div>
            <div class="dtc-meta">
              <span class="dtc-path">{{ tool.apiPath }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Python 工具卡片 -->
      <div class="dynamic-section" style="margin-top:24px">
        <div class="dynamic-section-title">🐍 Python 工具 <span class="dynamic-count">{{ pythonMcpTools.length }} 个</span></div>
        <div v-if="!pythonMcpTools.length" class="dynamic-empty">暂无 Python MCP 工具——在 Python IDE 发布服务时勾选「发布为MCP工具」即可</div>
        <div class="dynamic-tool-grid" v-else>
          <div v-for="tool in pythonMcpTools" :key="tool.id" class="dynamic-tool-card">
            <div class="dtc-header">
              <span class="dtc-type python-type">Python</span>
              <span class="dtc-name">{{ tool.mcpToolName }}</span>
              <tiny-button size="mini" type="danger" @click="disablePythonMcp(tool)">取消发布</tiny-button>
            </div>
            <div class="dtc-api-name">{{ tool.serviceName }}</div>
            <div class="dtc-desc">{{ tool.description || '无描述' }}</div>
            <div class="dtc-meta">
              <span class="dtc-badge" :class="tool.status === 'ACTIVE' ? 'status-ok' : 'status-fail'">{{ tool.status === 'ACTIVE' ? '运行中' : '已停用' }}</span>
              <span class="dtc-script">{{ tool.scriptName }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, reactive, computed } from 'vue'
import {
  Button as TinyButton, DialogBox as TinyDialog, Form as TinyForm,
  FormItem as TinyFormItem, Input as TinyInput,
  Select as TinySelect, Option as TinyOption, Switch as TinySwitch, Modal
} from '@opentiny/vue'
import { McpServerApi, McpMarketApi, DynamicMcpToolApi } from '@/api/ai'
import Breadcrumb from '@/components/breadcrumb/index.vue'

const loading = ref(false)
const saving = ref(false)
const servers = ref<any[]>([])

// ==================== 页面 Tab ====================
const pageTab = ref<'servers' | 'dynamic'>('servers')

// ==================== 动态工具 Tab ====================
const dynamicLoading = ref(false)
const sqlMcpTools = ref<any[]>([])
const pythonMcpTools = ref<any[]>([])

const loadDynamicTools = async () => {
  dynamicLoading.value = true
  try {
    const [sqlRes, pyRes] = await Promise.allSettled([
      DynamicMcpToolApi.listSqlMcpTools(),
      DynamicMcpToolApi.listPythonMcpTools()
    ])
    sqlMcpTools.value = sqlRes.status === 'fulfilled' ? (sqlRes.value.data?.data || sqlRes.value.data || []) : []
    pythonMcpTools.value = pyRes.status === 'fulfilled' ? (pyRes.value.data?.data || pyRes.value.data || []) : []
  } finally { dynamicLoading.value = false }
}

const disableSqlMcp = async (tool: any) => {
  Modal.confirm({ message: `确认取消「${tool.mcpToolName}」的 MCP 发布？`, title: '取消确认' }).then(async (res: any) => {
    if (res === 'confirm') {
      await DynamicMcpToolApi.disableSqlMcp(tool.id)
      Modal.message({ message: '取消发布成功', status: 'success' })
      await loadDynamicTools()
    }
  })
}

const disablePythonMcp = async (tool: any) => {
  Modal.confirm({ message: `确认取消「${tool.mcpToolName}」的 MCP 发布？`, title: '取消确认' }).then(async (res: any) => {
    if (res === 'confirm') {
      await DynamicMcpToolApi.disablePythonMcp(tool.id)
      Modal.message({ message: '取消发布成功', status: 'success' })
      await loadDynamicTools()
    }
  })
}

const typeLabel = (type: string) => ({ BUILTIN: '内置', MARKET: '市场', CUSTOM: '自定义' })[type] || type

// 外部 MCP 市场目录
const externalMarkets = [
  { icon: '🌐', name: 'mcp.so', desc: 'MCP 服务器发现平台，收录数千个服务器', url: 'https://mcp.so' },
  { icon: '⚒️', name: 'smithery.ai', desc: 'Smithery MCP 工具目录', url: 'https://smithery.ai' },
  { icon: '✨', name: 'glama.ai', desc: 'Glama MCP 服务器精选目录', url: 'https://glama.ai/mcp/servers' },
  { icon: '🔮', name: 'modelscope.cn', desc: '魔搭社区 MCP 服务器（国内推荐）', url: 'https://modelscope.cn/mcp' },
  { icon: '🔴', name: 'mcp.higress.ai', desc: 'Higress MCP 服务器（阿里维护）', url: 'https://mcp.higress.ai' },
  { icon: '⚡', name: 'mcp.composio.dev', desc: 'Composio MCP 开发工具集', url: 'https://mcp.composio.dev' },
  { icon: '📡', name: 'pulsemcp.com', desc: 'Pulse MCP 服务器追踪平台', url: 'https://www.pulsemcp.com' },
  { icon: '📋', name: 'MCP 官方服务器集合', desc: 'modelcontextprotocol/servers 官方仓库', url: 'https://github.com/modelcontextprotocol/servers' },
  { icon: '⭐', name: 'Awesome MCP Servers', desc: '社区精选 MCP 服务器列表', url: 'https://github.com/punkpeye/awesome-mcp-servers' },
]

const openExternal = (url: string) => window.open(url, '_blank')

// ==================== 连通状态缓存 ====================
const connectStatus = ref<Record<string, { success: boolean; latencyMs: number; toolCount: number; message: string }> >( {} )
const testingIds = ref<string[]>([])

const testConnect = async (server: any) => {
  if (testingIds.value.includes(server.id)) return
  testingIds.value.push(server.id)
  try {
    const res = await McpServerApi.testConnect(server.id)
    const result = res.data?.data || res.data
    connectStatus.value[server.id] = result
    if (result.success) {
      Modal.message({ message: `连通成功！${result.toolCount} 个工具，延迟 ${result.latencyMs}ms`, status: 'success' })
    } else {
      Modal.message({ message: `连通失败：${result.message}`, status: 'error' })
    }
  } catch (e: any) {
    connectStatus.value[server.id] = { success: false, latencyMs: 0, toolCount: 0, message: e.message }
    Modal.message({ message: '连通测试失败', status: 'error' })
  } finally {
    testingIds.value = testingIds.value.filter(id => id !== server.id)
  }
}

// 注册本地内置服务器
const registerLocal = async () => {
  try {
    await McpServerApi.registerLocal()
    Modal.message({ message: '本地内置 MCP Server 已注册！', status: 'success' })
    await loadServers()
  } catch (e: any) {
    Modal.message({ message: '注册失败：' + e.message, status: 'error' })
  }
}

// ==================== 服务器增删改 ====================
const dialogVisible = ref(false)
const form = reactive<any>({
  id: null, name: '', description: '', type: 'CUSTOM',
  transport: 'STDIO', endpoint: '', command: '', args: '', envVars: '', status: 1
})

// ==================== 市场选择 ====================
const addTab = ref<'manual' | 'market'>('manual')
const marketLoading = ref(false)
const marketList = ref<any[]>([])
const filteredMarket = ref<any[]>([])
const selectedMarketId = ref('')
const selectedMarketItem = ref<any>(null)
const marketCategory = ref('all')
const marketConfigValues = reactive<Record<string, string>>({})

const marketCategories = [
  { value: 'all', label: '全部' },
  { value: 'search', label: '搜索' },
  { value: 'data', label: '数据库' },
  { value: 'dev', label: '开发工具' },
  { value: 'weather', label: '天气' },
  { value: 'other', label: '其他' },
]

const parsedConfigSchema = computed(() => {
  if (!selectedMarketItem.value?.configSchema) return {}
  try { return JSON.parse(selectedMarketItem.value.configSchema).properties || {} } catch { return {} }
})

const isRequired = (key: string) => {
  if (!selectedMarketItem.value?.configSchema) return false
  try { return (JSON.parse(selectedMarketItem.value.configSchema).required || []).includes(key) } catch { return false }
}

const switchTab = async (tab: 'manual' | 'market') => {
  addTab.value = tab
  if (tab === 'market' && marketList.value.length === 0) {
    marketLoading.value = true
    try {
      const res = await McpMarketApi.list()
      marketList.value = res.data?.data || res.data || []
      filterMarket()
    } finally { marketLoading.value = false }
  }
}

const filterMarket = () => {
  if (marketCategory.value === 'all') {
    filteredMarket.value = marketList.value
  } else {
    filteredMarket.value = marketList.value.filter(i => i.category === marketCategory.value)
  }
}

const selectMarket = (item: any) => {
  selectedMarketId.value = item.id
  selectedMarketItem.value = item
  Object.keys(marketConfigValues).forEach(k => delete marketConfigValues[k])
}

const installFromMarket = async () => {
  if (!selectedMarketId.value) return
  saving.value = true
  try {
    await McpMarketApi.install(selectedMarketId.value, { ...marketConfigValues })
    Modal.message({ message: '安装成功', status: 'success' })
    dialogVisible.value = false
    await loadServers()
  } catch { Modal.message({ message: '安装失败', status: 'error' })
  } finally { saving.value = false }
}

const openDialog = (row?: any) => {
  resetForm()
  addTab.value = 'manual'
  selectedMarketId.value = ''
  selectedMarketItem.value = null
  if (row) Object.assign(form, { ...row })
  dialogVisible.value = true
}

const resetForm = () => {
  Object.assign(form, {
    id: null, name: '', description: '', type: 'CUSTOM',
    transport: 'STDIO', endpoint: '', command: '', args: '', envVars: '', status: 1
  })
}

const saveServer = async () => {
  if (!form.name) { Modal.message({ message: '名称不能为空', status: 'warning' }); return }
  saving.value = true
  try {
    await McpServerApi.save({ ...form })
    Modal.message({ message: '保存成功', status: 'success' })
    dialogVisible.value = false
    await loadServers()
  } catch { Modal.message({ message: '保存失败', status: 'error' })
  } finally { saving.value = false }
}

const deleteServer = (row: any) => {
  Modal.confirm({ message: `确认删除「${row.name}」？`, title: '删除确认' }).then(async (res: any) => {
    if (res === 'confirm') {
      await McpServerApi.delete(row.id)
      Modal.message({ message: '删除成功', status: 'success' })
      await loadServers()
    }
  })
}

const toggleStatus = async (row: any) => {
  row.status = row.status === 1 ? 0 : 1
  await McpServerApi.save({ id: row.id, name: row.name, type: row.type, transport: row.transport, status: row.status })
}

// ==================== 配置值 ====================
const configDialogVisible = ref(false)
const configServerId = ref('')
const configValues = ref('')

const openConfigDialog = (row: any) => {
  configServerId.value = row.id
  configValues.value = row.configValues || '{}'
  configDialogVisible.value = true
}

const saveConfig = async () => {
  saving.value = true
  try {
    await McpServerApi.configure(configServerId.value, configValues.value)
    Modal.message({ message: '配置保存成功', status: 'success' })
    configDialogVisible.value = false
    await loadServers()
  } catch { Modal.message({ message: '保存失败', status: 'error' })
  } finally { saving.value = false }
}

// ==================== 工具列表 ====================
const toolsDialogVisible = ref(false)
const toolsLoading = ref(false)
const tools = ref<any[]>([])
const currentServerName = ref('')
const currentServerId = ref('')

const viewTools = async (row: any) => {
  currentServerName.value = row.name
  currentServerId.value = row.id
  toolsDialogVisible.value = true
  toolsLoading.value = true
  tools.value = []
  try {
    const res = await McpServerApi.listTools(row.id)
    tools.value = res.data?.data || res.data || []
  } catch {
    Modal.message({ message: '工具列表加载失败，请确认服务器已启动', status: 'error' })
  } finally { toolsLoading.value = false }
}

// ==================== Debug 工具 ====================
const debugDialogVisible = ref(false)
const debugTool = ref<any>(null)
const debugArgs = ref<Record<string, any>>({})
const debugLoading = ref(false)
const debugResult = ref('')
const debugLatency = ref(0)
const debugResultTab = ref<'pretty' | 'raw'>('pretty')

const openDebug = (tool: any) => {
  debugTool.value = tool
  debugArgs.value = {}
  debugResult.value = ''
  debugLatency.value = 0
  debugResultTab.value = 'pretty'
  debugDialogVisible.value = true
}

const runDebug = async () => {
  if (!debugTool.value) return
  debugLoading.value = true
  debugResult.value = ''
  debugLatency.value = 0
  const startTs = Date.now()
  try {
    // 将字符串类型的 JSON 对象/数组参数自动解析
    const parsedArgs: Record<string, any> = {}
    for (const [k, v] of Object.entries(debugArgs.value)) {
      if (typeof v === 'string') {
        const trimmed = v.trim()
        if ((trimmed.startsWith('{') || trimmed.startsWith('[')) && trimmed.length > 0) {
          try { parsedArgs[k] = JSON.parse(trimmed) } catch { parsedArgs[k] = v }
        } else {
          parsedArgs[k] = v
        }
      } else {
        parsedArgs[k] = v
      }
    }
    const res = await McpServerApi.debugCallTool(currentServerId.value, debugTool.value.name, parsedArgs)
    debugLatency.value = Date.now() - startTs
    debugResult.value = res.data?.data || res.data || ''
  } catch (e: any) {
    debugLatency.value = Date.now() - startTs
    debugResult.value = JSON.stringify({ error: e.message })
  } finally {
    debugLoading.value = false
  }
}

const formatDebugResult = () => {
  if (!debugResult.value) return ''
  try {
    const parsed = JSON.parse(debugResult.value)
    return JSON.stringify(parsed, null, 2)
  } catch {
    return debugResult.value
  }
}

// ==================== 数据加载 ====================
const loadServers = async () => {
  loading.value = true
  try {
    const res = await McpServerApi.list()
    servers.value = res.data?.data || res.data || []
  } finally { loading.value = false }
}

onMounted(() => { loadServers() })

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

const parseJsonMcp = () => {
  jsonParseError.value = ''
  jsonPreview.value = []
  if (!jsonText.value.trim()) { jsonParseError.value = '请粘贴 JSON 内容'; return }
  let parsed: any
  try { parsed = JSON.parse(jsonText.value) } catch (e: any) { jsonParseError.value = 'JSON 格式错误：' + e.message; return }

  const toTransport = (item: any) => item.command ? 'STDIO' : (item.url || item.endpoint ? 'SSE' : 'HTTP')
  const toItem = (name: string, cfg: any) => ({
    name, transport: toTransport(cfg),
    command: cfg.command || '',
    args: Array.isArray(cfg.args) ? cfg.args : (cfg.args ? [cfg.args] : []),
    endpoint: cfg.url || cfg.endpoint || '',
    envVars: cfg.env ? JSON.stringify(cfg.env) : '',
    description: cfg.description || ''
  })

  const result: any[] = []
  if (parsed.mcpServers && typeof parsed.mcpServers === 'object') {
    for (const [name, cfg] of Object.entries<any>(parsed.mcpServers)) result.push(toItem(name, cfg))
  } else if (Array.isArray(parsed)) {
    parsed.forEach((item: any, idx: number) => result.push(toItem(item.name || `server-${idx + 1}`, item)))
  } else if (parsed.command || parsed.url || parsed.endpoint) {
    result.push(toItem(parsed.name || 'imported-server', parsed))
  } else { jsonParseError.value = '无法识别的格式，请参考提示中的示例'; return }

  if (result.length === 0) { jsonParseError.value = '未解析到任何服务器配置'; return }
  jsonPreview.value = result
}

const confirmJsonImport = async () => {
  if (jsonPreview.value.length === 0) return
  jsonImporting.value = true
  let successCount = 0, failCount = 0
  for (const item of jsonPreview.value) {
    try {
      await McpServerApi.save({
        name: item.name, description: item.description,
        transport: item.transport, command: item.command,
        args: item.args.length > 0 ? JSON.stringify(item.args) : '',
        endpoint: item.endpoint, envVars: item.envVars,
        type: 'CUSTOM', status: 1
      })
      successCount++
    } catch { failCount++ }
  }
  jsonImporting.value = false
  if (failCount === 0) Modal.message({ message: `成功导入 ${successCount} 个 MCP 服务器`, status: 'success' })
  else Modal.message({ message: `成功 ${successCount} 个，失败 ${failCount} 个`, status: 'warning' })
  jsonImportVisible.value = false
  await loadServers()
}
</script>

<style scoped>
.mcp-container { padding: 16px; }
.toolbar { margin-bottom: 16px; display: flex; gap: 8px; flex-wrap: wrap; }
.server-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
.server-card {
  border: 1px solid #e4e7ed; border-radius: 8px;
  padding: 16px; background: #fff; transition: box-shadow 0.2s;
}
.server-card:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.1); }
.card-header { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 10px; }
.server-icon { font-size: 24px; width: 36px; text-align: center; flex-shrink: 0; }
.server-icon img { width: 32px; height: 32px; object-fit: contain; }
.server-info { flex: 1; }
.server-name { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
.server-transport { display: flex; flex-wrap: wrap; gap: 4px; }
.badge { font-size: 11px; padding: 1px 6px; border-radius: 3px; }
.transport-stdio { background: #f0f0f0; color: #666; }
.transport-sse { background: #e6f7ff; color: #1890ff; }
.transport-http { background: #f6ffed; color: #52c41a; }
.type-builtin { background: #fff7e6; color: #d46b08; }
.type-market { background: #f9f0ff; color: #722ed1; }
.type-custom { background: #f5f5f5; color: #666; }
.status-ok { background: #f6ffed; color: #389e0d; }
.status-fail { background: #fff2f0; color: #cf1322; }
.server-desc { font-size: 12px; color: #999; margin-bottom: 10px; min-height: 20px; }
.config-status { font-size: 12px; padding: 3px 0; margin-bottom: 10px; }
.config-status.configured { color: #52c41a; }
.config-status.not-configured { color: #e6a23c; }
.card-footer { display: flex; gap: 4px; padding-top: 8px; border-top: 1px solid #f0f0f0; flex-wrap: wrap; }
.config-hint { color: #999; font-size: 12px; margin-bottom: 8px; }
.empty-tip { color: #999; text-align: center; padding: 40px 0; }
.tools-loading, .tools-empty { color: #999; text-align: center; padding: 24px 0; }
.tools-list { max-height: 500px; overflow-y: auto; }
.tool-item { padding: 10px 12px; border-bottom: 1px solid #f0f0f0; }
.tool-item:last-child { border-bottom: none; }
.tool-header { margin-bottom: 6px; }
.tool-name-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
.tool-name { font-size: 13px; font-weight: 600; color: #1d4ed8; font-family: monospace; }
.tool-desc { font-size: 12px; color: #6b7280; }
/* 参数 Schema */
.tool-schema { margin-top: 6px; background: #f9fafb; border-radius: 4px; padding: 6px 10px; }
.schema-param { display: flex; align-items: baseline; gap: 6px; font-size: 11px; padding: 2px 0; }
.param-name { font-weight: 600; color: #374151; font-family: monospace; }
.param-type { background: #dbeafe; color: #1d4ed8; padding: 0 4px; border-radius: 3px; font-size: 10px; }
.param-req { color: #ef4444; font-size: 10px; }
.param-desc { color: #9ca3af; }
/* 市场 Tab */
.add-tabs { display: flex; border-bottom: 1px solid #e4e7ed; margin-bottom: 14px; }
.tab-item { padding: 8px 20px; cursor: pointer; font-size: 13px; color: #666; border-bottom: 2px solid transparent; margin-bottom: -1px; }
.tab-item.active { color: #1d4ed8; border-bottom-color: #1d4ed8; font-weight: 600; }
/* 市场面板 */
.market-panel { min-height: 300px; }
.market-filter { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
.cat-tag { padding: 3px 12px; border-radius: 12px; font-size: 12px; cursor: pointer; border: 1px solid #e4e7ed; color: #666; background: #fff; }
.cat-tag.active { background: #1d4ed8; color: #fff; border-color: #1d4ed8; }
.market-loading { text-align: center; color: #999; padding: 40px 0; }
.market-grid { display: flex; flex-direction: column; gap: 8px; max-height: 280px; overflow-y: auto; }
.market-item { display: flex; align-items: flex-start; gap: 10px; padding: 10px 12px; border: 1px solid #e4e7ed; border-radius: 6px; cursor: pointer; transition: all 0.15s; }
.market-item:hover { border-color: #93c5fd; background: #f0f7ff; }
.market-item.selected { border-color: #1d4ed8; background: #eff6ff; }
.mi-icon { font-size: 22px; width: 32px; text-align: center; flex-shrink: 0; }
.mi-info { flex: 1; min-width: 0; }
.mi-name { font-size: 13px; font-weight: 600; margin-bottom: 2px; }
.mi-official { font-size: 10px; background: #fef3c7; color: #92400e; padding: 1px 5px; border-radius: 3px; margin-left: 6px; }
.mi-desc { font-size: 12px; color: #6b7280; margin-bottom: 2px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.mi-meta { font-size: 11px; color: #aaa; }
/* 市场配置区 */
.market-config { margin-top: 12px; border-top: 1px solid #f0f0f0; padding-top: 12px; }
.mc-title { font-size: 12px; color: #666; margin-bottom: 8px; }
.mc-field { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.mc-label { font-size: 12px; color: #374151; width: 160px; flex-shrink: 0; }
.mc-req { color: #ef4444; margin-left: 2px; }
/* JSON 导入 */
.json-import-tip { font-size: 12px; color: #6b7280; background: #f9fafb; border-radius: 6px; padding: 8px 12px; margin-bottom: 10px; line-height: 1.7; }
.json-preview { margin-top: 12px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
.preview-title { font-size: 12px; font-weight: 600; color: #374151; background: #f9fafb; padding: 8px 12px; border-bottom: 1px solid #e5e7eb; }
.preview-item { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-bottom: 1px solid #f3f4f6; font-size: 12px; }
.preview-item:last-child { border-bottom: none; }
.preview-name { font-weight: 600; color: #111827; min-width: 100px; }
.preview-transport { background: #dcfce7; color: #15803d; padding: 1px 6px; border-radius: 4px; }
.preview-cmd { color: #6366f1; font-family: monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 300px; }
.preview-url { color: #0ea5e9; font-family: monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 300px; }
.json-error { margin-top: 8px; color: #ef4444; font-size: 12px; padding: 6px 10px; background: #fef2f2; border-radius: 4px; }
/* 发现更多 MCP */
.more-mcp-section { margin-top: 36px; padding-top: 24px; border-top: 1px solid #f0f0f0; }
.more-mcp-title { font-size: 15px; font-weight: 600; color: #374151; margin-bottom: 6px; }
.more-mcp-tip { font-size: 12px; color: #9ca3af; margin-bottom: 14px; }
.more-mcp-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 10px; }
.more-mcp-card { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border: 1px solid #e4e7ed; border-radius: 8px; cursor: pointer; transition: all 0.15s; background: #fafafa; }
.more-mcp-card:hover { border-color: #93c5fd; background: #eff6ff; box-shadow: 0 2px 6px rgba(59,130,246,0.08); }
.more-mcp-icon { font-size: 20px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: #fff; border-radius: 6px; border: 1px solid #e4e7ed; flex-shrink: 0; }
.more-mcp-info { flex: 1; min-width: 0; }
.more-mcp-name { font-size: 13px; font-weight: 600; color: #111827; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.more-mcp-desc { font-size: 11px; color: #6b7280; margin-top: 2px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.more-mcp-link { font-size: 14px; color: #9ca3af; flex-shrink: 0; }
/* ===== Debug 工具调用 ===== */
.debug-layout { display: flex; gap: 16px; min-height: 400px; }
.debug-left { width: 340px; flex-shrink: 0; display: flex; flex-direction: column; }
.debug-right { flex: 1; display: flex; flex-direction: column; }
.debug-section-title { font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
.debug-latency { font-size: 11px; background: #dbeafe; color: #1d4ed8; padding: 1px 6px; border-radius: 4px; font-weight: normal; }
.debug-params { flex: 1; overflow-y: auto; max-height: 380px; }
.debug-no-params { color: #9ca3af; font-size: 12px; text-align: center; padding: 20px 0; }
.debug-param-item { margin-bottom: 12px; }
.debug-param-label { font-size: 12px; font-weight: 600; color: #374151; display: flex; align-items: center; gap: 4px; margin-bottom: 3px; }
.param-type-badge { font-size: 10px; background: #f3f4f6; color: #6b7280; padding: 0 4px; border-radius: 3px; font-weight: normal; }
.debug-param-desc { font-size: 11px; color: #9ca3af; margin-bottom: 4px; }
.debug-actions { display: flex; gap: 8px; padding-top: 12px; border-top: 1px solid #f0f0f0; margin-top: 8px; }
.debug-empty { color: #9ca3af; font-size: 12px; text-align: center; padding: 40px 0; }
.debug-running { color: #f59e0b; font-size: 13px; text-align: center; padding: 20px 0; }
.debug-result { flex: 1; display: flex; flex-direction: column; }
.debug-tabs { display: flex; border-bottom: 1px solid #e5e7eb; margin-bottom: 8px; }
.debug-tab { padding: 4px 14px; font-size: 12px; cursor: pointer; color: #6b7280; border-bottom: 2px solid transparent; margin-bottom: -1px; }
.debug-tab.active { color: #1d4ed8; border-bottom-color: #1d4ed8; font-weight: 600; }
.debug-pretty, .debug-raw { flex: 1; overflow-y: auto; max-height: 340px; }
.debug-pretty pre, .debug-raw pre {
  font-size: 12px; line-height: 1.6; background: #f8fafc; border-radius: 6px;
  padding: 10px 12px; overflow-x: auto; white-space: pre-wrap; word-break: break-all;
  color: #374151; margin: 0;
}
/* ===== 页面 Tab ===== */
.page-tabs { display: flex; border-bottom: 2px solid #e5e7eb; margin: 0 0 16px; padding: 0 16px; }
.page-tab { padding: 8px 20px; cursor: pointer; font-size: 14px; color: #6b7280; border-bottom: 2px solid transparent; margin-bottom: -2px; transition: all 0.15s; }
.page-tab.active { color: #1d4ed8; border-bottom-color: #1d4ed8; font-weight: 600; }
/* ===== 动态工具 Tab ===== */
.dynamic-section { }
.dynamic-section-title { font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
.dynamic-count { font-size: 12px; background: #dbeafe; color: #1d4ed8; padding: 1px 8px; border-radius: 10px; font-weight: normal; }
.dynamic-empty { color: #9ca3af; font-size: 12px; padding: 20px; background: #f9fafb; border-radius: 8px; border: 1px dashed #e5e7eb; text-align: center; }
.dynamic-tool-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }
.dynamic-tool-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 14px; background: #fff; transition: box-shadow 0.2s; }
.dynamic-tool-card:hover { box-shadow: 0 2px 10px rgba(0,0,0,0.08); }
.dtc-header { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
.dtc-type { font-size: 11px; padding: 1px 6px; border-radius: 4px; font-weight: 600; flex-shrink: 0; }
.sql-type { background: #fef3c7; color: #92400e; }
.python-type { background: #dbeafe; color: #1e40af; }
.dtc-name { flex: 1; font-size: 13px; font-weight: 600; font-family: monospace; color: #1d4ed8; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dtc-api-name { font-size: 12px; color: #374151; margin-bottom: 4px; }
.dtc-desc { font-size: 12px; color: #9ca3af; margin-bottom: 6px; }
.dtc-meta { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.dtc-path { font-size: 11px; font-family: monospace; color: #6366f1; background: #f5f3ff; padding: 1px 6px; border-radius: 4px; }
.dtc-badge { font-size: 11px; padding: 1px 6px; border-radius: 4px; }
.dtc-script { font-size: 11px; color: #6b7280; font-family: monospace; }

</style>
