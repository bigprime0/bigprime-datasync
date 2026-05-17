<template>
  <div class="container-list">
    <Breadcrumb :items="['告警中心', '规则管理']" />
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
          <tiny-grid-toolbar class="grid-toolbar" full-screen setting size="small">
            <template #buttons>
              <tiny-form :model="searchForm" inline>
                <tiny-form-item>
                  <tiny-search
                    v-model="searchForm.search"
                    clearable
                    is-enter-search
                    placeholder="请输入规则名称或类型"
                    style="width: 300px"
                    @search="handleSearch"
                  ></tiny-search>
                </tiny-form-item>
                <tiny-form-item>
                  <tiny-select
                    v-model="searchForm.sourceModule"
                    clearable
                    placeholder="选择模块"
                    @change="handleSearch"
                  >
                    <tiny-option label="全部" value=""></tiny-option>
                    <tiny-option label="连接器" value="CONNECTOR"></tiny-option>
                    <tiny-option label="Worker" value="WORKER"></tiny-option>
                    <tiny-option label="日志" value="LOG"></tiny-option>
                    <tiny-option label="DAG" value="DAG"></tiny-option>
                  </tiny-select>
                </tiny-form-item>
                <tiny-form-item>
                  <tiny-button size="small" type="primary" @click="handleCreate"
                    >创建规则</tiny-button
                  >
                  <tiny-button size="small" @click="handleRefresh">刷新</tiny-button>
                </tiny-form-item>
              </tiny-form>
            </template>
          </tiny-grid-toolbar>
        </template>

        <tiny-grid-column fixed="left" type="index" width="50"></tiny-grid-column>

        <tiny-grid-column
          title="规则名称"
          field="ruleName"
          fixed="left"
          width="200"
        ></tiny-grid-column>

        <tiny-grid-column title="规则编码" field="ruleCode" width="150"></tiny-grid-column>

        <tiny-grid-column title="所属模块" field="sourceModule" align="center" width="120">
          <template #default="{ row }">
            <tiny-tag v-if="row.sourceModule === 'CONNECTOR'" type="info">连接器</tiny-tag>
            <tiny-tag v-else-if="row.sourceModule === 'WORKER'" type="success">Worker</tiny-tag>
            <tiny-tag v-else-if="row.sourceModule === 'LOG'" type="warning">日志</tiny-tag>
            <tiny-tag v-else-if="row.sourceModule === 'DAG'" type="danger">DAG</tiny-tag>
            <tiny-tag v-else>其他</tiny-tag>
          </template>
        </tiny-grid-column>

        <tiny-grid-column title="告警类型" field="alertType" width="150"></tiny-grid-column>

        <tiny-grid-column title="告警级别" field="alertLevel" align="center" width="100">
          <template #default="{ row }">
            <tiny-tag v-if="row.alertLevel === 'CRITICAL'" type="danger">严重</tiny-tag>
            <tiny-tag v-else-if="row.alertLevel === 'ERROR'" type="warning">错误</tiny-tag>
            <tiny-tag v-else-if="row.alertLevel === 'WARNING'" type="info">警告</tiny-tag>
            <tiny-tag v-else>信息</tiny-tag>
          </template>
        </tiny-grid-column>

        <tiny-grid-column title="规则表达式" field="ruleExpression" width="250"></tiny-grid-column>

        <tiny-grid-column title="通知方式" field="notificationConnectors" width="200">
          <template #default="{ row }">
            <div
              v-if="getNotificationConnectorNames(row.notificationConnectors).length > 0"
              style="display: flex; flex-wrap: wrap; gap: 4px"
            >
              <tiny-tag
                v-for="(name, index) in getNotificationConnectorNames(row.notificationConnectors)"
                :key="index"
                size="small"
                type="info"
              >
                {{ name }}
              </tiny-tag>
            </div>
            <span v-else style="color: #999; font-size: 12px">未配置</span>
          </template>
        </tiny-grid-column>

        <tiny-grid-column title="启用状态" field="enabled" align="center" width="100">
          <template #default="{ row }">
            <tiny-switch v-model="row.enabled" @change="handleToggle(row)"></tiny-switch>
          </template>
        </tiny-grid-column>

        <tiny-grid-column title="静默期" field="silencePeriod" align="center" width="100">
          <template #default="{ row }">
            {{ formatSilencePeriod(row.silencePeriod) }}
          </template>
        </tiny-grid-column>

        <tiny-grid-column
          title="创建人"
          field="creatorName"
          align="center"
          width="120"
        ></tiny-grid-column>

        <tiny-grid-column
          title="创建时间"
          field="createTime"
          align="center"
          width="180"
        ></tiny-grid-column>

        <tiny-grid-column title="操作" align="center" fixed="right" width="140">
          <template #default="{ row }">
            <div style="display: flex; gap: 10px; justify-content: center; align-items: center">
              <div title="查看">
                <tiny-icon-eyeopen
                  @click="handleView(row)"
                  style="font-size: 20px; cursor: pointer; fill: #409eff; color: #409eff"
                />
              </div>
              <div title="编辑">
                <tiny-icon-edit
                  @click="handleEdit(row)"
                  style="font-size: 20px; cursor: pointer; fill: #52c41a; color: #52c41a"
                />
              </div>
              <div title="测试">
                <tiny-icon-setting
                  @click="handleTest(row)"
                  style="font-size: 20px; cursor: pointer; fill: #722ed1; color: #722ed1"
                />
              </div>
              <div title="删除">
                <tiny-icon-del
                  @click="handleDelete(row)"
                  style="font-size: 20px; cursor: pointer; fill: #f56c6c; color: #f56c6c"
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

    <!-- 规则编辑对话框 -->
    <RuleFormDialog
      v-if="showDialog"
      :visible="showDialog"
      :rule-data="currentRule"
      :is-edit="isEdit"
      @close="handleDialogClose"
      @success="handleDialogSuccess"
    />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import {
  Grid as TinyGrid,
  Modal,
  Tag as TinyTag,
  TinyButton,
  TinyForm,
  TinyFormItem,
  TinyGridColumn,
  TinyGridToolbar,
  TinyOption,
  TinyPager,
  TinySearch,
  TinySelect,
  TinySwitch
} from '@opentiny/vue'
import { iconDel, iconEdit, iconEyeopen, iconCheckedTrue, iconSetting } from '@opentiny/vue-icon'
import { AlertRuleApi } from '@/api/alert'
import { ConnectorService } from '@/services/connector'
import { formatDateTime } from '@/utils/date'
import Breadcrumb from '@/components/breadcrumb/index.vue'
import RuleFormDialog from './components/RuleFormDialog.vue'
import { PageUtils } from '@/utils/page'

