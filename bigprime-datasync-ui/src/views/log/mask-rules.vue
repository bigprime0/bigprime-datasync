<template>
  <div class="container-list">
    <Breadcrumb :items="['日志管理', '脱敏规则']" />

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
              <tiny-button size="small" type="primary" @click="handleAdd">
                <component :is="TinyIconPlus" class="icon" />
                新建规则
              </tiny-button>
              <tiny-button size="small" @click="loadRules">刷新</tiny-button>
            </template>
          </tiny-grid-toolbar>
        </template>

        <tiny-grid-column fixed="left" type="index" width="70"></tiny-grid-column>

        <tiny-grid-column
          title="规则名称"
          field="ruleName"
          fixed="left"
          width="150"
        ></tiny-grid-column>

        <tiny-grid-column title="规则类型" field="ruleType" align="center" width="120">
          <template #default="{ row }">
            <tiny-tag v-if="row.ruleType === 'REGEX'" type="info">正则表达式</tiny-tag>
            <tiny-tag v-else-if="row.ruleType === 'FIELD'" type="success">JSON字段</tiny-tag>
            <tiny-tag v-else-if="row.ruleType === 'KEYWORD'" type="warning">关键字</tiny-tag>
          </template>
        </tiny-grid-column>

        <tiny-grid-column
          title="匹配模式"
          field="matchPattern"
          min-width="200"
          show-overflow="tooltip"
        ></tiny-grid-column>

        <tiny-grid-column title="替换方式" field="replaceType" align="center" width="100">
          <template #default="{ row }">
            <span v-if="row.replaceType === 'MASK'">掩码</span>
            <span v-else-if="row.replaceType === 'REPLACE'">替换</span>
            <span v-else-if="row.replaceType === 'REMOVE'">移除</span>
          </template>
        </tiny-grid-column>

        <tiny-grid-column
          title="替换值"
          field="replaceValue"
          width="120"
          show-overflow="tooltip"
        ></tiny-grid-column>

        <tiny-grid-column
          title="排序"
          field="sortOrder"
          align="center"
          width="80"
        ></tiny-grid-column>

        <tiny-grid-column title="状态" field="enabled" align="center" width="80">
          <template #default="{ row }">
            <tiny-tag v-if="row.enabled" type="success">启用</tiny-tag>
            <tiny-tag v-else type="danger">禁用</tiny-tag>
          </template>
        </tiny-grid-column>

        <tiny-grid-column
          title="描述"
          field="description"
          min-width="200"
          show-overflow="tooltip"
        ></tiny-grid-column>

        <tiny-grid-column title="操作" align="center" fixed="right" width="120">
          <template #default="{ row }">
            <div style="display: flex; gap: 10px; justify-content: center; align-items: center;">
              <div title="测试">
                <tiny-icon-view
                  @click="handleTest(row)"
                  style="font-size: 20px; cursor: pointer; fill: #409eff; color: #409eff;"
                />
              </div>
              <div title="编辑">
                <tiny-icon-edit
                  @click="handleEdit(row)"
                  style="font-size: 20px; cursor: pointer; fill: #52c41a; color: #52c41a;"
                />
              </div>
              <div title="删除">
                <tiny-icon-del
                  @click="handleDelete(row)"
                  style="font-size: 20px; cursor: pointer; fill: #f56c6c; color: #f56c6c;"
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

    <!-- 新建/编辑对话框 -->
    <tiny-dialog-box v-model:visible="dialogVisible" :title="dialogTitle" width="600px">
      <tiny-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
        <tiny-form-item label="规则名称" prop="ruleName">
          <tiny-input v-model="formData.ruleName" placeholder="请输入规则名称" />
        </tiny-form-item>
        <tiny-form-item label="规则类型" prop="ruleType">
          <tiny-select v-model="formData.ruleType" placeholder="请选择规则类型">
            <tiny-option label="正则表达式" value="REGEX" />
            <tiny-option label="JSON字段" value="FIELD" />
            <tiny-option label="关键字" value="KEYWORD" />
          </tiny-select>
        </tiny-form-item>
        <tiny-form-item label="匹配模式" prop="matchPattern">
          <tiny-input
            v-model="formData.matchPattern"
            :placeholder="getMatchPatternPlaceholder()"
            type="textarea"
            :rows="3"
          />
        </tiny-form-item>
        <tiny-form-item label="替换方式" prop="replaceType">
          <tiny-select v-model="formData.replaceType" placeholder="请选择替换方式">
            <tiny-option label="掩码(保留首尾)" value="MASK" />
            <tiny-option label="替换为指定值" value="REPLACE" />
            <tiny-option label="移除" value="REMOVE" />
          </tiny-select>
        </tiny-form-item>
        <tiny-form-item
          v-if="formData.replaceType === 'REPLACE'"
          label="替换值"
          prop="replaceValue"
        >
          <tiny-input v-model="formData.replaceValue" placeholder="请输入替换值" />
        </tiny-form-item>
        <tiny-form-item label="排序" prop="sortOrder">
          <tiny-numeric v-model="formData.sortOrder" :min="1" :max="999" />
        </tiny-form-item>
        <tiny-form-item label="启用状态" prop="enabled">
          <tiny-switch v-model="formData.enabled" />
        </tiny-form-item>
        <tiny-form-item label="描述" prop="description">
          <tiny-input v-model="formData.description" type="textarea" :rows="2" />
        </tiny-form-item>
      </tiny-form>
      <template #footer>
        <tiny-button @click="dialogVisible = false">取消</tiny-button>
        <tiny-button type="primary" @click="handleSave">确定</tiny-button>
      </template>
    </tiny-dialog-box>

    <!-- 测试对话框 -->
    <tiny-dialog-box v-model:visible="testDialogVisible" title="测试脱敏规则" width="700px">
      <div class="test-container">
        <div class="test-input">
          <div class="label">测试文本：</div>
          <tiny-input
            v-model="testContent"
            type="textarea"
            :rows="5"
            placeholder="请输入要测试的文本内容"
          />
        </div>
        <div class="test-button">
          <tiny-button type="primary" @click="executeTest">执行测试</tiny-button>
        </div>
        <div class="test-result">
          <div class="label">脱敏结果：</div>
          <tiny-input
            v-model="testResult"
            type="textarea"
            :rows="5"
            readonly
            placeholder="脱敏结果将显示在这里"
          />
        </div>
      </div>
      <template #footer>
        <tiny-button @click="testDialogVisible = false">关闭</tiny-button>
      </template>
    </tiny-dialog-box>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import {
  Grid as TinyGrid,
  GridColumn as TinyGridColumn,
  GridToolbar as TinyGridToolbar,
  Button as TinyButton,
  Tag as TinyTag,
  DialogBox as TinyDialogBox,
  Form as TinyForm,
  FormItem as TinyFormItem,
  Input as TinyInput,
  Select as TinySelect,
  Option as TinyOption,
  Switch as TinySwitch,
  Numeric as TinyNumeric,
  Pager as TinyPager,
  Modal,
  Notify
} from '@opentiny/vue'
import { IconPlus, iconEllipsis, iconEdit, iconDel, iconView } from '@opentiny/vue-icon'
import Breadcrumb from '@/components/breadcrumb/index.vue'
import { getMaskRules, saveMaskRule, deleteMaskRule, testMaskRule } from '@/services/logEnhancement'
import { PageUtils } from '@/utils/page'

