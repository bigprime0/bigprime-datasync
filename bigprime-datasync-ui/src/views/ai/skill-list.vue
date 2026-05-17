<template>
  <div class="skill-list-page">
    <!-- 页面标题栏 -->
    <div class="page-header">
      <span class="page-title">技能管理</span>
      <div class="page-actions">
        <input ref="importFileRef" type="file" accept=".zip" style="display:none" @change="onImportFileChange" />
        <tiny-button @click="triggerImport" :loading="importing">从 ZIP 导入</tiny-button>
        <tiny-button type="primary" @click="openCreateDialog">新建技能</tiny-button>
      </div>
    </div>

    <!-- 主体左右布局 -->
    <div class="skill-body">
      <!-- 左侧分类面板 -->
      <div class="category-panel">
        <div class="category-title">分类过滤</div>
        <div
          class="category-item"
          :class="{ active: filterCategory === '' }"
          @click="filterCategory = ''; loadSkills()"
        >
          <span>全部</span>
          <span class="category-count">{{ skills.length }}</span>
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
      <div class="skill-main">
        <!-- 搜索工具栏 -->
        <div class="toolbar">
          <tiny-input
            v-model="filterKeyword"
            placeholder="搜索技能名称/标识"
            clearable
            style="width: 200px;"
          />
          <tiny-select
            v-model="filterSourceType"
            placeholder="全部来源"
            clearable
            style="width: 120px; margin-left: 8px;"
          >
            <tiny-option label="ZIP 导入" value="IMPORTED" />
            <tiny-option label="在线编写" value="CUSTOM" />
            <tiny-option label="系统预置" value="BUILTIN" />
          </tiny-select>
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

        <!-- 技能卡片列表 -->
        <div v-if="!loading && filteredSkills.length > 0" class="skill-grid">
          <div
            v-for="skill in filteredSkills"
            :key="skill.id"
            class="skill-card"
            :class="{ disabled: skill.status === 0 }"
          >
            <div class="card-header">
              <span class="card-icon">{{ skill.icon || '📦' }}</span>
              <div class="card-title-area">
                <span class="card-title">{{ skill.displayName || skill.name }}</span>
                <span class="card-name">{{ skill.name }}</span>
              </div>
              <tiny-switch
                v-model="skill.status"
                :true-value="1"
                :false-value="0"
                @change="toggleStatus(skill)"
              />
            </div>
            <div class="card-desc">{{ skill.description || '暂无描述' }}</div>
            <div class="card-meta">
              <span v-if="skill.category" class="tag tag-category">{{ skill.category }}</span>
              <span class="tag" :class="sourceTagClass(skill.sourceType)">
                {{ sourceLabel(skill.sourceType) }}
              </span>
              <span v-if="skill.hasReferences === 1" class="tag tag-ref">📁 references</span>
              <span v-if="skill.hasScripts === 1" class="tag tag-script">📜 scripts</span>
            </div>
            <div class="card-actions">
              <tiny-button size="mini" plain @click="openEditDialog(skill)">编辑</tiny-button>
              <tiny-button size="mini" plain @click="openFilesDialog(skill)">
                附件
              </tiny-button>
              <tiny-button size="mini" plain type="danger" @click="confirmDelete(skill)">删除</tiny-button>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else-if="!loading" class="empty-tip">
          暂无技能，请点击「新建技能」或「从 ZIP 导入」添加
        </div>

        <!-- 加载中 -->
        <div v-if="loading" class="loading-tip">加载中...</div>
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <tiny-dialog-box
      v-model:visible="dialogVisible"
      :title="form.id ? '编辑技能' : '新增技能'"
      width="860px"
      :destroy-on-close="true"
    >
      <tiny-form :model="form" label-width="100px" :rules="rules" ref="formRef">
        <!-- 基本信息 -->
        <div class="form-row">
          <tiny-form-item label="技能标识" prop="name" style="flex: 1; margin-right: 12px;">
            <tiny-input v-model="form.name" placeholder="如: seatunnel-dev（全局唯一）" :disabled="!!form.id" />
          </tiny-form-item>
          <tiny-form-item label="显示名称" prop="displayName" style="flex: 1;">
            <tiny-input v-model="form.displayName" placeholder="如: SeaTunnel 开发助手" />
          </tiny-form-item>
        </div>
        <tiny-form-item label="描述">
          <tiny-input v-model="form.description" type="textarea" :rows="2"
            placeholder="向用户和 LLM 展示的功能说明" />
        </tiny-form-item>
        <div class="form-row">
          <tiny-form-item label="分类" style="flex: 1; margin-right: 12px;">
            <tiny-input v-model="form.category" placeholder="如: data-dev / search / custom" />
          </tiny-form-item>
          <tiny-form-item label="标签" style="flex: 1; margin-right: 12px;">
            <tiny-input v-model="form.tags" placeholder="逗号分隔，如: SeaTunnel,ETL" />
          </tiny-form-item>
          <tiny-form-item label="图标" style="width: 160px;">
            <tiny-input v-model="form.icon" placeholder="emoji 或 URL" />
          </tiny-form-item>
        </div>
        <div class="form-row">
          <tiny-form-item label="版本号" style="flex: 1; margin-right: 12px;">
            <tiny-input v-model="form.version" placeholder="1.0.0" />
          </tiny-form-item>
          <tiny-form-item label="排序权重" style="flex: 1; margin-right: 12px;">
            <tiny-numeric v-model="form.sortOrder" :min="0" style="width: 100%;" />
          </tiny-form-item>
          <tiny-form-item label="状态" style="flex: 1;">
            <tiny-switch v-model="form.statusBool" active-text="启用" inactive-text="禁用" />
          </tiny-form-item>
        </div>

        <!-- SKILL.md 编辑器 -->
        <tiny-form-item label="SKILL.md" prop="skillMd">
          <div class="skill-md-editor">
            <div class="editor-hint">
              SKILL.md 将注入助手 System Prompt。建议以 YAML frontmatter 开头（name/description/category），正文为 Markdown 格式的行为规范。
            </div>
            <tiny-input
              v-model="form.skillMd"
              type="textarea"
              :rows="16"
              placeholder="---&#10;name: my-skill&#10;description: 我的技能描述&#10;category: custom&#10;version: 1.0.0&#10;---&#10;&#10;# 技能规范&#10;&#10;在这里编写注入 System Prompt 的行为规范..."
              style="font-family: monospace; font-size: 13px;"
            />
          </div>
        </tiny-form-item>
      </tiny-form>
      <template #footer>
        <tiny-button @click="dialogVisible = false">取消</tiny-button>
        <tiny-button type="primary" @click="saveSkill" :loading="saving">保存</tiny-button>
      </template>
    </tiny-dialog-box>

    <!-- 附件文件弹窗 -->
    <tiny-dialog-box
      v-model:visible="filesDialogVisible"
      :title="`附件文件：${currentSkill?.displayName}`"
      width="900px"
      :body-style="{ padding: '0' }"
    >
      <div class="files-panel">
        <!-- 左侧目录树 -->
        <div class="files-tree-panel">
          <div class="files-tree-header">
            <div class="files-tree-title-row">
              <span>目录结构</span>
              <div class="files-tree-actions">
                <input ref="uploadFileRef" type="file" style="display:none" @change="onUploadFileChange" />
                <button class="icon-btn" title="新建文件" @click="openNewFileDialog">➕</button>
                <button class="icon-btn" title="上传文件" @click="triggerUploadFile">⬆️</button>
              </div>
            </div>
            <div class="tree-type-tabs">
              <span
                v-for="t in ['ALL', 'REFERENCE', 'SCRIPT', 'ASSET']" :key="t"
                class="tree-tab"
                :class="{ active: fileTypeFilter === t }"
                @click="switchFileType(t)"
              >{{ fileTypeLabel(t) }}</span>
            </div>
          </div>
          <div class="files-tree-body">
            <div v-if="!filteredFiles.length" class="tree-empty">暂无文件</div>
            <div v-else>
              <div
                v-for="node in fileTreeNodes" :key="node.path"
                class="tree-node"
                :class="{ 'tree-dir': node.isDir, 'tree-file': !node.isDir, 'tree-selected': selectedFilePath === node.path }"
                :style="{ paddingLeft: (node.depth * 14 + 8) + 'px' }"
                @click="!node.isDir && selectFile(node)"
              >
                <span class="tree-icon">{{ node.isDir ? '📁' : getFileIcon(node.name) }}</span>
                <span class="tree-name" :title="node.name">{{ node.name }}</span>
              </div>
            </div>
          </div>
        </div>
        <!-- 右侧内容预览 -->
        <div class="files-content-panel">
          <div class="files-content-header" v-if="selectedFilePath">
            <span class="content-path">{{ selectedFilePath }}</span>
            <span class="tag" :class="fileTypeClass(selectedFileType)">{{ selectedFileType }}</span>
            <div class="content-actions" v-if="selectedFileId">
              <button class="icon-btn" :title="editingFile ? '保存' : '编辑'" @click="toggleEditFile">
                {{ editingFile ? '💾' : '✏️' }}
              </button>
              <button class="icon-btn" title="删除文件" @click="confirmDeleteFile">🗑️</button>
            </div>
          </div>
          <div class="files-content-body">
            <div v-if="!selectedFilePath" class="content-placeholder">← 点击左侧文件查看内容</div>
            <div v-else-if="previewLoading" class="content-placeholder">加载中...</div>
            <textarea
              v-else
              class="content-textarea"
              :value="previewContent"
              :readonly="!editingFile"
              @input="onFileContentInput"
            />
          </div>
        </div>
      </div>
      <template #footer>
        <tiny-button @click="filesDialogVisible = false">关闭</tiny-button>
      </template>
    </tiny-dialog-box>

    <!-- 新建文件弹窗 -->
    <tiny-dialog-box
      v-model:visible="newFileDialogVisible"
      title="新建文件"
      width="460px"
    >
      <tiny-form label-width="90px">
        <tiny-form-item label="文件路径">
          <tiny-input v-model="newFilePath" placeholder="如 references/connector-guide.md" />
        </tiny-form-item>
        <tiny-form-item label="文件类型">
          <tiny-select v-model="newFileFileType">
            <tiny-option label="参考文档 (REFERENCE)" value="REFERENCE" />
            <tiny-option label="脚本 (SCRIPT)" value="SCRIPT" />
            <tiny-option label="静态资源 (ASSET)" value="ASSET" />
          </tiny-select>
        </tiny-form-item>
      </tiny-form>
      <template #footer>
        <tiny-button @click="newFileDialogVisible = false">取消</tiny-button>
        <tiny-button type="primary" @click="createNewFile" :loading="newFileSaving">创建</tiny-button>
      </template>
    </tiny-dialog-box>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  Button as TinyButton,
  ButtonGroup as TinyButtonGroup,
  DialogBox as TinyDialogBox,
  Form as TinyForm,
  FormItem as TinyFormItem,
  Input as TinyInput,
  Numeric as TinyNumeric,
  Select as TinySelect,
  Option as TinyOption,
  Switch as TinySwitch,
  Grid as TinyGrid,
  GridColumn as TinyGridColumn,
  Modal,
  Message as TinyMessage
} from '@opentiny/vue'
import { AiSkillApi } from '@/api/skill'

