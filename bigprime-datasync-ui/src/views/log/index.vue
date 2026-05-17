<template>
  <div class="container-list">
    <Breadcrumb :items="['日志管理', '日志查询']" />
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
          <tiny-grid-toolbar class="grid-toolbar" size="small">
            <template #buttons>
              <tiny-form :model="searchForm" inline label-width="80px">
                <tiny-form-item label="服务名称">
                  <tiny-input
                    v-model="searchForm.serviceName"
                    placeholder="请输入服务名称"
                    clearable
                  ></tiny-input>
                </tiny-form-item>
                <tiny-form-item label="关键字">
                  <tiny-input
                    v-model="searchForm.keyword"
                    placeholder="请输入关键字"
                    clearable
                  ></tiny-input>
                </tiny-form-item>
                <tiny-form-item label="TraceID">
                  <tiny-input
                    v-model="searchForm.traceId"
                    placeholder="请输入TraceID"
                    clearable
                  ></tiny-input>
                </tiny-form-item>
                <tiny-form-item label="日志级别">
                  <tiny-select
                    v-model="searchForm.level"
                    placeholder="请选择"
                    style="width: 100px"
                    clearable
                  >
                    <tiny-option label="ERROR" value="ERROR"></tiny-option>
                    <tiny-option label="WARN" value="WARN"></tiny-option>
                    <tiny-option label="INFO" value="INFO"></tiny-option>
                    <tiny-option label="DEBUG" value="DEBUG"></tiny-option>
                  </tiny-select>
                </tiny-form-item>
                <tiny-form-item label="时间范围">
                  <tiny-button-group>
                    <tiny-button
                      size="small"
                      :type="timeRangeType === '1h' ? 'primary' : ''"
                      @click="setTimeRange('1h')"
                      >1小时</tiny-button
                    >
                    <tiny-button
                      size="small"
                      :type="timeRangeType === '6h' ? 'primary' : ''"
                      @click="setTimeRange('6h')"
                      >6小时</tiny-button
                    >
                    <tiny-button
                      size="small"
                      :type="timeRangeType === '24h' ? 'primary' : ''"
                      @click="setTimeRange('24h')"
                      >24小时</tiny-button
                    >
                    <tiny-button
                      size="small"
                      :type="timeRangeType === '7d' ? 'primary' : ''"
                      @click="setTimeRange('7d')"
                      >7天</tiny-button
                    >
                    <tiny-button
                      size="small"
                      :type="timeRangeType === 'custom' ? 'primary' : ''"
                      @click="showCustomTimeRange"
                      >自定义</tiny-button
                    >
                  </tiny-button-group>
                </tiny-form-item>
                <tiny-form-item v-if="timeRangeType === 'custom'">
                  <tiny-date-picker
                    v-model="searchForm.timeRange"
                    type="datetimerange"
                    format="yyyy-MM-dd HH:mm:ss"
                  ></tiny-date-picker>
                </tiny-form-item>

                <tiny-form-item>
                  <tiny-button size="small" type="primary" @click="handleQuery">查询</tiny-button>
                  <tiny-button size="small" @click="handleReset">重置</tiny-button>
                  <tiny-button
                    size="small"
                    :type="liveMode ? 'success' : ''"
                    @click="toggleLiveMode"
                  >
                    {{ liveMode ? '停止实时' : '实时日志' }}
                  </tiny-button>
                  <tiny-button 
                    v-if="liveMode" 
                    size="small" 
                    @click="handleManualRefresh"
                    :loading="loading"
                  >
                    手动刷新
                  </tiny-button>
                  <tiny-button size="small" @click="handleExport">导出</tiny-button>
                </tiny-form-item>
                
                <!-- 实时模式信息栏 -->
                <tiny-form-item v-if="liveMode" style="margin-left: 20px">
                  <div class="live-info">
                    <span class="live-dot"></span>
                    <span class="live-text">实时刷新中</span>
                    <span class="live-interval">间隔: {{ refreshInterval / 1000 }}秒</span>
                    <span class="live-countdown">下次刷新: {{ countdown }}秒</span>
                    <span class="live-last-update">上次更新: {{ lastRefreshTime }}</span>
                    <tiny-button size="mini" text @click="showIntervalConfig">配置</tiny-button>
                  </div>
                </tiny-form-item>
              </tiny-form>
            </template>
          </tiny-grid-toolbar>
        </template>

        <tiny-grid-column fixed="left" type="index" width="70"></tiny-grid-column>

        <tiny-grid-column
          title="时间"
          field="timestamp"
          fixed="left"
          width="170"
        ></tiny-grid-column>

        <tiny-grid-column title="服务名称" field="serviceName" width="150"></tiny-grid-column>

        <tiny-grid-column title="日志级别" field="level" align="center" width="100">
          <template #default="{ row }">
            <tiny-tag :type="getLevelTagType(row.level)">{{ row.level }}</tiny-tag>
          </template>
        </tiny-grid-column>

        <tiny-grid-column title="日志内容" field="message" min-width="600" show-overflow="tooltip">
          <template #default="{ row }">
            <div class="log-message-cell" :title="row.message">{{ row.message }}</div>
          </template>
        </tiny-grid-column>

        <tiny-grid-column title="TraceID" field="traceId" width="250">
          <template #default="{ row }">
            <div v-if="row.traceId && row.traceId !== '-'" class="trace-id-cell">
              <span class="trace-id-text" :title="row.traceId">{{ row.traceId }}</span>
              <tiny-button 
                type="text" 
                size="mini"
                @click.stop="openSkyWalking(row.traceId)"
                title="跳转到 SkyWalking"
              >
                调用链
              </tiny-button>
            </div>
            <span v-else>-</span>
          </template>
        </tiny-grid-column>

        <tiny-grid-column title="操作" align="center" fixed="right" width="100">
          <template #default="{ row }">
            <div style="display: flex; gap: 10px; justify-content: center; align-items: center;">
              <div title="详情">
                <tiny-icon-eyeopen
                  @click="showLogDetail(row)"
                  style="font-size: 20px; cursor: pointer; fill: #409eff; color: #409eff;"
                />
              </div>
              <div title="上下文">
                <tiny-icon-align-left
                  @click="showContext(row)"
                  style="font-size: 20px; cursor: pointer; fill: #409eff; color: #409eff;"
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

    <!-- 日志详情弹窗 -->
    <tiny-dialog-box
      v-model:visible="detailVisible"
      title="日志详情"
      width="900px"
      :append-to-body="true"
    >
      <div v-if="currentLog" class="log-detail">
        <div class="detail-card">
          <div class="detail-header">
            <div class="header-item">
              <span class="header-label">时间</span>
              <span class="header-value">{{ currentLog.timestamp }}</span>
            </div>
            <div class="header-item">
              <span class="header-label">服务</span>
              <span class="header-value">{{ currentLog.serviceName }}</span>
            </div>
            <div class="header-item">
              <span class="header-label">级别</span>
              <tiny-tag :type="getLevelTagType(currentLog.level)">{{ currentLog.level }}</tiny-tag>
            </div>
            <div class="header-item" v-if="currentLog.traceId && currentLog.traceId !== '-'">
              <span class="header-label">TraceID</span>
              <div class="trace-id-group">
                <span class="header-value trace-id" :title="currentLog.traceId">{{ currentLog.traceId }}</span>
                <tiny-button 
                  size="mini" 
                  type="primary"
                  @click="openSkyWalking(currentLog.traceId)"
                  title="跳转到 SkyWalking"
                >
                  <svg-icon name="link" style="width: 14px; height: 14px" />
                  查看调用链
                </tiny-button>
              </div>
            </div>
          </div>
          
          <div class="detail-content">
            <div class="content-label">日志内容</div>
            <div class="content-box">{{ currentLog.message }}</div>
          </div>
          
          <div v-if="currentLog.stackTrace" class="detail-content">
            <div class="content-label">堆栈信息</div>
            <div class="content-box stack-trace">{{ currentLog.stackTrace }}</div>
          </div>
        </div>
      </div>
    </tiny-dialog-box>

    <!-- 日志上下文弹窗 -->
    <tiny-dialog-box
      v-model:visible="contextVisible"
      title="日志上下文"
      width="1000px"
      :append-to-body="true"
    >
      <div class="context-wrapper">
        <div class="context-controls">
          <div class="control-group">
            <label>上下文行数</label>
            <tiny-numeric v-model="contextLines" :min="5" :max="100" :step="5" />
          </div>
          <tiny-button size="small" type="primary" @click="loadContext">刷新</tiny-button>
        </div>
        
        <div class="context-logs">
          <div v-if="contextData.length === 0" class="empty-placeholder">
            <p>暂无上下文日志</p>
          </div>
          <div v-else>
            <div
              v-for="(log, index) in contextData"
              :key="index"
              class="context-log-item"
              :class="{ 'current-log': log.isCurrent }"
            >
              <div class="log-header">
                <span class="log-index">#{{ index + 1 }}</span>
                <span class="log-time">{{ log.timestamp }}</span>
                <tiny-tag :type="getLevelTagType(log.level)" size="mini">{{ log.level }}</tiny-tag>
                <span class="log-service">{{ log.serviceName }}</span>
                <span v-if="log.isCurrent" class="current-badge">当前日志</span>
              </div>
              <div class="log-message">{{ log.message }}</div>
            </div>
          </div>
        </div>
      </div>
    </tiny-dialog-box>
    
    <!-- 刷新间隔配置弹窗 -->
    <tiny-dialog-box
      v-model:visible="intervalConfigVisible"
      title="配置刷新间隔"
      width="400px"
      :append-to-body="true"
    >
      <div class="interval-config">
        <div class="config-item">
          <label>刷新间隔（秒）</label>
          <tiny-select v-model="tempRefreshInterval" placeholder="请选择">
            <tiny-option label="1秒" :value="1000"></tiny-option>
            <tiny-option label="3秒" :value="3000"></tiny-option>
            <tiny-option label="5秒" :value="5000"></tiny-option>
            <tiny-option label="10秒" :value="10000"></tiny-option>
            <tiny-option label="30秒" :value="30000"></tiny-option>
          </tiny-select>
        </div>
        <div class="config-tips">
          <p>提示：</p>
          <ul>
            <li>刷新间隔越短，数据更实时，但服务器负载越大</li>
            <li>建议使用 5秒 或 10秒 间隔</li>
            <li>1秒间隔仅适用于紧急问题排查</li>
          </ul>
        </div>
      </div>
      <template #footer>
        <tiny-button @click="intervalConfigVisible = false">取消</tiny-button>
        <tiny-button type="primary" @click="applyIntervalConfig">确定</tiny-button>
      </template>
    </tiny-dialog-box>

    <!-- 导出配置对话框 -->
    <tiny-dialog-box
      v-model:visible="exportDialogVisible"
      title="导出日志"
      width="500px"
    >
      <tiny-form label-width="150px">
        <tiny-form-item label="导出格式">
          <tiny-select v-model="exportConfig.format" style="width: 100%">
            <tiny-option label="JSON" value="JSON"></tiny-option>
            <tiny-option label="TXT" value="TXT"></tiny-option>
            <tiny-option label="CSV" value="CSV"></tiny-option>
          </tiny-select>
        </tiny-form-item>
        <tiny-form-item v-if="isMaskEnabled" label="脱敏状态">
          <tiny-tag type="success">已开启</tiny-tag>
          <span class="tip-text">导出的日志将自动应用脱敏</span>
        </tiny-form-item>
      </tiny-form>
      <template #footer>
        <tiny-button @click="exportDialogVisible = false">取消</tiny-button>
        <tiny-button type="primary" @click="executeExport" :loading="exporting">导出</tiny-button>
      </template>
    </tiny-dialog-box>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, computed } from 'vue'
