<script setup lang="ts">
    import { login,authorize } from "@/api/users";
    import { useTokenStore } from "@/stores/token";
    import { useRouter,useRoute } from "vue-router";
    import type { FormInstance, FormRules } from 'element-plus'

    const tokenStore  = useTokenStore();
    const router = useRouter();
    const route = useRoute();

    const form = reactive({
        username : 'admin',
        password : '123456'
    });

    const rules = reactive<FormRules>({
        username: [
            { required: true, message: '请输入用户名', trigger: 'blur' },
            { min: 3, max: 50, message: '用户名的长度最小为3位,最大为50位', trigger: 'blur' },
        ],
        password :[
            { required: true, message: '请输入密码', trigger: 'blur' }
        ]
    });

    // 是否加载中
    const isLoading = ref(false);

    const formRef = ref<FormInstance>();
    async function onSubmit(){
        isLoading.value = true;

        let validate = await formRef.value?.validate()
        .catch((err:Error)=>{
            ElMessage({
                showClose: true,
                message: '表单验证失败',
                type: 'success',
            });
            isLoading.value = false;
            throw err;
        });

        if(validate){
            let loginRes:any = await login(form);
            if(loginRes.code == 200) {
                let  authorizeRes = await authorize(loginRes.url);
                if(authorizeRes.code == 200){
                    ElMessage({
                        showClose: true,
                        message: '登录成功',
                        type: 'success',
                    });
                    // 保存token信息(先把token信息转换成json字符串)
                    tokenStore.saveToken(JSON.stringify(authorizeRes.data));

                    // 跳转到首页
                    router.push( (route.query.redirect as string) || "/");
                }
            }else{
                let msg = loginRes.msg;
                ElMessage.error(msg);
            }
        }

        isLoading.value = false;
    }
</script>

<template>
    <div class="login">
        <el-form 
                 :model="form" 
                 ref="formRef"
                 :rules="rules"
                 label-width="120px" 
                 label-position="top" 
                 size="large">
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
</style>@/api/users