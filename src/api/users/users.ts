import { useTokenStore } from "@/stores/token";
import request from "@/utils/request";

type Response<T=string> = {
    code:number,
    msg:string,
    data:T
}

type Profile  = Response<{
    postGroup:string,
    userName:string,
    roleGroup:string
}>;

type RefreshTokenResult =  Response<{
    accessToken:string,
    tokenType:string,
    refreshToken:string,
    expiresIn:number,
    jti:string
}>

// /system-service/system/user/getProfile
// 获取个人信息
export const getProfile = ()=> {
    return request<Profile>({
        url : import.meta.env.VITE_GATEWAY_API_PREFIX_PATH + '/system-service/system/user/getProfile'
    }).then((res)=>{
       return res.data; 
    });
}

// http://passport.lixin.help/logout
export const logout = ()=> {
    request({
        url : import.meta.env.VITE_PASSPORT_API_PREFIX_PATH + '/logout'
    }).then((res)=>{
        if(res.status == 200){
            console.log("退出成功");
        }
    });
}

// http://gateway.lixin.help/refresh/token?refresh_token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX25hbWUiOiJhZG1pbiIsImF2YXRhciI6IiIsImF1dGhvcml0aWVzIjpbImFkbWluIl0sImNsaWVudF9pZCI6ImNsaWVudDEiLCJ1c2VyX3R5cGUiOiIwMCIsInVzZXJfaWQiOjEsInNjb3BlIjpbImFsbCJdLCJhdGkiOiI2VndJNnNkb0s0Y3oxZXVVQTJDbVVPQVhmbGciLCJuaWNrX25hbWUiOiLoi6Xkvp0iLCJleHAiOjE2OTEyMzQ3NzYsImRlcHRfaWQiOjEwMywianRpIjoiNHB3NUNKWmpYdlZ1STBEelpkWk9pMEJSYXZVIiwiZW1haWwiOiJhZG1pbkAxNjMuY29tIn0.p2zqqMU8vsl6E_fvnuVD1x_91RHte1HktaHg-55Pbxwz1x_deYbKhBDssEk9wS2s4deEQrji6dxRZOzEWRmc-LQ_K_JQA99ttbkzM1W_TLinMaZUvSG90aZ3zk2u2N4t5PskBzkrMl3ir0x9-k2beK6hzLqVc-9EGrNYojJkLud5UFjYaU9yW9a8VA0r-dZZhPmOoIHsJSgEbjDqwhIpEMsFfDyddMCMRvkUwIm32jlPMv3Aix6-2i-AOjhNyNIFv1DmWU4jfUSX8uBNPVFAB0Ysa-i77pO6omvkWc98gdlM5-QqCTre4ORQ6jhU3VzHCZDDa5bm-WKfeIo0w3TXse
// 刷新token

let promiseRefresh:Promise<any>;
let isRefreshTokenOperator = false;
export const refreshToken = ()=>{
    // 先判断刷新token这个操作是否有在执行,如果有在操作,直接返回在执行中的:promiseRefresh
    if(isRefreshTokenOperator){
        return promiseRefresh;
    }

    isRefreshTokenOperator = true;
    const tokenStore = useTokenStore();
    promiseRefresh =  request<RefreshTokenResult>({
        url : import.meta.env.VITE_GATEWAY_API_PREFIX_PATH + '/refresh/token',
        method: 'GET',
        params: {
            refresh_token : tokenStore.token?.refreshToken
        }
    }).then((res)=>{
        return res?.data;
    }).finally(()=>{
        // 不论成功失败,标记都要为false
        isRefreshTokenOperator = false;
    });
    return promiseRefresh;
}

