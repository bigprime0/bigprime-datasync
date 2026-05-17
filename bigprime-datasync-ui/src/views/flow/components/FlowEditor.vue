<template>
  <div ref="editorContainer" :class="{ 'fullscreen-mode': isFullscreen }" style="width: 100%; height: calc(100vh - 116px)">
    <!-- 顶部操作按钮区 -->
    <div class="editor-header">
      <div class="header-left">
        <tiny-button size="small" @click="handleBack">
          <IconArrowLeft />
          返回
        </tiny-button>
        <span class="flow-title">{{ flowTitle }}</span>
      </div>
      <div class="header-right">
        <tiny-button size="small" @click="toggleFullscreen">
          <IconFullscreen v-if="!isFullscreen" />
          <IconMinscreen v-else />
          {{ isFullscreen ? '退出全屏' : '全屏' }}
        </tiny-button>
        <tiny-button size="small" @click="handleValidate(true)">校验</tiny-button>
        <tiny-button size="small" type="primary" @click="handleSave">保存</tiny-button>
      </div>
    </div>

    <!-- 流程编辑画布 -->
    <div ref="flowCanvasContainer">
      <Tinyflow
        className="custom-class"
        :style="{ width: '100%', height: isFullscreen ? 'calc(100vh - 60px)' : 'calc(100vh - 176px)' }"
        :data="initialData"
        :customNodes="customNodes"
        groupSeparator="&"
        ref="tinyflowRef"
        :onNodeAdd="handleNodeAdd"
        :onDataChange="handleDataChange"
      />
    </div>

    <!-- 数据源选择弹窗 -->
    <DataSourceSelector
      v-model:visible="dataSourceModal.visible"
      :current-value="dataSourceModal.selectedId"
      @confirm="handleDataSourceConfirm"
    />

    <!-- 本地文件上传弹窗 -->
    <tiny-dialog-box
      v-model:visible="fileUploadModal.visible"
      title="上传文件"
      width="600px"
      :close-on-click-modal="false"
    >
      <div style="padding: 8px 0 16px;">
        <div style="color: #666; font-size: 12px; margin-bottom: 12px;">
          服务器上传目录：<span style="font-weight:600; color: #333">{{ fileUploadModal.uploadDir || '加载中...' }}</span>
        </div>
        <!-- 上传区域 -->
        <div
          style="border: 2px dashed #d9d9d9; border-radius: 6px; padding: 20px; text-align: center; cursor: pointer; background: #fafafa; margin-bottom: 12px;"
          @click="triggerFileInput"
          @dragover.prevent
          @drop.prevent="handleFileDrop"
        >
          <div style="color: #999; font-size: 14px;">点击或拖拽文件到此处上传</div>
          <div style="color: #bbb; font-size: 12px; margin-top: 4px;">支持 CSV、JSON、Excel、XML、Parquet 等格式</div>
          <input
            ref="fileInputRef"
            type="file"
            style="display: none"
            @change="handleFileInputChange"
          />
        </div>
        <!-- 上传状态 -->
        <div v-if="fileUploadModal.uploading" style="text-align:center; color: #1890ff; margin-bottom: 8px;">上传中...</div>
        <!-- 已上传文件列表（单选） -->
        <div v-if="fileUploadModal.files.length > 0">
          <div style="font-size: 13px; font-weight: 600; margin-bottom: 6px;">
            已上传文件（{{ fileUploadModal.files.length }}）——点击选择要使用的文件
          </div>
          <div
            v-for="f in fileUploadModal.files"
            :key="f.name"
            :style="{
              display:'flex', alignItems:'center', justifyContent:'space-between',
              padding: '6px 10px', borderRadius: '4px', marginBottom: '4px', cursor: 'pointer',
              background: fileUploadModal.selectedFileName === f.name ? '#e6f4ff' : '#f5f5f5',
              border: fileUploadModal.selectedFileName === f.name ? '1px solid #1890ff' : '1px solid transparent'
            }"
            @click="fileUploadModal.selectedFileName = f.name"
          >
            <div style="display:flex; align-items:center; gap:6px;">
              <span style="width:14px; height:14px; border-radius:50%; border:2px solid #1890ff; display:inline-block; flex-shrink:0;"
                :style="fileUploadModal.selectedFileName === f.name ? 'background:#1890ff' : ''"
              ></span>
              <span style="font-size: 13px;">{{ f.name }}</span>
              <span style="font-size: 11px; color: #999;">{{ formatFileSize(f.size) }}</span>
            </div>
            <tiny-button
              size="mini"
              type="danger"
              @click.stop="handleDeleteUploadedFile(f.name)"
            >删除</tiny-button>
          </div>
        </div>
        <div v-else style="color: #bbb; font-size: 12px; text-align: center; padding: 8px 0;">Uploadfile 目录下暂无文件</div>
        <!-- 自动 schema 开关（仅 CSV/TXT 文件显示） -->
        <div
          v-if="fileUploadModal.selectedFileName &&
                (fileUploadModal.selectedFileName.toLowerCase().endsWith('.csv') ||
                 fileUploadModal.selectedFileName.toLowerCase().endsWith('.txt'))"
          style="margin-top:12px; padding:8px 10px; background:#f0f7ff; border-radius:4px; display:flex; align-items:center; gap:8px;"
        >
          <input
            type="checkbox"
            id="autoParseSchema"
            v-model="fileUploadModal.autoParseSchema"
            style="cursor:pointer; width:14px; height:14px;"
          />
          <label for="autoParseSchema" style="font-size:12px; color:#333; cursor:pointer;">
            自动解析 CSV 标题行生成 schema（回填到「字段定义」字段）
          </label>
        </div>
      </div>
      <template #footer>
        <tiny-button @click="fileUploadModal.visible = false">取消</tiny-button>
        <tiny-button type="primary" @click="handleFileUploadConfirm">
          确定{{ fileUploadModal.selectedFileName ? `（使用目录 + 回填 ${fileUploadModal.selectedFileName}）` : '（使用该目录）' }}
        </tiny-button>
      </template>
    </tiny-dialog-box>

    <!-- 流程名称输入对话框 -->
    <tiny-dialog-box
      v-model:visible="showNameDialog"
      title="保存流程"
      width="500px"
      :close-on-click-modal="false"
    >
      <div style="padding: 20px 0;">
        <tiny-form label-position="left" label-width="100px">
          <tiny-form-item label="流程名称" required>
            <tiny-input
              v-model="flowNameInput"
              placeholder="请输入流程名称（必填）"
              @keyup.enter="confirmFlowName"
            />
          </tiny-form-item>
          <tiny-form-item label="流程描述">
            <tiny-input
              v-model="flowDescInput"
              type="textarea"
              :rows="3"
              placeholder="请输入流程描述（可选）"
            />
          </tiny-form-item>
          <tiny-form-item label="执行模式">
            <tiny-radio v-model="executionMode" label="http">同步模式(HTTP)</tiny-radio>
            <tiny-radio v-model="executionMode" label="mq">异步模式(MQ)</tiny-radio>
            <div style="color: #999; font-size: 12px; margin-top: 4px;">
              <div v-if="executionMode === 'http'">适用于执行时间&lt;10秒的快速任务，实时返回结果</div>
              <div v-else>适用于执行时间>10秒的长任务，消息驱动、异步执行</div>
            </div>
          </tiny-form-item>
        </tiny-form>
      </div>
      <template #footer>
        <tiny-button @click="showNameDialog = false">取消</tiny-button>
        <tiny-button type="primary" @click="confirmFlowName">确定</tiny-button>
      </template>
    </tiny-dialog-box>
  </div>
