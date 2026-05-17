<template>
  <div style="width: 100%; height: calc(100vh - 16px)">

    <button @click="handleGetData">getData</button>

    <Tinyflow
        className="custom-class"
        :style="{ width: '100%', height: '100%' }"
        :data="initialData"
        :customNodes="customNodes"
        ref="tinyflowRef"
        :onNodeAdd="handleNodeAdd"
        :onDataChange="handleDataChange"
    />

  </div>
</template>



<script setup lang="ts">
import { ref, reactive } from 'vue';
import {Tinyflow} from '@/assets/tinyflow/index.js'
import '@/assets/tinyflow/index.css'

const tinyflowRef = ref<InstanceType<typeof Tinyflow> | null>(null);

// const provider = {
//     llm: ()  => [
//         {
//             value: 'llm',
//             label: 'llm',
//         }
//     ],
//     knowledge: () => [],
// }

// 数据源弹窗状态管理
const dataSourceModal = reactive({
  visible: false,
  selectedId: '',
  updateNodeData: null as any
});

// 打开数据源选择弹窗
const openDataSourceModal = (updateNodeData: any, currentValue: any) => {
  dataSourceModal.updateNodeData = updateNodeData;
  dataSourceModal.selectedId = currentValue || '';
  dataSourceModal.visible = true;
};

// 确认选择数据源
const handleDataSourceConfirm = (id: string, name: string) => {
  if (dataSourceModal.updateNodeData) {
    dataSourceModal.updateNodeData({
      dataSourceId: id,
      dataSourceLabel: name
    });
  }
  dataSourceModal.visible = false;
  setTimeout(() => {
    dataSourceModal.updateNodeData = null;
  }, 300);
};

// 关闭数据源选择弹窗
const handleDataSourceClose = () => {
  dataSourceModal.visible = false;
  setTimeout(() => {
    dataSourceModal.updateNodeData = null;
  }, 300);
};

