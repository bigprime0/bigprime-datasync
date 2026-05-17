<template>
  <tiny-dialog-box
    :visible="visible"
    title="告警详情"
    width="700px"
    @close="handleClose"
  >
    <div v-if="loading" class="loading-wrapper">
      <tiny-loading />
    </div>
    <div v-else-if="alertData" class="detail-content">
      <tiny-form label-width="120px" label-position="left">
        <tiny-form-item label="告警ID">
          <span>{{ alertData.alertId }}</span>
        </tiny-form-item>
        <tiny-form-item label="规则名称">
          <span>{{ alertData.ruleName }}</span>
        </tiny-form-item>
        <tiny-form-item label="规则编码">
          <span>{{ alertData.ruleCode }}</span>
        </tiny-form-item>
        <tiny-form-item label="告警类型">
          <span>{{ alertData.alertType }}</span>
        </tiny-form-item>
        <tiny-form-item label="告警级别">
          <tiny-tag v-if="alertData.alertLevel === 'CRITICAL'" type="danger">严重</tiny-tag>
          <tiny-tag v-else-if="alertData.alertLevel === 'ERROR'" type="warning">错误</tiny-tag>
          <tiny-tag v-else-if="alertData.alertLevel === 'WARNING'" type="info">警告</tiny-tag>
          <tiny-tag v-else>信息</tiny-tag>
        </tiny-form-item>
        <tiny-form-item label="所属模块">
          <span>{{ alertData.sourceModule }}</span>
        </tiny-form-item>
        <tiny-form-item label="对象ID">
          <span>{{ alertData.sourceId || '-' }}</span>
        </tiny-form-item>
        <tiny-form-item label="告警状态">
          <tiny-tag v-if="alertData.status === 'ACTIVE'" type="danger">活跃</tiny-tag>
          <tiny-tag v-else-if="alertData.status === 'RESOLVED'" type="success">已解决</tiny-tag>
          <tiny-tag v-else type="info">已忽略</tiny-tag>
        </tiny-form-item>
        <tiny-form-item label="告警消息">
          <div class="message-box">{{ alertData.alertMessage }}</div>
        </tiny-form-item>
        <tiny-form-item label="触发时间">
          <span>{{ alertData.triggerTime }}</span>
        </tiny-form-item>
        <tiny-form-item label="解决时间">
          <span>{{ alertData.resolvedTime || '-' }}</span>
        </tiny-form-item>
        <tiny-form-item label="解决人">
          <span>{{ alertData.resolvedBy || '-' }}</span>
        </tiny-form-item>
        <tiny-form-item label="通知状态">
          <tiny-tag v-if="alertData.notificationStatus === 'SENT'" type="success">已发送</tiny-tag>
          <tiny-tag v-else-if="alertData.notificationStatus === 'FAILED'" type="danger">失败</tiny-tag>
          <tiny-tag v-else-if="alertData.notificationStatus === 'IGNORED'" type="info">已忽略</tiny-tag>
          <tiny-tag v-else type="warning">待发送</tiny-tag>
        </tiny-form-item>
        <tiny-form-item label="通知时间">
          <span>{{ alertData.notificationTime || '-' }}</span>
        </tiny-form-item>
        <tiny-form-item label="备注">
          <div class="message-box">{{ alertData.remark || '-' }}</div>
        </tiny-form-item>
        <tiny-form-item label="上下文数据">
          <pre class="context-box">{{ formatContext(alertData.contextData) }}</pre>
        </tiny-form-item>
      </tiny-form>
    </div>

    <template #footer>
      <tiny-button @click="handleClose">关闭</tiny-button>
    </template>
  </tiny-dialog-box>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue'
import {
  TinyButton,
  TinyDialogBox,
  TinyForm,
  TinyFormItem,
  TinyLoading,
  TinyTag,
  Modal
} from '@opentiny/vue'
import { AlertHistoryApi } from '@/api/alert'
import { formatDateTime } from '@/utils/date'

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  alertId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['close'])

const loading = ref(false)
const alertData = ref<any>(null)

// 加载告警详情
const loadAlertDetail = async () => {
  loading.value = true
  try {
    const res = await AlertHistoryApi.getAlertById(props.alertId)
    if (res.code === 0) {
      alertData.value = {
        ...res.data,
        triggerTime: formatDateTime(res.data.triggerTime),
        resolvedTime: res.data.resolvedTime ? formatDateTime(res.data.resolvedTime) : null,
        notificationTime: res.data.notificationTime ? formatDateTime(res.data.notificationTime) : null
      }
    } else {
      Modal.message({ message: res.msg, status: 'error' })
    }
  } catch (error: any) {
    Modal.message({ message: error.message || '加载失败', status: 'error' })
  } finally {
    loading.value = false
  }
}

// 格式化上下文数据
const formatContext = (contextData: string) => {
  if (!contextData) return '{}'
  try {
    const obj = JSON.parse(contextData)
    return JSON.stringify(obj, null, 2)
  } catch (e) {
    return contextData
  }
}

// 关闭对话框
const handleClose = () => {
  emit('close')
}

// 监听alertId变化
watch(
  () => props.alertId,
  (newVal) => {
    if (newVal && props.visible) {
      loadAlertDetail()
    }
  },
  { immediate: true }
)

onMounted(() => {
  if (props.alertId && props.visible) {
    loadAlertDetail()
  }
})
</script>

<style lang="scss" scoped>
.loading-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}

.detail-content {
  max-height: 600px;
  overflow-y: auto;

  .message-box {
    padding: 10px;
    background-color: #f5f7fa;
    border-radius: 4px;
    white-space: pre-wrap;
    word-break: break-all;
  }

  .context-box {
    padding: 10px;
    background-color: #f5f7fa;
    border-radius: 4px;
    max-height: 300px;
    overflow-y: auto;
    font-size: 12px;
    margin: 0;
  }
}

:deep(.tiny-form-item__label) {
  text-align: left;
  font-weight: 600;
}
</style>
