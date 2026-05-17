<template>
  <div class="container-list">
    <Breadcrumb :items="['日志管理', '日志统计']" />
    
    <!-- 时间范围选择器 -->
    <div class="time-range-selector">
      <span 
        :class="['time-option', { active: timeType === '1h' }]"
        @click="setTimeRange('1h')"
      >
        1小时
      </span>
      <span 
        :class="['time-option', { active: timeType === '6h' }]"
        @click="setTimeRange('6h')"
      >
        6小时
      </span>
      <span 
        :class="['time-option', { active: timeType === '24h' }]"
        @click="setTimeRange('24h')"
      >
        24小时
      </span>
      <span 
        :class="['time-option', { active: timeType === '7d' }]"
        @click="setTimeRange('7d')"
      >
        7天
      </span>
    </div>
    
    <div class="contain">
      <!-- 统计卡片 -->
      <div class="stats-cards">
        <div class="stat-card">
          <div class="card-icon total">
            <svg-icon name="document" />
          </div>
          <div class="card-content">
            <div class="card-value">{{ statsData.total }}<span v-if="statsData.isLimited" class="limit-tip">+</span></div>
            <div class="card-label">总日志数<span v-if="statsData.isLimited" class="limit-warning">(已达上限)</span></div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="card-icon error">
            <svg-icon name="close" />
          </div>
          <div class="card-content">
            <div class="card-value">{{ statsData.errorRate }}%</div>
            <div class="card-label">错误率</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="card-icon warn">
            <svg-icon name="warning" />
          </div>
          <div class="card-content">
            <div class="card-value">{{ statsData.warnRate }}%</div>
            <div class="card-label">警告率</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="card-icon services">
            <svg-icon name="cluster" />
          </div>
          <div class="card-content">
            <div class="card-value">{{ statsData.serviceCount }}</div>
            <div class="card-label">服务数量</div>
          </div>
        </div>
      </div>

      <!-- 图表区域 -->
      <div class="charts-container">
        <!-- 第一行：日志级别分布 + 时间趋势 -->
        <div class="chart-row">
          <div class="chart-card">
            <div class="chart-header">
              <h3>日志级别分布</h3>
            </div>
            <div ref="levelChartRef" class="chart-content"></div>
          </div>
          
          <div class="chart-card">
            <div class="chart-header">
              <h3>日志趋势分析</h3>
            </div>
            <div ref="trendChartRef" class="chart-content"></div>
          </div>
        </div>

        <!-- 第二行：服务日志量排行 + 错误率趋势 -->
        <div class="chart-row">
          <div class="chart-card">
            <div class="chart-header">
              <h3>服务日志量 Top 10</h3>
            </div>
            <div ref="serviceChartRef" class="chart-content"></div>
          </div>
          
          <div class="chart-card">
            <div class="chart-header">
              <h3>错误率趋势</h3>
            </div>
            <div ref="errorRateChartRef" class="chart-content"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as echarts from 'echarts'
import Breadcrumb from '@/components/breadcrumb/index.vue'
import { queryLogs, queryLogStatistics } from '@/services/log'
import { formatDateTime } from '@/utils/date'

const timeType = ref('1h')
const levelChartRef = ref<HTMLElement | null>(null)
const trendChartRef = ref<HTMLElement | null>(null)
const serviceChartRef = ref<HTMLElement | null>(null)
const errorRateChartRef = ref<HTMLElement | null>(null)

let levelChart: echarts.ECharts | null = null
let trendChart: echarts.ECharts | null = null
let serviceChart: echarts.ECharts | null = null
let errorRateChart: echarts.ECharts | null = null

const queryForm = reactive({
  // 不设置固定时间，让 setTimeRange 动态设置
  timeRange: [] as Date[]
})

const statsData = reactive({
  total: 0,
  errorRate: '0.00',
  warnRate: '0.00',
  serviceCount: 0,
  isLimited: false // 是否达到查询上限
})

