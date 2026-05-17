<template>
  <div class="container-list">
    <Breadcrumb :items="['menu.cluster.worker']" />
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
        @select-change="handleSelectionChange"
      >
        <template #toolbar>
          <tiny-grid-toolbar class="grid-toolbar" full-screen setting size="small">
            <template #buttons>
              <tiny-form :model="searchForm" inline>
                <tiny-form-item>
                  <tiny-search
                    v-model="searchForm.search"
                    clearable
                    is-enter-search
                    placeholder="请输入Worker名称、ID或主机地址"
                    style="width: 300px"
                    @search="handlerSearch"
                  ></tiny-search>
                </tiny-form-item>
                <tiny-form-item>
                  <tiny-select
                    v-model="searchForm.status"
                    placeholder="选择状态"
                    clearable
                    @change="handlerSearch"
                  >
                    <tiny-option label="在线" value="ONLINE"></tiny-option>
                    <tiny-option label="离线" value="OFFLINE"></tiny-option>
                    <tiny-option label="禁用" value="DISABLED"></tiny-option>
                    <tiny-option label="异常" value="ABNORMAL"></tiny-option>
                  </tiny-select>
                </tiny-form-item>
                <tiny-form-item>
                  <tiny-button size="small" @click="handleRefresh">刷新</tiny-button>
                </tiny-form-item>
                <tiny-form-item v-if="selectedRows.length > 0">
                  <tiny-button size="small" type="success" @click="batchEnable">批量启用</tiny-button>
                </tiny-form-item>
                <tiny-form-item v-if="selectedRows.length > 0">
                  <tiny-button size="small" type="warning" @click="batchDisable">批量禁用</tiny-button>
                </tiny-form-item>
                <tiny-form-item v-if="selectedRows.length > 0">
                  <tiny-button size="small" type="danger" @click="batchDelete">批量删除</tiny-button>
                </tiny-form-item>
              </tiny-form>
            </template>
          </tiny-grid-toolbar>
        </template>

        <tiny-grid-column fixed="left" type="selection" width="50"></tiny-grid-column>
        <tiny-grid-column fixed="left" type="index" width="50"></tiny-grid-column>

        <tiny-grid-column title="Worker ID" field="id" fixed="left" width="200"></tiny-grid-column>

        <tiny-grid-column title="Worker名称" field="name" width="190"></tiny-grid-column>

        <tiny-grid-column title="主机地址" field="host" width="140"></tiny-grid-column>

        <tiny-grid-column title="端口" align="center" field="port" width="80"></tiny-grid-column>

        <tiny-grid-column title="版本" align="center" field="version" width="90"></tiny-grid-column>

        <tiny-grid-column title="状态" align="center" field="status" width="90">
          <template #default="data">
            <tiny-tag :type="getStatusType(data.row.status)">
              {{ getStatusLabel(data.row.status) }}
            </tiny-tag>
          </template>
        </tiny-grid-column>

        <tiny-grid-column title="活跃任务" align="center" field="activeTasks" width="100">
          <template #default="data">
            {{ data.row.activeTasks || 0 }} / {{ data.row.maxConcurrentTasks || 0 }}
          </template>
        </tiny-grid-column>

        <tiny-grid-column title="负载权重" align="center" field="weight" width="110">
          <template #default="data">
            <span
              class="weight-value"
              :class="{ 'weight-zero': data.row.weight === 0 }"
              @click="editWeight(data.row)"
              title="点击修改权重"
            >
              {{ data.row.weight !== null && data.row.weight !== undefined ? data.row.weight : 100 }}
            </span>
          </template>
        </tiny-grid-column>

        <tiny-grid-column title="CPU使用率" align="center" field="cpuUsage" width="110">
          <template #default="data">
            {{ data.row.cpuUsage ? data.row.cpuUsage + '%' : '-' }}
          </template>
        </tiny-grid-column>

        <tiny-grid-column title="内存使用率" align="center" field="memoryUsage" width="110">
          <template #default="data">
            {{ data.row.memoryUsage ? data.row.memoryUsage + '%' : '-' }}
          </template>
        </tiny-grid-column>

        <tiny-grid-column
          title="最后心跳时间"
          align="center"
          field="lastHeartbeatTime"
          width="170"
        ></tiny-grid-column>

        <tiny-grid-column title="操作" align="center" fixed="right" width="120">
          <template v-slot="data">
            <div style="display: flex; gap: 10px; justify-content: center; align-items: center;">
              <div title="详情">
                <tiny-icon-eyeopen
                  @click="viewDetail(data.row)"
                  style="font-size: 20px; cursor: pointer; fill: #409eff; color: #409eff;"
                />
              </div>
              <div v-if="data.row.enabled" title="禁用">
                <tiny-icon-close
                  @click="toggleEnabled(data.row, false)"
                  style="font-size: 20px; cursor: pointer; fill: #faad14; color: #faad14;"
                />
              </div>
              <div v-else title="启用">
                <tiny-icon-yes
                  @click="toggleEnabled(data.row, true)"
                  style="font-size: 20px; cursor: pointer; fill: #52c41a; color: #52c41a;"
                />
              </div>
              <div v-if="data.row.status === 'OFFLINE'" title="删除">
                <tiny-icon-del
                  @click="deleteWorker(data.row)"
                  style="font-size: 20px; cursor: pointer; fill: #f56c6c; color: #f56c6c;"
                />
              </div>
            </div>
          </template>
        </tiny-grid-column>
      </tiny-grid>

      <!--分页-->
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

    <!-- Worker详情对话框 -->
    <tiny-dialog-box
      v-model:visible="detailVisible"
      :title="`节点详情 - ${currentWorker?.name || ''}`"
      width="800px"
    >
      <div v-if="currentWorker" class="worker-detail">
        <!-- 基本信息 -->
        <div class="detail-section">
          <div class="section-title">基本信息</div>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">Worker ID:</span>
              <span class="value">{{ currentWorker.id }}</span>
            </div>
            <div class="info-item">
              <span class="label">Worker名称:</span>
              <span class="value">{{ currentWorker.name }}</span>
            </div>
            <div class="info-item">
              <span class="label">主机地址:</span>
              <span class="value">{{ currentWorker.host }}:{{ currentWorker.port }}</span>
            </div>
            <div class="info-item">
              <span class="label">版本:</span>
              <span class="value">{{ currentWorker.version }}</span>
            </div>
            <div class="info-item">
              <span class="label">状态:</span>
              <tiny-tag :type="getStatusType(currentWorker.status)">
                {{ getStatusLabel(currentWorker.status) }}
              </tiny-tag>
            </div>
            <div class="info-item">
              <span class="label">最后心跳:</span>
              <span class="value">{{ currentWorker.lastHeartbeatTime }}</span>
            </div>
            <div class="info-item">
              <span class="label">负载权重:</span>
              <span class="value">
                <span class="weight-badge" :class="{ 'weight-zero': currentWorker.weight === 0 }">
                  {{ currentWorker.weight !== null && currentWorker.weight !== undefined ? currentWorker.weight : 100 }}
                </span>
                <tiny-button size="mini" text @click="editWeight(currentWorker)" style="margin-left: 8px">
                  修改
                </tiny-button>
              </span>
            </div>
          </div>
        </div>

        <!-- 实时监控 -->
        <div class="detail-section">
          <div class="section-title">实时监控</div>
          <div class="monitor-grid">
            <div class="monitor-card">
              <div class="monitor-label">CPU使用率</div>
              <div class="monitor-value">{{ currentWorker.cpuUsage || 0 }}%</div>
            </div>
            <div class="monitor-card">
              <div class="monitor-label">内存使用率</div>
              <div class="monitor-value">{{ currentWorker.memoryUsage || 0 }}%</div>
            </div>
            <div class="monitor-card">
              <div class="monitor-label">JVM堆内存</div>
              <div class="monitor-value">{{ currentWorker.jvmHeapUsage || 0 }}%</div>
            </div>
            <div class="monitor-card">
              <div class="monitor-label">磁盘使用率</div>
              <div class="monitor-value">{{ currentWorker.diskUsage || 0 }}%</div>
            </div>
            <div class="monitor-card">
              <div class="monitor-label">活跃任务</div>
              <div class="monitor-value">
                {{ (currentWorker.activeTasks || 0) + ' / ' + (currentWorker.maxConcurrentTasks || 0) }}
              </div>
            </div>
            <div class="monitor-card">
              <div class="monitor-label">系统负载</div>
              <div class="monitor-value">{{ currentWorker.systemLoad || 0 }}</div>
            </div>
          </div>
        </div>

        <!-- 运行中任务 -->
        <div class="detail-section">
          <div class="section-title">运行中的任务 ({{ runningTasks.length }})</div>
          <div v-if="runningTasks.length > 0" class="task-list">
            <div v-for="task in runningTasks" :key="task.taskId" class="task-item">
              <div class="task-info">
                <div class="task-id">{{ task.taskId }}</div>
                <div class="task-action">{{ task.actionCode }}</div>
              </div>
              <div class="task-meta">
                <span>开始时间: {{ formatTime(task.startTime) }}</span>
                <span>已运行: {{ calculateRuntime(task.startTime) }}</span>
              </div>
            </div>
          </div>
          <div v-else class="empty-text">暂无运行中的任务</div>
        </div>
      </div>
    </tiny-dialog-box>

    <!-- 权重编辑对话框 -->
    <tiny-dialog-box
      v-model:visible="weightDialogVisible"
      title="修改负载权重"
      width="500px"
    >
      <div v-if="editingWorker" class="weight-dialog">
        <div class="dialog-info">
          <div class="info-row">
            <span class="label">Worker名称:</span>
            <span class="value">{{ editingWorker.name }}</span>
          </div>
          <div class="info-row">
            <span class="label">主机地址:</span>
            <span class="value">{{ editingWorker.host }}:{{ editingWorker.port }}</span>
          </div>
          <div class="info-row">
            <span class="label">当前权重:</span>
            <span class="value weight-current">
              {{ editingWorker.weight !== null && editingWorker.weight !== undefined ? editingWorker.weight : 100 }}
            </span>
          </div>
        </div>

        <div class="weight-input-section">
          <tiny-form :model="weightForm" label-width="100px">
            <tiny-form-item label="新权重值" required>
              <tiny-numeric
                v-model="weightForm.weight"
                :min="0"
                :max="200"
                :step="10"
                controls-position="right"
                style="width: 100%"
              />
            </tiny-form-item>
            <tiny-form-item>
              <div class="weight-tips">
                <div class="tip-item">• 权重范围：0-200</div>
                <div class="tip-item">• 默认权重：100</div>
                <div class="tip-item">• 权重越高，分配任务越多</div>
                <div class="tip-item">• 权重为 0 时不接收新任务</div>
              </div>
            </tiny-form-item>
          </tiny-form>
        </div>
      </div>

      <template #footer>
        <tiny-button @click="weightDialogVisible = false">取消</tiny-button>
        <tiny-button type="primary" @click="saveWeight">确定</tiny-button>
      </template>
    </tiny-dialog-box>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import {
  DialogBox as TinyDialogBox,
  Grid as TinyGrid,
  Modal,
  Numeric as TinyNumeric,
  Tag as TinyTag,
  TinyActionMenu,
  TinyButton,
  TinyForm,
  TinyFormItem,
  TinyGridColumn,
  TinyGridToolbar,
  TinyOption,
  TinyPager,
  TinySearch,
  TinySelect
} from '@opentiny/vue'
import { iconDel, iconEyeopen, iconYes, iconClose } from '@opentiny/vue-icon'
import { formatDateTime } from '@/utils/date'
import { formPage } from '@/utils/tool'
import { PageUtils } from '@/utils/page'
import Breadcrumb from '@/components/breadcrumb/index.vue'
import { ClusterService } from '@/services/cluster'