const TinyIconEyeopen = iconEyeopen()
const TinyIconEdit = iconEdit()
const TinyIconCheckedTrue = iconCheckedTrue()
const TinyIconDel = iconDel()
const TinyIconSetting = iconSetting()

const loading = ref(false)
const tableHeight = ref(600)
const gridRef = ref(null)
const gridData = ref<any[]>([])
const showDialog = ref(false)
const isEdit = ref(false)
const currentRule = ref<any>(null)
const connectorMap = ref<Map<string, any>>(new Map()) // 连接器ID到名称的映射

const searchForm = reactive({
  search: '',
  sourceModule: ''
})

const formPage = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
  align: 'right',
  layout: 'total, prev, pager, next, jumper, sizes',
  pageSizes: [10, 20, 50, 100]
})

// 加载连接器列表
const loadConnectors = async () => {
  try {
    const res: any = await ConnectorService.getConnectorList({
      page: 1,
      pageSize: 100,
      search: ''
    })

    if (res.msg === 'success' && res.data?.list) {
      res.data.list.forEach((item: any) => {
        connectorMap.value.set(item.id, {
          name: item.name,
          product: item.product
        })
      })
    }
  } catch (error) {
    console.error('加载连接器列表失败:', error)
  }
}

// 获取通知连接器名称列表
const getNotificationConnectorNames = (notificationConnectorsJson: string): string[] => {
  if (!notificationConnectorsJson) return []

  try {
    const connectorIds = JSON.parse(notificationConnectorsJson)
    if (!Array.isArray(connectorIds)) return []

    return connectorIds
      .map((id) => {
        const connector = connectorMap.value.get(id)
        return connector ? `${connector.name}(${connector.product})` : null
      })
      .filter((name) => name !== null) as string[]
  } catch (e) {
    return []
  }
}

