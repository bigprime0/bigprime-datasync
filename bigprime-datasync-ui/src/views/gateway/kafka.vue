<template>
  <div class="container-list">
    <Breadcrumb :items="['menu.gateway', 'menu.gateway.gatewaykafka']" />

    <!-- 选择连接器 -->
    <div class="selector-bar">
      <tiny-form :model="form" inline label-width="120px">
        <tiny-form-item label="Kafka连接器">
          <tiny-select
            v-model="form.connectorId"
            placeholder="请选择Kafka连接器"
            style="width: 280px"
            @change="onConnectorChange"
          >
            <tiny-option v-for="item in kafkaConnectors" :key="item.id" :label="item.name" :value="item.id" />
          </tiny-select>
        </tiny-form-item>
      </tiny-form>
    </div>

    <!-- Tab 切换 -->
    <tiny-tabs v-model="activeTab">
      <tiny-tab-item title="Topic 管理" name="topics"></tiny-tab-item>
      <tiny-tab-item title="消费积压监控" name="consumers"></tiny-tab-item>
      <tiny-tab-item title="消息收发测试" name="testing"></tiny-tab-item>
    </tiny-tabs>

    <!-- Topic 管理 -->
    <div v-show="activeTab === 'topics'" class="tab-content">
      <div class="action-bar">
        <tiny-button size="small" type="primary" :disabled="!form.connectorId" @click="loadTopics">刷新</tiny-button>
        <tiny-button size="small" type="primary" :disabled="!form.connectorId" @click="showCreateTopic = true">新建 Topic</tiny-button>
      </div>
      <tiny-grid
        :data="topics"
        :loading="topicsLoading"
        border
        stripe
        size="small"
        highlight-hover-row
        show-overflow="tooltip"
        show-header-overflow="tooltip"
      >
        <tiny-grid-column title="Topic 名称" field="name" min-width="200" />
        <tiny-grid-column title="分区数" field="partitions" align="center" width="90" />
        <tiny-grid-column title="内部 Topic" field="isInternal" align="center" width="100">
          <template #default="{ row }">
            <tiny-tag :type="row.isInternal ? 'info' : 'success'" size="mini">{{ row.isInternal ? '是' : '否' }}</tiny-tag>
          </template>
        </tiny-grid-column>
        <tiny-grid-column title="操作" align="center" width="140">
          <template #default="{ row }">
            <tiny-button size="mini" type="text" @click="viewTopicDetail(row.name)">详情</tiny-button>
            <tiny-button size="mini" type="text" style="color: #f56c6c" :disabled="row.isInternal" @click="confirmDeleteTopic(row.name)">删除</tiny-button>
          </template>
        </tiny-grid-column>
      </tiny-grid>
    </div>

    <!-- 消费积压监控 -->
    <div v-show="activeTab === 'consumers'" class="tab-content">
      <!-- 统计卡片 -->
      <div v-if="lagRows.length > 0" class="stat-cards">
        <div class="stat-card">
          <div class="stat-label">总积压量</div>
          <div class="stat-value" :style="{ color: totalLag > 10000 ? '#f56c6c' : totalLag > 1000 ? '#e6a23c' : '#67c23a' }">
            {{ totalLag.toLocaleString() }}
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-label">涉及 Topic 数</div>
          <div class="stat-value">{{ uniqueTopics }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">积压分区数</div>
          <div class="stat-value" :style="{ color: backlogPartitions > 0 ? '#e6a23c' : '#67c23a' }">{{ backlogPartitions }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">消费健康度</div>
          <div class="stat-value">
            <tiny-tag :type="healthStatus.type" size="small">{{ healthStatus.label }}</tiny-tag>
          </div>
        </div>
      </div>

      <div class="action-bar">
        <tiny-form :model="lagForm" inline>
          <tiny-form-item label="消费者组">
            <tiny-select v-model="lagForm.groupId" placeholder="选择或输入消费者组" style="width: 320px"
              filterable allow-create @change="loadGroupLag">
              <tiny-option v-for="g in consumerGroups" :key="g" :label="g" :value="g" />
            </tiny-select>
          </tiny-form-item>
          <tiny-form-item>
            <tiny-button size="small" type="primary" :disabled="!lagForm.groupId || !form.connectorId" @click="loadGroupLag">查询</tiny-button>
          </tiny-form-item>
        </tiny-form>
      </div>

      <tiny-grid
        :data="lagRows"
        :loading="lagLoading"
        border
        stripe
        size="small"
        highlight-hover-row
        show-overflow="tooltip"
        show-header-overflow="tooltip"
      >
        <tiny-grid-column title="Topic" field="topic" min-width="160" />
        <tiny-grid-column title="分区" field="partition" align="center" width="70" />
        <tiny-grid-column title="已提交 Offset" field="committedOffset" align="right" width="140" />
        <tiny-grid-column title="最新 Offset" field="latestOffset" align="right" width="120" />
        <tiny-grid-column title="积压量 (Lag)" field="lag" align="right" width="130">
          <template #default="{ row }">
            <span :style="{ color: row.lag > 1000 ? '#f56c6c' : row.lag > 0 ? '#e6a23c' : '#67c23a', fontWeight: 'bold' }">
              {{ row.lag?.toLocaleString() }}
            </span>
          </template>
        </tiny-grid-column>
        <tiny-grid-column title="消费状态" align="center" width="110">
          <template #default="{ row }">
            <tiny-tag v-if="row.lag === 0" type="success" size="mini">正常</tiny-tag>
            <tiny-tag v-else-if="row.lag <= 1000" type="warning" size="mini">轻微积压</tiny-tag>
            <tiny-tag v-else-if="row.lag <= 10000" type="danger" size="mini">积压较多</tiny-tag>
            <tiny-tag v-else type="danger" size="mini">严重积压</tiny-tag>
          </template>
        </tiny-grid-column>
        <tiny-grid-column title="消费进度" align="center" width="150">
          <template #default="{ row }">
            <div v-if="row.latestOffset > 0" style="display: flex; align-items: center; gap: 6px;">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: getProgress(row) + '%', backgroundColor: getProgressColor(row) }"></div>
              </div>
              <span style="font-size: 12px; color: #666; white-space: nowrap;">{{ getProgress(row) }}%</span>
            </div>
            <span v-else style="color: #999; font-size: 12px;">-</span>
          </template>
        </tiny-grid-column>
      </tiny-grid>
    </div>

    <!-- 消息收发测试 Tab -->
    <div v-show="activeTab === 'testing'" class="tab-content">
      <!-- 顶部指标栏 -->
      <div class="test-stat-bar">
        <div class="test-stat-item">
          <span class="test-stat-label">已发送</span>
          <span class="test-stat-num" style="color: #409eff">{{ testStats.sent }}</span>
        </div>
        <div class="test-stat-item">
          <span class="test-stat-label">总积压量</span>
          <span class="test-stat-num" :style="{ color: testStats.totalLag > 1000 ? '#f56c6c' : '#67c23a' }">{{ testStats.totalLag.toLocaleString() }}</span>
        </div>
        <div class="test-stat-item">
          <span class="test-stat-label">运行状态</span>
          <tiny-tag :type="testStats.running ? 'success' : 'info'" size="mini">流式发送{{ testStats.running ? '运行中' : '已停止' }}</tiny-tag>
        </div>
        <tiny-button size="mini" @click="refreshTestLag" :disabled="!form.connectorId">刷新积压</tiny-button>
      </div>

      <!-- 主区域 -->
      <div class="test-main">
        <!-- 左侧：发送区 -->
        <div class="test-send-panel">
          <div class="panel-title">消息发送区</div>

          <tiny-form :model="testForm" label-width="80px" size="small">
            <tiny-form-item label="Topic">
              <tiny-select v-model="testForm.topic" placeholder="选择 Topic" style="width: 100%">
                <tiny-option v-for="t in topics" :key="t.name" :label="t.name" :value="t.name" />
              </tiny-select>
            </tiny-form-item>
            <tiny-form-item label="发送间隔">
              <div style="display: flex; align-items: center; gap: 8px;">
                <tiny-numeric v-model="testForm.intervalMs" :min="100" :max="10000" :step="100" style="width: 130px" />
                <span style="color: #909399; font-size: 12px;">ms</span>
              </div>
            </tiny-form-item>
            <tiny-form-item label="消息模板">
              <textarea
                v-model="testForm.message"
                class="msg-textarea"
                placeholder='示例：{"msg": "test", "ts": 1234567890}'
              />
            </tiny-form-item>
          </tiny-form>

          <div class="send-actions">
            <tiny-button size="small" type="primary" :disabled="!canSend" @click="sendOne">发送一条</tiny-button>
            <tiny-button size="small" type="success" :disabled="!canSend || testStats.running" @click="startStream">流式发送</tiny-button>
            <tiny-button size="small" type="danger" :disabled="!testStats.running" @click="stopStream">停止</tiny-button>
            <tiny-button size="small" @click="clearSendCount">清除计数</tiny-button>
          </div>
        </div>

        <!-- 右侧：消费区 -->
        <div class="test-consume-panel">
          <div class="panel-title-row">
            <span class="panel-title">消费区</span>
            <tiny-button size="mini" type="danger" plain @click="stopAllConsumers" style="margin-right:6px">
              停止所有
            </tiny-button>
            <tiny-button size="mini" type="primary" :disabled="!form.connectorId || !testForm.topic" @click="addConsumer">
              + 添加消费者
            </tiny-button>
          </div>

          <div class="consumers-grid">
            <div v-for="(consumer, idx) in testConsumers" :key="consumer.sessionId" class="consumer-card">
              <div class="consumer-card-header">
                <span class="consumer-name">消费者 #{{ idx + 1 }}</span>
                <tiny-tag :type="consumer.error ? 'danger' : consumer.running ? 'success' : 'info'" size="mini">{{ consumer.error ? '异常停止' : consumer.running ? '消费中' : '已停止' }}</tiny-tag>
                <span style="flex:1" />
                <tiny-button size="mini" type="text" @click="clearConsumerLogs(idx)">清除</tiny-button>
                <tiny-button size="mini" type="text" style="color:#f56c6c" @click="removeConsumer(idx)">删除</tiny-button>
              </div>
              <div class="consumer-group-row">
                <tiny-input v-model="consumer.groupId" placeholder="GroupId (e.g. test-group-1)" size="small" style="flex:1" />
                <tiny-button v-if="!consumer.running" size="mini" type="primary" @click="startConsumer(idx)">开始</tiny-button>
                <tiny-button v-else size="mini" type="danger" @click="stopConsumer(idx)">停止</tiny-button>
              </div>
              <div v-if="consumer.error" style="padding: 4px 8px; color: #f56c6c; font-size: 12px; background: #fff0f0; border-radius: 4px; margin-bottom: 4px;">
                {{ consumer.error }}
              </div>
              <div class="consumer-log-box" :ref="el => setLogRef(el, idx)">
                <div v-if="consumer.logs.length === 0" class="log-empty">等待消息...</div>
                <div v-for="(log, li) in consumer.logs" :key="li" class="log-entry">
                  <span class="log-ts">[{{ log.ts }}]</span>
                  <pre class="log-json">{{ log.text }}</pre>
                </div>
              </div>
              <div class="consumer-footer">已收到 {{ consumer.received }} 条</div>
            </div>

            <div v-if="testConsumers.length === 0" class="no-consumers">
              请点击》添加消费者《创建消费面板
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新建 Topic 对话框 -->
    <tiny-dialog-box v-model:visible="showCreateTopic" title="新建 Topic" width="420px" @cancel="showCreateTopic = false">
      <tiny-form :model="createForm" label-width="90px">
        <tiny-form-item label="Topic 名称" required>
          <tiny-input v-model="createForm.topic" placeholder="请输入 Topic 名称" />
        </tiny-form-item>
        <tiny-form-item label="分区数">
          <tiny-numeric v-model="createForm.numPartitions" :min="1" :max="100" />
        </tiny-form-item>
        <tiny-form-item label="副本数">
          <tiny-numeric v-model="createForm.replicationFactor" :min="1" :max="10" />
        </tiny-form-item>
      </tiny-form>
      <template #footer>
        <tiny-button @click="showCreateTopic = false">取消</tiny-button>
        <tiny-button type="primary" @click="doCreateTopic">确定</tiny-button>
      </template>
    </tiny-dialog-box>

    <!-- Topic 详情对话框 -->
    <tiny-dialog-box v-model:visible="showTopicDetail" :title="`Topic 详情：${selectedTopic}`" width="600px" footer-hide>
      <div v-if="topicDetail">
        <div class="detail-row"><span class="label">名称：</span>{{ topicDetail.name }}</div>
        <div class="detail-row"><span class="label">分区数：</span>{{ topicDetail.partitions }}</div>
        <div class="detail-row"><span class="label">内部 Topic：</span>{{ topicDetail.isInternal ? '是' : '否' }}</div>
        <div class="detail-row" style="margin-top: 12px;"><span class="label">分区详情：</span></div>
        <tiny-grid :data="topicDetail.partitionInfo" border size="small" style="margin-top: 8px;">
          <tiny-grid-column title="分区" field="partition" align="center" width="80" />
          <tiny-grid-column title="Leader" field="leader" align="center" width="100" />
          <tiny-grid-column title="副本数" field="replicas" align="center" width="100" />
          <tiny-grid-column title="ISR 数" field="isr" align="center" width="100" />
        </tiny-grid>
      </div>
    </tiny-dialog-box>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, reactive, ref, nextTick } from 'vue'
