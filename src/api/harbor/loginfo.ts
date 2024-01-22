import request from "@/utils/request";
import {STARLINK_SERVICE} from "@/utils/env"

export const resources =[
    {
        label: '用户名',
        value: 'username',
    },
    {
        label: '操作',
        value: 'operation',
    },
    {
        label: '资源',
        value: 'resource',
    },
    {
        label: '资源类型',
        value: 'resource_type',
    }
]

// 查询列表
export function pageList(query:any) {
    return request({
      url: STARLINK_SERVICE + '/harbor/loginfo/list',
      method: 'get',
      params: query
    }).then((res)=>{
        return res?.data;
    });
}
