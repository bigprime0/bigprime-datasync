<template>
  <div class="doc-library-page">
    <!-- 页面标题栏 -->
    <div class="page-header">
      <span class="page-title">文档库管理</span>
      <div class="page-actions">
        <tiny-button type="primary" @click="openCreateDialog">新建文档库</tiny-button>
      </div>
    </div>

    <!-- 主体左右布局 -->
    <div class="doc-lib-body">
      <!-- 左侧分类面板 -->
      <div class="category-panel">
        <div class="category-title">分类过滤</div>
        <div
          class="category-item"
          :class="{ active: filterCategory === '' }"
          @click="filterCategory = ''; loadLibraries()"
        >
          <span>全部</span>
          <span class="category-count">{{ libraries.length }}</span>
        </div>
        <div
          v-for="cat in categoryList" :key="cat.name"
          class="category-item"
          :class="{ active: filterCategory === cat.name }"
          @click="filterCategory = cat.name"
        >
          <span>{{ cat.name || '未分类' }}</span>
          <span class="category-count">{{ cat.count }}</span>
        </div>
      </div>

      <!-- 右侧内容区 -->
      <div class="doc-lib-main">
        <!-- 搜索工具栏 -->
        <div class="toolbar">
          <tiny-input
            v-model="filterKeyword"
            placeholder="搜索文档库名称"
            clearable
            style="width: 200px;"
          />
          <tiny-select
            v-model="filterStatus"
            placeholder="全部状态"
            clearable
            style="width: 110px; margin-left: 8px;"
          >
            <tiny-option label="已启用" :value="1" />
            <tiny-option label="已禁用" :value="0" />
          </tiny-select>
        </div>

        <!-- 文档库卡片列表 -->
        <div v-if="!loading && filteredLibraries.length > 0" class="doc-lib-grid">
          <div
            v-for="lib in filteredLibraries"
            :key="lib.id"
            class="doc-lib-card"
            :class="{ disabled: lib.status === 0 }"
          >
            <div class="card-header">
              <span class="card-icon">{{ lib.icon || '📚' }}</span>
              <div class="card-title-area">
                <span class="card-title">{{ lib.displayName || lib.name }}</span>
                <span class="card-name">{{ lib.name }}</span>
              </div>
              <tiny-switch
                v-model="lib.status"
                :true-value="1"
                :false-value="0"
                @change="toggleStatus(lib)"
              />
            </div>
            <div class="card-desc">{{ lib.description || '暂无描述' }}</div>
            <div class="card-meta">
              <span v-if="lib.category" class="tag tag-category">{{ lib.category }}</span>
              <span class="tag tag-path">📁 {{ lib.docPath }}</span>
              <span class="tag tag-count">{{ lib.fileCount ?? 0 }} 文件</span>
            </div>
            <div class="card-actions">
              <tiny-button size="mini" plain @click="openEditDialog(lib)">编辑</tiny-button>
              <tiny-button size="mini" plain @click="openUploadDialog(lib)">上传</tiny-button>
              <tiny-button size="mini" plain @click="testConnect(lib)">连通测试</tiny-button>
              <tiny-button size="mini" plain @click="refreshCount(lib)">刷新</tiny-button>
              <tiny-button size="mini" plain type="danger" @click="confirmDelete(lib)">删除</tiny-button>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else-if="!loading" class="empty-tip">
          暂无文档库，请点击「新建文档库」添加
        </div>

        <!-- 加载中 -->
        <div v-if="loading" class="loading-tip">加载中...</div>
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <tiny-dialog-box
      v-model:visible="dialogVisible"
      :title="form.id ? '编辑文档库' : '新建文档库'"
      width="720px"
      :destroy-on-close="true"
    >
      <tiny-form :model="form" label-width="110px" ref="formRef">
        <div class="form-row">
          <tiny-form-item label="标识名" style="flex: 1; margin-right: 12px;">
            <tiny-input v-model="form.name" placeholder="如: seatunnel-docs（全局唯一，用作工具名前缀）" :disabled="!!form.id" />
          </tiny-form-item>
          <tiny-form-item label="显示名称" style="flex: 1;">
            <tiny-input v-model="form.displayName" placeholder="如: SeaTunnel 文档库" />
          </tiny-form-item>
        </div>
        <tiny-form-item label="描述">
          <tiny-input v-model="form.description" type="textarea" :rows="2"
            placeholder="向 AI 展示的文档库说明" />
        </tiny-form-item>
        <tiny-form-item label="文档目录路径">
          <tiny-input v-model="form.docPath" placeholder="如 docs/seatunnel-2.3.12（相对路径）或绝对路径" />
          <div class="tip-text">文档库指向的文件系统目录，助手绑定后可浏览和搜索该目录下的文档</div>
        </tiny-form-item>
        <div class="form-row">
          <tiny-form-item label="文件过滤" style="flex: 1; margin-right: 12px;">
            <tiny-input v-model="form.fileFilter" placeholder="*.md（默认只索引 .md 文件）" />
          </tiny-form-item>
          <tiny-form-item label="分类" style="flex: 1; margin-right: 12px;">
            <tiny-input v-model="form.category" placeholder="如: data-dev / search / custom" />
          </tiny-form-item>
          <tiny-form-item label="图标" style="width: 140px;">
            <tiny-input v-model="form.icon" placeholder="emoji" />
          </tiny-form-item>
        </div>
        <div class="form-row">
          <tiny-form-item label="最大读取字符" style="flex: 1; margin-right: 12px;" title="AI读取单个文档时最多读取的字符数，防止超长文件耗尽token">
            <tiny-numeric v-model="form.maxReadLength" :min="1000" :step="1000" />
          </tiny-form-item>
          <tiny-form-item label="搜索结果上限" style="flex: 1;" title="搜索工具最多返回的匹配结果条数">
            <tiny-numeric v-model="form.maxSearchResults" :min="1" :max="50" />
          </tiny-form-item>
        </div>
        <div class="form-row">
          <tiny-form-item label="上下文行数" style="flex: 1; margin-right: 12px;" title="搜索命中某行时，同时返回该行前后各N行作为上下文">
            <tiny-numeric v-model="form.contextLines" :min="1" :max="20" />
          </tiny-form-item>
          <tiny-form-item label="排序权重" style="flex: 1;" title="多文档库时的排列优先级，数值越大越靠前">
            <tiny-numeric v-model="form.sortOrder" :min="0" />
          </tiny-form-item>
        </div>
        <div class="form-row">
          <tiny-form-item label="状态" style="flex: 1;">
            <tiny-switch v-model="form.statusBool" active-text="启用" inactive-text="禁用" />
          </tiny-form-item>
        </div>
      </tiny-form>
      <template #footer>
        <tiny-button @click="dialogVisible = false">取消</tiny-button>
        <tiny-button type="primary" @click="saveLibrary" :loading="saving">保存</tiny-button>
      </template>
    </tiny-dialog-box>

    <!-- 上传 ZIP 文档弹窗 -->
    <tiny-dialog-box
      v-model:visible="uploadDialogVisible"
      :title="`上传文档：${uploadTarget?.displayName || ''}`"
      width="520px"
    >
      <div class="upload-zone">
        <input ref="uploadZipRef" type="file" accept=".zip" style="display:none" @change="onZipFileChange" />
        <div class="upload-hint">
          <p>上传 ZIP 压缩包，内含的文档文件将解压到文档库目录下。</p>
          <p>建议 ZIP 内直接包含 .md 文件，目录结构将原样保留。</p>
        </div>
        <div v-if="selectedZipFile" class="selected-file">
          已选择：{{ selectedZipFile.name }}（{{ (selectedZipFile.size / 1024).toFixed(1) }} KB）
        </div>
        <tiny-button @click="triggerZipSelect" style="margin-top: 12px;">选择 ZIP 文件</tiny-button>
      </div>
      <template #footer>
        <tiny-button @click="uploadDialogVisible = false">取消</tiny-button>
        <tiny-button type="primary" @click="doUploadZip" :loading="uploading" :disabled="!selectedZipFile">上传并解压</tiny-button>
      </template>
    </tiny-dialog-box>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, reactive, computed } from 'vue'
