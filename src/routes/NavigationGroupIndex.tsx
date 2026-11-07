import { Navigate, useOutletContext } from 'react-router'
import type { AuthUser } from '@/services/auth.ts'
import { getAccessibleNavigation } from './navigation.ts'
import type { NavigationItem } from './navigation.ts'

export default function NavigationGroupIndex({ items }: { items: NavigationItem[] }) {
  const user = useOutletContext<AuthUser | null>()
  const firstPage = getAccessibleNavigation(items, user?.permissions ?? [])[0]
  return <Navigate to={firstPage?.path ?? '/403'} replace />
}
