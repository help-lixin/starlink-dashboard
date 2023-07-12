import { defineStore } from 'pinia'

/**
 * 1. 方式修改store数据<br/>
 * import { storeToRefs } from 'pinia'
 *   import { usePermsStore } from '@/stores/perms'
 *   const permsStore = usePermsStore()
 *   const  {perms}  = storeToRefs(permsStore)
 *
 *   // 实际就是用proxy进行了代理.
 *   // perms.value.add("test");
 *   // perms.value.add("hello");
 *   // perms.value.add("world");
 *
 *   // console.log( perms.value );
 *   console.log( perms.value );
 *   console.log( permsStore.perms ); 
 * 
 *  <br/>
 * 
 *  //  第二种方式,通过$path改变数据
 *  import { usePermsStore } from '@/stores/perms'
 *   const permsStore = usePermsStore()
 *   
 *   const perms = new Set<string>();
 *   perms.add("hello");
 *   perms.add("world");
 *
 *   permsStore.$patch({
 *      perms:perms
 *   });
 *   console.log(permsStore.perms);
 * 
 *   <br/>
 * 
 * // 第三种方式,通过$path function改变数据
 * import { usePermsStore } from '@/stores/perms'
 *   const permsStore = usePermsStore()
 *   
 *   const perms = new Set<string>();
 *   perms.add("hello");
 *   perms.add("world");
 *
 *   permsStore.$patch((state)=>{
 *     return state.perms = perms;
 *   });
 *   console.log(permsStore.perms);
 * 
 * // 第四种方式,通过actions创建方法
 *   actions:{
 *        savePerms(perms:Set<string>){
 *           this.$state.perms = perms;
 *       }
 *   }// end actions
 * 
 *   import { usePermsStore } from '@/stores/perms'
 *   const permsStore = usePermsStore()
 *   const perms = new Set<string>();
 *   perms.add("hello");
 *   perms.add("world");
 *   permsStore.savePerms(perms);
 *   console.log(permsStore.perms);
 */

const localStoragePermsKey:string = "_perms";

export const usePermsStore = defineStore('perms', {
    state:()=>{ // state 为存储数据的仓库
        return {
            perms : new Set<String>()
        }
    },
    getters: { // getters为计算属性
        getPerms():Set<string> {
            return this.perms as Set<string>;
        }
    },
    actions: { // actions为提供的方法
        savePerms(perms:Set<string>){
            if(perms != undefined){
                window.localStorage.setItem(localStoragePermsKey , JSON.stringify(perms));
                this.$state.perms = perms;
            }
        },
        hasPerms(perms:string) {
            if(this.$state.perms.size == 0) {
                try{
                    const _perms:string = window.localStorage.getItem(localStoragePermsKey) as string;
                    if(_perms != undefined){
                        const _permsArray:string[] = JSON.parse(_perms || "[]") as string[];
                        if(_permsArray.length > 0){
                            const _perms = new Set<string>(_permsArray);
                            this.$state.perms = _perms;
                        }
                    }
                }catch(err){  console.log("parse localStorage _perms error " , err) };
            }
            return this.$state.perms.has(perms);
        },
        clean() {
            this.$state.perms = new Set<string>();
            window.localStorage.removeItem(localStoragePermsKey);
        }
    }
});