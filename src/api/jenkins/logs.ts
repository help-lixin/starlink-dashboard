import request from "@/utils/request";
import {STARLINK_SERVICE} from "@/utils/env"



// 根据任务id查询构建日志信息
export function queryLogInfoByJobId(jobId:number) {
    return request({
      url: STARLINK_SERVICE + '/jenkins/logs/info/'+jobId,
      method: 'get'
    }).then((res)=>{
        return res?.data;
    });
}


