<script setup lang="ts">
    import {queryMenuList} from "@/api/menus"
    import type {SysMenuItem} from "@/api/menus"

    // 存储数据的引用
    const menuListRef = ref<SysMenuItem[]>([] as SysMenuItem[]);

    const  queryMenus = async (params:any={})=> {
        const menuResult = await queryMenuList(params);
        if(menuResult.code == 200){
            // 给菜单引用赋值
            menuListRef.value = menuResult.data;
        } else {
            ElMessage.error("获取菜单信息失败");
        }
    }

    queryMenus();
</script>

<template>
   menu index
</template>

<style lang="scss" scoped>

</style>