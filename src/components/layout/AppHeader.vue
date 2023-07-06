<script setup lang="ts">
    import {isCollapse} from "./isCollapse"
    const circleUrl = "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png";
</script>   

<template>
    <el-header>
        <!-- 图标 -->
        <el-icon @click="isCollapse = !isCollapse">
            <i-ep-expand  v-show="isCollapse"/>
            <i-ep-fold  v-show="!isCollapse"/>
        </el-icon>

        <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item><a href="/">promotion management</a></el-breadcrumb-item>
            <el-breadcrumb-item>promotion list</el-breadcrumb-item>
            <el-breadcrumb-item>promotion detail</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 用户信息 -->
        <el-dropdown>
            <span class="el-dropdown-link">
                <el-avatar :size="32" :src="circleUrl" />
                <el-icon class="el-icon--right">
                    <arrow-down />
                </el-icon>
            </span>
            <template #dropdown>
                <el-dropdown-menu>
                    <el-dropdown-item>张三</el-dropdown-item>
                    <el-dropdown-item divided>退出</el-dropdown-item>
                </el-dropdown-menu>
            </template>
        </el-dropdown>
        
    </el-header>
</template>

<style lang="scss" scoped>
.el-header {
    padding-left: 20px;
    padding-right: 20px;
    display: flex;
    align-items: center;
    background-color: #dedfe0;

    .el-icon {
        margin-right: 0px;
    }

    .el-dropdown {
        margin-left: auto;
    }
}
</style>