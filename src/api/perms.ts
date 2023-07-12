import request from "@/utils/request";
import {GATEWAY_BASE_URL} from "@/utils/env"

type Perms = Set<string>;

// 获取当前登录人的权限列表
export const getPerms = function() {
    return request<Perms>({
        url: GATEWAY_BASE_URL + "/system-service/system/menu/perms",
        method: 'GET',
        withCredentials: true
    }).then(res => {
        console.log(res.data);
        return res.data;
    });
}