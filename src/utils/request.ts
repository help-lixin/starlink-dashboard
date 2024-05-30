import axios, { AxiosHeaders, type AxiosHeaderValue } from "axios";
import { useTokenStore } from "@/stores/token";
import { refreshToken } from "@/api/users";
import router from "@/router/index";

const request = axios.create({});

// 请求拦截器处理
request.interceptors.request.use((config)=>{
    if(!config.headers){
        config.headers = {} as AxiosHeaders;
    }
    const tokenStore = useTokenStore();
    const accessToken = tokenStore.token?.accessToken
    const type = tokenStore.token?.tokenType;
    // 配置协议头
    config.headers["Authorization"] = type + " " + accessToken;
    return config;
});

// 响应拦截器处理
request.interceptors.response.use((respose)=>{
    return respose;
}, async (err)=>{
    // 针对401进行独立处理
    if(err?.response?.status == 401) {

        if(err.config.url.endsWith("/login")){
            ElMessage.error(err.response.data.msg);
            window.location.reload()
            return;
        }

        const tokenStore = useTokenStore();
        if(Object.keys(tokenStore?.token).length == 0){
            ElMessage.error("刷新token失败,您将重新登录");
            // 清除token信息
            tokenStore.removeToken();
            //  跳转到登录页面
            router.push({name:'login',query : { redirect: router.currentRoute.value.fullPath}});
            return;
        }
    
        // 刷新refresh_token
        const res = await refreshToken();
        if(res?.code == 200){
            // 保存新的token
            tokenStore.saveToken(JSON.stringify(res?.data));
            // 恢复之前的请求接口,并且把结果返回
            return request(err.config);
        } else {
            ElMessage.error("刷新token失败,需要重新登录");
            // 清除token信息
            tokenStore.removeToken();
            //  跳转到登录页面
            router.push({name:'login',query : { redirect: router.currentRoute.value.fullPath}});
            return;
        }
    }
    return Promise.reject(err);
});


export default request;