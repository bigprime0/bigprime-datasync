<template>
  <div class="dashboard-container">
    <Breadcrumb :items="['协议网关', '监控中心']" />
    
    <div class="dashboard-content">
      <!-- 总览卡片 -->
      <div class="summary-cards">
        <div class="card">
          <div class="card-icon" style="background: #409eff">
            <span class="icon">🌐</span>
          </div>
          <div class="card-content">
            <div class="card-title">网关总数</div>
            <div class="card-value">{{ statistics.totalGateways }}</div>
            <div class="card-trend">
              <span :class="getTrendClass(statistics.gatewayTrend)">
                {{ statistics.gatewayTrend > 0 ? '↑' : statistics.gatewayTrend < 0 ? '↓' : '-' }}
                {{ Math.abs(statistics.gatewayTrend) }}%
              </span>
              <span class="trend-label">较昨日</span>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-icon" style="background: #67c23a">
            <span class="icon">✅</span>
          </div>
          <div class="card-content">
            <div class="card-title">运行中</div>
            <div class="card-value">{{ statistics.runningGateways }}</div>
            <div class="card-trend">
              <span class="trend-label">占比 {{ calculatePercentage(statistics.runningGateways, statistics.totalGateways) }}</span>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-icon" style="background: #e6a23c">
            <span class="icon">📊</span>
          </div>
          <div class="card-content">
            <div class="card-title">消息总数</div>
            <div class="card-value">{{ formatNumber(statistics.totalMessages) }}</div>
            <div class="card-trend">
              <span class="trend-label">今日 {{ formatNumber(statistics.todayMessages) }}</span>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-icon" style="background: #f56c6c">
            <span class="icon">⚠️</span>
          </div>
          <div class="card-content">
            <div class="card-title">错误数</div>
            <div class="card-value">{{ formatNumber(statistics.totalErrors) }}</div>
            <div class="card-trend">
              <span :class="getTrendClass(-statistics.errorTrend)">
                {{ statistics.errorTrend > 0 ? '↑' : statistics.errorTrend < 0 ? '↓' : '-' }}
                {{ Math.abs(statistics.errorTrend) }}%
              </span>
              <span class="trend-label">较昨日</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 实时监控区域 -->
      <div class="monitor-section">
        <div class="section-left">
          <!-- 网关状态分布 -->
          <div class="panel">
            <div class="panel-header">
              <h3>网关状态分布</h3>
              <tiny-button @click="refreshGatewayStatus">刷新</tiny-button>
            </div>
            <div class="panel-body">
              <div class="status-chart" ref="statusChartRef"></div>
            </div>
          </div>

          <!-- 协议类型分布 -->
          <div class="panel">
            <div class="panel-header">
              <h3>协议类型分布</h3>
            </div>
            <div class="panel-body">
              <div class="protocol-chart" ref="protocolChartRef"></div>
            </div>
          </div>
        </div>

        <div class="section-right">
          <!-- 实时消息流量 -->
          <div class="panel">
            <div class="panel-header">
              <h3>实时消息流量</h3>
              <div class="time-range">
                <tiny-radio-group v-model="timeRange" @change="handleTimeRangeChange">
                  <tiny-radio label="1h">最近1小时</tiny-radio>
                  <tiny-radio label="6h">最近6小时</tiny-radio>
                  <tiny-radio label="24h">最近24小时</tiny-radio>
                </tiny-radio-group>
              </div>
            </div>
            <div class="panel-body">
              <div class="traffic-chart" ref="trafficChartRef"></div>
            </div>
          </div>

          <!-- 错误率趋势 -->
          <div class="panel">
            <div class="panel-header">
              <h3>错误率趋势</h3>
            </div>
            <div class="panel-body">
              <div class="error-chart" ref="errorChartRef"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 网关列表 -->
      <div class="gateway-list-section">
        <div class="panel">
          <div class="panel-header">
            <h3>网关实时状态</h3>
            <tiny-button size="mini" type="primary" @click="autoRefresh = !autoRefresh">
              {{ autoRefresh ? '停止自动刷新' : '开启自动刷新' }}
            </tiny-button>
          </div>
          <div class="panel-body">
            <tiny-grid
              :data="gatewayList"
              :height="300"
              :loading="loading"
              stripe
              border
              size="small"
            >
              <tiny-grid-column title="网关名称" field="name"></tiny-grid-column>
              <tiny-grid-column title="协议" field="protocolType" align="center" width="100">
                <template #default="data">
                  <tiny-tag size="small" :type="getProtocolTagType(data.row.protocolType)">
                    {{ data.row.protocolType }}
                  </tiny-tag>
                </template>
              </tiny-grid-column>
              <tiny-grid-column title="状态" field="status" align="center" width="100">
                <template #default="data">
                  <tiny-tag size="small" :type="getStatusTagType(data.row.status)">
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
              <tiny-grid-column title="成功率" align="center">
                <template #default="data">
                  <div class="success-rate">
                    <div class="rate-bar">
                      <div 
                        class="rate-fill" 
                        :style="{ 
                          width: calculateSuccessRate(data.row.messageCount, data.row.errorCount) + '%',
                          background: getSuccessRateColor(calculateSuccessRate(data.row.messageCount, data.row.errorCount))
                        }"
                      ></div>
                    </div>
                    <span class="rate-text">{{ calculateSuccessRate(data.row.messageCount, data.row.errorCount) }}%</span>
                  </div>
                </template>
              </tiny-grid-column>
              <tiny-grid-column title="吞吐量" field="throughput" align="right" width="120">
                <template #default="data">
                  {{ data.row.throughput || '-' }} msg/s
                </template>
              </tiny-grid-column>
              <tiny-grid-column title="最后更新" field="lastUpdateTime" align="center" width="170">
                <template #default="data">
                  {{ formatDateTime(data.row.lastUpdateTime) }}
                </template>
              </tiny-grid-column>
            </tiny-grid>
          </div>
        </div>
      </div>

      <!-- 告警信息 -->
      <div class="alert-section">
        <div class="panel">
          <div class="panel-header">
            <h3>告警信息</h3>
            <tiny-button size="mini" @click="handleClearAlerts">清除全部</tiny-button>
          </div>
          <div class="panel-body">
            <div v-if="alerts.length === 0" class="no-alerts">
              <span class="icon">✅</span>
              <p>系统运行正常，暂无告警</p>
            </div>
            <div v-else class="alert-list">
              <div 
                v-for="alert in alerts" 
                :key="alert.id" 
                :class="['alert-item', `alert-${alert.level}`]"
              >
                <div class="alert-icon">
                  <span v-if="alert.level === 'critical'">🔴</span>
                  <span v-else-if="alert.level === 'warning'">⚠️</span>
                  <span v-else>ℹ️</span>
                </div>
                <div class="alert-content">
                  <div class="alert-title">{{ alert.title }}</div>
                  <div class="alert-message">{{ alert.message }}</div>
                  <div class="alert-time">{{ formatDateTime(alert.time) }}</div>
                </div>
                <div class="alert-actions">
                  <tiny-button size="mini" @click="handleDismissAlert(alert.id)">忽略</tiny-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, reactive, ref, nextTick } from 'vue'
