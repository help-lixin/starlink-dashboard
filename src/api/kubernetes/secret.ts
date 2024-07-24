import request from "@/utils/request";
import {STARLINK_SERVICE} from "@/utils/env"





// 拉取密文下拉列表
export function secretOptionList(instanceCode:string,nameSpace:string) {
    return request({
      url: STARLINK_SERVICE + '/credential/option/'+instanceCode +"/"+nameSpace+"/USERNAME_PASSWORD/true",
      method: 'get'
    }).then((res)=>{
        return res?.data;
    });
}


