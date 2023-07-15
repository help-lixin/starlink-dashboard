<script setup lang="ts">
    import {isCollapse} from "./isCollapse"
    import { getProfile,logout } from "@/api/users";
    import { useRouter } from "vue-router";
    import { useTokenStore } from "@/stores/token";
    import { useMenuStore } from "@/stores/menu";
    import { usePermsStore } from "@/stores/perms";
    import { useRouteStore } from "@/stores/route";
    import { useNavStore } from "@/stores/nav";

    
    const router = useRouter();
    const routeStore = useRouteStore();
    const menuStore = useMenuStore();
    const permsStore = usePermsStore();
    const navStore = useNavStore();

    // 手工触发一次解析
    navStore.triggerParse();

    type UserInfo = {
      userName:string,
      avatar:string
    };

    const userInfoRef:UserInfo = reactive({
        userName: "",
        avatar: "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"
    });

    // 获取个人信息处理
    getProfile().then((userProfile)=>{
        if(userProfile.code == 200) {
            userInfoRef.userName = userProfile?.data?.userName;
            if(userProfile?.data?.avatar != ""){
                userInfoRef.avatar = userProfile?.data?.avatar;
            }else{
                userInfoRef.avatar = "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png";
            }
        }
    });

    // 退出事件处理
    const handlerLogout = ()=>{
        const tokenStore  = useTokenStore();

        // 调用后端退出
        logout();

        // 清除store数据
        tokenStore.removeToken();
        menuStore.removeMenus();
        routeStore.removeRoutes();
        permsStore.removePerms();
        navStore.removeNavigation();
        // 跳转到登录页面
        router.push("/login");
    }
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
            <el-breadcrumb-item v-for="nav in navStore.navArray"> {{  nav  }} </el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 用户信息 -->
        <el-dropdown>
            <span class="el-dropdown-link">
                <el-avatar :size="32" :src="userInfoRef.avatar" />
                <el-icon class="el-icon--right">
                    <!-- <arrow-down /> -->
                </el-icon>
            </span>
            <template #dropdown>
                <el-dropdown-menu>
                    <el-dropdown-item>{{ userInfoRef.userName }}</el-dropdown-item>
                    <el-dropdown-item divided @click="handlerLogout">退出</el-dropdown-item>
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
</style>@/api/users
