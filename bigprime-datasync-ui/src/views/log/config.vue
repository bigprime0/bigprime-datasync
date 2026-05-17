<template>
  <div class="container-list">
    <Breadcrumb :items="['日志管理', '日志配置']" />
    
    <div class="contain">
      <!-- Loki 连接器配置 -->
      <div class="config-card">
        <div class="card-header">
          <h3>Loki 连接器信息</h3>
          <tiny-button size="small" type="primary" @click="testConnection">
            测试连接
          </tiny-button>
        </div>
        
        <div class="loki-info">
          <div class="info-item">
            <span class="label">连接地址：</span>
            <span class="value">{{ lokiInfo.url || '加载中...' }}</span>
          </div>
          <div class="info-item">
            <span class="label">连接状态：</span>
            <tiny-tag :type="lokiInfo.status === 'connected' ? 'success' : 'danger'">
              {{ lokiInfo.status === 'connected' ? '已连接' : '未连接' }}
            </tiny-tag>
          </div>
          <div class="info-item" v-if="lokiInfo.version">
            <span class="label">版本信息：</span>
            <span class="value">{{ lokiInfo.version }}</span>
          </div>
        </div>
        
        <tiny-alert type="info" :closable="false" style="margin-top: 20px">
          <template #description>
            <p>当前 Loki 地址由系统配置文件（bootstrap.yaml）统一管理，确保日志采集和查询使用同一实例。</p>
            <p>如需修改 Loki 地址，请联系系统管理员更新配置文件并重启服务。</p>
          </template>
        </tiny-alert>
      </div>

     <!-- SkyWalking 连接器配置 -->
      <div class="config-card">
        <div class="card-header">
          <h3>SkyWalking 连接器配置</h3>
          <tiny-button size="small" type="primary" @click="saveSkyWalkingConfig">
            保存配置
          </tiny-button>
        </div>
        
        <div class="skywalking-config">
          <div class="config-item">
            <div class="config-label">
              <span class="label-text">选择 SkyWalking UI 连接器</span>
            </div>
            <div class="config-content">
              <tiny-select 
                v-model="skyWalkingConfig.connectorId" 
                placeholder="请选择 SkyWalking 连接器"
                style="width: 100%"
                filterable
                clearable
              >
                <tiny-option 
                  v-for="connector in skyWalkingConnectors" 
                  :key="connector.id" 
                  :label="connector.name" 
                  :value="connector.id"
                >
                  <div class="connector-option">
                    <span>{{ connector.name }}</span>
                    <tiny-tag 
                      :type="connector.status === 'CONNECTED' ? 'success' : 'info'" 
                      size="small"
                    >
                      {{ connector.status === 'CONNECTED' ? '已连接' : connector.status }}
                    </tiny-tag>
                  </div>
                </tiny-option>
              </tiny-select>
            </div>
            <div class="config-desc">
              选择配置好的 SkyWalking UI 连接器，用于日志中的 TraceId 跳转功能
            </div>
          </div>
          
          <div class="config-item" v-if="skyWalkingConfig.connectorId" style="margin-top: 20px">
            <div class="config-label">
              <span class="label-text">连接器信息</span>
            </div>
            <div class="info-display">
              <div class="info-row" v-if="selectedConnectorInfo">
                <span class="info-label">连接地址：</span>
                <span class="info-value">{{ selectedConnectorInfo.url || '-' }}</span>
              </div>
              <div class="info-row" v-if="selectedConnectorInfo">
                <span class="info-label">连接状态：</span>
                <tiny-tag :type="selectedConnectorInfo.status === 'CONNECTED' ? 'success' : 'info'">
                  {{ selectedConnectorInfo.status || '-' }}
                </tiny-tag>
              </div>
            </div>
          </div>
        </div>
        
        <tiny-alert type="info" :closable="false" style="margin-top: 20px">
          <template #description>
            <p>提示：</p>
            <ul>
              <li>请先在"连接器管理"中创建并配置 SkyWalking 连接器</li>
              <li>配置后，点击日志中的 TraceId 可直接跳转到 SkyWalking 查看调用链</li>
              <li>如未配置，将使用默认地址（http://localhost:8080）</li>
            </ul>
          </template>
        </tiny-alert>
      </div>

      <!-- 日志脱敏配置 -->
      <div class="config-card">
        <div class="card-header">
          <h3>日志脱敏配置</h3>
          <tiny-button size="small" type="primary" @click="saveMaskConfig">
            保存配置
          </tiny-button>
        </div>
        
        <div class="mask-config">
          <div class="config-item">
            <div class="config-label">
              <span class="label-text">开启日志脱敏</span>
              <tiny-switch v-model="maskConfig.enabled" />
            </div>
            <div class="config-desc">
              开启后，在日志查询、详情、上下文和导出中都会自动应用脱敏规则，保护敏感信息
            </div>
          </div>
          
          <div class="config-item" style="margin-top: 20px">
            <div class="config-label">
              <span class="label-text">当前状态</span>
              <tiny-tag :type="maskConfig.enabled ? 'success' : 'info'">
                {{ maskConfig.enabled ? '已开启' : '已关闭' }}
              </tiny-tag>
            </div>
          </div>
        </div>
        
        <tiny-alert type="warning" :closable="false" style="margin-top: 20px">
          <template #description>
            <p>提示：</p>
            <ul>
              <li>脱敏规则可在“脱敏规则”页面中管理</li>
              <li>关闭脱敏后，所有日志将显示原始内容</li>
              <li>建议在生产环境中开启脱敏功能，保护用户敏感信息</li>
            </ul>
          </template>
        </tiny-alert>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import {
  TinyButton,
  Tag as TinyTag,
  TinyAlert,
  Switch as TinySwitch,
  Select as TinySelect,
  Option as TinyOption,
  Modal
} from '@opentiny/vue'
import Breadcrumb from '@/components/breadcrumb/index.vue'
import { testLokiConnection, getLokiInfo } from '@/services/log'
import { ConnectorService } from '@/services/connector'