const TinyIconEyeopen = iconEyeopen()
const TinyIconYes = iconYes()
const TinyIconClose = iconClose()
const TinyIconDel = iconDel()

const loading = ref(false)
const tableHeight = ref(500)
const gridRef = ref(null)
const gridData = ref<any[]>([])

// 详情抽屉
const detailVisible = ref(false)
const currentWorker = ref<any>(null)
const runningTasks = ref<any[]>([])

// 权重编辑对话框
const weightDialogVisible = ref(false)
const editingWorker = ref<any>(null)
const weightForm = reactive({
  weight: 100
})

// 批量选择
const selectedRows = ref<any[]>([])

const searchForm = reactive({
  search: '',
  status: ''
})

const contain = ref()

const getStatusType = (status: string) => {
  const typeMap: any = {
    ONLINE: 'success',
    OFFLINE: 'info',
    DISABLED: 'warning',
    ABNORMAL: 'danger'
  }
  return typeMap[status] || 'info'
}

const getStatusLabel = (status: string) => {
  const labelMap: any = {
    ONLINE: '在线',
    OFFLINE: '离线',
    DISABLED: '禁用',
    ABNORMAL: '异常'
  }
  return labelMap[status] || status
}

// 删除Worker节点
const deleteWorker = async (row: any) => {
  if (row.status !== 'OFFLINE') {
    Modal.message({
      message: '只能删除离线状态的节点',
      status: 'warning'
    })
    return
  }

  Modal.confirm({
    message: `确定要删除 Worker 节点 "${row.name}" 吗？`,
    status: 'warning'
  }).then(async () => {
    try {
      await ClusterService.deleteWorker(row.id)
      Modal.message({
        message: '删除成功',
        status: 'success'
      })
      await fetchData()
    } catch (error: any) {
      Modal.message({
        message: error.message || '删除失败',
        status: 'error'
      })
    }
  })
}

