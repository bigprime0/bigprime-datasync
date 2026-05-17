<template>
  <div class="crawler-config-container">
    <Breadcrumb :items="['爬虫管理', '爬虫配置']"/>
    <div class="contain">
      <div class="config-panel">
        <div class="section-title">全局配置</div>
        <tiny-form :model="configForm" label-width="150px" style="max-width: 800px;">
          <tiny-form-item label="默认Playwright连接器">
            <tiny-select v-model="configForm.defaultPlaywrightConnector" style="width: 400px;" placeholder="选择Playwright连接器">
              <tiny-option
                  v-for="connector in playwrightConnectors"
                  :key="connector.id"
                  :value="connector.id"
                  :label="connector.name"
              ></tiny-option>
            </tiny-select>
            <div style="color: #999; font-size: 12px; margin-top: 4px;">
              配置后，所有爬虫任务和测试功能将自动使用此连接器进行动态页面渲染
            </div>
          </tiny-form-item>

          <tiny-form-item label="启用Playwright渲染">
            <tiny-switch v-model="configForm.enablePlaywright"></tiny-switch>
            <span style="margin-left: 8px; color: #666;">{{ configForm.enablePlaywright ? '已启用' : '已禁用' }}</span>
            <div style="color: #999; font-size: 12px; margin-top: 4px;">
              启用后，爬虫任务将优先使用Playwright渲染动态页面（适用于京东、淘宝等SPA应用）
            </div>
          </tiny-form-item>

          <tiny-form-item label="渲染等待时间(毫秒)">
            <tiny-numeric
                v-model="configForm.renderWaitTime"
                :min="0"
                :max="10000"
                :step="500"
                style="width: 200px;"
            ></tiny-numeric>
            <div style="color: #999; font-size: 12px; margin-top: 4px;">
              页面加载后额外等待时间，用于等待AJAX请求完成（默认2000毫秒）
            </div>
          </tiny-form-item>

          <tiny-form-item label="页面加载超时(毫秒)">
            <tiny-numeric
                v-model="configForm.renderTimeout"
                :min="5000"
                :max="60000"
                :step="5000"
                style="width: 200px;"
            ></tiny-numeric>
            <div style="color: #999; font-size: 12px; margin-top: 4px;">
              页面加载的最大等待时间（默认30000毫秒）
            </div>
          </tiny-form-item>

          <tiny-form-item>
            <tiny-button type="primary" @click="saveConfig" :loading="saving">保存配置</tiny-button>
            <tiny-button @click="loadConfig">重置</tiny-button>
          </tiny-form-item>
        </tiny-form>
      </div>

      <div class="info-panel">
        <div class="section-title">配置说明</div>
        <div class="info-content">
          <p><strong>💡 使用场景</strong></p>
          <ul>
            <li>配置后，快速测试、任务执行等功能将自动使用Playwright渲染</li>
            <li>适用于需要JavaScript渲染的动态网站（如：京东、淘宝、拼多多等）</li>
            <li>静态网站建议关闭Playwright，使用HTTP抓取更快</li>
          </ul>
          
          <p><strong>⚙️ 连接器配置</strong></p>
          <ul>
            <li>请先在"连接器管理"中配置Playwright连接器</li>
            <li>推荐使用Docker部署的远程Playwright服务</li>
            <li>配置完成后，可在此处选择默认连接器</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import {
  Modal,
  TinyButton,
  TinyForm,
  TinyFormItem,
  Numeric as TinyNumeric,
  TinyOption,
  TinySelect,
  TinySwitch
} from '@opentiny/vue'
import request from '@/utils/request'
import Breadcrumb from '@/components/breadcrumb/index.vue'

const configForm = reactive({
  defaultPlaywrightConnector: '',
  enablePlaywright: false,
  renderWaitTime: 2000,
  renderTimeout: 30000
})

const playwrightConnectors = ref<any[]>([])
const saving = ref(false)

// 加载Playwright连接器列表
const loadPlaywrightConnectors = async () => {
  try {
    const res = await request({
      url: '/api/connector/list',
      method: 'post',
      data: {
        page: 1,
        pageSize: 100,
        search: ''
      }
    })
    if (res.code === 0 && res.data?.list) {
      // 前端筛选Playwright连接器（product为playwright或browser）
      playwrightConnectors.value = res.data.list.filter((item: any) => {
        const product = item.product?.toLowerCase() || ''
        return product === 'playwright' || product === 'browser'
      })
      console.log('加载到Playwright连接器:', playwrightConnectors.value.length)
    }
  } catch (error: any) {
    console.error('加载连接器列表失败:', error)
  }
}

// 加载配置
const loadConfig = async () => {
  try {
    const res = await request({
      url: '/api/crawler/config/get',
      method: 'get'
    })
    if (res.code === 0 && res.data) {
      Object.assign(configForm, res.data)
    }
  } catch (error: any) {
    console.error('加载配置失败:', error)
  }
}

// 保存配置
const saveConfig = async () => {
  if (configForm.enablePlaywright && !configForm.defaultPlaywrightConnector) {
    Modal.message({ message: '请选择默认Playwright连接器', status: 'warning' })
    return
  }

  saving.value = true
  try {
    const res = await request({
      url: '/api/crawler/config/save',
      method: 'post',
      data: configForm
    })
    if (res.code === 0) {
      Modal.message({ message: '配置保存成功', status: 'success' })
      await loadConfig()
    } else {
      Modal.message({ message: res.message || '保存失败', status: 'error' })
    }
  } catch (error: any) {
    Modal.message({ message: '保存失败: ' + error.message, status: 'error' })
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadPlaywrightConnectors()
  loadConfig()
})
</script>

<style scoped lang="scss">
.crawler-config-container {
  height: 100%;
  display: flex;
  flex-direction: column;

  .contain {
    flex: 1;
    padding: 16px;
    background: #fff;
    overflow-y: auto;
  }

  .config-panel {
    margin-bottom: 24px;
    padding: 20px;
    background: #fff;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
  }

  .info-panel {
    padding: 20px;
    background: #f5f7fa;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
  }

  .section-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 2px solid #409eff;
  }

  .info-content {
    p {
      margin: 12px 0 8px 0;
      font-weight: 500;
    }

    ul {
      margin: 0;
      padding-left: 24px;
      
      li {
        margin: 6px 0;
        color: #666;
        line-height: 1.6;
      }
    }
  }
}
</style>
