<template>
  <div class="page-container">
    <Breadcrumb :items="['AI 中心', '知识库']" />
    <div class="contain">
      <div class="kb-layout">
        <!-- 左侧知识库列表 -->
        <div class="kb-sidebar">
          <div class="sidebar-header">
            <span class="sidebar-title">知识库</span>
            <tiny-button size="mini" type="primary" @click="openKbDialog()">+ 新建</tiny-button>
          </div>
          <div v-if="kbList.length === 0 && !loading" class="empty-tip-sm">暂无知识库</div>
          <div
            v-for="kb in kbList"
            :key="kb.id"
            class="kb-item"
            :class="{ active: selectedKb?.id === kb.id }"
            @click="selectKb(kb)"
          >
            <div class="kb-name">{{ kb.name }}</div>
            <div class="kb-meta">{{ kb.docCount || 0 }} 文档</div>
            <div class="kb-ops">
              <tiny-button size="mini" plain @click.stop="openKbDialog(kb)">编辑</tiny-button>
              <tiny-button size="mini" type="danger" plain @click.stop="deleteKb(kb)">删除</tiny-button>
            </div>
          </div>
        </div>

        <!-- 右侧主区域 -->
        <div class="kb-main">
          <template v-if="selectedKb">
            <!-- Tab 导航 -->
            <div class="main-tabs">
              <span :class="['tab-btn', mainTab === 'docs' ? 'active' : '']" @click="mainTab = 'docs'">📄 文档管理</span>
              <span :class="['tab-btn', mainTab === 'graph' ? 'active' : '']" @click="switchGraphTab()">🕸️ 知识图谱</span>
              <span :class="['tab-btn', mainTab === 'search' ? 'active' : '']" @click="mainTab = 'search'">🔍 检索测试</span>
            </div>

            <!-- 文档管理 Tab -->
            <div v-if="mainTab === 'docs'">
              <div class="doc-header">
                <div class="doc-title">
                  <span class="kb-icon">📚</span>
                  <span>{{ selectedKb.name }}</span>
                  <span class="kb-desc">{{ selectedKb.description }}</span>
                </div>
                <div class="doc-actions">
                  <tiny-button type="primary" @click="openDocDialog">+ 文本文档</tiny-button>
                  <tiny-button type="success" @click="openUploadDialog">上传文件</tiny-button>
                </div>
              </div>
              <tiny-grid :data="docList" border show-header size="small" max-height="500">
                <tiny-grid-column title="文档名称" field="fileName" />
                <tiny-grid-column title="类型" field="fileType" width="80" />
                <tiny-grid-column title="状态" width="160">
                  <template #default="{ row }">
                    <div style="display:flex;flex-wrap:wrap;gap:4px;align-items:center">
                      <span :class="['doc-status', statusClass(row.status)]">{{ statusLabel(row.status) }}</span>
                      <span v-if="row.status === 'PARSING' || row.status === 'VECTORIZING' || row.status === 'GRAPH_BUILDING'" class="status-spin"> ⏳</span>
                      <span v-if="selectedKb.vectorConnectorId && row.status === 'DONE'" class="doc-tag-vector">向量化</span>
                      <span v-if="row.graphNodeCount > 0" class="doc-tag-graph">图谱</span>
                    </div>
                  </template>
                </tiny-grid-column>
                <tiny-grid-column title="分块数" field="chunkCount" width="80" />
                <tiny-grid-column title="图谱节点" field="graphNodeCount" width="90" />
                <tiny-grid-column title="创建时间" width="150">
                  <template #default="{ row }">
                    {{ row.createTime ? new Date(row.createTime).toLocaleString('zh-CN', { year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' }) : '' }}
                  </template>
                </tiny-grid-column>
                <tiny-grid-column title="操作" width="380" align="center">
                  <template #default="{ row }">
                    <tiny-button v-if="selectedKb.vectorConnectorId && row.status === 'DONE'" size="mini" plain @click="reVectorizeDoc(row)" style="color:#e6a23c;border-color:#e6a23c">重新向量化</tiny-button>
                    <tiny-button v-if="row.status !== 'PENDING' && row.status !== 'PARSING' && row.status !== 'VECTORIZING'" size="mini" plain @click="openContentDialog(row)">{{ row.fileType === 'TEXT' ? '编辑内容' : '查看内容' }}</tiny-button>
                    <tiny-button v-if="selectedKb.graphModelId" size="mini" plain @click="triggerExtract(row)">抽取图谱</tiny-button>
                    <tiny-button size="mini" type="danger" @click="deleteDoc(row)">删除</tiny-button>
                  </template>
                </tiny-grid-column>
              </tiny-grid>
            </div>

            <!-- 知识图谱 Tab -->
            <div v-if="mainTab === 'graph'" class="graph-tab">
              <div class="graph-tab-scroll">
              <!-- 图谱配置提示 -->
              <div v-if="!selectedKb.graphModelId" class="graph-warn">
                ⚠️ 当前知识库未配置图谱语义模型，请先编辑知识库并选择 LLM 模型。
              </div>

              <!-- 实体类型模板管理 -->
              <div class="graph-section">
                <div class="section-header">
                  <span class="section-title">实体类型模板</span>
                  <div style="display:flex;gap:6px">
                    <tiny-button size="mini" plain @click="openImportSchemaDialog">📊 Excel导入</tiny-button>
                    <tiny-button size="mini" type="primary" @click="openSchemaDialog()">+ 新增类型</tiny-button>
                  </div>
                </div>
                <div v-if="graphSchemas.length === 0" class="empty-tip-sm">暂无实体类型，添加后 LLM 抽取时将按模板识别实体</div>
                <div v-else class="schema-list">
                  <div v-for="s in graphSchemas" :key="s.id" class="schema-item">
                    <div class="schema-name">
                      <span class="schema-badge">{{ s.entityType }}</span>
                      <span class="schema-desc">{{ s.description }}</span>
                    </div>
                    <div class="schema-attrs">
                      <span v-for="a in parseJsonArr(s.attributes || s.attributesJson).slice(0, 5)" :key="a" class="attr-tag">{{ a }}</span>
                      <span v-if="parseJsonArr(s.attributes || s.attributesJson).length > 5" class="attr-more">+{{ parseJsonArr(s.attributes || s.attributesJson).length - 5 }}</span>
                    </div>
                    <div class="schema-relations">
                      <span v-for="r in parseJsonArr(s.relations || s.relationsJson).slice(0, 3)" :key="r" class="rel-tag">→ {{ r }}</span>
                    </div>
                    <tiny-button size="mini" plain @click="openSchemaDialog(s)">编辑</tiny-button>
                    <tiny-button size="mini" type="danger" plain @click="deleteSchema(s)">删除</tiny-button>
                  </div>
                </div>
              </div>

              <!-- 关系图可视化 -->
              <div class="graph-section">
                <div class="section-header">
                  <span class="section-title">🕸️ 关系图谱</span>
                  <div style="display:flex;gap:8px;align-items:center">
                    <tiny-select v-model="graphViewType" placeholder="全部类型" size="mini" style="width:120px" clearable @change="loadGraphData">
                      <tiny-option v-for="s in graphSchemas" :key="s.entityType" :value="s.entityType" :label="s.entityType" />
                    </tiny-select>
                    <tiny-button size="mini" type="primary" @click="loadGraphData">刷新图谱</tiny-button>
                  </div>
                </div>
                <div v-if="graphData.nodes.length === 0" class="empty-tip-sm">暂无图谱数据，请先抽取实体</div>
                <div v-else class="graph-canvas-wrap" :class="{ 'graph-fullscreen': graphFullscreen }" ref="graphWrapRef">
                  <div class="graph-toolbar">
                    <button class="graph-tool-btn" title="放大" @click="graphZoom(1.2)">＋</button>
                    <button class="graph-tool-btn" title="缩小" @click="graphZoom(0.8)">－</button>
                    <button class="graph-tool-btn" title="复位" @click="graphReset">⊙</button>
                    <button class="graph-tool-btn" title="全屏" @click="toggleGraphFullscreen">{{ graphFullscreen ? '⊠' : '⛶' }}</button>
                  </div>
                  <canvas ref="graphCanvasRef" class="graph-canvas"
                    @click="onGraphCanvasClick"
                    @mousemove="onGraphCanvasMousemove"
                    @mousedown="onGraphMousedown"
                    @mouseup="onGraphMouseup"
                    @mouseleave="onGraphMouseup"
                    @wheel.prevent="onGraphWheel"
                    @contextmenu.prevent
                  ></canvas>
                  <div v-if="graphTooltip.visible" class="graph-tooltip" :style="{left: graphTooltip.x + 'px', top: graphTooltip.y + 'px'}">
                    <div class="tooltip-title">{{ graphTooltip.name }}</div>
                    <div class="tooltip-type">{{ graphTooltip.type }}</div>
                    <div v-if="graphTooltip.props" class="tooltip-props">{{ graphTooltip.props }}</div>
                  </div>
                  <!-- 图例 -->
                  <div class="graph-legend">
                    <div v-for="(color, type) in TYPE_COLORS" :key="type" class="graph-legend-item">
                      <div class="graph-legend-dot" :style="{ background: color }"></div>
                      <span>{{ type }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 实体列表 -->
              <div class="graph-section">
                <div class="section-header">
                  <span class="section-title">已抽取实体</span>
                  <div style="display:flex;gap:8px;align-items:center">
                    <tiny-input v-model="entityKeyword" placeholder="搜索实体名称" size="mini" style="width:160px" @keyup.enter="loadEntities" />
                    <tiny-select v-model="entityTypeFilter" placeholder="全部类型" size="mini" style="width:120px" clearable @change="loadEntities">
                      <tiny-option v-for="s in graphSchemas" :key="s.entityType" :value="s.entityType" :label="s.entityType" />
                    </tiny-select>
                    <tiny-button size="mini" @click="loadEntities">刷新</tiny-button>
                  </div>
                </div>
                <tiny-grid :data="entities" border max-height="300">
                  <tiny-grid-column title="实体名称" field="entityName" min-width="100" />
                  <tiny-grid-column title="类型" field="entityType" width="150" />
                  <tiny-grid-column title="属性" min-width="200">
                    <template #default="{ row }">
                      <span class="props-preview">{{ formatProps(row.properties) }}</span>
                    </template>
                  </tiny-grid-column>
                  <tiny-grid-column title="操作" width="80">
                    <template #default="{ row }">
                      <tiny-button size="mini" type="danger" @click="deleteEntity(row)">删除</tiny-button>
                    </template>
                  </tiny-grid-column>
                </tiny-grid>
              </div>

              <!-- 关系列表 -->
              <div class="graph-section">
                <div class="section-header">
                  <span class="section-title">已抽取关系</span>
                  <tiny-button size="mini" @click="loadRelations">刷新</tiny-button>
                </div>
                <tiny-grid :data="relations" border max-height="300">
                  <tiny-grid-column title="主体实体" field="sourceEntityName" min-width="120" />
                  <tiny-grid-column title="关系类型" field="relationType" width="120" />
                  <tiny-grid-column title="客体实体" field="targetEntityName" min-width="120" />
                  <tiny-grid-column title="置信度" field="confidence" width="80" />
                  <tiny-grid-column title="来源文档" field="documentName" min-width="150" />
                </tiny-grid>
              </div>
              </div>
            </div>

            <!-- 检索测试 Tab -->
            <div v-if="mainTab === 'search'" class="search-tab">
              <div class="search-bar">
                <tiny-input v-model="searchQuery" placeholder="输入查询语句，测试知识库检索效果..." style="flex:1" @keyup.enter="doSearch" />
                <tiny-button type="primary" :loading="searching" @click="doSearch">检索</tiny-button>
              </div>
              <!-- fallback 提示 -->
              <div v-if="searchDone && searchResult?.fallback" class="search-fallback">
                ⚠️ 知识库中未检索到置信度足够的内容（全部 Chunk 分数低于 CRAG 阈值），建议 LLM 回复「暂无相关信息」。
              </div>
              <!-- 图谱上下文 -->
              <div v-if="searchResult?.graphContext" class="graph-context-box">
                <div class="graph-context-title">🕸️ 图谱上下文</div>
                <pre class="graph-context-content">{{ searchResult.graphContext }}</pre>
              </div>
              <!-- Chunk 列表 -->
              <div v-if="(searchResult?.chunks || []).length > 0" class="search-results">
                <div class="search-results-title">命中 {{ searchResult.chunks.length }} 个 Chunk（模式：{{ searchResult.mode }}）：</div>
                <div v-for="r in searchResult.chunks" :key="r.chunkId" class="search-result-item">
                  <div class="result-meta">
                    <span class="result-doc">📄 {{ r.docName || r.docId }}</span>
                    <span :class="['result-source', 'source-' + r.source?.toLowerCase()]">{{ r.source }}</span>
                    <span class="result-score">置信度 {{ (r.score * 100).toFixed(0) }}%</span>
                  </div>
                  <div class="result-content">{{ r.content }}</div>
                </div>
              </div>
              <div v-else-if="searchDone && !searchResult?.fallback" class="empty-tip">未找到相关内容</div>
            </div>
          </template>
          <div v-else class="empty-tip">请在左侧选择或创建一个知识库</div>
        </div>
      </div>
    </div>

    <!-- 知识库编辑弹窗 -->
    <tiny-dialog-box
      v-model:visible="kbDialogVisible"
      :title="kbForm.id ? '编辑知识库' : '新建知识库'"
      width="560px"
      @close="resetKbForm"
    >
      <tiny-form :model="kbForm" label-width="120px">
        <tiny-form-item label="名称" required>
          <tiny-input v-model="kbForm.name" placeholder="知识库名称" />
        </tiny-form-item>
        <tiny-form-item label="描述">
          <tiny-input v-model="kbForm.description" type="textarea" :rows="2" placeholder="知识库用途说明" />
        </tiny-form-item>

        <div class="form-section-title">向量配置</div>
        <tiny-form-item label="向量模型" required>
          <tiny-select v-model="kbForm.embeddingModelId" placeholder="选择 Embedding 模型" style="width:100%">
            <tiny-option v-for="m in embeddingModels" :key="m.id" :value="m.id" :label="m.displayName || m.modelName" />
          </tiny-select>
        </tiny-form-item>
        <tiny-form-item label="向量数据库">
          <tiny-select v-model="kbForm.vectorConnectorId" placeholder="选择向量库连接器（Milvus 等，用于存储向量）" style="width:100%" clearable>
            <tiny-option v-if="vectorConnectors.length === 0" value="" label="暂无 Vector 类型连接器" disabled />
            <tiny-option v-for="c in vectorConnectors" :key="c.id" :value="c.id" :label="c.name || c.datasourceName" />
          </tiny-select>
          <div style="font-size:11px;color:#f59e0b;margin-top:3px">⚠️ 未选择时文档仅分块存储，不进行向量化，无法使用向量/混合检索</div>
        </tiny-form-item>
        <tiny-form-item label="重排序模型">
          <tiny-select v-model="kbForm.rerankModelId" placeholder="选择 Rerank 模型（混合检索用，可选）" style="width:100%" clearable>
            <tiny-option v-for="m in rerankModels" :key="m.id" :value="m.id" :label="m.displayName || m.modelName" />
          </tiny-select>
        </tiny-form-item>
        <tiny-form-item label="检索模式">
          <tiny-select v-model="kbForm.retrievalMode" style="width:100%">
            <tiny-option value="GRAPH_HYBRID" label="图谱优先 + 混合检索（推荐）" />
            <tiny-option value="VECTOR" label="向量检索（语义匹配）" />
            <tiny-option value="HYBRID" label="混合检索（向量 + 关键词）" />
            <tiny-option value="GRAPH" label="图谱检索（实体关系推理）" />
          </tiny-select>
          <div style="font-size:11px;color:#9ca3af;margin-top:3px">GRAPH_HYBRID：图谱命中内容优先，补充向量召回，CRAG 置信度过滤，最接近零幻觉</div>
        </tiny-form-item>

        <div class="form-section-title">文档分块规则</div>
        <tiny-form-item label="分块策略">
          <tiny-select v-model="kbForm.chunkStrategy" style="width:100%">
            <tiny-option value="FIXED" label="固定字符数（FIXED）" />
            <tiny-option value="SENTENCE" label="按句子边界（SENTENCE）" />
          </tiny-select>
        </tiny-form-item>
        <tiny-form-item label="块大小 / 重叠">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:nowrap">
            <tiny-input v-model.number="kbForm.chunkSize" type="number" style="width:90px" />
            <span style="font-size:12px;color:#9ca3af;white-space:nowrap">字符</span>
            <span style="font-size:12px;color:#d1d5db">/</span>
            <tiny-input v-model.number="kbForm.chunkOverlap" type="number" style="width:80px" />
            <span style="font-size:12px;color:#9ca3af;white-space:nowrap">重叠字符</span>
          </div>
          <div style="font-size:11px;color:#9ca3af;margin-top:3px">块大小建议 300~800，重叠建议 50~100（防语义断层）</div>
        </tiny-form-item>

        <div class="form-section-title">知识图谱（可选）</div>
        <tiny-form-item label="图谱语义模型">
          <tiny-select v-model="kbForm.graphModelId" placeholder="选择 LLM（用于 LLM 抽取实体关系，可选）" style="width:100%" clearable>
            <tiny-option v-for="m in chatModels" :key="m.id" :value="m.id" :label="m.displayName || m.modelName" />
          </tiny-select>
        </tiny-form-item>
        <tiny-form-item label="图数据库">
          <tiny-select v-model="kbForm.graphConnectorId" placeholder="选择 Neo4j 连接器（存储图谱，可选）" style="width:100%" clearable>
            <tiny-option v-if="graphConnectors.length === 0" value="" label="暂无 Graph 类型连接器" disabled />
            <tiny-option v-for="c in graphConnectors" :key="c.id" :value="c.id" :label="c.name || c.datasourceName" />
          </tiny-select>
          <div style="font-size:11px;color:#9ca3af;margin-top:3px">在「连接中心」中创建 Neo4j 连接器后可在此处选择</div>
        </tiny-form-item>
        <tiny-form-item label="CRAG 阈值">
          <div style="display:flex;align-items:center;gap:8px">
            <tiny-input v-model.number="kbForm.confidenceThreshold" type="number" style="width:80px" />
            <span style="font-size:12px;color:#9ca3af;white-space:nowrap">（0~1，建议 0.4~0.6）</span>
          </div>
          <div style="font-size:11px;color:#9ca3af;margin-top:3px">低于此分的 Chunk 将被剔除，越高检索越严格、幻觉越少</div>
        </tiny-form-item>
      </tiny-form>
      <template #footer>
        <tiny-button @click="kbDialogVisible = false">取消</tiny-button>
        <tiny-button type="primary" :loading="saving" @click="saveKb">保存</tiny-button>
      </template>
    </tiny-dialog-box>

    <!-- 实体类型模板弹窗 -->
    <tiny-dialog-box v-model:visible="schemaDialogVisible" :title="schemaForm.id ? '编辑实体类型模板' : '新增实体类型模板'" width="660px">
      <tiny-form :model="schemaForm" label-width="110px">
        <tiny-form-item label="实体类型" required>
          <tiny-input v-model="schemaForm.entityType" placeholder="如：人物、公司、产品、地点、事件" />
        </tiny-form-item>
        <tiny-form-item label="说明">
          <tiny-input v-model="schemaForm.description" placeholder="描述该实体类型的用途和识别规则" />
        </tiny-form-item>
        <tiny-form-item label="属性列表">
          <tiny-input v-model="schemaForm.attributesStr" type="textarea" :rows="3"
            placeholder="每行一个属性名，如：&#10;姓名&#10;职位&#10;所属公司&#10;联系方式" />
          <div style="font-size:11px;color:#9ca3af;margin-top:4px">LLM 抽取实体时会尝试填充这些属性</div>
        </tiny-form-item>
        <tiny-form-item label="关系类型">
          <tiny-input v-model="schemaForm.relationsStr" type="textarea" :rows="2"
            placeholder="每行一个关系类型，如：&#10;属于&#10;管理&#10;投资" />
          <div style="font-size:11px;color:#9ca3af;margin-top:4px">定义该实体可参与的关系类型</div>
        </tiny-form-item>
        <tiny-form-item label="抽取提示词">
          <tiny-input v-model="schemaForm.extractPrompt" type="textarea" :rows="3"
            placeholder="（可选）给 LLM 的专项抽取指令，留空则使用默认 Prompt" />
        </tiny-form-item>
      </tiny-form>
      <template #footer>
        <tiny-button @click="schemaDialogVisible = false">取消</tiny-button>
        <tiny-button type="primary" :loading="saving" @click="saveSchema">保存</tiny-button>
      </template>
    </tiny-dialog-box>

    <!-- Excel 批量导入实体模板弹窗 -->
    <tiny-dialog-box v-model:visible="importSchemaDialogVisible" title="批量导入实体类型模板（Excel）" width="680px">
      <!-- 格式说明 -->
      <div style="margin-bottom:12px;padding:12px 14px;background:#f0f9ff;border-radius:6px;border:1px solid #bae6fd;font-size:13px;color:#0369a1;line-height:1.9">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <span style="font-weight:600">📋 支持两种格式（自动识别）</span>
          <tiny-button size="mini" plain @click="downloadSchemaTemplate">⬇ 下载标准模板</tiny-button>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px">
          <div>
            <div style="font-weight:600;color:#0284c7;margin-bottom:2px">① 带表头（推荐）</div>
            <div>第一行为列名，列名可灵活命名：</div>
            <div style="color:#374151">· 实体类型列：<b>实体类型 / entity / 类型 / label / name</b></div>
            <div style="color:#374151">· 说明列：<b>说明 / description / desc / 备注</b></div>
            <div style="color:#374151">· 属性列：<b>属性 / attributes / props / 字段</b></div>
            <div style="color:#374151">· 关系列：<b>关系 / relations / edges / 关联</b></div>
            <div style="color:#374151">· 提示词列：<b>提示词 / prompt / extract</b></div>
          </div>
          <div>
            <div style="font-weight:600;color:#0284c7;margin-bottom:2px">② 无表头（按列顺序）</div>
            <div style="color:#374151">A列：实体类型（必填）</div>
            <div style="color:#374151">B列：说明</div>
            <div style="color:#374151">C列：属性（逗号/分号/|分隔）</div>
            <div style="color:#374151">D列：关系（逗号/分号/|分隔）</div>
            <div style="color:#374151">E列：抽取提示词</div>
          </div>
        </div>
      </div>
      <!-- 文件选择 -->
      <div class="upload-area" style="min-height:72px" @dragover.prevent @drop.prevent="onDropSchemaExcel">
        <div v-if="!importSchemaFile" class="upload-hint" @click="triggerSchemaFileInput">
          <div style="font-size:26px;margin-bottom:4px">📊</div>
          <div>点击选择或拖入 Excel 文件（.xlsx / .xls）</div>
        </div>
        <div v-else class="upload-file-info">
          <span>📄 {{ importSchemaFile.name }}</span>
          <tiny-button size="mini" plain @click="importSchemaFile = null; importPreviewRows = []">移除</tiny-button>
        </div>
      </div>
      <input ref="schemaFileInputRef" type="file" style="display:none" accept=".xlsx,.xls" @change="onSchemaFileChange" />
      <!-- 预览 -->
      <div v-if="importPreviewRows.length > 0" style="margin-top:10px">
        <div style="font-size:12px;color:#6b7280;margin-bottom:6px">
          预览（共 <b>{{ importPreviewRows.length }}</b> 条，识别模式：<b style="color:#0284c7">{{ importDetectMode }}</b>）
        </div>
        <div style="max-height:200px;overflow-y:auto;border:1px solid #e5e7eb;border-radius:6px">
          <table style="width:100%;border-collapse:collapse;font-size:12px">
            <thead>
              <tr style="background:#f9fafb;position:sticky;top:0">
                <th style="padding:6px 10px;text-align:left;border-bottom:1px solid #e5e7eb;width:90px;white-space:nowrap">实体类型</th>
                <th style="padding:6px 10px;text-align:left;border-bottom:1px solid #e5e7eb;width:100px">说明</th>
                <th style="padding:6px 10px;text-align:left;border-bottom:1px solid #e5e7eb">属性</th>
                <th style="padding:6px 10px;text-align:left;border-bottom:1px solid #e5e7eb">关系</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in importPreviewRows" :key="i" :style="{ background: i % 2 === 0 ? '#fff' : '#fafafa' }">
                <td style="padding:5px 10px;font-weight:500;color:#1d4ed8">{{ row.entityType }}</td>
                <td style="padding:5px 10px;color:#6b7280;font-size:11px">{{ row.description }}</td>
                <td style="padding:5px 10px;color:#374151;font-size:11px">{{ parseJsonArr(row.attributesJson).join('、') || '-' }}</td>
                <td style="padding:5px 10px;color:#374151;font-size:11px">{{ parseJsonArr(row.relationsJson).join('、') || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <template #footer>
        <tiny-button @click="importSchemaDialogVisible = false">取消</tiny-button>
        <tiny-button type="primary" :loading="importingSchema" :disabled="importPreviewRows.length === 0" @click="doImportSchemas">
          导入 {{ importPreviewRows.length }} 条
        </tiny-button>
      </template>
    </tiny-dialog-box>

    <!-- 文件上传弹窗 -->
    <tiny-dialog-box v-model:visible="uploadDialogVisible" title="上传文件" width="480px">
      <div class="upload-area" @dragover.prevent @drop.prevent="onDropFile">
        <div v-if="!uploadFile" class="upload-hint" @click="triggerFileInput">
          <div style="font-size: 32px; margin-bottom: 8px;">📁</div>
          <div>点击选择或将文件拖入此处</div>
          <div style="font-size: 12px; color: #9ca3af; margin-top: 4px;">支持 PDF、Word、Excel、TXT、HTML、Markdown 等</div>
        </div>
        <div v-else class="upload-file-info">
          <span>📄 {{ uploadFile.name }}</span>
          <tiny-button size="mini" plain @click="uploadFile = null">移除</tiny-button>
        </div>
      </div>
      <input ref="fileInputRef" type="file" style="display:none" accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.html,.md,.ppt,.pptx" @change="onFileChange" />
      <template #footer>
        <tiny-button @click="uploadDialogVisible = false">取消</tiny-button>
        <tiny-button type="primary" :loading="uploading" :disabled="!uploadFile" @click="doUploadFile">开始上传</tiny-button>
      </template>
    </tiny-dialog-box>

    <!-- 添加文本文档弹窗 -->
    <tiny-dialog-box v-model:visible="docDialogVisible" title="添加文本文档" width="500px">
      <tiny-form :model="docForm" label-width="90px">
        <tiny-form-item label="文档名称" required>
          <tiny-input v-model="docForm.name" placeholder="文档标题" />
        </tiny-form-item>
        <tiny-form-item label="文档类型">
          <tiny-select v-model="docForm.docType" style="width: 100%">
            <tiny-option value="text" label="纯文本" />
            <tiny-option value="markdown" label="Markdown" />
            <tiny-option value="qa" label="问答对" />
          </tiny-select>
        </tiny-form-item>
        <tiny-form-item label="文档内容" required>
          <tiny-input v-model="docForm.content" type="textarea" :rows="8" placeholder="粘贴文档内容..." />
        </tiny-form-item>
      </tiny-form>
      <template #footer>
        <tiny-button @click="docDialogVisible = false">取消</tiny-button>
        <tiny-button type="primary" :loading="saving" @click="saveDoc">保存</tiny-button>
      </template>
    </tiny-dialog-box>

    <!-- 文档内容查看/编辑弹窗 -->
    <tiny-dialog-box
      v-model:visible="contentDialogVisible"
      :title="contentDoc.fileType === 'TEXT' ? `编辑文档：${contentDoc.fileName || ''}` : `查看/编辑内容：${contentDoc.fileName || ''}`"
      width="760px"
      @open="loadDocContent"
    >
      <div v-if="contentLoading" style="text-align:center;padding:40px;color:#9ca3af">加载中...</div>
      <div v-else>
        <div style="margin-bottom:8px;font-size:12px;color:#6b7280">
          {{ contentDoc.fileType === 'TEXT' ? '直接修改文档内容，保存后将清除旧分块并重新触发向量化 + 图谱抽取 Pipeline。' : '可直接修改下方文本内容，保存后将清除旧分块并重新触发向量化 + 图谱抽取 Pipeline。' }}
        </div>
        <tiny-input
          v-model="contentEditText"
          type="textarea"
          :rows="20"
          placeholder="文档解析内容（可编辑）"
          style="font-family: monospace; font-size: 13px;"
        />
      </div>
      <template #footer>
        <tiny-button @click="contentDialogVisible = false">取消</tiny-button>
        <tiny-button type="primary" :loading="contentSaving" @click="saveDocContent">保存并重新处理</tiny-button>
      </template>
    </tiny-dialog-box>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, reactive, nextTick } from 'vue'
import {
  Button as TinyButton,
  DialogBox as TinyDialogBox,
  Form as TinyForm,
  FormItem as TinyFormItem,
  Input as TinyInput,
  Select as TinySelect,
  Option as TinyOption,
  Grid as TinyGrid,
  GridColumn as TinyGridColumn,
  Modal
} from '@opentiny/vue'
import { AiKnowledgeApi, AiModelApi } from '@/api/ai'
import { connectorApi } from '@/api/query'
import Breadcrumb from '@/components/breadcrumb/index.vue'

const loading = ref(false)
const saving = ref(false)
const searching = ref(false)
const searchDone = ref(false)
const kbList = ref<any[]>([])
const selectedKb = ref<any>(null)
const docList = ref<any[]>([])
const mainTab = ref<'docs' | 'graph' | 'search'>('docs')

// ==================== 模型列表 ====================
const embeddingModels = ref<any[]>([])
const rerankModels = ref<any[]>([])
const chatModels = ref<any[]>([])

// ==================== 连接器列表 ====================
const graphConnectors = ref<any[]>([])
const vectorConnectors = ref<any[]>([])

// ==================== 知识库 CRUD ====================
const kbDialogVisible = ref(false)
const kbForm = reactive<any>({
  id: null, name: '', description: '',
  embeddingModelId: '', rerankModelId: '', graphModelId: '',
  vectorConnectorId: '', graphConnectorId: '',
  chunkStrategy: 'FIXED', chunkSize: 500, chunkOverlap: 50,
  retrievalMode: 'GRAPH_HYBRID', confidenceThreshold: 0.5
})

const statusLabel = (s: string) => ({ DONE: '就绪', PENDING: '等待中', PARSING: '解析中', VECTORIZING: '向量化', GRAPH_BUILDING: '构建图谱', FAILED: '失败' }[s] ?? s ?? '未知')
const statusClass = (s: string) => ({ DONE: 'status-ok', PENDING: 'status-pending', PARSING: 'status-pending', VECTORIZING: 'status-pending', GRAPH_BUILDING: 'status-pending', FAILED: 'status-error' }[s] ?? '')

const loadKbList = async () => {
  loading.value = true
  try {
    const res: any = await AiKnowledgeApi.list()
    kbList.value = res.data || []
  } finally {
    loading.value = false
  }
}

const selectKb = async (kb: any) => {
  selectedKb.value = kb
  mainTab.value = 'docs'
  const res: any = await AiKnowledgeApi.listDocuments(kb.id)
  docList.value = res.data || []
}

const resetKbForm = () => {
  Object.assign(kbForm, {
    id: null, name: '', description: '',
    embeddingModelId: '', rerankModelId: '', graphModelId: '',
    vectorConnectorId: '', graphConnectorId: '',
    chunkStrategy: 'FIXED', chunkSize: 500, chunkOverlap: 50,
    retrievalMode: 'GRAPH_HYBRID', confidenceThreshold: 0.5
  })
}

const openKbDialog = (row?: any) => {
  resetKbForm()
  if (row) {
    Object.assign(kbForm, {
      id: row.id, name: row.name, description: row.description || '',
      embeddingModelId: row.embeddingModelId || '',
      rerankModelId: row.rerankModelId || '',
      graphModelId: row.graphModelId || '',
      vectorConnectorId: row.vectorConnectorId || '',
      graphConnectorId: row.graphConnectorId || '',
      chunkStrategy: row.chunkStrategy || 'FIXED',
      chunkSize: row.chunkSize || 500,
      chunkOverlap: row.chunkOverlap || 50,
      retrievalMode: row.retrievalMode || 'GRAPH_HYBRID',
      confidenceThreshold: row.confidenceThreshold || 0.5
    })
  }
  kbDialogVisible.value = true
}

const saveKb = async () => {
  if (!kbForm.name?.trim()) { Modal.message({ message: '名称不能为空', status: 'warning' }); return }
  saving.value = true
  try {
    await AiKnowledgeApi.save({
      id: kbForm.id, name: kbForm.name, description: kbForm.description,
      embeddingModelId: kbForm.embeddingModelId,
      rerankModelId: kbForm.rerankModelId || null,
      graphModelId: kbForm.graphModelId || null,
      vectorConnectorId: kbForm.vectorConnectorId || null,
      graphConnectorId: kbForm.graphConnectorId || null,
      confidenceThreshold: kbForm.confidenceThreshold || 0.5,
      chunkStrategy: kbForm.chunkStrategy,
      chunkSize: kbForm.chunkSize,
      chunkOverlap: kbForm.chunkOverlap,
      retrievalMode: kbForm.retrievalMode
    })
    Modal.message({ message: '保存成功', status: 'success' })
    kbDialogVisible.value = false
    await loadKbList()
  } catch { Modal.message({ message: '保存失败', status: 'error' }) } finally { saving.value = false }
}

const deleteKb = (row: any) => {
  Modal.confirm({ message: `确认删除知识库「${row.name}」？将同时删除其中所有文档！`, title: '删除确认' }).then(async (res: any) => {
    if (res === 'confirm') {
      try {
        await AiKnowledgeApi.delete(row.id)
        Modal.message({ message: '删除成功', status: 'success' })
        if (selectedKb.value?.id === row.id) { selectedKb.value = null; docList.value = [] }
        await loadKbList()
      } catch (e: any) { Modal.message({ message: e?.message || '删除失败', status: 'error' }) }
    }
  })
}

// ==================== 文件上传 ====================
const uploadDialogVisible = ref(false)
const uploadFile = ref<File | null>(null)
const uploading = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)
let statusTimer: ReturnType<typeof setInterval> | null = null

const openUploadDialog = () => { uploadFile.value = null; uploadDialogVisible.value = true }
const triggerFileInput = () => fileInputRef.value?.click()
const onFileChange = (e: Event) => { const input = e.target as HTMLInputElement; if (input.files?.[0]) uploadFile.value = input.files[0] }
const onDropFile = (e: DragEvent) => { const file = e.dataTransfer?.files?.[0]; if (file) uploadFile.value = file }

const doUploadFile = async () => {
  if (!uploadFile.value || !selectedKb.value) return
  uploading.value = true
  try {
    const res: any = await AiKnowledgeApi.uploadFile(selectedKb.value.id, uploadFile.value)
    const docId = res.data
    Modal.message({ message: '文件上传成功，正在后台处理...', status: 'success' })
    uploadDialogVisible.value = false
    await selectKb(selectedKb.value)
    startStatusPolling(docId)
  } catch (e: any) {
    Modal.message({ message: e?.message || '上传失败', status: 'error' })
  } finally { uploading.value = false }
}

const startStatusPolling = (docId: string) => {
  if (statusTimer) clearInterval(statusTimer)
  let pollCount = 0
  statusTimer = setInterval(async () => {
    pollCount++
    if (pollCount > 120) { clearInterval(statusTimer!); return }
    try {
      const res: any = await AiKnowledgeApi.getDocStatus(selectedKb.value.id, docId)
      const doc = res.data
      if (doc) {
        const idx = docList.value.findIndex((d: any) => d.id === docId)
        if (idx >= 0) docList.value[idx] = { ...docList.value[idx], ...doc }
        if (doc.status === 'DONE' || doc.status === 'FAILED') {
          clearInterval(statusTimer!)
          if (doc.status === 'DONE') Modal.message({ message: '文档处理完成！', status: 'success' })
          else Modal.message({ message: `文档处理失败: ${doc.errorMsg || ''}`, status: 'error' })
        }
      }
    } catch { clearInterval(statusTimer!) }
  }, 2000)
}

// ==================== 文本文档 ====================
const docDialogVisible = ref(false)
const docForm = reactive<any>({ name: '', docType: 'text', content: '' })

const openDocDialog = () => { Object.assign(docForm, { name: '', docType: 'text', content: '' }); docDialogVisible.value = true }

const saveDoc = async () => {
  if (!docForm.name?.trim()) { Modal.message({ message: '文档名称不能为空', status: 'warning' }); return }
  if (!docForm.content?.trim()) { Modal.message({ message: '文档内容不能为空', status: 'warning' }); return }
  saving.value = true
  try {
    await AiKnowledgeApi.uploadDocument(selectedKb.value.id, { name: docForm.name, docType: docForm.docType, content: docForm.content })
    Modal.message({ message: '添加成功', status: 'success' })
    docDialogVisible.value = false
    await selectKb(selectedKb.value)
  } catch { Modal.message({ message: '添加失败', status: 'error' }) } finally { saving.value = false }
}

const reVectorizeDoc = async (row: any) => {
  try {
    await AiKnowledgeApi.reVectorize(selectedKb.value.id, row.id)
    Modal.message({ message: '向量化任务已提交，正在后台处理...', status: 'success' })
    // 轮询状态，2秒后刷新一次文档列表
    setTimeout(() => selectKb(selectedKb.value), 2000)
  } catch (e: any) {
    Modal.message({ message: e?.message || '重新向量化失败', status: 'error' })
  }
}

const deleteDoc = (row: any) => {
  Modal.confirm({ message: `确认删除文档「${row.fileName || row.name}」？`, title: '删除确认' }).then(async (res: any) => {
    if (res === 'confirm') {
      try {
        await AiKnowledgeApi.deleteDocument(selectedKb.value.id, row.id)
        Modal.message({ message: '删除成功', status: 'success' })
        await selectKb(selectedKb.value)
      } catch (e: any) { Modal.message({ message: e?.message || '删除失败', status: 'error' }) }
    }
  })
}

// ==================== 知识图谱 ====================
const graphSchemas = ref<any[]>([])
const entities = ref<any[]>([])
const relations = ref<any[]>([])
const entityKeyword = ref('')
const entityTypeFilter = ref('')
const schemaDialogVisible = ref(false)
const schemaForm = reactive<any>({ id: '', entityType: '', description: '', attributesStr: '', relationsStr: '', extractPrompt: '' })

// ==================== 文档内容查看/编辑 ====================
const contentDialogVisible = ref(false)
const contentDoc = ref<any>({})
const contentEditText = ref('')
const contentLoading = ref(false)
const contentSaving = ref(false)

const openContentDialog = (row: any) => {
  contentDoc.value = row
  contentEditText.value = ''
  contentDialogVisible.value = true
}

const loadDocContent = async () => {
  if (!contentDoc.value?.id || !selectedKb.value?.id) return
  contentLoading.value = true
  try {
    const res: any = await AiKnowledgeApi.getDocumentContent(selectedKb.value.id, contentDoc.value.id)
    contentEditText.value = res.data ?? ''
  } catch (e: any) {
    Modal.message({ message: e?.message || '加载内容失败', status: 'error' })
  } finally {
    contentLoading.value = false
  }
}

const saveDocContent = async () => {
  if (!contentDoc.value?.id || !selectedKb.value?.id) return
  if (!contentEditText.value.trim()) {
    Modal.message({ message: '内容不能为空', status: 'warning' })
    return
  }
  contentSaving.value = true
  try {
    await AiKnowledgeApi.updateDocumentContent(selectedKb.value.id, contentDoc.value.id, contentEditText.value)
    Modal.message({ message: '内容已保存，后台重新处理中...', status: 'success' })
    contentDialogVisible.value = false
    // 刷新文档列表并启动状态轮询
    await selectKb(selectedKb.value)
    startStatusPolling(contentDoc.value.id)
  } catch (e: any) {
    Modal.message({ message: e?.message || '保存失败', status: 'error' })
  } finally {
    contentSaving.value = false
  }
}

const switchGraphTab = async () => {
  mainTab.value = 'graph'
  if (selectedKb.value && graphSchemas.value.length === 0) {
    await loadGraphSchemas()
    await loadEntities()
    await loadRelations()
  }
  await nextTick()
  await loadGraphData()
}

const loadGraphSchemas = async () => {
  try {
    const res: any = await AiKnowledgeApi.listGraphSchemas(selectedKb.value.id)
    graphSchemas.value = res.data || []
  } catch { graphSchemas.value = [] }
}

const loadEntities = async () => {
  try {
    const res: any = await AiKnowledgeApi.listGraphEntities(selectedKb.value.id, {
      type: entityTypeFilter.value || undefined,
      keyword: entityKeyword.value || undefined
    })
    entities.value = res.data || []
  } catch { entities.value = [] }
}

const loadRelations = async () => {
  try {
    const res: any = await AiKnowledgeApi.listGraphRelations(selectedKb.value.id)
    relations.value = res.data || []
  } catch { relations.value = [] }
}

const openSchemaDialog = (existing?: any) => {
  if (existing) {
    // 编辑模式：回填已有数据
    // attributes / relations 字段后端存的是 JSON 数组字符串，如 ["疾病名称","ICD编码"]
    // 也兼容 attributesJson / relationsJson（Excel导入时的字段名）
    const rawAttrs = existing.attributes ?? existing.attributesJson ?? ''
    const rawRels  = existing.relations  ?? existing.relationsJson  ?? ''
    const attrs = parseJsonArr(rawAttrs).join('\n')
    const rels  = parseJsonArr(rawRels).join('\n')
    Object.assign(schemaForm, {
      id: existing.id,
      entityType: existing.entityType || '',
      description: existing.description || '',
      attributesStr: attrs,
      relationsStr: rels,
      extractPrompt: existing.extractPrompt || ''
    })
  } else {
    // 新增模式：清空
    Object.assign(schemaForm, { id: '', entityType: '', description: '', attributesStr: '', relationsStr: '', extractPrompt: '' })
  }
  schemaDialogVisible.value = true
}

// ==================== Excel 批量导入实体模板 ====================
const importSchemaDialogVisible = ref(false)
const importSchemaFile = ref<File | null>(null)
const importPreviewRows = ref<any[]>([])
const importingSchema = ref(false)
const importDetectMode = ref('')
const schemaFileInputRef = ref<HTMLInputElement | null>(null)

const openImportSchemaDialog = () => {
  importSchemaFile.value = null
  importPreviewRows.value = []
  importDetectMode.value = ''
  importSchemaDialogVisible.value = true
}
const triggerSchemaFileInput = () => schemaFileInputRef.value?.click()
const onSchemaFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (input.files?.[0]) { importSchemaFile.value = input.files[0]; parseSchemaExcel(input.files[0]) }
}
const onDropSchemaExcel = (e: DragEvent) => {
  const file = e.dataTransfer?.files?.[0]
  if (file) { importSchemaFile.value = file; parseSchemaExcel(file) }
}

/** 将各种分隔符的字符串拆成数组，返回 JSON 字符串 */
const splitToJsonArr = (val: string): string => {
  if (!val?.trim()) return '[]'
  const items = val.split(/[,，;；|｜\n]/).map(s => s.trim()).filter(Boolean)
  return JSON.stringify(items)
}

/** 从 JSON 字符串解析为数组，用于预览展示；JSON 解析失败时按逗号/换行分割兜底 */
const parseJsonArr = (json: string): string[] => {
  if (!json) return []
  try {
    const parsed = JSON.parse(json)
    if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean)
  } catch { /* 忽略，继续兜底 */ }
  // 兜底：按逗号、换行、分号拆分
  return json.split(/[,，\n;；]/).map((s: string) => s.trim()).filter(Boolean)
}

/** 表头关键词映射，支持公开数据集常见列名 */
const HEADER_MAP: Record<string, string> = {
  // 实体类型
  '实体类型': 'entityType', '实体': 'entityType', '类型': 'entityType',
  'entity': 'entityType', 'entity_type': 'entityType', 'entitytype': 'entityType',
  'label': 'entityType', 'name': 'entityType', 'node_type': 'entityType', 'nodetype': 'entityType',
  // 说明
  '说明': 'description', '描述': 'description', '备注': 'description',
  'description': 'description', 'desc': 'description', 'comment': 'description', 'remark': 'description',
  // 属性
  '属性': 'attributesJson', '属性列表': 'attributesJson', '字段': 'attributesJson', '属性名': 'attributesJson',
  'attributes': 'attributesJson', 'props': 'attributesJson', 'properties': 'attributesJson',
  'fields': 'attributesJson', 'columns': 'attributesJson',
  // 关系
  '关系': 'relationsJson', '关系类型': 'relationsJson', '关联': 'relationsJson', '关联关系': 'relationsJson',
  'relations': 'relationsJson', 'relation_types': 'relationsJson', 'edges': 'relationsJson',
  'relationships': 'relationsJson', 'links': 'relationsJson',
  // 提示词
  '提示词': 'extractPrompt', '抽取提示词': 'extractPrompt', '抽取指令': 'extractPrompt',
  'prompt': 'extractPrompt', 'extract_prompt': 'extractPrompt', 'extractprompt': 'extractPrompt',
}

const parseSchemaExcel = async (file: File) => {
  try {
    const XLSX = await import('xlsx')
    const buffer = await file.arrayBuffer()
    const wb = XLSX.read(buffer, { type: 'array' })
    const ws = wb.Sheets[wb.SheetNames[0]]
    const allRows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
    if (!allRows.length) { importPreviewRows.value = []; return }

    // 判断第一行是否为表头（有任意单元格匹配已知关键词）
    const firstRow = allRows[0].map((c: any) => String(c || '').trim().toLowerCase())
    const hasHeader = firstRow.some((cell: string) => HEADER_MAP[cell] !== undefined)

    let rows: any[]
    let colMap: (row: any[]) => any

    if (hasHeader) {
      importDetectMode.value = '带表头模式（智能列映射）'
      // 建立列索引映射
      const colIndex: Record<string, number> = {}
      firstRow.forEach((cell: string, idx: number) => {
        const field = HEADER_MAP[cell]
        if (field && colIndex[field] === undefined) colIndex[field] = idx
      })
      rows = allRows.slice(1)
      colMap = (row: any[]) => ({
        entityType: String(row[colIndex['entityType'] ?? -1] || '').trim(),
        description: String(row[colIndex['description'] ?? -1] || '').trim(),
        attributesJson: splitToJsonArr(String(row[colIndex['attributesJson'] ?? -1] || '')),
        relationsJson: splitToJsonArr(String(row[colIndex['relationsJson'] ?? -1] || '')),
        extractPrompt: String(row[colIndex['extractPrompt'] ?? -1] || '').trim(),
      })
    } else {
      importDetectMode.value = '无表头模式（按列顺序 A/B/C/D/E）'
      rows = allRows
      colMap = (row: any[]) => ({
        entityType: String(row[0] || '').trim(),
        description: String(row[1] || '').trim(),
        attributesJson: splitToJsonArr(String(row[2] || '')),
        relationsJson: splitToJsonArr(String(row[3] || '')),
        extractPrompt: String(row[4] || '').trim(),
      })
    }

    importPreviewRows.value = rows
      .map(colMap)
      .filter((r: any) => r.entityType)
  } catch {
    Modal.message({ message: '解析 Excel 失败，请确认文件格式正确', status: 'error' })
    importPreviewRows.value = []
  }
}

const doImportSchemas = async () => {
  if (!importPreviewRows.value.length || !selectedKb.value) return
  importingSchema.value = true
  let successCount = 0, failCount = 0
  try {
    for (const row of importPreviewRows.value) {
      try {
        await AiKnowledgeApi.saveGraphSchema(selectedKb.value.id, row)
        successCount++
      } catch { failCount++ }
    }
    Modal.message({
      message: `导入完成：成功 ${successCount} 条${failCount ? `，失败 ${failCount} 条` : ''}`,
      status: successCount > 0 ? 'success' : 'error'
    })
    importSchemaDialogVisible.value = false
    await loadGraphSchemas()
  } finally { importingSchema.value = false }
}

/** 下载标准模板 */
const downloadSchemaTemplate = async () => {
  const XLSX = await import('xlsx')
  const wb = XLSX.utils.book_new()

  // ── Sheet1: 使用说明 ──
  const helpData = [
    ['📋 实体类型模板使用说明', '', '', '', ''],
    ['', '', '', '', ''],
    ['列名', '是否必填', '说明', '支持的等效列名', '示例值'],
    ['实体类型', '✅ 必填', '实体的分类名称，LLM 将按此类型抽取', 'entity / label / name / node_type / 类型', '人物'],
    ['说明', '可选', '描述该实体类型的识别规则或用途', 'description / desc / 备注 / comment', '代表自然人，包括工程师、管理人员等'],
    ['属性', '可选', '该实体拥有的属性，多个属性用英文逗号分隔', 'attributes / props / properties / 字段', '姓名,职位,年龄,所属公司'],
    ['关系', '可选', '该实体可参与的关系类型，逗号分隔', 'relations / edges / relationships / 关联', '属于,管理,认识,投资'],
    ['提示词', '可选', '给 LLM 的专项抽取指令，留空使用默认', 'prompt / extract_prompt / 抽取指令', '重点识别人名和职务信息'],
    ['', '', '', '', ''],
    ['⚠️ 注意事项', '', '', '', ''],
    ['1. 属性/关系列支持多种分隔符：英文逗号、中文逗号、分号、| 竖线、换行', '', '', '', ''],
    ['2. 有无表头均可：系统自动识别第一行是否为列名', '', '', '', ''],
    ['3. 列顺序可以任意调整（带表头时）', '', '', '', ''],
    ['4. 空行自动跳过', '', '', '', ''],
  ]
  const wsHelp = XLSX.utils.aoa_to_sheet(helpData)
  wsHelp['!cols'] = [{ wch: 14 }, { wch: 10 }, { wch: 36 }, { wch: 40 }, { wch: 30 }]
  XLSX.utils.book_append_sheet(wb, wsHelp, '📖使用说明')

  // ── Sheet2: 医疗实体类型模板（用于导入知识库"实体类型模板"） ──
  const schemaData = [
    ['实体类型', '说明', '属性', '关系', '提示词'],
    ['疾病', '疾病或综合征实体', '疾病名称,ICD编码,别称,发病部位,遗传性,发病率', '并发,导致,鉴别诊断,治疗,预防', '重点识别中英文疾病名称及常见别称，如"高血压"也叫"原发性高血压"'],
    ['药物', '药品或化合物实体', '药品名称,通用名,剂型,规格,适应症,用法用量,禁忌,不良反应', '治疗,禁忌,相互作用,替代,属于', '同时识别商品名和通用名，如"阿司匹林"和"乙酰水杨酸"'],
    ['症状', '临床症状或体征', '症状名称,严重程度,持续时间,发生部位', '属于,提示,伴随,区分', '识别主诉和现病史中描述的症状'],
    ['检查', '检查或化验项目', '检查名称,正常参考值,检查类型,所需标本', '用于诊断,排除,监测,属于', ''],
    ['手术', '外科手术或治疗操作', '手术名称,手术部位,麻醉方式,适应症,禁忌症', '治疗,预防,并发,替代', ''],
    ['医院', '医疗机构', '医院名称,等级,地址,擅长科室,联系方式', '位于,提供,合作,隶属', ''],
    ['医生', '临床医生或专家', '姓名,职称,科室,擅长领域,所在医院', '就职于,擅长,出诊', ''],
    ['基因', '基因或蛋白质', '基因名称,基因ID,染色体位置,功能描述', '突变导致,表达于,调控,关联', ''],
  ]
  const wsSchema = XLSX.utils.aoa_to_sheet(schemaData)
  wsSchema['!cols'] = [{ wch: 10 }, { wch: 18 }, { wch: 42 }, { wch: 28 }, { wch: 30 }]
  XLSX.utils.book_append_sheet(wb, wsSchema, '①实体类型模板（导入用）')

  // ── Sheet3: 示例文档内容（将此内容粘贴到知识库"添加文本文档"，用于测试抽取） ──
  const docData = [
    ['📄 示例文档内容说明', ''],
    ['', ''],
    ['用途', '将下面"文档内容"列的文本，粘贴到知识库 → 文档 → 添加文本文档，触发 LLM 图谱抽取后，即可测试检索效果'],
    ['', ''],
    ['文档名称', '文档内容'],
    [
      '2型糖尿病诊疗指南摘要',
      `2型糖尿病（T2DM）是一种以胰岛素抵抗为主、伴有相对胰岛素分泌不足的慢性代谢性疾病。

【诊断标准】
典型症状（多饮、多尿、多食、体重下降）加上随机血糖≥11.1mmol/L，或空腹血糖≥7.0mmol/L，或葡萄糖耐量试验2小时血糖≥11.1mmol/L。

【常见并发症】
2型糖尿病可并发糖尿病肾病、糖尿病视网膜病变、糖尿病周围神经病变、心血管疾病等。其中心血管疾病是2型糖尿病患者死亡的主要原因。

【治疗方案】
一线治疗药物为二甲双胍（Metformin），通用名盐酸二甲双胍，适应症为2型糖尿病，用法为餐后口服0.5g，每日2-3次，禁忌症包括严重肾功能不全（eGFR<30）和造影剂使用前后。

当二甲双胍控制不达标时，可联合使用：
- 格列美脲（磺脲类）：促进胰岛素分泌，主要副作用为低血糖
- 西格列汀（DPP-4抑制剂）：商品名捷诺维，通过抑制DPP-4酶增加GLP-1活性
- 达格列净（SGLT-2抑制剂）：商品名安达唐，通过抑制肾小管葡萄糖重吸收降低血糖，同时有减重和心肾保护作用
- 司美格鲁肽（GLP-1受体激动剂）：每周皮下注射一次，同时可降低体重和心血管风险

【检查项目】
诊断和监测2型糖尿病需要的检查包括：空腹血糖（FPG）、餐后2小时血糖（2hPG）、糖化血红蛋白（HbA1c，正常值<6.5%）、尿微量白蛋白/肌酐比值（用于监测糖尿病肾病）、眼底检查（用于筛查糖尿病视网膜病变）。

【主要专家】
北京协和医院内分泌科主任医师李明教授，擅长2型糖尿病及其并发症诊治，出诊时间为每周三上午。
上海瑞金医院内分泌代谢科宁光院士，长期从事糖尿病发病机制研究。`
    ],
    ['', ''],
    [
      '高血压临床路径',
      `原发性高血压（Essential Hypertension），又称高血压病，是最常见的心血管疾病，以体循环动脉血压持续升高为主要特征（收缩压≥140mmHg 和/或 舒张压≥90mmHg）。

【危险因素】
年龄、遗传因素、高盐饮食、肥胖、吸烟、过量饮酒、精神压力。

【靶器官损害】
高血压可损害心脏（左心室肥厚、心力衰竭）、脑（脑卒中、腔隙性脑梗死）、肾脏（高血压肾病）、眼底（高血压视网膜病变）。

【一线降压药物】
1. 氨氯地平（钙通道阻滞剂，CCB）：商品名络活喜，5mg每日一次，常见不良反应为踝部水肿和面部潮红。
2. 缬沙坦（血管紧张素受体阻滞剂，ARB）：商品名代文，80mg每日一次，禁忌症为妊娠和双侧肾动脉狭窄。
3. 氢氯噻嗪（利尿剂）：25mg每日一次，注意监测血钾和尿酸。
4. 美托洛尔（β受体阻滞剂）：商品名倍他乐克，适合合并心动过速的患者，禁忌症为支气管哮喘。
5. 培哚普利（ACEI）：抑制ACE酶，不良反应为干咳。

【监测指标】
诊室血压、动态血压监测（ABPM）、家庭自测血压、血生化（血钾、肌酐）、尿常规。

【主要诊疗机构】
北京安贞医院高血压科，是国内最著名的高血压专科之一，马长生主任长期从事高血压和心房颤动的介入治疗。`
    ],
  ]
  const wsDoc = XLSX.utils.aoa_to_sheet(docData)
  wsDoc['!cols'] = [{ wch: 22 }, { wch: 90 }]
  XLSX.utils.book_append_sheet(wb, wsDoc, '②示例文档（粘贴到知识库）')

  // ── Sheet4: 预期抽取结果（用于验证抽取效果） ──
  const expectData = [
    ['预期抽取实体（验证抽取效果）', '', '', ''],
    ['实体名称', '实体类型', '关键属性', '预期关系'],
    ['2型糖尿病', '疾病', 'ICD编码:E11, 别称:T2DM', '并发→糖尿病肾病; 治疗→二甲双胍'],
    ['糖尿病肾病', '疾病', '发病部位:肾脏', '并发于→2型糖尿病'],
    ['二甲双胍', '药物', '通用名:盐酸二甲双胍, 剂型:口服片, 用法:餐后0.5g日2-3次', '治疗→2型糖尿病'],
    ['西格列汀', '药物', '商品名:捷诺维, 类型:DPP-4抑制剂', '治疗→2型糖尿病; 相互作用→二甲双胍'],
    ['达格列净', '药物', '商品名:安达唐, 类型:SGLT-2抑制剂', '治疗→2型糖尿病'],
    ['司美格鲁肽', '药物', '类型:GLP-1受体激动剂, 用法:每周皮下注射', '治疗→2型糖尿病'],
    ['糖化血红蛋白', '检查', '别称:HbA1c, 正常值:<6.5%', '监测→2型糖尿病'],
    ['空腹血糖', '检查', '诊断标准:≥7.0mmol/L', '用于诊断→2型糖尿病'],
    ['李明', '医生', '职称:主任医师, 科室:内分泌科, 医院:北京协和医院', '就职于→北京协和医院; 擅长→2型糖尿病'],
    ['北京协和医院', '医院', '等级:三甲, 地址:北京', '提供→内分泌科'],
    ['原发性高血压', '疾病', '别称:高血压病, 诊断标准:收缩压≥140或舒张压≥90', '导致→心力衰竭; 导致→脑卒中'],
    ['氨氯地平', '药物', '商品名:络活喜, 类型:CCB, 用法:5mg日一次', '治疗→高血压'],
    ['缬沙坦', '药物', '商品名:代文, 类型:ARB, 用法:80mg日一次', '治疗→高血压'],
    ['', '', '', ''],
    ['💡 验证方法', '', '', ''],
    ['1. 将②Sheet中的文档内容粘贴到知识库添加文本文档', '', '', ''],
    ['2. 等待状态变为"就绪"后，点击"抽取图谱"', '', '', ''],
    ['3. 切换到"图谱"Tab，查看已抽取实体和关系', '', '', ''],
    ['4. 切换到"检索"Tab，输入"2型糖尿病治疗药物"测试检索', '', '', ''],
  ]
  const wsExpect = XLSX.utils.aoa_to_sheet(expectData)
  wsExpect['!cols'] = [{ wch: 18 }, { wch: 12 }, { wch: 40 }, { wch: 36 }]
  XLSX.utils.book_append_sheet(wb, wsExpect, '③预期抽取结果（验证用）')

  XLSX.writeFile(wb, '医疗知识库示例数据集.xlsx')
}

const saveSchema = async () => {
  if (!schemaForm.entityType?.trim()) { Modal.message({ message: '实体类型不能为空', status: 'warning' }); return }
  saving.value = true
  try {
    const attributes = schemaForm.attributesStr.split('\n').map((s: string) => s.trim()).filter(Boolean)
    const relations = schemaForm.relationsStr.split('\n').map((s: string) => s.trim()).filter(Boolean)
    const payload = {
      entityType: schemaForm.entityType,
      description: schemaForm.description,
      attributesJson: JSON.stringify(attributes),
      relationsJson: JSON.stringify(relations),
      extractPrompt: schemaForm.extractPrompt
    }
    if (schemaForm.id) {
      await AiKnowledgeApi.updateGraphSchema(selectedKb.value.id, schemaForm.id, payload)
    } else {
      await AiKnowledgeApi.saveGraphSchema(selectedKb.value.id, payload)
    }
    Modal.message({ message: '保存成功', status: 'success' })
    schemaDialogVisible.value = false
    await loadGraphSchemas()
  } catch { Modal.message({ message: '保存失败', status: 'error' }) } finally { saving.value = false }
}

const deleteSchema = async (s: any) => {
  try {
    await AiKnowledgeApi.deleteGraphSchema(selectedKb.value.id, s.id)
    Modal.message({ message: '删除成功', status: 'success' })
    await loadGraphSchemas()
  } catch (e: any) { Modal.message({ message: e?.message || '删除失败', status: 'error' }) }
}

const deleteEntity = async (e: any) => {
  try {
    await AiKnowledgeApi.deleteGraphEntity(selectedKb.value.id, e.id)
    Modal.message({ message: '删除成功', status: 'success' })
    await loadEntities()
  } catch (err: any) { Modal.message({ message: err?.message || '删除失败', status: 'error' }) }
}

const triggerExtract = async (doc: any) => {
  try {
    await AiKnowledgeApi.extractGraph(selectedKb.value.id, doc.id)
    Modal.message({ message: '图谱抽取任务已提交，正在后台处理...', status: 'success' })
    startStatusPolling(doc.id)
  } catch (e: any) { Modal.message({ message: e?.message || '提交失败', status: 'error' }) }
}

const formatProps = (props: any) => {
  if (!props) return ''
  if (typeof props === 'string') return props
  return Object.entries(props).map(([k, v]) => `${k}: ${v}`).join('  |  ')
}

const searchQuery = ref('')
const searchResult = ref<any>(null)

const doSearch = async () => {
  if (!searchQuery.value.trim() || !selectedKb.value) return
  searching.value = true
  searchDone.value = false
  searchResult.value = null
  try {
    const res: any = await AiKnowledgeApi.search(selectedKb.value.id, searchQuery.value)
    searchResult.value = res.data
    searchDone.value = true
  } finally { searching.value = false }
}

// ==================== 图谱可视化 ====================
const graphCanvasRef = ref<HTMLCanvasElement | null>(null)
const graphWrapRef = ref<HTMLDivElement | null>(null)
const graphViewType = ref('')
const graphData = reactive<{ nodes: any[]; edges: any[] }>({ nodes: [], edges: [] })
const graphTooltip = reactive({ visible: false, x: 0, y: 0, name: '', type: '', props: '' })
const graphFullscreen = ref(false)

const TYPE_COLORS: Record<string, string> = {
  PERSON:  '#3b82f6',  // 蓝
  ORG:     '#f97316',  // 橙
  CONCEPT: '#8b5cf6',  // 紫
  PLACE:   '#10b981',  // 绿
  EVENT:   '#ef4444',  // 红
  PRODUCT: '#06b6d4',  // 青
  OTHER:   '#94a3b8'   // 灰
}
const getNodeColor = (type: string) => TYPE_COLORS[type?.toUpperCase()] || '#6366f1'

const loadGraphData = async () => {
  if (!selectedKb.value) return
  try {
    const res: any = await AiKnowledgeApi.getGraphData(selectedKb.value.id, {
      type: graphViewType.value || undefined, limit: 120
    })
    const data = res.data || { nodes: [], edges: [] }
    graphData.nodes = data.nodes || []
    graphData.edges = data.edges || []
    await nextTick()
    renderGraph()
  } catch { /* ignore */ }
}

interface GNode { id: string; name: string; type: string; properties: string; x: number; y: number; vx: number; vy: number }

let _nodes: GNode[] = []
let _edges: any[] = []
let _animFrame = 0
let _hoveredNode: GNode | null = null
let _degreeMap: Record<string, number> = {}
// 度数 → 节点半径（最小16，最大30）
const getNodeRadius = (degree: number) => Math.min(30, 16 + degree * 1.5)

// 视窗变换：平移 + 缩放
let _panX = 0, _panY = 0, _scale = 1

// 拖拽状态
let _dragNode: GNode | null = null
let _dragging = false   // 拖拽节点
let _panning = false    // 平移视窗
let _panStartX = 0, _panStartY = 0, _panOriginX = 0, _panOriginY = 0

// 屏幕坐标 → 画布逻辑坐标
const toLogical = (canvas: HTMLCanvasElement, cx: number, cy: number) => {
  const rect = canvas.getBoundingClientRect()
  const sx = (cx - rect.left) * (canvas.width / rect.width)
  const sy = (cy - rect.top) * (canvas.height / rect.height)
  return { x: (sx - _panX) / _scale, y: (sy - _panY) / _scale }
}

const renderGraph = () => {
  const canvas = graphCanvasRef.value
  if (!canvas) return
  cancelAnimationFrame(_animFrame)
  _panX = 0; _panY = 0; _scale = 1
  const W = canvas.parentElement?.clientWidth || 800
  const H = graphFullscreen.value ? (window.innerHeight - 60) : 560
  canvas.width = W
  canvas.height = H

  // ── 前端去重：相同 id 的节点只保留一个 ──
  const seenIds = new Set<string>()
  const uniqueNodes = graphData.nodes.filter((n: any) => {
    if (seenIds.has(n.id)) return false
    seenIds.add(n.id)
    return true
  })
  const N = uniqueNodes.length

  // ── 逻辑画布大小：节点越多越大，确保有足够的铺展空间 ──
  // 用户可以通过平移/缩放探索整个画布，不需要全部可见
  const LW = Math.max(W * 2, Math.sqrt(N) * 320)
  const LH = Math.max(H * 2, Math.sqrt(N) * 260)

  // 初始位置：在逻辑画布上大范围随机分布（比圆形螺旋更分散）
  _nodes = uniqueNodes.map((n: any) => {
    const margin = 80
    return {
      ...n,
      x: margin + Math.random() * (LW - margin * 2),
      y: margin + Math.random() * (LH - margin * 2),
      vx: 0, vy: 0
    }
  })
  _edges = graphData.edges.filter((e: any) => seenIds.has(e.source) && seenIds.has(e.target))

  // 预计算每个节点的度（连边数），提升为模块级变量
  _degreeMap = {}
  _edges.forEach((e: any) => {
    _degreeMap[e.source] = (_degreeMap[e.source] || 0) + 1
    _degreeMap[e.target] = (_degreeMap[e.target] || 0) + 1
  })

  // 弹簧理想长度：节点越多间距越大
  const idealLen = Math.max(120, Math.min(280, 3000 / Math.max(N, 1)))

  // 初始布局完成后，自动平移到内容中心
  const centerOnContent = () => {
    if (_nodes.length === 0) return
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
    _nodes.forEach(n => {
      minX = Math.min(minX, n.x); maxX = Math.max(maxX, n.x)
      minY = Math.min(minY, n.y); maxY = Math.max(maxY, n.y)
    })
    const contentW = maxX - minX, contentH = maxY - minY
    const scaleX = W / (contentW + 120), scaleY = H / (contentH + 120)
    const fitScale = Math.min(scaleX, scaleY, 1.5)  // 不超过1.5倍，保持可读性
    _scale = Math.max(0.15, fitScale)
    _panX = W / 2 - ((minX + maxX) / 2) * _scale
    _panY = H / 2 - ((minY + maxY) / 2) * _scale
  }

  let tick = 0
  const SKIP_RENDER_TICKS = 120
  const MAX_TICKS = Math.min(1200, 300 + N * 8)

  const simulate = () => {
    const nodeMap: Record<string, GNode> = {}
    _nodes.forEach(n => nodeMap[n.id] = n)

    // 1. 排斥力（Coulomb）：度越高排斥越强，不受画布边界限制
    for (let i = 0; i < _nodes.length; i++) {
      for (let j = i + 1; j < _nodes.length; j++) {
        const a = _nodes[i], b = _nodes[j]
        let dx = b.x - a.x, dy = b.y - a.y
        const dist2 = dx * dx + dy * dy || 0.01
        const dist  = Math.sqrt(dist2)
        const ka = 1 + (_degreeMap[a.id] || 0) * 0.3
        const kb = 1 + (_degreeMap[b.id] || 0) * 0.3
        const repulse = 12000 * Math.max(ka, kb) / dist2
        const fx = dx / dist * repulse, fy = dy / dist * repulse
        a.vx -= fx; a.vy -= fy
        b.vx += fx; b.vy += fy
      }
    }

    // 2. 弹簧引力（Hooke）
    _edges.forEach((e: any) => {
      const a = nodeMap[e.source], b = nodeMap[e.target]
      if (!a || !b) return
      const dx = b.x - a.x, dy = b.y - a.y
      const dist = Math.sqrt(dx * dx + dy * dy) || 1
      const stretch = (dist - idealLen) * 0.04
      const fx = dx / dist * stretch, fy = dy / dist * stretch
      a.vx += fx; a.vy += fy
      b.vx -= fx; b.vy -= fy
    })

    // 3. 极弱向心力（仅防止图谱整体漂移到无穷远）
    const cx = LW / 2, cy = LH / 2
    _nodes.forEach(n => {
      n.vx += (cx - n.x) * 0.0003
      n.vy += (cy - n.y) * 0.0003
    })

    // 4. 速度衰减 + 位置更新（无画布边界限制！）
    _nodes.forEach(n => {
      n.vx *= 0.82; n.vy *= 0.82
      n.x += n.vx
      n.y += n.vy
    })

    // 5. 同位置强制分离（最小间距按节点半径动态计算）
    for (let i = 0; i < _nodes.length; i++) {
      for (let j = i + 1; j < _nodes.length; j++) {
        const a = _nodes[i], b = _nodes[j]
        const dx = b.x - a.x || 0.01, dy = b.y - a.y || 0.01
        const dist = Math.sqrt(dx * dx + dy * dy)
        const minDist = getNodeRadius(_degreeMap[a.id] || 0) + getNodeRadius(_degreeMap[b.id] || 0) + 10
        if (dist < minDist) {
          const push = (minDist - dist) / 2
          const nx = dx / dist, ny = dy / dist
          a.x -= nx * push; a.y -= ny * push
          b.x += nx * push; b.y += ny * push
        }
      }
    }

    tick++
    if (tick > SKIP_RENDER_TICKS) drawGraph(canvas, _degreeMap)
    if (tick < MAX_TICKS) {
      _animFrame = requestAnimationFrame(simulate)
    } else {
      centerOnContent()
      drawGraph(canvas, _degreeMap)
    }
  }
  for (let i = 0; i < SKIP_RENDER_TICKS; i++) simulate()
  simulate()
}

const drawGraph = (canvas: HTMLCanvasElement, degreeMap?: Record<string, number>) => {
  const W = canvas.width, H = canvas.height
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, W, H)

  // 浅色背景网格（可选，增加层次感）
  ctx.save()
  ctx.strokeStyle = '#e2e8f0'
  ctx.lineWidth = 0.5
  for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }
  for (let y = 0; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }
  ctx.restore()

  ctx.save()
  ctx.translate(_panX, _panY)
  ctx.scale(_scale, _scale)

  const nodeMap: Record<string, GNode> = {}
  _nodes.forEach(n => nodeMap[n.id] = n)
  const dm = degreeMap || {}

  // ── 边：实线，hover 时高亮，关系标签只在节点悬浮时附近显示 ──
  _edges.forEach((e: any) => {
    const a = nodeMap[e.source], b = nodeMap[e.target]
    if (!a || !b) return

    const isHoveredEdge = _hoveredNode && (e.source === _hoveredNode.id || e.target === _hoveredNode.id)
    const dx = b.x - a.x, dy = b.y - a.y
    const len = Math.sqrt(dx * dx + dy * dy) || 1
    const rA = getNodeRadius(dm[a.id] || 0)
    const rB = getNodeRadius(dm[b.id] || 0)
    // 边起终点缩回节点边缘
    const sx = a.x + dx / len * rA, sy = a.y + dy / len * rA
    const ex = b.x - dx / len * rB, ey = b.y - dy / len * rB

    ctx.save()
    if (isHoveredEdge) {
      ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 2
    } else {
      ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 1
    }
    ctx.setLineDash([])
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke()

    // 箭头
    const ang = Math.atan2(dy, dx)
    ctx.fillStyle = isHoveredEdge ? '#3b82f6' : '#94a3b8'
    ctx.beginPath()
    ctx.moveTo(ex, ey)
    ctx.lineTo(ex - 9 * Math.cos(ang - 0.4), ey - 9 * Math.sin(ang - 0.4))
    ctx.lineTo(ex - 9 * Math.cos(ang + 0.4), ey - 9 * Math.sin(ang + 0.4))
    ctx.closePath(); ctx.fill()

    // 关系标签：只在 hover 相关边时显示
    if (isHoveredEdge && e.relation) {
      const mx = (sx + ex) / 2, my = (sy + ey) / 2
      ctx.font = '11px sans-serif'
      const tw = ctx.measureText(e.relation).width + 8
      ctx.fillStyle = 'rgba(255,255,255,0.9)'
      ctx.beginPath(); ctx.roundRect(mx - tw / 2, my - 9, tw, 16, 3); ctx.fill()
      ctx.fillStyle = '#1e293b'
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.fillText(e.relation, mx, my)
    }
    ctx.restore()
  })

  // ── 节点 ──
  _nodes.forEach((n: GNode) => {
    const color = getNodeColor(n.type)
    const deg = dm[n.id] || 0
    const r = getNodeRadius(deg)
    const isHovered = _hoveredNode?.id === n.id

    ctx.save()
    // 外发光（hover 时增强）
    ctx.shadowColor = color
    ctx.shadowBlur = isHovered ? 20 : 8
    ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI * 2)
    // 填充：浅色填充 + 深色描边，对标 Neo4j
    ctx.fillStyle = color + (isHovered ? 'ff' : 'cc')
    ctx.fill()
    ctx.shadowBlur = 0
    ctx.strokeStyle = isHovered ? '#fff' : color + 'aa'
    ctx.lineWidth = isHovered ? 2.5 : 1.5
    ctx.stroke()

    // 节点内部：白色文字（最多5字）
    ctx.fillStyle = '#fff'
    ctx.font = `bold ${r > 20 ? 12 : 10}px sans-serif`
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    const innerLabel = n.name.length > 5 ? n.name.slice(0, 5) + '…' : n.name
    ctx.fillText(innerLabel, n.x, n.y)

    // 节点外下方：完整名称（灰色，不超过8字）
    const outerLabel = n.name.length > 8 ? n.name.slice(0, 8) + '…' : n.name
    ctx.font = '10px sans-serif'
    ctx.fillStyle = '#475569'
    ctx.textAlign = 'center'; ctx.textBaseline = 'top'
    ctx.fillText(outerLabel, n.x, n.y + r + 4)

    ctx.restore()
  })

  ctx.restore()
}

