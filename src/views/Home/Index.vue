<script setup lang="ts">
import dayjs from 'dayjs'
import {
  OfficeBuilding,
  User,
  Connection,
  Checked,
  UserFilled,
  Search,
  Refresh,
  ArrowRight,
  Folder,
  SwitchButton,
  InfoFilled
} from '@element-plus/icons-vue'
import { BrandLogo } from '@/components/BrandLogo'
import { hasPermission } from '@/directives/permission/hasPermi'
import { usePermissionStore } from '@/store/modules/permission'
import * as DashboardApi from '@/api/system/dashboard'
import type {
  ManagementOverview,
  ManagementActivity,
  OverviewMember,
  OverviewOrganization,
  ActivityCategory,
  ActivityQuery
} from '@/api/system/dashboard'
import UserAssignRoleForm from '@/views/system/user/UserAssignRoleForm.vue'

defineOptions({ name: 'Index' })

const router = useRouter()
const permissionStore = usePermissionStore()
const message = useMessage()
const overview = ref<ManagementOverview>()
const activity = ref<ManagementActivity>()
const overviewLoading = ref(false)
const activityLoading = ref(false)
const overviewError = ref(false)
const activityError = ref(false)
const period = ref('month')
const filters = reactive({
  startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
  endDate: dayjs().format('YYYY-MM-DD'),
  system: 'all' as 'all' | 'system',
  keyword: ''
})
const appliedFilters = ref({ ...filters })
const activityCategory = ref<ActivityCategory>('opened')
const activityPage = ref(1)
const activityPageSize = 10
const activityDialog = ref(false)
const membersDialog = ref(false)
const membersMode = ref<'all' | 'unassigned' | 'organization'>('all')
const selectedOrganization = ref<OverviewOrganization>()
const memberKeyword = ref('')
const memberPage = ref(1)
const assignRoleForm = ref<InstanceType<typeof UserAssignRoleForm>>()
let activityRequestId = 0

const canOverview = computed(() =>
  ['system:user:query', 'system:dept:query', 'system:role:query'].every((p) => hasPermission([p]))
)
const canActivity = computed(() =>
  ['system:user:query', 'system:role:query', 'system:operate-log:query'].every((p) =>
    hasPermission([p])
  )
)
const mainOrganization = computed(() => overview.value?.organizations[0])
const independentOrganizations = computed(() => overview.value?.organizations.slice(1) ?? [])
const stats = computed(() => [
  {
    label: '子公司数量',
    value: overview.value?.companyCount,
    unit: '家',
    icon: OfficeBuilding,
    color: 'blue',
    hint: '按主组织下的直属组织数量统计',
    action: 'organization'
  },
  {
    label: '人员数量',
    value: overview.value?.userCount,
    unit: '人',
    icon: User,
    color: 'cyan',
    hint: '当前数据权限范围内的启用人员',
    action: 'members'
  },
  {
    label: '组织部门数量',
    value: overview.value?.deptCount,
    unit: '个',
    icon: Connection,
    color: 'orange',
    hint: '当前数据权限范围内的启用组织部门',
    action: 'organization'
  },
  {
    label: '角色数量',
    value: overview.value?.roleCount,
    unit: '个',
    icon: Checked,
    color: 'slate',
    hint: '当前租户下未删除的角色',
    action: 'roles'
  },
  {
    label: '未分配角色人员数量',
    value: overview.value?.unassignedCount,
    unit: '人',
    icon: UserFilled,
    color: 'blue',
    hint: '启用人员中没有分配有效角色的人员',
    action: 'unassigned'
  }
])
const activityCards = [
  { key: 'opened' as const, title: '系统账号开通', unit: '个', icon: User, color: 'blue' },
  {
    key: 'disabled' as const,
    title: '系统账号停用',
    unit: '个',
    icon: SwitchButton,
    color: 'orange'
  },
  { key: 'permission' as const, title: '角色权限变更', unit: '次', icon: Checked, color: 'slate' }
]
const currentActivityTitle = computed(
  () => activityCards.find((card) => card.key === activityCategory.value)?.title ?? ''
)
const periodLabel = computed(
  () => `${appliedFilters.value.startDate} 至 ${appliedFilters.value.endDate}`
)