import {
  Grid as TinyGrid,
  GridColumn as TinyGridColumn,
  Modal,
  Tabs as TinyTabs,
  TabItem as TinyTabItem,
  Button as TinyButton,
  Form as TinyForm,
  FormItem as TinyFormItem,
  Input as TinyInput,
  Option as TinyOption,
  Select as TinySelect,
  Tag as TinyTag,
  DialogBox as TinyDialogBox,
  Numeric as TinyNumeric
} from '@opentiny/vue'
import Breadcrumb from '@/components/breadcrumb/index.vue'
import { KafkaApi, type TopicInfo } from '@/api/kafka'
import { ConnectorService } from '@/services/connector'

// ======================== 测试 Tab 数据结构 ========================
interface LogItem {
  ts: string
  text: string
}
interface TestConsumer {
  sessionId: string
  groupId: string
  running: boolean
  error: string | null
  logs: LogItem[]
  received: number
  es: EventSource | null
}

const testForm = reactive({
  topic: '',
  intervalMs: 500,
  message: '{"msg": "test", "ts": ${ts}, "seq": ${seq}}'
})
const testStats = reactive({ sent: 0, running: false, totalLag: 0 })
const testConsumers = ref<TestConsumer[]>([])
const logRefs = ref<(HTMLElement | null)[]>([])
let streamTimer: ReturnType<typeof setInterval> | null = null
let streamSeq = 0

