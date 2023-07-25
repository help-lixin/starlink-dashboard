import request from "@/utils/request";
import {GATEWAY_BASE_URL} from "@/utils/env"


// 查询角色
export function getRoles() {
    return request({
        url: GATEWAY_BASE_URL + '/system-service/system/role/optionselect',
        method: 'get'
    }).then((res)=>{
        return res?.data;
    });
}


// 查询角色列表
export function listRole(query:any) {
    return request({
        url:  GATEWAY_BASE_URL + '/system-service/system/role/list',
        method: 'POST',
        data: query
    }).then((res)=>{
        return res.data
    });
}


// 新增角色
export function addRole(data:any) {
    return request({
        url: GATEWAY_BASE_URL + '/system-service/system/role/add',
        method: 'post',
        headers: {
            'content-type': 'application/json'
        },
        data: data
    }).then(res=>{
        return res.data;
    })
}
  
// 修改角色
export function updateRole(data:any) {
    return request({
        url: GATEWAY_BASE_URL + '/system-service/system/role/edit',
        method: 'put',
        data: data,
        headers: {
            'content-type': 'application/json'
        },
    }).then(res=>{
        return res.data;
    })
}


// 删除角色
export function delRole(roleId:any) {
    return request({
        url: GATEWAY_BASE_URL + '/system-service/system/role/del/' + roleId,
        method: 'delete'
    }).then((res)=>{
        return res.data;
    })
}
  
// 查询角色详细
export function getRole(roleId:any) {
    return request({
      url: GATEWAY_BASE_URL + '/system-service/system/role/info/' + roleId,
      method: 'get'
    }).then((res)=>{
        return res.data;
    })
}  


// 根据角色ID查询菜单下拉树结构
export function roleMenuTreeSelect(roleId:any) {
    return request({
        url: GATEWAY_BASE_URL + '/system-service/system/menu/roleMenuTreeSelect/' + roleId,
        method: 'get'
    }).then((res)=>{
        return res.data?.data;
    })
}
  


// 角色状态修改
export function changeRoleStatus(roleId:any, status:any) {
    const data = {
      roleId,
      status
    }

    return request({
      url: GATEWAY_BASE_URL + '/system-service/system/role/changeStatus',
      method: 'put',
      data: data
    }).then((res)=>{
        return res.data;
    });
}
  

