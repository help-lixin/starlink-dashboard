import { defineStore } from 'pinia'
import { getPerms } from '@/api/perms'

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
                this.$state.perms = new Set<string>(perms);
            }
        },
        removePerms(){
            this.$state.perms = new Set<string>();
        },
        async hasPerms(perms:string) {
            if(this.$state.perms.size == 0){
                  // 加载用户对应的权限信息
                const permsSets = await getPerms();
                // 双重检查,避免后面的数据覆盖前面的数据.
                if(undefined != permsSets && this.$state.perms.size == 0) {
                    this.savePerms(permsSets);
                }
            }
            const res = this.$state.perms.has(perms)
            return res;
        }
    }
});