<template>
  <div class="dashboard-container">
    <!-- 区域1：核心指标卡片 -->
    <div class="metric-cards">
      <tiny-card class="metric-card">
        <template #default>
          <div class="card-content">
            <div class="card-icon connector-icon">
              <component :is="iconPushpin()" />
            </div>
            <div class="card-body">
              <div class="card-title">连接器总览</div>
              <div class="card-value">{{ overview?.connectorOverview?.totalCount || 0 }}</div>
              <div class="card-detail">
                <span class="success">在线: {{ overview?.connectorOverview?.onlineCount || 0 }}</span>
                <span class="error">异常: {{ overview?.connectorOverview?.errorCount || 0 }}</span>
              </div>
              <div class="card-footer">
                <span>成功率: {{ overview?.connectorOverview?.successRate || 0 }}%</span>
                <span :class="overview?.connectorOverview?.changeRate >= 0 ? 'trend-up' : 'trend-down'">
                  {{ overview?.connectorOverview?.changeRate >= 0 ? '↑' : '↓' }} 
                  {{ Math.abs(overview?.connectorOverview?.changeRate || 0) }}%
                </span>
              </div>
            </div>
          </div>
        </template>
      </tiny-card>

      <tiny-card class="metric-card">
        <template #default>
          <div class="card-content">
            <div class="card-icon task-icon">
              <component :is="iconCheckedTrue()" />
            </div>
            <div class="card-body">
              <div class="card-title">任务执行概况</div>
              <div class="card-value">{{ overview?.taskExecutionOverview?.totalCount || 0 }}</div>
              <div class="card-detail">
                <span class="success">成功: {{ overview?.taskExecutionOverview?.successCount || 0 }}</span>
                <span class="error">失败: {{ overview?.taskExecutionOverview?.failedCount || 0 }}</span>
              </div>
              <div class="card-footer">
                <span>成功率: {{ overview?.taskExecutionOverview?.successRate || 0 }}%</span>
                <span :class="overview?.taskExecutionOverview?.changeRate >= 0 ? 'trend-up' : 'trend-down'">
                  {{ overview?.taskExecutionOverview?.changeRate >= 0 ? '↑' : '↓' }} 
                  {{ Math.abs(overview?.taskExecutionOverview?.changeRate || 0) }}%
                </span>
              </div>
            </div>
          </div>
        </template>
      </tiny-card>

      <tiny-card class="metric-card">
        <template #default>
          <div class="card-content">
            <div class="card-icon transfer-icon">
              <component :is="iconRefres()" />
            </div>
            <div class="card-body">
              <div class="card-title">数据传输量</div>
              <div class="card-value">{{ formatNumber(overview?.dataTransferOverview?.totalRecords || 0) }}</div>
              <div class="card-detail">
                <span>数据量: {{ formatBytes(overview?.dataTransferOverview?.totalBytes || 0) }}</span>
              </div>
              <div class="card-footer">
                <span>峰值: {{ formatNumber(overview?.dataTransferOverview?.peakRate || 0) }}/s</span>
                <span :class="overview?.dataTransferOverview?.changeRate >= 0 ? 'trend-up' : 'trend-down'">
                  {{ overview?.dataTransferOverview?.changeRate >= 0 ? '↑' : '↓' }} 
                  {{ Math.abs(overview?.dataTransferOverview?.changeRate || 0) }}%
                </span>
              </div>
            </div>
          </div>
        </template>
      </tiny-card>

      <tiny-card class="metric-card">
        <template #default>
          <div class="card-content">
            <div class="card-icon gateway-icon">
              <component :is="iconCloudUpload()" />
            </div>
            <div class="card-body">
              <div class="card-title">协议网关状态</div>
              <div class="card-value">{{ overview?.gatewayOverview?.totalCount || 0 }}</div>
              <div class="card-detail">
                <span class="success">运行中: {{ overview?.gatewayOverview?.runningCount || 0 }}</span>
                <span class="warning">死信: {{ overview?.gatewayOverview?.deadLetterCount || 0 }}</span>
              </div>
              <div class="card-footer">
                <span>今日消息: {{ formatNumber(overview?.gatewayOverview?.messageCount || 0) }}</span>
              </div>
            </div>
          </div>
        </template>
      </tiny-card>
    </div>

    <!-- 区域2：实时趋势图表 -->
    <div class="trend-charts">
      <div class="chart-card">
        <div class="chart-header">
          <h3>任务执行趋势</h3>
          <tiny-select v-model="executionTimeRange" @change="loadExecutionTrend" size="mini">
            <tiny-option label="最近24小时" value="24h" />
            <tiny-option label="最近7天" value="7d" />
          </tiny-select>
        </div>
        <div class="chart-content">
          <div ref="executionChartRef" class="chart-container"></div>
        </div>
      </div>

      <div class="chart-card">
        <div class="chart-header">
          <h3>数据传输趋势</h3>
          <tiny-select v-model="transferTimeRange" @change="loadTransferTrend" size="mini">
            <tiny-option label="最近24小时" value="24h" />
            <tiny-option label="最近7天" value="7d" />
          </tiny-select>
        </div>
        <div class="chart-content">
          <div ref="transferChartRef" class="chart-container"></div>
        </div>
      </div>
    </div>

    <!-- 区域3：多维度统计 -->
    <div class="statistics-charts">
      <div class="stat-card">
        <div class="chart-header">
          <h3>连接器健康分布</h3>
        </div>
        <div class="chart-content">
          <div ref="connectorHealthChartRef" class="chart-container small"></div>
        </div>
      </div>

      <div class="stat-card">
        <div class="chart-header">
          <h3>TOP 10 热门连接器</h3>
        </div>
        <div class="chart-content">
          <div ref="topConnectorsChartRef" class="chart-container small"></div>
        </div>
      </div>

      <div class="stat-card">
        <div class="chart-header">
          <h3>任务类型分布</h3>
        </div>
        <div class="chart-content">
          <div ref="taskDistributionChartRef" class="chart-container small"></div>
        </div>
      </div>
    </div>

    <!-- 区域4：实时动态列表 -->
    <div class="dynamic-lists">
      <div class="list-card">
        <div class="chart-header">
          <h3>运行中任务 TOP 10</h3>
        </div>
        <div class="chart-content">
          <tiny-grid :data="runningTasks" :show-header="true" size="mini">
            <tiny-grid-column field="dagName" title="任务名称" />
            <tiny-grid-column field="taskType" title="类型" width="100" />
            <tiny-grid-column field="progress" title="进度" width="120">
              <template #default="{ row }">
                <tiny-progress :percentage="row.progress" :show-text="true" />
              </template>
            </tiny-grid-column>
            <tiny-grid-column field="elapsedTime" title="已耗时" width="120">
              <template #default="{ row }">
                {{ formatDuration(row.elapsedTime) }}
              </template>
            </tiny-grid-column>
            <tiny-grid-column field="startTime" title="开始时间" width="120" />
          </tiny-grid>
        </div>
      </div>

      <div class="list-card">
        <div class="chart-header">
          <h3>最近失败任务 TOP 10</h3>
        </div>
        <div class="chart-content">
          <tiny-grid :data="failedTasks" :show-header="true" size="mini">
            <tiny-grid-column field="dagName" title="任务名称" />
            <tiny-grid-column field="taskType" title="类型" width="100" />
            <tiny-grid-column field="failedTime" title="失败时间" width="120" />
            <tiny-grid-column field="errorMessage" title="错误信息" :show-overflow-tooltip="true">
              <template #default="{ row }">
                <span class="error-text">{{ row.errorMessage }}</span>
              </template>
            </tiny-grid-column>
            <tiny-grid-column title="操作" width="100">
              <template #default="{ row }">
                <div style="display: flex; gap: 10px; justify-content: center; align-items: center;">
                  <div title="查看日志">
                    <tiny-icon-view
                      @click="viewLog(row)"
                      style="font-size: 20px; cursor: pointer; fill: #409eff; color: #409eff;"
                    />
                  </div>
                </div>
              </template>
            </tiny-grid-column>
          </tiny-grid>
        </div>
      </div>
    </div>
  </div>

  <!-- 执行详情抽屉 -->
  <tiny-drawer
    v-model:visible="detailDrawerVisible"
    :title="`执行详情 - ${currentExecution?.dagName || ''}`"
    :show-footer="false"
    width="100%"
    :mask="false"
    placement="right"
  >
    <ExecutionMonitor
      v-if="detailDrawerVisible && currentExecution"
      :execution-id="currentExecution.id"
      :in-drawer="true"
    />
  </tiny-drawer>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Select as TinySelect, Option as TinyOption, Grid as TinyGrid, GridColumn as TinyGridColumn, Progress as TinyProgress, Button as TinyButton, Drawer as TinyDrawer } from '@opentiny/vue'
