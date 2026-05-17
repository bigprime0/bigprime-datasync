<template>
  <div class="session-manager-panel">
    <div class="toolbar">
      <tiny-button @click="loadSessions">刷新</tiny-button>
    </div>

    <tiny-grid
      :data="sessionList"
      border
      size="small"
      height="600"
      auto-resize
    >
      <tiny-grid-column field="sessionId" title="Session ID" />
      <tiny-grid-column field="sessionName" title="名称" width="150" />
      <tiny-grid-column field="sessionType" title="类型" width="100" />
      <tiny-grid-column field="jobId" title="Job ID" width="200" />
      <tiny-grid-column field="status" title="状态" width="100">
        <template #default="{ row }">
          <tiny-tag :type="row.status === 'ACTIVE' ? 'success' : 'info'">
            {{ row.status }}
          </tiny-tag>
        </template>
      </tiny-grid-column>
      <tiny-grid-column field="lastActivityTime" title="最后活跃时间" width="180" />
      <tiny-grid-column title="操作" width="120">
        <template #default="{ row }">
          <div style="display: flex; gap: 10px; justify-content: center; align-items: center;">
            <div :title="row.status !== 'ACTIVE' ? '关闭（不可用）' : '关闭'">
              <tiny-icon-close
                v-if="row.status === 'ACTIVE'"
                @click="closeSession(row)"
                style="font-size: 20px; cursor: pointer; fill: #f56c6c; color: #f56c6c;"
              />
              <tiny-icon-close
                v-else
                style="font-size: 20px; cursor: not-allowed; fill: #d9d9d9; color: #d9d9d9;"
              />
            </div>
          </div>
        </template>
      </tiny-grid-column>
    </tiny-grid>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  Grid as TinyGrid,
  GridColumn as TinyGridColumn,
  Button as TinyButton,
  Tag as TinyTag,
  Modal
} from '@opentiny/vue'
import { iconClose } from '@opentiny/vue-icon'
import request from '@/utils/request'

const TinyIconClose = iconClose()

const sessionList = ref<any[]>([])

const loadSessions = async () => {
  try {
    const res = await request.get('/api/flink-sql/session/active')
    if (res.code === 0) {
      sessionList.value = res.data || []
    }
  } catch (error: any) {
    Modal.message({ message: '加载Session列表失败', status: 'error' })
  }
}

const closeSession = async (row: any) => {
  try {
    const confirmed = await Modal.confirm({
      message: `确定要关闭Session "${row.sessionId}" 吗？`,
      title: '确认关闭'
    })
    if (confirmed === 'confirm') {
      const res = await request.post(`/api/flink-sql/session/${row.id}/close`)
      if (res.code === 0) {
        Modal.message({ message: 'Session已关闭', status: 'success' })
        loadSessions()
      }
    }
  } catch (error: any) {
    Modal.message({ message: '关闭失败', status: 'error' })
  }
}

onMounted(() => {
  loadSessions()
})
</script>

<style scoped lang="less">
.session-manager-panel {
  padding: 16px;

  .toolbar {
    margin-bottom: 12px;
  }
}
</style>
