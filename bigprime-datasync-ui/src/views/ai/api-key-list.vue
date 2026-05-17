<template>
  <div class="page-container">
    <Breadcrumb :items="['AI 中心', 'API 密钥']" />
    <div class="contain">
      <!-- 说明栏 -->
      <div class="info-banner">
        <span>🔑</span>
        <span>API 密钥用于外部应用调用 BigPrime AI 服务。请妥善保管，密钥创建后仅显示一次。</span>
      </div>

      <!-- 工具栏 -->
      <div class="toolbar">
        <tiny-button type="primary" @click="openDialog">+ 创建密钥</tiny-button>
        <tiny-button @click="loadList">刷新</tiny-button>
      </div>

      <!-- 空状态 -->
      <div v-if="list.length === 0 && !loading" class="empty-tip">
        暂无 API 密钥，点击「创建密钥」生成一个新密钥
      </div>

      <!-- 密钥表格 -->
      <tiny-grid :data="list" border>
        <tiny-grid-column label="名称" prop="name" min-width="140" />
        <tiny-grid-column label="密钥（前缀）" min-width="200">
          <template #default="{ row }">
            <span class="key-prefix">{{ row.keyPrefix }}...</span>
            <span v-if="row._fullKey" class="key-full">{{ row._fullKey }}</span>
          </template>
        </tiny-grid-column>
        <tiny-grid-column label="状态" width="80">
          <template #default="{ row }">
            <span :class="row.status === 1 ? 'status-ok' : 'status-revoked'">{{ row.status === 1 ? '有效' : '已吊销' }}</span>
          </template>
        </tiny-grid-column>
        <tiny-grid-column label="调用次数" prop="totalCalls" width="90" />
        <tiny-grid-column label="最后使用" prop="lastUsedAt" width="150" />
        <tiny-grid-column label="过期时间" prop="expiresAt" width="150" />
        <tiny-grid-column label="创建时间" prop="createTime" width="150" />
        <tiny-grid-column label="操作" width="130">
          <template #default="{ row }">
            <tiny-button v-if="row.status === 1" size="mini" type="warning" @click="revokeKey(row)">吊销</tiny-button>
            <tiny-button size="mini" type="danger" @click="deleteKey(row)">删除</tiny-button>
          </template>
        </tiny-grid-column>
      </tiny-grid>

      <!-- 新创建密钥展示 -->
      <tiny-dialog-box v-model:visible="newKeyVisible" title="密钥创建成功" width="520px" :close-on-click-modal="false">
        <div class="new-key-tip">⚠️ 请立即复制并妥善保存，此密钥仅显示一次！</div>
        <div class="new-key-box">
          <span class="new-key-text">{{ newKey }}</span>
          <tiny-button size="mini" type="primary" @click="copyKey">复制</tiny-button>
        </div>
        <template #footer>
          <tiny-button type="primary" @click="newKeyVisible = false; loadList()">我已保存，关闭</tiny-button>
        </template>
      </tiny-dialog-box>
    </div>

    <!-- 创建密钥弹窗 -->
    <tiny-dialog-box v-model:visible="dialogVisible" title="创建 API 密钥" width="480px" @close="resetForm">
      <tiny-form :model="form" label-width="90px">
        <tiny-form-item label="密钥名称" required>
          <tiny-input v-model="form.name" placeholder="如：生产环境、测试用途" />
        </tiny-form-item>
        <tiny-form-item label="过期时间">
          <tiny-input v-model="form.expiresAt" type="date" placeholder="留空表示永不过期" />
        </tiny-form-item>
      </tiny-form>
      <template #footer>
        <tiny-button @click="dialogVisible = false">取消</tiny-button>
        <tiny-button type="primary" :loading="saving" @click="createKey">创建</tiny-button>
      </template>
    </tiny-dialog-box>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, reactive } from 'vue'
import {
  Button as TinyButton,
  DialogBox as TinyDialogBox,
  Form as TinyForm,
  FormItem as TinyFormItem,
  Input as TinyInput,
  Grid as TinyGrid,
  GridColumn as TinyGridColumn,
  Modal
} from '@opentiny/vue'
import { AiApiKeyApi } from '@/api/ai'
import Breadcrumb from '@/components/breadcrumb/index.vue'