import {
  Grid as TinyGrid,
  GridColumn as TinyGridColumn,
  Tag as TinyTag,
  Button as TinyButton,
  RadioGroup as TinyRadioGroup,
  Radio as TinyRadio
} from '@opentiny/vue'
import * as echarts from 'echarts'
import { formatDateTime } from '@/utils/date'
import { GatewayService } from '@/services/gateway'
import Breadcrumb from '@/components/breadcrumb/index.vue'

const loading = ref(false)
const autoRefresh = ref(true)
const timeRange = ref('1h')
const gatewayList = ref([])
const statusChartRef = ref<HTMLElement | null>(null)
const protocolChartRef = ref<HTMLElement | null>(null)
const trafficChartRef = ref<HTMLElement | null>(null)
const errorChartRef = ref<HTMLElement | null>(null)

let statusChart: echarts.ECharts | null = null
let protocolChart: echarts.ECharts | null = null
let trafficChart: echarts.ECharts | null = null
let errorChart: echarts.ECharts | null = null

// 统计数据
const statistics = reactive({
  totalGateways: 0,
  runningGateways: 0,
  totalMessages: 0,
  todayMessages: 0,
  totalErrors: 0,
  gatewayTrend: 0,
  errorTrend: 0
})

// 告警列表
const alerts = ref<any[]>([])

