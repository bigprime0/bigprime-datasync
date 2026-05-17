<template>
  <div class="lineage-container">
    <tiny-tabs v-model="activeTab" class="lineage-tabs">
      <!-- 血缘图谱 -->
      <tiny-tab-item name="graph" title="血缘图谱">
        <lineage-graph />
      </tiny-tab-item>
      
      <!-- SQL解析 -->
      <tiny-tab-item name="parse" title="SQL解析">
        <sql-parser />
      </tiny-tab-item>
      
      <!-- 手动维护 -->
      <tiny-tab-item name="manual" title="手动维护">
        <manual-lineage />
      </tiny-tab-item>
      
      <!-- 存储配置 -->
      <tiny-tab-item name="config" title="存储配置">
        <storage-config />
      </tiny-tab-item>
    </tiny-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Tabs as TinyTabs, TabItem as TinyTabItem } from '@opentiny/vue'
import LineageGraph from './components/lineage-graph.vue'
import SqlParser from './components/sql-parser.vue'
import ManualLineage from './components/manual-lineage.vue'
import StorageConfig from './components/storage-config.vue'

const activeTab = ref('graph')
</script>

<style scoped lang="less">
.lineage-container {
  padding: 10px;

  .lineage-tabs {
    height: 100%;
    
    :deep(.tiny-tabs__content) {
      height: calc(100% - 40px);
      overflow-y: auto;
    }
    
    :deep(.tiny-tab-item) {
      height: 100%;
    }
  }
}
</style>
