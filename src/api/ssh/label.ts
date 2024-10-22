import request from "@/utils/request";
import {STARLINK_SERVICE} from "@/utils/env"


// 查询列表
export function pageList(query:any) {
    return request({
      url: STARLINK_SERVICE + '/ssh/label/list',
      method: 'get',
      params: query
    }).then((res)=>{
        return res?.data;
    });
}

// 新增/更新标签
export function addLabel(data:any) {
    return request({
            url: STARLINK_SERVICE + '/ssh/label/add',
            method: 'post',
            data: data
        }).then((res)=>{
            return res?.data;
    });
}



// 状态修改
export function changeStatus(id:any, status:any) {
    return request({
        url: STARLINK_SERVICE + '/ssh/label/changeStatus/'+id+"/"+status,
        method: 'put'
    }).then((res)=>{
        return res?.data;
    });
}




// 根据labelId查询任务详情
export function queryLabelDetail(id:number) {
    return request({
      url: STARLINK_SERVICE + '/ssh/label/info/'+ id,
      method: 'get'
    }).then((res)=>{
        return res?.data;
    });
}

// 查询任务名称是否可用
export function checkLabelKey(labelKey:string) {
    return request({
      url: STARLINK_SERVICE + '/ssh/label/checkLabelKey/' + labelKey,
      method: 'get'
    }).then((res)=>{
        return res?.data;
    });
}

// 删除ssh标签
export function removeLabel(labelId:number) {
    return request({
      url: STARLINK_SERVICE + '/ssh/label/del/' + labelId,
      method: 'delete'
    }).then((res)=>{
        return res?.data;
    });
}

