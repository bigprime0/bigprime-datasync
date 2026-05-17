<template>
  <div class="flink-sql-container">
    <tiny-tabs v-model="activeTab" class="flink-sql-tabs">
      <!-- Catalog配置 -->
      <tiny-tab-item name="catalog" title="Catalog配置">
        <catalog-config />
      </tiny-tab-item>

      <!-- SQL开发 -->
      <tiny-tab-item name="develop" title="SQL开发">
        <div class="sql-develop-layout">
          <!-- 左侧功能区 -->
          <div class="left-sidebar">
            <tiny-tabs v-model="leftTab" tab-style="card">
              <tiny-tab-item name="catalog-tree" title="Catalog">
                <catalog-tree @insertTable="handleInsertTable" />
              </tiny-tab-item>
              <tiny-tab-item name="templates" title="模板">
                <template-list @useTemplate="handleUseTemplate" />
              </tiny-tab-item>
              <tiny-tab-item name="snippets" title="片段">
                <snippet-list @useSnippet="handleUseSnippet" />
              </tiny-tab-item>
            </tiny-tabs>
          </div>

          <!-- 中间SQL编辑器 -->
          <div class="editor-area">
            <sql-editor ref="sqlEditorRef" />
          </div>
        </div>
      </tiny-tab-item>

      <!-- Session管理 -->
      <tiny-tab-item name="session" title="Session管理">
        <session-manager />
      </tiny-tab-item>

      <!-- SQL历史 -->
      <tiny-tab-item name="history" title="SQL历史">
        <sql-history @replay="handleReplaySQL" />
      </tiny-tab-item>
    </tiny-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Tabs as TinyTabs, TabItem as TinyTabItem } from '@opentiny/vue'
import CatalogConfig from './components/catalog-config.vue'
import CatalogTree from './components/catalog-tree.vue'
import TemplateList from './components/template-list.vue'
import SnippetList from './components/snippet-list.vue'
import SqlEditor from './components/sql-editor-new.vue'
import SqlHistory from './components/sql-history.vue'
import SessionManager from './components/session-manager.vue'

const activeTab = ref('catalog')
const leftTab = ref('catalog-tree')
const sqlEditorRef = ref()

// 处理从Catalog树插入表名
const handleInsertTable = (fullName: string) => {
  if (sqlEditorRef.value) {
    sqlEditorRef.value.insertText(fullName)
  }
}

// 处理使用模板
const handleUseTemplate = (templateContent: string) => {
  if (sqlEditorRef.value) {
    // 格式化SQL后再设置到编辑器
    const formattedSQL = formatSQL(templateContent)
    sqlEditorRef.value.setContent(formattedSQL)
  }
  // 切换到编辑器Tab
  activeTab.value = 'develop'
}

// 处理使用片段
const handleUseSnippet = (snippetContent: string) => {
  if (sqlEditorRef.value) {
    sqlEditorRef.value.insertText(snippetContent)
  }
}

// 处理SQL历史回放
const handleReplaySQL = (sql: string) => {
  if (sqlEditorRef.value) {
    sqlEditorRef.value.setContent(sql)
  }
}

// SQL格式化函数
const formatSQL = (sql: string): string => {
  if (!sql) return ''

  try {
    let formattedSql = sql

    // 移除多余的空白和换行
    formattedSql = formattedSql.replace(/\s+/g, ' ').trim()

    // 主要子句换行(顶格)
    const mainClauses = [
      'SELECT',
      'FROM',
      'WHERE',
      'GROUP BY',
      'HAVING',
      'ORDER BY',
      'LIMIT',
      'INSERT INTO',
      'UPDATE',
      'DELETE FROM',
      'CREATE',
      'ALTER',
      'DROP',
      'WITH',
      'UNION',
      'INTERSECT',
      'EXCEPT'
    ]
    mainClauses.forEach((clause) => {
      const regex = new RegExp(`\\b${clause}\\b`, 'gi')
      formattedSql = formattedSql.replace(regex, `\n${clause.toUpperCase()}`)
    })

    // JOIN语句换行
    const joinTypes = ['JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN', 'INNER JOIN', 'CROSS JOIN']
    joinTypes.forEach((join) => {
      const regex = new RegExp(`\\b${join}\\b`, 'gi')
      formattedSql = formattedSql.replace(regex, `\n${join.toUpperCase()}`)
    })

    // ON/AND/OR条件缩进(2空格)
    formattedSql = formattedSql.replace(/\bON\b/gi, '\n  ON')
    formattedSql = formattedSql.replace(/\bAND\b/gi, '\n  AND')
    formattedSql = formattedSql.replace(/\bOR\b/gi, '\n  OR')

    // 逗号后加空格
    formattedSql = formattedSql.replace(/,(?!\s)/g, ', ')

    // SELECT字段列表换行缩进
    formattedSql = formattedSql.replace(/SELECT\s+/gi, () => 'SELECT\n  ')
    formattedSql = formattedSql.replace(/,\s*(?=[\w`"[(])/g, ',\n  ')

    // 删除过多的空行(最多保留1个空行)
    formattedSql = formattedSql.replace(/\n{3,}/g, '\n\n')

    // 清理首尾空白
    formattedSql = formattedSql.trim()

    return formattedSql
  } catch (error) {
    // 格式化失败则返回原SQL
    console.error('SQL格式化失败:', error)
    return sql
  }
}
</script>

<style scoped lang="less">
.flink-sql-container {
  padding: 16px;
  height: calc(100vh - 80px);

  .flink-sql-tabs {
    height: 100%;

    :deep(.tiny-tabs__content) {
      height: calc(100% - 40px);
    }

    :deep(.tiny-tab-item) {
      height: 100%;
    }
  }

  .sql-develop-layout {
    display: flex;
    height: 100%;
    gap: 8px;

    .left-sidebar {
      width: 250px;
      min-width: 250px;
      flex-shrink: 0;

      :deep(.tiny-tabs) {
        height: calc(100vh - 145px);
        display: flex;
        flex-direction: column;
        border: 1px solid #e8e8e8;
        border-radius: 4px;
        background: #fff;
      }

      :deep(.tiny-tabs__content) {
        flex: 1;
        overflow: hidden;
        display: flex;
      }

      :deep(.tiny-tab-pane) {
        width: 100%;
        height: 100%;
      }
    }

    .editor-area {
      flex: 1;
      min-width: 0;
      height: 100%;
    }
  }
}
</style>
