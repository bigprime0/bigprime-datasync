<template>
  <div class="div-css">
    <tiny-grid :data="emptyData">
      <template #empty>
        <span class="span-font">{{ msg }}</span>
      </template>
    </tiny-grid>
  </div>
</template>

<script lang="ts" setup>
import {ref} from "vue";

const imgUrl = defineModel('imgUrl', {default: '/images/reg.png'})
const msg = defineModel('msg', {default: '没有更多数据！'})
const emptyData = ref()
</script>
<style lang="less" scoped>
.div-css {
  width: 100%;
  height: 100%;
}

.span-font {
  font-size: 14px;
  color: #ff8800;
}
</style>