// 设置时间范围
const setTimeRange = (type: string) => {
  timeType.value = type
  const now = new Date()
  let start: Date

  switch (type) {
    case '1h':
      start = new Date(now.getTime() - 3600000)
      break
    case '6h':
      start = new Date(now.getTime() - 6 * 3600000)
      break
    case '24h':
      start = new Date(now.getTime() - 24 * 3600000)
      break
    case '7d':
      start = new Date(now.getTime() - 7 * 24 * 3600000)
      break
    default:
      return
  }

  queryForm.timeRange = [start, now]
  loadStatistics()
}

// 加载统计数据（使用聚合查询，不受 5000 条限制）
const loadStatistics = async () => {
  try {
    const params = {
      startTime: formatDateTime(queryForm.timeRange[0]),
      endTime: formatDateTime(queryForm.timeRange[1])
    }
    
    console.log('=== 统计查询参数 ===')
    console.log('时间范围对象:', queryForm.timeRange)
    console.log('格式化后参数:', params)
    console.log('当前时间:', new Date())
    console.log('===================')

    const result = await queryLogStatistics(params)
    
    console.log('统计结果:', result)

    // 后端返回 Result<Map<String, Object>>，实际数据在 result.data 中
    if (result && result.data) {
      const data = result.data
      // 使用聚合查询结果
      statsData.total = data.total || 0
      statsData.isLimited = false // 聚合查询不受限制
      
      const levelCounts = data.levelCounts || {}
      statsData.errorRate = statsData.total > 0 
        ? ((levelCounts.ERROR || 0) / statsData.total * 100).toFixed(2) 
        : '0.00'
      statsData.warnRate = statsData.total > 0 
        ? ((levelCounts.WARN || 0) / statsData.total * 100).toFixed(2) 
        : '0.00'
      statsData.serviceCount = Object.keys(data.serviceCounts || {}).length
      
      console.log('统计数据:', statsData)
      console.log('级别分布:', levelCounts)
      console.log('趋势数据:', data.trendData)
      
      // 渲染图表（使用聚合数据）
      await nextTick()
      renderChartsFromAggregation(levelCounts, data.serviceCounts || {}, data.trendData)
    }
  } catch (error: any) {
    console.error('加载统计数据失败:', error)
  }
}

// 解析 Loki 响应
const parseLokiResponse = (result: any[]) => {
  const logs: any[] = []
  result.forEach((item: any) => {
    const labels = item.stream || {}
    item.values?.forEach((value: any[]) => {
      const [timestamp, logLine] = value
      
      let logObj: any = null
      try {
        logObj = JSON.parse(logLine)
      } catch (e) {
        const jsonMatch = logLine.match(/\{[\s\S]*?\}(?=\s*[^}]*$)/)
        if (jsonMatch) {
          try {
            logObj = JSON.parse(jsonMatch[0])
          } catch (e2) {}
        }
      }
      
      if (logObj) {
        logs.push({
          timestamp: new Date(Number(timestamp) / 1000000),
          serviceName: labels.serviceName || logObj.serviceName || '-',
          level: labels.level || logObj.level || 'INFO',
          message: logObj.message || logLine
        })
      } else {
        logs.push({
          timestamp: new Date(Number(timestamp) / 1000000),
          serviceName: labels.serviceName || '-',
          level: labels.level || 'INFO',
          message: logLine
        })
      }
    })
  })
  return logs.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
}

// 计算统计数据
const calculateStatistics = (logs: any[]) => {
  statsData.total = logs.length
  
  const errorCount = logs.filter(log => log.level === 'ERROR').length
  const warnCount = logs.filter(log => log.level === 'WARN').length
  
  statsData.errorRate = statsData.total > 0 ? ((errorCount / statsData.total) * 100).toFixed(2) : '0.00'
  statsData.warnRate = statsData.total > 0 ? ((warnCount / statsData.total) * 100).toFixed(2) : '0.00'
  
  const services = new Set(logs.map(log => log.serviceName))
  statsData.serviceCount = services.size
  
  console.log('统计数据:', {
    total: statsData.total,
    errorRate: statsData.errorRate,
    warnRate: statsData.warnRate,
    serviceCount: statsData.serviceCount,
    logsCount: logs.length
  })
}

