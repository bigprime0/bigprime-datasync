<template>
  <div class="task-detail-page">
    <Breadcrumb :items="['爬虫管理', '任务管理', '任务详情']" />
    <div class="contain" v-if="task">
      <!-- 顶部信息栏 -->
      <div class="info-card">
        <div class="info-header">
          <h2>{{ task.name }}</h2>
          <div class="info-actions">
            <tiny-button type="primary" :disabled="executing" @click="executeNow">
              {{ executing ? '执行中...' : '立即执行' }}
            </tiny-button>
            <tiny-button @click="goBack">返回</tiny-button>
          </div>
        </div>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">目标 URL</span>
            <a :href="task.websiteUrl || task.targetUrl" target="_blank" class="value link">
              {{ task.websiteUrl || task.targetUrl || '-' }}
            </a>
          </div>
          <div class="info-item">
            <span class="label">任务类型</span>
            <span class="value">{{ task.taskType || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="label">任务模式</span>
            <tiny-tag :type="task.taskMode === 'AGENT' ? 'success' : 'info'">
              {{ task.taskMode === 'AGENT' ? '🤖 AI Agent' : 'DAG 编排' }}
            </tiny-tag>
          </div>
          <div class="info-item">
            <span class="label">状态</span>
            <tiny-tag :type="task.status === 'READY' ? 'success' : 'warning'">{{ task.status }}</tiny-tag>
          </div>
          <div class="info-item">
            <span class="label">执行统计</span>
            <span class="value">
              总 {{ task.totalExecutions || 0 }} /
              <span style="color:#5cb87a">成功 {{ task.successExecutions || 0 }}</span> /
              <span style="color:#f56c6c">失败 {{ task.failedExecutions || 0 }}</span>
            </span>
          </div>
          <div class="info-item">
            <span class="label">创建时间</span>
            <span class="value">{{ task.createTime || '-' }}</span>
          </div>
        </div>
        <!-- 爬取指令 -->
        <div v-if="task.instructions" class="instructions-area">
          <span class="label">爬取指令</span>
          <div class="instructions-content">{{ task.instructions }}</div>
        </div>
      </div>

      <!-- 近期执行历史 -->
      <div class="history-card">
        <div class="card-header">
          <h3>近期执行记录</h3>
          <tiny-button size="small" @click="loadHistory">刷新</tiny-button>
        </div>
        <div v-if="historyLoading" class="loading-tip">加载中...</div>
        <div v-else-if="historyList.length === 0" class="empty-tip">暂无执行记录</div>
        <div v-else class="history-list">
          <div
            v-for="exec in historyList"
            :key="exec.id"
            :class="['history-item', `status-${exec.status?.toLowerCase()}`]"
            @click="viewExecDetail(exec)"
          >
            <div class="history-main">
              <tiny-tag :type="statusType(exec.status)" size="small">{{ statusLabel(exec.status) }}</tiny-tag>
              <span class="history-time">{{ exec.startedAt }}</span>
              <span class="history-steps">{{ exec.totalSteps || 0 }} 步</span>
              <span class="history-duration">{{ formatDuration(exec.durationMs) }}</span>
            </div>
            <div v-if="exec.errorMessage" class="history-error">{{ truncate(exec.errorMessage, 100) }}</div>
          </div>
        </div>
      </div>

      <!-- 最新提取数据预览 -->
      <div v-if="latestResult" class="result-card">
        <div class="card-header">
          <h3>最新提取数据</h3>
          <tiny-button size="small" @click="copyResult">复制 JSON</tiny-button>
        </div>
        <pre class="result-json">{{ formatJson(latestResult) }}</pre>
      </div>
    </div>

    <div v-else-if="loadingTask" class="contain loading-page">
      <div class="loading-tip">加载任务详情中...</div>
    </div>
    <div v-else class="contain loading-page">
      <div class="loading-tip">任务不存在或已删除</div>
      <tiny-button @click="goBack">返回列表</tiny-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Button as TinyButton,
  Modal,
  Tag as TinyTag
} from '@opentiny/vue'
import Breadcrumb from '@/components/breadcrumb/index.vue'
import { CrawlerTaskApi, AiCrawlerExecutionApi } from '@/api/crawler'
import { formatDateTime } from '@/utils/date'

const route = useRoute()
const router = useRouter()

const task = ref<any>(null)
const loadingTask = ref(false)
const executing = ref(false)
const historyList = ref<any[]>([])
const historyLoading = ref(false)
const latestResult = ref<string | null>(null)

// 加载任务详情
const loadTask = async () => {
  const id = route.query.id as string
  if (!id) return
  loadingTask.value = true
  try {
    const res: any = await CrawlerTaskApi.getTaskById(id)
    if (res.code === 0) {
      task.value = {
        ...res.data,
        createTime: res.data.createTime ? formatDateTime(res.data.createTime) : '-'
      }
      loadHistory()
    }
  } catch {
    Modal.message({ message: '加载任务失败', status: 'error' })
  } finally {
    loadingTask.value = false
  }
}

// 加载执行历史
const loadHistory = async () => {
  if (!task.value?.id) return
  historyLoading.value = true
  try {
    const res: any = await AiCrawlerExecutionApi.listByTask(task.value.id, 10)
    if (res.code === 0) {
      historyList.value = (res.data || []).map((item: any) => ({
        ...item,
        startedAt: item.startedAt ? formatDateTime(item.startedAt) : '-'
      }))
      // 取最新成功记录的结果数据
      const latest = historyList.value.find((e) => e.status === 'SUCCESS' && e.resultData)
      latestResult.value = latest?.resultData || null
    }
  } catch {
    // ignore
  } finally {
    historyLoading.value = false
  }
}

// 立即执行
const executeNow = async () => {
  if (!task.value?.id) return
  executing.value = true
  try {
    const res: any = await CrawlerTaskApi.executeTask(task.value.id)
    if (res.code === 0 || res.msg === 'success') {
      Modal.message({ message: '任务已开始执行，请稍后刷新历史记录', status: 'success' })
      setTimeout(loadHistory, 3000)
    } else {
      Modal.message({ message: res.msg || '执行失败', status: 'error' })
    }
  } catch {
    Modal.message({ message: '执行失败', status: 'error' })
  } finally {
    executing.value = false
  }
}

// 查看执行详情 - 跳转到执行历史页
const viewExecDetail = (exec: any) => {
  router.push({ path: '/crawler/execution', query: { highlight: exec.id } })
}

const goBack = () => router.push({ path: '/crawler/crawlertask' })

const copyResult = () => {
  if (latestResult.value) {
    navigator.clipboard.writeText(latestResult.value)
      .then(() => Modal.message({ message: '已复制', status: 'success' }))
      .catch(() => Modal.message({ message: '复制失败', status: 'error' }))
  }
}

// 工具函数
const statusType = (s: string) => {
  const m: Record<string, string> = { RUNNING: 'warning', SUCCESS: 'success', FAILED: 'danger', CANCELLED: 'info' }
  return m[s] || 'info'
}
const statusLabel = (s: string) => {
  const m: Record<string, string> = { RUNNING: '运行中', SUCCESS: '成功', FAILED: '失败', CANCELLED: '已取消' }
  return m[s] || s
}
const formatDuration = (ms?: number) => {
  if (!ms) return '-'
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`
}
const truncate = (s?: string, max = 100) => {
  if (!s) return ''
  return s.length > max ? s.substring(0, max) + '...' : s
}
const formatJson = (s?: string) => {
  if (!s) return ''
  try { return JSON.stringify(JSON.parse(s), null, 2) } catch { return s }
}

onMounted(loadTask)
</script>

<style scoped lang="scss">
.task-detail-page {
  height: 100%;
  display: flex;
  flex-direction: column;

  .contain {
    flex: 1;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    overflow: auto;

    &.loading-page {
      justify-content: center;
      align-items: center;
      gap: 16px;
    }
  }
}

.loading-tip { color: #909399; font-size: 14px; }

.info-card, .history-card, .result-card {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px;
}

.info-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;

  h2 { margin: 0; font-size: 18px; color: #303133; }
  .info-actions { display: flex; gap: 8px; }
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 12px;

  .info-item {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .label { font-size: 12px; color: #909399; }
    .value { font-size: 14px; color: #303133; }
    .link { color: #409eff; text-decoration: none; word-break: break-all; &:hover { text-decoration: underline; } }
  }
}

.instructions-area {
  .label { font-size: 12px; color: #909399; display: block; margin-bottom: 4px; }
  .instructions-content {
    background: #f5f7fa;
    padding: 10px 12px;
    border-radius: 4px;
    font-size: 13px;
    color: #606266;
    white-space: pre-wrap;
  }
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;

  h3 { margin: 0; font-size: 15px; color: #303133; }
}

.empty-tip { color: #c0c4cc; font-size: 13px; text-align: center; padding: 24px 0; }

.history-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.history-item {
  padding: 10px 14px;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
  cursor: pointer;
  transition: background 0.15s;

  &:hover { background: #f5f7fa; }
  &.status-success { border-left: 3px solid #67c23a; }
  &.status-failed { border-left: 3px solid #f56c6c; }
  &.status-running { border-left: 3px solid #e6a23c; }
  &.status-cancelled { border-left: 3px solid #c0c4cc; }

  .history-main {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 13px;

    .history-time { color: #606266; }
    .history-steps { color: #909399; }
    .history-duration { color: #909399; margin-left: auto; }
  }

  .history-error {
    margin-top: 4px;
    font-size: 12px;
    color: #f56c6c;
  }
}

.result-card {
  .result-json {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 16px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 12px;
    overflow: auto;
    max-height: 400px;
    margin: 0;
  }
}
</style>
