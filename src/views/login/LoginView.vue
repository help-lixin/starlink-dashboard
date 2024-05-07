<script setup lang="ts">
// @ts-nocheck
// ts不检查该文件,否则,打包都不能通过

import { PASSPORT_SERVICE } from '@/utils/env'
import { login, authorize } from '@/api/users'
import { useTokenStore } from '@/stores/token'
import { useRouter, useRoute } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { processRoutes } from '@/api/router'
import { usePermsStore } from '@/stores/perms'
import { useActionMetasStore } from '@/stores/plugin'

import { registerPipelineEventHandler } from '@/utils/pipeline-event-handler'

const tokenStore = useTokenStore()
const permsStore = usePermsStore()
const router = useRouter()
const route = useRoute()
const actionMetasStore = useActionMetasStore()

const form = reactive({
  username: 'admin',
  password: '123456',
  captcha: undefined
})

const rules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 50, message: '用户名的长度最小为3位,最大为50位', trigger: 'blur' }
  ],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  captcha: [{ required: true, message: '验证码是必填项', trigger: 'blur' }]
})

// 是否加载中
const isLoading = ref(false)
const captchaUrl = ref('')

function getCaptcha() {
  captchaUrl.value = PASSPORT_SERVICE + '/captcha?' + new Date().getTime()
}

getCaptcha()

const formRef = ref<FormInstance>()

async function onSubmit() {
  isLoading.value = true

  let validate = await formRef.value?.validate().catch((err: Error) => {
    ElMessage({
      showClose: true,
      message: '表单验证失败',
      type: 'success'
    })
    isLoading.value = false
    throw err
  })

  if (validate) {
    try {
      let loginRes: any = await login(form)
      if (loginRes.code == 200) {
        // 保存token信息(先把token信息转换成json字符串)
        tokenStore.saveToken(JSON.stringify(loginRes.data))
        // 初始化权限列表
        await permsStore.initPermList()
        // 对路由进行处理
        await processRoutes()
        // 初始化所有的action meta
        await actionMetasStore.initActions()
        ElMessage({ message: '登录成功', type: 'success' })
        isLoading.value = false
        // 跳转到首页
        router.push((route.query.redirect as string) || '/')

        // 注册流水线事件监听
        registerPipelineEventHandler()
      } else {
        isLoading.value = false
        let msg = loginRes.msg
        ElMessage.error(msg)
      }
    } catch (e) {
      isLoading.value = false
    }

  } else {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="login">
    <div class="loginform">
      <span class="login-head">用户登录</span>
      <el-form :model="form" :rules="rules" ref="formRef" @submit.prevent="onSubmit">
        <el-form-item label="账户" prop="username" label-width="80px">
          <el-input v-model="form.username" class="input" clearable></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password" label-width="80px">
          <el-input v-model="form.password" class="input" show-password></el-input>
        </el-form-item>
        <el-row>
          <el-col :span="16">
            <el-form-item label="验证码" prop="captcha" label-width="80px">
              <el-input v-model="form.captcha" class="input"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <div class="verificationCode">
              <img :src="captchaUrl" @click="getCaptcha()" alt="验证码" />
            </div>
          </el-col>
        </el-row>

        <el-form-item>
          <el-form-item label="" label-width="80px">
            <el-button
              style="width: 200px"
              type="primary"
              native-type="submit"
              :loading="isLoading"
              :disabled="isLoading"
              >登入
            </el-button>
          </el-form-item>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login {
  position: fixed;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 1000px;
  /* z-index: -10; */
  zoom: 1;
  background-color: #fff;
  background: url(@/assets/loginimg/login1.jpg) no-repeat;
  background-size: cover;
  -webkit-background-size: cover;
  -o-background-size: cover;
  background-position: center 0;
}

.loginform {
  background-color: #fff;
  width: 500px;
  height: 460px;
  border: 1px solid #fff;
  border-radius: 5px;
  opacity: 0.9;

  .verificationCode {
    margin-left: 6px;
    height: 30px;
    margin-top: 29px;

    img {
      width: 100%;
      height: 100%;
      border: 1px solid #d6d6db;
      border-radius: 4px;
    }
  }
}

.login-head {
  font-size: 28px;
  display: block;
  width: 100%;
  text-align: center;
  padding-top: 20px;
  padding-bottom: 20px;
}

.el-form {
  width: 70%;
  margin-left: 10%;
}

.el-form-item {
  height: 50px;
  display: flex;
  align-items: center;
  /* background-color: blue; */
  padding-top: 20px;
  text-align: center;
}

/* .input >>> .el-input__inner {
  width: 70%;
  margin-left: 15%;
} */
.router-link {
  margin-left: 50%;
}
</style>
<style>
* {
  margin: 0;
  padding: 0;
}
</style>
