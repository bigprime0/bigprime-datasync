<template>
  <div class="container-list">
    <Breadcrumb :items="['告警中心', '告警仪表盘']" />
    
    <!-- 时间范围选择器 -->
    <div class="time-range-selector">
      <span 
        v-for="item in timeRangeOptions" 
        :key="item.value"
        :class="['time-option', { active: timeRange === item.value }]"
        @click="handleTimeRangeChange(item.value)"
      >
        {{ item.label }}
      </span>
      <span v-if="lastUpdateTime" class="last-update">最后更新: {{ lastUpdateTime }}</span>
    </div>
    
    <!-- 统计卡片 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon critical">
          <component :is="iconError()" />
        </div>
        <div class="stat-content">
          <div class="stat-label">严重告警</div>
          <div class="stat-value critical">{{ criticalCount }}</div>
          <div class="stat-trend" :class="criticalTrend > 0 ? 'up' : 'down'" v-if="criticalTrend !== 0">
            <component :is="criticalTrend > 0 ? iconUp() : iconDown()" />
            {{ Math.abs(criticalTrend) }}%
          </div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon error">
          <component :is="iconWarning()" />
        </div>
        <div class="stat-content">
          <div class="stat-label">错误告警</div>
          <div class="stat-value error">{{ errorCount }}</div>
          <div class="stat-trend" :class="errorTrend > 0 ? 'up' : 'down'" v-if="errorTrend !== 0">
            <component :is="errorTrend > 0 ? iconUp() : iconDown()" />
            {{ Math.abs(errorTrend) }}%
          </div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon warning">
          <component :is="iconHelp()" />
        </div>
        <div class="stat-content">
          <div class="stat-label">警告告警</div>
          <div class="stat-value warning">{{ warningCount }}</div>
          <div class="stat-trend" :class="warningTrend > 0 ? 'up' : 'down'" v-if="warningTrend !== 0">
            <component :is="warningTrend > 0 ? iconUp() : iconDown()" />
            {{ Math.abs(warningTrend) }}%
          </div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon info">
          <component :is="iconSuccess()" />
        </div>
        <div class="stat-content">
          <div class="stat-label">信息告警</div>
          <div class="stat-value info">{{ infoCount }}</div>
          <div class="stat-trend" :class="infoTrend > 0 ? 'up' : 'down'" v-if="infoTrend !== 0">
            <component :is="infoTrend > 0 ? iconUp() : iconDown()" />
            {{ Math.abs(infoTrend) }}%
          </div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-section">
      <!-- 告警趋势图 -->
      <div class="chart-card full-width">
        <div class="chart-header">
          <h3>告警趋势</h3>
        </div>
        <div ref="trendChartRef" class="chart-container"></div>
      </div>
    </div>

    <!-- 统计图表区域 -->
    <div class="charts-section">
      <!-- 告警级别分布 - 环形图 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>告警级别分布</h3>
        </div>
        <div ref="levelPieChartRef" class="chart-container-small"></div>
      </div>

      <!-- 模块分布 - 柱状图 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>模块告警分布</h3>
        </div>
        <div ref="moduleBarChartRef" class="chart-container-small"></div>
      </div>
    </div>

    <!-- 活跃告警列表 -->
    <div class="active-alerts-section">
      <div class="section-header">
        <h3>活跃告警</h3>
        <tiny-button size="small" @click="handleRefresh">刷新</tiny-button>
      </div>
      
      <tiny-grid
        ref="gridRef"
        :data="activeAlerts"
        :fit="true"
        :height="400"
        :loading="loading"
        :stripe="true"
        border
        highlight-hover-row
        show-header-overflow="tooltip"
        show-overflow="tooltip"
        size="small"
      >
        <tiny-grid-column type="index" width="50"></tiny-grid-column>
        
        <tiny-grid-column title="告警类型" field="alertType" width="150"></tiny-grid-column>
        
        <tiny-grid-column title="告警级别" field="alertLevel" align="center" width="100">
          <template #default="{ row }">
            <tiny-tag v-if="row.alertLevel === 'CRITICAL'" type="danger">严重</tiny-tag>
            <tiny-tag v-else-if="row.alertLevel === 'ERROR'" type="warning">错误</tiny-tag>
            <tiny-tag v-else-if="row.alertLevel === 'WARNING'" type="info">警告</tiny-tag>
            <tiny-tag v-else>信息</tiny-tag>
          </template>
        </tiny-grid-column>
        
        <tiny-grid-column title="所属模块" field="sourceModule" align="center" width="120"></tiny-grid-column>
        
        <tiny-grid-column title="告警消息" field="alertMessage"></tiny-grid-column>
        
        <tiny-grid-column title="触发时间" field="triggerTime" align="center" width="180"></tiny-grid-column>
        
        <tiny-grid-column title="操作" align="center" width="150">
          <template #default="{ row }">
            <div style="display: flex; gap: 10px; justify-content: center; align-items: center;">
              <div title="解决">
                <tiny-icon-success
                  @click="handleResolve(row)"
                  style="font-size: 20px; cursor: pointer; fill: #52c41a; color: #52c41a;"
                />
              </div>
              <div title="忽略">
                <tiny-icon-warning
                  @click="handleIgnore(row)"
                  style="font-size: 20px; cursor: pointer; fill: #faad14; color: #faad14;"
                />
              </div>
            </div>
          </template>
        </tiny-grid-column>
      </tiny-grid>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue'
