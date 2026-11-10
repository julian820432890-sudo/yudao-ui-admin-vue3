<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle" width="50%">
    <el-alert
      v-if="isSystemTenant && !isReadonly"
      title="系统租户可修改名称、联系人、手机和绑定域名；套餐、账号额度、过期时间和状态保留保护。"
      type="info"
      :closable="false"
      class="mb-16px"
    />
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      :disabled="isReadonly"
      label-width="80px"
    >
      <el-form-item label="租户名" prop="name">
        <el-input v-model="formData.name" placeholder="请输入租户名" />
      </el-form-item>
      <el-form-item label="租户套餐" prop="packageId">
        <el-input v-if="isReadonly || isSystemTenant" :model-value="packageName" readonly />
        <el-select v-else v-model="formData.packageId" clearable placeholder="请选择租户套餐">
          <el-option
            v-for="item in packageList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="联系人" prop="contactName">
        <el-input v-model="formData.contactName" placeholder="请输入联系人" />
      </el-form-item>
      <el-form-item label="联系手机" prop="contactMobile">
        <el-input v-model="formData.contactMobile" placeholder="请输入联系手机" />
      </el-form-item>
      <el-form-item v-if="formType === 'create'" label="用户名称" prop="username">
        <el-input v-model="formData.username" placeholder="请输入用户名称" />
      </el-form-item>
      <el-form-item v-if="formType === 'create'" label="用户密码" prop="password">
        <el-input
          v-model="formData.password"
          placeholder="请输入用户密码"
          show-password
          type="password"
        />
      </el-form-item>
      <el-form-item label="账号额度" prop="accountCount">
        <el-input-number
          v-model="formData.accountCount"
          :disabled="isSystemTenant"
          :min="0"
          controls-position="right"
          placeholder="请输入账号额度"
        />
      </el-form-item>
      <el-form-item label="过期时间" prop="expireTime">
        <el-date-picker
          v-model="formData.expireTime"
          :disabled="isSystemTenant"
          clearable
          placeholder="请选择过期时间"
          type="date"
          value-format="x"
        />
      </el-form-item>
      <el-form-item label="绑定域名" prop="websites">
        <el-input-tag
          v-model="formData.websites"
          placeholder="请输入绑定域名，按回车添加"
          class="w-full"
        />
      </el-form-item>
      <el-form-item label="租户状态" prop="status">
        <el-radio-group v-model="formData.status" :disabled="isSystemTenant">
          <el-radio
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :value="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button v-if="!isReadonly" :disabled="formLoading" type="primary" @click="submitForm">
        确 定
      </el-button>
      <el-button @click="dialogVisible = false">{{ isReadonly ? '关 闭' : '取 消' }}</el-button>
    </template>
  </Dialog>
</template>
<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import * as TenantApi from '@/api/system/tenant'
import { CommonStatusEnum } from '@/utils/constants'
import * as TenantPackageApi from '@/api/system/tenantPackage'
import { getTenantId } from '@/utils/auth'
import { checkPermi } from '@/utils/permission'

defineOptions({ name: 'SystemTenantForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗
const dialogVisible = ref(false) // 弹窗的是否展示
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref<'create' | 'update' | 'detail'>('detail')
const formData = ref({
  id: undefined,
  name: undefined,
  packageId: undefined,
  contactName: undefined,
  contactMobile: undefined,
  accountCount: undefined,
  expireTime: undefined,
  websites: [],
  status: CommonStatusEnum.ENABLE,
  // 新增专属
  username: undefined,
  password: undefined
})
const formRules = reactive({
  name: [{ required: true, message: '租户名不能为空', trigger: 'blur' }],
  packageId: [{ required: true, message: '租户套餐不能为空', trigger: 'blur' }],
  contactName: [{ required: true, message: '联系人不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '租户状态不能为空', trigger: 'blur' }],
  accountCount: [{ required: true, message: '账号额度不能为空', trigger: 'blur' }],
  expireTime: [{ required: true, message: '过期时间不能为空', trigger: 'blur' }],
  username: [{ required: true, message: '用户名称不能为空', trigger: 'blur' }],
  password: [{ required: true, message: '用户密码不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref
const packageList = ref([] as TenantPackageApi.TenantPackageVO[]) // 租户套餐
const canCreateTenants = computed(
  () => Number(getTenantId()) === 1 && checkPermi(['system:tenant:create'])
)
const canUpdateTenants = computed(
  () => Number(getTenantId()) === 1 && checkPermi(['system:tenant:update'])
)
const isSystemTenant = computed(
  () => formData.value.id !== undefined && formData.value.packageId === 0
)
const isReadonly = computed(() => {
  if (formType.value === 'detail') return true
  if (formType.value === 'update') return !canUpdateTenants.value
  return !canCreateTenants.value
})
const dialogTitle = computed(() => (isReadonly.value ? '租户详情' : t('action.' + formType.value)))
const packageName = computed(() => {
  const id = formData.value.packageId
  if (id === 0) return '系统租户'
  if (id === undefined || id === null) return ''
  return packageList.value.find((item) => item.id === id)?.name || `套餐（编号：${id}）`
})

/** 打开弹窗 */
const open = async (type: 'create' | 'update' | 'detail', id?: number) => {
  if (type === 'create' && !canCreateTenants.value) {
    return
  }
  formType.value = type
  resetForm()
  dialogVisible.value = true
  formLoading.value = true
  try {
    const [packages, tenant] = await Promise.all([
      TenantPackageApi.getTenantPackageList(),
      id ? TenantApi.getTenant(id) : Promise.resolve(undefined)
    ])
    packageList.value = packages
    if (tenant) formData.value = tenant
  } catch {
    // 请求失败时由统一拦截器提示，避免继续展示未完整加载的表单。
    dialogVisible.value = false
  } finally {
    formLoading.value = false
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  if (isReadonly.value) return
  // 校验表单
  if (!formRef) return
  const valid = await formRef.value.validate()
  if (!valid) return
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as TenantApi.TenantVO
    if (formType.value === 'create') {
      await TenantApi.createTenant(data)
      message.success(t('common.createSuccess'))
    } else {
      await TenantApi.updateTenant(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    name: undefined,
    packageId: undefined,
    contactName: undefined,
    contactMobile: undefined,
    accountCount: undefined,
    expireTime: undefined,
    websites: [],
    status: CommonStatusEnum.ENABLE,
    username: undefined,
    password: undefined
  }
  formRef.value?.resetFields()
}
</script>
