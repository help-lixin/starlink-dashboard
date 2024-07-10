import request from "@/utils/request";
import {STARLINK_SERVICE} from "@/utils/env"


// 查询任务详情
export function queryDetail(id:number) {
    return request({
      url: STARLINK_SERVICE + '/kubernetes/nameSpace/detail/'+id,
      method: 'get'
    }).then((res)=>{
        return res?.data;
    });
}

// 查询任务列表
export function pageList(query:any) {
    return request({
      url: STARLINK_SERVICE + '/kubernetes/nameSpace/list',
      method: 'get',
      params: query
    }).then((res)=>{
        return res?.data;
    });
}

// 查询命名空间列表
export function nameSpaceList(instanceCode:string) {
    return request({
      url: STARLINK_SERVICE + '/kubernetes/nameSpace/list/'+instanceCode,
      method: 'get'
    }).then((res)=>{
        return res?.data;
    });
}

// 新增/修改 kubernetes命名空间
export function addNameSpace(data:any) {
return request({
        url: STARLINK_SERVICE + '/kubernetes/nameSpace/add',
        method: 'post',
        data: data
    }).then((res)=>{
        return res?.data;
    });
}

// 状态修改
export function changeStatus(nameSpaceId:any, status:any) {
    return request({
        url: STARLINK_SERVICE + '/kubernetes/nameSpace/changeStatus/'+status+"/"+nameSpaceId,
        method: 'put'
    }).then((res)=>{
        return res?.data;
    });
}

// 查询名称是否可用
export function nameIsExist(nameSpaceName:string,instanceCode:string) {
    return request({
      url: STARLINK_SERVICE + '/kubernetes/nameSpace/nameIsExist/' + instanceCode +"/" + nameSpaceName,
      method: 'get'
    }).then((res)=>{
        return res?.data;
    });
}

// 删除任务
export function removeNameSpace(nameSpaceId:number) {
    return request({
      url: STARLINK_SERVICE + '/kubernetes/nameSpace/del/' + nameSpaceId ,
      method: 'delete'
    }).then((res)=>{
        return res?.data;
    });
}
