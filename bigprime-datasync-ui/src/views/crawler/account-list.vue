<template>
  <div class="container-list">
    <Breadcrumb :items="['爬虫管理', '账号管理']" />
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
                    placeholder="请输入账号名称或平台"
                    style="width: 300px"
                    @search="handleSearch"
                  ></tiny-search>
                </tiny-form-item>
                <tiny-form-item>
                  <tiny-select
                    v-model="searchForm.status"
                    clearable
                    placeholder="选择状态"
                    @change="handleSearch"
                  >
                    <tiny-option label="全部" value=""></tiny-option>
                    <tiny-option label="活跃" value="ACTIVE"></tiny-option>
                    <tiny-option label="失效" value="INACTIVE"></tiny-option>
                    <tiny-option label="冷却中" value="COOLING"></tiny-option>
                    <tiny-option label="已封禁" value="BANNED"></tiny-option>
                  </tiny-select>
                </tiny-form-item>
                <tiny-form-item>
                  <tiny-button size="small" type="primary" @click="handleCreate"
                    >新增账号</tiny-button
                  >
                  <tiny-button size="small" @click="handleRefresh">刷新</tiny-button>
                </tiny-form-item>
              </tiny-form>
            </template>
          </tiny-grid-toolbar>
        </template>

        <tiny-grid-column fixed="left" type="index" width="50"></tiny-grid-column>

        <tiny-grid-column title="账号名称" field="name" fixed="left" width="150"></tiny-grid-column>

        <tiny-grid-column title="平台" field="platform" width="120"></tiny-grid-column>

        <tiny-grid-column title="用户名" field="username" width="150"></tiny-grid-column>

        <tiny-grid-column title="状态" field="status" align="center" width="90">
          <template #default="{ row }">
            <tiny-tag v-if="row.status === 'ACTIVE'" type="success">活跃</tiny-tag>
            <tiny-tag v-else-if="row.status === 'INACTIVE'" type="info">失效</tiny-tag>
            <tiny-tag v-else-if="row.status === 'COOLING'" type="warning">冷却中</tiny-tag>
            <tiny-tag v-else-if="row.status === 'BANNED'" type="danger">已封禁</tiny-tag>
            <tiny-tag v-else>未知</tiny-tag>
          </template>
        </tiny-grid-column>

        <tiny-grid-column title="优先级" field="priority" align="center" width="80"></tiny-grid-column>

        <tiny-grid-column title="使用次数" field="usageCount" align="center" width="100"></tiny-grid-column>

        <tiny-grid-column title="成功/失败次数" align="center" width="150">
          <template #default="{ row }">
            <span style="color: #5cb87a">{{ row.successCount || 0 }}</span> /
            <span style="color: #f56c6c">{{ row.failureCount || 0 }}</span>
          </template>
        </tiny-grid-column>

        <tiny-grid-column title="最后使用" field="lastUsedTime" align="center" width="160"></tiny-grid-column>

        <tiny-grid-column title="冷却结束" field="coolingEndTime" align="center" width="160"></tiny-grid-column>

        <tiny-grid-column title="创建时间" field="createTime" align="center" width="160"></tiny-grid-column>

        <tiny-grid-column title="操作" align="center" fixed="right" width="100">
          <template #default="{ row }">
            <div style="display: flex; gap: 10px; justify-content: center; align-items: center;">
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

    <!-- 账号编辑对话框 -->
    <tiny-dialog-box
      v-model:visible="showDialog"
      :title="isEdit ? '编辑账号' : '新增账号'"
      width="600px"
      @close="handleDialogClose"
    >
      <tiny-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
        label-position="left"
      >
        <tiny-form-item label="账号名称" prop="name">
          <tiny-input v-model="formData.name" placeholder="请输入账号名称"></tiny-input>
        </tiny-form-item>

        <tiny-form-item label="平台" prop="platform">
          <tiny-input v-model="formData.platform" placeholder="请输入平台名称，如：淘宝、京东"></tiny-input>
        </tiny-form-item>

        <tiny-form-item label="用户名" prop="username">
          <tiny-input v-model="formData.username" placeholder="请输入登录用户名"></tiny-input>
        </tiny-form-item>

        <tiny-form-item label="密码" prop="password">
          <tiny-input
            v-model="formData.password"
            type="password"
            placeholder="请输入登录密码"
          ></tiny-input>
        </tiny-form-item>

        <tiny-form-item label="优先级" prop="priority">
          <tiny-input v-model="formData.priority" type="number" :min="1" :max="100" placeholder="请输入优先级"></tiny-input>
          <span style="margin-left: 10px; color: #999; font-size: 12px">数值越大优先级越高</span>
        </tiny-form-item>

        <tiny-form-item label="Cookie" prop="cookie">
          <tiny-input
            v-model="formData.cookie"
            type="textarea"
            :rows="3"
            placeholder="可选，输入Cookie字符串"
          ></tiny-input>
        </tiny-form-item>

        <tiny-form-item label="额外信息" prop="extraData">
          <tiny-input
            v-model="formData.extraData"
            type="textarea"
            :rows="3"
            placeholder="可选，JSON格式的额外信息"
          ></tiny-input>
        </tiny-form-item>
      </tiny-form>

      <template #footer>
        <tiny-button @click="handleDialogClose">取消</tiny-button>
        <tiny-button type="primary" @click="handleSubmit">确定</tiny-button>
      </template>
    </tiny-dialog-box>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import {
  Grid as TinyGrid,
  Modal,
  Tag as TinyTag,
  TinyActionMenu,
  TinyButton,
  TinyDialogBox,
  TinyForm,
  TinyFormItem,
  TinyGridColumn,
  TinyGridToolbar,
  TinyInput,
  TinyOption,
  TinyPager,
  TinySearch,
  TinySelect
} from '@opentiny/vue'
import { iconDel, iconEdit } from '@opentiny/vue-icon'
import { CrawlerAccountApi } from '@/api/crawler'
import { formatDateTime } from '@/utils/date'
import Breadcrumb from '@/components/breadcrumb/index.vue'
import { PageUtils } from '@/utils/page'

