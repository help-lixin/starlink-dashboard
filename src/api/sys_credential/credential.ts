import request from "@/utils/request";
import {STARLINK_SERVICE} from "@/utils/env"

  // 查询组下拉列表
  export function credentialList(instanceCode:string) {
    return request({
      url: STARLINK_SERVICE + '/credential/option/'+instanceCode,
      method: 'get'
    }).then((res)=>{
        return res?.data;
    });
}