// @ts-nocheck
// ts不检查该文件,否则,打包都不能通过

import request from "@/utils/request"
import { GATEWAY_BASE_URL } from '@/utils/env';


// 列出所有的流水线
export const list = (queryParams:any)=>{
    return request({
		url: GATEWAY_BASE_URL + '/starlink-service/workflow/definition/list',
		method: 'GET',
		params: queryParams
	}).then((res)=>{
        return res.data;
    })
}


// 部署流程
export const deploy = (data:string)=>{
    return request({
		url: GATEWAY_BASE_URL + '/starlink-service/workflow/definition/deploy',
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
		url: GATEWAY_BASE_URL + '/starlink-service/workflow/instance/startById',
		method: 'POST',
		headers: {
            'content-type': 'application/json'
        },
        data: data
	}).then((res)=>{
        return res.data;
    })
}