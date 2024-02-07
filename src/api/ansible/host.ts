import request from "@/utils/request";
import {STARLINK_SERVICE} from "@/utils/env"


// 查询列表
export function pageList(query:any) {
    return request({
      url: STARLINK_SERVICE + '/ansible/host/list',
      method: 'get',
      params: query
    }).then((res)=>{
        return res?.data;
    });
}

// 新增/修改 jenkins任务配置
export function addHost(data:any) {
    return request({
            url: STARLINK_SERVICE + '/ansible/host/add',
            method: 'post',
            data: data
        }).then((res)=>{
            return res?.data;
    });
}


// 状态修改
export function changeStatus(id:any, status:any) {
    return request({
        url: STARLINK_SERVICE + '/ansible/host/changeStatus/'+id+"/"+status,
        method: 'put'
    }).then((res)=>{
        return res?.data;
    });
}

export function queryDetail(id:number){
    return request({
        url: STARLINK_SERVICE + '/ansible/host/queryDetail/'+id,
        method: 'get'
    }).then((res)=>{
        return res?.data;
    });
}



// 查询任务名称是否可用
export function checkServerName(serverName:string,sshInstanceCode:string) {
    return request({
      url: STARLINK_SERVICE + '/ansible/host/checkServerName/'+serverName + "/" + sshInstanceCode ,
      method: 'get'
    }).then((res)=>{
        return res?.data;
    });
}

// 查询实例是否存在
export function checkInstanceCode(instanceCode:string) {
    return request({
      url: STARLINK_SERVICE + '/ansible/host/checkInstance/'+ instanceCode,
      method: 'get'
    }).then((res)=>{
        return res?.data;
    });
}

