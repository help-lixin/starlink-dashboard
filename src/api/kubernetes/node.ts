import request from "@/utils/request";
import {STARLINK_SERVICE} from "@/utils/env"



// 查询任务列表
export function pageList(query:any) {
    return request({
      url: STARLINK_SERVICE + '/kubernetes/node/list',
      method: 'get',
      params: query
    }).then((res)=>{
        return res?.data;
    });
}

// 状态修改
export function changeStatus(nodeId:any, status:any) {
  return request({
      url: STARLINK_SERVICE + '/kubernetes/node/changeStatus/'+nodeId+"/"+status,
      method: 'put'
  }).then((res)=>{
      return res?.data;
  });
}