const canSend = computed(() => !!form.connectorId && !!testForm.topic && !!testForm.message.trim())
function buildMessage(): string {
  return testForm.message
    .replace('${ts}', String(Date.now()))
    .replace('${seq}', String(++streamSeq))
}

async function sendOne() {
  try {
    await KafkaApi.sendMessage(form.connectorId, testForm.topic, buildMessage())
    testStats.sent++
  } catch (e: any) {
    Modal.message({ message: '发送失败: ' + (e.message || ''), status: 'error' })
  }
}

function startStream() {
  if (streamTimer) return
  testStats.running = true
  streamTimer = setInterval(async () => {
    try {
      await KafkaApi.sendMessage(form.connectorId, testForm.topic, buildMessage())
      testStats.sent++
    } catch (_e) { /* ignore */ }
  }, testForm.intervalMs)
}

function stopStream() {
  if (streamTimer) { clearInterval(streamTimer); streamTimer = null }
  testStats.running = false
}

function clearSendCount() {
  testStats.sent = 0
  streamSeq = 0
}

async function refreshTestLag() {
  if (!form.connectorId || !testForm.topic) return
  try {
    // 计算所有消费者组在该 topic 上的总 lag
    let total = 0
    for (const c of testConsumers.value) {
      if (!c.groupId) continue
      try {
        const res: any = await KafkaApi.getConsumerGroupLag(form.connectorId, c.groupId)
        const rows: any[] = (res as any)?.data || []
        const topicRows = rows.filter((r: any) => r.topic === testForm.topic)
        total += topicRows.reduce((s: number, r: any) => s + (r.lag || 0), 0)
      } catch (_e) { /* ignore */ }
    }
    testStats.totalLag = total
  } catch (_e) { /* ignore */ }
}