// 自定义节点配置，分为三级分组：Flink/SeaTunnel -> 数据源/转换算子 -> 具体节点
const customNodes: any = [
  // ================ Flink 一级分组 ================
  // Flink 数据源子分组
  {
    type: 'flinkMysqlSource',
    title: 'MySQL数据源',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20ZM9 7H15V9H9V7ZM9 11H15V13H9V11ZM9 15H15V17H9V15Z"></path></svg>',
    group: 'Flink.数据源',
    sortNo: 100,
    description: '从MySQL数据库读取数据',
    forms: [
      { type: 'input', label: '主机地址', name: 'host', placeholder: '请输入MySQL主机地址', defaultValue: 'localhost' },
      { type: 'input', label: '端口', name: 'port', placeholder: '请输入MySQL端口', defaultValue: '3306', attrs: { type: 'number' } },
      { type: 'input', label: '数据库名', name: 'database', placeholder: '请输入数据库名', required: true },
      { type: 'input', label: '用户名', name: 'username', placeholder: '请输入用户名', required: true },
      { type: 'input', label: '密码', name: 'password', placeholder: '请输入密码', attrs: { type: 'password' } },
      { type: 'input', label: '表名', name: 'tableName', placeholder: '请输入表名', required: true },
      { type: 'select', label: '并行度', name: 'parallelism', placeholder: '请选择并行度', options: [{ value: '1', label: '1' }, { value: '2', label: '2' }, { value: '4', label: '4' }, { value: '8', label: '8' }], defaultValue: '2' }
    ]
  },
  {
    type: 'flinkApiSource',
    title: 'API数据源',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M5 12H19V14H5V12ZM3 6H21V8H3V6ZM11 18H13V20H11V18Z"></path></svg>',
    group: 'Flink.数据源',
    sortNo: 200,
    description: '从REST API读取数据',
    forms: [
      { type: 'input', label: 'API地址', name: 'url', placeholder: '请输入API地址', required: true, defaultValue: 'https://api.example.com' },
      { type: 'select', label: '请求方法', name: 'method', placeholder: '请选择请求方法', options: [{ value: 'GET', label: 'GET' }, { value: 'POST', label: 'POST' }, { value: 'PUT', label: 'PUT' }, { value: 'DELETE', label: 'DELETE' }], defaultValue: 'GET' },
      { type: 'textarea', label: '请求头', name: 'headers', placeholder: '请输入请求头，JSON格式', defaultValue: '{}' },
      { type: 'textarea', label: '请求体', name: 'body', placeholder: '请输入请求体，JSON格式', defaultValue: '{}' },
      { type: 'input', label: '超时时间', name: 'timeout', placeholder: '请输入超时时间（毫秒）', defaultValue: '5000', attrs: { type: 'number' } },
      { type: 'select', label: '并行度', name: 'parallelism', placeholder: '请选择并行度', options: [{ value: '1', label: '1' }, { value: '2', label: '2' }, { value: '4', label: '4' }, { value: '8', label: '8' }], defaultValue: '2' }
    ]
  },
  {
    type: 'flinkCsvSource',
    title: 'CSV数据源',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20ZM15 9H9V11H15V9ZM15 13H9V15H15V13Z"></path></svg>',
    group: 'Flink.数据源',
    sortNo: 300,
    description: '从CSV文件读取数据',
    forms: [
      { type: 'input', label: '文件路径', name: 'filePath', placeholder: '请输入CSV文件路径', required: true },
      { type: 'input', label: '分隔符', name: 'delimiter', placeholder: '请输入CSV分隔符', defaultValue: ',' },
      { type: 'select', label: '是否带表头', name: 'hasHeader', placeholder: '请选择是否带表头', options: [{ value: 'true', label: '是' }, { value: 'false', label: '否' }], defaultValue: 'true' },
      { type: 'input', label: '编码', name: 'encoding', placeholder: '请输入文件编码', defaultValue: 'UTF-8' },
      { type: 'input', label: '列名', name: 'columns', placeholder: '请输入列名，用逗号分隔', required: true },
      { type: 'select', label: '并行度', name: 'parallelism', placeholder: '请选择并行度', options: [{ value: '1', label: '1' }, { value: '2', label: '2' }, { value: '4', label: '4' }, { value: '8', label: '8' }], defaultValue: '2' }
    ]
  },

  // Flink 转换算子子分组
  {
    type: 'flinkFilterTransform',
    title: '过滤转换',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3ZM19 19H5V5H19V19ZM7 17H17V15H7V17ZM7 13H17V11H7V13ZM7 9H17V7H7V9Z"></path></svg>',
    group: 'Flink.转换算子',
    sortNo: 100,
    description: '过滤数据',
    forms: [
      { type: 'input', label: '过滤条件', name: 'condition', placeholder: '请输入过滤条件，如：field > 10', required: true, defaultValue: 'field > 10' },
      { type: 'select', label: '并行度', name: 'parallelism', placeholder: '请选择并行度', options: [{ value: '1', label: '1' }, { value: '2', label: '2' }, { value: '4', label: '4' }, { value: '8', label: '8' }], defaultValue: '2' }
    ]
  },
  {
    type: 'flinkChosenExample',
    title: 'Chosen组件示例',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20ZM13 7H11V17H13V7ZM9 9H7V11H9V9ZM17 9H15V11H17V9Z"></path></svg>',
    group: 'Flink.转换算子',
    sortNo: 300,
    description: '展示Chosen组件的使用',
    forms: [
      { type: 'input', label: '名称', name: 'name', placeholder: '请输入名称', required: true },
      {
        type: 'chosen',
        label: '选择数据源',
        name: 'dataSource',
        placeholder: '请选择数据源',
        chosen: {
          labelDataKey: 'dataSourceLabel',
          valueDataKey: 'dataSourceId',
          buttonText: '选择数据源...',
          onChosen: (updateNodeData: (data: Record<string, any>) => void, value: any, label: any, event: Event) => {
            // 打开数据源选择弹窗
            openDataSourceModal(updateNodeData, value);
            console.log('Chosen callback:', { updateNodeData, value, label, event });
          }
        }
      },
      { type: 'select', label: '并行度', name: 'parallelism', placeholder: '请选择并行度', options: [{ value: '1', label: '1' }, { value: '2', label: '2' }, { value: '4', label: '4' }, { value: '8', label: '8' }], defaultValue: '2' }
    ]
  },
  {
    type: 'flinkMapTransform',
    title: '映射转换',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20ZM13 7H11V17H13V7ZM9 9H7V11H9V9ZM17 9H15V11H17V9Z"></path></svg>',
    group: 'Flink.转换算子',
    sortNo: 200,
    description: '映射转换数据',
    forms: [
      { type: 'textarea', label: '映射表达式', name: 'mapExpression', placeholder: '请输入映射表达式，如：{ newField: field1 + field2 }', required: true },
      { type: 'input', label: '输出字段', name: 'outputFields', placeholder: '请输入输出字段，用逗号分隔', required: true },
      { type: 'select', label: '并行度', name: 'parallelism', placeholder: '请选择并行度', options: [{ value: '1', label: '1' }, { value: '2', label: '2' }, { value: '4', label: '4' }, { value: '8', label: '8' }], defaultValue: '2' }
    ]
  },

  // ================ SeaTunnel 一级分组 ================
  // SeaTunnel 数据源子分组
  {
    type: 'seatunnelMysqlSource',
    title: 'MySQL数据源',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20ZM9 7H15V9H9V7ZM9 11H15V13H9V11ZM9 15H15V17H9V15Z"></path></svg>',
    group: 'SeaTunnel.数据源',
    sortNo: 100,
    description: 'SeaTunnel MySQL数据源',
    forms: [
      { type: 'input', label: '主机地址', name: 'host', placeholder: '请输入MySQL主机地址', defaultValue: 'localhost' },
      { type: 'input', label: '端口', name: 'port', placeholder: '请输入MySQL端口', defaultValue: '3306', attrs: { type: 'number' } },
      { type: 'input', label: '数据库名', name: 'database', placeholder: '请输入数据库名', required: true },
      { type: 'input', label: '用户名', name: 'username', placeholder: '请输入用户名', required: true },
      { type: 'input', label: '密码', name: 'password', placeholder: '请输入密码', attrs: { type: 'password' } },
      { type: 'input', label: '表名', name: 'tableName', placeholder: '请输入表名', required: true }
    ]
  },
  {
    type: 'seatunnelKafkaSource',
    title: 'Kafka数据源',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20ZM9 7H15V9H9V7ZM9 11H15V13H9V11ZM9 15H15V17H9V15Z"></path></svg>',
    group: 'SeaTunnel.数据源',
    sortNo: 200,
    description: 'SeaTunnel Kafka数据源',
    forms: [
      { type: 'input', label: 'Broker地址', name: 'bootstrapServers', placeholder: '请输入Kafka Broker地址', required: true, defaultValue: 'localhost:9092' },
      { type: 'input', label: 'Topic', name: 'topic', placeholder: '请输入Kafka Topic', required: true },
      { type: 'input', label: '消费者组', name: 'groupId', placeholder: '请输入消费者组ID', required: true },
      { type: 'select', label: '起始位置', name: 'startupMode', placeholder: '请选择起始位置', options: [{ value: 'earliest', label: '最早' }, { value: 'latest', label: '最新' }], defaultValue: 'earliest' }
    ]
  },

  // SeaTunnel 转换算子子分组
  {
    type: 'seatunnelFilterTransform',
    title: '过滤转换',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3ZM19 19H5V5H19V19ZM7 17H17V15H7V17ZM7 13H17V11H7V13ZM7 9H17V7H7V9Z"></path></svg>',
    group: 'SeaTunnel.转换算子',
    sortNo: 100,
    description: 'SeaTunnel 过滤转换',
    forms: [
      { type: 'input', label: '过滤条件', name: 'condition', placeholder: '请输入过滤条件', required: true, defaultValue: 'field > 10' }
    ]
  },
  {
    type: 'seatunnelMapTransform',
    title: '映射转换',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20ZM13 7H11V17H13V7ZM9 9H7V11H9V9ZM17 9H15V11H17V9Z"></path></svg>',
    group: 'SeaTunnel.转换算子',
    sortNo: 200,
    description: 'SeaTunnel 映射转换',
    forms: [
      { type: 'textarea', label: '映射表达式', name: 'mapExpression', placeholder: '请输入映射表达式', required: true },
      { type: 'input', label: '输出字段', name: 'outputFields', placeholder: '请输入输出字段，用逗号分隔', required: true }
    ]
  },
  {
    type: 'seatunnelAggregateTransform',
    title: '聚合转换',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20ZM13 7H11V17H13V7ZM9 9H7V11H9V9ZM17 9H15V11H17V9Z"></path></svg>',
    group: 'SeaTunnel.转换算子',
    sortNo: 300,
    description: 'SeaTunnel 聚合转换',
    forms: [
      { type: 'input', label: '分组字段', name: 'groupBy', placeholder: '请输入分组字段，用逗号分隔', required: true },
      { type: 'input', label: '聚合表达式', name: 'aggregateExpr', placeholder: '请输入聚合表达式，如：sum(amount)', required: true }
    ]
  },
  // ================ 输入控件示例 ================
  {
    type: 'inputControlsExample',
    title: '输入控件示例',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3ZM19 19H5V5H19V19ZM7 7H17V9H7V7ZM7 11H17V13H7V11ZM7 15H17V17H7V15Z"></path></svg>',
    group: '示例.输入控件',
    sortNo: 100,
    description: '展示各种类型的输入控件',
    // 设置最大高度为300px，演示滚动效果
    maxHeight: '300px',
    forms: [
      { type: 'heading', label: '文本输入' },
      { type: 'input', label: '普通文本', name: 'textInput', placeholder: '请输入普通文本', defaultValue: '这是普通文本' },
      { type: 'input', label: '搜索输入', name: 'searchInput', placeholder: '请输入搜索内容', attrs: { type: 'search' } },

      { type: 'heading', label: '数字相关' },
      { type: 'input', label: '整数', name: 'numberInput', placeholder: '请输入整数', defaultValue: '123', attrs: { type: 'number' } },
      { type: 'input', label: '小数', name: 'decimalInput', placeholder: '请输入小数', defaultValue: '123.45', attrs: { type: 'number', step: '0.01' } },
      { type: 'input', label: '范围', name: 'rangeInput', placeholder: '请输入范围值', defaultValue: '50', attrs: { type: 'range', min: '0', max: '100' } },

      { type: 'heading', label: '验证类型' },
      { type: 'input', label: '电子邮箱', name: 'emailInput', placeholder: '请输入电子邮箱', defaultValue: 'user@example.com', attrs: { type: 'email' } },
      { type: 'input', label: '电话号码', name: 'telInput', placeholder: '请输入电话号码', defaultValue: '13800138000', attrs: { type: 'tel' } },
      { type: 'input', label: '网址', name: 'urlInput', placeholder: '请输入网址', defaultValue: 'https://example.com', attrs: { type: 'url' } },

      { type: 'heading', label: '敏感信息' },
      { type: 'input', label: '密码', name: 'passwordInput', placeholder: '请输入密码', defaultValue: 'password123', attrs: { type: 'password' } },

      { type: 'heading', label: '日期时间' },
      { type: 'input', label: '日期', name: 'dateInput', placeholder: '请选择日期', attrs: { type: 'date' } },
      { type: 'input', label: '时间', name: 'timeInput', placeholder: '请选择时间', attrs: { type: 'time' } },
      { type: 'input', label: '日期时间', name: 'datetimeInput', placeholder: '请选择日期时间', attrs: { type: 'datetime-local' } },

      { type: 'heading', label: '特殊类型' },
      { type: 'input', label: '颜色选择', name: 'colorInput', defaultValue: '#ff0000', attrs: { type: 'color' } },
      { type: 'input', label: '月份', name: 'monthInput', placeholder: '请选择月份', attrs: { type: 'month' } },
      { type: 'input', label: '周', name: 'weekInput', placeholder: '请选择周', attrs: { type: 'week' } },

      // 添加更多控件以演示滚动效果
      { type: 'heading', label: '额外控件（用于演示滚动）' },
      { type: 'input', label: '额外文本1', name: 'extraText1', placeholder: '请输入额外文本1' },
      { type: 'input', label: '额外文本2', name: 'extraText2', placeholder: '请输入额外文本2' },
      { type: 'input', label: '额外文本3', name: 'extraText3', placeholder: '请输入额外文本3' },
      { type: 'input', label: '额外文本4', name: 'extraText4', placeholder: '请输入额外文本4' },
      { type: 'input', label: '额外文本5', name: 'extraText5', placeholder: '请输入额外文本5' }
    ]
  }
];