import {
  Grid as TinyGrid,
  Modal,
  Tag as TinyTag,
  TinyButton,
  TinyButtonGroup,
  TinyForm,
  TinyFormItem,
  TinyGridColumn,
  TinyGridToolbar,
  TinyPager,
  TinyInput,
  Numeric as TinyNumeric,
  TinySelect,
  TinyOption,
  TinyDatePicker,
  TinyDialogBox,
  Switch as TinySwitch
} from '@opentiny/vue'
import { iconEllipsis, iconEyeopen, iconAlignLeft } from '@opentiny/vue-icon'
import Breadcrumb from '@/components/breadcrumb/index.vue'
import { queryLogs, getSystemConfig } from '@/services/log'
import { exportLogs, maskContent } from '@/services/logEnhancement'
import { formatDateTime } from '@/utils/date'
import { PageUtils } from '@/utils/page'

const loading = ref(false)
const tableHeight = ref(600)
const gridRef = ref(null)
const gridData = ref<any[]>([])
const tinyIconEllipsis = iconEllipsis()
const TinyIconEyeopen = iconEyeopen()
const TinyIconAlignLeft = iconAlignLeft()

const detailVisible = ref(false)
const currentLog = ref<any>(null)
const timeRangeType = ref('1h')
const liveMode = ref(false)
let liveTimer: any = null
const refreshInterval = ref(5000) // 默认5秒刷新
const contextVisible = ref(false)
const contextData = ref<any[]>([])
const contextLines = ref(20) // 上下文默认20行
const intervalConfigVisible = ref(false)
const tempRefreshInterval = ref(5000)
const countdown = ref(0)
const lastRefreshTime = ref('-')
let countdownTimer: any = null

