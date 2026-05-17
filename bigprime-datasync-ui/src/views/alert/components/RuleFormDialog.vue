<template>
  <tiny-dialog-box
    :visible="visible"
    :title="isEdit ? '编辑规则' : (ruleData ? '查看规则' : '创建规则')"
    width="800px"
    @close="handleClose"
  >
    <tiny-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="120px"
      label-position="left"
    >
      <tiny-form-item label="规则名称" prop="ruleName">
        <tiny-input
          v-model="formData.ruleName"
          :disabled="!isEdit && !!ruleData"
          placeholder="请输入规则名称"
        ></tiny-input>
      </tiny-form-item>

      <tiny-form-item label="规则编码" prop="ruleCode">
        <tiny-input
          v-model="formData.ruleCode"
          :disabled="!isEdit && !!ruleData"
          placeholder="请输入规则编码（唯一标识）"
        ></tiny-input>
      </tiny-form-item>

      <tiny-form-item label="所属模块" prop="sourceModule">
        <tiny-select
          v-model="formData.sourceModule"
          :disabled="!isEdit && !!ruleData"
          placeholder="请选择所属模块"
        >
          <tiny-option label="连接器" value="CONNECTOR"></tiny-option>
          <tiny-option label="Worker" value="WORKER"></tiny-option>
          <tiny-option label="日志" value="LOG"></tiny-option>
          <tiny-option label="DAG" value="DAG"></tiny-option>
        </tiny-select>
      </tiny-form-item>

      <tiny-form-item label="告警类型" prop="alertType">
        <tiny-input
          v-model="formData.alertType"
          :disabled="!isEdit && !!ruleData"
          placeholder="请输入告警类型"
        ></tiny-input>
      </tiny-form-item>

      <tiny-form-item label="告警级别" prop="alertLevel">
        <tiny-select
          v-model="formData.alertLevel"
          :disabled="!isEdit && !!ruleData"
          placeholder="请选择告警级别"
        >
          <tiny-option label="严重" value="CRITICAL"></tiny-option>
          <tiny-option label="错误" value="ERROR"></tiny-option>
          <tiny-option label="警告" value="WARNING"></tiny-option>
          <tiny-option label="信息" value="INFO"></tiny-option>
        </tiny-select>
      </tiny-form-item>

      <tiny-form-item label="规则表达式" prop="ruleExpression">
        <tiny-input
          v-model="formData.ruleExpression"
          :disabled="!isEdit && !!ruleData"
          type="textarea"
          :rows="3"
          placeholder="请输入规则表达式，如: errorCount > 10 && errorRate > 0.5"
        ></tiny-input>
        <div v-if="isEdit || !ruleData" style="margin-top: 5px; display: flex; align-items: center; gap: 10px;">
          <tiny-button size="mini" @click="handleValidate">验证表达式</tiny-button>
          <tiny-tooltip
            placement="top"
            effect="light"
          >
            <template #content>
              <div style="max-width: 400px; padding: 10px;">
                <h4 style="margin: 0 0 10px 0;">支持的表达式规则</h4>
                <div style="font-size: 13px; line-height: 1.6;">
                  <p style="margin: 5px 0;"><strong>1. 比较运算符：</strong></p>
                  <div style="margin: 5px 0 10px 20px;">
                    <code>&gt;</code>, <code>&lt;</code>, <code>&gt;=</code>, <code>&lt;=</code>, <code>==</code>, <code>!=</code>
                  </div>
                  
                  <p style="margin: 5px 0;"><strong>2. 逻辑运算符：</strong></p>
                  <div style="margin: 5px 0 10px 20px;">
                    <code>&&</code> (与), <code>||</code> (或), <code>!</code> (非)
                  </div>
                  
                  <p style="margin: 5px 0;"><strong>3. 可用变量示例：</strong></p>
                  <div style="margin: 5px 0 10px 20px;">
                    <code>errorCount</code> - 错误数量<br/>
                    <code>errorRate</code> - 错误率<br/>
                    <code>responseTime</code> - 响应时间<br/>
                    <code>cpuUsage</code> - CPU使用率<br/>
                    <code>memoryUsage</code> - 内存使用率
                  </div>
                  
                  <p style="margin: 5px 0;"><strong>4. 示例：</strong></p>
                  <div style="margin: 5px 0 0 20px;">
                    <code>errorCount &gt; 10</code><br/>
                    <code>errorRate &gt; 0.5 && errorCount &gt; 5</code><br/>
                    <code>cpuUsage &gt; 80 || memoryUsage &gt; 90</code>
                  </div>
                </div>
              </div>
            </template>
            <template #default>
              <component :is="iconHelp()" style="cursor: help; color: #409eff; font-size: 18px;" />
            </template>
          </tiny-tooltip>
          <span v-if="validateResult" :style="{ color: validateResult.valid ? '#67c23a' : '#f56c6c' }">
            {{ validateResult.message }}
          </span>
        </div>
      </tiny-form-item>

      <tiny-form-item label="静默期(秒)" prop="silencePeriod">
        <tiny-numeric
          v-model="formData.silencePeriod"
          :disabled="!isEdit && !!ruleData"
          :min="0"
          :max="86400"
          placeholder="静默期时长"
        ></tiny-numeric>
      </tiny-form-item>

      <tiny-form-item label="通知连接器">
        <tiny-select
          v-model="formData.notificationConnectors"
          :disabled="!isEdit && !!ruleData"
          multiple
          filterable
          placeholder="请选择通知连接器（邮件、钉钉、企业微信等）"
        >
          <tiny-option
            v-for="connector in notificationConnectors"
            :key="connector.id"
            :label="connector.name + ' (' + connector.product + ')'"
            :value="connector.id"
          ></tiny-option>
        </tiny-select>
        <div style="margin-top: 5px; color: #909399; font-size: 12px;">
          选择告警通知渠道（支持多选）。连接器需在"连接器管理"中预先配置。
        </div>
      </tiny-form-item>

      <tiny-form-item label="接收人">
        <tiny-input
          v-model="formData.receivers"
          :disabled="!isEdit && !!ruleData"
          type="textarea"
          :rows="2"
          placeholder="请输入接收人，多个接收人用逗号分隔"
        ></tiny-input>
        <div style="margin-top: 5px; color: #909399; font-size: 12px;">
          邮件: user@example.com | 钉钉: 手机号或@all | 企业微信: userid或@all
        </div>
      </tiny-form-item>

      <tiny-form-item label="作用范围" prop="scope">
        <tiny-select
          v-model="formData.scope"
          :disabled="!isEdit && !!ruleData"
          placeholder="请选择作用范围"
        >
          <tiny-option label="全局" value="GLOBAL"></tiny-option>
          <tiny-option label="特定对象" value="SPECIFIC"></tiny-option>
        </tiny-select>
      </tiny-form-item>

      <tiny-form-item v-if="formData.scope === 'SPECIFIC'" label="范围值" prop="scopeValue">
        <tiny-input
          v-model="formData.scopeValue"
          :disabled="!isEdit && !!ruleData"
          placeholder="请输入对象ID"
        ></tiny-input>
      </tiny-form-item>

      <tiny-form-item label="启用状态">
        <tiny-switch
          v-model="formData.enabled"
          :disabled="!isEdit && !!ruleData"
        ></tiny-switch>
      </tiny-form-item>

      <tiny-form-item label="规则描述">
        <tiny-input
          v-model="formData.description"
          :disabled="!isEdit && !!ruleData"
          type="textarea"
          :rows="2"
          placeholder="请输入规则描述"
        ></tiny-input>
      </tiny-form-item>
    </tiny-form>

    <template #footer>
      <tiny-button @click="handleClose">取消</tiny-button>
      <tiny-button v-if="isEdit || !ruleData" type="primary" @click="handleSubmit">确定</tiny-button>
    </template>
  </tiny-dialog-box>
