<template>
  <div class="page-card" style="padding: 24px">
    <div class="toolbar">
      <div class="toolbar-left">
        <el-input
          v-model="filters.keyword"
          placeholder="按邮箱或昵称搜索"
          clearable
          style="width: 240px"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="filters.status" placeholder="账号状态" clearable style="width: 160px">
          <el-option label="正常" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="resetFilters">
          <el-icon><RefreshRight /></el-icon>
          重置
        </el-button>
      </div>

      <div class="toolbar-right">
        <el-button type="primary" @click="openCreateDialog">
          <el-icon><Plus /></el-icon>
          新增用户
        </el-button>
      </div>
    </div>

    <el-table v-loading="loading" :data="tableData" border>
      <el-table-column label="头像" width="96">
        <template #default="{ row }">
          <el-avatar :src="row.avatar" :size="46">
            {{ row.nickname?.slice?.(0, 1) || '用' }}
          </el-avatar>
        </template>
      </el-table-column>
      <el-table-column prop="nickname" label="昵称" min-width="140" />
      <el-table-column prop="email" label="邮箱" min-width="220" />
      <el-table-column label="性别" width="90">
        <template #default="{ row }">
          {{ row.gender === 1 ? '男' : row.gender === 2 ? '女' : '未知' }}
        </template>
      </el-table-column>
      <el-table-column prop="birthday" label="生日" width="120" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'">
            {{ row.status === 1 ? '正常' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" min-width="180">
        <template #default="{ row }">
          {{ formatDateTime(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button link class="table-action-btn" @click="openEditDialog(row)">编辑</el-button>
          <el-button link class="table-action-btn table-action-danger" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div style="display: flex; justify-content: flex-end; margin-top: 18px">
      <el-pagination
        v-model:current-page="filters.pageNum"
        v-model:page-size="filters.pageSize"
        layout="total, sizes, prev, pager, next"
        :page-sizes="[10, 20, 30]"
        :total="total"
        @current-change="loadUsers"
        @size-change="loadUsers"
      />
    </div>
  </div>

  <el-dialog
    v-model="dialogVisible"
    :title="dialogMode === 'create' ? '新增用户' : '编辑用户'"
    width="720px"
    destroy-on-close
    @closed="resetForm"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="form-grid">
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" placeholder="请输入用户邮箱" />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input
          v-model="form.password"
          type="password"
          show-password
          :placeholder="dialogMode === 'create' ? '请输入登录密码' : '不修改可留空'"
        />
      </el-form-item>
      <el-form-item label="昵称">
        <el-input v-model="form.nickname" placeholder="留空则按邮箱自动生成" />
      </el-form-item>
      <el-form-item label="头像" class="form-grid-full">
        <div class="image-uploader">
          <img v-if="form.avatar" :src="form.avatar" alt="avatar" class="image-preview" />
          <div v-else class="image-preview-placeholder">上传后预览</div>
          <div style="display: flex; flex-direction: column; gap: 12px">
            <el-upload :show-file-list="false" :http-request="handleAvatarUpload" accept="image/*">
              <el-button type="primary" :loading="uploadLoading">
                <el-icon><Upload /></el-icon>
                上传头像
              </el-button>
            </el-upload>
            <div style="color: var(--sr-text-secondary); font-size: 13px">
              点击上传头像，建议尺寸为 1:1，大小不超过 2M
            </div>
          </div>
        </div>
      </el-form-item>
      <el-form-item label="性别" prop="gender">
        <el-radio-group v-model="form.gender">
          <el-radio :value="0">未知</el-radio>
          <el-radio :value="1">男</el-radio>
          <el-radio :value="2">女</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="生日">
        <el-date-picker
          v-model="form.birthday"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择生日"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="账号状态" prop="status" class="form-grid-full">
        <el-radio-group v-model="form.status">
          <el-radio :value="1">正常</el-radio>
          <el-radio :value="0">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">保存</el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, RefreshRight, Search, Upload } from '@element-plus/icons-vue'
import {
  createUser,
  deleteUser,
  fetchAdminProfile,
  fetchUserDetail,
  fetchUserList,
  updateUser,
  uploadAdminImage
} from '@/apis/admin'
import { getAdminUser, setAdminUser } from '@/utils/auth'

const loading = ref(false)
const dialogVisible = ref(false)
const dialogMode = ref('create')
const submitting = ref(false)
const uploadLoading = ref(false)
const tableData = ref([])
const total = ref(0)
const formRef = ref()

const filters = reactive({
  keyword: '',
  status: '',
  pageNum: 1,
  pageSize: 10
})

const form = reactive({
  id: null,
  email: '',
  password: '',
  nickname: '',
  avatar: '',
  gender: 0,
  birthday: '',
  status: 1
})

const rules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: ['blur', 'change'] }
  ],
  password: [
    {
      validator: (_, value, callback) => {
        if (dialogMode.value === 'create' && !value) {
          callback(new Error('请输入密码'))
          return
        }
        callback()
      },
      trigger: 'blur'
    }
  ],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  status: [{ required: true, message: '请选择账号状态', trigger: 'change' }]
}

function formatDateTime(value) {
  if (!value) {
    return '-'
  }
  return String(value).replace('T', ' ')
}

async function loadUsers() {
  loading.value = true
  try {
    const data = await fetchUserList({
      pageNum: filters.pageNum,
      pageSize: filters.pageSize,
      keyword: filters.keyword || undefined,
      status: filters.status === '' ? undefined : filters.status
    })
    tableData.value = data.records
    total.value = Number(data.total || 0)
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  filters.pageNum = 1
  loadUsers()
}

function resetFilters() {
  filters.keyword = ''
  filters.status = ''
  filters.pageNum = 1
  loadUsers()
}

function resetForm() {
  form.id = null
  form.email = ''
  form.password = ''
  form.nickname = ''
  form.avatar = ''
  form.gender = 0
  form.birthday = ''
  form.status = 1
}

function openCreateDialog() {
  dialogMode.value = 'create'
  resetForm()
  dialogVisible.value = true
}

async function openEditDialog(row) {
  dialogMode.value = 'edit'
  const detail = await fetchUserDetail(row.id)
  form.id = detail.id
  form.email = detail.email
  form.password = ''
  form.nickname = detail.nickname || ''
  form.avatar = detail.avatar || ''
  form.gender = detail.gender ?? 0
  form.birthday = detail.birthday || ''
  form.status = detail.status ?? 1
  dialogVisible.value = true
}

async function handleAvatarUpload({ file }) {
  uploadLoading.value = true
  try {
    const url = await uploadAdminImage(file)
    form.avatar = url
    ElMessage.success('头像上传成功')
  } finally {
    uploadLoading.value = false
  }
}

async function syncCurrentAdminProfile(editedUserId) {
  const currentAdmin = getAdminUser()
  if (!currentAdmin || String(currentAdmin.id) !== String(editedUserId)) {
    return
  }
  const profile = await fetchAdminProfile()
  setAdminUser({
    ...currentAdmin,
    ...profile,
    token: currentAdmin.token
  })
}

async function submitForm() {
  await formRef.value.validate()
  submitting.value = true
  try {
    const isEditMode = dialogMode.value === 'edit'
    const editingUserId = form.id
    const payload = {
      email: form.email,
      password: form.password || undefined,
      nickname: form.nickname,
      avatar: form.avatar,
      gender: form.gender,
      birthday: form.birthday || null,
      status: form.status
    }

    if (!isEditMode) {
      await createUser(payload)
      ElMessage.success('新增用户成功')
    } else {
      await updateUser(editingUserId, payload)
      await syncCurrentAdminProfile(editingUserId)
      ElMessage.success('更新用户成功')
    }

    dialogVisible.value = false
    loadUsers()
  } finally {
    submitting.value = false
  }
}

async function handleDelete(row) {
  await ElMessageBox.confirm(`确认删除用户“${row.nickname || row.email}”吗？`, '删除确认', {
    type: 'warning'
  })
  await deleteUser(row.id)
  ElMessage.success('删除成功')
  if (tableData.value.length === 1 && filters.pageNum > 1) {
    filters.pageNum -= 1
  }
  loadUsers()
}

onMounted(loadUsers)
</script>
