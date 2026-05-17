<template>
  <div class="page-container">
    <Breadcrumb :items="['AI 中心', '外部 Agent']" />

    <div class="toolbar">
      <tiny-button type="primary" @click="openDialog()">+ 新增配置</tiny-button>
    </div>

    <!-- 列表 -->
    <div v-if="loading" class="loading-tip">加载中...</div>
    <div v-else-if="agents.length === 0" class="empty-tip">暂无外部 Agent 配置，点击「新增配置」接入 Dify / Coze / FastGPT</div>
    <div v-else class="card-grid">
      <div v-for="item in agents" :key="item.id" class="agent-card">
        <div class="card-header">
          <span class="provider-badge" :class="'badge-' + item.provider?.toLowerCase()">
            {{ providerLabel(item.provider) }}
          </span>
          <tiny-switch
            :modelValue="item.enabled === 1"
            @update:modelValue="val => toggleEnabled(item, val)"
          />
        </div>
        <div class="card-name">{{ item.name }}</div>
        <div class="card-url">{{ item.baseUrl }}</div>
        <div v-if="item.apiKeyPrefix" class="card-key">Key: {{ item.apiKeyPrefix }}</div>
        <div v-if="item.agentId" class="card-agent-id">Agent ID: {{ item.agentId }}</div>
        <div v-if="item.description" class="card-desc">{{ item.description }}</div>
        <div class="card-actions">
          <tiny-button size="small" @click="openDialog(item)">编辑</tiny-button>
          <tiny-button size="small" type="danger" @click="deleteAgent(item)">删除</tiny-button>
        </div>
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <tiny-dialog-box
      v-model:visible="dialogVisible"
      :title="form.id ? '编辑外部 Agent' : '新增外部 Agent'"
      width="560px"
      :close-on-click-modal="false"
    >
      <tiny-form :model="form" label-width="110px" label-position="right">
        <tiny-form-item label="配置名称" required>
          <tiny-input v-model="form.name" placeholder="如：我的 Dify 爬虫助手" />
        </tiny-form-item>

        <tiny-form-item label="平台类型" required>
          <tiny-select v-model="form.provider" placeholder="选择平台" style="width:100%">
            <tiny-option value="DIFY"    label="Dify" />
            <tiny-option value="COZE"    label="Coze（扣子）" />
            <tiny-option value="FASTGPT" label="FastGPT" />
          </tiny-select>
        </tiny-form-item>

        <tiny-form-item label="API 地址" required>
          <tiny-input
            v-model="form.baseUrl"
            placeholder="如：https://api.dify.ai/v1"
          />
          <div class="field-hint">
            <span v-if="form.provider === 'DIFY'">Dify 默认：https://api.dify.ai/v1</span>
            <span v-else-if="form.provider === 'COZE'">Coze 默认：https://api.coze.cn</span>
            <span v-else-if="form.provider === 'FASTGPT'">FastGPT 默认：https://api.fastgpt.in</span>
          </div>
        </tiny-form-item>

        <tiny-form-item label="API Key">
          <tiny-input
            v-model="form.apiKey"
            type="password"
            show-password
            :placeholder="form.id ? '留空则不更新已保存的 Key' : '请输入 API Key'"
          />
          <div v-if="form.id && currentAgent?.apiKeyPrefix" class="field-hint">
            当前 Key：{{ currentAgent.apiKeyPrefix }}（已加密存储）
          </div>
        </tiny-form-item>

        <!-- Agent ID：Dify 不需要，Coze 需要 bot_id，FastGPT 需要 appId -->
        <tiny-form-item
          v-if="form.provider === 'COZE' || form.provider === 'FASTGPT'"
          :label="form.provider === 'COZE' ? 'Bot ID' : 'App ID'"
          required
        >
          <tiny-input
            v-model="form.agentId"
            :placeholder="form.provider === 'COZE' ? 'Coze 机器人 ID（bot_id）' : 'FastGPT 应用 ID（appId）'"
          />
        </tiny-form-item>

        <tiny-form-item label="描述">
          <tiny-input v-model="form.description" type="textarea" :rows="2" placeholder="可选，描述这个 Agent 的用途" />
        </tiny-form-item>

        <tiny-form-item label="状态">
          <tiny-switch v-model="form.enabledBool" active-text="启用" inactive-text="禁用" />
        </tiny-form-item>
      </tiny-form>

      <!-- 连通测试区域 -->
      <div class="test-section">
        <div class="test-header">
          <span>连通性测试</span>
          <tiny-button
            size="small"
            type="info"
            :loading="testing"
            @click="runTest"
          >
            测试连接
          </tiny-button>
        </div>
        <div v-if="testResult" :class="['test-result', testResult.success ? 'success' : 'error']">
          {{ testResult.message }}
        </div>
      </div>

      <template #footer>
        <tiny-button @click="dialogVisible = false">取消</tiny-button>
        <tiny-button type="primary" :loading="saving" @click="saveAgent">保存</tiny-button>
      </template>
    </tiny-dialog-box>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, reactive, computed } from 'vue'