import { iconPushpin, iconCheckedTrue, iconRefres, iconCloudUpload, iconView } from '@opentiny/vue-icon'
import * as echarts from 'echarts'
import { dashboardApi } from '@/api/dashboard'
import { slowQueryApi } from '@/api/query'
import { useRouter } from 'vue-router'
import ExecutionMonitor from '@/views/flow/execution-monitor.vue'

const TinyIconView = iconView()

const router = useRouter()

// 执行详情抽屉
const detailDrawerVisible = ref(false)
const currentExecution = ref<any>(null)

// 数据
const overview = ref<any>(null)
const runningTasks = ref<any[]>([])
const failedTasks = ref<any[]>([])
const slowQueries = ref<any[]>([])
const executionTimeRange = ref('24h')
const transferTimeRange = ref('24h')

// 图表引用
const executionChartRef = ref<HTMLElement>()
const transferChartRef = ref<HTMLElement>()
const connectorHealthChartRef = ref<HTMLElement>()
const topConnectorsChartRef = ref<HTMLElement>()
const taskDistributionChartRef = ref<HTMLElement>()

let executionChart: any = null
let transferChart: any = null
let connectorHealthChart: any = null
let topConnectorsChart: any = null
let taskDistributionChart: any = null
let refreshTimer: any = null

