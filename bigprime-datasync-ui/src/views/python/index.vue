<template>
  <div class="python-ide" :class="{ 'theme-light': isLight, 'sidebar-hidden': sidebarHidden }">
    <!-- 顶部工具栏 -->
    <div class="ide-toolbar">
      <span class="ide-title">Python 开发环境</span>
      <div class="toolbar-right">
        <!-- 保存 -->
        <span
          class="tb-btn"
          :class="{ disabled: !workspaceId || executing }"
          title="保存 (Ctrl+S)"
          @click="!executing && saveCode()"
        >
          <svg viewBox="0 0 20 20" width="17" height="17">
            <rect
              x="3"
              y="2"
              width="14"
              height="16"
              rx="1"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            />
            <rect x="6" y="2" width="8" height="6" rx="0.5" fill="currentColor" opacity="0.6" />
            <rect x="5" y="11" width="10" height="5" rx="0.5" fill="currentColor" opacity="0.5" />
          </svg>
        </span>
        <!-- 运行 -->
        <span
          class="tb-btn"
          :class="{ disabled: !workspaceId || executing || debugging, active: executing }"
          :title="debugging ? '调试中，无法运行' : executing ? '执行中...' : '运行 (Ctrl+Enter)'"
          @click="!executing && !debugging && runCode()"
        >
          <svg viewBox="0 0 20 20" width="17" height="17">
            <polygon points="4,2 18,10 4,18" :fill="executing ? '#4CAF50' : 'currentColor'" />
          </svg>
        </span>
        <!-- 调试/停止调试 -->
        <span
          class="tb-btn"
          :class="{ disabled: !workspaceId, 'btn-debug-active': debugging }"
          :title="debugging ? '停止调试' : '启动调试'"
          @click="toggleDebug()"
        >
          <svg v-if="!debugging" viewBox="0 0 20 20" width="17" height="17">
            <!-- 调试图标：虫形 -->
            <circle cx="10" cy="7" r="3.5" fill="none" stroke="currentColor" stroke-width="1.5" />
            <line
              x1="7"
              y1="3.5"
              x2="4"
              y2="1.5"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
            <line
              x1="13"
              y1="3.5"
              x2="16"
              y2="1.5"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
            <rect
              x="6"
              y="10"
              width="8"
              height="8"
              rx="2"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            />
            <line
              x1="6"
              y1="13"
              x2="4"
              y2="13"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
            <line
              x1="14"
              y1="13"
              x2="16"
              y2="13"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
            <line
              x1="6"
              y1="16"
              x2="4"
              y2="16"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
            <line
              x1="14"
              y1="16"
              x2="16"
              y2="16"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
          <svg v-else viewBox="0 0 20 20" width="17" height="17">
            <!-- 停止图标：红色方块 -->
            <rect x="3" y="3" width="14" height="14" rx="2" fill="#EF5350" />
          </svg>
        </span>
        <!-- 备份（暂隐藏，待实现）
        <span class="tb-btn" :class="{ disabled: !workspaceId }" title="备份" @click="workspaceId && (showBackupDialog = true)">
          <svg viewBox="0 0 20 20" width="17" height="17">
            <path d="M10 2 L10 12 M6 8 L10 12 L14 8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M3 14 L3 17 L17 17 L17 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </span>
        -->
        <!-- AI 助手面板 -->
        <span
          class="tb-btn"
          :class="{ active: aiPanelVisible }"
          title="AI 代码助手"
          @click="toggleAiPanel()"
        >
          <svg viewBox="0 0 20 20" width="17" height="17">
            <rect
              x="3"
              y="4"
              width="14"
              height="11"
              rx="2"
              fill="none"
              stroke="currentColor"
              stroke-width="1.4"
            />
            <circle cx="7.5" cy="9" r="1.3" fill="currentColor" />
            <circle cx="12.5" cy="9" r="1.3" fill="currentColor" />
            <path
              d="M7 12.5 Q10 14.5 13 12.5"
              fill="none"
              stroke="currentColor"
              stroke-width="1.2"
              stroke-linecap="round"
            />
            <line
              x1="6"
              y1="4"
              x2="5"
              y2="1.5"
              stroke="currentColor"
              stroke-width="1.3"
              stroke-linecap="round"
            />
            <line
              x1="14"
              y1="4"
              x2="15"
              y2="1.5"
              stroke="currentColor"
              stroke-width="1.3"
              stroke-linecap="round"
            />
          </svg>
        </span>
        <!-- AI 代码补全开关 -->
        <span
          class="tb-btn"
          :class="{ active: aiCompletionEnabled, disabled: !selectedAssistantId }"
          :title="
            aiCompletionEnabled
              ? 'AI 代码补全：已开启（点击关闭）'
              : 'AI 代码补全：已关闭（点击开启）'
          "
          @click="aiCompletionEnabled = !aiCompletionEnabled"
        >
          <svg viewBox="0 0 20 20" width="17" height="17">
            <path
              d="M4 6 L8 10 L4 14"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <line
              x1="10"
              y1="14"
              x2="16"
              y2="14"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
            />
            <circle v-if="aiCompletionEnabled" cx="16" cy="5" r="2.5" fill="#4CAF50" />
          </svg>
        </span>
        <!-- 发布为HTTP服务 -->
        <span
          class="tb-btn"
          :class="{ disabled: !workspaceId }"
          title="发布为 HTTP 服务"
          @click="workspaceId && openPublishDialog()"
        >
          <svg viewBox="0 0 20 20" width="17" height="17">
            <circle cx="10" cy="10" r="7.5" fill="none" stroke="currentColor" stroke-width="1.5" />
            <ellipse
              cx="10"
              cy="10"
              rx="3.5"
              ry="7.5"
              fill="none"
              stroke="currentColor"
              stroke-width="1.2"
            />
            <line x1="2.5" y1="10" x2="17.5" y2="10" stroke="currentColor" stroke-width="1.2" />
            <line x1="4" y1="6" x2="16" y2="6" stroke="currentColor" stroke-width="1" />
            <line x1="4" y1="14" x2="16" y2="14" stroke="currentColor" stroke-width="1" />
          </svg>
        </span>
        <!-- 主题切换 -->
        <span
          class="tb-btn"
          :title="isLight ? '切换暗色主题' : '切换亮色主题'"
          @click="toggleTheme()"
        >
          <svg v-if="isLight" viewBox="0 0 20 20" width="17" height="17">
            <!-- 月亮 -->
            <path d="M15 10.5a6 6 0 01-7.5-7.5A6 6 0 1015 10.5z" fill="currentColor" />
          </svg>
          <svg v-else viewBox="0 0 20 20" width="17" height="17">
            <!-- 太阳 -->
            <circle cx="10" cy="10" r="4" fill="currentColor" />
            <line
              v-for="a in [0, 45, 90, 135, 180, 225, 270, 315]"
              :key="a"
              :x1="10 + 5.5 * Math.cos((a * Math.PI) / 180)"
              :y1="10 + 5.5 * Math.sin((a * Math.PI) / 180)"
              :x2="10 + 7.5 * Math.cos((a * Math.PI) / 180)"
              :y2="10 + 7.5 * Math.sin((a * Math.PI) / 180)"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
        </span>
        <!-- 全屏/展开侧边栏 -->
        <span
          class="tb-btn"
          :title="sidebarHidden ? '展开侧边栏' : '全屏模式'"
          @click="toggleSidebar()"
        >
          <svg v-if="sidebarHidden" viewBox="0 0 20 20" width="17" height="17">
            <rect
              x="2"
              y="3"
              width="5"
              height="14"
              rx="1"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            />
            <rect
              x="9"
              y="3"
              width="9"
              height="14"
              rx="1"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            />
          </svg>
          <svg v-else viewBox="0 0 20 20" width="17" height="17">
            <rect
              x="2"
              y="3"
              width="16"
              height="14"
              rx="1"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            />
            <line x1="7" y1="3" x2="7" y2="17" stroke="currentColor" stroke-width="1.5" />
          </svg>
        </span>
      </div>
    </div>

    <!-- 主体三栏布局 -->
    <div class="ide-body">
      <!-- 左侧边栏 -->
      <div
        class="ide-sidebar"
        :class="{ 'ide-sidebar--collapsed': sidebarCollapsed }"
        :style="sidebarCollapsed ? {} : { width: sidebarWidth + 'px' }"
      >
        <!-- Workspace 选择 -->
        <div class="sidebar-section">
          <div class="section-title">
            Workspace
            <tiny-button size="mini" type="text" @click="showCreateWorkspaceDialog = true"
              >+新建</tiny-button
            >
          </div>
          <tiny-select
            v-model="workspaceId"
            placeholder="选择 Workspace"
            size="small"
            style="width: 100%"
            @change="onWorkspaceChange"
          >
            <tiny-option v-for="ws in workspaceList" :key="ws.id" :label="ws.name" :value="ws.id" />
          </tiny-select>
          <div class="kernel-status" :class="kernelRunning ? 'running' : 'stopped'">
            <span class="status-dot" />
            {{ kernelRunning ? 'Kernel 运行中' : 'Kernel 未启动' }}
            <tiny-button v-if="!kernelRunning" size="mini" type="text" @click="startKernel"
              >启动</tiny-button
            >
          </div>
        </div>

        <!-- 文件列表 -->
        <div class="sidebar-section sidebar-section--flex">
          <div class="section-title">
            文件列表
            <tiny-button size="mini" type="text" @click="openNewFileDialog()">+新建</tiny-button>
          </div>
          <div class="file-list">
            <template v-if="fileTree.length">
              <file-tree-node
                v-for="node in fileTree"
                :key="node.path"
                :node="node"
                :selected-path="selectedItem.path"
                @open-file="openFile"
                @rename="openRenameDialog"
                @delete="deleteFile"
                @select="onTreeSelect"
              />
            </template>
            <div v-else class="empty-tip">暂无文件</div>
          </div>
        </div>

        <!-- 依赖包 -->
        <div class="sidebar-section">
          <div class="section-title">
            依赖包
            <tiny-button size="mini" type="text" @click="loadPackageList">↺</tiny-button>
            <tiny-button
              size="mini"
              type="text"
              @click="showInstallDialog = true; loadPackageList()"
              >+安装</tiny-button
            >
          </div>
          <div class="pkg-list">
            <div v-for="pkg in packageList" :key="pkg.name" class="pkg-item">
              <span class="pkg-name">{{ pkg.name }}</span>
              <span class="pkg-version">{{ pkg.version }}</span>
              <tiny-button
                size="mini"
                type="text"
                class="pkg-uninstall"
                @click="doUninstallPackage(pkg.name)"
                >卸载</tiny-button
              >
            </div>
            <div v-if="!packageList.length" class="empty-tip">暂无已安装包</div>
          </div>
        </div>

        <!-- 版本备份（暂隐藏，待实现） -->
        <!-- <div class="sidebar-section">
          <div class="section-title">
            版本备份
            <tiny-button size="mini" type="text" @click="showBackupDialog = true">+备份</tiny-button>
          </div>
          <div class="backup-list">
            <div v-for="bk in backupList" :key="bk.id" class="backup-item">
              <div class="backup-info">
                <span class="backup-remark">{{ bk.remark || '无备注' }}</span>
                <span class="backup-time">{{ formatTime(bk.createTime) }}</span>
              </div>
              <div class="backup-actions">
                <tiny-button size="mini" type="text" @click="restoreBackup(bk.id)">恢复</tiny-button>
                <tiny-button size="mini" type="text" @click="deleteBackup(bk.id)">删除</tiny-button>
              </div>
            </div>
            <div v-if="!backupList.length" class="empty-tip">暂无备份</div>
          </div>
        </div> -->

        <!-- 发布服务 -->
        <div class="sidebar-section">
          <div class="section-title">
            HTTP 服务
            <tiny-button size="mini" type="text" @click="workspaceId && openPublishDialog()"
              >发布</tiny-button
            >
          </div>
          <div class="service-list">
            <div v-for="svc in serviceList" :key="svc.id" class="service-item">
              <div class="service-header">
                <span class="service-name">{{ svc.serviceName }}</span>
                <span
                  class="service-status"
                  :class="svc.status === 'ACTIVE' ? 'active' : 'inactive'"
                  >{{ svc.status === 'ACTIVE' ? '有效' : '停用' }}</span
                >
              </div>
              <div class="service-script">{{ svc.scriptName }}</div>
              <div class="service-actions">
                <tiny-button size="mini" type="text" @click="copyApiKey(svc.apiKey)"
                  >复制Key</tiny-button
                >
                <tiny-button
                  size="mini"
                  type="text"
                  @click="svc.status === 'ACTIVE' ? disableService(svc.id) : enableService(svc.id)"
                >
                  {{ svc.status === 'ACTIVE' ? '停用' : '启用' }}
                </tiny-button>
                <tiny-button size="mini" type="text" @click="deleteService(svc.id)"
                  >删除</tiny-button
                >
              </div>
            </div>
            <div v-if="!serviceList.length" class="empty-tip">暂无发布服务</div>
          </div>
        </div>
      </div>

      <!-- 侧边栏右侧：拖拽线 or 折叠还原条 -->
      <div v-if="!sidebarCollapsed" class="sidebar-resizer" @mousedown="startSidebarResize">
        <span
          class="sidebar-resizer-collapse"
          title="折叠侧边栏"
          @click.stop="sidebarCollapsed = true"
          >‹</span
        >
      </div>
      <div
        v-else
        class="sidebar-collapsed-bar"
        title="展开侧边栏"
        @click="sidebarCollapsed = false"
      >
        ›
      </div>

      <!-- 右侧：编辑器 + 底部面板（上下布局） -->
      <div class="ide-main-area">
        <!-- 编辑器区域 -->
        <div
          class="ide-editor-area"
          :style="{ flex: bottomPanelVisible ? '1 1 auto' : '1 1 100%' }"
        >
          <!-- 文件标签页 -->
          <div class="editor-tabs">
            <div
              v-for="tab in openTabs"
              :key="tab.name"
              class="editor-tab"
              :class="{ active: currentFile === tab.name }"
              @click="onTabClick(tab.name)"
            >
              <span>{{ tab.name }}</span>
              <span v-if="tab.modified" class="tab-modified" title="未保存">●</span>
              <span class="tab-close" @click.stop="closeTab(tab.name)">×</span>
            </div>
          </div>
          <!-- Monaco Editor -->
          <div ref="editorContainer" class="editor-container" />
        </div>

        <!-- 拖拽分割线 -->
        <div v-show="bottomPanelVisible" class="panel-resizer" @mousedown="startResize" />

        <!-- 底部面板 -->
        <div
          v-show="bottomPanelVisible"
          class="ide-bottom-panel"
          :style="{ height: bottomPanelHeight + 'px' }"
        >
          <!-- 面板 Tab 栏 -->
          <div class="panel-tabs">
            <!-- 调试动作图标栏（常驻，调试中彩色可用，否则灰色禁用） -->
            <div class="debug-action-bar">
              <span
                class="dbg-btn"
                :class="{ active: debugging }"
                :title="debugging ? '继续执行 (F5)' : '启动调试后可用'"
                @click="debugging && debugContinue()"
              >
                <!-- 继续：绿色三角 -->
                <svg viewBox="0 0 16 16" width="15" height="15">
                  <polygon points="4,2 13,8 4,14" :fill="debugging ? '#4CAF50' : '#555'" />
                </svg>
              </span>
              <span
                class="dbg-btn"
                :class="{ active: debugging }"
                :title="debugging ? '暂停 (挂起所有线程)' : '启动调试后可用'"
                @click="debugging && debugPause()"
              >
                <!-- 暂停：双竖线 -->
                <svg viewBox="0 0 16 16" width="15" height="15">
                  <rect
                    x="3"
                    y="2"
                    width="3.5"
                    height="12"
                    :fill="debugging ? '#42A5F5' : '#555'"
                  />
                  <rect
                    x="9.5"
                    y="2"
                    width="3.5"
                    height="12"
                    :fill="debugging ? '#42A5F5' : '#555'"
                  />
                </svg>
              </span>
              <span class="dbg-sep" />
              <span
                class="dbg-btn"
                :class="{ active: debugging }"
                :title="debugging ? '单步 Step Over (F10)' : '启动调试后可用'"
                @click="debugging && debugStepOver()"
              >
                <!-- 跳过：弯箭头 -->
                <svg viewBox="0 0 16 16" width="15" height="15">
                  <path
                    d="M3,12 Q3,4 10,4"
                    :stroke="debugging ? '#FFA726' : '#555'"
                    stroke-width="2"
                    fill="none"
                    stroke-linecap="round"
                  />
                  <polygon points="8,1 13,4 8,7" :fill="debugging ? '#FFA726' : '#555'" />
                  <line
                    x1="10"
                    y1="4"
                    x2="10"
                    y2="13"
                    :stroke="debugging ? '#FFA726' : '#555'"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                </svg>
              </span>
              <span
                class="dbg-btn"
                :class="{ active: debugging }"
                :title="debugging ? '进入 Step Into (F11)' : '启动调试后可用'"
                @click="debugging && debugStepIn()"
              >
                <!-- 进入：向下箭头 -->
                <svg viewBox="0 0 16 16" width="15" height="15">
                  <line
                    x1="8"
                    y1="1"
                    x2="8"
                    y2="11"
                    :stroke="debugging ? '#AB47BC' : '#555'"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                  <polygon points="4,8 8,14 12,8" :fill="debugging ? '#AB47BC' : '#555'" />
                </svg>
              </span>
              <span
                class="dbg-btn"
                :class="{ active: debugging }"
                :title="debugging ? '跳出 Step Out (F12)' : '启动调试后可用'"
                @click="debugging && debugStepOut()"
              >
                <!-- 跳出：向上箭头 -->
                <svg viewBox="0 0 16 16" width="15" height="15">
                  <line
                    x1="8"
                    y1="15"
                    x2="8"
                    y2="5"
                    :stroke="debugging ? '#EF5350' : '#555'"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                  <polygon points="4,8 8,2 12,8" :fill="debugging ? '#EF5350' : '#555'" />
                </svg>
              </span>
              <span class="dbg-sep" />
              <span
                class="dbg-btn"
                :class="{ active: debugging }"
                :title="debugging ? '停止调试' : '调试未启动'"
                @click="debugging && stopDebug()"
              >
                <!-- 停止：红色方块 -->
                <svg viewBox="0 0 16 16" width="15" height="15">
                  <rect
                    x="3"
                    y="3"
                    width="10"
                    height="10"
                    :fill="debugging ? '#EF5350' : '#555'"
                    rx="1"
                  />
                </svg>
              </span>
            </div>
            <!-- Tab 列表 -->
            <div class="dbg-sep-v" />
            <div
              v-for="t in panelTabs"
              :key="t.key"
              class="panel-tab"
              :class="{ active: activePanel === t.key }"
              @click="switchPanel(t.key)"
            >
              {{ t.label }}
            </div>
            <div class="panel-tab-right">
              <span class="panel-collapse-btn" @click="bottomPanelVisible = false" title="隐藏面板"
                >✕</span
              >
            </div>
          </div>

          <!-- 控制台面板 -->
          <div v-show="activePanel === 'console'" class="panel-content output-panel">
            <div class="output-toolbar">
              <tiny-button size="mini" type="text" @click="clearOutput">清空</tiny-button>
            </div>
            <div ref="outputContainer" class="output-content">
              <div
                v-for="(line, idx) in outputLines"
                :key="idx"
                class="output-line"
                :class="line.type"
              >
                {{ line.text }}
              </div>
            </div>
          </div>

          <!-- 变量面板 -->
          <div v-show="activePanel === 'variables'" class="panel-content">
            <div v-if="!displayVariables.length" class="empty-tip">
              {{
                !debugging
                  ? '执行代码后变量将在此显示'
                  : debugStateReceived
                    ? '无局部变量'
                    : '等待断点命中...'
              }}
            </div>
            <div v-for="v in displayVariables" :key="v.name" class="var-item">
              <!-- 可展开的对象变量 -->
              <template v-if="v.variablesReference > 0">
                <div class="var-row expandable" @click="toggleExpand(v)">
                  <span class="expand-arrow">{{ v._expanded ? '▼' : '▶' }}</span>
                  <span class="var-name">{{ v.name }}</span>
                  <span class="var-type">{{ v.type }}</span>
                  <span class="var-value">{{ v.value }}</span>
                </div>
                <div v-if="v._expanded" class="var-children">
                  <div v-if="!v._children" class="empty-tip" style="padding-left: 20px">
                    加载中...
                  </div>
                  <div v-for="child in v._children" :key="child.name" class="var-row child-row">
                    <span class="var-name">{{ child.name }}</span>
                    <span class="var-type">{{ child.type }}</span>
                    <span class="var-value">{{ child.value }}</span>
                  </div>
                </div>
              </template>
              <!-- 普通变量 -->
              <template v-else>
                <div class="var-row">
                  <span class="expand-arrow" style="visibility: hidden">▶</span>
                  <span class="var-name">{{ v.name }}</span>
                  <span class="var-type">{{ v.type }}</span>
                  <span class="var-value">{{ v.value }}</span>
                </div>
              </template>
            </div>
          </div>

          <!-- 堆栈面板 -->
          <div v-show="activePanel === 'stack'" class="panel-content">
            <div v-if="!debugging" class="debug-idle-tip">
              <div class="debug-tip-title">如何使用调试</div>
              <ol class="debug-tip-steps">
                <li>点击编辑器左侧行号区域添加/取消断点（红点）</li>
                <li>点击顶部「调试」按钮启动</li>
                <li>断点命中后此处显示调用栈，变量面板显示局部变量</li>
                <li>使用 Tab 栏右侧按钮或 F5/F10/F11/F12 控制执行</li>
              </ol>
              <div v-if="breakpointLines.size > 0" class="breakpoint-list-preview">
                <div class="debug-section-title">已设断点 ({{ breakpointLines.size }} 个)</div>
                <div
                  v-for="line in [...breakpointLines].sort((a, b) => a - b)"
                  :key="line"
                  class="bp-item"
                >
                  <span class="bp-dot" />
                  第 {{ line }} 行
                  <tiny-button size="mini" type="text" @click="removeBreakpoint(line)"
                    >×</tiny-button
                  >
                </div>
              </div>
              <div v-else class="empty-tip" style="margin-top: 8px">尚未设置断点</div>
            </div>
            <template v-else>
              <div class="debug-section-title">调用栈</div>
              <div v-if="!stackFrames.length" class="empty-tip">等待断点命中...</div>
              <div v-for="frame in stackFrames" :key="frame.id" class="stack-frame">
                <div class="frame-name">{{ formatFrameName(frame.name) }}</div>
                <div class="frame-location">
                  {{ frame.source?.path?.split(/[\\/]/).pop() || currentFile || 'main.py' }}:{{
                    frame.line
                  }}
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- 底部面板折叠时的恢复条 -->
        <div v-show="!bottomPanelVisible" class="panel-restore-bar">
          <div v-for="t in panelTabs" :key="t.key" class="restore-tab" @click="showPanel(t.key)">
            {{ t.label }}
          </div>
        </div>
      </div>

      <!-- AI 对话面板（右侧） -->
      <div v-if="aiPanelVisible" class="ai-panel-resizer" @mousedown="startAiPanelResize" />
      <div v-if="aiPanelVisible" class="ai-panel" :style="{ width: aiPanelWidth + 'px' }">
        <!-- 头部 -->
        <div class="ai-panel-header">
          <span class="ai-panel-title">AI 代码助手<span v-if="selectedAssistantName" class="ai-panel-title-name">· {{ selectedAssistantName }}</span></span>
          <span class="ai-panel-close" title="关闭" @click="aiPanelVisible = false">&times;</span>
        </div>
        <!-- 助手切换标签（多个助手时展示） -->
        <div v-if="codeAssistants.length > 1" class="ai-panel-switch-bar">
          <span class="ai-switch-label">切换：</span>
          <div class="ai-switch-tabs">
            <span
              v-for="a in codeAssistants"
              :key="a.id"
              class="ai-switch-tab"
              :class="{ active: selectedAssistantId === a.id }"
              @click="onSwitchAssistant(a)"
            >
              <span class="ai-tab-avatar">{{ a.avatar || '🤖' }}</span>
              {{ a.name }}
            </span>
          </div>
        </div>
        <!-- 消息区 -->
        <div ref="aiMessagesRef" class="ai-panel-messages">
          <div v-if="!aiMessages.length" class="ai-empty-tip">
            选择一个代码助手，输入问题开始对话。<br />
            AI 可以帮你生成 Python 代码、解释代码、修复 Bug。
          </div>
          <div
            v-for="(msg, idx) in aiMessages"
            :key="idx"
            class="ai-msg"
            :class="'ai-msg-' + msg.role"
          >
            <div v-if="msg.role === 'user'" class="ai-msg-bubble ai-msg-bubble-user">{{ msg.content }}</div>
            <div v-else class="ai-msg-bubble ai-msg-bubble-ai ai-msg-md" v-html="renderMarkdown(msg.content)" />
          </div>
          <div v-if="aiStreaming" class="ai-typing-indicator"><span /><span /><span /></div>
        </div>
        <!-- 输入区 -->
        <div class="ai-panel-input">
          <textarea
            v-model="aiInputText"
            class="ai-input-textarea"
            placeholder="描述你需要的代码..."
            rows="3"
            :disabled="aiStreaming"
            @keydown.enter.ctrl="sendAiMessage"
            @keydown.enter.meta="sendAiMessage"
          />
          <div class="ai-input-actions">
            <span class="ai-input-hint">Ctrl+Enter 发送</span>
            <span
              class="ai-write-toggle"
              :class="{ active: aiWriteToEditor }"
              :title="aiWriteToEditor ? '已开启：代码直接写入编辑器（点击关闭）' : '点击开启：代码直接写入编辑器光标处'"
              @click="aiWriteToEditor = !aiWriteToEditor"
            >⌨</span>
            <tiny-button
              size="mini"
              type="primary"
              :disabled="aiStreaming || !aiInputText.trim() || !selectedAssistantId"
              @click="sendAiMessage"
            >
              {{ aiStreaming ? '生成中...' : '发送' }}
            </tiny-button>
            <tiny-button v-if="aiStreaming" size="mini" @click="stopAiStream">停止</tiny-button>
            <tiny-button size="mini" type="text" title="清空对话" @click="clearAiChat"
              >清空</tiny-button
            >
          </div>
        </div>
      </div>
    </div>

    <!-- 创建 Workspace 对话框 -->
    <tiny-dialog-box
      v-model:visible="showCreateWorkspaceDialog"
      title="新建 Workspace"
      width="400px"
    >
      <tiny-input
        v-model="newWorkspaceName"
        placeholder="Workspace 名称（必填）"
        style="margin-bottom: 8px"
      />
      <tiny-input v-model="newWorkspaceDesc" placeholder="描述（可选）" />
      <template #footer>
        <tiny-button @click="showCreateWorkspaceDialog = false">取消</tiny-button>
        <tiny-button type="primary" @click="doCreateWorkspace">确认</tiny-button>
      </template>
    </tiny-dialog-box>

    <!-- 文件重命名对话框 -->
    <tiny-dialog-box v-model:visible="showRenameDialog" title="重命名文件" width="380px">
      <tiny-input
        v-model="renameNewName"
        placeholder="新文件名（含 .py 后缀）"
        @keyup.enter="doRenameFile"
      />
      <template #footer>
        <tiny-button @click="showRenameDialog = false">取消</tiny-button>
        <tiny-button type="primary" @click="doRenameFile">确认</tiny-button>
      </template>
    </tiny-dialog-box>

    <!-- 新建文件/包对话框 -->
    <tiny-dialog-box v-model:visible="showNewFileDialog" title="新建" width="420px">
      <div style="display: flex; flex-direction: column; gap: 12px">
        <div
          style="
            font-size: 12px;
            color: #888;
            padding: 4px 8px;
            background: rgba(0, 120, 212, 0.08);
            border-radius: 4px;
          "
        >
          📂 创建位置：<strong>{{ createLocationLabel }}</strong>
          <span
            v-if="selectedItem.path"
            style="margin-left: 6px; color: #0078d4; cursor: pointer"
            @click="selectedItem = { type: '', path: '' }"
            >（清除）</span
          >
        </div>
        <div style="display: flex; gap: 8px">
          <tiny-button
            :type="newFileType === 'file' ? 'primary' : 'default'"
            size="mini"
            @click="newFileType = 'file'"
            >📄 Python 文件</tiny-button
          >
          <tiny-button
            :type="newFileType === 'package' ? 'primary' : 'default'"
            size="mini"
            @click="newFileType = 'package'"
            >📦 Python 包</tiny-button
          >
        </div>
        <div>
          <div style="font-size: 12px; color: #888; margin-bottom: 4px">
            {{
              newFileType === 'file'
                ? '文件名（含 .py 后缀，可含子目录 如 utils/helper.py）'
                : '包名（将自动创建目录和 __init__.py，可含子目录 如 models/user）'
            }}
          </div>
          <tiny-input
            v-model="newFileName"
            :placeholder="
              newFileType === 'file' ? 'main.py 或 utils/helper.py' : 'mypackage 或 models/user'
            "
            @keyup.enter="doCreateNewFile"
          />
        </div>
      </div>
      <template #footer>
        <tiny-button @click="showNewFileDialog = false">取消</tiny-button>
        <tiny-button type="primary" @click="doCreateNewFile">创建</tiny-button>
      </template>
    </tiny-dialog-box>

    <!-- 创建备份对话框 -->
    <tiny-dialog-box v-model:visible="showBackupDialog" title="创建版本备份" width="400px">
      <tiny-input v-model="backupRemark" placeholder="请输入备注（可选）" />
      <template #footer>
        <tiny-button @click="showBackupDialog = false">取消</tiny-button>
        <tiny-button type="primary" @click="doCreateBackup">确认</tiny-button>
      </template>
    </tiny-dialog-box>

    <!-- 安装依赖对话框 -->
    <tiny-dialog-box
      v-model:visible="showInstallDialog"
      title="安装依赖包"
      width="1100px"
      :close-on-click-modal="false"
    >
      <div class="install-nuget" :class="{ dark: !isLight }">
        <!-- 左侧：搜索 + 包列表 -->
        <div class="install-left">
          <!-- 镜像源配置行 -->
          <div class="install-mirror-row">
            <span class="install-mirror-label">pip 来源：</span>
            <tiny-select
              v-model="pipMirror"
              style="flex: 1; min-width: 0"
              size="mini"
              @change="onMirrorChange"
            >
              <tiny-option
                v-for="m in MIRROR_LIST"
                :key="m.value"
                :label="m.label"
                :value="m.value"
              />
            </tiny-select>
          </div>
          <div v-if="pipMirror === 'custom'" class="install-mirror-custom">
            <tiny-input
              v-model="customMirrorUrl"
              size="mini"
              placeholder="https://mirrors.xxx.com/simple/"
            />
          </div>
          <!-- 搜索框 -->
          <div class="install-search-bar">
            <tiny-input
              v-model="pkgSearchKeyword"
              placeholder="搜索包名，如 pandas、numpy..."
              @input="onPkgSearch"
              clearable
            >
              <template #suffix>
                <span v-if="pkgSearching" style="font-size: 11px; color: #888">搜索中...</span>
              </template>
            </tiny-input>
          </div>
          <!-- 包列表 -->
          <div class="install-pkg-list">
            <div v-if="pkgSearching" class="install-list-tip">正在从 PyPI 搜索...</div>
            <template v-else>
              <!-- PyPI 精确匹配结果（显示在顶部） -->
              <template v-if="pypiSearchResults.length > 0">
                <div class="install-list-section">PyPI 匹配</div>
                <div
                  v-for="pkg in pypiSearchResults"
                  :key="'pypi-' + pkg.value"
                  class="install-pkg-item"
                  :class="{ active: selectedPkg && selectedPkg.value === pkg.value }"
                  @click="selectPkg(pkg)"
                >
                  <div class="install-pkg-name">{{ pkg.value }}</div>
                  <div class="install-pkg-desc">{{ pkg.desc || pkg.label }}</div>
                </div>
                <div v-if="filteredCommonPackages.length > 0" class="install-list-section">
                  常用包
                </div>
              </template>
              <!-- 常用包列表：无搜索词显示全量，有搜索词显示过滤结果 -->
              <template v-if="!pkgSearchKeyword">
                <div class="install-list-section">常用包</div>
                <div
                  v-for="pkg in filteredCommonPackages"
                  :key="'common-' + pkg.value"
                  class="install-pkg-item"
                  :class="{ active: selectedPkg && selectedPkg.value === pkg.value }"
                  @click="selectPkg(pkg)"
                >
                  <div class="install-pkg-name">{{ pkg.value }}</div>
                  <div class="install-pkg-desc">{{ pkg.desc || pkg.label }}</div>
                </div>
              </template>
              <template v-else>
                <div
                  v-if="filteredCommonPackages.length === 0 && pypiSearchResults.length === 0"
                  class="install-list-tip"
                >
                  未找到匹配的包
                  <div
                    class="install-manual-entry"
                    @click="doInstallManual(pkgSearchKeyword.trim())"
                  >
                    直接安装「{{ pkgSearchKeyword.trim() }}」
                  </div>
                </div>
                <template v-else-if="filteredCommonPackages.length > 0">
                  <div v-if="!pypiSearchResults.length" class="install-list-section">常用包</div>
                  <div
                    v-for="pkg in filteredCommonPackages"
                    :key="'common-' + pkg.value"
                    class="install-pkg-item"
                    :class="{ active: selectedPkg && selectedPkg.value === pkg.value }"
                    @click="selectPkg(pkg)"
                  >
                    <div class="install-pkg-name">{{ pkg.value }}</div>
                    <div class="install-pkg-desc">{{ pkg.desc || pkg.label }}</div>
                  </div>
                </template>
                <div
                  v-else-if="pypiSearchResults.length > 0"
                  class="install-list-tip install-list-tip--sub"
                >
                  常用包中无匹配
                </div>
              </template>
            </template>
          </div>
        </div>
        <!-- 右侧：包详情 + 版本选择 + 安装 -->
        <div class="install-right">
          <div v-if="!selectedPkg" class="install-right-empty">← 从左侧选择一个包</div>
          <template v-else>
            <div class="install-detail-name">{{ selectedPkg.value }}</div>
            <div class="install-detail-desc">
              {{ selectedPkgInfo?.summary || selectedPkg.desc || selectedPkg.label }}
            </div>
            <!-- 版本选择 -->
            <div class="install-version-row">
              <span class="install-version-label">版本：</span>
              <div style="flex: 1">
                <tiny-select
                  v-if="!pkgVersionManual"
                  v-model="selectedVersion"
                  filterable
                  placeholder="选择版本"
                  style="width: 100%"
                  :loading="pkgVersionLoading"
                >
                  <tiny-option v-for="v in pkgVersionList" :key="v" :label="v" :value="v" />
                </tiny-select>
                <tiny-input
                  v-else
                  v-model="selectedVersion"
                  placeholder="输入版本号，如 1.5.0，空=最新"
                  style="width: 100%"
                />
              </div>
              <tiny-button
                size="mini"
                type="text"
                @click="pkgVersionManual = !pkgVersionManual"
                style="margin-left: 6px; white-space: nowrap"
              >
                {{ pkgVersionManual ? '下拉选择' : '手动输入' }}
              </tiny-button>
            </div>
            <div v-if="pkgVersionLoading" style="font-size: 12px; color: #888; margin: 4px 0">
              正在从 PyPI 获取版本列表...
            </div>
            <div v-if="pkgVersionError" style="font-size: 12px; color: #e67e22; margin: 4px 0">
              {{ pkgVersionError }}
            </div>
            <!-- 包基本信息 -->
            <div v-if="selectedPkgInfo" class="install-detail-meta">
              <div v-if="selectedPkgInfo.home_page">
                <span>主页：</span
                ><a :href="selectedPkgInfo.home_page" target="_blank">{{
                  selectedPkgInfo.home_page
                }}</a>
              </div>
              <div v-if="selectedPkgInfo.author">
                <span>作者：</span>{{ selectedPkgInfo.author }}
              </div>
              <div v-if="selectedPkgInfo.license">
                <span>许可证：</span>{{ selectedPkgInfo.license }}
              </div>
            </div>
            <!-- 安装按钮 -->
            <div class="install-action-row">
              <tiny-button
                type="primary"
                :disabled="installing"
                @click="doInstallPackage"
                style="width: 100%"
              >
                {{
                  installing
                    ? '安装中...'
                    : `安装 ${selectedPkg.value}${selectedVersion ? '==' + selectedVersion : ' (最新)'}`
                }}
              </tiny-button>
            </div>
          </template>
          <!-- 日志区 -->
          <div v-if="installOutput" class="install-output" ref="installOutputRef">
            <pre>{{ installOutput }}</pre>
          </div>
          <div v-else class="install-placeholder">安装日志将显示在此处</div>
        </div>
      </div>
      <template #footer>
        <tiny-button @click="closeInstallDialog">关闭</tiny-button>
      </template>
    </tiny-dialog-box>

    <!-- 发布服务对话框 -->
    <tiny-dialog-box v-model:visible="showPublishDialog" title="发布为 HTTP 服务" width="600px">
      <div class="publish-form">
        <div class="pub-field">
          <label>服务名称 <span style="color: #f56c6c">*</span></label>
          <tiny-input
            v-model="publishForm.serviceName"
            placeholder="服务显示名称，如「数据处理服务」"
          />
        </div>
        <div class="pub-field">
          <label>脚本文件</label>
          <span class="pub-script-name">{{ currentFile }}</span>
        </div>
        <div class="pub-field">
          <label>生效开始时间</label>
          <tiny-date-picker
            v-model="publishForm.effectiveStart"
            type="datetime"
            placeholder="可空，立即生效"
            format="yyyy-MM-dd HH:mm:ss"
            style="flex: 1"
          />
        </div>
        <div class="pub-field">
          <label>生效结束时间</label>
          <tiny-date-picker
            v-model="publishForm.effectiveEnd"
            type="datetime"
            placeholder="可空，永久有效"
            format="yyyy-MM-dd HH:mm:ss"
            style="flex: 1"
          />
        </div>
        <div class="pub-field">
          <label>API Key</label>
          <div class="pub-apikey-row">
            <tiny-input
              v-model="publishForm.apiKey"
              placeholder="点击右侧生成按钮"
              class="pub-apikey-input"
            />
            <tiny-button size="mini" type="primary" @click="generateApiKey">生成</tiny-button>
          </div>
        </div>
        <div class="pub-field pub-field-desc">
          <label>服务描述</label>
          <tiny-input
            v-model="publishForm.description"
            type="textarea"
            :rows="3"
            placeholder="可选，对服务用途的详细说明"
          />
        </div>
        <div class="pub-field">
          <label>发布为 MCP 工具</label>
          <div style="display: flex; align-items: center; gap: 8px">
            <tiny-switch v-model="publishForm.publishAsMcp" />
            <span style="color: #999; font-size: 12px"
              >开启后 AI 可通过 MCP 协议直接调用此脚本</span
            >
          </div>
        </div>
        <div v-if="publishForm.publishAsMcp" class="pub-field">
          <label>MCP 工具名 <span style="color: #f56c6c">*</span></label>
          <tiny-input
            v-model="publishForm.mcpToolName"
            placeholder="英文名，如 process_data（AI 识别调用）"
          />
          <div style="color: #999; font-size: 12px; margin-top: 4px">
            工具名建议用下划线分隔的英文，便于 AI 识别功能
          </div>
        </div>
        <!-- 发布成功提示 -->
        <div v-if="publishedApiKey" class="pub-result">
          <div class="pub-result-title">✅ 发布成功！</div>
          <div class="pub-invoke-tip">
            调用方式：<br />
            <code>POST /api/python/invoke</code><br />
            <code>Header: X-API-Key: {{ publishedApiKey }}</code
            ><br />
            <code>Body: {{ '{}' }} &nbsp;(自定义参数，脚本内用 __input__ 读取)</code>
          </div>
        </div>
      </div>
      <template #footer>
        <tiny-button @click="closePublishDialog">关闭</tiny-button>
        <tiny-button v-if="!publishedApiKey" type="primary" @click="doPublish">发布</tiny-button>
      </template>
    </tiny-dialog-box>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch, defineComponent, h } from 'vue'
