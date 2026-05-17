<template>
  <div class="container-list">
    <Breadcrumb :items="['menu.connector.center']" />
    <div ref="contain" class="contain">
      <tiny-grid
        v-if="!showSubPage"
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
                    v-model="searchForm.search"
                    clearable
                    is-enter-search
                    placeholder="请输入关键词"
                    style="width: 300px"
                    @search="handlerSearch"
                  ></tiny-search>
                </tiny-form-item>
                <tiny-form-item>
                  <tiny-button size="small" type="primary" @click="openForm()">创建</tiny-button>
                  <tiny-button size="small" @click="handleRefresh">刷新</tiny-button>
                </tiny-form-item>
              </tiny-form>
            </template>
          </tiny-grid-toolbar>
        </template>

        <tiny-grid-column type="index" width="50"></tiny-grid-column>

        <tiny-grid-column :title="$t('common.name')" field="name"></tiny-grid-column>

        <tiny-grid-column
          :title="$t('connector.icon')"
          align="center"
          field="productImage"
          fixed="left"
          width="70"
        >
          <template v-slot="data">
            <tiny-image class="product-icon" v-bind:src="data.row.productImage"></tiny-image>
          </template>
        </tiny-grid-column>

        <tiny-grid-column
          :title="$t('connector.product')"
          field="product"
          width="150"
        ></tiny-grid-column>

        <tiny-grid-column
          :title="$t('connector.version')"
          align="center"
          field="version"
          width="100"
        ></tiny-grid-column>

        <!--        <tiny-grid-column
            :title="$t('connector.category')"
            field="category"
            fixed="left"
            width="130"
        ></tiny-grid-column>-->

        <tiny-grid-column :title="$t('connector.tags')" align="center" field="tags">
          <template #default="data">
            <tiny-tag v-for="(tag, index) in data.row.tags" :key="index" type="success">
              {{ tag }}
            </tiny-tag>
          </template>
        </tiny-grid-column>

        <tiny-grid-column
          :title="$t('common.operations.status')"
          align="center"
          field="statusLabel"
          width="100"
        >
        </tiny-grid-column>

        <tiny-grid-column title="告警" align="center" width="80">
          <template #default="data">
            <tiny-badge
              v-if="getAlertCount(data.row.id) > 0"
              :value="getAlertCount(data.row.id)"
              type="danger"
              @click="viewConnectorAlerts(data.row.id)"
              style="cursor: pointer"
            >
              <tiny-button type="text" size="small" @click="viewConnectorAlerts(data.row.id)"
                >查看</tiny-button
              >
            </tiny-badge>
            <span v-else style="color: #67c23a">正常</span>
          </template>
        </tiny-grid-column>

        <tiny-grid-column
          :title="$t('connector.creatorName')"
          align="center"
          field="creatorName"
          width="130"
        ></tiny-grid-column>

        <!--suppress HtmlDeprecatedAttribute -->
<!--        <tiny-grid-column
          :title="$t('connector.createTime')"
          align="center"
          field="createTime"
          width="180"
        ></tiny-grid-column>-->

        <tiny-grid-column
          :title="$t('connector.lastUpdateTime')"
          align="center"
          field="lastUpdateTime"
          width="180"
        ></tiny-grid-column>

        <tiny-grid-column :title="$t('common.operations')" align="center" width="100">
          <template v-slot="data">
            <div style="display: flex; gap: 10px; justify-content: center; align-items: center;">
              <div :title="$t('common.operations.edit')">
                <tiny-icon-edit
                  @click="handleEdit(data.row)"
                  style="font-size: 20px; cursor: pointer; fill: #52c41a; color: #52c41a;"
                />
              </div>
              <div :title="$t('common.operations.delete')">
                <tiny-icon-del
                  @click="handleDelete(data.row)"
                  style="font-size: 20px; cursor: pointer; fill: #f56c6c; color: #f56c6c;"
                />
              </div>
            </div>
          </template>
        </tiny-grid-column>
      </tiny-grid>
      <!--分页-->
      <tiny-pager
        v-if="!showSubPage"
        :align="formPage.align"
        :current-page="formPage.page"
        :layout="formPage.layout"
        :page-size="formPage.limit"
        :page-sizes="formPage.pageSizes"
        :total="formPage.total"
        @current-change="pageChange"
        @size-change="limitChange"
      ></tiny-pager>

      <div>
        <div v-if="showSubPage">
          <component :is="subComponent" :currentRow="currentRow" @back="handleBack"></component>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent, onMounted, onUnmounted, reactive, ref, toRaw } from 'vue'