</template>



<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { Button as TinyButton, Modal, DialogBox as TinyDialogBox, Form as TinyForm, FormItem as TinyFormItem, Input as TinyInput, Radio as TinyRadio } from '@opentiny/vue'
import { iconArrowLeft, iconFullscreen, iconMinscreen } from '@opentiny/vue-icon'
import {Tinyflow} from '@/assets/tinyflow/index.js'
import '@/assets/tinyflow/index.css'
import { ActionService } from '@/services/action'
import { FlowService } from '@/services/flow'
import { LocalFileService } from '@/services/localfile'
import DataSourceSelector from './DataSourceSelector.vue'

// Props
const props = defineProps<{
  currentRow?: any
}>()

// Emits
const emit = defineEmits<{
  back: []
}>()

const tinyflowRef = ref<InstanceType<typeof Tinyflow> | null>(null);
const flowCanvasContainer = ref<HTMLElement | null>(null);
const editorContainer = ref<HTMLElement | null>(null);
const isFullscreen = ref(false);
const flowNameInput = ref('');
const flowDescInput = ref('');
const showNameDialog = ref(false);
const executionMode = ref('http'); // 默认HTTP同步模式

// 图标组件
const IconArrowLeft = iconArrowLeft();
const IconFullscreen = iconFullscreen();
const IconMinscreen = iconMinscreen();

// 流程标题
const flowTitle = computed(() => {
  return props.currentRow ? `编辑流程 - ${props.currentRow.name}` : '新建流程'
})

// CSS 伪全屏切换
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value;
};

// 全局原始数据变量，保存后台返回的所有Action原始数据
const actionsData = ref<any[]>([]);


// 数据源弹窗状态管理
const dataSourceModal = reactive({
  visible: false,
  selectedId: '',
  fieldName: '',
  updateNodeData: null as any
});

// 打开数据源选择弹窗
const openDataSourceModal = (updateNodeData: any, value: any, fieldName: string) => {
  dataSourceModal.updateNodeData = updateNodeData;
  dataSourceModal.selectedId = value || '';
  dataSourceModal.fieldName = fieldName;
  dataSourceModal.visible = true;
};

// 确认选择数据源
const handleDataSourceConfirm = (data: { id: string; name: string }) => {
  if (dataSourceModal.updateNodeData) {
    // 将id赋值到对应字段，name用于展示
    dataSourceModal.updateNodeData({
      [dataSourceModal.fieldName]: data.id,
      [`${dataSourceModal.fieldName}Label`]: data.name
    });
  }
  dataSourceModal.visible = false;
  setTimeout(() => {
    dataSourceModal.updateNodeData = null;
    dataSourceModal.fieldName = '';
  }, 300);
};

// 关闭数据源选择弹窗
const handleDataSourceClose = () => {
  dataSourceModal.visible = false;
  setTimeout(() => {
    dataSourceModal.updateNodeData = null;
    dataSourceModal.fieldName = '';
  }, 300);
};

// 文件上传弹窗状态
const fileInputRef = ref<HTMLInputElement | null>(null);
const fileUploadModal = reactive({
  visible: false,
  uploading: false,
  uploadDir: '',
  files: [] as Array<{ name: string; size: number; lastModified: number }>,
  fieldName: '',
  updateNodeData: null as any,
  lastFileName: '',       // 最近一次上传的文件名
  selectedFileName: '',   // 弹窗中用户勾选的文件
  autoParseSchema: true   // 是否自动解析 schema
});

// 打开文件上传弹窗
const openFileUploadModal = async (updateNodeData: any, fieldName: string) => {
  fileUploadModal.updateNodeData = updateNodeData;
  fileUploadModal.fieldName = fieldName;
  fileUploadModal.lastFileName = '';
  fileUploadModal.selectedFileName = '';
  fileUploadModal.autoParseSchema = true;
  fileUploadModal.visible = true;
  // 获取上传目录和文件列表
  try {
    const res = await LocalFileService.getUploadDir();
    if (res && res.data && res.data.uploadDir) {
      fileUploadModal.uploadDir = res.data.uploadDir;
      fileUploadModal.files = res.data.files || [];
    }
  } catch (e) {
    console.warn('获取上传目录失败', e);
  }
};

// 触发文件选择
const triggerFileInput = () => {
  fileInputRef.value?.click();
};

// 处理文件选择 input change
const handleFileInputChange = async (e: Event) => {
  const input = e.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    await doUploadFile(input.files[0]);
    input.value = ''; // 重置上传控件
  }
};

// 拖拽上传
const handleFileDrop = async (e: DragEvent) => {
  const files = e.dataTransfer?.files;
  if (files && files.length > 0) {
    await doUploadFile(files[0]);
  }
};

// 执行上传
const doUploadFile = async (file: File) => {
  fileUploadModal.uploading = true;
  try {
    await LocalFileService.uploadFile(file);
    // 上传成功后刷新文件列表并记录文件名
    fileUploadModal.lastFileName = file.name;
    fileUploadModal.selectedFileName = file.name;
    const res = await LocalFileService.getUploadDir();
    if (res && res.data && res.data.uploadDir) {
      fileUploadModal.uploadDir = res.data.uploadDir;
      fileUploadModal.files = res.data.files || [];
    }
    Modal.message({ message: `文件 ${file.name} 上传成功`, status: 'success' });
  } catch (e: any) {
    Modal.message({ message: `上传失败: ${e.message}`, status: 'error' });
  } finally {
    fileUploadModal.uploading = false;
  }
};

// 删除已上传文件
const handleDeleteUploadedFile = async (fileName: string) => {
  try {
    await LocalFileService.deleteFile(fileName);
    fileUploadModal.files = fileUploadModal.files.filter(f => f.name !== fileName);
    Modal.message({ message: `文件 ${fileName} 已删除`, status: 'success' });
  } catch (e: any) {
    Modal.message({ message: `删除失败: ${e.message}`, status: 'error' });
  }
};

