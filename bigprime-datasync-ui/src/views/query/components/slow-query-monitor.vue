<template>
  <div class="slow-query-monitor">
    <!-- 工具栏 -->
    <div class="toolbar">
      <tiny-button size="small" @click="loadSlowQueries">
        刷新
      </tiny-button>
      <tiny-button size="small" @click="showConfigDialog" style="margin-left: 8px">
        配置
      </tiny-button>
      <tiny-button size="small" @click="loadStatistics" style="margin-left: 8px">
        统计
      </tiny-button>
    </div>

    <!-- 慢查询列表 -->
    <div class="query-list">
      <tiny-grid
        :data="slowQueryList"
        :loading="loading"
        border
        size="small"
        show-overflow="tooltip"
        highlight-hover-row
        style="margin-top: 12px"
      >
        <tiny-grid-column
          field="executeTime"
          title="执行时长(ms)"
          width="150"
          align="right"
          :sortable="true"
        >
          <template #default="{ row }">
            <tiny-tag :type="getTimeTagType(row.executeTime)">
              {{ row.executeTime }}ms
            </tiny-tag>
          </template>
        </tiny-grid-column>

        <tiny-grid-column
          field="sqlText"
          title="SQL语句"
          min-width="300"
          show-overflow="tooltip"
        >
          <template #default="{ row }">
            <div class="sql-text" @click="showSqlDetail(row)">
              {{ row.sqlText.substring(0, 100) }}...
            </div>
          </template>
        </tiny-grid-column>

        <tiny-grid-column
          field="resultRows"
          title="结果行数"
          width="100"
          align="right"
        ></tiny-grid-column>

        <tiny-grid-column
          field="executeAt"
          title="执行时间"
          width="180"
          align="center"
        ></tiny-grid-column>

        <tiny-grid-column
          field="catalogName"
          title="Catalog"
          width="150"
        ></tiny-grid-column>

        <tiny-grid-column
          title="操作"
          width="120"
          align="center"
        >
          <template #default="{ row }">
            <tiny-button
              type="text"
              size="mini"
              @click.stop="analyzeQuery(row)"
            >
              分析
            </tiny-button>
            <tiny-button
              type="text"
              size="mini"
              @click.stop="deleteQuery(row.id)"
            >
              删除
            </tiny-button>
          </template>
        </tiny-grid-column>
      </tiny-grid>

      <!-- 分页 -->
      <tiny-pager
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, prev, pager, next, sizes"
        @size-change="loadSlowQueries"
        @current-change="loadSlowQueries"
        style="margin-top: 12px"
      />
    </div>

    <!-- 配置对话框 -->
    <tiny-dialog-box
      :visible="configDialogVisible"
      title="慢查询配置"
      width="500px"
      :append-to-body="true"
      @update:visible="configDialogVisible = $event"
    >
      <tiny-form :model="config" label-width="120px">
        <tiny-form-item label="慢查询阈值">
          <tiny-numeric
            v-model="config.thresholdMs"
            :min="100"
            :max="60000"
            :step="100"
          />
          <span style="margin-left: 8px">毫秒</span>
        </tiny-form-item>

        <tiny-form-item label="启用检测">
          <tiny-switch v-model="config.enabled" />
        </tiny-form-item>

        <tiny-form-item label="保留天数">
          <tiny-numeric
            v-model="config.retentionDays"
            :min="1"
            :max="365"
          />
          <span style="margin-left: 8px">天</span>
        </tiny-form-item>

        <tiny-form-item label="启用告警">
          <tiny-switch v-model="config.alertEnabled" />
        </tiny-form-item>
      </tiny-form>

      <template #footer>
        <tiny-button @click="configDialogVisible = false">取消</tiny-button>
        <tiny-button type="primary" @click="saveConfig">保存</tiny-button>
      </template>
    </tiny-dialog-box>

    <!-- SQL详情对话框 -->
    <tiny-dialog-box
      :visible="sqlDetailVisible"
      title="SQL详情"
      width="800px"
      :append-to-body="true"
      @update:visible="sqlDetailVisible = $event"
    >
      <div v-if="selectedQuery">
        <div class="detail-info">
          <div class="info-item">
            <span class="label">执行时长:</span>
            <span>{{ selectedQuery.executeTime }}ms</span>
          </div>
          <div class="info-item">
            <span class="label">结果行数:</span>
            <span>{{ selectedQuery.resultRows }}</span>
          </div>
          <div class="info-item">
            <span class="label">执行时间:</span>
            <span>{{ selectedQuery.executeAt }}</span>
          </div>
        </div>
        <div class="sql-content">
          <pre>{{ selectedQuery.sqlText }}</pre>
        </div>
      </div>

      <template #footer>
        <tiny-button @click="sqlDetailVisible = false">关闭</tiny-button>
      </template>
    </tiny-dialog-box>

    <!-- 统计对话框 -->
    <tiny-dialog-box
      :visible="statisticsVisible"
      title="慢查询统计"
      width="900px"
      :append-to-body="true"
      @update:visible="statisticsVisible = $event"
    >
      <div v-if="statistics">
        <div class="stats-summary">
          <div class="stat-item">
            <div class="stat-label">当前阈值</div>
            <div class="stat-value">{{ statistics.threshold }}ms</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">平均执行时间</div>
            <div class="stat-value">{{ statistics.avgExecuteTime?.toFixed(2) }}ms</div>
          </div>
        </div>

        <tiny-divider>TOP 10 慢查询</tiny-divider>
        <tiny-grid
          :data="statistics.top10 || []"
          border
          size="small"
          :max-height="300"
        >
          <tiny-grid-column field="executeTime" title="时长(ms)" width="100" />
          <tiny-grid-column field="sqlText" title="SQL" show-overflow="tooltip" />
          <tiny-grid-column field="executeAt" title="时间" width="180" />
        </tiny-grid>
      </div>

      <template #footer>
        <tiny-button @click="statisticsVisible = false">关闭</tiny-button>
      </template>
    </tiny-dialog-box>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import {
  Grid as TinyGrid,
  GridColumn as TinyGridColumn,
  Button as TinyButton,
  DialogBox as TinyDialogBox,
  Form as TinyForm,
  FormItem as TinyFormItem,
  Numeric as TinyNumeric,
  Switch as TinySwitch,
  Tag as TinyTag,
  Pager as TinyPager,
  Divider as TinyDivider,
  Modal
} from '@opentiny/vue'
import { slowQueryApi } from '@/api/query'

