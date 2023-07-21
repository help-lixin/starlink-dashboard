import request from "@/utils/request";
import {GATEWAY_BASE_URL} from "@/utils/env"


// 查询用户详细
export function getRoles() {
    return request({
        url: GATEWAY_BASE_URL + '/system-service/system/role/optionselect',
        method: 'get'
    }).then((res)=>{
        return res?.data;
    });
}


