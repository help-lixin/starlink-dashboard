// @ts-nocheck
// ts不检查该文件,否则,打包都不能通过

import request from "@/utils/request"
import { STARLINK_SERVICE } from '@/utils/env';

// 根据流水线实例,id获得流水线定义信息.
export const getProcessInstance = (id:any)=>{
    return request({
		url: STARLINK_SERVICE + '/workflow/instance/getProcessInstance/' + id,
		method: 'GET'
	}).then((res)=>{
        return res.data;
    })
}

// 获取流程实例日志
export const getProcessInstanceLogs = (instanceId:string)=>{
    const data = { "instanceId" : instanceId }
    return request({
		url: STARLINK_SERVICE + '/workflow/instance/logs',
		method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        data: data
	}).then((res)=>{
        return res.data;
    })
}
