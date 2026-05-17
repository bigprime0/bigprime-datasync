 <template>
<!--  <div class="operator-title">
    <tiny-tag effect="dark" size="small" style="cursor: pointer" type="success" @click="handleBack">
      <IconArrowLeft/>
      <span>返回</span>
    </tiny-tag>
    <tiny-tag type="info">
      <span>连接器配置</span>
    </tiny-tag>
  </div>-->
  <div v-loading="isLoading" class="connector-form">
    <tiny-form ref="formRef" :model="formState" :rules="rules" label-width="150px" size="small">
      <div class="group-form-title">连接器配置</div>
      <tiny-divider></tiny-divider>
      <tiny-row>
        <tiny-col :span="6">
          <tiny-form-item :label="$t('connector.product')" prop="product">
            <div style="display: none">
              <tiny-input v-model="formState.id"/>
              <tiny-input v-model="formState.icon"/>
            </div>
            <!-- 点击弹出选择器 -->
            <tiny-input
                v-model="formState.product"
                placeholder="请选择连接器类型"
                readonly
                @click="showProductDialog = true"
                style="cursor: pointer"
            >
            </tiny-input>
          </tiny-form-item>
        </tiny-col>
        <tiny-col :span="6">
          <tiny-form-item :label="$t('connector.version')" prop="version">
            <tiny-input v-model="formState.version"/>
          </tiny-form-item>
        </tiny-col>
      </tiny-row>

      <tiny-row>
        <tiny-col :span="6">
          <tiny-form-item :label="$t('common.name')" prop="name">
            <tiny-input v-model="formState.name"/>
          </tiny-form-item>
        </tiny-col>
        <tiny-col :span="6">
          <tiny-form-item :label="$t('connector.implClass')" prop="implClass">
            <tiny-input v-model="formState.implClass" :disabled="true"/>
          </tiny-form-item>
        </tiny-col>
      </tiny-row>

      <tiny-row>
        <tiny-col :span="6">
          <tiny-form-item :label="$t('connector.category')" prop="category">
            <tiny-input v-model="formState.category" :disabled="true"/>
          </tiny-form-item>
        </tiny-col>
        <tiny-col :span="6">
          <tiny-form-item :label="$t('connector.tags')" prop="tags">
            <!--            <tiny-input v-model="formState.tags" :disabled="true" />-->
            <tiny-select v-model="formState.tags" allow-create clearable filterable multiple>
              <tiny-option
                  v-for="item in options"
                  :key="item.name"
                  :label="item.name"
                  :value="item.name"
              />
            </tiny-select>
          </tiny-form-item>
        </tiny-col>
      </tiny-row>

      <tiny-row>
        <tiny-col :span="12">
          <tiny-form-item :label="$t('connector.description')" prop="description">
            <tiny-input
                v-model="formState.description"
                :rows="2"
                autosize
                placeholder="请输入描述信息"
                type="textarea"
            />
          </tiny-form-item>
        </tiny-col>
      </tiny-row>

      <div v-if="selectImpl !== null">
        <div class="group-form-title">连接参数配置</div>
        <tiny-divider></tiny-divider>
        <tiny-row>
          <template v-for="(item, index) in selectImpl.parameters" :key="item.name">
            <tiny-col v-if="index % 2 === 1 && item.component != 'PROPERTY'" :span="6">
              <tiny-form-item :label="item.title">
                <tiny-input
                    v-if="item.component == 'TEXT'"
                    v-model="formState.param[item.name]"
                ></tiny-input>

                <tiny-input
                    v-if="item.component == 'TEXTAREA'"
                    v-model="formState.param[item.name]"
                    :autosize="{ minRows: 2, maxRows: 3 }"
                    show-word-limit
                    type="textarea"
                ></tiny-input>

                <tiny-input
                    v-if="item.component == 'PASSWORD'"
                    v-model="formState.param[item.name]"
                    type="password"
                ></tiny-input>

                <tiny-input
                    v-if="item.component == 'NUMBER'"
                    v-model="formState.param[item.name]"
                    circulate
                    type="number"
                >
                </tiny-input>

                <tiny-switch v-if="item.component == 'SWITCH'" v-model="formState.param[item.name]">
                </tiny-switch>

                <tiny-radio-group
                    v-if="item.component == 'RADIO'"
                    v-model="formState.param[item.name]"
                >
                  <tiny-radio
                      v-for="x in item.dataSource.split('|')"
                      :key="x"
                      :label="x"
                      :text="x"
                  ></tiny-radio>
                </tiny-radio-group>

                <tiny-select
                    v-if="item.component == 'SELECT'"
                    v-model="formState.param[item.name]"
                    clearable
                >
                  <tiny-option
                      v-for="x in item.dataSource.split('|')"
                      :key="x"
                      :value="x"
                      :label="x"
                  ></tiny-option>
                </tiny-select>
              </tiny-form-item>
            </tiny-col>
            <tiny-col v-if="index % 2 === 0 && item.component != 'PROPERTY'" :span="6">
              <tiny-form-item :label="item.title">
                <tiny-input
                    v-if="item.component == 'TEXT'"
                    v-model="formState.param[item.name]"
                ></tiny-input>

                <tiny-input
                    v-if="item.component == 'TEXTAREA'"
                    v-model="formState.param[item.name]"
                    :autosize="{ minRows: 2, maxRows: 3 }"
                    show-word-limit
                    type="textarea"
                ></tiny-input>

                <tiny-input
                    v-if="item.component == 'PASSWORD'"
                    v-model="formState.param[item.name]"
                    type="password"
                ></tiny-input>

                <tiny-input
                    v-if="item.component == 'NUMBER'"
                    v-model="formState.param[item.name]"
                    circulate
                    type="number"
                >
                </tiny-input>

                <tiny-switch v-if="item.component == 'SWITCH'" v-model="formState.param[item.name]">
                </tiny-switch>

                <tiny-radio-group
                    v-if="item.component == 'RADIO'"
                    v-model="formState.param[item.name]"
                >
                  <tiny-radio
                      v-for="x in item.dataSource.split('|')"
                      :key="x"
                      :label="x"
                      :text="x"
                  ></tiny-radio>
                </tiny-radio-group>

                <tiny-select
                    v-if="item.component == 'SELECT'"
                    v-model="formState.param[item.name]"
                    clearable
                >
                  <tiny-option
                      v-for="x in item.dataSource.split('|')"
                      :key="x"
                      :value="x"
                      :label="x"
                  ></tiny-option>
                </tiny-select>
              </tiny-form-item>
            </tiny-col>
            <tiny-col v-if="item.component == 'PROPERTY'" :span="12">
              <tiny-form-item :label="item.title">
                <tiny-input
                    v-model="formState.param[item.name]"
                    autosize
                    placeholder="custom_prop1=prop_value1&#10;custom_prop2=prop_value2"
                    show-word-limit
                    type="textarea"
                ></tiny-input>
              </tiny-form-item>
            </tiny-col>
          </template>
        </tiny-row>
      </div>

      <tiny-form-item>
        <tiny-button type="primary" @click="handleSubmit()"> 提交</tiny-button>
        <tiny-button @click="handleTest()"> 连接测试</tiny-button>
        <tiny-button @click="handleReset"> 重置</tiny-button>
        <tiny-button @click="handleCancel"> 取消</tiny-button>
      </tiny-form-item>
    </tiny-form>
  </div>

  <!-- 连接器选择对话框 -->
  <tiny-dialog-box
    v-model:visible="showProductDialog"
    title="选择连接器类型"
    :append-to-body="true"
    width="800px"
    @close="handleDialogClose"
  >
    <div class="product-selector-dialog">
      <!-- 搜索框 -->
      <tiny-search
        v-model="productSearchText"
        placeholder="请输入关键词搜索"
        style="margin-bottom: 16px"
      />
      
      <!-- 产品卡片网格 -->
      <div class="product-cards-container">
        <div class="product-cards">
          <div 
            v-for="item in filteredImpls" 
            :key="item.name"
            class="product-card"
            :class="{ 'selected': selectedProduct === item.name }"
            @click="selectedProduct = item.name"
          >
            <div class="card-icon">
              <img 
                :src="'/images/products/' + item.name.toLowerCase() + '.svg'" 
                :alt="item.name"
                @error="handleImageError"
              />
            </div>
            <div class="card-title">{{ item.name }}</div>
            <!-- 协议说明按钮 -->
            <div 
              v-if="isIoTProtocol(item.name)" 
              class="protocol-info-btn"
              @click.stop="showProtocolInfo(item.name)"
              title="查看协议说明"
            >
              <IconHelpQuery />
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <template #footer>
      <tiny-button @click="showProductDialog = false">取消</tiny-button>
      <tiny-button type="primary" @click="handleProductConfirm">确定</tiny-button>
    </template>
  </tiny-dialog-box>

  <!-- 协议说明对话框 -->
  <tiny-dialog-box
    v-model:visible="showProtocolGuideDialog"
    :title="currentGuide?.displayName + ' - 协议说明'"
    :append-to-body="true"
    width="900px"
    :top="'5vh'"
    class="protocol-guide-dialog"
  >
    <div v-if="currentGuide" class="protocol-guide-content">
      <!-- 基本信息 -->
      <div class="guide-section">
        <div class="section-title">
          <IconInfoCircle /> 协议简介
        </div>
        <div class="section-content">{{ currentGuide.description }}</div>
      </div>

      <!-- 应用场景 -->
      <div class="guide-section">
        <div class="section-title">
          <IconSetting /> 应用场景
        </div>
        <ul class="section-list">
          <li v-for="(scenario, idx) in currentGuide.scenarios" :key="idx">
            {{ scenario }}
          </li>
        </ul>
      </div>

      <!-- 协议标准 -->
      <div class="guide-section">
        <div class="section-title">
          <IconCheckedSur /> 适用标准
        </div>
        <ul class="section-list">
          <li v-for="(std, idx) in currentGuide.standards" :key="idx">
            {{ std }}
          </li>
        </ul>
      </div>

      <!-- 数据上报策略 -->
      <div class="guide-section">
        <div class="section-title">
          <IconUpload /> 数据上报策略
        </div>
        <div class="section-content highlight">{{ currentGuide.dataReportStrategy }}</div>
      </div>

      <!-- 优势 -->
      <div class="guide-section">
        <div class="section-title">
          <IconYes /> 技术优势
        </div>
        <ul class="section-list">
          <li v-for="(adv, idx) in currentGuide.advantages" :key="idx" class="advantage">
            {{ adv }}
          </li>
        </ul>
      </div>

      <!-- 限制 -->
      <div class="guide-section">
        <div class="section-title">
          <IconWarning /> 使用限制
        </div>
        <ul class="section-list">
          <li v-for="(lim, idx) in currentGuide.limitations" :key="idx" class="limitation">
            {{ lim }}
          </li>
        </ul>
      </div>

      <!-- 配置提示 -->
      <div class="guide-section">
        <div class="section-title">
          <IconEdit /> 配置提示
        </div>
        <ul class="section-list">
          <li v-for="(tip, idx) in currentGuide.configTips" :key="idx" class="tip">
            {{ tip }}
          </li>
        </ul>
      </div>

      <!-- 典型设备 -->
      <div class="guide-section">
        <div class="section-title">
          <IconShare /> 典型设备
        </div>
        <div class="device-tags">
          <tiny-tag 
            v-for="(device, idx) in currentGuide.typicalDevices" 
            :key="idx"
            type="info"
            size="small"
            effect="plain"
          >
            {{ device }}
          </tiny-tag>
        </div>
      </div>
    </div>
    
    <template #footer>
      <tiny-button type="primary" @click="showProtocolGuideDialog = false">知道了</tiny-button>
    </template>
  </tiny-dialog-box>
