import request from "@/utils/request";
import {STARLINK_SERVICE} from "@/utils/env"


export const tools = [
    {
        value: 'MAVEN',
        label: 'maven',
    },
    {
        value: 'GRADLE',
        label: 'gradle',
    },
    {
        value: 'PYTHON',
        label: 'python',
    },
    {
        value: 'GO',
        label: 'go',
    },
    {
        value: 'NODE_JS',
        label: 'nodeJs',
    },
    {
        value: 'ANT',
        label: 'ant',
    },
    {
        value: 'GIT',
        label: 'git',
    },
    {
        value: 'JDK',
        label: 'jdk',
    }
];

// 查询系统配置列表
export function sysConfigList(query:any) {
    return request({
      url: STARLINK_SERVICE + '/jenkins/systemConfig/list',
      method: 'get',
      params: query
    }).then((res)=>{
        return res?.data;
    });
}


// 新增系统配置
export function addConfig(data:any) {
return request({
        url: STARLINK_SERVICE + '/jenkins/systemConfig/add',
        method: 'post',
        data: data
    }).then((res)=>{
        return res?.data;
    });
}
  

// 根据id查询系统配置信息
export function queryConfigInfoById(id:string) {
return request({
        url: STARLINK_SERVICE + '/jenkins/systemConfig/info/' + id,
        method: 'get'
    }).then((res)=>{
        return res?.data;
    });
}

// 系统配置状态修改
export function changeConfigStatus(sysConfigId:any, status:any) {
    return request({
        url: STARLINK_SERVICE + '/jenkins/systemConfig/changeStatus/'+sysConfigId+"/"+status,
        method: 'post'
    }).then((res)=>{
        return res?.data;
    });
}


// 查询系统配置下拉列表
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
export function pluginTypeSelectOption(instanceCode:string) {
    return request({
      url: STARLINK_SERVICE + '/jenkins/systemConfig/pluginType/optionSelect/' + instanceCode,
      method: 'get'
    }).then((res)=>{
        return res?.data;
    });
}

// 查询工具下拉列表
export function jdkSelectOption(instanceCode:string) {
    return request({
      url: STARLINK_SERVICE + '/jenkins/systemConfig/optionSelect/JDK/'+ instanceCode,
      method: 'get'
    }).then((res)=>{
        return res?.data;
    });
}
