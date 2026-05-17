<template>
  <div class="page-container">
    <Breadcrumb :items="['AI 中心', '记忆管理']" />
    <div class="contain">
      <!-- 工具栏 -->
      <div class="toolbar">
        <div class="toolbar-left">
          <tiny-select v-model="filterType" placeholder="全部类型" style="width: 140px; margin-right: 8px" @change="loadList">
            <tiny-option value="" label="全部类型" />
            <tiny-option value="long_term" label="长期记忆" />
            <tiny-option value="short_term" label="短期记忆" />
            <tiny-option value="session" label="会话记忆" />
          </tiny-select>
          <tiny-button @click="loadList">刷新</tiny-button>
        </div>
        <div>
          <tiny-button type="primary" @click="openDialog()">+ 手动记录</tiny-button>
          <tiny-button type="danger" plain @click="clearAll">清空全部</tiny-button>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="list.length === 0 && !loading" class="empty-tip">
        暂无记忆记录。AI 对话时会自动提取重要信息存储为记忆。
      </div>

      <!-- 记忆列表 -->
      <div class="memory-list">
        <div v-for="item in list" :key="item.id" class="memory-item">
          <div class="memory-header">
            <span :class="['memory-type', typeClass(item.type || item.memoryType)]">{{ typeLabel(item.type || item.memoryType) }}</span>
            <span class="memory-importance">重要度: {{ item.importance ?? 5 }}/10</span>
            <span class="memory-time">{{ item.createTime }}</span>
          </div>
          <div class="memory-content">{{ item.content }}</div>
          <div v-if="item.sessionId" class="memory-session">来自会话: {{ item.sessionId }}</div>
          <div class="memory-footer">
            <tiny-button size="mini" type="danger" plain @click="deleteItem(item)">删除</tiny-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 手动记录弹窗 -->
    <tiny-dialog-box v-model:visible="dialogVisible" title="手动记录记忆" width="500px" @close="resetForm">
      <tiny-form :model="form" label-width="90px">
        <tiny-form-item label="记忆类型">
          <tiny-select v-model="form.memoryType" style="width: 100%">
            <tiny-option value="long_term" label="长期记忆" />
            <tiny-option value="short_term" label="短期记忆" />
          </tiny-select>
        </tiny-form-item>
        <tiny-form-item label="重要程度">
          <tiny-numeric v-model="form.importance" :min="1" :max="10" />
          <span class="tip-text">1-10，10为最重要</span>
        </tiny-form-item>
        <tiny-form-item label="记忆内容" required>
          <tiny-input v-model="form.content" type="textarea" :rows="5" placeholder="输入需要记录的信息..." />
        </tiny-form-item>
      </tiny-form>
      <template #footer>
        <tiny-button @click="dialogVisible = false">取消</tiny-button>
        <tiny-button type="primary" :loading="saving" @click="saveItem">保存</tiny-button>
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
  Modal
} from '@opentiny/vue'
import { AiMemoryApi } from '@/api/ai'
import Breadcrumb from '@/components/breadcrumb/index.vue'

const loading = ref(false)
const saving = ref(false)
const list = ref<any[]>([])
const filterType = ref('')

const typeLabel = (t: string) => ({ long_term: '长期记忆', short_term: '短期记忆', session: '会话记忆' }[t] ?? t)
const typeClass = (t: string) => ({ long_term: 'type-long', short_term: 'type-short', session: 'type-session' }[t] ?? '')

const loadList = async () => {
  loading.value = true
  try {
    const res: any = await AiMemoryApi.list({ memoryType: filterType.value || undefined })
    list.value = res.data || []
  } finally {
    loading.value = false
  }
}

const clearAll = () => {
  Modal.confirm({ message: '确认清空所有记忆？此操作不可撤销！', title: '清空确认' }).then(async (res: any) => {
    if (res === 'confirm') {
      try {
        await AiMemoryApi.clear()
        Modal.message({ message: '已清空全部记忆', status: 'success' })
        await loadList()
      } catch (e: any) {
        Modal.message({ message: e?.message || '操作失败', status: 'error' })
      }
    }
  })
}

// ==================== 弹窗 ====================
const dialogVisible = ref(false)
const form = reactive<any>({ memoryType: 'long_term', importance: 5, content: '' })

const resetForm = () => { Object.assign(form, { memoryType: 'long_term', importance: 5, content: '' }) }

const openDialog = () => {
  resetForm()
  dialogVisible.value = true
}

const saveItem = async () => {
  if (!form.content?.trim()) { Modal.message({ message: '内容不能为空', status: 'warning' }); return }
  saving.value = true
  try {
    await AiMemoryApi.save({ memoryType: form.memoryType, importance: form.importance, content: form.content })
    Modal.message({ message: '保存成功', status: 'success' })
    dialogVisible.value = false
    await loadList()
  } catch { Modal.message({ message: '保存失败', status: 'error' }) } finally { saving.value = false }
}

const deleteItem = (row: any) => {
  Modal.confirm({ message: '确认删除此条记忆？', title: '删除确认' }).then(async (res: any) => {
    if (res === 'confirm') {
      try {
        await AiMemoryApi.delete(row.id)
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
.toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.toolbar-left { display: flex; align-items: center; }
.empty-tip { color: #9ca3af; text-align: center; padding: 60px 0; font-size: 14px; }
.memory-list { display: flex; flex-direction: column; gap: 12px; }
.memory-item { border: 1px solid #e5e7eb; border-radius: 10px; padding: 14px 16px; background: #fafafa; }
.memory-header { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.memory-type { padding: 2px 10px; border-radius: 10px; font-size: 11px; font-weight: 600; }
.type-long { background: #ede9fe; color: #5b21b6; }
.type-short { background: #dcfce7; color: #166534; }
.type-session { background: #dbeafe; color: #1d4ed8; }
.memory-importance { font-size: 12px; color: #6b7280; }
.memory-time { font-size: 12px; color: #9ca3af; margin-left: auto; }
.memory-content { font-size: 14px; color: #111827; line-height: 1.6; margin-bottom: 6px; }
.memory-session { font-size: 12px; color: #9ca3af; margin-bottom: 6px; }
.memory-footer { display: flex; justify-content: flex-end; }
.tip-text { font-size: 12px; color: #9ca3af; margin-left: 8px; }
</style>
