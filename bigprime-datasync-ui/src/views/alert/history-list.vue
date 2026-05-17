<template>
  <div class="container-list">
    <Breadcrumb :items="['告警中心', '告警历史']" />
    <div class="contain">
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
                  <tiny-select
                    v-model="searchForm.status"
                    clearable
                    placeholder="告警状态"
                    @change="handleSearch"
                  >
                    <tiny-option label="全部" value=""></tiny-option>
                    <tiny-option label="活跃" value="ACTIVE"></tiny-option>
                    <tiny-option label="已解决" value="RESOLVED"></tiny-option>
                    <tiny-option label="已忽略" value="IGNORED"></tiny-option>
                  </tiny-select>
                </tiny-form-item>
                <tiny-form-item>
                  <tiny-select
                    v-model="searchForm.sourceModule"
                    clearable
                    placeholder="所属模块"
                    @change="handleSearch"
                  >
                    <tiny-option label="全部" value=""></tiny-option>
                    <tiny-option label="连接器" value="CONNECTOR"></tiny-option>
                    <tiny-option label="Worker" value="WORKER"></tiny-option>
                    <tiny-option label="日志" value="LOG"></tiny-option>
                    <tiny-option label="DAG" value="DAG"></tiny-option>
                  </tiny-select>
                </tiny-form-item>
                <tiny-form-item>
                  <tiny-button size="small" @click="handleRefresh">刷新</tiny-button>
                  <tiny-button size="small" type="danger" @click="handleBatchResolve"
                    >批量解决</tiny-button
                  >
                </tiny-form-item>
              </tiny-form>
            </template>
          </tiny-grid-toolbar>
        </template>

        <tiny-grid-column type="selection" width="50"></tiny-grid-column>
        <tiny-grid-column fixed="left" type="index" width="50"></tiny-grid-column>

        <tiny-grid-column title="告警ID" field="alertId" fixed="left" width="180"></tiny-grid-column>

        <tiny-grid-column title="规则名称" field="ruleName" width="200"></tiny-grid-column>

        <tiny-grid-column title="告警类型" field="alertType" width="150"></tiny-grid-column>

        <tiny-grid-column title="告警级别" field="alertLevel" align="center" width="100">
          <template #default="{ row }">
            <tiny-tag v-if="row.alertLevel === 'CRITICAL'" type="danger">严重</tiny-tag>
            <tiny-tag v-else-if="row.alertLevel === 'ERROR'" type="warning">错误</tiny-tag>
            <tiny-tag v-else-if="row.alertLevel === 'WARNING'" type="info">警告</tiny-tag>
            <tiny-tag v-else>信息</tiny-tag>
          </template>
        </tiny-grid-column>

        <tiny-grid-column title="状态" field="status" align="center" width="100">
          <template #default="{ row }">
            <tiny-tag v-if="row.status === 'ACTIVE'" type="danger">活跃</tiny-tag>
            <tiny-tag v-else-if="row.status === 'RESOLVED'" type="success">已解决</tiny-tag>
            <tiny-tag v-else type="info">已忽略</tiny-tag>
          </template>
        </tiny-grid-column>

        <tiny-grid-column title="告警消息" field="alertMessage" width="300"></tiny-grid-column>

        <tiny-grid-column title="通知状态" field="notificationStatus" align="center" width="100">
          <template #default="{ row }">
            <tiny-tag v-if="row.notificationStatus === 'SENT'" type="success">已发送</tiny-tag>
            <tiny-tag v-else-if="row.notificationStatus === 'FAILED'" type="danger">失败</tiny-tag>
            <tiny-tag v-else-if="row.notificationStatus === 'IGNORED'" type="info">已忽略</tiny-tag>
            <tiny-tag v-else type="warning">待发送</tiny-tag>
          </template>
        </tiny-grid-column>

        <tiny-grid-column title="触发时间" field="triggerTime" align="center" width="180"></tiny-grid-column>

        <tiny-grid-column title="解决时间" field="resolvedTime" align="center" width="180"></tiny-grid-column>

        <tiny-grid-column title="操作" align="center" fixed="right" width="120">
          <template #default="{ row }">
            <div style="display: flex; gap: 10px; justify-content: center; align-items: center;">
              <div title="查看">
                <tiny-icon-eyeopen
                  @click="handleView(row)"
                  style="font-size: 20px; cursor: pointer; fill: #409eff; color: #409eff;"
                />
              </div>
              <div v-if="row.status === 'ACTIVE'" title="解决">
                <tiny-icon-yes
                  @click="handleResolve(row)"
                  style="font-size: 20px; cursor: pointer; fill: #52c41a; color: #52c41a;"
                />
              </div>
              <div v-if="row.status === 'ACTIVE'" title="忽略">
                <tiny-icon-close
                  @click="handleIgnore(row)"
                  style="font-size: 20px; cursor: pointer; fill: #faad14; color: #faad14;"
                />
              </div>
            </div>
          </template>
        </tiny-grid-column>
      </tiny-grid>

      <!-- 分页 -->
      <tiny-pager
        :align="formPage.align"
        :current-page="formPage.page"
        :layout="formPage.layout"
        :page-size="formPage.pageSize"
        :page-sizes="formPage.pageSizes"
        :total="formPage.total"
        @current-change="pageChange"
        @size-change="limitChange"
      ></tiny-pager>
    </div>

    <!-- 详情对话框 -->
    <DetailDialog
      v-if="showDetailDialog"
      :visible="showDetailDialog"
      :alert-id="currentAlertId"
      @close="handleDetailClose"
    />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import {
  Grid as TinyGrid,
  Modal,
  Tag as TinyTag,
  TinyButton,
  TinyForm,
  TinyFormItem,
  TinyGridColumn,
  TinyGridToolbar,
  TinyOption,
  TinyPager,
  TinySelect
} from '@opentiny/vue'
import { iconEyeopen, iconYes, iconClose } from '@opentiny/vue-icon'
import { AlertHistoryApi } from '@/api/alert'
import { formatDateTime } from '@/utils/date'
import Breadcrumb from '@/components/breadcrumb/index.vue'
import DetailDialog from './components/DetailDialog.vue'
import { PageUtils } from '@/utils/page'

