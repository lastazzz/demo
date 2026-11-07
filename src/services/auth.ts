import { queryOptions } from '@tanstack/react-query'
import { HttpError, request } from './http.ts'

interface LoginCredentials {
  username: string
  password: string
}

export interface AuthUser {
  id: string
  username: string
  displayName: string
  permissions: string[]
}

function parseUser(data: unknown): AuthUser {
  if (
    data && typeof data === 'object' &&
    'id' in data && typeof data.id === 'string' &&
    'username' in data && typeof data.username === 'string' &&
    'displayName' in data && typeof data.displayName === 'string'
  ) {
    const permissions = 'permissions' in data ? data.permissions : []
    if (Array.isArray(permissions) && permissions.every((item) => typeof item === 'string')) {
      return { id: data.id, username: data.username, displayName: data.displayName, permissions }
    }
  }

  throw new Error('认证接口响应格式不正确')
}

export async function login(credentials: LoginCredentials) {
  const data = await request<unknown, LoginCredentials>({
    method: 'POST',
    url: '/auth/login',
    data: credentials,
    withCredentials: true,
  })
  return parseUser(data)
}

export async function logout(): Promise<void> {
  await request({ method: 'POST', url: '/auth/logout', withCredentials: true })
}

export const sessionQuery = queryOptions({
  queryKey: ['auth', 'session'] as const,
  queryFn: async ({ signal }) => {
    try {
      const data = await request({ url: '/auth/me', signal, withCredentials: true })
      return parseUser(data)
    } catch (error) {
      if (error instanceof HttpError && error.status === 401) return null
      throw error
    }
  },
  retry: false,
})
