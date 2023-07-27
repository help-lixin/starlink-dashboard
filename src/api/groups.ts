// @ts-nocheck
// ts不检查该文件,否则,打包都不能通过

import request from "@/utils/request"
import { GATEWAY_BASE_URL } from '@/utils/env';

export const list = (queryParams:any)=>{
    return request({
		url: GATEWAY_BASE_URL + '/system-service/system/group/list',
		method: 'GET',
		params: queryParams
	}).then((res)=>{
        return res.data;
    })
}

// 根据环境id获得环信息
export const get = (envId:any)=>{
    return request({
		url: GATEWAY_BASE_URL + '/system-service/system/group/info/' + envId,
		method: 'GET'
	}).then((res)=>{
        return res.data;
    })
}


export const changeStatus = (envId:any,status:any)=>{
    return request({
		url: GATEWAY_BASE_URL + '/system-service/system/group/changeStatus/' + envId + "/"+status,
		method: 'PUT'
	}).then((res)=>{
        return res.data;
    })
}


// 更新环境
export function update(params:any) {
    return request({
      url: GATEWAY_BASE_URL + '/system-service/system/group/edit',
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
export function add(data:any) {
    return request({
        url: GATEWAY_BASE_URL + '/system-service/system/group/add',
        method: 'post',
        headers: {
            'content-type': 'application/json'
        },
        data: data
    }).then(res=>{
        return res.data;
    })
}