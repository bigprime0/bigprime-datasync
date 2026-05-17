<template>
  <div class="container-list">
    <Breadcrumb :items="['协议网关', '读取规则']" />
    <div ref="contain" class="contain">
      <tiny-grid
        ref="gridRef"
        :data="gridData"
        :fit="true"
        :height="tableHeight"
        :loading="loading"
        :stripe="true"
        border
        highlight-hover-row
        show-header-overflow="tooltip"
        show-overflow="tooltip"
        size="small"
      >
        <template #toolbar>
          <tiny-grid-toolbar class="grid-toolbar" full-screen setting size="small">
            <template #buttons>
              <tiny-form :model="searchForm" inline>
                <tiny-form-item>
                  <tiny-numeric
                    v-model="searchForm.gatewayId"
                    :controls="false"
                    placeholder="网关ID"
                    style="width: 256px"
                  ></tiny-numeric>
                </tiny-form-item>
                <tiny-form-item>
                  <tiny-select
                    v-model="searchForm.enabled"
                    clearable
                    placeholder="状态"
                    @change="handlerSearch"
                  >
                    <tiny-option label="全部" :value="null"></tiny-option>
                    <tiny-option label="启用" :value="true"></tiny-option>
                    <tiny-option label="禁用" :value="false"></tiny-option>
                  </tiny-select>
                </tiny-form-item>
                <tiny-form-item>
                  <tiny-button size="small" type="primary" @click="handlerSearch">查询</tiny-button>
                  <tiny-button size="small" @click="handleRefresh">刷新</tiny-button>
                  <tiny-button size="small" type="success" @click="openCreateDialog">
                    创建规则
                  </tiny-button>
                </tiny-form-item>
              </tiny-form>
            </template>
          </tiny-grid-toolbar>
        </template>

        <tiny-grid-column type="index" width="50"></tiny-grid-column>

        <tiny-grid-column
          title="网关ID"
          field="gatewayId"
          align="center"
        ></tiny-grid-column>

        <tiny-grid-column title="规则名称" field="ruleName"></tiny-grid-column>

        <tiny-grid-column title="规则类型" field="ruleType" align="center">
          <template #default="data">
            <tiny-tag :type="getRuleTypeTagType(data.row.ruleType)">
              {{ getRuleTypeLabel(data.row.ruleType) }}
            </tiny-tag>
          </template>
        </tiny-grid-column>

        <tiny-grid-column title="规则配置" field="ruleConfig">
          <template #default="data">
            <div class="rule-config">{{ truncateText(data.row.ruleConfig, 50) }}</div>
          </template>
        </tiny-grid-column>

        <tiny-grid-column title="优先级" field="priority" align="center">
          <template #default="data">
            <tiny-badge :value="data.row.priority" type="info"></tiny-badge>
          </template>
        </tiny-grid-column>

        <tiny-grid-column title="启用状态" field="enabled" align="center">
          <template #default="data">
            <tiny-switch v-model="data.row.enabled" @change="handleToggle(data.row)"></tiny-switch>
          </template>
        </tiny-grid-column>

        <tiny-grid-column title="创建时间" field="createdTime" align="center">
          <template #default="data">
            {{ formatDateTime(data.row.createdTime) }}
          </template>
        </tiny-grid-column>

        <tiny-grid-column title="操作" align="center" width="120" fixed="right">
          <template v-slot="data">
            <div style="display: flex; gap: 10px; justify-content: center; align-items: center;">
              <div title="编辑">
                <tiny-icon-edit
                  @click="handleEditOp(data.row)"
                  style="font-size: 20px; cursor: pointer; fill: #52c41a; color: #52c41a;"
                />
              </div>
              <div title="详情">
                <tiny-icon-view
                  @click="handleViewOp(data.row)"
                  style="font-size: 20px; cursor: pointer; fill: #409eff; color: #409eff;"
                />
              </div>
              <div title="删除">
                <tiny-icon-del
                  @click="handleDeleteOp(data.row)"
                  style="font-size: 20px; cursor: pointer; fill: #f56c6c; color: #f56c6c;"
                />
              </div>
            </div>
          </template>
        </tiny-grid-column>
      </tiny-grid>
    </div>

    <!-- 创建/编辑对话框 -->
    <tiny-dialog-box
      v-model:visible="dialogVisible"
      :title="dialogTitle"
      width="700px"
    >
      <tiny-form :model="formData" :rules="formRules" ref="formRef" label-width="120px">
        <tiny-form-item label="网关" prop="gatewayId">
          <tiny-select
            v-model="formData.gatewayId"
            placeholder="请选择网关"
            filterable
          >
            <tiny-option
              v-for="gw in gatewayList"
              :key="gw.id"
              :value="gw.id"
              :label="gw.name"
            >
              <div class="gateway-option">
                <span>{{ gw.name }}</span>
                <tiny-tag
                  size="small"
                  :type="gw.status === 'RUNNING' ? 'success' : 'info'"
                >
                  {{ gw.status === 'RUNNING' ? '运行中' : '已停止' }}
                </tiny-tag>
              </div>
            </tiny-option>
          </tiny-select>
          <span class="tip">配置该网关的数据读取规则</span>
        </tiny-form-item>

        <tiny-form-item label="规则名称" prop="ruleName">
          <tiny-input v-model="formData.ruleName" placeholder="请输入规则名称"></tiny-input>
        </tiny-form-item>

        <tiny-form-item label="规则类型" prop="ruleType">
          <tiny-select v-model="formData.ruleType" placeholder="请选择规则类型">
            <tiny-option label="定时轮询" value="POLLING"></tiny-option>
            <tiny-option label="数据订阅" value="SUBSCRIBE"></tiny-option>
            <tiny-option label="事件触发" value="EVENT"></tiny-option>
            <tiny-option label="条件查询" value="CONDITION"></tiny-option>
          </tiny-select>
        </tiny-form-item>

        <tiny-form-item label="规则配置" prop="ruleConfig">
          <tiny-input
            v-model="formData.ruleConfig"
            type="textarea"
            :rows="6"
            placeholder='请输入规则配置（JSON格式）\n例如：{"interval": 5000, "address": "192.168.1.1"}'
          ></tiny-input>
        </tiny-form-item>

        <tiny-form-item label="优先级" prop="priority">
          <tiny-numeric
            v-model="formData.priority"
            :min="1"
            :max="100"
            placeholder="数字越小优先级越高"
          ></tiny-numeric>
        </tiny-form-item>

        <tiny-form-item label="启用状态">
          <tiny-switch v-model="formData.enabled"></tiny-switch>
        </tiny-form-item>

        <tiny-form-item label="描述">
          <tiny-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入规则描述"
          ></tiny-input>
        </tiny-form-item>
      </tiny-form>
      
      <template #footer>
        <tiny-button @click="dialogVisible = false">取消</tiny-button>
        <tiny-button type="primary" @click="handleConfirm">保存</tiny-button>
      </template>
    </tiny-dialog-box>

    <!-- 详情对话框 -->
    <tiny-dialog-box v-model:visible="detailDialogVisible" title="规则详情" width="700px">
      <div v-if="currentDetail" class="detail-container">
        <div class="detail-item">
          <span class="detail-label">规则ID:</span>
          <span class="detail-value">{{ currentDetail.id }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">网关ID:</span>
          <span class="detail-value">{{ currentDetail.gatewayId }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">规则名称:</span>
          <span class="detail-value">{{ currentDetail.ruleName }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">规则类型:</span>
          <tiny-tag :type="getRuleTypeTagType(currentDetail.ruleType)">
            {{ getRuleTypeLabel(currentDetail.ruleType) }}
          </tiny-tag>
        </div>
        <div class="detail-item">
          <span class="detail-label">优先级:</span>
          <span class="detail-value">{{ currentDetail.priority }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">启用状态:</span>
          <tiny-tag :type="currentDetail.enabled ? 'success' : 'info'">
            {{ currentDetail.enabled ? '启用' : '禁用' }}
          </tiny-tag>
        </div>
        <div class="detail-item full-width">
          <span class="detail-label">规则配置:</span>
          <pre class="detail-content">{{ formatJson(currentDetail.ruleConfig) }}</pre>
        </div>
        <div class="detail-item full-width">
          <span class="detail-label">描述:</span>
          <div class="detail-value">{{ currentDetail.description || '-' }}</div>
        </div>
        <div class="detail-item">
          <span class="detail-label">创建时间:</span>
          <span class="detail-value">{{ formatDateTime(currentDetail.createdTime) }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">更新时间:</span>
          <span class="detail-value">
            {{ currentDetail.updatedTime ? formatDateTime(currentDetail.updatedTime) : '-' }}
          </span>
        </div>
      </div>
    </tiny-dialog-box>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import {
  Grid as TinyGrid,
  Modal,
  Tag as TinyTag,
  Badge as TinyBadge,
  Button as TinyButton,
  Form as TinyForm,
  FormItem as TinyFormItem,
  GridColumn as TinyGridColumn,
  GridToolbar as TinyGridToolbar,
  Select as TinySelect,
  Option as TinyOption,
  Switch as TinySwitch,
  DialogBox as TinyDialogBox,
  Input as TinyInput,
  Numeric as TinyNumeric,
  TinyActionMenu
} from '@opentiny/vue'
import { iconDel, iconEdit, iconView } from '@opentiny/vue-icon'
import { formatDateTime } from '@/utils/date'
import { formPage } from '@/utils/tool'
import { PageUtils } from '@/utils/page'
import { ReadRuleService, GatewayService } from '@/services/gateway'

const TinyIconEdit = iconEdit()
const TinyIconView = iconView()
const TinyIconDel = iconDel()

const loading = ref(false)
const tableHeight = ref(600)
const gridData = ref([])
const gridRef = ref()
const formRef = ref()
const contain = ref()
const gatewayList = ref<any[]>([])

// 编辑操作
const handleEditOp = (row: any) => {
  handleEdit(row)
}

// 查看操作
const handleViewOp = (row: any) => {
  handleViewDetail(row)
}

// 删除操作
const handleDeleteOp = (row: any) => {
  handleDelete(row)
}

// 搜索表单
const searchForm = reactive({
  gatewayId: null,
  enabled: null
})

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('创建规则')
const detailDialogVisible = ref(false)
const currentDetail = ref(null)

// 表单数据
const formData = reactive({
  id: null,
  gatewayId: null,
  ruleName: '',
  ruleType: '',
  ruleConfig: '',
  priority: 10,
  enabled: true,
  description: ''
})

// 表单验证规则
const formRules = {
  gatewayId: [{ required: true, message: '请选择网关', trigger: 'change' }],
  ruleName: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
  ruleType: [{ required: true, message: '请选择规则类型', trigger: 'change' }],
  ruleConfig: [{ required: true, message: '请输入规则配置', trigger: 'blur' }],
  priority: [{ required: true, message: '请输入优先级', trigger: 'blur' }]
}

// 获取网关列表
const loadGateways = async () => {
  try {
    const res = await GatewayService.getAllGateways()
    if (res.code === 200 || res.code === 0) {
      gatewayList.value = res.data || []
    }
  } catch (error) {
    console.error('获取网关列表失败:', error)
  }
}

// 获取所有规则（不分页）
const getList = async () => {
  loading.value = true
  try {
    let data = []

    if (searchForm.gatewayId) {
      // 按网关ID查询
      const res = await ReadRuleService.getReadRulesByGatewayId(searchForm.gatewayId)
      if (res.code === 200) {
        data = res.data || []
      }
    } else {
      // 查询所有
      const res = await ReadRuleService.getAllReadRules()
      if (res.code === 200) {
        data = res.data || []
      }
    }

    // 前端过滤
    if (searchForm.enabled !== null) {
      data = data.filter((item: any) => item.enabled === searchForm.enabled)
    }

    // 按优先级排序
    data.sort((a: any, b: any) => a.priority - b.priority)

    gridData.value = data
  } catch (error) {
    console.error('获取规则列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handlerSearch = () => {
  getList()
}

// 刷新
const handleRefresh = () => {
  getList()
}

// 打开创建对话框
const openCreateDialog = () => {
  dialogTitle.value = '创建规则'
  resetFormData()
  dialogVisible.value = true
}

// 重置表单数据
const resetFormData = () => {
  formData.id = null
  formData.gatewayId = null
  formData.ruleName = ''
  formData.ruleType = ''
  formData.ruleConfig = ''
  formData.priority = 10
  formData.enabled = true
  formData.description = ''
}

// 编辑
const handleEdit = (row: any) => {
  dialogTitle.value = '编辑规则'
  Object.assign(formData, row)
  dialogVisible.value = true
}

// 确认
const handleConfirm = async () => {
  try {
    await formRef.value.validate()

    // 验证JSON格式
    try {
      JSON.parse(formData.ruleConfig)
    } catch (e) {
      Modal.message({ message: '规则配置必须是有效的JSON格式', status: 'error' })
      return
    }

    if (formData.id) {
      await ReadRuleService.updateReadRule(formData)
      Modal.message({ message: '更新成功', status: 'success' })
    } else {
      await ReadRuleService.createReadRule(formData)
      Modal.message({ message: '创建成功', status: 'success' })
    }

    dialogVisible.value = false
    getList()
  } catch (error) {
    console.error('操作失败:', error)
  }
}

// 启用/禁用切换
const handleToggle = async (row: any) => {
  try {
    await ReadRuleService.toggleReadRule(row.id, row.enabled)
    Modal.message({
      message: row.enabled ? '已启用' : '已禁用',
      status: 'success'
    })
  } catch (error) {
    row.enabled = !row.enabled
    Modal.message({ message: '切换失败', status: 'error' })
  }
}

// 查看详情
const handleViewDetail = (row: any) => {
  currentDetail.value = row
  detailDialogVisible.value = true
}

// 删除
const handleDelete = (row: any) => {
  Modal.confirm({
    message: `确定删除规则 "${row.ruleName}" 吗？`,
    status: 'warning'
  }).then(async () => {
    try {
      await ReadRuleService.deleteReadRule(row.id)
      Modal.message({ message: '删除成功', status: 'success' })
      getList()
    } catch (error) {
      Modal.message({ message: '删除失败', status: 'error' })
    }
  })
}

// 工具函数
const getRuleTypeTagType = (type: string) => {
  const map: any = {
    POLLING: 'primary',
    SUBSCRIBE: 'success',
    EVENT: 'warning',
    CONDITION: 'info'
  }
  return map[type] || 'info'
}

const getRuleTypeLabel = (type: string) => {
  const map: any = {
    POLLING: '定时轮询',
    SUBSCRIBE: '数据订阅',
    EVENT: '事件触发',
    CONDITION: '条件查询'
  }
  return map[type] || type
}

const truncateText = (text: string, length: number) => {
  if (!text) return '-'
  return text.length > length ? text.substring(0, length) + '...' : text
}

const formatJson = (jsonStr: string) => {
  try {
    const obj = JSON.parse(jsonStr)
    return JSON.stringify(obj, null, 2)
  } catch (e) {
    return jsonStr
  }
}

onMounted(() => {
  getList()
  loadGateways()
  // 计算表格高度
  PageUtils.setTableHeight(null)
})
</script>

<style scoped>
.container-list {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.contain {
  flex: 1 1 auto;
  margin: 8px 10px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 0 8px 8px rgba(169, 174, 184, 0.05);
  padding: 10px;
}

.rule-config {
  font-size: 12px;
  color: #666;
  word-break: break-all;
}

.detail-container {
  padding: 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-label {
  font-weight: bold;
  color: #666;
  font-size: 14px;
}

.detail-value {
  color: #333;
  font-size: 14px;
}

.detail-content {
  background: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.6;
  max-height: 300px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

.gateway-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.tip {
  margin-left: 10px;
  font-size: 12px;
  color: #909399;
}
</style>
