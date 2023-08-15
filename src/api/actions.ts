import request from "@/utils/request"
import { GATEWAY_BASE_URL } from '@/utils/env';


// 拉取所有Action的元数据信息
export const getActionMetas = () => {
    return request({
        url: GATEWAY_BASE_URL + '/starlink-service/action/meta',
        method: 'GET'
    }).then((res) => {
        return res.data;
    })
}