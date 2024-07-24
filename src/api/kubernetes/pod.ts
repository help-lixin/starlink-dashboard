import request from "@/utils/request";
import {STARLINK_SERVICE} from "@/utils/env"


// 查询任务详情
export function queryDetail(id:number) {
    return request({
      url: STARLINK_SERVICE + '/kubernetes/pod/detail/'+id,
      method: 'get'
    }).then((res)=>{
        return res?.data;
    });
}

// 查询任务列表
export function pageList(query:any) {
    return request({
      url: STARLINK_SERVICE + '/kubernetes/pod/list',
      method: 'get',
      params: query
    }).then((res)=>{
        return res?.data;
    });
}

// 查询命名空间列表
export function nameSpaceList(instanceCode:string) {
    return request({
      url: STARLINK_SERVICE + '/kubernetes/pod/nameSpace/list/'+instanceCode,
      method: 'get'
    }).then((res)=>{
        return res?.data;
    });
}

// 新增/修改 kubernetes任务
export function addPod(data:any) {
return request({
        url: STARLINK_SERVICE + '/kubernetes/pod/add',
        method: 'post',
        data: data
    }).then((res)=>{
        return res?.data;
    });
}

// 状态修改
export function changeStatus(podId:any, status:any) {
    return request({
        url: STARLINK_SERVICE + '/kubernetes/pod/changeStatus/'+podId+"/"+status,
        method: 'put'
    }).then((res)=>{
        return res?.data;
    });
}

// 查询名称是否可用
export function nameIsExist(podName:string,instanceCode:string) {
    return request({
      url: STARLINK_SERVICE + '/kubernetes/pod/nameIsExist/' + instanceCode +"/" + podName,
      method: 'get'
    }).then((res)=>{
        return res?.data;
    });
}

// 删除任务
export function removePod(podId:number) {
    return request({
      url: STARLINK_SERVICE + '/kubernetes/pod/del/' + podId ,
      method: 'delete'
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

// 查询pod容器组信息
export function containerGroup(data:any) {
    return request({
      url: STARLINK_SERVICE + '/kubernetes/pod/containerGroup',
      method: 'get',
      params: data
    }).then((res)=>{
        return res?.data;
    });
}
