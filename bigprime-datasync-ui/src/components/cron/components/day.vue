<template>
  <tiny-form>
    <tiny-row>
      <tiny-col :span="3">
        <tiny-form-item>
          <tiny-radio v-model='radioValue' :label="1">
            日，允许的通配符[, - * ? / L W]
          </tiny-radio>
        </tiny-form-item>
      </tiny-col>
    </tiny-row>

    <tiny-row>
      <tiny-col :span="3">
        <tiny-form-item>
          <tiny-radio v-model='radioValue' :label="2">
            不指定
          </tiny-radio>
        </tiny-form-item>
      </tiny-col>
    </tiny-row>

    <tiny-row>
      <tiny-col :span="3">
        <tiny-form-item>
          <tiny-radio v-model='radioValue' :label="3">
            周期从
            <tiny-input v-model='cycle01' :max="30" :min="1" type="number"/>
            -
            <tiny-input v-model='cycle02' :max="31" :min="cycle01 ? cycle01 + 1 : 2" type="number"/>
            日
          </tiny-radio>
        </tiny-form-item>
      </tiny-col>
    </tiny-row>

    <tiny-row>
      <tiny-col :span="3">
        <tiny-form-item>
          <tiny-radio v-model='radioValue' :label="4">
            从
            <tiny-input v-model='average01' :max="30" :min="1" type="number"/>
            号开始，每
            <tiny-input v-model='average02' :max="31 - average01 || 1" :min="1" type="number"/>
            日执行一次
          </tiny-radio>
        </tiny-form-item>
      </tiny-col>
    </tiny-row>

    <tiny-row>
      <tiny-col :span="3">
        <tiny-form-item>
          <tiny-radio v-model='radioValue' :label="5">
            每月
            <tiny-input v-model='workday' :max="31" :min="1" type="number"/>
            号最近的那个工作日
          </tiny-radio>
        </tiny-form-item>
      </tiny-col>
    </tiny-row>

    <tiny-row>
      <tiny-col :span="3">
        <tiny-form-item>
          <tiny-radio v-model='radioValue' :label="6">
            本月最后一天
          </tiny-radio>
        </tiny-form-item>
      </tiny-col>
    </tiny-row>

    <tiny-row>
      <tiny-col :span="6">
        <tiny-form-item>
          <tiny-radio v-model='radioValue' :label="7">
            指定
            <tiny-select v-model="checkboxList" :show-alloption="false" clearable multiple placeholder="可多选">
              <tiny-option v-for="item in 31" :key="item" :value="item">{{ item }}</tiny-option>
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
import emitter from '@/utils/evnetbus'

const radioValue = ref(1)
const workday = ref(1)
const cycle01 = ref(1)
const cycle02 = ref(2)
const average01 = ref(1)
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
  workday,
  cycle01,
  cycle02,
  average01,
  average02,
  checkboxList
})

// 单选按钮值变化时
const radioChange = () => {
  if (radioValue.value !== 2 && cron.value.week !== '?') {
    emitter.emit('upWeek')
  }
  switch (radioValue.value) {
    case 1:
      cron.value.day = '*'
      break
    case 2:
      cron.value.day = '?'
      break
    case 3:
      cycle01.value = checkNum(cycle01.value, 1, 30)
      cycle02.value = checkNum(cycle02.value, cycle01.value ? cycle01.value + 1 : 2, 31)
      cron.value.day = cycle01.value + '-' + cycle02.value
      break
    case 4:
      average01.value = checkNum(average01.value, 1, 30)
      average02.value = checkNum(average02.value, 1, 31 - average01.value || 0)
      cron.value.day = average01.value + '/' + average02.value
      break
    case 5:
      cron.value.day = workday.value + 'W'
      break
    case 6:
      cron.value.day = 'L'
      break
    case 7:
      cron.value.day = isEmpty(checkboxList.value) ? '*' : checkboxList.value.join()
      break
  }
}

watchEffect(() => radioChange())
</script>
