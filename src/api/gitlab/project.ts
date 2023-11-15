import {useTokenStore} from "@/stores/token";
import request from "@/utils/request";
import {GATEWAY_BASE_URL} from "@/utils/env"


type Response<T = string> = {
    code: number,
    msg: string,
    data: T
}


type RefreshTokenResult = Response<{
    accessToken: string,
    tokenType: string,
    refreshToken: string,
    expiresIn: number,
    jti: string
}>

export type ResponseResult = {
    code: number
    url: string
    data: string
    msg: string
}


// oauth authorize
export const authorize = function (url: string) {
    const urlObj = new URL(url);
    const newUrl = GATEWAY_BASE_URL + "/authorization-service" + urlObj.pathname + urlObj.search;
    return request<ResponseResult>({
        url: newUrl,
        method: 'GET',
        maxRedirects: 0,
        withCredentials: true
    }).then((res) => {
        return res.data;
    });
}


// http://passport.lixin.help/logout
export const logout = () => {
    request({
        url: GATEWAY_BASE_URL + '/authorization-service/logout'
    }).then((res) => {
        if (res.status == 200) {
            console.log("退出成功");
        }
    }).catch((error) => {
        // 把异常吃掉.
    });
}

// http://gateway.lixin.help/refresh/token?refresh_token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX25hbWUiOiJhZG1pbiIsImF2YXRhciI6IiIsImF1dGhvcml0aWVzIjpbImFkbWluIl0sImNsaWVudF9pZCI6ImNsaWVudDEiLCJ1c2VyX3R5cGUiOiIwMCIsInVzZXJfaWQiOjEsInNjb3BlIjpbImFsbCJdLCJhdGkiOiI2VndJNnNkb0s0Y3oxZXVVQTJDbVVPQVhmbGciLCJuaWNrX25hbWUiOiLoi6Xkvp0iLCJleHAiOjE2OTEyMzQ3NzYsImRlcHRfaWQiOjEwMywianRpIjoiNHB3NUNKWmpYdlZ1STBEelpkWk9pMEJSYXZVIiwiZW1haWwiOiJhZG1pbkAxNjMuY29tIn0.p2zqqMU8vsl6E_fvnuVD1x_91RHte1HktaHg-55Pbxwz1x_deYbKhBDssEk9wS2s4deEQrji6dxRZOzEWRmc-LQ_K_JQA99ttbkzM1W_TLinMaZUvSG90aZ3zk2u2N4t5PskBzkrMl3ir0x9-k2beK6hzLqVc-9EGrNYojJkLud5UFjYaU9yW9a8VA0r-dZZhPmOoIHsJSgEbjDqwhIpEMsFfDyddMCMRvkUwIm32jlPMv3Aix6-2i-AOjhNyNIFv1DmWU4jfUSX8uBNPVFAB0Ysa-i77pO6omvkWc98gdlM5-QqCTre4ORQ6jhU3VzHCZDDa5bm-WKfeIo0w3TXse
// 刷新token

let promiseRefresh: Promise<any>;
let isRefreshTokenOperator = false;
export const refreshToken = () => {
    // 先判断刷新token这个操作是否有在执行,如果有在操作,直接返回在执行中的:promiseRefresh
    if (isRefreshTokenOperator) {
        return promiseRefresh;
    }

    isRefreshTokenOperator = true;
    const tokenStore = useTokenStore();
    promiseRefresh = request<RefreshTokenResult>({
        // 刷token交给了gateway做处理,并不属于某个具体的业务系统.
        url: GATEWAY_BASE_URL + '/refresh/token',
        method: 'GET',
        params: {
            refresh_token: tokenStore.token?.refreshToken
        }
    }).then((res) => {
        return res?.data;
    }).finally(() => {
        // 不论成功失败,标记都要为false
        isRefreshTokenOperator = false;
    });
    return promiseRefresh;
}

// 查询项目列表
export function pageList(query:any) {
    return request({
      url: GATEWAY_BASE_URL + '/starlink-service/gitlab/project/list',
      method: 'get',
      params: query
    }).then((res)=>{
        return res?.data;
    });
}


// 新增项目
export function addProject(data:any) {
return request({
        url: GATEWAY_BASE_URL + '/starlink-service/gitlab/project/add',
        method: 'post',
        data: data
    }).then((res)=>{
        return res?.data;
    });
}
  
// 修改项目
export function updateProject(data:any) {
return request({
        url: GATEWAY_BASE_URL + '/starlink-service/gitlab/project/edit',
        method: 'post',
        data: data
    }).then((res)=>{
        return res?.data;
    });
}
  
  // 删除项目
export function delProject(projectInfo:any) {
return request({
        url: GATEWAY_BASE_URL + '/starlink-service/gitlab/project/del',
        method: 'delete',
        data: projectInfo
    }).then((res)=>{
        return res?.data;
    });
}

// 根据id查询项目信息
export function queryProjectInfoById(id:string,env:any) {
return request({
        url: GATEWAY_BASE_URL + '/starlink-service/gitlab/project/info/'+id,
        method: 'get',
        params: env
    }).then((res)=>{
        return res?.data;
    });
}

// 项目状态修改
export function changeProjectStatus(projectId:number, status:number) {
    return request({
        url: GATEWAY_BASE_URL + '/starlink-service/gitlab/project/changeStatus/'+projectId+"/"+status,
        method: 'put'
    }).then((res)=>{
        return res?.data;
    });
}

