<template>
  <div 
    ref="editorContainer" 
    class="monaco-editor-container"
  ></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as monaco from 'monaco-editor'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  height: {
    type: String,
    default: '300px'
  },
  readonly: {
    type: Boolean,
    default: false
  },
  catalogList: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'execute'])

const editorContainer = ref<HTMLElement>()
let editor: monaco.editor.IStandaloneCodeEditor | null = null

const initEditor = () => {
  if (!editorContainer.value) return

  // 配置Flink SQL语法验证
  monaco.languages.registerDocumentSemanticTokensProvider('sql', {
    getLegend: () => ({
      tokenTypes: ['keyword', 'function', 'string', 'number'],
      tokenModifiers: []
    }),
    provideDocumentSemanticTokens: () => null,
    releaseDocumentSemanticTokens: () => {}
  })

  // 注册Flink SQL语法验证
  monaco.editor.onDidCreateModel((model) => {
    if (model.getLanguageId() === 'sql') {
      // 设置验证选项
      monaco.editor.setModelMarkers(model, 'sql', [])
    }
  })

  // 注册SQL补全提供者
  monaco.languages.registerCompletionItemProvider('sql', {
    provideCompletionItems: (model, position) => {
      const suggestions: monaco.languages.CompletionItem[] = []

      // Flink SQL关键字(完整版)
      const keywords = [
        // DDL
        'CREATE', 'ALTER', 'DROP', 'TABLE', 'VIEW', 'DATABASE', 'CATALOG',
        'FUNCTION', 'TEMPORARY', 'IF', 'NOT', 'EXISTS',
        // DML  
        'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'FROM', 'WHERE', 'INTO', 'VALUES',
        // JOIN
        'JOIN', 'LEFT', 'RIGHT', 'FULL', 'OUTER', 'INNER', 'CROSS', 'ON', 'USING',
        // 聚合/排序
        'GROUP', 'BY', 'ORDER', 'HAVING', 'LIMIT', 'OFFSET',
        // 逻辑
        'AND', 'OR', 'NOT', 'IN', 'LIKE', 'BETWEEN', 'IS', 'NULL',
        // 集合
        'UNION', 'INTERSECT', 'EXCEPT', 'ALL', 'DISTINCT',
        // 窗口
        'OVER', 'PARTITION', 'ROWS', 'RANGE', 'UNBOUNDED', 'PRECEDING', 'FOLLOWING', 'CURRENT', 'ROW',
        // 其他
        'AS', 'WITH', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
        'CAST', 'EXTRACT', 'INTERVAL', 'WATERMARK', 'FOR',
        'PRIMARY', 'KEY', 'UNIQUE', 'COMMENT', 'PARTITIONED',
        'SHOW', 'DESCRIBE', 'DESC', 'EXPLAIN', 'USE'
      ]

      keywords.forEach(keyword => {
        suggestions.push({
          label: keyword,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: keyword,
          range: {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: position.column,
            endColumn: position.column
          }
        })
      })

      // Flink SQL内置函数
      const functions = [
        // 聚合函数
        'COUNT', 'SUM', 'AVG', 'MAX', 'MIN', 'STDDEV_POP', 'STDDEV_SAMP', 'VAR_POP', 'VAR_SAMP',
        // 字符串函数
        'CONCAT', 'UPPER', 'LOWER', 'TRIM', 'LTRIM', 'RTRIM', 'SUBSTRING', 'CHAR_LENGTH', 'POSITION',
        'OVERLAY', 'REGEXP_REPLACE', 'REGEXP_EXTRACT',
        // 日期函数
        'CURRENT_DATE', 'CURRENT_TIME', 'CURRENT_TIMESTAMP', 'LOCALTIME', 'LOCALTIMESTAMP',
        'DATE_FORMAT', 'TO_DATE', 'TO_TIMESTAMP', 'UNIX_TIMESTAMP',
        // 数学函数
        'ABS', 'CEIL', 'FLOOR', 'ROUND', 'MOD', 'POWER', 'SQRT', 'EXP', 'LN', 'LOG10',
        // 窗口函数
        'ROW_NUMBER', 'RANK', 'DENSE_RANK', 'LAG', 'LEAD', 'FIRST_VALUE', 'LAST_VALUE',
        // 条件函数
        'COALESCE', 'NULLIF', 'IFNULL', 'IF',
        // 类型转换
        'CAST', 'TRY_CAST'
      ]

      functions.forEach(func => {
        suggestions.push({
          label: func,
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: `${func}($1)`,
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'Flink SQL函数',
          range: {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: position.column,
            endColumn: position.column
          }
        })
      })

      // Catalog名称补全
      if (props.catalogList && props.catalogList.length > 0) {
        props.catalogList.forEach((catalog: any) => {
          suggestions.push({
            label: catalog.catalogName || catalog,
            kind: monaco.languages.CompletionItemKind.Module,
            insertText: catalog.catalogName || catalog,
            detail: 'Catalog',
            range: {
              startLineNumber: position.lineNumber,
              endLineNumber: position.lineNumber,
              startColumn: position.column,
              endColumn: position.column
            }
          })
        })
      }

      // 智能列名提示（基于FROM子句）
      const textUntilPosition = model.getValueInRange({
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column
      })

      // 查找最近的FROM子句
      const fromMatches = [...textUntilPosition.matchAll(/FROM\s+([\w.]+)\s*/gi)]
      if (fromMatches.length > 0) {
        const lastFromMatch = fromMatches[fromMatches.length - 1]
        const tableName = lastFromMatch[1]
        
        // 为表名添加列提示（模拟数据，实际应从后端获取）
        const mockColumns = ['id', 'name', 'created_at', 'updated_at', 'status']
        mockColumns.forEach(column => {
          suggestions.push({
            label: column,
            kind: monaco.languages.CompletionItemKind.Field,
            insertText: column,
            detail: `列 - ${tableName}`,
            range: {
              startLineNumber: position.lineNumber,
              endLineNumber: position.lineNumber,
              startColumn: position.column,
              endColumn: position.column
            }
          })
        })
      }

      return { suggestions }
    }
  })

  // 创建编辑器
  editor = monaco.editor.create(editorContainer.value, {
    value: props.modelValue,
    language: 'sql',
    theme: 'vs',
    automaticLayout: true,
    fontSize: 14,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    readOnly: props.readonly,
    wordWrap: 'on',
    lineNumbers: 'on',
    folding: true,
    tabSize: 2,
    suggestOnTriggerCharacters: true,
    quickSuggestions: {
      other: true,
      comments: false,
      strings: false
    },
    // 禁用Monaco Editor内置的拖放功能，使用自定义的handleDrop
    dragAndDrop: false
  })

  // 监听内容变化
  editor.onDidChangeModelContent(() => {
    if (editor) {
      const value = editor.getValue()
      emit('update:modelValue', value)
      
      // 实时语法校验
      validateSQL(value)
    }
  })

  // 监听快捷键
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
    emit('execute')
  })

  // 直接在Monaco Editor的DOM元素上监听拖放事件
  const editorDomNode = editor.getDomNode()
  if (editorDomNode) {
    editorDomNode.addEventListener('dragover', (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
    })
    
    editorDomNode.addEventListener('drop', handleDrop)
  }
}

