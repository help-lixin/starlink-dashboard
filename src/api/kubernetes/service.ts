import request from "@/utils/request";
import {STARLINK_SERVICE} from "@/utils/env"


// 查询任务详情
export function queryDetail(id:number) {
    return request({
      url: STARLINK_SERVICE + '/kubernetes/service/detail/'+id,
      method: 'get'
    }).then((res)=>{
        return res?.data;
    });
}

// 查询任务列表
export function pageList(query:any) {
    return request({
      url: STARLINK_SERVICE + '/kubernetes/service/list',
      method: 'get',
      params: query
    }).then((res)=>{
        return res?.data;
    });
}

// 查询命名空间列表
export function nameSpaceList(instanceCode:string) {
    return request({
      url: STARLINK_SERVICE + '/kubernetes/service/nameSpace/list/'+instanceCode,
      method: 'get'
    }).then((res)=>{
        return res?.data;
    });
}

// 新增/修改 kubernetes任务
export function addService(data:any) {
return request({
        url: STARLINK_SERVICE + '/kubernetes/service/add',
        method: 'post',
        data: data
    }).then((res)=>{
        return res?.data;
    });
}

// 状态修改
export function changeStatus(serviceId:any, status:any) {
    return request({
        url: STARLINK_SERVICE + '/kubernetes/service/changeStatus/'+status+"/"+serviceId,
        method: 'put'
    }).then((res)=>{
        return res?.data;
    });
}

// 查询名称是否可用
export function nameIsExist(serviceName:string,instanceCode:string) {
    return request({
      url: STARLINK_SERVICE + '/kubernetes/service/nameIsExist/' + instanceCode +"/" + serviceName,
      method: 'get'
    }).then((res)=>{
        return res?.data;
    });
}

// 删除任务
export function removeService(serviceId:number) {
    return request({
      url: STARLINK_SERVICE + '/kubernetes/service/del/' + serviceId ,
      method: 'delete'
    }).then((res)=>{
        return res?.data;
    });
}