// Loki 信息
const lokiInfo = reactive({
  url: '',
  status: 'disconnected',
  version: ''
})

// 脱敏配置
const maskConfig = reactive({
  enabled: false
})

// SkyWalking 配置
const skyWalkingConfig = reactive({
  connectorId: ''
})

// SkyWalking 连接器列表
const skyWalkingConnectors = ref<any[]>([])

// 获取当前选中的连接器信息
const selectedConnectorInfo = computed(() => {
  if (!skyWalkingConfig.connectorId) return null
  const connector = skyWalkingConnectors.value.find(c => c.id === skyWalkingConfig.connectorId)
  if (!connector) return null
  
  // 如果连接器有 connectorParams，解析获取 URL
  if (connector.connectorParams) {
    try {
      const params = JSON.parse(connector.connectorParams)
      return {
        ...connector,
        url: params.url || '-'
      }
    } catch (e) {
      console.error('解析连接器参数失败:', e)
    }
  }
  
  return connector
})

// 测试连接
const testConnection = async () => {
  try {
    Modal.message({ message: '正在测试连接...', status: 'info' })
    const result = await testLokiConnection()
    // 后端返回 Result<Map<String, Object>>
    if (result && result.status === 'success') {
      lokiInfo.status = 'connected'
      Modal.message({ message: '连接成功', status: 'success' })
    } else {
      lokiInfo.status = 'disconnected'
      Modal.message({ message: '连接失败: ' + (result?.message || '未知错误'), status: 'error' })
    }
  } catch (error: any) {
    lokiInfo.status = 'disconnected'
    Modal.message({ message: '连接失败: ' + error.message, status: 'error' })
  }
}

// 加载 Loki 信息
const loadLokiInfo = async () => {
  try {
    const result = await getLokiInfo()
    console.log('Loki信息接口返回:', result)
    
    // 兼容两种数据格式
    const data = result.data || result
    
    if (data.url) {
      lokiInfo.url = data.url
      lokiInfo.status = data.status || 'disconnected'
      lokiInfo.version = data.version || ''
    } else {
      console.warn('Loki信息数据格式异常:', result)
    }
  } catch (error: any) {
    console.error('加载 Loki 信息失败:', error)
    Modal.message({ message: '加载配置失败: ' + error.message, status: 'error' })
  }
}

// 加载脱敏配置
const loadMaskConfig = () => {
  const saved = localStorage.getItem('logMaskEnabled')
  if (saved !== null) {
    maskConfig.enabled = saved === 'true'
  }
}

// 保存脱敏配置
const saveMaskConfig = () => {
  localStorage.setItem('logMaskEnabled', String(maskConfig.enabled))
  Modal.message({ 
    message: '配置已保存，脱敏功能已' + (maskConfig.enabled ? '开启' : '关闭'), 
    status: 'success' 
  })
}