import * as monaco from 'monaco-editor'
import {
  Modal,
  Button as TinyButton,
  Select as TinySelect,
  Option as TinyOption,
  Input as TinyInput,
  DialogBox as TinyDialogBox,
  DatePicker as TinyDatePicker,
  Switch as TinySwitch
} from '@opentiny/vue'
import {
  pythonKernelApi,
  pythonWorkspaceApi,
  pythonExecuteApi,
  pythonBackupApi,
  pythonServiceApi,
  createExecuteSse
} from '@/api/python'
import { AiAssistantApi, AiChatApi, AiCodeApi } from '@/api/ai'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js/lib/core'
import python from 'highlight.js/lib/languages/python'
import { getToken } from '@/utils/token'
import { useAppStore } from '@/store'

// ===================== 文件树节点组件（递归） =====================
const FileTreeNode = defineComponent({
  name: 'FileTreeNode',
  props: {
    node: { type: Object as () => any, required: true },
    // selectedPath: 当前选中项的路径（目录或文件均用此字段）
    selectedPath: { type: String, default: '' },
    depth: { type: Number, default: 0 }
  },
  emits: ['open-file', 'rename', 'delete', 'select'],
  setup(props, { emit }) {
    const expanded = ref(true)
    return () => {
      const { node, selectedPath, depth } = props
      const indent = depth * 12
      if (node.type === 'dir') {
        const isSelected = selectedPath === node.path
        return h('div', { class: 'tree-dir' }, [
          h(
            'div',
            {
              class: ['tree-dir-label', { 'tree-dir-selected': isSelected }],
              style: { paddingLeft: indent + 'px' },
              onClick: () => emit('select', { type: 'dir', path: isSelected ? '' : node.path })
            },
            [
              h(
                'span',
                {
                  class: 'tree-dir-arrow',
                  onClick: (e: Event) => {
                    e.stopPropagation()
                    expanded.value = !expanded.value
                  }
                },
                expanded.value ? '▾' : '▸'
              ),
              h('span', { class: 'tree-dir-icon' }, '📁'),
              h('span', { class: 'tree-dir-name' }, node.name),
              h('div', { class: 'dir-actions' }, [
                h(
                  'span',
                  {
                    class: 'dir-action-btn',
                    title: '重命名',
                    onClick: (e: Event) => {
                      e.stopPropagation()
                      emit('rename', node.path)
                    }
                  },
                  '✎'
                ),
                h(
                  'span',
                  {
                    class: 'dir-action-btn',
                    title: '删除',
                    onClick: (e: Event) => {
                      e.stopPropagation()
                      emit('delete', node.path)
                    }
                  },
                  '×'
                )
              ])
            ]
          ),
          expanded.value && node.children?.length
            ? h(
                'div',
                {},
                node.children.map((child: any) =>
                  h(FileTreeNode, {
                    key: child.path,
                    node: child,
                    selectedPath,
                    depth: depth + 1,
                    onOpenFile: (f: any) => emit('open-file', f),
                    onRename: (p: string) => emit('rename', p),
                    onDelete: (p: string) => emit('delete', p),
                    onSelect: (s: any) => emit('select', s)
                  })
                )
              )
            : null
        ])
      }
      // file node
      const isSelected = selectedPath === node.path
      return h(
        'div',
        {
          class: ['file-item', { active: isSelected }],
          style: { paddingLeft: indent + 4 + 'px' },
          onClick: () => emit('select', { type: 'file', path: node.path, node })
        },
        [
          h('span', { class: 'file-icon' }, '🐍'),
          h('span', { class: 'file-name' }, node.name),
          h('div', { class: 'file-actions' }, [
            h(
              'span',
              {
                class: 'file-action-btn',
                title: '重命名',
                onClick: (e: Event) => {
                  e.stopPropagation()
                  emit('rename', node.path)
                }
              },
              '✎'
            ),
            h(
              'span',
              {
                class: 'file-action-btn',
                title: '删除',
                onClick: (e: Event) => {
                  e.stopPropagation()
                  emit('delete', node.path)
                }
              },
              '×'
            )
          ])
        ]
      )
    }
  }
})

