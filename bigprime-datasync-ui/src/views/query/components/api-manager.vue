<template>
  <div class="api-manager">
    <tiny-row :flex="true" style="height: 100%">
      <!-- 左侧API列表 -->
      <tiny-col :span="12" style="height: 100%; padding-right: 8px">
        <div class="api-list-panel">
          <div class="toolbar">
            <h3 style="margin: 0">API列表</h3>
            <tiny-button size="small" @click="loadApis">
              刷新
            </tiny-button>
          </div>
          
          <tiny-grid
            :data="apiList"
            :loading="loading"
            border
            size="small"
            show-overflow="tooltip"
            highlight-hover-row
            style="margin-top: 12px"
          >
            <tiny-grid-column
              title="选择"
              width="60"
              align="center"
            >
              <template #default="{ row }">
                <tiny-radio
                  v-model="selectedApiId"
                  :label="row.id"
                  @change="onSelectApi(row)"
                >
                </tiny-radio>
              </template>
            </tiny-grid-column>
            
            <tiny-grid-column
              field="apiName"
              title="API名称"
              width="140"
            ></tiny-grid-column>
            
            <tiny-grid-column
              field="apiPath"
              title="API路径"
              width="200"
            ></tiny-grid-column>
            
            <tiny-grid-column
              field="method"
              title="方法"
              width="80"
              align="center"
            >
              <template #default="{ row }">
                <tiny-tag :type="row.method === 'GET' ? 'info' : 'primary'">
                  {{ row.method }}
                </tiny-tag>
              </template>
            </tiny-grid-column>
            
            <tiny-grid-column
              field="enabled"
              title="状态"
              width="80"
              align="center"
            >
              <template #default="{ row }">
                <tiny-tag :type="row.enabled ? 'success' : 'danger'">
                  {{ row.enabled ? '启用' : '禁用' }}
                </tiny-tag>
              </template>
            </tiny-grid-column>
            
            <tiny-grid-column
              title="操作"
              width="150"
              align="center"
            >
              <template #default="{ row }">
                <div style="display: flex; gap: 10px; justify-content: center; align-items: center;">
                  <div v-if="row.enabled" title="禁用">
                    <tiny-icon-stop
                      @click.stop="toggleApi(row)"
                      style="font-size: 20px; cursor: pointer; fill: #faad14; color: #faad14;"
                    />
                  </div>
                  <div v-else title="启用">
                    <tiny-icon-start-circle
                      @click.stop="toggleApi(row)"
                      style="font-size: 20px; cursor: pointer; fill: #52c41a; color: #52c41a;"
                    />
                  </div>
                  <div title="删除">
                    <tiny-icon-del
                      @click.stop="confirmDelete(row)"
                      style="font-size: 20px; cursor: pointer; fill: #f56c6c; color: #f56c6c;"
                    />
                  </div>
                </div>
              </template>
            </tiny-grid-column>
          </tiny-grid>
        </div>
      </tiny-col>
      
      <!-- 右侧API测试 -->
      <tiny-col :span="12" style="height: 100%; padding-left: 8px">
        <div class="api-test-panel">
          <h3 style="margin-bottom: 12px">API测试</h3>
          
          <div v-if="selectedApi">
            <div class="api-info">
              <div class="info-item">
                <span class="info-label">API名称：</span>
                <span>{{ selectedApi.apiName }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">API路径：</span>
                <span class="api-path">/api/sql-api/invoke{{ selectedApi.apiPath }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">请求方法：</span>
                <tiny-tag :type="selectedApi.method === 'GET' ? 'info' : 'primary'">
                  {{ selectedApi.method }}
                </tiny-tag>
              </div>
              <div class="info-item">
                <span class="info-label">描述：</span>
                <span>{{ selectedApi.description || '无' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">SQL模板：</span>
                <pre class="sql-template">{{ selectedApi.sqlTemplate }}</pre>
              </div>
            </div>
            
            <tiny-divider>请求参数</tiny-divider>
            
            <div class="params-editor">
              <tiny-input
                v-model="testParams"
                type="textarea"
                :rows="6"
                placeholder='输入JSON格式参数，例如: {"id": 1, "name": "张三"}'
              />
            </div>
            
            <div style="margin-top: 12px">
              <tiny-button
                type="primary"
                @click="testApi"
                :loading="testing"
              >
                测试调用
              </tiny-button>
              <tiny-button
                style="margin-left: 8px"
                @click="copyApiUrl"
              >
                复制URL
              </tiny-button>
            </div>
            
            <tiny-divider>响应结果</tiny-divider>
            
            <div v-if="testResult" class="test-result">
              <div class="result-header">
                <tiny-tag :type="testResult.success ? 'success' : 'danger'">
                  {{ testResult.success ? '成功' : '失败' }}
                </tiny-tag>
                <span style="margin-left: 12px">耗时: {{ testResult.executeTime }}ms</span>
                <span v-if="testResult.totalRows !== undefined" style="margin-left: 12px">
                  返回: {{ testResult.totalRows }} 行
                </span>
              </div>
              
              <div v-if="testResult.success && testResult.rows" style="margin-top: 12px">
                <tiny-grid
                  :data="formatTestData(testResult)"
                  border
                  size="small"
                  :max-height="300"
                  show-overflow="tooltip"
                >
                  <tiny-grid-column
                    v-for="col in testResult.columns"
                    :key="col"
                    :field="col"
                    :title="col"
                    :width="120"
                  ></tiny-grid-column>
                </tiny-grid>
              </div>
              
              <tiny-alert
                v-else-if="!testResult.success"
                type="error"
                :description="testResult.message"
                :closable="false"
                style="margin-top: 12px"
              />
            </div>
          </div>
          
          <div v-else class="empty-placeholder">
            <p>请选择一个API进行测试</p>
          </div>
        </div>
      </tiny-col>
    </tiny-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  Row as TinyRow,
  Col as TinyCol,
  Grid as TinyGrid,
  GridColumn as TinyGridColumn,
  Button as TinyButton,
  Tag as TinyTag,
  Divider as TinyDivider,
  Input as TinyInput,
  Alert as TinyAlert,
  Radio as TinyRadio,
  Modal
} from '@opentiny/vue'
import { iconStop, iconStartCircle, iconDel } from '@opentiny/vue-icon'

const TinyIconStop = iconStop()
const TinyIconStartCircle = iconStartCircle()
const TinyIconDel = iconDel()
import { sqlApiApi } from '@/api/query'

const apiList = ref([])
const loading = ref(false)
const selectedApi = ref<any>(null)
const selectedApiId = ref<number | null>(null)
const testParams = ref('')
const testResult = ref<any>(null)
const testing = ref(false)

const loadApis = async () => {
  loading.value = true
  try {
    const res = await sqlApiApi.list()
    apiList.value = res.data || []
  } catch (error: any) {
    Modal.message({ message: '加载API列表失败', status: 'error' })
  } finally {
    loading.value = false
  }
}

const onSelectApi = (row: any) => {
  selectedApi.value = row
  testParams.value = ''
  testResult.value = null
}

const testApi = async () => {
  if (!selectedApi.value) return
  
  testing.value = true
  testResult.value = null
  
  try {
    let params = {}
    if (testParams.value.trim()) {
      try {
        params = JSON.parse(testParams.value)
      } catch (e) {
        Modal.message({ message: '参数格式错误，请输入有效的JSON', status: 'error' })
        testing.value = false
        return
      }
    }
    
    const res = await sqlApiApi.invoke(selectedApi.value.apiPath, params)
    testResult.value = res.data
    
    if (res.data.success) {
      Modal.message({ message: 'API调用成功', status: 'success' })
    }
  } catch (error: any) {
    testResult.value = {
      success: false,
      message: error.message || 'API调用失败'
    }
    Modal.message({ message: error.message || 'API调用失败', status: 'error' })
  } finally {
    testing.value = false
  }
}

const formatTestData = (result: any) => {
  if (!result?.rows || !result?.columns) return []
  
  const { rows, columns } = result
  return rows.map((row: any[]) => {
    const obj: any = {}
    columns.forEach((col: string, index: number) => {
      obj[col] = row[index]
    })
    return obj
  })
}

const copyApiUrl = () => {
  if (!selectedApi.value) return
  
  const url = `${window.location.origin}/api/sql-api/invoke${selectedApi.value.apiPath}`
  navigator.clipboard.writeText(url)
  Modal.message({ message: 'URL已复制到剪贴板', status: 'success' })
}

const toggleApi = async (row: any) => {
  try {
    await sqlApiApi.toggle(row.id, !row.enabled)
    Modal.message({ message: `API已${row.enabled ? '禁用' : '启用'}`, status: 'success' })
    await loadApis()
  } catch (error: any) {
    Modal.message({ message: error.message || '操作失败', status: 'error' })
  }
}

const confirmDelete = (row: any) => {
  Modal.confirm({
    message: `确定要删除API "${row.apiName}" 吗？`,
    title: '提示'
  }).then(async () => {
    try {
      await sqlApiApi.delete(row.id)
      Modal.message({ message: 'API删除成功', status: 'success' })
      await loadApis()
      
      if (selectedApi.value?.id === row.id) {
        selectedApi.value = null
        selectedApiId.value = null
        testResult.value = null
      }
    } catch (error: any) {
      Modal.message({ message: error.message || 'API删除失败', status: 'error' })
    }
  })
}

onMounted(() => {
  loadApis()
})
</script>

<style scoped lang="less">
.api-manager {
  height: 100%;
  
  .api-list-panel,
  .api-test-panel {
    height: 100%;
    padding: 16px;
    background: #fff;
    border: 1px solid #e8e8e8;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }
  
  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  
  .api-info {
    padding: 12px;
    background: #f5f5f5;
    border-radius: 4px;
    margin-bottom: 16px;
    
    .info-item {
      margin-bottom: 8px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .info-label {
        font-weight: bold;
        color: #666;
        margin-right: 8px;
      }
      
      .api-path {
        font-family: 'Consolas', 'Monaco', monospace;
        color: #5e7ce0;
        font-size: 13px;
      }
    }
  }
  
  .sql-template {
    margin-top: 8px;
    padding: 12px;
    background: #fff;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: 13px;
    max-height: 150px;
    overflow: auto;
  }
  
  .params-editor {
    :deep(.tiny-textarea) {
      font-family: 'Consolas', 'Monaco', monospace;
    }
  }
  
  .test-result {
    .result-header {
      display: flex;
      align-items: center;
    }
  }
  
  .empty-placeholder {
    padding: 60px 0;
    text-align: center;
    color: #999;
    font-size: 14px;
  }
}
</style>