// 加载 SkyWalking 连接器列表
const loadSkyWalkingConnectors = async () => {
  try {
    const res: any = await ConnectorService.getConnectorList({
      page: 1,
      pageSize: 100,
      search: ''
    })
    
    if (res.msg === 'success' && res.data?.list) {
      // 过滤出 SkyWalking 连接器（不区分大小写，包含匹配）
      skyWalkingConnectors.value = res.data.list.filter((connector: any) => {
        const product = (connector.product || '').toLowerCase().trim()
        return product.includes('skywalking')
      }).map((connector: any) => ({
        id: connector.id,
        name: connector.name,
        status: connector.status,
        product: connector.product,
        connectorParams: connector.connectorParams,
        url: connector.url || ''
      }))
      
      console.log('过滤后的 SkyWalking 连接器:', skyWalkingConnectors.value)
    } else {
      console.warn('接口返回格式异常:', res)
    }
  } catch (error: any) {
    console.error('加载 SkyWalking 连接器列表失败:', error)
  }
}

// 加载 SkyWalking 配置
const loadSkyWalkingConfig = () => {
  const saved = localStorage.getItem('skyWalkingConnectorId')
  if (saved) {
    skyWalkingConfig.connectorId = saved
  }
}

// 保存 SkyWalking 配置
const saveSkyWalkingConfig = () => {
  if (skyWalkingConfig.connectorId) {
    localStorage.setItem('skyWalkingConnectorId', skyWalkingConfig.connectorId)
    Modal.message({ 
      message: 'SkyWalking 连接器配置已保存', 
      status: 'success' 
    })
  } else {
    localStorage.removeItem('skyWalkingConnectorId')
    Modal.message({ 
      message: '已清除 SkyWalking 连接器配置', 
      status: 'info' 
    })
  }
}

onMounted(() => {
  // 加载 Loki 信息
  loadLokiInfo()
  // 加载脱敏配置
  loadMaskConfig()
  // 加载 SkyWalking 连接器列表
  loadSkyWalkingConnectors()
  // 加载 SkyWalking 配置
  loadSkyWalkingConfig()
})
</script>

<style scoped lang="less">
.container-list {
  height: 100%;
  overflow-y: auto;
  
  // 隐藏滚动条但保留滚动功能
  scrollbar-width: none;
  -ms-overflow-style: none;
  
  &::-webkit-scrollbar {
    display: none;
  }

  .contain {
    margin-top: 20px;
    padding: 0 20px 40px 20px;
  }

  .page-content {
    max-width: 1200px;
    margin: 0 auto;
  }

  .config-card {
    background: #fff;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 2px solid #f0f2f5;

      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #303133;
        display: flex;
        align-items: center;

        &::before {
          content: '';
          display: inline-block;
          width: 4px;
          height: 18px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 2px;
          margin-right: 10px;
        }
      }
    }
  }

  .loki-info {
    .info-item {
      display: flex;
      align-items: center;
      padding: 16px;
      background: #f5f7fa;
      border-radius: 8px;
      margin-bottom: 12px;

      .label {
        font-weight: 600;
        color: #606266;
        min-width: 100px;
      }

      .value {
        flex: 1;
        color: #303133;
        font-family: 'Courier New', monospace;
      }
    }
  }

  .mask-config {
    .config-item {
      .config-label {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px;
        background: #f5f7fa;
        border-radius: 8px;
        
        .label-text {
          font-weight: 600;
          color: #303133;
          font-size: 14px;
        }
      }
      
      .config-desc {
        padding: 12px 16px;
        color: #606266;
        font-size: 13px;
        line-height: 1.6;
      }
    }
  }

  .skywalking-config {
    .config-item {
      .config-label {
        padding: 12px 0;
        margin-bottom: 12px;
        
        .label-text {
          font-weight: 600;
          color: #303133;
          font-size: 14px;
        }
      }
      
      .config-content {
        margin-bottom: 8px;
      }
      
      .config-desc {
        padding: 8px 0;
        color: #909399;
        font-size: 13px;
        line-height: 1.6;
      }
      
      .info-display {
        background: #f5f7fa;
        border-radius: 8px;
        padding: 16px;
        
        .info-row {
          display: flex;
          align-items: center;
          padding: 8px 0;
          
          .info-label {
            font-weight: 600;
            color: #606266;
            min-width: 100px;
          }
          
          .info-value {
            flex: 1;
            color: #303133;
            font-family: 'Courier New', monospace;
          }
        }
      }
    }
  }
  
  // 连接器选项样式
  :deep(.connector-option) {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }

  :deep(.tiny-form-item) {
    margin-bottom: 20px;
  }
}
</style>