import {
  Grid as TinyGrid,
  Modal,
  Tag as TinyTag,
  TinyButton,
  TinyGridColumn
} from '@opentiny/vue'
import {
  iconError,
  iconWarning,
  iconHelp,
  iconSuccess,
  iconUp,
  iconDown
} from '@opentiny/vue-icon'
import * as echarts from 'echarts'
import { AlertHistoryApi } from '@/api/alert'
import { formatDateTime } from '@/utils/date'
import Breadcrumb from '@/components/breadcrumb/index.vue'
import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'

const TinyIconSuccess = iconSuccess()
const TinyIconWarning = iconWarning()

const loading = ref(false)
const gridRef = ref(null)
const activeAlerts = ref<any[]>([])
const timeRange = ref('24h')
const lastUpdateTime = ref('')
const wsConnected = ref(false)

let stompClient: Client | null = null

// 时间范围选项
const timeRangeOptions = [
  { label: '24小时', value: '24h' },
  { label: '7天', value: '7d' },
  { label: '30天', value: '30d' }
]

// 统计数据
const criticalCount = ref(0)
const errorCount = ref(0)
const warningCount = ref(0)
const infoCount = ref(0)

// 环比数据
const criticalTrend = ref(0)
const errorTrend = ref(0)
const warningTrend = ref(0)
const infoTrend = ref(0)

// 图表引用
const trendChartRef = ref(null)
const levelPieChartRef = ref(null)
const moduleBarChartRef = ref(null)

let trendChart: any = null
let levelPieChart: any = null
let moduleBarChart: any = null

