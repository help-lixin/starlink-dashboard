<script setup lang="ts">
// @ts-nocheck
import { useMenuStore } from '@/stores/menu'
import { isCollapse } from './isCollapse'
import { getMenuTree, type MenuList } from '@/api/menus'
import { navigation } from '@/api/constant'
import { useNavStore } from '@/stores/nav'

const navStore = useNavStore()
const menuStore = useMenuStore()
const menus = reactive<MenuList>([])

// 从store里取出menu列表
if (menuStore.menus.length == 0) {
  console.log('pinina中没有菜单数据,正准备通过网络请求,获得菜单数据')
  getMenuTree().then((res) => {
    console.log(res, 'menuRes')
    if (res.length > 0) {
      // 深拷贝
      Object.assign(menus, res)
      const menuJson = JSON.stringify(Array.from(res))
      menuStore.saveMenus(menuJson)
    }
  })
} else {
  Object.assign(menus, menuStore.menus)
}

const menuSelect = (path: string) => {
  // 通过常量:改变面包屑内容,建议保存到store里
  const navArray = navigation.get(path)
  if (undefined != navArray) {
    // 把当前路径添加到最后一级
    const navArrayJson = JSON.stringify(navArray.map((row, index) => {return {name: row, path: index === navArray.length - 1 ? path: undefined}}))
    navStore.saveNavigation(navArrayJson)
  }
}
const menuSelectPath = computed(() => {
  return menuStore.menuSelectPath
})
// 处理url
const processUrl = (component: string) => {
  if (!component?.startsWith('/')) {
    return '/' + component
  }
  return component
}
</script>

<template>
  <el-aside>
    <el-scrollbar>
      <el-menu
        router
        unique-opened
        :default-active="menuSelectPath"
        :default-openeds="['0']"
        class="el-menu-vertical"
        :collapse="isCollapse"
        @select="menuSelect"
      >
        <el-sub-menu v-for="(menu,index) in menus" :index="index+''" :key="menu.menuId + ''">
          <template #title>
            <el-icon v-if="menu.icon && menu.icon !== '#'">
              <component :is="menu.icon"></component>
            </el-icon>
            <span>{{ menu.menuName }}</span>
          </template>
          <template v-if="menu.children?.length > 0">
            <el-menu-item v-for="(childMenu) in menu.children" :key="childMenu.menuId + ''" :index="processUrl(childMenu.component)">
              <span>{{ childMenu.menuName }}</span>
            </el-menu-item>
          </template>
        </el-sub-menu>
      </el-menu>
    </el-scrollbar>
  </el-aside>
</template>

<style lang="scss" scoped>
.el-aside {
  height: calc(100vh - var(--el-header-height));
  width: auto;
  background-color: var(--menu-bg-color);
}

/** 设置菜单样式 */
.el-menu {
  border-right: none;
  //box-shadow: 10px 0 15px -5px rgba(0, 0, 0, 0.6);
  width: var(--menu-width);

  &.el-menu--collapse {
    width: 60px;
    // 折叠时,把LOGO边上的h1标签隐藏
    & h1 {
      display: none;
    }
  }
}
</style>
