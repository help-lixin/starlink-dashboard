import request from "@/utils/request";
import {STARLINK_SERVICE} from "@/utils/env"

export const units =[
    {
        label:"MB",
        value:1024*1024
    },
    {
        label:"GB",
        value:1024*1024*1024
    },
    {
        label:"TB",
        value:1024*1024*1024*1024
    },
]
export const isPublic = [
    {
      value: 1,
      label: '公开',
    },
    {
      value: 0,
      label: '私有',
    }
];

export function showAccessLevelOperateFun(isPublic:number){
    if(isPublic == 1){
        return "私有";
    }else{
        return "公开";
    }
}

export function changeAccessLevel (isPublic:number,instanceCode:string){
    return request({
        url: STARLINK_SERVICE + '/harbor/project/changeAccessLevel/' + isPublic + "/" + instanceCode,
        method: 'get'
      }).then((res)=>{
          return res?.data;
      });
}

export function showIsPublicFun(isPublic:number){
    if(isPublic == 1){
        return "公开";
    }else{
        return "私有";
    }
}

// pull命令
export function pullCommand(project:string,tag:string){
    return "docker pull registry.lixin.help/"+ project + ":" + tag
}

// push命令 
export function pushCommand(project:string){
    return "docker push registry.lixin.help/"+ project + "/REPOSITORY[:TAG]" 
}

// 查询列表
export function pageList(query:any) {
    return request({
      url: STARLINK_SERVICE + '/harbor/project/list',
      method: 'get',
      params: query
    }).then((res)=>{
        return res?.data;
    });
}

// 新增/修改 jenkins任务配置
export function addProject(data:any) {
    return request({
            url: STARLINK_SERVICE + '/harbor/project/add',
            method: 'post',
            data: data
        }).then((res)=>{
            return res?.data;
    });
}

// 查询仓库目录树状节点
export function queryNodeList(projectName:string , instanceCode:string) {
    return request({
      url: STARLINK_SERVICE + '/harbor/project/queryNodeList/' + projectName + "/" + instanceCode,
      method: 'get'
    }).then((res)=>{
        return res?.data;
    });
}

// 状态修改
export function changeStatus(projectId:any, status:any) {
    return request({
        url: STARLINK_SERVICE + '/harbor/project/changeStatus/'+projectId+"/"+status,
        method: 'put'
    }).then((res)=>{
        return res?.data;
    });
}




// 根据projectId查询任务详情
export function queryProjectDetail(projectId:number) {
    return request({
      url: STARLINK_SERVICE + '/harbor/job/detail/'+ projectId,
      method: 'get'
    }).then((res)=>{
        return res?.data;
    });
}


// 查询任务名称是否可用
export function projectNameIsExist(projectName:string,instanceCode:string) {
    return request({
      url: STARLINK_SERVICE + '/harbor/project/projectNameIsExist/' + projectName +"/" + instanceCode,
      method: 'get'
    }).then((res)=>{
        return res?.data;
    });
}

// 删除
export function removeProject(projectId:number) {
    return request({
      url: STARLINK_SERVICE + '/harbor/project/del/' + projectId,
      method: 'delete'
    }).then((res)=>{
        return res?.data;
    });
}

