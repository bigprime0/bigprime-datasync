<template>
  <div class="lineage-graph-page" :class="{ maximized: isMaximized }">
    <!-- 左侧功能面板 -->
    <div class="left-panel" v-show="!isMaximized">
      <tiny-card class="function-panel">
        <tiny-tabs v-model="activeFunctionTab" tab-style="card">
          <!-- 血缘查询 Tab -->
          <tiny-tab-item name="query" title="血缘查询">
            <tiny-form :model="queryForm" label-width="80px">
              <tiny-form-item label="节点类型">
                <tiny-radio-group v-model="queryForm.nodeType">
                  <tiny-radio label="TABLE">表</tiny-radio>
                  <tiny-radio label="COLUMN">字段</tiny-radio>
                </tiny-radio-group>
              </tiny-form-item>

              <tiny-form-item label="节点名称">
                <tiny-input v-model="queryForm.nodeName" placeholder="输入表名或字段名" />
              </tiny-form-item>

              <tiny-form-item label="上游深度">
                <div class="depth-control">
                  <tiny-slider v-model="queryForm.upDepth" :min="0" :max="5" />
                  <span class="depth-value">{{ queryForm.upDepth }}</span>
                </div>
                <div class="depth-hint">0表示不查询上游</div>
              </tiny-form-item>

              <tiny-form-item label="下游深度">
                <div class="depth-control">
                  <tiny-slider v-model="queryForm.downDepth" :min="0" :max="5" />
                  <span class="depth-value">{{ queryForm.downDepth }}</span>
                </div>
                <div class="depth-hint">0表示不查询下游</div>
              </tiny-form-item>

              <tiny-form-item>
                <tiny-button
                  type="primary"
                  @click="handleQuery"
                  :loading="loading"
                  style="width: 100%"
                >
                  查询血缘
                </tiny-button>
              </tiny-form-item>
            </tiny-form>
          </tiny-tab-item>

          <!-- 路径分析 Tab -->
          <tiny-tab-item name="path" title="路径分析">
            <div class="path-analysis-section">
              <tiny-select
                v-model="pathAnalysis.startNode"
                placeholder="选择起点"
                filterable
                style="width: 100%; margin-bottom: 12px"
              >
                <tiny-option
                  v-for="node in graphData.nodes"
                  :key="node.id"
                  :label="node.label"
                  :value="node.id"
                />
              </tiny-select>
              <tiny-select
                v-model="pathAnalysis.endNode"
                placeholder="选择终点"
                filterable
                style="width: 100%; margin-bottom: 12px"
              >
                <tiny-option
                  v-for="node in graphData.nodes"
                  :key="node.id"
                  :label="node.label"
                  :value="node.id"
                />
              </tiny-select>
              <tiny-button
                type="primary"
                @click="handlePathAnalysis"
                :disabled="!pathAnalysis.startNode || !pathAnalysis.endNode"
                style="width: 100%; margin-bottom: 12px"
              >
                分析路径
              </tiny-button>
              <div v-if="pathAnalysis.paths.length > 0" class="path-results">
                <div class="path-count">找到 {{ pathAnalysis.paths.length }} 条路径</div>
                <div
                  v-for="(path, index) in pathAnalysis.paths"
                  :key="index"
                  class="path-item"
                  @click="handleHighlightPath(path)"
                >
                  <div class="path-index">路径 {{ index + 1 }}</div>
                  <div class="path-nodes">{{ path.edges.length }} 个关系</div>
                </div>
              </div>
            </div>
          </tiny-tab-item>

          <!-- 影响范围 Tab -->
          <tiny-tab-item name="impact" title="影响范围">
            <div class="impact-section">
              <tiny-alert
                type="info"
                description="点击图中的表节点进行选择，然后分析影响范围"
                :closable="false"
                style="margin-bottom: 12px"
              />
              <div v-if="selectedNodes.length > 0">
                <div class="selected-count">已选择 {{ selectedNodes.length }} 个节点</div>
                <tiny-button
                  type="warning"
                  @click="handleAnalyzeImpact"
                  style="width: 100%; margin-bottom: 8px"
                >
                  分析影响范围
                </tiny-button>
                <tiny-button
                  @click="handleClearSelection"
                  style="width: 100%; margin-left: 0; margin-bottom: 12px"
                >
                  清除选择
                </tiny-button>

                <!-- 影响范围分析结果 -->
                <div v-if="impactAnalysisResult" class="impact-result">
                  <tiny-divider>影响范围分析结果</tiny-divider>
                  <div class="result-summary">
                    <div class="summary-item">
                      <span class="summary-label">影响表数：</span>
                      <tiny-tag type="danger" size="small">{{
                        impactAnalysisResult.tableCount
                      }}</tiny-tag>
                    </div>
                    <div class="summary-item">
                      <span class="summary-label">影响字段数：</span>
                      <tiny-tag type="warning" size="small">{{
                        impactAnalysisResult.columnCount
                      }}</tiny-tag>
                    </div>
                    <div class="summary-item">
                      <span class="summary-label">总节点数：</span>
                      <tiny-tag type="info" size="small">{{
                        impactAnalysisResult.totalCount
                      }}</tiny-tag>
                    </div>
                  </div>

                  <!-- 影响节点列表 -->
                  <div class="impact-nodes-list">
                    <div class="list-header">影响节点列表</div>
                    <div class="node-list">
                      <div
                        v-for="node in impactAnalysisResult.nodes"
                        :key="node.id"
                        class="impact-node-item"
                        @click="handleFocusNode(node.id)"
                      >
                        <tiny-tag
                          :type="node.nodeType === 'TABLE' ? 'success' : 'warning'"
                          size="mini"
                        >
                          {{ node.nodeType === 'TABLE' ? '表' : '字段' }}
                        </tiny-tag>
                        <span class="node-name">{{ node.label }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <tiny-alert
                v-else
                description="请点击图中的表节点，选择后分析影响范围"
                :closable="false"
              />
            </div>
          </tiny-tab-item>
        </tiny-tabs>
      </tiny-card>
    </div>

    <!-- 中间图谱区域 -->
    <div class="center-panel" :class="{ maximized: isMaximized }">
      <tiny-card class="graph-card">
        <template #title>
          <div class="graph-header">
            <span>{{ currentViewTitle }}</span>
            <div class="graph-controls">
              <!-- 视图模式切换 -->
              <div v-if="graphData.nodes.length > 0" class="view-mode-switch">
                <tiny-button-group>
                  <tiny-button
                    size="mini"
                    :type="viewMode === 'table' ? 'primary' : 'default'"
                    @click="viewMode = 'table'"
                  >
                    血缘关系图
                  </tiny-button>
                  <tiny-button
                    size="mini"
                    :type="viewMode === 'relation' ? 'primary' : 'default'"
                    @click="viewMode = 'relation'"
                  >
                    关系图谱
                  </tiny-button>
                </tiny-button-group>
              </div>
              <!-- 图谱操作按钮 -->
              <div v-if="graphData.nodes.length > 0" class="graph-actions">
                <tiny-button size="mini" @click="handleZoomIn" title="放大">🔍+</tiny-button>
                <tiny-button size="mini" @click="handleZoomOut" title="缩小">🔍-</tiny-button>
                <tiny-button size="mini" @click="handleFitView" title="适应画布">📍</tiny-button>
                <tiny-button size="mini" @click="handleExportImage" title="导出图片"
                  >💾</tiny-button
                >
                <tiny-button
                  size="mini"
                  @click="handleToggleMaximize"
                  :title="isMaximized ? '还原' : '最大化'"
                >
                  <svg
                    v-if="!isMaximized"
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                  >
                    <path
                      d="M1.5 1a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4A1.5 1.5 0 0 1 1.5 0h4a.5.5 0 0 1 0 1h-4zM10 .5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 16 1.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zM.5 10a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 0 14.5v-4a.5.5 0 0 1 .5-.5zm15 0a.5.5 0 0 1 .5.5v4a1.5 1.5 0 0 1-1.5 1.5h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5z"
                    />
                  </svg>
                  <svg v-else width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                    <path
                      d="M5.5 0a.5.5 0 0 1 .5.5v4A1.5 1.5 0 0 1 4.5 6h-4a.5.5 0 0 1 0-1h4a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 1 .5-.5zm5 0a.5.5 0 0 1 .5.5v4a.5.5 0 0 0 .5.5h4a.5.5 0 0 1 0 1h-4A1.5 1.5 0 0 1 10 4.5v-4a.5.5 0 0 1 .5-.5zM0 10.5a.5.5 0 0 1 .5-.5h4A1.5 1.5 0 0 1 6 11.5v4a.5.5 0 0 1-1 0v-4a.5.5 0 0 0-.5-.5h-4a.5.5 0 0 1-.5-.5zm10 1a1.5 1.5 0 0 1 1.5-1.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 0-.5.5v4a.5.5 0 0 1-1 0v-4z"
                    />
                  </svg>
                </tiny-button>
              </div>
              <div class="graph-stats" v-if="graphData.nodes.length > 0">
                <span>节点: {{ graphData.nodes.length }}</span>
                <span style="margin-left: 16px">关系: {{ graphData.edges.length }}</span>
              </div>
            </div>
          </div>
        </template>

        <!-- 时间轴 -->
        <div v-if="timelineVisible && graphData.nodes.length > 0" class="timeline-panel">
          <div class="timeline-header">
            <span>血缘演变历史</span>
            <tiny-button text size="small" @click="timelineVisible = false">✕</tiny-button>
          </div>
          <div class="timeline-slider">
            <tiny-slider
              v-model="timelineValue"
              :min="0"
              :max="timelineSnapshots.length - 1"
              :step="1"
              @change="handleTimelineChange"
              :marks="timelineMarks"
            />
          </div>
          <div class="timeline-info">
            <div v-if="currentSnapshot" class="snapshot-info">
              <span class="snapshot-time">{{ currentSnapshot.timestamp }}</span>
              <span class="snapshot-desc">{{ currentSnapshot.description }}</span>
              <tiny-tag size="small">{{ currentSnapshot.nodeCount }} 个节点</tiny-tag>
              <tiny-tag size="small" style="margin-left: 8px"
                >{{ currentSnapshot.edgeCount }} 个关系</tiny-tag
              >
            </div>
          </div>
        </div>

        <div v-if="!graphData.nodes.length" class="empty-graph">
          <div class="empty-icon">📊</div>
          <div class="empty-text">请输入节点名称查询血缘关系</div>
          <div class="empty-hint">支持查询表级和字段级血缘</div>
        </div>

        <template v-else>
          <!-- 表格视图（G6） -->
          <div v-show="viewMode === 'table'" ref="graphContainer" class="graph-container"></div>

          <!-- 关系图谱视图（G6 力导向布局） -->
          <div
            v-show="viewMode === 'relation'"
            ref="relationGraphContainer"
            class="relation-graph-container"
          ></div>
        </template>

        <!-- 图例说明（右下角） -->
        <div v-if="graphData.nodes.length > 0" class="graph-legend">
          <div class="legend-title">图例</div>
          <div class="legend-content">
            <!-- 关系图谱视图的图例 -->
            <template v-if="viewMode === 'relation'">
              <div class="legend-section">
                <div class="legend-label">节点类型:</div>
                <div class="legend-items">
                  <div class="legend-item">
                    <div class="legend-node relation-node"></div>
                    <span>表/字段</span>
                  </div>
                </div>
              </div>
              <div class="legend-section">
                <div class="legend-label">关系类型:</div>
                <div class="legend-items">
                  <div class="legend-item">
                    <div class="legend-edge contains"></div>
                    <span>包含</span>
                  </div>
                  <div class="legend-item">
                    <div class="legend-edge relation-transform"></div>
                    <span>转换</span>
                  </div>
                </div>
              </div>
            </template>

            <!-- 血缘关系图视图的图例 -->
            <template v-else>
              <div class="legend-section">
                <div class="legend-label">节点类型:</div>
                <div class="legend-items">
                  <div class="legend-item">
                    <div class="legend-node datasource"></div>
                    <span>数据源</span>
                  </div>
                  <div class="legend-item">
                    <div class="legend-node table"></div>
                    <span>表</span>
                  </div>
                  <div class="legend-item">
                    <div class="legend-node column"></div>
                    <span>字段</span>
                  </div>
                </div>
              </div>
              <div class="legend-section">
                <div class="legend-label">关系类型:</div>
                <div class="legend-items">
                  <div class="legend-item">
                    <div class="legend-edge read"></div>
                    <span>读取</span>
                  </div>
                  <div class="legend-item">
                    <div class="legend-edge write"></div>
                    <span>写入</span>
                  </div>
                  <div class="legend-item">
                    <div class="legend-edge transform"></div>
                    <span>转换</span>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </tiny-card>
    </div>

    <!-- 右侧详情面板 -->
    <div class="right-panel" v-show="!isMaximized">
      <tiny-card title="节点详情" class="detail-panel">
        <div v-if="selectedNode" class="node-detail">
          <div class="detail-section">
            <div class="section-title">基本信息</div>
            <div class="detail-row">
              <span class="detail-label">节点类型:</span>
              <tiny-tag :type="getNodeTypeColor(selectedNode.nodeType)">
                {{ getNodeTypeName(selectedNode.nodeType) }}
              </tiny-tag>
            </div>
            <div class="detail-row">
              <span class="detail-label">节点ID:</span>
              <span class="detail-value">{{ selectedNode.id }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">节点名称:</span>
              <span class="detail-value">{{ selectedNode.label }}</span>
            </div>
            <!-- 如果是字段节点，显示所属表名 -->
            <div
              v-if="selectedNode.nodeType === 'COLUMN' && getTableNameFromNode(selectedNode)"
              class="detail-row"
            >
              <span class="detail-label">所属表:</span>
              <tiny-tag type="success" size="small">{{
                getTableNameFromNode(selectedNode)
              }}</tiny-tag>
            </div>
          </div>

          <tiny-divider />

          <div
            class="detail-section"
            v-if="selectedNode.properties && Object.keys(selectedNode.properties).length > 0"
          >
            <div class="section-title">扩展属性</div>
            <div class="properties-hint">这些属性来自后端返回的元数据信息</div>
            <div v-for="(value, key) in selectedNode.properties" :key="key" class="detail-row">
              <span class="detail-label">{{ key }}:</span>
              <span class="detail-value">{{ value }}</span>
            </div>
          </div>

          <tiny-divider />

          <div class="detail-section">
            <div class="section-title">操作</div>
            <tiny-button
              size="small"
              type="primary"
              @click="handleQueryFromNode(selectedNode, 'upstream')"
              style="width: 100%; margin-bottom: 8px; margin-left: 8px"
            >
              查询上游
            </tiny-button>
            <tiny-button
              size="small"
              type="success"
              @click="handleQueryFromNode(selectedNode, 'downstream')"
              style="width: 100%"
            >
              查询下游
            </tiny-button>
          </div>
        </div>
        <div v-else class="empty-detail">
          <div class="empty-icon">🔍</div>
          <div class="empty-text">请在图谱中点击节点查看详情</div>
        </div>
      </tiny-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed, watch } from 'vue'
import {
  Card as TinyCard,
  Form as TinyForm,
  FormItem as TinyFormItem,
  Input as TinyInput,
  Button as TinyButton,
  ButtonGroup as TinyButtonGroup,
  RadioGroup as TinyRadioGroup,
  Radio as TinyRadio,
  Slider as TinySlider,
  Divider as TinyDivider,
  Tag as TinyTag,
  Select as TinySelect,
  Option as TinyOption,
  Tabs as TinyTabs,
  TabItem as TinyTabItem,
  Alert as TinyAlert,
  Modal
} from '@opentiny/vue'
import { IconSearch } from '@opentiny/vue-icon'
import G6 from '@antv/g6'
import { queryLineageByTableName, queryLineageByColumnName, queryFullLineage } from '@/api/lineage'

// 注册自定义表格节点
G6.registerNode(
  'table-node',
  {
    draw(cfg, group) {
      const { columns = [], size = [200, 100] } = cfg
      const width = size[0]
      const headerHeight = 40
      const fieldHeight = 30
      const tableName = cfg.label || cfg.id

      // 表头背景
      const headerBg = group.addShape('rect', {
        attrs: {
          x: 0,
          y: 0,
          width: width,
          height: headerHeight,
          fill: '#e8f5e9',
          stroke: '#4caf50',
          lineWidth: 2,
          radius: [8, 8, 0, 0],
          cursor: 'move' // 拖拽光标
        },
        name: 'header-bg',
        draggable: true, // 表头可拖拽
        capture: true
      })

      // 表头悬停效果
      headerBg.on('mouseenter', () => {
        headerBg.attr('fill', '#c8e6c9')
        headerBg.attr('cursor', 'move') // 悬停时显示拖拽光标
      })

      headerBg.on('mouseleave', () => {
        headerBg.attr('fill', '#e8f5e9')
      })

      // 表名
      group.addShape('text', {
        attrs: {
          x: width / 2,
          y: headerHeight / 2,
          text: tableName,
          fontSize: 15,
          fill: '#2e7d32',
          fontWeight: 'bold',
          textAlign: 'center',
          textBaseline: 'middle',
          cursor: 'pointer' // 鼠标手形
        },
        name: 'header-text',
        capture: false // 文字不捕获事件，让事件穿透到下面的矩形
      })

      // 字段区域背景
      group.addShape('rect', {
        attrs: {
          x: 0,
          y: headerHeight,
          width: width,
          height: columns.length * fieldHeight,
          fill: '#ffffff',
          stroke: '#4caf50',
          lineWidth: 2,
          radius: [0, 0, 0, 0] // 不要圆角，避免底部缺口
        },
        name: 'body-bg',
        capture: false // 不捕获事件，让点击穿透到字段矩形
      })

      // 绘制字段列表
      columns.forEach((field, index) => {
        const y = headerHeight + index * fieldHeight

        // 字段背景（必须填充，否则点击事件不生效）
        const fieldRect = group.addShape('rect', {
          attrs: {
            x: 0,
            y: y,
            width: width,
            height: fieldHeight,
            fill: '#ffffff',
            stroke: 'transparent',
            lineWidth: 0,
            cursor: 'pointer' // 鼠标手形
          },
          name: field.id, // 重要：使用字段ID作为name，用于点击识别
          draggable: false,
          capture: true // 确保能捕获事件
        })

        // 添加鼠标悬停事件
        fieldRect.on('mouseenter', () => {
          fieldRect.attr('fill', '#f0f9ff') // 浅蓝色背景
        })

        fieldRect.on('mouseleave', () => {
          fieldRect.attr('fill', '#ffffff') // 恢复白色
        })

        // 字段名
        group.addShape('text', {
          attrs: {
            x: 15,
            y: y + fieldHeight / 2,
            text: field.name,
            fontSize: 13,
            fill: '#333',
            textBaseline: 'middle',
            cursor: 'pointer' // 鼠标手形
          },
          name: `${field.id}-text`,
          capture: false // 文字不捕获事件，让事件穿透到下面的矩形
        })

        // 分隔线
        if (index < columns.length - 1) {
          group.addShape('line', {
            attrs: {
              x1: 0,
              y1: y + fieldHeight,
              x2: width,
              y2: y + fieldHeight,
              stroke: '#e0e0e0',
              lineWidth: 1
            },
            name: `divider-${index}`,
            capture: false // 分隔线不捕获事件
          })
        }
      })

      // 返回包裹框（不再需要拖拽功能，由表头负责拖拽）
      return group.addShape('rect', {
        attrs: {
          x: 0,
          y: 0,
          width: width,
          height: size[1],
          fill: 'transparent',
          stroke: 'transparent'
        },
        name: 'main-box',
        draggable: false,
        capture: false // 不捕获点击事件
      })
    },
    // 关键：为每个字段生成锚点
    getAnchorPoints(cfg) {
      const { columns = [], size = [220, 100] } = cfg
      const headerHeight = 40
      const fieldHeight = 30
      const height = size[1]

      const anchorPoints = []

      // 为每个字段生成左右两个锚点
      columns.forEach((field, index) => {
        const fieldY = headerHeight + index * fieldHeight + fieldHeight / 2
        const anchorY = fieldY / height

        // 左侧锚点
        anchorPoints.push([0, anchorY])
        // 右侧锚点
        anchorPoints.push([1, anchorY])
      })

      return anchorPoints
    }
  },
  'single-node'
)

// 当前功能Tab
const activeFunctionTab = ref('query')

// 视图模式：'table' 表格视图（G6）, 'relation' 关系图谱（G6 力导向布局）
const viewMode = ref('table')

// 关系图谱容器和实例
const relationGraphContainer = ref(null)
let relationGraph = null

// 最大化状态
const isMaximized = ref(false)

// 计算当前视图标题
const currentViewTitle = computed(() => {
  return viewMode.value === 'table' ? '血缘关系图' : '关系图谱'
})

// 查询表单
const queryForm = ref({
  nodeType: 'TABLE',
  nodeName: '',
  upDepth: 3, // 默认查询上游3层
  downDepth: 3 // 默认查询下游3层
})

// 加载状态
const loading = ref(false)

// 图数据
const graphData = ref({
  nodes: [],
  edges: []
})

// 选中的节点
const selectedNode = ref(null)

// 搜索相关
const searchKeyword = ref('')
const searchResults = ref([])

// 路径分析
const pathAnalysis = ref({
  startNode: null,
  endNode: null,
  paths: []
})

// 圈选模式
const brushMode = ref(false)
const selectedNodes = ref([])

// 影响范围分析结果
const impactAnalysisResult = ref(null)

// 时间轴
const timelineVisible = ref(false)
const timelineValue = ref(0)
const timelineSnapshots = ref([
  {
    timestamp: '2024-01-01 10:00:00',
    description: '初始血缘',
    nodeCount: 0,
    edgeCount: 0,
    data: { nodes: [], edges: [] }
  }
])

const currentSnapshot = computed(() => {
  return timelineSnapshots.value[timelineValue.value] || null
})

const timelineMarks = computed(() => {
  const marks = {}
  timelineSnapshots.value.forEach((snapshot, index) => {
    marks[index] = snapshot.timestamp.split(' ')[0]
  })
  return marks
})

// 图实例
const graphContainer = ref(null)
let graph = null
let isRendering = false // 防止重复渲染

// 查询血缘
const handleQuery = async () => {
  if (!queryForm.value.nodeName) {
    Modal.message({ message: '请输入节点名称', status: 'warning' })
    return
  }

  loading.value = true
  try {
    let result
    if (queryForm.value.nodeType === 'TABLE') {
      result = await queryLineageByTableName(
        queryForm.value.nodeName,
        queryForm.value.upDepth,
        queryForm.value.downDepth
      )
    } else {
      result = await queryLineageByColumnName(
        queryForm.value.nodeName,
        queryForm.value.upDepth,
        queryForm.value.downDepth
      )
    }

    console.log('血缘查询结果:', result)

    // 转换数据格式
    const transformedData = transformLineageData(result)
    graphData.value = transformedData

    // 检查是否有数据
    if (transformedData.nodes.length === 0) {
      Modal.message({ message: '未找到血缘数据，请检查节点名称是否正确', status: 'warning' })
      return
    }

    // 渲染图
    await nextTick()
    renderGraph(transformedData)

    // 如果当前是关系图谱模式，也初始化 relation-graph
    if (viewMode.value === 'relation') {
      await nextTick()
      renderRelationGraph(transformedData)
    }

    Modal.message({ message: '查询成功', status: 'success' })
  } catch (error) {
    console.error('查询失败:', error)
    Modal.message({ message: '查询失败: ' + (error.message || '未知错误'), status: 'error' })
  } finally {
    loading.value = false
  }
}

// 转换血缘数据为G6格式
const transformLineageData = (lineageResult) => {
  console.log('🔍 转换血缘数据 - 原始数据:', lineageResult)

  // 处理后端返回的数据结构 { code: 0, data: {...} }
  let data = lineageResult
  if (lineageResult && lineageResult.code === 0 && lineageResult.data) {
    data = lineageResult.data
  }

  // 确保数据结构存在
  if (!data || (!data.nodes && !data.relations)) {
    console.warn('⚠️ 血缘数据为空或格式不正确:', data)
    return { nodes: [], edges: [] }
  }

  console.log('📊 后端返回的节点数:', data.nodes?.length, '边数:', data.relations?.length)
  console.log('📋 完整的 relations 数据:', data.relations)

  // 使用 Map 去重
  const nodeMap = new Map()
  const tableMap = new Map()
  const columnMap = new Map()

  // 收集所有节点（去重）
  ;(data.nodes || []).forEach((node) => {
    if (!node.id) {
      console.warn('⚠️ 节点缺少 ID:', node)
      return
    }

    if (nodeMap.has(node.id)) {
      console.warn('⚠️ 发现重复节点 ID:', node.id)
      return
    }

    nodeMap.set(node.id, node)

    if (node.nodeType === 'TABLE') {
      tableMap.set(node.id, node)
    } else if (node.nodeType === 'COLUMN') {
      columnMap.set(node.id, node)
    }
  })

  const tableNodes = Array.from(tableMap.values())
  const columnNodes = Array.from(columnMap.values())

  console.log('✅ 去重后 - 表节点数:', tableNodes.length, '字段节点数:', columnNodes.length)

  // 按表分组字段，并根据血缘关系排序
  const tableColumnsMap = new Map()
  const relationsByTable = new Map() // 记录每个表的字段关系

  // 先收集所有关系
  ;(data.relations || []).forEach((rel) => {
    if (rel.lineageType === 'TRANSFORM') {
      // 找到源和目标字段
      const sourceCol = columnNodes.find((c) => c.id === rel.sourceId)
      const targetCol = columnNodes.find((c) => c.id === rel.targetId)

      if (sourceCol && targetCol) {
        const sourceTableName = sourceCol.name.split('.')[0]
        const targetTableName = targetCol.name.split('.')[0]

        if (!relationsByTable.has(sourceTableName)) {
          relationsByTable.set(sourceTableName, [])
        }
        if (!relationsByTable.has(targetTableName)) {
          relationsByTable.set(targetTableName, [])
        }

        relationsByTable.get(sourceTableName).push({
          fieldId: sourceCol.id,
          relatedTo: targetCol.id,
          type: 'source'
        })
        relationsByTable.get(targetTableName).push({
          fieldId: targetCol.id,
          relatedTo: sourceCol.id,
          type: 'target'
        })
      }
    }
  })

  // 为每个表分组字段
  columnNodes.forEach((column) => {
    const fullName = column.name
    let tableName = ''

    if (fullName && fullName.includes('.')) {
      tableName = fullName.split('.')[0]
    }

    const table = tableNodes.find((t) => t.name === tableName)
    if (table) {
      if (!tableColumnsMap.has(table.id)) {
        tableColumnsMap.set(table.id, [])
      }
      tableColumnsMap.get(table.id).push({
        id: column.id,
        name: fullName.split('.').pop(),
        fullName: fullName,
        order: 999 // 默认排序值
      })
    }
  })

  console.log(
    '📋 字段分组完成:',
    Array.from(tableColumnsMap.entries()).map(([id, cols]) => ({ id, count: cols.length }))
  )

  // 智能排序：根据连线关系对齐字段
  tableColumnsMap.forEach((columns, tableId) => {
    const table = tableNodes.find((t) => t.id === tableId)
    if (!table) return

    const relations = relationsByTable.get(table.name) || []

    // 为每个有关系的字段设置排序值
    relations.forEach((rel, index) => {
      const field = columns.find((f) => f.id === rel.fieldId)
      if (field) {
        field.order = index // 按关系顺序排列
      }
    })

    // 排序：有关系的在前，没关系的在后
    columns.sort((a, b) => a.order - b.order)

    console.log(
      `🔄 ${table.name} 字段排序完成:`,
      columns.map((c) => c.name)
    )
  })

  // 构建节点数据（每个表一个节点，包含字段列表）
  const nodes = tableNodes.map((table) => {
    const columns = tableColumnsMap.get(table.id) || []
    return {
      id: table.id,
      label: table.name, // label 会被自定义节点使用
      nodeType: 'TABLE',
      columns: columns,
      type: 'table-node', // 指定使用自定义节点
      size: [220, 40 + columns.length * 30], // 动态高度
      labelCfg: {
        style: {
          opacity: 0 // 隐藏默认label，避免重复显示
        }
      }
    }
  })

  // 创建字段ID到表ID的映射
  const fieldToTableMap = new Map()
  columnNodes.forEach((col) => {
    const tableName = col.name.split('.')[0]
    const table = tableNodes.find((t) => t.name === tableName)
    if (table) {
      fieldToTableMap.set(col.id, table.id)
    }
  })

  console.log('🗺️ 字段到表的映射:', Array.from(fieldToTableMap.entries()))

  // 转换边（TRANSFORM 关系）- 为每个字段关系创建一条边
  const edges = []

  console.log('🔗 开始创建边，总关系数:', data.relations?.length)
  ;(data.relations || []).forEach((relation, index) => {
    console.log(`  处理关系 ${index}:`, {
      lineageType: relation.lineageType,
      sourceId: relation.sourceId,
      targetId: relation.targetId,
      sourceName: relation.sourceName,
      targetName: relation.targetName
    })

    if (relation.lineageType !== 'TRANSFORM') {
      console.log(`    跳过：不是 TRANSFORM 类型`)
      return
    }

    // 查找源字段和目标字段所属的表
    const sourceTableId = fieldToTableMap.get(relation.sourceId)
    const targetTableId = fieldToTableMap.get(relation.targetId)

    if (!sourceTableId || !targetTableId) {
      console.warn(`    ⚠️ 边 ${index} 缺少表节点:`, {
        sourceId: relation.sourceId,
        targetId: relation.targetId,
        sourceTableId,
        targetTableId
      })
      return
    }

    // 查找字段在表中的位置
    const sourceTable = tableColumnsMap.get(sourceTableId)
    const targetTable = tableColumnsMap.get(targetTableId)

    const sourceFieldIndex = sourceTable?.findIndex((f) => f.id === relation.sourceId) ?? -1
    const targetFieldIndex = targetTable?.findIndex((f) => f.id === relation.targetId) ?? -1

    console.log(`    ✅ 创建边 ${edges.length}:`, {
      source: sourceTableId,
      target: targetTableId,
      sourceFieldIndex,
      targetFieldIndex,
      sourceAnchor: sourceFieldIndex * 2 + 1, // 右侧锚点
      targetAnchor: targetFieldIndex * 2 // 左侧锚点
    })

    edges.push({
      id: relation.id || `edge-${edges.length}`,
      source: sourceTableId,
      target: targetTableId,
      sourceAnchor: sourceFieldIndex * 2 + 1, // 使用字段的右侧锚点
      targetAnchor: targetFieldIndex * 2, // 使用字段的左侧锚点
      type: 'cubic-horizontal',
      style: {
        stroke: '#9254DE',
        lineWidth: 1.5,
        endArrow: {
          path: 'M 0,0 L 8,4 L 8,-4 Z',
          fill: '#9254DE',
          stroke: '#9254DE'
        },
        opacity: 0.8
      },
      _sourceFieldId: relation.sourceId,
      _targetFieldId: relation.targetId,
      _sourceFieldIndex: sourceFieldIndex,
      _targetFieldIndex: targetFieldIndex
    })
  })

  console.log(`🎉 边创建完成，总数: ${edges.length}`)

  console.log('✅ 转换完成 - 节点数:', nodes.length, '边数:', edges.length)

  return { nodes, edges }
}

// 获取节点样式
const getNodeStyle = (nodeType) => {
  const styleMap = {
    DATASOURCE: {
      type: 'circle',
      size: 70,
      style: {
        fill: '#5B8FF9',
        stroke: '#3D76DD',
        lineWidth: 3,
        shadowColor: 'rgba(91, 143, 249, 0.4)',
        shadowBlur: 15
      },
      labelCfg: {
        position: 'center',
        style: {
          fill: '#fff',
          fontSize: 13,
          fontWeight: 'bold'
        }
      }
    },
    TABLE: {
      type: 'circle',
      size: 65,
      style: {
        fill: '#5AD8A6',
        stroke: '#3AB88A',
        lineWidth: 3,
        shadowColor: 'rgba(90, 216, 166, 0.4)',
        shadowBlur: 15
      },
      labelCfg: {
        position: 'center',
        style: {
          fill: '#fff',
          fontSize: 13,
          fontWeight: 'bold'
        }
      }
    },
    COLUMN: {
      type: 'circle',
      size: 55,
      style: {
        fill: '#6DC8EC',
        stroke: '#4FA8C5',
        lineWidth: 3,
        shadowColor: 'rgba(109, 200, 236, 0.4)',
        shadowBlur: 12
      },
      labelCfg: {
        position: 'center',
        style: {
          fill: '#fff',
          fontSize: 11,
          fontWeight: 'bold'
        }
      }
    }
  }
  return styleMap[nodeType] || styleMap['TABLE']
}

// 获取边样式
const getEdgeStyle = (lineageType) => {
  const styleMap = {
    READ: {
      style: {
        stroke: '#5B8FF9',
        lineWidth: 2.5,
        endArrow: {
          path: 'M 0,0 L 10,5 L 10,-5 Z',
          fill: '#5B8FF9',
          stroke: '#5B8FF9'
        },
        opacity: 0.9
      },
      labelCfg: {
        style: {
          fill: '#5B8FF9',
          fontSize: 12,
          fontWeight: 'bold'
        }
      }
    },
    WRITE: {
      style: {
        stroke: '#FF6B6B', // 红色，表示写入
        lineWidth: 3.5, // 最粗，表级关系最重要
        endArrow: {
          path: 'M 0,0 L 12,6 L 12,-6 Z', // 最大箭头
          fill: '#FF6B6B',
          stroke: '#FF6B6B'
        },
        opacity: 0.95
      },
      labelCfg: {
        style: {
          fill: '#FF6B6B',
          fontSize: 12,
          fontWeight: 'bold'
        }
      }
    },
    TRANSFORM: {
      style: {
        stroke: '#9254DE', // 紫色，表示字段转换
        lineWidth: 2,
        lineDash: [5, 5], // 虚线，区分于表级关系
        endArrow: {
          path: 'M 0,0 L 8,4 L 8,-4 Z',
          fill: '#9254DE',
          stroke: '#9254DE'
        },
        opacity: 0.85
      },
      labelCfg: {
        style: {
          fill: '#9254DE',
          fontSize: 11,
          fontWeight: 'bold'
        }
      }
    }
  }
  return styleMap[lineageType] || styleMap['WRITE']
}

// 渲染图
const renderGraph = (data) => {
  if (!graphContainer.value) return

  // 防止重复渲染
  if (isRendering) {
    console.warn('⚠️ 正在渲染中，跳过此次请求')
    return
  }

  isRendering = true

  console.log('🎨 开始渲染图谱，数据:', data)

  // 销毁旧图（重要！）
  if (graph) {
    console.log('🗑️ 销毁旧图实例')
    try {
      graph.destroy()
    } catch (e) {
      console.error('销毁图实例失败:', e)
    }
    graph = null
  }

  // 创建新图
  graph = new G6.Graph({
    container: graphContainer.value,
    width: graphContainer.value.clientWidth,
    height: graphContainer.value.clientHeight,
    fitView: true, // 初始化时自适应
    modes: {
      default: ['drag-canvas', 'zoom-canvas', 'drag-node'] // 保留拖拽节点功能
    },
    layout: {
      type: 'dagre',
      rankdir: 'LR',
      nodesep: 80, // 表间的垂直间距
      ranksep: 150 // 表间的水平间距，缩小到150
    },
    defaultNode: {
      type: 'table-node'
    },
    defaultEdge: {
      type: 'cubic-horizontal',
      style: {
        stroke: '#9254DE',
        lineWidth: 2,
        endArrow: {
          path: 'M 0,0 L 8,4 L 8,-4 Z',
          fill: '#9254DE',
          stroke: '#9254DE'
        },
        cursor: 'pointer' // 鼠标移到线上时显示手形光标
      }
    },
    nodeStateStyles: {
      hover: {
        stroke: '#1976d2',
        lineWidth: 3
      },
      highlight: {
        stroke: '#f44336',
        lineWidth: 3
      },
      'path-highlight': {
        stroke: '#ff9800',
        lineWidth: 4,
        shadowColor: '#ff9800',
        shadowBlur: 10
      },
      selected: {
        stroke: '#1890ff',
        lineWidth: 3,
        shadowColor: '#1890ff',
        shadowBlur: 8
      },
      active: {
        stroke: '#2196f3',
        lineWidth: 4,
        shadowColor: '#2196f3',
        shadowBlur: 12
      }
    },
    edgeStateStyles: {
      hover: {
        lineWidth: 3,
        stroke: '#607d8b'
      },
      highlight: {
        stroke: '#f44336',
        lineWidth: 3
      },
      'path-highlight': {
        stroke: '#ff9800',
        lineWidth: 3,
        shadowColor: '#ff9800',
        shadowBlur: 10
      }
    }
  })

  // 加载数据
  console.log('===== 开始加载数据到G6 =====', data)
  console.log('🔵 节点数:', data.nodes?.length)
  console.log('➡️ 边数:', data.edges?.length)

  graph.data(data)
  graph.render()

  // 手动调整节点位置，实现错位效果
  setTimeout(() => {
    const nodes = graph.getNodes()
    if (nodes.length === 2) {
      // 获取两个节点
      const node1 = nodes[0]
      const node2 = nodes[1]

      const model1 = node1.getModel()
      const model2 = node2.getModel()

      // 让右侧的节点（x较大）向上偏移
      if (model1.x < model2.x) {
        // node1 在左，node2 在右
        const offset = -80 // 向上偏移 80px
        graph.updateItem(node2, {
          y: model2.y + offset
        })
      } else {
        // node2 在左，node1 在右
        const offset = -80
        graph.updateItem(node1, {
          y: model1.y + offset
        })
      }
    }

    console.log('===== 图谱渲染完成 =====')
    console.log('✅ 实际渲染的节点数:', graph.getNodes().length)
    console.log('✅ 实际渲染的边数:', graph.getEdges().length)

    // 延迟执行 fitView，确保布局完成
    setTimeout(() => {
      graph.fitView(30) // 减小 padding
      graph.zoomTo(0.9) // 缩放到 90%，让两个表都能看到

      // 渲染完成，释放锁
      isRendering = false
      console.log('✅ 渲染完成，释放锁')
    }, 100)
  }, 100)

  // 绑定事件
  graph.on('node:mouseenter', (evt) => {
    graph.setItemState(evt.item, 'hover', true)
  })

  graph.on('node:mouseleave', (evt) => {
    graph.setItemState(evt.item, 'hover', false)
  })

  graph.on('node:click', (evt) => {
    const node = evt.item
    const nodeModel = node.getModel()
    const shape = evt.shape // 获取点击的shape
    const shapeName = shape?.get('name')

    console.log('🖊️ 点击了节点:', {
      nodeId: nodeModel.id,
      nodeType: nodeModel.nodeType,
      shapeName: shapeName,
      hasColumns: !!nodeModel.columns,
      columnsLength: nodeModel.columns?.length || 0
    })

    // 如果是表节点，判断点击的是表头还是字段
    if (nodeModel.nodeType === 'TABLE' && nodeModel.columns) {
      console.log(
        '  📋 表的所有字段ID:',
        nodeModel.columns.map((c) => c.id)
      )

      // 检查是否点击了字段矩形
      const clickedField = nodeModel.columns.find((col) => col.id === shapeName)

      if (clickedField) {
        // 点击了字段，显示字段详情
        console.log('✅ 点击了字段:', clickedField.name)
        
        // 如果在影响范围模式，支持字段多选
        if (activeFunctionTab.value === 'impact') {
          // 创建字段节点对象
          const fieldNode = {
            id: clickedField.id,
            label: clickedField.name,
            name: clickedField.name,
            nodeType: 'COLUMN',
            properties: clickedField.properties || {},
            _tableName: nodeModel.label || nodeModel.id,
            _tableId: nodeModel.id
          }
          
          const index = selectedNodes.value.findIndex((n) => n.id === fieldNode.id)
          if (index > -1) {
            // 已选中，取消选择
            selectedNodes.value.splice(index, 1)
            // 清除字段高亮
            const group = node.getContainer()
            const shapes = group.get('children')
            shapes.forEach((shape) => {
              if (shape.get('name') === clickedField.id) {
                shape.attr({
                  fill: '#ffffff',
                  stroke: 'transparent',
                  lineWidth: 0
                })
              }
            })
          } else {
            // 未选中，添加选择
            selectedNodes.value.push(fieldNode)
            // 高亮字段（使用选中样式）
            highlightFieldRect(nodeModel.id, clickedField.id, true)
          }
          
          // 同时显示字段详情
          selectedNode.value = fieldNode
          return
        }
        
        // 普通模式，清除之前的选中样式
        clearNodeSelection()
        
        // 高亮字段矩形
        highlightFieldRect(nodeModel.id, clickedField.id)
        
        selectedNode.value = {
          id: clickedField.id,
          label: clickedField.name,
          name: clickedField.name,
          nodeType: 'COLUMN',
          properties: clickedField.properties || {},
          // 保存表信息，用于显示所属表
          _tableName: nodeModel.label || nodeModel.id,
          _tableId: nodeModel.id  // 保存表ID
        }
        return
      } else {
        console.log('  ℹ️ 点击的是表头（shapeName不在字段列表中）')
      }
    }

    // 如果在影响范围模式，支持多选
    if (activeFunctionTab.value === 'impact') {
      const index = selectedNodes.value.findIndex((n) => n.id === nodeModel.id)
      if (index > -1) {
        // 已选中，取消选择
        selectedNodes.value.splice(index, 1)
        graph.setItemState(node, 'selected', false)
      } else {
        // 未选中，添加选择
        selectedNodes.value.push(nodeModel)
        graph.setItemState(node, 'selected', true)
      }
      
      // 同时显示表详情
      selectedNode.value = nodeModel
    } else {
      // 普通模式，显示表详情
      console.log('  ℹ️ 显示表节点详情')
      
      // 清除之前的选中样式
      clearNodeSelection()
      
      // 设置当前节点为高亮状态
      graph.setItemState(node, 'active', true)
      
      selectedNode.value = nodeModel
    }
  })

  graph.on('edge:mouseenter', (evt) => {
    graph.setItemState(evt.item, 'hover', true)
  })

  graph.on('edge:mouseleave', (evt) => {
    graph.setItemState(evt.item, 'hover', false)
  })

  // 点击连线高亮路径
  graph.on('edge:click', (evt) => {
    const edge = evt.item
    const model = edge.getModel()

    console.log('🖱️ 点击了边:', {
      id: model.id,
      source: model.source,
      target: model.target,
      sourceField: model._sourceFieldId,
      targetField: model._targetFieldId
    })

    // 高亮该连线和相关字段
    highlightEdgePath(edge, model)
  })
}

// 渲染关系图谱（G6 力导向布局）
const renderRelationGraph = async (data) => {
  if (!relationGraphContainer.value || !data || data.nodes.length === 0) {
    console.warn('⚠️ 关系图谱容器不存在或数据为空')
    return
  }

  console.log('📊 开始渲染知识图谱')
  console.log('  原始数据 - 节点数:', data.nodes.length, '边数:', data.edges.length)

  // 如果已经有实例，先销毁
  if (relationGraph) {
    relationGraph.destroy()
    relationGraph = null
  }

  // 扩展数据：把表的字段拆分成独立的COLUMN节点
  const allNodes = []
  const allEdges = []
  const fieldIdMap = new Map() // 映射：原始字段ID -> 新的字段节点ID
  const tableIdMap = new Map() // 记录表ID对应的表节点

  // 首先收集所有表和字段，并分析依赖关系
  const sourceTables = new Set() // 源表（没有入边的表）
  const targetTables = new Set() // 目标表（有入边的表）

  // 预处理：分析哪些是源表，哪些是目标表
  data.nodes.forEach((node) => {
    if (node.nodeType === 'TABLE') {
      tableIdMap.set(node.id, node)
      sourceTables.add(node.id)
    }
  })

  // 通过边关系判断目标表（简单逻辑：有入边的表就是目标表）
  data.edges.forEach((edge) => {
    // edge.target 就是目标表的ID
    if (edge.target && tableIdMap.has(edge.target)) {
      targetTables.add(edge.target)
      sourceTables.delete(edge.target)
    }
  })

  data.nodes.forEach((node) => {
    // 确定表节点的层级
    let nodeRank = 0
    let fieldRank = 0

    if (node.nodeType === 'TABLE') {
      if (sourceTables.has(node.id)) {
        nodeRank = 0 // 源表在最左边
        fieldRank = 1 // 源表字段在第二层
      } else if (targetTables.has(node.id)) {
        nodeRank = 3 // 目标表在最右边（第四层）
        fieldRank = 2 // 目标表字段在第三层
      }
    }

    // 添加表节点
    allNodes.push({
      id: node.id,
      label: node.label || node.id,
      nodeType: node.nodeType,
      properties: node.properties,
      type: 'circle',
      size: node.nodeType === 'TABLE' ? 100 : 75, // 进一步增大节点
      rank: nodeRank, // 设置层级
      style: {
        fill: node.nodeType === 'TABLE' ? '#8c96a8' : '#8c96a8',
        stroke: node.nodeType === 'TABLE' ? '#6b7588' : '#6b7588',
        lineWidth: node.nodeType === 'TABLE' ? 2 : 2
      },
      labelCfg: {
        position: 'center',
        style: {
          fill: '#ffffff',
          fontSize: node.nodeType === 'TABLE' ? 16 : 14, // 增大字体
          fontWeight: node.nodeType === 'TABLE' ? 'bold' : 'normal'
        }
      }
    })

    // 如果是表节点且有字段，拆分字段为独立节点
    if (node.nodeType === 'TABLE' && node.columns && node.columns.length > 0) {
      // 字段使用上面计算好的 fieldRank

      node.columns.forEach((column) => {
        const originalFieldId = column.id || column.name
        const newColumnId = `${node.id}:${column.name || column.id}`

        fieldIdMap.set(originalFieldId, newColumnId)

        // 添加字段节点
        allNodes.push({
          id: newColumnId,
          label: column.name || column.id,
          nodeType: 'COLUMN',
          properties: column.properties || {},
          type: 'circle',
          size: 75, // 与表节点大小保持一致
          rank: fieldRank, // 设置字段层级
          style: {
            fill: '#8c96a8',
            stroke: '#6b7588',
            lineWidth: 2
          },
          labelCfg: {
            position: 'center',
            style: {
              fill: '#ffffff',
              fontSize: 14, // 增大字体
              fontWeight: 'normal'
            }
          }
        })

        // 添加 CONTAINS 关系（表包含字段）
        allEdges.push({
          source: node.id,
          target: newColumnId,
          label: 'CONTAINS',
          relationType: 'CONTAINS',
          type: 'line',
          style: {
            stroke: '#95a5a6',
            lineWidth: 1.5,
            endArrow: {
              path: G6.Arrow.triangle(6, 8, 0),
              fill: '#95a5a6'
            }
          },
          labelCfg: {
            autoRotate: true,
            style: {
              fill: '#2c3e50',
              fontSize: 13, // 增大标签字体
              fontWeight: 'normal',
              background: {
                fill: '#ffffff',
                padding: [3, 6, 3, 6], // 增大内边距
                radius: 3
              }
            }
          }
        })
      })
    }
  })

  // 处理原始边数据，映射字段级关系
  data.edges.forEach((edge) => {
    // 如果边有字段ID信息，说明是字段级关系
    if (edge._sourceFieldId && edge._targetFieldId) {
      const sourceColumnId = fieldIdMap.get(edge._sourceFieldId)
      const targetColumnId = fieldIdMap.get(edge._targetFieldId)

      if (sourceColumnId && targetColumnId) {
        // 添加字段间的转换关系
        allEdges.push({
          source: sourceColumnId,
          target: targetColumnId,
          label: edge.relationType || 'TRANSFORM',
          relationType: edge.relationType || 'TRANSFORM',
          type: 'line', // 使用直线
          style: {
            stroke: edge.relationType === 'TRANSFORM' ? '#3498db' : '#3498db', // 蓝色
            lineWidth: 1.5,
            endArrow: {
              path: G6.Arrow.triangle(6, 8, 0),
              fill: '#3498db'
            }
          },
          labelCfg: {
            autoRotate: true,
            style: {
              fill: '#2c3e50', // 深色文字
              fontSize: 12,
              fontWeight: 'normal',
              background: {
                fill: '#ffffff',
                padding: [2, 4, 2, 4],
                radius: 2
              }
            }
          }
        })
        console.log(
          `  添加字段关系: ${edge._sourceFieldId} -> ${edge._targetFieldId} (${edge.relationType})`
        )
      } else {
        console.warn(`  ⚠️ 字段映射失败: ${edge._sourceFieldId} -> ${edge._targetFieldId}`)
      }
    } else {
      // 表级关系，直接添加
      allEdges.push({
        source: edge.source,
        target: edge.target,
        label: edge.relationType || edge.label || '',
        relationType: edge.relationType,
        type: 'line', // 使用直线
        style: {
          stroke:
            edge.relationType === 'READ'
              ? '#27ae60'
              : edge.relationType === 'WRITE'
                ? '#e74c3c'
                : '#3498db', // 绿色/红色/蓝色
          lineWidth: 2,
          endArrow: {
            path: G6.Arrow.triangle(6, 8, 0),
            fill:
              edge.relationType === 'READ'
                ? '#27ae60'
                : edge.relationType === 'WRITE'
                  ? '#e74c3c'
                  : '#3498db'
          }
        },
        labelCfg: {
          autoRotate: true,
          style: {
            fill: '#2c3e50', // 深色文字
            fontSize: 12,
            fontWeight: 'normal',
            background: {
              fill: '#ffffff',
              padding: [2, 4, 2, 4],
              radius: 2
            }
          }
        }
      })
    }
  })

  const knowledgeGraphData = {
    nodes: allNodes,
    edges: allEdges
  }

  console.log('📋 转换后的知识图谱数据:')
  console.log('  - 节点数:', knowledgeGraphData.nodes.length, '(表+字段)')
  console.log('  - 边数:', knowledgeGraphData.edges.length)

  // 创建 G6 实例（力导向布局）
  relationGraph = new G6.Graph({
    container: relationGraphContainer.value,
    width: relationGraphContainer.value.clientWidth,
    height: relationGraphContainer.value.clientHeight,
    modes: {
      default: ['drag-canvas', 'zoom-canvas', 'drag-node']
    },
    layout: {
      type: 'dagre',
      rankdir: 'LR', // 从左到右布局
      align: 'UL',
      nodesep: 60, // 节点垂直间距
      ranksep: 180, // 层级水平间距
      sortByCombo: false,
      ranker: 'network-simplex'
    },
    defaultNode: {
      type: 'circle'
      // 不设置默认 size，让每个节点使用自己的 size
    },
    defaultEdge: {
      type: 'line'
    },
    nodeStateStyles: {
      hover: {
        lineWidth: 5,
        stroke: '#1890ff',
        shadowColor: '#1890ff',
        shadowBlur: 10
      },
      selected: {
        fill: '#8c96a8', // 保持原有的灰蓝色
        lineWidth: 6,
        stroke: '#ff6b00', // 使用橙色边框表示选中
        shadowColor: '#ff6b00',
        shadowBlur: 15
      }
    },
    edgeStateStyles: {
      hover: {
        lineWidth: 3,
        shadowColor: '#666',
        shadowBlur: 5
      }
    }
  })

  // 加载数据
  relationGraph.data(knowledgeGraphData)
  relationGraph.render()

  // 等待布局完成后，手动调整节点位置以符合 rank
  setTimeout(() => {
    // 收集所有节点按 rank 分组
    const nodesByRank = new Map()
    relationGraph.getNodes().forEach((node) => {
      const model = node.getModel()
      const rank = model.rank !== undefined ? model.rank : 0
      if (!nodesByRank.has(rank)) {
        nodesByRank.set(rank, [])
      }
      nodesByRank.get(rank).push(node)
    })

    // 计算每个 rank 层的 x 坐标
    const baseX = 100
    const rankGap = 280 // 每层之间的间距
    const nodeGap = 100 // 节点垂直间距

    // 按 rank 重新排列节点
    Array.from(nodesByRank.keys())
      .sort((a, b) => a - b)
      .forEach((rank) => {
        const nodes = nodesByRank.get(rank)
        const x = baseX + rank * rankGap

        // 计算垂直起始位置，使节点组居中
        const totalHeight = (nodes.length - 1) * nodeGap
        const startY = 400 - totalHeight / 2 // 以 400 为中心

        // 将该 rank 的所有节点垂直排列
        nodes.forEach((node, index) => {
          const y = startY + index * nodeGap
          relationGraph.updateItem(node, {
            x: x,
            y: y
          })
        })
      })

    // 刷新布局
    relationGraph.refresh()

    // 适应画布
    relationGraph.fitCenter()
  }, 200)

  console.log('✅ G6渲染完成')
  console.log('  实际渲染节点数:', relationGraph.getNodes().length)
  console.log('  实际渲染边数:', relationGraph.getEdges().length)

  // 初始化所有节点的原始位置（用于拖动计算）
  relationGraph.getNodes().forEach((node) => {
    const model = node.getModel()
    model._originalX = model.x
    model._originalY = model.y
    model._dragStartX = model.x
    model._dragStartY = model.y
  })

  // 绑定事件
  relationGraph.on('node:mouseenter', (evt) => {
    relationGraph.setItemState(evt.item, 'hover', true)
  })

  relationGraph.on('node:mouseleave', (evt) => {
    relationGraph.setItemState(evt.item, 'hover', false)
  })

  relationGraph.on('node:click', (evt) => {
    const nodeModel = evt.item.getModel()
    selectedNode.value = nodeModel

    // 高亮选中的节点
    relationGraph.getNodes().forEach((node) => {
      relationGraph.setItemState(node, 'selected', false)
    })
    relationGraph.setItemState(evt.item, 'selected', true)
  })

  relationGraph.on('edge:mouseenter', (evt) => {
    relationGraph.setItemState(evt.item, 'hover', true)
  })

  relationGraph.on('edge:mouseleave', (evt) => {
    relationGraph.setItemState(evt.item, 'hover', false)
  })
}

// 监听视图模式切换
watch(viewMode, async (newMode) => {
  if (newMode === 'relation' && graphData.value.nodes.length > 0) {
    // 切换到关系图谱模式，渲染 relation-graph
    await nextTick()
    renderRelationGraph(graphData.value)
  }
})

// 从节点查询
const handleQueryFromNode = async (node, direction) => {
  loading.value = true
  try {
    const result = await queryFullLineage({
      nodeId: node.id,
      nodeType: node.nodeType,
      upDepth: direction === 'upstream' ? 3 : 0,
      downDepth: direction === 'downstream' ? 3 : 0
    })

    const transformedData = transformLineageData(result)
    graphData.value = transformedData
    await nextTick()
    renderGraph(transformedData)

    Modal.message({
      message: `${direction === 'upstream' ? '上游' : '下游'}查询成功`,
      status: 'success'
    })
  } catch (error) {
    Modal.message({ message: '查询失败', status: 'error' })
  } finally {
    loading.value = false
  }
}

// 图操作方法
const handleFitView = () => {
  if (graph) {
    graph.fitView(50) // 留有足够的边距
    graph.zoomTo(0.8) // 缩小到 80%
  }
}

const handleZoomIn = () => {
  if (viewMode.value === 'table' && graph) {
    const currentZoom = graph.getZoom()
    graph.zoomTo(currentZoom * 1.2)
  } else if (viewMode.value === 'relation' && relationGraph) {
    const currentZoom = relationGraph.getZoom()
    relationGraph.zoomTo(currentZoom * 1.2)
  }
}

const handleZoomOut = () => {
  if (viewMode.value === 'table' && graph) {
    const currentZoom = graph.getZoom()
    graph.zoomTo(currentZoom * 0.8)
  } else if (viewMode.value === 'relation' && relationGraph) {
    const currentZoom = relationGraph.getZoom()
    relationGraph.zoomTo(currentZoom * 0.8)
  }
}

const handleExportImage = () => {
  if (graph) {
    graph.downloadFullImage('lineage-graph', 'image/png')
    Modal.message({ message: '图片已下载', status: 'success' })
  }
}

// 切换最大化/还原
const handleToggleMaximize = async () => {
  isMaximized.value = !isMaximized.value

  // 等待DOM更新后重新调整画布大小
  await nextTick()
  await new Promise((resolve) => setTimeout(resolve, 350))

  // 根据当前视图模式重新调整画布大小（只改变画布尺寸，不缩放内容）
  if (viewMode.value === 'table') {
    if (graph && graphContainer.value) {
      const width = graphContainer.value.clientWidth
      const height = graphContainer.value.clientHeight
      console.log('调整表格视图画布大小:', width, height)

      // 直接改变画布大小并重绘
      graph.changeSize(width, height)
      graph.paint()
    }
  } else if (viewMode.value === 'relation') {
    if (relationGraph && relationGraphContainer.value) {
      const width = relationGraphContainer.value.clientWidth
      const height = relationGraphContainer.value.clientHeight
      console.log('调整关系图谱画布大小:', width, height)

      // 直接改变画布大小并重绘
      relationGraph.changeSize(width, height)
      relationGraph.paint()
    }
  }
}

// ========== 新增高级功能 ==========

// 1. 节点搜索高亮
const handleSearch = () => {
  if (!searchKeyword.value) {
    searchResults.value = []
    clearHighlight()
    return
  }

  // 搜索匹配的节点
  searchResults.value = graphData.value.nodes.filter((node) =>
    node.label.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
}

const handleHighlightNode = (nodeId) => {
  if (!graph) return

  // 清除之前的高亮
  clearHighlight()

  // 高亮选中的节点
  const node = graph.findById(nodeId)
  if (node) {
    graph.setItemState(node, 'highlight', true)

    // 居中显示
    graph.focusItem(node, true, {
      easing: 'easeCubic',
      duration: 500
    })

    // 选中节点
    const nodeModel = node.getModel()
    selectedNode.value = nodeModel
  }
}

const clearHighlight = () => {
  if (!graph) return

  const nodes = graph.getNodes()
  nodes.forEach((node) => {
    graph.clearItemStates(node, ['highlight', 'path-highlight'])

    // 恢复所有字段矩形的样式
    const group = node.getContainer()
    const shapes = group.get('children')
    shapes.forEach((shape) => {
      const shapeName = shape.get('name')
      // 如果是字段矩形，恢复默认样式
      if (
        shapeName &&
        !shapeName.includes('-text') &&
        shapeName !== 'header-bg' &&
        shapeName !== 'body-bg' &&
        shapeName !== 'main-box' &&
        shapeName !== 'header-text' &&
        !shapeName.startsWith('divider-')
      ) {
        shape.attr({
          fill: '#ffffff',
          stroke: 'transparent',
          lineWidth: 0
        })
      }
    })
  })

  const edges = graph.getEdges()
  edges.forEach((edge) => {
    graph.clearItemStates(edge, ['highlight', 'path-highlight'])
  })
}

// 2. 路径分析
const handlePathAnalysis = () => {
  if (!pathAnalysis.value.startNode || !pathAnalysis.value.endNode) {
    Modal.message({ message: '请选择起点和终点', status: 'warning' })
    return
  }

  console.log('🔍 路径分析:', {
    start: pathAnalysis.value.startNode,
    end: pathAnalysis.value.endNode,
    edges: graphData.value.edges
  })

  // 查找所有边的路径（字段级）
  const edgePaths = findAllEdgePaths(
    pathAnalysis.value.startNode,
    pathAnalysis.value.endNode,
    graphData.value.edges
  )

  pathAnalysis.value.paths = edgePaths

  console.log('找到路径数:', edgePaths.length)
  edgePaths.forEach((path, idx) => {
    console.log(
      `  路径${idx + 1}:`,
      path.edges.map((e) => `${e.sourceField} -> ${e.targetField}`)
    )
  })

  if (edgePaths.length > 0) {
    Modal.message({ message: `找到 ${edgePaths.length} 条路径`, status: 'success' })
  } else {
    Modal.message({ message: '未找到连接路径', status: 'warning' })
  }
}

// 查找所有边的路径（字段级）
const findAllEdgePaths = (startTableId, endTableId, edges) => {
  const paths = []
  const visited = new Set()

  // 构建字段级的邻接表
  const fieldGraph = {}
  edges.forEach((edge) => {
    const sourceFieldId = edge._sourceFieldId || `${edge.source}:virtual`
    const targetFieldId = edge._targetFieldId || `${edge.target}:virtual`

    if (!fieldGraph[sourceFieldId]) {
      fieldGraph[sourceFieldId] = []
    }
    fieldGraph[sourceFieldId].push({
      targetFieldId,
      edge
    })
  })

  // 找到起点表的所有字段
  const startFields = edges
    .filter((e) => e.source === startTableId)
    .map((e) => e._sourceFieldId)
    .filter((v, i, a) => a.indexOf(v) === i) // 去重

  // 找到终点表的所有字段
  const endFields = edges
    .filter((e) => e.target === endTableId)
    .map((e) => e._targetFieldId)
    .filter((v, i, a) => a.indexOf(v) === i) // 去重

  console.log('起点字段:', startFields)
  console.log('终点字段:', endFields)

  // DFS 查找所有路径
  const dfs = (currentFieldId, edgePath) => {
    // 检查是否到达终点
    if (endFields.includes(currentFieldId)) {
      paths.push({
        edges: [...edgePath],
        fields: edgePath
          .map((e) => e._sourceFieldId)
          .concat(edgePath[edgePath.length - 1]._targetFieldId)
      })
      return
    }

    visited.add(currentFieldId)
    const neighbors = fieldGraph[currentFieldId] || []

    for (const { targetFieldId, edge } of neighbors) {
      if (!visited.has(targetFieldId)) {
        edgePath.push(edge)
        dfs(targetFieldId, edgePath)
        edgePath.pop()
      }
    }

    visited.delete(currentFieldId)
  }

  // 从每个起点字段开始查找
  startFields.forEach((startFieldId) => {
    if (startFieldId) {
      dfs(startFieldId, [])
    }
  })

  return paths
}

const handleHighlightPath = (pathData) => {
  if (!graph) {
    console.warn('⚠️ graph 不存在')
    return
  }

  console.log('🔦 点击路径分析，路径数据:', pathData)

  clearHighlight()

  // 高亮路径上的边，并收集字段ID
  const highlightedFields = new Set()
  const allEdges = graph.getEdges()

  console.log('  当前图中总边数:', allEdges.length)
  console.log('  路径中的边数:', pathData.edges.length)

  // 遍历路径中的每条边
  pathData.edges.forEach((edgeData, idx) => {
    console.log(`  处理边 ${idx + 1}:`, {
      source: edgeData.source,
      target: edgeData.target,
      sourceField: edgeData._sourceFieldId,
      targetField: edgeData._targetFieldId
    })

    // 在图中查找对应的边
    const edge = allEdges.find((e) => {
      const model = e.getModel()
      return (
        model.id === edgeData.id ||
        (model.source === edgeData.source &&
          model.target === edgeData.target &&
          model._sourceFieldId === edgeData._sourceFieldId &&
          model._targetFieldId === edgeData._targetFieldId)
      )
    })

    if (edge) {
      graph.setItemState(edge, 'path-highlight', true)
      console.log('    ✅ 高亮边:', edge.getModel().id)

      // 收集字段
      if (edgeData._sourceFieldId && edgeData._targetFieldId) {
        const sourceField = { fieldId: edgeData._sourceFieldId, tableId: edgeData.source }
        const targetField = { fieldId: edgeData._targetFieldId, tableId: edgeData.target }

        const sourceKey = `${sourceField.tableId}:${sourceField.fieldId}`
        const targetKey = `${targetField.tableId}:${targetField.fieldId}`

        if (!Array.from(highlightedFields).some((f) => `${f.tableId}:${f.fieldId}` === sourceKey)) {
          highlightedFields.add(sourceField)
        }
        if (!Array.from(highlightedFields).some((f) => `${f.tableId}:${f.fieldId}` === targetKey)) {
          highlightedFields.add(targetField)
        }
      }
    } else {
      console.warn(`    ⚠️ 未找到边`)
    }
  })

  console.log('  总共收集到字段数:', highlightedFields.size)

  // 高亮所有字段
  highlightedFields.forEach(({ fieldId, tableId }) => {
    highlightFieldRect(tableId, fieldId)
    console.log('    高亮字段:', fieldId, 'in', tableId)
  })
}

// 点击连线时高亮路径
const highlightEdgePath = (clickedEdge, edgeModel) => {
  if (!graph) return

  clearHighlight()

  console.log('🔗 点击连线详情:', {
    source: edgeModel.source,
    target: edgeModel.target,
    sourceField: edgeModel._sourceFieldId,
    targetField: edgeModel._targetFieldId
  })

  const sourceFieldId = edgeModel._sourceFieldId
  const targetFieldId = edgeModel._targetFieldId

  if (!sourceFieldId || !targetFieldId) {
    console.warn('⚠️ 边缺少字段ID信息')
    return
  }

  // 递归高亮该字段及其下游所有关联
  const highlightedFields = new Set()
  const highlightedEdges = new Set()

  const edges = graph.getEdges()

  const highlightFieldAndDownstream = (fieldId, tableId) => {
    if (highlightedFields.has(fieldId)) return

    highlightedFields.add(fieldId)
    console.log('    高亮字段:', fieldId)

    // 高亮该字段对应的矩形
    highlightFieldRect(tableId, fieldId)

    // 查找从该字段出发的所有连线
    edges.forEach((e) => {
      const model = e.getModel()
      if (model._sourceFieldId === fieldId && !highlightedEdges.has(model.id)) {
        highlightedEdges.add(model.id)
        graph.setItemState(e, 'path-highlight', true)
        console.log('    高亮边:', model.id)

        // 递归高亮目标字段
        if (model._targetFieldId) {
          highlightFieldAndDownstream(model._targetFieldId, model.target)
        }
      }
    })
  }

  // 从源字段开始递归高亮
  if (sourceFieldId) {
    highlightFieldAndDownstream(sourceFieldId, edgeModel.source)
  }

  // 高亮目标字段及其下游
  if (targetFieldId) {
    highlightFieldAndDownstream(targetFieldId, edgeModel.target)
  }

  // 高亮点击的这条边
  graph.setItemState(clickedEdge, 'path-highlight', true)
}

// 高亮表节点中的某个字段矩形
const highlightFieldRect = (tableId, fieldId, isSelected = false) => {
  const tableNode = graph.findById(tableId)
  if (!tableNode) return

  const group = tableNode.getContainer()
  const shapes = group.get('children')

  // 查找该字段对应的矩形
  shapes.forEach((shape) => {
    if (shape.get('name') === fieldId) {
      // 修改矩形样式为高亮
      if (isSelected) {
        // 影响范围模式下的选中样式（绿色）
        shape.attr({
          fill: '#e8f5e9',
          stroke: '#4caf50',
          lineWidth: 2
        })
      } else {
        // 普通模式下的高亮样式（蓝色）
        shape.attr({
          fill: '#e3f2fd',
          stroke: '#2196f3',
          lineWidth: 2
        })
      }
    }
  })
}

// 清除节点选中样式
const clearNodeSelection = () => {
  if (!graph) return
  
  // 清除所有节点的 active 状态
  graph.getNodes().forEach((node) => {
    graph.clearItemStates(node, 'active')
  })
  
  // 清除所有字段矩形的高亮样式
  graph.getNodes().forEach((node) => {
    const nodeModel = node.getModel()
    if (nodeModel.nodeType === 'TABLE' && nodeModel.columns) {
      const group = node.getContainer()
      const shapes = group.get('children')
      
      shapes.forEach((shape) => {
        const shapeName = shape.get('name')
        const isField = nodeModel.columns.some(col => col.id === shapeName)
        
        if (isField) {
          shape.attr({
            fill: '#ffffff',
            stroke: 'transparent',
            lineWidth: 0
          })
        }
      })
    }
  })
}

// 3. 影响范围分析

const handleAnalyzeImpact = async () => {
  if (selectedNodes.value.length === 0) {
    Modal.message({ message: '请先选择节点', status: 'warning' })
    return
  }

  loading.value = true

  try {
    // 分析影响范围（查询所有选中节点的下游）
    const impactedNodesMap = new Map()

    console.log('🔍 分析影响范围，选中节点:', selectedNodes.value)

    for (const node of selectedNodes.value) {
      console.log('  查询节点:', node.id, node.label)

      const result = await queryFullLineage({
        nodeId: node.id,
        nodeType: node.nodeType,
        upDepth: 0,
        downDepth: 3
      })

      console.log('  查询结果:', result)

      // 处理后端返回的数据格式
      let nodes = []
      if (result && result.code === 0 && result.data && result.data.nodes) {
        nodes = result.data.nodes
      } else if (result && result.nodes) {
        nodes = result.nodes
      }

      console.log('  解析到的节点数:', nodes.length)

      nodes.forEach((n) => {
        if (!impactedNodesMap.has(n.id)) {
          impactedNodesMap.set(n.id, n)
        }
      })
    }

    console.log('🎯 影响范围分析完成，影响节点数:', impactedNodesMap.size)

    // 高亮影响范围
    clearHighlight()
    impactedNodesMap.forEach((node, nodeId) => {
      const graphNode = graph.findById(nodeId)
      if (graphNode) {
        graph.setItemState(graphNode, 'highlight', true)
      }
    })

    // 统计影响的表和字段数量
    const impactedNodes = Array.from(impactedNodesMap.values())
    const tableCount = impactedNodes.filter((n) => n.nodeType === 'TABLE').length
    const columnCount = impactedNodes.filter((n) => n.nodeType === 'COLUMN').length

    // 保存分析结果
    impactAnalysisResult.value = {
      totalCount: impactedNodes.length,
      tableCount: tableCount,
      columnCount: columnCount,
      nodes: impactedNodes.map((n) => ({
        id: n.id,
        label: n.label || n.name,
        nodeType: n.nodeType
      }))
    }

    Modal.message({
      message: `影响范围分析完成，共影响 ${impactedNodes.length} 个节点`,
      status: 'success'
    })
  } catch (error) {
    console.error('分析失败:', error)
    Modal.message({ message: `分析失败: ${error.message || '未知错误'}`, status: 'error' })
  } finally {
    loading.value = false
  }
}

const handleClearSelection = () => {
  selectedNodes.value = []
  impactAnalysisResult.value = null  // 清除分析结果
  
  if (graph) {
    // 清除所有选中样式
    graph.getNodes().forEach((node) => {
      graph.clearItemStates(node, 'selected')
      graph.clearItemStates(node, 'highlight')  // 清除影响范围高亮
    })
    
    // 清除边的高亮样式
    graph.getEdges().forEach((edge) => {
      graph.clearItemStates(edge, 'path-highlight')
    })
    
    // 清除字段矩形的高亮样式
    graph.getNodes().forEach((node) => {
      const nodeModel = node.getModel()
      if (nodeModel.nodeType === 'TABLE' && nodeModel.columns) {
        const group = node.getContainer()
        const shapes = group.get('children')
        
        // 恢复所有字段矩形的样式
        shapes.forEach((shape) => {
          const shapeName = shape.get('name')
          const isField = nodeModel.columns.some(col => col.id === shapeName)
          
          if (isField) {
            shape.attr({
              fill: '#ffffff',
              stroke: 'transparent',
              lineWidth: 0
            })
          }
        })
      }
    })
  }
}

// 聚焦到指定节点
const handleFocusNode = (nodeId) => {
  if (!graph) return

  const node = graph.findById(nodeId)
  if (node) {
    graph.focusItem(node, true, {
      easing: 'easeCubic',
      duration: 500
    })

    // 高亮节点
    graph.getNodes().forEach((n) => {
      graph.setItemState(n, 'highlight', n === node)
    })
  }
}

// 4. 时间轴演变
const handleToggleTimeline = () => {
  timelineVisible.value = !timelineVisible.value

  if (timelineVisible.value) {
    // 初始化时间轴数据（模拟数据）
    initTimelineData()
  }
}

const initTimelineData = () => {
  // 模拟不同时间点的血缘快照
  const currentData = { ...graphData.value }

  timelineSnapshots.value = [
    {
      timestamp: '2024-01-01 10:00:00',
      description: '初始血缘，基础表创建',
      nodeCount: Math.floor(currentData.nodes.length * 0.3),
      edgeCount: Math.floor(currentData.edges.length * 0.3),
      data: {
        nodes: currentData.nodes.slice(0, Math.floor(currentData.nodes.length * 0.3)),
        edges: currentData.edges.slice(0, Math.floor(currentData.edges.length * 0.3))
      }
    },
    {
      timestamp: '2024-03-15 14:30:00',
      description: '中间层表添加',
      nodeCount: Math.floor(currentData.nodes.length * 0.6),
      edgeCount: Math.floor(currentData.edges.length * 0.6),
      data: {
        nodes: currentData.nodes.slice(0, Math.floor(currentData.nodes.length * 0.6)),
        edges: currentData.edges.slice(0, Math.floor(currentData.edges.length * 0.6))
      }
    },
    {
      timestamp: '2024-06-20 16:00:00',
      description: '完整血缘，所有表关系',
      nodeCount: currentData.nodes.length,
      edgeCount: currentData.edges.length,
      data: currentData
    }
  ]

  timelineValue.value = timelineSnapshots.value.length - 1
}

const handleTimelineChange = (value) => {
  const snapshot = timelineSnapshots.value[value]
  if (snapshot && graph) {
    // 渲染快照数据
    graph.changeData(snapshot.data)
    graph.fitView(20)

    Modal.message({ message: `已切换到: ${snapshot.timestamp}`, status: 'info' })
  }
}

// 获取节点类型显示名称
const getNodeTypeName = (nodeType) => {
  const nameMap = {
    DATASOURCE: '数据源',
    TABLE: '表',
    COLUMN: '字段'
  }
  return nameMap[nodeType] || nodeType
}

const getNodeTypeColor = (nodeType) => {
  const colorMap = {
    DATASOURCE: 'info',
    TABLE: 'success',
    COLUMN: 'warning'
  }
  return colorMap[nodeType] || 'default'
}

// 从字段节点获取所属表名
const getTableNameFromNode = (node) => {
  if (!node || node.nodeType !== 'COLUMN') return ''

  // 优先使用我们在点击时保存的表名
  if (node._tableName) {
    return node._tableName
  }

  // 字段名格式通常为: tableName.fieldName
  if (node.label && node.label.includes('.')) {
    return node.label.split('.')[0]
  }

  // 如果有 name 属性
  if (node.name && node.name.includes('.')) {
    return node.name.split('.')[0]
  }

  // 尝试从 graphData 中查找该字段所属的表
  for (const graphNode of graphData.value.nodes) {
    if (graphNode.nodeType === 'TABLE' && graphNode.columns) {
      const hasColumn = graphNode.columns.some(
        (col) => col.id === node.id || col.name === node.label || col.name === node.name
      )
      if (hasColumn) {
        return graphNode.label || graphNode.name
      }
    }
  }

  return ''
}

// 获取路径显示名称
const getPathDisplayName = (pathData) => {
  if (!pathData || !pathData.edges || pathData.edges.length === 0) {
    return ''
  }

  // 找到起点和终点的表名和字段名
  const firstEdge = pathData.edges[0]
  const lastEdge = pathData.edges[pathData.edges.length - 1]

  // 从 graphData 中查找表名
  const sourceTable = graphData.value.nodes.find((n) => n.id === firstEdge.source)
  const targetTable = graphData.value.nodes.find((n) => n.id === lastEdge.target)

  // 从字段ID查找字段名
  const sourceFieldName = getFieldNameById(firstEdge._sourceFieldId)
  const targetFieldName = getFieldNameById(lastEdge._targetFieldId)

  const sourceTableName = sourceTable?.label || 'unknown'
  const targetTableName = targetTable?.label || 'unknown'

  return `${sourceTableName}.${sourceFieldName} → ${targetTableName}.${targetFieldName}`
}

// 根据字段ID获取字段名
const getFieldNameById = (fieldId) => {
  if (!fieldId) return 'unknown'

  // 遍历所有表节点，查找字段
  for (const node of graphData.value.nodes) {
    if (node.columns) {
      const field = node.columns.find((col) => col.id === fieldId)
      if (field) {
        return field.name
      }
    }
  }
  return 'unknown'
}

// 窗口resize处理
const handleResize = () => {
  if (graph && graphContainer.value) {
    graph.changeSize(graphContainer.value.clientWidth, graphContainer.value.clientHeight)
    graph.fitView(20)
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (graph) {
    graph.destroy()
    graph = null
  }
  isRendering = false // 重置渲染标志
})
</script>

<style scoped lang="less">
.lineage-graph-page {
  display: flex;
  height: calc(100vh - 140px);
  gap: 8px;

  // 最大化状态
  &.maximized {
    .center-panel {
      width: 100%;
      flex: none;
    }
  }

  // 覆盖 TinyVue Card 的默认宽度限制
  :deep(.tiny-card) {
    width: 100% !important;
  }

  .left-panel {
    width: 340px;
    flex-shrink: 0;

    .function-panel {
      height: 100%;
      display: flex;
      flex-direction: column;

      :deep(.tiny-card__body) {
        padding: 0;
        flex: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }

      :deep(.tiny-tabs) {
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      :deep(.tiny-tabs__header) {
        flex-shrink: 0;
        padding: 12px 16px 0;
      }

      :deep(.tiny-tabs__content) {
        flex: 1;
        overflow-y: auto;
        padding: 12px 16px 16px;
      }

      :deep(.tiny-form-item) {
        margin-bottom: 16px;
      }

      .depth-control {
        display: flex;
        align-items: center;
        gap: 12px;

        .tiny-slider {
          flex: 1;
        }

        .depth-value {
          min-width: 20px;
          text-align: center;
          font-weight: 500;
          color: #1890ff;
          font-size: 14px;
        }
      }

      .depth-hint {
        font-size: 12px;
        color: #999;
        margin-top: 4px;
      }

      .quick-actions {
        .action-title {
          font-weight: 500;
          margin-bottom: 12px;
          color: #333;
        }
      }

      // 搜索结果
      .search-section {
        .action-title {
          font-weight: 500;
          margin-bottom: 12px;
          color: #333;
        }

        .search-results {
          max-height: 200px;
          overflow-y: auto;
          margin-top: 12px;

          .search-result-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px;
            border: 1px solid #e8e8e8;
            border-radius: 4px;
            margin-bottom: 8px;
            cursor: pointer;
            transition: all 0.3s;

            &:hover {
              background: #f5f5f5;
              border-color: #1890ff;
            }

            .node-name {
              flex: 1;
              font-size: 12px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          }
        }
      }

      // 路径分析
      .path-analysis-section {
        .action-title {
          font-weight: 500;
          margin-bottom: 12px;
          color: #333;
        }

        .path-results {
          margin-top: 12px;

          .path-count {
            font-size: 12px;
            color: #999;
            margin-bottom: 8px;
          }

          .path-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 12px;
            background: #f5f5f5;
            border-radius: 4px;
            margin-bottom: 8px;
            cursor: pointer;
            transition: all 0.3s;

            &:hover {
              background: #e6f7ff;
              border: 1px solid #1890ff;
            }

            .path-index {
              font-size: 12px;
              font-weight: 500;
            }

            .path-nodes {
              font-size: 12px;
              color: #999;
            }
          }
        }
      }

      // 影响范围
      .impact-section {
        .action-title {
          font-weight: 500;
          margin-bottom: 12px;
          color: #333;
        }

        .selected-nodes {
          margin-top: 12px;

          .selected-count {
            font-size: 12px;
            color: #1890ff;
            margin-bottom: 8px;
            font-weight: 500;
          }
        }
      }
    }
  }

  .center-panel {
    flex: 1;
    min-width: 0;
    transition: all 0.3s ease;
    transition: all 0.3s ease;

    // 最大化状态
    &.maximized {
      width: 100%;
      flex: none;
    }

    :deep(.tiny-card--logo) {
      padding: 0px;
    }

    :deep(.tiny-card--logo__title){
      padding: 10px;
    }

    .graph-card {
      height: 100%;
      display: flex;
      flex-direction: column;

      :deep(.tiny-card__body) {
        flex: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }

      .graph-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;

        .graph-controls {
          display: flex;
          align-items: center;
          gap: 16px;

          .view-mode-switch {
            :deep(.tiny-button-group) {
              display: flex;
              gap: 0;
            }

            :deep(.tiny-button) {
              padding: 4px 12px;
              font-size: 12px;
            }
          }

          .graph-actions {
            display: flex;
            gap: 4px;

            :deep(.tiny-button) {
              padding: 4px 8px;
              font-size: 14px;
            }
          }
        }

        .graph-stats {
          font-size: 12px;
          color: #999;
          font-weight: normal;
        }
      }

      // 时间轴面板
      .timeline-panel {
        background: #f5f7fa;
        border-radius: 4px;
        padding: 16px;
        margin-bottom: 16px;

        .timeline-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          font-weight: 500;
          color: #333;
        }

        .timeline-slider {
          margin-bottom: 16px;
        }

        .timeline-info {
          .snapshot-info {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 12px;

            .snapshot-time {
              font-weight: 500;
              color: #333;
            }

            .snapshot-desc {
              color: #666;
            }
          }
        }
      }

      .empty-graph {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 500px;

        .empty-icon {
          font-size: 64px;
          margin-bottom: 16px;
        }

        .empty-text {
          font-size: 16px;
          color: #666;
          margin-bottom: 8px;
        }

        .empty-hint {
          font-size: 12px;
          color: #999;
        }
      }

      .graph-container {
        width: 100%;
        height: calc(100vh - 180px);
        border-top: 1px solid #e8e8e8;
        //border-top-radius: 4px;
        position: relative;
        overflow: hidden;
      }

      // relation-graph 容器
      .relation-graph-container {
        width: 100%;
        height: calc(100vh - 180px);
        border: 1px solid #e8e8e8;
        border-radius: 4px;
        position: relative;
        overflow: hidden;

        .relation-hint {
          position: absolute;
          top: 12px;
          left: 12px;
          right: 12px;
          z-index: 10;

          :deep(.tiny-alert) {
            margin: 0;
          }
        }

        :deep(.rel-map) {
          width: 100%;
          height: 100%;
        }
      }

      // 图例说明（右下角浮层）
      .graph-legend {
        position: absolute;
        right: 24px;
        bottom: 24px;
        background: rgba(255, 255, 255, 0.95);
        border: 1px solid #e8e8e8;
        border-radius: 4px;
        padding: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        z-index: 10;

        .legend-title {
          font-size: 13px;
          font-weight: 600;
          color: #333;
          margin-bottom: 8px;
          padding-bottom: 8px;
          border-bottom: 1px solid #e8e8e8;
        }

        .legend-content {
          display: flex;
          gap: 20px;

          .legend-section {
            .legend-label {
              font-size: 12px;
              color: #666;
              margin-bottom: 6px;
            }

            .legend-items {
              display: flex;
              flex-direction: column;
              gap: 6px;

              .legend-item {
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 12px;
                color: #666;

                .legend-node {
                  width: 20px;
                  height: 14px;
                  border-radius: 2px;
                  flex-shrink: 0;

                  &.datasource {
                    background: #5b8ff9;
                    border: 1px solid #2e5ca8;
                  }

                  &.table {
                    background: #5ad8a6;
                    border: 1px solid #30a776;
                  }

                  &.column {
                    background: #f6bd16;
                    border: 1px solid #c99210;
                  }

                  // 关系图谱视图的节点样式
                  &.relation-node {
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: #8c96a8;
                    border: 1px solid #6b7588;
                  }
                }

                .legend-edge {
                  width: 24px;
                  height: 0;
                  border-top-width: 2px;
                  border-top-style: solid;
                  flex-shrink: 0;

                  &.read {
                    border-top-color: #5b8ff9;
                    border-top-style: dashed;
                  }

                  &.write {
                    border-top-color: #ff6b6b;
                  }

                  &.transform {
                    border-top-color: #9254de;
                    border-top-style: dotted;
                  }

                  // 关系图谱视图的边样式
                  &.contains {
                    border-top-color: #95a5a6;
                    border-top-style: solid;
                  }

                  &.relation-transform {
                    border-top-color: #3498db;
                    border-top-style: solid;
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  .right-panel {
    width: 340px;
    flex-shrink: 0;

    .detail-panel {
      height: 100%;

      :deep(.tiny-card__body) {
        padding: 16px;
        height: calc(100% - 56px);
        overflow-y: auto;
      }

      .empty-detail {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 300px;
        color: #999;

        .empty-icon {
          font-size: 64px;
          margin-bottom: 16px;
        }

        .empty-text {
          font-size: 14px;
        }
      }

      .node-detail {
        .detail-section {
          margin-bottom: 16px;

          .section-title {
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 12px;
            color: #333;
          }

          .properties-hint {
            font-size: 12px;
            color: #999;
            margin-bottom: 10px;
            padding: 6px 10px;
            background: #f5f7fa;
            border-radius: 4px;
            line-height: 1.5;
          }

          .detail-row {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
            font-size: 13px;

            .detail-label {
              color: #666;
              min-width: 80px;
            }

            .detail-value {
              color: #333;
              word-break: break-all;
            }
          }

          .empty-properties {
            color: #999;
            font-size: 12px;
            text-align: center;
            padding: 12px 0;
          }
        }
      }
    }
  }

  // 影响范围分析结果样式
  .impact-result {
    margin-top: 12px;

    .result-summary {
      margin-bottom: 12px;

      .summary-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
        font-size: 13px;

        .summary-label {
          color: #666;
        }
      }
    }

    .impact-nodes-list {
      margin-top: 12px;

      .list-header {
        font-size: 13px;
        font-weight: 600;
        color: #333;
        margin-bottom: 8px;
        padding-bottom: 8px;
        border-bottom: 1px solid #e8e8e8;
      }

      .node-list {
        max-height: 300px;
        overflow-y: auto;

        .impact-node-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 8px;
          margin-bottom: 4px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;

          &:hover {
            background: #f5f7fa;
          }

          .node-name {
            flex: 1;
            font-size: 12px;
            color: #333;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      }
    }
  }
}
</style>
