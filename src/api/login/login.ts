import request from "@/utils/request";

interface LoginRequest {
    username:string
    password:string
}

interface ResponseResult {
    code:number
    data:string
    msg:string
}

// 请求获取验证码
export const captcha = function(){
    return  request<ResponseResult>({
            url : '/passport/api/captcha',
            method : 'GET',
            withCredentials: true
    }).then(res=>{
        return res.data;
    });
}



// 登录
export const login = function(requsetData:LoginRequest){
    return  request<ResponseResult>({
        url : '/passport/api/login',
        maxRedirects: 0,
        method : 'POST',
        headers : {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        withCredentials: true, 
        params : requsetData
    }).then((res)=>{
        const loginFailJson = {
            code: 500,
            msg: "登录失败,用户名或密码错误"
        };
        // http status
        if(res.status == 200){
            const data = res.data;
            if(data.code != undefined &&  data.code == 200) {
                return data;
            }else{
                return loginFailJson;
            }
        }
    }).catch((err)=>{
        console.error(err);
        const loginFailJson = {
            code: 500,
            msg: "请求失败"
        };
        Promise.reject(loginFailJson);
    });
}

// oauth authorize
export const authorize = function(url:string){
    const urlObj = new URL(url);
    const newUrl =  "/passport/api" + urlObj.pathname + urlObj.search;

    return request<ResponseResult>({
        url: newUrl,
        method: 'GET',
        maxRedirects: 0,
        withCredentials: true
    }).then((res)=>{
        return res.data;
    });
}