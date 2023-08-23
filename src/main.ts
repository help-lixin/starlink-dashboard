import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import { usePermsStore } from './stores/perms';

import '@/styles/index.scss'

import "virtual:svg-icons-register";

const app = createApp(App)


app.use(createPinia())
app.use(router)



// 自定义指令,进行权限控制.
app.directive('hasPerms',{
    async mounted(el, binding, vnode) {
        // 引用pinina
        const permsStore =  usePermsStore();
        // 节点上配置的权限标识
        const elementPermArray:string[] = binding.value;

        let isPerms:boolean = false;
        for(const index in elementPermArray){
            isPerms = await permsStore.hasPerms(elementPermArray[index])
            if(isPerms) {
                break;
            }
        }

        if(!isPerms) { // 没有权限的情况下
            console.log("移除节点:" , elementPermArray)
            el.parentNode && el.parentNode.removeChild(el);
        }
    }
});
app.mount('#app')