const handlerSearch = () => {
  formPage.page = 1
  fetchData()
}

const handleRefresh = () => {
  fetchData()
}

const pageChange = (value: number) => {
  formPage.page = value
  fetchData()
}

const limitChange = (value: number) => {
  formPage.limit = value
  formPage.page = 1
  fetchData()
}

const viewDetail = async (row: any) => {
  currentWorker.value = row
  detailVisible.value = true
  
  // 加载该Worker的运行中任务
  try {
    const res = await ClusterService.getRunningTasksByWorkerId(row.id)
    if (res.code === 0) {
      runningTasks.value = res.data || []
    }
  } catch (error) {
    console.error('加载运行中任务失败', error)
    runningTasks.value = []
  }
}

const formatTime = (time: string | null | undefined) => {
  if (!time) return '-'
  return formatDateTime(time)
}

const calculateRuntime = (startTime: string | null | undefined) => {
  if (!startTime) return '-'
  const start = new Date(startTime).getTime()
  const now = Date.now()
  const diff = now - start
  
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  
  if (hours > 0) {
    return `${hours}小时${minutes % 60}分钟`
  } else if (minutes > 0) {
    return `${minutes}分钟${seconds % 60}秒`
  } else {
    return `${seconds}秒`
  }
}

const toggleEnabled = async (row: any, enabled: boolean) => {
  try {
    await ClusterService.toggleWorkerEnabled(row.id, enabled)
    Modal.message({
      message: `${enabled ? '启用' : '禁用'}成功`,
      status: 'success'
    })
    await fetchData()
  } catch (error: any) {
    Modal.message({
      message: error.message || `${enabled ? '启用' : '禁用'}失败`,
      status: 'error'
    })
  }
}

