import { createRouter, createWebHistory } from 'vue-router'
import AppLayoutVue from '@/components/layout/AppLayout.vue'
import IndexView from "@/views/IndexView.vue";
import { useTokenStore } from "@/stores/token";

const publicRoutes = [
  {
      path : '',
      name: 'index',
      component: IndexView,
      meta: {
          requiresAuth: false,
      }
  },
  {
      path : '/about',
      name : 'about',
      component: ()=> import("@/views/AboutView.vue"),
      meta: {
          requiresAuth: false,
      }
  },
  {
      path: '/:xxx(.*)*',
      name : '404' ,
      component: ()=> import("@/views/ErrorPage.vue"),
      meta: {
          requiresAuth: false,
      }
  }
];

export const dynamicRoutes = [
  {
      path : '/system/menu/index',
      name : 'menu',
      component: ()=> import("../views/system/menu/index.vue"),
      meta: {
          requiresAuth: true
      }
  },
  {
    path : '/system/user/index',
    name : 'user',
    component: ()=> import("../views/system/user/index.vue"),
    meta: {
        requiresAuth: true
    },
  },
  {
    path : '/system/role/index',
    name : 'role',
    component: ()=> import("../views/system/role/index.vue"),
    meta: {
        requiresAuth: true
    },
  },
  {
    path : '/system/plugin/definition/index',
    name : 'plugin-definition',
    component: ()=> import("../views/system/plugin/definition/index.vue"),
    meta: {
        requiresAuth: true
    },
  },
  {
    path : '/system/plugin/instance/index',
    name : 'plugin-instance',
    component: ()=> import("../views/system/plugin/instance/index.vue"),
    meta: {
        requiresAuth: true
    },
  },
  {
    path : '/gitlab/group/index',
    name : 'gitlab-group',
    component: ()=> import("../views/gitlab/group/index.vue"),
    meta: {
        requiresAuth: true
    },
  },
  {
    path : '/gitlab/project/index',
    name : 'gitlab-project',
    component: ()=> import("../views/gitlab/project/index.vue"),
    meta: {
        requiresAuth: true
    },
  },
  {
    path : '/gitlab/group/member/index',
    name : 'gitlab-group-member',
    component: ()=> import("../views/gitlab/group/member/index.vue"),
    meta: {
        requiresAuth: true
    },
  },
  {
    path : '/gitlab/project/member/index',
    name : 'gitlab-project-member',
    component: ()=> import("../views/gitlab/project/member/index.vue"),
    meta: {
        requiresAuth: true
    },
  },
  {
    path : '/gitlab/user/index',
    name : 'gitlab-user',
    component: ()=> import("../views/gitlab/user/index.vue"),
    meta: {
        requiresAuth: true
    },
  },
  {
    path : '/jenkins/job/index',
    name : 'jenkins-job',
    component: ()=> import("../views/jenkins/job/index.vue"),
    meta: {
        requiresAuth: true
    },
  },
  {
    path : '/jenkins/sys_config/index',
    name : 'jenkins-sysConfig',
    component: ()=> import("../views/jenkins/sys_config/index.vue"),
    meta: {
        requiresAuth: true
    },
  },
  {
    path : '/workflow/definition/index',
    name : 'workflow-definition',
    component: ()=> import("../views/workflow/definition/index.vue"),
    meta: {
        requiresAuth: true
    },
  },
  {
    path : '/workflow/definition/operate',
    name : 'workflow-definition-operate',
    component: ()=> import("../views/workflow/definition/operate.vue"),
    meta: {
        requiresAuth: false
    },
  },
  {
    path : '/nexus/respository/index',
    name : 'nexus-browes',
    component: ()=> import("../views/nexus/respository/index.vue"),
    meta: {
        requiresAuth: true
    }
  },
  {
    path : '/nexus/blobStores/index',
    name : 'nexus-blobStores-index',
    component: ()=> import("../views/nexus/blobStores/index.vue"),
    meta: {
        requiresAuth: false
    }
  },
];

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
      path : '/login',
      name : 'login',
      component: ()=> import("@/views/login/LoginView.vue")
    }
  ]
})


router.beforeEach((to,from,next)=>{
  // some对数组进行遍历
  // 目标地址是否需要进行登录判断
  if(to.matched.some(r=>r.meta?.requiresAuth)) {
    const token = useTokenStore().token;
    if(!token?.accessToken){ // token不存在,跳转到login
        next({name : "login", query: { redirect: to.fullPath }});
    }
   }
  // 继续往下走
  next();
});

export default router
