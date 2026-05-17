<template>
  <!-- 任务列表 -->
  <div class="crawler-task-container">
    <Breadcrumb :items="['爬虫管理', '任务列表']" />
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
                    placeholder="请输入任务名称或URL"
                    style="width: 300px"
                    @search="handleSearch"
                  ></tiny-search>
                </tiny-form-item>
                <tiny-form-item>
                  <tiny-button size="small" type="primary" @click="openAiWizard"
                    >⚡ AI 智能创建</tiny-button
                  >
                  <tiny-button size="small" @click="handleRefresh">刷新</tiny-button>
                </tiny-form-item>
              </tiny-form>
            </template>
          </tiny-grid-toolbar>
        </template>

        <tiny-grid-column fixed="left" type="index" width="50"></tiny-grid-column>

        <tiny-grid-column title="任务名称" field="name" fixed="left" min-width="150"></tiny-grid-column>

        <tiny-grid-column title="目标URL" field="targetUrl" min-width="200"></tiny-grid-column>

        <tiny-grid-column title="任务类型" field="taskType" align="center" width="90">
          <template #default="{ row }">
            <tiny-tag v-if="row.taskType === 'SINGLE'" type="info">单次</tiny-tag>
            <tiny-tag v-else-if="row.taskType === 'SCHEDULED'" type="success">定时</tiny-tag>
            <tiny-tag v-else type="warning">手动</tiny-tag>
          </template>
        </tiny-grid-column>

        <tiny-grid-column title="状态" field="status" align="center" width="90">
          <template #default="{ row }">
            <tiny-tag v-if="row.status === 'DRAFT'" type="info">草稿</tiny-tag>
            <tiny-tag v-else-if="row.status === 'READY'" type="success">就绪</tiny-tag>
            <tiny-tag v-else-if="row.status === 'RUNNING'" type="warning">运行中</tiny-tag>
            <tiny-tag v-else-if="row.status === 'PAUSED'" type="warning">暂停</tiny-tag>
            <tiny-tag v-else type="danger">停止</tiny-tag>
          </template>
        </tiny-grid-column>

