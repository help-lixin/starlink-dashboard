// @ts-nocheck
// ts不检查该文件,否则,打包都不能通过

import request from "@/utils/request"
import { GATEWAY_BASE_URL } from '@/utils/env';


export const listEnv = (queryParams:any)=>{
    return request({
		url: GATEWAY_BASE_URL + '/system-service/system/env/list',
		method: 'GET',
		params: queryParams
	}).then((res)=>{
        return res.data;
    })
}

// 根据环境id获得环信息
export const getEnv = (envId:any)=>{
    return request({
		url: GATEWAY_BASE_URL + '/system-service/system/env/info/' + envId,
		method: 'GET'
	}).then((res)=>{
        return res.data;
    })
}


export const changeStatus = (envId:any,status:any)=>{
    return request({
		url: GATEWAY_BASE_URL + '/system-service/system/env/changeStatus/' + envId + "/"+status,
		method: 'PUT'
	}).then((res)=>{
        return res.data;
    })
}


// 更新环境
export function updateEnv(params:any) {
    return request({
      url: GATEWAY_BASE_URL + '/system-service/system/env/edit',
      method: 'put',
	  headers: {
		'content-type': 'application/json'
	  },
      data: params
    }).then((res)=>{
        return res.data;
    });
}

// 新增环境
export function addEnv(data:any) {
    return request({
        url: GATEWAY_BASE_URL + '/system-service/system/env/add',
        method: 'post',
        headers: {
            'content-type': 'application/json'
        },
        data: data
    }).then(res=>{
        return res.data;
    })
}
  

// 用户状态修改
export function changeUserStatus(envId:any, status:any) {
    const data = {
        id:envId,
        status
    }
    return request({
        url: GATEWAY_BASE_URL + '/system-service/system/env/changeStatus',
        method: 'put',
        data: data
    }).then((res)=>{
        return res?.data;
    });
}

