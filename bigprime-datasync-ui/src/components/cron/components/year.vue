<template>
  <tiny-form>
    <tiny-row>
      <tiny-col :span="3">
        <tiny-form-item>
          <tiny-radio v-model='radioValue' :label="1">
            不填，允许的通配符[, - * /]
          </tiny-radio>
        </tiny-form-item>
      </tiny-col>
    </tiny-row>

    <tiny-row>
      <tiny-col :span="3">
        <tiny-form-item>
          <tiny-radio v-model='radioValue' :label="2">
            每年
          </tiny-radio>
        </tiny-form-item>
      </tiny-col>
    </tiny-row>

    <tiny-row>
      <tiny-col :span="3">
        <tiny-form-item>
          <tiny-radio v-model='radioValue' :label="3">
            周期从
            <tiny-input v-model='cycle01' :max="2098" :min='fullYear' type="number"/>
            -
            <tiny-input v-model='cycle02' :max="2099" :min="cycle01 ? cycle01 + 1 : fullYear + 1" type="number"/>
          </tiny-radio>
        </tiny-form-item>
      </tiny-col>
    </tiny-row>

    <tiny-row>
      <tiny-col :span="3">
        <tiny-form-item>
          <tiny-radio v-model='radioValue' :label="4">
            从
            <tiny-input v-model='average01' :max="2098" :min='fullYear' type="number"/>
            年开始，每
            <tiny-input v-model='average02' :max="2099 - average01 || fullYear" :min="1" type="number"/>
            年执行一次
          </tiny-radio>
        </tiny-form-item>
      </tiny-col>
    </tiny-row>

    <tiny-row>
      <tiny-col :span="12">
        <tiny-form-item>
          <tiny-radio v-model='radioValue' :label="5">
            指定
            <tiny-select v-model="checkboxList" :show-alloption="false" clearable multiple placeholder="可多选">
              <tiny-option v-for="item in 10" :key="item" :label="item -1 + fullYear" :value="item - 1 + fullYear"/>
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
const cycle01 = ref(Number(new Date().getFullYear()))
const cycle02 = ref()
const average01 = ref(Number(new Date().getFullYear()))
const average02 = ref(1)
const checkboxList = ref([])
const fullYear = ref(Number(new Date().getFullYear()))
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
      cron.value.year = ''
      break
    case 2:
      cron.value.year = '*'
      break
    case 3:
      cycle01.value = checkNum(cycle01.value, fullYear.value, 2098)
      cycle02.value = checkNum(cycle02.value, cycle01.value ? cycle01.value + 1 : fullYear.value + 1, 2099)
      cron.value.year = cycle01.value + '-' + cycle02.value
      break
    case 4:
      average01.value = checkNum(average01.value, fullYear.value, 2098)
      average02.value = checkNum(average02.value, 1, 2099 - average01.value || fullYear.value)
      cron.value.year = average01.value + '/' + average02.value
      break
    case 5:
      cron.value.year = isEmpty(checkboxList.value) ? '' : checkboxList.value.join()
      break
  }
}

watchEffect(() => radioChange())
</script>
