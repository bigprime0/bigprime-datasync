<template>
  <div>
    <tiny-tabs v-model="cronTabActiveName">
      <tiny-tab-item lazy name="second" title="秒">
        <CrontabSecond ref="secondRef" :cron="cron"/>
      </tiny-tab-item>

      <tiny-tab-item lazy name="min" title="分钟">
        <CrontabMin ref="minRef" :cron="cron"/>
      </tiny-tab-item>

      <tiny-tab-item lazy name="hour" title="小时">
        <CrontabHour ref="hourRef" :cron="cron"/>
      </tiny-tab-item>

      <tiny-tab-item lazy name="day" title="日">
        <CrontabDay ref="dayRef" :cron="cron"/>
      </tiny-tab-item>

      <tiny-tab-item lazy name="month" title="月">
        <CrontabMonth ref="monthRef" :cron="cron"/>
      </tiny-tab-item>

      <tiny-tab-item lazy name="week" title="周">
        <CrontabWeek ref="weekRef" :cron="cron"/>
      </tiny-tab-item>

      <tiny-tab-item lazy name="year" title="年">
        <CrontabYear ref="yearRef" :cron="cron"/>
      </tiny-tab-item>
    </tiny-tabs>
  </div>
  <div class="popup-main">
    <div class="popup-result">
      <p class="title">时间表达式</p>
      <table>
        <thead>
        <th v-for="item of cronTabTitles" :key="item" width="40">{{ item }}</th>
        <th>Cron 表达式</th>
        </thead>
        <tbody>
        <td>
          <span>{{ cron.second }}</span>
        </td>
        <td>
          <span>{{ cron.min }}</span>
        </td>
        <td>
          <span>{{ cron.hour }}</span>
        </td>
        <td>
          <span>{{ cron.day }}</span>
        </td>
        <td>
          <span>{{ cron.month }}</span>
        </td>
        <td>
          <span>{{ cron.week }}</span>
        </td>
        <td>
          <span>{{ cron.year }}</span>
        </td>
        <td>
          <span>{{ cronString }}</span>
        </td>
        </tbody>
      </table>
    </div>

    <div class="pop_btn">
      <tiny-button plain type="primary" @click="closeCron(false)">{{ $t('common.operations.cancel') }}</tiny-button>
      <tiny-button :reset-time="500" type="primary" @click="closeCron(true)">{{ $t('common.operations.save') }}
      </tiny-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {computed, type Ref, ref, watch} from 'vue'
import {forEach, isEmpty, split} from 'lodash-es'
import emitter from '@/utils/evnetbus'
import CrontabSecond from './components/second.vue'
import CrontabMin from './components/min.vue'
import CrontabHour from './components/hour.vue'
import CrontabDay from './components/day.vue'
import CrontabMonth from './components/month.vue'
import CrontabWeek from './components/week.vue'
import CrontabYear from './components/year.vue'

const cron = ref({
  second: '*',
  min: '*',
  hour: '*',
  day: '*',
  month: '*',
  week: '?',
  year: ''
})
const cronTabTitles = ref(['秒', '分钟', '小时', '日', '月', '周', '年'])
const cronTabActiveName = ref('second')
const secondRef = ref()
const minRef = ref()
const hourRef = ref()
const dayRef = ref()
const monthRef = ref()
const weekRef = ref()
const yearRef = ref()
type Refs = {
  [key: string]: Ref
}
const refs: Refs = {
  secondRef: secondRef,
  minRef: minRef,
  hourRef: hourRef,
  dayRef: dayRef,
  monthRef: monthRef,
  weekRef: weekRef,
  yearRef: yearRef
}

const cronExpression = defineModel('cronExpression', {default: ''})
const cronString = computed(() => {
  let str =
      cron.value.second +
      ' ' +
      cron.value.min +
      ' ' +
      cron.value.hour +
      ' ' +
      cron.value.day +
      ' ' +
      cron.value.month +
      ' ' +
      cron.value.week +
      (cron.value.year == '' ? '' : ' ' + cron.value.year)
  return str
})

watch(cronExpression, () => resolveCronExpression())

const resolveCronExpression = () => {
  if (!isEmpty(cronExpression.value)) {
    let arr = split(cronExpression.value, ' ')
    if (arr.length >= 6) {
      //6 位以上是合法表达式
      cron.value = {
        second: arr[0],
        min: arr[1],
        hour: arr[2],
        day: arr[3],
        month: arr[4],
        week: arr[5],
        year: arr[6] ? arr[6] : ''
      }

      forEach(cron.value, function (value, key) {
        changeRadio(key, value)
      })
    } else {
      clearCron()
    }
  } else {
    // 没有传入的表达式 则还原
    clearCron()
  }
}

//还原选择项
const clearCron = () => {
  cron.value = {
    second: '*',
    min: '*',
    hour: '*',
    day: '*',
    month: '*',
    week: '?',
    year: ''
  }
  forEach(cron.value, function (value, key) {
    changeRadio(key, value)
  })
}

