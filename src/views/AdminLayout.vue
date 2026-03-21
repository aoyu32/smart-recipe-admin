<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Collection, Dish, SwitchButton, User } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import logoUrl from '@/assets/logo.png'
import { fetchAdminProfile } from '@/apis/admin'
import { clearAuth, getAdminUser, setAdminUser } from '@/utils/auth'

const route = useRoute()
const router = useRouter()

const adminUser = ref(getAdminUser())
const pageTitle = computed(() => route.meta.title || '后台管理')

const menus = [
  { path: '/users', label: '用户管理', icon: User },
  { path: '/recipe-categories', label: '食谱分类管理', icon: Collection },
  { path: '/recipes', label: '食谱信息管理', icon: Dish },
]

function syncAdminUser(event) {
  adminUser.value = event?.detail ?? getAdminUser()
}

async function loadAdminProfile(showError = false) {
  try {
    const profile = await fetchAdminProfile()
    setAdminUser({
      ...getAdminUser(),
      ...profile,
      token: getAdminUser()?.token,
    })
  } catch (error) {
    if (showError) {
      ElMessage.error(error.message || '获取管理员信息失败')
    }
  }
}

function logout() {
  clearAuth()
  router.push('/login')
}

onMounted(() => {
  window.addEventListener('admin-user-updated', syncAdminUser)
  loadAdminProfile()
})

onUnmounted(() => {
  window.removeEventListener('admin-user-updated', syncAdminUser)
})
</script>

<template>
  <el-container class="layout-shell">
    <el-aside class="layout-aside" width="248px">
      <div class="brand-block">
        <img :src="logoUrl" alt="logo" class="brand-logo" />
        <div>
          <div class="brand-title"><span style="color: #037E44;">食谱</span><span style="color: #F97804;">小智</span></div>
          <div class="brand-subtitle">后台管理系统</div>
        </div>
      </div>

      <el-menu :default-active="route.path" class="layout-menu" router>
        <el-menu-item v-for="item in menus" :key="item.path" :index="item.path">
          <el-icon><component :is="item.icon" /></el-icon>
          <span>{{ item.label }}</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container class="layout-main-wrap">
      <el-header class="layout-header">
        <div class="layout-header-title">
          {{ pageTitle }}
        </div>

        <div class="layout-user">
          <el-avatar :src="adminUser?.avatar" :size="40">
            {{ adminUser?.name?.slice?.(0, 1) || '管' }}
          </el-avatar>
          <div class="layout-user-meta">
            <div class="layout-user-name">{{ adminUser?.name || '管理员' }}</div>
            <div class="layout-user-role">系统管理员</div>
          </div>
          <el-button text type="danger" @click="logout">
            <el-icon><SwitchButton /></el-icon>
            退出
          </el-button>
        </div>
      </el-header>

      <el-main class="layout-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.layout-shell {
  min-height: 100vh;
}

.layout-aside {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 20;
  overflow-y: auto;
  padding: 22px 18px;
  background: linear-gradient(180deg, #f4f8ef 0%, #e9f1df 100%);
  border-right: 1px solid rgba(182, 207, 153, 0.45);
}

.brand-block {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: inset 0 0 0 1px rgba(182, 207, 153, 0.32);
}

.brand-logo {
  width: 48px;
  height: 54px;
  border-radius: 16px;
  object-fit: contain;
}

.brand-title {
  font-size: 18px;
  font-weight: 700;
}

.brand-subtitle {
  margin-top: 4px;
  color: var(--sr-text-secondary);
  font-size: 12px;
}

.layout-menu {
  margin-top: 22px;
  border-right: none;
  background: transparent;
}

:deep(.el-menu-item) {
  height: 52px;
  margin-bottom: 8px;
  border-radius: 16px;
  color: var(--sr-text);
}

:deep(.el-menu-item.is-active) {
  background: linear-gradient(90deg, rgba(182, 207, 153, 0.95) 0%, rgba(182, 207, 153, 0.72) 100%);
  color: #fff;
}

.layout-main-wrap {
  margin-left: 248px;
  min-width: 0;
  min-height: 100vh;
}

.layout-header {
  position: fixed;
  top: 0;
  left: 248px;
  right: 0;
  z-index: 15;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  height: auto;
  padding: 28px 0 10px 28px;
  background: linear-gradient(180deg, #f7f9f4 0%, #eff5e8 100%);
  backdrop-filter: blur(10px);
}

.layout-header-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--sr-text);
  line-height: 1.2;
}

.layout-user {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(182, 207, 153, 0.35);
}

.layout-user-meta {
  min-width: 0;
}

.layout-user-name {
  font-weight: 700;
}

.layout-user-role {
  margin-top: 4px;
  color: var(--sr-text-secondary);
  font-size: 12px;
}

.layout-main {
  padding: 132px 28px 28px;
}

@media (max-width: 1080px) {
  .layout-header {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