</template>

<script lang="ts" setup>
import {computed, onMounted, ref} from 'vue'
import emitter from '@/utils/evnetbus'
import {useI18n} from 'vue-i18n'
import {Modal, TinyButton, TinyCol, TinyDialogBox, TinyDivider, TinyForm, TinyFormItem, TinyImage, TinyInput, TinyOption, TinyRadio, TinyRadioGroup, TinyRow, TinySearch, TinySelect, TinySwitch, TinyTag} from '@opentiny/vue'
import {
  iconArrowLeft, 
  iconChevronDown, 
  iconHelpQuery,
  iconInfoCircle,
  iconSetting,
  iconCheckedSur,
  iconUpload,
  iconYes,
  iconWarning,
  iconEdit,
  iconShare
} from '@opentiny/vue-icon'
import {ConnectorService} from '@/services/connector'
import { getProtocolGuide, isIoTProtocol, type ProtocolGuide } from '@/data/iot-protocol-guide'

const {t} = useI18n()
const IconArrowLeft = iconArrowLeft()
const IconHelpQuery = iconHelpQuery()
const IconInfoCircle = iconInfoCircle()
const IconSetting = iconSetting()
const IconCheckedSur = iconCheckedSur()
const IconUpload = iconUpload()
const IconYes = iconYes()
const IconWarning = iconWarning()
const IconEdit = iconEdit()
const IconShare = iconShare()
const formRef = ref()
const formState = ref<any>({
  id: null,
  name: '',
  product: '',
  version: '',
  icon: '',
  category: '',
  tags: '',
  implClass: '',
  description: '',
  param: {}
})
const rules = ref({
  /*  name: [{ required: true, message: '必填', trigger: 'blur' }],
  country: [{ required: true, message: '必填', trigger: 'blur' }]*/
})
const selectProductRef = ref()
const impls = ref<any>({})
const selectImpl = ref<any>(null)
const svgUrl = ref('')
const options = ref<any[]>([])
const isLoading = ref(false)
const currentConnector = defineModel<any>('currentRow', {default: {}})