const TinyIconPlus = IconPlus()
const tinyIconEllipsis = iconEllipsis()
const TinyIconView = iconView()
const TinyIconEdit = iconEdit()
const TinyIconDel = iconDel()

const loading = ref(false)
const tableHeight = ref(600)
const gridRef = ref(null)
const gridData = ref<any[]>([])
const dialogVisible = ref(false)
const dialogTitle = ref('新建规则')
const testDialogVisible = ref(false)
const testContent = ref('')
const testResult = ref('')
const currentTestRule = ref<any>(null)

const formRef = ref()
const formData = reactive({
  id: null,
  ruleName: '',
  ruleType: 'REGEX',
  matchPattern: '',
  replaceType: 'MASK',
  replaceValue: '',
  enabled: true,
  sortOrder: 999,
  description: ''
})

const formPage = reactive({
  page: 1,
  pageSize: 50,
  total: 0,
  align: 'right',
  layout: 'total, prev, pager, next, jumper, sizes',
  pageSizes: [20, 50, 100, 200]
})

const rules = {
  ruleName: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
  ruleType: [{ required: true, message: '请选择规则类型', trigger: 'change' }],
  matchPattern: [{ required: true, message: '请输入匹配模式', trigger: 'blur' }],
  replaceType: [{ required: true, message: '请选择替换方式', trigger: 'change' }]
}