// ---------- 鼠标事件 ----------
const onGraphMousedown = (e: MouseEvent) => {
  const canvas = graphCanvasRef.value
  if (!canvas) return
  const { x, y } = toLogical(canvas, e.clientX, e.clientY)
  const hit = _nodes.find(n => {
    const r = getNodeRadius(_degreeMap[n.id] || 0)
    return Math.sqrt((n.x - x) ** 2 + (n.y - y) ** 2) < r + 4
  })
  if (hit) {
    _dragNode = hit
    _dragging = true
  } else {
    _panning = true
    const rect = canvas.getBoundingClientRect()
    _panStartX = e.clientX - rect.left
    _panStartY = e.clientY - rect.top
    _panOriginX = _panX
    _panOriginY = _panY
    canvas.style.cursor = 'grabbing'
  }
}

const onGraphMouseup = () => {
  _dragging = false
  _dragNode = null
  _panning = false
  const canvas = graphCanvasRef.value
  if (canvas) canvas.style.cursor = 'default'
}

const onGraphCanvasMousemove = (e: MouseEvent) => {
  const canvas = graphCanvasRef.value
  if (!canvas) return
  if (_dragging && _dragNode) {
    const { x, y } = toLogical(canvas, e.clientX, e.clientY)
    _dragNode.x = x; _dragNode.y = y
    _dragNode.vx = 0; _dragNode.vy = 0
    drawGraph(canvas, _degreeMap)
    return
  }
  if (_panning) {
    const rect = canvas.getBoundingClientRect()
    const dx = e.clientX - rect.left - _panStartX
    const dy = e.clientY - rect.top - _panStartY
    _panX = _panOriginX + dx
    _panY = _panOriginY + dy
    drawGraph(canvas, _degreeMap)
    return
  }
  const { x, y } = toLogical(canvas, e.clientX, e.clientY)
  const hit = _nodes.find(n => {
    const r = getNodeRadius(_degreeMap[n.id] || 0)
    return Math.sqrt((n.x - x) ** 2 + (n.y - y) ** 2) < r + 4
  }) || null
  canvas.style.cursor = hit ? 'pointer' : 'default'
  // hover 节点变化时重绘（激活边高亮 + 关系标签）
  if (hit?.id !== _hoveredNode?.id) {
    _hoveredNode = hit
    drawGraph(canvas, _degreeMap)
  }
}

