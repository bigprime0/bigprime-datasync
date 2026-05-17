<template>
  <div class="manual-lineage-page">
    <!-- 顶部操作栏 -->
    <div class="toolbar">
      <tiny-button type="primary" @click="handleAddRelation">
        <template #icon><IconPlus /></template>
        新建血缘关系
      </tiny-button>
      <tiny-button type="success" @click="handleImport">
        <template #icon><IconUpload /></template>
        批量导入
      </tiny-button>
      <tiny-button @click="handleDownloadTemplate">
        <template #icon><IconDownload /></template>
        下载模板
      </tiny-button>
      <tiny-button @click="loadRelations">
        <template #icon><IconRefresh /></template>
        刷新
      </tiny-button>
    </div>

    <!-- 筛选器 -->
    <tiny-card class="filter-card">
      <tiny-form :model="filterForm" inline label-width="110px" style="margin-bottom: -25px">
        <tiny-form-item label="源节点类型">
          <tiny-select v-model="filterForm.sourceType" placeholder="全部">
            <tiny-option label="全部" value="" />
            <tiny-option label="数据源" value="DATASOURCE" />
            <tiny-option label="表" value="TABLE" />
            <tiny-option label="字段" value="COLUMN" />
          </tiny-select>
        </tiny-form-item>

        <tiny-form-item label="目标节点类型">
          <tiny-select v-model="filterForm.targetType" placeholder="全部">
            <tiny-option label="全部" value="" />
            <tiny-option label="数据源" value="DATASOURCE" />
            <tiny-option label="表" value="TABLE" />
            <tiny-option label="字段" value="COLUMN" />
          </tiny-select>
        </tiny-form-item>

        <tiny-form-item label="血缘类型">
          <tiny-select v-model="filterForm.lineageType" placeholder="全部" style="width: 120px">
            <tiny-option label="全部" value="" />
            <tiny-option label="读取" value="READ" />
            <tiny-option label="写入" value="WRITE" />
            <tiny-option label="转换" value="TRANSFORM" />
          </tiny-select>
        </tiny-form-item>

        <tiny-form-item>
          <tiny-button type="primary" @click="handleFilter">查询</tiny-button>
          <tiny-button @click="handleResetFilter" style="margin-left: 8px">重置</tiny-button>
        </tiny-form-item>
      </tiny-form>
    </tiny-card>

    <!-- 血缘关系列表 -->
    <tiny-card class="relation-list-card">
      <tiny-grid :data="relationList" :loading="loading" :height="tableHeight">
        <tiny-grid-column field="sourceNodeName" title="源节点" />
        <tiny-grid-column field="sourceType" title="源节点类型">
          <template #default="{ row }">
            <tiny-tag :type="getNodeTypeColor(row.sourceType)">
              {{ getNodeTypeName(row.sourceType) }}
            </tiny-tag>
          </template>
        </tiny-grid-column>
        <tiny-grid-column field="targetNodeName" title="目标节点" />
        <tiny-grid-column field="targetType" title="目标节点类型">
          <template #default="{ row }">
            <tiny-tag :type="getNodeTypeColor(row.targetType)">
              {{ getNodeTypeName(row.targetType) }}
            </tiny-tag>
          </template>
        </tiny-grid-column>
        <tiny-grid-column field="lineageType" title="血缘类型" width="120">
          <template #default="{ row }">
            <tiny-tag :type="getLineageTypeColor(row.lineageType)">
              {{ row.lineageType }}
            </tiny-tag>
          </template>
        </tiny-grid-column>
        <tiny-grid-column field="lineageSource" title="来源" width="120" />
        <tiny-grid-column field="createTime" title="创建时间" width="180" align="center" />
        <tiny-grid-column title="操作" width="150">
          <template #default="{ row }">
            <div style="display: flex; gap: 10px; justify-content: center; align-items: center;">
              <div title="编辑">
                <tiny-icon-edit
                  @click="handleEditRelation(row)"
                  style="font-size: 20px; cursor: pointer; fill: #52c41a; color: #52c41a;"
                />
              </div>
              <div title="删除">
                <tiny-icon-del
                  @click="handleDeleteRelation(row)"
                  style="font-size: 20px; cursor: pointer; fill: #f56c6c; color: #f56c6c;"
                />
              </div>
            </div>
          </template>
        </tiny-grid-column>
      </tiny-grid>
    </tiny-card>

    <!-- 新建/编辑血缘关系弹窗 -->
    <tiny-modal v-model="dialogVisible" :title="dialogTitle" width="800px" show-header show-footer>
      <template #default>
        <div style="padding: 20px 0">
          <tiny-alert type="info" :closable="false" style="margin-bottom: 20px">
            <template #description> 请先确保源节点和目标节点已存在，否则将自动创建 </template>
          </tiny-alert>

          <tiny-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
            <tiny-divider content-position="left" style="padding: 10px">源节点</tiny-divider>

            <tiny-form-item label="节点类型" prop="sourceType">
              <tiny-radio-group v-model="formData.sourceType">
                <tiny-radio label="DATASOURCE">数据源</tiny-radio>
                <tiny-radio label="TABLE">表</tiny-radio>
                <tiny-radio label="COLUMN">字段</tiny-radio>
              </tiny-radio-group>
            </tiny-form-item>

            <tiny-form-item
              v-if="formData.sourceType === 'DATASOURCE'"
              label="名称"
              prop="sourceDatasourceName"
            >
              <tiny-input v-model="formData.sourceDatasourceName" placeholder="请输入数据源名称" />
            </tiny-form-item>

            <tiny-form-item
              v-if="formData.sourceType === 'TABLE'"
              label="表名"
              prop="sourceTableName"
            >
              <tiny-input v-model="formData.sourceTableName" placeholder="schema.table" />
            </tiny-form-item>

            <tiny-form-item
              v-if="formData.sourceType === 'COLUMN'"
              label="字段名"
              prop="sourceColumnName"
            >
              <tiny-input v-model="formData.sourceColumnName" placeholder="table.column" />
            </tiny-form-item>

            <tiny-divider content-position="left" style="padding: 10px">目标节点</tiny-divider>

            <tiny-form-item label="节点类型" prop="targetType">
              <tiny-radio-group v-model="formData.targetType">
                <tiny-radio label="DATASOURCE">数据源</tiny-radio>
                <tiny-radio label="TABLE">表</tiny-radio>
                <tiny-radio label="COLUMN">字段</tiny-radio>
              </tiny-radio-group>
            </tiny-form-item>

            <tiny-form-item
              v-if="formData.targetType === 'DATASOURCE'"
              label="名称"
              prop="targetDatasourceName"
            >
              <tiny-input v-model="formData.targetDatasourceName" placeholder="请输入数据源名称" />
            </tiny-form-item>

            <tiny-form-item
              v-if="formData.targetType === 'TABLE'"
              label="表名"
              prop="targetTableName"
            >
              <tiny-input v-model="formData.targetTableName" placeholder="schema.table" />
            </tiny-form-item>

            <tiny-form-item
              v-if="formData.targetType === 'COLUMN'"
              label="字段名"
              prop="targetColumnName"
            >
              <tiny-input v-model="formData.targetColumnName" placeholder="table.column" />
            </tiny-form-item>

            <tiny-divider content-position="left" style="padding: 10px">血缘关系</tiny-divider>

            <tiny-form-item label="血缘类型" prop="lineageType">
              <tiny-radio-group v-model="formData.lineageType">
                <tiny-radio label="READ">读取</tiny-radio>
                <tiny-radio label="WRITE">写入</tiny-radio>
                <tiny-radio label="TRANSFORM">转换</tiny-radio>
              </tiny-radio-group>
            </tiny-form-item>

            <tiny-form-item label="转换规则" prop="transformRule">
              <tiny-input
                v-model="formData.transformRule"
                type="textarea"
                :rows="3"
                placeholder="选填：转换规则描述"
              />
            </tiny-form-item>
          </tiny-form>
        </div>
      </template>

      <template #footer>
        <div style="text-align: right; padding: 10px 20px">
          <tiny-button @click="dialogVisible = false">取消</tiny-button>
          <tiny-button @click="resetForm" style="margin-left: 8px">重置</tiny-button>
          <tiny-button type="primary" @click="handleConfirm" style="margin-left: 8px">{{
            isEdit ? '更新' : '保存'
          }}</tiny-button>
        </div>
      </template>
    </tiny-modal>

    <!-- 批量导入弹窗 -->
    <tiny-modal v-model="importDialogVisible" title="批量导入血缘关系" width="600px" show-header show-footer>
      <template #default>
        <div style="padding: 20px 0">
          <tiny-alert type="info" :closable="false" style="margin-bottom: 20px">
            <template #description>
              支持Excel(.xlsx)和JSON(.json)格式文件导入，请先下载模板填写数据
            </template>
          </tiny-alert>

          <tiny-form label-width="100px">
            <tiny-form-item label="导入格式">
              <tiny-radio-group v-model="importType">
                <tiny-radio label="excel">Excel格式</tiny-radio>
                <tiny-radio label="json">JSON格式</tiny-radio>
              </tiny-radio-group>
            </tiny-form-item>

            <tiny-form-item label="选择文件">
              <input
                ref="importFileInput"
                type="file"
                :accept="importType === 'excel' ? '.xlsx,.xls' : '.json'"
                @change="handleFileChange"
                style="width: 100%"
              />
            </tiny-form-item>
          </tiny-form>
        </div>
      </template>

      <template #footer>
        <div style="text-align: right; padding: 10px 20px">
          <tiny-button @click="importDialogVisible = false" :disabled="uploading">取消</tiny-button>
          <tiny-button type="primary" @click="() => importFileInput.click()" :loading="uploading" style="margin-left: 8px">
            {{ uploading ? '导入中...' : '选择文件' }}
          </tiny-button>
        </div>
      </template>
    </tiny-modal>

    <!-- 下载模板选择弹窗 -->
    <tiny-modal v-model="templateDialogVisible" title="下载模板" width="400px" show-header show-footer>
      <template #default>
        <div style="padding: 20px 0">
          <tiny-alert type="info" :closable="false" style="margin-bottom: 20px">
            <template #description>
              请选择要下载的模板类型
            </template>
          </tiny-alert>

          <div style="display: flex; flex-direction: column; gap: 12px">
            <tiny-button type="primary" @click="downloadExcelTemplate" style="width: 100%; height: 40px">
              Excel模板 (.xlsx)
            </tiny-button>
            <tiny-button type="success" @click="downloadJsonTemplate" style="width: 100%; height: 40px; margin-left: 0px;">
              JSON模板 (.json)
            </tiny-button>
          </div>
        </div>
      </template>

      <template #footer>
        <div style="text-align: right; padding: 10px 20px">
          <tiny-button @click="templateDialogVisible = false">取消</tiny-button>
        </div>
      </template>
    </tiny-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import {
  Card as TinyCard,
  Button as TinyButton,
  Grid as TinyGrid,
  GridColumn as TinyGridColumn,
  Tag as TinyTag,
  Modal as TinyModal,
  Form as TinyForm,
  FormItem as TinyFormItem,
  Input as TinyInput,
  Select as TinySelect,
  Option as TinyOption,
  RadioGroup as TinyRadioGroup,
  Radio as TinyRadio,
  Divider as TinyDivider,
  Alert as TinyAlert
} from '@opentiny/vue'
import { Modal } from '@opentiny/vue'
import { IconPlus, IconRefresh, IconUpload, IconDownload, iconEdit, iconDel } from '@opentiny/vue-icon'
import request from '@/utils/request'
import { PageUtils } from '@/utils/page'
import * as XLSX from 'xlsx'