import {
  Button as TinyButton,
  DialogBox as TinyDialogBox,
  Form as TinyForm,
  FormItem as TinyFormItem,
  Input as TinyInput,
  Numeric as TinyInputNumber,
  Select as TinySelect,
  Option as TinyOption,
  Switch as TinySwitch,
  Modal
} from '@opentiny/vue'
import { AiDocLibraryApi } from '@/api/doc-library'
import Breadcrumb from '@/components/breadcrumb/index.vue'

const loading = ref(false)
const saving = ref(false)
const uploading = ref(false)
const libraries = ref<any[]>([])
const filterCategory = ref('')
const filterKeyword = ref('')
const filterStatus = ref<number | undefined>(undefined)

// ==================== 计算 ====================
const categoryList = computed(() => {
  const map: Record<string, number> = {}
  libraries.value.forEach(lib => {
    const cat = lib.category || '未分类'
    map[cat] = (map[cat] || 0) + 1
  })
  return Object.entries(map).map(([name, count]) => ({ name, count }))
})

const filteredLibraries = computed(() => {
  let list = libraries.value
  if (filterCategory.value) {
    list = list.filter(l => (l.category || '未分类') === filterCategory.value)
  }
  if (filterKeyword.value) {
    const kw = filterKeyword.value.toLowerCase()
    list = list.filter(l =>
      (l.name || '').toLowerCase().includes(kw) ||
      (l.displayName || '').toLowerCase().includes(kw)
    )
  }
  if (filterStatus.value !== undefined && filterStatus.value !== null) {
    list = list.filter(l => l.status === filterStatus.value)
  }
  return list
})

