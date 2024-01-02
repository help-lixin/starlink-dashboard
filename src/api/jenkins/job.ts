import request from "@/utils/request";
import {STARLINK_SERVICE} from "@/utils/env"



export const tools = [
    {
        value: 'MAVEN',
        label: 'maven',
    },
    {
        value: 'GRADLE',
        label: 'gradle',
    },
    {
        value: 'PYTHON',
        label: 'python',
    },
    {
        value: 'GO',
        label: 'go',
    },
    {
        value: 'SHELL',
        label: 'shell命令',
    },
    {
        value: 'NODEJS',
        label: 'nodeJs',
    },
    {
        value: 'ANT',
        label: 'ant',
    }
];

  export const scmType = [
    {
        value: 'GIT',
        label: 'git',
    },
    {
        value: 'SVN',
        label: 'svn',
    }
  ];

  export const paramTypes = [
    {
        value: 'STRING',
        label: 'STRING',
    },
    {
        value: 'NUMBER',
        label: 'NUMBER',
    }
  ];

// 查询组列表
export function pageList(query:any) {
    return request({
      url: STARLINK_SERVICE + '/jenkins/job/list',
      method: 'get',
      params: query
    }).then((res)=>{
        return res?.data;
    });
}


// 新增/修改 jenkins任务配置
export function addJob(data:any) {
return request({
        url: STARLINK_SERVICE + '/jenkins/job/add',
        method: 'post',
        data: data
    }).then((res)=>{
        return res?.data;
    });
}

// 组状态修改
export function changeStatus(jobId:any, status:any) {
    return request({
        url: STARLINK_SERVICE + '/jenkins/job/changeStatus/'+jobId+"/"+status,
        method: 'put'
    }).then((res)=>{
        return res?.data;
    });
}



// 查询工具下拉列表
export function jobSelectOption(instanceCode:string) {
    return request({
      url: STARLINK_SERVICE + '/jenkins/job/jobOption/'+instanceCode,
      method: 'get'
    }).then((res)=>{
        return res?.data;
    });
}




// 根据jobId查询任务详情
export function queryJobDetail(jobId:number) {
    return request({
      url: STARLINK_SERVICE + '/jenkins/job/detail/'+ jobId,
      method: 'get'
    }).then((res)=>{
        return res?.data;
    });
}

// 根据jobId查询任务详情
export function buildJob(params:any) {
    return request({
      url: STARLINK_SERVICE + '/jenkins/job/buildJob',
      method: 'get',
      params:params
    }).then((res)=>{
        return res?.data;
    });
}