// 渲染图表
const renderCharts = (logs: any[]) => {
  renderLevelChart(logs)
  renderTrendChart(logs)
  renderServiceChart(logs)
  renderErrorRateChart(logs)
}

// 使用聚合数据渲染图表
const renderChartsFromAggregation = (levelCounts: any, serviceCounts: any, trendData: any) => {
  console.log('=== 开始渲染图表 ===')
  console.log('levelCounts:', levelCounts)
  console.log('serviceCounts:', serviceCounts)
  console.log('trendData:', trendData)
  
  renderLevelChartFromAggregation(levelCounts)
  renderServiceChartFromAggregation(serviceCounts)
  
  // 渲染时间趋势图
  if (trendData && trendData.levelTrends) {
    console.log('levelTrends:', trendData.levelTrends)
    console.log('ERROR trend:', trendData.levelTrends.ERROR)
    renderTrendChartFromAggregation(trendData.levelTrends)
    renderErrorRateChartFromAggregation(trendData.levelTrends)
  } else {
    console.warn('没有趋势数据，显示空图表')
    clearTrendCharts()
  }
}

// 渲染日志级别分布饼图
const renderLevelChart = (logs: any[]) => {
  if (!levelChartRef.value) return
  
  if (!levelChart) {
    levelChart = echarts.init(levelChartRef.value)
  }

  const levelCount = {
    ERROR: 0,
    WARN: 0,
    INFO: 0,
    DEBUG: 0
  }

  logs.forEach(log => {
    if (levelCount.hasOwnProperty(log.level)) {
      levelCount[log.level]++
    }
  })
  
  console.log('日志级别分布:', levelCount)

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      bottom: '5%',
      left: 'center'
    },
    series: [
      {
        name: '日志级别',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}: {c}'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        data: [
          { value: levelCount.ERROR, name: 'ERROR', itemStyle: { color: '#f56c6c' } },
          { value: levelCount.WARN, name: 'WARN', itemStyle: { color: '#e6a23c' } },
          { value: levelCount.INFO, name: 'INFO', itemStyle: { color: '#409eff' } },
          { value: levelCount.DEBUG, name: 'DEBUG', itemStyle: { color: '#67c23a' } }
        ]
      }
    ]
  }

  levelChart.setOption(option, true)
}

// 使用聚合数据渲染级别分布图
const renderLevelChartFromAggregation = (levelCounts: any) => {
  if (!levelChartRef.value) return
  
  if (!levelChart) {
    levelChart = echarts.init(levelChartRef.value)
  }

  console.log('聚合级别分布:', levelCounts)

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      bottom: '5%',
      left: 'center'
    },
    series: [
      {
        name: '日志级别',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}: {c}'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        data: [
          { value: levelCounts.ERROR || 0, name: 'ERROR', itemStyle: { color: '#f56c6c' } },
          { value: levelCounts.WARN || 0, name: 'WARN', itemStyle: { color: '#e6a23c' } },
          { value: levelCounts.INFO || 0, name: 'INFO', itemStyle: { color: '#409eff' } },
          { value: levelCounts.DEBUG || 0, name: 'DEBUG', itemStyle: { color: '#67c23a' } }
        ]
      }
    ]
  }

  levelChart.setOption(option, true)
}