// 对话框相关状态
const showProductDialog = ref(false)
const selectedProduct = ref('')
const productSearchText = ref('')

// 协议说明对话框
const showProtocolGuideDialog = ref(false)
const currentGuide = ref<ProtocolGuide | null>(null)

// 过滤后的连接器列表
const filteredImpls = computed(() => {
  if (!productSearchText.value) {
    return impls.value
  }
  const searchLower = productSearchText.value.toLowerCase()
  return impls.value.filter((item: any) => 
    item.name?.toLowerCase().includes(searchLower) ||
    item.category?.toLowerCase().includes(searchLower)
  )
})

onMounted(async () => {
  await loadConnectorImplClasses()
  if (currentConnector.value) {
    handleProductChange(currentConnector.value.product)
  }
  console.log(currentConnector.value)
})

const handleProductChange = (value: any) => {
  selectImpl.value = null
  formState.value = {
    param: {}
  }
  const finds = impls.value.filter((item: any) => item.name === value)
  if (finds.length !== 0) {
    const find = finds[0]
    formState.value.product = find.name
    formState.value.implClass = find.implClass
    formState.value.icon = find.icon || find.name.toLowerCase() + '.svg'
    formState.value.category = find.category
    formState.value.implClass = find.implClass
    svgUrl.value = '/images/products/' + formState.value.icon
    if (find.parameters.length !== 0) {
      find.parameters.forEach((x: any) => {
        if (x.defaultValue) {
          if (x.name === 'additional') {
            formState.value.param[x.name] = null
          } else {
            formState.value.param[x.name] = x.defaultValue
          }
        }
      })
    }
    selectImpl.value = find
  }
  if (currentConnector.value) {
    formState.value.id = currentConnector.value.id
    formState.value.product = currentConnector.value.product
    formState.value.icon = currentConnector.value.icon
    formState.value.category = currentConnector.value.category
    formState.value.implClass = currentConnector.value.implClass
    formState.value.version = currentConnector.value.version
    formState.value.name = currentConnector.value.name
    formState.value.description = currentConnector.value.description
    if (currentConnector.value.tags) {
      if (Array.isArray(currentConnector.value.tags)) {
        formState.value.tags = currentConnector.value.tags
      } else {
        formState.value.tags = JSON.parse(currentConnector.value.tags)
      }
    }
    formState.value.param = JSON.parse(currentConnector.value.connectorParams)

    ConnectorService.getConnectorDetail(currentConnector.value.id).then((response: any) => {
      console.log(response)
    })
  }
}