const TinyIconEdit = iconEdit()
const TinyIconDel = iconDel()

const loading = ref(false)
const relationList = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('新建血缘关系')
const formRef = ref(null)
const isEdit = ref(false)
const tableHeight = ref(500)
const importDialogVisible = ref(false)
const importType = ref('excel') // excel 或 json
const importFileInput = ref(null)
const uploading = ref(false)
const templateDialogVisible = ref(false)
// 筛选表单
const filterForm = reactive({
  sourceType: '',
  targetType: '',
  lineageType: ''
})

// 表单数据
const formData = reactive({
  id: null,
  sourceType: 'TABLE',
  sourceDatasourceName: '',
  sourceTableName: '',
  sourceColumnName: '',
  targetType: 'TABLE',
  targetDatasourceName: '',
  targetTableName: '',
  targetColumnName: '',
  lineageType: 'WRITE',
  transformRule: ''
})

// 表单验证
const formRules = {
  sourceType: [{ required: true, message: '请选择源节点类型', trigger: 'change' }],
  targetType: [{ required: true, message: '请选择目标节点类型', trigger: 'change' }],
  lineageType: [{ required: true, message: '请选择血缘类型', trigger: 'change' }]
}

// 加载血缘关系列表
const loadRelations = async () => {
  loading.value = true
  try {
    const response = await request({
      url: '/api/lineage/manual/relation/list',
      method: 'get',
      params: filterForm
    })
    // 血缘接口返回 { code: 0, data: [...] }
    relationList.value = (response.code === 0 && response.data) ? response.data : []
  } catch (error) {
    console.error('加载失败:', error)
    relationList.value = []
  } finally {
    loading.value = false
  }
}

