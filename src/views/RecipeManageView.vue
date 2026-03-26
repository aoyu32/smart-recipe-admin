<template>
  <div class="page-card" style="padding: 24px">
    <div class="toolbar">
      <div class="toolbar-left">
        <el-input
          v-model="filters.keyword"
          placeholder="按食谱名称搜索"
          clearable
          style="width: 220px"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select
          v-model="filters.categoryId"
          placeholder="食谱分类"
          clearable
          style="width: 180px"
        >
          <el-option
            v-for="item in categoryOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
        <el-select v-model="filters.status" placeholder="上架状态" clearable style="width: 160px">
          <el-option label="上架" :value="1" />
          <el-option label="下架" :value="0" />
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
          新增食谱
        </el-button>
      </div>
    </div>

    <el-table v-loading="loading" :data="tableData" border>
      <el-table-column label="封面" width="100">
        <template #default="{ row }">
          <img v-if="row.image" :src="row.image" alt="cover" class="table-cover" />
          <div v-else class="empty-image">暂无图片</div>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="食谱名称" min-width="180" />
      <el-table-column label="分类" width="140">
        <template #default="{ row }">
          {{ row.categoryName || categoryMap[row.categoryId] || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="calories" label="热量(kcal)" width="110" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'">
            {{ row.status === 1 ? '上架' : '下架' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="互动数据" min-width="180">
        <template #default="{ row }">
          <div class="table-meta-inline">
            点赞 {{ row.likesCount || 0 }} / 收藏 {{ row.collectionsCount || 0 }} / 浏览
            {{ row.viewsCount || 0 }}
          </div>
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
        @current-change="loadRecipes"
        @size-change="loadRecipes"
      />
    </div>
  </div>

  <el-dialog
    v-model="dialogVisible"
    :title="dialogMode === 'create' ? '新增食谱' : '编辑食谱'"
    width="920px"
    destroy-on-close
    top="4vh"
    @closed="resetForm"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top" class="form-grid">
      <el-form-item label="食谱名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入食谱名称" />
      </el-form-item>
      <el-form-item label="食谱分类" prop="categoryId">
        <el-select v-model="form.categoryId" placeholder="请选择食谱分类" style="width: 100%">
          <el-option
            v-for="item in categoryOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="食谱图片" prop="image" class="form-grid-full">
        <div class="image-uploader">
          <img v-if="form.image" :src="form.image" alt="recipe" class="image-preview" />
          <div v-else class="image-preview-placeholder">上传后预览</div>
          <div style="display: flex; flex-direction: column; gap: 12px">
            <el-upload :show-file-list="false" :http-request="handleUploadRequest" accept="image/*">
              <el-button type="primary" :loading="uploadLoading">
                <el-icon><Upload /></el-icon>
                上传图片
              </el-button>
            </el-upload>
            <el-input v-model="form.image" placeholder="或直接填写图片 URL" style="width: 420px" />
          </div>
        </div>
      </el-form-item>

      <el-form-item label="热量(kcal)" prop="calories">
        <el-input-number v-model="form.calories" :min="0" :max="99999" style="width: 100%" />
      </el-form-item>
      <el-form-item label="上架状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio :value="1">上架</el-radio>
          <el-radio :value="0">下架</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="蛋白质(g)">
        <el-input-number
          v-model="form.protein"
          :min="0"
          :precision="1"
          :step="0.5"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="碳水(g)">
        <el-input-number
          v-model="form.carbs"
          :min="0"
          :precision="1"
          :step="0.5"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="脂肪(g)">
        <el-input-number
          v-model="form.fat"
          :min="0"
          :precision="1"
          :step="0.5"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="健康目标标签" class="form-grid-full">
        <el-select
          v-model="form.goalTags"
          multiple
          placeholder="请选择健康目标标签"
          style="width: 100%"
        >
          <el-option
            v-for="item in goalTagOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="食谱介绍" class="form-grid-full">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="4"
          placeholder="请输入食谱介绍"
        />
      </el-form-item>

      <el-form-item label="食材清单" class="form-grid-full">
        <div style="width: 100%">
          <div v-for="(item, index) in form.ingredients" :key="index" class="ingredient-row">
            <el-input v-model="item.name" placeholder="食材名称" />
            <el-input v-model="item.amount" placeholder="用量，例如 200g" />
            <el-button type="danger" plain @click="removeIngredient(index)">删除</el-button>
          </div>
          <el-button type="primary" plain @click="addIngredient">新增食材行</el-button>
        </div>
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
import { Plus, RefreshRight, Search, Upload } from '@element-plus/icons-vue'
import {
  createRecipe,
  deleteRecipe,
  fetchRecipeCategoryList,
  fetchRecipeDetail,
  fetchRecipeList,
  updateRecipe,
  uploadAdminImage
} from '@/apis/admin'

const loading = ref(false)
const dialogVisible = ref(false)
const dialogMode = ref('create')
const submitting = ref(false)
const uploadLoading = ref(false)
const total = ref(0)
const tableData = ref([])
const categoryOptions = ref([])
const formRef = ref()

const filters = reactive({
  keyword: '',
  status: '',
  categoryId: '',
  pageNum: 1,
  pageSize: 10
})

const form = reactive({
  id: null,
  name: '',
  image: '',
  categoryId: '',
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  status: 1,
  goalTags: [],
  description: '',
  ingredients: [{ name: '', amount: '' }]
})

const rules = {
  name: [{ required: true, message: '请输入食谱名称', trigger: 'blur' }],
  image: [{ required: true, message: '请上传食谱图片', trigger: 'change' }],
  categoryId: [{ required: true, message: '请选择食谱分类', trigger: 'change' }],
  calories: [{ required: true, message: '请输入热量', trigger: 'blur' }],
  status: [{ required: true, message: '请选择上架状态', trigger: 'change' }]
}

const goalTagOptions = [
  { label: '减脂', value: 'cut' },
  { label: '增脂', value: 'bulk' },
  { label: '增肌', value: 'muscle' },
  { label: '控糖', value: 'sugar' }
]

const categoryMap = computed(() => {
  return categoryOptions.value.reduce((acc, item) => {
    acc[item.id] = item.name
    return acc
  }, {})
})

function formatDateTime(value) {
  if (!value) {
    return '-'
  }
  return String(value).replace('T', ' ')
}

async function loadCategories() {
  categoryOptions.value = await fetchRecipeCategoryList()
}

async function loadRecipes() {
  loading.value = true
  try {
    const data = await fetchRecipeList({
      pageNum: filters.pageNum,
      pageSize: filters.pageSize,
      keyword: filters.keyword || undefined,
      status: filters.status === '' ? undefined : filters.status,
      categoryId: filters.categoryId || undefined
    })
    tableData.value = data.records
    total.value = Number(data.total || 0)
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  filters.pageNum = 1
  loadRecipes()
}

function resetFilters() {
  filters.keyword = ''
  filters.status = ''
  filters.categoryId = ''
  filters.pageNum = 1
  loadRecipes()
}

function resetForm() {
  form.id = null
  form.name = ''
  form.image = ''
  form.categoryId = ''
  form.calories = 0
  form.protein = 0
  form.carbs = 0
  form.fat = 0
  form.status = 1
  form.goalTags = []
  form.description = ''
  form.ingredients = [{ name: '', amount: '' }]
}

function openCreateDialog() {
  dialogMode.value = 'create'
  resetForm()
  dialogVisible.value = true
}

async function openEditDialog(row) {
  dialogMode.value = 'edit'
  const detail = await fetchRecipeDetail(row.id)
  form.id = detail.id
  form.name = detail.name
  form.image = detail.image
  form.categoryId = detail.categoryId
  form.calories = detail.calories
  form.protein = detail.protein ?? 0
  form.carbs = detail.carbs ?? 0
  form.fat = detail.fat ?? 0
  form.status = detail.status ?? 1
  form.goalTags = detail.goalTags || []
  form.description = detail.description || ''
  form.ingredients = detail.ingredients?.length ? detail.ingredients : [{ name: '', amount: '' }]
  dialogVisible.value = true
}

async function submitForm() {
  await formRef.value.validate()
  submitting.value = true
  try {
    const payload = {
      name: form.name,
      image: form.image,
      categoryId: form.categoryId,
      calories: Number(form.calories),
      protein: form.protein === '' ? null : Number(form.protein),
      carbs: form.carbs === '' ? null : Number(form.carbs),
      fat: form.fat === '' ? null : Number(form.fat),
      status: form.status,
      goalTags: form.goalTags,
      description: form.description,
      ingredients: form.ingredients.filter((item) => item.name || item.amount)
    }

    if (dialogMode.value === 'create') {
      await createRecipe(payload)
      ElMessage.success('新增食谱成功')
    } else {
      await updateRecipe(form.id, payload)
      ElMessage.success('更新食谱成功')
    }

    dialogVisible.value = false
    loadRecipes()
  } finally {
    submitting.value = false
  }
}

async function handleDelete(row) {
  await ElMessageBox.confirm(`确认删除食谱「${row.name}」吗？`, '删除确认', {
    type: 'warning'
  })
  await deleteRecipe(row.id)
  ElMessage.success('删除成功')
  if (tableData.value.length === 1 && filters.pageNum > 1) {
    filters.pageNum -= 1
  }
  loadRecipes()
}

function addIngredient() {
  form.ingredients.push({ name: '', amount: '' })
}

function removeIngredient(index) {
  if (form.ingredients.length === 1) {
    form.ingredients[0] = { name: '', amount: '' }
    return
  }
  form.ingredients.splice(index, 1)
}

async function handleUploadRequest({ file }) {
  uploadLoading.value = true
  try {
    const url = await uploadAdminImage(file)
    form.image = url
    ElMessage.success('图片上传成功')
  } finally {
    uploadLoading.value = false
  }
}

onMounted(async () => {
  await loadCategories()
  await loadRecipes()
})
</script>