const changeRadio = (name: any, value: any) => {
  let arr = ['second', 'min', 'hour', 'month'],
      refName = name + 'Ref',
      insValue
  if (!refs[refName] || refs[refName].value == null) return
  if (arr.includes(name)) {
    if (value === '*') {
      insValue = 1
    } else if (value.indexOf('-') > -1) {
      let indexArr = value.split('-')
      isNaN(indexArr[0])
          ? (refs[refName].value.cycle01 = 0)
          : (refs[refName].value.cycle01 = indexArr[0])
      refs[refName].value.cycle02 = indexArr[1]
      insValue = 2
    } else if (value.indexOf('/') > -1) {
      let indexArr = value.split('/')
      isNaN(indexArr[0])
          ? (refs[refName].value.average01 = 0)
          : (refs[refName].value.average01 = indexArr[0])
      refs[refName].value.average02 = indexArr[1]
      insValue = 3
    } else {
      insValue = 4
      refs[refName].value.checkboxList = value.split(',')
    }
  } else if (name == 'day') {
    if (value === '*') {
      insValue = 1
    } else if (value == '?') {
      insValue = 2
    } else if (value.indexOf('-') > -1) {
      let indexArr = value.split('-')
      isNaN(indexArr[0])
          ? (refs[refName].value.cycle01 = 0)
          : (refs[refName].value.cycle01 = indexArr[0])
      refs[refName].value.cycle02 = indexArr[1]
      insValue = 3
    } else if (value.indexOf('/') > -1) {
      let indexArr = value.split('/')
      isNaN(indexArr[0])
          ? (refs[refName].value.average01 = 0)
          : (refs[refName].value.average01 = indexArr[0])
      refs[refName].value.average02 = indexArr[1]
      insValue = 4
    } else if (value.indexOf('W') > -1) {
      let indexArr = value.split('W')
      isNaN(indexArr[0])
          ? (refs[refName].value.workday = 0)
          : (refs[refName].value.workday = indexArr[0])
      insValue = 5
    } else if (value === 'L') {
      insValue = 6
    } else {
      refs[refName].value.checkboxList = value.split(',')
      insValue = 7
    }
  } else if (name == 'week') {
    if (value === '*') {
      insValue = 1
    } else if (value == '?') {
      insValue = 2
    } else if (value.indexOf('-') > -1) {
      let indexArr = value.split('-')
      isNaN(indexArr[0])
          ? (refs[refName].value.cycle01 = 0)
          : (refs[refName].value.cycle01 = indexArr[0])
      refs[refName].value.cycle02 = indexArr[1]
      insValue = 3
    } else if (value.indexOf('#') > -1) {
      let indexArr = value.split('#')
      isNaN(indexArr[0])
          ? (refs[refName].value.average01 = 1)
          : (refs[refName].value.average01 = indexArr[0])
      refs[refName].value.average02 = indexArr[1]
      insValue = 4
    } else if (value.indexOf('L') > -1) {
      let indexArr = value.split('L')
      isNaN(indexArr[0])
          ? (refs[refName].value.weekday = 1)
          : (refs[refName].value.weekday = indexArr[0])
      insValue = 5
    } else {
      refs[refName].value.checkboxList = value.split(',')
      insValue = 6
    }
  } else if (name == 'year') {
    if (value == '') {
      insValue = 1
    } else if (value == '*') {
      insValue = 2
    } else if (value.indexOf('-') > -1) {
      insValue = 3
    } else if (value.indexOf('/') > -1) {
      insValue = 4
    } else {
      refs[refName].value.checkboxList = value.split(',')
      insValue = 5
    }
  }
  refs[refName].value.radioValue = insValue
}

const closeCron = (isUp: any) => {
  if (!isUp) {
    resolveCronExpression()
  }
  emitter.emit('closeCron', isUp ? cronString.value : cronExpression.value)
}

emitter.on('upWeek', () => {
  weekRef.value.radioValue = 2
  cron.value.week = '?'
})

emitter.on('upDay', () => {
  dayRef.value.radioValue = 2
  cron.value.day = '?'
})

</script>
<style lang="less" scoped>
.pop_btn {
  text-align: center;
  margin-top: 20px;
}

.popup-main {
  position: relative;
  margin: 10px auto;
  background: #fff;
  border-radius: 5px;
  font-size: 12px;
  overflow: hidden;
  color: #2c3e50;
}

.popup-title {
  overflow: hidden;
  line-height: 34px;
  padding-top: 6px;
  background: #f2f2f2;
}

.popup-result {
  box-sizing: border-box;
  line-height: 24px;
  margin: 25px auto;
  padding: 15px 10px 10px;
  border: 1px solid #ccc;
  position: relative;
}

.popup-result .title {
  position: absolute;
  top: -28px;
  left: 50%;
  width: 140px;
  font-size: 14px;
  margin-left: -70px;
  text-align: center;
  line-height: 30px;
  background: #fff;
}

.popup-result table {
  text-align: center;
  width: 100%;
  margin: 0 auto;
}

.popup-result table span {
  display: block;
  width: 100%;
  font-family: arial;
  line-height: 30px;
  height: 30px;
  white-space: nowrap;
  overflow: hidden;
  border: 1px solid #e8e8e8;
}
</style>
