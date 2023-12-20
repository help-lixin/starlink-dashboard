import { defineStore } from 'pinia'
import { getActionMetas } from "@/api/actions"


const localStorageActionsKey = "_action";
export const useActionMetasStore = defineStore('action', {
    state:()=>{ // state 为存储数据的仓库
        return {
            actions : new Map<String,String>()
        }
    },
    getters: { // getters为计算属性
        getActions(): Map<String,String> {
            return this.actions as Map<String,String>;
        }
    },
    actions: { // actions为提供的方法
        saveActions(actions:Map<String,String>[]){
            if(actions != undefined){
                const tempMap = new Map<string,string>()
                actions.forEach((obj:any)=>{
                    const keys = Object.keys(obj)
                    keys.forEach((key:any)=>{
                        tempMap.set(key,obj[key])
                    })
                });
                const mapString = JSON.stringify(Array.from(tempMap));
                window.localStorage.setItem(localStorageActionsKey,mapString);
                this.$state.actions = tempMap;
            }
        },
         async initActions(){
            try{
                if (this.$state.actions.size > 0 ){
                    return this.$state.actions;
                }else{
                    const localStoreString:any = window.localStorage.getItem(localStorageActionsKey);
                    if(localStoreString && this.$state.actions.size == 0){ // 双重检查
                        const actionMap = JSON.parse(localStoreString)
                        this.$state.actions = new Map<string,string>(actionMap);
                        return;
                    } else {
                        const metas = await getActionMetas();
                        if(undefined != metas && this.$state.actions.size == 0 && metas?.code == 200) { // 双重检查
                            this.saveActions(metas?.data);
                        }
                        return;
                    }
                }
            }catch(err){
                ElMessage.error("Action数据格式不对,转换成Map对象失败");
                window.localStorage.setItem(localStorageActionsKey,"");
                throw err;
            }
        },
        removeActions(){
            this.$state.actions = new Map<string,string>();
            window.localStorage.removeItem(localStorageActionsKey);
        }
    }
});
