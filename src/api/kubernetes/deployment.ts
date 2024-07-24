import request from "@/utils/request";
import {STARLINK_SERVICE} from "@/utils/env"


// 查询deployment详情
export function queryDetail(id:number) {
    return request({
      url: STARLINK_SERVICE + '/kubernetes/deployment/detail/'+id,
      method: 'get'
    }).then((res)=>{
        return res?.data;
    });
}

// 查询deployment列表
export function pageList(query:any) {
    return request({
      url: STARLINK_SERVICE + '/kubernetes/deployment/list',
      method: 'get',
      params: query
    }).then((res)=>{
        return res?.data;
    });
}

// 查询命名空间列表
export function nameSpaceList(instanceCode:string) {
    return request({
      url: STARLINK_SERVICE + '/kubernetes/deployment/nameSpace/list/'+instanceCode,
      method: 'get'
    }).then((res)=>{
        return res?.data;
    });
}


// 新增/修改 deployment
export function addDeployment(data:any) {
return request({
        url: STARLINK_SERVICE + '/kubernetes/deployment/add',
        method: 'post',
        data: data
    }).then((res)=>{
        return res?.data;
    });
}

// deployment状态修改
export function changeStatus(deploymentId:any, status:any) {
    return request({
        url: STARLINK_SERVICE + '/kubernetes/deployment/changeStatus/'+deploymentId+"/"+status,
        method: 'put'
    }).then((res)=>{
        return res?.data;
    });
}


// 查询deployment名称是否可用
export function nameIsExist(instanceCode:string,deploymentName:string) {
    return request({
      url: STARLINK_SERVICE + '/kubernetes/deployment/deploymentNameIsExist/' + instanceCode +"/" + deploymentName,
      method: 'get'
    }).then((res)=>{
        return res?.data;
    });
}

// 删除deployment
export function removeDeployment(deploymentId:number) {
    return request({
      url: STARLINK_SERVICE + '/kubernetes/deployment/del/' + deploymentId,
      method: 'delete'
    }).then((res)=>{
        return res?.data;
    });
}

// 查询pod容器组列表信息
export function podGroup(data:any) {
    return request({
      url: STARLINK_SERVICE + '/kubernetes/deployment/podGroup',
      method: 'get',
      params: data
    }).then((res)=>{
        return res?.data;
    });
}

// 查询pod容器日志信息
export function podLog(data:any) {
    return request({
      url: STARLINK_SERVICE + '/kubernetes/pod/log',
      method: 'get',
      params: data
    }).then((res)=>{
        return res?.data;
    });
}

// 更新副本数量
export function updateReplicas(data:any) {
    return request({
      url: STARLINK_SERVICE + '/kubernetes/deployment/updateReplicas',
      method: 'put',
      params: data
    }).then((res)=>{
        return res?.data;
    });
}

