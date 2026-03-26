<template>
  <div class="page-card" style="padding: 24px">
    <div class="toolbar">
      <div class="toolbar-left">
        <el-input
          v-model="filters.keyword"
          placeholder="按名称或编码搜索"
          clearable
          style="width: 240px"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="resetFilters">
          <el-icon><RefreshRight /></el-icon>
          重置
        </el-button>
      </div>
      <div class="toolbar-right">
        <el-button type="primary" @click="openCreateDialog">
          <el-icon><Plus /></el-icon>
          新增分类
        </el-button>
      </div>
    </div>

    <el-table v-loading="loading" :data="pagedTableData" border>
      <el-table-column prop="name" label="分类名称" min-width="180" />
      <el-table-column prop="code" label="分类编码" min-width="180" />
      <el-table-column prop="sortOrder" label="排序值" width="100" />
      <el-table-column label="创建时间" min-width="180">
        <template #default="{ row }">
          {{ formatDateTime(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="更新时间" min-width="180">
        <template #default="{ row }">
          {{ formatDateTime(row.updatedAt) }}
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
      />
    </div>
  </div>

  <el-dialog
    v-model="dialogVisible"
    :title="dialogMode === 'create' ? '新增食谱分类' : '编辑食谱分类'"
    width="560px"
    destroy-on-close
    @closed="resetForm"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
      <el-form-item label="分类名称" prop="name">
        <el-input v-model="form.name" placeholder="例如：家常菜" />
      </el-form-item>
      <el-form-item label="分类编码" prop="code">
        <el-input v-model="form.code" placeholder="例如：homestyle" />
      </el-form-item>
      <el-form-item label="排序值" prop="sortOrder">
        <el-input-number v-model="form.sortOrder" :min="0" :max="9999" style="width: 100%" />
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
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, RefreshRight, Search } from '@element-plus/icons-vue'
import {
  createRecipeCategory,
  deleteRecipeCategory,
  fetchRecipeCategoryDetail,
  fetchRecipeCategoryList,
  updateRecipeCategory
} from '@/apis/admin'

const loading = ref(false)
const dialogVisible = ref(false)
const dialogMode = ref('create')
const submitting = ref(false)
const formRef = ref()
const tableData = ref([])

const filters = reactive({
  keyword: '',
  pageNum: 1,
  pageSize: 10
})

const form = reactive({
  id: null,
  name: '',
  code: '',
  sortOrder: 0
})

const rules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入分类编码', trigger: 'blur' }],
  sortOrder: [{ required: true, message: '请输入排序值', trigger: 'blur' }]
}

const total = computed(() => tableData.value.length)

const pagedTableData = computed(() => {
  const start = (filters.pageNum - 1) * filters.pageSize
  const end = start + filters.pageSize
  return tableData.value.slice(start, end)
})

function formatDateTime(value) {
  if (!value) {
    return '-'
  }
  return String(value).replace('T', ' ')
}

async function loadCategories() {
  loading.value = true
  try {
    tableData.value = await fetchRecipeCategoryList({
      keyword: filters.keyword || undefined
    })
    if ((filters.pageNum - 1) * filters.pageSize >= tableData.value.length) {
      filters.pageNum = 1
    }
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  filters.pageNum = 1
  loadCategories()
}

function resetFilters() {
  filters.keyword = ''
  filters.pageNum = 1
  loadCategories()
}

function resetForm() {
  form.id = null
  form.name = ''
  form.code = ''
  form.sortOrder = 0
}

function openCreateDialog() {
  dialogMode.value = 'create'
  resetForm()
  dialogVisible.value = true
}

async function openEditDialog(row) {
  dialogMode.value = 'edit'
  const detail = await fetchRecipeCategoryDetail(row.id)
  form.id = detail.id
  form.name = detail.name
  form.code = detail.code
  form.sortOrder = detail.sortOrder
  dialogVisible.value = true
}

async function submitForm() {
  await formRef.value.validate()
  submitting.value = true
  try {
    const payload = {
      name: form.name,
      code: form.code,
      sortOrder: Number(form.sortOrder)
    }

    if (dialogMode.value === 'create') {
      await createRecipeCategory(payload)
      ElMessage.success('新增分类成功')
    } else {
      await updateRecipeCategory(form.id, payload)
      ElMessage.success('更新分类成功')
    }

    dialogVisible.value = false
    loadCategories()
  } finally {
    submitting.value = false
  }
}

async function handleDelete(row) {
  await ElMessageBox.confirm(`确认删除分类「${row.name}」吗？`, '删除确认', {
    type: 'warning'
  })
  await deleteRecipeCategory(row.id)
  ElMessage.success('删除成功')
  loadCategories()
}

onMounted(loadCategories)
</script>
