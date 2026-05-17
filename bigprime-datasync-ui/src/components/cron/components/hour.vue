<template>
  <tiny-form>
    <tiny-row>
      <tiny-col :span="3">
        <tiny-form-item>
          <tiny-radio v-model='radioValue' :label="1">
            小时，允许的通配符[, - * /]
          </tiny-radio>
        </tiny-form-item>
      </tiny-col>
    </tiny-row>

    <tiny-row>
      <tiny-col :span="3">
        <tiny-form-item>
          <tiny-radio v-model='radioValue' :label="2">
            周期从
            <tiny-input v-model='cycle01' :max="22" :min="0" type="number"/>
            -
            <tiny-input v-model='cycle02' :max="23" :min="cycle01 ? cycle01 + 1 : 1" type="number"/>
            小时
          </tiny-radio>
        </tiny-form-item>
      </tiny-col>
    </tiny-row>

    <tiny-row>
      <tiny-col :span="3">
        <tiny-form-item>
          <tiny-radio v-model='radioValue' :label="3">
            从
            <tiny-input v-model='average01' :max="22" :min="0" type="number"/>
            小时开始，每
            <tiny-input v-model='average02' :max="23 - average01 || 0" :min="1" type="number"/>
            小时执行一次
          </tiny-radio>
        </tiny-form-item>
      </tiny-col>
    </tiny-row>

    <tiny-row>
      <tiny-col :span="6">
        <tiny-form-item>
          <tiny-radio v-model='radioValue' :label="4">
            指定
            <tiny-select v-model="checkboxList" :show-alloption="false" clearable multiple placeholder="可多选">
              <tiny-option v-for="item in 24" :key="item" :value="item-1">{{ item - 1 }}</tiny-option>
            </tiny-select>
          </tiny-radio>
        </tiny-form-item>
      </tiny-col>
    </tiny-row>
  </tiny-form>
</template>

<script lang="ts" setup>
import {ref, watchEffect} from 'vue'
import {checkNum} from '@/utils/tool'
import {isEmpty} from 'lodash-es'

const radioValue = ref(1)
const cycle01 = ref(0)
const cycle02 = ref(1)
const average01 = ref(0)
const average02 = ref(1)
const checkboxList = ref([])
const cron = defineModel('cron', {
  default: {
    second: '*',
    min: '*',
    hour: '*',
    day: '*',
    month: '*',
    week: '?',
    year: ''
  }
})

defineExpose({
  radioValue,
  cycle01,
  cycle02,
  average01,
  average02,
  checkboxList
})

// 单选按钮值变化时
const radioChange = () => {
  switch (radioValue.value) {
    case 1:
      cron.value.hour = '*'
      break
    case 2:
      cycle01.value = checkNum(cycle01.value, 0, 22)
      cycle02.value = checkNum(cycle02.value, cycle01.value ? cycle01.value + 1 : 1, 23)
      cron.value.hour = cycle01.value + '-' + cycle02.value
      break
    case 3:
      average01.value = checkNum(average01.value, 0, 22)
      average02.value = checkNum(average02.value, 1, 23 - average01.value || 0)
      cron.value.hour = average01.value + '/' + average02.value
      break
    case 4:
      cron.value.hour = isEmpty(checkboxList.value) ? '*' : checkboxList.value.join()
      break
  }
}

watchEffect(() => radioChange())
</script>
