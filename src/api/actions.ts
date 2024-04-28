import request from "@/utils/request"
import { STARLINK_SERVICE } from '@/utils/env';


// 拉取所有Action的元数据信息
export const getActionMetas = () => {
    return request({
        url: STARLINK_SERVICE + '/action/meta',
        method: 'GET'
    }).then((res) => {
        return res.data;
    })
}