</template>

<script lang="ts" setup>
import { reactive, ref, watch, onMounted } from 'vue'
import {
  TinyButton,
  TinyDialogBox,
  TinyForm,
  TinyFormItem,
  TinyInput,
  TinyNumeric,
  TinyOption,
  TinySelect,
  TinySwitch,
  TinyTooltip,
  Modal
} from '@opentiny/vue'
import { iconHelp } from '@opentiny/vue-icon'
import { AlertRuleApi } from '@/api/alert'
import { ConnectorService } from '@/services/connector'

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  ruleData: {
    type: Object,
    default: null
  },
  isEdit: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'success'])

const formRef = ref(null)
const validateResult = ref<any>(null)
const notificationConnectors = ref<any[]>([])

const formData = reactive({
  id: null,
  ruleName: '',
  ruleCode: '',
  sourceModule: '',
  alertType: '',
  alertLevel: '',
  ruleExpression: '',
  silencePeriod: 300,
  scope: 'GLOBAL',
  scopeValue: '',
  enabled: true,
  description: '',
  notificationConnectors: [] as string[],  // 通知连接器ID数组
  receivers: ''  // 接收人列表
})

const rules = {
  ruleName: [{ required: true, message: '请输入规则名称' }],
  ruleCode: [{ required: true, message: '请输入规则编码' }],
  sourceModule: [{ required: true, message: '请选择所属模块' }],
  alertType: [{ required: true, message: '请输入告警类型' }],
  alertLevel: [{ required: true, message: '请选择告警级别' }],
  ruleExpression: [{ required: true, message: '请输入规则表达式' }]
}