// 初始数据配置示例 - 符合TinyflowData类型结构
const initialData = ref({
  "nodes": [
    {
      "id": "flink-mysql-source-1",
      "position": { "x": 150, "y": 100 },
      "data": {
        "title": "Flink MySQL数据源",
        "description": "从MySQL数据库读取数据",
        "originalType": "flinkMysqlSource",
        "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"currentColor\"><path d=\"M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20ZM9 7H15V9H9V7ZM9 11H15V13H9V11ZM9 15H15V17H9V15Z\"></path></svg>",
        "expand": true,
        "host": "localhost",
        "port": "3306",
        "database": "test_db",
        "username": "root",
        "password": "password",
        "tableName": "users",
        "parallelism": "2"
      },
      "type": "customNode"
    },
    {
      "id": "flink-filter-transform-1",
      "position": { "x": 550, "y": 100 },
      "data": {
        "title": "Flink 过滤转换",
        "description": "过滤数据",
        "originalType": "flinkFilterTransform",
        "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"currentColor\"><path d=\"M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3ZM19 19H5V5H19V19ZM7 17H17V15H7V17ZM7 13H17V11H7V13ZM7 9H17V7H7V9Z\"></path></svg>",
        "expand": true,
        "condition": "age > 18",
        "parallelism": "1"
      },
      "type": "customNode"
    },
    {
      "id": "flink-map-transform-1",
      "position": { "x": 950, "y": 100 },
      "data": {
        "title": "Flink 映射转换",
        "description": "映射转换数据",
        "originalType": "flinkMapTransform",
        "icon": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"currentColor\"><path d=\"M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20ZM13 7H11V17H13V7ZM9 9H7V11H9V9ZM17 9H15V11H17V9Z\"></path></svg>",
        "expand": true,
        "mapExpression": "{ id: id, name: name, age: age }",
        "outputFields": "id,name,age",
        "parallelism": "2"
      },
      "type": "customNode"
    }
  ],
  "edges": [
    { "source": "flink-mysql-source-1", "target": "flink-filter-transform-1", "id": "edge-1" },
    { "source": "flink-filter-transform-1", "target": "flink-map-transform-1", "id": "edge-2" }
  ]
});

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
          if (fieldName && node.data.hasOwnProperty(fieldName)) {
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
const handleNodeAdd = (_node: any) => {
  // 可以在这里添加自定义逻辑，比如初始化节点数据、发送请求等
  // console.log('节点已添加到画布:', _node.id);
  // console.log('节点类型:', _node.data.originalType);
  // console.log('节点表单配置:', _node.data.forms);
  // console.log('节点实际表单数据:', {
  //     // 过滤出实际的表单字段值，排除内置属性
  //     host: _node.data.host,
  //     port: _node.data.port,
  //     database: _node.data.database,
  //     username: _node.data.username,
  //     password: _node.data.password,
  //     tableName: _node.data.tableName,
  //     parallelism: _node.data.parallelism
  // });
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