// 加载概览数据
const loadOverview = async () => {
  try {
    console.log('开始加载概览数据...')
    const res = await dashboardApi.getOverview()
    console.log('概览数据响应:', res)
    overview.value = res.data
    console.log('概览数据已设置:', overview.value)
  } catch (error) {
    console.error('加载概览数据失败', error)
  }
}

// 加载任务执行趋势
const loadExecutionTrend = async () => {
  try {
    const res = await dashboardApi.getExecutionTrend(executionTimeRange.value)
    if (executionChart) {
      const data = res.data || []
      
      // 生成时间标签（如果没有数据，生成默认标签）
      let timeLabels: string[] = []
      if (data.length > 0) {
        timeLabels = [...new Set(data.map((d: any) => d.time))].sort()
      } else {
        // 默认显示最近24小时
        const now = new Date()
        for (let i = 23; i >= 0; i--) {
          const time = new Date(now.getTime() - i * 3600000)
          timeLabels.push(time.getHours() + ':00')
        }
      }
      
      // 按状态分组
      const successData: any[] = []
      const failedData: any[] = []
      const runningData: any[] = []
      
      timeLabels.forEach((time: string) => {
        const successItem = data.find((d: any) => d.time === time && d.type === 'SUCCESS')
        const failedItem = data.find((d: any) => d.time === time && d.type === 'FAILED')
        const runningItem = data.find((d: any) => d.time === time && d.type === 'RUNNING')
        
        successData.push(successItem ? successItem.value : 0)
        failedData.push(failedItem ? failedItem.value : 0)
        runningData.push(runningItem ? runningItem.value : 0)
      })
      
      executionChart.setOption({
        tooltip: { trigger: 'axis' },
        legend: { data: ['成功', '失败', '运行中'] },
        xAxis: { type: 'category', data: timeLabels, boundaryGap: false },
        yAxis: { type: 'value' },
        series: [
          { name: '成功', type: 'line', data: successData, smooth: true, itemStyle: { color: '#52c41a' } },
          { name: '失败', type: 'line', data: failedData, smooth: true, itemStyle: { color: '#ff4d4f' } },
          { name: '运行中', type: 'line', data: runningData, smooth: true, itemStyle: { color: '#1890ff' } }
        ]
      })
    }
  } catch (error) {
    console.error('加载任务执行趋势失败', error)
    // 错误时也显示空图表
    if (executionChart) {
      const timeLabels = Array.from({length: 24}, (_, i) => i + ':00')
      executionChart.setOption({
        tooltip: { trigger: 'axis' },
        legend: { data: ['成功', '失败', '运行中'] },
        xAxis: { type: 'category', data: timeLabels, boundaryGap: false },
        yAxis: { type: 'value' },
        series: [
          { name: '成功', type: 'line', data: new Array(24).fill(0), smooth: true, itemStyle: { color: '#52c41a' } },
          { name: '失败', type: 'line', data: new Array(24).fill(0), smooth: true, itemStyle: { color: '#ff4d4f' } },
          { name: '运行中', type: 'line', data: new Array(24).fill(0), smooth: true, itemStyle: { color: '#1890ff' } }
        ]
      })
    }
  }
}

