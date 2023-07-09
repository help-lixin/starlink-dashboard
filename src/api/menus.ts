// @ts-nocheck  
// ts不检查该文件,否则,打包都不能通过

import request from "@/utils/request"
import {GATEWAY_BASE_URL} from "@/utils/env"

type Response<T> = {
    code:number,
    msg:string,
    data:T
}

export type SysMenuItem = {
    menuId:number,
    menuName:string,
    parentName:string,
    parentId:number,
    orderNum:number,
    path:string,
    component:string,
    query:string,
    isFrame:string,
    isCache:string,
    menuType:string,
    visible:string,
    status:string,
    perms:string,
    icon:string,
    children:Array<SysMenuItem>
}

// SysMenuItem[] : 代表数组
type SysMenuListResult = Response<SysMenuItem[]>;

type SysMenuRequest = {
    menuName:string,
    visible:string,
    status:string
}

// POST  /system-service/system/menu/list
export const queryMenuList = (params:SysMenuRequest)=>{
    return request<SysMenuListResult>({
        url : GATEWAY_BASE_URL + "/system-service/system/menu/list",
        method:'POST',
        headers: {
            "content-type" : "application/json"
        },
        data : params
    }).then((res)=>{
        return res.data;
    });
}

export type MenuRequest = {
    menuId: number,
    perms : string,
    parentId: number,
    menuName: string,
    icon: string,
    menuType: string,
    orderNum: number,
    isFrame: string,
    isCache: string,
    visible: string,
    status: string
}

export const addMenu = (menu:MenuRequest)=>{
  return request({
    url : GATEWAY_BASE_URL + "/system-service/system/menu/add",
    method:'POST',
    headers: {
        "content-type" : "application/json"
    },
    data : menu
  });
}

