<template>
  <tiny-dialog
    v-model="visible"
    :title="dialogTitle"
    width="700px"
    :append-to-body="true"
    @close="handleClose"
  >
    <tiny-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="120px"
    >
      <tiny-form-item label="触发器名称" prop="name">
        <tiny-input v-model="form.name" placeholder="请输入触发器名称" />
      </tiny-form-item>

      <tiny-form-item label="触发器类型" prop="type">
        <tiny-select v-model="form.type" placeholder="请选择触发器类型" @change="handleTypeChange">
          <tiny-option label="定时触发(Cron)" value="CRON" />
          <tiny-option label="手动触发" value="MANUAL" />
        </tiny-select>
      </tiny-form-item>

      <tiny-form-item
        v-if="form.type === 'CRON'"
        label="Cron表达式"
        prop="cronExpression"
      >
        <tiny-input
          v-model="form.cronExpression"
          placeholder="请输入Cron表达式"
          @blur="handleCronPreview"
        >
          <template #append>
            <tiny-button @click="showCronEditor">表达式编辑器</tiny-button>
          </template>
        </tiny-input>
        <div v-if="nextFireTimes.length" class="next-fire-times">
          <div class="preview-title">下次触发时间预览:</div>
          <div v-for="(time, index) in nextFireTimes" :key="index" class="fire-time-item">
            {{ index + 1 }}. {{ formatDate(time) }}
          </div>
        </div>
      </tiny-form-item>

      <tiny-form-item label="并发策略" prop="concurrencyPolicy">
        <tiny-select v-model="form.concurrencyPolicy" placeholder="请选择并发策略">
          <tiny-option label="禁止并发" value="FORBID" />
          <tiny-option label="取消旧的" value="REPLACE" />
          <tiny-option label="允许并行" value="ALLOW" />
        </tiny-select>
      </tiny-form-item>

      <tiny-form-item
        v-if="form.concurrencyPolicy === 'ALLOW'"
        label="最大并行数"
        prop="maxParallel"
      >
        <tiny-input-number
          v-model="form.maxParallel"
          :min="1"
          :max="10"
        />
      </tiny-form-item>

      <tiny-form-item label="是否启用" prop="enabled">
        <tiny-switch v-model="form.enabled" />
      </tiny-form-item>

      <tiny-form-item label="描述">
        <tiny-input
          v-model="form.description"
          type="textarea"
          :rows="3"
          placeholder="请输入触发器描述"
        />
      </tiny-form-item>
    </tiny-form>

    <template #footer>
      <tiny-button @click="handleClose">取消</tiny-button>
      <tiny-button type="primary" @click="handleSubmit">确定</tiny-button>
    </template>
  </tiny-dialog>

  <!-- Cron表达式编辑器 -->
  <tiny-dialog
    v-model="cronEditorVisible"
    title="Cron表达式编辑器"
    width="800px"
    :append-to-body="true"
  >
    <Cron v-model:cron-expression="form.cronExpression" />
    <template #footer>
      <tiny-button @click="cronEditorVisible = false">关闭</tiny-button>
    </template>
  </tiny-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { createTrigger, updateTrigger, previewCron } from '@/api/trigger'
import { Modal } from '@opentiny/vue'
import Cron from '@/components/cron/index.vue'

interface TriggerForm {
  id?: string
  dagDefinitionId: string
  name: string
  type: string
  cronExpression: string
  enabled: boolean
  concurrencyPolicy: string
  maxParallel: number
  description: string
}

const props = defineProps<{
  modelValue: boolean
  dagDefinitionId: string
  trigger?: any
}>()

const emit = defineEmits(['update:modelValue', 'success'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const dialogTitle = computed(() => {
  return props.trigger ? '编辑触发器' : '新建触发器'
})

const formRef = ref()
const cronEditorVisible = ref(false)
const nextFireTimes = ref<string[]>([])

const form = ref<TriggerForm>({
  dagDefinitionId: props.dagDefinitionId,
  name: '',
  type: 'CRON',
  cronExpression: '',
  enabled: false,
  concurrencyPolicy: 'FORBID',
  maxParallel: 3,
  description: ''
})

const rules = {
  name: [{ required: true, message: '请输入触发器名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择触发器类型', trigger: 'change' }],
  cronExpression: [
    {
      required: true,
      validator: (rule: any, value: any, callback: any) => {
        if (form.value.type === 'CRON' && !value) {
          callback(new Error('请输入Cron表达式'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 监听trigger变化，用于编辑模式
watch(
  () => props.trigger,
  (val) => {
    if (val) {
      form.value = { ...val }
    } else {
      resetForm()
    }
  },
  { immediate: true }
)

const handleTypeChange = () => {
  if (form.value.type !== 'CRON') {
    form.value.cronExpression = ''
    nextFireTimes.value = []
  }
}

const showCronEditor = () => {
  cronEditorVisible.value = true
}

const handleCronPreview = async () => {
  if (form.value.cronExpression) {
    try {
      const res: any = await previewCron(form.value.cronExpression, 5)
      if (res.code === 200) {
        nextFireTimes.value = res.data
      }
    } catch (error) {
      console.error('预览Cron表达式失败', error)
    }
  }
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate()
  if (!valid) return

  try {
    const api = form.value.id ? updateTrigger : createTrigger
    const res: any = await api(form.value)
    
    if (res.code === 200) {
      Modal.message({ message: form.value.id ? '更新成功' : '创建成功', status: 'success' })
      emit('success')
      handleClose()
    } else {
      Modal.message({ message: res.message || '操作失败', status: 'error' })
    }
  } catch (error: any) {
    Modal.message({ message: error.message || '操作失败', status: 'error' })
  }
}

const handleClose = () => {
  visible.value = false
  resetForm()
}

const resetForm = () => {
  form.value = {
    dagDefinitionId: props.dagDefinitionId,
    name: '',
    type: 'CRON',
    cronExpression: '',
    enabled: false,
    concurrencyPolicy: 'FORBID',
    maxParallel: 3,
    description: ''
  }
  nextFireTimes.value = []
  formRef.value?.clearValidate()
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}
</script>

<style scoped>
.next-fire-times {
  margin-top: 10px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.preview-title {
  font-weight: bold;
  margin-bottom: 8px;
  color: #606266;
}

.fire-time-item {
  padding: 4px 0;
  color: #909399;
  font-size: 13px;
}
</style>
