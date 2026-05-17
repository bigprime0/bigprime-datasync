<template>
  <div class="container-list">
    <Breadcrumb :items="['爬虫管理', '代理管理']" />
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
                    placeholder="请输入代理名称或地址"
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
                    <tiny-option label="测试中" value="TESTING"></tiny-option>
                  </tiny-select>
                </tiny-form-item>
                <tiny-form-item>
                  <tiny-button size="small" type="primary" @click="handleCreate"
                    >新增代理</tiny-button
                  >
                  <tiny-button size="small" @click="handleRefresh">刷新</tiny-button>
                </tiny-form-item>
              </tiny-form>
            </template>
          </tiny-grid-toolbar>
        </template>

        <tiny-grid-column fixed="left" type="index" width="50"></tiny-grid-column>

        <tiny-grid-column title="代理名称" field="name" fixed="left" width="150"></tiny-grid-column>

        <tiny-grid-column title="代理地址" field="host" width="150"></tiny-grid-column>

        <tiny-grid-column title="端口" field="port" align="center" width="80"></tiny-grid-column>

        <tiny-grid-column title="代理类型" field="proxyType" align="center" width="100">
          <template #default="{ row }">
            <tiny-tag v-if="row.proxyType === 'HTTP'" type="info">HTTP</tiny-tag>
            <tiny-tag v-else-if="row.proxyType === 'HTTPS'" type="success">HTTPS</tiny-tag>
            <tiny-tag v-else-if="row.proxyType === 'SOCKS4'" type="warning">SOCKS4</tiny-tag>
            <tiny-tag v-else-if="row.proxyType === 'SOCKS5'" type="danger">SOCKS5</tiny-tag>
            <tiny-tag v-else>未知</tiny-tag>
          </template>
        </tiny-grid-column>

        <tiny-grid-column title="状态" field="status" align="center" width="90">
          <template #default="{ row }">
            <tiny-tag v-if="row.status === 'ACTIVE'" type="success">活跃</tiny-tag>
            <tiny-tag v-else-if="row.status === 'INACTIVE'" type="danger">失效</tiny-tag>
            <tiny-tag v-else-if="row.status === 'TESTING'" type="warning">测试中</tiny-tag>
            <tiny-tag v-else type="info">未知</tiny-tag>
          </template>
        </tiny-grid-column>

        <tiny-grid-column title="响应时间(ms)" field="responseTime" align="center" width="120"></tiny-grid-column>

        <tiny-grid-column title="成功/失败次数" align="center" width="150">
          <template #default="{ row }">
            <span style="color: #5cb87a">{{ row.successCount || 0 }}</span> /
            <span style="color: #f56c6c">{{ row.failureCount || 0 }}</span>
          </template>
        </tiny-grid-column>

        <tiny-grid-column title="最后检测" field="lastCheckTime" align="center" width="160"></tiny-grid-column>

        <tiny-grid-column title="创建时间" field="createTime" align="center" width="160"></tiny-grid-column>

        <tiny-grid-column title="操作" align="center" fixed="right" width="120">
          <template #default="{ row }">
            <div style="display: flex; gap: 10px; justify-content: center; align-items: center;">
              <div title="测试连接">
                <tiny-icon-setting
                  @click="handleTest(row)"
                  style="font-size: 20px; cursor: pointer; fill: #722ed1; color: #722ed1;"
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

    <!-- 代理编辑对话框 -->
    <tiny-dialog-box
      v-model:visible="showDialog"
      :title="isEdit ? '编辑代理' : '新增代理'"
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
        <tiny-form-item label="代理名称" prop="name">
          <tiny-input v-model="formData.name" placeholder="请输入代理名称"></tiny-input>
        </tiny-form-item>

        <tiny-form-item label="代理地址" prop="host">
          <tiny-input v-model="formData.host" placeholder="请输入代理IP或域名"></tiny-input>
        </tiny-form-item>

        <tiny-form-item label="端口" prop="port">
          <tiny-input v-model="formData.port" type="number" :min="1" :max="65535" placeholder="请输入端口"></tiny-input>
        </tiny-form-item>

        <tiny-form-item label="代理类型" prop="proxyType">
          <tiny-select v-model="formData.proxyType" placeholder="请选择代理类型">
            <tiny-option label="HTTP" value="HTTP"></tiny-option>
            <tiny-option label="HTTPS" value="HTTPS"></tiny-option>
            <tiny-option label="SOCKS4" value="SOCKS4"></tiny-option>
            <tiny-option label="SOCKS5" value="SOCKS5"></tiny-option>
          </tiny-select>
        </tiny-form-item>

        <tiny-form-item label="用户名" prop="username">
          <tiny-input v-model="formData.username" placeholder="如需认证请输入用户名"></tiny-input>
        </tiny-form-item>

        <tiny-form-item label="密码" prop="password">
          <tiny-input
            v-model="formData.password"
            type="password"
            placeholder="如需认证请输入密码"
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
import { iconDel, iconEdit, iconSetting } from '@opentiny/vue-icon'
import { CrawlerProxyApi } from '@/api/crawler'
import { formatDateTime } from '@/utils/date'
import Breadcrumb from '@/components/breadcrumb/index.vue'
import { PageUtils } from '@/utils/page'