// 确定使用 uploadfile 目录
const handleFileUploadConfirm = async () => {
  if (!fileUploadModal.updateNodeData) return;

  const patchData: Record<string, any> = {};

  // path 字段：仅当用户未填写时预填 uploadDir（不强制覆盖，支持手动修改为远程服务器路径）
  if (fileUploadModal.uploadDir) {
    patchData['path'] = fileUploadModal.uploadDir;
  }

  const selectedFile = fileUploadModal.selectedFileName;

  // 根据文件扩展名自动推断文件格式并回填
  if (selectedFile) {
    const ext = selectedFile.toLowerCase().split('.').pop() || '';
    const extFormatMap: Record<string, string> = {
      csv: 'csv', txt: 'text', json: 'json',
      parquet: 'parquet', orc: 'orc',
      xlsx: 'excel', xls: 'excel',
      xml: 'xml'
    };
    const detectedFormat = extFormatMap[ext];
    if (detectedFormat) {
      patchData['fileFormatType'] = detectedFormat;
    }
  }

  // 回填文件名过滤字段：将文件名转义为正则
  if (selectedFile) {
    const escapedName = selectedFile.replace(/[.+*?^${}()|[\]\\]/g, '\\$&');
    patchData['fileFilterPattern'] = escapedName;
  }

  // 自动解析 schema：仅当勾选了自动解析且选了文件且是 CSV/Text 格式
  if (fileUploadModal.autoParseSchema && selectedFile &&
      (selectedFile.toLowerCase().endsWith('.csv') || selectedFile.toLowerCase().endsWith('.txt'))) {
    try {
      const res = await LocalFileService.parseSchema(selectedFile);
      if (res && res.data && res.data.schemaFields) {
        patchData['schemaFields'] = res.data.schemaFields;
        // 同时回填检测到的分隔符（非逗号时）
        if (res.data.delimiter && res.data.delimiter !== ',') {
          patchData['fieldDelimiter'] = res.data.delimiter;
        }
      }
    } catch (e) {
      console.warn('自动解析 schema 失败，跳过', e);
    }
  }

  fileUploadModal.updateNodeData(patchData);
  fileUploadModal.visible = false;
  setTimeout(() => {
    fileUploadModal.updateNodeData = null;
    fileUploadModal.fieldName = '';
    fileUploadModal.lastFileName = '';
    fileUploadModal.selectedFileName = '';
  }, 300);
};

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// 自定义节点配置，从后台接口获取
const customNodes = ref<any[]>([]);

// 从后台获取并转换Action数据为Tinyflow的customNodes格式
const loadCustomNodes = async () => {
  try {
    // 请求后台接口，获取10000条数据
    const response = await ActionService.getActionList({
      page: 1,
      pageSize: 10000,
      search: ''
    });

    if (response && response.data && response.data.list) {
      // 过滤：fstCategory=Pipeline 且 status=1
      const filteredActions = response.data.list.filter((action: any) => 
        action.fstCategory === 'Pipeline' && action.status === 1 && action.namespace === 'cn.bigprime'
      );
      
      // 将过滤后的数据保存到全局变量
      actionsData.value = filteredActions;

      // 转换为Tinyflow的customNodes格式
      const nodes = filteredActions.map((action: any, index: number) => {
        // 去除name中的括号及内容，如：PostgreSQL数据源(SeaTunnel 2.3.12) -> PostgreSQL数据源
        const cleanName = action.name ? action.name.replace(/\s*\([^)]*\)\s*/g, '').trim() : '';
        
        // 构建group: 一级目录sndCategory(version) . 二级目录trdCategory
        // 一级目录格式: sndCategory(version)
        const firstLevel = action.version ? `${action.sndCategory}-${action.version}` : action.sndCategory;
        const group = `${firstLevel}&${action.trdCategory}`;

        return {
          type: action.clazz,  // 对应type
          title: cleanName,  // 对应title（已去除括号内容）
          icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5528 2 12 2ZM12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20ZM9 7H15V9H9V7ZM9 11H15V13H9V11ZM9 15H15V17H9V15Z"></path></svg>',  // 默认图标
          group: group,  // 对应group (sndCategory(version).trdCategory)
          sortNo: index + 1,  // 自动生成sortNo
          description: action.description || '',  // 对应description
          forms: []  // 初始为空，在handleNodeAdd中动态加载
        };
      });
      customNodes.value = nodes;
      console.log('加载自定义节点数据:', nodes);
    }
  } catch (error) {
    console.error('加载Action数据失败:', error);
  }
};

