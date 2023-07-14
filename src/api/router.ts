// @ts-nocheck
// ts不检查该文件,否则,打包都不能通过

import router, { dynamicRoutes } from "@/router";
import { useTokenStore } from "@/stores/token";
import { useRouteStore } from '@/stores/route';
import { getRouters, type RouteInfo } from '@/api/perms';

// 记录是否处理过路由
const isProcessRoutes:boolean = false;
export const processRoutes =  async ()=> {
    const token = useTokenStore().token;
    if(token?.accessToken){ // token不存在,跳转到login
        let routesData:RouteInfo[] = [];
        if(!isProcessRoutes){
            console.log("开始从pinina里获取路由数据.");
            // 1. 先从pinina里获得路由表信息
            const routeStore =  useRouteStore();
            routesData = routeStore.routes;
            // 2. pinina路由表里没有数据,才会发起http请求
            if(routesData.length == 0){
                console.log("pinina里没有路由数据,准备发起http请求获得路由数据.");
                // 3. http请求获得路由信息
                const routersResult = await getRouters();
                if(routersResult?.code == 200){
                    routesData = routersResult?.data;
                    // 4. 双重检查,避免并发存储路由信息
                    if(!isProcessRoutes) {
                        const routesStr = JSON.stringify(routesData);
                        // 保存到store和local中
                        console.log("准备保存路由数据到pinina和local." , routesStr);
                        routeStore.saveRoutes(routesStr);
                    }
                } 
            }
        } 
        
        if(routesData.length > 0 && !isProcessRoutes) {
            console.log("用户所有路由数据:" , routesData);
            const rewriteRoutes = filter(routesData);
            console.log("需剔除的路由数据:" , rewriteRoutes);
            // 过滤route
            rewriteRoutes.forEach((routeName)=>{
                console.log("start remove route name:", routeName);
                router.removeRoute(routeName);
            });
        }
    } // end if
  }

function filter(userRoutes:RouteInfo[]):Set<string>{
    const res:Set<string> = new Set<string>();
    // 取出userRoutes里所有的component
    const components = new Set<string>(userRoutes.map((routeInfo:RouteInfo)=>{
        let component:string = routeInfo.component as string;
        if(!component.startsWith("/")){
            return component = "/"+component;
        }
        return component;
    }));

    for(const sysRoute of dynamicRoutes){ // 遍历系统的路由表
        if(sysRoute.meta?.requiresAuth){
            if(!sysRoute.meta?.requiresAuth){ // 跳过不需要进行授权的页面
                continue;
            }
            
            // 用户路由表里不存在该标识的时候,代表是要剔除的路由
            if(!components.has(sysRoute.path)){
                res.add(sysRoute.name);
            }
        }
    }
    return res;
}