// 处理多选
const handleSelectionChange = (selection: any) => {
  selectedRows.value = selection.records || []
}

// 批量启用
const batchEnable = async () => {
  if (selectedRows.value.length === 0) {
    Modal.message({ message: '请选择要操作的节点', status: 'warning' })
    return
  }
  
  try {
    const ids = selectedRows.value.map(row => row.id)
    await ClusterService.batchToggleWorkerEnabled(ids, true)
    Modal.message({
      message: `成功启用 ${ids.length} 个节点`,
      status: 'success'
    })
    selectedRows.value = []
    await fetchData()
  } catch (error: any) {
    Modal.message({
      message: error.message || '批量启用失败',
      status: 'error'
    })
  }
}

// 批量禁用
const batchDisable = async () => {
  if (selectedRows.value.length === 0) {
    Modal.message({ message: '请选择要操作的节点', status: 'warning' })
    return
  }
  
  try {
    const ids = selectedRows.value.map(row => row.id)
    await ClusterService.batchToggleWorkerEnabled(ids, false)
    Modal.message({
      message: `成功禁用 ${ids.length} 个节点`,
      status: 'success'
    })
    selectedRows.value = []
    await fetchData()
  } catch (error: any) {
    Modal.message({
      message: error.message || '批量禁用失败',
      status: 'error'
    })
  }
}

