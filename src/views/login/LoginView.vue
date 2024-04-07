<script setup lang="ts">
import { login, authorize } from "@/api/users";
import { useTokenStore } from "@/stores/token";
import { useRouter, useRoute } from "vue-router";
import type { FormInstance, FormRules } from 'element-plus'
import { processRoutes } from "@/api/router";
import { usePermsStore } from "@/stores/perms";
import { useActionMetasStore } from "@/stores/plugin";

import StompClient from "@/utils/StompClient.ts";

const tokenStore = useTokenStore();
const permsStore = usePermsStore();
const router = useRouter();
const route = useRoute();
const actionMetasStore = useActionMetasStore();


const form = reactive({
    username: 'admin',
    password: '123456'
});

const rules = reactive<FormRules>({
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, max: 50, message: '用户名的长度最小为3位,最大为50位', trigger: 'blur' },
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' }
    ]
});

// 是否加载中
const isLoading = ref(false);

const formRef = ref<FormInstance>();
async function onSubmit() {
    isLoading.value = true;

    let validate = await formRef.value?.validate()
        .catch((err: Error) => {
            ElMessage({
                showClose: true,
                message: '表单验证失败',
                type: 'success',
            });
            isLoading.value = false;
            throw err;
        });

    if (validate) {
        let loginRes: any = await login(form);
        console.log(loginRes, 'loginRes')
        // const loginRes = {code:200}
        if (loginRes.code == 200) {
            let authorizeRes = await authorize(loginRes.url);
            // console.log(authorizeRes, 'authorizeRes')
          // const authorizeRes = {
          //   "msg": "获取token成功",
          //   "code": 200,
          //   "data": {
          //     "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX3R5cGUiOiIwMCIsInVzZXJfaWQiOjEsInVzZXJfbmFtZSI6ImFkbWluIiwic2NvcGUiOlsiYWxsIl0sIm5pY2tfbmFtZSI6IuiLpeS-nTEiLCJhdmF0YXIiOiIiLCJleHAiOjE3NTI5MTA0MjQsImRlcHRfaWQiOjEwMywiYXV0aG9yaXRpZXMiOlsiYWRtaW4iXSwianRpIjoiellnOEx4clVBeUNucXd1WExFQWx5ZldXVERBIiwiY2xpZW50X2lkIjoiY2xpZW50MSIsImVtYWlsIjoiYWRtaW5AMTYzLmNvbSJ9.X6jgwuDR2tS2-YPT676SDFzMEuKZ7Hu0InaFHICQlqb_3ycUz7xqSPwHmlGGWv71aV92-UzwOF0QY5uV_sO0kWOa44mehIVtQK7_qvp8nsX32jzdF25BY5WwCGDIcygkBSnC5J_dOt7Aj_W_JBihDI0v9SEicyrjKJNYQG5fMhM1l7L0Et5VGF84DAHwEQnJJshZnwArHfIxdS96G-r2GAJEU7RiyLqNEH2yXaPTtz_gvOpE4bTCXA98hwWWHiiwPuYUxvd_IpnNcoHKAGK5hRJzw3RMK9s5wVqGoJIFY7dlaNNevrhw7jXoLoddpd58UVwZn0jDyQlUzLlwjHAoOw",
          //     "tokenType": "bearer",
          //     "refreshToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX25hbWUiOiJhZG1pbiIsImF2YXRhciI6IiIsImF1dGhvcml0aWVzIjpbImFkbWluIl0sImNsaWVudF9pZCI6ImNsaWVudDEiLCJ1c2VyX3R5cGUiOiIwMCIsInVzZXJfaWQiOjEsInNjb3BlIjpbImFsbCJdLCJhdGkiOiJ6WWc4THhyVUF5Q25xd3VYTEVBbHlmV1dUREEiLCJuaWNrX25hbWUiOiLoi6Xkvp0xIiwiZXhwIjoxNzM1NjMwNDI0LCJkZXB0X2lkIjoxMDMsImp0aSI6InNXQzVXaF8yWHFKWVEzXzZTczNtb2hoZDdNOCIsImVtYWlsIjoiYWRtaW5AMTYzLmNvbSJ9.icOM9hR-pxivGegd3h8mN3wV9OTqPR7Q9UeISbZ1T5W7AZUFPJUF2elf0Y8AQn_5OEZcU0rCtUZxr6hXyiBnQ5GwK7G1-zmUbVVJngiDjm49mBQ0GvJwzNTO3V4tfgv2hStUUTFZPeAy8d63P1eDGvB7U-9wT8UVrKvwTNEzBO91NZclirM45d2iXGe9iHY5MXUwS5xdWQLTOUQYvWVN7a9YVYxDPz0Trh0tC4IGk85-6_sqvejTwOKotaO-1raLOX-pxEvY8Eha1ZF38i6B-sNLU2m1mxH54n-KDgiZGjGQl-dHTFikz42fbwIBMAV5T00lQXVm2yImo3uj1jGClA",
          //     "expiresIn": 43199999,
          //     "jti": "zYg8LxrUAyCnqwuXLEAlyfWWTDA"
          //   }
          // }
            if (authorizeRes.code == 200) {
                ElMessage({ message: '登录成功', type: 'success' });
                // 保存token信息(先把token信息转换成json字符串)
                tokenStore.saveToken(JSON.stringify(authorizeRes.data));
                // 初始化权限列表
                permsStore.initPermList();
                // 对路由进行处理
                processRoutes();
                // 初始化所有的action meta
                actionMetasStore.initActions();
                // 跳转到首页
                router.push((route.query.redirect as string) || "/");

                // 建立连接
                const stompClient = StompClient.getInstance();
                stompClient.connect();
            }
        } else {
            let msg = loginRes.msg;
            ElMessage.error(msg);
        }
    }

    isLoading.value = false;
}
</script>

<template>
    <div class="login">
        <el-form :model="form" ref="formRef" :rules="rules" label-width="120px" label-position="top" size="large">
            <h2>登录</h2>
            <el-form-item label="用户名" prop="username">
                <el-input v-model="form.username" />
            </el-form-item>

            <el-form-item label="密码" prop="password">
                <el-input v-model="form.password" type="password" autocomplete="off" />
            </el-form-item>

            <el-form-item>
                <el-button type="primary" @click="onSubmit()" :loading="isLoading">登录</el-button>
            </el-form-item>
        </el-form>
    </div>
</template>

<style lang="scss" scoped>
.login {
    background-color: #ccc;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;

    .el-form {
        width: 300px;
        background: #fff;
        padding: 30px;
        border-radius: 10px;

        h2 {
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .el-form-item {
            margin-top: 20px;
        }

        .el-button {
            width: 100%;
            margin-top: 30px;
        }

    }
}
</style>
