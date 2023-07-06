import axios, { AxiosHeaders, type AxiosHeaderValue } from "axios";
import { useTokenStore } from "@/stores/token";

const request = axios.create({});

request.interceptors.request.use((config)=>{
    if(!config.headers){
        config.headers = {} as AxiosHeaders;
    }
    const tokenStore = useTokenStore();
    const accessToken = tokenStore.token.accessToken
    const type = tokenStore.token.tokenType;
    // 配置协议头
    config.headers["Authorization"] = type + " " + accessToken;
    return config;
});

export default request;