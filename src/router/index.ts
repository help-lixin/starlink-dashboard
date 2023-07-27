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
    path : '/system/env/index',
    name : 'env',
    component: ()=> import("../views/system/env/index.vue"),
    meta: {
        requiresAuth: true
    },
  },
  {
    path : '/system/group/index',
    name : 'group',
    component: ()=> import("../views/system/group/index.vue"),
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
