<script setup lang="ts">
import { login, authorize } from "@/api/users";
import { useTokenStore } from "@/stores/token";
import { useRouter, useRoute } from "vue-router";
import type { FormInstance, FormRules } from 'element-plus'
import { processRoutes } from "@/api/router";
import { usePermsStore } from "@/stores/perms";
import { useActionMetasStore } from "@/stores/plugin";

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
        // let loginRes: any = await login(form);
        const loginRes = {code:200}
        if (loginRes.code == 200) {
            let authorizeRes = await authorize(loginRes.url);
            // const authorizeRes = {
            //     "msg": "获取token成功",
            //     "code": 200,
            //     "data": {
            //         "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX3R5cGUiOiIwMCIsInVzZXJfaWQiOjEsInVzZXJfbmFtZSI6ImFkbWluIiwic2NvcGUiOlsiYWxsIl0sIm5pY2tfbmFtZSI6IuiLpeS-nTEiLCJhdmF0YXIiOiIiLCJleHAiOjE3NDc0Njk1NzEsImRlcHRfaWQiOjEwMywiYXV0aG9yaXRpZXMiOlsiYWRtaW4iXSwianRpIjoieWFxVUNXZjlKaDFjNmJIX2tjRHZsVnVuUUFFIiwiY2xpZW50X2lkIjoiY2xpZW50MSIsImVtYWlsIjoiYWRtaW5AMTYzLmNvbSJ9.ThnIVsb5F-NFolnx3myDPofQYAIhX0bp3BeNfrMM9kZmQvZfMBDuyUoxEq5Ho4dhV3-NDXrYE13Dm1DXRXXsawsg4cYoOzgC1s-Zh1aoHpVW-GVvDXg5Sb_pxYnDjF3X8SfTih3ar5LZEjQtVSrW9_EOwfzST9vf2pHT_7sA_ZbKE8YjzrDxodGaeHVNnkz0jJscc5_siewcHXbnirRW1Jw-TzlVVb13RpOexgDA0RlrHkwWaj1PrbqpmcDhFkRdsxoYAScD9KYHb0J5iTLVzafx0nddFZ_OUFheNAZIOP7oLPkHHykUemFWqFGhlXwm3M7UYmdnEO4tLswGMAyfTA",
            //         "tokenType": "bearer",
            //         "refreshToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX25hbWUiOiJhZG1pbiIsImF2YXRhciI6IiIsImF1dGhvcml0aWVzIjpbImFkbWluIl0sImNsaWVudF9pZCI6ImNsaWVudDEiLCJ1c2VyX3R5cGUiOiIwMCIsInVzZXJfaWQiOjEsInNjb3BlIjpbImFsbCJdLCJhdGkiOiJ5YXFVQ1dmOUpoMWM2Ykhfa2NEdmxWdW5RQUUiLCJuaWNrX25hbWUiOiLoi6Xkvp0xIiwiZXhwIjoxNzMwMTg5NTcxLCJkZXB0X2lkIjoxMDMsImp0aSI6IkZ2SWkxXzF0U29qa1FkaDlvb19jRmlOQmRPNCIsImVtYWlsIjoiYWRtaW5AMTYzLmNvbSJ9.nHL5n465c1vQI2p-1MyMn74wu9paDJVG9-jN0MkDC1pE0fAJmSYhNJvUtIezRcApvVg_xz5ObOFM3n4E3C8ZX-xxRUrFIu38_58rD3hTY5zKIgt633p8W6n4XO6TAVQE1UTRsi7-mkX7blERd9Pmt_6kcNUvzV-kqKmFA9Sa_agE1CVojTObK3-C7fpOY3NCat_Of69GjPGKgjc0tR-cl6v2tftu3cpoBVU7UC0WANWz-Gxqz5Mz_IhCkBsc9IX077pWjegzsfm1-M2qDxuTbWzMEZgZr4XGvEnOrv9pHnxSyXsaEMK6-Rw7pfhdcsLmUJpQWc8eRygR-2kXQCGJEg",
            //         "expiresIn": 43199999,
            //         "jti": "yaqUCWf9Jh1c6bH_kcDvlVunQAE"
            //     }
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
