// @ts-nocheck
// ts不检查该文件,否则,打包都不能通过

import request from "@/utils/request"
import { SYSTEM_SERVICE } from '@/utils/env';

export const list = (queryParams:any)=>{
    return request({
		url: SYSTEM_SERVICE + '/system/plugin/instance/list',
		method: 'GET',
		params: queryParams
	}).then((res)=>{
        return res.data;
    })
}

// 根据环境id获得环信息
export const get = (envId:any)=>{
    return request({
		url: SYSTEM_SERVICE + '/system/plugin/instance/info/' + envId,
		method: 'GET'
	}).then((res)=>{
        return res.data;
    })
}


export const changeStatus = (envId:any,status:any)=>{
    return request({
		url: SYSTEM_SERVICE + '/system/plugin/instance/changeStatus/' + envId + "/"+status,
		method: 'PUT'
	}).then((res)=>{
        return res.data;
    })
}


// 更新环境
export function update(params:any) {
    return request({
      url: SYSTEM_SERVICE + '/system/plugin/instance/edit',
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
        url: SYSTEM_SERVICE + '/system/plugin/instance/add',
        method: 'post',
        headers: {
            'content-type': 'application/json'
        },
        data: data
    }).then(res=>{
        return res.data;
    })
}

// 检查插件编码引用
export function checkPluginCode(pluginCode:string) {
    return request({
        url: SYSTEM_SERVICE + '/system/plugin/instance/optionSelects/'+pluginCode,
        method: 'get'
    }).then(res=>{
        return res.data;
    })
}