const appStore = useAppStore()

// ===================== 响应式状态 =====================
const workspaceId = ref<string>('')
const workspaceList = ref<any[]>([])
const kernelRunning = ref(false)
const executing = ref(false)
const debugging = ref(false)

const currentFile = ref('main.py')
const fileTree = ref<any[]>([]) // 树形文件列表（从后端加载）
const openTabs = ref<Array<{ name: string; modified: boolean; content?: string }>>([
  { name: 'main.py', modified: false, content: '' }
])

const packageList = ref<any[]>([])
const backupList = ref<any[]>([])
const backupRemark = ref('')
const showBackupDialog = ref(false)
const showInstallDialog = ref(false)
const showCreateWorkspaceDialog = ref(false)
const newWorkspaceName = ref('')
const newWorkspaceDesc = ref('')

// 文件重命名弹窗状态
const showRenameDialog = ref(false)
const renameOldName = ref('')
const renameNewName = ref('')
const hoveredFile = ref('')

// 新建文件/包弹窗状态
const showNewFileDialog = ref(false)
const newFileType = ref<'file' | 'package'>('file')
const newFileName = ref('')
// 统一选中项：type='dir'表示目录, type='file'表示文件, type=''表示无选中
const selectedItem = ref<{ type: string; path: string }>({ type: '', path: '' })
// 兼容旧 selectedDir：仍供 doCreateNewFile 等旧逻辑读取
const selectedDir = computed(() => {
  if (selectedItem.value.type === 'dir') return selectedItem.value.path
  if (selectedItem.value.type === 'file') {
    // 文件的父目录
    const parts = selectedItem.value.path.split('/')
    parts.pop()
    return parts.join('/')
  }
  return ''
})
// 新建弹窗中的位置描述
const createLocationLabel = computed(() => {
  if (!selectedItem.value.path) return '根目录'
  if (selectedItem.value.type === 'dir') return selectedItem.value.path + '/'
  // 文件的父目录
  const parts = selectedItem.value.path.split('/')
  parts.pop()
  return parts.length ? parts.join('/') + '/' : '根目录'
})

/** 文件树节点选中处理 */
function onTreeSelect(s: { type: string; path: string; node?: any }) {
  if (!s.path) {
    // 取消选中
    selectedItem.value = { type: '', path: '' }
    return
  }
  if (s.type === 'dir') {
    // 选中目录：高亮目录，不打开文件，不影响 currentFile
    selectedItem.value = { type: 'dir', path: s.path }
  } else {
    // 选中文件：高亮该文件，同时打开到编辑器
    selectedItem.value = { type: 'file', path: s.path }
    openFile(s.node || { path: s.path, name: s.path.split('/').pop() || s.path })
  }
}
const installPkgName = ref('')
const installOutput = ref('')
const installing = ref(false)
const installOutputRef = ref<HTMLElement | null>(null)

// ===================== PyPI 包搜索相关状态 =====================
// 镜像源列表
const MIRROR_LIST = [
  { label: 'PyPI 官方（默认）', value: 'default', url: '' },
  { label: '清华大学镜像', value: 'tsinghua', url: 'https://pypi.tuna.tsinghua.edu.cn/simple/' },
  { label: '阿里云镜像', value: 'aliyun', url: 'https://mirrors.aliyun.com/pypi/simple/' },
  { label: '豆瓣镜像', value: 'douban', url: 'https://pypi.doubanio.com/simple/' },
  { label: '中科大镜像', value: 'ustc', url: 'https://pypi.mirrors.ustc.edu.cn/simple/' },
  { label: '自定义地址', value: 'custom', url: '' }
]
const pipMirror = ref('default')
const customMirrorUrl = ref('')

// 搜索相关
const pkgSearchKeyword = ref('')
const pkgSearching = ref(false)
const pypiSearchResults = ref<Array<{ value: string; label: string; desc?: string }>>([])
let searchTimer: ReturnType<typeof setTimeout> | null = null

// 选中包相关
const selectedPkg = ref<{ value: string; label: string; desc?: string } | null>(null)
const selectedPkgInfo = ref<any>(null)
const pkgVersionList = ref<string[]>([])
const pkgVersionLoading = ref(false)
const pkgVersionError = ref('')
const pkgVersionManual = ref(false)
const selectedVersion = ref('')

// 常用包列表（类似 nuget 效果）
const COMMON_PACKAGES = [
  { label: 'numpy - 数学计算基础库', value: 'numpy' },
  { label: 'pandas - 数据分析工具库', value: 'pandas' },
  { label: 'matplotlib - 数据可视化', value: 'matplotlib' },
  { label: 'scipy - 科学计算库', value: 'scipy' },
  { label: 'scikit-learn - 机器学习库', value: 'scikit-learn' },
  { label: 'torch - PyTorch 深度学习框架', value: 'torch' },
  { label: 'tensorflow - TensorFlow 深度学习框架', value: 'tensorflow' },
  { label: 'keras - 高层神经网络 API', value: 'keras' },
  { label: 'requests - HTTP 请求库', value: 'requests' },
  { label: 'beautifulsoup4 - HTML/XML 解析', value: 'beautifulsoup4' },
  { label: 'lxml - XML/HTML 处理库', value: 'lxml' },
  { label: 'sqlalchemy - SQL ORM 工具库', value: 'sqlalchemy' },
  { label: 'pymysql - MySQL 驱动', value: 'pymysql' },
  { label: 'psycopg2-binary - PostgreSQL 驱动', value: 'psycopg2-binary' },
  { label: 'redis - Redis 客户端', value: 'redis' },
  { label: 'pymongo - MongoDB 客户端', value: 'pymongo' },
  { label: 'fastapi - 高性能 Web 框架', value: 'fastapi' },
  { label: 'flask - 轻量 Web 框架', value: 'flask' },
  { label: 'pydantic - 数据验证库', value: 'pydantic' },
  { label: 'httpx - 异步 HTTP 客户端', value: 'httpx' },
  { label: 'openpyxl - Excel 读写', value: 'openpyxl' },
  { label: 'xlrd - Excel 读取', value: 'xlrd' },
  { label: 'python-docx - Word 文档处理', value: 'python-docx' },
  { label: 'Pillow - 图像处理库', value: 'Pillow' },
  { label: 'opencv-python - 计算机视觉', value: 'opencv-python' },
  { label: 'tqdm - 进度条工具', value: 'tqdm' },
  { label: 'loguru - 日志库 logging', value: 'loguru' },
  { label: 'python-dotenv - 环境变量管理', value: 'python-dotenv' },
  { label: 'cryptography - 密码学工具包', value: 'cryptography' },
  { label: 'arrow - 日期时间处理', value: 'arrow' },
  { label: 'celery - 分布式任务队列', value: 'celery' },
  { label: 'paramiko - SSH 客户端', value: 'paramiko' },
  { label: 'pyarrow - Apache Arrow / Parquet', value: 'pyarrow' },
  { label: 'polars - 高性能 DataFrame 库', value: 'polars' },
  { label: 'dask - 并行计算库', value: 'dask' }
]

// ===================== AI 对话面板状态 =====================
hljs.registerLanguage('python', python)
const md = new MarkdownIt({
  html: false,
  linkify: true,
  highlight(str: string, lang: string) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value
      } catch {}
    }
    return ''
  }
})
const aiPanelVisible = ref(false)
const aiPanelWidth = ref(380)
const selectedAssistantId = ref('')
const aiSessionId = ref('')
const aiMessages = ref<{ role: string; content: string }[]>([])
const aiInputText = ref('')
const aiStreaming = ref(false)
const aiWriteToEditor = ref(true) // 直接写入编辑器模式（默认开启）
const codeAssistants = ref<any[]>([])
const aiCompletionEnabled = ref(false)
const aiMessagesRef = ref<HTMLElement | null>(null)
let aiAbortController: AbortController | null = null
let aiEditorInsertPos: { lineNumber: number; column: number } | null = null // 写入起始光标位置

const selectedAssistantName = computed(
  () => codeAssistants.value.find((a) => a.id === selectedAssistantId.value)?.name || ''
)

const filteredCommonPackages = computed(() => {
  const q = (pkgSearchKeyword.value || '').toLowerCase()
  const list = q
    ? COMMON_PACKAGES.filter(
        (p) => p.value.toLowerCase().includes(q) || p.label.toLowerCase().includes(q)
      )
    : [...COMMON_PACKAGES]
  return list.sort((a, b) => a.value.toLowerCase().localeCompare(b.value.toLowerCase()))
})

// 镜像源切换时重置自定义 URL
function onMirrorChange(val: string) {
  if (val !== 'custom') customMirrorUrl.value = ''
}

// 获取当前镜像 URL（用于 pip install -i 参数）
function getActiveMirrorUrl(): string {
  if (pipMirror.value === 'default') return ''
  if (pipMirror.value === 'custom') return customMirrorUrl.value.trim()
  return MIRROR_LIST.find((m) => m.value === pipMirror.value)?.url || ''
}

// PyPI 搜索（节流处理 500ms）
function onPkgSearch() {
  if (searchTimer) clearTimeout(searchTimer)
  const kw = pkgSearchKeyword.value.trim()
  if (!kw) {
    pypiSearchResults.value = []
    return
  }
  searchTimer = setTimeout(() => searchPypi(kw), 500)
}

async function searchPypi(kw: string) {
  pkgSearching.value = true
  pypiSearchResults.value = []
  try {
    if (kw.length < 2) return
    // 调后端代理接口（绕开 CORS）
    const res = await fetch(`/api/python/pypi/search?q=${encodeURIComponent(kw)}&limit=8`, {
      signal: AbortSignal.timeout(10000),
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' }
    })
    if (res.ok) {
      const data = await res.json()
      const list: Array<{ name: string; desc: string }> = data.data || []
      pypiSearchResults.value = list
        .filter(
          (item) => !COMMON_PACKAGES.some((p) => p.value.toLowerCase() === item.name.toLowerCase())
        )
        .map((item) => ({
          value: item.name,
          label: `${item.name} - ${item.desc}`,
          desc: item.desc
        }))
    }
  } catch {
    // 静默降级
  } finally {
    pkgSearching.value = false
  }
}

// 选中包，拉取版本列表
async function selectPkg(pkg: { value: string; label: string; desc?: string }) {
  selectedPkg.value = pkg
  selectedVersion.value = ''
  selectedPkgInfo.value = null
  pkgVersionList.value = []
  pkgVersionError.value = ''
  pkgVersionManual.value = false
  installOutput.value = ''

  pkgVersionLoading.value = true
  try {
    const res = await fetch(`https://pypi.org/pypi/${encodeURIComponent(pkg.value)}/json`, {
      signal: AbortSignal.timeout(8000)
    })
    if (res.ok) {
      const data = await res.json()
      selectedPkgInfo.value = data.info
      // 版本列表按发布时间排序，最新的在前
      const versions = Object.keys(data.releases || {})
        .filter((v) => {
          const files = data.releases[v]
          return files && files.length > 0 && !files.every((f: any) => f.yanked)
        })
        .reverse()
      pkgVersionList.value = versions
      if (versions.length > 0) selectedVersion.value = versions[0]
    } else {
      pkgVersionError.value = 'PyPI 查询失败，请手动输入版本'
      pkgVersionManual.value = true
    }
  } catch {
    pkgVersionError.value = 'PyPI 无法访问，已切换为手动输入模式'
    pkgVersionManual.value = true
  } finally {
    pkgVersionLoading.value = false
  }
}

// 发布服务状态
const serviceList = ref<any[]>([])
const showPublishDialog = ref(false)
const publishedApiKey = ref('')
const publishForm = ref<{
  serviceName: string
  apiKey: string
  effectiveStart: Date | null
  effectiveEnd: Date | null
  description: string
  publishAsMcp: boolean
  mcpToolName: string
}>({
  serviceName: '',
  apiKey: '',
  effectiveStart: null,
  effectiveEnd: null,
  description: '',
  publishAsMcp: false,
  mcpToolName: ''
})

function generateApiKey() {
  const arr = new Uint8Array(16)
  crypto.getRandomValues(arr)
  publishForm.value.apiKey = Array.from(arr)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

const activePanel = ref('console')
const panelTabs = [
  { key: 'console', label: '控制台' },
  { key: 'variables', label: '变量' },
  { key: 'stack', label: '堆栈' }
]

// 底部面板高度与可见性
const bottomPanelVisible = ref(true)
const bottomPanelHeight = ref(220)
let resizing = false
let resizeStartY = 0
let resizeStartH = 0

// ===================== 侧边栏拖拽 =====================
const sidebarWidth = ref(240)
const sidebarCollapsed = ref(false)
let sidebarResizing = false
let sidebarResizeStartX = 0
let sidebarResizeStartW = 0

function startSidebarResize(e: MouseEvent) {
  sidebarResizing = true
  sidebarResizeStartX = e.clientX
  sidebarResizeStartW = sidebarWidth.value
  document.addEventListener('mousemove', onSidebarResizeMove)
  document.addEventListener('mouseup', stopSidebarResize)
  e.preventDefault()
}
function onSidebarResizeMove(e: MouseEvent) {
  if (!sidebarResizing) return
  const delta = e.clientX - sidebarResizeStartX
  sidebarWidth.value = Math.min(480, Math.max(160, sidebarResizeStartW + delta))
  nextTick(() => editor?.layout())
}
function stopSidebarResize() {
  sidebarResizing = false
  document.removeEventListener('mousemove', onSidebarResizeMove)
  document.removeEventListener('mouseup', stopSidebarResize)
}

function startResize(e: MouseEvent) {
  resizing = true
  resizeStartY = e.clientY
  resizeStartH = bottomPanelHeight.value
  document.addEventListener('mousemove', onResizeMove)
  document.addEventListener('mouseup', stopResize)
}
function onResizeMove(e: MouseEvent) {
  if (!resizing) return
  const delta = resizeStartY - e.clientY
  const newH = Math.min(600, Math.max(80, resizeStartH + delta))
  bottomPanelHeight.value = newH
}
function stopResize() {
  resizing = false
  document.removeEventListener('mousemove', onResizeMove)
  document.removeEventListener('mouseup', stopResize)
}

function switchPanel(key: string) {
  if (activePanel.value === key && bottomPanelVisible.value) {
    bottomPanelVisible.value = false
  } else {
    activePanel.value = key
    bottomPanelVisible.value = true
  }
  nextTick(() => editor?.layout())
}
function showPanel(key: string) {
  activePanel.value = key
  bottomPanelVisible.value = true
  nextTick(() => editor?.layout())
}

// 变量展示：调试时用 debugVariables，普通执行用 variables，过滤 module 类型
const SKIP_VAR_NAMES = new Set([
  'special variables',
  'function variables',
  'class variables',
  'protected variables',
  'ipython variables'
])
const displayVariables = computed(() => {
  const base = debugVariables.value.length ? debugVariables.value : variables.value
  return base.filter((v: any) => !SKIP_VAR_NAMES.has(v.name) && v.type !== 'module')
})

/** 展开/折叠对象变量子属性 */
async function toggleExpand(v: any) {
  if (!v._expanded) {
    v._expanded = true
    if (!v._children && v.variablesReference > 0) {
      try {
        const res: any = await pythonExecuteApi.getVariables(
          workspaceId.value,
          v.variablesReference
        )
        const scopes = res?.data?.scopes || []
        const children = scopes.flatMap((s: any) => s.variables || [])
        v._children = children.filter((c: any) => !SKIP_VAR_NAMES.has(c.name))
      } catch {
        v._children = []
      }
    }
  } else {
    v._expanded = false
  }
}
const outputLines = ref<{ text: string; type: string }[]>([])
const variables = ref<any[]>([])
const debugVariables = ref<any[]>([])
const stackFrames = ref<any[]>([])
const debugStateReceived = ref(false) // 是否已收到 debug_state（断点命中后推送）
const sidebarHidden = ref(false)
const isLight = ref(true)

function toggleSidebar() {
  sidebarHidden.value = !sidebarHidden.value
  // 全屏时同时隐藏全局导航菜单和顶部标题栏
  appStore.updateSettings({ menu: !sidebarHidden.value, navbar: !sidebarHidden.value })
  setTimeout(() => editor?.layout(), 300)
}

function toggleTheme() {
  isLight.value = !isLight.value
  monaco.editor.setTheme(isLight.value ? 'vs' : 'vs-dark')
}

// Monaco Editor
const editorContainer = ref<HTMLElement | null>(null)
const outputContainer = ref<HTMLElement | null>(null)
let editor: monaco.editor.IStandaloneCodeEditor | null = null
let cancelExecute: (() => void) | null = null
let debugEventSource: EventSource | null = null
let cancelDebugSse: (() => void) | null = null // 操控调试 SSE fetch 取消
let execDoneTimer: ReturnType<typeof setTimeout> | null = null // execution_done 兄底定时器
let isStepping = false // 是否处于单步执行中（单步期间 execution_done 不触发兜底结束）
let atBreakpoint = false // 是否处于断点暂停状态（断点期间 execution_done 永远不结束调试）
// Monaco 补全提供器只能注册一次（Monaco 是全局单例，不会自动清除）
let completionProviderRegistered = false

// ===================== 轻量 LSP 客户端 =====================
/**
 * LspClient：通过原生 WebSocket 连接后端 /ws/python/lsp/{workspaceId}，
 * 后端负责桥接到 pylsp TCP 进程。实现 LSP JSON-RPC 核心协议。
 */
class LspClient {
  private ws: WebSocket | null = null
  private reqId = 1
  private pendingMap = new Map<number, { resolve: (v: any) => void; reject: (e: any) => void }>()
  private workspaceId: string
  private initialized = false
  private initPromise: Promise<void> | null = null
  private openedUris = new Set<string>()
  private changeVersion = new Map<string, number>()
  private disposed = false

  constructor(wsId: string) {
    this.workspaceId = wsId
    this.initPromise = this._connect()
  }

  private _connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.disposed) {
        reject(new Error('disposed'))
        return
      }
      // 开发模式走 Vite 代理（相对路径），生产模式才直连 VITE_API_URL
      let url: string
      if (import.meta.env.DEV) {
        const proto = location.protocol === 'https:' ? 'wss:' : 'ws:'
        url = `${proto}//${location.host}/lsp/${this.workspaceId}`
      } else {
        const apiUrl = import.meta.env.VITE_API_URL || ''
        const wsBase = apiUrl.replace(/^http/, 'ws')
        url = `${wsBase}/lsp/${this.workspaceId}`
      }
      console.log('lsp url:' + url)
      this.ws = new WebSocket(url)
      this.ws.onopen = async () => {
        try {
          await this._initialize()
          this.initialized = true
          resolve()
        } catch (e) {
          reject(e)
        }
      }
      this.ws.onerror = (e) => {
        if (!this.initialized) reject(new Error('LSP WebSocket error'))
        console.log(e)
      }
      this.ws.onclose = () => {
        // 关闭时 reject 所有 pending 请求
        this.pendingMap.forEach(({ reject: r }) => r(new Error('LSP connection closed')))
        this.pendingMap.clear()
      }
      this.ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data)
          if (msg.id != null && this.pendingMap.has(msg.id)) {
            const { resolve: r, reject: rj } = this.pendingMap.get(msg.id)!
            this.pendingMap.delete(msg.id)
            if (msg.error) rj(msg.error)
            else r(msg.result)
          }
          // 通知（无 id）忽略，补全只用 request/response 模式
        } catch {
          // ignore parse error
        }
      }
    })
  }

  private _send(method: string, params: any, expectResponse = true): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        reject(new Error('LSP not connected'))
        return
      }
      const id = this.reqId++
      const msg: any = { jsonrpc: '2.0', id, method, params }
      if (!expectResponse) {
        // notification（无 id）
        delete msg.id
        this.ws.send(JSON.stringify(msg))
        resolve(undefined)
        return
      }
      this.pendingMap.set(id, { resolve, reject })
      this.ws.send(JSON.stringify(msg))
    })
  }

  private _notify(method: string, params: any): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return
    this.ws.send(JSON.stringify({ jsonrpc: '2.0', method, params }))
  }

  private async _initialize(): Promise<void> {
    await this._send('initialize', {
      processId: null,
      clientInfo: { name: 'bigprime-python-ide', version: '1.0' },
      rootUri: `file:///workspace/${this.workspaceId}`,
      capabilities: {
        textDocument: {
          completion: {
            completionItem: { snippetSupport: false }
          }
        }
      }
    })
    this._notify('initialized', {})
  }

  /** 打开文件（首次打开时通知 LSP） */
  didOpen(uri: string, text: string, languageId = 'python'): void {
    if (this.openedUris.has(uri)) return
    this.openedUris.add(uri)
    this.changeVersion.set(uri, 1)
    this._notify('textDocument/didOpen', {
      textDocument: { uri, languageId, version: 1, text }
    })
  }

  /** 内容变更通知 */
  didChange(uri: string, text: string): void {
    const version = (this.changeVersion.get(uri) || 1) + 1
    this.changeVersion.set(uri, version)
    this._notify('textDocument/didChange', {
      textDocument: { uri, version },
      contentChanges: [{ text }]
    })
  }

  /** 请求补全 */
  async completion(uri: string, line: number, character: number, timeoutMs = 4000): Promise<any[]> {
    if (!this.initialized) {
      await Promise.race([
        this.initPromise,
        new Promise((_, r) => setTimeout(() => r(new Error('LSP init timeout')), 5000))
      ])
    }
    const result = await Promise.race([
      this._send('textDocument/completion', {
        textDocument: { uri },
        position: { line, character }
      }),
      new Promise((_, r) => setTimeout(() => r(new Error('LSP completion timeout')), timeoutMs))
    ])
    if (!result) return []
    const items: any[] = Array.isArray(result) ? result : result.items || []
    return items
  }

  dispose(): void {
    this.disposed = true
    this.initialized = false
    this.pendingMap.forEach(({ reject: r }) => r(new Error('disposed')))
    this.pendingMap.clear()
    this.openedUris.clear()
    this.changeVersion.clear()
    this.ws?.close()
    this.ws = null
  }
}