// 导出配置
const exportDialogVisible = ref(false)
const exportConfig = reactive({
  format: 'JSON'
})
const exporting = ref(false)

// 全局脱敏配置
const isMaskEnabled = computed(() => {
  const saved = localStorage.getItem('logMaskEnabled')
  return saved === 'true'
})

// SkyWalking 配置（从配置中读取）
const skyWalkingUrl = ref('http://localhost:8080') // 默认地址
const skyWalkingConnectorId = ref('')

// 查询表单
const searchForm = reactive({
  serviceName: '',
  level: undefined,
  keyword: '',
  traceId: '',
  timeRange: [new Date(Date.now() - 3600000), new Date()] // 默认1小时
})

const formPage = reactive({
  page: 1,
  pageSize: 50,
  total: 0,
  align: 'right',
  layout: 'total, prev, pager, next, jumper, sizes',
  pageSizes: [20, 50, 100, 200]
})

// 查询日志
const handleQuery = async () => {
  if (!searchForm.timeRange || searchForm.timeRange.length !== 2) {
    Modal.message({ message: '请选择时间范围', status: 'warning' })
    return
  }

  loading.value = true
  try {
    const params = {
      serviceName: searchForm.serviceName,
      level: searchForm.level,
      keyword: searchForm.keyword,
      traceId: searchForm.traceId,
      startTime: formatDateTime(searchForm.timeRange[0]),
      endTime: formatDateTime(searchForm.timeRange[1]),
      limit: formPage.pageSize
    }

    const result = await queryLogs(params)

    // 后端返回 Result<String>，result.data 是 Loki JSON 字符串
    if (result && result.data) {
      // result.data 是 Loki JSON 字符串
      const lokiResponse = JSON.parse(result.data)
      
      // 解析 Loki 响应格式
      if (lokiResponse.status === 'success' && lokiResponse.data?.result) {
        gridData.value = await parseLokiResponse(lokiResponse.data.result)
        formPage.total = gridData.value.length

        if (gridData.value.length === 0) {
          Modal.message({ message: '未查询到日志数据', status: 'info' })
        }
      } else if (lokiResponse.error) {
        Modal.message({ message: '查询失败: ' + lokiResponse.error, status: 'error' })
        gridData.value = []
      } else {
        Modal.message({ message: '查询响应格式异常', status: 'error' })
        gridData.value = []
      }
    }
  } catch (error: any) {
    Modal.message({ message: '查询失败: ' + (error.message || '未知错误'), status: 'error' })
    gridData.value = []
  } finally {
    loading.value = false
  }
}