watch(() => props.modelValue, (newValue) => {
  if (editor && editor.getValue() !== newValue) {
    editor.setValue(newValue)
  }
})

watch(() => props.readonly, (newValue) => {
  if (editor) {
    editor.updateOptions({ readOnly: newValue })
  }
})

const handleDrop = (event: DragEvent) => {
  console.log('handleDrop 被调用')
  
  // 必须首先阻止默认行为
  event.preventDefault()
  event.stopPropagation()
  event.stopImmediatePropagation()
  
  if (!editor) {
    console.log('editor 不存在')
    return
  }
  
  const dragData = event.dataTransfer?.getData('text/plain')
  if (!dragData) {
    console.log('没有拖放数据')
    return
  }
  
  console.log('拖放数据:', dragData)
  
  // 获取鼠标drop位置
  const target = editor.getTargetAtClientPoint(event.clientX, event.clientY)
  if (!target || !target.position) {
    console.log('无法获取位置')
    return
  }
  
  const position = target.position
  console.log('插入位置:', position)
  
  // 直接使用executeEdits插入文本
  editor.executeEdits('drop', [
    {
      range: new monaco.Range(
        position.lineNumber,
        position.column,
        position.lineNumber,
        position.column
      ),
      text: dragData,
      forceMoveMarkers: true
    }
  ])
  
  // 移动光标到插入文本后
  editor.setPosition({
    lineNumber: position.lineNumber,
    column: position.column + dragData.length
  })
  
  editor.focus()
  console.log('插入完成')
}

