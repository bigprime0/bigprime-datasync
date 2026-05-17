<template>
<!--  &lt;!&ndash; 标题和返回按钮 &ndash;&gt;
  <div class="action-title">
    <tiny-tag effect="dark" size="small" style="cursor: pointer" type="success" @click="handleBack">
      <IconArrowLeft/>
      <span>返回</span>
    </tiny-tag>
    <tiny-tag type="info">
      <span>{{ currentAction ? '编辑Action' : '新增Action' }}</span>
    </tiny-tag>
  </div>-->

  <!-- 主表单区域 -->
  <div v-loading="loading" class="action-form">
    <tiny-form ref="formRef" :model="formData" :rules="formRules" label-width="120px" size="small">
      <!-- 基本信息 -->
      <div class="group-form-title">Action</div>
      <tiny-divider></tiny-divider>
      <tiny-row>
        <tiny-col :span="6">
          <tiny-form-item :label="$t('action.clazz')" prop="clazz">
            <div style="display: none">
              <tiny-input v-model="formData.id"/>
            </div>
            <tiny-input v-model="formData.clazz" @blur="handleClassBlur"></tiny-input>
          </tiny-form-item>
        </tiny-col>
        <tiny-col :span="6">
          <tiny-form-item :label="$t('action.paramClazz')" prop="paramClazz">
            <tiny-input v-model="formData.paramClazz" disabled="true"/>
          </tiny-form-item>
        </tiny-col>
      </tiny-row>

      <tiny-row>
        <tiny-col :span="6">
          <tiny-form-item :label="$t('action.namespace')" prop="namespace">
            <tiny-input v-model="formData.namespace"/>
          </tiny-form-item>
        </tiny-col>
        <tiny-col :span="6">
          <tiny-form-item :label="$t('action.category')" prop="category">
            <tiny-input v-model="formData.category"/>
          </tiny-form-item>
        </tiny-col>
      </tiny-row>

      <tiny-row>
        <tiny-col :span="6">
          <tiny-form-item :label="$t('action.code')" prop="code">
            <tiny-input v-model="formData.code"/>
          </tiny-form-item>
        </tiny-col>
        <tiny-col :span="6">
          <tiny-form-item :label="$t('action.name')" prop="name">
            <tiny-input v-model="formData.name"/>
          </tiny-form-item>
        </tiny-col>
      </tiny-row>

      <tiny-row>
        <tiny-col :span="6">
          <tiny-form-item :label="$t('action.version')" prop="version">
            <tiny-input v-model="formData.version"/>
          </tiny-form-item>
        </tiny-col>
        <tiny-col :span="6">
          <tiny-form-item :label="$t('action.status')" prop="status">
            <tiny-select v-model="formData.status" clearable>
              <tiny-option label="启用" value="1"></tiny-option>
              <tiny-option label="禁用" value="0"></tiny-option>
            </tiny-select>
          </tiny-form-item>
        </tiny-col>
      </tiny-row>

      <tiny-row>
        <tiny-col :span="12">
          <tiny-form-item :label="$t('action.description')" prop="description">
            <tiny-input
                v-model="formData.description"
                :autosize="{ minRows: 2, maxRows: 4 }"
                type="textarea"
            />
          </tiny-form-item>
        </tiny-col>
      </tiny-row>

      <!-- 参数配置 -->
      <tiny-row>
        <tiny-col :span="12">
          <tiny-form-item :label="$t('action.param.config')">
            <tiny-grid
                :ref="paramRef"
                :data="formData.actionParamList"
                :edit-config="{ trigger: 'click', mode: 'row', showStatus: true, activeMethod }"
                :stripe="true"
                border
                highlight-hover-row
                size="small"
            >
              <!-- 参数名称列 -->
              <tiny-grid-column
                  :title="$t('action.param.name')"
                  field="name"
                  width="120"
              ></tiny-grid-column>

              <!-- 是否必填 -->
              <tiny-grid-column
                  :title="$t('action.param.required')"
                  align="center"
                  field="isRequired"
                  width="80"
              >
                <template v-slot="data">
                  <IconSuccess
                      v-if="data.row.isRequired == true || data.row.isRequired == 'true'"
                  ></IconSuccess>
                  <IconMobileRadio v-else></IconMobileRadio>
                </template>
              </tiny-grid-column>

              <!-- 值类型 -->
              <tiny-grid-column
                  :title="$t('action.param.valueType')"
                  field="valueType"
                  width="100"
              ></tiny-grid-column>

              <!-- 默认值 -->
              <tiny-grid-column
                  :editor="{ component: 'input', autoselect: true }"
                  :title="$t('action.param.defaultValue')"
                  field="defaultValue"
                  width="120"
              ></tiny-grid-column>

              <!-- 显示名称列 -->
              <tiny-grid-column
                  :editor="{ component: 'input', autoselect: true }"
                  :title="$t('action.param.title')"
                  field="title"
                  width="150"
              ></tiny-grid-column>

              <!-- 组件类型 -->
              <tiny-grid-column
                  :editor="{
                  component: TinySelect,
                  attrs: { options, textField: 'name', valueField: 'id' }
                }"
                  :format-text="formatComponentSelect"
                  :title="$t('action.param.componentType')"
                  field="componentType"
                  width="140"
              ></tiny-grid-column>
              <tiny-grid-column
                  :editor="{}"
                  :title="$t('action.param.componentConfig')"
                  field="componentConfig"
              >
                <template #edit="data">
                  <tiny-input
                      v-model="data.row.componentConfig"
                      :rows="3"
                      placeholder="配置格式为Json类型"
                      type="textarea"
                  ></tiny-input>
                </template>
              </tiny-grid-column>
            </tiny-grid>
          </tiny-form-item>
        </tiny-col>
      </tiny-row>

      <tiny-row>
        <tiny-col :span="12">
          <tiny-form-item class="form-actions">
            <!--            <tiny-button type="primary" @click="reloadParams" :reset-time="5">参数重载</tiny-button>-->
            <tiny-button :reset-time="3" type="primary" @click="handleSubmit">保存</tiny-button>
            <!--            <tiny-button @click="handleReset">重置</tiny-button>-->
            <tiny-button @click="handleBack">取消</tiny-button>
          </tiny-form-item>
        </tiny-col>
      </tiny-row>
    </tiny-form>
  </div>
