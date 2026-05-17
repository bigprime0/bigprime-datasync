<template>
  <div class="catalog-manager">
    <div class="toolbar">
      <tiny-button type="primary" size="small" @click="showCreateModal"> 创建Catalog </tiny-button>
      <tiny-button size="small" @click="loadCatalogs" style="margin-left: 8px"> 刷新 </tiny-button>
    </div>

    <tiny-grid
      :data="catalogList"
      :loading="loading"
      border
      highlight-hover-row
      show-overflow="tooltip"
      size="small"
      class="catalog-table"
    >
      <tiny-grid-column field="catalogName" title="Catalog名称"></tiny-grid-column>

      <tiny-grid-column field="dataSourceType" title="数据源类型"></tiny-grid-column>

      <tiny-grid-column field="status" title="状态" width="100" align="center">
        <template #default="{ row }">
          <tiny-tag :type="getStatusType(row.status)">
            {{ row.status }}
          </tiny-tag>
        </template>
      </tiny-grid-column>

      <tiny-grid-column field="creatorName" title="创建者" width="130"></tiny-grid-column>

      <tiny-grid-column field="createTime" title="创建时间" width="180">
        <template #default="{ row }">
          {{ formatDateTime(row.createTime) }}
        </template>
      </tiny-grid-column>

      <tiny-grid-column title="操作" width="100" align="center">
        <template #default="{ row }">
          <div style="display: flex; gap: 10px; justify-content: center; align-items: center;">
            <div title="刷新">
              <tiny-icon-refresh
                @click="refreshCatalog(row)"
                style="font-size: 20px; cursor: pointer; fill: #409eff; color: #409eff;"
              />
            </div>
            <div title="删除">
              <tiny-icon-del
                @click="confirmDelete(row)"
                style="font-size: 20px; cursor: pointer; fill: #f56c6c; color: #f56c6c;"
              />
            </div>
          </div>
        </template>
      </tiny-grid-column>
    </tiny-grid>

    <!-- 创建Catalog对话框 -->
    <tiny-dialog-box
      :visible="createModalVisible"
      title="创建Catalog"
      width="600px"
      :append-to-body="true"
      @update:visible="createModalVisible = $event"
      @close="handleCancel"
    >
      <tiny-form :model="createForm" :rules="formRules" ref="formRef" label-width="120px">
        <tiny-form-item label="Catalog名称" prop="catalogName">
          <tiny-input v-model="createForm.catalogName" placeholder="例如: mysql_prod" />
        </tiny-form-item>

        <tiny-form-item label="数据源类型" prop="dataSourceType">
          <tiny-select v-model="createForm.dataSourceType">
            <!-- 关系型数据库 -->
            <tiny-option value="MySQL" label="MySQL"></tiny-option>
            <tiny-option value="PostgreSQL" label="PostgreSQL"></tiny-option>
            <tiny-option value="Oracle" label="Oracle"></tiny-option>
            <tiny-option value="SQLServer" label="SQL Server"></tiny-option>

            <!-- 大数据存储 -->
            <tiny-option value="Hive" label="Hive"></tiny-option>
            <tiny-option value="Iceberg" label="Iceberg"></tiny-option>
            <tiny-option value="Hudi" label="Hudi"></tiny-option>
            <tiny-option value="DeltaLake" label="Delta Lake"></tiny-option>
            <tiny-option value="Paimon" label="Paimon"></tiny-option>
            <tiny-option value="Kudu" label="Kudu"></tiny-option>

            <!-- 分析型数据库 -->
            <tiny-option value="ClickHouse" label="ClickHouse"></tiny-option>

            <!-- 搜索引擎 -->
            <tiny-option value="Elasticsearch" label="Elasticsearch"></tiny-option>

            <!-- 文件数据源 -->
            <tiny-option value="File" label="File (CSV/Parquet/ORC)"></tiny-option>

            <!-- 通用连接 -->
            <tiny-option value="JDBC" label="JDBC (通用)"></tiny-option>
          </tiny-select>
        </tiny-form-item>

        <tiny-form-item label="StarRocks连接器" prop="starRocksConnectorId">
          <tiny-select
            v-model="createForm.starRocksConnectorId"
            placeholder="选择StarRocks连接器"
            filterable
          >
            <tiny-option
              v-for="conn in starRocksConnectors"
              :key="conn.id"
              :value="conn.id"
              :label="conn.name"
            ></tiny-option>
          </tiny-select>
        </tiny-form-item>

        <tiny-form-item label="数据源连接器" prop="dataSourceConnectorId">
          <tiny-select
            v-model="createForm.dataSourceConnectorId"
            placeholder="选择数据源连接器"
            filterable
          >
            <tiny-option
              v-for="conn in dataSourceConnectors"
              :key="conn.id"
              :value="conn.id"
              :label="conn.name"
            ></tiny-option>
          </tiny-select>
        </tiny-form-item>

        <tiny-form-item label="驱动地址" prop="driverUrl">
          <tiny-input
            v-model="createForm.driverUrl"
            placeholder="可选，例如: /path/to/driver.jar 或 mysql-connector.jar"
          />
          <div style="color: #999; font-size: 12px; margin-top: 4px">
            指定JDBC驱动文件路径，如果不填写则使用StarRocks默认驱动
          </div>
        </tiny-form-item>
      </tiny-form>

      <template #footer>
        <tiny-button @click="handleCancel">取消</tiny-button>
        <tiny-button type="primary" @click="handleCreate" :loading="creating">确认</tiny-button>
      </template>
    </tiny-dialog-box>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {
  Button as TinyButton,
  DialogBox as TinyDialogBox,
  Form as TinyForm,
  FormItem as TinyFormItem,
  Grid as TinyGrid,
  GridColumn as TinyGridColumn,
  Input as TinyInput,
  Modal,
  Option as TinyOption,
  Select as TinySelect,
  Tag as TinyTag
} from '@opentiny/vue'
import { iconDel, iconRefresh } from '@opentiny/vue-icon'
import { catalogApi, connectorApi } from '@/api/query'
import { formatDateTime } from '@/utils/date'

