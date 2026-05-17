<template>
  <div class="storage-config-page">
    <!-- 顶部操作栏 -->
    <div class="toolbar">
      <tiny-button type="primary" @click="handleAdd">
        <template #icon><IconPlus /></template>
        新建存储配置
      </tiny-button>
      <tiny-button @click="loadConfigs">
        <template #icon><IconRefresh /></template>
        刷新
      </tiny-button>
    </div>

    <!-- 配置列表 -->
    <tiny-card class="config-list-card">
      <tiny-grid :data="configList" :loading="loading" :height="tableHeight">
        <tiny-grid-column field="name" title="配置名称" width="200" />
        <tiny-grid-column field="storageType" title="存储类型" width="120">
          <template #default="{ row }">
            <tiny-tag :type="getStorageTypeColor(row.storageType)">
              {{ row.storageType }}
            </tiny-tag>
          </template>
        </tiny-grid-column>
        <tiny-grid-column field="description" title="描述" />
        <tiny-grid-column field="isDefault" title="默认配置" width="120">
          <template #default="{ row }">
            <tiny-tag v-if="row.isDefault" type="success">是</tiny-tag>
            <span v-else>-</span>
          </template>
        </tiny-grid-column>
        <tiny-grid-column field="enabled" title="启用状态" width="100">
          <template #default="{ row }">
            <tiny-switch v-model="row.enabled" @change="handleToggleEnabled(row)" />
          </template>
        </tiny-grid-column>
        <tiny-grid-column field="createTime" title="创建时间" width="180" align="center" />
        <tiny-grid-column title="操作" width="100" align="center">
          <template #default="{ row }">
            <tiny-action-menu
              :max-show-num="3"
              :options="getOperations(row)"
              :suffix-icon="tinyIconEllipsis"
              spacing="3px"
              @item-click="handleOperation(row, $event)"
            />
          </template>
        </tiny-grid-column>
      </tiny-grid>
    </tiny-card>

    <!-- 新建/编辑弹窗 -->
    <tiny-modal
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      show-footer=true
      show-header=true
    >
      <template #default>
        <tiny-form ref="formRef" :model="formData" :rules="formRules" label-width="120px">
        <tiny-form-item label="配置名称" prop="name">
          <tiny-input v-model="formData.name" placeholder="请输入配置名称" />
        </tiny-form-item>

        <tiny-form-item label="存储类型" prop="storageType">
          <tiny-radio-group v-model="formData.storageType" @change="handleStorageTypeChange">
            <tiny-radio label="MYSQL">MySQL</tiny-radio>
            <tiny-radio label="NEO4J">Neo4j</tiny-radio>
          </tiny-radio-group>
        </tiny-form-item>

        <tiny-form-item label="选择连接器" prop="connectorId">
          <tiny-select
            v-model="formData.connectorId"
            placeholder="请选择连接器"
            filterable
            @change="handleConnectorChange"
          >
            <tiny-option
              v-for="connector in filteredConnectors"
              :key="connector.id"
              :label="connector.name"
              :value="connector.id"
            >
              <div class="connector-option">
                <span class="connector-name">{{ connector.name }}</span>
                <tiny-tag
                  size="small"
                  :type="connector.status === 'CONNECTED' ? 'success' : 'info'"
                >
                  {{ connector.product }}
                </tiny-tag>
              </div>
            </tiny-option>
          </tiny-select>
          <div class="connector-hint">已选择: {{ selectedConnectorName }}</div>
        </tiny-form-item>

        <tiny-form-item label="描述" prop="description">
          <tiny-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述"
          />
        </tiny-form-item>

        <tiny-form-item label="设为默认">
          <tiny-switch v-model="formData.isDefault" />
        </tiny-form-item>

        <tiny-form-item label="启用">
          <tiny-switch v-model="formData.enabled" />
        </tiny-form-item>
      </tiny-form>
      </template>
      
      <template #footer>
        <div style="display: flex; justify-content: flex-end; gap: 8px; padding: 12px 0;">
          <tiny-button @click="dialogVisible = false">取消</tiny-button>
          <tiny-button @click="resetForm">重置</tiny-button>
          <tiny-button type="primary" @click="handleConfirm">
            {{ isEdit ? '更新' : '保存' }}
          </tiny-button>
        </div>
      </template>
    </tiny-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import {
  ActionMenu as TinyActionMenu,
  Card as TinyCard,
  Button as TinyButton,
  Grid as TinyGrid,
  GridColumn as TinyGridColumn,
  Tag as TinyTag,
  Switch as TinySwitch,
  Modal as TinyModal,
  Form as TinyForm,
  FormItem as TinyFormItem,
  Input as TinyInput,
  RadioGroup as TinyRadioGroup,
  Radio as TinyRadio,
  Select as TinySelect,
  Option as TinyOption
} from '@opentiny/vue'
import { Modal } from '@opentiny/vue'
import { IconPlus, IconRefresh, iconEllipsis, iconEdit, iconDel, iconYes, iconSetting } from '@opentiny/vue-icon'

