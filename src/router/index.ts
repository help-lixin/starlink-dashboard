import { createRouter, createWebHistory } from 'vue-router'
import AppLayoutVue from '@/components/layout/AppLayout.vue'
import IndexView from '@/views/IndexView.vue'
import { useTokenStore } from '@/stores/token'
import { useMenuStore } from "@/stores/menu.ts";

const publicRoutes = [
  {
    path: '',
    name: 'index',
    component: IndexView,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/views/AboutView.vue'),
    meta: {
      requiresAuth: false
    }
  },
  {
    path: '/:xxx(.*)*',
    name: '404',
    component: () => import('@/views/ErrorPage.vue'),
    meta: {
      requiresAuth: false
    }
  }
]

export const dynamicRoutes = [
  {
    path: '/system/menu/index',
    name: 'menu',
    component: () => import('../views/system/menu/index.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/system/user/index',
    name: 'user',
    // component: ()=> import("../views/system/user/indexCopy.vue"),
    component: () => import('../views/system/user/index.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/system/role/index',
    name: 'role',
    component: () => import('../views/system/role/index.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/system/plugin/definition/index',
    name: 'plugin-definition',
    component: () => import('../views/system/plugin/definition/index.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/system/plugin/instance/index',
    name: 'plugin-instance',
    component: () => import('../views/system/plugin/instance/index.vue'),
    meta: {
      requiresAuth: true
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: AppLayoutVue,
      children: publicRoutes.concat(dynamicRoutes)
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/login/LoginView.vue')
    }
  ]
})


router.beforeEach(async (to, from, next) => {
  // some对数组进行遍历
  // 目标地址是否需要进行登录判断
  if (to.matched.some(r => r.meta?.requiresAuth)) {
    const token = useTokenStore().token
    if (!token?.accessToken) { // token不存在,跳转到login
      next({ name: 'login', query: { redirect: to.fullPath } })
    } else {
    }
  }
  // 继续往下走
  next()
})


router.afterEach(to => {
  const menuStore = useMenuStore()
  // console.log(to.path, 'to to', to, JSON.parse(window.localStorage.getItem('_menus') || "[]"))
  // const menuData = menuStore.menus
  const {path} = to
  menuStore.setSelectMenuPath(path)
  // 去掉/ 然后去路由里面匹配，找到它选中的路由数据，根据索引来选中就好了
  // if (path.startsWith('/')) {
  //   path = path.substring(1)
  // }
  // const findSelectMenuId = (arr: Array<any>): number | undefined => {
  //   for(const i in arr) {
  //     if (arr[i].component === path) {
  //       return arr[i].menuId as number
  //     }
  //     if (arr[i].children?.length) {
  //       return findSelectMenuId(arr[i].children) as number
  //     }
  //   }
  //   return undefined
  // }
  // const menuId = findSelectMenuId(menuData)
  //
  // console.log(menuId, 'menuId1')
  // if (menuId) {
  //   menuStore.setSelectMenuId(menuId)
  // }
})
export default router
