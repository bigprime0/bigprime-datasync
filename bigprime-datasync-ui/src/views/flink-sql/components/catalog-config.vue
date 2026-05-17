<template>
  <div class="catalog-config-panel">
    <div class="toolbar">
      <tiny-button type="primary" size="small" @click="showCreateDialog">
        新建Catalog
      </tiny-button>
    </div>

    <tiny-grid
      :data="catalogList"
      border
      size="small"
      height="600"
      auto-resize
    >
      <tiny-grid-column field="catalogName" title="Catalog名称" />
      <tiny-grid-column field="catalogType" title="类型" width="120" />
      <tiny-grid-column field="isDefault" title="默认" width="80">
        <template #default="{ row }">
          <tiny-tag :type="row.isDefault ? 'success' : 'info'">
            {{ row.isDefault ? '是' : '否' }}
          </tiny-tag>
        </template>
      </tiny-grid-column>
      <tiny-grid-column field="status" title="状态" width="100">
        <template #default="{ row }">
          <tiny-tag :type="row.status === 'ACTIVE' ? 'success' : 'danger'">
            {{ row.status }}
          </tiny-tag>
        </template>
      </tiny-grid-column>
      <tiny-grid-column field="createTime" title="创建时间" width="180" />
      <tiny-grid-column title="操作" width="180">
        <template #default="{ row }">
          <div style="display: flex; gap: 10px; justify-content: center; align-items: center;">
            <div title="测试">
              <tiny-icon-link
                @click="testConnection(row)"
                style="font-size: 20px; cursor: pointer; fill: #722ed1; color: #722ed1;"
              />
            </div>
            <div title="删除">
              <tiny-icon-del
                @click="deleteCatalog(row)"
                style="font-size: 20px; cursor: pointer; fill: #f56c6c; color: #f56c6c;"
              />
            </div>
          </div>
        </template>
      </tiny-grid-column>
    </tiny-grid>

    <!-- 创建Catalog对话框 -->
    <tiny-dialog-box
      :visible="createDialogVisible"
      title="创建Flink Catalog"
      width="600px"
      @update:visible="createDialogVisible = $event"
    >
      <tiny-form :model="form" label-width="120px">
        <tiny-form-item label="Catalog名称">
          <tiny-input v-model="form.catalogName" placeholder="请输入Catalog名称" />
        </tiny-form-item>

        <tiny-form-item label="Catalog类型">
          <tiny-select v-model="form.catalogType" placeholder="请选择类型">
            <tiny-option label="JDBC" value="jdbc" />
            <tiny-option label="Hive" value="hive" />
            <tiny-option label="Paimon" value="paimon" />
            <tiny-option label="Iceberg" value="iceberg" />
            <tiny-option label="Generic" value="generic" />
          </tiny-select>
        </tiny-form-item>

        <tiny-form-item label="连接器">
          <tiny-select v-model="form.connectorId" placeholder="选择连接器（可选）" filterable>
            <tiny-option
              v-for="conn in connectorList"
              :key="conn.id"
              :label="conn.name"
              :value="conn.id"
            />
          </tiny-select>
        </tiny-form-item>

        <tiny-form-item label="设为默认">
          <tiny-switch v-model="form.isDefault" />
        </tiny-form-item>
      </tiny-form>

      <template #footer>
        <tiny-button @click="createDialogVisible = false">取消</tiny-button>
        <tiny-button type="primary" @click="handleCreate">确定</tiny-button>
      </template>
    </tiny-dialog-box>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  Grid as TinyGrid,
  GridColumn as TinyGridColumn,
  Button as TinyButton,
  Tag as TinyTag,
  DialogBox as TinyDialogBox,
  Form as TinyForm,
  FormItem as TinyFormItem,
  Input as TinyInput,
  Select as TinySelect,
  Option as TinyOption,
  Switch as TinySwitch,
  Modal
} from '@opentiny/vue'
import { iconDel, iconLink } from '@opentiny/vue-icon'
import request from '@/utils/request'

const TinyIconDel = iconDel()
const TinyIconLink = iconLink()

const catalogList = ref([])
const connectorList = ref([])
const createDialogVisible = ref(false)
const form = ref({
  catalogName: '',
  catalogType: 'jdbc',
  connectorId: '',
  isDefault: false
})

const loadCatalogs = async () => {
  try {
    const res = await request.get('/api/flink-sql/catalog/list')
    if (res.code === 0) {
      catalogList.value = res.data || []
    }
  } catch (error: any) {
    Modal.message({ message: '加载Catalog列表失败', status: 'error' })
  }
}

const loadConnectors = async () => {
  try {
    const res = await request.post('/api/connector/list', {
      search: '',
      page: 1,
      pageSize: 100
    })
    if (res.code === 0) {
      connectorList.value = res.data?.list || res.data?.records || []
    }
  } catch (error: any) {
    console.error('加载连接器失败', error)
  }
}

const showCreateDialog = () => {
  form.value = {
    catalogName: '',
    catalogType: 'jdbc',
    connectorId: '',
    isDefault: false
  }
  createDialogVisible.value = true
}

const handleCreate = async () => {
  try {
    const url = form.value.connectorId 
      ? '/api/flink-sql/catalog/create-from-connector'
      : '/api/flink-sql/catalog/create'
    
    const res = await request.post(url, form.value)
    if (res.code === 0) {
      Modal.message({ message: 'Catalog创建成功', status: 'success' })
      createDialogVisible.value = false
      loadCatalogs()
    }
  } catch (error: any) {
    Modal.message({ message: error.message || 'Catalog创建失败', status: 'error' })
  }
}

const testConnection = async (row: any) => {
  try {
    const res = await request.post(`/api/flink-sql/catalog/${row.id}/test`)
    if (res.code === 0) {
      Modal.message({ message: '连接测试成功', status: 'success' })
    }
  } catch (error: any) {
    Modal.message({ message: '连接测试失败', status: 'error' })
  }
}

const deleteCatalog = async (row: any) => {
  try {
    const confirmed = await Modal.confirm({
      message: `确定要删除Catalog "${row.catalogName}" 吗？`,
      title: '确认删除'
    })
    if (confirmed === 'confirm') {
      const res = await request.delete(`/api/flink-sql/catalog/${row.id}`)
      if (res.code === 0) {
        Modal.message({ message: '删除成功', status: 'success' })
        loadCatalogs()
      }
    }
  } catch (error: any) {
    Modal.message({ message: '删除失败', status: 'error' })
  }
}

onMounted(() => {
  loadCatalogs()
  loadConnectors()
})
</script>

<style scoped lang="less">
.catalog-config-panel {
  padding: 16px;

  .toolbar {
    margin-bottom: 12px;
  }
}
</style>
