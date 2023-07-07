import { createRouter, createWebHistory } from 'vue-router'
import AppLayoutVue from '@/components/layout/AppLayout.vue'
import IndexView from "@/views/IndexView.vue";
import { useTokenStore } from "@/stores/token";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: AppLayoutVue,
      meta: {
        requiresAuth: true // auth管理
      },
      children: [
        {
          path : '',
          name: 'index',
          component: IndexView
        },
        {
          path : '/about',
          name : 'about',
          component: ()=> import("../views/AboutView.vue")
        },
        {
          path : '/:xxx(.*)*',
          name : "404",
          component: ()=> import("../views/ErrorPage.vue")
        }
      ]
    },
    {
      path : '/login',
      name : 'login',
      component: ()=> import("../views/login/LoginView.vue")
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
