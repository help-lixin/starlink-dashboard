// @ts-nocheck
// ts不检查该文件,否则,打包都不能通过

import request from "@/utils/request"
import {GATEWAY_BASE_URL,SYSTEM_SERVICE} from "@/utils/env"


// 拉取所有的环境下拉列表框
// export const envOptionSelect = ()=>{
//     return request({
// 		url: GATEWAY_BASE_URL + '/system-service/system/env/optionSelects',
// 		method: 'GET'
// 	}).then((res)=>{
//         return res.data;
//     })
// }

// 根据环境编码,获取所有的group下拉列表
// export const groupOptionSelect = (envCode:string)=>{
//     return request({
// 		url: GATEWAY_BASE_URL + '/system-service/system/group/optionSelects/' + envCode,
// 		method: 'GET'
// 	}).then((res)=>{
//         return res.data;
//     })
// }

// 插件下拉列表
export const pluginOptionSelect = ()=>{
    return request({
		url: SYSTEM_SERVICE + '/system/plugin/definition/optionSelects',
		method: 'GET'
	}).then((res)=>{
        return res.data;
    })
}


// 根据pluginCode,获得插件下拉列表
export const pluginInstanceOptionSelect = (pluginCode:string)=>{
    return request({
		url: SYSTEM_SERVICE + '/system/plugin/instance/optionSelects/' + pluginCode,
		method: 'GET'
	}).then((res)=>{
        return res.data;
    })
}


// 根据环境组编码,获取所有的group下拉列表
// export const instanceOptionSelect = (groupCode:string)=>{
//     return request({
// 		url: SYSTEM_SERVICE + '/system/plugin/instance/optionSelects/' + groupCode,
// 		method: 'GET'
// 	}).then((res)=>{
//         return res.data;
//     })
// }

//根据插件编码查询实例信息
export const queryInstanceInfoByPluginCode = (pluginCode:string)=>{
    return request({
      url: SYSTEM_SERVICE + '/system/plugin/instance/optionSelects/' + pluginCode,
      method: 'get',
    }).then((res)=>{
        return res?.data;
    });
  }