export type UserStatus = 'active' | 'disabled'

export interface UserRow {
  id: string
  username: string
  displayName: string
  status: UserStatus
}

export interface UserListParams {
  page: number
  pageSize: number
  keyword?: string
  status?: UserStatus
}

export interface UserListResponse {
  items: UserRow[]
  total: number
}
