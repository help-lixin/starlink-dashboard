import request from "@/utils/request";
import {STARLINK_SERVICE} from "@/utils/env"


// 查询列表
export function pageList(query:any) {
    return request({
      url: STARLINK_SERVICE + '/ansible/label/list',
      method: 'get',
      params: query
    }).then((res)=>{
        return res?.data;
    });
}

// 新增标签
export function addLabel(data:any) {
    return request({
            url: STARLINK_SERVICE + '/ansible/label/add',
            method: 'post',
            data: data
        }).then((res)=>{
            return res?.data;
    });
}

// 更新标签主机映射
export function updateLabel(data:any) {
    return request({
            url: STARLINK_SERVICE + '/ansible/label/update',
            method: 'put',
            data: data
        }).then((res)=>{
            return res?.data;
    });
}


// 状态修改
export function changeStatus(id:any, status:any) {
    return request({
        url: STARLINK_SERVICE + '/ansible/label/changeStatus/'+id+"/"+status,
        method: 'put'
    }).then((res)=>{
        return res?.data;
    });
}




// 根据projectId查询任务详情
export function queryLabelDetail(id:number) {
    return request({
      url: STARLINK_SERVICE + '/ansible/label/queryLabelDetail/'+ id,
      method: 'get'
    }).then((res)=>{
        return res?.data;
    });
}


// 查询任务名称是否可用
export function checkLabelKey(labelKey:string) {
    return request({
      url: STARLINK_SERVICE + '/ansible/label/checkLabelKey/' + labelKey,
      method: 'get'
    }).then((res)=>{
        return res?.data;
    });
}


export function removeLabel(labelId:number){
    return request({
        url: STARLINK_SERVICE + '/ansible/label/del/' + labelId,
        method: 'delete'
    }).then((res)=>{
        return res?.data;
    });
}
