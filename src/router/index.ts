import { createRouter, createWebHistory } from 'vue-router'
import AppLayoutVue from '@/components/layout/AppLayout.vue'
import IndexView from '@/views/IndexView.vue'
import { useTokenStore } from '@/stores/token'
import { useMenuStore } from "@/stores/menu.ts";
import StompClient from "@/utils/StompClient.ts";

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
  },
  {
    path: '/gitlab/group/index',
    name: 'gitlab-group',
    component: () => import('../views/gitlab/group/index.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/gitlab/project/index',
    name: 'gitlab-project',
    component: () => import('../views/gitlab/project/index.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/gitlab/group/member/index',
    name: 'gitlab-group-member',
    component: () => import('../views/gitlab/group/member/index.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/gitlab/project/member/index',
    name: 'gitlab-project-member',
    component: () => import('../views/gitlab/project/member/index.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/gitlab/user/index',
    name: 'gitlab-user',
    component: () => import('../views/gitlab/user/index.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/jenkins/job/index',
    name: 'jenkins-job',
    component: () => import('../views/jenkins/job/index.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/jenkins/build/index',
    name: 'jenkins-build',
    component: () => import('../views/jenkins/build/index.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/jenkins/sys_config/index',
    name: 'jenkins-sysConfig',
    component: () => import('../views/jenkins/sys_config/index.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/harbor/project/index',
    name: 'harbor-project',
    component: () => import('../views/harbor/project/index.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/harbor/log_info/index',
    name: 'harbor-logInfo',
    component: () => import('../views/harbor/log_info/index.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/ansible/label/index',
    name: 'label-manage',
    component: () => import('../views/ansible/label/index.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/ansible/host/index',
    name: 'host-manage',
    component: () => import('../views/ansible/host/index.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/ssh/label/index',
    name: 'ssh-label-manage',
    component: () => import('../views/ssh/label/index.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/kubernetes/deployment/list/index',
    name: 'kubernetes-deploy-list',
    component: () => import('../views/kubernetes/deployment/list/index.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/kubernetes/deployment/operate',
    name: 'kubernetes-deploy',
    component: () => import('../views/kubernetes/deployment/operate.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/kubernetes/cronjob/list/index',
    name: 'kubernetes-cron-job-list',
    component: () => import('../views/kubernetes/cronjob/list/index.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/kubernetes/cronjob/operate',
    name: 'kubernetes-cron-job',
    component: () => import('../views/kubernetes/cronjob/operate.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/kubernetes/job/list/index',
    name: 'kubernetes-job-list',
    component: () => import('../views/kubernetes/job/list/index.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/kubernetes/job/operate',
    name: 'kubernetes-job',
    component: () => import('../views/kubernetes/job/operate.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/kubernetes/pod/list/index',
    name: 'kubernetes-pod-list',
    component: () => import('../views/kubernetes/pod/list/index.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/kubernetes/pod/operate',
    name: 'kubernetes-pod',
    component: () => import('../views/kubernetes/pod/operate.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/kubernetes/daemonset/list/index',
    name: 'kubernetes-daemon-set-list',
    component: () => import('../views/kubernetes/daemonset/list/index.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/kubernetes/daemonset/operate',
    name: 'kubernetes-daemon-set',
    component: () => import('../views/kubernetes/daemonset/operate.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/kubernetes/service/list/index',
    name: 'kubernetes-service-list',
    component: () => import('../views/kubernetes/service/list/index.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/kubernetes/service/operate',
    name: 'kubernetes-service',
    component: () => import('../views/kubernetes/service/operate.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/kubernetes/node/list/index',
    name: 'kubernetes-node',
    component: () => import('../views/kubernetes/node/list/index.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/kubernetes/namespace/list/index',
    name: 'kubernetes-namespace',
    component: () => import('../views/kubernetes/namespace/list/index.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/system/credential/index',
    name: 'sys-credential',
    component: () => import('../views/system/credential/index.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/workflow/definition/index',
    name: 'workflow-definition',
    component: () => import('../views/workflow/definition/index.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/workflow/definition/operate',
    name: 'workflow-definition-operate',
    component: () => import('../views/workflow/definition/operate.vue'),
    meta: {
      requiresAuth: false
    }
  },
  {
    path: '/workflow/definition/view/:processInstnaceId',
    name: 'workflow-definition-view',
    component: () => import('../views/workflow/view/view.vue'),
    meta: {
      requiresAuth: false
    }
  },
  {
    path: '/workflow/instance/index', // 流程实例
    name: 'workflow-instance-index',
    component: () => import('../views/workflow/instance/index.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/nexus/respository/index',
    name: 'nexus-browes',
    component: () => import('../views/nexus/respository/index.vue'),
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/nexus/blobStores/index',
    name: 'nexus-blobStores-index',
    component: () => import('../views/nexus/blobStores/index.vue'),
    meta: {
      requiresAuth: false
    }
  },
  {
    path: '/yaml-demo',
    name: 'yaml-demo',
    component: () => import('../views/demo/yamlDemo.vue'),
    meta: {
      requiresAuth: false
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
      try {
        // 建立连接
        const stompClient = StompClient.getInstance()
        // 链接并订阅
        await stompClient.connect()
      } catch (e) {
        console.log(e, 'err')
      }

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
