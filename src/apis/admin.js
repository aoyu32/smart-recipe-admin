import request from '@/utils/request'

export function loginAdmin(data) {
  return request({
    url: '/admin/auth/login',
    method: 'post',
    data,
  })
}

export function fetchAdminProfile() {
  return request({
    url: '/admin/auth/profile',
    method: 'get',
  })
}

export function fetchUserList(params) {
  return request({
    url: '/admin/users/list',
    method: 'get',
    params,
  })
}

export function fetchUserDetail(userId) {
  return request({
    url: `/admin/users/${userId}`,
    method: 'get',
  })
}

export function createUser(data) {
  return request({
    url: '/admin/users',
    method: 'post',
    data,
  })
}

export function updateUser(userId, data) {
  return request({
    url: `/admin/users/${userId}`,
    method: 'put',
    data,
  })
}

export function deleteUser(userId) {
  return request({
    url: `/admin/users/${userId}`,
    method: 'delete',
  })
}

export function fetchRecipeCategoryList(params) {
  return request({
    url: '/admin/recipe-categories/list',
    method: 'get',
    params,
  })
}

export function fetchRecipeCategoryDetail(categoryId) {
  return request({
    url: `/admin/recipe-categories/${categoryId}`,
    method: 'get',
  })
}

export function createRecipeCategory(data) {
  return request({
    url: '/admin/recipe-categories',
    method: 'post',
    data,
  })
}

export function updateRecipeCategory(categoryId, data) {
  return request({
    url: `/admin/recipe-categories/${categoryId}`,
    method: 'put',
    data,
  })
}

export function deleteRecipeCategory(categoryId) {
  return request({
    url: `/admin/recipe-categories/${categoryId}`,
    method: 'delete',
  })
}

export function fetchRecipeList(params) {
  return request({
    url: '/admin/recipes/list',
    method: 'get',
    params,
  })
}

export function fetchRecipeDetail(recipeId) {
  return request({
    url: `/admin/recipes/${recipeId}`,
    method: 'get',
  })
}

export function createRecipe(data) {
  return request({
    url: '/admin/recipes',
    method: 'post',
    data,
  })
}

export function updateRecipe(recipeId, data) {
  return request({
    url: `/admin/recipes/${recipeId}`,
    method: 'put',
    data,
  })
}

export function deleteRecipe(recipeId) {
  return request({
    url: `/admin/recipes/${recipeId}`,
    method: 'delete',
  })
}

export function uploadAdminImage(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: '/admin/file/upload/image',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}
