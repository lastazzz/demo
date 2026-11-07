import { createBrowserRouter, Link } from 'react-router'
import type { RouteObject } from 'react-router'
import PermissionGate from '@/auth/PermissionGate.tsx'
import AdminLayout from '@/layouts/AdminLayout.tsx'
import AuthLayout from '@/layouts/AuthLayout.tsx'
import ErrorPage from '@/pages/ErrorPage.tsx'
import LoginPage from '@/pages/LoginPage.tsx'
import RoutePage from '@/pages/RoutePage.tsx'
import UsersRoute from '@/pages/UsersRoute.tsx'
import { exampleDetails, exampleOverview, navigation, userManagement } from '@/routes/navigation.ts'
import type { NavigationItem } from '@/routes/navigation.ts'
import RouteErrorBoundary from './RouteErrorBoundary.tsx'
import RequireSession from './RequireSession.tsx'
import NavigationGroupIndex from './NavigationGroupIndex.tsx'

function createPageRoutes(items: NavigationItem[]): RouteObject[] {
  return items.map(({ path, name, pageTitle, description, permission, children }): RouteObject => {
    const handle = { breadcrumb: name, title: pageTitle ?? name, permission }
    if (children?.length) {
      return {
        path,
        handle,
        children: [
          { index: true, element: <NavigationGroupIndex items={children} /> },
          ...createPageRoutes(children),
        ],
      }
    }

    if (path === userManagement.path) {
      return { path, handle: { ...handle, listPage: true }, Component: UsersRoute }
    }

    return {
      path,
      handle,
      element: (
        <RoutePage title={name} description={description}>
          {path === exampleOverview.path && (
            <PermissionGate permission={exampleDetails.permission}>
              <Link to={exampleDetails.path}>查看详情</Link>
            </PermissionGate>
          )}
        </RoutePage>
      ),
    }
  })
}

export const router = createBrowserRouter([
  {
    Component: AuthLayout,
    ErrorBoundary: RouteErrorBoundary,
    children: [{ path: '/login', Component: LoginPage }],
  },
  {
    Component: RequireSession,
    ErrorBoundary: RouteErrorBoundary,
    children: [{ Component: AdminLayout, children: createPageRoutes(navigation) }],
  },
  {
    Component: AdminLayout,
    ErrorBoundary: RouteErrorBoundary,
    children: [
      {
        path: '/403',
        handle: { breadcrumb: '无权访问', title: '403 无权访问' },
        element: <ErrorPage status={403} />,
      },
      {
        path: '*',
        handle: { breadcrumb: '页面不存在', title: '404 页面不存在' },
        element: <ErrorPage status={404} />,
      },
    ],
  },
])