// 渲染时间趋势折线图
const renderTrendChart = (logs: any[]) => {
  if (!trendChartRef.value) return
  
  if (!trendChart) {
    trendChart = echarts.init(trendChartRef.value)
  }

  // 按小时聚合
  const timeMap = new Map<string, any>()
  logs.forEach(log => {
    // 使用本地时间，不用 UTC
    const date = new Date(log.timestamp)
    const hour = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:00:00`
    if (!timeMap.has(hour)) {
      timeMap.set(hour, { ERROR: 0, WARN: 0, INFO: 0, DEBUG: 0 })
    }
    const counts = timeMap.get(hour)!
    if (counts.hasOwnProperty(log.level)) {
      counts[log.level]++
    }
  })

  const times = Array.from(timeMap.keys()).sort()
  const errorData = times.map(t => timeMap.get(t)!.ERROR)
  const warnData = times.map(t => timeMap.get(t)!.WARN)
  const infoData = times.map(t => timeMap.get(t)!.INFO)
  const debugData = times.map(t => timeMap.get(t)!.DEBUG)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: ['ERROR', 'WARN', 'INFO', 'DEBUG'],
      top: '5%'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: times.map(t => t.slice(5, 16)),
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      name: '日志数量'
    },
    series: [
      {
        name: 'ERROR',
        type: 'line',
        smooth: true,
        data: errorData,
        itemStyle: { color: '#f56c6c' }
      },
      {
        name: 'WARN',
        type: 'line',
        smooth: true,
        data: warnData,
        itemStyle: { color: '#e6a23c' }
      },
      {
        name: 'INFO',
        type: 'line',
        smooth: true,
        data: infoData,
        itemStyle: { color: '#409eff' }
      },
      {
        name: 'DEBUG',
        type: 'line',
        smooth: true,
        data: debugData,
        itemStyle: { color: '#67c23a' }
      }
    ]
  }

  trendChart.setOption(option, true)
}

// 使用聚合数据渲染时间趋势图
const renderTrendChartFromAggregation = (levelTrends: any) => {
  if (!trendChartRef.value) return
  
  if (!trendChart) {
    trendChart = echarts.init(trendChartRef.value)
  }

  // 提取时间戳（使用任意一个有数据的级别）
  let timestamps: number[] = []
  let baseTrend = levelTrends.INFO || levelTrends.WARN || levelTrends.ERROR || levelTrends.DEBUG
  
  if (!baseTrend || !baseTrend.timestamps || baseTrend.timestamps.length === 0) {
    console.warn('没有趋势时间戳数据')
    clearTrendCharts()
    return
  }
  
  timestamps = baseTrend.timestamps
  
  // 转换时间戳为本地时间（Loki 返回的是秒级时间戳，需要乘以1000）
  const times = timestamps.map((ts: number) => {
    const date = new Date(ts * 1000)  // 秒转毫秒
    return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  })
  
  // 按级别提取数据（rate 转 count：乘以60得到每分钟数量）
  const errorData = timestamps.map((ts, i) => {
    const val = levelTrends.ERROR?.values?.[i] || 0
    return Math.round(val * 60)
  })
  const warnData = timestamps.map((ts, i) => {
    const val = levelTrends.WARN?.values?.[i] || 0
    return Math.round(val * 60)
  })
  const infoData = timestamps.map((ts, i) => {
    const val = levelTrends.INFO?.values?.[i] || 0
    return Math.round(val * 60)
  })
  const debugData = timestamps.map((ts, i) => {
    const val = levelTrends.DEBUG?.values?.[i] || 0
    return Math.round(val * 60)
  })

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: ['ERROR', 'WARN', 'INFO', 'DEBUG'],
      top: '5%'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: times,
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      name: '日志数量/分钟'
    },
    series: [
      {
        name: 'ERROR',
        type: 'line',
        smooth: true,
        data: errorData,
        itemStyle: { color: '#f56c6c' }
      },
      {
        name: 'WARN',
        type: 'line',
        smooth: true,
        data: warnData,
        itemStyle: { color: '#e6a23c' }
      },
      {
        name: 'INFO',
        type: 'line',
        smooth: true,
        data: infoData,
        itemStyle: { color: '#409eff' }
      },
      {
        name: 'DEBUG',
        type: 'line',
        smooth: true,
        data: debugData,
        itemStyle: { color: '#67c23a' }
      }
    ]
  }

  trendChart.setOption(option, true)
}

// 渲染服务日志量柱状图
const renderServiceChart = (logs: any[]) => {
  if (!serviceChartRef.value) return
  
  if (!serviceChart) {
    serviceChart = echarts.init(serviceChartRef.value)
  }

  const serviceMap = new Map<string, number>()
  logs.forEach(log => {
    const count = serviceMap.get(log.serviceName) || 0
    serviceMap.set(log.serviceName, count + 1)
  })

  const sortedServices = Array.from(serviceMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)

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
      type: 'value',
      name: '日志数量'
    },
    yAxis: {
      type: 'category',
      data: sortedServices.map(s => s[0]).reverse()
    },
    series: [
      {
        name: '日志数量',
        type: 'bar',
        data: sortedServices.map(s => s[1]).reverse(),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#667eea' },
            { offset: 1, color: '#764ba2' }
          ])
        },
        barWidth: '60%'
      }
    ]
  }

  serviceChart.setOption(option, true)
}

// 使用聚合数据渲染服务图
const renderServiceChartFromAggregation = (serviceCounts: any) => {
  if (!serviceChartRef.value) return
  
  if (!serviceChart) {
    serviceChart = echarts.init(serviceChartRef.value)
  }

  const sortedServices = Object.entries(serviceCounts)
    .sort((a: any, b: any) => b[1] - a[1])
    .slice(0, 10)

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
      type: 'value',
      name: '日志数量'
    },
    yAxis: {
      type: 'category',
      data: sortedServices.map((s: any) => s[0]).reverse()
    },
    series: [
      {
        name: '日志数量',
        type: 'bar',
        data: sortedServices.map((s: any) => s[1]).reverse(),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#667eea' },
            { offset: 1, color: '#764ba2' }
          ])
        },
        barWidth: '60%'
      }
    ]
  }

  serviceChart.setOption(option, true)
}

// 清空趋势图表（聚合查询暂不支持时间趋势）
const clearTrendCharts = () => {
  if (trendChartRef.value) {
    if (!trendChart) {
      trendChart = echarts.init(trendChartRef.value)
    }
    trendChart.setOption({
      title: {
        text: '聚合查询模式下暂不支持时间趋势',
        left: 'center',
        top: 'center',
        textStyle: { color: '#909399', fontSize: 14 }
      }
    }, true)
  }
  
  if (errorRateChartRef.value) {
    if (!errorRateChart) {
      errorRateChart = echarts.init(errorRateChartRef.value)
    }
    errorRateChart.setOption({
      title: {
        text: '聚合查询模式下暂不支持错误率趋势',
        left: 'center',
        top: 'center',
        textStyle: { color: '#909399', fontSize: 14 }
      }
    }, true)
  }
}

// 渲染错误率趋势图
const renderErrorRateChart = (logs: any[]) => {
  if (!errorRateChartRef.value) return
  
  if (!errorRateChart) {
    errorRateChart = echarts.init(errorRateChartRef.value)
  }

  // 按小时聚合错误率
  const timeMap = new Map<string, { total: number; error: number }>()
  logs.forEach(log => {
    // 使用本地时间，不用 UTC
    const date = new Date(log.timestamp)
    const hour = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:00:00`
    if (!timeMap.has(hour)) {
      timeMap.set(hour, { total: 0, error: 0 })
    }
    const counts = timeMap.get(hour)!
    counts.total++
    if (log.level === 'ERROR') {
      counts.error++
    }
  })

  const times = Array.from(timeMap.keys()).sort()
  const errorRates = times.map(t => {
    const counts = timeMap.get(t)!
    return counts.total > 0 ? ((counts.error / counts.total) * 100).toFixed(2) : 0
  })

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}<br/>错误率: {c}%'
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
      boundaryGap: false,
      data: times.map(t => t.slice(5, 16)),
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      name: '错误率 (%)',
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [
      {
        name: '错误率',
        type: 'line',
        smooth: true,
        data: errorRates,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(245, 108, 108, 0.3)' },
            { offset: 1, color: 'rgba(245, 108, 108, 0.05)' }
          ])
        },
        itemStyle: { color: '#f56c6c' },
        lineStyle: { width: 3 }
      }
    ]
  }

  errorRateChart.setOption(option, true)
}

