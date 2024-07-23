import request from "@/utils/request";
import {STARLINK_SERVICE} from "@/utils/env"


// 查询任务详情
export function queryDetail(id:number) {
    return request({
      url: STARLINK_SERVICE + '/kubernetes/cronjob/detail/'+id,
      method: 'get'
    }).then((res)=>{
        return res?.data;
    });
}

// 查询任务列表
export function pageList(query:any) {
    return request({
      url: STARLINK_SERVICE + '/kubernetes/cronjob/list',
      method: 'get',
      params: query
    }).then((res)=>{
        return res?.data;
    });
}

// 查询命名空间列表
export function nameSpaceList(instanceCode:string) {
    return request({
      url: STARLINK_SERVICE + '/kubernetes/cronjob/nameSpace/list/'+instanceCode,
      method: 'get'
    }).then((res)=>{
        return res?.data;
    });
}

// 新增/修改 kubernetes任务
export function addCronJob(data:any) {
return request({
        url: STARLINK_SERVICE + '/kubernetes/cronjob/add',
        method: 'post',
        data: data
    }).then((res)=>{
        return res?.data;
    });
}

// 状态修改
export function changeStatus(cronjobId:any, status:any) {
    return request({
        url: STARLINK_SERVICE + '/kubernetes/cronjob/changeStatus/'+cronjobId+"/"+status,
        method: 'put'
    }).then((res)=>{
        return res?.data;
    });
}

// 查询名称是否可用
export function nameIsExist(cronjobName:string,instanceCode:string) {
    return request({
      url: STARLINK_SERVICE + '/kubernetes/cronjob/nameIsExist/' + instanceCode +"/" + cronjobName,
      method: 'get'
    }).then((res)=>{
        return res?.data;
    });
}

// 删除任务
export function removeCronJob(cronjobId:number) {
    return request({
      url: STARLINK_SERVICE + '/kubernetes/cronjob/del/' + cronjobId ,
      method: 'delete'
    }).then((res)=>{
        return res?.data;
    });
}

