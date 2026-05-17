<template>
  <div class="layout">
    <tiny-container :aside-width="0" :header-height="0">
      <template #header>
      </template>
      <template #aside>
      </template>
      <tiny-layout class="layout-content">
        <router-view v-slot="{ Component, route }">
          <component :is="Component" :key="route.fullPath"/>
        </router-view>
      </tiny-layout>
    </tiny-container>
  </div>
</template>

<script lang="ts" setup>
import {Container as TinyContainer, Layout as TinyLayout,} from '@opentiny/vue'
</script>

<style lang="less" scoped>
.layout {
  width: 100%;
  height: 100%;
}


.layout :deep(.tiny-container .tiny-container__main) {
  color: #ccc;
  background-color: #f5f6f7;
}

.layout :deep(.layout-content) {
  height: 100%;
  padding: 0 10px;
  overflow: hidden;
}


// 组件无法固定非message的modal类型距离顶部距离
:deep(.tiny-modal__box) {
  top: 8px !important;
}

.theme-box {
  position: fixed;
  top: 88%;
  right: 30px;
  z-index: 99;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background-color: #fff;
  border-radius: 100%;
  cursor: pointer;

  img {
    display: block;
    width: inherit;
    height: inherit;
  }
}

.layout :deep(.tiny-button.tiny-button--primary) {
  //color: var(--ti-button-primary-text-color);
  //fill: var(--ti-button-primary-text-color);
  border-color: #002FA7;
  background-color: #002FA7;
}

.layout :deep(.tiny-button.tiny-button--primary.is-plain) {
  //color: var(--ti-button-primary-plain-text-color);
  fill: var(--ti-button-primary-plain-text-color);
  border-color: var(--ti-button-primary-plain-border-color);
  background-color: var(--ti-button-primary-plain-bg-color);
}

.layout :deep(.tiny-split-pane.left-pane, .tiny-split-pane.right-pane) {
  top: 0;
  bottom: 0;
  overflow: hidden;
}

.layout :deep(.tiny-split-wrapper) {
  --tv-Split-wrapper-border-color: var(--tv-color-border, #c2c2c2);
  --tv-Split-trigger-icon-line-color: var(--tv-color-icon, #808080);
  --tv-Split-trigger-icon-line-color-hover: var(--tv-color-icon-hover, #191919);
  --tv-Split-wrapper-radius-size: var(--tv-border-radius-lg, 8px);
  --tv-Split-trigger-line-bg-hover: var(--tv-color-border-active-control, #002FA7);
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: var(--tv-Split-wrapper-radius-size);
  border: 1px solid var(--tv-Split-wrapper-border-color);
}

.layout :deep(.tiny-picker .tiny-date-editor.tiny-input, .tiny-picker .tiny-date-editor.tiny-input__inner) {
  width: 260px;
}

.layout :deep {
  button svg,
  button polygon,
  button path,
  span.ql-picker-label svg,
  span.ql-picker-label polygon,
  span.ql-picker-label path {
    fill: #fff;
  }
}
</style>

<style>
.popover-cls {

}

.popover-cls .tiny-popover__title {
  font-size: 12px !important;
}
</style>