// 页面加载时请求接口
onMounted(async () => {
  loadCustomNodes();
  // 如果是编辑模式，加载现有流程数据
  if (props.currentRow && props.currentRow.flowData) {
    // 加载执行模式
    if (props.currentRow.executionMode) {
      executionMode.value = props.currentRow.executionMode;
    }
    
    try {
      const savedData = JSON.parse(props.currentRow.flowData);
      
      console.log('加载的原始数据:', savedData);
      
      // 判断是新格式还是旧格式
      // 新格式：nodes[0].type === 'customNode' 且 nodes[0].data 包含完整配置
      // 旧格式：nodes[0].type === ActionClass 且有 config 字段
      if (savedData && savedData.nodes && savedData.nodes.length > 0) {
        const firstNode = savedData.nodes[0];
        const isNewFormat = firstNode.type === 'customNode' && firstNode.data;
        
        if (isNewFormat) {
          // 新格式：直接使用，可能需要添加默认位置
          console.log('检测到新格式数据，直接加载');
          savedData.nodes = savedData.nodes.map((node: any, index: number) => {
            const defaultPosition = { x: 150, y: 100 + index * 150 };
            return {
              ...node,
              position: node.position || defaultPosition
            };
          });
        } else {
          // 旧格式：需要转换
          console.log('检测到旧格式数据，进行转换');
          savedData.nodes = savedData.nodes.map((node: any, index: number) => {
            const defaultPosition = { x: 150, y: 100 + index * 150 };
            
            return {
              id: node.id,
              type: 'customNode',
              position: node.position || defaultPosition,
              data: {
                title: node.name,
                originalType: node.type,
                trdCategory: node.trdCategory,
                ...node.config
              }
            };
          });
        }
      }
      
      // 转换边数据格式（兼容新旧格式）
      if (savedData && savedData.edges) {
        savedData.edges = savedData.edges.map((edge: any) => {
          // 新格式已经是 source/target
          if (edge.source && edge.target) {
            return edge;
          }
          // 旧格式是 from/to，需要转换
          return {
            id: edge.id || `edge-${edge.from}-${edge.to}`,
            source: edge.from,
            target: edge.to
          };
        });
      }

      // 编辑模式：先用原始数据初始化画布，再等 Tinyflow 渲染后通过 updateNodeData 注入 forms
      // 这样可确保 onChosen 等函数引用不会在 initialData 序列化时丢失
      if (savedData && savedData.nodes) {
        initialData.value = { ...savedData };
        // 等待 Tinyflow 渲染完成后，对每个节点执行与 handleNodeAdd 相同的 forms 注入逻辑
        setTimeout(async () => {
          if (!tinyflowRef.value) return;
          const nodes = savedData.nodes.filter((n: any) => n.data && n.data.originalType);
          for (const n of nodes) {
            try {
              const resp = await ActionService.getByClassName(n.data.originalType);
              if (resp && resp.data && resp.data.actionParamList) {
                const actionInfo = actionsData.value.find((a: any) => a.clazz === n.data.originalType);
                const trdCategory = actionInfo?.trdCategory || n.data.trdCategory || '';
                const sorted = [...resp.data.actionParamList].sort(
                  (a: any, b: any) => (a.position || 999) - (b.position || 999)
                );
                const typeMap: Record<string, string> = {
                  'TEXT': 'input', 'NUMBER': 'input', 'TEXTAREA': 'textarea',
                  'SELECT': 'select', 'RADIO': 'select', 'SWITCH': 'select', 'DATASOURCE': 'chosen',
                  'FILE_UPLOAD': 'chosen'
                };
                const forms = sorted.map((p: any) => {
                  const fi: any = {
                    label: p.title || p.name,
                    name: p.name,
                    placeholder: `请输入${p.title || p.name}`,
                    required: p.isRequired || false,
                    type: typeMap[p.componentType] || 'input'
                  };
                  if (p.defaultValue) fi.defaultValue = p.defaultValue;
                  if (p.componentType === 'NUMBER') fi.attrs = { type: 'number' };
                  if (p.componentType === 'TEXT') fi.attrs = { type: 'text' };
                  if (p.componentType === 'RADIO' || p.componentType === 'SELECT') {
                    let ds = p.dataSource;
                    if (p.componentConfig) {
                      try { ds = JSON.parse(p.componentConfig).dataSource || ds; } catch (_e) { /* ignore */ }
                    }
                    if (ds) {
                      const sep = ds.includes('|') ? '|' : ',';
                      fi.options = ds.split(sep).map((x: string) => {
                        const colonIdx = x.indexOf(':')
                        if (colonIdx > 0) {
                          return { value: x.substring(0, colonIdx).trim(), label: x.substring(colonIdx + 1).trim() }
                        }
                        return { value: x.trim(), label: x.trim() }
                      });
                    }
                  }
                  if (p.componentType === 'SWITCH') {
                    fi.options = [{ value: 'true', label: '开启' }, { value: 'false', label: '关闭' }];
                  }
                  if (p.componentType === 'DATASOURCE') {
                    fi.chosen = {
                      labelDataKey: `${p.name}Label`,
                      valueDataKey: p.name,
                      buttonText: `选择${p.title}...`,
                      onChosen: (upd: (d: Record<string, any>) => void, val: any) => {
                        openDataSourceModal(upd, val, p.name);
                      }
                    };
                  }
                  if (p.componentType === 'FILE_UPLOAD') {
                    fi.chosen = {
                      labelDataKey: p.name,
                      valueDataKey: p.name,
                      buttonText: '上传文件 / 选择目录',
                      onChosen: (upd: (d: Record<string, any>) => void) => {
                        openFileUploadModal(upd, p.name);
                      }
                    };
                  }
                  return fi;
                });
                tinyflowRef.value.updateNodeData(n.id, (nodeData: any) => ({
                  ...nodeData,
                  forms,
                  trdCategory
                }));
              }
            } catch (e) {
              console.warn('编辑模式注入节点 forms 失败:', n.id, e);
            }
          }
        }, 300);
      }
    } catch (error) {
      console.error('解析流程数据失败:', error);
    }
  }
  
  // 阻止表单区域的滚轮事件传播到画布，确保在整个表单区域都能滚动
  setTimeout(() => {
    console.log('FlowEditor: 开始添加滚轮事件监听');
    
    // 直接在document上监听，使用捕获阶段
    const wheelHandler = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      
      // 检查是否在右侧面板内或表单元素上
      let element: HTMLElement | null = target;
      let isInRightPanel = false;
      
      // 向上遍历DOM树，查找右侧面板的标志
      while (element && element !== document.body) {
        const classList = element.classList;
        const className = element.className || '';
        
        // TinyFlow使用 tf- 前缀的类名，检查各种可能的标识
        if (
          // TinyFlow的表单元素
          classList.contains('nodrag') ||  // TinyFlow表单元素都有nodrag类
          classList.contains('nowheel') || // TinyFlow textarea有nowheel类
          classList.contains('nopan') ||   // TinyFlow输入框有nopan类
          // TinyFlow的元素前缀
          className.startsWith('tf-') ||   // tf-textarea, tf-input, tf-select-input等
          className.includes('tf-node-wrapper-body') ||
          className.includes('setting-title') ||
          // 传统的右侧面板类名
          classList.contains('tinyflow-right-panel') ||
          classList.contains('tinyflow-form-container') ||
          classList.contains('tinyflow-node-form') ||
          classList.contains('node-property-panel') ||
          classList.contains('tinyflow-property-panel') ||
          classList.contains('tinyflow-properties') ||
          className.includes('property') ||
          className.includes('right-panel') ||
          className.includes('form-panel')
        ) {
          isInRightPanel = true;
          console.log('FlowEditor: 匹配到表单元素，类名:', className);
          break;
        }
        
        element = element.parentElement;
      }
      
      if (isInRightPanel) {
        // 在表单区域内，阻止事件传播到画布，允许表单滚动
        e.stopPropagation();
      }
    };
    
    // 在捕获阶段监听，优先级最高
    document.addEventListener('wheel', wheelHandler, { capture: true, passive: false });
    
    console.log('FlowEditor: 滚轮事件监听已添加到document');
  }, 1000);
});

// 返回列表
const handleBack = () => {
  emit('back')
}

