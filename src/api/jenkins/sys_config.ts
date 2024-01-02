import request from "@/utils/request";
import {STARLINK_SERVICE} from "@/utils/env"


// 查询组列表
export function sysConfigList(query:any) {
    return request({
      url: STARLINK_SERVICE + '/jenkins/systemConfig/list',
      method: 'post',
      data: query
    }).then((res)=>{
        return res?.data;
    });
}


// 新增组
export function addConfig(data:any) {
return request({
        url: STARLINK_SERVICE + '/jenkins/systemConfig/add',
        method: 'post',
        data: data
    }).then((res)=>{
        return res?.data;
    });
}
  

// 根据id查询组信息
export function queryConfigInfoById(id:string) {
return request({
        url: STARLINK_SERVICE + '/jenkins/systemConfig/info/' + id,
        method: 'get'
    }).then((res)=>{
        return res?.data;
    });
}

// 组状态修改
export function changeConfigStatus(sysConfigId:any, status:any) {
    return request({
        url: STARLINK_SERVICE + '/jenkins/systemConfig/changeStatus/'+sysConfigId+"/"+status,
        method: 'put'
    }).then((res)=>{
        return res?.data;
    });
}


// 查询组下拉列表
export function sysConfigSelectOption(query:any) {
    return request({
      url: STARLINK_SERVICE + '/jenkins/systemConfig/selectOption',
      method: 'get',
      params: query
    }).then((res)=>{
        return res?.data;
    });
}

// 根据jobId查询任务详情
export function checkHome(params:any) {
    return request({
      url: STARLINK_SERVICE + '/jenkins/systemConfig/checkHome',
      method: 'get',
      params:params
    }).then((res)=>{
        return res?.data;
    });
}

// 根据jobId查询任务详情
export function checkName(params:any) {
    return request({
      url: STARLINK_SERVICE + '/jenkins/systemConfig/checkName',
      method: 'get',
      params:params
    }).then((res)=>{
        return res?.data;
    });
}

// 查询工具下拉列表
export function toolsSelectOption(pluginType:string,instanceCode:string) {
    return request({
      url: STARLINK_SERVICE + '/jenkins/systemConfig/optionSelect/'+pluginType+"/"+instanceCode,
      method: 'get'
    }).then((res)=>{
        return res?.data;
    });
}

// 查询工具下拉列表
export function jdkSelectOption(instanceCode:string) {
    return request({
      url: STARLINK_SERVICE + '/jenkins/systemConfig/optionSelect/JAVA/'+ instanceCode,
      method: 'get'
    }).then((res)=>{
        return res?.data;
    });
}