/** 当前 LSP 客户端实例（workspace 切换时重建） */
let lspClient: LspClient | null = null

/** 将文件相对路径转为 LSP file URI */
function toFileUri(workspaceId: string, filePath: string): string {
  return `file:///workspace/${workspaceId}/${filePath}`
}

// ===================== 断点管理 =====================
// 以行号 Set 维护断点，避免依赖 decoration 查询
const breakpointLines = ref<Set<number>>(new Set())
// 断点 decoration IDs（Monaco 用于更新/删除 decoration）
let breakpointDecorationIds: string[] = []
// 调试当前暂停行 decoration
let debugLineDecorationIds: string[] = []

/** 同步断点 decoration 到编辑器（红点图标） */
function syncBreakpointDecorations() {
  if (!editor) return
  const newDecorations: monaco.editor.IModelDecoration[] = [...breakpointLines.value].map(
    (line) => ({
      id: '',
      ownerId: 0,
      range: new monaco.Range(line, 1, line, 1),
      options: {
        glyphMarginClassName: 'breakpoint-glyph',
        glyphMarginHoverMessage: { value: `断点 (第 ${line} 行)` },
        stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
      }
    })
  )
  breakpointDecorationIds = editor.deltaDecorations(
    breakpointDecorationIds,
    newDecorations.map((d) => ({ range: d.range, options: d.options }))
  )
}

/** 高亮当前调试暂停行（黄色背景） */
function highlightDebugLine(lineNumber: number | null) {
  if (!editor) return
  if (lineNumber == null) {
    debugLineDecorationIds = editor.deltaDecorations(debugLineDecorationIds, [])
    return
  }
  debugLineDecorationIds = editor.deltaDecorations(debugLineDecorationIds, [
    {
      range: new monaco.Range(lineNumber, 1, lineNumber, 1),
      options: {
        isWholeLine: true,
        className: 'debug-current-line',
        glyphMarginClassName: 'debug-current-glyph',
        stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
      }
    }
  ])
  // 滚动到该行
  editor.revealLineInCenter(lineNumber)
}

// ===================== Python 静态补全字典 =====================
const PYTHON_STATIC_COMPLETIONS: Record<string, string[]> = {
  os: [
    'getcwd',
    'listdir',
    'path',
    'sep',
    'linesep',
    'environ',
    'getenv',
    'putenv',
    'makedirs',
    'mkdir',
    'remove',
    'rmdir',
    'rename',
    'walk',
    'scandir',
    'stat',
    'chmod',
    'getpid',
    'getppid',
    'system',
    'popen',
    'cpu_count'
  ],
  'os.path': [
    'join',
    'exists',
    'isfile',
    'isdir',
    'abspath',
    'dirname',
    'basename',
    'split',
    'splitext',
    'expanduser',
    'expandvars',
    'realpath',
    'relpath',
    'getsize'
  ],
  sys: [
    'argv',
    'path',
    'modules',
    'version',
    'platform',
    'stdin',
    'stdout',
    'stderr',
    'exit',
    'exc_info',
    'getdefaultencoding',
    'getfilesystemencoding',
    'maxsize'
  ],
  json: ['dumps', 'loads', 'dump', 'load', 'JSONDecodeError', 'JSONEncoder', 'JSONDecoder'],
  re: [
    'match',
    'search',
    'findall',
    'finditer',
    'sub',
    'split',
    'compile',
    'escape',
    'fullmatch',
    'IGNORECASE',
    'MULTILINE',
    'DOTALL'
  ],
  math: [
    'pi',
    'e',
    'inf',
    'sqrt',
    'floor',
    'ceil',
    'fabs',
    'log',
    'log2',
    'log10',
    'pow',
    'sin',
    'cos',
    'tan',
    'asin',
    'acos',
    'atan',
    'atan2',
    'degrees',
    'radians',
    'factorial',
    'gcd'
  ],
  datetime: [
    'datetime',
    'date',
    'time',
    'timedelta',
    'timezone',
    'now',
    'today',
    'strptime',
    'strftime'
  ],
  collections: ['defaultdict', 'OrderedDict', 'Counter', 'deque', 'namedtuple', 'ChainMap'],
  itertools: [
    'chain',
    'product',
    'permutations',
    'combinations',
    'groupby',
    'islice',
    'count',
    'cycle',
    'repeat'
  ],
  functools: ['reduce', 'partial', 'lru_cache', 'wraps', 'cmp_to_key', 'total_ordering'],
  pathlib: ['Path', 'PurePath', 'PosixPath', 'WindowsPath'],
  typing: [
    'List',
    'Dict',
    'Tuple',
    'Set',
    'Optional',
    'Union',
    'Any',
    'Callable',
    'Generator',
    'Iterator',
    'Type'
  ],
  string: [
    'ascii_letters',
    'ascii_lowercase',
    'ascii_uppercase',
    'digits',
    'hexdigits',
    'punctuation',
    'whitespace',
    'Formatter',
    'Template'
  ],
  random: [
    'random',
    'randint',
    'choice',
    'choices',
    'shuffle',
    'sample',
    'seed',
    'uniform',
    'gauss'
  ],
  time: [
    'time',
    'sleep',
    'localtime',
    'gmtime',
    'mktime',
    'strftime',
    'strptime',
    'monotonic',
    'perf_counter'
  ],
  io: ['StringIO', 'BytesIO', 'FileIO', 'BufferedReader', 'BufferedWriter', 'TextIOWrapper'],
  hashlib: ['md5', 'sha1', 'sha256', 'sha512', 'blake2b', 'blake2s', 'new'],
  base64: [
    'b64encode',
    'b64decode',
    'urlsafe_b64encode',
    'urlsafe_b64decode',
    'b32encode',
    'b32decode'
  ],
  urllib: ['request', 'parse', 'error', 'response'],
  http: ['client', 'server', 'cookies', 'cookiejar'],
  threading: [
    'Thread',
    'Lock',
    'RLock',
    'Event',
    'Condition',
    'Semaphore',
    'Timer',
    'current_thread',
    'main_thread'
  ],
  subprocess: [
    'run',
    'call',
    'check_output',
    'Popen',
    'PIPE',
    'STDOUT',
    'DEVNULL',
    'CalledProcessError'
  ],
  shutil: [
    'copy',
    'copy2',
    'copytree',
    'rmtree',
    'move',
    'make_archive',
    'unpack_archive',
    'disk_usage'
  ],
  glob: ['glob', 'iglob', 'escape'],
  csv: ['reader', 'writer', 'DictReader', 'DictWriter', 'QUOTE_ALL', 'QUOTE_MINIMAL'],
  logging: [
    'debug',
    'info',
    'warning',
    'error',
    'critical',
    'exception',
    'getLogger',
    'basicConfig',
    'FileHandler',
    'StreamHandler',
    'Formatter'
  ],
  abc: ['ABC', 'ABCMeta', 'abstractmethod', 'abstractproperty'],
  copy: ['copy', 'deepcopy'],
  pprint: ['pprint', 'pformat'],
  traceback: ['print_exc', 'format_exc', 'extract_tb', 'format_tb'],

  // ---- 常用第三方库 ----
  // numpy
  np: [
    'array',
    'zeros',
    'ones',
    'empty',
    'full',
    'eye',
    'linspace',
    'arange',
    'reshape',
    'shape',
    'dtype',
    'ndarray',
    'concatenate',
    'stack',
    'vstack',
    'hstack',
    'split',
    'where',
    'argmax',
    'argmin',
    'max',
    'min',
    'sum',
    'mean',
    'median',
    'std',
    'var',
    'dot',
    'matmul',
    'transpose',
    'flatten',
    'random',
    'linalg',
    'fft',
    'nan',
    'inf',
    'pi',
    'e',
    'load',
    'save',
    'loadtxt',
    'savetxt'
  ],
  numpy: [
    'array',
    'zeros',
    'ones',
    'empty',
    'full',
    'eye',
    'linspace',
    'arange',
    'reshape',
    'shape',
    'dtype',
    'ndarray',
    'concatenate',
    'stack',
    'vstack',
    'hstack',
    'split',
    'where',
    'argmax',
    'argmin',
    'max',
    'min',
    'sum',
    'mean',
    'median',
    'std',
    'var',
    'dot',
    'matmul',
    'transpose',
    'flatten',
    'random',
    'linalg',
    'fft',
    'nan',
    'inf',
    'pi',
    'e',
    'load',
    'save',
    'loadtxt',
    'savetxt'
  ],
  // pandas
  pd: [
    'DataFrame',
    'Series',
    'Index',
    'read_csv',
    'read_excel',
    'read_json',
    'read_sql',
    'read_parquet',
    'to_csv',
    'to_excel',
    'to_json',
    'to_sql',
    'concat',
    'merge',
    'join',
    'groupby',
    'pivot_table',
    'crosstab',
    'cut',
    'qcut',
    'get_dummies',
    'isna',
    'notna',
    'fillna',
    'dropna',
    'isnull',
    'notnull',
    'date_range',
    'Timestamp',
    'Timedelta',
    'NaT',
    'NA',
    'options',
    'set_option'
  ],
  pandas: [
    'DataFrame',
    'Series',
    'Index',
    'read_csv',
    'read_excel',
    'read_json',
    'read_sql',
    'read_parquet',
    'to_csv',
    'to_excel',
    'to_json',
    'to_sql',
    'concat',
    'merge',
    'join',
    'groupby',
    'pivot_table',
    'crosstab',
    'cut',
    'qcut',
    'get_dummies',
    'isna',
    'notna',
    'fillna',
    'dropna',
    'isnull',
    'notnull',
    'date_range',
    'Timestamp',
    'Timedelta',
    'NaT',
    'NA',
    'options',
    'set_option'
  ],
  // requests
  requests: [
    'get',
    'post',
    'put',
    'delete',
    'patch',
    'head',
    'options',
    'request',
    'session',
    'Session',
    'Response',
    'Request',
    'PreparedRequest',
    'HTTPError',
    'ConnectionError',
    'Timeout',
    'exceptions',
    'adapters',
    'auth',
    'codes',
    'status_codes'
  ],
  // flask
  flask: [
    'Flask',
    'request',
    'Response',
    'render_template',
    'redirect',
    'url_for',
    'jsonify',
    'abort',
    'Blueprint',
    'session',
    'g',
    'current_app',
    'flash'
  ],
  // fastapi
  fastapi: [
    'FastAPI',
    'APIRouter',
    'Request',
    'Response',
    'Depends',
    'HTTPException',
    'status',
    'Body',
    'Query',
    'Path',
    'Header',
    'Cookie',
    'Form',
    'File',
    'UploadFile',
    'BackgroundTasks'
  ],
  // sqlalchemy
  sqlalchemy: [
    'create_engine',
    'Column',
    'Integer',
    'String',
    'Float',
    'Boolean',
    'DateTime',
    'Text',
    'ForeignKey',
    'relationship',
    'Table',
    'MetaData',
    'declarative_base',
    'sessionmaker',
    'Session'
  ],
  // django
  django: [
    'models',
    'views',
    'urls',
    'forms',
    'admin',
    'db',
    'http',
    'shortcuts',
    'template',
    'conf',
    'utils',
    'test'
  ],
  // matplotlib
  plt: [
    'plot',
    'show',
    'figure',
    'subplot',
    'subplots',
    'title',
    'xlabel',
    'ylabel',
    'legend',
    'grid',
    'savefig',
    'scatter',
    'bar',
    'hist',
    'pie',
    'imshow',
    'colorbar',
    'tight_layout',
    'xlim',
    'ylim',
    'xticks',
    'yticks',
    'text',
    'annotate',
    'axhline',
    'axvline',
    'fill_between'
  ],
  matplotlib: [
    'pyplot',
    'figure',
    'axes',
    'artist',
    'cm',
    'colors',
    'patches',
    'lines',
    'ticker',
    'gridspec'
  ],
  // scikit-learn
  sklearn: [
    'datasets',
    'model_selection',
    'preprocessing',
    'linear_model',
    'tree',
    'ensemble',
    'svm',
    'neighbors',
    'naive_bayes',
    'neural_network',
    'metrics',
    'pipeline',
    'decomposition',
    'cluster'
  ],
  // scipy
  scipy: [
    'stats',
    'optimize',
    'integrate',
    'interpolate',
    'signal',
    'linalg',
    'sparse',
    'spatial',
    'special',
    'fft',
    'io'
  ],
  // torch / PyTorch
  torch: [
    'Tensor',
    'tensor',
    'zeros',
    'ones',
    'eye',
    'rand',
    'randn',
    'arange',
    'linspace',
    'cat',
    'stack',
    'nn',
    'optim',
    'utils',
    'cuda',
    'device',
    'save',
    'load',
    'no_grad',
    'autograd',
    'FloatTensor',
    'LongTensor',
    'BoolTensor',
    'from_numpy',
    'is_available'
  ],
  // tensorflow / keras
  tf: [
    'constant',
    'Variable',
    'function',
    'GradientTape',
    'keras',
    'data',
    'math',
    'linalg',
    'nn',
    'losses',
    'metrics',
    'optimizers',
    'train',
    'io',
    'image',
    'random',
    'config'
  ],
  keras: [
    'Sequential',
    'Model',
    'Input',
    'Dense',
    'Conv2D',
    'LSTM',
    'GRU',
    'Dropout',
    'BatchNormalization',
    'Flatten',
    'Embedding',
    'compile',
    'fit',
    'evaluate',
    'predict',
    'layers',
    'callbacks',
    'optimizers',
    'losses',
    'metrics'
  ],
  // aiohttp
  aiohttp: ['ClientSession', 'web', 'TCPConnector', 'ClientTimeout', 'ClientError'],
  // pydantic
  pydantic: ['BaseModel', 'Field', 'validator', 'root_validator', 'ValidationError', 'ConfigDict'],
  // yaml
  yaml: ['dump', 'load', 'safe_dump', 'safe_load', 'full_load', 'Dumper', 'Loader', 'YAMLError'],
  // boto3 (AWS)
  boto3: ['client', 'resource', 'session', 'Session', 'exceptions'],
  // celery
  celery: ['Celery', 'Task', 'shared_task', 'chain', 'group', 'chord', 'signature'],
  // redis
  redis: ['Redis', 'StrictRedis', 'ConnectionPool', 'from_url', 'exceptions'],
  // pymongo
  pymongo: ['MongoClient', 'collection', 'database', 'cursor', 'errors', 'ASCENDING', 'DESCENDING'],
  // PIL / Pillow
  PIL: ['Image', 'ImageDraw', 'ImageFont', 'ImageFilter', 'ImageEnhance', 'ImageOps'],
  Image: [
    'open',
    'new',
    'fromarray',
    'save',
    'resize',
    'crop',
    'rotate',
    'convert',
    'show',
    'thumbnail'
  ],
  // cv2 / OpenCV
  cv2: [
    'imread',
    'imwrite',
    'imshow',
    'waitKey',
    'destroyAllWindows',
    'VideoCapture',
    'resize',
    'cvtColor',
    'GaussianBlur',
    'Canny',
    'findContours',
    'drawContours',
    'rectangle',
    'circle',
    'putText',
    'threshold',
    'COLOR_BGR2GRAY',
    'COLOR_BGR2RGB',
    'INTER_LINEAR',
    'INTER_NEAREST'
  ],
  // selenium
  selenium: [
    'webdriver',
    'WebDriver',
    'By',
    'Keys',
    'ActionChains',
    'Select',
    'WebDriverWait',
    'expected_conditions'
  ],
  // bs4 / beautifulsoup
  bs4: ['BeautifulSoup', 'Tag', 'NavigableString', 'ResultSet'],
  // lxml
  lxml: ['etree', 'html', 'objectify'],
  // paramiko
  paramiko: ['SSHClient', 'SFTPClient', 'AutoAddPolicy', 'RSAKey', 'Transport'],
  // arrow
  arrow: ['now', 'utcnow', 'get', 'Arrow', 'shift', 'format', 'humanize']
}

// Python 内置关键字与函数
const PYTHON_KEYWORDS = [
  'False',
  'None',
  'True',
  'and',
  'as',
  'assert',
  'async',
  'await',
  'break',
  'class',
  'continue',
  'def',
  'del',
  'elif',
  'else',
  'except',
  'finally',
  'for',
  'from',
  'global',
  'if',
  'import',
  'in',
  'is',
  'lambda',
  'nonlocal',
  'not',
  'or',
  'pass',
  'raise',
  'return',
  'try',
  'while',
  'with',
  'yield'
]
const PYTHON_BUILTINS = [
  'abs',
  'all',
  'any',
  'ascii',
  'bin',
  'bool',
  'breakpoint',
  'bytearray',
  'bytes',
  'callable',
  'chr',
  'classmethod',
  'compile',
  'complex',
  'delattr',
  'dict',
  'dir',
  'divmod',
  'enumerate',
  'eval',
  'exec',
  'filter',
  'float',
  'format',
  'frozenset',
  'getattr',
  'globals',
  'hasattr',
  'hash',
  'help',
  'hex',
  'id',
  'input',
  'int',
  'isinstance',
  'issubclass',
  'iter',
  'len',
  'list',
  'locals',
  'map',
  'max',
  'memoryview',
  'min',
  'next',
  'object',
  'oct',
  'open',
  'ord',
  'pow',
  'print',
  'property',
  'range',
  'repr',
  'reversed',
  'round',
  'set',
  'setattr',
  'slice',
  'sorted',
  'staticmethod',
  'str',
  'sum',
  'super',
  'tuple',
  'type',
  'vars',
  'zip',
  '__import__'
]

/**
 * 从当前文件代码中扫描用户自定义的 class、def、变量名
 */
function getUserDefinedSymbols(
  model: monaco.editor.ITextModel,
  replaceRange: monaco.Range
): monaco.languages.CompletionItem[] {
  const code = model.getValue()
  const symbols: monaco.languages.CompletionItem[] = []
  const seen = new Set<string>()

  // 匹配 class Foo / def bar / 变量赋值 foo =
  const patterns: Array<{ re: RegExp; kind: monaco.languages.CompletionItemKind }> = [
    { re: /^\s*class\s+([A-Za-z_]\w*)/gm, kind: monaco.languages.CompletionItemKind.Class },
    { re: /^\s*def\s+([A-Za-z_]\w*)/gm, kind: monaco.languages.CompletionItemKind.Function },
    { re: /^\s*([A-Za-z_]\w*)\s*(?:=|:=)/gm, kind: monaco.languages.CompletionItemKind.Variable }
  ]

  for (const { re, kind } of patterns) {
    let m
    re.lastIndex = 0
    while ((m = re.exec(code)) !== null) {
      const name = m[1]
      if (!seen.has(name) && !PYTHON_KEYWORDS.includes(name) && !PYTHON_BUILTINS.includes(name)) {
        seen.add(name)
        symbols.push({ label: name, kind, insertText: name, range: replaceRange })
      }
    }
  }
  return symbols
}

