// @ts-nocheck
// ts不检查该文件,否则,打包都不能通过

import request from "@/utils/request"
import { STARLINK_SERVICE } from '@/utils/env';


// 列出所有的流水线定义
export const list = (queryParams:any)=>{
    return request({
		url: STARLINK_SERVICE + '/workflow/definition/list',
		method: 'GET',
		params: queryParams
	}).then((res)=>{
        return res.data;
    })
}

// 根据流水线定义id获得流水线定义信息.
export const get = (id:any)=>{
    return request({
		url: STARLINK_SERVICE + '/workflow/definition/info/' + id,
		method: 'GET'
	}).then((res)=>{
        return res.data;
    })
}

// 部署流程
export const deploy = (data:string)=>{
    return request({
		url: STARLINK_SERVICE + '/workflow/definition/deploy',
		method: 'POST',
		headers: {
            'content-type': 'application/json'
        },
        data: data
	}).then((res)=>{
        return res.data;
    })
}

// 启动流程
export const startWorkFlowById = (data)=>{
    return request({
		url: STARLINK_SERVICE + '/workflow/instance/startById',
		method: 'POST',
		headers: {
            'content-type': 'application/json'
        },
        data: data
	}).then((res)=>{
        return res.data;
    })
}

// 修改状态
export const changeStatus = (id:any,status:any)=>{
    return request({
		url: STARLINK_SERVICE + '/workflow/definition/changeStatus/' + id + "/"+status,
		method: 'PUT'
	}).then((res)=>{
        return res.data;
    })
}