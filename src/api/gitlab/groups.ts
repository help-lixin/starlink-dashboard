import request from "@/utils/request";
import {GATEWAY_BASE_URL} from "@/utils/env"


// 查询组列表
export function groupList(query:any) {
    return request({
      url: GATEWAY_BASE_URL + '/starlink-service/gitlab/group/list',
      method: 'post',
      data: query
    }).then((res)=>{
        return res?.data;
    });
}


// 新增组
export function addGroup(data:any) {
return request({
        url: GATEWAY_BASE_URL + '/starlink-service/gitlab/group/add',
        method: 'post',
        data: data
    }).then((res)=>{
        return res?.data;
    });
}
  
// 修改组
export function updateGroup(data:any) {
return request({
        url: GATEWAY_BASE_URL + '/starlink-service/gitlab/group/add',
        method: 'post',
        data: data
    }).then((res)=>{
        return res?.data;
    });
}
  
  // 删除组
export function delGroup(groupInfo:any) {
return request({
        url: GATEWAY_BASE_URL + '/starlink-service/gitlab/group/del',
        method: 'delete',
        data: groupInfo
    }).then((res)=>{
        return res?.data;
    });
}

// 根据id查询组信息
export function queryGroupInfoById(id:string) {
return request({
        url: GATEWAY_BASE_URL + '/starlink-service/gitlab/group/info/' + id,
        method: 'get'
    }).then((res)=>{
        return res?.data;
    });
}

// 组状态修改
export function changeGroupStatus(groupId:any, status:any) {
    return request({
        url: GATEWAY_BASE_URL + '/starlink-service/gitlab/group/changeStatus/'+groupId+"/"+status,
        method: 'put'
    }).then((res)=>{
        return res?.data;
    });
}