// API
import request from '@/utils/request'
import { PageUtils } from '@/utils/page'

const loading = ref(false)
const configList = ref([])
const connectorList = ref([]) // 连接器列表
const dialogVisible = ref(false)
const dialogTitle = ref('新建存储配置')
const formRef = ref(null)
const isEdit = ref(false)
const tableHeight = ref(500)
const tinyIconEllipsis = iconEllipsis()

// 获取操作菜单
const getOperations = (row: any) => {
  const operations: any[] = [
    {
      name: 'edit',
      icon: iconEdit()
    },
    {
      name: 'test',
      icon: iconSetting()
    }
  ]
  
  if (!row.isDefault) {
    operations.push({
      name: 'setDefault',
      icon: iconYes()
    })
  }
  
  operations.push({
    name: 'delete',
    icon: iconDel()
  })
  
  return operations
}

// 处理操作点击
const handleOperation = (row: any, event: any) => {
  const action = event.itemData.name
  
  switch (action) {
    case 'edit':
      handleEdit(row)
      break
    case 'test':
      handleTest(row)
      break
    case 'setDefault':
      handleSetDefault(row)
      break
    case 'delete':
      handleDelete(row)
      break
  }
}

// 表单数据
const formData = reactive({
  id: null,
  name: '',  // 改为name，与后端实体字段一致
  storageType: 'MYSQL',
  connectorId: '', // 连接器ID
  description: '',
  isDefault: false,
  enabled: true
})

// 表单验证规则
const formRules = {
  name: [{ required: true, message: '请输入配置名称', trigger: 'blur' }],
  storageType: [{ required: true, message: '请选择存储类型', trigger: 'change' }],
  connectorId: [{ required: true, message: '请选择连接器', trigger: 'change' }]
}

// 过滤连接器（根据存储类型）
const filteredConnectors = computed(() => {
  if (!formData.storageType) return []

  const typeMap = {
    MYSQL: 'mysql',
    NEO4J: 'neo4j'
  }

  const targetProduct = typeMap[formData.storageType]

  return connectorList.value.filter((c) => c.product?.toLowerCase() === targetProduct)
})

// 已选连接器名称
const selectedConnectorName = computed(() => {
  if (!formData.connectorId) return '未选择'
  const connector = connectorList.value.find((c) => c.id === formData.connectorId)
  return connector ? connector.name : '未选择'
})

// 加载连接器列表
const loadConnectors = async () => {
  try {
    const response = await request({
      url: '/api/connector/list',
      method: 'post',
      data: {
        search: '',
        page: 1,
        pageSize: 1000
      }
    })
    // 连接器接口返回 { msg: 'success', data: { list: [...] } }
    if (response.msg === 'success' && response.data) {
      connectorList.value = response.data.list || response.data.records || []
    }
  } catch (error) {
    console.error('加载连接器列表失败:', error)
  }
}

// 存储类型变化
const handleStorageTypeChange = () => {
  // 清空已选连接器
  formData.connectorId = ''
}

// 连接器变化
const handleConnectorChange = (connectorId) => {
  console.log('选择连接器:', connectorId)
}

// 加载配置列表
const loadConfigs = async () => {
  loading.value = true
  try {
    const response = await request({
      url: '/api/lineage/storage/list',
      method: 'get'
    })
    // 血缘接口返回 { code: 0, data: [...] }，request.ts 返回完整对象
    if (response.code === 0 && response.data) {
      configList.value = (response.data || []).map((item) => ({
        ...item,
        testing: false
      }))
      console.log('加载配置成功:', configList.value)
    }
  } catch (error) {
    console.error('加载配置失败:', error)
    configList.value = []
  } finally {
    loading.value = false
  }
}

