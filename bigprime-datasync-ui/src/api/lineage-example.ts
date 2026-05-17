/**
 * 数据血缘API调用示例
 * 
 * 使用axios进行HTTP请求
 */

import axios from 'axios';

const baseURL = 'http://localhost:8080/api/lineage';

// ============================================================
// 1. 查询上游血缘（数据来源追溯）
// ============================================================
export async function getUpstreamLineage() {
  try {
    const response = await axios.get(`${baseURL}/upstream`, {
      params: {
        type: 'PostgreSQL',
        database: 'analytics_db',
        table: 'user_info',
        maxDepth: 3 // 最多追溯3层
      }
    });
    
    const lineageGraph = response.data.data;
    console.log('上游血缘图:', lineageGraph);
    
    // 返回的数据结构：
    // {
    //   nodes: [
    //     { id: 'MySQL:user_db:users', name: 'users', nodeType: 'source', ... },
    //     { id: 'PostgreSQL:analytics_db:user_info', name: 'user_info', nodeType: 'target', ... }
    //   ],
    //   edges: [
    //     { id: 'lineage-001', sourceId: 'MySQL:user_db:users', targetId: 'PostgreSQL:analytics_db:user_info', ... }
    //   ],
    //   rootNodeId: 'PostgreSQL:analytics_db:user_info',
    //   direction: 'upstream',
    //   statistics: {
    //     totalNodes: 5,
    //     totalEdges: 4,
    //     maxDepth: 2,
    //     totalRecordCount: 50000
    //   }
    // }
    
    return lineageGraph;
  } catch (error) {
    console.error('查询上游血缘失败:', error);
    throw error;
  }
}

// ============================================================
// 2. 查询下游血缘（数据流向追踪）
// ============================================================
export async function getDownstreamLineage() {
  try {
    const response = await axios.get(`${baseURL}/downstream`, {
      params: {
        type: 'MySQL',
        database: 'user_db',
        table: 'users',
        maxDepth: -1 // -1表示无限深度
      }
    });
    
    const lineageGraph = response.data.data;
    console.log('下游血缘图:', lineageGraph);
    
    return lineageGraph;
  } catch (error) {
    console.error('查询下游血缘失败:', error);
    throw error;
  }
}

// ============================================================
// 3. 查询完整血缘（上下游全景）
// ============================================================
export async function getFullLineage() {
  try {
    const response = await axios.get(`${baseURL}/full`, {
      params: {
        type: 'PostgreSQL',
        database: 'dw_db',
        table: 'fact_orders',
        maxDepth: 5
      }
    });
    
    const lineageGraph = response.data.data;
    console.log('完整血缘图:', lineageGraph);
    
    return lineageGraph;
  } catch (error) {
    console.error('查询完整血缘失败:', error);
    throw error;
  }
}

// ============================================================
// 4. 根据DAG执行ID查询血缘
// ============================================================
export async function getLineageByDagExecution(dagExecutionId: string) {
  try {
    const response = await axios.get(`${baseURL}/dag/${dagExecutionId}`);
    
    const lineageGraph = response.data.data;
    console.log(`DAG执行 ${dagExecutionId} 的血缘图:`, lineageGraph);
    
    return lineageGraph;
  } catch (error) {
    console.error('查询DAG血缘失败:', error);
    throw error;
  }
}

// ============================================================
// 5. 查询字段级血缘
// ============================================================
export async function getFieldLineage() {
  try {
    const response = await axios.get(`${baseURL}/field`, {
      params: {
        type: 'PostgreSQL',
        database: 'analytics_db',
        table: 'user_info',
        field: 'email_address'
      }
    });
    
    const fieldLineage = response.data.data;
    console.log('字段血缘:', fieldLineage);
    
    // 返回的数据结构：
    // [
    //   {
    //     sourceType: 'MySQL',
    //     sourceDatabase: 'user_db',
    //     sourceTable: 'users',
    //     sourceField: 'email',
    //     targetField: 'email_address',
    //     transformLogic: '{"validate": "email format"}'
    //   }
    // ]
    
    return fieldLineage;
  } catch (error) {
    console.error('查询字段血缘失败:', error);
    throw error;
  }
}

