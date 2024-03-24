import request from "@/utils/request";
import {STARLINK_SERVICE} from "@/utils/env"

// 查询组成员列表
export function memberList(query:any) {
    return request({
      url: STARLINK_SERVICE + '/gitlab/project/member/list',
      method: 'get',
      params: query
    }).then((res)=>{
        return res?.data;
    });
}

// 查询项目列表
export function projectList(query:any) {
    return request({
      url: STARLINK_SERVICE + '/gitlab/project/list',
      method: 'get',
      params: query
    }).then((res)=>{
        return res?.data;
    });
}


// 新增组成员
export function addProjectMember(data:any) {
return request({
        url: STARLINK_SERVICE + '/gitlab/project/member/add',
        method: 'post',
        data: data
    }).then((res)=>{
        return res?.data;
    });
}
  
// 修改组成员
export function updateProjectMember(data:any) {
return request({
        url: STARLINK_SERVICE + '/gitlab/project/member/edit',
        method: 'put',
        data: data
    }).then((res)=>{
        return res?.data;
    });
}
  

// 根据id查询组成员信息
export function queryProjectMemberInfoById(memberData:any) {
return request({
        url: STARLINK_SERVICE + '/gitlab/project/member/info',
        method: 'get',
        params: memberData
    }).then((res)=>{
        return res?.data;
    });
}

// 删除组成员
export function removeMember(id:number) {
    return request({
        url: STARLINK_SERVICE + '/gitlab/project/member/del/'+id,
        method: 'delete'
    }).then((res)=>{
        return res?.data;
    });
}

export  function showMemberProject(projectId:number,projects:any) {
    for (const project of projects) {
        if (project.id === projectId) {
            return project.gitlabProjectName
        }
    }
  }

export function changeStatus(id:number,status:number){
    return request({
        url: STARLINK_SERVICE + '/gitlab/project/member/changeStatus/'+id+"/"+status,
        method: 'put'
    }).then((res)=>{
        return res?.data;
    });
}


// 查询用户下拉列表
export function selectUsersOptions(projectId:number,userName:string) {
    return request({
      url: STARLINK_SERVICE + '/gitlab/project/member/option/list/'+ projectId + "/" + userName,
      method: 'get'
    }).then((res)=>{
        return res?.data;
    });
}