// @ts-nocheck
// ts不检查该文件,否则,打包都不能通过

import request from "@/utils/request"
import { GATEWAY_BASE_URL } from '@/utils/env';


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