// 加载数据传输趋势
const loadTransferTrend = async () => {
  try {
    const res = await dashboardApi.getTransferTrend(transferTimeRange.value)
    if (transferChart) {
      const data = res.data || []
      
      let timeLabels: string[] = []
      let values: number[] = []
      
      if (data.length > 0) {
        timeLabels = data.map((d: any) => d.time)
        values = data.map((d: any) => d.value)
      } else {
        // 默认显示最近24小时
        const now = new Date()
        for (let i = 23; i >= 0; i--) {
          const time = new Date(now.getTime() - i * 3600000)
          timeLabels.push(time.getHours() + ':00')
          values.push(0)
        }
      }
      
      transferChart.setOption({
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: timeLabels, boundaryGap: false },
        yAxis: { type: 'value', name: '记录数' },
        series: [
          {
            type: 'line',
            data: values,
            smooth: true,
            areaStyle: { color: 'rgba(24, 144, 255, 0.2)' },
            itemStyle: { color: '#1890ff' }
          }
        ]
      })
    }
  } catch (error) {
    console.error('加载数据传输趋势失败', error)
    // 错误时也显示空图表
    if (transferChart) {
      const timeLabels = Array.from({length: 24}, (_, i) => i + ':00')
      transferChart.setOption({
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: timeLabels, boundaryGap: false },
        yAxis: { type: 'value', name: '记录数' },
        series: [
          {
            type: 'line',
            data: new Array(24).fill(0),
            smooth: true,
            areaStyle: { color: 'rgba(24, 144, 255, 0.2)' },
            itemStyle: { color: '#1890ff' }
          }
        ]
      })
    }
  }
}

// 加载连接器健康分布
const loadConnectorHealth = async () => {
  try {
    const res = await dashboardApi.getConnectorHealth()
    if (connectorHealthChart) {
      const data = res.data || {}
      const chartData = [
        { value: data.ONLINE || 0, name: '健康', itemStyle: { color: '#52c41a' } },
        { value: data.ERROR || 0, name: '异常', itemStyle: { color: '#ff4d4f' } },
        { value: data.OFFLINE || 0, name: '离线', itemStyle: { color: '#d9d9d9' } },
        { value: data.UNKNOWN || 0, name: '未知', itemStyle: { color: '#faad14' } }
      ]
      
      connectorHealthChart.setOption({
        tooltip: { trigger: 'item' },
        legend: { orient: 'vertical', left: 'left' },
        series: [
          {
            type: 'pie',
            radius: '60%',
            data: chartData,
            emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } }
          }
        ]
      })
    }
  } catch (error) {
    console.error('加载连接器健康分布失败', error)
    // 错误时也显示空图表
    if (connectorHealthChart) {
      const chartData = [
        { value: 0, name: '健康', itemStyle: { color: '#52c41a' } },
        { value: 0, name: '异常', itemStyle: { color: '#ff4d4f' } },
        { value: 0, name: '离线', itemStyle: { color: '#d9d9d9' } },
        { value: 1, name: '未知', itemStyle: { color: '#faad14' } }
      ]
      connectorHealthChart.setOption({
        tooltip: { trigger: 'item' },
        legend: { orient: 'vertical', left: 'left' },
        series: [
          {
            type: 'pie',
            radius: '60%',
            data: chartData,
            emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' } }
          }
        ]
      })
    }
  }
}

// 加载TOP连接器
const loadTopConnectors = async () => {
  try {
    const res = await dashboardApi.getTopConnectors(10)
    if (topConnectorsChart) {
      const data = res.data || []
      
      let names: string[] = []
      let values: number[] = []
      
      if (data.length > 0) {
        names = data.map((d: any) => d.name)
        values = data.map((d: any) => d.value)
      } else {
        names = ['暂无数据']
        values = [0]
      }
      
      topConnectorsChart.setOption({
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: '25%', right: '10%', top: '10%', bottom: '10%' },
        xAxis: { type: 'value' },
        yAxis: { 
          type: 'category', 
          data: names, 
          inverse: true,
          axisLabel: {
            width: 100,
            overflow: 'truncate',
            ellipsis: '...'
          }
        },
        series: [
          {
            type: 'bar',
            data: values,
            itemStyle: { color: '#1890ff' }
          }
        ]
      })
    }
  } catch (error) {
    console.error('加载TOP连接器失败', error)
    // 错误时也显示空图表
    if (topConnectorsChart) {
      topConnectorsChart.setOption({
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: '25%', right: '10%', top: '10%', bottom: '10%' },
        xAxis: { type: 'value' },
        yAxis: { 
          type: 'category', 
          data: ['暂无数据'], 
          inverse: true,
          axisLabel: {
            width: 100,
            overflow: 'truncate',
            ellipsis: '...'
          }
        },
        series: [
          {
            type: 'bar',
            data: [0],
            itemStyle: { color: '#1890ff' }
          }
        ]
      })
    }
  }
}

