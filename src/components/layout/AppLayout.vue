<script setup lang="ts">
    import  AppMenu from "./AppMenu.vue";
    import  AppHeader from "./AppHeader.vue"
</script>

<template>
    <div class="common-layout">
      <el-container>
        <AppMenu/>
        <el-container class="hader-and-main">
          <AppHeader/>
          <el-main>
            <el-scrollbar>
              <RouterView/>
            </el-scrollbar>
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
  padding-right: 0;
}
</style>