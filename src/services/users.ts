import { request } from './http.ts'
import type { UserListParams, UserListResponse, UserRow } from '@/types/users.ts'

function isUserRow(value: unknown): value is UserRow {
  return !!value && typeof value === 'object' &&
    'id' in value && typeof value.id === 'string' &&
    'username' in value && typeof value.username === 'string' &&
    'displayName' in value && typeof value.displayName === 'string' &&
    'status' in value && (value.status === 'active' || value.status === 'disabled')
}

export async function getUsers(params: UserListParams, signal?: AbortSignal): Promise<UserListResponse> {
  const response = await request({ url: '/users', params, signal, withCredentials: true })
  if (
    response && typeof response === 'object' &&
    'items' in response && Array.isArray(response.items) && response.items.every(isUserRow) &&
    'total' in response && typeof response.total === 'number' &&
    Number.isSafeInteger(response.total) && response.total >= response.items.length
  ) {
    return { items: response.items, total: response.total }
  }

  throw new Error('用户列表响应格式不正确')
}