// 校验流程
const handleValidate = (show: boolean) => {
  if (!tinyflowRef.value) return false;
  
  // 第一步：表单必填字段验证
  const validationResult = tinyflowRef.value.validate();

  if (!validationResult.success) {
    const errorMessages = validationResult.errors.map((error: any) => {
      return `${error.nodeTitle}: ${error.message}`;
    }).join('\n');

    Modal.message({ 
      status: 'warning', 
      message: `表单验证失败，请检查以下必填字段:\n\n${errorMessages}`,
      top: 20,
      zIndex: 10000
    })
    return false
  }
  
  // 第二步：业务逻辑验证
  const flowData = tinyflowRef.value.getData();
  if (!flowData || !flowData.nodes || !flowData.edges) {
    Modal.message({ 
      status: 'warning', 
      message: '流程数据为空，请添加节点',
      top: 20,
      zIndex: 10000
    })
    return false;
  }
  
  // 构建节点映射表
  const nodeMap = new Map();
  flowData.nodes.forEach((node: any) => {
    nodeMap.set(node.id, node);
  });
  
  // 从actionsData中获取节点的原始分类信息
  const getNodeCategories = (nodeType: string) => {
    const action = actionsData.value.find((a: any) => a.clazz === nodeType);
    if (action) {
      return {
        fstCategory: action.fstCategory,
        sndCategory: action.sndCategory,
        trdCategory: action.trdCategory
      };
    }
    return null;
  };
  
  // 标记所有Pipeline节点
  let hasPipelineNode = false;
  const pipelineNodes = new Set<string>();
  flowData.nodes.forEach((node: any) => {
    const categories = getNodeCategories(node.data.originalType);
    if (categories && categories.fstCategory === 'Pipeline') {
      hasPipelineNode = true;
      pipelineNodes.add(node.id);
    }
  });
  
  // 验证Pipeline节点的完整性：必须有Source、Sink、Submit
  if (hasPipelineNode) {
    // 构建有向图邻接表
    const outgoingEdges = new Map<string, string[]>();
    const incomingEdges = new Map<string, string[]>();
    
    flowData.nodes.forEach((node: any) => {
      outgoingEdges.set(node.id, []);
      incomingEdges.set(node.id, []);
    });
    
    flowData.edges.forEach((edge: any) => {
      outgoingEdges.get(edge.source)?.push(edge.target);
      incomingEdges.get(edge.target)?.push(edge.source);
    });
    
    // 递归验证Pipeline链路
    const validatePipelineChain = (startNodeId: string, visitedInChain: Set<string> = new Set()): boolean => {
      if (visitedInChain.has(startNodeId)) {
        // 检测到环路
        return true;
      }
      
      visitedInChain.add(startNodeId);
      const currentNode = nodeMap.get(startNodeId);
      if (!currentNode) return true;
      
      const categories = getNodeCategories(currentNode.data.originalType);
      if (!categories || categories.fstCategory !== 'Pipeline') {
        // 非Pipeline节点，不验证
        return true;
      }
      
      const trdCategory = categories.trdCategory;
      const sndCategory = categories.sndCategory;
      
      // 获取后续节点
      const nextNodeIds = outgoingEdges.get(startNodeId) || [];
      
      // 如果是Submit节点
      if (trdCategory === 'Submit') {
        // Submit后面可以连接任何节点，如果是Pipeline则递归验证
        for (const nextId of nextNodeIds) {
          const nextNode = nodeMap.get(nextId);
          const nextCategories = getNodeCategories(nextNode.data.originalType);
          
          if (nextCategories && nextCategories.fstCategory === 'Pipeline') {
            // 新的Pipeline链路，从新的visitedInChain开始
            if (!validatePipelineChain(nextId, new Set())) {
              return false;
            }
          }
        }
        return true;
      }
      
      // 非-Submit节点必须有后续连接
      if (nextNodeIds.length === 0) {
        Modal.message({ 
          status: 'warning', 
          message: `Pipeline流程验证失败：

节点 "${currentNode.data.title}" (三级分类: ${trdCategory}) 后面没有连接。

Pipeline流程必须以 Submit 节点结束。`,
          top: 20,
          duration: 5000,
          zIndex: 10000
        })
        return false;
      }
      
      // 验证后续节点
      for (const nextId of nextNodeIds) {
        const nextNode = nodeMap.get(nextId);
        const nextCategories = getNodeCategories(nextNode.data.originalType);
        
        if (!nextCategories) continue;
        
        // 后续节点必须也Pipeline类型
        if (nextCategories.fstCategory !== 'Pipeline') {
          Modal.message({ 
            status: 'warning', 
            message: `Pipeline流程验证失败：

节点 "${currentNode.data.title}" 是Pipeline类型，但它连接到了非Pipeline类型的节点 "${nextNode.data.title}"。

Pipeline链路中的节点必须都是Pipeline类型，直到Submit节点。`,
            top: 20,
            duration: 5000,
            zIndex: 10000
          })
          return false;
        }
        
        // 验证sndCategory一致性
        if (sndCategory !== nextCategories.sndCategory) {
          Modal.message({ 
            status: 'warning', 
            message: `Pipeline流程验证失败：

节点 "${currentNode.data.title}" 和 "${nextNode.data.title}" 的二级分类（sndCategory）不一致。

当前：
- ${currentNode.data.title}: ${sndCategory}
- ${nextNode.data.title}: ${nextCategories.sndCategory}

Pipeline链路中的所有节点必须保持相同的sndCategory。`,
            top: 20,
            duration: 5000,
            zIndex: 10000
          })
          return false;
        }
        
        // 递归验证后续节点
        if (!validatePipelineChain(nextId, visitedInChain)) {
          return false;
        }
      }
      
      return true;
    };
    
    // 验证Pipeline链路的完整性：Source -> Transform(0-n) -> Sink -> Submit
    const validatePipelineStructure = (startNodeId: string): boolean => {
      const visited = new Set<string>();
      const path: any[] = [];
      
      const dfs = (nodeId: string): boolean => {
        if (visited.has(nodeId)) return true;
        visited.add(nodeId);
        
        const node = nodeMap.get(nodeId);
        if (!node) return true;
        
        const categories = getNodeCategories(node.data.originalType);
        if (!categories || categories.fstCategory !== 'Pipeline') return true;
        
        path.push({ id: nodeId, title: node.data.title, trdCategory: categories.trdCategory });
        
        const nextNodeIds = outgoingEdges.get(nodeId) || [];
        for (const nextId of nextNodeIds) {
          const nextNode = nodeMap.get(nextId);
          const nextCategories = getNodeCategories(nextNode.data.originalType);
          if (nextCategories && nextCategories.fstCategory === 'Pipeline') {
            if (!dfs(nextId)) return false;
          }
        }
        
        return true;
      };
      
      if (!dfs(startNodeId)) return false;
      
      // 检查链路中必须有：Source、Sink、Submit
      const hasSource = path.some(n => n.trdCategory === 'Source');
      const hasSink = path.some(n => n.trdCategory === 'Sink');
      const hasSubmit = path.some(n => n.trdCategory === 'Submit');
      
      if (!hasSource || !hasSink || !hasSubmit) {
        const missing: string[] = [];
        if (!hasSource) missing.push('Source');
        if (!hasSink) missing.push('Sink');
        if (!hasSubmit) missing.push('Submit');
        
        Modal.message({ 
          status: 'warning', 
          message: `Pipeline流程验证失败：

Pipeline链路不完整，缺少：${missing.join('、')}

Pipeline完整流程必须包含：Source -> Transform(0-n个) -> Sink -> Submit`,
          top: 20,
          duration: 5000,
          zIndex: 10000
        })
        return false;
      }
      
      // 验证顺序：Source必须在Sink之前，Sink必须在Submit之前
      const sourceIndex = path.findIndex(n => n.trdCategory === 'Source');
      const sinkIndex = path.findIndex(n => n.trdCategory === 'Sink');
      const submitIndex = path.findIndex(n => n.trdCategory === 'Submit');
      
      if (sourceIndex > sinkIndex || sinkIndex > submitIndex) {
        Modal.message({ 
          status: 'warning', 
          message: `Pipeline流程验证失败：

Pipeline节点顺序错误。

正确顺序应为：Source -> Transform(0-n个) -> Sink -> Submit`,
          top: 20,
          duration: 5000,
          zIndex: 10000
        })
        return false;
      }
      
      return true;
    };
    
    // 找出所有Pipeline起始节点（没有Pipeline前驱的Pipeline节点）
    const pipelineStartNodes = new Set<string>();
    for (const nodeId of pipelineNodes) {
      const incomingIds = incomingEdges.get(nodeId) || [];
      const hasPipelineIncoming = incomingIds.some(inId => {
        const inNode = nodeMap.get(inId);
        const inCategories = getNodeCategories(inNode.data.originalType);
        return inCategories && inCategories.fstCategory === 'Pipeline';
      });
      
      if (!hasPipelineIncoming) {
        pipelineStartNodes.add(nodeId);
      }
    }
    
    // 验证每个Pipeline起始节点
    for (const startNodeId of pipelineStartNodes) {
      if (!validatePipelineChain(startNodeId, new Set())) {
        return false;
      }
      if (!validatePipelineStructure(startNodeId)) {
        return false;
      }
    }
  }
  
  // 验证所有节点是否连接在一起（图连通性检查）
  if (flowData.nodes.length > 1) {
    // 构建邻接表（无向图，因为我们只关心连通性）
    const adjacencyMap = new Map<string, Set<string>>();
    flowData.nodes.forEach((node: any) => {
      adjacencyMap.set(node.id, new Set());
    });
    
    flowData.edges.forEach((edge: any) => {
      adjacencyMap.get(edge.source)?.add(edge.target);
      adjacencyMap.get(edge.target)?.add(edge.source);
    });
    
    // 使用BFS检查连通性
    const visited = new Set<string>();
    const queue: string[] = [flowData.nodes[0].id];
    visited.add(flowData.nodes[0].id);
    
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const neighbors = adjacencyMap.get(currentId);
      
      neighbors?.forEach(neighborId => {
        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          queue.push(neighborId);
        }
      });
    }
    
    // 检查是否所有节点都被访问到
    if (visited.size !== flowData.nodes.length) {
      // 找出所有未连接的节点
      const unconnectedNodes = flowData.nodes
        .filter((node: any) => !visited.has(node.id))
        .map((node: any) => node.data.title)
        .join('、');
      
      // 统计有多少个独立的连通块
      const allNodes = new Set(flowData.nodes.map((n: any) => n.id));
      const unvisitedNodes = new Set([...allNodes].filter(id => !visited.has(id)));
      let componentCount = 1; // 已经有一个连通块
      
      // 继续检查其他连通块
      while (unvisitedNodes.size > 0) {
        componentCount++;
        const startNode = [...unvisitedNodes][0];
        const componentQueue: string[] = [startNode];
        const componentVisited = new Set<string>();
        componentVisited.add(startNode);
        unvisitedNodes.delete(startNode);
        
        while (componentQueue.length > 0) {
          const currentId = componentQueue.shift()!;
          const neighbors = adjacencyMap.get(currentId);
          
          neighbors?.forEach(neighborId => {
            if (!componentVisited.has(neighborId) && unvisitedNodes.has(neighborId)) {
              componentVisited.add(neighborId);
              unvisitedNodes.delete(neighborId);
              componentQueue.push(neighborId);
            }
          });
        }
      }
      
      Modal.message({ 
        status: 'warning', 
        message: `流程验证失败：

检测到 ${componentCount} 个独立的流程块，它们之间没有连接。

未连接的节点包括：${unconnectedNodes}

所有节点必须连接在一起形成完整的流程。`,
        top: 20,
        duration: 5000,
        zIndex: 10000
      })
      return false;
    }
  }
  
  // 所有验证通过
  if(show === true){
    Modal.message({ status: 'success', message: '校验通过！', top: 20, zIndex: 10000 })
  }
  return true;
}

