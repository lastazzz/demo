import { useQuery } from '@tanstack/react-query'
import { Button, Result, Spin } from 'antd'
import { Navigate, Outlet, useLocation, useMatches } from 'react-router'
import { hasPermission } from '@/auth/permissions.ts'
import { sessionQuery } from '@/services/auth.ts'

export default function RequireSession() {
  const { pathname, search, hash } = useLocation()
  const session = useQuery(sessionQuery)
  const matches = useMatches()

  if (session.isError) {
    return (
      <Result
        status="error"
        title="暂时无法验证登录状态"
        subTitle="请检查网络连接，或稍后重试。"
        extra={
          <Button type="primary" loading={session.isFetching} onClick={() => void session.refetch()}>
            重试
          </Button>
        }
      />
    )
  }

  if (session.isPending || (session.data === null && session.isFetching)) {
    return <Spin fullscreen aria-label="正在验证登录状态" />
  }

  if (!session.data) {
    return <Navigate to="/login" replace state={{ returnTo: pathname + search + hash }} />
  }

  const permissions = session.data.permissions
  const isForbidden = matches.some(({ handle }) =>
    handle && typeof handle === 'object' && 'permission' in handle &&
    typeof handle.permission === 'string' && !hasPermission(permissions, handle.permission),
  )
  if (isForbidden) return <Navigate to="/403" replace />

  return <Outlet context={session.data} />
}