// WebSocket连接
const connectWebSocket = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
  const wsUrl = `${baseUrl}/ws/alert`
  
  const socket = new SockJS(wsUrl)
  stompClient = new Client({
    webSocketFactory: () => socket as any,
    debug: (str) => {
      console.log('STOMP: ' + str)
    },
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    onConnect: () => {
      console.log('WebSocket连接成功')
      wsConnected.value = true
      
      // 订阅活跃告警
      stompClient?.subscribe('/topic/alert/active', (message) => {
        const alerts = JSON.parse(message.body)
        activeAlerts.value = alerts.map((item: any) => ({
          ...item,
          triggerTime: formatDateTime(item.triggerTime)
        }))
        updateLastUpdateTime()
      })
      
      // 订阅统计数据
      stompClient?.subscribe('/topic/alert/stats', (message) => {
        const stats = JSON.parse(message.body)
        criticalCount.value = stats.critical || 0
        errorCount.value = stats.error || 0
        warningCount.value = stats.warning || 0
        infoCount.value = stats.info || 0
        criticalTrend.value = stats.criticalTrend || 0
        errorTrend.value = stats.errorTrend || 0
        warningTrend.value = stats.warningTrend || 0
        infoTrend.value = stats.infoTrend || 0
        updateCharts()
      })
      
      // 订阅趋势数据
      stompClient?.subscribe('/topic/alert/trend', (message) => {
        const trendData = JSON.parse(message.body)
        if (trendChart) {
          const hours = trendData.map((item: any) => item.hour)
          const criticalData = trendData.map((item: any) => item.critical || 0)
          const errorData = trendData.map((item: any) => item.error || 0)
          const warningData = trendData.map((item: any) => item.warning || 0)
          const infoData = trendData.map((item: any) => item.info || 0)
          
          trendChart.setOption({
            xAxis: { data: hours },
            series: [
              { data: criticalData },
              { data: errorData },
              { data: warningData },
              { data: infoData }
            ]
          })
        }
      })
      
      // 订阅新告警通知
      stompClient?.subscribe('/topic/alert/new', (message) => {
        const alert = JSON.parse(message.body)
        Modal.message({ 
          message: `新告警: ${alert.alertType} - ${alert.alertLevel}`, 
          status: 'warning',
          duration: 3000
        })
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

// 断开WebSocket连接
const disconnectWebSocket = () => {
  if (stompClient) {
    stompClient.deactivate()
    stompClient = null
  }
}

// 更新最后更新时间
const updateLastUpdateTime = () => {
  const now = new Date()
  lastUpdateTime.value = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
}

// 加载活跃告警和统计数据
const loadActiveAlerts = async () => {
  loading.value = true
  try {
    // 获取时间范围对应的小时数
    const hours = timeRange.value === '24h' ? 24 : (timeRange.value === '7d' ? 168 : 720)
    
    // 并行请求活跃告警、统计数据和趋势数据
    const [alertsRes, statsRes, trendRes] = await Promise.all([
      AlertHistoryApi.getActiveAlerts(),
      AlertHistoryApi.getAlertStatsWithTrend(hours),
      AlertHistoryApi.getHourlyTrend(hours)
    ])
    
    if (alertsRes.code === 0) {
      const alertsData = alertsRes.data || []
      activeAlerts.value = alertsData.map((item: any) => ({
        ...item,
        triggerTime: formatDateTime(item.triggerTime)
      }))
    } else {
      Modal.message({ message: alertsRes.msg, status: 'error' })
      activeAlerts.value = []
    }
    
    // 更新统计数据和环比
    if (statsRes.code === 0) {
      const stats = statsRes.data
      criticalCount.value = stats.critical || 0
      errorCount.value = stats.error || 0
      warningCount.value = stats.warning || 0
      infoCount.value = stats.info || 0
      criticalTrend.value = stats.criticalTrend || 0
      errorTrend.value = stats.errorTrend || 0
      warningTrend.value = stats.warningTrend || 0
      infoTrend.value = stats.infoTrend || 0
    } else {
      // 如果统计接口失败，使用活跃告警数据计算当前值
      calculateStats(alertsRes.data || [])
    }
    
    // 更新趋势数据
    if (trendRes.code === 0 && trendChart) {
      const trendData = trendRes.data || []
      const hours = trendData.map((item: any) => item.hour)
      const criticalData = trendData.map((item: any) => item.critical || 0)
      const errorData = trendData.map((item: any) => item.error || 0)
      const warningData = trendData.map((item: any) => item.warning || 0)
      const infoData = trendData.map((item: any) => item.info || 0)
      
      trendChart.setOption({
        xAxis: { data: hours },
        series: [
          { data: criticalData },
          { data: errorData },
          { data: warningData },
          { data: infoData }
        ]
      })
    }
    
    // 更新其他图表
    updateCharts()
    
    // 更新最后更新时间
    const now = new Date()
    lastUpdateTime.value = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
  } catch (error: any) {
    Modal.message({ message: error.message || '加载失败', status: 'error' })
    activeAlerts.value = []
    criticalCount.value = 0
    errorCount.value = 0
    warningCount.value = 0
    infoCount.value = 0
  } finally {
    loading.value = false
  }
}

// 计算统计数据（备用，当统计接口失败时使用）
const calculateStats = (alerts: any[]) => {
  criticalCount.value = alerts.filter((a) => a.alertLevel === 'CRITICAL').length
  errorCount.value = alerts.filter((a) => a.alertLevel === 'ERROR').length
  warningCount.value = alerts.filter((a) => a.alertLevel === 'WARNING').length
  infoCount.value = alerts.filter((a) => a.alertLevel === 'INFO').length
  // 环比不变
}

// 更新所有图表
const updateCharts = () => {
  // 更新级别分布环形图
  if (levelPieChart) {
    levelPieChart.setOption({
      series: [{
        data: [
          { value: criticalCount.value, name: '严重', itemStyle: { color: '#f56c6c' } },
          { value: errorCount.value, name: '错误', itemStyle: { color: '#e6a23c' } },
          { value: warningCount.value, name: '警告', itemStyle: { color: '#409eff' } },
          { value: infoCount.value, name: '信息', itemStyle: { color: '#67c23a' } }
        ]
      }]
    })
  }
  
  // 更新模块分布柱状图
  if (moduleBarChart) {
    const moduleData = [
      { name: '连接器', value: activeAlerts.value.filter(a => a.sourceModule === 'CONNECTOR').length },
      { name: 'Worker', value: activeAlerts.value.filter(a => a.sourceModule === 'WORKER').length },
      { name: '日志', value: activeAlerts.value.filter(a => a.sourceModule === 'LOG').length },
      { name: 'DAG', value: activeAlerts.value.filter(a => a.sourceModule === 'DAG').length }
    ]
    moduleBarChart.setOption({
      xAxis: { data: moduleData.map(m => m.name) },
      series: [{ data: moduleData.map(m => m.value) }]
    })
  }
}

// 时间范围变化
const handleTimeRangeChange = (value?: string) => {
  if (value) {
    timeRange.value = value
  }
  loadActiveAlerts()
}

// 初始化趋势图
const initTrendChart = () => {
  if (!trendChartRef.value) return
  
  trendChart = echarts.init(trendChartRef.value)
  
  // 初始化空图表
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['严重', '错误', '警告', '信息']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: []
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '严重',
        type: 'line',
        data: [],
        smooth: true,
        itemStyle: { color: '#f56c6c' }
      },
      {
        name: '错误',
        type: 'line',
        data: [],
        smooth: true,
        itemStyle: { color: '#e6a23c' }
      },
      {
        name: '警告',
        type: 'line',
        data: [],
        smooth: true,
        itemStyle: { color: '#409eff' }
      },
      {
        name: '信息',
        type: 'line',
        data: [],
        smooth: true,
        itemStyle: { color: '#67c23a' }
      }
    ]
  }
  
  trendChart.setOption(option)
}

// 初始化级别分布环形图
const initLevelPieChart = () => {
  if (!levelPieChartRef.value) return
  
  levelPieChart = echarts.init(levelPieChartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: 0,
      data: ['严重', '错误', '警告', '信息']
    },
    series: [
      {
        name: '告警级别',
        type: 'pie',
        radius: ['40%', '70%'],  // 环形图
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}\n{d}%'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        data: [
          { value: criticalCount.value, name: '严重', itemStyle: { color: '#f56c6c' } },
          { value: errorCount.value, name: '错误', itemStyle: { color: '#e6a23c' } },
          { value: warningCount.value, name: '警告', itemStyle: { color: '#409eff' } },
          { value: infoCount.value, name: '信息', itemStyle: { color: '#67c23a' } }
        ]
      }
    ]
  }
  
  levelPieChart.setOption(option)
}

