import request from "@/utils/request";

interface Profile  {
    postGroup:string,
    userName:string,
    roleGroup:string
}

interface GetProfileResult {
    code:number,
    msg:string,
    data:Profile
}

// /system-service/system/user/getProfile
// 获取个人信息
export const getProfile = ()=> {
    return request<GetProfileResult>({
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