// 保存流程
const handleSave = async () => {
  if (!tinyflowRef.value) return;

  if (!handleValidate(false)) return;

  // 如果是新建流程，需要输入流程名称和描述
  // if (!props.currentRow) {
  //   flowNameInput.value = '';
  //   flowDescInput.value = '';
  //   showNameDialog.value = true;
  // } else {
  //   // 编辑模式直接保存
  //   doSaveFlow(props.currentRow.name, props.currentRow.description || '');
  // }

  if (!props.currentRow) {
    flowNameInput.value = '';
    flowDescInput.value = '';
  }else{
    flowNameInput.value = props.currentRow.name;
    flowDescInput.value = props.currentRow.description || '';
  }
  showNameDialog.value = true;
};

// 确认保存流程名称
const confirmFlowName = () => {
  if (!flowNameInput.value || flowNameInput.value.trim() === '') {
    Modal.message({ status: 'warning', message: '流程名称不能为空', top: 20, zIndex: 10000 });
    return;
  }
  showNameDialog.value = false;
  doSaveFlow(flowNameInput.value.trim(), flowDescInput.value.trim());
};

// 执行保存操作
const doSaveFlow = async (flowName: string, flowDesc: string = '') => {
  if (!tinyflowRef.value) return;
  
  try {
    // 获取流程数据（保存完整的前端格式，包含 position、data 等）
    const flowData = tinyflowRef.value.getData();
    
    console.log('保存前的流程数据:', JSON.stringify(flowData, null, 2));

    // 构建保存数据（直接保存完整的 Tinyflow 格式，不做任何转换）
    const saveData = {
      id: props.currentRow?.id,
      name: flowName,
      description: flowDesc,
      flowData: JSON.stringify(flowData),  // 保存完整的前端格式
      status: 'DRAFT',
      executionMode: executionMode.value,  // 添加执行模式
      taskSource: props.currentRow?.taskSource  // 保留原有 taskSource，防止更新时被覆盖为空
    }

    // 调用后端接口保存（后端会自动转换生成 dagData）
    const res: any = saveData.id 
      ? await FlowService.updateFlow(saveData)
      : await FlowService.createFlow(saveData);
    
    if (res.msg === 'success') {
      Modal.message({ status: 'success', message: '保存成功!', top: 20, zIndex: 10000 });
      // 保存成功后返回列表
      setTimeout(() => {
        emit('back');
      }, 500);
    } else {
      Modal.message({ status: 'error', message: res.msg || '保存失败', top: 20, zIndex: 10000 });
    }
  } catch (error) {
    console.error('保存失败:', error);
    Modal.message({ status: 'error', message: '保存失败', top: 20, zIndex: 10000 });
  }
};