// 新建血缘关系
const handleAddRelation = () => {
  isEdit.value = false
  dialogTitle.value = '新建血缘关系'
  resetForm()
  dialogVisible.value = true
}

// 编辑血缘关系
const handleEditRelation = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑血缘关系'
  Object.assign(formData, row)
  dialogVisible.value = true
}

// 删除血缘关系
const handleDeleteRelation = async (row) => {
  try {
    await Modal.confirm({
      message: '确定要删除该血缘关系吗？',
      title: '提示',
      status: 'warning'
    })

    await request({
      url: `/api/lineage/manual/relation/${row.id}`,
      method: 'delete'
    })

    Modal.message({ message: '删除成功', status: 'success' })
    loadRelations()
  } catch (error) {
    if (error !== 'cancel') {
      Modal.message({ message: '删除失败', status: 'error' })
    }
  }
}

// 筛选
const handleFilter = () => {
  loadRelations()
}

// 重置筛选
const handleResetFilter = () => {
  Object.assign(filterForm, {
    sourceType: '',
    targetType: '',
    lineageType: ''
  })
  loadRelations()
}

// 确认
const handleConfirm = async () => {
  try {
    await formRef.value.validate()

    if (isEdit.value) {
      await request({
        url: '/api/lineage/manual/relation/update',
        method: 'post',
        data: formData
      })
      Modal.message({ message: '更新成功', status: 'success' })
    } else {
      await request({
        url: '/api/lineage/manual/relation/create',
        method: 'post',
        data: formData
      })
      Modal.message({ message: '创建成功', status: 'success' })
    }

    dialogVisible.value = false
    loadRelations()
  } catch (error) {
    console.error('保存失败:', error)
  }
}

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    id: null,
    sourceType: 'TABLE',
    sourceDatasourceName: '',
    sourceTableName: '',
    sourceColumnName: '',
    targetType: 'TABLE',
    targetDatasourceName: '',
    targetTableName: '',
    targetColumnName: '',
    lineageType: 'WRITE',
    transformRule: ''
  })
}