const onGraphCanvasClick = (e: MouseEvent) => {
  if (_panning) return  // 平移后不触发 click
  const canvas = graphCanvasRef.value
  if (!canvas) return
  const { x, y } = toLogical(canvas, e.clientX, e.clientY)
  const hit = _nodes.find(n => {
    const r = getNodeRadius(_degreeMap[n.id] || 0)
    return Math.sqrt((n.x - x) ** 2 + (n.y - y) ** 2) < r + 4
  })
  if (hit) {
    const rect = canvas.getBoundingClientRect()
    const sx = e.clientX - rect.left, sy = e.clientY - rect.top
    let props = ''
    try { const p = JSON.parse(hit.properties || '{}'); props = Object.entries(p).map(([k, v]) => `${k}: ${v}`).join('\n') } catch {}
    Object.assign(graphTooltip, { visible: true, x: sx + 12, y: sy - 10, name: hit.name, type: hit.type, props })
  } else { graphTooltip.visible = false }
}

const onGraphWheel = (e: WheelEvent) => {
  const canvas = graphCanvasRef.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  const mx = (e.clientX - rect.left) * (canvas.width / rect.width)
  const my = (e.clientY - rect.top) * (canvas.height / rect.height)
  const factor = e.deltaY < 0 ? 1.12 : 0.88
  const newScale = Math.max(0.2, Math.min(5, _scale * factor))
  _panX = mx - (mx - _panX) * (newScale / _scale)
  _panY = my - (my - _panY) * (newScale / _scale)
  _scale = newScale
  drawGraph(canvas, _degreeMap)
}

