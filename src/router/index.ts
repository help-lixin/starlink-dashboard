import { createRouter, createWebHistory } from 'vue-router'
import AppLayoutVue from '@/components/layout/AppLayout.vue'
import IndexView from "@/views/IndexView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: AppLayoutVue,
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

export default router
