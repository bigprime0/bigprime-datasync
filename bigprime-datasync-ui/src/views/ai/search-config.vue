<template>
  <div class="page-container">
    <Breadcrumb :items="['AI 中心', '网络搜索']" />
    <div class="contain">
      <!-- 左侧搜索引擎配置 -->
      <div class="sc-layout">
        <div class="sc-sidebar">
          <div class="sidebar-header">
            <span class="sidebar-title">搜索引擎</span>
            <tiny-button size="mini" type="primary" @click="openDialog()">+ 添加</tiny-button>
          </div>
          <div v-if="configs.length === 0 && !loading" class="empty-tip-sm">暂无配置</div>
          <div
            v-for="cfg in configs"
            :key="cfg.id"
            class="engine-item"
            :class="{ active: selectedCfg?.id === cfg.id }"
            @click="selectedCfg = cfg"
          >
            <div class="engine-name">
              <span class="engine-icon">{{ cfg.engine === 'BING' || cfg.engineType === 'bing' ? '🔍' : cfg.engine === 'BRAVE' || cfg.engineType === 'brave' ? '🦌' : cfg.engine === 'BAIDU' || cfg.engineType === 'baidu' ? '🔵' : '🔎' }}</span>
              {{ cfg.name || cfg.engine || cfg.engineType }}
            </div>
            <div class="engine-type">{{ cfg.engine || cfg.engineType }}</div>
            <span :class="cfg.isDefault === 1 ? 'badge-default' : ''">{{ cfg.isDefault === 1 ? '默认' : '' }}</span>
            <div class="engine-ops">
              <tiny-button size="mini" plain @click.stop="openDialog(cfg)">编辑</tiny-button>
              <tiny-button size="mini" type="danger" plain @click.stop="deleteConfig(cfg)">删除</tiny-button>
            </div>
          </div>
        </div>

        <!-- 右侧测试区 -->
        <div class="sc-main">
          <template v-if="selectedCfg">
            <div class="test-header">
              <span class="engine-icon-lg">{{ selectedCfg.engine === 'BING' || selectedCfg.engineType === 'bing' ? '🔍' : selectedCfg.engine === 'BAIDU' || selectedCfg.engineType === 'baidu' ? '🔵' : '🔎' }}</span>
              <div>
                <div class="test-title">{{ selectedCfg.name || selectedCfg.engine || selectedCfg.engineType }}</div>
                <div class="test-sub">{{ selectedCfg.engine || selectedCfg.engineType }} · {{ selectedCfg.endpoint || selectedCfg.baseUrl || '默认端点' }}</div>
              </div>
            </div>
            <div class="test-area">
              <tiny-input
                v-model="testKeyword"
                placeholder="输入关键词测试搜索效果..."
                style="flex: 1"
                @keyup.enter="doTest"
              />
              <tiny-button type="primary" :loading="testing" @click="doTest">测试搜索</tiny-button>
            </div>
            <div v-if="testResults.length > 0" class="test-results">
              <div class="results-title">搜索结果（{{ testResults.length }} 条）</div>
              <div v-for="(r, i) in testResults" :key="i" class="result-item">
                <div class="result-title">{{ r.title }}</div>
                <div class="result-url">{{ r.url }}</div>
                <div class="result-snippet">{{ r.snippet }}</div>
              </div>
            </div>
            <div v-if="testError" class="test-error">{{ testError }}</div>
          </template>
          <div v-else class="empty-tip">请在左侧选择或添加搜索引擎配置</div>
        </div>
      </div>
    </div>

    <!-- 编辑/新建弹窗 -->
    <tiny-dialog-box
      v-model:visible="dialogVisible"
      :title="form.id ? '编辑搜索引擎' : '添加搜索引擎'"
      width="540px"
      @close="resetForm"
    >
      <tiny-form :model="form" label-width="100px">
        <tiny-form-item label="名称" required>
          <tiny-input v-model="form.name" placeholder="如：Bing 搜索" />
        </tiny-form-item>
        <tiny-form-item label="引擎类型" required>
            <tiny-select v-model="form.engineType" style="width: 100%" @change="onEngineChange">
            <tiny-option value="bing" label="Bing Search API" />
            <tiny-option value="google" label="Google Custom Search" />
            <tiny-option value="baidu" label="百度搜索（SerpAPI）" />
            <tiny-option value="serpapi" label="SerpAPI" />
            <tiny-option value="tavily" label="Tavily" />
          </tiny-select>
        </tiny-form-item>
        <tiny-form-item label="API Key" required>
          <tiny-input v-model="form.apiKey" type="password" placeholder="搜索引擎 API 密钥" />
        </tiny-form-item>
        <tiny-form-item label="端点 URL">
          <tiny-input v-model="form.baseUrl" placeholder="自定义端点（留空使用默认）" />
        </tiny-form-item>
        <tiny-form-item label="附加配置">
          <tiny-input
            v-model="form.configJson"
            type="textarea"
            :rows="3"
            placeholder='JSON格式，如: {"cx":"Google搜索引擎ID", "count":10}'
          />
        </tiny-form-item>
        <tiny-form-item label="设为默认">
          <tiny-switch v-model="form.isDefaultBool" />
          <span class="tip-text">AI 对话联网搜索时优先使用此引擎</span>
        </tiny-form-item>
      </tiny-form>
      <template #footer>
        <tiny-button @click="dialogVisible = false">取消</tiny-button>
        <tiny-button type="primary" :loading="saving" @click="saveConfig">保存</tiny-button>
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
  Select as TinySelect,
  Option as TinyOption,
  Switch as TinySwitch,
  Modal
} from '@opentiny/vue'
import { AiSearchApi } from '@/api/ai'
import Breadcrumb from '@/components/breadcrumb/index.vue'

