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
    value:"FILE",
    label:"FILE"
  },
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
export function checkKey(credentialKey:string,instanceCode:string) {
return request({
      url: STARLINK_SERVICE + '/checkKey/' + credentialKey + "/" + instanceCode,
      method: 'get'
  }).then((res)=>{
      return res?.data;
  });
}

// 修改凭证状态
export function changeStatus(instanceCode:string,status:number,id:number) {
return request({
      url: STARLINK_SERVICE + '/changeStatus/' + instanceCode + "/" + status + "/" +id,
      method: 'put'
  }).then((res)=>{
      return res?.data;
  });
}
