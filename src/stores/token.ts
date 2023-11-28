import { defineStore } from 'pinia'

// token类型定义
interface Token {
    accessToken:string
    tokenType:string
    expiresIn : number
    refreshToken:string
    jti:string
}

export const useTokenStore = defineStore('token', () => {
    const tokenJson = ref("");
    const token = computed<Token>(() => {
        try{
            return JSON.parse(tokenJson.value || window.localStorage.getItem("_token")  || "{}");
        }catch(err){
            ElMessage.error("数据格式不对,转换成Token对象失败");
            window.localStorage.setItem("_token","");
            throw err;
        }
    })
    
    function saveToken(data:string){
        // 把对象转换成字符串
        tokenJson.value = data;
        window.localStorage.setItem("_token",data);
    }

    function removeToken(){
        tokenJson.value = "";
        window.localStorage.removeItem("_token");
    }

    // 向外暴露
    return { token, saveToken , removeToken}
})
