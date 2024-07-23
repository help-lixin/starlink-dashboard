import request from "@/utils/request";
import {STARLINK_SERVICE} from "@/utils/env"


// 查询任务详情
export function queryDetail(id:number) {
    return request({
      url: STARLINK_SERVICE + '/kubernetes/daemonset/detail/'+id,
      method: 'get'
    }).then((res)=>{
        return res?.data;
    });
}

// 查询任务列表
export function pageList(query:any) {
    return request({
      url: STARLINK_SERVICE + '/kubernetes/daemonset/list',
      method: 'get',
      params: query
    }).then((res)=>{
        return res?.data;
    });
}

// 查询命名空间列表
export function nameSpaceList(instanceCode:string) {
    return request({
      url: STARLINK_SERVICE + '/kubernetes/daemonset/nameSpace/list/'+instanceCode,
      method: 'get'
    }).then((res)=>{
        return res?.data;
    });
}

// 新增/修改 kubernetes任务
export function addDaemonSet(data:any) {
return request({
        url: STARLINK_SERVICE + '/kubernetes/daemonset/add',
        method: 'post',
        data: data
    }).then((res)=>{
        return res?.data;
    });
}

// 状态修改
export function changeStatus(daemonsetId:any, status:any) {
    return request({
        url: STARLINK_SERVICE + '/kubernetes/daemonset/changeStatus/'+daemonsetId+"/"+status,
        method: 'put'
    }).then((res)=>{
        return res?.data;
    });
}

// 查询名称是否可用
export function nameIsExist(daemonsetName:string,instanceCode:string) {
    return request({
      url: STARLINK_SERVICE + '/kubernetes/daemonset/nameIsExist/' + instanceCode +"/" + daemonsetName,
      method: 'get'
    }).then((res)=>{
        return res?.data;
    });
}

// 删除任务
export function removeDaemonSet(daemonsetId:number) {
    return request({
      url: STARLINK_SERVICE + '/kubernetes/daemonset/del/' + daemonsetId ,
      method: 'delete'
    }).then((res)=>{
        return res?.data;
    });
}