/**
 * 静态兜底补全：根据光标前的词和点前的模块名，从字典里查成员
 */
function getStaticSuggestions(
  model: monaco.editor.ITextModel,
  position: monaco.Position,
  replaceRange: monaco.Range
): monaco.languages.CompletionItem[] {
  const lineText = model.getLineContent(position.lineNumber)
  const textBeforeCursor = lineText.substring(0, position.column - 1)

  // 判断是否是 xxx. 触发
  const dotMatch = textBeforeCursor.match(/([\w.]+)\.\w*$/)
  if (dotMatch) {
    const moduleName = dotMatch[1]
    const members = PYTHON_STATIC_COMPLETIONS[moduleName] || []
    return members.map((m) => ({
      label: m,
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: m,
      range: replaceRange,
      detail: `${moduleName}.${m}`
    }))
  }

  // 否则返回关键字 + 内置函数 + 常用模块名 + 用户自定义符号
  const word = model.getWordUntilPosition(position).word.toLowerCase()
  const userSymbols = getUserDefinedSymbols(model, replaceRange)
  const allStatic = [
    ...PYTHON_KEYWORDS.map((k) => ({
      label: k,
      kind: monaco.languages.CompletionItemKind.Keyword,
      insertText: k,
      range: replaceRange
    })),
    ...PYTHON_BUILTINS.map((b) => ({
      label: b,
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: b,
      range: replaceRange
    })),
    ...Object.keys(PYTHON_STATIC_COMPLETIONS).map((mod) => ({
      label: mod,
      kind: monaco.languages.CompletionItemKind.Module,
      insertText: mod,
      range: replaceRange
    })),
    ...userSymbols
  ]
  return word
    ? allStatic.filter((s) => (s.label as string).toLowerCase().startsWith(word))
    : allStatic
}

// ===================== Monaco Editor 初始化 =====================
// ===================== 调试快捷键（仅调试中拦截，防止浏览器默认行为） =====================
function onDebugKeydown(e: KeyboardEvent) {
  if (!debugging.value) return
  if (e.key === 'F5') {
    e.preventDefault()
    e.stopPropagation()
    debugContinue()
  } else if (e.key === 'F10') {
    e.preventDefault()
    e.stopPropagation()
    debugStepOver()
  } else if (e.key === 'F11') {
    e.preventDefault()
    e.stopPropagation()
    debugStepIn()
  } else if (e.key === 'F12') {
    e.preventDefault()
    e.stopPropagation()
    debugStepOut()
  }
}

onMounted(async () => {
  await nextTick()
  if (editorContainer.value) {
    editor = monaco.editor.create(editorContainer.value, {
      value: '# 在此编写 Python 代码\nprint("Hello, World!")\n',
      language: 'python',
      theme: 'vs',
      fontSize: 14,
      minimap: { enabled: false },
      automaticLayout: true,
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      glyphMargin: true, // 启用 gutter 图标区，断点红点需要
      inlineSuggest: { enabled: true } // AI inline 补全 ghost text
    })

    // 点击 gutter 区匹配点击：添加/取消断点
    editor.onMouseDown((e) => {
      if (
        e.target.type === monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN ||
        e.target.type === monaco.editor.MouseTargetType.GUTTER_LINE_NUMBERS
      ) {
        const line = e.target.position?.lineNumber
        if (!line) return
        const newSet = new Set(breakpointLines.value)
        if (newSet.has(line)) {
          newSet.delete(line)
        } else {
          newSet.add(line)
        }
        breakpointLines.value = newSet
        syncBreakpointDecorations()
        // 断点行只缓存在本地，debugCell 执行前由后端统一通过 setBreakpoints API 同步
        // 不在此处调用后端 API，避免在 attach 之前错误地向 debugpy 发送 setBreakpoints 命令
      }
    })

    // 注册代码补全提供器：全局单例防重复注册
    if (!completionProviderRegistered) {
      completionProviderRegistered = true
      monaco.languages.registerCompletionItemProvider('python', {
        triggerCharacters: ['.', '(', ' '],
        provideCompletionItems: async (model, position) => {
          const word = model.getWordUntilPosition(position)
          const replaceRange = new monaco.Range(
            position.lineNumber,
            word.startColumn,
            position.lineNumber,
            word.endColumn
          )

          // ① 优先：LSP 补全（pylsp，支持跨文件、第三方库）
          if (lspClient && workspaceId.value && currentFile.value) {
            try {
              const uri = toFileUri(workspaceId.value, currentFile.value)
              // LSP position 从 0 开始
              const lspLine = position.lineNumber - 1
              const lspChar = position.column - 1
              const lspItems = await lspClient.completion(uri, lspLine, lspChar)
              if (lspItems && lspItems.length > 0) {
                const suggestions = lspItems.map((item: any) => {
                  // LSP CompletionItemKind → Monaco CompletionItemKind（值相同，LSP 从1开始）
                  const kindMap: Record<number, monaco.languages.CompletionItemKind> = {
                    1: monaco.languages.CompletionItemKind.Text,
                    2: monaco.languages.CompletionItemKind.Method,
                    3: monaco.languages.CompletionItemKind.Function,
                    4: monaco.languages.CompletionItemKind.Constructor,
                    5: monaco.languages.CompletionItemKind.Field,
                    6: monaco.languages.CompletionItemKind.Variable,
                    7: monaco.languages.CompletionItemKind.Class,
                    8: monaco.languages.CompletionItemKind.Interface,
                    9: monaco.languages.CompletionItemKind.Module,
                    10: monaco.languages.CompletionItemKind.Property,
                    11: monaco.languages.CompletionItemKind.Unit,
                    12: monaco.languages.CompletionItemKind.Value,
                    13: monaco.languages.CompletionItemKind.Enum,
                    14: monaco.languages.CompletionItemKind.Keyword,
                    15: monaco.languages.CompletionItemKind.Snippet,
                    16: monaco.languages.CompletionItemKind.Color,
                    17: monaco.languages.CompletionItemKind.File,
                    18: monaco.languages.CompletionItemKind.Reference,
                    19: monaco.languages.CompletionItemKind.Folder,
                    20: monaco.languages.CompletionItemKind.EnumMember,
                    21: monaco.languages.CompletionItemKind.Constant,
                    22: monaco.languages.CompletionItemKind.Struct,
                    23: monaco.languages.CompletionItemKind.Event,
                    24: monaco.languages.CompletionItemKind.Operator,
                    25: monaco.languages.CompletionItemKind.TypeParameter
                  }
                  const label: string =
                    typeof item.label === 'string' ? item.label : (item.label?.label ?? '')
                  // LSP textEdit 优先，否则 insertText，否则 label
                  let insertText = label
                  let itemRange = replaceRange
                  if (item.textEdit) {
                    insertText = item.textEdit.newText ?? label
                    const r = item.textEdit.range
                    if (r) {
                      itemRange = new monaco.Range(
                        r.start.line + 1,
                        r.start.character + 1,
                        r.end.line + 1,
                        r.end.character + 1
                      )
                    }
                  } else if (item.insertText) {
                    insertText = item.insertText
                  }
                  return {
                    label,
                    kind: kindMap[item.kind] ?? monaco.languages.CompletionItemKind.Text,
                    insertText,
                    range: itemRange,
                    detail: item.detail || '',
                    documentation: item.documentation
                      ? typeof item.documentation === 'string'
                        ? item.documentation
                        : item.documentation.value
                      : '',
                    sortText: '0' + label,
                    filterText: label
                  }
                })
                return { suggestions }
              }
            } catch {
              // LSP 不可用，降级静态补全
            }
          }

          // ② 降级：静态补全（关键字 + 内置 + 常见模块 + 用户自定义）
          const staticItems = getStaticSuggestions(model, position, replaceRange)
          return { suggestions: staticItems }
        }
      })
    }

    // 监听内容变更，标记未保存，缓存内容到 tab，并通知 LSP
    editor.onDidChangeModelContent(() => {
      const tab = openTabs.value.find((t) => t.name === currentFile.value)
      if (tab) {
        tab.modified = true
        tab.content = editor?.getValue() || ''
      }
      // 通知 LSP 内容变更（防抖：不需要逐字符发送也可，这里直接发送）
      if (lspClient && workspaceId.value && currentFile.value) {
        const uri = toFileUri(workspaceId.value, currentFile.value)
        lspClient.didChange(uri, editor?.getValue() || '')
      }
    })
  }

  // 加载 workspace 列表（通过现有的 workspace API）
  await loadWorkspaceList()
  // 注册调试快捷键（capture 阶段优先于浏览器默认行为）
  window.addEventListener('keydown', onDebugKeydown, { capture: true })
})

onBeforeUnmount(() => {
  editor?.dispose()
  cancelExecute?.()
  cancelDebugSse?.()
  stopResize()
  lspClient?.dispose()
  lspClient = null
  window.removeEventListener('keydown', onDebugKeydown, { capture: true })
})

// ===================== Workspace =====================
async function loadWorkspaceList() {
  try {
    const res: any = await pythonWorkspaceApi.listAll()
    workspaceList.value = res?.data || []
  } catch {
    workspaceList.value = []
  }
}

async function doCreateWorkspace() {
  if (!newWorkspaceName.value.trim()) {
    Modal.message({ message: 'Workspace 名称不能为空', status: 'warning' })
    return
  }
  try {
    await pythonWorkspaceApi.create({
      name: newWorkspaceName.value.trim(),
      description: newWorkspaceDesc.value
    })
    newWorkspaceName.value = ''
    newWorkspaceDesc.value = ''
    showCreateWorkspaceDialog.value = false
    await loadWorkspaceList()
    Modal.message({ message: 'Workspace 创建成功', status: 'success' })
  } catch (e: any) {
    Modal.message({ message: `创建失败: ${e.message}`, status: 'error' })
  }
}

async function onWorkspaceChange(id: string) {
  workspaceId.value = id
  kernelRunning.value = false
  backupList.value = []
  serviceList.value = []
  packageList.value = []
  openTabs.value = []
  currentFile.value = ''
  editor?.setValue('')
  // 断开旧 LSP 连接，建立新连接
  lspClient?.dispose()
  lspClient = new LspClient(id)
  await loadBackupList()
  await loadServiceList()
  await checkKernelStatus()
  // Kernel 未运行时自动启动，对齐 Jupyter 行为
  if (!kernelRunning.value) {
    try {
      await pythonKernelApi.startKernel(workspaceId.value)
      // 启动成功后二次验证确保连接建立
      await checkKernelStatus()
      if (kernelRunning.value) {
        appendOutput('Kernel 已自动启动', 'info')
      }
    } catch {
      // 自动启动失败不弹窗，用户可手动启动
    }
  }
  // 将 Workspace 切换时加载包列表
  await loadPackageList()
  // 加载文件树
  await loadFileTree()
  // 自动打开第一个 .py 文件（如 main.py）
  const findFirstFile = (nodes: any[]): any => {
    for (const n of nodes) {
      if (n.type === 'file') return n
      if (n.children?.length) {
        const found = findFirstFile(n.children)
        if (found) return found
      }
    }
    return null
  }
  const first = findFirstFile(fileTree.value)
  if (first) {
    openFile(first)
  }
}

async function checkKernelStatus() {
  if (!workspaceId.value) {
    kernelRunning.value = false
    return
  }
  try {
    const res: any = await pythonKernelApi.kernelStatus(workspaceId.value)
    kernelRunning.value = res?.data?.connected === true
  } catch {
    kernelRunning.value = false
  }
}

async function startKernel() {
  if (!workspaceId.value) {
    Modal.message({ message: '请先选择 Workspace', status: 'warning' })
    return
  }
  try {
    await pythonKernelApi.startKernel(workspaceId.value)
    // 启动成功后二次验证连接状态
    await checkKernelStatus()
    if (kernelRunning.value) {
      appendOutput('Kernel 启动成功', 'info')
    } else {
      appendOutput('Kernel 启动指令已发出，但连接未就绪，请稍候重试', 'warning')
    }
  } catch (e: any) {
    appendOutput(`Kernel 启动失败: ${e.message}`, 'error')
  }
}

// ===================== 文件操作 =====================

/** 从后端加载文件树 */
async function loadFileTree() {
  if (!workspaceId.value) {
    fileTree.value = []
    return
  }
  try {
    const res: any = await pythonWorkspaceApi.listFiles(workspaceId.value)
    fileTree.value = res?.data || []
  } catch {
    fileTree.value = []
  }
}

/** 打开新建弹窗 */
function openNewFileDialog() {
  newFileType.value = 'file'
  newFileName.value = ''
  showNewFileDialog.value = true
}

/** 执行新建文件或包 */
async function doCreateNewFile() {
  const name = newFileName.value.trim()
  if (!name) {
    Modal.message({ message: '名称不能为空', status: 'warning' })
    return
  }
  if (!workspaceId.value) {
    Modal.message({ message: '请先选择 Workspace', status: 'warning' })
    return
  }
  // 如果选中了目录，则在该目录下创建；否则在根目录
  const prefix = selectedDir.value ? selectedDir.value + '/' : ''
  try {
    if (newFileType.value === 'file') {
      const basename = name.endsWith('.py') ? name : name + '.py'
      const path = prefix + basename
      await pythonWorkspaceApi.createFile(workspaceId.value, path)
      showNewFileDialog.value = false
      await loadFileTree()
      // 自动打开新文件
      openFile({ path, name: basename })
    } else {
      const path = prefix + name
      await pythonWorkspaceApi.createPackage(workspaceId.value, path)
      showNewFileDialog.value = false
      await loadFileTree()
      Modal.message({ message: `包 "${name}" 创建成功`, status: 'success' })
    }
  } catch (e: any) {
    Modal.message({ message: `创建失败: ${e.message}`, status: 'error' })
  }
}

/** 点击 editor tab 时切换文件，从缓存恢复内容 */
function onTabClick(filePath: string) {
  if (currentFile.value === filePath) return
  // 保存当前文件内容到 tab 缓存
  const prevTab = openTabs.value.find((t) => t.name === currentFile.value)
  if (prevTab) prevTab.content = editor?.getValue() || ''
  // 切换到目标文件
  currentFile.value = filePath
  selectedItem.value = { type: 'file', path: filePath }
  // 从 tab 缓存恢复内容
  const targetTab = openTabs.value.find((t) => t.name === filePath)
  if (targetTab?.content != null) {
    editor?.setValue(targetTab.content)
  }
}

/** 打开文件（从后端加载内容，path 为相对路径） */
async function openFile(f: { path?: string; name: string }) {
  const filePath = f.path || f.name
  currentFile.value = filePath
  selectedItem.value = { type: 'file', path: filePath }
  if (!openTabs.value.find((t) => t.name === filePath)) {
    openTabs.value.push({ name: filePath, modified: false })
  }
  // 从后端加载文件内容
  if (workspaceId.value) {
    try {
      const res: any = await pythonWorkspaceApi.loadCode(workspaceId.value, filePath)
      if (res?.data != null) {
        editor?.setValue(res.data)
        const tab = openTabs.value.find((t) => t.name === filePath)
        if (tab) {
          tab.content = res.data
          tab.modified = false
        }
        // 通知 LSP 文件打开（首次打开）
        if (lspClient) {
          const uri = toFileUri(workspaceId.value, filePath)
          lspClient.didOpen(uri, res.data)
        }
      }
    } catch {
      // 加载失败不影响使用
    }
  }
}

async function deleteFile(name: string) {
  Modal.confirm({
    message: `确定删除文件 "${name}" 吗？`,
    status: 'warning'
  }).then(async (res: string) => {
    if (res !== 'confirm') return
    if (!workspaceId.value) {
      closeTab(name)
      await loadFileTree()
      return
    }
    try {
      await pythonWorkspaceApi.deleteCode(workspaceId.value, name)
      closeTab(name)
      await loadFileTree()
      Modal.message({ message: '文件已删除', status: 'success' })
    } catch (e: any) {
      Modal.message({ message: `删除失败: ${e.message}`, status: 'error' })
    }
  })
}

function openRenameDialog(name: string) {
  renameOldName.value = name
  renameNewName.value = name
  showRenameDialog.value = true
}

async function doRenameFile() {
  const oldName = renameOldName.value
  const newName = renameNewName.value.trim()
  if (!newName || newName === oldName) {
    showRenameDialog.value = false
    return
  }
  if (!newName.endsWith('.py')) {
    Modal.message({ message: '文件名须以 .py 结尾', status: 'warning' })
    return
  }
  if (!workspaceId.value) {
    // 仅内存改名
    const tab = openTabs.value.find((t) => t.name === oldName)
    if (tab) tab.name = newName
    if (currentFile.value === oldName) currentFile.value = newName
    showRenameDialog.value = false
    await loadFileTree()
    return
  }
  try {
    await pythonWorkspaceApi.renameCode(workspaceId.value, oldName, newName)
    const tab = openTabs.value.find((t) => t.name === oldName)
    if (tab) tab.name = newName
    if (currentFile.value === oldName) currentFile.value = newName
    showRenameDialog.value = false
    await loadFileTree()
    Modal.message({ message: '重命名成功', status: 'success' })
  } catch (e: any) {
    Modal.message({ message: `重命名失败: ${e.message}`, status: 'error' })
  }
}

function closeTab(name: string) {
  openTabs.value = openTabs.value.filter((t) => t.name !== name)
  if (currentFile.value === name && openTabs.value.length) {
    const nextTab = openTabs.value[0]
    currentFile.value = nextTab.name
    // 恢复切换到的文件内容
    if (nextTab.content != null) {
      editor?.setValue(nextTab.content)
    }
  }
}

async function saveCode() {
  if (!workspaceId.value) {
    Modal.message({ message: '请先选择 Workspace', status: 'warning' })
    return
  }
  const code = editor?.getValue() ?? ''
  const filename = currentFile.value || 'main.py'
  try {
    await pythonWorkspaceApi.saveCode(workspaceId.value, filename, code)
    const tab = openTabs.value.find((t) => t.name === filename)
    if (tab) tab.modified = false
    Modal.message({ message: '代码已保存', status: 'success' })
  } catch (e: any) {
    Modal.message({ message: `保存失败: ${e.message}`, status: 'error' })
  }
}

// ===================== 代码执行 =====================
async function runCode() {
  if (!workspaceId.value) {
    Modal.message({ message: '请先选择 Workspace 并启动 Kernel', status: 'warning' })
    return
  }
  const code = editor?.getValue() || ''
  if (!code.trim()) return

  // 执行前先验证 Kernel 连接状态
  await checkKernelStatus()
  if (!kernelRunning.value) {
    // 尝试重新启动
    appendOutput('Kernel 连接已断开，正在尝试重连...', 'warning')
    try {
      await pythonKernelApi.startKernel(workspaceId.value)
      await checkKernelStatus()
    } catch {
      // ignore
    }
    if (!kernelRunning.value) {
      appendOutput('Kernel 重连失败，请手动点击“启动”', 'error')
      return
    }
    appendOutput('Kernel 重连成功', 'info')
  }

  executing.value = true
  activePanel.value = 'console'
  bottomPanelVisible.value = true

  appendOutput(`> 执行开始`, 'info')

  cancelExecute = createExecuteSse(
    workspaceId.value,
    code,
    (data) => {
      try {
        const msg = JSON.parse(data)
        if (msg.text) appendOutput(msg.text, 'stdout')
        else if (msg.error) appendOutput(msg.error, 'error')
        else if (msg.result) appendOutput(msg.result, 'result')
      } catch {
        appendOutput(data, 'stdout')
      }
    },
    () => {
      executing.value = false
      appendOutput('> 执行完成', 'info')
    },
    (err) => {
      executing.value = false
      // Kernel 执行完成后直接关闭 TCP 连接而不发 [DONE]，
      // fetch 底层会抛出 'network error'，属正常流结束，不是真实错误
      const isNetworkClose =
        err === 'network error' ||
        (typeof err === 'string' &&
          (err.includes('NetworkError') || err.includes('Failed to fetch')))
      if (isNetworkClose && outputLines.value.length > 0) {
        appendOutput('> 执行完成', 'info')
        return
      }
      appendOutput(`执行错误: ${err}`, 'error')
    }
  )
}

// ===================== 调试 =====================
async function toggleDebug() {
  if (debugging.value) {
    await stopDebug()
  } else {
    await initDebug()
  }
}

