// @ts-nocheck
// ts不检查该文件,否则,打包都不能通过
import { defineStore } from 'pinia'

const localStorageRouteKey = "_routes";
export const useRouteStore = defineStore('route', () => {
    const routeJson = ref("");
    const routes = computed(() => {
        try{
            return new Set<string>(JSON.parse(routeJson.value || window.localStorage.getItem(localStorageRouteKey)  || "[]"));
        }catch(err){
            ElMessage.error("数据格式不对,转换成Route对象失败");
            window.localStorage.setItem(localStorageRouteKey,"");
            throw err;
        }
    });

    function saveRoutes(data:string){
        // 把对象转换成字符串
        routeJson.value = data;
        window.localStorage.setItem(localStorageRouteKey,data);
    }

    function removeRoutes(){
        routeJson.value = "";
        window.localStorage.removeItem(localStorageRouteKey);
    }

    return {
        routes,
        saveRoutes,
        removeRoutes
    };
});