const TinyIconSetting = iconSetting()
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
  host: '',
  port: 8080,
  proxyType: 'HTTP',
  username: '',
  password: '',
  status: 'ACTIVE'
})

const formRules = {
  name: [{ required: true, message: '请输入代理名称', trigger: 'blur' }],
  host: [{ required: true, message: '请输入代理地址', trigger: 'blur' }],
  port: [{ required: true, message: '请输入端口', trigger: 'blur' }],
  proxyType: [{ required: true, message: '请选择代理类型', trigger: 'change' }]
}

// 加载代理列表
const loadProxyList = async () => {
  loading.value = true
  try {
    const params = {
      search: searchForm.search,
      status: searchForm.status,
      page: formPage.page,
      pageSize: formPage.pageSize
    }
    const res = await CrawlerProxyApi.getProxyList(params)
    
    if (res.code === 0) {
      const pageData = res.data
      const proxyList = pageData.list || pageData.data || pageData.records || []
      const totalCount = pageData.total || 0

      gridData.value = proxyList.map((item: any) => ({
        ...item,
        createTime: formatDateTime(item.createTime),
        lastCheckTime: item.lastCheckTime ? formatDateTime(item.lastCheckTime) : '-'
      }))
      formPage.total = totalCount
    }
  } catch (error) {
    console.error('加载代理列表失败:', error)
    Modal.message({
      message: '加载代理列表失败',
      status: 'error'
    })
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  formPage.page = 1
  loadProxyList()
}

// 刷新
const handleRefresh = () => {
  searchForm.search = ''
  searchForm.status = ''
  formPage.page = 1
  loadProxyList()
}

// 创建代理
const handleCreate = () => {
  isEdit.value = false
  Object.assign(formData, {
    id: '',
    name: '',
    host: '',
    port: 8080,
    proxyType: 'HTTP',
    username: '',
    password: '',
    status: 'ACTIVE'
  })
  showDialog.value = true
}

// 测试操作
const handleTest = (row: any) => {
  testProxy(row)
}

// 编辑操作
const handleEdit = (row: any) => {
  editProxy(row)
}

// 删除操作
const handleDelete = (row: any) => {
  deleteProxy(row)
}

// 测试代理
const testProxy = async (row: any) => {
  try {
    const res = await CrawlerProxyApi.testProxy(row.id)
    if (res.code === 0) {
      Modal.message({
        message: '代理测试成功！',
        status: 'success'
      })
      loadProxyList()
    } else {
      Modal.message({
        message: res.msg || '代理测试失败',
        status: 'error'
      })
    }
  } catch (error) {
    console.error('测试代理失败:', error)
    Modal.message({
      message: '测试代理失败',
      status: 'error'
    })
  }
}

// 编辑代理
const editProxy = (row: any) => {
  isEdit.value = true
  Object.assign(formData, row)
  showDialog.value = true
}

// 删除代理
const deleteProxy = (row: any) => {
  Modal.confirm({
    title: '删除确认',
    message: `确定要删除代理 "${row.name}" 吗？`,
    showHeader: true,
    showFooter: true,
    events: {
      confirm: async () => {
        try {
          const res = await CrawlerProxyApi.deleteProxy(row.id)
          if (res.code === 0) {
            Modal.message({
              message: '删除成功',
              status: 'success'
            })
            loadProxyList()
          }
        } catch (error) {
          console.error('删除代理失败:', error)
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
        const api = isEdit.value ? CrawlerProxyApi.updateProxy : CrawlerProxyApi.createProxy
        const res = await api(formData)
        if (res.code === 0) {
          Modal.message({
            message: isEdit.value ? '更新成功' : '创建成功',
            status: 'success'
          })
          handleDialogClose()
          loadProxyList()
        }
      } catch (error) {
        console.error('保存代理失败:', error)
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
  loadProxyList()
}

const limitChange = (pageSize: number) => {
  formPage.pageSize = pageSize
  formPage.page = 1
  loadProxyList()
}

onMounted(() => {
  tableHeight.value = PageUtils.setTableHeight(null)
  loadProxyList()
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
