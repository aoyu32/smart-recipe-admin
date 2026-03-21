const TOKEN_KEY = 'sr-admin-token'
const USER_KEY = 'sr-admin-user'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || ''
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export function getAdminUser() {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) {
    return null
  }
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function setAdminUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  window.dispatchEvent(new CustomEvent('admin-user-updated', { detail: user }))
}

export function clearAdminUser() {
  localStorage.removeItem(USER_KEY)
  window.dispatchEvent(new CustomEvent('admin-user-updated', { detail: null }))
}

export function clearAuth() {
  clearToken()
  clearAdminUser()
}

export function isLoggedIn() {
  return Boolean(getToken())
}