import {
  Grid as TinyGrid,
  Modal,
  Tag as TinyTag,
  Badge as TinyBadge,
  TinyActionMenu,
  TinyButton,
  TinyForm,
  TinyFormItem,
  TinyGridColumn,
  TinyGridToolbar,
  TinyImage,
  TinySearch
} from '@opentiny/vue'
import { iconDel, iconEdit } from '@opentiny/vue-icon'
import { useI18n } from 'vue-i18n'
import { formatDateTime } from '@/utils/date'
import { formPage } from '@/utils/tool'
import { PageUtils } from '@/utils/page'
import emitter from '@/utils/evnetbus'
import { ConnectorService } from '@/services/connector'
import { AlertHistoryApi } from '@/api/alert'
import { useRouter } from 'vue-router'
import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'

const TinyIconEdit = iconEdit()
const TinyIconDel = iconDel()

const { t } = useI18n()
const router = useRouter()
const loading = ref(false)
const tableHeight = ref(500)
const gridRef = ref(null)
const gridData = ref<any[]>([])
const source = ref([])
const currentSource = ref()

// 告警数量映射
const alertCountMap = ref<Map<string, number>>(new Map())

// WebSocket客户端
let stompClient: Client | null = null
const wsConnected = ref(false)

// ========== 统计数据 computed ==========

// 总连接器数
const totalConnectors = computed(() => {
  return formPage.value.total || 0
})

// 在线率
const onlineRate = computed(() => {
  if (!gridData.value || gridData.value.length === 0) return '0%'
  const onlineCount = gridData.value.filter(
    (item) => item.status === 'CONNECTED' || item.status === 'INITIALIZED'
  ).length
  const rate = ((onlineCount / gridData.value.length) * 100).toFixed(0)
  return `${rate}%`
})

// 平均响应时间
const avgResponseTime = computed(() => {
  if (!gridData.value || gridData.value.length === 0) return '0ms'
  const validItems = gridData.value.filter((item) => item.responseTime && item.responseTime > 0)
  if (validItems.length === 0) return '0ms'

  const totalTime = validItems.reduce((sum, item) => sum + (item.responseTime || 0), 0)
  const avg = Math.round(totalTime / validItems.length)
  return `${avg}ms`
})

// 活跃告警数
const activeAlertsCount = computed(() => {
  let total = 0
  alertCountMap.value.forEach((count) => {
    total += count
  })
  return total
})

const subComponent = defineAsyncComponent(
  () => import('@/views/connector/components/connector-form.vue')
)
const showSubPage = ref(false)
const currentRow = ref()

// 编辑操作
const handleEdit = (row: any) => {
  const name = row.name
  currentRow.value = toRaw(row)
  currentSource.value = source.value.filter((item: any) => item.metadata.name == name)[0]
  showSubPage.value = true
}

// 删除操作
const handleDelete = (row: any) => {
  const name = row.name
  const id = row.id
  Modal.confirm({
    title: '删除确认',
    message: '确定要删除' + '[' + name + ']吗？',
    showHeader: true,
    showFooter: true,
    resize: true,
    events: {
      confirm() {
        ConnectorService.deleteConnector(id).then((response: any) => {
          if (response.msg === 'success') {
            Modal.message({ status: 'success', message: '删除成功!', top: 20 })
            handlerSearch()
          } else {
            Modal.message({ status: 'error', message: response.msg, top: 20 })
          }
        })
      }
    }
  })
}

// 组件挂载时加载数据
onMounted(() => {
  loadData()
  tableHeight.value = PageUtils.setTableHeight(null)
  // 连接WebSocket接收实时状态推送
  connectWebSocket()
})

// 组件卸载时断开WebSocket
onUnmounted(() => {
  disconnectWebSocket()
})

