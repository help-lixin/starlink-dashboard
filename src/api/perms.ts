// @ts-nocheck
// ts不检查该文件,否则,打包都不能通过

import request from "@/utils/request";
import {SYSTEM_SERVICE} from "@/utils/env"

type Perms = Set<string>;

export type RouteInfo = Array<{
  component:string,
  menuName:string,
  path:string
}>;

let promiseGetPerms: Promise<any>;
let lockGetPermsOperator = false;
// 获取当前登录人的权限列表
export const getPerms = function() {
     // 先判断刷新token这个操作是否有在执行,如果有在操作,直接返回在执行中的:promiseRefresh
     if (lockGetPermsOperator) {
        return promiseGetPerms;
    }
    lockGetPermsOperator = true;
    promiseGetPerms =  request<Perms>({
        url: SYSTEM_SERVICE + "/system/menu/perms",
        method: 'GET',
        withCredentials: true
    }).then((res:any) => {
      console.log("=====================================================================")
      console.log("获取Perms数据结果如下:")
      console.log(res.data);
      console.log("=====================================================================")
        if(res.status == 200){
            if(res.data?.code == 200) {
                return res.data?.data;
            }
        }
        return new Set<string>();
    }).finally(()=>{
      lockGetPermsOperator = false;
    });

    return promiseGetPerms;
}

// 获取路由
let promiseGetRouters: Promise<any>;
let lockRouterOperator = false;
export const getRouters = () => {
  // 先判断刷新token这个操作是否有在执行,如果有在操作,直接返回在执行中的:promiseRefresh
  if (lockRouterOperator) {
    return promiseGetRouters;
  }
  lockRouterOperator = true;
  
	promiseGetRouters =  request<RouteInfo>({
	  url: SYSTEM_SERVICE + '/getRouters',
	  method: 'get'
	}).then((res)=>{
    console.log("=====================================================================")
    console.log("获取路由数据结果如下:")
    console.log(res.data)
    console.log("=====================================================================")
    return res.data;
	}).finally(()=>{
    lockRouterOperator = false;
  });
  return promiseGetRouters;
}
