import router, { dynamicRoutes } from "@/router";

import { useTokenStore } from "@/stores/token";
import { useRouteStore } from '@/stores/route';
import { getRouters } from '@/api/perms';

// 记录是否处理过路由
const isProcessRoutes:boolean = false;
export const processRoutes =  async ()=> {
    const token = useTokenStore().token;
    if(token?.accessToken){ // token不存在,跳转到login
        let routesData:Set<string> = new Set<string>();
        if(!isProcessRoutes){
            console.log("开始从,pinina里获取路由数据.");
            // 1. 先从pinina里获得路由表信息
            const routeStore =  useRouteStore();
            routesData = new Set<string>(routeStore.routes);
            // 2. pinina路由表里没有数据,才会发起http请求
            if(routesData.size == 0){
                console.log("pinina里没有路由数据,准备发起http请求获得路由数据.");
                // 3. http请求获得路由信息
                const routersResult = await getRouters();
                if(routersResult?.code == 200){
                    routesData = new Set<string>(routersResult?.data);
                    // 4. 双重检查,避免并发存储路由信息
                    if(!isProcessRoutes) {
                        // 保存到store和local中
                        console.log("保存路由数据到pinina和local.");
                        routeStore.saveRoutes(JSON.stringify(routesData));
                    }
                } 
            }
        } 
        
        if(routesData.size > 0 && !isProcessRoutes) {
            console.log("user route:" , routesData);
            const rewriteRoutes = filter(routesData);
            console.log("filter result route:" , rewriteRoutes);
            // 过滤route
            rewriteRoutes.forEach((routeName)=>{
                console.log("start remove route name:", routeName);
                router.removeRoute(routeName);
            });
        }
    } // end if
  }

function filter(userRoutes:Set<string>):Set<string>{
    const res:Set<string> = new Set<string>();

    for(const sysRoute of dynamicRoutes){ // 遍历系统的路由表
        if(sysRoute.meta?.requiresAuth && sysRoute.meta?.perms ){
            if(!sysRoute.meta?.requiresAuth){ // 跳过不需要进行授权的页面
                continue;
            }
            
            // 用户路由表里不存在该标识的时候,代表是要剔除的路由
            if(!userRoutes.has(sysRoute.meta?.perms)){
                res.add(sysRoute.name);
            }
        }
    }
    return res;
}