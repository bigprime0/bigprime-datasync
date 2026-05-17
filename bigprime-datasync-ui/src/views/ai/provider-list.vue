<template>
  <div class="ai-provider-container">
    <Breadcrumb :items="['AI 中心', '模型服务']" />
    <div class="contain">
      <!-- 工具栏 -->
      <div class="toolbar">
        <tiny-button type="primary" @click="openProviderDialog()">
          + 添加提供商
        </tiny-button>
      </div>

      <!-- 提供商列表（卡片布局） -->
      <div v-if="providers.length === 0 && !loading" class="empty-tip">
        暂无提供商，请先添加
      </div>
      <div class="provider-grid">
        <div
          v-for="provider in providers"
          :key="provider.id"
          class="provider-card"
          :class="{ disabled: provider.status === 0 }"
        >
          <div class="card-header">
            <span class="provider-type-tag" :class="'type-' + provider.type.toLowerCase()">
              {{ providerTypeLabel(provider.type) }}
            </span>
            <div class="card-actions">
              <tiny-button size="mini" @click="openProviderDialog(provider)">编辑</tiny-button>
              <tiny-button size="mini" type="danger" @click="deleteProvider(provider)">删除</tiny-button>
            </div>
          </div>
          <div class="provider-name">{{ provider.name }}</div>
          <div v-if="provider.apiEndpoint" class="provider-endpoint">{{ provider.apiEndpoint }}</div>

          <!-- 该提供商下的模型列表 -->
          <div class="model-section">
            <div class="model-section-header">
              <span>模型列表（{{ modelMap[provider.id]?.length || 0 }}）</span>
              <tiny-button size="mini" @click="openModelDialog(provider)">+ 添加模型</tiny-button>
            </div>
            <div class="model-list">
              <div
                v-for="model in modelMap[provider.id]"
                :key="model.id"
                class="model-item"
              >
                <span class="model-name">{{ model.displayName || model.modelName }}</span>
                <span v-if="model.modelType" class="model-badge" :class="'type-' + (model.modelType || '').toLowerCase()">{{ modelTypeLabel(model.modelType) }}</span>
                <span v-if="model.supportsVision" class="model-badge vision">视觉</span>
                <span v-if="model.supportsTools" class="model-badge tools">工具</span>
                <tiny-button size="mini" @click="deleteModel(model)">删除</tiny-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 提供商 编辑弹窗 -->
    <tiny-dialog-box
      v-model:visible="providerDialogVisible"
      :title="providerForm.id ? '编辑提供商' : '添加提供商'"
      width="520px"
      @close="resetProviderForm"
    >
      <tiny-form :model="providerForm" label-width="100px" ref="providerFormRef">
        <tiny-form-item label="名称" required>
          <tiny-input v-model="providerForm.name" placeholder="如：我的 OpenAI" />
        </tiny-form-item>
        <tiny-form-item label="类型" required>
          <tiny-select v-model="providerForm.type" placeholder="选择类型" style="width: 100%">
            <tiny-option value="OPENAI" label="OpenAI" />
            <tiny-option value="ANTHROPIC" label="Anthropic (Claude)" />
            <tiny-option value="OLLAMA" label="Ollama（本地）" />
            <tiny-option value="DEEPSEEK" label="DeepSeek" />
            <tiny-option value="CUSTOM" label="自定义（OpenAI 兼容）" />
          </tiny-select>
        </tiny-form-item>
        <tiny-form-item label="API 地址">
          <tiny-input
            v-model="providerForm.apiEndpoint"
            placeholder="Ollama: http://localhost:11434  自定义填写"
          />
        </tiny-form-item>
        <tiny-form-item label="API Key">
          <tiny-input
            v-model="providerForm.apiKey"
            type="password"
            show-password
            :placeholder="providerForm.id ? '不修改请留空' : '请输入 API Key'"
          />
        </tiny-form-item>
        <tiny-form-item label="状态">
          <tiny-switch v-model="providerForm.statusBool" />
        </tiny-form-item>
      </tiny-form>
      <template #footer>
        <tiny-button @click="providerDialogVisible = false">取消</tiny-button>
        <tiny-button type="primary" :loading="saving" @click="saveProvider">保存</tiny-button>
      </template>
    </tiny-dialog-box>

    <!-- 模型 编辑弹窗 -->
    <tiny-dialog-box
      v-model:visible="modelDialogVisible"
      title="添加模型"
      width="480px"
      @close="resetModelForm"
    >
      <tiny-form :model="modelForm" label-width="120px">
        <tiny-form-item label="模型类型" required>
          <tiny-select v-model="modelForm.modelType" placeholder="选择类型" style="width: 100%">
            <tiny-option value="CHAT" label="CHAT（对话）" />
            <tiny-option value="CODE" label="CODE（编码）" />
            <tiny-option value="VISION" label="VISION（视觉/多模态）" />
            <tiny-option value="EMBEDDING" label="EMBEDDING（向量化）" />
            <tiny-option value="RERANK" label="RERANK（重排序）" />
            <tiny-option value="IMAGE" label="IMAGE（图片生成）" />
            <tiny-option value="AUDIO" label="AUDIO（语音）" />
          </tiny-select>
        </tiny-form-item>
        <tiny-form-item label="模型标识" required>
          <tiny-input v-model="modelForm.modelName" placeholder="如：gpt-4o / text-embedding-3-large" />
        </tiny-form-item>
        <tiny-form-item label="展示名称">
          <tiny-input v-model="modelForm.displayName" placeholder="留空则使用模型标识" />
        </tiny-form-item>
        <tiny-form-item label="最大 Token">
          <tiny-numeric v-model="modelForm.maxTokens" :min="1" :max="2000000" />
        </tiny-form-item>
        <tiny-form-item label="支持视觉">
          <tiny-switch v-model="modelForm.supportsVision" />
        </tiny-form-item>
        <tiny-form-item label="支持工具调用">
          <tiny-switch v-model="modelForm.supportsTools" />
        </tiny-form-item>
        <tiny-form-item label="支持流式输出">
          <tiny-switch v-model="modelForm.supportsStream" />
        </tiny-form-item>
      </tiny-form>
      <template #footer>
        <tiny-button @click="modelDialogVisible = false">取消</tiny-button>
        <tiny-button type="primary" :loading="saving" @click="saveModel">保存</tiny-button>
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
  Modal
} from '@opentiny/vue'
import { AiProviderApi, AiModelApi } from '@/api/ai'
import Breadcrumb from '@/components/breadcrumb/index.vue'