// ============================================================
// 6. 批量创建血缘记录（在DAG执行后调用）
// ============================================================
export async function batchCreateLineage() {
  try {
    const lineages = [
      {
        name: 'MySQL.user_db.users -> PostgreSQL.analytics_db.user_info',
        sourceType: 'MySQL',
        sourceConnectorId: 'mysql-connector-001',
        sourceDatabase: 'user_db',
        sourceTable: 'users',
        sourceFields: '["id", "name", "email"]',
        targetType: 'PostgreSQL',
        targetConnectorId: 'pg-connector-001',
        targetDatabase: 'analytics_db',
        targetTable: 'user_info',
        targetFields: '["user_id", "username", "email_address"]',
        fieldMapping: '{"id": "user_id", "name": "username", "email": "email_address"}',
        transformLogic: '{"filter": "status=\'active\'"}',
        dagExecutionId: 'exec-20241119-001',
        dagDefinitionId: 'dag-sync-001',
        nodeId: 'node-transform',
        nodeName: '数据转换节点',
        recordCount: 10000,
        qualityScore: 95,
        status: 'SUCCESS',
        lineageLevel: 0
      }
    ];
    
    const response = await axios.post(`${baseURL}/batch`, lineages);
    console.log('批量创建血缘记录成功:', response.data.data);
    
    return response.data.data;
  } catch (error) {
    console.error('批量创建血缘记录失败:', error);
    throw error;
  }
}

// ============================================================
// 7. 查询血缘记录列表
// ============================================================
export async function listLineages() {
  try {
    const query = {
      sourceType: 'MySQL',
      status: 'SUCCESS',
      startTimeBegin: '2024-11-01 00:00:00',
      startTimeEnd: '2024-11-30 23:59:59',
      pageIndex: 1,
      pageSize: 20
    };
    
    const response = await axios.post(`${baseURL}/list`, query);
    const lineages = response.data.data;
    
    console.log('血缘记录列表:', lineages);
    return lineages;
  } catch (error) {
    console.error('查询血缘记录列表失败:', error);
    throw error;
  }
}

// ============================================================
// 8. 统计血缘信息
// ============================================================
export async function getLineageStatistics() {
  try {
    const response = await axios.get(`${baseURL}/statistics`, {
      params: {
        type: 'MySQL',
        database: 'user_db'
      }
    });
    
    const statistics = response.data.data;
    console.log('血缘统计信息:', statistics);
    
    // 返回的数据结构：
    // {
    //   totalCount: 100,
    //   successCount: 95,
    //   failedCount: 5,
    //   totalRecordCount: 1000000
    // }
    
    return statistics;
  } catch (error) {
    console.error('查询统计信息失败:', error);
    throw error;
  }
}

// ============================================================
// 9. 使用G6绘制血缘关系图
// ============================================================
import G6 from '@antv/g6';

export function renderLineageGraph(container: string, lineageData: any) {
  // 转换数据格式为G6需要的格式
  const nodes = lineageData.nodes.map((node: any) => ({
    id: node.id,
    label: node.name,
    type: 'rect',
    style: {
      fill: node.nodeType === 'source' ? '#5B8FF9' : 
            node.nodeType === 'target' ? '#5AD8A6' : '#F6BD16',
      stroke: '#333',
      lineWidth: 2
    },
    labelCfg: {
      style: {
        fill: '#fff',
        fontSize: 12
      }
    }
  }));

  const edges = lineageData.edges.map((edge: any) => ({
    source: edge.sourceId,
    target: edge.targetId,
    label: `${edge.recordCount || 0} 条记录`,
    style: {
      stroke: edge.status === 'SUCCESS' ? '#52c41a' : '#ff4d4f',
      lineWidth: 2,
      endArrow: true
    }
  }));

  // 创建图实例
  const graph = new G6.Graph({
    container: container,
    width: 1200,
    height: 800,
    layout: {
      type: 'dagre',
      rankdir: 'LR', // 从左到右布局
      nodesep: 50,
      ranksep: 100
    },
    modes: {
      default: ['drag-canvas', 'zoom-canvas', 'drag-node']
    },
    defaultNode: {
      size: [120, 60],
      type: 'rect',
      style: {
        radius: 5
      }
    },
    defaultEdge: {
      type: 'polyline',
      style: {
        radius: 10,
        offset: 30
      }
    }
  });

  // 渲染数据
  graph.data({
    nodes: nodes,
    edges: edges
  });
  
  graph.render();

  return graph;
}