// 解析 Loki 响应格式
const parseLokiResponse = async (result: any[]) => {
  const logs: any[] = []
  result.forEach((item: any) => {
    const labels = item.stream || {}
    item.values?.forEach((value: any[]) => {
      const [timestamp, logLine] = value
      
      // 尝试解析 JSON
      let logObj: any = null
      let rawMessage = logLine
      
      try {
        // 先尝试直接解析
        logObj = JSON.parse(logLine)
      } catch (e) {
        // 如果失败，尝试提取 JSON 部分（处理异常日志格式）
        const jsonMatch = logLine.match(/\{[\s\S]*?\}(?=\s*[^}]*$)/)
        if (jsonMatch) {
          try {
            logObj = JSON.parse(jsonMatch[0])
            // 提取 JSON 后面的内容作为堆栈信息
            const afterJson = logLine.substring(jsonMatch.index! + jsonMatch[0].length).trim()
            if (afterJson && logObj) {
              logObj.stackTrace = afterJson
            }
          } catch (e2) {
            // 如果还是失败，使用原始日志
          }
        }
      }
      
      if (logObj) {
        // 成功解析 JSON
        // 提取并格式化 message
        const formattedMessage = formatLogMessage(logObj.message || rawMessage)
        
        logs.push({
          key: `${timestamp}-${Math.random()}`,
          timestamp: formatDateTime(new Date(Number(timestamp) / 1000000)),
          serviceName: labels.serviceName || logObj.serviceName || '-',
          level: labels.level || logObj.level || 'INFO',
          message: formattedMessage.displayMessage,  // 显示的消息
          rawMessage: logObj.message || rawMessage,  // 原始完整消息
          logger: formattedMessage.logger,           // 类名
          thread: formattedMessage.thread,            // 线程名
          traceId: logObj.trace_id || logObj.traceId || '-',
          stackTrace: logObj.stackTrace
        })
      } else {
        // 完全无法解析，使用原始日志
        logs.push({
          key: `${timestamp}-${Math.random()}`,
          timestamp: formatDateTime(new Date(Number(timestamp) / 1000000)),
          serviceName: labels.serviceName || '-',
          level: labels.level || 'INFO',
          message: rawMessage,
          rawMessage: rawMessage,
          traceId: '-'
        })
      }
    })
  })
  
  const sortedLogs = logs.sort((a, b) => b.timestamp.localeCompare(a.timestamp))
  
  // 如果开启了脱敏，对日志内容进行脱敏处理
  if (isMaskEnabled.value) {
    for (const log of sortedLogs) {
      try {
        const res = await maskContent(log.message)
        const data = res.data || res
        if (data && data.code === 0) {
          log.message = data.data
        }
      } catch (error) {
        console.error('脱敏失败:', error)
      }
    }
  }
  
  return sortedLogs
}