const loading = ref(false)
const saving = ref(false)
const testing = ref(false)
const configs = ref<any[]>([])
const selectedCfg = ref<any>(null)
const testKeyword = ref('')
const testResults = ref<any[]>([])
const testError = ref('')

const engineIcon = (t: string) => ({ bing: '🔍', google: '🌐', serpapi: '🤖', tavily: '📡' }[t] ?? '🔎')

const loadConfigs = async () => {
  loading.value = true
  try {
    const res: any = await AiSearchApi.listConfigs()
    configs.value = res.data || []
    if (configs.value.length > 0 && !selectedCfg.value) {
      selectedCfg.value = configs.value[0]
    }
  } finally {
    loading.value = false
  }
}

const doTest = async () => {
  if (!testKeyword.value.trim()) return
  testing.value = true
  testResults.value = []
  testError.value = ''
  try {
    const res: any = await AiSearchApi.test(testKeyword.value, selectedCfg.value?.engineType)
    testResults.value = res.data || []
    if (testResults.value.length === 0) testError.value = '未找到结果'
  } catch (e: any) {
    testError.value = e?.message || '搜索失败，请检查 API Key 配置'
  } finally {
    testing.value = false
  }
}

// ==================== 弹窗 ====================
const dialogVisible = ref(false)
const form = reactive<any>({
  id: null, name: '', engineType: 'bing', apiKey: '', baseUrl: '', configJson: '', isDefaultBool: false
})

const resetForm = () => {
  Object.assign(form, { id: null, name: '', engineType: 'bing', apiKey: '', baseUrl: '', configJson: '', isDefaultBool: false })
}

const onEngineChange = () => {
  if (!form.name) form.name = { bing: 'Bing 搜索', google: 'Google 搜索', baidu: '百度搜索', serpapi: 'SerpAPI', tavily: 'Tavily' }[form.engineType] || ''
}

const openDialog = (row?: any) => {
  resetForm()
  if (row) {
    Object.assign(form, {
      id: row.id,
      name: row.name || row.engine || '',
      engineType: row.engineType || (row.engine ? row.engine.toLowerCase() : 'bing'),
      apiKey: row.apiKey || '',
      baseUrl: row.baseUrl || row.endpoint || '',
      configJson: row.configJson || '',
      isDefaultBool: row.isDefault === 1
    })
  }
  dialogVisible.value = true
}