async function initDebug() {
  if (!workspaceId.value) {
    Modal.message({ message: '请先选择 Workspace', status: 'warning' })
    return
  }
  if (!kernelRunning.value) {
    Modal.message({ message: '请先启动 Kernel', status: 'warning' })
    return
  }

  debugging.value = true
  activePanel.value = 'console' // 启动调试默认显示控制台，用户可自行切换
  bottomPanelVisible.value = true

  // 连接调试 SSE 流（初始化 DAP 会话）
  // 原生 EventSource 不支持携带 Authorization header，改用 fetch 流式读取
  const sseUrl = `${import.meta.env.VITE_API_URL}/api/python/ide/debug/init/${workspaceId.value}`
  const debugAbortController = new AbortController()
  cancelDebugSse = () => debugAbortController.abort()

  // 等待后端推送 debug_ready 事件再发送代码执行
  const debugReadyPromise = new Promise<void>((resolve) => {
    let resolved = false
    const doResolve = () => {
      if (!resolved) {
        resolved = true
        resolve()
      }
    }
    // 保守：最多等 8 秒
    setTimeout(doResolve, 8000)

    fetch(sseUrl, {
      method: 'GET',
      headers: {
        Authorization: getToken() || '',
        'Accept-Language': 'zh',
        Accept: 'text/event-stream'
      },
      signal: debugAbortController.signal
    })
      .then(async (response) => {
        if (!response.ok) {
          appendOutput(`[Debug] SSE 连接失败: ${response.status}`, 'error')
          doResolve()
          return
        }
        const reader = response.body!.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        let currentEvent = ''
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''
          for (const line of lines) {
            if (line.startsWith('event:')) {
              currentEvent = line.slice(6).trim()
            } else if (line.startsWith('data:')) {
              const data = line.slice(5).trim()
              if (currentEvent === 'debug_ready') {
                doResolve()
              } else if (currentEvent === 'debug_event') {
                try {
                  console.log('[SSE debug_event raw]', data)
                  handleDebugEvent(JSON.parse(data))
                } catch {
                  /* ignore */
                }
              } else if (currentEvent === 'debug_state') {
                // 后端在 stopped 后主动推送：stackTrace + scopes + variables
                try {
                  const state = JSON.parse(data)
                  console.log('[SSE debug_state]', state)
                  handleDebugState(state)
                } catch {
                  /* ignore */
                }
              } else if (currentEvent === 'output') {
                try {
                  const obj = JSON.parse(data)
                  appendOutput(obj.text || data, 'stdout')
                } catch {
                  appendOutput(data, 'stdout')
                }
              } else if (currentEvent === 'error') {
                try {
                  const obj = JSON.parse(data)
                  appendOutput(obj.text || data, 'error')
                } catch {
                  appendOutput(data, 'error')
                }
              } else if (currentEvent === 'session_expired') {
                // 后端启动了新调试会话，强制结束当前旧会话
                if (debugging.value) finishDebug('新调试会话已启动，旧会话已结束')
              } else if (currentEvent === 'execution_done') {
                // execute_reply 到达：代码已完全执行完毕
                appendOutput('[Debug] 代码执行完毕', 'info')
                if (debugging.value) {
                  if (atBreakpoint) {
                    // 当前仍在断点暂停中，不结束（用户还在单步调试）
                  } else {
                    // 未暂停于断点（代码跑完或无断点），直接结束调试
                    finishDebug('调试执行完成')
                  }
                }
              }
              currentEvent = ''
            }
          }
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          if (debugging.value) appendOutput('[Debug] 调试连接已断开', 'warning')
        }
      })
  })

  // 兼容旧代码：debugEventSource 设为 null（不再使用原生 EventSource）
  debugEventSource = null

  // 等待后端推送 debug_ready（debugpy 已就绪）
  appendOutput('> 等待调试器就绪...', 'info')
  await debugReadyPromise
  appendOutput('> 调试器已就绪', 'info')

  // 将本地断点行同步到后端缓存（debugCell 中统一发送 DAP setBreakpoints）
  const lines = [...breakpointLines.value]
  if (lines.length > 0) {
    try {
      await pythonExecuteApi.setBreakpoints(workspaceId.value, {
        filePath: currentFile.value || 'main.py',
        lines
      })
    } catch {
      /* 缓存失败不阻断流程 */
    }
    appendOutput(`> 已设置断点: 第 ${lines.join(', ')} 行`, 'info')
  } else {
    appendOutput('> 未设置断点，将直接运行至完成', 'info')
  }

  // 触发代码执行（调试模式）
  const code = editor?.getValue() || ''
  if (!code.trim()) {
    appendOutput('编辑器为空，请先编写代码', 'warning')
    debugging.value = false
    cancelDebugSse?.()
    cancelDebugSse = null
    return
  }

  appendOutput('> 调试模式已启动', 'info')
  // 使用 debugCell 调试执行，而非普通 execute_request
  // debugpy 会在断点处暂停，通过 SSE debug_event 通知前端
  try {
    await pythonExecuteApi.debugRun(workspaceId.value, code, currentFile.value || 'main.py')
    appendOutput('> 调试执行已提交，等待断点命中...', 'info')
  } catch (e: any) {
    appendOutput(`调试执行失败: ${e.message}`, 'error')
    debugging.value = false
    cancelDebugSse?.()
    cancelDebugSse = null
  }
}

function handleDebugEvent(event: any) {
  if (!debugging.value) return // 调试已停止，忽略旧 SSE 残留事件
  const evtType = event?.event || event?.type
  console.log('[handleDebugEvent]', evtType, JSON.stringify(event))
  if (evtType === 'stopped') {
    isStepping = false
    atBreakpoint = true // 进入断点暂停状态，保护调试会话不被 execution_done 结束
    // 断点命中：立即取消 execution_done 兆底定时器，防止错误结束调试
    if (execDoneTimer) {
      clearTimeout(execDoneTimer)
      execDoneTimer = null
    }
    appendOutput(`[Debug] 断点命中，原因: ${event.body?.reason || 'breakpoint'}`, 'debug')
    // 仅在面板收起时展开，不强制切换 Tab（尊重用户当前选择）
    bottomPanelVisible.value = true
    // 不再发 HTTP 请求，由后端通过 debug_state SSE 主动推送 stackTrace+variables
  } else if (evtType === 'continued') {
    atBreakpoint = false // 继续执行，离开断点暂停状态
    highlightDebugLine(null)
  } else if (evtType === 'terminated' || evtType === 'exited') {
    finishDebug('调试会话已结束')
  }
}

/** 处理后端主动推送的 debug_state（stackTrace + scopes + variables） */
function handleDebugState(state: any) {
  if (!debugging.value) return
  debugStateReceived.value = true // 标记已收到断点状态，无论变量是否为空
  const frames = state?.stackFrames || []
  stackFrames.value = frames
  const topFrame = frames[0]
  if (topFrame?.line) {
    appendOutput(`[Debug] 暂停于第 ${topFrame.line} 行`, 'debug')
    highlightDebugLine(topFrame.line)
  }
  const scopes = state?.scopes || []
  const skipNames = new Set([
    'special variables',
    'function variables',
    'class variables',
    'protected variables',
    'ipython variables'
  ])
  const allVars = scopes.flatMap((s: any) => s.variables || [])
  debugVariables.value = allVars.filter((v: any) => !skipNames.has(v.name))
  console.log('[handleDebugState] frames=', frames.length, 'vars=', debugVariables.value.length)
}

async function stopDebug() {
  if (workspaceId.value) {
    try {
      await pythonExecuteApi.stopDebug(workspaceId.value)
    } catch {
      /* ignore */
    }
  }
  finishDebug('调试已停止')
}

/** 调试结束统一收尾（terminated事件/execution_done/手动停止 均调用） */
function finishDebug(msg: string) {
  if (execDoneTimer) {
    clearTimeout(execDoneTimer)
    execDoneTimer = null
  }
  isStepping = false
  atBreakpoint = false
  debugging.value = false
  debugStateReceived.value = false
  cancelDebugSse?.()
  cancelDebugSse = null
  debugEventSource = null
  stackFrames.value = []
  debugVariables.value = []
  highlightDebugLine(null)
  appendOutput(`[Debug] ${msg}`, 'info')
}

async function debugPause() {
  // DAP pause 命令（暂停所有线程）
  await pythonExecuteApi.stepOver(workspaceId.value, { threadId: 1 }).catch(() => {})
}
async function debugContinue() {
  highlightDebugLine(null) // 继续执行前先清除高亮
  await pythonExecuteApi.debugContinue(workspaceId.value, { threadId: 1 })
}
async function debugStepOver() {
  isStepping = true
  highlightDebugLine(null)
  await pythonExecuteApi.stepOver(workspaceId.value, { threadId: 1 })
}
async function debugStepIn() {
  isStepping = true
  highlightDebugLine(null)
  await pythonExecuteApi.stepIn(workspaceId.value, { threadId: 1 })
}
async function debugStepOut() {
  isStepping = true
  highlightDebugLine(null)
  await pythonExecuteApi.stepOut(workspaceId.value, { threadId: 1 })
}

/** 从断点列表中移除指定行断点 */
function removeBreakpoint(line: number) {
  const newSet = new Set(breakpointLines.value)
  newSet.delete(line)
  breakpointLines.value = newSet
  syncBreakpointDecorations()
}

// ===================== 备份 =====================
async function loadBackupList() {
  if (!workspaceId.value) return
  try {
    const res: any = await pythonBackupApi.list(workspaceId.value)
    backupList.value = res?.data || []
  } catch {
    backupList.value = []
  }
}

async function doCreateBackup() {
  if (!workspaceId.value) return
  try {
    await pythonBackupApi.create(workspaceId.value, backupRemark.value)
    backupRemark.value = ''
    showBackupDialog.value = false
    await loadBackupList()
    Modal.message({ message: '备份创建成功', status: 'success' })
  } catch (e: any) {
    Modal.message({ message: `备份失败: ${e.message}`, status: 'error' })
  }
}

async function restoreBackup(backupId: string) {
  try {
    await pythonBackupApi.restore(workspaceId.value, backupId)
    Modal.message({ message: '恢复成功', status: 'success' })
  } catch (e: any) {
    Modal.message({ message: `恢复失败: ${e.message}`, status: 'error' })
  }
}

async function deleteBackup(backupId: string) {
  try {
    await pythonBackupApi.remove(workspaceId.value, backupId)
    await loadBackupList()
    Modal.message({ message: '删除成功', status: 'success' })
  } catch (e: any) {
    Modal.message({ message: `删除失败: ${e.message}`, status: 'error' })
  }
}

// ===================== 发布服务 =====================
async function loadServiceList() {
  if (!workspaceId.value) return
  try {
    const res: any = await pythonServiceApi.list(workspaceId.value)
    serviceList.value = res?.data || []
  } catch {
    serviceList.value = []
  }
}

function openPublishDialog() {
  publishForm.value = {
    serviceName: '',
    apiKey: '',
    effectiveStart: null,
    effectiveEnd: null,
    description: '',
    publishAsMcp: false,
    mcpToolName: ''
  }
  publishedApiKey.value = ''
  showPublishDialog.value = true
  // 打开时自动生成一个 apiKey
  generateApiKey()
}

function closePublishDialog() {
  showPublishDialog.value = false
  publishedApiKey.value = ''
  loadServiceList()
}

async function doPublish() {
  if (!workspaceId.value) return
  if (!publishForm.value.serviceName.trim()) {
    Modal.message({ message: '服务名称不能为空', status: 'warning' })
    return
  }
  if (!publishForm.value.apiKey) {
    Modal.message({ message: '请先点击「生成」按钮生成 API Key', status: 'warning' })
    return
  }
  try {
    const formatDate = (d: Date | null) => {
      if (!d) return null
      const pad = (n: number) => String(n).padStart(2, '0')
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
    }
    const res: any = await pythonServiceApi.publish({
      workspaceId: workspaceId.value,
      scriptName: currentFile.value,
      serviceName: publishForm.value.serviceName.trim(),
      apiKey: publishForm.value.apiKey,
      description: publishForm.value.description,
      effectiveStart: formatDate(publishForm.value.effectiveStart),
      effectiveEnd: formatDate(publishForm.value.effectiveEnd),
      publishAsMcp: publishForm.value.publishAsMcp,
      mcpToolName: publishForm.value.mcpToolName || undefined
    })
    publishedApiKey.value = publishForm.value.apiKey
    await loadServiceList()
  } catch (e: any) {
    Modal.message({ message: `发布失败: ${e.message}`, status: 'error' })
  }
}

async function enableService(id: string) {
  try {
    await pythonServiceApi.enable(id)
    await loadServiceList()
  } catch (e: any) {
    Modal.message({ message: `启用失败: ${e.message}`, status: 'error' })
  }
}

async function disableService(id: string) {
  try {
    await pythonServiceApi.disable(id)
    await loadServiceList()
  } catch (e: any) {
    Modal.message({ message: `停用失败: ${e.message}`, status: 'error' })
  }
}

async function deleteService(id: string) {
  try {
    await pythonServiceApi.remove(id)
    await loadServiceList()
    Modal.message({ message: '删除成功', status: 'success' })
  } catch (e: any) {
    Modal.message({ message: `删除失败: ${e.message}`, status: 'error' })
  }
}

function copyApiKey(apiKey: string) {
  navigator.clipboard
    .writeText(apiKey)
    .then(() => {
      Modal.message({ message: 'API Key 已复制到剪贴板', status: 'success' })
    })
    .catch(() => {
      Modal.message({ message: `API Key: ${apiKey}`, status: 'info' })
    })
}

// ===================== 依赖安装/卸载 =====================
function closeInstallDialog() {
  showInstallDialog.value = false
  installPkgName.value = ''
  installOutput.value = ''
  installing.value = false
  pkgSearchKeyword.value = ''
  pypiSearchResults.value = []
  selectedPkg.value = null
  selectedPkgInfo.value = null
  selectedVersion.value = ''
  pkgVersionList.value = []
  pkgVersionError.value = ''
  pkgVersionManual.value = false
}

// 加载已安装包列表
async function loadPackageList() {
  if (!workspaceId.value) return
  try {
    const res: any = await pythonExecuteApi.listPackages(workspaceId.value)
    packageList.value = res?.data || []
  } catch {
    // 静默失败，不影响主流程
  }
}

// 手动安装：直接传入 pip spec（支持 pandas==5.0.1 或纯包名）
function doInstallManual(spec: string) {
  if (!spec || !workspaceId.value) return
  installing.value = true
  showInstallDialog.value = true
  const mirrorUrl = getActiveMirrorUrl()
  const mirrorArg = mirrorUrl ? ` -i ${mirrorUrl}` : ''
  const code = `!pip install ${spec}${mirrorArg}`
  installOutput.value = `正在安装 ${spec}${mirrorUrl ? ' (' + MIRROR_LIST.find((m) => m.url === mirrorUrl)?.label + ')' : ''}...`
  createExecuteSse(
    workspaceId.value,
    code,
    (data) => {
      installOutput.value += '\n' + data
      nextTick(() => {
        if (installOutputRef.value) {
          installOutputRef.value.scrollTop = installOutputRef.value.scrollHeight
        }
      })
    },
    () => {
      installOutput.value += '\n✅ 安装完成'
      installing.value = false
      loadPackageList()
    },
    (err) => {
      const isNetworkClose =
        err === 'network error' || err.includes('NetworkError') || err.includes('Failed to fetch')
      if (isNetworkClose && installOutput.value.length > 30) {
        installOutput.value += '\n✅ 安装完成'
        installing.value = false
        loadPackageList()
        return
      }
      installOutput.value += `\n❌ 错误: ${err}`
      installing.value = false
    }
  )
}

async function doInstallPackage() {
  if (!workspaceId.value || !selectedPkg.value) return
  installing.value = true
  const pkgSpec = selectedVersion.value
    ? `${selectedPkg.value.value}==${selectedVersion.value}`
    : selectedPkg.value.value
  const mirrorUrl = getActiveMirrorUrl()
  const mirrorArg = mirrorUrl ? ` -i ${mirrorUrl}` : ''
  const code = `!pip install ${pkgSpec}${mirrorArg}`
  installOutput.value = `正在安装 ${pkgSpec}${mirrorUrl ? ' (' + MIRROR_LIST.find((m) => m.url === mirrorUrl)?.label + ')' : ''}...`
  createExecuteSse(
    workspaceId.value,
    code,
    (data) => {
      installOutput.value += '\n' + data
      nextTick(() => {
        if (installOutputRef.value) {
          installOutputRef.value.scrollTop = installOutputRef.value.scrollHeight
        }
      })
    },
    () => {
      installOutput.value += '\n✅ 安装完成'
      installing.value = false
      loadPackageList()
    },
    (err) => {
      const isNetworkClose =
        err === 'network error' || err.includes('NetworkError') || err.includes('Failed to fetch')
      if (isNetworkClose && installOutput.value.length > 30) {
        installOutput.value += '\n✅ 安装完成'
        installing.value = false
        loadPackageList()
        return
      }
      installOutput.value += `\n❌ 错误: ${err}`
      installing.value = false
    }
  )
}

async function doUninstallPackage(pkgName: string) {
  if (!workspaceId.value || !pkgName) return
  const ok = await new Promise<boolean>((resolve) => {
    Modal.confirm({
      title: '确认卸载',
      message: `确认卸载 ${pkgName} 吗？`,
      confirmButtonText: '卸载',
      cancelButtonText: '取消',
      confirmHandle: () => resolve(true),
      cancelHandle: () => resolve(false)
    })
  })
  if (!ok) return
  installOutput.value = `正在卸载 ${pkgName}...`
  showInstallDialog.value = true
  installing.value = true
  const code = `!pip uninstall -y ${pkgName}`
  createExecuteSse(
    workspaceId.value,
    code,
    (data) => {
      installOutput.value += '\n' + data
      nextTick(() => {
        if (installOutputRef.value) {
          installOutputRef.value.scrollTop = installOutputRef.value.scrollHeight
        }
      })
    },
    () => {
      installOutput.value += '\n✅ 卸载完成'
      installing.value = false
      loadPackageList()
    },
    (err) => {
      // 正常执行完成后的连接关闭，不当错误
      const isNetworkClose =
        err === 'network error' || err.includes('NetworkError') || err.includes('Failed to fetch')
      if (isNetworkClose && installOutput.value.length > 30) {
        installOutput.value += '\n✅ 卸载完成'
        installing.value = false
        loadPackageList()
        return
      }
      installOutput.value += `\n❌ 错误: ${err}`
      installing.value = false
    }
  )
}

// ===================== 工具方法 =====================
function appendOutput(text: string, type = 'stdout') {
  outputLines.value.push({ text, type })
  nextTick(() => {
    if (outputContainer.value) {
      outputContainer.value.scrollTop = outputContainer.value.scrollHeight
    }
  })
}

function clearOutput() {
  outputLines.value = []
}

function formatTime(t: string) {
  if (!t) return ''
  return t.slice(0, 16).replace('T', ' ')
}

// ===================== AI 对话面板功能 =====================
function toggleAiPanel() {
  aiPanelVisible.value = !aiPanelVisible.value
  if (aiPanelVisible.value && !codeAssistants.value.length) {
    loadCodeAssistants()
  }
}

async function loadCodeAssistants() {
  try {
    const res: any = await AiAssistantApi.list('code')
    codeAssistants.value = res?.data || []
    if (codeAssistants.value.length && !selectedAssistantId.value) {
      selectedAssistantId.value = codeAssistants.value[0].id
    }
  } catch {
    codeAssistants.value = []
  }
}

async function onAssistantChange() {
  // 切换助手时重置会话
  aiSessionId.value = ''
  aiMessages.value = []
}

async function onSwitchAssistant(assistant: any) {
  if (selectedAssistantId.value === assistant.id) return
  selectedAssistantId.value = assistant.id
  aiSessionId.value = ''
  aiMessages.value = []
}

/** 组装上下文：当前文件 + import 引用文件 + 已安装包 */
function assembleAiContext(): string {
  const parts: string[] = []

  // 0. 环境说明（始终输出，确保 AI 知道这是 Python IDE 环境）
  const envInfo = `[环境说明]
当前处于 Python IDE 环境（Workspace: ${workspaceId.value || '未知'}）。
当前打开的文件：${currentFile.value || '（无）'}。
所有代码均为 Python 代码，请只生成 .py 文件内容，不要生成 Java/其他语言代码，不要描述文件路径。`
  parts.push(envInfo)

  // 1. 当前文件内容
  const code = editor?.getValue() || ''
  if (code.trim()) {
    parts.push(`[当前文件: ${currentFile.value}]\n\`\`\`python\n${code}\n\`\`\``)
  }

  // 2. import 引用的工作区文件（最多5个，每个最多2000字符）
  const importedFiles = getImportedFiles(code)
  if (importedFiles.length) {
    parts.push('[工作区引用文件]')
    for (const f of importedFiles) {
      parts.push(`文件 ${f.name}:\n\`\`\`python\n${f.content.slice(0, 2000)}\n\`\`\``)
    }
  }

  // 3. 已安装的包列表
  if (packageList.value.length) {
    const pkgNames = packageList.value.map((p: any) => `${p.name}==${p.version}`).join(', ')
    parts.push(`[已安装的Python包]\n${pkgNames}`)
  }

  return parts.join('\n\n')
}