</template>

<script lang="ts" setup>
import {onMounted, ref} from 'vue'
import {useI18n} from 'vue-i18n'
import {Button as TinyButton, Col as TinyCol, Divider as TinyDivider, Form as TinyForm, FormItem as TinyFormItem, Grid as TinyGrid, GridColumn as TinyGridColumn, Input as TinyInput, Modal, Option as TinyOption, Row as TinyRow, Select as TinySelect, Tag as TinyTag} from '@opentiny/vue'
import {iconArrowLeft, iconLoading, iconMobileRadio, iconSuccess} from '@opentiny/vue-icon'
import {ActionService} from '@/services/action'
import emitter from '@/utils/evnetbus'

const {t} = useI18n()
const currentAction = defineModel<any>('currentRow', {default: {}})
const emit = defineEmits(['success', 'back'])

const IconArrowLeft = iconArrowLeft()
const TinyIconLoading = iconLoading()
const IconSuccess = iconSuccess()
const IconMobileRadio = iconMobileRadio()

// 表单验证规则
const formRules = {
  /*  code: [{ required: true, message: '请输入编码', trigger: 'blur' }],
    name: [{ required: true, message: '请输入标题', trigger: 'blur' }],
    clazz: [{ required: true, message: '请输入实现类', trigger: 'blur' }],
    status: [{ required: true, message: '请选择状态', trigger: 'change' }]*/
}