// 使用聚合数据渲染错误率趋势图
const renderErrorRateChartFromAggregation = (levelTrends: any) => {
  if (!errorRateChartRef.value) return
  
  if (!errorRateChart) {
    errorRateChart = echarts.init(errorRateChartRef.value)
  }

  // 提取时间戳（使用任意一个有数据的级别）
  let baseTrend = levelTrends.INFO || levelTrends.WARN || levelTrends.ERROR || levelTrends.DEBUG
  
  if (!baseTrend || !baseTrend.timestamps || baseTrend.timestamps.length === 0) {
    console.warn('没有趋势时间戳数据')
    return
  }
  
  const timestamps = baseTrend.timestamps
  
  // 转换时间戳为本地时间（Loki 返回的是秒级时间戳）
  const times = timestamps.map((ts: number) => {
    const date = new Date(ts * 1000)  // 秒转毫秒
    return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  })
  
  // 计算错误率
  const errorRates: number[] = []
  const errorValues = levelTrends.ERROR?.values || []
  const warnValues = levelTrends.WARN?.values || []
  const infoValues = levelTrends.INFO?.values || []
  const debugValues = levelTrends.DEBUG?.values || []
  
  for (let i = 0; i < timestamps.length; i++) {
    const total = (errorValues[i] || 0) + (warnValues[i] || 0) + (infoValues[i] || 0) + (debugValues[i] || 0)
    const errorRate = total > 0 ? ((errorValues[i] || 0) / total * 100) : 0
    errorRates.push(parseFloat(errorRate.toFixed(2)))
  }

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}<br/>错误率: {c}%'
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
      boundaryGap: false,
      data: times,
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      name: '错误率(%)',
      min: 0,
      max: 100
    },
    series: [
      {
        name: '错误率',
        type: 'line',
        smooth: true,
        data: errorRates,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(245, 108, 108, 0.3)' },
            { offset: 1, color: 'rgba(245, 108, 108, 0.05)' }
          ])
        },
        itemStyle: { color: '#f56c6c' },
        lineStyle: { width: 2 }
      }
    ]
  }

  errorRateChart.setOption(option, true)
}