/** 解析 import 语句，从打开的标签页中获取引用文件内容 */
function getImportedFiles(code: string): { name: string; content: string }[] {
  const result: { name: string; content: string }[] = []
  const importRegex = /(?:from\s+([\w.]+)\s+import|import\s+([\w.]+))/g
  let match
  const modules = new Set<string>()
  while ((match = importRegex.exec(code)) !== null) {
    const mod = match[1] || match[2]
    if (mod) modules.add(mod.split('.')[0])
  }
  // 匹配打开的标签页中的文件
  for (const tab of openTabs.value) {
    if (tab.name === currentFile.value) continue
    const modName = tab.name.replace(/\.py$/, '').replace(/\//g, '.')
    const baseName = modName.split('.').pop() || ''
    if (modules.has(baseName) || modules.has(modName)) {
      if (tab.content) {
        result.push({ name: tab.name, content: tab.content })
      }
      if (result.length >= 5) break
    }
  }
  return result
}

/** 发送消息 */
async function sendAiMessage() {
  const text = aiInputText.value.trim()
  if (!text || !selectedAssistantId.value || aiStreaming.value) return

  // 发送前先记录当前编辑器光标位置（此时焦点尚在编辑器或已有上次位置）
  // 点击 AI 面板发送后编辑器失焦，getPosition() 会返回 null，必须提前保存
  if (editor) {
    const model = editor.getModel()
    const curPos = editor.getPosition()
    if (curPos) {
      aiEditorInsertPos = { lineNumber: curPos.lineNumber, column: curPos.column }
    } else if (model) {
      // 编辑器已失焦，用文件末尾作为插入点
      const lastLine = model.getLineCount()
      aiEditorInsertPos = { lineNumber: lastLine, column: model.getLineMaxColumn(lastLine) }
    }
  }
  aiMessages.value.push({ role: 'user', content: text })
  aiInputText.value = ''
  aiStreaming.value = true
  scrollAiToBottom()

  // 确保有会话
  if (!aiSessionId.value) {
    try {
      const assistant = codeAssistants.value.find((a: any) => a.id === selectedAssistantId.value)
      const res: any = await AiChatApi.createSession({
        assistantId: selectedAssistantId.value,
        modelId: assistant?.modelId,
        title: 'Python IDE 对话',
        systemPrompt:
          '你是一个 Python 代码助手。用户会向你描述需求，你需要生成高质量的 Python 代码。规则：1. 代码必须用 ```python\n...\n``` 包裹；2. 不要描述文件保存路径或说"已保存至"之类的话；3. 代码直接写在当前打开的文件中，无需说明文件位置；4. 必须使用4个空格作为缩进，经典 Python 缩进风格，绝对不要使用1个空格缩进。',
        source: 'code'
      })
      aiSessionId.value = res?.data?.id || res?.data || ''
    } catch (e: any) {
      aiMessages.value.push({ role: 'assistant', content: `创建会话失败: ${e.message}` })
      aiStreaming.value = false
      return
    }
  }

  // 组装上下文
  const context = assembleAiContext()
  // 每次发送时都追加强制指令，确保 AI 输出标准代码块（部分模型不严格遵守 system prompt）
  const forceCodeInstruction = aiWriteToEditor.value
    ? '\n\n[重要] 你必须将完整代码放在 ```python\n...\n``` 代码块中输出，不能只描述，不能省略代码块。所有代码必须使用4个空格缩进，不要用1个空格。'
    : ''
  const fullMessage = context
    ? `${context}\n\n---\n用户问题: ${text}${forceCodeInstruction}`
    : `${text}${forceCodeInstruction}`

  // 添加 AI 占位消息
  aiMessages.value.push({ role: 'assistant', content: '' })
  const aiMsgIdx = aiMessages.value.length - 1

  // SSE 流式请求（使用 /session/{id}/stream POST 接口，不含 GenUI system prompt）
  try {
    const token = getToken() || ''
    const url = `/api/ai/chat/session/${aiSessionId.value}/stream`
    aiAbortController = new AbortController()

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      },
      body: JSON.stringify({ message: fullMessage }),
      signal: aiAbortController.signal
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const reader = response.body?.getReader()
    if (!reader) throw new Error('No reader')
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      // SSE 格式：事件以空行（\n\n）分隔
      const events = buffer.split('\n\n')
      buffer = events.pop() || ''

      for (const event of events) {
        // 只去掉首尾的換行符，不能用 trim()（会把纯空格 chunk 如 "   " 的内容吃掉）
        const dataLine = event.replace(/^\n+|\n+$/g, '')
        if (!dataLine.startsWith('data:')) continue
        const chunk = dataLine.slice(5)
        // 还原后端转义的 \\n 为真实换行符
        const decoded = chunk.replace(/\\n/g, '\n')
        aiMessages.value[aiMsgIdx].content += decoded
        scrollAiToBottom()
      }
    }

    // 流式结束后，若开启写入编辑器模式，提取代码块追加到文件末尾
    if (aiWriteToEditor.value && editor) {
      const fullContent = aiMessages.value[aiMsgIdx].content
      // 统一先把字面量 \n 还原为真实换行符（兼容后端重启前后两种情况）
      const normalizedContent = fullContent.replace(/\\n/g, '\n')
      const codeBlocks: string[] = []
      const fenceReg = /```(?:\w*)[^\S\r\n]*\n?([\s\S]*?)\n?```/g
      let m: RegExpExecArray | null
      while ((m = fenceReg.exec(normalizedContent)) !== null) {
        // 只去掉首尾空行，保留代码内部缩进
        const raw = m[1].replace(/^\n+|\n+$/g, '')
        const code = raw
        if (code) codeBlocks.push(code)
      }
      if (codeBlocks.length > 0) {
        const model = editor.getModel()
        if (model) {
          // 始终追加到文件末尾，换一行后插入，不依赖光标位置
          const lastLine = model.getLineCount()
          const lastCol = model.getLineMaxColumn(lastLine)
          const lastLineText = model.getLineContent(lastLine)
          // 若末尾行非空则先换行
          const prefix = lastLineText.trim() ? '\n' : ''
          const codeToInsert = prefix + codeBlocks.join('\n\n') + '\n'
          editor.executeEdits('ai-append', [{
            range: new monaco.Range(lastLine, lastCol, lastLine, lastCol),
            text: codeToInsert,
            forceMoveMarkers: true
          }])
          // 滚动到插入位置
          const newLastLine = model.getLineCount()
          editor.revealLine(newLastLine)
          editor.focus()
        }
      } else {
        // 未检测到代码块时提示用户
        Modal.message({ message: 'AI 未返回代码块，请在对话中点击“插入到光标”手动写入，或重新发送请求', status: 'warning' })
      }
    }
    aiEditorInsertPos = null
  } catch (e: any) {
    if (e.name !== 'AbortError') {
      const errMsg = aiMessages.value[aiMsgIdx].content
        ? `\n\n---\n[错误: ${e.message}]`
        : `请求失败: ${e.message}`
      aiMessages.value[aiMsgIdx].content += errMsg
    }
  } finally {
    aiStreaming.value = false
    aiAbortController = null
    scrollAiToBottom()
  }
}

function stopAiStream() {
  aiAbortController?.abort()
  aiStreaming.value = false
}

function clearAiChat() {
  aiMessages.value = []
  aiSessionId.value = ''
}

function scrollAiToBottom() {
  nextTick(() => {
    if (aiMessagesRef.value) {
      aiMessagesRef.value.scrollTop = aiMessagesRef.value.scrollHeight
    }
  })
}

function renderMarkdown(content: string): string {
  if (!content) return ''
  // 渲染 markdown，并为代码块添加操作按钮
  let html = md.render(content)
  // 给每个 pre>code 块添加"插入"和"替换"操作按钮
  html = html.replace(/<pre><code(.*?)>([\s\S]*?)<\/code><\/pre>/g, (_, attrs, code) => {
    const decoded = code
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
    const encoded = encodeURIComponent(decoded)
    return `<div class="ai-code-block"><div class="ai-code-actions"><span class="ai-code-btn" onclick="window.__aiInsertCode__('${encoded}')">插入到光标</span><span class="ai-code-btn" onclick="window.__aiReplaceCode__('${encoded}')">替换选中</span></div><pre><code${attrs}>${code}</code></pre></div>`
  })
  return html
}

// AI 面板拖拽调整宽度
let aiResizing = false
function startAiPanelResize(e: MouseEvent) {
  aiResizing = true
  const startX = e.clientX
  const startW = aiPanelWidth.value
  const onMove = (ev: MouseEvent) => {
    if (!aiResizing) return
    const diff = startX - ev.clientX
    aiPanelWidth.value = Math.max(280, Math.min(700, startW + diff))
  }
  const onUp = () => {
    aiResizing = false
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
  }
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
}

// 全局注册代码插入/替换函数（供 markdown 渲染的按钮调用）
if (typeof window !== 'undefined') {
  ;(window as any).__aiInsertCode__ = (encodedCode: string) => {
    const code = decodeURIComponent(encodedCode)
    if (editor) {
      const position = editor.getPosition()
      if (position) {
        editor.executeEdits('ai-insert', [
          {
            range: new monaco.Range(
              position.lineNumber,
              position.column,
              position.lineNumber,
              position.column
            ),
            text: code,
            forceMoveMarkers: true
          }
        ])
        editor.focus()
      }
    }
  }
  ;(window as any).__aiReplaceCode__ = (encodedCode: string) => {
    const code = decodeURIComponent(encodedCode)
    if (editor) {
      const selection = editor.getSelection()
      if (selection && !selection.isEmpty()) {
        editor.executeEdits('ai-replace', [
          {
            range: selection,
            text: code,
            forceMoveMarkers: true
          }
        ])
      } else {
        // 没有选中时，替换整个编辑器内容
        editor.setValue(code)
      }
      editor.focus()
    }
  }
}

function formatFrameName(name: string) {
  return name === '<module>' ? '(顶层)' : name
}

</script>

<style scoped lang="less">
.python-ide {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #1e1e1e;
  color: #d4d4d4;
  font-family: 'Consolas', monospace;

  // 暗色主题默认强制覆盖（避免外层白色背景污染）
  .ide-toolbar {
    background: #2d2d2d;
    border-bottom-color: #404040;
  }
  .ide-sidebar {
    background: #252526;
    border-right-color: #404040;
  }
  .ide-bottom-panel {
    background: #1e1e1e;
    border-top-color: #404040;
    .panel-tabs {
      background: #252526;
      border-bottom-color: #3a3a3a;
    }
  }

  // 亮色主题覆盖
  &.theme-light {
    background: #f5f5f5;
    color: #333;

    .ide-toolbar {
      background: #ffffff;
      border-bottom-color: #e0e0e0;
      .ide-title {
        color: #333;
      }
      .tb-btn {
        color: #555;
        &:hover {
          background: rgba(0, 0, 0, 0.06);
          color: #111;
        }
        &.active {
          color: #4caf50;
        }
        &.btn-debug-active {
          color: #ef5350;
        }
      }
    }

    .ide-sidebar {
      background: #ffffff;
      border-right-color: #e0e0e0;
      .sidebar-section {
        border-bottom-color: #e0e0e0;
      }
      .section-title {
        color: #666;
      }
      :deep(.file-item) {
        color: #333;
        &:hover {
          background: #e5e5e5;
        }
        &.active {
          background: rgba(0, 120, 212, 0.15);
          color: #0057a5;
        }
        .file-action-btn {
          color: #aaa;
          &:hover {
            color: #333;
            background: rgba(0, 0, 0, 0.08);
          }
        }
        .file-actions {
        }
        &:hover .file-actions,
        &.active .file-actions {
        }
      }
      :deep(.tree-dir) .tree-dir-label {
        color: #333;
        cursor: pointer;
        &:hover {
          background: rgba(0, 0, 0, 0.05);
        }
        &.tree-dir-selected {
          background: rgba(0, 120, 212, 0.12);
          color: #0057a5;
        }
        .tree-dir-arrow {
          color: #666;
        }
        .dir-action-btn {
          color: #aaa;
          &:hover {
            color: #333;
            background: rgba(0, 0, 0, 0.08);
          }
        }
      }
      .backup-item {
        border-bottom-color: #e0e0e0;
      }
      .backup-remark {
        color: #333;
      }
      .backup-time {
        color: #999;
      }
    }

    .ide-editor-area {
      .editor-tabs {
        background: #ececec;
        border-bottom-color: #e0e0e0;
        .editor-tab {
          color: #666;
          border-right-color: #e0e0e0;
          &:hover {
            background: #e0e0e0;
          }
          &.active {
            background: #fff;
            color: #333;
            border-bottom-color: #0078d4;
          }
          .tab-close {
            color: #999;
            &:hover {
              color: #333;
            }
          }
        }
      }
    }

    .ide-bottom-panel {
      background: #ffffff;
      border-top-color: #e0e0e0;
      .panel-tabs {
        background: #f5f5f5;
        border-bottom-color: #e0e0e0;
        .panel-tab {
          color: #666;
          &:hover {
            background: #e5e5e5;
          }
          &.active {
            color: #333;
            background: #fff;
            border-bottom-color: #0078d4;
          }
        }
      }
      .var-item .var-row {
        border-bottom-color: #e0e0e0;
        .var-name {
          color: #0070c1;
        }
        .var-type {
          color: #a31515;
        }
        .var-value {
          color: #333;
        }
      }
      .output-panel {
        .output-toolbar {
          border-bottom-color: #e0e0e0;
        }
        .output-line {
          &.stdout {
            color: #333;
          }
          &.error {
            color: #cc0000;
          }
          &.info {
            color: #0070c1;
          }
          &.result {
            color: #116644;
          }
          &.debug {
            color: #795e26;
          }
        }
      }
      .debug-section-title {
        color: #555;
      }
      .stack-frame {
        border-left-color: #0078d4;
        background: rgba(0, 120, 212, 0.05);
        .frame-name {
          color: #1e1e1e;
        }
        .frame-location {
          color: #0078d4;
        }
      }
      .debug-idle-tip {
        .debug-tip-title {
          color: #333;
        }
        .debug-tip-steps {
          color: #666;
        }
      }
      .empty-tip {
        color: #999;
      }
      .var-row {
        color: #333;
      }
      .var-name {
        color: #0070c1;
      }
      .var-type {
        color: #795e26;
      }
      .var-value {
        color: #116644;
      }
    }

    .panel-restore-bar {
      background: #f0f0f0;
      border-top-color: #e0e0e0;
      .restore-tab {
        color: #555;
        &:hover {
          color: #111;
          background: #e0e0e0;
        }
      }
    }

    .sidebar-resizer {
      background: #e0e0e0;
      &:hover {
        background: #0078d4;
      }
      .sidebar-resizer-collapse {
        background: #e0e0e0;
        color: #666;
        &:hover {
          color: #fff;
          background: #0078d4;
        }
      }
    }

    .sidebar-collapsed-bar {
      background: #f5f5f5;
      border-right-color: #e0e0e0;
      color: #666;
      &:hover {
        background: #e0e0e0;
        color: #333;
      }
    }

    .panel-resizer {
      background: #e0e0e0;
      &:hover {
        background: #0078d4;
      }
    }
  }
}

// 顶部工具栏
.ide-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  background: #2d2d2d;
  border-bottom: 1px solid #404040;
  flex-shrink: 0;

  .ide-title {
    font-size: 14px;
    font-weight: 600;
    color: #cccccc;
  }

  .toolbar-right {
    display: flex;
    gap: 4px;
    align-items: center;
  }

  .tb-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: 6px;
    cursor: pointer;
    color: #ccc;
    transition:
      background 0.15s,
      color 0.15s;

    &:hover {
      background: rgba(255, 255, 255, 0.12);
      color: #fff;
    }

    &.disabled {
      opacity: 0.35;
      cursor: not-allowed;
      pointer-events: none;
    }

    &.active {
      color: #4caf50;
    }

    &.btn-debug-active {
      color: #ef5350;
    }
  }
}

// 主体布局
.ide-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

// 右侧：编辑器 + 底部面板
.ide-main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

// 左侧边栏
.sidebar-resizer {
  width: 5px;
  cursor: ew-resize;
  background: #404040;
  flex-shrink: 0;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
  &:hover {
    background: #0078d4;
  }
  .sidebar-resizer-collapse {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 14px;
    height: 28px;
    background: #404040;
    border-radius: 0 4px 4px 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: #ccc;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.15s;
    &:hover {
      color: #fff;
      background: #0078d4;
    }
  }
  &:hover .sidebar-resizer-collapse {
    opacity: 1;
  }
}

.sidebar-collapsed-bar {
  width: 14px;
  background: #2d2d2d;
  border-right: 1px solid #404040;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: #888;
  flex-shrink: 0;
  &:hover {
    background: #3a3a3a;
    color: #fff;
  }
}

.ide-sidebar {
  min-width: 0;
  background: #252526;
  border-right: none;
  overflow-y: hidden;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;

  &.ide-sidebar--collapsed {
    width: 0 !important;
    overflow: hidden;
  }

  .sidebar-section {
    padding: 8px;
    border-bottom: 1px solid #3a3a3a;
    flex-shrink: 0;

    &.sidebar-section--flex {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
      overflow: hidden;

      .file-list {
        flex: 1;
        overflow-y: auto;
        min-height: 0;
      }
    }
  }

  .section-title {
    font-size: 11px;
    color: #888;
    text-transform: uppercase;
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .kernel-status {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    margin-top: 4px;
    padding: 2px 4px;
    border-radius: 3px;

    &.running {
      color: #4caf50;
      background: rgba(76, 175, 80, 0.1);
    }

    &.stopped {
      color: #f44336;
      background: rgba(244, 67, 54, 0.1);
    }

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
    }
  }

  .file-list,
  .pkg-list,
  .backup-list {
    overflow-y: auto;
  }

  .pkg-list,
  .backup-list {
    max-height: 120px;
  }

  :deep(.file-item) {
    display: flex;
    align-items: center;
    padding: 3px 4px;
    border-radius: 3px;
    cursor: pointer;
    font-size: 12px;
    overflow: hidden;
    flex-wrap: nowrap;

    &:hover {
      background: #2a2d2e;
    }

    &.active {
      background: rgba(0, 120, 212, 0.25);
      color: #4fc3f7;
    }

    .file-actions {
      display: flex;
      gap: 2px;
      flex-shrink: 0;
      margin-left: auto;
      opacity: 0;
      transition: opacity 0.15s;
    }

    &:hover .file-actions,
    &.active .file-actions {
      opacity: 1;
    }

    .file-name {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .file-icon {
      font-size: 11px;
      margin-right: 3px;
      flex-shrink: 0;
    }

    .file-action-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      font-size: 12px;
      border-radius: 2px;
      cursor: pointer;
      color: #888;
      &:hover {
        color: #fff;
        background: rgba(255, 255, 255, 0.15);
      }
    }
  }

  :deep(.tree-dir) {
    .tree-dir-label {
      display: flex;
      align-items: center;
      gap: 3px;
      padding: 2px 4px;
      border-radius: 3px;
      font-size: 12px;
      color: #ccc;
      cursor: pointer;
      &:hover {
        background: rgba(255, 255, 255, 0.08);
      }
      &.tree-dir-selected {
        background: rgba(0, 120, 212, 0.25);
        color: #4fc3f7;
      }
      .tree-dir-arrow {
        width: 14px;
        font-size: 10px;
        color: #888;
        cursor: pointer;
        flex-shrink: 0;
        text-align: center;
      }
      .tree-dir-icon {
        font-size: 11px;
        flex-shrink: 0;
      }
      .tree-dir-name {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        cursor: default;
      }
      .dir-actions {
        display: flex;
        gap: 2px;
        flex-shrink: 0;
        margin-left: auto;
        opacity: 0;
        transition: opacity 0.15s;
      }
      &:hover .dir-actions,
      &.tree-dir-selected .dir-actions {
        opacity: 1;
      }
      .dir-action-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 16px;
        height: 16px;
        font-size: 12px;
        border-radius: 2px;
        cursor: pointer;
        color: #888;
        &:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.15);
        }
      }
    }
  }

  .pkg-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 2px 4px;
    font-size: 11px;
    &:hover {
      background: rgba(255, 255, 255, 0.04);
    }

    .pkg-name {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .pkg-version {
      color: #888;
      margin: 0 4px;
      flex-shrink: 0;
    }

    .pkg-uninstall {
      flex-shrink: 0;
      color: #e06c75 !important;
      opacity: 0;
      transition: opacity 0.15s;
    }

    &:hover .pkg-uninstall {
      opacity: 1;
    }
  }

  .backup-item {
    padding: 4px;
    border-bottom: 1px solid #3a3a3a;
    font-size: 11px;

    .backup-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .backup-remark {
      color: #ccc;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .backup-time {
      color: #888;
    }

    .backup-actions {
      display: flex;
      gap: 4px;
      margin-top: 2px;
    }
  }

  .empty-tip {
    color: #666;
    font-size: 11px;
    padding: 4px;
  }
}

// 中间编辑器区域
.ide-editor-area {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 120px;

  .editor-tabs {
    display: flex;
    background: #2d2d2d;
    border-bottom: 1px solid #404040;
    flex-shrink: 0;
    overflow-x: auto;

    .editor-tab {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 6px 12px;
      font-size: 12px;
      cursor: pointer;
      border-right: 1px solid #404040;
      white-space: nowrap;
      color: #999;

      &:hover {
        background: #3a3a3a;
      }

      &.active {
        background: #1e1e1e;
        color: #fff;
        border-bottom: 2px solid #0078d4;
      }

      .tab-modified {
        color: #e5c07b;
        font-size: 10px;
      }

      .tab-close {
        color: #666;
        &:hover {
          color: #fff;
        }
      }
    }
  }

  .editor-container {
    flex: 1;
    overflow: hidden;
  }
}

// 拖拽分割线
.panel-resizer {
  height: 4px;
  background: #404040;
  cursor: ns-resize;
  flex-shrink: 0;
  transition: background 0.15s;
  &:hover {
    background: #0078d4;
  }
}

