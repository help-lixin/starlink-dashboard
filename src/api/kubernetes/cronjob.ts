import request from "@/utils/request";
import {STARLINK_SERVICE} from "@/utils/env"




// 查询组列表
export function pageList(query:any) {
    return request({
      url: STARLINK_SERVICE + '/kubernetes/deployment/list',
      method: 'get',
      params: query
    }).then((res)=>{
        return res?.data;
    });
}


// 新增/修改 kubernetes任务配置
export function addDeployment(data:any) {
return request({
        url: STARLINK_SERVICE + '/kubernetes/deployment/add',
        method: 'post',
        data: data
    }).then((res)=>{
        return res?.data;
    });
}

// 组状态修改
export function changeStatus(deploymentId:any, status:any) {
    return request({
        url: STARLINK_SERVICE + '/kubernetes/deployment/changeStatus/'+deploymentId+"/"+status,
        method: 'put'
    }).then((res)=>{
        return res?.data;
    });
}



// 查询构建依赖任务下拉列表
export function deploymentSelectOption(instanceCode:string) {
    return request({
      url: STARLINK_SERVICE + '/kubernetes/deployment/deploymentOption/'+instanceCode,
      method: 'get'
    }).then((res)=>{
        return res?.data;
    });
}


// 查询凭证名称是否可用
export function deploymentNameIsExist(deploymentName:string,instanceCode:string) {
    return request({
      url: STARLINK_SERVICE + '/kubernetes/deployment/deploymentNameIsExist/' + deploymentName +"/" + instanceCode,
      method: 'get'
    }).then((res)=>{
        return res?.data;
    });
}

// 删除凭证
export function removeDeployment(deploymentId:number,instanceCode:string) {
    return request({
      url: STARLINK_SERVICE + '/kubernetes/deployment/del/' + deploymentId + "/" + instanceCode,
      method: 'delete'
    }).then((res)=>{
        return res?.data;
    });
}

