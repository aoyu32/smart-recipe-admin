import axios from 'axios'
import { ElMessage } from 'element-plus'
import { clearAuth, getToken } from './auth'

const request = axios.create({
  baseURL: '/api',
  timeout: 20000,
})

request.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

request.interceptors.response.use(
  (response) => {
    const { code, message, data } = response.data
    if (code === 200) {
      return data
    }
    ElMessage.error(message || '请求失败')
    if (code === 401 || code === 403) {
      clearAuth()
      if (window.location.hash !== '#/login') {
        window.location.hash = '#/login'
      }
    }
    return Promise.reject(new Error(message || '请求失败'))
  },
  (error) => {
    const message = error.response?.data?.message || error.message || '网络请求失败'
    ElMessage.error(message)
    if (error.response?.status === 401 || error.response?.status === 403) {
      clearAuth()
      if (window.location.hash !== '#/login') {
        window.location.hash = '#/login'
      }
    }
    return Promise.reject(error)
  },
)

export default request