// 窗口resize处理
const handleResize = () => {
  levelChart?.resize()
  trendChart?.resize()
  serviceChart?.resize()
  errorRateChart?.resize()
}

onMounted(async () => {
  // 初始化时设置默认时间范围（1小时，数据更实时）
  setTimeRange('1h')
  
  await nextTick()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  levelChart?.dispose()
  trendChart?.dispose()
  serviceChart?.dispose()
  errorRateChart?.dispose()
})
</script>

<style scoped lang="less">
.container-list {
  height: 100%;
  overflow-y: auto;
  
  // 隐藏滚动条但保留滚动功能
  scrollbar-width: none; // Firefox
  -ms-overflow-style: none; // IE/Edge
  
  &::-webkit-scrollbar {
    display: none; // Chrome/Safari/Opera
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
  }

  .contain {
    margin-top: 20px;
    padding: 0 20px 40px 20px; // 左右内边距 + 底部内边距
  }

  .stats-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-bottom: 20px;

    .stat-card {
      background: #fff;
      border-radius: 12px;
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 20px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      transition: all 0.3s;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
      }

      .card-icon {
        width: 60px;
        height: 60px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        color: #fff;

        &.total {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        &.error {
          background: linear-gradient(135deg, #f56c6c 0%, #c0392b 100%);
        }

        &.warn {
          background: linear-gradient(135deg, #e6a23c 0%, #d68910 100%);
        }

        &.services {
          background: linear-gradient(135deg, #409eff 0%, #2874d5 100%);
        }
      }

      .card-content {
        flex: 1;

        .card-value {
          font-size: 32px;
          font-weight: bold;
          color: #303133;
          margin-bottom: 4px;
          
          .limit-tip {
            color: #e6a23c;
            font-size: 24px;
            margin-left: 4px;
          }
        }

        .card-label {
          font-size: 14px;
          color: #909399;
          
          .limit-warning {
            color: #e6a23c;
            font-size: 12px;
            margin-left: 4px;
          }
        }
      }
    }
  }

  .charts-container {
    display: flex;
    flex-direction: column;
    gap: 20px;

    .chart-row {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }

    .chart-card {
      background: #fff;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);

      .chart-header {
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 2px solid #f0f2f5;

        h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #303133;
          display: flex;
          align-items: center;

          &::before {
            content: '';
            display: inline-block;
            width: 4px;
            height: 18px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 2px;
            margin-right: 10px;
          }
        }
      }

      .chart-content {
        width: 100%;
        height: 350px;
      }
    }
  }
}
</style>