// ============================================================
// 10. Vue 3组件使用示例
// ============================================================
/*
<template>
  <div class="lineage-viewer">
    <div class="search-bar">
      <el-form inline>
        <el-form-item label="数据源类型">
          <el-select v-model="searchForm.type">
            <el-option label="MySQL" value="MySQL"/>
            <el-option label="PostgreSQL" value="PostgreSQL"/>
            <el-option label="Kafka" value="Kafka"/>
          </el-select>
        </el-form-item>
        <el-form-item label="数据库">
          <el-input v-model="searchForm.database"/>
        </el-form-item>
        <el-form-item label="表名">
          <el-input v-model="searchForm.table"/>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="queryLineage">查询血缘</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <div class="lineage-tabs">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="上游血缘" name="upstream">
          <div id="upstream-graph" style="width: 100%; height: 600px;"></div>
        </el-tab-pane>
        <el-tab-pane label="下游血缘" name="downstream">
          <div id="downstream-graph" style="width: 100%; height: 600px;"></div>
        </el-tab-pane>
        <el-tab-pane label="完整血缘" name="full">
          <div id="full-graph" style="width: 100%; height: 600px;"></div>
        </el-tab-pane>
      </el-tabs>
    </div>
    
    <div class="statistics-panel">
      <el-card>
        <template #header>
          <span>血缘统计</span>
        </template>
        <el-descriptions :column="2">
          <el-descriptions-item label="节点总数">
            {{ statistics.totalNodes }}
          </el-descriptions-item>
          <el-descriptions-item label="关系总数">
            {{ statistics.totalEdges }}
          </el-descriptions-item>
          <el-descriptions-item label="最大深度">
            {{ statistics.maxDepth }}
          </el-descriptions-item>
          <el-descriptions-item label="总记录数">
            {{ statistics.totalRecordCount }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { getUpstreamLineage, getDownstreamLineage, getFullLineage, renderLineageGraph } from '@/api/lineage';

const searchForm = reactive({
  type: 'MySQL',
  database: '',
  table: ''
});

const activeTab = ref('upstream');
const statistics = reactive({
  totalNodes: 0,
  totalEdges: 0,
  maxDepth: 0,
  totalRecordCount: 0
});

async function queryLineage() {
  if (activeTab.value === 'upstream') {
    const data = await getUpstreamLineage(
      searchForm.type,
      searchForm.database,
      searchForm.table,
      3
    );
    Object.assign(statistics, data.statistics);
    renderLineageGraph('upstream-graph', data);
  } else if (activeTab.value === 'downstream') {
    const data = await getDownstreamLineage(
      searchForm.type,
      searchForm.database,
      searchForm.table,
      3
    );
    Object.assign(statistics, data.statistics);
    renderLineageGraph('downstream-graph', data);
  } else {
    const data = await getFullLineage(
      searchForm.type,
      searchForm.database,
      searchForm.table,
      3
    );
    Object.assign(statistics, data.statistics);
    renderLineageGraph('full-graph', data);
  }
}
</script>

<style scoped>
.lineage-viewer {
  padding: 20px;
}

.search-bar {
  margin-bottom: 20px;
  background: #fff;
  padding: 20px;
  border-radius: 4px;
}

.lineage-tabs {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.statistics-panel {
  background: #fff;
  border-radius: 4px;
}
</style>
*/