// 只从服务器下发的可见菜单中寻找入口，不使用 404 通配路由判断权限。
const availableMenuPaths = computed(() => {
  const paths: string[] = []
  const visit = (nodes: AppRouteRecordRaw[], parent = '') => {
    for (const node of nodes) {
      if (node.meta?.hidden || /^https?:/.test(node.path)) continue
      const path = node.path.startsWith('/')
        ? node.path
        : `${parent}/${node.path}`.replace(/\/+/g, '/')
      if (node.children?.length) visit(node.children, path)
      else if (!path.includes(':')) paths.push(path)
    }
  }
  visit(permissionStore.getRouters)
  return paths
})
const systems = computed(() =>
  [
    {
      code: 'CRM',
      name: '客户关系管理',
      description: '客户资料、客户服务与在线业务',
      roots: ['/crm']
    },
    {
      code: 'PMS',
      name: '产品管理',
      description: '产品设计、业务类型与轨迹节点',
      roots: ['/pms/product']
    },
    { code: 'SCM', name: '供应链管理', description: '订单资源、供应商与合作管理', roots: ['/scm'] },
    { code: 'OMS', name: '订单管理', description: '订单接入、跟踪与业务处理', roots: ['/oms'] },
    { code: 'WMS', name: '仓储管理', description: '入库、库内、配载与中转', roots: ['/wms'] },
    { code: 'TMS', name: '运输管理', description: '运力、车辆、运输与派送', roots: ['/tms'] },
    { code: 'FMS', name: '财务管理', description: '应收应付、账单与结算', roots: ['/fms'] },
    { code: 'OTHER', name: '其他业务', description: '工单、轨迹及关务管理', roots: ['/oa'] },
    {
      code: '用户中心',
      name: '统一用户中心',
      description: '组织、人员、角色与权限管理',
      roots: ['/system/user', '/system']
    }
  ].map((system) => ({
    ...system,
    path: system.roots
      .map((root) =>
        availableMenuPaths.value.find((path) => path === root || path.startsWith(`${root}/`))
      )
      .find(Boolean)
  }))
)

const loadOverview = async () => {
  if (!canOverview.value) return
  overviewLoading.value = true
  overviewError.value = false
  try {
    overview.value = await DashboardApi.getManagementOverview()
  } catch {
    overviewError.value = true
  } finally {
    overviewLoading.value = false
  }
}
const loadActivity = async () => {
  if (!canActivity.value) return
  const requestId = ++activityRequestId
  activityLoading.value = true
  activityError.value = false
  const query: ActivityQuery = {
    ...appliedFilters.value,
    category: activityCategory.value,
    pageNo: activityPage.value,
    pageSize: activityPageSize
  }
  try {
    const result = await DashboardApi.getManagementActivity(query)
    if (requestId === activityRequestId) activity.value = result
  } catch {
    if (requestId === activityRequestId) activityError.value = true
  } finally {
    if (requestId === activityRequestId) activityLoading.value = false
  }
}
const queryActivity = async () => {
  if (!filters.startDate || !filters.endDate) return message.warning('请选择完整的日期范围')
  const days = dayjs(filters.endDate).diff(dayjs(filters.startDate), 'day')
  if (days < 0 || days > 366) return message.warning('日期范围须按先后顺序选择，且不能超过一年')
  appliedFilters.value = { ...filters, keyword: filters.keyword.trim() }
  activityPage.value = 1
  await loadActivity()
}
const setPeriod = async (value: string) => {
  period.value = value
  const now = dayjs()
  filters.startDate =
    value === 'week'
      ? now.subtract((now.day() + 6) % 7, 'day').format('YYYY-MM-DD')
      : value === 'quarter'
        ? now.subtract(2, 'month').startOf('month').format('YYYY-MM-DD')
        : now.startOf('month').format('YYYY-MM-DD')
  filters.endDate = now.format('YYYY-MM-DD')
  await queryActivity()
}
const resetFilters = async () => {
  filters.system = 'all'
  filters.keyword = ''
  await setPeriod('month')
}
const openActivity = async (category: ActivityCategory) => {
  activityCategory.value = category
  activityPage.value = 1
  activityDialog.value = true
  await loadActivity()
}
const collectOrganizationIds = (node: OverviewOrganization): number[] => [
  node.id,
  ...node.children.flatMap(collectOrganizationIds)
]
const filteredMembers = computed(() => {
  let rows = overview.value?.members ?? []
  if (membersMode.value === 'unassigned') rows = rows.filter((member) => !member.roles.length)
  if (membersMode.value === 'organization' && selectedOrganization.value) {
    const ids = new Set(collectOrganizationIds(selectedOrganization.value))
    rows = rows.filter((member) => member.deptId != null && ids.has(member.deptId))
  }
  const keyword = memberKeyword.value.trim().toLowerCase()
  return rows.filter((member) =>
    `${member.id} ${member.username} ${member.nickname} ${member.deptName} ${member.roles.join(' ')}`
      .toLowerCase()
      .includes(keyword)
  )
})
const memberRows = computed(() =>
  filteredMembers.value.slice((memberPage.value - 1) * 10, memberPage.value * 10)
)
const membersTitle = computed(() =>
  membersMode.value === 'unassigned'
    ? '未分配角色人员'
    : membersMode.value === 'organization'
      ? `${selectedOrganization.value?.name} · 成员分布`
      : '组织成员分布'
)
const openMembers = (mode: typeof membersMode.value, organization?: OverviewOrganization) => {
  membersMode.value = mode
  selectedOrganization.value = organization
  memberKeyword.value = ''
  memberPage.value = 1
  membersDialog.value = true
}
const handleStat = (action: string) => {
  if (!overview.value) return
  if (action === 'unassigned') return openMembers('unassigned')
  if (action === 'members' || action === 'organization') return openMembers('all')
  const path = availableMenuPaths.value.find((path) => path === '/system/role')
  if (path) router.push(path)
}
const handleAssignRole = (member: OverviewMember) => {
  // 复用用户管理的授权弹窗，保存时仍由原接口校验权限。
  assignRoleForm.value?.open(member)
}
const refreshOverview = async () => {
  await Promise.allSettled([loadOverview(), loadActivity()])
}
const formatDate = (date: string | number) => dayjs(date).format('YYYY-MM-DD HH:mm')
watch(memberKeyword, () => (memberPage.value = 1))
onMounted(refreshOverview)
</script>