const graphZoom = (factor: number) => {
  const canvas = graphCanvasRef.value
  if (!canvas) return
  const cx = canvas.width / 2, cy = canvas.height / 2
  const newScale = Math.max(0.2, Math.min(5, _scale * factor))
  _panX = cx - (cx - _panX) * (newScale / _scale)
  _panY = cy - (cy - _panY) * (newScale / _scale)
  _scale = newScale
  drawGraph(canvas, _degreeMap)
}

const graphReset = () => {
  // 重新 fit 到全部节点可见
  const canvas = graphCanvasRef.value
  if (!canvas || _nodes.length === 0) return
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
  _nodes.forEach(n => {
    minX = Math.min(minX, n.x); maxX = Math.max(maxX, n.x)
    minY = Math.min(minY, n.y); maxY = Math.max(maxY, n.y)
  })
  const W = canvas.width, H = canvas.height
  const scaleX = W / (maxX - minX + 160), scaleY = H / (maxY - minY + 160)
  _scale = Math.max(0.1, Math.min(scaleX, scaleY, 2))
  _panX = W / 2 - ((minX + maxX) / 2) * _scale
  _panY = H / 2 - ((minY + maxY) / 2) * _scale
  drawGraph(canvas, _degreeMap)
}

const toggleGraphFullscreen = async () => {
  graphFullscreen.value = !graphFullscreen.value
  await nextTick()
  renderGraph()
}