// 初始数据配置示例 - 符合TinyflowData类型结构
// const initialData = ref({
//   "nodes": [
//     {
//       "id": "flink-mysql-source-1",
//       "position": { "x": 150, "y": 100 },
//       "data": {
//         "title": "Flink MySQL数据源",
//         "description": "从MySQL数据库读取数据",
//         "originalType": "flinkMysqlSource",
//         "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"currentColor\"><path d=\"M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20ZM9 7H15V9H9V7ZM9 11H15V13H9V11ZM9 15H15V17H9V15Z\"></path></svg>",
//         "expand": true,
//         "host": "localhost",
//         "port": "3306",
//         "database": "test_db",
//         "username": "root",
//         "password": "password",
//         "tableName": "users",
//         "parallelism": "2"
//       },
//       "type": "customNode"
//     },
//     {
//       "id": "flink-filter-transform-1",
//       "position": { "x": 550, "y": 100 },
//       "data": {
//         "title": "Flink 过滤转换",
//         "description": "过滤数据",
//         "originalType": "flinkFilterTransform",
//         "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"currentColor\"><path d=\"M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3ZM19 19H5V5H19V19ZM7 17H17V15H7V17ZM7 13H17V11H7V13ZM7 9H17V7H7V9Z\"></path></svg>",
//         "expand": true,
//         "condition": "age > 18",
//         "parallelism": "1"
//       },
//       "type": "customNode"
//     },
//     {
//       "id": "flink-map-transform-1",
//       "position": { "x": 950, "y": 100 },
//       "data": {
//         "title": "Flink 映射转换",
//         "description": "映射转换数据",
//         "originalType": "flinkMapTransform",
//         "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"currentColor\"><path d=\"M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20ZM13 7H11V17H13V7ZM9 9H7V11H9V9ZM17 9H15V11H17V9Z\"></path></svg>",
//         "expand": true,
//         "mapExpression": "{ id: id, name: name, age: age }",
//         "outputFields": "id,name,age",
//         "parallelism": "2"
//       },
//       "type": "customNode"
//     }
//   ],
//   "edges": [
//     { "source": "flink-mysql-source-1", "target": "flink-filter-transform-1", "id": "edge-1" },
//     { "source": "flink-filter-transform-1", "target": "flink-map-transform-1", "id": "edge-2" }
//   ]
// });

const initialData = ref()

const handleGetData = () => {
  if (tinyflowRef.value) {
    // 调用Tinyflow内置的validate方法进行表单验证
    // 注意：需要扩展Tinyflow组件类型以包含validate方法
    const validationResult = (tinyflowRef.value as any).validate();

    // 根据验证结果处理后续操作
    if (!validationResult.success) {
      console.error('表单验证失败:', validationResult.errors);

      // 显示错误信息
      const errorMessages = validationResult.errors.map((error: any) => {
        return `${error.nodeTitle}: ${error.message}`;
      }).join('\n');

      alert('表单验证失败，请检查以下必填字段:\n\n' + errorMessages);

      // 应用方可以根据返回的错误信息进行自定义处理
      // 例如：滚动到错误节点、高亮显示错误字段等
      return validationResult;
    }

    // 验证成功，获取完整数据
    const data = tinyflowRef.value.getData();

    if (!data) {
      console.warn('Tinyflow data is null');
      return {
        success: false,
        errors: [{ message: 'Tinyflow data is null' }]
      };
    }

    // 获取所有节点的表单数据
    const allFormData = data.nodes.map((node: any) => {
      // 获取节点类型和基本信息
      const nodeInfo = {
        id: node.id,
        type: node.data.originalType,
        title: node.data.title
      };

      // 提取表单字段数据
      const formFields: Record<string, any> = {};

      // 如果节点有forms配置，根据forms提取对应的字段值
      if (node.data.forms && Array.isArray(node.data.forms)) {
        node.data.forms.forEach((form: any) => {
          const fieldName = form.name;
          // 从node.data中获取该字段的值
          if (fieldName && Object.prototype.hasOwnProperty.call(node.data, fieldName)) {
            formFields[fieldName] = node.data[fieldName];
          }
        });
      } else {
        // 如果没有forms配置，直接从node.data中提取除内置属性外的字段
        for (const [key, value] of Object.entries(node.data)) {
          // 排除内置属性
          if (!['title', 'description', 'originalType', 'icon', 'expand', 'forms', 'selected'].includes(key)) {
            formFields[key] = value;
          }
        }
      }

      return {
        ...nodeInfo,
        formData: formFields
      };
    });

    console.log('所有节点的表单数据:', allFormData);
    console.log('完整流程图数据:', data);
    console.log('完整流程图数据JSON:', JSON.stringify(data));

    // 验证成功，应用方可以执行后续操作，如保存数据到后端等
    // 这里可以添加保存到后端的逻辑

    return {
      success: true,
      data: allFormData,
      fullData: data
    };
  } else {
    console.warn('Tinyflow component ref is not ready');
    return {
      success: false,
      errors: [{ message: 'Tinyflow component ref is not ready' }]
    };
  }
};