function addConsumer() {
  if (testConsumers.value.length >= 6) {
    Modal.message({ message: '最多支持 6 个消费者面板', status: 'warning' })
    return
  }
  testConsumers.value.push({
    sessionId: 'test-' + Date.now() + '-' + Math.random().toString(36).slice(2),
    groupId: 'test-group-' + (testConsumers.value.length + 1),
    running: false,
    error: null,
    logs: [],
    received: 0,
    es: null
  })
}

function startConsumer(idx: number) {
  const c = testConsumers.value[idx]
  if (!c || c.running || !c.groupId) return
  c.running = true
  c.error = null
  c.es = KafkaApi.createConsumeStream(
    form.connectorId,
    testForm.topic,
    c.groupId,
    c.sessionId,
    (msg) => {
      const ts = new Date().toLocaleTimeString()
      let formatted = msg
      try {
        const deepParse = (val: any): any => {
          if (typeof val === 'string') {
            try { return deepParse(JSON.parse(val)) } catch { return val }
          }
          if (Array.isArray(val)) return val.map(deepParse)
          if (val && typeof val === 'object') {
            const result: any = {}
            for (const k of Object.keys(val)) result[k] = deepParse(val[k])
            return result
          }
          return val
        }
        const parsed = deepParse(msg)
        formatted = JSON.stringify(parsed, null, 2)
      } catch (_e) { /* 非 JSON，原样显示 */ }
      c.logs.push({ ts, text: formatted })
      if (c.logs.length > 200) c.logs.splice(0, c.logs.length - 200)
      c.received++
      nextTick(() => {
        const el = logRefs.value[idx]
        if (el) el.scrollTop = el.scrollHeight
      })
    },
    (_err) => {
      // 后端消费者持续异常已停止，es.close() 已在 API 层执行，此处更新 UI 状态
      c.running = false
      c.es = null
      c.error = '消费者连接异常断开（Kafka Broker 持续错误），请重新开始'
    }
  )
}