const TinyIconEdit = iconEdit()
const TinyIconDel = iconDel()

const loading = ref(false)
const tableHeight = ref(600)
const gridRef = ref(null)
const gridData = ref<any[]>([])
const showDialog = ref(false)
const isEdit = ref(false)
const formRef = ref(null)

const searchForm = reactive({
  search: '',
  status: ''
})

const formPage = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
  align: 'right',
  layout: 'total, prev, pager, next, jumper, sizes',
  pageSizes: [10, 20, 50, 100]
})

const formData = reactive({
  id: '',
  name: '',
  platform: '',
  username: '',
  password: '',
  priority: 50,
  cookie: '',
  extraData: '',
  status: 'ACTIVE'
})

const formRules = {
  name: [{ required: true, message: '请输入账号名称', trigger: 'blur' }],
  platform: [{ required: true, message: '请输入平台名称', trigger: 'blur' }],
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

// 加载账号列表
const loadAccountList = async () => {
  loading.value = true
  try {
    const params = {
      search: searchForm.search,
      status: searchForm.status,
      page: formPage.page,
      pageSize: formPage.pageSize
    }
    const res = await CrawlerAccountApi.getAccountList(params)
    
    if (res.code === 0) {
      const pageData = res.data
      const accountList = pageData.list || pageData.data || pageData.records || []
      const totalCount = pageData.total || 0

      gridData.value = accountList.map((item: any) => ({
        ...item,
        createTime: formatDateTime(item.createTime),
        lastUsedTime: item.lastUsedTime ? formatDateTime(item.lastUsedTime) : '-',
        coolingEndTime: item.coolingEndTime ? formatDateTime(item.coolingEndTime) : '-'
      }))
      formPage.total = totalCount
    }
  } catch (error) {
    console.error('加载账号列表失败:', error)
    Modal.message({
      message: '加载账号列表失败',
      status: 'error'
    })
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  formPage.page = 1
  loadAccountList()
}

// 刷新
const handleRefresh = () => {
  searchForm.search = ''
  searchForm.status = ''
  formPage.page = 1
  loadAccountList()
}

// 创建账号
const handleCreate = () => {
  isEdit.value = false
  Object.assign(formData, {
    id: '',
    name: '',
    platform: '',
    username: '',
    password: '',
    priority: 50,
    cookie: '',
    extraData: '',
    status: 'ACTIVE'
  })
  showDialog.value = true
}

// 编辑操作
const handleEdit = (row: any) => {
  editAccount(row)
}

// 删除操作
const handleDelete = (row: any) => {
  deleteAccount(row)
}

// 编辑账号
const editAccount = (row: any) => {
  isEdit.value = true
  Object.assign(formData, row)
  showDialog.value = true
}

// 删除账号
const deleteAccount = (row: any) => {
  Modal.confirm({
    title: '删除确认',
    message: `确定要删除账号 "${row.name}" 吗？`,
    showHeader: true,
    showFooter: true,
    events: {
      confirm: async () => {
        try {
          const res = await CrawlerAccountApi.deleteAccount(row.id)
          if (res.code === 0) {
            Modal.message({
              message: '删除成功',
              status: 'success'
            })
            loadAccountList()
          }
        } catch (error) {
          console.error('删除账号失败:', error)
          Modal.message({
            message: '删除失败',
            status: 'error'
          })
        }
      }
    }
  })
}

// 提交表单
const handleSubmit = async () => {
  ;(formRef.value as any).validate(async (valid: boolean) => {
    if (valid) {
      try {
        const api = isEdit.value ? CrawlerAccountApi.updateAccount : CrawlerAccountApi.createAccount
        const res = await api(formData)
        if (res.code === 0) {
          Modal.message({
            message: isEdit.value ? '更新成功' : '创建成功',
            status: 'success'
          })
          handleDialogClose()
          loadAccountList()
        }
      } catch (error) {
        console.error('保存账号失败:', error)
        Modal.message({
          message: '保存失败',
          status: 'error'
        })
      }
    }
  })
}

// 关闭对话框
const handleDialogClose = () => {
  showDialog.value = false
  ;(formRef.value as any)?.resetFields()
}

// 分页改变
const pageChange = (page: number) => {
  formPage.page = page
  loadAccountList()
}

const limitChange = (pageSize: number) => {
  formPage.pageSize = pageSize
  formPage.page = 1
  loadAccountList()
}

onMounted(() => {
  tableHeight.value = PageUtils.setTableHeight(null)
  loadAccountList()
})
</script>

<style scoped>
.container-list {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.contain {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>