const loading = ref(false)
const saving = ref(false)
const list = ref<any[]>([])
const dialogVisible = ref(false)
const newKeyVisible = ref(false)
const newKey = ref('')
const form = reactive<any>({ name: '', expiresAt: '' })

const loadList = async () => {
  loading.value = true
  try {
    const res: any = await AiApiKeyApi.list()
    list.value = res.data?.data || res.data || []
  } catch (e: any) {
    Modal.message({ message: e?.message || '加载失败', status: 'error' })
  } finally {
    loading.value = false
  }
}

const openDialog = () => {
  Object.assign(form, { name: '', expiresAt: '' })
  dialogVisible.value = true
}

const resetForm = () => { Object.assign(form, { name: '', expiresAt: '' }) }

const createKey = async () => {
  if (!form.name?.trim()) { Modal.message({ message: '名称不能为空', status: 'warning' }); return }
  saving.value = true
  try {
    const res: any = await AiApiKeyApi.generate({ name: form.name })
    dialogVisible.value = false
    newKey.value = res.data?.data?.apiKey || res.data?.apiKey || ''
    newKeyVisible.value = true
  } catch (e: any) {
    Modal.message({ message: e?.message || '创建失败', status: 'error' })
  } finally {
    saving.value = false
  }
}

const copyKey = () => {
  navigator.clipboard.writeText(newKey.value).then(() => {
    Modal.message({ message: '已复制到剪贴板', status: 'success' })
  })
}

const revokeKey = (row: any) => {
  Modal.confirm({ message: `确认吊销密钥「${row.name}」？吊销后将无法再使用。`, title: '吊销确认' }).then(async (res: any) => {
    if (res === 'confirm') {
      try {
        await AiApiKeyApi.setStatus(row.id, 0)
        Modal.message({ message: '已吊销', status: 'success' })
        await loadList()
      } catch (e: any) { Modal.message({ message: e?.message || '操作失败', status: 'error' }) }
    }
  })
}

const deleteKey = (row: any) => {
  Modal.confirm({ message: `确认删除密钥「${row.name}」？`, title: '删除确认' }).then(async (res: any) => {
    if (res === 'confirm') {
      try {
        await AiApiKeyApi.delete(row.id)
        Modal.message({ message: '删除成功', status: 'success' })
        await loadList()
      } catch (e: any) { Modal.message({ message: e?.message || '删除失败', status: 'error' }) }
    }
  })
}

onMounted(loadList)
</script>

<style scoped>
.page-container { padding: 16px; min-height: 100%; background: #f5f7fa; }
.contain { background: #fff; border-radius: 8px; padding: 20px; }
.info-banner { display: flex; align-items: center; gap: 8px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 10px 16px; margin-bottom: 16px; font-size: 13px; color: #92400e; }
.toolbar { display: flex; gap: 8px; margin-bottom: 16px; }
.empty-tip { color: #9ca3af; text-align: center; padding: 60px 0; font-size: 14px; }
.key-prefix { font-family: monospace; font-size: 13px; background: #f3f4f6; padding: 2px 8px; border-radius: 4px; color: #374151; }
.key-full { font-family: monospace; font-size: 12px; color: #ef4444; margin-left: 8px; word-break: break-all; }
.status-ok { background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 10px; font-size: 11px; }
.status-revoked { background: #f3f4f6; color: #6b7280; padding: 2px 8px; border-radius: 10px; font-size: 11px; }
.new-key-tip { background: #fef3c7; border: 1px solid #fde68a; border-radius: 6px; padding: 10px; margin-bottom: 16px; font-size: 13px; color: #92400e; }
.new-key-box { display: flex; align-items: center; gap: 12px; background: #1e293b; border-radius: 8px; padding: 14px 16px; }
.new-key-text { flex: 1; font-family: monospace; font-size: 13px; color: #4ade80; word-break: break-all; }
</style>