<!--        <tiny-grid-column title="启用状态" field="enabled" align="center" width="90">-->
<!--          <template #default="{ row }">-->
<!--            <tiny-switch v-model="row.enabled" @change="handleToggle(row)"></tiny-switch>-->
<!--          </template>-->
<!--        </tiny-grid-column>-->

        <tiny-grid-column title="执行统计" align="center" width="190">
          <template #default="{ row }">
            <span>总计: {{ row.totalExecutions || 0 }}</span> /
            <span style="color: #5cb87a">成功: {{ row.successExecutions || 0 }}</span> /
            <span style="color: #f56c6c">失败: {{ row.failedExecutions || 0 }}</span>
          </template>
        </tiny-grid-column>

        <tiny-grid-column
          title="最后执行"
          field="lastExecutionTime"
          align="center"
          width="160"
        ></tiny-grid-column>

        <tiny-grid-column
          title="创建时间"
          field="createTime"
          align="center"
          width="160"
        ></tiny-grid-column>

        <tiny-grid-column title="操作" align="center" fixed="right" width="140">
          <template #default="{ row }">
            <div style="display: flex; gap: 10px; justify-content: center; align-items: center;">
              <div title="执行">
                <tiny-icon-start
                  @click="handleExecute(row)"
                  style="font-size: 20px; cursor: pointer; fill: #52c41a; color: #52c41a;"
                />
              </div>
              <div title="编辑">
                <tiny-icon-edit
                  @click="handleEdit(row)"
                  style="font-size: 20px; cursor: pointer; fill: #e6a23c; color: #e6a23c;"
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
  </div>

  <!-- AI Agent 创建任务弹窗 -->
  <tiny-dialog-box v-model:visible="aiWizardVisible" title="AI 智能创建爬虫任务" width="800px" @close="resetAiWizard">
    <tiny-form :model="aiForm" label-width="100px">
      <tiny-form-item label="任务名称" required>
        <tiny-input v-model="aiForm.name" placeholder="请输入任务名称" />
      </tiny-form-item>
      <tiny-form-item label="目标 URL" required>
        <tiny-input v-model="aiForm.websiteUrl" placeholder="https://example.com" />
      </tiny-form-item>
      <tiny-form-item label="爬取指令" required>
        <tiny-input
          v-model="aiForm.instructions"
          type="textarea"
          :rows="8"
          placeholder="用自然语言描述要提取的数据，如：提取产品列表，包含名称、价格、描述"
        />
      </tiny-form-item>
      <tiny-form-item label="爬虫助手">
        <tiny-select v-model="aiForm.assistantId" style="width:100%" placeholder="选择爬虫助手（推荐）" clearable @visible-change="loadCrawlerAssistants">
          <tiny-option v-for="a in crawlerAssistants" :key="a.id" :value="a.id" :label="a.name" />
        </tiny-select>
      </tiny-form-item>
      <tiny-form-item label="登录用户名">
        <tiny-input v-model="aiForm.loginUsername" placeholder="可选" />
      </tiny-form-item>
      <tiny-form-item label="登录密码">
        <tiny-input v-model="aiForm.loginPassword" type="password" placeholder="可选" />
      </tiny-form-item>
      <tiny-form-item label="浏览器连接器">
        <tiny-select
          v-model="aiForm.playwrightConnectorId"
          style="width:100%"
          placeholder="选择 Playwright/Browserless 连接器（JS动态页面必填）"
          clearable
          @visible-change="loadPlaywrightConnectors"
        >
          <tiny-option
            v-for="c in playwrightConnectors"
            :key="c.id"
            :value="c.id"
            :label="c.host ? c.name + ' (' + c.host + ')' : c.name"
          />
        </tiny-select>
      </tiny-form-item>
    </tiny-form>
    <template #footer>
      <tiny-button @click="aiWizardVisible=false">取消</tiny-button>
      <tiny-button
        type="primary"
        :disabled="!aiForm.name || !aiForm.websiteUrl || !aiForm.instructions"
        :loading="aiSaving"
        @click="saveAgentTask"
      >创建任务</tiny-button>
    </template>
  </tiny-dialog-box>

  <!-- 执行抒屉 -->
  <tiny-drawer
    :visible="executeDrawerVisible"
    title="Agent 执行监控"
    :width="'70%'"
    @update:visible="executeDrawerVisible = $event"
    @close="handleDrawerClose"
  >
    <AgentMonitor
      v-if="executeDrawerVisible"
      :embedded="true"
      :init-task-id="drawerTaskId"
      :init-task-name="drawerTaskName"
      :init-website-url="drawerWebsiteUrl"
      :init-instructions="drawerInstructions"
      :init-assistant-id="drawerAssistantId"
      :init-model-id="drawerModelId"
      :init-connector-id="drawerConnectorId"
    />
  </tiny-drawer>
  
  <!-- 编辑任务弹窗 -->
  <tiny-dialog-box v-model:visible="editDialogVisible" title="编辑任务" width="800px">
    <tiny-form :model="editForm" label-width="100px">
      <tiny-form-item label="任务名称" required>
        <tiny-input v-model="editForm.name" placeholder="请输入任务名称" />
      </tiny-form-item>
      <tiny-form-item label="目标 URL" required>
        <tiny-input v-model="editForm.websiteUrl" placeholder="https://example.com" />
      </tiny-form-item>
      <tiny-form-item label="爬取指令" required>
        <tiny-input v-model="editForm.instructions" type="textarea" :rows="8" placeholder="用自然语言描述要提取的数据" />
      </tiny-form-item>
      <tiny-form-item label="爬虫助手">
        <tiny-select v-model="editForm.assistantId" style="width:100%" placeholder="选择爬虫助手" clearable @visible-change="loadCrawlerAssistants">
          <tiny-option v-for="a in crawlerAssistants" :key="a.id" :value="a.id" :label="a.name" />
        </tiny-select>
      </tiny-form-item>
      <tiny-form-item label="登录用户名">
        <tiny-input v-model="editForm.loginUsername" placeholder="可选" />
      </tiny-form-item>
      <tiny-form-item label="登录密码">
        <tiny-input v-model="editForm.loginPassword" type="password" placeholder="可选" />
      </tiny-form-item>
      <tiny-form-item label="浏览器连接器">
        <tiny-select
          v-model="editForm.playwrightConnectorId"
          style="width:100%"
          placeholder="选择 Playwright/Browserless 连接器（JS动态页面必填）"
          clearable
          @visible-change="loadPlaywrightConnectors"
        >
          <tiny-option
            v-for="c in playwrightConnectors"
            :key="c.id"
            :value="c.id"
            :label="c.host ? c.name + ' (' + c.host + ')' : c.name"
          />
        </tiny-select>
      </tiny-form-item>
    </tiny-form>
    <template #footer>
      <tiny-button @click="editDialogVisible=false">取消</tiny-button>
      <tiny-button type="primary" :loading="editSaving" @click="saveEditTask">保存</tiny-button>
    </template>
  </tiny-dialog-box>

