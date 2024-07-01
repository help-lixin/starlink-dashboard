import request from "@/utils/request";
import {STARLINK_SERVICE} from "@/utils/env"


export const credentialTypes=[
  {
    value:"TOKEN",
    label:"TOKEN"
  },
  {
    value:"USERNAME_PASSWORD",
    label:"USERNAME_PASSWORD"
  },
  {
    value:"SECRET",
    label:"SECRET"
  },
  {
    value:"SSH",
    label:"SSH"
  },
  {
    value:"TLS",
    label:"TLS"
  },
  {
    value:"OPAQUE",
    label:"OPAQUE"
  }
]

// 查询凭证列表
export function sysCredentialList(query:any) {
  return request({
    url: STARLINK_SERVICE + '/credential/list',
    method: 'get',
    params: query
  }).then((res)=>{
      return res?.data;
  });
}


// 保存凭证
export function addCredential(data:any) {
return request({
      url: STARLINK_SERVICE + '/credential/add',
      method: 'post',
      data: data
  }).then((res)=>{
      return res?.data;
  });
}

// 根据id查询凭证详情信息
export function queryCredentialInfoById(id:any) {
return request({
      url: STARLINK_SERVICE + '/credential/detail/'+id,
      method: 'get'
  }).then((res)=>{
      return res?.data;
  });
}

// 检查credentialKey值是否存在
export function checkKey(checkValue:any) {
return request({
      url: STARLINK_SERVICE + '/credential/checkKey/' + checkValue.credentialKey + "/" + checkValue.instanceCode,
      method: 'get'
  }).then((res)=>{
      return res?.data;
  });
}

// 修改凭证状态
export function changeStatus(id:number,status:number) {
return request({
      url: STARLINK_SERVICE + '/credential/changeStatus/'  + status + "/" +id,
      method: 'put'
  }).then((res)=>{
      return res?.data;
  });
}

// 查询凭证下拉列表
export function credentialOption(instanceCode:string) {
return request({
      url: STARLINK_SERVICE + '/credential/option/' + instanceCode ,
      method: 'get'
  }).then((res)=>{
      return res?.data;
  });
}

export function syncAllCredential(){
    return request({
      url: STARLINK_SERVICE + '/credential/syncAllCredential' ,
      method: 'get'
    }).then((res)=>{
        return res?.data;
    });
}

export function nameSpaceList(instanceCode:string){
    return request({
      url: STARLINK_SERVICE + '/'+instanceCode+'/credential/nameSpace/list',
      method: 'get'
    }).then((res)=>{
        return res?.data;
    });
}

export function removeCredential(id:number){
    return request({
      url: STARLINK_SERVICE + '/credential/del/' + id ,
      method: 'delete'
    }).then((res)=>{
        return res?.data;
    });
}