import {
  Button as TinyButton,
  DialogBox as TinyDialog,
  Form as TinyForm,
  FormItem as TinyFormItem,
  Input as TinyInput,
  Select as TinySelect,
  Option as TinyOption,
  Switch as TinySwitch,
  Modal
} from '@opentiny/vue'
import { AiExternalAgentApi } from '@/api/ai'
import Breadcrumb from '@/components/breadcrumb/index.vue'

const loading = ref(false)
const saving = ref(false)
const testing = ref(false)
const agents = ref<any[]>([])
const dialogVisible = ref(false)
const testResult = ref<any>(null)

const form = reactive<any>({
  id: null,
  name: '',
  provider: 'DIFY',
  baseUrl: '',
  apiKey: '',
  agentId: '',
  description: '',
  enabledBool: true
})

// 当前正在编辑的原始数据（用于展示 apiKeyPrefix）
const currentAgent = ref<any>(null)

const providerLabel = (provider: string) => {
  const map: Record<string, string> = {
    DIFY: 'Dify',
    COZE: 'Coze',
    FASTGPT: 'FastGPT'
  }
  return map[provider] || provider
}

// ==================== 加载 ====================
const loadAgents = async () => {
  loading.value = true
  try {
    const res: any = await AiExternalAgentApi.list()
    agents.value = res.data || []
  } finally {
    loading.value = false
  }
}

// ==================== 弹窗 ====================
const resetForm = () => {
  Object.assign(form, {
    id: null, name: '', provider: 'DIFY', baseUrl: '', apiKey: '',
    agentId: '', description: '', enabledBool: true
  })
  currentAgent.value = null
  testResult.value = null
}

const openDialog = (row?: any) => {
  resetForm()
  if (row) {
    Object.assign(form, {
      id: row.id,
      name: row.name,
      provider: row.provider || 'DIFY',
      baseUrl: row.baseUrl || '',
      apiKey: '',               // 不回填密文
      agentId: row.agentId || '',
      description: row.description || '',
      enabledBool: row.enabled === 1
    })
    currentAgent.value = row
  }
  dialogVisible.value = true
}