// 加载规则列表
const loadRuleList = async () => {
  loading.value = true
  try {
    const params = {
      search: searchForm.search,
      sourceModule: searchForm.sourceModule,
      page: formPage.page,
      pageSize: formPage.pageSize
    }

    const res = await AlertRuleApi.getRuleList(params)
    if (res.code === 0) {
      gridData.value = res.data.list.map((item: any) => ({
        ...item,
        createTime: formatDateTime(item.createTime),
        updateTime: formatDateTime(item.updateTime)
      }))
      formPage.total = res.data.total
    } else {
      Modal.message({ message: res.msg, status: 'error' })
    }
  } catch (error: any) {
    Modal.message({ message: error.message || '加载失败', status: 'error' })
  } finally {
    loading.value = false
  }
}

// 创建规则
const handleCreate = () => {
  isEdit.value = false
  currentRule.value = null
  showDialog.value = true
}

// 搜索
const handleSearch = () => {
  formPage.page = 1
  loadRuleList()
}

// 刷新
const handleRefresh = () => {
  loadRuleList()
}

// 切换启用状态
const handleToggle = async (row: any) => {
  try {
    const res = await AlertRuleApi.toggleRule(row.id, { enabled: row.enabled })
    if (res.code === 0) {
      Modal.message({ message: '操作成功', status: 'success' })
    } else {
      row.enabled = !row.enabled // 恢复原状态
      Modal.message({ message: res.msg, status: 'error' })
    }
  } catch (error: any) {
    row.enabled = !row.enabled // 恢复原状态
    Modal.message({ message: error.message || '操作失败', status: 'error' })
  }
}

// 操作菜单
const handleOperation = (row: any, event: any) => {
  switch (event.name) {
    case 'view':
      handleView(row)
      break
    case 'edit':
      handleEdit(row)
      break
    case 'test':
      handleTest(row)
      break
    case 'delete':
      handleDelete(row)
      break
  }
}

// 查看规则
const handleView = (row: any) => {
  isEdit.value = false
  currentRule.value = { ...row }
  showDialog.value = true
}

// 编辑规则
const handleEdit = (row: any) => {
  isEdit.value = true
  currentRule.value = { ...row }
  showDialog.value = true
}

// 测试规则
const handleTest = (row: any) => {
  Modal.alert({
    title: '规则测试',
    message: '规则测试功能即将推出',
    status: 'info'
  })
}

// 删除规则
const handleDelete = (row: any) => {
  Modal.confirm({
    title: '确认删除',
    message: `确定要删除规则"${row.ruleName}"吗？删除后将无法恢复！`,
    status: 'warning'
  }).then(async () => {
    try {
      const res = await AlertRuleApi.deleteRule(row.id)
      if (res.code === 0) {
        Modal.message({ message: '删除成功', status: 'success' })
        loadRuleList()
      } else {
        Modal.message({ message: res.msg, status: 'error' })
      }
    } catch (error: any) {
      Modal.message({ message: error.message || '删除失败', status: 'error' })
    }
  })
}

// 对话框关闭
const handleDialogClose = () => {
  showDialog.value = false
  currentRule.value = null
}

// 对话框成功
const handleDialogSuccess = () => {
  showDialog.value = false
  currentRule.value = null
  loadRuleList()
}

// 分页
const pageChange = (page: number) => {
  formPage.page = page
  loadRuleList()
}

const limitChange = (limit: number) => {
  formPage.pageSize = limit
  formPage.page = 1
  loadRuleList()
}

// 格式化静默期
const formatSilencePeriod = (seconds: number) => {
  if (!seconds) return '-'
  if (seconds < 60) return `${seconds}秒`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}分钟`
  return `${Math.floor(seconds / 3600)}小时`
}

onMounted(() => {
  tableHeight.value = PageUtils.setTableHeight(null)
  loadConnectors() // 加载连接器列表
  loadRuleList()
})
</script>

<style lang="scss" scoped>
.container-list {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
}

.contain {
  flex: 1 1 auto;
  margin: 8px 10px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 0 8px 8px rgba(169, 174, 184, 0.05);
  padding: 10px;

  .grid-toolbar {
    .tiny-select {
      width: 280px;
    }
  }
}
</style>
