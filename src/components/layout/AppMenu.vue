<script setup lang="ts">
    import { useMenuStore } from "@/stores/menu";
    import {isCollapse} from "./isCollapse"
    import { getMenuTree, type MenuList } from "@/api/menus";
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
                console.log("将保存菜单信息到pinina中");
                console.log(menuJson)
                menuStore.saveMenus(menuJson);
            }
        });
    } else {
        console.log(menuStore.menus);
        console.log("从pinina中获取以上菜单信息,即将进行渲染");
        Object.assign(menus,menuStore.menus);
    }
    // 处理url
    const processUrl =  (component:string) => {
        if(!component.startsWith("/")){
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
            class="el-menu-vertical"
            :collapse="isCollapse" 
            >
                <a href="/" class="logo">
                    <img src="@/assets/logo.svg" alt=""/>
                    <h1>星链管理平台</h1>
                </a>
                
                <template v-for="(menu,index) in menus">
                    <el-sub-menu :index="index">
                        <template #title v-if="menu.menuType == 'M'">
                            <el-icon><i-ep-setting/></el-icon>
                            <span>{{  menu.menuName  }}</span>
                        </template>
                        
                        <template v-if="menu.children?.length > 0">
                            <template v-for="childMenu in menu.children">
                                <el-menu-item :index="processUrl(childMenu.component)" >
                                    <el-icon><i-ep-setting/></el-icon>
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
    background-color: #e9e9eb;
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
    color: black;

    img {
        width: 32px;
        height: 32px;
    }
}


/** 设置菜单样式 */
.el-menu {
    background-color: #e9e9eb;
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