// 加载任务类型分布
const loadTaskDistribution = async () => {
  try {
    const res = await dashboardApi.getTaskDistribution()
    if (taskDistributionChart) {
      const data = res.data || {}
      const chartData = [
        { value: data.MANUAL || 0, name: '手动触发', itemStyle: { color: '#1890ff' } },
        { value: data.SCHEDULE || 0, name: '调度触发', itemStyle: { color: '#52c41a' } }
      ]
      
      taskDistributionChart.setOption({
        tooltip: { trigger: 'item' },
        legend: { orient: 'vertical', left: 'left' },
        series: [
          {
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            data: chartData
          }
        ]
      })
    }
  } catch (error) {
    console.error('加载任务类型分布失败', error)
    // 错误时也显示空图表
    if (taskDistributionChart) {
      const chartData = [
        { value: 0, name: '手动触发', itemStyle: { color: '#1890ff' } },
        { value: 0, name: '调度触发', itemStyle: { color: '#52c41a' } }
      ]
      taskDistributionChart.setOption({
        tooltip: { trigger: 'item' },
        legend: { orient: 'vertical', left: 'left' },
        series: [
          {
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            data: chartData
          }
        ]
      })
    }
  }
}

// 加载运行中任务
const loadRunningTasks = async () => {
  try {
    const res = await dashboardApi.getRunningTasks(10)
    runningTasks.value = res.data || []
  } catch (error) {
    console.error('加载运行中任务失败', error)
  }
}

// 加载失败任务
const loadFailedTasks = async () => {
  try {
    const res = await dashboardApi.getFailedTasks(10)
    failedTasks.value = res.data || []
  } catch (error) {
    console.error('加载失败任务失败', error)
  }
}

// 加载慢查询
const loadSlowQueries = async () => {
  try {
    const res = await slowQueryApi.list({ page: 1, pageSize: 5 })
    slowQueries.value = res.data?.list || []
  } catch (error) {
    console.error('加载慢查询失败', error)
  }
}

// 初始化图表
const initCharts = () => {
  if (executionChartRef.value) {
    executionChart = echarts.init(executionChartRef.value)
  }
  if (transferChartRef.value) {
    transferChart = echarts.init(transferChartRef.value)
  }
  if (connectorHealthChartRef.value) {
    connectorHealthChart = echarts.init(connectorHealthChartRef.value)
  }
  if (topConnectorsChartRef.value) {
    topConnectorsChart = echarts.init(topConnectorsChartRef.value)
  }
  if (taskDistributionChartRef.value) {
    taskDistributionChart = echarts.init(taskDistributionChartRef.value)
  }
}

// 加载所有数据
const loadAllData = () => {
  loadOverview()
  loadExecutionTrend()
  loadTransferTrend()
  loadConnectorHealth()
  loadTopConnectors()
  loadTaskDistribution()
  loadRunningTasks()
  loadFailedTasks()
  loadSlowQueries()
}

// 查看执行详情（打开抽屉）
const viewLog = (row: any) => {
  currentExecution.value = row
  detailDrawerVisible.value = true
}

// 格式化数字
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(2) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(2) + 'K'
  }
  return num.toString()
}

// 格式化字节
const formatBytes = (bytes: number): string => {
  if (bytes >= 1073741824) {
    return (bytes / 1073741824).toFixed(2) + ' GB'
  } else if (bytes >= 1048576) {
    return (bytes / 1048576).toFixed(2) + ' MB'
  } else if (bytes >= 1024) {
    return (bytes / 1024).toFixed(2) + ' KB'
  }
  return bytes + ' B'
}

// 格式化时长
const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  }
  return `${seconds}s`
}

