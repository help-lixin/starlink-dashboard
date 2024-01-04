<script setup lang="ts">
import AppMenu from './AppMenu.vue'
import AppHeader from './AppHeader.vue'
import locale from 'element-plus/lib/locale/lang/zh-cn'
</script>

<template>
  <div class="common-layout">
    <el-container>
      <AppMenu />
      <el-container class="header-and-main">
        <AppHeader />
        <el-main>
          <!-- 配置日期选择期为中文 -->
          <el-config-provider :locale="locale">
            <RouterView />
          </el-config-provider>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>


<style scoped lang="scss">
.header-and-main {
  flex-direction: column;
  height: 100vh;
}

.el-main {
  border: 1px solid var(--el-border-color);
  border-right: 0;
  border-bottom: 0;
  background-color: var(--el-bg-main-color);
  padding: 16px;
}
</style>
