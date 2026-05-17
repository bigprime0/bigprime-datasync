<template>
  <div class="execution-plan-analyzer">
    <div v-if="!analysisResult" class="empty-state">
      <p>点击"执行计划"按钮查看SQL执行计划分析</p>
    </div>

    <div v-else class="analysis-result">
      <!-- 分析摘要 - 紧凑标签样式 -->
      <div class="summary-tags">
        <tiny-tag size="large" type="info">
          分析耗时: {{ analysisResult.analyzeTime }}ms
        </tiny-tag>
        <tiny-tag 
          size="large" 
          :type="analysisResult.issues.length > 0 ? 'danger' : 'success'"
        >
          检测到问题: {{ analysisResult.issues.length }} 个
        </tiny-tag>
        <tiny-tag size="large" type="warning">
          优化建议: {{ analysisResult.suggestions.length }} 条
        </tiny-tag>
      </div>

      <!-- Tab切换 -->
      <div class="tabs-container">
        <tiny-tabs v-model="activeTab">
          <!-- 执行计划文本 -->
          <tiny-tab-item name="plan" title="执行计划">
            <div class="plan-text-panel">
              <pre class="plan-text">{{ analysisResult.planText }}</pre>
            </div>
          </tiny-tab-item>

          <!-- 性能问题 -->
          <tiny-tab-item name="issues" :title="`性能问题 (${analysisResult.issues.length})`">
            <div class="issues-panel">
              <div v-if="analysisResult.issues.length === 0" class="empty-tip">
                <tiny-icon-success style="font-size: 48px; color: #52c41a" />
                <p style="margin-top: 16px; color: #999">未检测到性能问题</p>
              </div>

              <div v-else class="issue-list">
                <div
                  v-for="(issue, idx) in analysisResult.issues"
                  :key="idx"
                  class="issue-item"
                  :class="`severity-${issue.severity.toLowerCase()}`"
                >
                  <div class="issue-header">
                    <tiny-tag :type="getSeverityTagType(issue.severity)">
                      {{ getSeverityText(issue.severity) }}
                    </tiny-tag>
                    <span class="issue-type">{{ getIssueTypeText(issue.type) }}</span>
                  </div>
                  <div class="issue-content">
                    {{ issue.description }}
                  </div>
                </div>
              </div>
            </div>
          </tiny-tab-item>

          <!-- 优化建议 -->
          <tiny-tab-item name="suggestions" :title="`优化建议 (${analysisResult.suggestions.length})`">
            <div class="suggestions-panel">
              <div
                v-for="(suggestion, idx) in analysisResult.suggestions"
                :key="idx"
                class="suggestion-item"
              >
                <div class="suggestion-header">
                  <span class="suggestion-title">
                    <tiny-icon-help-query style="margin-right: 4px" />
                    {{ suggestion.title }}
                  </span>
                  <tiny-tag :type="getPriorityTagType(suggestion.priority)">
                    {{ getPriorityText(suggestion.priority) }}
                  </tiny-tag>
                </div>
                <div class="suggestion-content">
                  {{ suggestion.content }}
                </div>
                <div v-if="suggestion.sqlExample" class="sql-example">
                  <div class="example-label">SQL示例:</div>
                  <pre>{{ suggestion.sqlExample }}</pre>
                </div>
              </div>
            </div>
          </tiny-tab-item>

          <!-- 执行计划树 (如果有) -->
          <tiny-tab-item
            v-if="analysisResult.planTree && analysisResult.planTree.length > 0"
            name="tree"
            title="计划树"
          >
            <div class="plan-tree-panel">
              <div
                v-for="node in analysisResult.planTree"
                :key="node.id"
                class="tree-node"
                :class="{ 'has-issue': node.hasIssue }"
              >
                <div class="node-info">
                  <tiny-tag>{{ node.type }}</tiny-tag>
                  <span class="node-desc"><tiny-tag>{{ node.description }}</tiny-tag></span>
                </div>
              </div>
            </div>
          </tiny-tab-item>
        </tiny-tabs>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps } from 'vue'
import {
  Tabs as TinyTabs,
  TabItem as TinyTabItem,
  Tag as TinyTag
} from '@opentiny/vue'
import { IconSuccess, IconHelpQuery } from '@opentiny/vue-icon'

const TinyIconSuccess = IconSuccess()
const TinyIconHelpQuery = IconHelpQuery()

interface Props {
  analysisResult?: any
}

defineProps<Props>()

