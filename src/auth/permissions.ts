export const readUsersPermission = 'users:read'

export function hasPermission(permissions: readonly string[], required?: string): boolean {
  return required === undefined || permissions.includes(required)
}
