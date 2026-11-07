const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() || '/api'

function isValidApiBaseUrl(value: string): boolean {
  if (/\s|[?#]/.test(value)) return false
  if (value.startsWith('/') && !value.startsWith('//') && !value.includes('\\')) {
    return true
  }

  if (!/^https?:\/\//i.test(value)) return false

  try {
    const url = new URL(value)
    return !url.username && !url.password && !value.includes('\\')
  } catch {
    return false
  }
}

if (!isValidApiBaseUrl(apiBaseUrl)) {
  throw new Error(
    'VITE_API_BASE_URL 必须是以 / 开头的同源路径或完整 HTTP(S) 地址，不能包含凭据、查询参数或片段',
  )
}

export const envConfig = {
  apiBaseUrl,
} as const
