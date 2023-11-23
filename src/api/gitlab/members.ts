import request from "@/utils/request";
import {STARLINK_SERVICE} from "@/utils/env"

// 查询组成员列表
export function memberList(query:any) {
    return request({
      url: STARLINK_SERVICE + '/gitlab/group/member/list',
      method: 'get',
      params: query
    }).then((res)=>{
        return res?.data;
    });
}


// 新增组成员
export function addGroupMember(data:any) {
return request({
        url: STARLINK_SERVICE + '/gitlab/group/member/add',
        method: 'post',
        data: data
    }).then((res)=>{
        return res?.data;
    });
}
  
// 修改组成员
export function updateGroupMember(data:any) {
return request({
        url: STARLINK_SERVICE + '/gitlab/group/member/edit',
        method: 'put',
        data: data
    }).then((res)=>{
        return res?.data;
    });
}
  

// 根据id查询组成员信息
export function queryGroupMemberInfoById(id:string) {
return request({
        url: STARLINK_SERVICE + '/gitlab/group/member/list/' + id,
        method: 'get'
    }).then((res)=>{
        return res?.data;
    });
}

// 组成员状态修改
export function changeGroupStatus(groupId:any, status:any) {
    return request({
        url: STARLINK_SERVICE + '/gitlab/group/member/changeStatus/'+groupId+"/"+status,
        method: 'put'
    }).then((res)=>{
        return res?.data;
    });
}