onMounted(async () => {
  await loadKbList()
  const [emb, rerank, chat, connRes] = await Promise.all([
    AiModelApi.listByType('EMBEDDING') as any,
    AiModelApi.listByType('RERANK') as any,
    AiModelApi.listByType('CHAT') as any,
    connectorApi.list() as any
  ])
  embeddingModels.value = emb?.data || []
  rerankModels.value = rerank?.data || []
  chatModels.value = chat?.data || []
  const allConnectors = connRes?.data?.list || connRes?.data || []
  graphConnectors.value = allConnectors.filter((c: any) =>
    c.category === 'GRAPH_DATABASE' ||
    c.type === 'GRAPH_DATABASE' ||
    c.dbType === 'GRAPH_DATABASE' ||
    (c.product || '').toUpperCase().includes('NEO4J') ||
    (c.datasourceType || '').toUpperCase().includes('NEO4J')
  )
  vectorConnectors.value = allConnectors.filter((c: any) =>
    c.category === 'VECTOR_DATABASE' ||
    c.type === 'VECTOR_DATABASE' ||
    c.dbType === 'VECTOR_DATABASE' ||
    (c.product || '').toUpperCase().includes('MILVUS') ||
    (c.product || '').toUpperCase().includes('QDRANT') ||
    (c.product || '').toUpperCase().includes('WEAVIATE') ||
    (c.product || '').toUpperCase().includes('PINECONE') ||
    (c.datasourceType || '').toUpperCase().includes('VECTOR')
  )
})
</script>

