import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import App from './App.vue'
import router from './router'
import YtCard from '@/components/YtCard.vue'
import YtBottomOperate from '@/components/YtBottomOperate.vue'
import 'element-plus/dist/index.css'
import { usePermsStore } from './stores/perms';

import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import "virtual:svg-icons-register";
import 'element-plus/theme-chalk/src/base.scss'
import '@/styles/index.scss'
import YtTextList from '@/components/YtTextList.vue'
const app = createApp(App)
app.component('YtCard', YtCard)
app.component('YtBottomOperate', YtBottomOperate)
app.component('YtTextList', YtTextList)
app.use(ElementPlus)
// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}
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