const connectorStatus = ref([
  { name: 'INITIALIZED', label: '初始化' },
  { name: 'CONNECTED', label: '已连接' },
  { name: 'DISCONNECTED', label: '已断开' },
  { name: 'FAILED', label: '连接失败' },
  { name: 'CLOSED', label: '已关闭' },
  { name: 'SUSPENDED', label: '已暂停' },
  { name: 'RECONNECTING', label: '重连中' }
])

const formatTimestamp = (creationTimestamp: any) => {
  if (creationTimestamp) {
    const date = new Date(creationTimestamp)
    return formatDateTime(date)
  }
  return creationTimestamp
}

const openForm = () => {
  currentRow.value = null
  showSubPage.value = true
}

const pageChange = (page: number) => {
  formPage.value.page = page
  loadData()
}

const limitChange = (limit: number) => {
  formPage.value.limit = limit
  loadData()
}

// 搜索表单
const searchForm = reactive({
  search: ''
})

const loadData = async () => {
  try {
    loading.value = true
    const params = {
      ...searchForm,
      page: formPage.value.page,
      pageSize: formPage.value.limit
    }
    const res: any = await ConnectorService.getConnectorList(params)
    if (res.msg === 'success') {
      res.data.list.forEach((item: any) => {
        item.createTime = formatTimestamp(item.createTime)
        item.lastUpdateTime = formatTimestamp(item.lastUpdateTime)
        const findStatus = connectorStatus.value.find((x) => x.name === item.status)
        if (findStatus) {
          item.statusLabel = findStatus.label
        }
        item.productImage = '/images/products/' + item.icon
        if (item.tags) {
          item.tags = JSON.parse(item.tags)
        }
      })
      gridData.value = res.data.list
      formPage.value.total = res.data.total || 0

      // 加载每个连接器的告警数量
      await loadAlertCounts()
    }
  } catch (error) {
    console.error('Failed to load connectors:', error)
  } finally {
    loading.value = false
  }
}

// 加载所有连接器的告警数量
const loadAlertCounts = async () => {
  try {
    // 获取所有活跃告警
    const res: any = await AlertHistoryApi.getActiveAlerts()

    if (res.code === 0 && res.data) {
      // 清空旧数据
      alertCountMap.value.clear()

      // 统计每个连接器的告警数量
      const alerts = res.data || []
      alerts.forEach((alert: any) => {
        if (alert.sourceId) {
          const currentCount = alertCountMap.value.get(alert.sourceId) || 0
          alertCountMap.value.set(alert.sourceId, currentCount + 1)
        }
      })
    }
  } catch (error) {
    console.error('Failed to load alert counts:', error)
  }
}

// 获取连接器的告警数量
const getAlertCount = (connectorId: string): number => {
  return alertCountMap.value.get(connectorId) || 0
}

// 查看连接器的告警
const viewConnectorAlerts = (connectorId: string) => {
  // 跳转到连接器告警中心页面，并传递connectorId参数
  router.push({
    path: '/connector/alert-center',
    query: { connectorId }
  })
}

// ====================
// WebSocket 实时推送
// ====================

/**
 * 连接WebSocket
 */
const connectWebSocket = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
  const wsUrl = `${baseUrl}/ws`

  const socket = new SockJS(wsUrl)
  stompClient = new Client({
    webSocketFactory: () => socket as any,
    // 关闭 debug 日志，减少控制台干扰
    debug: () => {},
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    onConnect: () => {
      console.log('WebSocket连接成功')
      wsConnected.value = true

      // 订阅连接器状态增量更新
      stompClient?.subscribe('/topic/connector/status', (message) => {
        const changes = JSON.parse(message.body)
        handleStatusChanges(changes)
      })

      // 订阅全量同步（初始化时使用）
      stompClient?.subscribe('/topic/connector/status/full', (message) => {
        const allData = JSON.parse(message.body)
        handleFullSync(allData)
      })

      // 订阅告警数量变化
      stompClient?.subscribe('/topic/connector/alerts', (message) => {
        const alertCounts = JSON.parse(message.body)
        handleAlertCountChanges(alertCounts)
      })
    },
    onDisconnect: () => {
      console.log('WebSocket断开连接')
      wsConnected.value = false
    },
    onStompError: (frame) => {
      console.error('WebSocket错误:', frame)
      wsConnected.value = false
    }
  })

  stompClient.activate()
}

