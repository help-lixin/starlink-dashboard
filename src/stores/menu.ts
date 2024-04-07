// @ts-nocheck
// ts不检查该文件,否则,打包都不能通过
import { defineStore } from 'pinia'
import { type MenuList} from "@/api/menus";

const localStorageMenuKey = "_menus";
export const useMenuStore = defineStore('menu', () => {
    const menuJson = ref("");
    const menuSelectPath = ref('');
    const menus = computed<MenuList>(() => {
        try{
            return JSON.parse(menuJson.value || window.localStorage.getItem(localStorageMenuKey)  || "[]");
        }catch(err){
            ElMessage.error("数据格式不对,转换成Menu对象失败");
            window.localStorage.setItem(localStorageMenuKey,"");
            throw err;
        }
    });

    function saveMenus(data:string){
        if(undefined != data && data.length > 0) {
            // 把对象转换成字符串
            menuJson.value = data;
            window.localStorage.setItem(localStorageMenuKey,data);
        }
    }

    function removeMenus(){
        menuJson.value = "";
        window.localStorage.removeItem(localStorageMenuKey);
    }

    function setSelectMenuPath(path: string) {
        menuSelectPath.value = path
    }
    return {
        setSelectMenuPath,
        menuSelectPath,
        menus,
        saveMenus,
        removeMenus
    };
});
