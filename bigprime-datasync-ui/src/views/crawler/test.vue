<template>
  <div class="crawler-test-container">
    <Breadcrumb :items="['爬虫管理', '功能测试']"/>
    <div class="contain">
      <tiny-tabs v-model="activeTab">
        <!-- 快速测试 -->
        <tiny-tab-item name="full" title="快速测试">
          <div class="test-panel">
            <tiny-form :model="fullForm" label-width="120px">
              <tiny-form-item label="目标URL">
                <tiny-input
                    v-model="fullForm.url"
                    placeholder="请输入要抓取的URL，例如: https://www.baidu.com"
                    style="width: 500px"
                ></tiny-input>
              </tiny-form-item>
              <tiny-form-item label="CSS选择器">
                <tiny-input
                    v-model="fullForm.selector"
                    placeholder="例如: title, .content, #header, div.article"
                    style="width: 500px"
                ></tiny-input>
                <div style="color: #999; font-size: 12px; margin-top: 4px;">
                  提示：标签名(title)、类名(.class)、ID(#id)、组合(div.content)。如需动态渲染，请在“爬虫配置”中启用Playwright
                </div>
              </tiny-form-item>
              <tiny-form-item>
                <tiny-button type="primary" :loading="fullLoading" @click="testFullProcess">
                  执行测试
                </tiny-button>
                <tiny-button @click="clearFullResult">清空结果</tiny-button>
              </tiny-form-item>
            </tiny-form>

            <div v-if="fullResult" class="result-panel">
              <div class="result-header">
                <span class="result-title">执行结果</span>
                <tiny-tag :type="fullResult.success ? 'success' : 'danger'">
                  {{ fullResult.success ? '成功' : '失败' }}
                </tiny-tag>
              </div>
              <div class="result-content">
                <div v-if="fullResult.fetchSuccess" class="result-item">
                  <div class="item-label">✓ 抓取成功</div>
                  <div class="item-value">
                    <div style="margin-bottom: 4px;">内容长度: {{ fullResult.contentLength }} 字符</div>
                    <div v-if="fullResult.renderMode" style="margin-bottom: 4px;">
                      <strong>渲染模式:</strong> 
                      <span :style="{color: fullResult.renderMode === 'playwright' ? '#52c41a' : '#1890ff'}">
                        {{ fullResult.renderMode === 'playwright' ? 'Playwright渲染' : 'HTTP抓取' }}
                      </span>
                    </div>
                    <div v-if="fullResult.connectorId" style="color: #999; font-size: 12px;">
                      连接器ID: {{ fullResult.connectorId }}
                    </div>
                  </div>
                </div>
                <div v-if="fullResult.parseSuccess" class="result-item">
                  <div class="item-label">✓ 解析成功</div>
                  <div class="item-value">
                    <!-- 图片展示 -->
                    <div v-if="fullResult.extractType === 'attr' && fullResult.attribute === 'src'">
                      <div style="margin-bottom: 8px;">
                        <strong>提取到 {{ getResultCount(fullResult.extractedData) }} 张图片</strong>
                        <span v-if="getResultCount(fullResult.extractedData) === 0 && fullResult.renderMode !== 'playwright'" style="color: #f56c6c; margin-left: 8px;">
                          (可能页面为动态加载，建议使用Playwright连接器)
                        </span>
                        <span v-if="getResultCount(fullResult.extractedData) === 0 && fullResult.renderMode === 'playwright'" style="color: #ff9800; margin-left: 8px;">
                          (已使用Playwright渲染，但页面可能不包含图片或选择器不正确)
                        </span>
                      </div>
                      <!-- 图片网格展示 - 支持滚动和点击预览 -->
                      <div v-if="getResultCount(fullResult.extractedData) > 0" 
                           class="image-grid-container"
                           style="max-height: 500px; overflow-y: auto; padding: 8px; background: #fafafa; border-radius: 4px;">
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px;">
                          <template v-if="Array.isArray(getResultData(fullResult.extractedData))">
                            <div v-for="(src, idx) in getResultData(fullResult.extractedData)" 
                                 :key="idx"
                                 class="image-item"
                                 @click="previewImage(src)"
                                 style="cursor: pointer; position: relative; border-radius: 6px; overflow: hidden; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: all 0.3s;">
                              <div style="width: 100%; height: 180px; display: flex; align-items: center; justify-content: center; background: #f5f5f5;">
                                <img :src="src" 
                                     :alt="'图片' + (idx+1)"
                                     style="max-width: 100%; max-height: 100%; object-fit: contain;"
                                     @error="handleImageError($event)"/>
                              </div>
                              <div style="padding: 8px; font-size: 12px; color: #666; background: #fff;">
                                <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" :title="src">
                                  图片 {{ idx + 1 }}
                                </div>
                              </div>
                            </div>
                          </template>
                          <div v-else
                               class="image-item"
                               @click="previewImage(getResultData(fullResult.extractedData))"
                               style="cursor: pointer; position: relative; border-radius: 6px; overflow: hidden; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                            <div style="width: 100%; height: 180px; display: flex; align-items: center; justify-content: center; background: #f5f5f5;">
                              <img :src="getResultData(fullResult.extractedData)" 
                                   alt="图片"
                                   style="max-width: 100%; max-height: 100%; object-fit: contain;"
                                   @error="handleImageError($event)"/>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div v-if="Array.isArray(getResultData(fullResult.extractedData)) && getResultData(fullResult.extractedData).length > 100" 
                           style="margin-top: 8px; color: #999; font-size: 12px;">
                        共 {{ getResultData(fullResult.extractedData).length }} 张图片
                      </div>
                    </div>
                    <!-- 链接展示 -->
                    <div v-else-if="fullResult.extractType === 'attr' && fullResult.attribute === 'href'">
                      <div style="margin-bottom: 8px;">
                        <strong>提取到 {{ getResultCount(fullResult.extractedData) }} 个链接</strong>
                        <span v-if="getResultCount(fullResult.extractedData) === 0 && fullResult.renderMode !== 'playwright'" style="color: #f56c6c; margin-left: 8px;">
                          (可能页面为动态加载，建议使用Playwright连接器)
                        </span>
                        <span v-if="getResultCount(fullResult.extractedData) === 0 && fullResult.renderMode === 'playwright'" style="color: #ff9800; margin-left: 8px;">
                          (已使用Playwright渲染，但页面可能不包含链接或选择器不正确)
                        </span>
                      </div>
                      <div v-if="getResultCount(fullResult.extractedData) > 0" 
                           class="links-container"
                           style="max-height: 400px; overflow-y: auto; padding: 12px; background: #fafafa; border-radius: 4px;">
                        <template v-if="Array.isArray(getResultData(fullResult.extractedData))">
                          <div v-for="(href, idx) in getResultData(fullResult.extractedData)" :key="idx" style="margin-bottom: 8px; padding: 8px; background: #fff; border-radius: 4px;">
                            <div style="font-size: 12px; color: #999; margin-bottom: 4px;">链接 {{ idx + 1 }}</div>
                            <a :href="href" target="_blank" style="color: #1890ff; word-break: break-all;">{{ href }}</a>
                          </div>
                        </template>
                        <a v-else :href="getResultData(fullResult.extractedData)" target="_blank" style="color: #1890ff;">{{ getResultData(fullResult.extractedData) }}</a>
                      </div>
                    </div>
                    <!-- 文本展示 -->
                    <div v-else>
                      <div style="margin-bottom: 8px;">
                        <strong>提取结果</strong>
                      </div>
                      <div class="text-result-container" style="max-height: 400px; overflow-y: auto; padding: 12px; background: #fafafa; border-radius: 4px;">
                        <pre style="margin: 0; white-space: pre-wrap; word-break: break-all;">{{ JSON.stringify(fullResult.extractedData, null, 2) }}</pre>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-if="!fullResult.success" class="result-item error">
                  <div class="item-label">✗ 失败信息</div>
                  <div class="item-value">
                    <div style="margin-bottom: 8px; font-weight: 600; color: #f56c6c;">
                      {{ fullResult.message }}
                    </div>
                    <div v-if="fullResult.errorDetail" style="margin-top: 12px; padding: 12px; background: #fff3f3; border-left: 3px solid #f56c6c; border-radius: 4px;">
                      <div style="font-weight: 600; margin-bottom: 6px;">详细错误:</div>
                      <div style="color: #666; font-size: 13px; word-break: break-all;">{{ fullResult.errorDetail }}</div>
                    </div>
                    <div v-if="fullResult.message && fullResult.message.includes('Playwright')" style="margin-top: 12px; padding: 12px; background: #fff7e6; border-left: 3px solid #faad14; border-radius: 4px;">
                      <div style="font-weight: 600; margin-bottom: 6px;">⚠️ 排查建议:</div>
                      <ul style="margin: 0; padding-left: 20px; color: #666; font-size: 13px;">
                        <li>检查Playwright连接器是否已成功连接</li>
                        <li>检查配置中的连接器ID是否正确</li>
                        <li>如使用远程模式，检查Docker服务是否运行</li>
                        <li>如使用本地模式，检查Playwright浏览器是否安装</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </tiny-tab-item>

        <!-- HTTP抓取测试 -->
        <tiny-tab-item name="fetch" title="HTTP抓取">
          <div class="test-panel">
            <tiny-form :model="fetchForm" label-width="120px">
              <tiny-form-item label="目标URL">
                <tiny-input
                    v-model="fetchForm.url"
                    placeholder="请输入要抓取的URL"
                    style="width: 500px"
                ></tiny-input>
              </tiny-form-item>
              <tiny-form-item label="请求方法">
                <tiny-select v-model="fetchForm.method" style="width: 200px">
                  <tiny-option value="GET" label="GET"></tiny-option>
                  <tiny-option value="POST" label="POST"></tiny-option>
                </tiny-select>
              </tiny-form-item>
              <tiny-form-item>
                <tiny-button type="primary" :loading="fetchLoading" @click="testHttpFetch">
                  执行抓取
                </tiny-button>
                <tiny-button @click="clearFetchResult">清空结果</tiny-button>
              </tiny-form-item>
            </tiny-form>

            <div v-if="fetchResult" class="result-panel">
              <div class="result-header">
                <span class="result-title">抓取结果</span>
                <tiny-tag :type="fetchResult.success ? 'success' : 'danger'">
                  {{ fetchResult.success ? '成功' : '失败' }}
                </tiny-tag>
              </div>
              <div class="result-content">
                <div v-if="fetchResult.success" class="result-item">
                  <div class="item-label">✓ 抓取成功</div>
                  <div class="item-value">
                    <div v-if="fetchResult.data.statusCode" style="margin-bottom: 8px;">
                      <strong>状态码:</strong> {{ fetchResult.data.statusCode }}
                    </div>
                    <div v-if="fetchResult.data.contentType" style="margin-bottom: 8px;">
                      <strong>内容类型:</strong> {{ fetchResult.data.contentType }}
                    </div>
                    <div v-if="fetchResult.data.html" style="margin-bottom: 8px;">
                      <strong>内容长度:</strong> {{ fetchResult.data.html.length }} 字符
                    </div>
                    <div v-if="fetchResult.data.charset">
                      <strong>字符集:</strong> {{ fetchResult.data.charset }}
                    </div>
                    <div v-if="fetchResult.data.duration" style="margin-top: 8px;">
                      <strong>耗时:</strong> {{ fetchResult.data.duration }} ms
                    </div>
                  </div>
                </div>
                <div v-if="!fetchResult.success" class="result-item error">
                  <div class="item-label">✗ 抓取失败</div>
                  <div class="item-value">{{ fetchResult.message || '未知错误' }}</div>
                </div>
                <div v-if="fetchResult.data?.html" class="result-item">
                  <div class="item-label">📝 HTML内容</div>
                  <div class="item-value html-content-scrollable">
                    <pre>{{ fetchResult.data.html }}</pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </tiny-tab-item>

        <!-- Robots检查 -->
        <tiny-tab-item name="robots" title="Robots检查">
          <div class="test-panel">
            <tiny-form :model="robotsForm" label-width="120px">
              <tiny-form-item label="目标URL">
                <tiny-input
                    v-model="robotsForm.url"
                    placeholder="请输入要检查的URL"
                    style="width: 500px"
                ></tiny-input>
              </tiny-form-item>
              <tiny-form-item>
                <tiny-button type="primary" :loading="robotsLoading" @click="testRobots">
                  检查Robots
                </tiny-button>
                <tiny-button @click="clearRobotsResult">清空结果</tiny-button>
              </tiny-form-item>
            </tiny-form>

            <div v-if="robotsResult" class="result-panel">
              <div class="result-header">
                <span class="result-title">检查结果</span>
                <tiny-tag :type="robotsResult.data?.allowed ? 'success' : 'danger'">
                  {{ robotsResult.data?.allowed ? '允许抓取' : '禁止抓取' }}
                </tiny-tag>
              </div>
              <div class="result-content">
                <div v-if="robotsResult.data?.allowed" class="result-item">
                  <div class="item-label">✓ Robots允许抓取</div>
                  <div class="item-value">
                    <div style="margin-bottom: 8px;">
                      <strong>是否允许:</strong> 是
                    </div>
                    <div v-if="robotsResult.data.robotsUrl" style="margin-bottom: 8px;">
                      <strong>Robots文件:</strong> {{ robotsResult.data.robotsUrl }}
                    </div>
                    <div v-if="robotsResult.data.userAgent">
                      <strong>User-Agent:</strong> {{ robotsResult.data.userAgent }}
                    </div>
                  </div>
                </div>
                <div v-if="robotsResult.data?.allowed === false" class="result-item error">
                  <div class="item-label">✗ Robots禁止抓取</div>
                  <div class="item-value">
                    <div style="margin-bottom: 8px;">
                      <strong>是否允许:</strong> 否
                    </div>
                    <div v-if="robotsResult.data.warning" style="margin-bottom: 8px;">
                      <strong>原因:</strong> {{ robotsResult.data.warning }}
                    </div>
                    <div v-if="robotsResult.data.robotsUrl" style="margin-bottom: 8px;">
                      <strong>Robots文件:</strong> {{ robotsResult.data.robotsUrl }}
                    </div>
                    <div v-if="robotsResult.data.userAgent">
                      <strong>User-Agent:</strong> {{ robotsResult.data.userAgent }}
                    </div>
                  </div>
                </div>
                <div v-if="!robotsResult.success" class="result-item error">
                  <div class="item-label">✗ 检查失败</div>
                  <div class="item-value">{{ robotsResult.message || '检查失败' }}</div>
                </div>
                <div class="result-item">
                  <div class="item-label">📄 详细信息</div>
                  <div class="item-value">
                    <pre>{{ JSON.stringify(robotsResult.data, null, 2) }}</pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </tiny-tab-item>
      </tiny-tabs>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import {
  Modal,
  TinyButton,
  TinyForm,
  TinyFormItem,
  TinyInput,
  TinyOption,
  TinySelect,
  TinyTabItem,
  TinyTabs,
  TinyTag
} from '@opentiny/vue'
import request from '@/utils/request'
import Breadcrumb from '@/components/breadcrumb/index.vue'

const activeTab = ref('full')

// 完整流程测试
const fullForm = reactive({
  url: 'https://www.baidu.com',
  selector: 'title'
})
const fullLoading = ref(false)
const fullResult = ref<any>(null)

const testFullProcess = async () => {
  if (!fullForm.url) {
    Modal.message({ message: '请输入URL', status: 'warning' })
    return
  }
  fullLoading.value = true
  try {
    const res = await request({
      url: '/api/crawler/test/full',
      method: 'post',
      data: fullForm
    })
    console.log('完整流程测试返回:', res)
    if (res.code === 0) {
      fullResult.value = res.data
      console.log('fullResult:', fullResult.value)
      Modal.message({
        message: res.data.success ? '测试成功！' : '测试失败',
        status: res.data.success ? 'success' : 'error'
      })
    }
  } catch (error: any) {
    Modal.message({ message: '测试失败: ' + error.message, status: 'error' })
  } finally {
    fullLoading.value = false
  }
}

const clearFullResult = () => {
  fullResult.value = null
}

// HTTP抓取测试
const fetchForm = reactive({
  url: 'https://www.baidu.com',
  method: 'GET'
})
const fetchLoading = ref(false)
const fetchResult = ref<any>(null)

const testHttpFetch = async () => {
  if (!fetchForm.url) {
    Modal.message({ message: '请输入URL', status: 'warning' })
    return
  }
  fetchLoading.value = true
  try {
    const res = await request({
      url: '/api/crawler/test/fetch',
      method: 'post',
      data: fetchForm
    })
    if (res.code === 0) {
      fetchResult.value = res.data
      Modal.message({
        message: res.data.success ? '抓取成功！' : '抓取失败',
        status: res.data.success ? 'success' : 'error'
      })
    }
  } catch (error: any) {
    Modal.message({ message: '抓取失败: ' + error.message, status: 'error' })
  } finally {
    fetchLoading.value = false
  }
}

const clearFetchResult = () => {
  fetchResult.value = null
}

// Robots检查
const robotsForm = reactive({
  url: 'https://www.baidu.com'
})
const robotsLoading = ref(false)
const robotsResult = ref<any>(null)

const testRobots = async () => {
  if (!robotsForm.url) {
    Modal.message({ message: '请输入URL', status: 'warning' })
    return
  }
  robotsLoading.value = true
  try {
    const res = await request({
      url: '/api/crawler/test/robots',
      method: 'post',
      data: robotsForm
    })
    if (res.code === 0) {
      robotsResult.value = res.data
      const allowed = res.data.data?.allowed
      Modal.message({
        message: allowed ? 'Robots允许抓取' : 'Robots禁止抓取',
        status: allowed ? 'success' : 'warning'
      })
    }
  } catch (error: any) {
    Modal.message({ message: '检查失败: ' + error.message, status: 'error' })
  } finally {
    robotsLoading.value = false
  }
}

const clearRobotsResult = () => {
  robotsResult.value = null
}

// 辅助方法：获取结果数据
const getResultData = (extractedData: any) => {
  if (!extractedData) return null
  // 尝试多种数据结构
  return extractedData.data?.result || extractedData.result || extractedData
}

// 辅助方法：获取结果数量
const getResultCount = (extractedData: any) => {
  const data = getResultData(extractedData)
  if (!data) return 0
  if (Array.isArray(data)) return data.length
  return data ? 1 : 0
}

// 辅助方法：获取详细信息（排除html字段）
const getDetailData = (data: any) => {
  if (!data) return data
  const { html, ...rest } = data
  return rest
}

// 图片预览
const previewImage = (src: string) => {
  window.open(src, '_blank')
}

// 图片加载错误处理
const handleImageError = (event: any) => {
  event.target.style.display = 'none'
  const parent = event.target.closest('.image-item')
  if (parent) {
    parent.style.display = 'none'
  }
}
</script>

<style scoped lang="scss">
.crawler-test-container {
  height: 100%;
  display: flex;
  flex-direction: column;

  .contain {
    flex: 1;
    padding: 16px;
    background: #fff;

    :deep(.tiny-tabs) {
      height: 100%;
    }
  }

  .test-panel {
    padding: 20px;
  }

  .result-panel {
    margin-top: 20px;
    border: 1px solid #e4e7ed;
    border-radius: 4px;
    overflow: hidden;

    .result-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: #f5f7fa;
      border-bottom: 1px solid #e4e7ed;

      .result-title {
        font-weight: 600;
        font-size: 14px;
      }
    }

    .result-content {
      padding: 16px;

      .result-item {
        margin-bottom: 16px;

        &:last-child {
          margin-bottom: 0;
        }

        .item-label {
          font-weight: 600;
          margin-bottom: 8px;
          color: #5cb87a;
        }

        &.error .item-label {
          color: #f56c6c;
        }

        .item-value {
          padding: 12px;
          background: #f9f9f9;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 13px;

          pre {
            margin: 0;
            white-space: pre-wrap;
            word-break: break-all;
          }
        }

        // 图片网格 - 悬停效果
        .image-item:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        // 滚动容器样式
        .image-grid-container,
        .links-container,
        .text-result-container {
          &::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }

          &::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 4px;

            &:hover {
              background: #a8a8a8;
            }
          }

          &::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }
        }

        // HTML内容区域：隐藏滚动条但可滚动
        .html-content-scrollable {
          max-height: 500px;
          overflow-y: auto;
          scrollbar-width: none; // Firefox
          -ms-overflow-style: none; // IE/Edge

          &::-webkit-scrollbar {
            display: none; // Chrome/Safari
          }

          pre {
            margin: 0;
            white-space: pre-wrap;
            word-break: break-all;
          }
        }

        // 详细信息区域：隐藏滚动条但可滚动
        .detail-content {
          max-height: 300px;
          overflow-y: scroll;
          scrollbar-width: none; // Firefox
          -ms-overflow-style: none; // IE/Edge

          &::-webkit-scrollbar {
            display: none; // Chrome/Safari
          }

          pre {
            margin: 0;
          }
        }
      }
    }
  }
}
</style>
