<script setup lang="ts">
  import { RouterLink, RouterView } from 'vue-router'
  import { processRoutes } from "@/api/router";
  
    // 处理路由
    processRoutes();
</script>

<template>
  <RouterView />
</template>

<style lang="scss" scoped>

</style>