// 格式化日志消息，提取关键信息
const formatLogMessage = (rawMessage: string) => {
  // 日志可能有多种格式：
  // 格式1（带方括号）：[106449204241288396] 2026-01-16 18:38:35,009 INFO [o.a.s.e.s.d.p.PhysicalVertex ] [hz.main.seaTunnel.task.thread-289] - ...
  // 格式2（无方括号）：2026-01-16 18:44:55.545 INFO http-nio-6506-exec-3 com.bigprime.datasync.backend.controller.log.LogManagementController 日志查询成功...
  
  // 提取 dagExecutionId（如果有）
  const dagIdMatch = rawMessage.match(/^\[([a-zA-Z0-9-]+)\]/)
  const dagExecutionId = dagIdMatch ? dagIdMatch[1] : null
  
  // 尝试匹配带方括号的格式
  let levelMatch = rawMessage.match(/(ERROR|WARN|INFO|DEBUG)\s+\[(.+?)\]\s+\[(.+?)\]\s+-\s*(.*)$/)
  
  if (levelMatch) {
    const logger = levelMatch[2].trim()  // 类名
    const thread = levelMatch[3].trim()  // 线程名
    const actualMessage = levelMatch[4].trim()  // 实际消息
    
    let displayMessage = actualMessage
    if (dagExecutionId && displayMessage.includes(dagExecutionId)) {
      displayMessage = displayMessage.replace(new RegExp(dagExecutionId, 'g'), '').trim()
    }
    
    return { displayMessage, logger, thread, dagExecutionId }
  }
  
  // 尝试匹配无方括号的格式
  levelMatch = rawMessage.match(/(ERROR|WARN|INFO|DEBUG)\s+(\S+)\s+(\S+(?:\.\S+)*)\s+(.*)$/)
  
  if (levelMatch) {
    const thread = levelMatch[2].trim()    // 线程名
    const logger = levelMatch[3].trim()    // 类名
    const actualMessage = levelMatch[4].trim()  // 实际消息
    
    let displayMessage = actualMessage
    if (dagExecutionId && displayMessage.includes(dagExecutionId)) {
      displayMessage = displayMessage.replace(new RegExp(dagExecutionId, 'g'), '').trim()
    }
    
    return { displayMessage, logger, thread, dagExecutionId }
  }
  
  // 如果无法解析，返回原始消息
  return {
    displayMessage: rawMessage,
    logger: null,
    thread: null,
    dagExecutionId
  }
}

// 重置表单
const handleReset = () => {
  searchForm.serviceName = ''
  searchForm.level = undefined
  searchForm.keyword = ''
  searchForm.traceId = ''
  timeRangeType.value = '1h'
  searchForm.timeRange = [new Date(Date.now() - 3600000), new Date()]
  gridData.value = []
  formPage.page = 1
  formPage.total = 0
  if (liveMode.value) {
    toggleLiveMode()
  }
}

// 设置时间范围
const setTimeRange = (type: string) => {
  timeRangeType.value = type
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

  searchForm.timeRange = [start, now]
}

// 显示自定义时间范围
const showCustomTimeRange = () => {
  timeRangeType.value = 'custom'
}

// 切换实时模式
const toggleLiveMode = () => {
  liveMode.value = !liveMode.value

  if (liveMode.value) {
    // 启动实时模式
    handleQuery()
    lastRefreshTime.value = formatDateTime(new Date())
    countdown.value = Math.floor(refreshInterval.value / 1000)
    
    // 启动倒计时
    startCountdown()
    
    // 启动定时刷新
    liveTimer = setInterval(() => {
      // 更新时间范围到最新
      const now = new Date()
      searchForm.timeRange[1] = now
      handleQuery()
      lastRefreshTime.value = formatDateTime(now)
      countdown.value = Math.floor(refreshInterval.value / 1000)
    }, refreshInterval.value)
    
    Modal.message({ message: '已开启实时日志模式', status: 'success' })
  } else {
    // 停止实时模式
    if (liveTimer) {
      clearInterval(liveTimer)
      liveTimer = null
    }
    if (countdownTimer) {
      clearInterval(countdownTimer)
      countdownTimer = null
    }
    Modal.message({ message: '已停止实时日志模式', status: 'info' })
  }
}

// 启动倒计时
const startCountdown = () => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
  
  countdownTimer = setInterval(() => {
    countdown.value = countdown.value > 0 ? countdown.value - 1 : Math.floor(refreshInterval.value / 1000)
  }, 1000)
}

// 手动刷新
const handleManualRefresh = async () => {
  if (!liveMode.value) return
  
  // 更新时间范围到最新
  const now = new Date()
  searchForm.timeRange[1] = now
  await handleQuery()
  lastRefreshTime.value = formatDateTime(now)
  
  // 重置倒计时
  countdown.value = Math.floor(refreshInterval.value / 1000)
  
  // 重启定时器
  if (liveTimer) {
    clearInterval(liveTimer)
  }
  liveTimer = setInterval(() => {
    const now = new Date()
    searchForm.timeRange[1] = now
    handleQuery()
    lastRefreshTime.value = formatDateTime(now)
    countdown.value = Math.floor(refreshInterval.value / 1000)
  }, refreshInterval.value)
}