// 批量删除
const batchDelete = async () => {
  if (selectedRows.value.length === 0) {
    Modal.message({ message: '请选择要删除的节点', status: 'warning' })
    return
  }
  
  const offlineCount = selectedRows.value.filter(row => row.status === 'OFFLINE').length
  if (offlineCount === 0) {
    Modal.message({ message: '只能删除离线状态的节点', status: 'warning' })
    return
  }
  
  Modal.confirm({
    message: `确定要删除 ${offlineCount} 个离线节点吗？`,
    status: 'warning'
  }).then(async () => {
    try {
      const ids = selectedRows.value
        .filter(row => row.status === 'OFFLINE')
        .map(row => row.id)
      
      await ClusterService.batchDeleteWorker(ids)
      Modal.message({
        message: `成功删除 ${ids.length} 个节点`,
        status: 'success'
      })
      selectedRows.value = []
      await fetchData()
    } catch (error: any) {
      Modal.message({
        message: error.message || '批量删除失败',
        status: 'error'
      })
    }
  })
}

const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      search: searchForm.search,
      status: searchForm.status,
      page: formPage.page,
      pageSize: formPage.limit
    }
    const res = await ClusterService.getWorkerList(params)
    if (res.code === 0) {
      gridData.value = res.data.list.map((item: any) => ({
        ...item,
        lastHeartbeatTime: formatDateTime(item.lastHeartbeatTime)
      }))
      formPage.total = res.data.total
    } else {
      Modal.message({
        message: res.msg || '查询失败',
        status: 'error'
      })
    }
  } catch (error: any) {
    Modal.message({
      message: error.message || '查询失败',
      status: 'error'
    })
  } finally {
    loading.value = false
  }
}

// 打开权重编辑对话框
const editWeight = (row: any) => {
  editingWorker.value = row
  weightForm.weight = row.weight !== null && row.weight !== undefined ? row.weight : 100
  weightDialogVisible.value = true
}

// 保存权重
const saveWeight = async () => {
  if (!editingWorker.value) return

  // 校验权重值
  if (weightForm.weight < 0 || weightForm.weight > 200) {
    Modal.message({
      message: '权重值必须在 0-200 之间',
      status: 'warning'
    })
    return
  }

  try {
    const res = await ClusterService.updateWorkerWeight(editingWorker.value.id, weightForm.weight)
    if (res.code === 0) {
      Modal.message({
        message: '权重更新成功',
        status: 'success'
      })
      weightDialogVisible.value = false
      
      // 刷新列表数据
      await fetchData()
      
      // 如果详情对话框打开着，更新当前 Worker 信息
      if (currentWorker.value && currentWorker.value.id === editingWorker.value.id) {
        currentWorker.value.weight = weightForm.weight
      }
    } else {
      Modal.message({
        message: res.msg || '权重更新失败',
        status: 'error'
      })
    }
  } catch (error: any) {
    Modal.message({
      message: error.message || '权重更新失败',
      status: 'error'
    })
  }
}