<template>
  <main class="management-overview">
    <header class="overview-heading">
      <h1>管理概览</h1>
      <el-button text :loading="overviewLoading" :icon="Refresh" @click="refreshOverview"
        >刷新</el-button
      >
    </header>

    <el-alert v-if="overviewError" type="error" :closable="false" show-icon class="overview-alert">
      <template #title>概览数据加载失败，请点击刷新重试。</template>
    </el-alert>
    <el-alert
      v-else-if="!canOverview"
      type="info"
      :closable="false"
      show-icon
      class="overview-alert"
      title="当前账号暂未开放组织、人员和角色的综合统计权限。"
    />

    <section v-loading="overviewLoading" class="stat-grid" aria-label="管理统计">
      <article v-for="stat in stats" :key="stat.label" class="stat-card" :title="stat.hint">
        <div class="stat-copy">
          <span class="stat-label">{{ stat.label }}</span>
          <div class="stat-value"
            ><strong>{{ stat.value ?? '—' }}</strong
            ><span>{{ stat.unit }}</span></div
          >
        </div>
        <div class="stat-side">
          <span class="overview-icon" :class="`tone-${stat.color}`"
            ><el-icon :size="20"><component :is="stat.icon" /></el-icon
          ></span>
          <button
            v-if="stat.action === 'unassigned'"
            type="button"
            class="text-action"
            :disabled="!overview"
            @click="handleStat(stat.action)"
            >去处理</button
          >
        </div>
      </article>
    </section>

    <section class="overview-panel activity-panel" aria-labelledby="activity-heading">
      <div class="activity-top">
        <div>
          <h2 id="activity-heading">系统账号与角色权限统计</h2>
          <p class="section-caption">当前可见组织 · {{ periodLabel }}</p>
        </div>
        <div class="period-switch" aria-label="统计时间范围">
          <button
            v-for="option in [
              { value: 'week', label: '本周' },
              { value: 'month', label: '本月' },
              { value: 'quarter', label: '近3个月' }
            ]"
            :key="option.value"
            type="button"
            :class="{ active: period === option.value }"
            :aria-pressed="period === option.value"
            @click="setPeriod(option.value)"
            >{{ option.label }}</button
          >
        </div>
      </div>
      <form class="activity-filters" @submit.prevent="queryActivity">
        <label class="filter-field"
          ><span>开始日期</span
          ><el-date-picker
            v-model="filters.startDate"
            type="date"
            format="YYYY/MM/DD"
            value-format="YYYY-MM-DD"
            :clearable="false"
            aria-label="开始日期"
            @change="period = ''"
        /></label>
        <label class="filter-field"
          ><span>结束日期</span
          ><el-date-picker
            v-model="filters.endDate"
            type="date"
            format="YYYY/MM/DD"
            value-format="YYYY-MM-DD"
            :clearable="false"
            aria-label="结束日期"
            @change="period = ''"
        /></label>
        <label class="filter-field"
          ><span>系统</span
          ><el-select v-model="filters.system" aria-label="系统"
            ><el-option label="全部系统" value="all" /><el-option
              label="统一用户中心"
              value="system" /></el-select
        ></label>
        <label class="filter-field keyword-field"
          ><span>关键词</span
          ><el-input
            v-model="filters.keyword"
            placeholder="人员、编号、账号或角色"
            :maxlength="100"
            clearable
            aria-label="统计关键词"
        /></label>
        <div class="filter-actions"
          ><el-button
            native-type="submit"
            type="primary"
            :icon="Search"
            :loading="activityLoading"
            :disabled="!canActivity"
            >查询</el-button
          ><el-button :icon="Refresh" @click="resetFilters">重置</el-button></div
        >
      </form>
      <div v-loading="activityLoading" class="activity-grid">
        <button
          v-for="card in activityCards"
          :key="card.key"
          type="button"
          class="activity-card"
          :class="`tone-${card.color}`"
          :disabled="!canActivity || activityError"
          @click="openActivity(card.key)"
        >
          <span class="overview-icon" :class="`tone-${card.color}`"
            ><el-icon :size="21"><component :is="card.icon" /></el-icon
          ></span>
          <span class="activity-copy"
            ><span>{{ card.title }}</span
            ><span class="activity-value"
              ><strong>{{
                canActivity && !activityError ? (activity?.[card.key] ?? '—') : '—'
              }}</strong
              ><small>{{ card.unit }}</small></span
            ></span
          >
          <span class="detail-link"
            >查看明细<el-icon :size="12"><ArrowRight /></el-icon
          ></span>
        </button>
      </div>
      <p v-if="activityError" class="activity-note error-note">统计数据加载失败，请重新查询。</p>
      <p v-else-if="!canActivity" class="activity-note"
        >当前账号未开放账号与操作日志综合统计权限。</p
      >
      <p v-else class="activity-note"
        ><el-icon><InfoFilled /></el-icon
        >账号开通按当前可见账号的创建日期统计；停用和权限变更按已记录操作统计，历史未留痕操作不回补。</p
      >
    </section>

    <div class="overview-bottom">
      <section
        v-loading="overviewLoading"
        class="overview-panel organization-panel"
        aria-labelledby="organization-heading"
      >
        <div class="panel-heading"
          ><h2 id="organization-heading">组织架构</h2
          ><button
            type="button"
            class="text-action"
            :disabled="!overview"
            @click="openMembers('all')"
            >查看成员分布<el-icon><ArrowRight /></el-icon></button
        ></div>
        <div v-if="mainOrganization" class="organization-chart">
          <button
            type="button"
            class="organization-root"
            @click="openMembers('organization', mainOrganization)"
          >
            <BrandLogo mark-only class="organization-logo" /><span
              ><strong>{{ mainOrganization.name }}</strong
              ><small>主组织 · 启用 {{ mainOrganization.memberCount }} 人</small></span
            >
          </button>
          <div
            v-if="mainOrganization.children.length"
            class="organization-branches"
            :style="{ '--branch-count': Math.min(mainOrganization.children.length, 4) }"
          >
            <button
              v-for="branch in mainOrganization.children"
              :key="branch.id"
              type="button"
              class="organization-branch"
              @click="openMembers('organization', branch)"
            >
              <el-icon :size="23"><OfficeBuilding /></el-icon><strong>{{ branch.name }}</strong
              ><small>{{ branch.deptCount }} 个部门 · 启用 {{ branch.memberCount }} 人</small>
            </button>
          </div>
          <template v-if="independentOrganizations.length">
            <div class="organization-divider"></div>
            <div class="organization-root independent-root"
              ><el-icon :size="29"><OfficeBuilding /></el-icon
              ><span
                ><strong>独立组织</strong
                ><small
                  >其他直属组织 · 启用
                  {{ independentOrganizations.reduce((sum, node) => sum + node.memberCount, 0) }}
                  人</small
                ></span
              ></div
            >
            <div
              class="organization-branches independent-branches"
              :style="{ '--branch-count': Math.min(independentOrganizations.length, 3) }"
            >
              <button
                v-for="branch in independentOrganizations"
                :key="branch.id"
                type="button"
                class="organization-branch"
                @click="openMembers('organization', branch)"
                ><el-icon :size="23"><Folder /></el-icon><strong>{{ branch.name }}</strong
                ><small
                  >启用 <b>{{ branch.memberCount }}</b> 人</small
                ></button
              >
            </div>
          </template>
          <p class="organization-note"
            >仅统计当前租户及数据权限范围内的启用人员和组织；上级组织人数包含下级。子公司数量按主组织直属组织统计。</p
          >
        </div>
        <el-empty
          v-else
          :description="
            overviewError
              ? '组织数据加载失败'
              : canOverview
                ? '暂无启用组织，请先维护部门信息'
                : '暂无可查看的组织统计'
          "
          :image-size="88"
        />
      </section>

      <section class="overview-panel systems-panel" aria-labelledby="systems-heading">
        <div class="panel-heading"><h2 id="systems-heading">业务系统展示</h2></div>
        <div class="systems-grid">
          <button
            v-for="system in systems"
            :key="system.code"
            type="button"
            class="system-tile"
            :class="{ 'system-unavailable': !system.path }"
            :disabled="!system.path"
            :title="system.path ? `进入${system.name}` : '当前账号暂未开放此业务入口'"
            @click="system.path && router.push(system.path)"
          >
            <span class="system-code" :class="{ 'system-code-long': system.code.length > 4 }">{{
              system.code
            }}</span
            ><span class="system-copy"
              ><strong>{{ system.name }}</strong
              ><small>{{ system.description }}</small></span
            ><el-icon v-if="system.path" class="system-arrow"><ArrowRight /></el-icon>
          </button>
        </div>
        <p class="systems-note">业务入口按当前账号的菜单权限开放</p>
      </section>
    </div>

    <el-dialog
      v-model="activityDialog"
      :title="`${currentActivityTitle} · 明细`"
      width="880px"
      class="overview-dialog"
      destroy-on-close
    >
      <p class="dialog-caption"
        >统一用户中心 · {{ periodLabel
        }}<span v-if="appliedFilters.keyword"> · 关键词：{{ appliedFilters.keyword }}</span></p
      >
      <el-table
        v-loading="activityLoading"
        :data="activity?.page.list ?? []"
        empty-text="该时间范围内暂无符合条件的记录"
      >
        <el-table-column label="时间" width="162"
          ><template #default="{ row }">{{ formatDate(row.createTime) }}</template></el-table-column
        >
        <el-table-column prop="subject" label="账号 / 操作" min-width="180" show-overflow-tooltip />
        <el-table-column prop="action" label="操作明细" min-width="220" show-overflow-tooltip />
        <el-table-column
          v-if="activityCategory !== 'opened'"
          prop="operator"
          label="操作人"
          width="120"
        />
      </el-table>
      <el-pagination
        v-model:current-page="activityPage"
        class="overview-pagination"
        :page-size="activityPageSize"
        :total="activity?.page.total ?? 0"
        layout="total, prev, pager, next"
        @current-change="loadActivity"
      />
    </el-dialog>

    <el-dialog
      v-model="membersDialog"
      :title="membersTitle"
      width="900px"
      class="overview-dialog"
      destroy-on-close
    >
      <div class="member-filter"
        ><el-input
          v-model="memberKeyword"
          :prefix-icon="Search"
          placeholder="搜索姓名、账号、部门或角色"
          clearable
          aria-label="搜索成员"
        /><span>共 {{ filteredMembers.length }} 位启用人员</span></div
      >
      <el-table :data="memberRows" empty-text="暂无符合条件的人员">
        <el-table-column prop="id" label="编号" width="76" />
        <el-table-column prop="nickname" label="姓名" min-width="120" show-overflow-tooltip />
        <el-table-column prop="username" label="账号" min-width="130" show-overflow-tooltip />
        <el-table-column prop="deptName" label="所属部门" min-width="130" show-overflow-tooltip />
        <el-table-column label="角色" min-width="155"
          ><template #default="{ row }"
            ><span v-if="row.roles.length">{{ row.roles.join('、') }}</span
            ><el-tag v-else type="warning" size="small">未分配角色</el-tag></template
          ></el-table-column
        >
        <el-table-column
          v-if="hasPermission(['system:permission:assign-user-role'])"
          label="操作"
          width="100"
          ><template #default="{ row }"
            ><el-button link type="primary" @click="handleAssignRole(row)"
              >分配角色</el-button
            ></template
          ></el-table-column
        >
      </el-table>
      <el-pagination
        v-model:current-page="memberPage"
        class="overview-pagination"
        :page-size="10"
        :total="filteredMembers.length"
        layout="total, prev, pager, next"
      />
    </el-dialog>
    <UserAssignRoleForm ref="assignRoleForm" @success="refreshOverview" />
  </main>
</template>

<style scoped src="./management-overview.css"></style>
