import request from '@/config/axios'

export interface OverviewMember {
  id: number
  username: string
  nickname: string
  deptId?: number
  deptName: string
  createTime: string | number
  roles: string[]
}

export interface OverviewOrganization {
  id: number
  name: string
  memberCount: number
  directMemberCount: number
  deptCount: number
  children: OverviewOrganization[]
}

export interface ManagementOverview {
  companyCount: number
  userCount: number
  deptCount: number
  roleCount: number
  unassignedCount: number
  organizations: OverviewOrganization[]
  members: OverviewMember[]
}

export type ActivityCategory = 'opened' | 'disabled' | 'permission'

export interface ActivityQuery {
  startDate: string
  endDate: string
  system: 'all' | 'system'
  keyword: string
  category: ActivityCategory
  pageNo: number
  pageSize: number
}

export interface ActivityItem {
  id: number
  createTime: string | number
  subject: string
  action: string
  operator: string
}

export interface ManagementActivity {
  opened: number
  disabled: number
  permission: number
  page: { list: ActivityItem[]; total: number }
}

export const getManagementOverview = () =>
  request.get<ManagementOverview>({ url: '/system/dashboard/overview' })

export const getManagementActivity = (params: ActivityQuery) =>
  request.get<ManagementActivity>({ url: '/system/dashboard/activity', params })
