<template>
  <!--    底部操作栏固定组件-->
  <div class="bottomOperate" :class="showClass" :style="{'pointer-events': isShowLoading ? 'none' : 'auto'}">
    <slot></slot>
  </div>
</template>

<script setup>
import { getCollapse } from '@/components/layout/isCollapse'
const props = defineProps({
  isShowLoading: Boolean,
  isFullScreen: Boolean
})
const showClass = computed(() => {
  return props.isFullScreen ? 'isFullScreen' : (getCollapse() ? 'navCollapsed' : 'navNoCollapsed')
})
</script>

<style lang="scss">
.bottomOperate {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  line-height: 57px;
  height: 57px;
  transition: left 300ms;
  text-align: right;
  padding: 0 16px;
  z-index: 999;
  background: rgba(255, 255, 255, 1);
  box-shadow: 0px -1px 10px 0px rgba(8, 54, 80, 0.06);
}

.isFullScreen {
  left: 0;
}

.navCollapsed {
  left: 60px
}

.navNoCollapsed {
  left: var(--menu-width)
}
</style>
