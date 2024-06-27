import request from "@/utils/request";
import {STARLINK_SERVICE} from "@/utils/env"


// 查询任务详情
export function queryDetail(id:number) {
    return request({
      url: STARLINK_SERVICE + '/kubernetes/job/detail/'+id,
      method: 'get'
    }).then((res)=>{
        return res?.data;
    });
}

// 查询任务列表
export function pageList(query:any) {
    return request({
      url: STARLINK_SERVICE + '/kubernetes/job/list',
      method: 'get',
      params: query
    }).then((res)=>{
        return res?.data;
    });
}

// 查询命名空间列表
export function nameSpaceList(instanceCode:string) {
    return request({
      url: STARLINK_SERVICE + '/kubernetes/job/nameSpace/list/'+instanceCode,
      method: 'get'
    }).then((res)=>{
        return res?.data;
    });
}

// 新增/修改 kubernetes任务
export function addJob(data:any) {
return request({
        url: STARLINK_SERVICE + '/kubernetes/job/add',
        method: 'post',
        data: data
    }).then((res)=>{
        return res?.data;
    });
}

// 状态修改
export function changeStatus(jobId:any, status:any) {
    return request({
        url: STARLINK_SERVICE + '/kubernetes/job/changeStatus/'+status+"/"+jobId,
        method: 'put'
    }).then((res)=>{
        return res?.data;
    });
}

// 查询名称是否可用
export function nameIsExist(jobName:string,instanceCode:string) {
    return request({
      url: STARLINK_SERVICE + '/kubernetes/job/nameIsExist/' + jobName +"/" + instanceCode,
      method: 'get'
    }).then((res)=>{
        return res?.data;
    });
}

// 删除任务
export function removeJob(jobId:number) {
    return request({
      url: STARLINK_SERVICE + '/kubernetes/job/del/' + jobId ,
      method: 'delete'
    }).then((res)=>{
        return res?.data;
    });
}

// 重新运行
export function restrat(jobId:number) {
    return request({
      url: STARLINK_SERVICE + '/kubernetes/job/restart/' + jobId ,
      method: 'put'
    }).then((res)=>{
        return res?.data;
    });
}
