<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Lock, User } from '@element-plus/icons-vue'
import logoUrl from '@/assets/logo.png'
import { loginAdmin } from '@/apis/admin'
import { setAdminUser, setToken } from '@/utils/auth'

const router = useRouter()
const loading = ref(false)
const formRef = ref()

const form = reactive({
  username: 'admin@spxz.com',
  password: '123456',
})

const rules = {
  username: [{ required: true, message: '请输入管理员账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入管理员密码', trigger: 'blur' }],
}

async function handleLogin() {
  await formRef.value.validate()
  loading.value = true
  try {
    const data = await loginAdmin(form)
    setToken(data.token)
    setAdminUser(data)
    ElMessage.success('登录成功')
    router.push('/users')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-bg login-bg-left"></div>
    <div class="login-bg login-bg-right"></div>

    <div class="login-card page-card">
      <div class="login-brand">
        <img :src="logoUrl" alt="logo" class="login-logo" />
        <div>
          <div class="login-system"><span style="color: #037E44;">食推</span><span style="color: #F97804;">小智</span>后台管理系统</div>
          <div class="login-desc">个性化食谱推荐微信小程序统一信息维护平台</div>
        </div>
      </div>

      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" size="large" @keyup.enter="handleLogin">
        <el-form-item label="管理员账号" prop="username">
          <el-input v-model="form.username" placeholder="请输入管理员账号">
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="管理员密码" prop="password">
          <el-input v-model="form.password" type="password" show-password placeholder="请输入管理员密码">
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-button type="primary" size="large" class="login-button" :loading="loading" @click="handleLogin">
          登录后台
        </el-button>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  position: relative;
  min-height: 100vh;
  display: grid;
  place-items: center;
  overflow: hidden;
  padding: 24px;
}

.login-bg {
  position: absolute;
  border-radius: 999px;
  filter: blur(4px);
}

.login-bg-left {
  left: -120px;
  top: -60px;
  width: 420px;
  height: 420px;
  background: radial-gradient(circle, rgba(182, 207, 153, 0.55) 0%, rgba(182, 207, 153, 0) 72%);
}

.login-bg-right {
  right: -140px;
  bottom: -120px;
  width: 480px;
  height: 480px;
  background: radial-gradient(circle, rgba(111, 140, 85, 0.28) 0%, rgba(111, 140, 85, 0) 72%);
}

.login-card {
  position: relative;
  z-index: 1;
  width: min(100%, 460px);
  padding: 34px 32px;
}

.login-brand {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 28px;
}

.login-logo {
  width: 54px;
  height: 72px;
  border-radius: 20px;
  background: #f3f7ec;
  box-shadow: 0 10px 22px rgba(112, 141, 88, 0.12);
}

.login-system {
  font-size: 28px;
  font-weight: 700;
  color: var(--sr-text);
}

.login-desc {
  margin-top: 8px;
  line-height: 1.7;
  color: var(--sr-text-secondary);
  font-size: 14px;
}

.login-button {
  width: 100%;
  margin-top: 8px;
  height: 48px;
}
</style>