function stopConsumer(idx: number) {
  const c = testConsumers.value[idx]
  if (!c) return
  c.running = false
  if (c.es) { c.es.close(); c.es = null }
  KafkaApi.stopConsume(form.connectorId, c.sessionId).catch(() => {})
}

function removeConsumer(idx: number) {
  stopConsumer(idx)
  testConsumers.value.splice(idx, 1)
  logRefs.value.splice(idx, 1)
}

async function stopAllConsumers() {
  // 先停止前端所有面板
  testConsumers.value.forEach((_, idx) => stopConsumer(idx))
  testConsumers.value = []
  logRefs.value = []
  // 再通知后端清理残留订阅
  try {
    await KafkaApi.stopAllConsume()
  } catch (_e) { /* ignore */ }
}

function clearConsumerLogs(idx: number) {
  const c = testConsumers.value[idx]
  if (c) { c.logs = [] as LogItem[]; c.received = 0 }
}

function setLogRef(el: any, idx: number) {
  logRefs.value[idx] = el
}

onUnmounted(() => {
  stopStream()
  testConsumers.value.forEach((_, idx) => stopConsumer(idx))
})

const kafkaConnectors = ref<{ id: string; name: string }[]>([])
const form = reactive({ connectorId: '' })
const activeTab = ref('topics')

