<script setup lang="ts">
import { isCollapse } from './isCollapse'
import { getProfile, logout } from '@/api/users'
import { useRouter } from 'vue-router'
import { useTokenStore } from '@/stores/token'
import { useMenuStore } from '@/stores/menu'
import { usePermsStore } from '@/stores/perms'
import { useRouteStore } from '@/stores/route'
import { useNavStore } from '@/stores/nav'
import { useActionMetasStore } from '@/stores/plugin'
import { useDark, useToggle } from '@vueuse/core'
import { Moon, Sunny } from '@element-plus/icons-vue'

const router = useRouter()
const routeStore = useRouteStore()
const menuStore = useMenuStore()
const permsStore = usePermsStore()
const navStore = useNavStore()
const actionMetasStore = useActionMetasStore()

// 手工触发一次解析
navStore.triggerParse()
const isDark = ref(useDark())
const toggleDark = useToggle(isDark)
type UserInfo = {
  userName: string,
  avatar: string
};

const userInfoRef: UserInfo = reactive({
  userName: '',
  avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
})

// 获取个人信息处理
getProfile().then((userProfile) => {
  if (userProfile.code == 200) {
    userInfoRef.userName = userProfile?.data?.userName
    if (userProfile?.data?.avatar != '') {
      userInfoRef.avatar = userProfile?.data?.avatar
    } else {
      userInfoRef.avatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
    }
  }
})

// 退出事件处理
const handlerLogout = () => {
  const tokenStore = useTokenStore()

  // 调用后端退出
  logout()

  // 清除store数据
  tokenStore.removeToken()
  menuStore.removeMenus()
  routeStore.removeRoutes()
  permsStore.removePerms()
  navStore.removeNavigation()
  actionMetasStore.removeActions()
  // 跳转到登录页面
  router.push('/login')
}
</script>

<template>
  <el-header>
    <!-- 图标 -->
    <el-icon @click="isCollapse = !isCollapse">
      <i-ep-expand v-show="isCollapse" />
      <i-ep-fold v-show="!isCollapse" />
    </el-icon>

    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item v-for="nav in navStore.navArray"> {{ nav }}</el-breadcrumb-item>
    </el-breadcrumb>
    <div class="layout-right">
      <div class="theme-model" @click="toggleDark()">
        <el-icon>
          <Moon v-if="!isDark" />
          <Sunny v-else />
        </el-icon>
      </div>
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
    </div>
  </el-header>
</template>

<style lang="scss" scoped>
.el-header {
  padding-left: 20px;
  padding-right: 20px;
  border: 1px solid var(--el-border-color-light);
  border-top: 0;
  border-right: 0;
  border-bottom: 0;
  display: flex;
  align-items: center;

  .el-icon {
    margin-right: 0;
  }

  .layout-right {
    flex: 1;
    display: flex;
    align-items: center;
    text-align: right;
    justify-content: flex-end;

    .theme-model {
      font-size: 24px;
      margin-right: 4px;
      cursor: pointer;
      color: var(--el-text-color-primary);

      &:hover {
        color: var(--el-button-hover-text-color);
      }
    }
  }
}
</style>