let refreshTimer: any = null

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const res = await GatewayService.getAllGateways()
    console.log('网关数据响应:', res)
    if (res.code === 200 || res.code === 0) {
      const gateways = res.data || []
      gatewayList.value = gateways
      await updateStatistics(gateways)
      updateCharts(gateways)
    }
  } catch (error) {
    console.error('加载网关数据失败:', error)
  } finally {
    loading.value = false
  }
  
  // 加载告警数据
  await loadAlerts()
}

// 加载告警数据
const loadAlerts = async () => {
  try {
    const res = await GatewayService.getGatewayAlerts(10)
    if (res.code === 200 || res.code === 0) {
      const alertData = res.data || []
      // 转换为前端结构
      alerts.value = alertData.map((alert: any) => ({
        id: alert.alertId,
        level: mapAlertLevel(alert.alertLevel),
        title: alert.ruleName || alert.alertType,
        message: alert.alertMessage,
        time: new Date(alert.triggerTime),
        sourceId: alert.sourceId,
        sourceName: alert.sourceName
      }))
      console.log('加载告警数据成功:', alerts.value.length)
    }
  } catch (error) {
    console.error('加载告警数据失败:', error)
    alerts.value = []
  }
}

// 映射告警级别
const mapAlertLevel = (level: string): string => {
  const levelMap: Record<string, string> = {
    'CRITICAL': 'critical',
    'ERROR': 'critical',
    'WARNING': 'warning',
    'INFO': 'info'
  }
  return levelMap[level] || 'info'
}

// 更新统计数据
const updateStatistics = async (gateways: any[]) => {
  // 优先从后端API获取统计数据
  try {
    const res = await GatewayService.getDashboardStatistics()
    if (res.code === 200 || res.code === 0) {
      const data = res.data
      statistics.totalGateways = data.totalGateways || 0
      statistics.runningGateways = data.runningGateways || 0
      statistics.totalMessages = data.totalMessages || 0
      statistics.todayMessages = data.todayMessages || 0
      statistics.totalErrors = data.totalErrors || 0
      statistics.gatewayTrend = data.gatewayTrend || 0
      statistics.errorTrend = data.errorTrend || 0
      return
    }
  } catch (error) {
    console.warn('获取仪表盘统计失败，使用前端计算:', error)
  }
  
  // 后备方案：前端计算
  statistics.totalGateways = gateways.length
  statistics.runningGateways = gateways.filter((g: any) => g.status === 'RUNNING').length
  statistics.totalMessages = gateways.reduce((sum: number, g: any) => sum + (g.messageCount || 0), 0)
  statistics.totalErrors = gateways.reduce((sum: number, g: any) => sum + (g.errorCount || 0), 0)
  statistics.todayMessages = Math.floor(statistics.totalMessages * 0.3)
  statistics.gatewayTrend = 0
  statistics.errorTrend = 0
}

// 更新图表数据
const updateCharts = (gateways: any[]) => {
  updateStatusChart(gateways)
  updateProtocolChart(gateways)
  updateTrafficChart()
  updateErrorChart()
}

