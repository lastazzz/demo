import type { UserListResponse, UserRow } from '../src/types/users.ts'

const users: UserRow[] = Array.from({ length: 34 }, (_, index) => {
  const suffix = String(index + 1).padStart(2, '0')
  return {
    id: `demo-user-${suffix}`,
    username: `user${suffix}`,
    displayName: `演示用户 ${suffix}`,
    status: index % 3 === 2 ? 'disabled' : 'active',
  }
})

export function listMockUsers(params: URLSearchParams):
  | { status: 200; data: UserListResponse }
  | { status: 400; data: { message: string } } {
  const page = Number(params.get('page') ?? '1')
  const pageSize = Number(params.get('pageSize') ?? '10')
  const keyword = (params.get('keyword') ?? '').trim().toLowerCase()
  const status = params.get('status')
  if (
    !Number.isSafeInteger(page) || page < 1 ||
    !Number.isSafeInteger(pageSize) || pageSize < 1 || pageSize > 100 ||
    (status && status !== 'active' && status !== 'disabled')
  ) {
    return { status: 400, data: { message: '分页或筛选参数无效' } }
  }

  const filtered = users.filter((user) =>
    (!status || user.status === status) &&
    (user.username.includes(keyword) || user.displayName.toLowerCase().includes(keyword)),
  )
  const start = (page - 1) * pageSize
  return {
    status: 200,
    data: { items: filtered.slice(start, start + pageSize), total: filtered.length },
  }
}
