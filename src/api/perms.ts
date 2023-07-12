import request from "@/utils/request";
import {GATEWAY_BASE_URL} from "@/utils/env"

type Perms = Set<string>;

let promiseGetPerms: Promise<any>;
let lockOperator = false;
// 获取当前登录人的权限列表
export const getPerms = function() {
     // 先判断刷新token这个操作是否有在执行,如果有在操作,直接返回在执行中的:promiseRefresh
     if (lockOperator) {
        return promiseGetPerms;
    }
    lockOperator = true;
    promiseGetPerms =  request<Perms>({
        url: GATEWAY_BASE_URL + "/system-service/system/menu/perms",
        method: 'GET',
        withCredentials: true
    }).then((res:any) => {
        if(res.status == 200){
            if(res.data?.code == 200) {
                return res.data?.data;
            }
        }
        return new Set<string>();
    }).finally(()=>{
        lockOperator = false;
    });

    return promiseGetPerms;
}