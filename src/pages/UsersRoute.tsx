import { lazy, Suspense } from 'react'
import { Spin } from 'antd'

const UsersPage = lazy(() => import('./UsersPage.tsx'))

export default function UsersRoute() {
  return (
    <Suspense fallback={<Spin aria-label="正在加载用户管理" />}>
      <UsersPage />
    </Suspense>
  )
}