const TinyIconEyeopen = iconEyeopen()
const TinyIconYes = iconYes()
const TinyIconClose = iconClose()

const loading = ref(false)
const tableHeight = ref(600)
const gridRef = ref(null)
const gridData = ref<any[]>([])
const showDetailDialog = ref(false)
const currentAlertId = ref('')

const searchForm = reactive({
  status: '',
  sourceModule: ''
})

const formPage = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
  align: 'right',
  layout: 'total, prev, pager, next, jumper, sizes',
  pageSizes: [10, 20, 50, 100]
})

// 加载列表
const loadHistoryList = async () => {
  loading.value = true
  try {
    const params = {
      status: searchForm.status,
      sourceModule: searchForm.sourceModule,
      page: formPage.page,
      pageSize: formPage.pageSize
    }
    
    const res = await AlertHistoryApi.getHistoryList(params)
    if (res.code === 0) {
      const data = res.data || {}
      gridData.value = (data.list || []).map((item: any) => ({
        ...item,
        triggerTime: formatDateTime(item.triggerTime),
        resolvedTime: item.resolvedTime ? formatDateTime(item.resolvedTime) : '-'
      }))
      formPage.total = data.pager?.totalCount || 0
    } else {
      Modal.message({ message: res.msg, status: 'error' })
    }
  } catch (error: any) {
    Modal.message({ message: error.message || '加载失败', status: 'error' })
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  formPage.page = 1
  loadHistoryList()
}

// 刷新
const handleRefresh = () => {
  loadHistoryList()
}

// 批量解决
const handleBatchResolve = () => {
  const grid: any = gridRef.value
  const selectedRows = grid.getSelectRecords()

  if (selectedRows.length === 0) {
    Modal.message({ message: '请选择要解决的告警', status: 'warning' })
    return
  }

  Modal.confirm({
    title: '批量解决',
    message: `确定要解决选中的 ${selectedRows.length} 条告警吗？`,
    status: 'warning'
  }).then(async () => {
    try {
      const promises = selectedRows.map((row: any) =>
        AlertHistoryApi.resolveAlert(row.alertId, { remark: '批量解决' })
      )
      await Promise.all(promises)
      Modal.message({ message: '批量解决成功', status: 'success' })
      loadHistoryList()
    } catch (error: any) {
      Modal.message({ message: error.message || '批量解决失败', status: 'error' })
    }
  })
}

// 操作菜单已移除，直接使用图标

// 查看详情
const handleView = (row: any) => {
  currentAlertId.value = row.alertId
  showDetailDialog.value = true
}

// 解决告警
const handleResolve = (row: any) => {
  Modal.confirm({
    title: '确认解决',
    message: `确定要解决告警"${row.alertType}"吗？`,
    status: 'info'
  }).then(async () => {
    try {
      const res = await AlertHistoryApi.resolveAlert(row.alertId, { remark: '手动解决' })
      if (res.code === 0) {
        Modal.message({ message: '解决成功', status: 'success' })
        loadHistoryList()
      } else {
        Modal.message({ message: res.msg, status: 'error' })
      }
    } catch (error: any) {
      Modal.message({ message: error.message || '解决失败', status: 'error' })
    }
  })
}

// 忽略告警
const handleIgnore = (row: any) => {
  Modal.confirm({
    title: '确认忽略',
    message: `确定要忽略告警"${row.alertType}"吗？`,
    status: 'warning'
  }).then(async () => {
    try {
      const res = await AlertHistoryApi.ignoreAlert(row.alertId, { remark: '手动忽略' })
      if (res.code === 0) {
        Modal.message({ message: '忽略成功', status: 'success' })
        loadHistoryList()
      } else {
        Modal.message({ message: res.msg, status: 'error' })
      }
    } catch (error: any) {
      Modal.message({ message: error.message || '忽略失败', status: 'error' })
    }
  })
}

// 详情对话框关闭
const handleDetailClose = () => {
  showDetailDialog.value = false
  currentAlertId.value = ''
}

// 分页
const pageChange = (page: number) => {
  formPage.page = page
  loadHistoryList()
}

const limitChange = (limit: number) => {
  formPage.pageSize = limit
  formPage.page = 1
  loadHistoryList()
}

onMounted(() => {
  tableHeight.value = PageUtils.setTableHeight(null)
  loadHistoryList()
})
</script>

<style lang="scss" scoped>
.container-list {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
}

.contain {
  flex: 1 1 auto;
  margin: 8px 10px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 0 8px 8px rgba(169, 174, 184, 0.05);
  padding: 10px;

  .grid-toolbar {
    .tiny-select {
      width: 280px;
    }
  }
}
</style>