// ==================== 列表状态 ====================
const loading = ref(false)
const skills = ref<any[]>([])
const filterKeyword = ref('')
const filterSourceType = ref('')
const filterStatus = ref<number | ''>('')
const filterCategory = ref('')

/** 左侧分类面板：计算各 category 及其数量 */
const categoryList = computed(() => {
  const map = new Map<string, number>()
  for (const s of skills.value) {
    const cat = s.category || ''
    map.set(cat, (map.get(cat) || 0) + 1)
  }
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }))
})

const filteredSkills = computed(() => {
  let list = skills.value
  if (filterCategory.value) {
    list = list.filter(s => (s.category || '') === filterCategory.value)
  }
  if (filterSourceType.value) {
    list = list.filter(s => s.sourceType === filterSourceType.value)
  }
  if (filterStatus.value !== '') {
    list = list.filter(s => s.status === filterStatus.value)
  }
  if (filterKeyword.value) {
    const kw = filterKeyword.value.toLowerCase()
    list = list.filter(s =>
      (s.name || '').toLowerCase().includes(kw) ||
      (s.displayName || '').toLowerCase().includes(kw)
    )
  }
  return list
})

async function loadSkills() {
  loading.value = true
  try {
    const res: any = await AiSkillApi.list({})
    // 拦截器对 code===0 返回完整对象，对非0 reject；此处兼容两种情况
    if (res && res.code === 0) {
      skills.value = res.data || []
    } else if (Array.isArray(res)) {
      // 防止拦截器直接解包 data 数组的情况
      skills.value = res
    } else {
      skills.value = []
    }
  } catch (e) {
    console.error('[loadSkills] 加载技能列表失败', e)
    skills.value = []
  } finally {
    loading.value = false
  }
}