// 处理图片加载失败 - 隐藏图标容器
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  const iconContainer = target.parentElement
  if (iconContainer) {
    iconContainer.style.display = 'none'
  }
}

// 处理对话框关闭
const handleDialogClose = () => {
  productSearchText.value = ''
  selectedProduct.value = ''
}

// 处理产品选择确认
const handleProductConfirm = () => {
  if (selectedProduct.value) {
    formState.value.product = selectedProduct.value
    handleProductChange(selectedProduct.value)
    showProductDialog.value = false
    handleDialogClose()
  }
}

// 显示协议说明
const showProtocolInfo = (productName: string) => {
  const guide = getProtocolGuide(productName)
  if (guide) {
    currentGuide.value = guide
    showProtocolGuideDialog.value = true
  }
}

/**
 * 请求服务加载选择连接器类型的参数列表
 */
const loadConnectorImplClasses = async () => {
  const resp: any = await ConnectorService.getConnectorImplClasses()
  if (resp.code == '0') {
    impls.value = resp.data
  }
}

const handleSubmit = () => {
  isLoading.value = true
  try {
    formRef.value.validate((valid: boolean) => {
      if (valid) {
        const connectParams = {connectorParams: JSON.stringify(formState.value.param)}
        if (formState.value.tags) {
          formState.value.tags = JSON.stringify(formState.value.tags)
        }
        ConnectorService.registerConnector({
          ...formState.value,
          ...connectParams
        }).then((res: any) => {
          console.log(res)
          emitter.emit('handleConnector')
          isLoading.value = false
          formRef.value.resetFields()
        })
      }
    })
  } catch (e) {
    console.error('提交失败', e)
  } finally {
    isLoading.value = false
  }
}