// 重置表单
const resetForm = () => {
  formData.id = null
  formData.ruleName = ''
  formData.ruleCode = ''
  formData.sourceModule = ''
  formData.alertType = ''
  formData.alertLevel = ''
  formData.ruleExpression = ''
  formData.silencePeriod = 300
  formData.scope = 'GLOBAL'
  formData.scopeValue = ''
  formData.enabled = true
  formData.description = ''
  formData.notificationConnectors = []
  formData.receivers = ''
  validateResult.value = null
}

// 加载通知类连接器
const loadNotificationConnectors = async () => {
  try {
    const res: any = await ConnectorService.getConnectorList({
      page: 1,
      pageSize: 100,
      search: ''
    })
    
    if (res.msg === 'success' && res.data?.list) {
      // 过滤通知类连接器：邮件、钉钉、企业微信、飞书
const notificationProducts = ['Mail', 'DingTalk', 'WeCom', 'Lark']
      notificationConnectors.value = res.data.list
        .filter((item: any) => {
          const product = item.product || ''
          return notificationProducts.some(p => product.toLowerCase().includes(p.toLowerCase()))
        })
        .map((item: any) => ({
          id: item.id,
          name: item.name,
          product: item.product,
          status: item.status
        }))
      
      console.log('加载到通知连接器:', notificationConnectors.value.length)
    }
  } catch (error) {
    console.error('加载通知连接器失败:', error)
  }
}

// 组件挂载时加载连接器列表
onMounted(() => {
  loadNotificationConnectors()
})

// 监听ruleData变化
watch(
  () => props.ruleData,
  (newVal) => {
    if (newVal) {
      Object.assign(formData, newVal)
      
      // 处理JSON字符串字段
      if (typeof newVal.notificationConnectors === 'string') {
        try {
          formData.notificationConnectors = JSON.parse(newVal.notificationConnectors || '[]')
        } catch (e) {
          formData.notificationConnectors = []
        }
      }
      
      if (typeof newVal.receivers === 'string') {
        formData.receivers = newVal.receivers || ''
      }
    } else {
      resetForm()
    }
  },
  { immediate: true }
)

// 验证表达式
const handleValidate = async () => {
  if (!formData.ruleExpression) {
    Modal.message({ message: '请先输入表达式', status: 'warning' })
    return
  }

  try {
    const res = await AlertRuleApi.validateExpression({ expression: formData.ruleExpression })
    if (res.code === 0) {
      validateResult.value = res.data
    } else {
      Modal.message({ message: res.msg, status: 'error' })
    }
  } catch (error: any) {
    Modal.message({ message: error.message || '验证失败', status: 'error' })
  }
}

// 关闭对话框
const handleClose = () => {
  emit('close')
}

// 提交表单
const handleSubmit = async () => {
  const form: any = formRef.value
  form.validate(async (valid: boolean) => {
    if (!valid) {
      return
    }

    try {
      // 准备提交数据，将数组转为JSON字符串
      const submitData = {
        ...formData,
        notificationConnectors: JSON.stringify(formData.notificationConnectors || []),
        receivers: formData.receivers || ''
      }
      
      let res
      if (submitData.id) {
        // 更新
        res = await AlertRuleApi.updateRule(submitData)
      } else {
        // 创建
        res = await AlertRuleApi.createRule(submitData)
      }

      if (res.code === 0) {
        Modal.message({
          message: submitData.id ? '更新成功' : '创建成功',
          status: 'success'
        })
        emit('success')
      } else {
        Modal.message({ message: res.msg, status: 'error' })
      }
    } catch (error: any) {
      Modal.message({ message: error.message || '操作失败', status: 'error' })
    }
  })
}
</script>

<style lang="scss" scoped>
:deep(.tiny-form-item__label) {
  text-align: left;
}
</style>