// ==================== 新增/编辑弹窗 ====================
const dialogVisible = ref(false)
const saving = ref(false)
const formRef = ref<any>()

const form = ref<any>({
  id: null,
  name: '',
  displayName: '',
  description: '',
  skillMd: '',
  category: 'custom',
  tags: '',
  sourceType: 'CUSTOM',
  version: '1.0.0',
  icon: '📦',
  isPublic: 0,
  statusBool: true,
  sortOrder: 0
})

const rules = {
  name: [{ required: true, message: '请输入技能标识', trigger: 'blur' }],
  displayName: [{ required: true, message: '请输入显示名称', trigger: 'blur' }]
}

function openCreateDialog() {
  form.value = {
    id: null, name: '', displayName: '', description: '',
    skillMd: '', category: 'custom', tags: '', sourceType: 'CUSTOM',
    version: '1.0.0', icon: '📦', isPublic: 0, statusBool: true, sortOrder: 0
  }
  dialogVisible.value = true
}

function openEditDialog(row: any) {
  form.value = {
    ...row,
    statusBool: row.status === 1
  }
  dialogVisible.value = true
}

async function saveSkill() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }
  saving.value = true
  try {
    const payload = {
      ...form.value,
      status: form.value.statusBool ? 1 : 0
    }
    delete payload.statusBool
    const res: any = await AiSkillApi.save(payload)
    if (res.code === 0) {
      TinyMessage.success('保存成功')
      dialogVisible.value = false
      await loadSkills()
    } else {
      TinyMessage.error(res.msg || '保存失败')
    }
  } catch (e) {
    TinyMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

// ==================== 状态切换 ====================
async function toggleStatus(skill: any) {
  try {
    const res: any = await AiSkillApi.save({ id: skill.id, name: skill.name, status: skill.status })
    if (res.code === 0) {
      TinyMessage.success(skill.status === 1 ? '已启用' : '已禁用')
    } else {
      // 回滚
      skill.status = skill.status === 1 ? 0 : 1
      TinyMessage.error(res.msg || '操作失败')
    }
  } catch {
    skill.status = skill.status === 1 ? 0 : 1
    TinyMessage.error('操作失败')
  }
}

// ==================== 删除 ====================
function confirmDelete(skill: any) {
  Modal.confirm({
    title: '确认删除',
    message: `确认删除技能「${skill.displayName || skill.name}」？删除后其附件文件也将一并删除。`
  }).then(async (action: string) => {
    if (action !== 'confirm') return
    try {
      await AiSkillApi.delete(skill.id)
      // delete 接口成功后拦截器直接 resolve（code===0），失败则 reject 进 catch
      TinyMessage.success('删除成功')
      await loadSkills()
      // 如果当前分类已没有数据，自动重置为「全部」
      if (filterCategory.value && !skills.value.some(s => s.category === filterCategory.value)) {
        filterCategory.value = ''
      }
    } catch {
      TinyMessage.error('删除失败')
    }
  })
}

// ==================== ZIP 导入 ====================
const importFileRef = ref<HTMLInputElement | null>(null)
const importing = ref(false)

function triggerImport() {
  importFileRef.value?.click()
}

async function onImportFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  importing.value = true
  let imported = false
  try {
    const res: any = await AiSkillApi.importZip(file)
    if (res && res.code === 0) {
      const ids: string[] = res.data || []
      TinyMessage.success(`导入成功，共导入 ${ids.length} 个技能`)
      imported = true
    } else {
      TinyMessage.error((res && res.msg) || '导入失败')
    }
  } catch (err: any) {
    const msg = err?.response?.data?.msg || err?.message || '导入失败，请检查 ZIP 格式（需含 SKILL.md）'
    TinyMessage.error(msg)
  } finally {
    importing.value = false
    if (importFileRef.value) importFileRef.value.value = ''
    // 只要有导入操作就刷新列表（无论成功失败都刷新，因为部分技能可能已入库）
    if (imported) {
      filterCategory.value = '' // 导入后重置分类以确保新技能可见
      await loadSkills()
    }
  }
}