const handleTest = () => {
  formRef.value.validate((valid: boolean) => {
    if (valid) {
      const params = {
        id: formState.value.id,
        name: formState.value.name,
        product: formState.value.product,
        version: formState.value.version,
        icon: formState.value.icon,
        category: formState.value.category,
        tags: formState.value.tags ? JSON.stringify(formState.value.tags) : '',
        implClass: formState.value.implClass,
        description: formState.value.description,
        connectorParams: JSON.stringify(formState.value.param)
      }
      ConnectorService.testConnector(params).then((resp: any) => {
        if (resp.msg === 'success') {
          Modal.message({status: 'success', message: '测试连接成功!', top: 20})
        } else {
          Modal.message({status: 'success', message: '测试连接失败：' + resp.msg, top: 20})
        }
      })
      // emitter.emit('handleTest', params)
    }
  })
}

const handleBack = () => {
  emitter.emit('handleBack')
}

const handleReset = () => {
  formRef.value.resetFields()
}

const handleCancel = () => {
  handleBack()
}
</script>

<style lang="less" scoped>
.operator-title {
  .tiny-tag {
    margin-right: 5px;
  }
}

.connector-form {
  width: 70%;
  margin: 0 auto;
}

.form-title {
  font-size: 15px;
}

.group-form-title {
  font-size: 16px;
  color: #191919;
  font-weight: bold;
}

