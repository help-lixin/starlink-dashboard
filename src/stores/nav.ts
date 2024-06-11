import { defineStore } from 'pinia'

const navLocalStorageKey = "_nav";
export const useNavStore = defineStore('nav', () => {
    const navigationJson = ref("");
    const navArray = ref([]);

    const navigation = computed(triggerParse);

    function triggerParse(){
        try{
            const array = JSON.parse(navigationJson.value ||
                              window.localStorage.getItem(navLocalStorageKey)  ||
                              "[]");
            navArray.value = array;
        }catch(err){
            ElMessage.error("数据格式不对,转换成removeNavigation对象失败");
            window.localStorage.setItem(navLocalStorageKey,"");
            throw err;
        }
    }

    function saveNavigation(data:string, path: string){
        // 把对象转换成字符串
        navigationJson.value = data;
        window.localStorage.setItem(navLocalStorageKey,data);
        triggerParse();
    }

    function removeNavigation(){
        navigationJson.value = "";
        window.localStorage.removeItem(navLocalStorageKey);
    }

    // 向外暴露
    return { navArray , triggerParse , navigation, saveNavigation , removeNavigation}
})
