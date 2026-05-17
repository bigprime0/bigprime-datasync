<template>
  <div class="container-list">
    <Breadcrumb :items="['协议网关管理']" />
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
                  <tiny-search
                    v-model="searchForm.name"
                    clearable
                    is-enter-search
                    placeholder="请输入网关名称"
                    @search="handlerSearch"
                    style="width: 256px"
                  ></tiny-search>
                </tiny-form-item>
                <tiny-form-item>
                  <tiny-select
                    v-model="searchForm.status"
                    clearable
                    placeholder="运行状态"
                    @change="handlerSearch"
                  >
                    <tiny-option label="全部" value=""></tiny-option>
                    <tiny-option label="运行中" value="RUNNING"></tiny-option>
                    <tiny-option label="已停止" value="STOPPED"></tiny-option>
                    <tiny-option label="错误" value="ERROR"></tiny-option>
                  </tiny-select>
                </tiny-form-item>
                <tiny-form-item>
                  <tiny-button size="small" type="primary" @click="openCreateDialog"
                    >创建网关</tiny-button
                  >
                  <tiny-button size="small" @click="handleRefresh">刷新</tiny-button>
                </tiny-form-item>
              </tiny-form>
            </template>
          </tiny-grid-toolbar>
        </template>

        <tiny-grid-column type="index" width="50"></tiny-grid-column>

        <tiny-grid-column title="网关名称" field="name" ></tiny-grid-column>

        <tiny-grid-column title="连接器" field="sourceConnectorName" >
          <template #default="data">
            <span>{{ data.row.sourceConnectorName || '-' }}</span>
          </template>
        </tiny-grid-column>

        <tiny-grid-column title="Kafka主题" field="kafkaTopic"></tiny-grid-column>

        <tiny-grid-column title="运行状态" field="status" align="center" width="100">
          <template #default="data">
            <tiny-tag :type="getStatusTagType(data.row.status)">
              {{ getStatusLabel(data.row.status) }}
            </tiny-tag>
          </template>
        </tiny-grid-column>

        <tiny-grid-column title="消息数" field="messageCount" align="right" width="120">
          <template #default="data">
            {{ formatNumber(data.row.messageCount) }}
          </template>
        </tiny-grid-column>

        <tiny-grid-column title="错误数" field="errorCount" align="right" width="100">
          <template #default="data">
            <span :style="{ color: data.row.errorCount > 0 ? '#f56c6c' : '#67c23a' }">
              {{ formatNumber(data.row.errorCount) }}
            </span>
          </template>
        </tiny-grid-column>

        <tiny-grid-column title="错误率" align="center" width="80">
          <template #default="data">
            {{ calculateErrorRate(data.row.messageCount, data.row.errorCount) }}
          </template>
        </tiny-grid-column>

        <tiny-grid-column title="自动启动" field="autoStart" align="center" width="100">
          <template #default="data">
            <tiny-switch
              v-model="data.row.autoStart"
              @change="handleAutoStartChange(data.row)"
            ></tiny-switch>
          </template>
        </tiny-grid-column>

        <tiny-grid-column title="创建时间" field="createdTime" align="center" width="170">
          <template #default="data">
            {{ formatDateTime(data.row.createdTime) }}
          </template>
        </tiny-grid-column>

        <tiny-grid-column title="操作" align="center" width="170" fixed="right">
          <template v-slot="data">
            <div style="display: flex; gap: 10px; justify-content: center; align-items: center;">
              <div v-if="data.row.status === 'STOPPED' || data.row.status === 'ERROR'" title="启动">
                <tiny-icon-start-circle
                  @click="handleStart(data.row)"
                  style="font-size: 20px; cursor: pointer; fill: #52c41a; color: #52c41a;"
                />
              </div>
              <div v-if="data.row.status === 'RUNNING'" title="停止">
                <tiny-icon-stop
                  @click="handleStop(data.row)"
                  style="font-size: 20px; cursor: pointer; fill: #faad14; color: #faad14;"
                />
              </div>
              <div title="统计">
                <tiny-icon-pie-chart
                  @click="handleViewStatistics(data.row)"
                  style="font-size: 20px; cursor: pointer; fill: #409eff; color: #409eff;"
                />
              </div>
              <div title="编辑">
                <tiny-icon-edit
                  @click="handleEdit(data.row)"
                  style="font-size: 20px; cursor: pointer; fill: #52c41a; color: #52c41a;"
                />
              </div>
              <div title="删除">
                <tiny-icon-del
                  @click="handleDelete(data.row)"
                  style="font-size: 20px; cursor: pointer; fill: #f56c6c; color: #f56c6c;"
                />
              </div>
            </div>
          </template>
        </tiny-grid-column>
      </tiny-grid>

      <tiny-pager
        :align="formPage.align"
        :current-page="formPage.page"
        :layout="formPage.layout"
        :page-size="formPage.limit"
        :page-sizes="formPage.pageSizes"
        :total="formPage.total"
        @current-change="pageChange"
        @size-change="limitChange"
      ></tiny-pager>
    </div>

    <!-- 创建/编辑对话框 -->
    <tiny-dialog-box
      v-model:visible="dialogVisible"
      :title="dialogTitle"
      width="800px"
    >
      <tiny-form :model="formData" :rules="formRules" ref="formRef" label-width="140px">
        <tiny-form-item label="网关名称" prop="name">
          <tiny-input v-model="formData.name" placeholder="请输入网关名称"></tiny-input>
        </tiny-form-item>

        <tiny-form-item label="源连接器" prop="sourceConnectorId">
          <tiny-select
            v-model="formData.sourceConnectorId"
            placeholder="请选择源连接器"
            filterable
          >
            <tiny-option
              v-for="conn in sourceConnectors"
              :key="conn.id"
              :value="conn.id"
              :label="conn.name"
            >
              <div class="connector-option">
                <span>{{ conn.name }}</span>
                <tiny-tag
                  size="small"
                  :type="conn.status === 'CONNECTED' ? 'success' : 'info'"
                >
                  {{ conn.product }}
                </tiny-tag>
              </div>
            </tiny-option>
          </tiny-select>
          <span class="tip">连接器已配置协议连接参数,网关只需选择</span>
        </tiny-form-item>

        <tiny-form-item label="字段映射">
          <tiny-button size="small" @click="openFieldMapping">配置字段映射</tiny-button>
          <span class="tip">已配置 {{ Object.keys(formData.fieldMapping || {}).length }} 个映射</span>
        </tiny-form-item>

        <tiny-form-item label="Kafka连接器" prop="kafkaConnectorId">
          <tiny-select
            v-model="formData.kafkaConnectorId"
            placeholder="请选择Kafka连接器"
            filterable
          >
            <tiny-option
              v-for="conn in kafkaConnectors"
              :key="conn.id"
              :value="conn.id"
              :label="conn.name"
            >
              <div class="connector-option">
                <span>{{ conn.name }}</span>
                <tiny-tag
                  size="small"
                  :type="conn.status === 'CONNECTED' ? 'success' : 'info'"
                >
                  {{ conn.product }}
                </tiny-tag>
              </div>
            </tiny-option>
          </tiny-select>
        </tiny-form-item>

        <tiny-form-item label="Kafka主题" prop="kafkaTopic">
          <tiny-input v-model="formData.kafkaTopic" placeholder="请输入Kafka主题"></tiny-input>
        </tiny-form-item>

        <tiny-form-item label="轮询间隔(ms)" prop="pollingInterval">
          <tiny-numeric
            v-model="formData.pollingInterval"
            :min="100"
            :max="60000"
            placeholder="轮询间隔"
          ></tiny-numeric>
        </tiny-form-item>

        <tiny-form-item label="最大TPS" prop="maxTps">
          <tiny-numeric
            v-model="formData.maxTps"
            :min="1"
            :max="100000"
            placeholder="最大TPS"
          ></tiny-numeric>
        </tiny-form-item>

        <tiny-form-item label="启用熔断器">
          <tiny-switch v-model="formData.enableCircuitBreaker"></tiny-switch>
        </tiny-form-item>

        <tiny-form-item label="失败率阈值(%)" v-if="formData.enableCircuitBreaker">
          <tiny-numeric
            v-model="formData.failureThreshold"
            :min="1"
            :max="100"
            placeholder="失败率阈值"
          ></tiny-numeric>
        </tiny-form-item>

        <tiny-form-item label="自动启动">
          <tiny-switch v-model="formData.autoStart"></tiny-switch>
        </tiny-form-item>
      </tiny-form>
      
      <template #footer>
        <tiny-button @click="dialogVisible = false">取消</tiny-button>
        <tiny-button type="primary" @click="handleConfirm">保存</tiny-button>
      </template>
    </tiny-dialog-box>

    <!-- 统计详情对话框 -->
    <tiny-dialog-box v-model:visible="statisticsDialogVisible" title="网关实时统计" width="600px">
      <div v-if="currentStatistics" class="statistics-container">
        <div class="stat-item">
          <span class="stat-label">网关ID:</span>
          <span class="stat-value">{{ currentStatistics.gatewayId }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">消息总数:</span>
          <span class="stat-value">{{ formatNumber(currentStatistics.messageCount) }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">错误总数:</span>
          <span class="stat-value" style="color: #f56c6c">
            {{ formatNumber(currentStatistics.errorCount) }}
          </span>
        </div>
        <div class="stat-item">
          <span class="stat-label">错误率:</span>
          <span class="stat-value">{{ currentStatistics.errorRate }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">成功率:</span>
          <span class="stat-value" style="color: #67c23a">{{ currentStatistics.successRate }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">缓冲区大小:</span>
          <span class="stat-value">{{ formatNumber(currentStatistics.bufferSize) }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">熔断器状态:</span>
          <span class="stat-value">{{ currentStatistics.circuitBreakerState }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">限流器状态:</span>
          <span class="stat-value">{{ currentStatistics.rateLimiterState }}</span>
        </div>
      </div>
      <div v-else class="no-data">
        <p>暂无统计数据</p>
      </div>
    </tiny-dialog-box>

    <!-- 字段映射对话框 -->
    <tiny-dialog-box v-model:visible="fieldMappingDialogVisible" title="字段映射配置" width="600px">
      <div class="field-mapping-container">
        <div class="mapping-tip">
          <p>配置源数据字段到Kafka消息字段的映射关系</p>
        </div>
        <div class="mapping-list">
          <div v-for="(value, key) in fieldMappingData" :key="key" class="mapping-item">
            <tiny-input
              v-model="fieldMappingData[key as string]"
              :placeholder="`源字段: ${key}`"
              style="width: 45%"
            />
            <span class="mapping-arrow">→</span>
            <tiny-input
              :model-value="key"
              placeholder="目标字段"
              disabled
              style="width: 45%"
            />
            <tiny-button
              type="text"
              @click="removeFieldMapping(key as string)"
              style="color: #f56c6c"
            >
              删除
            </tiny-button>
          </div>
        </div>
        <tiny-button size="small" type="primary" @click="addFieldMapping">
          + 添加映射
        </tiny-button>
      </div>
      <template #footer>
        <tiny-button @click="fieldMappingDialogVisible = false">取消</tiny-button>
        <tiny-button type="primary" @click="saveFieldMapping">保存</tiny-button>
      </template>
    </tiny-dialog-box>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import {
  Grid as TinyGrid,
  Modal,
  Tag as TinyTag,
  Button as TinyButton,
  Form as TinyForm,
  FormItem as TinyFormItem,
  GridColumn as TinyGridColumn,
  GridToolbar as TinyGridToolbar,
  Search as TinySearch,
  Select as TinySelect,
  Option as TinyOption,
  Switch as TinySwitch,
  Pager as TinyPager,
  DialogBox as TinyDialogBox,
  Input as TinyInput,
  Numeric as TinyNumeric,
  TinyActionMenu
} from '@opentiny/vue'
import { iconDel, iconEdit, iconStartCircle, iconStop, iconPieChart } from '@opentiny/vue-icon'
import { formatDateTime } from '@/utils/date'
import { formPage } from '@/utils/tool'
import { PageUtils } from '@/utils/page'
import { GatewayService } from '@/services/gateway'
import { ConnectorService } from '@/services/connector'
import { computed } from 'vue'

const TinyIconStartCircle = iconStartCircle()
const TinyIconStop = iconStop()
const TinyIconPieChart = iconPieChart()
const TinyIconEdit = iconEdit()
const TinyIconDel = iconDel()

const loading = ref(false)
const tableHeight = ref(600)
const gridData = ref([])
const gridRef = ref()
const formRef = ref()
const contain = ref()

// 字段映射对话框
const fieldMappingDialogVisible = ref(false)
const fieldMappingData = ref<any>({})

// 打开字段映射对话框
const openFieldMapping = () => {
  fieldMappingData.value = formData.fieldMapping || {}
  fieldMappingDialogVisible.value = true
}

// 保存字段映射
const saveFieldMapping = () => {
  formData.fieldMapping = fieldMappingData.value
  fieldMappingDialogVisible.value = false
  Modal.message({ message: '字段映射配置已保存', status: 'success' })
}

// 添加字段映射
const addFieldMapping = () => {
  const key = `field_${Object.keys(fieldMappingData.value).length + 1}`
  fieldMappingData.value[key] = ''
}

// 删除字段映射
const removeFieldMapping = (key: string) => {
  delete fieldMappingData.value[key]
}

// 连接器列表
const connectorList = ref<any[]>([])
const sourceConnectors = computed(() => {
  // 过滤源端连接器（不包括Kafka）
  return connectorList.value.filter(c => 
    c.product?.toLowerCase() !== 'kafka'
  )
})
const kafkaConnectors = computed(() => {
  // 过滤Kafka连接器
  return connectorList.value.filter(c => 
    c.product?.toLowerCase() === 'kafka'
  )
})

// 搜索表单
const searchForm = reactive({
  name: '',
  status: ''
})

// 分页数据
const formPageData = reactive(formPage)

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('创建网关')
const statisticsDialogVisible = ref(false)
const currentStatistics = ref(null)

// 表单数据
const formData = reactive({
  id: null,
  name: '',
  sourceConnectorId: null,
  fieldMapping: {},
  kafkaConnectorId: null,
  kafkaTopic: '',
  pollingInterval: 1000,
  maxTps: 1000,
  enableCircuitBreaker: true,
  failureThreshold: 50,
  autoStart: false
})

// 表单验证规则
const formRules = {
  name: [{ required: true, message: '请输入网关名称', trigger: 'blur' }],
  sourceConnectorId: [{ required: true, message: '请选择源连接器', trigger: 'change' }],
  kafkaConnectorId: [{ required: true, message: '请选择Kafka连接器', trigger: 'change' }],
  kafkaTopic: [{ required: true, message: '请输入Kafka主题', trigger: 'blur' }]
}

// 加载连接器列表
const loadConnectors = async () => {
  try {
    const res = await ConnectorService.getConnectorList({
      search: '',
      page: 1,
      pageSize: 1000
    })
    connectorList.value = res.data?.list || res.data?.records || []
  } catch (error) {
    console.error('加载连接器列表失败:', error)
  }
}

// 获取列表
const getList = async () => {
  loading.value = true
  try {
    const params = {
      name: searchForm.name,
      status: searchForm.status,
      page: formPageData.page,
      pageSize: formPageData.limit
    }

    const res = await GatewayService.getGatewayList(params)
    if (res.code === 0) {
      // 将protocolType映射为sourceConnectorName
      const list = res.data.list || []
      list.forEach((item: any) => {
        item.sourceConnectorName = item.protocolType
      })
      gridData.value = list
      formPageData.total = res.data.total || 0
    }
  } catch (error) {
    console.error('获取网关列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handlerSearch = () => {
  formPageData.page = 1
  getList()
}

// 刷新
const handleRefresh = () => {
  getList()
}

// 分页变化
const pageChange = (page: number) => {
  formPageData.page = page
  getList()
}

const limitChange = (limit: number) => {
  formPageData.limit = limit
  formPageData.page = 1
  getList()
}

// 打开创建对话框
const openCreateDialog = () => {
  dialogTitle.value = '创建网关'
  resetFormData()
  loadConnectors()  // 加载连接器列表
  dialogVisible.value = true
}

// 重置表单数据
const resetFormData = () => {
  formData.id = null
  formData.name = ''
  formData.sourceConnectorId = null
  formData.fieldMapping = {}
  formData.kafkaConnectorId = null
  formData.kafkaTopic = ''
  formData.pollingInterval = 1000
  formData.maxTps = 1000
  formData.enableCircuitBreaker = true
  formData.failureThreshold = 50
  formData.autoStart = false
}

// 编辑
const handleEdit = (row: any) => {
  dialogTitle.value = '编辑网关'
  Object.assign(formData, row)
  loadConnectors()  // 加载连接器列表
  dialogVisible.value = true
}

// 确认
const handleConfirm = async () => {
  try {
    await formRef.value.validate()

    if (formData.id) {
      await GatewayService.updateGateway(formData)
      Modal.message({ message: '更新成功', status: 'success' })
    } else {
      await GatewayService.createGateway(formData)
      Modal.message({ message: '创建成功', status: 'success' })
    }

    dialogVisible.value = false
    getList()
  } catch (error) {
    console.error('操作失败:', error)
  }
}

// 启动网关
const handleStart = async (row: any) => {
  try {
    await GatewayService.startGateway(row.id)
    Modal.message({ message: '启动成功', status: 'success' })
    getList()
  } catch (error) {
    Modal.message({ message: '启动失败', status: 'error' })
  }
}

// 停止网关
const handleStop = async (row: any) => {
  try {
    await GatewayService.stopGateway(row.id)
    Modal.message({ message: '停止成功', status: 'success' })
    getList()
  } catch (error) {
    Modal.message({ message: '停止失败', status: 'error' })
  }
}

// 删除
const handleDelete = (row: any) => {
  Modal.confirm({
    message: `确定删除网关 "${row.name}" 吗？`,
    status: 'warning'
  }).then(async () => {
    try {
      await GatewayService.deleteGateway(row.id)
      Modal.message({ message: '删除成功', status: 'success' })
      getList()
    } catch (error) {
      Modal.message({ message: '删除失败', status: 'error' })
    }
  })
}

// 查看统计
const handleViewStatistics = async (row: any) => {
  try {
    const res = await GatewayService.getGatewayStatistics(row.id)
    if (res.code === 0) {
      currentStatistics.value = res.data
      statisticsDialogVisible.value = true
    }
  } catch (error) {
    Modal.message({ message: '获取统计信息失败', status: 'error' })
  }
}

// 自动启动切换
const handleAutoStartChange = async (row: any) => {
  try {
    await GatewayService.updateGateway({
      id: row.id,
      autoStart: row.autoStart
    })
  } catch (error) {
    row.autoStart = !row.autoStart
    Modal.message({ message: '更新失败', status: 'error' })
  }
}

// 工具函数
const getProtocolTagType = (type: string) => {
  const map: any = {
    MODBUS: 'primary',
    COAP: 'success',
    OPCUA: 'warning',
    TCP: 'info',
    UDP: 'info',
    MQTT: 'danger'
  }
  return map[type] || 'info'
}

const getStatusTagType = (status: string) => {
  const map: any = {
    RUNNING: 'success',
    STOPPED: 'info',
    ERROR: 'danger'
  }
  return map[status] || 'info'
}

const getStatusLabel = (status: string) => {
  const map: any = {
    RUNNING: '运行中',
    STOPPED: '已停止',
    ERROR: '错误'
  }
  return map[status] || status
}

const formatNumber = (num: number) => {
  if (!num) return '0'
  return num.toLocaleString()
}

const calculateErrorRate = (total: number, errors: number) => {
  if (!total) return '0%'
  return ((errors / total) * 100).toFixed(2) + '%'
}

onMounted(() => {
  getList()
  // 计算表格高度
  PageUtils.setTableHeight(200)
})
</script>

<style lang="less" scoped>
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

.statistics-container {
  padding: 20px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.stat-label {
  font-weight: bold;
  color: #666;
}

.stat-value {
  color: #333;
  font-size: 16px;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #999;
}

.connector-option {
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

.field-mapping-container {
  padding: 20px;
}

.mapping-tip {
  background: #f0f9ff;
  border-left: 4px solid #1890ff;
  padding: 12px 16px;
  margin-bottom: 20px;
  border-radius: 4px;
}

.mapping-tip p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.mapping-list {
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 15px;
}

.mapping-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  padding: 10px;
  background: #fafafa;
  border-radius: 4px;
}

.mapping-arrow {
  font-size: 16px;
  color: #1890ff;
  font-weight: bold;
}
</style>
