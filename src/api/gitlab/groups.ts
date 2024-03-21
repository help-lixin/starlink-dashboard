import request from "@/utils/request";
import {STARLINK_SERVICE} from "@/utils/env"


// 权限列表
export const accessLevels = [
    {
      value: 10,
      label: 'GUEST',
    },
    {
      value: 20,
      label: 'REPORTER',
    },
    {
      value: 30,
      label: 'DEVELOPER',
    },
    {
      value: 40,
      label: 'MAINTAINER',
    },
    {
      value: 50,
      label: 'OWNER',
    }
  ];

// 查询组列表
export function groupList(query:any) {
    return request({
      url: STARLINK_SERVICE + '/gitlab/group/list',
      method: 'post',
      data: query
    }).then((res)=>{
        return res?.data;
    });
}


// 新增组
export function addGroup(data:any) {
return request({
        url: STARLINK_SERVICE + '/gitlab/group/add',
        method: 'post',
        data: data
    }).then((res)=>{
        return res?.data;
    });
}
  
// 修改组
export function updateGroup(data:any) {
return request({
        url: STARLINK_SERVICE + '/gitlab/group/add',
        method: 'post',
        data: data
    }).then((res)=>{
        return res?.data;
    });
}
  
  // 删除组
export function delGroup(groupInfo:any) {
return request({
        url: STARLINK_SERVICE + '/gitlab/group/del',
        method: 'delete',
        data: groupInfo
    }).then((res)=>{
        return res?.data;
    });
}

// 根据id查询组信息
export function queryGroupInfoById(id:string) {
return request({
        url: STARLINK_SERVICE + '/gitlab/group/info/' + id,
        method: 'get'
    }).then((res)=>{
        return res?.data;
    });
}

// 组状态修改
export function changeGroupStatus(groupId:any, status:any) {
    return request({
        url: STARLINK_SERVICE + '/gitlab/group/changeStatus/'+groupId+"/"+status,
        method: 'put'
    }).then((res)=>{
        return res?.data;
    });
}


// 查询组gitlabId下拉列表
export function selectGitlabIdOptions(instanceCode:string) {
    return request({
      url: STARLINK_SERVICE + '/gitlab/group/selectGitlabIdOptions/'+instanceCode,
      method: 'get'
    }).then((res)=>{
        return res?.data;
    });
}

// 查询组id下拉列表
export function selectIdOptions(instanceCode:string) {
    return request({
      url: STARLINK_SERVICE + '/gitlab/group/selectIdOptions/'+instanceCode,
      method: 'get'
    }).then((res)=>{
        return res?.data;
    });
}


// 查询实例当前ip端口地址
export function queryGitlabAddr(instanceCode:string) {
  return request({
    url: STARLINK_SERVICE + '/gitlab/group/queryGitlabAddr/'+instanceCode,
    method: 'get'
  }).then((res)=>{
      return res?.data;
  });
}

// 删除组
export function removeGroup(groupId:number) {
  return request({
    url: STARLINK_SERVICE + '/gitlab/group/del/'+groupId,
    method: 'delete'
  }).then((res)=>{
      return res?.data;
  });
}