// ==================== 附件文件弹窗 ====================
const filesDialogVisible = ref(false)
const currentSkill = ref<any>(null)
const skillFiles = ref<any[]>([])
const fileTypeFilter = ref('ALL')
const selectedFilePath = ref('')
const selectedFileType = ref('')
const selectedFileId = ref('')
const previewLoading = ref(false)
const previewContent = ref('')
const editingFile = ref(false)
const editingContent = ref('')

const filteredFiles = computed(() => {
  if (fileTypeFilter.value === 'ALL') return skillFiles.value
  return skillFiles.value.filter(f => f.fileType === fileTypeFilter.value)
})

/** 将文件列表构建目录树节点（支持任意层级） */
const fileTreeNodes = computed(() => {
  const files = filteredFiles.value
  const dirSet = new Set<string>()
  const nodes: Array<{ path: string; name: string; depth: number; isDir: boolean; fileType: string }> = []

  // 收集所有目录
  for (const f of files) {
    const parts = (f.filePath as string).split('/')
    for (let i = 1; i < parts.length; i++) {
      dirSet.add(parts.slice(0, i).join('/'))
    }
  }

  // 排序：目录优先，同层按名称升序
  const sorted = [...files].sort((a, b) => {
    const ap = (a.filePath as string).split('/')
    const bp = (b.filePath as string).split('/')
    // 先按目录层级排序
    const aDir = ap.slice(0, -1).join('/')
    const bDir = bp.slice(0, -1).join('/')
    if (aDir !== bDir) return aDir.localeCompare(bDir)
    return (a.filePath as string).localeCompare(b.filePath)
  })

  // 构建已渲染的目录集合，避免重复
  const renderedDirs = new Set<string>()
  for (const f of sorted) {
    const parts = (f.filePath as string).split('/')
    // 插入父目录
    for (let i = 1; i < parts.length; i++) {
      const dirPath = parts.slice(0, i).join('/')
      if (!renderedDirs.has(dirPath)) {
        renderedDirs.add(dirPath)
        nodes.push({ path: dirPath, name: parts[i - 1], depth: i - 1, isDir: true, fileType: '' })
      }
    }
    // 插入文件
    nodes.push({
      path: f.filePath,
      name: parts[parts.length - 1],
      depth: parts.length - 1,
      isDir: false,
      fileType: f.fileType
    })
  }
  return nodes
})