const loading = ref(false)
const slowQueryList = ref<any[]>([])
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

const configDialogVisible = ref(false)
const config = ref({
  thresholdMs: 3000,
  enabled: true,
  retentionDays: 30,
  alertEnabled: false
})

const sqlDetailVisible = ref(false)
const selectedQuery = ref<any>(null)

const statisticsVisible = ref(false)
const statistics = ref<any>(null)

// 加载慢查询列表
const loadSlowQueries = async () => {
  loading.value = true
  try {
    const res = await slowQueryApi.list({
      page: pagination.page,
      pageSize: pagination.pageSize
    })
    
    if (res.code === 0 && res.data) {
      slowQueryList.value = res.data.list || []
      pagination.total = res.data.total || 0
    }
  } catch (error) {
    console.error('加载慢查询列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 加载配置
const loadConfig = async () => {
  try {
    const res = await slowQueryApi.getConfig()
    if (res.code === 0 && res.data) {
      config.value = res.data
    }
  } catch (error) {
    console.error('加载配置失败:', error)
  }
}

// 保存配置
const saveConfig = async () => {
  try {
    const res = await slowQueryApi.updateConfig(config.value)
    if (res.code === 0) {
      Modal.message({ message: '配置保存成功', status: 'success' })
      configDialogVisible.value = false
    }
  } catch (error) {
    console.error('保存配置失败:', error)
    Modal.message({ message: '保存配置失败', status: 'error' })
  }
}

// 显示配置对话框
const showConfigDialog = async () => {
  await loadConfig()
  configDialogVisible.value = true
}

// 显示SQL详情
const showSqlDetail = (row: any) => {
  selectedQuery.value = row
  sqlDetailVisible.value = true
}

// 删除查询
const deleteQuery = async (id: number) => {
  try {
    const res = await slowQueryApi.delete(id)
    if (res.code === 0) {
      Modal.message({ message: '删除成功', status: 'success' })
      await loadSlowQueries()
    }
  } catch (error) {
    console.error('删除失败:', error)
  }
}

// 分析查询
const analyzeQuery = (row: any) => {
  // TODO: 跳转到执行计划分析
  Modal.message({ message: '功能开发中', status: 'info' })
}

// 加载统计数据
const loadStatistics = async () => {
  try {
    const res = await slowQueryApi.statistics()
    if (res.code === 0 && res.data) {
      statistics.value = res.data
      statisticsVisible.value = true
    }
  } catch (error) {
    console.error('加载统计失败:', error)
  }
}

// 获取时长标签类型
const getTimeTagType = (time: number) => {
  if (time > 10000) return 'danger'
  if (time > 5000) return 'warning'
  return 'info'
}

onMounted(() => {
  loadSlowQueries()
})
</script>

<style scoped lang="less">
.slow-query-monitor {
  padding: 16px;
  height: 100%;

  .toolbar {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
  }

  .query-list {
    .sql-text {
      cursor: pointer;
      color: #5e7ce0;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }

  .detail-info {
    margin-bottom: 16px;

    .info-item {
      margin-bottom: 8px;

      .label {
        font-weight: bold;
        margin-right: 8px;
      }
    }
  }

  .sql-content {
    background: #f5f5f5;
    padding: 12px;
    border-radius: 4px;
    max-height: 400px;
    overflow: auto;

    pre {
      margin: 0;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
  }

  .stats-summary {
    display: flex;
    gap: 24px;
    margin-bottom: 16px;

    .stat-item {
      flex: 1;
      padding: 16px;
      background: #f5f7fa;
      border-radius: 4px;
      text-align: center;

      .stat-label {
        font-size: 12px;
        color: #999;
        margin-bottom: 8px;
      }

      .stat-value {
        font-size: 24px;
        font-weight: bold;
        color: #333;
      }
    }
  }
}
</style>