// 状态变量
const loading = ref(false)
const loadingClass = ref(false)
const formRef = ref()
const paramRef = ref()
// 表单数据
const formData = ref({
  id: '',
  namespace: '',
  code: '',
  name: '',
  description: '',
  category: '',
  version: '1.0.0',
  clazz: '',
  paramClazz: '',
  status: '1',
  actionParamList: []
})

const options = ref([
  {name: '文本框', id: 'TEXT'},
  {name: '数字框', id: 'NUMBER'},
  {name: '文本域', id: 'TEXTAREA'},
  {name: '开关', id: 'SWITCH'},
  {name: '单选框', id: 'RADIO'},
  {name: '复选框', id: 'CHECKBOX'},
  {name: '选择框', id: 'SELECT'},
  {name: '数据源', id: 'DATASOURCE'},
  {name: '密码框', id: 'PASSWORD'},
  {name: '日期时间', id: 'DATETIME'},
  {name: '进度条', id: 'SLIDER'},
  {name: '属性输入', id: 'PROPERTY'},
  {name: '文件上传', id: 'FILE_UPLOAD'},
  {name: '远程请求', id: 'REMOTE_SELECT'}
])

function formatComponentSelect({cellValue}) {
  const selected = options.value.find((w) => w.id === cellValue)
  if (selected) return selected.name
  return cellValue
}

// 初始化数据
onMounted(async () => {
  await handleLoadAction()
})

function activeMethod({row, column}) {
  return (
      column.property !== 'name' ||
      column.property === 'isRequired' ||
      column.property === 'valueType'
  )
}

// 获取Action参数
const fetchActionParams = async (clazz: string) => {
  loadingClass.value = true
  try {
    const res = await ActionService.getActionParams(clazz)
    if (res.msg === 'success') {
      formData.value.actionParamList = res.data
    }
  } catch (error) {
    console.error('获取[' + clazz + ']的Action参数失败:', error)
    Modal.message({message: '获取[' + clazz + ']的Action参数失败:', status: 'error'})
  } finally {
    loadingClass.value = false
  }
}

const handleLoadAction = async () => {
  if (currentAction.value) {
    const res = await ActionService.getByClassName(currentAction.value.clazz)
    if (res.msg === 'success') {
      formData.value = currentAction.value;
      formData.value.status = formData.value.status.toString();
      formData.value.actionParamList = res.data.actionParamList;
    }
  }
}

// 处理类名输入失焦
const handleClassBlur = async () => {
  if (!currentAction.value && formData.value.clazz) {
    loadingClass.value = true
    try {
      const res = await ActionService.getByClassName(formData.value.clazz)
      if (res.msg === 'success') {
        res.data.status = res.data.status.toString()
        formData.value = res.data
      }
    } catch (error) {
      console.error('获取[' + clazz + ']的Action信息失败:', error)
      Modal.message({message: '获取[' + clazz + ']的Action信息失败:', status: 'error'})
    } finally {
      loadingClass.value = false
    }
  }
}

// 提交表单
const handleSubmit = () => {
  formRef.value.validate(async (valid: boolean) => {
    if (!valid) return

    loading.value = true
    try {
      await ActionService.saveAction(formData.value)
      Modal.message({message: '保存成功', status: 'success'})
      emitter.emit('handleActionList')
      formRef.value.resetFields()
    } catch (error) {
      console.error('保存失败:', error)
      Modal.message({message: '保存失败', status: 'error'})
    } finally {
      loading.value = false
    }
  })
}

// 重置表单
const handleReset = () => {
  formRef.value.resetFields()
  if (!props.actionId) {
    formData.value.params = {}
  }
}

// 返回
const handleBack = () => {
  emit('back')
}
</script>

<style lang="less" scoped>
.action-title {
  .tiny-tag {
    margin-right: 5px;
  }
}

.action-form {
  width: 70%;
  margin: 0 auto;
}

.form-title {
  font-size: 15px;
}

.group-form-title {
  font-size: 16px;
  color: #191919;
  font-weight: bold;
}
</style>
