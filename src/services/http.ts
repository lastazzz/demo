import axios from 'axios'
import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import { envConfig } from '@/config/env.ts'

type HttpErrorKind = 'http' | 'timeout' | 'network' | 'cancelled' | 'unexpected'

export class HttpError extends Error {
  readonly kind: HttpErrorKind
  readonly status?: number

  constructor(kind: HttpErrorKind, message: string, cause: unknown, status?: number) {
    super(message, { cause })
    this.name = 'HttpError'
    this.kind = kind
    this.status = status
  }
}

const http = axios.create({
  baseURL: envConfig.apiBaseUrl,
  timeout: 10_000,
})

function normalizeError(error: unknown): HttpError {
  if (axios.isCancel(error)) {
    return new HttpError('cancelled', '请求已取消', error)
  }

  if (axios.isAxiosError(error)) {
    if (error.response) {
      const { status } = error.response
      return new HttpError('http', `请求失败（HTTP ${status}）`, error, status)
    }

    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return new HttpError('timeout', '请求超时，请稍后重试', error)
    }

    if (error.code === 'ERR_NETWORK' || error.request) {
      return new HttpError('network', '无法连接服务器，请检查网络后重试', error)
    }
  }

  return new HttpError('unexpected', '请求无法完成', error)
}

export async function request<T = unknown, D = unknown>(config: AxiosRequestConfig<D>): Promise<T> {
  try {
    const response = await http.request<T, AxiosResponse<T>, D>(config)
    return response.data
  } catch (error) {
    throw normalizeError(error)
  }
}
