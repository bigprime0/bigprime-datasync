<template>
  <div class="page-container">
    <Breadcrumb :items="['AI 中心', '提示词管理']" />
    <div class="contain">
      <!-- 工具栏 -->
      <div class="toolbar">
        <tiny-button type="primary" @click="openDialog()">+ 新建提示词</tiny-button>
        <div class="toolbar-right">
          <tiny-input
            v-model="searchKeyword"
            placeholder="搜索提示词..."
            style="width: 200px; margin-right: 8px"
            @keyup.enter="loadList"
          />
          <tiny-select v-model="filterCategory" placeholder="全部分类" style="width: 140px; margin-right: 8px" @change="loadList">
            <tiny-option value="" label="全部分类" />
            <tiny-option value="general" label="通用" />
            <tiny-option value="coding" label="编程" />
            <tiny-option value="writing" label="写作" />
            <tiny-option value="analysis" label="分析" />
            <tiny-option value="custom" label="自定义" />
          </tiny-select>
          <tiny-button @click="loadList">搜索</tiny-button>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="list.length === 0 && !loading" class="empty-tip">
        暂无提示词，点击「新建提示词」创建你的第一个提示词模板
      </div>

      <!-- 提示词卡片列表 -->
      <div class="prompt-grid">
        <div v-for="item in list" :key="item.id" class="prompt-card">
          <div class="card-header">
            <div class="prompt-title">{{ item.title }}</div>
            <div class="card-badges">
              <span v-if="item.isPublic === 1" class="badge public">公开</span>
              <span class="badge category">{{ categoryLabel(item.category) }}</span>
            </div>
          </div>
          <div class="prompt-desc">{{ item.description || '暂无描述' }}</div>
          <div class="prompt-content">{{ truncate(item.content, 100) }}</div>
          <div class="card-footer">
            <span class="usage-count">使用 {{ item.usageCount || 0 }} 次</span>
            <div class="card-actions">
              <tiny-button size="mini" type="primary" plain @click="copyPrompt(item)">复制</tiny-button>
              <tiny-button size="mini" @click="openDialog(item)">编辑</tiny-button>
              <tiny-button size="mini" type="danger" @click="deleteItem(item)">删除</tiny-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新建/编辑弹窗 -->
    <tiny-dialog-box
      v-model:visible="dialogVisible"
      :title="form.id ? '编辑提示词' : '新建提示词'"
      width="620px"
      @close="resetForm"
    >
      <tiny-form :model="form" label-width="90px">
        <tiny-form-item label="标题" required>
          <tiny-input v-model="form.title" placeholder="提示词标题" />
        </tiny-form-item>
        <tiny-form-item label="分类">
          <tiny-select v-model="form.category" style="width: 100%">
            <tiny-option value="general" label="通用" />
            <tiny-option value="coding" label="编程" />
            <tiny-option value="writing" label="写作" />
            <tiny-option value="analysis" label="分析" />
            <tiny-option value="custom" label="自定义" />
          </tiny-select>
        </tiny-form-item>
        <tiny-form-item label="描述">
          <tiny-input v-model="form.description" placeholder="简短描述提示词的用途" />
        </tiny-form-item>
        <tiny-form-item label="提示词内容" required>
          <tiny-input
            v-model="form.content"
            type="textarea"
            :rows="8"
            placeholder="在此输入提示词内容，支持使用 {{变量名}} 定义变量..."
          />
        </tiny-form-item>
        <tiny-form-item label="变量定义">
          <tiny-input v-model="form.variables" placeholder='JSON格式，如: {"name":"用户名","task":"任务描述"}' />
        </tiny-form-item>
        <tiny-form-item label="是否公开">
          <tiny-switch v-model="form.isPublicBool" />
          <span class="tip-text">公开后其他用户可以使用此提示词</span>
        </tiny-form-item>
        <tiny-form-item label="排序">
          <tiny-numeric v-model="form.sortOrder" :min="0" :max="9999" />
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
  Switch as TinySwitch,
  Modal
} from '@opentiny/vue'
import { AiPromptApi } from '@/api/ai'
import Breadcrumb from '@/components/breadcrumb/index.vue'

const loading = ref(false)
const saving = ref(false)
const list = ref<any[]>([])
const searchKeyword = ref('')
const filterCategory = ref('')