// 辅助方法
const getNodeTypeName = (type) => {
  const map = {
    DATASOURCE: '数据源',
    TABLE: '表',
    COLUMN: '字段'
  }
  return map[type] || type
}

const getNodeTypeColor = (type) => {
  const map = {
    DATASOURCE: 'info',
    TABLE: 'success',
    COLUMN: 'warning'
  }
  return map[type] || 'default'
}

const getLineageTypeColor = (type) => {
  const map = {
    READ: 'info',
    WRITE: 'danger',
    TRANSFORM: 'warning'
  }
  return map[type] || 'default'
}

// 批量导入
const handleImport = () => {
  importDialogVisible.value = true
}

// 选择导入文件
const handleFileChange = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  uploading.value = true
  try {
    let data = []
    
    if (importType.value === 'excel') {
      // 解析Excel文件
      data = await parseExcelFile(file)
    } else {
      // 解析JSON文件
      data = await parseJsonFile(file)
    }

    // 提交批量导入
    await request({
      url: '/api/lineage/manual/relation/batch-import',
      method: 'post',
      data: { relations: data }
    })

    Modal.message({ message: `成功导入 ${data.length} 条血缘关系`, status: 'success' })
    importDialogVisible.value = false
    loadRelations()
  } catch (error) {
    console.error('导入失败:', error)
    Modal.message({ message: '导入失败: ' + (error.message || '未知错误'), status: 'error' })
  } finally {
    uploading.value = false
    if (importFileInput.value) {
      importFileInput.value.value = ''
    }
  }
}