// 初始化模块分布柱状图
const initModuleBarChart = () => {
  if (!moduleBarChartRef.value) return
  
  moduleBarChart = echarts.init(moduleBarChartRef.value)
  
  // 统计模块数据
  const moduleData = [
    { name: '连接器', value: activeAlerts.value.filter(a => a.sourceModule === 'CONNECTOR').length },
    { name: 'Worker', value: activeAlerts.value.filter(a => a.sourceModule === 'WORKER').length },
    { name: '日志', value: activeAlerts.value.filter(a => a.sourceModule === 'LOG').length },
    { name: 'DAG', value: activeAlerts.value.filter(a => a.sourceModule === 'DAG').length }
  ]
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: moduleData.map(m => m.name),
      axisTick: {
        alignWithLabel: true
      }
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '告警数量',
        type: 'bar',
        barWidth: '60%',
        data: moduleData.map(m => m.value),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#83bff6' },
            { offset: 0.5, color: '#188df0' },
            { offset: 1, color: '#188df0' }
          ])
        },
        emphasis: {
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#2378f7' },
              { offset: 0.7, color: '#2378f7' },
              { offset: 1, color: '#83bff6' }
            ])
          }
        }
      }
    ]
  }
  
  moduleBarChart.setOption(option)
}

// 刷新
const handleRefresh = () => {
  loadActiveAlerts()
}