const categoryLabel = (cat: string) => {
  const map: Record<string, string> = {
    general: '通用', coding: '编程', writing: '写作', analysis: '分析', custom: '自定义'
  }
  return map[cat] || cat || '未分类'
}

const truncate = (str: string, len: number) => {
  if (!str) return ''
  return str.length > len ? str.slice(0, len) + '...' : str
}

const loadList = async () => {
  loading.value = true
  try {
    const res: any = await AiPromptApi.list({
      keyword: searchKeyword.value || undefined,
      category: filterCategory.value || undefined
    })
    list.value = res.data || []
  } finally {
    loading.value = false
  }
}

const copyPrompt = (item: any) => {
  navigator.clipboard.writeText(item.content).then(() => {
    Modal.message({ message: '已复制到剪贴板', status: 'success' })
    AiPromptApi.use(item.id)
  })
}

// ==================== 弹窗 ====================
const dialogVisible = ref(false)
const form = reactive<any>({
  id: null,
  title: '',
  category: 'general',
  description: '',
  content: '',
  variables: '',
  isPublicBool: false,
  sortOrder: 0
})

const resetForm = () => {
  Object.assign(form, {
    id: null, title: '', category: 'general', description: '',
    content: '', variables: '', isPublicBool: false, sortOrder: 0
  })
}

const openDialog = (row?: any) => {
  resetForm()
  if (row) {
    Object.assign(form, {
      id: row.id,
      title: row.title,
      category: row.category || 'general',
      description: row.description || '',
      content: row.content || '',
      variables: row.variables || '',
      isPublicBool: row.isPublic === 1,
      sortOrder: row.sortOrder || 0
    })
  }
  dialogVisible.value = true
}

const saveItem = async () => {
  if (!form.title?.trim()) {
    Modal.message({ message: '标题不能为空', status: 'warning' })
    return
  }
  if (!form.content?.trim()) {
    Modal.message({ message: '提示词内容不能为空', status: 'warning' })
    return
  }
  saving.value = true
  try {
    await AiPromptApi.save({
      id: form.id,
      title: form.title,
      category: form.category,
      description: form.description,
      content: form.content,
      variables: form.variables,
      isPublic: form.isPublicBool ? 1 : 0,
      sortOrder: form.sortOrder
    })
    Modal.message({ message: '保存成功', status: 'success' })
    dialogVisible.value = false
    await loadList()
  } catch {
    Modal.message({ message: '保存失败', status: 'error' })
  } finally {
    saving.value = false
  }
}

const deleteItem = (row: any) => {
  Modal.confirm({ message: `确认删除提示词「${row.title}」？`, title: '删除确认' }).then(async (res: any) => {
    if (res === 'confirm') {
      try {
        await AiPromptApi.delete(row.id)
        Modal.message({ message: '删除成功', status: 'success' })
        await loadList()
      } catch (e: any) {
        Modal.message({ message: e?.message || '删除失败', status: 'error' })
      }
    }
  })
}

onMounted(loadList)
</script>

<style scoped>
.page-container {
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.toolbar-right {
  display: flex;
  align-items: center;
}
.empty-tip {
  color: #9ca3af;
  text-align: center;
  padding: 60px 0;
  font-size: 14px;
}
.prompt-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}
.prompt-card {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 16px;
  background: #fff;
  transition: box-shadow 0.2s;
  display: flex;
  flex-direction: column;
}
.prompt-card:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}
.prompt-title {
  font-weight: 600;
  font-size: 15px;
  color: #111827;
  flex: 1;
}
.card-badges {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
  margin-left: 8px;
}
.badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
}
.badge.public {
  background: #dcfce7;
  color: #166534;
}
.badge.category {
  background: #eff6ff;
  color: #1d4ed8;
}
.prompt-desc {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 8px;
}
.prompt-content {
  font-size: 13px;
  color: #374151;
  background: #f9fafb;
  border-radius: 6px;
  padding: 10px;
  line-height: 1.6;
  flex: 1;
  min-height: 60px;
  word-break: break-all;
}
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}
.usage-count {
  font-size: 12px;
  color: #9ca3af;
}
.card-actions {
  display: flex;
  gap: 6px;
}
.tip-text {
  font-size: 12px;
  color: #9ca3af;
  margin-left: 8px;
}
</style>
