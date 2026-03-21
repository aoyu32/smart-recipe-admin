import { createRouter, createWebHashHistory } from 'vue-router'
import { isLoggedIn } from '@/utils/auth'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { title: '管理员登录', public: true },
  },
  {
    path: '/',
    component: () => import('@/views/AdminLayout.vue'),
    redirect: '/users',
    children: [
      {
        path: 'users',
        name: 'users',
        component: () => import('@/views/UserManageView.vue'),
        meta: { title: '用户管理' },
      },
      {
        path: 'recipe-categories',
        name: 'recipe-categories',
        component: () => import('@/views/RecipeCategoryManageView.vue'),
        meta: { title: '食谱分类管理' },
      },
      {
        path: 'recipes',
        name: 'recipes',
        component: () => import('@/views/RecipeManageView.vue'),
        meta: { title: '食谱信息管理' },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  if (to.meta.public) {
    if (to.path === '/login' && isLoggedIn()) {
      next('/users')
      return
    }
    next()
    return
  }

  if (!isLoggedIn()) {
    next('/login')
    return
  }

  next()
})

export default router
