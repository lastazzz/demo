import type { ReactNode } from 'react'
import { useOutletContext } from 'react-router'
import type { AuthUser } from '@/services/auth.ts'
import { hasPermission } from './permissions.ts'

export default function PermissionGate({ permission, children }: {
  permission?: string
  children: ReactNode
}) {
  const user = useOutletContext<AuthUser | null>()
  return hasPermission(user?.permissions ?? [], permission) ? children : null
}