// 解析Excel文件
const parseExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const json = XLSX.utils.sheet_to_json(worksheet)
        
        // 转换为标准格式
        const relations = json.map(row => ({
          sourceType: row['源节点类型'] || row.sourceType,
          sourceDatasourceName: row['源数据源名称'] || row.sourceDatasourceName,
          sourceTableName: row['源表名'] || row.sourceTableName,
          sourceColumnName: row['源字段名'] || row.sourceColumnName,
          targetType: row['目标节点类型'] || row.targetType,
          targetDatasourceName: row['目标数据源名称'] || row.targetDatasourceName,
          targetTableName: row['目标表名'] || row.targetTableName,
          targetColumnName: row['目标字段名'] || row.targetColumnName,
          lineageType: row['血缘类型'] || row.lineageType,
          transformRule: row['转换规则'] || row.transformRule || ''
        }))
        
        resolve(relations)
      } catch (error) {
        reject(new Error('Excel解析失败: ' + error.message))
      }
    }
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsArrayBuffer(file)
  })
}

// 解析JSON文件
const parseJsonFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result)
        resolve(Array.isArray(json) ? json : [json])
      } catch (error) {
        reject(new Error('JSON解析失败: ' + error.message))
      }
    }
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsText(file)
  })
}

// 下载模板
const handleDownloadTemplate = () => {
  templateDialogVisible.value = true
}

// 下载Excel模板
const downloadExcelTemplate = () => {
  const template = [
    {
      '源节点类型': 'TABLE',
      '源数据源名称': 'MySQL-Source',
      '源表名': 'db.users',
      '源字段名': '',
      '目标节点类型': 'TABLE',
      '目标数据源名称': 'PostgreSQL-Target',
      '目标表名': 'public.user_info',
      '目标字段名': '',
      '血缘类型': 'WRITE',
      '转换规则': ''
    },
    {
      '源节点类型': 'COLUMN',
      '源数据源名称': '',
      '源表名': '',
      '源字段名': 'users.id',
      '目标节点类型': 'COLUMN',
      '目标数据源名称': '',
      '目标表名': '',
      '目标字段名': 'user_info.user_id',
      '血缘类型': 'TRANSFORM',
      '转换规则': 'CAST(id AS VARCHAR)'
    }
  ]
  
  const ws = XLSX.utils.json_to_sheet(template)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '血缘关系')
  XLSX.writeFile(wb, '血缘关系导入模板.xlsx')
  
  templateDialogVisible.value = false
  Modal.message({ message: 'Excel模板下载成功', status: 'success' })
}

// 下载JSON模板
const downloadJsonTemplate = () => {
  const template = [
    {
      sourceType: 'TABLE',
      sourceDatasourceName: 'MySQL-Source',
      sourceTableName: 'db.users',
      sourceColumnName: '',
      targetType: 'TABLE',
      targetDatasourceName: 'PostgreSQL-Target',
      targetTableName: 'public.user_info',
      targetColumnName: '',
      lineageType: 'WRITE',
      transformRule: ''
    },
    {
      sourceType: 'COLUMN',
      sourceDatasourceName: '',
      sourceTableName: '',
      sourceColumnName: 'users.id',
      targetType: 'COLUMN',
      targetDatasourceName: '',
      targetTableName: '',
      targetColumnName: 'user_info.user_id',
      lineageType: 'TRANSFORM',
      transformRule: 'CAST(id AS VARCHAR)'
    }
  ]
  
  const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = '血缘关系导入模板.json'
  a.click()
  URL.revokeObjectURL(url)
  
  templateDialogVisible.value = false
  Modal.message({ message: 'JSON模板下载成功', status: 'success' })
}

onMounted(() => {
  loadRelations()
  tableHeight.value = PageUtils.setTableHeight(310)
})
</script>

<style scoped lang="less">
.manual-lineage-page {
  padding: 5px;

  // 覆盖 TinyVue Card 的默认宽度限制
  :deep(.tiny-card) {
    width: 100% !important;
  }

  .toolbar {
    margin-bottom: 16px;
    display: flex;
    gap: 8px;
  }

  .filter-card {
    margin-bottom: 16px;
  }

  .relation-list-card {
    :deep(.tiny-card__body) {
      padding: 0;
    }

    :deep(.tiny-card--logo) {
      padding: 0;
    }
  }
}
</style>