<style scoped>
.page-container { padding: 16px; padding-bottom: 0; min-height: 100%; background: #f5f7fa; }
.contain { background: #fff; border-radius: 8px; padding: 20px; padding-bottom: 16px; height: calc(100vh - 110px); display: flex; flex-direction: column; overflow: hidden; }
.kb-layout { display: flex; gap: 20px; flex: 1; min-height: 0; overflow: hidden; }
.kb-sidebar { width: 220px; flex-shrink: 0; border-right: 1px solid #e5e7eb; padding-right: 16px; overflow-y: auto; }
.sidebar-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.sidebar-title { font-weight: 600; font-size: 14px; color: #111827; }
.kb-item { padding: 10px 12px; border-radius: 8px; cursor: pointer; margin-bottom: 4px; border: 1px solid transparent; }
.kb-item:hover { background: #f3f4f6; }
.kb-item.active { background: #eff6ff; border-color: #bfdbfe; }
.kb-name { font-weight: 500; font-size: 14px; color: #111827; }
.kb-meta { font-size: 12px; color: #9ca3af; margin-top: 2px; }
.kb-ops { display: flex; gap: 4px; margin-top: 6px; }
.kb-main { flex: 1; min-width: 0; display: flex; flex-direction: column; overflow: hidden; }
/* Tab 导航 */
.main-tabs { display: flex; gap: 4px; margin-bottom: 16px; border-bottom: 1px solid #e5e7eb; padding-bottom: 0; flex-shrink: 0; }
.tab-btn { padding: 6px 16px; font-size: 13px; cursor: pointer; border-radius: 6px 6px 0 0; color: #6b7280; border-bottom: 2px solid transparent; margin-bottom: -1px; }
.tab-btn:hover { color: #374151; background: #f9fafb; }
.tab-btn.active { color: #2563eb; border-bottom-color: #2563eb; font-weight: 600; }
/* 文档 Tab */
.doc-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.doc-title { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 600; }
.kb-icon { font-size: 20px; }
.kb-desc { font-size: 13px; color: #6b7280; font-weight: 400; }
.doc-actions { display: flex; align-items: center; gap: 8px; }
/* 检索 Tab */
.search-tab { padding: 8px 0; flex: 1; overflow-y: auto; }
.search-bar { display: flex; gap: 8px; margin-bottom: 16px; align-items: center; }
.search-results { background: #fefce8; border: 1px solid #fde68a; border-radius: 8px; padding: 12px; }
.search-results-title { font-weight: 600; font-size: 13px; color: #92400e; margin-bottom: 8px; }
.search-result-item { border-bottom: 1px solid #fde68a; padding: 8px 0; }
.search-result-item:last-child { border-bottom: none; }
.result-meta { display: flex; align-items: center; gap: 12px; margin-bottom: 4px; }
.result-doc { font-size: 12px; color: #6b7280; }
.result-score { font-size: 12px; color: #059669; font-weight: 500; }
.result-source { font-size: 11px; padding: 1px 6px; border-radius: 3px; font-weight: 600; }
.source-graph { background: #fce7f3; color: #9d174d; }
.source-vector { background: #dbeafe; color: #1d4ed8; }
.source-keyword { background: #f3f4f6; color: #374151; }
.result-content { font-size: 13px; color: #374151; line-height: 1.5; }
.search-fallback { background: #fff7ed; border: 1px solid #fed7aa; border-radius: 6px; padding: 10px 14px; color: #c2410c; font-size: 13px; margin-bottom: 12px; }
.graph-context-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px 14px; margin-bottom: 12px; }
.graph-context-title { font-size: 13px; font-weight: 600; color: #166534; margin-bottom: 6px; }
.graph-context-content { font-size: 12px; color: #374151; white-space: pre-wrap; margin: 0; line-height: 1.6; }
/* 图谱 Tab */
.graph-tab { flex: 1; min-height: 0; display: flex; flex-direction: column; overflow: hidden; }
.graph-tab-scroll { flex: 1; overflow-y: auto; padding-right: 4px; padding-bottom: 8px; }
.graph-warn { background: #fffbeb; border: 1px solid #fcd34d; border-radius: 6px; padding: 10px 14px; color: #92400e; font-size: 13px; margin-bottom: 16px; }
.graph-section { margin-bottom: 24px; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.section-title { font-size: 14px; font-weight: 600; color: #111827; }
.schema-list { display: flex; flex-direction: column; gap: 8px; }
.schema-item { border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px 14px; display: flex; align-items: flex-start; gap: 12px; flex-wrap: wrap; }
.schema-name { display: flex; align-items: center; gap: 8px; min-width: 180px; }
.schema-badge { background: #dbeafe; color: #1d4ed8; font-size: 12px; padding: 2px 8px; border-radius: 4px; font-weight: 600; white-space: nowrap; }
.schema-desc { font-size: 12px; color: #6b7280; }
.schema-attrs { display: flex; flex-wrap: wrap; gap: 4px; flex: 1; }
.attr-tag { background: #f3f4f6; color: #374151; font-size: 11px; padding: 1px 6px; border-radius: 3px; }
.attr-more { font-size: 11px; color: #9ca3af; }
.schema-relations { display: flex; flex-wrap: wrap; gap: 4px; }
.rel-tag { background: #fce7f3; color: #9d174d; font-size: 11px; padding: 1px 6px; border-radius: 3px; }
.props-preview { font-size: 12px; color: #6b7280; }
/* 状态 */
.empty-tip { color: #9ca3af; text-align: center; padding: 80px 0; font-size: 14px; }
.empty-tip-sm { color: #9ca3af; text-align: center; padding: 20px 0; font-size: 13px; }
.doc-status { padding: 2px 8px; border-radius: 10px; font-size: 11px; }
.status-ok { background: #dcfce7; color: #166534; }
.doc-tag-vector { padding: 1px 6px; border-radius: 8px; font-size: 10px; background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; white-space: nowrap; }
.doc-tag-graph  { padding: 1px 6px; border-radius: 8px; font-size: 10px; background: #fdf4ff; color: #7e22ce; border: 1px solid #e9d5ff; white-space: nowrap; }
.status-pending { background: #fef3c7; color: #92400e; }
.status-error { background: #fee2e2; color: #991b1b; }
.status-spin { margin-left: 2px; }
/* 上传 */
.upload-area { border: 2px dashed #d1d5db; border-radius: 8px; padding: 32px; text-align: center; cursor: pointer; }
.upload-area:hover { border-color: #3b82f6; }
.upload-hint { color: #6b7280; font-size: 14px; }
.upload-file-info { display: flex; align-items: center; justify-content: space-between; padding: 8px 16px; background: #f3f4f6; border-radius: 6px; font-size: 13px; }
/* 关系图谱 Canvas */
.graph-canvas-wrap { position: relative; border: 1px solid #e2e8f0; border-radius: 8px; background: #f8fafc; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.graph-canvas-wrap.graph-fullscreen { position: fixed; inset: 0; z-index: 9999; border-radius: 0; }
.graph-canvas { display: block; width: 100%; height: 560px; cursor: default; user-select: none; }
.graph-fullscreen .graph-canvas { height: calc(100vh - 48px); }
.graph-toolbar { position: absolute; top: 8px; right: 10px; display: flex; gap: 6px; z-index: 10; }
.graph-tool-btn { background: rgba(255,255,255,0.9); border: 1px solid #cbd5e1; color: #334155; font-size: 14px; width: 30px; height: 30px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.15s; line-height: 1; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
.graph-tool-btn:hover { background: #f1f5f9; border-color: #94a3b8; }
.graph-tooltip { position: absolute; background: rgba(255,255,255,0.97); border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; pointer-events: none; max-width: 240px; z-index: 10; box-shadow: 0 4px 16px rgba(0,0,0,0.12); }
.tooltip-title { font-size: 13px; font-weight: 600; color: #1e293b; margin-bottom: 3px; }
.tooltip-type { font-size: 11px; color: #64748b; margin-bottom: 4px; }
.tooltip-props { font-size: 11px; color: #475569; white-space: pre-wrap; border-top: 1px solid #f1f5f9; padding-top: 4px; margin-top: 2px; }
/* 图例 */
.graph-legend { position: absolute; bottom: 10px; left: 10px; background: rgba(255,255,255,0.92); border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 10px; display: flex; flex-wrap: wrap; gap: 6px 12px; max-width: 420px; z-index: 10; }
.graph-legend-item { display: flex; align-items: center; gap: 5px; font-size: 11px; color: #475569; }
.graph-legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
/* 表单分区标题 */
.form-section-title { font-size: 13px; font-weight: 600; color: #374151; margin: 16px 0 8px 0; padding-left: 8px; border-left: 3px solid #3b82f6; }
</style>