const saveConfig = async () => {
  if (!form.name?.trim()) { Modal.message({ message: '名称不能为空', status: 'warning' }); return }
  if (!form.apiKey?.trim()) { Modal.message({ message: 'API Key 不能为空', status: 'warning' }); return }
  saving.value = true
  try {
    await AiSearchApi.saveConfig({
      id: form.id, name: form.name, engineType: form.engineType, apiKey: form.apiKey,
      baseUrl: form.baseUrl, configJson: form.configJson, isDefault: form.isDefaultBool ? 1 : 0
    })
    Modal.message({ message: '保存成功', status: 'success' })
    dialogVisible.value = false
    await loadConfigs()
  } catch { Modal.message({ message: '保存失败', status: 'error' }) } finally { saving.value = false }
}

const deleteConfig = (row: any) => {
  Modal.confirm({ message: `确认删除「${row.name}」？`, title: '删除确认' }).then(async (res: any) => {
    if (res === 'confirm') {
      try {
        await AiSearchApi.deleteConfig(row.id)
        Modal.message({ message: '删除成功', status: 'success' })
        if (selectedCfg.value?.id === row.id) selectedCfg.value = null
        await loadConfigs()
      } catch (e: any) { Modal.message({ message: e?.message || '删除失败', status: 'error' }) }
    }
  })
}

onMounted(loadConfigs)
</script>

<style scoped>
.page-container { padding: 16px; min-height: 100%; background: #f5f7fa; }
.contain { background: #fff; border-radius: 8px; padding: 20px; }
.sc-layout { display: flex; gap: 20px; min-height: 500px; }
.sc-sidebar { width: 220px; flex-shrink: 0; border-right: 1px solid #e5e7eb; padding-right: 16px; }
.sidebar-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.sidebar-title { font-weight: 600; font-size: 14px; color: #111827; }
.engine-item { padding: 10px 12px; border-radius: 8px; cursor: pointer; margin-bottom: 6px; border: 1px solid transparent; }
.engine-item:hover { background: #f3f4f6; }
.engine-item.active { background: #eff6ff; border-color: #bfdbfe; }
.engine-name { display: flex; align-items: center; gap: 6px; font-weight: 500; font-size: 14px; color: #111827; }
.engine-icon { font-size: 16px; }
.engine-type { font-size: 11px; color: #9ca3af; margin-top: 2px; }
.badge-default { background: #dcfce7; color: #166534; font-size: 11px; padding: 1px 6px; border-radius: 8px; }
.engine-ops { display: flex; gap: 4px; margin-top: 6px; }
.sc-main { flex: 1; min-width: 0; }
.test-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb; }
.engine-icon-lg { font-size: 32px; }
.test-title { font-size: 18px; font-weight: 600; color: #111827; }
.test-sub { font-size: 13px; color: #6b7280; margin-top: 2px; }
.test-area { display: flex; gap: 10px; margin-bottom: 20px; }
.test-results { border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; }
.results-title { font-weight: 600; font-size: 14px; color: #374151; margin-bottom: 12px; }
.result-item { padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
.result-item:last-child { border-bottom: none; }
.result-title { font-weight: 500; font-size: 14px; color: #1d4ed8; margin-bottom: 3px; }
.result-url { font-size: 12px; color: #16a34a; margin-bottom: 4px; word-break: break-all; }
.result-snippet { font-size: 13px; color: #374151; line-height: 1.5; }
.test-error { background: #fee2e2; border: 1px solid #fca5a5; border-radius: 8px; padding: 12px; color: #991b1b; font-size: 13px; }
.empty-tip { color: #9ca3af; text-align: center; padding: 80px 0; font-size: 14px; }
.empty-tip-sm { color: #9ca3af; text-align: center; padding: 20px 0; font-size: 13px; }
.tip-text { font-size: 12px; color: #9ca3af; margin-left: 8px; }
</style>
