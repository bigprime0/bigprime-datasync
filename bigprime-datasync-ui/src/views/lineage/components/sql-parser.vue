<template>
  <div class="sql-parser-page">
    <!-- 顶部说明 -->
    <tiny-alert
      type="info"
      title="SQL血缘解析"
      description="输入SQL语句，系统将自动解析表级和字段级血缘关系"
      :closable="false"
      style="margin: 5px 1px"
    />

    <div class="parser-layout">
      <!-- 左侧SQL编辑器 -->
      <div class="left-panel">
        <tiny-card title="SQL输入" class="sql-editor-card">
          <template #title>
            <div class="editor-header">
              <span>SQL输入</span>
              <tiny-button size="small" @click="handleClear">清空</tiny-button>
            </div>
          </template>

          <div class="editor-content">
            <div class="sql-editor">
              <tiny-input
                v-model="sqlText"
                type="textarea"
                :rows="15"
                placeholder="请输入SQL语句，支持SELECT、INSERT、UPDATE、CREATE TABLE等"
              />
            </div>

            <div class="parse-options">
              <tiny-form inline>
                <tiny-form-item label="解析级别">
                  <tiny-radio-group v-model="parseLevel">
                    <tiny-radio label="TABLE">表级</tiny-radio>
                    <tiny-radio label="COLUMN">字段级</tiny-radio>
                    <tiny-radio label="BOTH">表级+字段级</tiny-radio>
                  </tiny-radio-group>
                </tiny-form-item>

                <tiny-form-item label="自动保存">
                  <tiny-switch v-model="autoSave" />
                  <span style="margin-left: 8px; font-size: 12px; color: #999">
                    解析后自动保存血缘关系
                  </span>
                </tiny-form-item>
              </tiny-form>
            </div>

            <div class="parse-actions">
              <tiny-button
                type="primary"
                @click="handleParse"
                :loading="parsing"
                style="width: 100%"
              >
                {{ parsing ? '解析中...' : '解析SQL血缘' }}
              </tiny-button>
            </div>
          </div>
        </tiny-card>
      </div>

      <!-- 右侧解析结果 -->
      <div class="right-panel">
        <tiny-card title="解析结果" class="result-card">
          <div v-if="!parseResult" class="empty-result">
            <div class="empty-icon">📝</div>
            <div class="empty-text">输入SQL后点击"解析SQL血缘"查看结果</div>
          </div>

          <div v-else class="result-content">
            <!-- 统计信息 -->
            <div class="stats-section">
              <div class="stat-item">
                <div class="stat-label">源表数量</div>
                <div class="stat-value">{{ getSourceTableCount() }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">目标表数量</div>
                <div class="stat-value">{{ getTargetTableCount() }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">字段血缘</div>
                <div class="stat-value">{{ parseResult.columnLineages?.length || 0 }}</div>
              </div>
            </div>

            <tiny-divider />

            <!-- 表级血缘 -->
            <div class="lineage-section">
              <div class="section-title">
                <span>表级血缘</span>
                <tiny-tag type="success">{{ parseResult.tableLineages?.length || 0 }} 条</tiny-tag>
              </div>

              <div v-if="parseResult.tableLineages && parseResult.tableLineages.length > 0">
                <div
                  v-for="(item, index) in parseResult.tableLineages"
                  :key="index"
                  class="lineage-item"
                >
                  <div class="lineage-flow">
                    <tiny-tag type="info">{{ item.sourceTable }}</tiny-tag>
                    <span class="arrow">→</span>
                    <tiny-tag type="success">{{ item.targetTable }}</tiny-tag>
                  </div>
                  <div class="lineage-type">
                    <tiny-tag size="small" :type="getLineageTypeColor(item.type)">
                      {{ item.type }}
                    </tiny-tag>
                  </div>
                </div>
              </div>
              <div v-else class="empty-lineage">暂无表级血缘</div>
            </div>

            <tiny-divider />

            <!-- 字段级血缘 -->
            <div class="lineage-section" v-if="parseLevel !== 'TABLE'">
              <div class="section-title">
                <span>字段级血缘</span>
                <tiny-tag type="warning">{{ parseResult.columnLineages?.length || 0 }} 条</tiny-tag>
              </div>

              <div v-if="parseResult.columnLineages && parseResult.columnLineages.length > 0">
                <tiny-collapse v-model="activeColumns" accordion>
                  <tiny-collapse-item
                    v-for="(item, index) in parseResult.columnLineages"
                    :key="index"
                    :name="index"
                  >
                    <template #title>
                      <div class="column-lineage-title">
                        <span>{{ item.targetColumn }}</span>
                        <tiny-tag size="small"
                          >{{ item.sourceColumns?.length || 0 }} 个源字段</tiny-tag
                        >
                      </div>
                    </template>

                    <div class="column-sources">
                      <div
                        v-for="(source, idx) in item.sourceColumns"
                        :key="idx"
                        class="source-item"
                      >
                        <tiny-tag type="info" size="small">{{ source }}</tiny-tag>
                      </div>
                      <div v-if="item.expression" class="expression">
                        <div class="expression-label">转换表达式:</div>
                        <code>{{ item.expression }}</code>
                      </div>
                    </div>
                  </tiny-collapse-item>
                </tiny-collapse>
              </div>
              <div v-else class="empty-lineage">暂无字段级血缘</div>
            </div>

            <!-- 保存操作 -->
            <div class="save-section" v-if="!autoSave">
              <tiny-button type="success" @click="handleSave" :loading="saving" style="width: 100%">
                保存血缘关系
              </tiny-button>
            </div>
          </div>
        </tiny-card>
      </div>
    </div>

    <!-- 解析历史 -->
    <tiny-card title="解析历史" class="history-card">
      <div class="history-content">
        <tiny-grid :data="historyList" :max-height="220">
          <tiny-grid-column field="sql" title="SQL语句" show-overflow />
          <tiny-grid-column field="sqlType" title="解析级别" width="100">
            <template #default="{ row }">
              <tiny-tag size="small">{{ row.sqlType }}</tiny-tag>
            </template>
          </tiny-grid-column>
          <tiny-grid-column field="sourceTableCount" title="表数量" width="80" />
          <tiny-grid-column field="columnLineageCount" title="字段数量" width="90" />
          <tiny-grid-column field="createTime" title="解析时间" width="180" align="center">
            <template #default="{ row }">
              {{ formatDateTime(row.createTime) }}
            </template>
          </tiny-grid-column>
          <tiny-grid-column title="操作" width="100" align="center">
            <template #default="{ row }">
              <div style="display: flex; gap: 10px; justify-content: center; align-items: center;">
                <div title="加载">
                  <tiny-icon-import
                    @click="handleLoadHistory(row)"
                    style="font-size: 20px; cursor: pointer; fill: #409eff; color: #409eff;"
                  />
                </div>
              </div>
            </template>
          </tiny-grid-column>
        </tiny-grid>
      </div>
    </tiny-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import {
  Card as TinyCard,
  Button as TinyButton,
  Input as TinyInput,
  Form as TinyForm,
  FormItem as TinyFormItem,
  RadioGroup as TinyRadioGroup,
  Radio as TinyRadio,
  Switch as TinySwitch,
  Alert as TinyAlert,
  Tag as TinyTag,
  Divider as TinyDivider,
  Collapse as TinyCollapse,
  CollapseItem as TinyCollapseItem,
  Grid as TinyGrid,
  GridColumn as TinyGridColumn,
  Modal
} from '@opentiny/vue'
import { iconImport } from '@opentiny/vue-icon'
import request from '@/utils/request'
import dayjs from 'dayjs'

const TinyIconImport = iconImport()

const sqlText = ref('')
const parseLevel = ref('BOTH')
const autoSave = ref(true)
const parsing = ref(false)
const saving = ref(false)
const parseResult = ref(null)
const activeColumns = ref([])
const historyList = ref([])

// 计算源表数量
const getSourceTableCount = () => {
  if (!parseResult.value?.tableLineages) return 0
  const sourceTables = new Set()
  parseResult.value.tableLineages.forEach(item => {
    if (item.sourceTable) sourceTables.add(item.sourceTable)
  })
  return sourceTables.size
}

// 计算目标表数量
const getTargetTableCount = () => {
  if (!parseResult.value?.tableLineages) return 0
  const targetTables = new Set()
  parseResult.value.tableLineages.forEach(item => {
    if (item.targetTable) targetTables.add(item.targetTable)
  })
  return targetTables.size
}

// 解析SQL
const handleParse = async () => {
  if (!sqlText.value.trim()) {
    Modal.message({ message: '请输入SQL语句', status: 'warning' })
    return
  }

  parsing.value = true
  try {
    const response = await request({
      url: '/api/lineage/sql-parse/parse',
      method: 'post',
      data: {
        sql: sqlText.value,
        databaseType: 'MYSQL',
        defaultDatabase: '',
        defaultSchema: ''
      }
    })

    console.log('解析响应:', response)

    // 血缘接口返回 { code: 0, data: {...} }
    if (response.code === 0 && response.data) {
      parseResult.value = response.data
      console.log('解析结果:', parseResult.value)
      Modal.message({ message: '解析成功', status: 'success' })

      // 如果开启自动保存，调用保存接口
      if (autoSave.value) {
        console.log('自动保存开关已开启，开始保存血缘关系')
        try {
          await handleSave()
        } catch (saveError) {
          console.error('自动保存失败:', saveError)
        }
      } else {
        console.log('自动保存开关未开启')
      }

      // 加载历史
      loadHistory()
    }
  } catch (error) {
    console.error('解析失败:', error)
    Modal.message({ message: '解析失败: ' + (error.message || '未知错误'), status: 'error' })
  } finally {
    parsing.value = false
  }
}

// 保存血缘关系
const handleSave = async () => {
  if (!parseResult.value) {
    console.warn('解析结果为空，无法保存')
    return
  }

  console.log('开始保存血缘关系:', parseResult.value)
  saving.value = true
  try {
    const response = await request({
      url: '/api/lineage/sql-parse/save',
      method: 'post',
      data: parseResult.value
    })

    console.log('保存响应:', response)
    Modal.message({ message: '保存成功', status: 'success' })
  } catch (error) {
    console.error('保存失败:', error)
    Modal.message({ message: '保存失败: ' + (error.message || '未知错误'), status: 'error' })
  } finally {
    saving.value = false
  }
}

// 清空
const handleClear = () => {
  sqlText.value = ''
  parseResult.value = null
}

// 加载历史
const loadHistory = async () => {
  try {
    const response = await request({
      url: '/api/lineage/sql-parse/history',
      method: 'get',
      params: {
        pageSize: 10
      }
    })
    // 血缘接口返回 { code: 0, data: [...] }
    historyList.value = (response.code === 0 && response.data) ? response.data : []
  } catch (error) {
    console.error('加载历史失败:', error)
    historyList.value = []
  }
}

// 加载历史记录
const handleLoadHistory = (row) => {
  sqlText.value = row.sql
  parseLevel.value = row.parseLevel
}

// 获取血缘类型颜色
const getLineageTypeColor = (type) => {
  const map = {
    READ: 'info',
    WRITE: 'danger',
    TRANSFORM: 'warning'
  }
  return map[type] || 'default'
}

// 格式化时间为 yyyy-mm-dd hh:mi:ss
const formatDateTime = (timestamp) => {
  if (!timestamp) return '-'
  
  // 处理后端返回的数组格式: [2025, 12, 20, 3, 24, 6]
  if (Array.isArray(timestamp)) {
    const [year, month, day, hour, minute, second] = timestamp
    // 注意：JavaScript 的月份是 0-11，但后端返回的是 1-12
    return dayjs(new Date(year, month - 1, day, hour, minute, second)).format('YYYY-MM-DD HH:mm:ss')
  }
  
  // 处理 LocalDateTime 格式（如 "2024-12-20T10:30:00"）
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')
}

onMounted(() => {
  loadHistory()
})
</script>

<style scoped lang="less">
.sql-parser-page {
  height: calc(100vh - 140px);
  display: flex;
  flex-direction: column;
  gap: 8px;

  // 覆盖 TinyVue Card 的默认宽度限制
  :deep(.tiny-card) {
    width: 100% !important;
  }

  .parser-layout {
    display: flex;
    gap: 16px;
    flex: 1;
    min-height: 0;

    .left-panel,
    .right-panel {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .left-panel {
      .sql-editor-card {
        height: 100%;
        display: flex;
        flex-direction: column;

        :deep(.tiny-card__body) {
          flex: 1;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .editor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          margin-bottom: 2px;
        }

        .editor-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          height: calc(100vh - 560px);
        }

        .sql-editor {
          flex: 1;
          margin-bottom: 16px;
          overflow: hidden;

          :deep(.tiny-textarea) {
            height: 100%;
          }

          :deep(.tiny-textarea__inner) {
            font-family: 'Courier New', monospace;
            font-size: 13px;
            height: 100% !important;
            resize: none;
          }
        }

        .parse-options {
          margin-bottom: 5px;
          flex-shrink: 0;
        }

        .parse-actions {
          flex-shrink: 0;
        }
      }
    }

    .right-panel {
      .result-card {
        height: 100%;
        display: flex;
        flex-direction: column;

        :deep(.tiny-card__body) {
          flex: 1;
          overflow-y: auto;
        }

        .empty-result {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: calc(100vh - 560px);

          .empty-icon {
            font-size: 64px;
            margin-bottom: 16px;
          }

          .empty-text {
            color: #999;
            font-size: 14px;
          }
        }

        .result-content {
          .stats-section {
            display: flex;
            gap: 16px;
            margin-bottom: 16px;

            .stat-item {
              text-align: center;

              .stat-label {
                font-size: 12px;
                color: #999;
                margin-bottom: 8px;
              }

              .stat-value {
                font-size: 24px;
                font-weight: bold;
                color: #1890ff;
              }
            }
          }

          .lineage-section {
            margin-bottom: 16px;

            .section-title {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 12px;
              font-weight: 500;
            }

            .lineage-item {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 12px;
              border: 1px solid #e8e8e8;
              border-radius: 4px;
              margin-bottom: 8px;

              .lineage-flow {
                display: flex;
                align-items: center;
                gap: 12px;

                .arrow {
                  color: #999;
                  font-size: 16px;
                }
              }
            }

            .column-lineage-title {
              display: flex;
              justify-content: space-between;
              align-items: center;
              width: 100%;
              padding-right: 16px;
            }

            .column-sources {
              .source-item {
                margin-bottom: 8px;
              }

              .expression {
                margin-top: 12px;
                padding: 12px;
                background: #f5f5f5;
                border-radius: 4px;

                .expression-label {
                  font-size: 12px;
                  color: #999;
                  margin-bottom: 8px;
                }

                code {
                  font-size: 13px;
                  font-family: 'Courier New', monospace;
                }
              }
            }

            .empty-lineage {
              text-align: center;
              padding: 24px;
              color: #999;
              font-size: 14px;
            }
          }

          .save-section {
            margin-top: 24px;
          }
        }
      }
    }
  }

  .history-card {
    flex-shrink: 0;
    height: 285px;

    :deep(.tiny-card--logo) {
      padding: 15px;
    }

    :deep(.tiny-card__body) {
      //padding: 12px 16px;
    }

    .history-content {
      :deep(.tiny-grid) {
        .tiny-grid__body-wrapper {
          max-height: 150px;
          overflow-y: auto;
        }
      }
    }
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