const activeTab = ref('plan')

// 获取严重程度标签类型
const getSeverityTagType = (severity: string) => {
  const map: any = {
    HIGH: 'danger',
    MEDIUM: 'warning',
    LOW: 'info'
  }
  return map[severity] || 'info'
}

// 获取严重程度文本
const getSeverityText = (severity: string) => {
  const map: any = {
    HIGH: '严重',
    MEDIUM: '中等',
    LOW: '轻微'
  }
  return map[severity] || severity
}

// 获取问题类型文本
const getIssueTypeText = (type: string) => {
  const map: any = {
    FULL_TABLE_SCAN: '全表扫描',
    MISSING_INDEX: '缺少索引',
    CROSS_JOIN: '笛卡尔积JOIN',
    LARGE_SORT: '大数据排序'
  }
  return map[type] || type
}

// 获取优先级标签类型
const getPriorityTagType = (priority: string) => {
  const map: any = {
    HIGH: 'danger',
    MEDIUM: 'warning',
    LOW: 'info'
  }
  return map[priority] || 'info'
}

// 获取优先级文本
const getPriorityText = (priority: string) => {
  const map: any = {
    HIGH: '高优先级',
    MEDIUM: '中优先级',
    LOW: '低优先级'
  }
  return map[priority] || priority
}
</script>

<style scoped lang="less">
.execution-plan-analyzer {
  display: flex;
  flex-direction: column;
  height: 100%;

  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 300px;
    color: #999;
    font-size: 14px;
  }

  .analysis-result {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
  }

  .summary-tags {
    flex-shrink: 0;
    display: flex;
    gap: 12px;
    align-items: center;
    padding: 8px 0;
    margin-bottom: 8px;
  }

  .tabs-container {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;

    :deep(.tiny-tabs) {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    :deep(.tiny-tabs__content) {
      flex: 1;
      min-height: 0;
      overflow: hidden;
    }
  }

  .plan-text-panel {
    max-height: 600px;
    background: #f5f5f5;
    padding: 16px;
    border-radius: 4px;
    overflow: auto;

    .plan-text {
      margin: 0;
      white-space: pre-wrap;
      word-wrap: break-word;
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 13px;
      line-height: 1.6;
    }
  }

  .issues-panel {
    max-height: 600px;
    overflow: auto;

    .empty-tip {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 300px;
    }

    .issue-list {
      .issue-item {
        padding: 16px;
        margin-bottom: 12px;
        border-radius: 4px;
        border-left: 4px solid;

        &.severity-high {
          background: #fff2f0;
          border-left-color: #ff4d4f;
        }

        &.severity-medium {
          background: #fffbe6;
          border-left-color: #faad14;
        }

        &.severity-low {
          background: #e6f7ff;
          border-left-color: #1890ff;
        }

        .issue-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;

          .issue-type {
            font-weight: bold;
            color: #333;
          }
        }

        .issue-content {
          color: #666;
          line-height: 1.6;
        }
      }
    }
  }

  .suggestions-panel {
    max-height: 600px;
    overflow: auto;

    .suggestion-item {
      padding: 16px;
      margin-bottom: 12px;
      background: #f9f9f9;
      border-radius: 4px;
      border: 1px solid #e8e8e8;

      .suggestion-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;

        .suggestion-title {
          display: flex;
          align-items: center;
          font-weight: bold;
          color: #333;
          font-size: 14px;
        }
      }

      .suggestion-content {
        color: #666;
        line-height: 1.6;
        margin-bottom: 12px;
      }

      .sql-example {
        .example-label {
          font-size: 12px;
          color: #999;
          margin-bottom: 4px;
        }

        pre {
          margin: 0;
          padding: 12px;
          background: #f5f5f5;
          border-radius: 4px;
          font-family: 'Consolas', 'Monaco', monospace;
          font-size: 13px;
          overflow-x: auto;
        }
      }
    }
  }

  .plan-tree-panel {
    max-height: 600px;
    overflow: auto;
    padding: 4px;

    .tree-node {
      padding: 12px;
      margin-bottom: 8px;
      background: #f9f9f9;
      border-radius: 4px;
      border-left: 3px solid #1890ff;

      &.has-issue {
        border-left-color: #ff4d4f;
        background: #fff2f0;
      }

      .node-info {
        display: flex;
        align-items: center;
        gap: 12px;

        .node-desc {
          color: #666;
          font-size: 13px;
        }
      }
    }
  }
}
</style>