// ==================== 加载 ====================
const loadLibraries = async () => {
  loading.value = true
  try {
    const res: any = await AiDocLibraryApi.list()
    libraries.value = res.data || []
  } finally {
    loading.value = false
  }
}

// ==================== 新增/编辑弹窗 ====================
const dialogVisible = ref(false)
const formRef = ref()
const form = reactive<any>({
  id: null,
  name: '',
  displayName: '',
  description: '',
  docPath: '',
  fileFilter: '*.md',
  maxReadLength: 8000,
  maxSearchResults: 10,
  contextLines: 5,
  category: 'custom',
  icon: '📚',
  status: 1,
  sortOrder: 0,
  statusBool: true
})

const resetForm = () => {
  Object.assign(form, {
    id: null,
    name: '',
    displayName: '',
    description: '',
    docPath: '',
    fileFilter: '*.md',
    maxReadLength: 8000,
    maxSearchResults: 10,
    contextLines: 5,
    category: 'custom',
    icon: '📚',
    status: 1,
    sortOrder: 0,
    statusBool: true
  })
}

const openCreateDialog = () => {
  resetForm()
  dialogVisible.value = true
}

const openEditDialog = (lib: any) => {
  Object.assign(form, {
    id: lib.id,
    name: lib.name,
    displayName: lib.displayName,
    description: lib.description || '',
    docPath: lib.docPath,
    fileFilter: lib.fileFilter || '*.md',
    maxReadLength: lib.maxReadLength || 8000,
    maxSearchResults: lib.maxSearchResults || 10,
    contextLines: lib.contextLines || 5,
    category: lib.category || 'custom',
    icon: lib.icon || '📚',
    status: lib.status,
    sortOrder: lib.sortOrder || 0,
    statusBool: lib.status === 1
  })
  dialogVisible.value = true
}

const saveLibrary = async () => {
  if (!form.name?.trim()) {
    Modal.message({ message: '标识名不能为空', status: 'warning' })
    return
  }
  if (!form.docPath?.trim()) {
    Modal.message({ message: '文档目录路径不能为空', status: 'warning' })
    return
  }
  saving.value = true
  try {
    const payload = {
      id: form.id || undefined,
      name: form.name.trim(),
      displayName: form.displayName?.trim() || form.name.trim(),
      description: form.description?.trim(),
      docPath: form.docPath.trim(),
      fileFilter: form.fileFilter || '*.md',
      maxReadLength: form.maxReadLength,
      maxSearchResults: form.maxSearchResults,
      contextLines: form.contextLines,
      category: form.category || 'custom',
      icon: form.icon || '📚',
      status: form.statusBool ? 1 : 0,
      sortOrder: form.sortOrder || 0
    }
    if (form.id) {
      await AiDocLibraryApi.update(payload)
    } else {
      await AiDocLibraryApi.save(payload)
    }
    Modal.message({ message: '保存成功', status: 'success' })
    dialogVisible.value = false
    await loadLibraries()
  } catch {
    Modal.message({ message: '保存失败', status: 'error' })
  } finally {
    saving.value = false
  }
}

// ==================== 状态切换 ====================
const toggleStatus = async (lib: any) => {
  try {
    await AiDocLibraryApi.update({ id: lib.id, status: lib.status })
    Modal.message({ message: lib.status === 1 ? '已启用' : '已禁用', status: 'success' })
  } catch {
    lib.status = lib.status === 1 ? 0 : 1
    Modal.message({ message: '操作失败', status: 'error' })
  }
}

// ==================== 连通测试 / 刷新计数 ====================
const testConnect = async (lib: any) => {
  try {
    const res: any = await AiDocLibraryApi.testConnect(lib.id)
    const result = res.data
    if (result?.success) {
      Modal.message({ message: `连通正常，共 ${result.fileCount} 个文档`, status: 'success' })
    } else {
      Modal.message({ message: result?.message || '连通失败', status: 'warning' })
    }
  } catch {
    Modal.message({ message: '测试失败', status: 'error' })
  }
}