</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  Grid as TinyGrid,
  Modal,
  Tag as TinyTag,
  TinyButton,
  TinyForm,
  TinyFormItem,
  TinyGridColumn,
  TinyGridToolbar,
  TinyPager,
  TinySearch,
  TinySwitch,
  DialogBox as TinyDialogBox,
  Input as TinyInput,
  Select as TinySelect,
  Option as TinyOption,
  Drawer as TinyDrawer
} from '@opentiny/vue'
import { iconDel, iconEdit, iconEyeopen, iconStart } from '@opentiny/vue-icon'
import { CrawlerTaskApi } from '@/api/crawler'
import request from '@/utils/request'
import { AiAssistantApi } from '@/api/ai'
import { formatDateTime } from '@/utils/date'
import Breadcrumb from '@/components/breadcrumb/index.vue'
import AgentMonitor from './agent-monitor.vue'
import { PageUtils } from '@/utils/page'

const TinyIconStart = iconStart()
const TinyIconEyeopen = iconEyeopen()
const TinyIconEdit = iconEdit()
const TinyIconDel = iconDel()

const router = useRouter()
const loading = ref(false)
const tableHeight = ref(600)
const gridRef = ref(null)
const gridData = ref<any[]>([])
const searchForm = reactive({
  search: ''
})

const formPage = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
  align: 'right',
  layout: 'total, prev, pager, next, jumper, sizes',
  pageSizes: [10, 20, 50, 100]
})