async function openFilesDialog(skill: any) {
  currentSkill.value = skill
  fileTypeFilter.value = 'ALL'
  selectedFilePath.value = ''
  selectedFileType.value = ''
  previewContent.value = ''
  try {
    const res: any = await AiSkillApi.listFiles(skill.id)
    if (res.code === 0) {
      skillFiles.value = res.data || []
    } else {
      TinyMessage.error(res.msg || '加载附件失败')
      skillFiles.value = []
    }
  } catch {
    TinyMessage.error('加载附件失败')
    skillFiles.value = []
  }
  filesDialogVisible.value = true
}

async function selectFile(node: { path: string; fileType: string }) {
  if (!currentSkill.value) return
  // 如果正在编辑，先取消编辑
  editingFile.value = false
  selectedFilePath.value = node.path
  selectedFileType.value = node.fileType
  // 查找对应的文件记录 ID
  const found = skillFiles.value.find(f => f.filePath === node.path)
  selectedFileId.value = found ? found.id : ''
  previewLoading.value = true
  previewContent.value = ''
  try {
    const res: any = await AiSkillApi.readFileContent(currentSkill.value.id, node.path)
    previewContent.value = res.code === 0 ? (res.data || '（空文件）') : `加载失败: ${res.msg}`
  } catch {
    previewContent.value = '加载失败'
  } finally {
    previewLoading.value = false
  }
}