// 解决告警
const handleResolve = (row: any) => {
  Modal.confirm({
    title: '确认解决',
    message: `确定要解决告警"${row.alertType}"吗？`,
    status: 'info'
  }).then(async () => {
    try {
      const res = await AlertHistoryApi.resolveAlert(row.alertId, { remark: '从仪表盘解决' })
      if (res.code === 0) {
        Modal.message({ message: '解决成功', status: 'success' })
        loadActiveAlerts()
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
      const res = await AlertHistoryApi.ignoreAlert(row.alertId, { remark: '从仪表盘忽略' })
      if (res.code === 0) {
        Modal.message({ message: '忽略成功', status: 'success' })
        loadActiveAlerts()
      } else {
        Modal.message({ message: res.msg, status: 'error' })
      }
    } catch (error: any) {
      Modal.message({ message: error.message || '忽略失败', status: 'error' })
    }
  })
}

onMounted(() => {
  // 初始化加载数据
  loadActiveAlerts()
  
  // 初始化图表
  setTimeout(() => {
    initTrendChart()
    initLevelPieChart()
    initModuleBarChart()
  }, 100)
  
  // 连接WebSocket
  connectWebSocket()
  
  // 监听窗口大小变化，自动调整图表
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  // 断开WebSocket连接
  disconnectWebSocket()
  
  // 销毁图表实例
  if (trendChart) trendChart.dispose()
  if (levelPieChart) levelPieChart.dispose()
  if (moduleBarChart) moduleBarChart.dispose()
  
  window.removeEventListener('resize', handleResize)
})

// 窗口大小变化处理
const handleResize = () => {
  trendChart?.resize()
  levelPieChart?.resize()
  moduleBarChart?.resize()
}
</script>

<style lang="scss" scoped>
.container-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  background-color: #f5f6f7;

  /* 隐藏滚动条但保持可滚动 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
  
  &::-webkit-scrollbar {
    display: none; /* Chrome/Safari/Opera */
  }

  .time-range-selector {
    position: fixed;
    top: 70px;
    right: 30px;
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 2px 8px;
    background: #fff;
    border-radius: 8px;
    border: 1px solid #e4e7ed;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
    font-size: 11px;
    z-index: 100;
    transition: all 0.3s;

    .time-option {
      padding: 2px 6px;
      border-radius: 4px;
      color: #606266;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
      user-select: none;
      font-size: 11px;

      &:hover {
        color: #67c23a;
        background: #f0f9ff;
      }

      &.active {
        color: #fff;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        font-weight: 500;
        box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
      }
    }

    .last-update {
      color: #909399;
      margin-left: 6px;
      padding-left: 8px;
      border-left: 1px solid #e4e7ed;
      font-size: 10px;
    }
  }

  .stats-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin: 8px 10px 10px 10px;

    .stat-card {
      display: flex;
      align-items: center;
      padding: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      transition: transform 0.2s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
      }

      .stat-icon {
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        margin-right: 15px;
        font-size: 24px;

        &.critical {
          background-color: #fee;
          color: #f56c6c;
        }

        &.error {
          background-color: #fef0e6;
          color: #e6a23c;
        }

        &.warning {
          background-color: #e6f7ff;
          color: #409eff;
        }

        &.info {
          background-color: #f0f9ff;
          color: #67c23a;
        }
      }

      .stat-content {
        flex: 1;

        .stat-label {
          font-size: 14px;
          color: #606266;
          margin-bottom: 5px;
        }

        .stat-value {
          font-size: 28px;
          font-weight: bold;

          &.critical {
            color: #f56c6c;
          }

          &.error {
            color: #e6a23c;
          }

          &.warning {
            color: #409eff;
          }

          &.info {
            color: #67c23a;
          }
        }

        .stat-trend {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          margin-top: 5px;

          &.up {
            color: #f56c6c;
          }

          &.down {
            color: #67c23a;
          }
        }
      }
    }
  }

  .charts-section {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    margin: 0 10px 10px 10px;

    .chart-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

      &.full-width {
        grid-column: 1 / -1;
      }

      .chart-header {
        margin-bottom: 15px;

        h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #303133;
        }
      }

      .chart-container {
        width: 100%;
        height: 350px;
      }

      .chart-container-small {
        width: 100%;
        height: 280px;
      }
    }
  }

  .active-alerts-section {
    background: white;
    padding: 20px;
    border-radius: 8px;
    margin: 0 10px 10px 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;

      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }
    }
  }
}
</style>
