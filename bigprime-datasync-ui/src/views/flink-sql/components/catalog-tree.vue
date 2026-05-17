<template>
  <div class="catalog-tree-panel">
    <div class="tree-header">
      <h3 style="margin: 0">Catalog</h3>
      <tiny-button @click="loadCatalogs">刷新</tiny-button>
    </div>

    <div class="tree-container">
      <tiny-tree
        :data="treeData"
        node-key="id"
        :props="treeProps"
        :expand-on-click-node="false"
        :load="loadNode"
        lazy
        draggable
        @node-drag-start="handleDragStart"
        @node-click="handleNodeClick"
      >
        <template #default="{ node, data }">
          <span class="custom-tree-node">
            <span class="node-icon" v-if="data.type === 'catalog'">📊</span>
            <span class="node-icon" v-else-if="data.type === 'database'">📁</span>
            <span class="node-icon" v-else-if="data.type === 'table'">📋</span>
            <span class="node-icon" v-else-if="data.type === 'column'">🔑</span>
            <span class="node-label">{{ node.label }}</span>
          </span>
        </template>
      </tiny-tree>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Tree as TinyTree, Button as TinyButton, Modal } from '@opentiny/vue'
import request from '@/utils/request'

const emit = defineEmits(['insertTable'])

const treeData = ref<any[]>([])
const treeProps = {
  children: 'children',
  label: 'label',
  isLeaf: 'isLeaf'
}

const loadCatalogs = async () => {
  try {
    const res = await request.get('/api/flink-sql/catalog/list')
    if (res.code === 0) {
      treeData.value = (res.data || []).map((catalog: any) => ({
        id: `catalog_${catalog.id}`,
        label: catalog.catalogName,
        catalogName: catalog.catalogName,
        type: 'catalog',
        isLeaf: false
      }))
    }
  } catch (error: any) {
    Modal.message({ message: '加载Catalog列表失败', status: 'error' })
  }
}

const loadNode = async (node: any, resolve: any) => {
  const data = node.data

  try {
    if (data.type === 'catalog') {
      // 加载数据库列表
      const res = await request.get(`/api/metadata/${data.catalogName}/databases`)
      if (res.code === 0) {
        const databases = (res.data || []).map((db: string) => ({
          id: `${data.id}_db_${db}`,
          label: db,
          catalogName: data.catalogName,
          databaseName: db,
          type: 'database',
          isLeaf: false
        }))
        resolve(databases)
      } else {
        Modal.message({ message: res.message || '加载数据库列表失败', status: 'error' })
        resolve([])
      }
    } else if (data.type === 'database') {
      // 加载表列表
      const res = await request.get(`/api/metadata/${data.catalogName}/${data.databaseName}/tables`)
      if (res.code === 0) {
        const tables = (res.data || []).map((table: string) => ({
          id: `${data.id}_table_${table}`,
          label: table,
          catalogName: data.catalogName,
          databaseName: data.databaseName,
          tableName: table,
          fullName: `${data.catalogName}.${data.databaseName}.${table}`,
          type: 'table',
          isLeaf: false
        }))
        resolve(tables)
      } else {
        Modal.message({ message: res.message || '加载表列表失败', status: 'error' })
        resolve([])
      }
    } else if (data.type === 'table') {
      // 加载字段列表
      const res = await request.get(
        `/api/metadata/${data.catalogName}/${data.databaseName}/${data.tableName}/columns`
      )
      if (res.code === 0) {
        const columns = (res.data || []).map((col: any) => ({
          id: `${data.id}_col_${col.name}`,
          label: `${col.name} (${col.type})`,
          columnName: col.name,
          columnType: col.type,
          type: 'column',
          isLeaf: true
        }))
        resolve(columns)
      } else {
        Modal.message({ message: res.message || '加载字段列表失败', status: 'error' })
        resolve([])
      }
    } else {
      resolve([])
    }
  } catch (error: any) {
    console.error('加载节点失败', error)
    const errorMsg = error.response?.data?.message || error.message || '加载节点失败'
    Modal.message({ message: errorMsg, status: 'error' })
    resolve([])
  }
}

const handleNodeClick = (data: any) => {
  // 节点点击事件，点击表或字段时插入
  if (data.type === 'table') {
    emit('insertTable', data.fullName || data.label)
  } else if (data.type === 'column') {
    emit('insertTable', data.columnName || data.label)
  }
}

const handleDragStart = (node: any, event: DragEvent) => {
  // 允许拖拽表节点和字段节点
  if (node.data.type !== 'table' && node.data.type !== 'column') {
    event.preventDefault()
    return false
  }

  // 设置拖拽数据
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'copy'
    
    if (node.data.type === 'table') {
      // 拖拽表：传递全限定名
      event.dataTransfer.setData('text/plain', node.data.fullName)
    } else if (node.data.type === 'column') {
      // 拖拽字段：只传递字段名
      event.dataTransfer.setData('text/plain', node.data.columnName)
    }
  }
}

const insertTable = (data: any) => {
  emit('insertTable', data.fullName || data.label)
}

onMounted(() => {
  loadCatalogs()
})
</script>

<style scoped lang="less">
.catalog-tree-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: transparent;

  .tree-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    border-bottom: 1px solid #e8e8e8;
    flex-shrink: 0;
  }

  .tree-container {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
/*    :deep(.tiny-tree){
      height: calc(100vh - 280px);
    }*/
  }

  .custom-tree-node {
    display: flex;
    align-items: center;
    width: 100%;

    .node-icon {
      margin-right: 6px;
      font-size: 14px;
    }

    .node-label {
      font-size: 14px;
    }
  }
}
</style>
