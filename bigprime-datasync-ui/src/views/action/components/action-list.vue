<template>
  <div class="container-list">
    <div class="breadcrumb-area">
      <Breadcrumb :items="['系统管理', 'Action管理']"/>
    </div>
    <div ref="contain" class="contain">
      <!-- 主表格区域 -->
      <tiny-grid
          v-if="!showSubPage"
          ref="gridRef"
          :data="tableData"
          :height="tableHeight"
          :loading="loading"
          :stripe="true"
          border
          highlight-hover-row
          show-header-overflow="tooltip"
          show-overflow="tooltip"
          size="small"
      >
        <!-- 工具栏 -->
        <template #toolbar>
          <tiny-grid-toolbar class="grid-toolbar" full-screen setting size="small">
            <template #buttons>
              <tiny-form :model="searchForm" inline>
                <tiny-form-item>
                  <tiny-search
                      v-model="searchForm.search"
                      clearable
                      is-enter-search
                      placeholder="请输入关键词"
                      style="width: 300px"
                      @clear="handleReset"
                      @search="handleSearch"
                  ></tiny-search>
                </tiny-form-item>
                <tiny-form-item>
                  <tiny-button type="primary" @click="openForm()">创建</tiny-button>
                  <tiny-button @click="scanAction()">扫描</tiny-button>
                </tiny-form-item>
              </tiny-form>
            </template>
          </tiny-grid-toolbar>
        </template>

        <!-- 表格列 - 严格对应 ActionEntity 字段 -->
        <tiny-grid-column type="index" width="50"></tiny-grid-column>

        <tiny-grid-column :title="$t('action.namespace')" field="namespace" width="180"></tiny-grid-column>

        <tiny-grid-column
            :title="$t('action.code')"
            field="code"
            sortable
        ></tiny-grid-column>

        <tiny-grid-column :title="$t('action.name')" field="name" sortable ></tiny-grid-column>

        <tiny-grid-column
            :title="$t('action.fstCategory')"
            field="fstCategory"
            width="100"
        ></tiny-grid-column>

        <tiny-grid-column
            :title="$t('action.sndCategory')"
            field="sndCategory"
            width="100"
        ></tiny-grid-column>

        <tiny-grid-column
            :title="$t('action.trdCategory')"
            field="trdCategory"
            width="100"
        ></tiny-grid-column>

        <tiny-grid-column
            :title="$t('action.version')"
            field="version"
            width="90"
        ></tiny-grid-column>

        <tiny-grid-column :title="$t('action.status')" field="status" width="100">
          <template #default="data">
            <tiny-tag :type="data.row.status === 1 || data.row.status === '1' ? 'success' : 'danger'">
              {{ formatStatus(data.row.status) }}
            </tiny-tag>
          </template>
        </tiny-grid-column>

<!--
        <tiny-grid-column
            :title="$t('action.clazz')"
            field="clazz"
        ></tiny-grid-column>
-->

        <tiny-grid-column
            :title="$t('action.updateTime')"
            field="v_updateTime"
            sortable
            width="170"
        ></tiny-grid-column>

        <!-- 操作列 -->
        <tiny-grid-column :title="$t('common.operations')" align="center" width="100">
          <template v-slot="data">
            <div style="display: flex; gap: 10px; justify-content: center; align-items: center;">
              <div :title="$t('common.operations.edit')">
                <tiny-icon-edit
                  @click="handleEdit(data.row)"
                  style="font-size: 20px; cursor: pointer; fill: #52c41a; color: #52c41a;"
                />
              </div>
              <div :title="$t('common.operations.delete')">
                <tiny-icon-del
                  @click="handleDelete(data.row)"
                  style="font-size: 20px; cursor: pointer; fill: #f56c6c; color: #f56c6c;"
                />
              </div>
            </div>
          </template>
        </tiny-grid-column>
      </tiny-grid>

      <!-- 分页组件 -->
      <tiny-pager
          v-if="!showSubPage"
          :align="formPage.align"
          :current-page="formPage.page"
          :layout="formPage.layout"
          :page-size="formPage.limit"
          :page-sizes="formPage.pageSizes"
          :total="formPage.total"
          @current-change="pageChange"
          @size-change="limitChange"
      ></tiny-pager>

      <div>
        <div v-if="showSubPage">
          <component :is="subComponent" :currentRow="currentRow" @back="handleBack"></component>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {defineAsyncComponent, onMounted, ref, toRaw} from 'vue'