// ==================== 保存 ====================
const saveAgent = async () => {
  if (!form.name?.trim()) {
    Modal.message({ message: '配置名称不能为空', status: 'warning' })
    return
  }
  if (!form.provider) {
    Modal.message({ message: '请选择平台类型', status: 'warning' })
    return
  }
  if (!form.baseUrl?.trim()) {
    Modal.message({ message: 'API 地址不能为空', status: 'warning' })
    return
  }
  if (!form.id && !form.apiKey?.trim()) {
    Modal.message({ message: '新增配置时 API Key 不能为空', status: 'warning' })
    return
  }
  if ((form.provider === 'COZE' || form.provider === 'FASTGPT') && !form.agentId?.trim()) {
    Modal.message({ message: `${providerLabel(form.provider)} 平台需要填写 Agent ID`, status: 'warning' })
    return
  }

  saving.value = true
  try {
    await AiExternalAgentApi.save({
      id: form.id,
      name: form.name,
      provider: form.provider,
      baseUrl: form.baseUrl,
      apiKey: form.apiKey,
      agentId: form.agentId,
      description: form.description,
      enabled: form.enabledBool ? 1 : 0
    })
    Modal.message({ message: '保存成功', status: 'success' })
    dialogVisible.value = false
    await loadAgents()
  } catch (e: any) {
    Modal.message({ message: e?.message || '保存失败', status: 'error' })
  } finally {
    saving.value = false
  }
}

// ==================== 删除 ====================
const deleteAgent = (row: any) => {
  Modal.confirm({
    message: `确认删除外部 Agent「${row.name}」？相关会话映射也将失效。`,
    title: '删除确认'
  }).then(async (res: any) => {
    if (res === 'confirm') {
      try {
        await AiExternalAgentApi.delete(row.id)
        Modal.message({ message: '删除成功', status: 'success' })
        await loadAgents()
      } catch (e: any) {
        Modal.message({ message: e?.message || '删除失败', status: 'error' })
      }
    }
  })
}

// ==================== 启用/禁用 ====================
const toggleEnabled = async (row: any, val: boolean) => {
  try {
    await AiExternalAgentApi.setEnabled(row.id, val)
    row.enabled = val ? 1 : 0
  } catch (e: any) {
    Modal.message({ message: '操作失败', status: 'error' })
  }
}

// ==================== 连通测试 ====================
const runTest = async () => {
  if (!form.provider || !form.baseUrl?.trim()) {
    Modal.message({ message: '请先填写平台类型和 API 地址', status: 'warning' })
    return
  }
  const apiKey = form.apiKey?.trim()
  if (!apiKey) {
    Modal.message({ message: '连通测试需要填写明文 API Key', status: 'warning' })
    return
  }

  testing.value = true
  testResult.value = null
  try {
    const res: any = await AiExternalAgentApi.test({
      provider: form.provider,
      baseUrl: form.baseUrl,
      apiKey: apiKey,
      agentId: form.agentId
    })
    testResult.value = res.data
  } catch (e: any) {
    testResult.value = { success: false, message: e?.message || '测试请求失败' }
  } finally {
    testing.value = false
  }
}

onMounted(loadAgents)
</script>

<style scoped>
.page-container { padding: 20px; }
.toolbar { margin-bottom: 16px; }
.loading-tip, .empty-tip {
  text-align: center;
  color: #909399;
  padding: 60px 0;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.agent-card {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  transition: box-shadow 0.2s;
}
.agent-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,.08); }

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.provider-badge {
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
  color: #fff;
}
.badge-dify    { background: #7c3aed; }
.badge-coze    { background: #0050b3; }
.badge-fastgpt { background: #059669; }

.card-name  { font-size: 15px; font-weight: 600; margin-bottom: 4px; }
.card-url   { font-size: 12px; color: #909399; margin-bottom: 4px; word-break: break-all; }
.card-key   { font-size: 12px; color: #606266; }
.card-agent-id { font-size: 12px; color: #606266; }
.card-desc  { font-size: 12px; color: #909399; margin-top: 6px; }
.card-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
}

.field-hint {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.test-section {
  margin-top: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}
.test-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #606266;
  margin-bottom: 8px;
}
.test-result {
  font-size: 13px;
  padding: 8px 12px;
  border-radius: 4px;
}
.test-result.success { background: #f0f9eb; color: #67c23a; }
.test-result.error   { background: #fef0f0; color: #f56c6c; }
</style>
