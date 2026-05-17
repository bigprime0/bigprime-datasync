<template>
  <div class="query-container">
    <tiny-tabs v-model="activeTab" class="query-tabs">
      <!-- Catalog管理 -->
      <tiny-tab-item name="catalog" title="Catalog管理">
        <catalog-manager />
      </tiny-tab-item>
      
      <!-- SQL查询 -->
      <tiny-tab-item name="query" title="SQL查询">
        <div class="sql-query-layout">
          <!-- 左侧元数据树 -->
          <div class="metadata-sidebar">
            <metadata-tree @insertTable="handleInsertTable" />
          </div>
          
          <!-- 右侧查询编辑器 -->
          <div class="query-editor-area">
            <query-executor ref="queryExecutorRef" />
          </div>
        </div>
      </tiny-tab-item>
      
      <!-- 查询历史 -->
      <tiny-tab-item name="history" title="查询历史">
        <query-history @replay="handleReplayQuery" />
      </tiny-tab-item>
      
      <!-- 元数据浏览 -->
      <tiny-tab-item name="metadata" title="元数据浏览">
        <metadata-browser @loadSql="handleLoadSqlFromBrowser" />
      </tiny-tab-item>
      
      <!-- API管理 -->
      <tiny-tab-item name="api" title="API管理">
        <api-manager />
      </tiny-tab-item>
      
      <!-- 慢查询分析 -->
      <tiny-tab-item name="slow-query" title="慢查询分析">
        <slow-query-monitor />
      </tiny-tab-item>
    </tiny-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Tabs as TinyTabs, TabItem as TinyTabItem, Row as TinyRow, Col as TinyCol } from '@opentiny/vue'
import CatalogManager from './components/catalog-manager.vue'
import QueryExecutor from './components/query-executor.vue'
import QueryHistory from './components/query-history.vue'
import MetadataBrowser from './components/metadata-browser.vue'
import MetadataTree from './components/metadata-tree.vue'
import ApiManager from './components/api-manager.vue'
import SlowQueryMonitor from './components/slow-query-monitor.vue'

const activeTab = ref('catalog')
const queryExecutorRef = ref()

// 处理从元数据树插入表名
const handleInsertTable = (fullName: string) => {
  if (queryExecutorRef.value) {
    queryExecutorRef.value.insertTableName(fullName)
  }
}

// 处理查询历史回放
const handleReplayQuery = (data: any) => {
  // 切换到SQL查询Tab
  activeTab.value = 'query'
  
  // 延迟设置SQL文本，确保组件已加载
  setTimeout(() => {
    if (queryExecutorRef.value) {
      queryExecutorRef.value.loadSql(data.sql, data.connectorId)
    }
  }, 100)
}

// 处理从元数据浏览器加载SQL
const handleLoadSqlFromBrowser = (sql: string) => {
  // 从元数据浏览器加载SQL到编辑器
  activeTab.value = 'query'
  
  setTimeout(() => {
    if (queryExecutorRef.value) {
      queryExecutorRef.value.loadSql(sql)
    }
  }, 100)
}
</script>

<style scoped lang="less">
.query-container {
  padding: 16px;
  height: calc(100vh - 80px);
  
  .query-tabs {
    height: 100%;
    
    :deep(.tiny-tabs__content) {
      height: calc(100% - 40px);
    }
    
    :deep(.tiny-tab-item) {
      height: 100%;
    }
  }
  
  .sql-query-layout {
    display: flex;
    height: 100%;
    gap: 8px;
    
    .metadata-sidebar {
      width: 250px;
      min-width: 250px;
      flex-shrink: 0;
      height: 100%;
    }
    
    .query-editor-area {
      flex: 1;
      min-width: 0;
      height: 100%;
    }
  }
}
</style>