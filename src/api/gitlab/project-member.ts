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
export function queryProjectMemberInfoById(id:string) {
return request({
        url: STARLINK_SERVICE + '/gitlab/project/member/info/' + id,
        method: 'get'
    }).then((res)=>{
        return res?.data;
    });
}

// 删除组成员
export function removeMember(data:any) {
    return request({
        url: STARLINK_SERVICE + '/gitlab/project/member/del',
        method: 'delete',
        data: data
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