import {Button as TinyButton, Form as TinyForm, FormItem as TinyFormItem, Grid as TinyGrid, GridColumn as TinyGridColumn, GridToolbar as TinyGridToolbar, Modal, Pager as TinyPager, Tag as TinyTag, TinySearch} from '@opentiny/vue'

import {ActionService} from '@/services/action'
import emitter from '@/utils/evnetbus'
import {PageUtils} from '@/utils/page'
import {formPage} from '@/utils/tool'
import {iconDel, iconEdit} from '@opentiny/vue-icon'
import {formatDateTime} from '@/utils/date'

const TinyIconEdit = iconEdit()
const TinyIconDel = iconDel()

const subComponent = defineAsyncComponent(() => import('@/views/action/components/action-form.vue'))
const showSubPage = ref(false)
const currentRow = ref()

// 表格数据
const tableData = ref([])
const loading = ref(false)
const contain = ref(null)
const tableHeight = ref(500)

// 搜索条件
const searchForm = ref({
  search: ''
})

// 初始化
onMounted(() => {
  loadData()
  tableHeight.value = PageUtils.setTableHeight(null)
})

// 编辑操作
const handleEdit = (row: any) => {
  currentRow.value = toRaw(row)
  showSubPage.value = true
}

// 删除操作
const handleDelete = (row: any) => {
  const name = row.name
  const id = row.id
  Modal.confirm({
    title: '删除确认',
    message: '确定要删除' + '[' + name + ']吗？',
    showHeader: true,
    showFooter: true,
    resize: true,
    events: {
      confirm() {
        ActionService.deleteAction(id).then((response: any) => {
          if (response.msg === 'success') {
            Modal.message({status: 'success', message: '删除成功!', top: 20})
            handleSearch()
          } else {
            Modal.message({status: 'error', message: response.msg, top: 20})
          }
        })
      }
    }
  })
}

// 状态格式化
const formatStatus = (status) => {
  return status === 1 ? '启用' : '禁用'
}

const formatTimestamp = (creationTimestamp: any) => {
  if (creationTimestamp) {
    const date = new Date(creationTimestamp)
    return formatDateTime(date)
  }
  return creationTimestamp
}

// 获取Action列表
const loadData = async () => {
  try {
    loading.value = true
    const params = {
      ...searchForm.value,
      page: formPage.value.page,
      pageSize: formPage.value.limit
    }

    const res = await ActionService.getActionList(params)
    if (res.msg === 'success') {
      res.data.list.forEach((item: any) => {
        item.v_registerTime = formatTimestamp(item.registerTime)
        item.v_updateTime = formatTimestamp(item.updateTime)
      })
      tableData.value = res.data.list
      formPage.value.total = res.data.total
    }
  } catch (error) {
    console.error('获取Action列表失败:', error)
    Modal.message({message: '获取数据失败', status: 'error'})
  } finally {
    loading.value = false
  }
}

const openForm = () => {
  currentRow.value = null
  showSubPage.value = true
}

const scanAction = async () =>{
  try {
    loading.value = true;
    const resp = await ActionService.scanAction()
    if(resp.msg === 'success'){
      await loadData();
    }
  } catch (error) {
    console.error('扫描失败:', error)
  } finally {
    loading.value = false
  }
}

const pageChange = (page: number) => {
  formPage.value.page = page
  loadData()
}

const limitChange = (limit: number) => {
  formPage.value.limit = limit
  loadData()
}

// 搜索
const handleSearch = async () => {
  formPage.value.page = 1
  await loadData()
}

// 重置
const handleReset = () => {
  searchForm.value = {
    search: ''
  }
  handleSearch()
}

const handleBack = () => {
  showSubPage.value = false
}
emitter.on('handleBack', handleBack)

const handleActionList = async () => {
  showSubPage.value = false
  await loadData()
}
emitter.on('handleActionList', handleActionList)
</script>

<style lang="less" scoped>
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