const topics = ref<TopicInfo[]>([])
const topicsLoading = ref(false)
const showCreateTopic = ref(false)
const createForm = reactive({ topic: '', numPartitions: 1, replicationFactor: 1 })
const showTopicDetail = ref(false)
const selectedTopic = ref('')
const topicDetail = ref<TopicInfo | null>(null)

const consumerGroups = ref<string[]>([])
const lagForm = reactive({ groupId: '' })
const lagRows = ref<any[]>([])
const lagLoading = ref(false)

const totalLag = computed(() => lagRows.value.reduce((sum, r) => sum + (r.lag || 0), 0))
const uniqueTopics = computed(() => new Set(lagRows.value.map((r) => r.topic)).size)
const backlogPartitions = computed(() => lagRows.value.filter((r) => r.lag > 0).length)
const healthStatus = computed(() => {
  if (totalLag.value === 0) return { type: 'success', label: '健康' }
  if (totalLag.value <= 1000) return { type: 'warning', label: '轻微积压' }
  if (totalLag.value <= 10000) return { type: 'danger', label: '积压较多' }
  return { type: 'danger', label: '严重积压' }
})

function getProgress(row: any): number {
  if (!row.latestOffset || row.latestOffset <= 0) return 0
  return Math.min(100, Math.max(0, Math.round((row.committedOffset / row.latestOffset) * 100)))
}
function getProgressColor(row: any): string {
  const p = getProgress(row)
  if (p >= 95) return '#67c23a'
  if (p >= 70) return '#e6a23c'
  return '#f56c6c'
}

onMounted(async () => {
  await loadKafkaConnectors()
})

async function loadKafkaConnectors() {
  try {
    const res: any = await ConnectorService.getConnectorList({ page: 1, pageSize: 200, search: '' })
    const list: any[] = res?.data?.list || res?.data?.records || []
    // 按 implClass 或 category 过滤出 Kafka 类型连接器
    kafkaConnectors.value = list
      .filter((c: any) => {
        const impl = (c.implClass || '').toLowerCase()
        const cat = (c.category || '').toLowerCase()
        return impl.includes('kafka') || cat.includes('kafka')
      })
      .map((c: any) => ({ id: c.id, name: c.name }))
  } catch (e) {
    console.error('加载Kafka连接器失败', e)
  }
}

function onConnectorChange() {
  topics.value = []
  consumerGroups.value = []
  lagRows.value = []
  lagForm.groupId = ''
  loadTopics()
  loadConsumerGroups()
}

async function loadTopics() {
  if (!form.connectorId) return
  topicsLoading.value = true
  try {
    const res = await KafkaApi.getTopics(form.connectorId)
    const names: string[] = (res as any)?.data || []
    const batch = names.slice(0, 50)
    const details = await Promise.all(
      batch.map((name) =>
        KafkaApi.getTopicInfo(form.connectorId, name)
          .then((r) => (r as any)?.data as TopicInfo)
          .catch(() => ({ name, isInternal: false, partitions: 0, partitionInfo: [] }) as TopicInfo)
      )
    )
    topics.value = details
  } catch (e: any) {
    console.error('加载Topic列表失败', e)
  } finally {
    topicsLoading.value = false
  }
}

async function viewTopicDetail(topicName: string) {
  selectedTopic.value = topicName
  showTopicDetail.value = true
  topicDetail.value = null
  try {
    const res = await KafkaApi.getTopicInfo(form.connectorId, topicName)
    topicDetail.value = (res as any)?.data || null
  } catch (e) {
    topicDetail.value = null
  }
}

async function doCreateTopic() {
  if (!createForm.topic.trim()) {
    Modal.message({ message: 'Topic 名称不能为空', status: 'warning' })
    return
  }
  try {
    await KafkaApi.createTopic(form.connectorId, createForm.topic, createForm.numPartitions, createForm.replicationFactor)
    Modal.message({ message: `Topic "${createForm.topic}" 创建成功`, status: 'success' })
    showCreateTopic.value = false
    createForm.topic = ''
    createForm.numPartitions = 1
    createForm.replicationFactor = 1
    await loadTopics()
  } catch (e: any) {
    Modal.message({ message: '创建Topic失败: ' + (e.message || ''), status: 'error' })
  }
}

