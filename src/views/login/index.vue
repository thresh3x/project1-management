<template>
  <div class="common-layout">
    <el-container class="container">
      <el-aside class="aside" width="30%">
        <img src="../../assets/login/undraw_sign_up_n6im.svg" alt="login picture">
      </el-aside>
      <el-main class="wrapped">
        <img src="../../assets/login/undraw_raining_re_4b55.svg" alt="login icon">
        <span class="content">The blog management site of Xie</span>
        <el-tabs type="border-card">
          <el-tab-pane label="Login">
            <el-form ref="loginFormRef" :model="loginForm" status-icon label-width="80px" class="loginForm">
              <el-form-item label="Username" prop="username">
                <el-input v-model="loginForm.username" type="text" autocomplete="off" />
              </el-form-item>
              <el-form-item label="Password" prop="password">
                <el-input v-model="loginForm.password" type="password" autocomplete="off" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="submitForm(loginFormRef)"
                  style="width: 200%; margin-top: 10px; margin-left: -80px;">login</el-button>
              </el-form-item>
            </el-form></el-tab-pane>
          <el-tab-pane label="SignIn">
            <el-form ref="signFormRef" :model="signForm" status-icon :rules="registerRules" label-width="80px"
              class="signForm">
              <el-form-item label="Username" prop="username" required>
                <el-input v-model="signForm.username" type="text" autocomplete="off" />
              </el-form-item>
              <el-form-item label="Nickname" prop="nickname">
                <el-input v-model="signForm.nickname" type="text" autocomplete="off" />
              </el-form-item>
              <el-form-item label="Password" prop="password" required>
                <el-input v-model="signForm.password" type="password" autocomplete="off" />
              </el-form-item>
              <el-form-item label="Confirm" prop="confirmPassword" required>
                <el-input v-model="signForm.confirmPassword" type="password" autocomplete="off" />
              </el-form-item>
              <el-form-item label="Code" prop="code" required>
                <el-input v-model="signForm.code" type="text" autocomplete="off"
                  style="width: 100px; margin-right: 10px;" />
                <img @click="resetCode" :src="codeUrl" alt="code">
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="registerForm(signFormRef)"
                  style="width: 200%; margin-top: 10px; margin-left: -80px;">sign in</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang='ts'>
import { reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { User } from '@/project1-libcommon'
import { registerUser, loginUser, getOneUser } from '@/api/user'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const codeUrl = ref<string>('http://localhost:3000/user/code')

const resetCode = () => codeUrl.value = codeUrl.value + '?' + Math.random()

const router = useRouter()

const loginFormRef = ref<FormInstance>()

const loginForm = reactive({
  username: '',
  password: '',
})

const submitForm = async (formEl: FormInstance | undefined) => {
  const user: Partial<User> = {}
  user.username = loginForm.username
  user.password = loginForm.password
  const data = await loginUser(user)
  if (data.name) {
    ElMessage({
      showClose: true,
      message: data.message,
      type: 'error',
    })
  } else {
    ElMessage({
      showClose: true,
      message: "登录成功",
      type: 'success',
    })
    console.log(data);
    
    // const one:User = await getOneUser({keyWord: user.username})

    // const userToken = {
    //   username: one.username,
    //   nick_name: one.nick_name,
    //   role: one.role,
    // }
    
    localStorage.setItem('token', data.token)
    router.push('/home')
  }
}

const signForm = reactive({
  username: '',
  nickname: '',
  password: '',
  confirmPassword: '',
  code: ''
})

const signFormRef = ref<FormInstance>()

const registerForm = async (signEl: FormInstance | undefined) => {
  interface Register extends User {
    code: string
  }
  const user: Partial<Register> = {}
  user.username = signForm.username
  user.password = signForm.password
  user.nick_name = signForm.nickname
  user.code = signForm.code
  const res = await registerUser(user)
  console.log(res);

  switch (res.status) {
    case 0:
      ElMessage({
        showClose: true,
        message: res.message,
        type: 'success',
      })
      break
    default:
      ElMessage({
        showClose: true,
        message: res.message,
        type: 'error',
      })
      break
  }
}

const validate1 = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error(`Please input the ${rule.field}`))
  } else {
    if (value.length < 3 || value.length > 10) {
      callback(new Error(`${rule.field} length is 3 to 10`))
    } else {
      callback()
    }
  }
}

const validatePass = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('Please input the password again'))
  } else if (value !== signForm.password) {
    callback(new Error("Two inputs don't match!"))
  } else {
    callback()
  }
}

const registerRules = reactive<FormRules<typeof signForm>>({
  username: [{ validator: validate1, trigger: 'blur' }],
  password: [{ validator: validate1, trigger: 'blur' }],
  confirmPassword: [{ validator: validatePass, trigger: 'blur' }]
})

</script>

<style lang="scss" scoped>
.common-layout {
  height: 100%;

  .container {
    height: 100%;
    background-image: url(../../assets/login/bg.png);

    .aside {
      display: flex;
      flex-direction: column;
      justify-content: center;
      margin-left: 10%;
      transform: translateX(10%);
    }

    .wrapped {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      .content {
        font-size: 25px;
        color: gray;
        margin: 10px 0;
      }
    }
  }
}
</style>