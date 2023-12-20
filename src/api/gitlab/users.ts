import request from "@/utils/request";
import {STARLINK_SERVICE} from "@/utils/env"

// 查询组列表
export function userList(query:any) {
    return request({
      url: STARLINK_SERVICE + '/gitlab/user/list',
      method: 'get',
      params: query
    }).then((res)=>{
        return res?.data;
    });
}


// 新增组
export function addUser(data:any) {
return request({
        url: STARLINK_SERVICE + '/gitlab/user/add',
        method: 'post',
        data: data
    }).then((res)=>{
        return res?.data;
    });
}
  
// 修改组
export function updateUser(data:any) {
return request({
        url: STARLINK_SERVICE + '/gitlab/user/edit',
        method: 'put',
        data: data
    }).then((res)=>{
        return res?.data;
    });
}
  
  // 删除组
export function delUser(userInfo:any) {
return request({
        url: STARLINK_SERVICE + '/gitlab/user/del',
        method: 'delete',
        data: userInfo
    }).then((res)=>{
        return res?.data;
    });
}

// 根据id查询组信息
export function queryUserInfoById(id:string) {
return request({
        url: STARLINK_SERVICE + '/gitlab/user/info/' + id,
        method: 'get'
    }).then((res)=>{
        return res?.data;
    });
}

// 组状态修改
export function changeUserStatus(data:any) {
    return request({
        url: STARLINK_SERVICE + '/gitlab/user/changeStatus',
        method: 'put',
        data: data
    }).then((res)=>{
        return res?.data;
    });
}

// 查询组列表
export function userSelectOption(query:any) {
    return request({
      url: STARLINK_SERVICE + '/gitlab/user/selectOption',
      method: 'get',
      params: query
    }).then((res)=>{
        return res?.data;
    });
}