const TinyIconRefresh = iconRefresh()
const TinyIconDel = iconDel()

const catalogList = ref([])
const loading = ref(false)
const createModalVisible = ref(false)
const creating = ref(false)
const starRocksConnectors = ref([])
const dataSourceConnectors = ref([])
const formRef = ref(null)

const createForm = ref({
  catalogName: '',
  dataSourceType: 'MySQL',
  starRocksConnectorId: '',
  dataSourceConnectorId: '',
  driverUrl: ''
})

const formRules = {
  catalogName: [{ required: true, message: '请输入Catalog名称', trigger: 'blur' }],
  dataSourceType: [{ required: true, message: '请选择数据源类型', trigger: 'change' }],
  starRocksConnectorId: [{ required: true, message: '请选择StarRocks连接器', trigger: 'change' }],
  dataSourceConnectorId: [{ required: true, message: '请选择数据源连接器', trigger: 'change' }]
}

const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    ACTIVE: 'success',
    ERROR: 'danger',
    DELETED: 'info'
  }
  return typeMap[status] || 'info'
}

const loadCatalogs = async () => {
  loading.value = true
  try {
    const res = await catalogApi.list()
    catalogList.value = res.data || []
  } catch (error: any) {
    Modal.message({ message: error.message || '加载Catalog列表失败', status: 'error' })
  } finally {
    loading.value = false
  }
}

const loadConnectors = async () => {
  try {
    const res = await connectorApi.list()
    const allConnectors = res.data?.list || res.data || []

    // 筛选StarRocks连接器
    starRocksConnectors.value = allConnectors.filter(
      (c: any) => c.product?.toLowerCase() === 'starrocks'
    )

    // 筛选数据源连接器（支持更多类型）
    const supportedTypes = [
      // 关系型数据库
      'mysql',
      'postgresql',
      'oracle',
      'sqlserver',
      // 大数据存储
      'hive',
      'iceberg',
      'hudi',
      'deltalake',
      'paimon',
      'kudu',
      // 分析型数据库
      'clickhouse',
      // 搜索引擎
      'elasticsearch',
      // 文件系统/对象存储
      'file',
      's3',
      'hdfs',
      'oss',
      'cos',
      'obs',
      // 通用
      'jdbc'
    ]
    dataSourceConnectors.value = allConnectors.filter((c: any) =>
      supportedTypes.includes(c.product?.toLowerCase())
    )
  } catch (error: any) {
    Modal.message({ message: error.message || '加载连接器列表失败', status: 'error' })
  }
}

const showCreateModal = () => {
  createForm.value = {
    catalogName: '',
    dataSourceType: 'MySQL',
    starRocksConnectorId: '',
    dataSourceConnectorId: '',
    driverUrl: ''
  }
  createModalVisible.value = true
}

const handleCreate = async () => {
  creating.value = true
  try {
    await catalogApi.create(createForm.value)
    Modal.message({ message: 'Catalog创建成功', status: 'success' })
    createModalVisible.value = false
    await loadCatalogs()
  } catch (error: any) {
    Modal.message({ message: error.message || 'Catalog创建失败', status: 'error' })
  } finally {
    creating.value = false
  }
}

const handleCancel = () => {
  createModalVisible.value = false
}

const refreshCatalog = async (record: any) => {
  try {
    await catalogApi.refresh(record.catalogName)
    Modal.message({ message: 'Catalog刷新成功', status: 'success' })
  } catch (error: any) {
    Modal.message({ message: error.message || 'Catalog刷新失败', status: 'error' })
  }
}

const confirmDelete = (record: any) => {
  Modal.confirm({
    message: '确定要删除这个Catalog吗？',
    title: '提示'
  }).then(() => {
    deleteCatalog(record)
  })
}

const deleteCatalog = async (record: any) => {
  try {
    await catalogApi.delete(record.catalogName)
    Modal.message({ message: 'Catalog删除成功', status: 'success' })
    await loadCatalogs()
  } catch (error: any) {
    Modal.message({ message: error.message || 'Catalog删除失败', status: 'error' })
  }
}

onMounted(() => {
  loadCatalogs()
  loadConnectors()
})
</script>

<style scoped lang="less">
.catalog-manager {
  height: 100%;
  display: flex;
  flex-direction: column;

  .toolbar {
    margin-bottom: 16px;
    flex-shrink: 0;
  }

  .catalog-table {
    flex: 1;
    min-height: 0;

    :deep(.tiny-grid__body-wrapper) {
      max-height: calc(100vh - 280px) !important;
      overflow-y: auto !important;
    }
  }
}
</style>