// 节点添加到画布后的事件处理函数
const handleNodeAdd = async (node: any) => {
  const nodeType = node.data.originalType;
  
  if (!nodeType) {
    console.warn('节点缺少originalType字段');
    return;
  }

  try {
    console.log('加载节点表单配置:', nodeType);
    
    // 从全局原始数据中查找当前节点对应的Action信息，获取三级分类
    const actionInfo = actionsData.value.find((action: any) => action.clazz === nodeType);
    const trdCategory = actionInfo?.trdCategory || '';
    console.log('节点三级分类:', trdCategory);
    
    // 调用后台接口获取完整的表单配置
    const response = await ActionService.getByClassName(nodeType);
    
    if (response && response.data && response.data.actionParamList) {
      const actionParamList = response.data.actionParamList;
      
      // 按 position 字段排序，确保表单按正确顺序显示
      const sortedParamList = [...actionParamList].sort((a: any, b: any) => {
        const posA = a.position || 999;
        const posB = b.position || 999;
        return posA - posB;
      });
      
      // 将 actionParamList 转换为 Tinyflow 的 forms 格式（过滤 isHidden 字段）
      const forms = sortedParamList.filter((param: any) => !param.isHidden).map((param: any) => {
        // 基本表单项配置
        const formItem: any = {
          label: param.title || param.name,
          name: param.name,
          placeholder: `请输入${param.title || param.name}`,
          required: param.isRequired || false
        };

        // 根据 componentType 映射到 Tinyflow 的控件类型
        const componentTypeMap: Record<string, string> = {
          'TEXT': 'input',
          'NUMBER': 'input',
          'TEXTAREA': 'textarea',
          'SELECT': 'select',
          'RADIO': 'select',
          'SWITCH': 'select',
          'DATASOURCE': 'chosen',
          'FILE_UPLOAD': 'chosen'
        };
        
        formItem.type = componentTypeMap[param.componentType] || 'input';

        // 处理默认值
        if (param.defaultValue) {
          formItem.defaultValue = param.defaultValue;
        }

        // 根据不同的组件类型设置 attrs
        if (param.componentType === 'NUMBER') {
          formItem.attrs = { type: 'number' };
        } else if (param.componentType === 'TEXT') {
          formItem.attrs = { type: 'text' };
        }

        // 处理 RADIO 和 SELECT 的 options
        if (param.componentType === 'RADIO' || param.componentType === 'SELECT') {
          // 优先从 componentConfig 中获取 dataSource
          if (param.componentConfig) {
            try {
              const config = JSON.parse(param.componentConfig);
              if (config.dataSource) {
                // 支持多种分隔符：| 或 ,
                const separator = config.dataSource.includes('|') ? '|' : ',';
                const options = config.dataSource.split(separator).map((item: string) => {
                  const colonIdx = item.indexOf(':')
                  if (colonIdx > 0) {
                    return { value: item.substring(0, colonIdx).trim(), label: item.substring(colonIdx + 1).trim() }
                  }
                  return { value: item.trim(), label: item.trim() }
                });
                formItem.options = options;
              }
            } catch (e) {
              console.warn(`解析 componentConfig 失败: ${param.name}`, e);
            }
          }
          // 如果 componentConfig 中没有，尝试从 dataSource 字段获取
          if (!formItem.options && param.dataSource) {
            const separator = param.dataSource.includes('|') ? '|' : ',';
            const options = param.dataSource.split(separator).map((item: string) => {
              const colonIdx = item.indexOf(':')
              if (colonIdx > 0) {
                return { value: item.substring(0, colonIdx).trim(), label: item.substring(colonIdx + 1).trim() }
              }
              return { value: item.trim(), label: item.trim() }
            });
            formItem.options = options;
          }
        }

        // 处理 SWITCH 类型
        if (param.componentType === 'SWITCH') {
          formItem.options = [
            { value: 'true', label: '开启' },
            { value: 'false', label: '关闭' }
          ];
        }

        // 处理 DATASOURCE 类型（使用 chosen 控件）
        if (param.componentType === 'DATASOURCE') {
          formItem.chosen = {
            labelDataKey: `${param.name}Label`,
            valueDataKey: param.name,
            buttonText: `选择${param.title}...`,
            onChosen: (updateNodeData: (data: Record<string, any>) => void, value: any) => {
              // 打开数据源选择弹窗，传入字段名
              openDataSourceModal(updateNodeData, value, param.name);
            }
          };
        }

        // 处理 FILE_UPLOAD 类型
        if (param.componentType === 'FILE_UPLOAD') {
          formItem.chosen = {
            labelDataKey: param.name,
            valueDataKey: param.name,
            buttonText: '上传文件 / 选择目录',
            onChosen: (updateNodeData: (data: Record<string, any>) => void) => {
              openFileUploadModal(updateNodeData, param.name);
            }
          };
        }

        // 其他 componentConfig 配置
        if (param.componentConfig && param.componentType !== 'RADIO' && param.componentType !== 'SELECT') {
          try {
            const config = JSON.parse(param.componentConfig);
            Object.assign(formItem, config);
          } catch (e) {
            console.warn(`解析组件配置失败: ${param.name}`, e);
          }
        }

        return formItem;
      });

      // 更新节点的 forms 配置
      // 使用 updateNodeData 方法直接更新节点数据
      if (tinyflowRef.value) {
        tinyflowRef.value.updateNodeData(node.id, (nodeData: any) => {
          // 返回更新后的数据，添加 trdCategory 字段
          return {
            ...nodeData,
            forms: forms,
            trdCategory: trdCategory  // 添加三级分类字段
          };
        });
        
        console.log('节点表单配置已更新:', forms);
      }
    }
  } catch (error) {
    console.error('加载节点表单配置失败:', error);
  }
};

// 数据变化事件处理函数
const handleDataChange = (_data: any) => {
  // console.log('Tinyflow数据已变化:');
  // // 遍历节点，查看每个节点的表单字段值
  // _data.nodes.forEach((node: any) => {
  //     console.log(`\n节点 ${node.id} (${node.data.originalType}):`);
  //     console.log('实际表单数据:', {
  //         host: node.data.host,
  //         port: node.data.port,
  //         database: node.data.database,
  //         username: node.data.username,
  //         password: node.data.password,
  //         tableName: node.data.tableName,
  //         parallelism: node.data.parallelism
  //     });
  // });
  // console.log('\n边数据:', data.edges);
  // 可以在这里添加自定义逻辑
};
</script>

<style lang="less" scoped>
.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 50px;
  padding: 0 16px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;

    .flow-title {
      font-size: 16px;
      font-weight: 500;
      color: #333;
    }
  }

  .header-right {
    display: flex;
    gap: 8px;
  }

  // 按钮内图标样式
  :deep(.tiny-button) {
    .tiny-svg {
      margin-right: 4px;
    }
  }
}

// CSS 伪全屏样式
.fullscreen-mode {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  z-index: 9999 !important;
  background: #fff;
  margin: 0 !important;
  padding: 0 !important;
}

// TinyFlow 右侧表单区域滚动支持
:deep(.tinyflow-right-panel) {
  overflow-y: auto !important;
  max-height: calc(100vh - 200px) !important;
  // 阻止滚轮事件冒泡到画布，避免与画布缩放冲突
  overscroll-behavior: contain;
}

:deep(.tinyflow-form-container) {
  overflow-y: auto !important;
  max-height: calc(100vh - 200px) !important;
  overscroll-behavior: contain;
}

:deep(.tinyflow-node-form) {
  overflow-y: auto !important;
  max-height: calc(100vh - 200px) !important;
  padding-right: 8px;
  overscroll-behavior: contain;
}

// 节点属性面板滚动
:deep(.node-property-panel) {
  overflow-y: auto !important;
  max-height: calc(100vh - 200px) !important;
  overscroll-behavior: contain;
}

// 全屏模式下调整最大高度
.fullscreen-mode {
  :deep(.tinyflow-right-panel),
  :deep(.tinyflow-form-container),
  :deep(.tinyflow-node-form),
  :deep(.node-property-panel) {
    max-height: calc(100vh - 100px) !important;
  }
}
</style>
