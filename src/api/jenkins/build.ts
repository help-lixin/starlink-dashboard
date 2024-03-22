import request from "@/utils/request";
import {STARLINK_SERVICE} from "@/utils/env"


export  function showBuildStatusFun(status:number):string {
  if(status == 1){
    return "成功";
  }else if(status == -1){
    return "失败";
  }else{
    return "构建中";
  }
}

// 根据任务id查询构建日志信息
export function pageList(query:any) {
    return request({
      url: STARLINK_SERVICE + '/jenkins/build/list',
      method: 'get',
      params: query
    }).then((res)=>{
        return res?.data;
    });
}

