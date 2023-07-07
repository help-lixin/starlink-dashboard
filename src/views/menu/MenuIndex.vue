<script setup lang="ts">
    import {queryMenuList} from "@/api/menu/menu"
    // 存储数据的引用
    const menuListRef = ref("");

    const  queryMenus = async (params={})=> {
        const menuList = await queryMenuList(params);
        return menuList;
    }

    queryMenus();
</script>

<template>
   menu index
</template>

<style lang="scss" scoped>

</style>