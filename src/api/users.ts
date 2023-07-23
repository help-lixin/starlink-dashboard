import {useTokenStore} from "@/stores/token";
import request from "@/utils/request";
import {GATEWAY_BASE_URL} from "@/utils/env"
import { parseStrEmpty } from "@/utils/common";


type Response<T = string> = {
    code: number,
    msg: string,
    data: T
}

type Profile = Response<{
    postGroup: string,
    userName: string,
    roleGroup: string,
    avatar: string
}>;

type RefreshTokenResult = Response<{
    accessToken: string,
    tokenType: string,
    refreshToken: string,
    expiresIn: number,
    jti: string
}>


type LoginRequest = {
    username: string
    password: string
}

export type ResponseResult = {
    code: number
    url: string
    data: string
    msg: string
}

// 请求获取验证码
export const captcha = function () {
    return request<ResponseResult>({
        url: GATEWAY_BASE_URL + '/authorization-service/captcha',
        method: 'GET',
        withCredentials: true
    }).then(res => {
        return res.data;
    });
}


// 登录
export const login = function (requsetData: LoginRequest) {
    return request<ResponseResult>({
        url: GATEWAY_BASE_URL + '/authorization-service/login',
        maxRedirects: 0,
        method: 'POST',
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        withCredentials: true,
        params: requsetData
    }).then((res) => {
        const loginFailJson = {
            code: 500,
            msg: "登录失败,用户名或密码错误"
        };
        // http status
        if (res.status == 200) {
            const data = res.data;
            if (data.code != undefined && data.code == 200) {
                return data;
            } else {
                return loginFailJson;
            }
        }
    }).catch((err) => {
        console.error(err);
        const loginFailJson = {
            code: 500,
            msg: "请求失败"
        };
        Promise.reject(loginFailJson);
    });
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

// /system-service/system/user/getProfile
// 获取个人信息
export const getProfile = () => {
    return request<Profile>({
        url: GATEWAY_BASE_URL + '/system-service/system/user/getProfile'
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

// 查询用户列表
export function listUser(query:any) {
    return request({
      url: GATEWAY_BASE_URL + '/system-service/system/user/list',
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
     data: query
    }).then((res)=>{
        return res?.data;
    });
}

// 查询用户详细
export function getUser(userId:string) {
    return request({
        url: GATEWAY_BASE_URL + '/system-service/system/user/info/' + parseStrEmpty(userId),
        method: 'get'
    }).then((res)=>{
        return res?.data;
    });
}



// 新增用户
export function addUser(data:any) {
return request({
        url: GATEWAY_BASE_URL + '/system-service/system/user/add',
        method: 'post',
        data: data
    }).then((res)=>{
        return res?.data;
    });
}
  
// 修改用户
export function updateUser(data:any) {
return request({
        url: GATEWAY_BASE_URL + '/system-service/system/user/edit',
        method: 'put',
        data: data
    }).then((res)=>{
        return res?.data;
    });
}
  
  // 删除用户
export function delUser(userId:string) {
return request({
        url: GATEWAY_BASE_URL + '/system-service/system/user/del/' + userId,
        method: 'delete'
    }).then((res)=>{
        return res?.data;
    });
}


// 用户状态修改
export function changeUserStatus(userId:any, status:any) {
    const data = {
        userId,
        status
    }
    return request({
        url: GATEWAY_BASE_URL + '/system-service/system/user/changeStatus',
        method: 'put',
        data: data
    }).then((res)=>{
        return res?.data;
    });
}


// 用户密码重置
export function resetUserPwd(userId:string, password:string) {
    const data = {
      userId,
      password
    }
    return request({
      url: GATEWAY_BASE_URL + '/system-service/system/user/resetPwd',
      method: 'put',
      data: data
    }).then((res)=>{
        return res?.data;
    });
  }
  