const refreshCount = async (lib: any) => {
  try {
    const res: any = await AiDocLibraryApi.refreshFileCount(lib.id)
    lib.fileCount = res.data
    Modal.message({ message: `已刷新：${res.data} 个文档`, status: 'success' })
  } catch {
    Modal.message({ message: '刷新失败', status: 'error' })
  }
}

// ==================== 删除 ====================
const confirmDelete = (lib: any) => {
  Modal.confirm({
    message: `确认删除文档库「${lib.displayName || lib.name}」？目录下的文件不会被删除。`,
    title: '删除确认'
  }).then(async (res: any) => {
    if (res === 'confirm') {
      try {
        await AiDocLibraryApi.delete(lib.id)
        Modal.message({ message: '删除成功', status: 'success' })
        await loadLibraries()
      } catch {
        Modal.message({ message: '删除失败', status: 'error' })
      }
    }
  })
}

// ==================== 上传 ZIP ====================
const uploadDialogVisible = ref(false)
const uploadTarget = ref<any>(null)
const uploadZipRef = ref<HTMLInputElement>()
const selectedZipFile = ref<File | null>(null)

const openUploadDialog = (lib: any) => {
  uploadTarget.value = lib
  selectedZipFile.value = null
  uploadDialogVisible.value = true
}

const triggerZipSelect = () => {
  uploadZipRef.value?.click()
}

const onZipFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement
  selectedZipFile.value = input.files?.[0] || null
}

const doUploadZip = async () => {
  if (!selectedZipFile.value || !uploadTarget.value) return
  uploading.value = true
  try {
    const res: any = await AiDocLibraryApi.uploadDocs(uploadTarget.value.id, selectedZipFile.value)
    const count = res.data ?? 0
    Modal.message({ message: `上传成功，解压了 ${count} 个文件`, status: 'success' })
    uploadDialogVisible.value = false
    await loadLibraries()
  } catch {
    Modal.message({ message: '上传失败', status: 'error' })
  } finally {
    uploading.value = false
  }
}

onMounted(loadLibraries)
</script>

<style scoped>
.doc-library-page {
  padding: 16px 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}
.doc-lib-body {
  flex: 1;
  display: flex;
  gap: 16px;
  min-height: 0;
}

/* 左侧分类面板 */
.category-panel {
  width: 170px;
  flex-shrink: 0;
  background: #fff;
  border-radius: 8px;
  padding: 12px 0;
  border: 1px solid #e5e7eb;
}
.category-title {
  padding: 0 16px 8px;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
}
.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 16px;
  cursor: pointer;
  font-size: 13px;
  color: #374151;
  transition: background 0.15s;
}
.category-item:hover { background: #f3f4f6; }
.category-item.active { background: #eff6ff; color: #2563eb; font-weight: 500; }
.category-count {
  font-size: 11px;
  color: #9ca3af;
  background: #f3f4f6;
  border-radius: 10px;
  padding: 1px 7px;
}

/* 右侧主区域 */
.doc-lib-main {
  flex: 1;
  min-width: 0;
}
.toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}

/* 卡片网格 */
.doc-lib-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 14px;
}
.doc-lib-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 16px;
  transition: box-shadow 0.2s;
}
.doc-lib-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
.doc-lib-card.disabled { opacity: 0.55; }

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}
.card-icon { font-size: 26px; }
.card-title-area { flex: 1; min-width: 0; }
.card-title {
  display: block;
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.card-name {
  display: block;
  font-size: 11px;
  color: #9ca3af;
  margin-top: 2px;
}
.card-desc {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 10px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}
.tag {
  display: inline-block;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  background: #f3f4f6;
  color: #6b7280;
}
.tag-category { background: #eff6ff; color: #2563eb; }
.tag-path { background: #f0fdf4; color: #16a34a; }
.tag-count { background: #fef3c7; color: #d97706; }

.card-actions {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.empty-tip, .loading-tip {
  text-align: center;
  padding: 60px 0;
  color: #9ca3af;
  font-size: 14px;
}

/* 表单行 */
.form-row {
  display: flex;
  gap: 0;
}
.tip-text {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 4px;
}

/* 上传弹窗 */
.upload-zone {
  padding: 20px;
  text-align: center;
}
.upload-hint {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.8;
  margin-bottom: 12px;
}
.upload-hint p { margin: 0; }
.selected-file {
  margin-top: 8px;
  padding: 8px 16px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 6px;
  font-size: 13px;
  color: #166534;
}
</style>
