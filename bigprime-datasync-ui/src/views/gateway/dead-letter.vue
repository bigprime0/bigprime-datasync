<template>
  <div class="container-list">
    <Breadcrumb :items="['协议网关', '死信队列']" />
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
                  <tiny-numeric
                    v-model="searchForm.gatewayId"
                    :controls="false"
                    placeholder="网关ID"
                    style="width: 256px"
                  ></tiny-numeric>
                </tiny-form-item>
                <tiny-form-item>
                  <tiny-select
                    v-model="searchForm.status"
                    clearable
                    placeholder="状态"
                    @change="handlerSearch"
                  >
                    <tiny-option label="全部" value=""></tiny-option>
                    <tiny-option label="待处理" value="PENDING"></tiny-option>
                    <tiny-option label="成功" value="SUCCESS"></tiny-option>
                    <tiny-option label="失败" value="FAILED"></tiny-option>
                  </tiny-select>
                </tiny-form-item>
                <tiny-form-item>
                  <tiny-button size="small" type="primary" @click="handlerSearch">查询</tiny-button>
                  <tiny-button size="small" @click="handleRefresh">刷新</tiny-button>
                  <tiny-button
                    size="small"
                    type="warning"
                    @click="handleBatchRetry"
                    :disabled="selectedRows.length === 0"
                  >
                    批量重试 ({{ selectedRows.length }})
                  </tiny-button>
                  <tiny-button size="small" type="danger" @click="handleCleanOld">
                    清理旧记录
                  </tiny-button>
                </tiny-form-item>
              </tiny-form>
            </template>
          </tiny-grid-toolbar>
        </template>

        <tiny-grid-column type="selection" width="50"></tiny-grid-column>
        <tiny-grid-column type="index" width="50"></tiny-grid-column>

        <tiny-grid-column
          title="网关ID"
          field="gatewayId"
          align="center"
          width="100"
        ></tiny-grid-column>

        <tiny-grid-column title="消息内容" field="messageContent">
          <template #default="data">
            <div class="message-content">{{ truncateText(data.row.messageContent, 50) }}</div>
          </template>
        </tiny-grid-column>

        <tiny-grid-column title="错误信息" field="errorMessage">
          <template #default="data">
            <span class="error-message">{{ truncateText(data.row.errorMessage, 40) }}</span>
          </template>
        </tiny-grid-column>

        <tiny-grid-column title="状态" field="status" align="center" width="80">
          <template #default="data">
            <tiny-tag :type="getStatusTagType(data.row.status)">
              {{ getStatusLabel(data.row.status) }}
            </tiny-tag>
          </template>
        </tiny-grid-column>

        <tiny-grid-column title="重试次数" field="retryCount" align="center" width="100">
          <template #default="data">
            <span
              :style="{ color: getRetryCountColor(data.row.retryCount, data.row.maxRetryCount) }"
            >
              {{ data.row.retryCount }} / {{ data.row.maxRetryCount }}
            </span>
          </template>
        </tiny-grid-column>

        <tiny-grid-column title="创建时间" field="createdTime" align="center" width="170">
          <template #default="data">
            {{ formatDateTime(data.row.createdTime) }}
          </template>
        </tiny-grid-column>

        <tiny-grid-column title="最后重试时间" field="lastRetryTime" align="center" width="170">
          <template #default="data">
            {{ data.row.lastRetryTime ? formatDateTime(data.row.lastRetryTime) : '-' }}
          </template>
        </tiny-grid-column>

        <tiny-grid-column title="操作" align="center" width="150" fixed="right">
          <template v-slot="data">
            <tiny-button
              v-if="data.row.status === 'PENDING'"
              size="mini"
              type="primary"
              @click="handleRetry(data.row)"
            >
              重试
            </tiny-button>
            <tiny-button size="mini" @click="handleViewDetail(data.row)">详情</tiny-button>
            <tiny-button size="mini" type="danger" @click="handleDelete(data.row)"
              >删除</tiny-button
            >
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

    <!-- 详情对话框 -->
    <tiny-dialog-box v-model:visible="detailDialogVisible" title="死信详情" width="800px">
      <div v-if="currentDetail" class="detail-container">
        <div class="detail-item">
          <span class="detail-label">死信ID:</span>
          <span class="detail-value">{{ currentDetail.id }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">网关ID:</span>
          <span class="detail-value">{{ currentDetail.gatewayId }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">状态:</span>
          <tiny-tag :type="getStatusTagType(currentDetail.status)">
            {{ getStatusLabel(currentDetail.status) }}
          </tiny-tag>
        </div>
        <div class="detail-item">
          <span class="detail-label">重试次数:</span>
          <span class="detail-value"
            >{{ currentDetail.retryCount }} / {{ currentDetail.maxRetryCount }}</span
          >
        </div>
        <div class="detail-item full-width">
          <span class="detail-label">消息内容:</span>
          <pre class="detail-content">{{ currentDetail.messageContent }}</pre>
        </div>
        <div class="detail-item full-width">
          <span class="detail-label">错误信息:</span>
          <pre class="detail-content error">{{ currentDetail.errorMessage }}</pre>
        </div>
        <div class="detail-item">
          <span class="detail-label">创建时间:</span>
          <span class="detail-value">{{ formatDateTime(currentDetail.createdTime) }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">最后重试时间:</span>
          <span class="detail-value">
            {{ currentDetail.lastRetryTime ? formatDateTime(currentDetail.lastRetryTime) : '-' }}
          </span>
        </div>
      </div>
    </tiny-dialog-box>

    <!-- 清理对话框 -->
    <tiny-dialog-box
      v-model:visible="cleanDialogVisible"
      title="清理旧记录"
      width="400px"
      @confirm="handleCleanConfirm"
    >
      <tiny-form :model="cleanForm" label-width="120px">
        <tiny-form-item label="保留天数">
          <tiny-numeric
            v-model="cleanForm.days"
            :min="1"
            :max="365"
            placeholder="保留最近N天的记录"
          ></tiny-numeric>
        </tiny-form-item>
        <tiny-alert
          type="warning"
          description="将删除超过指定天数的死信记录，此操作不可恢复！"
        ></tiny-alert>
      </tiny-form>
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
  Select as TinySelect,
  Option as TinyOption,
  Pager as TinyPager,
  DialogBox as TinyDialogBox,
  Numeric as TinyNumeric,
  Alert as TinyAlert
} from '@opentiny/vue'
import { formatDateTime } from '@/utils/date'
import { formPage } from '@/utils/tool'
import { PageUtils } from '@/utils/page'
import { DeadLetterService } from '@/services/gateway'

const loading = ref(false)
const tableHeight = ref(600)
const gridData = ref([])
const gridRef = ref()
const contain = ref()
const selectedRows = ref([])

// 搜索表单
const searchForm = reactive({
  gatewayId: null,
  status: ''
})

// 分页数据
const formPageData = reactive(formPage)

// 对话框
const detailDialogVisible = ref(false)
const cleanDialogVisible = ref(false)
const currentDetail = ref(null)

// 清理表单
const cleanForm = reactive({
  days: 30
})

// 获取列表
const getList = async () => {
  loading.value = true
  try {
    const params = {
      gatewayId: searchForm.gatewayId,
      status: searchForm.status,
      page: formPageData.page,
      pageSize: formPageData.limit
    }

    const res = await DeadLetterService.getDeadLetterList(params)
    if (res.code === 200) {
      gridData.value = res.data.list || []
      formPageData.total = res.data.total || 0
    }
  } catch (error) {
    console.error('获取死信列表失败:', error)
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

// 重试单条
const handleRetry = async (row: any) => {
  try {
    const res = await DeadLetterService.retryDeadLetter(row.id)
    if (res.code === 200) {
      Modal.message({ message: '重试成功', status: 'success' })
      getList()
    } else {
      Modal.message({ message: res.message || '重试失败', status: 'error' })
    }
  } catch (error) {
    Modal.message({ message: '重试失败', status: 'error' })
  }
}

// 批量重试
const handleBatchRetry = async () => {
  if (selectedRows.value.length === 0) {
    Modal.message({ message: '请先选择要重试的记录', status: 'warning' })
    return
  }

  Modal.confirm({
    message: `确定要重试选中的 ${selectedRows.value.length} 条死信吗？`,
    status: 'warning'
  }).then(async () => {
    try {
      const ids = selectedRows.value.map((row: any) => row.id)
      const res = await DeadLetterService.batchRetryDeadLetters(ids)
      if (res.code === 200) {
        Modal.message({ message: `批量重试完成: 成功${res.data}条`, status: 'success' })
        selectedRows.value = []
        getList()
      }
    } catch (error) {
      Modal.message({ message: '批量重试失败', status: 'error' })
    }
  })
}

// 查看详情
const handleViewDetail = (row: any) => {
  currentDetail.value = row
  detailDialogVisible.value = true
}

// 删除
const handleDelete = (row: any) => {
  Modal.confirm({
    message: `确定删除这条死信记录吗？`,
    status: 'warning'
  }).then(async () => {
    try {
      await DeadLetterService.deleteDeadLetter(row.id)
      Modal.message({ message: '删除成功', status: 'success' })
      getList()
    } catch (error) {
      Modal.message({ message: '删除失败', status: 'error' })
    }
  })
}

// 清理旧记录
const handleCleanOld = () => {
  cleanDialogVisible.value = true
}

const handleCleanConfirm = async () => {
  try {
    const res = await DeadLetterService.cleanOldDeadLetters(cleanForm.days)
    if (res.code === 200) {
      Modal.message({
        message: `清理完成: 删除了${res.data}条记录`,
        status: 'success'
      })
      cleanDialogVisible.value = false
      getList()
    }
  } catch (error) {
    Modal.message({ message: '清理失败', status: 'error' })
  }
}

// 选择变化
const handleSelectionChange = (selection: any) => {
  selectedRows.value = selection
}

// 工具函数
const getStatusTagType = (status: string) => {
  const map: any = {
    PENDING: 'warning',
    SUCCESS: 'success',
    FAILED: 'danger'
  }
  return map[status] || 'info'
}

const getStatusLabel = (status: string) => {
  const map: any = {
    PENDING: '待处理',
    SUCCESS: '成功',
    FAILED: '失败'
  }
  return map[status] || status
}

const getRetryCountColor = (current: number, max: number) => {
  const ratio = current / max
  if (ratio >= 0.8) return '#f56c6c'
  if (ratio >= 0.5) return '#e6a23c'
  return '#67c23a'
}

const truncateText = (text: string, length: number) => {
  if (!text) return '-'
  return text.length > length ? text.substring(0, length) + '...' : text
}

onMounted(() => {
  getList()
  // 计算表格高度
  PageUtils.setTableHeight(200)
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

.message-content {
  word-break: break-all;
  white-space: pre-wrap;
}

.error-message {
  color: #f56c6c;
  font-size: 12px;
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
  max-height: 200px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

.detail-content.error {
  background: #fef0f0;
  color: #f56c6c;
  border: 1px solid #fde2e2;
}
</style>
