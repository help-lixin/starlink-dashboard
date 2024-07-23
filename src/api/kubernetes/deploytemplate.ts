// @ts-nocheck

import request from "@/utils/request";
import {STARLINK_SERVICE, SYSTEM_SERVICE} from "@/utils/env"

export function list(query:any){
    return request({
        url: STARLINK_SERVICE + '/kubernetes/deployment/yaml/template/list',
        method: 'get',
        params: query
    }).then((res)=>{
        return res?.data;
    });
}


export function get(id:any){
    return request({
        url: STARLINK_SERVICE + '/kubernetes/deployment/yaml/template/query/' + id,
        method: 'get'
    }).then((res)=>{
        return res?.data;
    });
}

export function add(data:any) {
    return request({
        url: STARLINK_SERVICE + '/kubernetes/deployment/yaml/template/add',
        method: 'post',
        data: data
    }).then((res)=>{
        return res?.data;
    });
}


export function changeStatus(deploymentId:any, status:any) {
    return request({
        url: STARLINK_SERVICE + '/kubernetes/deployment/yaml/template/changeStatus/'+deploymentId+"/"+status,
        method: 'put'
    }).then((res)=>{
        return res?.data;
    });
}

export function del(id:string) {
    return request({
        url: STARLINK_SERVICE + '/kubernetes/deployment/yaml/template/del/' + id,
        method: 'delete'
    }).then((res)=>{
        return res?.data;
    });
}