function switchFileType(type: string) {
  fileTypeFilter.value = type
  selectedFilePath.value = ''
  selectedFileId.value = ''
  previewContent.value = ''
  editingFile.value = false
}

// ==================== 文件编辑 ====================

function onFileContentInput(e: Event) {
  editingContent.value = (e.target as HTMLTextAreaElement).value
}

async function toggleEditFile() {
  if (!selectedFileId.value) return
  if (editingFile.value) {
    // 保存编辑
    try {
      const res: any = await AiSkillApi.updateFileContent(selectedFileId.value, editingContent.value)
      if (res.code === 0) {
        TinyMessage.success('保存成功')
        previewContent.value = editingContent.value
        editingFile.value = false
      } else {
        TinyMessage.error(res.msg || '保存失败')
      }
    } catch {
      TinyMessage.error('保存失败')
    }
  } else {
    // 进入编辑模式
    editingContent.value = previewContent.value
    editingFile.value = true
  }
}

function confirmDeleteFile() {
  if (!selectedFileId.value) return
  Modal.confirm({
    title: '确认删除',
    message: `确认删除文件「${selectedFilePath.value}」？此操作不可撤销。`
  }).then(async (action: string) => {
    if (action !== 'confirm') return
    try {
      await AiSkillApi.deleteFile(selectedFileId.value)
      TinyMessage.success('删除成功')
      selectedFilePath.value = ''
      selectedFileId.value = ''
      previewContent.value = ''
      editingFile.value = false
      // 刷新文件列表
      await reloadFiles()
    } catch {
      TinyMessage.error('删除失败')
    }
  })
}

// ==================== 新建文件 ====================
const newFileDialogVisible = ref(false)
const newFilePath = ref('references/')
const newFileFileType = ref('REFERENCE')
const newFileSaving = ref(false)

function openNewFileDialog() {
  newFilePath.value = 'references/'
  newFileFileType.value = 'REFERENCE'
  newFileDialogVisible.value = true
}

async function createNewFile() {
  if (!currentSkill.value || !newFilePath.value.trim()) {
    TinyMessage.error('请输入文件路径')
    return
  }
  const trimmedPath = newFilePath.value.trim()
  if (trimmedPath.endsWith('/')) {
    TinyMessage.error('文件路径不能以 / 结尾，请输入完整文件名（如 references/guide.md）')
    return
  }
  const lastSegment = trimmedPath.split('/').pop()
  if (!lastSegment || !lastSegment.includes('.')) {
    TinyMessage.error('文件名需包含扩展名（如 .md、.txt）')
    return
  }
  newFileSaving.value = true
  try {
    const res: any = await AiSkillApi.saveFile(currentSkill.value.id, trimmedPath, '')
    if (res.code === 0) {
      TinyMessage.success('创建成功')
      newFileDialogVisible.value = false
      await reloadFiles()
      // 自动选中新建的文件
      selectedFilePath.value = trimmedPath
      const found = skillFiles.value.find(f => f.filePath === trimmedPath)
      if (found) {
        selectedFileId.value = found.id
        selectedFileType.value = found.fileType
      }
      previewContent.value = ''
    } else {
      TinyMessage.error(res.msg || '创建失败')
    }
  } catch {
    TinyMessage.error('创建失败')
  } finally {
    newFileSaving.value = false
  }
}

// ==================== 上传文件 ====================
const uploadFileRef = ref<HTMLInputElement | null>(null)

function triggerUploadFile() {
  uploadFileRef.value?.click()
}