// SQL语法校验
const validateSQL = (sql: string) => {
  if (!editor) return
  
  const model = editor.getModel()
  if (!model) return
  
  const markers: monaco.editor.IMarkerData[] = []
  const lines = sql.split('\n')
  
  lines.forEach((line, lineIndex) => {
    const lineNumber = lineIndex + 1
    const trimmedLine = line.trim().toUpperCase()
    
    // 检查1: SELECT未指定字段
    if (trimmedLine.startsWith('SELECT') && trimmedLine === 'SELECT') {
      markers.push({
        severity: monaco.MarkerSeverity.Error,
        startLineNumber: lineNumber,
        startColumn: 1,
        endLineNumber: lineNumber,
        endColumn: line.length + 1,
        message: 'SELECT语句必须指定字段或使用 *'
      })
    }
    
    // 检查2: 括号不匹配（跳过包含模板占位符的行）
    const hasPlaceholder = line.includes('${') || line.includes('}')
    if (!hasPlaceholder) {
      const openParens = (line.match(/\(/g) || []).length
      const closeParens = (line.match(/\)/g) || []).length
      if (openParens !== closeParens) {
        markers.push({
          severity: monaco.MarkerSeverity.Warning,
          startLineNumber: lineNumber,
          startColumn: 1,
          endLineNumber: lineNumber,
          endColumn: line.length + 1,
          message: '括号不匹配'
        })
      }
    }
    
    // 检查3: FROM后无表名
    if (trimmedLine.startsWith('FROM') && trimmedLine === 'FROM') {
      markers.push({
        severity: monaco.MarkerSeverity.Error,
        startLineNumber: lineNumber,
        startColumn: 1,
        endLineNumber: lineNumber,
        endColumn: line.length + 1,
        message: 'FROM后必须指定表名'
      })
    }
    
    // 检查4: WHERE后无条件
    if (trimmedLine.startsWith('WHERE') && trimmedLine === 'WHERE') {
      markers.push({
        severity: monaco.MarkerSeverity.Error,
        startLineNumber: lineNumber,
        startColumn: 1,
        endLineNumber: lineNumber,
        endColumn: line.length + 1,
        message: 'WHERE后必须指定条件'
      })
    }
    
    // 检查5: 未完成的JOIN
    if (trimmedLine.includes('JOIN') && !trimmedLine.includes('ON')) {
      markers.push({
        severity: monaco.MarkerSeverity.Warning,
        startLineNumber: lineNumber,
        startColumn: 1,
        endLineNumber: lineNumber,
        endColumn: line.length + 1,
        message: 'JOIN语句应该包含ON条件'
      })
    }
  })
  
  // 设置标记
  monaco.editor.setModelMarkers(model, 'sql', markers)
}

onMounted(() => {
  initEditor()
})

onBeforeUnmount(() => {
  if (editor) {
    editor.dispose()
    editor = null
  }
})

defineExpose({
  getValue: () => editor?.getValue() || '',
  setValue: (value: string) => editor?.setValue(value),
  focus: () => editor?.focus(),
  insertText: (text: string) => {
    if (editor) {
      const position = editor.getPosition()
      if (position) {
        // 使用 trigger type 模拟键盘输入，避免 snippet 语法
        editor.setPosition(position)
        editor.trigger('keyboard', 'type', { text: text })
      }
    }
  }
})
</script>

<style scoped>
.monaco-editor-container {
  width: 100%;
  height: v-bind(height);
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}
</style>