// 更新状态分布饼图
const updateStatusChart = (gateways: any[]) => {
  if (!statusChart) return
  
  const statusCount = {
    RUNNING: 0,
    STOPPED: 0,
    ERROR: 0
  }
  
  gateways.forEach((g: any) => {
    if (statusCount[g.status as keyof typeof statusCount] !== undefined) {
      statusCount[g.status as keyof typeof statusCount]++
    }
  })
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '网关状态',
        type: 'pie',
        radius: '60%',
        data: [
          { value: statusCount.RUNNING, name: '运行中', itemStyle: { color: '#67c23a' } },
          { value: statusCount.STOPPED, name: '已停止', itemStyle: { color: '#909399' } },
          { value: statusCount.ERROR, name: '错误', itemStyle: { color: '#f56c6c' } }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  
  statusChart.setOption(option)
}

// 更新协议类型分布饼图
const updateProtocolChart = (gateways: any[]) => {
  if (!protocolChart) return
  
  const protocolCount: Record<string, number> = {}
  
  gateways.forEach((g: any) => {
    const type = g.protocolType || 'UNKNOWN'
    protocolCount[type] = (protocolCount[type] || 0) + 1
  })
  
  const data = Object.entries(protocolCount).map(([name, value]) => ({
    name,
    value
  }))
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '协议类型',
        type: 'pie',
        radius: '60%',
        data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  
  protocolChart.setOption(option)
}

// 更新消息流量折线图
const updateTrafficChart = async () => {
  if (!trafficChart) return
  
  try {
    // 从后端API获取真实数据
    const res = await GatewayService.getTrafficHistory(24)
    if (res.code === 200 || res.code === 0) {
      const data = res.data || []
      const timeLabels = data.map((item: any) => item.time)
      const trafficData = data.map((item: any) => item.messageCount || 0)
      
      const option = {
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: timeLabels
        },
        yAxis: {
          type: 'value',
          name: '消息数'
        },
        series: [
          {
            name: '消息流量',
            type: 'line',
            data: trafficData,
            smooth: true,
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(64, 158, 255, 0.5)' },
                { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
              ])
            },
            itemStyle: { color: '#409eff' }
          }
        ],
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        }
      }
      
      trafficChart.setOption(option)
      return
    }
  } catch (error) {
    console.error('获取流量历史失败:', error)
  }
  
  // 后备方案：显示空数据
  const option = {
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: []
    },
    yAxis: {
      type: 'value',
      name: '消息数'
    },
    series: [
      {
        name: '消息流量',
        type: 'line',
        data: [],
        smooth: true,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.5)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
          ])
        },
        itemStyle: { color: '#409eff' }
      }
    ],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    }
  }
  trafficChart.setOption(option)
}

// 更新错误率趋势折线图
const updateErrorChart = async () => {
  if (!errorChart) return
  
  try {
    // 从后端API获取真实数据
    const res = await GatewayService.getErrorRateHistory(24)
    if (res.code === 200 || res.code === 0) {
      const data = res.data || []
      const timeLabels = data.map((item: any) => item.time)
      const errorRateData = data.map((item: any) => item.errorRate || 0)
      
      const option = {
        tooltip: {
          trigger: 'axis',
          formatter: (params: any) => {
            return `${params[0].name}<br/>${params[0].seriesName}: ${params[0].value.toFixed(2)}%`
          }
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: timeLabels
        },
        yAxis: {
          type: 'value',
          name: '错误率(%)',
          max: 10
        },
        series: [
          {
            name: '错误率',
            type: 'line',
            data: errorRateData,
            smooth: true,
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(245, 108, 108, 0.5)' },
                { offset: 1, color: 'rgba(245, 108, 108, 0.1)' }
              ])
            },
            itemStyle: { color: '#f56c6c' }
          }
        ],
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        }
      }
      
      errorChart.setOption(option)
      return
    }
  } catch (error) {
    console.error('获取错误率历史失败:', error)
  }
  
  // 后备方案：显示空数据
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        return `${params[0].name}<br/>${params[0].seriesName}: ${params[0].value.toFixed(2)}%`
      }
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: []
    },
    yAxis: {
      type: 'value',
      name: '错误率(%)',
      max: 10
    },
    series: [
      {
        name: '错误率',
        type: 'line',
        data: [],
        smooth: true,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(245, 108, 108, 0.5)' },
            { offset: 1, color: 'rgba(245, 108, 108, 0.1)' }
          ])
        },
        itemStyle: { color: '#f56c6c' }
      }
    ],
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    }
  }
  errorChart.setOption(option)
}

// 刷新网关状态
const refreshGatewayStatus = () => {
  loadData()
}

// 时间范围变化
const handleTimeRangeChange = () => {
  // TODO: 根据时间范围重新加载图表数据
  console.log('时间范围变化:', timeRange.value)
}

// 清除告警
const handleClearAlerts = async () => {
  console.log('清除所有告警')
  // TODO: 批量忽略API
  alerts.value = []
}

// 忽略告警
const handleDismissAlert = async (id: string) => {
  console.log('忽略告警:', id)
  // TODO: 调用告警忽略API
  const index = alerts.value.findIndex((a: any) => a.id === id)
  if (index > -1) {
    alerts.value.splice(index, 1)
  }
}