async function onUploadFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file || !currentSkill.value) return
  try {
    const res: any = await AiSkillApi.uploadFile(currentSkill.value.id, file)
    if (res && res.code === 0) {
      TinyMessage.success('上传成功')
      await reloadFiles()
    } else {
      TinyMessage.error((res && res.msg) || '上传失败')
    }
  } catch (err: any) {
    TinyMessage.error(err?.response?.data?.msg || '上传失败')
  } finally {
    if (uploadFileRef.value) uploadFileRef.value.value = ''
  }
}

// ==================== 文件列表刷新 ====================

async function reloadFiles() {
  if (!currentSkill.value) return
  try {
    const res: any = await AiSkillApi.listFiles(currentSkill.value.id)
    if (res.code === 0) {
      skillFiles.value = res.data || []
    }
  } catch {
    // ignore
  }
}

function fileTypeLabel(type: string) {
  const map: Record<string, string> = {
    ALL: '全部', REFERENCE: '参考文档', SCRIPT: '脚本', ASSET: '静态资源'
  }
  return map[type] || type
}

function fileTypeClass(type: string) {
  const map: Record<string, string> = {
    REFERENCE: 'tag-primary', SCRIPT: 'tag-warning', ASSET: 'tag-info'
  }
  return map[type] || 'tag-info'
}

function getFileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() || ''
  const iconMap: Record<string, string> = {
    md: '📝', txt: '📝', json: '📦', yaml: '⚙️', yml: '⚙️',
    py: '🐍', js: '🟡', ts: '🟡', sh: '💻', sql: '🗄️'
  }
  return iconMap[ext] || '📄'
}