const loading = ref(false)
const saving = ref(false)
const providers = ref<any[]>([])
const modelMap = ref<Record<string, any[]>>({})

// ==================== 提供商 ====================
const providerDialogVisible = ref(false)
const providerForm = reactive<any>({
  id: null, name: '', type: 'OPENAI', apiEndpoint: '', apiKey: '', statusBool: true
})

const providerTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    OPENAI: 'OpenAI', ANTHROPIC: 'Claude', OLLAMA: 'Ollama',
    DEEPSEEK: 'DeepSeek', CUSTOM: '自定义'
  }
  return map[type] || type
}

const openProviderDialog = (row?: any) => {
  resetProviderForm()
  if (row) {
    Object.assign(providerForm, {
      id: row.id, name: row.name, type: row.type,
      apiEndpoint: row.apiEndpoint || '', apiKey: '',
      statusBool: row.status === 1
    })
  }
  providerDialogVisible.value = true
}

const resetProviderForm = () => {
  Object.assign(providerForm, { id: null, name: '', type: 'OPENAI', apiEndpoint: '', apiKey: '', statusBool: true })
}

const saveProvider = async () => {
  if (!providerForm.name || !providerForm.type) {
    Modal.message({ message: '名称和类型不能为空', status: 'warning' })
    return
  }
  saving.value = true
  try {
    await AiProviderApi.save({
      id: providerForm.id,
      name: providerForm.name,
      type: providerForm.type,
      apiEndpoint: providerForm.apiEndpoint,
      apiKey: providerForm.apiKey,
      status: providerForm.statusBool ? 1 : 0
    })
    Modal.message({ message: '保存成功', status: 'success' })
    providerDialogVisible.value = false
    await loadProviders()
  } catch {
    Modal.message({ message: '保存失败', status: 'error' })
  } finally {
    saving.value = false
  }
}

const deleteProvider = async (row: any) => {
  Modal.confirm({
    message: `确认删除提供商「${row.name}」及其所有模型？`,
    title: '删除确认'
  }).then(async (res: any) => {
    if (res === 'confirm') {
      await AiProviderApi.delete(row.id)
      Modal.message({ message: '删除成功', status: 'success' })
      await loadProviders()
    }
  })
}

