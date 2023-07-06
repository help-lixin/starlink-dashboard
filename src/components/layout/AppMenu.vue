<script setup lang="ts">
    import {isCollapse} from "./isCollapse"
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
                <el-sub-menu index="1">
                    <template #title>
                        <el-icon><i-ep-setting/></el-icon>
                        <span>系统管理</span>
                    </template>
                    <el-menu-item index="/user">
                        <el-icon><i-ep-setting/></el-icon>
                        <span>用户管理</span>    
                    </el-menu-item>
                    <el-menu-item index="/role">
                        <el-icon><i-ep-setting/></el-icon>
                        <span>角色管理</span>    
                    </el-menu-item>
                    <el-menu-item index="/menu">
                        <el-icon><i-ep-setting/></el-icon>
                        <span>菜单管理</span>    
                    </el-menu-item>
                    <el-menu-item index="/plugin">
                        <el-icon><i-ep-setting/></el-icon>
                        <span>插件管理</span>    
                    </el-menu-item>
                </el-sub-menu>

                <el-sub-menu index="2">
                    <template #title>
                        <el-icon><IEpSetting/></el-icon>
                        <span>Jenkins管理</span>
                    </template>
                    <el-menu-item index="/jenkins/certificate">
                        <el-icon><i-ep-setting/></el-icon>
                        <span>Jenkins凭证管理</span>
                    </el-menu-item>
                    <el-menu-item index="/jenkins/job">
                        <el-icon><i-ep-setting/></el-icon>
                        <span>Jenkins Job管理</span>
                    </el-menu-item>
                </el-sub-menu>

                <el-menu-item index="/harbor">
                    <el-icon><i-ep-setting/></el-icon>
                    <span>Harbor管理</span>
                </el-menu-item>
                <el-menu-item index="/k8s">
                    <el-icon><i-ep-setting/></el-icon>
                    <span>Kubernetes管理</span>
                </el-menu-item>
                <el-menu-item index="/nexus">
                    <el-icon><i-ep-setting/></el-icon>
                    <span>Nexus管理</span>
                </el-menu-item>
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