/**
 * 断开WebSocket
 */
const disconnectWebSocket = () => {
  if (stompClient) {
    stompClient.deactivate()
    stompClient = null
    wsConnected.value = false
  }
}

/**
 * 处理增量状态变化（只更新变化的连接器）
 */
const handleStatusChanges = (changes: Record<string, any>) => {
  let updatedCount = 0

  for (const connectorId in changes) {
    const statusData = changes[connectorId]

    // 在gridData中找到对应的连接器
    const index = gridData.value.findIndex((item) => item.id === connectorId)

    if (index !== -1) {
      // 找到了，直接修改对象属性（不要替换整个对象）
      const currentItem = gridData.value[index]

      // 只更新变化的字段
      if (statusData.status && statusData.status !== currentItem.status) {
        currentItem.status = statusData.status
        const findStatus = connectorStatus.value.find((x) => x.name === statusData.status)
        if (findStatus) {
          currentItem.statusLabel = findStatus.label
        }
      }

      // 更新其他字段
      if (statusData.checkTime) {
        currentItem.lastCheckTime = formatDateTime(new Date(statusData.checkTime))
      }

      // 不需要 splice，Vue 3 会自动追踪变化
      updatedCount++

      console.log(`连接器 ${statusData.connectorName} 状态更新: ${statusData.changeType}`)
    }
  }

  if (updatedCount > 0) {
    console.log(`已更新 ${updatedCount} 个连接器状态`)
  }
}

/**
 * 处理全量同步（初始化时使用）
 */
const handleFullSync = (allData: Record<string, any>) => {
  console.log('接收到全量连接器状态同步')

  for (const connectorId in allData) {
    const statusData = allData[connectorId]
    const index = gridData.value.findIndex((item) => item.id === connectorId)

    if (index !== -1) {
      // 直接修改对象属性，不要替换整个对象
      const currentItem = gridData.value[index]

      if (statusData.status) {
        currentItem.status = statusData.status
        const findStatus = connectorStatus.value.find((x) => x.name === statusData.status)
        if (findStatus) {
          currentItem.statusLabel = findStatus.label
        }
      }

      if (statusData.checkTime) {
        currentItem.lastCheckTime = formatDateTime(new Date(statusData.checkTime))
      }

      // Vue 3 会自动追踪变化，不需要 splice
    }
  }
}

/**
 * 处理告警数量变化
 */
const handleAlertCountChanges = (alertCounts: Record<string, number>) => {
  let updatedCount = 0

  for (const connectorId in alertCounts) {
    const count = alertCounts[connectorId]
    const oldCount = alertCountMap.value.get(connectorId) || 0

    if (count !== oldCount) {
      alertCountMap.value.set(connectorId, count)
      updatedCount++
      console.log(`连接器 ${connectorId} 告警数量更新: ${oldCount} -> ${count}`)
    }
  }

  if (updatedCount > 0) {
    console.log(`已更新 ${updatedCount} 个连接器的告警数量`)
    // 触发响应式更新
    alertCountMap.value = new Map(alertCountMap.value)
  }
}

//Create Resource
const showCreate = ref(false)

const handlerSearch = async () => await loadData()

const handleCreateClose = () => {
  showCreate.value = false
}
emitter.on('handleCreateClose', handleCreateClose)

const handleRefresh = async () => {
  await loadData()
}
emitter.on('handleRefresh', handleRefresh)

const handleBack = () => {
  showSubPage.value = false
}
emitter.on('handleBack', handleBack)

const handleConnector = async () => {
  showSubPage.value = false
  await loadData()
}
emitter.on('handleConnector', handleConnector)
</script>

<style lang="less" scoped>
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

  .product-icon {
    margin-left: 10px;
    width: 26px;
    height: 26px;
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

// 修复 ActionMenu 自定义 item 插槽的布局
.action-icon-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  cursor: pointer;
}
</style>