// ==================== 模型 ====================
const modelDialogVisible = ref(false)
const currentProviderId = ref('')
const modelForm = reactive<any>({
  id: null, providerId: '', modelName: '', displayName: '', modelType: 'CHAT',
  maxTokens: 128000, supportsVision: false, supportsTools: true, supportsStream: true
})

const modelTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    CHAT: '对话', CODE: '编码', VISION: '视觉', EMBEDDING: '向量', RERANK: '重排', IMAGE: '图像', AUDIO: '语音'
  }
  return map[type] || type
}

const openModelDialog = (provider: any) => {
  resetModelForm()
  currentProviderId.value = provider.id
  modelForm.providerId = provider.id
  modelDialogVisible.value = true
}

const resetModelForm = () => {
  Object.assign(modelForm, {
    id: null, providerId: '', modelName: '', displayName: '', modelType: 'CHAT',
    maxTokens: 128000, supportsVision: false, supportsTools: true, supportsStream: true
  })
}

const saveModel = async () => {
  if (!modelForm.modelName) {
    Modal.message({ message: '模型标识不能为空', status: 'warning' })
    return
  }
  saving.value = true
  try {
    await AiModelApi.save({ ...modelForm })
    Modal.message({ message: '添加成功', status: 'success' })
    modelDialogVisible.value = false
    await loadModels(currentProviderId.value)
  } catch {
    Modal.message({ message: '添加失败', status: 'error' })
  } finally {
    saving.value = false
  }
}

const deleteModel = async (model: any) => {
  await AiModelApi.delete(model.id)
  Modal.message({ message: '删除成功', status: 'success' })
  await loadModels(model.providerId)
}

// ==================== 数据加载 ====================
const loadProviders = async () => {
  loading.value = true
  try {
    const res = await AiProviderApi.list()
    providers.value = res.data || []
    // 并行加载每个提供商的模型
    await Promise.all(providers.value.map(p => loadModels(p.id)))
  } finally {
    loading.value = false
  }
}

const loadModels = async (providerId: string) => {
  const res = await AiModelApi.list(providerId)
  modelMap.value[providerId] = res.data || []
}

onMounted(() => { loadProviders() })
</script>

<style scoped>
.ai-provider-container { padding: 16px; }
.toolbar { margin-bottom: 16px; }
.provider-grid { display: flex; flex-wrap: wrap; gap: 16px; }
.provider-card {
  width: 360px; border: 1px solid #e4e7ed; border-radius: 8px;
  padding: 16px; background: #fff; transition: box-shadow 0.2s;
}
.provider-card:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.1); }
.provider-card.disabled { opacity: 0.6; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.provider-type-tag {
  font-size: 12px; padding: 2px 8px; border-radius: 4px; font-weight: 500;
}
.type-openai { background: #e8f4fd; color: #1890ff; }
.type-anthropic { background: #fef0e0; color: #e6a23c; }
.type-ollama { background: #e8f5e9; color: #52c41a; }
.type-deepseek { background: #f0e8fd; color: #722ed1; }
.type-custom { background: #f5f5f5; color: #666; }
.provider-name { font-size: 15px; font-weight: 600; margin-bottom: 4px; }
.provider-endpoint { font-size: 12px; color: #999; margin-bottom: 12px; word-break: break-all; }
.model-section { border-top: 1px solid #f0f0f0; padding-top: 10px; margin-top: 8px; }
.model-section-header {
  display: flex; justify-content: space-between; align-items: center;
  font-size: 12px; color: #666; margin-bottom: 8px;
}
.model-item {
  display: flex; align-items: center; gap: 6px;
  padding: 4px 0; font-size: 13px;
}
.model-name { flex: 1; }
.model-badge {
  font-size: 11px; padding: 1px 5px; border-radius: 3px;
}
.model-badge.vision { background: #e6f7ff; color: #1890ff; }
.model-badge.tools { background: #f6ffed; color: #52c41a; }
.model-badge.type-chat { background: #e8f4fd; color: #1890ff; }
.model-badge.type-embedding { background: #f0e8fd; color: #722ed1; }
.model-badge.type-rerank { background: #fef0e0; color: #e6a23c; }
.model-badge.type-image { background: #f6ffed; color: #52c41a; }
.empty-tip { color: #999; text-align: center; padding: 40px 0; }
</style>