// 加载规则列表
const loadRules = async () => {
  loading.value = true
  try {
    const res = await getMaskRules()
    console.log('脱敏规则接口返回:', res)

    // 兼容两种数据格式
    if (res.code === 0) {
      gridData.value = res.data || []
      formPage.total = gridData.value.length
      console.log('加载规则成功:', gridData.value.length, '条')
    } else {
      console.warn('规则数据格式异常:', res)
      Modal.message({ message: res.msg || '加载失败', status: 'error' })
    }
  } catch (error: any) {
    console.error('加载脱敏规则列表失败:', error)
    Modal.message({
      message: '加载脱敏规则列表失败: ' + (error.message || '未知错误'),
      status: 'error'
    })
  } finally {
    loading.value = false
  }
}

// 获取匹配模式的提示文本
const getMatchPatternPlaceholder = () => {
  if (formData.ruleType === 'REGEX') {
    return '请输入正则表达式，例如：1[3-9]\\d{9}'
  } else if (formData.ruleType === 'FIELD') {
    return '请输入JSON字段名，例如：password'
  } else if (formData.ruleType === 'KEYWORD') {
    return '请输入要匹配的关键字'
  }
  return '请输入匹配模式'
}

// 新建规则
const handleAdd = () => {
  dialogTitle.value = '新建规则'
  Object.assign(formData, {
    id: null,
    ruleName: '',
    ruleType: 'REGEX',
    matchPattern: '',
    replaceType: 'MASK',
    replaceValue: '',
    enabled: true,
    sortOrder: 999,
    description: ''
  })
  dialogVisible.value = true
}

// 编辑规则
const handleEdit = (row: any) => {
  dialogTitle.value = '编辑规则'
  Object.assign(formData, row)
  dialogVisible.value = true
}

// 保存规则
const handleSave = async () => {
  const valid = await formRef.value.validate()
  if (!valid) return

  try {
    const res = await saveMaskRule(formData)
    console.log('保存规则响应:', res)

    const data = res.data || res

    if (data && data.code === 0) {
      Modal.message({ message: '保存成功', status: 'success' })
      dialogVisible.value = false
      await loadRules()
    } else {
      Modal.message({ message: data?.msg || '保存失败', status: 'error' })
    }
  } catch (error: any) {
    console.error('保存失败:', error)
    Modal.message({ message: '保存失败: ' + (error.message || '未知错误'), status: 'error' })
  }
}

// 删除规则
const handleDelete = async (row: any) => {
  Modal.confirm({
    title: '确认删除',
    message: `确定要删除规则“${row.ruleName}”吗？`,
    status: 'warning'
  }).then(async () => {
    try {
      const res = await deleteMaskRule(row.id)
      const data = res.data || res

      if (data && data.code === 0) {
        Modal.message({ message: '删除成功', status: 'success' })
        await loadRules()
      } else {
        Modal.message({ message: data?.msg || '删除失败', status: 'error' })
      }
    } catch (error: any) {
      console.error('删除失败:', error)
      Modal.message({ message: '删除失败: ' + (error.message || '未知错误'), status: 'error' })
    }
  })
}

// 测试规则
const handleTest = (row: any) => {
  currentTestRule.value = row
  testContent.value = ''
  testResult.value = ''
  testDialogVisible.value = true
}

// 执行测试
const executeTest = async () => {
  if (!testContent.value) {
    Modal.message({ message: '请输入测试文本', status: 'warning' })
    return
  }

  try {
    const res = await testMaskRule({
      content: testContent.value,
      rule: currentTestRule.value
    })

    if (res.code === 0) {
      testResult.value = res.data
    } else {
      Modal.message({ message: res.msg || '测试失败', status: 'error' })
    }
  } catch (error: any) {
    console.error('执行测试失败:', error)
    Modal.message({ message: '执行测试失败: ' + (error.message || '未知错误'), status: 'error' })
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

onMounted(() => {
  loadRules()
  tableHeight.value = PageUtils.setTableHeight(240)
})
</script>

<style scoped lang="less">
.container-list {
  height: 100%;
  overflow-y: auto;

  // 隐藏滚动条但保留滚动功能
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }

  .contain {
    margin-top: 20px;
    padding: 0 20px 40px 20px;
  }

  .grid-toolbar {
    padding: 10px 0;

    .icon {
      margin-right: 4px;
    }
  }

  .test-container {
    .test-input,
    .test-result {
      margin-bottom: 16px;

      .label {
        margin-bottom: 8px;
        font-weight: 500;
        color: #303133;
      }
    }

    .test-button {
      margin-bottom: 16px;
      text-align: center;
    }
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