onMounted(() => {
  initCharts()
  
  // 使用nextTick确保DOM完全渲染后再加载数据
  setTimeout(() => {
    loadAllData()
    // 强制resize一次确保图表正确渲染
    setTimeout(() => {
      executionChart?.resize()
      transferChart?.resize()
      connectorHealthChart?.resize()
      topConnectorsChart?.resize()
      taskDistributionChart?.resize()
    }, 100)
  }, 100)
  
  // 30秒自动刷新
  refreshTimer = setInterval(loadAllData, 30000)
  
  // 响应式调整图表大小
  window.addEventListener('resize', () => {
    executionChart?.resize()
    transferChart?.resize()
    connectorHealthChart?.resize()
    topConnectorsChart?.resize()
    taskDistributionChart?.resize()
  })
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
  executionChart?.dispose()
  transferChart?.dispose()
  connectorHealthChart?.dispose()
  topConnectorsChart?.dispose()
  taskDistributionChart?.dispose()
})
</script>

<style scoped lang="scss">
.dashboard-container {
  padding: 20px;
  background: #f0f2f5;
  height: 100%;
  overflow-y: auto;
  
  // 隐藏滚动条但保留滚动功能
  scrollbar-width: none;
  -ms-overflow-style: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
}

.metric-cards {
  display: flex;
  gap: clamp(8px, 1.2vw, 20px);
  margin-bottom: 20px;
  flex-wrap: nowrap;
  width: 100%;
}

.metric-card {
  flex: 1;
  min-width: 0;
  
  :deep(.tiny-card__body) {
    padding: clamp(12px, 1.5vw, 20px);
  }
  
  :deep(.tiny-card) {
    width: 100% !important;
  }
}

.card-content {
  display: flex;
  align-items: center;
  gap: clamp(6px, 0.8vw, 15px);
  min-width: 0;
  max-width: 100%;
}

.card-icon {
  font-size: clamp(28px, 2.5vw, 48px);
  width: clamp(40px, 3.5vw, 60px);
  height: clamp(40px, 3.5vw, 60px);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: clamp(4px, 0.5vw, 8px);
  flex-shrink: 0;
}

.connector-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.task-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.transfer-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.gateway-icon {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: white;
}

.card-body {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.card-title {
  font-size: clamp(11px, 0.85vw, 14px);
  color: #666;
  margin-bottom: clamp(4px, 0.5vw, 8px);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-value {
  font-size: clamp(20px, 1.8vw, 32px);
  font-weight: bold;
  color: #333;
  margin-bottom: clamp(4px, 0.5vw, 8px);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}

.card-detail {
  font-size: clamp(9px, 0.75vw, 12px);
  color: #999;
  margin-bottom: clamp(4px, 0.5vw, 8px);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
  
  span {
    margin-right: clamp(6px, 0.8vw, 15px);
    
    &.success {
      color: #52c41a;
    }
    
    &.error {
      color: #ff4d4f;
    }
    
    &.warning {
      color: #faad14;
    }
  }
}

.card-footer {
  display: flex;
  justify-content: space-between;
  font-size: clamp(9px, 0.75vw, 12px);
  color: #999;
  gap: clamp(4px, 0.5vw, 8px);
  line-height: 1.4;
  
  .trend-up {
    color: #52c41a;
  }
  
  .trend-down {
    color: #ff4d4f;
  }
}

.trend-charts {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.chart-card {
  width: 100%;
  min-width: 0;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e4e7ed;
  
  h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    white-space: nowrap;
    flex-shrink: 0;
  }
  
  .tiny-select {
    width: 120px;
    margin-left: 12px;
  }
}

.chart-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.chart-content {
  padding: 12px;
}

.chart-container {
  width: 100%;
  height: 280px;
  min-height: 280px;
  
  &.small {
    height: 200px;
    min-height: 200px;
  }
}

.statistics-charts {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  width: 100%;
  min-width: 0;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.dynamic-lists {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.list-card {
  width: 100%;
  min-width: 0;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  
  :deep(.tiny-grid) {
    border: none;
  }
  
  :deep(.tiny-grid__body-wrapper) {
    max-height: 300px;
    overflow-y: auto;
    
    // 滚动条样式
    scrollbar-width: thin;
    scrollbar-color: #dcdfe6 #f5f7fa;
    
    &::-webkit-scrollbar {
      width: 6px;
    }
    
    &::-webkit-scrollbar-track {
      background: #f5f7fa;
      border-radius: 3px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: #dcdfe6;
      border-radius: 3px;
      
      &:hover {
        background: #c0c4cc;
      }
    }
  }
  
  :deep(.tiny-grid-body__row) {
    cursor: pointer;
  }
}

.error-text {
  color: #ff4d4f;
}

.warning-text {
  color: #faad14;
  font-weight: bold;
}
</style>
