import request from "@/utils/request";
import {STARLINK_SERVICE} from "@/utils/env"


// 查询项目列表
export function pageList(query:any) {
    return request({
      url: STARLINK_SERVICE + '/gitlab/project/list',
      method: 'get',
      params: query
    }).then((res)=>{
        return res?.data;
    });
}


// 新增项目
export function addProject(data:any) {
return request({
        url: STARLINK_SERVICE + '/gitlab/project/add',
        method: 'post',
        data: data
    }).then((res)=>{
        return res?.data;
    });
}
  
// 修改项目
export function updateProject(data:any) {
return request({
        url: STARLINK_SERVICE + '/gitlab/project/edit',
        method: 'post',
        data: data
    }).then((res)=>{
        return res?.data;
    });
}
  
  // 删除项目
export function delProject(projectInfo:any) {
return request({
        url: STARLINK_SERVICE + '/gitlab/project/del',
        method: 'delete',
        data: projectInfo
    }).then((res)=>{
        return res?.data;
    });
}

// 根据id查询项目信息
export function queryProjectInfoById(id:string,env:any) {
return request({
        url: STARLINK_SERVICE + '/gitlab/project/info/'+id,
        method: 'get',
        params: env
    }).then((res)=>{
        return res?.data;
    });
}

// 项目状态修改
export function changeProjectStatus(projectId:number, status:number) {
    return request({
        url: STARLINK_SERVICE + '/gitlab/project/changeStatus/'+projectId+"/"+status,
        method: 'put'
    }).then((res)=>{
        return res?.data;
    });
}

