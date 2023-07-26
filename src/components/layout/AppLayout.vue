<script setup lang="ts">
    import  AppMenu from "./AppMenu.vue"
    import  AppHeader from "./AppHeader.vue"
    import { ElConfigProvider } from 'element-plus';
    import locale from 'element-plus/lib/locale/lang/zh-cn';

</script>

<template>
    <div class="common-layout">
      <el-container>
        <AppMenu/>
        <el-container class="hader-and-main">
          <AppHeader/>
          <el-main>
              <!-- 配置日期选择期为中文 -->
              <el-config-provider :locale="locale">
                <RouterView/>
              </el-config-provider>
          </el-main>
        </el-container>
      </el-container>
    </div>
</template>
  

<style scoped>
.hader-and-main {
    flex-direction: column;
    height: 100vh;
}

.el-main {
  background-color: #f4f4f5;
  /* padding-right: 0; */
}
</style>