function formatSize(bytes: number) {
  if (!bytes) return '-'
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`
}

// ==================== 工具函数 ====================
function sourceTagClass(sourceType: string) {
  const map: Record<string, string> = {
    IMPORTED: 'tag-primary', CUSTOM: 'tag-success', BUILTIN: 'tag-warning'
  }
  return map[sourceType] || 'tag-info'
}

function sourceLabel(sourceType: string) {
  const map: Record<string, string> = {
    IMPORTED: 'ZIP导入', CUSTOM: '在线编写', BUILTIN: '系统预置'
  }
  return map[sourceType] || sourceType
}

onMounted(() => loadSkills())
</script>

<style scoped>
.skill-list-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0;
  overflow: hidden;
}

/* 页面标题栏 */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
  background: #fff;
}
.page-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}
.page-actions {
  display: flex;
  gap: 8px;
}

/* 主体左右布局 */
.skill-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* 左侧分类面板 */
.category-panel {
  width: 160px;
  flex-shrink: 0;
  border-right: 1px solid #e4e7ed;
  background: #fafafa;
  overflow-y: auto;
  padding: 8px 0;
}
.category-title {
  font-size: 11px;
  font-weight: 600;
  color: #909399;
  padding: 4px 14px 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.category-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 7px 14px;
  font-size: 13px;
  color: #606266;
  cursor: pointer;
  border-radius: 0;
  transition: background 0.15s;
}
.category-item:hover {
  background: #f0f4ff;
  color: #3b82f6;
}
.category-item.active {
  background: #eff6ff;
  color: #1d4ed8;
  font-weight: 600;
  border-right: 2px solid #3b82f6;
}
.category-count {
  font-size: 11px;
  background: #e4e7ed;
  color: #606266;
  padding: 1px 6px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
}
.category-item.active .category-count {
  background: #bfdbfe;
  color: #1d4ed8;
}

/* 右侧内容区 */
.skill-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 12px 16px;
}

/* 搜索工具栏 */
.toolbar {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  flex-shrink: 0;
  gap: 0;
}

/* 技能卡片网格 */
.skill-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
  overflow-y: auto;
  align-content: start;
}

.skill-card {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 14px 16px;
  transition: box-shadow 0.2s;
}
.skill-card:hover { box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08); }
.skill-card.disabled { opacity: 0.55; }

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.card-icon { font-size: 24px; flex-shrink: 0; }
.card-title-area { flex: 1; min-width: 0; }
.card-title { display: block; font-size: 14px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.card-name { display: block; font-size: 11px; color: #909399; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.card-desc {
  font-size: 12px;
  color: #606266;
  line-height: 1.5;
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 10px;
}

.card-actions {
  display: flex;
  gap: 6px;
}

/* 空状态 */
.empty-tip {
  text-align: center;
  padding: 60px 0;
  color: #909399;
  font-size: 14px;
}
.loading-tip {
  text-align: center;
  padding: 40px 0;
  color: #c0c4cc;
}

/* 表单行 */
.form-row { display: flex; align-items: flex-start; }

/* SKILL.md 编辑器 */
.skill-md-editor { width: 100%; }
.editor-hint {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
  line-height: 1.5;
  background: #f8f9fa;
  padding: 6px 10px;
  border-radius: 4px;
}

/* 附件弹窗双栏布局 */
.files-panel {
  display: flex;
  height: 500px;
  overflow: hidden;
}

/* 左侧目录树 */
.files-tree-panel {
  width: 260px;
  flex-shrink: 0;
  border-right: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  background: #fafafa;
}
.files-tree-header {
  padding: 10px 12px 6px;
  font-size: 12px;
  font-weight: 600;
  color: #303133;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.files-tree-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.files-tree-actions {
  display: flex;
  gap: 4px;
}
.icon-btn {
  border: none;
  background: none;
  cursor: pointer;
  font-size: 14px;
  padding: 2px 4px;
  border-radius: 4px;
  transition: background 0.15s;
}
.icon-btn:hover {
  background: #e8f0fe;
}
.tree-type-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.tree-tab {
  font-size: 11px;
  padding: 1px 7px;
  border-radius: 10px;
  cursor: pointer;
  color: #606266;
  background: #f0f0f0;
  font-weight: 400;
  transition: all 0.15s;
}
.tree-tab.active {
  background: #3b82f6;
  color: #fff;
}
.files-tree-body {
  flex: 1;
  overflow-y: auto;
  padding: 6px 0;
}
.tree-empty {
  text-align: center;
  padding: 40px 0;
  color: #c0c4cc;
  font-size: 13px;
}
.tree-node {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 8px;
  cursor: default;
  border-radius: 4px;
  margin: 1px 4px;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
}
.tree-file {
  cursor: pointer;
}
.tree-file:hover {
  background: #e8f0fe;
}
.tree-selected {
  background: #dbeafe !important;
  color: #1d4ed8;
  font-weight: 500;
}
.tree-dir {
  color: #606266;
  font-weight: 600;
  font-size: 12px;
  margin-top: 4px;
}
.tree-icon { flex-shrink: 0; font-size: 13px; }
.tree-name { flex: 1; overflow: hidden; text-overflow: ellipsis; }

/* 右侧预览 */
.files-content-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.files-content-header {
  padding: 8px 14px;
  border-bottom: 1px solid #e4e7ed;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  flex-shrink: 0;
}
.content-path {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #303133;
  font-family: monospace;
}
.content-actions {
  display: flex;
  gap: 4px;
}
.files-content-body {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.content-placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c0c4cc;
  font-size: 13px;
}
.content-textarea {
  flex: 1;
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  resize: none;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 12px;
  line-height: 1.6;
  padding: 12px 14px;
  color: #303133;
  background: #fff;
  box-sizing: border-box;
}
.content-textarea:not([readonly]) {
  background: #fffef0;
  border: 2px solid #f59e0b;
  border-radius: 4px;
}

/* 附件文件工具栏 */
.files-toolbar { display: flex; align-items: center; }

/* Tag 标签 */
.tag {
  display: inline-block;
  padding: 1px 7px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}
.tag-primary  { background: #dbeafe; color: #1d4ed8; }
.tag-success  { background: #dcfce7; color: #15803d; }
.tag-warning  { background: #fef3c7; color: #92400e; }
.tag-danger   { background: #fee2e2; color: #b91c1c; }
.tag-info     { background: #f3f4f6; color: #374151; }
.tag-category { background: #f0f4ff; color: #4f46e5; }
.tag-ref      { background: #ecfdf5; color: #065f46; }
.tag-script   { background: #fffbeb; color: #92400e; }
</style>
