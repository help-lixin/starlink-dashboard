<script setup lang="ts">
    // @ts-nocheck
    import { useMenuStore } from "@/stores/menu";
    import {isCollapse} from "./isCollapse"
    import { getMenuTree, type MenuList } from "@/api/menus";
    import { navigation } from "@/api/constant";
    import { useNavStore } from "@/stores/nav";

    const navStore = useNavStore();
    const menuStore = useMenuStore();
    const menus = reactive<MenuList>([]);

    // 从store里取出menu列表
    if(menuStore.menus.length == 0){
        console.log("pinina中没有菜单数据,正准备通过网络请求,获得菜单数据");
        getMenuTree().then((res)=>{
            if(res.length > 0) {
                // 深拷贝
                Object.assign(menus,res);
                const menuJson = JSON.stringify(Array.from(res));
                menuStore.saveMenus(menuJson);
            }
        });
    } else {
        Object.assign(menus,menuStore.menus);
    }

    const menuSelect = (path:string)=>{
        // 通过常量:改变面包屑内容,建议保存到store里
        const navArray =  navigation.get(path);
        if(undefined != navArray){
            const navArrayJson = JSON.stringify(navArray);
            navStore.saveNavigation(navArrayJson);
        }
    }

    // 处理url
    const processUrl =  (component:string) => {
        if(!component?.startsWith("/")){
            return "/" + component;
        }
        return component;
    }
</script>

<template>
    <el-aside>
        <el-scrollbar>
            <el-menu
            router
            unique-opened
            :default-active="0+''"
            :default-openeds="['0']"
            class="el-menu-vertical"
            :collapse="isCollapse"
            @select="menuSelect"
            >
                <a href="/" class="logo">
                    <img src="@/assets/logo.svg" alt=""/>
                    <h1>星链管理平台</h1>
                </a>

                <template v-for="(menu,index) in menus" :key="index">
                    <el-sub-menu :index="index+''">
                        <template #title>
                          <el-icon v-if="menu.icon && menu.icon !== '#'">
                            <component :is="menu.icon"></component>
                          </el-icon>
                          <span>{{  menu.menuName  }}</span>
                        </template>
                        <template v-if="menu.children?.length > 0">
                            <template v-for="(childMenu,index) in menu.children" :key="index">
                                <el-menu-item :index="processUrl(childMenu.component)">
                                  <el-icon v-if="menu.icon && menu.icon !== '#'">
                                    <component :is="menu.icon"></component>
                                  </el-icon>
                                  <span>{{ childMenu.menuName }}</span>
                                </el-menu-item>
                            </template>
                        </template>
                    </el-sub-menu>
                </template>
            </el-menu>
        </el-scrollbar>
    </el-aside>
</template>

<style lang="scss" scoped>
.el-aside {
    height: 100vh;
    width: auto;
}

/** 给logo配置样式 */
.logo {
    display: flex;
    justify-content: center;
    align-items: center;
    text-decoration: none;
    height: 60px;
    color: var(--el-text-color-primary);

    img {
        width: 32px;
        height: 32px;
    }
}


/** 设置菜单样式 */
.el-menu {
    border-right: none;
    width: 200px;
    &.el-menu--collapse {
        width: 60px;
        // 折叠时,把LOGO边上的h1标签隐藏
        & h1 {
            display: none;
        }
    }
}
</style>
