<template>
  <div class="monitor-dashboard">
    <Breadcrumb :items="['爬虫管理', '实时监控']" />
    <div class="contain">
      <!-- 统计卡片 -->
      <div class="stats-cards">
        <div class="stat-card">
          <div class="card-icon running">📊</div>
          <div class="card-content">
            <div class="card-label">运行中任务</div>
            <div class="card-value">{{ stats.runningTasks }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="card-icon success">✅</div>
          <div class="card-content">
            <div class="card-label">今日成功</div>
            <div class="card-value">{{ stats.todaySuccess }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="card-icon failed">❌</div>
          <div class="card-content">
            <div class="card-label">今日失败</div>
            <div class="card-value">{{ stats.todayFailed }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="card-icon rate">📈</div>
          <div class="card-content">
            <div class="card-label">成功率</div>
            <div class="card-value">{{ stats.successRate }}%</div>
          </div>
        </div>
      </div>

      <!-- 实时任务列表 -->
      <div class="monitor-section">
        <h3>实时任务状态</h3>
        <tiny-grid
          :data="realtimeTasks"
          border
          size="small"
          stripe
        >
          <tiny-grid-column field="name" title="任务名称" min-width="200"></tiny-grid-column>
          <tiny-grid-column field="status" title="状态" width="100" align="center">
            <template #default="{ row }">
              <tiny-tag v-if="row.status === 'RUNNING'" type="warning">运行中</tiny-tag>
              <tiny-tag v-else-if="row.status === 'SUCCESS'" type="success">成功</tiny-tag>
              <tiny-tag v-else-if="row.status === 'FAILED'" type="danger">失败</tiny-tag>
              <tiny-tag v-else type="info">{{ row.status }}</tiny-tag>
            </template>
          </tiny-grid-column>
          <tiny-grid-column field="progress" title="进度" width="200" align="center">
            <template #default="{ row }">
              <tiny-progress :percentage="row.progress" :show-text="true"></tiny-progress>
            </template>
          </tiny-grid-column>
          <tiny-grid-column field="startTime" title="开始时间" width="180"></tiny-grid-column>
          <tiny-grid-column field="duration" title="耗时" width="120"></tiny-grid-column>
        </tiny-grid>
      </div>

      <!-- 错误日志流 -->
      <div class="monitor-section">
        <h3>错误日志</h3>
        <div class="log-panel">
          <div v-for="(log, index) in errorLogs" :key="index" class="log-item">
            <span class="log-time">{{ log.time }}</span>
            <span class="log-level error">ERROR</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
          <div v-if="errorLogs.length === 0" class="empty-log">暂无错误日志</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import {
  Grid as TinyGrid,
  GridColumn as TinyGridColumn,
  Tag as TinyTag,
  Progress as TinyProgress
} from '@opentiny/vue'
import Breadcrumb from '@/components/breadcrumb/index.vue'
import { formatDateTime } from '@/utils/date'
import { CrawlerTaskApi, CrawlerExecutionApi } from '@/api/crawler'

const stats = reactive({
  runningTasks: 0,
  todaySuccess: 0,
  todayFailed: 0,
  successRate: 0
})

const realtimeTasks = ref<any[]>([])
const errorLogs = ref<any[]>([])
let refreshTimer: any = null

// 加载统计数据
const loadStats = async () => {
  try {
    const res = await CrawlerExecutionApi.getStatistics()
    if (res.code === 0 && res.data) {
      stats.runningTasks = res.data.runningCount || 0
      stats.todaySuccess = res.data.todaySuccessCount || 0
      stats.todayFailed = res.data.todayFailedCount || 0
      const total = stats.todaySuccess + stats.todayFailed
      stats.successRate = total > 0 ? Math.round((stats.todaySuccess / total) * 100) : 0
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

// 加载实时任务列表
const loadRealtimeTasks = async () => {
  try {
    const res = await CrawlerExecutionApi.getRunningTasks()
    if (res.code === 0) {
      realtimeTasks.value = (res.data || []).map((task: any) => ({
        name: task.taskName,
        status: task.status,
        progress: task.progress || 0,
        startTime: task.startTime,
        duration: calculateDuration(task.startTime)
      }))
    }
  } catch (error) {
    console.error('加载实时任务失败:', error)
    realtimeTasks.value = []
  }
}

// 计算耗时
const calculateDuration = (startTime: string) => {
  if (!startTime) return '-'
  const start = new Date(startTime).getTime()
  const now = Date.now()
  const diff = Math.floor((now - start) / 1000)
  
  if (diff < 60) return `${diff}秒`
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟`
  return `${Math.floor(diff / 3600)}小时`
}

// 定时刷新
const startRefresh = () => {
  refreshTimer = setInterval(() => {
    loadStats()
    loadRealtimeTasks()
  }, 10000) // 每10秒刷新一次
}

onMounted(() => {
  loadStats()
  loadRealtimeTasks()
  startRefresh()
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
})
</script>

<style lang="scss" scoped>
.monitor-dashboard {
  height: 100%;
  display: flex;
  flex-direction: column;

  .contain {
    flex: 1;
    padding: 20px;
    overflow: auto;
  }
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;

  .card-icon {
    font-size: 48px;
    
    &.running {
      filter: grayscale(0);
    }
    
    &.success {
      filter: hue-rotate(120deg);
    }
    
    &.failed {
      filter: hue-rotate(-30deg);
    }
  }

  .card-content {
    flex: 1;

    .card-label {
      font-size: 14px;
      color: #909399;
      margin-bottom: 8px;
    }

    .card-value {
      font-size: 28px;
      font-weight: 600;
      color: #303133;
    }
  }
}

.monitor-section {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;

  h3 {
    margin: 0 0 16px 0;
    font-size: 16px;
    color: #303133;
  }
}

.log-panel {
  background: #1e1e1e;
  border-radius: 4px;
  padding: 12px;
  max-height: 300px;
  overflow-y: auto;
  font-family: 'Courier New', monospace;

  .log-item {
    padding: 4px 0;
    font-size: 13px;
    color: #d4d4d4;

    .log-time {
      color: #858585;
      margin-right: 8px;
    }

    .log-level {
      padding: 2px 6px;
      border-radius: 3px;
      margin-right: 8px;
      font-weight: 600;

      &.error {
        background: #f56c6c;
        color: #fff;
      }
    }

    .log-message {
      color: #d4d4d4;
    }
  }

  .empty-log {
    text-align: center;
    color: #858585;
    padding: 40px 0;
  }
}
</style>