.icon-input-container {
  display: flex;
  align-items: center;

  .tiny-input {
    flex: 1;
  }

  .product-icon {
    margin-left: 10px;
    width: 26px;
    height: 26px;
  }
}

/* 下拉选项样式 */
.connector-option {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .option-icon {
    width: 24px;
    height: 24px;
    object-fit: contain;
    flex-shrink: 0;
  }
  
  .option-label {
    font-size: 14px;
    color: #191919;
  }
}

/* 产品选择对话框 */
.product-selector-dialog {
  .product-cards-container {
    max-height: 500px;
    overflow-y: auto;
    
    .product-cards {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      padding: 8px 0;
    }
    
    .product-card {
      display: flex;
      align-items: center;
      padding: 16px 20px;
      border: 1px solid #e4e7ed;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.3s ease;
      background: #fff;
      position: relative;
      
      &:hover {
        border-color: #5e7ce0;
        box-shadow: 0 2px 8px rgba(94, 124, 224, 0.15);
        transform: translateY(-2px);
        
        .protocol-info-btn {
          opacity: 1;
        }
      }
      
      &.selected {
        border-color: #5e7ce0;
        background: #f5f7fa;
        box-shadow: 0 0 0 1px #5e7ce0;
      }
      
      .card-icon {
        width: 40px;
        height: 40px;
        margin-right: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        
        img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
      }
      
      .card-title {
        font-size: 14px;
        color: #191919;
        font-weight: 500;
        word-break: break-word;
        flex: 1;
      }
      
      .protocol-info-btn {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #5e7ce0;
        opacity: 0;
        transition: opacity 0.3s ease;
        z-index: 1;
        
        &:hover {
          color: #3e5fc0;
        }
        
        svg {
          width: 16px;
          height: 16px;
        }
      }
    }
  }
}

/* 协议说明对话框样式 */
.protocol-guide-dialog {
  :deep(.tiny-dialog-box__body) {
    max-height: calc(90vh - 210px) !important;
    overflow: hidden !important;
    padding: 0 !important;
  }
  
  :deep(.tiny-dialog-box__footer) {
    display: flex !important;
    justify-content: center !important;
    padding: 12px 20px !important;
    border-top: 1px solid #e4e7ed;
  }
  
  .protocol-guide-content {
    max-height: calc(90vh - 230px);
    overflow-y: auto;
    padding: 16px;
    
    // 隐藏滚动条但保留滚动功能
    scrollbar-width: none;
    -ms-overflow-style: none;
    
    &::-webkit-scrollbar {
      display: none;
    }
    
    .guide-section {
      margin-bottom: 24px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .section-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 15px;
        font-weight: 600;
        color: #191919;
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 2px solid #e4e7ed;
        
        svg {
          width: 18px;
          height: 18px;
          color: #5e7ce0;
        }
      }
      
      .section-content {
        font-size: 14px;
        line-height: 1.8;
        color: #606266;
        padding: 12px;
        background: #f5f7fa;
        border-radius: 4px;
        
        &.highlight {
          background: #ecf5ff;
          border-left: 3px solid #5e7ce0;
          padding-left: 15px;
        }
      }
      
      .section-list {
        list-style: none;
        padding: 0;
        margin: 0;
        
        li {
          font-size: 14px;
          line-height: 1.8;
          color: #606266;
          padding: 8px 12px;
          margin-bottom: 6px;
          border-radius: 4px;
          background: #fafafa;
          position: relative;
          padding-left: 28px;
          
          &::before {
            content: '•';
            position: absolute;
            left: 12px;
            color: #909399;
            font-weight: bold;
          }
          
          &.advantage::before {
            content: '✔';
            color: #67c23a;
          }
          
          &.limitation::before {
            content: '⚠';
            color: #f56c6c;
          }
          
          &.tip::before {
            content: '💡';
          }
        }
      }
      
      .device-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        
        .tiny-tag {
          font-size: 12px;
        }
      }
    }
  }
}
</style>