// 工具函数
const formatNumber = (num: number) => {
  if (!num) return '0'
  return num.toLocaleString()
}

const calculatePercentage = (part: number, total: number) => {
  if (!total) return '0%'
  return ((part / total) * 100).toFixed(1) + '%'
}

const calculateSuccessRate = (total: number, errors: number) => {
  if (!total) return 100
  return Math.round(((total - errors) / total) * 100)
}

const getTrendClass = (trend: number) => {
  if (trend > 0) return 'trend-up'
  if (trend < 0) return 'trend-down'
  return 'trend-neutral'
}

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

const getSuccessRateColor = (rate: number) => {
  if (rate >= 95) return '#67c23a'
  if (rate >= 90) return '#e6a23c'
  return '#f56c6c'
}

// 初始化图表
const initCharts = async () => {
  await nextTick()
  
  if (statusChartRef.value) {
    statusChart = echarts.init(statusChartRef.value)
  }
  if (protocolChartRef.value) {
    protocolChart = echarts.init(protocolChartRef.value)
  }
  if (trafficChartRef.value) {
    trafficChart = echarts.init(trafficChartRef.value)
  }
  if (errorChartRef.value) {
    errorChart = echarts.init(errorChartRef.value)
  }
  
  console.log('网关监控图表已初始化')
}

onMounted(async () => {
  await initCharts()
  await loadData()
  
  // 启动自动刷新
  refreshTimer = setInterval(() => {
    if (autoRefresh.value) {
      loadData()
    }
  }, 5000) // 每5秒刷新一次
  
  // 窗口大小变化时重绘图表
  window.addEventListener('resize', () => {
    statusChart?.resize()
    protocolChart?.resize()
    trafficChart?.resize()
    errorChart?.resize()
  })
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
  
  // 释放图表资源
  statusChart?.dispose()
  protocolChart?.dispose()
  trafficChart?.dispose()
  errorChart?.dispose()
})
</script>

<style scoped>
.dashboard-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
}

.dashboard-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

/* 总览卡片 */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  gap: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.card-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 8px;
}

.card-trend {
  font-size: 12px;
}

.trend-up {
  color: #67c23a;
}

.trend-down {
  color: #f56c6c;
}

.trend-neutral {
  color: #909399;
}

.trend-label {
  color: #909399;
  margin-left: 5px;
}

/* 监控区域 */
.monitor-section {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 20px;
  margin-bottom: 20px;
}

.section-left,
.section-right {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 面板 */
.panel {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.panel-header {
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.panel-body {
  padding: 20px;
}

/* 图表区域 */
.status-chart,
.protocol-chart,
.traffic-chart,
.error-chart {
  height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  background: #f5f7fa;
  border-radius: 4px;
}

/* 网关列表 */
.gateway-list-section {
  margin-bottom: 20px;
}

.success-rate {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rate-bar {
  flex: 1;
  height: 8px;
  background: #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}

.rate-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s;
}

.rate-text {
  font-size: 12px;
  color: #606266;
  min-width: 35px;
}

/* 告警区域 */
.alert-section {
  margin-bottom: 20px;
}

.no-alerts {
  text-align: center;
  padding: 40px;
  color: #909399;
}

.no-alerts .icon {
  font-size: 48px;
  display: block;
  margin-bottom: 10px;
}

.alert-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.alert-item {
  display: flex;
  gap: 15px;
  padding: 15px;
  border-radius: 4px;
  border-left: 4px solid;
}

.alert-critical {
  background: #fef0f0;
  border-left-color: #f56c6c;
}

.alert-warning {
  background: #fdf6ec;
  border-left-color: #e6a23c;
}

.alert-info {
  background: #f0f9ff;
  border-left-color: #409eff;
}

.alert-icon {
  font-size: 24px;
}

.alert-content {
  flex: 1;
}

.alert-title {
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.alert-message {
  font-size: 14px;
  color: #606266;
  margin-bottom: 5px;
}

.alert-time {
  font-size: 12px;
  color: #909399;
}

.time-range {
  display: flex;
  align-items: center;
}
</style>