onMounted(() => {
  tableHeight.value = PageUtils.setTableHeight(null)
  fetchData()
})
</script>

<style scoped lang="less">
.container-list {
}

.contain {
  padding: 16px;
}

.grid-toolbar {
  padding: 10px 0;
}

/* 隐藏对话框滚动条 */
:deep(.tiny-dialog-box__body) {
  overflow-y: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
}

:deep(.tiny-dialog-box__body::-webkit-scrollbar) {
  display: none; /* Chrome, Safari, Opera */
}

/* Worker详情样式 */
.worker-detail {
  padding: 20px;
  max-height: 600px;
  overflow-y: auto;
  
  /* 隐藏滚动条但保持滚动功能 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
  
  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }
}

.detail-section {
  margin-bottom: 30px;

  &:last-child {
    margin-bottom: 0;
  }
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e4e7ed;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.info-item {
  display: flex;
  align-items: center;

  .label {
    font-size: 14px;
    color: #606266;
    min-width: 100px;
  }

  .value {
    font-size: 14px;
    color: #303133;
    font-weight: 500;
  }
}

.monitor-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.monitor-card {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 16px;
  text-align: center;

  .monitor-label {
    font-size: 12px;
    color: #909399;
    margin-bottom: 8px;
  }

  .monitor-value {
    font-size: 24px;
    font-weight: 600;
    color: #409eff;
  }
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-item {
  background: #f5f7fa;
  border-radius: 6px;
  padding: 12px;

  .task-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;

    .task-id {
      font-size: 13px;
      color: #303133;
      font-weight: 500;
    }

    .task-action {
      font-size: 12px;
      color: #409eff;
      background: #ecf5ff;
      padding: 2px 8px;
      border-radius: 4px;
    }
  }

  .task-meta {
    display: flex;
    gap: 16px;
    font-size: 12px;
    color: #909399;
  }
}

.empty-text {
  text-align: center;
  color: #909399;
  padding: 40px 0;
  font-size: 14px;
}

/* 权重显示样式 */
.weight-value {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  background: #ecf5ff;
  color: #409eff;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    background: #409eff;
    color: #fff;
  }
  
  &.weight-zero {
    background: #fef0f0;
    color: #f56c6c;
    
    &:hover {
      background: #f56c6c;
      color: #fff;
    }
  }
}

.weight-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 4px;
  background: #ecf5ff;
  color: #409eff;
  font-weight: 600;
  font-size: 16px;
  
  &.weight-zero {
    background: #fef0f0;
    color: #f56c6c;
  }
}

/* 权重编辑对话框样式 */
.weight-dialog {
  .dialog-info {
    background: #f5f7fa;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 20px;
    
    .info-row {
      display: flex;
      align-items: center;
      padding: 8px 0;
      
      .label {
        font-size: 14px;
        color: #606266;
        min-width: 100px;
      }
      
      .value {
        font-size: 14px;
        color: #303133;
        font-weight: 500;
        
        &.weight-current {
          font-size: 18px;
          color: #409eff;
          font-weight: 600;
        }
      }
    }
  }
  
  .weight-input-section {
    padding: 0 20px;
  }
  
  .weight-tips {
    margin-top: 12px;
    padding: 12px;
    background: #f0f9ff;
    border-radius: 6px;
    border-left: 3px solid #409eff;
    
    .tip-item {
      font-size: 13px;
      color: #606266;
      line-height: 1.8;
    }
  }
}

// 修复 ActionMenu 图标 hover 时的颜色问题
:deep(.tiny-action-menu) {
  .tiny-action-menu__item {
    svg {
      fill: #5e7ce0;
    }
    
    &:hover {
      svg {
        fill: #5e7ce0 !important;
      }
    }
  }
}
</style>