// 底部面板
.ide-bottom-panel {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
  background: #252526;
  border-top: 1px solid #404040;

  .panel-tabs {
    display: flex;
    align-items: center;
    border-bottom: 1px solid #404040;
    flex-shrink: 0;
    background: #2d2d2d;

    // 调试动作图标栏
    .debug-action-bar {
      display: flex;
      align-items: center;
      padding: 0 4px;
      gap: 1px;
      flex-shrink: 0;
    }

    .dbg-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 26px;
      border-radius: 3px;
      cursor: not-allowed;
      opacity: 0.45;
      transition:
        opacity 0.15s,
        background 0.15s;
      svg {
        display: block;
      }

      &.active {
        cursor: pointer;
        opacity: 1;
        &:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        &:active {
          background: rgba(255, 255, 255, 0.15);
        }
      }
    }

    .dbg-sep {
      display: inline-block;
      width: 1px;
      height: 16px;
      background: #444;
      margin: 0 3px;
      flex-shrink: 0;
    }

    .dbg-sep-v {
      width: 1px;
      height: 20px;
      background: #404040;
      margin: 0 4px;
      flex-shrink: 0;
    }

    .panel-tab {
      padding: 5px 14px;
      font-size: 12px;
      cursor: pointer;
      color: #999;
      &:hover {
        background: #3a3a3a;
      }
      &.active {
        color: #fff;
        border-bottom: 2px solid #0078d4;
      }
    }

    .panel-tab-right {
      margin-left: auto;
      padding: 0 8px;
    }
    .panel-collapse-btn {
      cursor: pointer;
      color: #666;
      font-size: 12px;
      padding: 2px 4px;
      &:hover {
        color: #fff;
      }
    }
  }

  .panel-content {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
  }
}

// 面板折叠时的恢复条
.panel-restore-bar {
  display: flex;
  background: #2d2d2d;
  border-top: 1px solid #404040;
  flex-shrink: 0;

  .restore-tab {
    padding: 4px 14px;
    font-size: 12px;
    cursor: pointer;
    color: #888;
    &:hover {
      color: #fff;
      background: #3a3a3a;
    }
  }
}

// 变量展开样式
.var-item {
  .var-row {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 3px 0;
    font-size: 11px;
    border-bottom: 1px solid #3a3a3a;
    .expand-arrow {
      width: 12px;
      font-size: 9px;
      color: #888;
      cursor: pointer;
      flex-shrink: 0;
    }
    .var-name {
      color: #9cdcfe;
      min-width: 80px;
    }
    .var-type {
      color: #ce9178;
      min-width: 60px;
    }
    .var-value {
      color: #d4d4d4;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    &.expandable {
      cursor: pointer;
      &:hover {
        background: rgba(255, 255, 255, 0.04);
      }
    }
  }
  .var-children {
    padding-left: 20px;
    border-left: 1px solid #3a3a3a;
    margin-left: 6px;
    .child-row {
      border-bottom: 1px solid #2a2a2a;
    }
  }
}
// 内联式公共样式（不需要 ide-right-panel scope）
.debug-section-title {
  font-size: 11px;
  color: #888;
  margin: 8px 0 4px;
  text-transform: uppercase;
}

.stack-frame {
  display: flex;
  flex-direction: column;
  padding: 4px 6px;
  margin-bottom: 2px;
  border-radius: 3px;
  border-left: 2px solid #569cd6;
  background: rgba(86, 156, 214, 0.06);
  .frame-name {
    color: #d4d4d4;
    font-size: 11px;
    font-weight: 500;
  }
  .frame-location {
    color: #9cdcfe;
    font-size: 10px;
    margin-top: 2px;
  }
}

.debug-idle-tip {
  padding: 4px 0;
  .debug-tip-title {
    font-size: 12px;
    color: #ccc;
    font-weight: bold;
    margin-bottom: 6px;
  }
  .debug-tip-steps {
    margin: 0 0 8px 16px;
    padding: 0;
    font-size: 11px;
    color: #999;
    line-height: 1.8;
  }
}

.breakpoint-list-preview {
  margin-top: 4px;
  border-top: 1px solid #3a3a3a;
  padding-top: 4px;
  .bp-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 2px 0;
    font-size: 11px;
    color: #d4d4d4;
    .bp-dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #e51400;
      flex-shrink: 0;
    }
  }
}

.output-panel {
  display: flex;
  flex-direction: column;
  padding: 0;
  .output-toolbar {
    padding: 4px 8px;
    border-bottom: 1px solid #3a3a3a;
    flex-shrink: 0;
  }
  .output-content {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
    font-family: 'Consolas', monospace;
    font-size: 12px;
  }
  .output-line {
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-all;
    &.stdout {
      color: #d4d4d4;
    }
    &.error {
      color: #f44747;
    }
    &.info {
      color: #569cd6;
    }
    &.result {
      color: #b5cea8;
    }
    &.debug {
      color: #dcdcaa;
    }
  }
}

.empty-tip {
  color: #666;
  font-size: 11px;
  padding: 4px;
}

// 服务列表
.service-list {
  .service-item {
    padding: 6px 4px;
    border-bottom: 1px solid #3a3a3a;
    &:last-child {
      border-bottom: none;
    }
  }
  .service-header {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-bottom: 2px;
  }
  .service-name {
    font-size: 12px;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .service-status {
    font-size: 10px;
    padding: 1px 4px;
    border-radius: 2px;
    flex-shrink: 0;
    &.active {
      background: rgba(76, 175, 80, 0.2);
      color: #4caf50;
    }
    &.inactive {
      background: rgba(158, 158, 158, 0.2);
      color: #9e9e9e;
    }
  }
  .service-script {
    font-size: 11px;
    color: #888;
    margin-bottom: 3px;
    padding-left: 2px;
  }
  .service-actions {
    display: flex;
    gap: 2px;
  }
}

// 安装依赖弹窗
.install-nuget {
  display: flex;
  gap: 0;
  height: 580px;

  // ===== 亮色主题（默认）=====
  --pkg-bg: #ffffff;
  --pkg-list-bg: #f5f5f5;
  --pkg-border: #e0e0e0;
  --pkg-item-border: #ebebeb;
  --pkg-item-hover: #eaf3ff;
  --pkg-item-active: #0078d4;
  --pkg-item-active-text: #fff;
  --pkg-name-color: #0066cc;
  --pkg-desc-color: #888;
  --pkg-label-color: #555;
  --pkg-detail-name: #0066cc;
  --pkg-detail-desc: #555;
  --pkg-meta-color: #777;
  --pkg-meta-span: #999;
  --pkg-log-bg: #f8f8f8;
  --pkg-log-border: #e0e0e0;
  --pkg-log-text: #333;
  --pkg-empty-color: #aaa;
  --pkg-tip-color: #aaa;
  --pkg-divider: #e0e0e0;

  // ===== 暗色主题 =====
  &.dark {
    --pkg-bg: #1e1e1e;
    --pkg-list-bg: #1a1a1a;
    --pkg-border: #3a3a3a;
    --pkg-item-border: #2a2a2a;
    --pkg-item-hover: #2a2d2e;
    --pkg-item-active: #094771;
    --pkg-item-active-text: #fff;
    --pkg-name-color: #9cdcfe;
    --pkg-desc-color: #777;
    --pkg-label-color: #888;
    --pkg-detail-name: #9cdcfe;
    --pkg-detail-desc: #aaa;
    --pkg-meta-color: #888;
    --pkg-meta-span: #666;
    --pkg-log-bg: #1a1a1a;
    --pkg-log-border: #3a3a3a;
    --pkg-log-text: #d4d4d4;
    --pkg-empty-color: #555;
    --pkg-tip-color: #666;
    --pkg-divider: #3a3a3a;
  }

  // 左侧：搜索 + 包列表
  .install-left {
    width: 320px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    border-right: 1px solid var(--pkg-divider);
    padding-right: 12px;
    margin-right: 12px;

    .install-mirror-row {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 6px;
      .install-mirror-label {
        font-size: 12px;
        color: var(--pkg-label-color);
        white-space: nowrap;
      }
    }
    .install-mirror-custom {
      margin-bottom: 6px;
    }
    .install-search-bar {
      margin-bottom: 8px;
    }
    .install-pkg-list {
      flex: 1;
      overflow-y: auto;
      border: 1px solid var(--pkg-border);
      border-radius: 4px;
      background: var(--pkg-list-bg);

      .install-list-tip {
        padding: 16px;
        font-size: 12px;
        color: var(--pkg-tip-color);
        text-align: center;
        &--sub {
          padding: 6px 10px;
          text-align: left;
          font-size: 11px;
        }
        .install-manual-entry {
          margin-top: 10px;
          padding: 6px 12px;
          border-radius: 4px;
          border: 1px dashed var(--pkg-border);
          color: var(--pkg-name-color);
          font-size: 12px;
          cursor: pointer;
          font-family: 'Consolas', monospace;
          transition:
            background 0.15s,
            border-color 0.15s;
          &:hover {
            background: var(--pkg-item-hover);
            border-color: var(--pkg-name-color);
          }
        }
      }
      .install-list-section {
        padding: 4px 10px;
        font-size: 11px;
        color: var(--pkg-tip-color);
        background: var(--pkg-item-border);
        font-weight: 600;
        letter-spacing: 0.5px;
        text-transform: uppercase;
      }
      .install-pkg-item {
        padding: 8px 10px;
        cursor: pointer;
        border-bottom: 1px solid var(--pkg-item-border);
        transition: background 0.15s;
        &:hover {
          background: var(--pkg-item-hover);
        }
        &.active {
          background: var(--pkg-item-active);
          .install-pkg-name {
            color: var(--pkg-item-active-text);
          }
          .install-pkg-desc {
            color: rgba(255, 255, 255, 0.7);
          }
        }
        .install-pkg-name {
          font-size: 13px;
          color: var(--pkg-name-color);
          font-weight: 500;
          font-family: 'Consolas', monospace;
        }
        .install-pkg-desc {
          font-size: 11px;
          color: var(--pkg-desc-color);
          margin-top: 2px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
  }

  // 右侧：包详情 + 版本选择 + 安装
  .install-right {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .install-right-empty {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--pkg-empty-color);
      font-size: 13px;
    }
    .install-detail-name {
      font-size: 18px;
      font-weight: 600;
      color: var(--pkg-detail-name);
      font-family: 'Consolas', monospace;
      margin-bottom: 4px;
    }
    .install-detail-desc {
      font-size: 13px;
      color: var(--pkg-detail-desc);
      margin-bottom: 12px;
      line-height: 1.5;
    }
    .install-version-row {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 4px;
      .install-version-label {
        font-size: 13px;
        color: var(--pkg-label-color);
        white-space: nowrap;
      }
    }
    .install-detail-meta {
      margin: 8px 0;
      font-size: 12px;
      color: var(--pkg-meta-color);
      line-height: 1.8;
      span {
        color: var(--pkg-meta-span);
        margin-right: 4px;
      }
      a {
        color: #0078d4;
        text-decoration: none;
        &:hover {
          text-decoration: underline;
        }
      }
    }
    .install-action-row {
      margin: 10px 0 8px;
    }
    .install-output {
      flex: 1;
      overflow-y: auto;
      background: var(--pkg-log-bg);
      border: 1px solid var(--pkg-log-border);
      border-radius: 4px;
      padding: 8px 10px;
      min-height: 120px;
      pre {
        margin: 0;
        font-family: 'Consolas', monospace;
        font-size: 12px;
        color: var(--pkg-log-text);
        white-space: pre-wrap;
        word-break: break-all;
        line-height: 1.6;
      }
    }
    .install-placeholder {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--pkg-empty-color);
      font-size: 12px;
      background: var(--pkg-log-bg);
      border: 1px solid var(--pkg-log-border);
      border-radius: 4px;
      min-height: 120px;
    }
  }
}

// 发布表单
.publish-form {
  .pub-field {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
    label {
      width: 90px;
      flex-shrink: 0;
      font-size: 13px;
      color: #aaa;
      text-align: right;
    }
    .pub-script-name {
      font-size: 13px;
      color: #9cdcfe;
      font-family: 'Consolas', monospace;
    }
    &.pub-field-desc {
      align-items: flex-start;
      label {
        margin-top: 6px;
      }
    }
  }
  .pub-apikey-row {
    display: flex;
    align-items: center;
    gap: 6px;
    flex: 1;
    .pub-apikey-input {
      flex: 1;
    }
  }
  .pub-result {
    margin-top: 12px;
    padding: 10px 12px;
    background: rgba(76, 175, 80, 0.08);
    border: 1px solid rgba(76, 175, 80, 0.3);
    border-radius: 4px;
  }
  .pub-result-title {
    font-size: 13px;
    color: #4caf50;
    margin-bottom: 8px;
  }
  .pub-invoke-tip {
    font-size: 11px;
    color: #888;
    line-height: 1.8;
    code {
      background: rgba(255, 255, 255, 0.05);
      padding: 1px 4px;
      border-radius: 2px;
      font-family: 'Consolas', monospace;
      color: #9cdcfe;
    }
  }
}

// ===================== AI 对话面板样式 =====================
.ai-panel-resizer {
  width: 4px;
  cursor: col-resize;
  background: transparent;
  flex-shrink: 0;
  &:hover {
    background: rgba(0, 120, 212, 0.3);
  }
}

.ai-panel {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  background: #252526;
  border-left: 1px solid #404040;
  overflow: hidden;

  .ai-panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background: #2d2d2d;
    border-bottom: 1px solid #404040;
    .ai-panel-title {
      font-size: 13px;
      font-weight: 600;
      color: #d4d4d4;
    }
    .ai-panel-title-name {
      font-weight: 400;
      color: #888;
      margin-left: 4px;
      font-size: 12px;
    }
    .ai-panel-close {
      cursor: pointer;
      font-size: 18px;
      color: #888;
      line-height: 1;
      &:hover {
        color: #fff;
      }
    }
  }

  // 切换助手标签栏
  .ai-panel-switch-bar {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    background: #222;
    border-bottom: 1px solid #333;
    .ai-switch-label {
      font-size: 11px;
      color: #666;
      flex-shrink: 0;
    }
    .ai-switch-tabs {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    }
    .ai-switch-tab {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 11px;
      cursor: pointer;
      border: 1px solid #444;
      background: #2d2d2d;
      color: #aaa;
      transition: all 0.15s;
      user-select: none;
      &:hover {
        background: #1a3a4a;
        border-color: #0078d4;
        color: #4fc3f7;
      }
      &.active {
        background: #0a2d45;
        border-color: #0078d4;
        color: #4fc3f7;
        font-weight: 500;
      }
    }
    .ai-tab-avatar {
      font-size: 12px;
      line-height: 1;
    }
  }

  .ai-panel-messages {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
    font-size: 13px;

    .ai-empty-tip {
      text-align: center;
      color: #666;
      font-size: 12px;
      margin-top: 40px;
      line-height: 1.8;
    }

    .ai-msg {
      margin-bottom: 12px;
      display: flex;
      // 用户消息：右对齐
      &.ai-msg-user {
        justify-content: flex-end;
      }
      // AI消息：左对齐
      &.ai-msg-assistant {
        justify-content: flex-start;
      }
    }

    .ai-msg-bubble {
      max-width: 92%;
      line-height: 1.6;
      word-break: break-word;
      font-size: 13px;
    }

    .ai-msg-bubble-user {
      background: #0078d4;
      color: #fff;
      padding: 8px 12px;
      border-radius: 14px 14px 4px 14px;
    }

    .ai-msg-bubble-ai {
      background: #2a2a2a;
      color: #d4d4d4;
      padding: 10px 12px;
      border-radius: 4px 14px 14px 14px;
      border: 1px solid #3a3a3a;
    }

    .ai-typing-indicator {
      display: flex;
      gap: 4px;
      padding: 8px 0;
      span {
        width: 6px;
        height: 6px;
        background: #555;
        border-radius: 50%;
        animation: ai-dot-pulse 1.2s ease-in-out infinite;
        &:nth-child(2) {
          animation-delay: 0.2s;
        }
        &:nth-child(3) {
          animation-delay: 0.4s;
        }
      }
    }
  }

  .ai-panel-input {
    border-top: 1px solid #404040;
    padding: 8px;
    .ai-input-textarea {
      width: 100%;
      resize: none;
      border: 1px solid #404040;
      border-radius: 4px;
      background: #1e1e1e;
      color: #d4d4d4;
      font-size: 13px;
      padding: 6px 8px;
      font-family: 'Consolas', monospace;
      box-sizing: border-box;
      &:focus {
        outline: none;
        border-color: #0078d4;
      }
      &:disabled {
        opacity: 0.5;
      }
    }
    .ai-input-actions {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 6px;
      .ai-input-hint {
        font-size: 11px;
        color: #666;
        flex: 1;
      }
      .ai-write-toggle {
        font-size: 15px;
        cursor: pointer;
        color: #666;
        padding: 1px 4px;
        border-radius: 3px;
        transition: color 0.15s, background 0.15s;
        &:hover {
          color: #4fc3f7;
          background: rgba(79, 195, 247, 0.12);
        }
        &.active {
          color: #4fc3f7;
          background: rgba(79, 195, 247, 0.18);
        }
      }
    }
  }
}

// AI 代码块样式
:deep(.ai-msg-md) {
  p {
    margin: 4px 0;
  }
  .ai-code-block {
    position: relative;
    margin: 8px 0;
    border: 1px solid #333;
    border-radius: 4px;
    overflow: hidden;
    .ai-code-actions {
      display: flex;
      gap: 8px;
      padding: 4px 8px;
      background: #2d2d2d;
      border-bottom: 1px solid #333;
      .ai-code-btn {
        font-size: 11px;
        color: #4fc3f7;
        cursor: pointer;
        &:hover {
          color: #81d4fa;
          text-decoration: underline;
        }
      }
    }
    pre {
      margin: 0;
      padding: 8px;
      overflow-x: auto;
      background: #1a1a1a;
      code {
        font-family: 'Consolas', monospace;
        font-size: 12px;
        color: #d4d4d4;
      }
    }
  }
  code:not(pre code) {
    background: rgba(255, 255, 255, 0.08);
    padding: 1px 4px;
    border-radius: 3px;
    font-size: 12px;
  }
}

@keyframes ai-dot-pulse {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}

// 亮色主题 AI 面板
.python-ide.theme-light {
  .ai-panel-resizer:hover {
    background: rgba(0, 120, 212, 0.15);
  }
  .ai-panel {
    background: #f8f8f8;
    border-left-color: #e0e0e0;
    .ai-panel-header {
      background: #fff;
      border-bottom-color: #e0e0e0;
      .ai-panel-title {
        color: #333;
      }
      .ai-panel-close {
        color: #999;
        &:hover {
          color: #333;
        }
      }
    }
    .ai-panel-title-name {
      color: #aaa;
    }
    .ai-panel-switch-bar {
      background: #f5f5f5;
      border-bottom-color: #e0e0e0;
      .ai-switch-label {
        color: #999;
      }
      .ai-switch-tab {
        background: #fff;
        border-color: #e0e0e0;
        color: #555;
        &:hover {
          background: #e8f4fe;
          border-color: #90caf9;
          color: #0078d4;
        }
        &.active {
          background: #e3f2fd;
          border-color: #0078d4;
          color: #0078d4;
        }
      }
    }
    .ai-panel-messages {
      .ai-empty-tip {
        color: #999;
      }
      .ai-msg {
        &.ai-msg-user .ai-msg-bubble-user {
          background: #0078d4;
          color: #fff;
        }
        &.ai-msg-assistant .ai-msg-bubble-ai {
          background: #f0f0f0;
          color: #333;
          border-color: #e0e0e0;
        }
      }
      .ai-typing-indicator span {
        background: #bbb;
      }
    }
    .ai-panel-input {
      border-top-color: #e0e0e0;
      .ai-input-textarea {
        background: #fff;
        border-color: #d0d0d0;
        color: #333;
        &:focus {
          border-color: #0078d4;
        }
      }
      .ai-input-hint {
        color: #999;
      }
    }
  }
  :deep(.ai-msg-md) {
    .ai-code-block {
      border-color: #ddd;
      .ai-code-actions {
        background: #f0f0f0;
        border-bottom-color: #ddd;
        .ai-code-btn {
          color: #0078d4;
          &:hover {
            color: #005a9e;
          }
        }
      }
      pre {
        background: #f5f5f5;
        code {
          color: #333;
        }
      }
    }
    code:not(pre code) {
      background: rgba(0, 0, 0, 0.06);
    }
  }
}
</style>

<!-- Monaco 注入到 DOM 的类必须为全局样式 -->
<style>
/* 断点红点 glyph */
.breakpoint-glyph {
  cursor: pointer;
  background: #e51400;
  border-radius: 50%;
  width: 10px !important;
  height: 10px !important;
  margin-top: 3px;
  margin-left: 3px;
}

/* 调试当前暂停行：黄色背景 */
.debug-current-line {
  background: rgba(255, 215, 0, 0.2) !important;
  border-left: 2px solid #ffd700;
}

/* 调试当前行 glyph：黄色箭头 */
.debug-current-glyph::before {
  content: '\25B6';
  color: #ffd700;
  font-size: 10px;
  line-height: 18px;
  margin-left: 2px;
}
</style>