// 加载任务列表
const loadTaskList = async () => {
  loading.value = true
  try {
    const params = {
      search: searchForm.search,
      page: formPage.page,
      pageSize: formPage.pageSize
    }
    const res = await CrawlerTaskApi.getTaskList(params)
    console.log('任务列表响应:', res) // 调试日志
    // 兼容 code 为 0 或 200
    if (res.code === 0 || res.code === 200) {
      // 兼容多种数据结构
      const pageData = res.data
      const taskList = pageData.list || pageData.data || pageData.records || []
      const totalCount = pageData.total || 0
      
      gridData.value = taskList.map((item: any) => ({
        ...item,
        createTime: formatDateTime(item.createTime),
        lastExecutionTime: item.lastExecutionTime ? formatDateTime(item.lastExecutionTime) : '-'
      }))
      formPage.total = totalCount
      
      console.log('解析后的任务数据:', gridData.value) // 调试日志
    }
  } catch (error) {
    console.error('加载任务列表失败:', error)
    Modal.message({
      message: '加载任务列表失败',
      status: 'error'
    })
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  formPage.page = 1
  loadTaskList()
}

// 刷新
const handleRefresh = () => {
  searchForm.search = ''
  formPage.page = 1
  loadTaskList()
}

// 切换启用状态
const handleToggle = async (row: any) => {
  try {
    await CrawlerTaskApi.toggleTask(row.id, row.enabled)
    Modal.message({
      message: row.enabled ? '任务已启用' : '任务已禁用',
      status: 'success'
    })
    loadTaskList()
  } catch (error) {
    console.error('切换任务状态失败:', error)
    Modal.message({
      message: '操作失败',
      status: 'error'
    })
    row.enabled = !row.enabled
  }
}

// 执行Drawer状态
const executeDrawerVisible = ref(false)
const drawerTaskId = ref<string | undefined>(undefined)
const drawerTaskName = ref('')
const drawerWebsiteUrl = ref('')
const drawerInstructions = ref('')
const drawerModelId = ref('')
const drawerAssistantId = ref('')
const drawerConnectorId = ref('')

// 编辑弹窗状态
const editDialogVisible = ref(false)
const editSaving = ref(false)
const editForm = reactive({
  id: '',
  name: '',
  websiteUrl: '',
  instructions: '',
  assistantId: '',
  modelId: '',
  loginUsername: '',
  loginPassword: '',
  playwrightConnectorId: ''
})

// 打开执行Drawer
const handleExecute = (row: any) => {
  drawerTaskId.value = row.id
  drawerTaskName.value = row.name || ''
  drawerWebsiteUrl.value = row.websiteUrl || row.targetUrl || ''
  drawerInstructions.value = row.instructions || ''
  drawerAssistantId.value = row.assistantId || ''
  drawerModelId.value = row.modelId || ''
  drawerConnectorId.value = row.playwrightConnectorId || ''
  executeDrawerVisible.value = true
}

const handleDrawerClose = () => {
  executeDrawerVisible.value = false
}

// 打开编辑弹窗
const handleEdit = async (row: any) => {
  editDialogVisible.value = true
  editSaving.value = false
  // 预加载模型和连接器列表，确保回显时 select 有选项匹配
  await Promise.all([loadCrawlerAssistants(), loadPlaywrightConnectors()])
  // 从接口获取最新详情，保证字段完整回显
  try {
    const res: any = await CrawlerTaskApi.getTaskById(row.id)
    const task = (res.code === 0 || res.code === 200) ? res.data : row
    Object.assign(editForm, {
      id: task.id,
      name: task.name || '',
      websiteUrl: task.websiteUrl || task.targetUrl || '',
      instructions: task.instructions || '',
      assistantId: task.assistantId || '',
      modelId: task.modelId || '',
      loginUsername: task.loginUsername || '',
      loginPassword: task.loginPassword || '',
      playwrightConnectorId: task.playwrightConnectorId || ''
    })
  } catch {
    Object.assign(editForm, {
      id: row.id,
      name: row.name || '',
      websiteUrl: row.websiteUrl || row.targetUrl || '',
      instructions: row.instructions || '',
      assistantId: row.assistantId || '',
      modelId: row.modelId || '',
      loginUsername: row.loginUsername || '',
      loginPassword: row.loginPassword || '',
      playwrightConnectorId: row.playwrightConnectorId || ''
    })
  }
}

// 保存编辑
const saveEditTask = async () => {
  if (!editForm.name) return
  editSaving.value = true
  try {
    await CrawlerTaskApi.updateTask({
      id: editForm.id,
      name: editForm.name,
      websiteUrl: editForm.websiteUrl,
      targetUrl: editForm.websiteUrl,
      instructions: editForm.instructions,
      assistantId: editForm.assistantId || undefined,
      modelId: editForm.modelId || undefined,
      loginUsername: editForm.loginUsername || undefined,
      loginPassword: editForm.loginPassword || undefined,
      playwrightConnectorId: editForm.playwrightConnectorId || undefined
    })
    Modal.message({ message: '保存成功', status: 'success' })
    editDialogVisible.value = false
    loadTaskList()
  } catch {
    Modal.message({ message: '保存失败', status: 'error' })
  } finally {
    editSaving.value = false
  }
}

// 删除操作
const handleDelete = (row: any) => {
  deleteTask(row)
}

// 删除任务
const deleteTask = (row: any) => {
  Modal.confirm({
    message: `确定要删除任务"${row.name}"吗？`,
    status: 'warning'
  }).then(async () => {
    try {
      await CrawlerTaskApi.deleteTask(row.id)
      Modal.message({
        message: '删除成功',
        status: 'success'
      })
      loadTaskList()
    } catch (error) {
      console.error('删除任务失败:', error)
      Modal.message({
        message: '删除失败',
        status: 'error'
      })
    }
  })
}

// 分页切换
const pageChange = (page: number) => {
  formPage.page = page
  loadTaskList()
}

const limitChange = (limit: number) => {
  formPage.pageSize = limit
  formPage.page = 1
  loadTaskList()
}

onMounted(() => {
  loadTaskList()
  tableHeight.value = PageUtils.setTableHeight(null)
})

// ==================== AI Agent 创建任务 ====================
const aiWizardVisible = ref(false)
const aiSaving = ref(false)
const crawlerAssistants = ref<any[]>([])
const aiForm = reactive({
  name: '',
  websiteUrl: '',
  instructions: '',
  assistantId: '',
  loginUsername: '',
  loginPassword: '',
  playwrightConnectorId: ''
})

const openAiWizard = () => {
  resetAiWizard()
  aiWizardVisible.value = true
}

const resetAiWizard = () => {
  aiSaving.value = false
  Object.assign(aiForm, { name: '', websiteUrl: '', instructions: '', assistantId: '', loginUsername: '', loginPassword: '', playwrightConnectorId: '' })
}

const playwrightConnectors = ref<any[]>([])

const loadPlaywrightConnectors = async () => {
  if (playwrightConnectors.value.length > 0) return
  try {
    const res: any = await request({ url: '/api/connector/list', method: 'post', data: { page: 1, pageSize: 100 } })
    const list = res.data?.list || res.data?.data || []
    playwrightConnectors.value = list.filter((c: any) => {
      const product = (c.product || '').toLowerCase()
      return product === 'playwright' || product === 'browser'
    })
  } catch (e) {
    console.error('加载连接器失败', e)
  }
}

const loadCrawlerAssistants = async () => {
  if (crawlerAssistants.value.length > 0) return
  try {
    const res: any = await AiAssistantApi.list()
    // 过滤爬虫类型助手，如果没有类型区分则展示全部
    const list = res.data || []
    crawlerAssistants.value = list.filter((a: any) =>
      !a.assistantType || a.assistantType === 'CRAWLER' || a.assistantType === 'crawler'
    ).length > 0
      ? list.filter((a: any) => !a.assistantType || a.assistantType === 'CRAWLER' || a.assistantType === 'crawler')
      : list
  } catch (e) {
    console.error('加载助手列表失败', e)
  }
}

// 保存 Agent 任务并调转到执行监控页
const saveAgentTask = async () => {
  if (!aiForm.name || !aiForm.websiteUrl || !aiForm.instructions) return
  aiSaving.value = true
  try {
    const res: any = await CrawlerTaskApi.createTask({
      name: aiForm.name,
      websiteUrl: aiForm.websiteUrl,
      targetUrl: aiForm.websiteUrl,
      instructions: aiForm.instructions,
      assistantId: aiForm.assistantId || undefined,
      loginUsername: aiForm.loginUsername || undefined,
      loginPassword: aiForm.loginPassword || undefined,
      playwrightConnectorId: aiForm.playwrightConnectorId || undefined,
      taskType: 'MANUAL',
      taskMode: 'AGENT',
      status: 'READY'
    })
    if (res.code === 0 || res.code === 200) {
      aiWizardVisible.value = false
      Modal.message({ message: '任务创建成功，点击列表中的“执行”按鈕开始运行', status: 'success' })
      await loadTaskList()
    } else {
      Modal.message({ message: res.msg || '创建失败', status: 'error' })
    }
  } catch {
    Modal.message({ message: '创建失败', status: 'error' })
  } finally {
    aiSaving.value = false
  }
}
</script>

<style scoped lang="scss">
.crawler-task-container {
  height: 100%;
  display: flex;
  flex-direction: column;

  .contain {
    flex: 1;
    padding: 16px;
    background: #fff;
    display: flex;
    flex-direction: column;

    :deep(.tiny-grid) {
      flex: 1;
    }

    :deep(.tiny-pager) {
      margin-top: 16px;
    }
  }
}
</style>
