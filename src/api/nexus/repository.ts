import request from "@/utils/request";
import {STARLINK_SERVICE} from "@/utils/env"

// 查询仓库列表
export function repositoryList(queryParams:any) {
    return request({
      url: STARLINK_SERVICE + '/nexus/repositories/list',
      method: 'POST',
      data:queryParams
    }).then((res)=>{
        return res?.data;
    });
}

// 根据仓库名称删除仓库
export function deleteRepository(repositoryName:any,env:any) {
    return request({
      url: STARLINK_SERVICE + '/nexus/repositories/'+ repositoryName,
      method: 'DELETE',
      data: env
    }).then((res)=>{
        return res?.data;
    });
}
