import request from "@/utils/request"
import {GATEWAY_BASE_URL} from "@/utils/env"


// POST  /system-service/system/menu/list
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