// 新建配置
const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '新建存储配置'
  resetForm()
  dialogVisible.value = true
}

// 编辑配置
const handleEdit = (row) => {
  isEdit.value = true
  dialogTitle.value = '编辑存储配置'
  Object.assign(formData, {
    ...row,
    config: JSON.parse(row.connectionConfig || '{}')
  })
  dialogVisible.value = true
}

// 删除配置
const handleDelete = async (row) => {
  try {
    await Modal.confirm({
      message: '确定要删除该配置吗？',
      title: '提示',
      status: 'warning'
    })

    await request({
      url: `/api/lineage/storage/${row.id}`,
      method: 'delete'
    })

    Modal.message({ message: '删除成功', status: 'success' })
    loadConfigs()
  } catch (error) {
    if (error !== 'cancel') {
      Modal.message({ message: '删除失败', status: 'error' })
    }
  }
}

// 测试连接
const handleTest = async (row) => {
  row.testing = true
  try {
    const response = await request({
      url: `/api/lineage/storage/${row.id}/test`,
      method: 'post'
    })

    // 血缘接口返回 { code: 0, data: true/false }
    if (response.code === 0 && response.data === true) {
      Modal.message({ message: '连接测试成功', status: 'success' })
    } else {
      Modal.message({ message: '连接测试失败', status: 'error' })
    }
  } catch (error) {
    console.error('测试连接异常:', error)
    Modal.message({ message: '连接测试失败', status: 'error' })
  } finally {
    row.testing = false
  }
}

// 设为默认
const handleSetDefault = async (row) => {
  try {
    await request({
      url: `/api/lineage/storage/${row.id}/set-default`,
      method: 'post'
    })

    Modal.message({ message: '设置成功', status: 'success' })
    loadConfigs()
  } catch (error) {
    Modal.message({ message: '设置失败', status: 'error' })
  }
}

// 切换启用状态
const handleToggleEnabled = async (row) => {
  try {
    await request({
      url: `/api/lineage/storage/update`,
      method: 'post',
      data: row
    })
    Modal.message({ message: '更新成功', status: 'success' })
  } catch (error) {
    Modal.message({ message: '更新失败', status: 'error' })
    row.enabled = !row.enabled
  }
}

// 确认
const handleConfirm = async () => {
  try {
    await formRef.value.validate()

    if (isEdit.value) {
      await request({
        url: '/api/lineage/storage/update',
        method: 'post',
        data: formData
      })
      Modal.message({ message: '更新成功', status: 'success' })
    } else {
      await request({
        url: '/api/lineage/storage/create',
        method: 'post',
        data: formData
      })
      Modal.message({ message: '创建成功', status: 'success' })
    }

    dialogVisible.value = false
    loadConfigs()
  } catch (error) {
    console.error('保存失败:', error)
  }
}

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    id: null,
    name: '',  // 改为name
    storageType: 'MYSQL',
    connectorId: '',
    description: '',
    isDefault: false,
    enabled: true
  })
}

// 获取存储类型颜色
const getStorageTypeColor = (type) => {
  const colorMap = {
    MYSQL: 'success',
    NEO4J: 'warning',
    JANUSGRAPH: 'info'
  }
  return colorMap[type] || 'default'
}

onMounted(() => {
  loadConfigs()
  loadConnectors() // 加载连接器列表
  tableHeight.value = PageUtils.setTableHeight(210)
})
</script>

<style scoped lang="less">
.storage-config-page {
  padding: 5px;

  // 覆盖 TinyVue Card 的默认宽度限制
  :deep(.tiny-card) {
    width: 100% !important;
  }

  .toolbar {
    margin-bottom: 16px;
    display: flex;
    gap: 8px;
  }

  .config-list-card {
    :deep(.tiny-card__body) {
      padding: 0;
    }
    :deep(.tiny-card--logo) {
      padding: 0;
    }
  }

  // 连接器选择样式
  .connector-option {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    .connector-name {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .connector-hint {
    font-size: 12px;
    color: #999;
    margin-top: 4px;
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
