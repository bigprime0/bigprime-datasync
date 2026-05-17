<template>
  <div class="query-history">
    <div class="toolbar">
      <tiny-button size="small" @click="loadHistory" style="margin-right: 8px">
        刷新
      </tiny-button>
      <span style="margin-right: 8px">显示</span>
      <tiny-numeric
        v-model="limit"
        :min="10"
        :max="100"
        :controls="false"
        style="width: 80px; margin-right: 8px"
        @change="loadHistory"
      />
      <span>条</span>
    </div>
    
    <tiny-grid
      :data="historyList"
      :loading="loading"
      border
      highlight-hover-row
      show-overflow="tooltip"
      size="small"
      class="history-table"
      :height="tableHeight"
    >
      <tiny-grid-column
        field="sql"
        title="SQL"
      >
        <template #default="{ row }">
          <div class="sql-cell" :title="row.sql">{{ row.sql }}</div>
        </template>
      </tiny-grid-column>
      
      <tiny-grid-column
        field="executeTime"
        title="执行时间"
        :width="100"
        align="center"
      ></tiny-grid-column>
      
      <tiny-grid-column
        field="resultRows"
        title="结果行数"
        :width="100"
        align="center"
      ></tiny-grid-column>
      
      <tiny-grid-column
        field="success"
        title="状态"
        :width="80"
        align="center"
      >
        <template #default="{ row }">
          <tiny-tag :type="row.success ? 'success' : 'danger'">
            {{ row.success ? '成功' : '失败' }}
          </tiny-tag>
        </template>
      </tiny-grid-column>
      
      <tiny-grid-column
        field="executeAt"
        title="执行时间"
        :width="180"
        align="center"
      >
        <template #default="{ row }">
          {{ formatDateTime(row.executeAt) }}
        </template>
      </tiny-grid-column>
      
      <tiny-grid-column
        title="操作"
        :width="120"
        align="center"
      >
        <template #default="{ row }">
          <div style="display: flex; gap: 10px; justify-content: center; align-items: center;">
            <div title="回放">
              <tiny-icon-refresh
                @click="replayQuery(row)"
                style="font-size: 20px; cursor: pointer; fill: #409eff; color: #409eff;"
              />
            </div>
            <div title="详情">
              <tiny-icon-view
                @click="viewDetail(row)"
                style="font-size: 20px; cursor: pointer; fill: #409eff; color: #409eff;"
              />
            </div>
          </div>
        </template>
      </tiny-grid-column>
    </tiny-grid>
    
    <!-- 详情对话框 -->
    <tiny-dialog-box
      :visible="detailVisible"
      title="查询详情"
      width="800px"
      :append-to-body="true"
      @update:visible="detailVisible = $event"
    >
      <div v-if="currentRecord">
        <div class="detail-item">
          <div class="detail-label">SQL语句：</div>
          <pre class="sql-detail">{{ currentRecord.sql }}</pre>
        </div>
        
        <div class="detail-item">
          <div class="detail-label">执行时间：</div>
          <div class="detail-value">{{ currentRecord.executeTime }}ms</div>
        </div>
        
        <div class="detail-item">
          <div class="detail-label">结果行数：</div>
          <div class="detail-value">{{ currentRecord.resultRows }}</div>
        </div>
        
        <div class="detail-item">
          <div class="detail-label">状态：</div>
          <div class="detail-value">
            <tiny-tag :type="currentRecord.success ? 'success' : 'danger'">
              {{ currentRecord.success ? '成功' : '失败' }}
            </tiny-tag>
          </div>
        </div>
        
        <div class="detail-item">
          <div class="detail-label">执行时间：</div>
          <div class="detail-value">{{ formatDateTime(currentRecord.executeAt) }}</div>
        </div>
        
        <div class="detail-item" v-if="!currentRecord.success">
          <div class="detail-label">错误信息：</div>
          <tiny-alert type="error" :description="currentRecord.errorMessage" :closable="false" />
        </div>
      </div>
      
      <template #footer>
        <tiny-button type="primary" @click="detailVisible = false">关闭</tiny-button>
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
  Numeric as TinyNumeric,
  DialogBox as TinyDialogBox,
  Alert as TinyAlert,
  Modal
} from '@opentiny/vue'
import { iconRefresh, iconView } from '@opentiny/vue-icon'

const TinyIconRefresh = iconRefresh()
const TinyIconView = iconView()
import { queryApi } from '@/api/query'
import {PageUtils} from "@/utils/page"
import { formatDateTime } from '@/utils/date';

const emit = defineEmits(['replay'])

const historyList = ref([])
const loading = ref(false)
const limit = ref(20)
const detailVisible = ref(false)
const currentRecord = ref<any>(null)
const tableHeight = ref(500)

const loadHistory = async () => {
  loading.value = true
  try {
    const res = await queryApi.getHistory(limit.value)
    historyList.value = res.data || []
  } catch (error: any) {
    Modal.message({ message: error.message || '加载查询历史失败', status: 'error' })
  } finally {
    loading.value = false
  }
}

const replayQuery = (record: any) => {
  emit('replay', {
    sql: record.sql,
    connectorId: record.starRocksConnectorId
  })
  Modal.message({ message: 'SQL已加载到编辑器，请点击执行', status: 'success' })
}

const viewDetail = (record: any) => {
  currentRecord.value = record
  detailVisible.value = true
}

onMounted(() => {
  loadHistory()
  tableHeight.value = PageUtils.setTableHeight(null)
})
</script>

<style scoped lang="less">
.query-history {
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .toolbar {
    margin-bottom: 16px;
    display: flex;
    align-items: center;
  }
  
  .history-table {
    flex: 1;
    
    .sql-cell {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  
  .detail-item {
    margin-bottom: 16px;
    
    .detail-label {
      font-weight: bold;
      margin-bottom: 8px;
      color: #333;
    }
    
    .detail-value {
      padding: 8px;
      background: #f5f5f5;
      border-radius: 4px;
    }
  }
  
  .sql-detail {
    padding: 12px;
    background: #f5f5f5;
    border-radius: 4px;
    font-family: 'Consolas', 'Monaco', monospace;
    max-height: 300px;
    overflow: auto;
  }
}
</style>