async function confirmDeleteTopic(topicName: string) {
  Modal.confirm({
    title: '确认删除',
    message: `确定删除 Topic "${topicName}"？此操作不可恢复！`,
    async beforeClose(action: string) {
      if (action === 'confirm') {
        try {
          await KafkaApi.deleteTopic(form.connectorId, topicName)
          Modal.message({ message: `Topic "${topicName}" 已删除`, status: 'success' })
          await loadTopics()
        } catch (e: any) {
          Modal.message({ message: '删除失败: ' + (e.message || ''), status: 'error' })
        }
      }
    }
  })
}

async function loadConsumerGroups() {
  if (!form.connectorId) return
  try {
    const res = await KafkaApi.getConsumerGroups(form.connectorId)
    consumerGroups.value = (res as any)?.data || []
  } catch (e) {
    consumerGroups.value = []
  }
}

async function loadGroupLag() {
  if (!lagForm.groupId || !form.connectorId) return
  lagLoading.value = true
  try {
    const res = await KafkaApi.getConsumerGroupLag(form.connectorId, lagForm.groupId)
    lagRows.value = (res as any)?.data || []
  } catch (e: any) {
    Modal.message({ message: '查询Lag失败: ' + (e.message || ''), status: 'error' })
  } finally {
    lagLoading.value = false
  }
}
</script>

<style scoped>
.container-list {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0 10px;
  overflow-y: auto;
  scrollbar-width: none;
}

.container-list::-webkit-scrollbar {
  display: none;
}

.selector-bar {
  padding: 10px 0 4px;
}

.tab-content {
  flex: 1;
  padding-top: 12px;
  min-height: 0;
}

.action-bar {
  margin-bottom: 10px;
  display: flex;
  gap: 8px;
  align-items: center;
}

.stat-cards {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.stat-card {
  flex: 1;
  padding: 14px 18px;
  background: #f7f8fa;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  text-align: center;
}

.stat-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 6px;
}

.stat-value {
  font-size: 22px;
  font-weight: bold;
  color: #303133;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s;
}

.detail-row {
  margin-bottom: 8px;
  font-size: 14px;
}

.label {
  color: #606266;
  font-weight: 500;
}

/* ===== 测试 Tab ===== */
.test-stat-bar {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 8px 12px;
  background: #f7f8fa;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
  margin-bottom: 12px;
}

.test-stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 60px;
}

.test-stat-label {
  font-size: 11px;
  color: #909399;
}

.test-stat-num {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.test-main {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.test-send-panel {
  width: 360px;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.msg-textarea {
  width: 100%;
  height: 140px;
  resize: vertical;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 8px;
  font-size: 13px;
  font-family: 'Courier New', monospace;
  outline: none;
  box-sizing: border-box;
}

.msg-textarea:focus {
  border-color: #409eff;
}

.send-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
}

.test-consume-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.panel-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.consumers-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  padding-bottom: 24px;
}

.consumer-card {
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  height: 340px;
}

.consumer-card-header {
  display: flex;
  align-items: center;
  gap: 6px;
}

.consumer-name {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
}

.consumer-group-row {
  display: flex;
  gap: 6px;
  align-items: center;
}

.consumer-log-box {
  flex: 1;
  background: #1e1e2e;
  border-radius: 4px;
  padding: 8px;
  overflow-y: auto;
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.log-empty {
  color: #666;
  font-style: italic;
}

.log-entry {
  margin-bottom: 8px;
  border-bottom: 1px solid #2a2a3e;
  padding-bottom: 6px;
}

.log-ts {
  color: #6c7086;
  font-size: 11px;
  display: block;
  margin-bottom: 2px;
}

.log-json {
  color: #a6e3a1;
  line-height: 1.5;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.consumer-footer {
  font-size: 11px;
  color: #909399;
  text-align: right;
}

.no-consumers {
  grid-column: 1 / -1;
  color: #909399;
  font-size: 13px;
  text-align: center;
  padding: 40px 0;
}
</style>