// 显示间隔配置弹窗
const showIntervalConfig = () => {
  tempRefreshInterval.value = refreshInterval.value
  intervalConfigVisible.value = true
}

// 应用间隔配置
const applyIntervalConfig = () => {
  refreshInterval.value = tempRefreshInterval.value
  intervalConfigVisible.value = false
  
  if (liveMode.value) {
    // 如果正在实时模式，重启定时器
    if (liveTimer) {
      clearInterval(liveTimer)
    }
    
    countdown.value = Math.floor(refreshInterval.value / 1000)
    startCountdown()
    
    liveTimer = setInterval(() => {
      const now = new Date()
      searchForm.timeRange[1] = now
      handleQuery()
      lastRefreshTime.value = formatDateTime(now)
      countdown.value = Math.floor(refreshInterval.value / 1000)
    }, refreshInterval.value)
    
    Modal.message({ 
      message: `刷新间隔已更新为 ${refreshInterval.value / 1000} 秒`, 
      status: 'success' 
    })
  }
}

// 导出日志
const handleExport = () => {
  if (!gridData.value || gridData.value.length === 0) {
    Modal.message({ message: '没有可导出的数据', status: 'warning' })
    return
  }

  // 显示导出配置对话框
  exportDialogVisible.value = true
}

// 执行导出
const executeExport = async () => {
  exporting.value = true
  try {
    const params = {
      format: exportConfig.format,
      applyMask: isMaskEnabled.value, // 使用全局配置
      queryRequest: {
        serviceName: searchForm.serviceName,
        level: searchForm.level,
        keyword: searchForm.keyword,
        traceId: searchForm.traceId,
        startTime: formatDateTime(searchForm.timeRange[0]),
        endTime: formatDateTime(searchForm.timeRange[1]),
        limit: formPage.pageSize
      }
    }

    const response = await exportLogs(params)
    
    // 创建下载链接
    const blob = new Blob([response.data], { 
      type: exportConfig.format === 'CSV' ? 'text/csv' : 
            exportConfig.format === 'JSON' ? 'application/json' : 'text/plain'
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    const ext = exportConfig.format.toLowerCase()
    link.download = `logs_${formatDateTime(new Date()).replace(/[\s:]/g, '_')}.${ext}`
    link.click()
    URL.revokeObjectURL(url)
    
    Modal.message({ message: '导出成功', status: 'success' })
    exportDialogVisible.value = false
  } catch (error: any) {
    Modal.message({ message: '导出失败: ' + (error.message || '未知错误'), status: 'error' })
  } finally {
    exporting.value = false
  }
}

// 分页变化
const pageChange = (page: number) => {
  formPage.page = page
}

const limitChange = (limit: number) => {
  formPage.pageSize = limit
  formPage.page = 1
}

// 显示日志详情
const showLogDetail = (record: any) => {
  currentLog.value = record
  detailVisible.value = true
}

// 显示日志上下文
const showContext = async (record: any) => {
  currentLog.value = record
  contextVisible.value = true
  await loadContext()
}

// 加载日志上下文
const loadContext = async () => {
  if (!currentLog.value) return

  try {
    // 从当前日志时间前后各取 N 行
    const currentTime = new Date(currentLog.value.timestamp)
    const before = new Date(currentTime.getTime() - 5 * 60 * 1000) // 前5分钟
    const after = new Date(currentTime.getTime() + 5 * 60 * 1000) // 后5分钟

    const params = {
      serviceName: searchForm.serviceName,
      startTime: formatDateTime(before),
      endTime: formatDateTime(after),
      limit: contextLines.value * 2
    }

    const result = await queryLogs(params)

    // 后端返回 Result<String>，result.data 是 Loki JSON 字符串
    if (result && result.data) {
      // result.data 是 Loki JSON 字符串
      const lokiResponse = JSON.parse(result.data)
      
      if (lokiResponse.status === 'success' && lokiResponse.data?.result) {
        const allLogs = await parseLokiResponse(lokiResponse.data.result)

        // 找到当前日志的位置
        const currentIndex = allLogs.findIndex(
          (log) =>
            log.timestamp === currentLog.value.timestamp && log.message === currentLog.value.message
        )

        if (currentIndex >= 0) {
          // 提取上下文
          const startIndex = Math.max(0, currentIndex - contextLines.value / 2)
          const endIndex = Math.min(allLogs.length, currentIndex + contextLines.value / 2 + 1)
          contextData.value = allLogs.slice(startIndex, endIndex).map((log, index) => ({
            ...log,
            isCurrent: startIndex + index === currentIndex
          }))
        } else {
          contextData.value = allLogs.slice(0, contextLines.value)
        }
      }
    }
  } catch (error: any) {
    Modal.message({ message: '加载上下文失败: ' + error.message, status: 'error' })
  }
}

// 获取日志级别颜色
const getLevelTagType = (level: string) => {
  const typeMap: Record<string, string> = {
    ERROR: 'danger',
    WARN: 'warning',
    INFO: 'info',
    DEBUG: 'success'
  }
  return typeMap[level] || 'info'
}

// 打开 SkyWalking 调用链
const openSkyWalking = (traceId: string) => {
  if (!traceId || traceId === '-') {
    Modal.message({ message: 'TraceID 为空，无法跳转', status: 'warning' })
    return
  }
  
  // 构造 SkyWalking 调用链查询 URL
  // SkyWalking 9.x 的 URL 格式: http://skywalking-ui:8080/trace/{traceId}
  const url = `${skyWalkingUrl.value}/trace/${traceId}`
  
  // 在新窗口打开
  window.open(url, '_blank')
  
  Modal.message({ 
    message: '已打开 SkyWalking 调用链页面', 
    status: 'success',
    duration: 2000
  })
}

onMounted(async () => {
  // 加载 SkyWalking 配置
  try {
    // 从 localStorage 读取配置的连接器 ID
    const savedConnectorId = localStorage.getItem('skyWalkingConnectorId')
    if (savedConnectorId) {
      skyWalkingConnectorId.value = savedConnectorId
      
      // 通过连接器 API 获取连接器详情
      try {
        const connectorRes: any = await fetch(`/api/connector/get/${savedConnectorId}`)
        const connectorData = await connectorRes.json()
        
        if (connectorData.code === '0' && connectorData.data) {
          // 解析连接器参数获取 URL
          const params = JSON.parse(connectorData.data.connectorParams || '{}')
          if (params.url) {
            skyWalkingUrl.value = params.url
            console.log('加载 SkyWalking URL 成功:', skyWalkingUrl.value)
          }
        }
      } catch (error) {
        console.warn('获取 SkyWalking 连接器信息失败，使用默认地址', error)
      }
    }
  } catch (error) {
    console.warn('加载 SkyWalking 配置失败，使用默认配置', error)
  }
  
  // 页面加载时自动查询
  handleQuery()
  tableHeight.value = PageUtils.setTableHeight(315)
})

onBeforeUnmount(() => {
  // 清理定时器
  if (liveTimer) {
    clearInterval(liveTimer)
    liveTimer = null
  }
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
})
</script>

<style scoped lang="less">
.container-list {
  .contain {
    margin-top: 20px;
    padding: 0 20px;
  }
  /*  :deep(.tiny-select .tiny-input .tiny-input__inner[readonly]) {
    width: 100px;
    .div{
      width: 100px;
    }
  }*/

  // 减少toolbar和表格之间的间距
  :deep(.tiny-grid__toolbar) {
    margin-bottom: 10px;
  }

  // 表格内容不缩略，显示全部内容
  :deep(.tiny-grid-body__row) {
    .tiny-grid-cell {
      white-space: normal !important;
      word-break: break-word;
      line-height: 1.6;
      padding: 8px 4px;
    }
  }

  .log-message-cell {
    white-space: pre-wrap;
    word-break: break-word;
    font-family: 'Courier New', Consolas, monospace;
    font-size: 13px;
    line-height: 1.6;
    max-height: none;
  }

  .log-detail {
    .detail-card {
      background: #fff;
      border-radius: 8px;
    }

    .detail-header {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 8px 8px 0 0;
      margin-bottom: 20px;

      .header-item {
        display: flex;
        flex-direction: column;
        gap: 6px;

        .header-label {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.8);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .header-value {
          font-size: 14px;
          color: #fff;
          font-weight: 600;
          word-break: break-all;

          &.trace-id {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            background: rgba(255, 255, 255, 0.2);
            padding: 4px 8px;
            border-radius: 4px;
            display: inline-block;
          }
        }
      }
    }

    .detail-content {
      margin-bottom: 20px;
      padding: 0 20px;

      &:last-child {
        padding-bottom: 20px;
      }

      .content-label {
        font-size: 14px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 12px;
        display: flex;
        align-items: center;

        &::before {
          content: '';
          display: inline-block;
          width: 4px;
          height: 16px;
          background: #409eff;
          border-radius: 2px;
          margin-right: 8px;
        }
      }

      .content-box {
        background: #f5f7fa;
        padding: 16px;
        border-radius: 6px;
        border: 1px solid #e4e7ed;
        font-size: 13px;
        line-height: 1.8;
        color: #606266;
        white-space: pre-wrap;
        word-break: break-all;
        font-family: 'Courier New', Consolas, monospace;
        max-height: 400px;
        overflow-y: auto;

        &.stack-trace {
          background: #fef0f0;
          border-color: #fbc4c4;
          color: #f56c6c;
          font-size: 12px;
        }

        &::-webkit-scrollbar {
          width: 6px;
        }

        &::-webkit-scrollbar-thumb {
          background: #dcdfe6;
          border-radius: 3px;
        }
      }
    }
  }

  .context-wrapper {
    .context-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 8px;
      margin-bottom: 20px;

      .control-group {
        display: flex;
        align-items: center;
        gap: 12px;

        label {
          color: #fff;
          font-weight: 500;
          font-size: 14px;
        }

        :deep(.tiny-numeric) {
          width: 120px;
        }
      }
    }

    .empty-placeholder {
      text-align: center;
      padding: 80px 20px;
      color: #909399;
      font-size: 14px;

      p {
        margin: 0;
      }
    }

    .context-logs {
      max-height: 600px;
      overflow-y: auto;
      border: 1px solid #e4e7ed;
      border-radius: 8px;

      &::-webkit-scrollbar {
        width: 8px;
      }

      &::-webkit-scrollbar-thumb {
        background: #dcdfe6;
        border-radius: 4px;
      }

      .context-log-item {
        padding: 16px;
        border-bottom: 1px solid #ebeef5;
        transition: all 0.3s;

        &:last-child {
          border-bottom: none;
        }

        &:hover {
          background-color: #f5f7fa;
          transform: translateX(4px);
        }

        &.current-log {
          background: linear-gradient(90deg, #ecf5ff 0%, #f0f9ff 100%);
          border-left: 4px solid #409eff;
          box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);

          .log-header {
            .log-index {
              background: #409eff;
              color: #fff;
            }
          }
        }

        .log-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
          flex-wrap: wrap;

          .log-index {
            background: #e4e7ed;
            color: #606266;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            font-family: monospace;
            min-width: 40px;
            text-align: center;
          }

          .log-time {
            color: #909399;
            font-size: 13px;
            font-family: 'Courier New', monospace;
            font-weight: 500;
          }

          .log-service {
            color: #606266;
            font-size: 13px;
            padding: 2px 10px;
            background: #f0f2f5;
            border-radius: 4px;
          }

          .current-badge {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #fff;
            padding: 2px 10px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            letter-spacing: 0.5px;
            animation: pulse 2s infinite;
          }
        }

        .log-message {
          font-size: 13px;
          line-height: 1.8;
          color: #303133;
          white-space: pre-wrap;
          word-break: break-all;
          padding: 12px;
          background: #fafafa;
          border-radius: 6px;
          border-left: 3px solid #e4e7ed;
          font-family: 'Courier New', Consolas, monospace;
        }
      }
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }
  
  // 实时模式信息栏样式
  .live-info {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 20px;
    color: #fff;
    font-size: 12px;
    animation: fadeIn 0.3s ease;
    
    .live-dot {
      width: 8px;
      height: 8px;
      background: #52c41a;
      border-radius: 50%;
      animation: blink 1.5s infinite;
    }
    
    .live-text {
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    
    .live-interval,
    .live-countdown,
    .live-last-update {
      opacity: 0.95;
      font-family: 'Courier New', monospace;
    }
  }
  
  @keyframes blink {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.3;
    }
  }
  
  @keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    // TraceID 相关样式
    .trace-id-group {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .trace-id {
        font-family: 'Courier New', monospace;
        color: #1890ff;
        cursor: text;
      }
    }
    
    .trace-id-cell {
      display: flex;
      align-items: center;
      gap: 6px;
      
      .trace-id-text {
        font-family: 'Courier New', monospace;
        font-size: 12px;
        color: #1890ff;
        max-width: 150px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  
  // 间隔配置弹窗样式
  .interval-config {
    .config-item {
      margin-bottom: 20px;
      
      label {
        display: block;
        margin-bottom: 8px;
        color: #303133;
        font-weight: 500;
      }
    }
    
    .config-tips {
      background: #f0f9ff;
      border-left: 4px solid #409eff;
      padding: 12px 16px;
      border-radius: 4px;
      
      p {
        margin: 0 0 8px 0;
        color: #409eff;
        font-weight: 600;
      }
      
      ul {
        margin: 0;
        padding-left: 20px;
        
        li {
          color: #606266;
          font-size: 13px;
          line-height: 1.8;
          margin-bottom: 4px;
        }
      }
    }
  }
  
  // 导出对话框样式
  .tip-text {
    margin-left: 10px;
    color: #909399;
    font-size: 12px;
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
}
</style>
