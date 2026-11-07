import { appConfig } from '@/config/app.ts'
import { hasPermission, readUsersPermission } from '@/auth/permissions.ts'

export interface NavigationItem {
  path: string
  name: string
  pageTitle?: string
  hideInMenu?: boolean
  permission?: string
  description?: string
  children?: NavigationItem[]
}

export const homeNavigation: NavigationItem = {
  path: appConfig.homePath,
  name: '首页',
  description: appConfig.description,
}

export const exampleOverview: NavigationItem = {
  path: '/examples/overview',
  name: '概览',
  description: '演示一级分组与子菜单的联动。',
}

export const exampleDetails: NavigationItem = {
  path: '/examples/details',
  name: '详情',
  description: '演示子页面直达和刷新后的导航状态。',
  permission: 'examples:details:read',
}

export const userManagement: NavigationItem = {
  path: '/users',
  name: '用户管理',
  permission: readUsersPermission,
}

export const navigation: NavigationItem[] = [
  homeNavigation,
  userManagement,
  {
    path: '/examples',
    name: '布局示例',
    children: [exampleOverview, exampleDetails],
  },
]

export function getAccessibleNavigation(
  items: NavigationItem[],
  permissions: readonly string[],
): NavigationItem[] {
  return items.flatMap((item) => {
    if (!hasPermission(permissions, item.permission)) return []
    if (!item.children?.length) return [item]
    const children = getAccessibleNavigation(item.children, permissions)
    return children.length ? [{ ...item, children }] : []
  })
}
