import { fileURLToPath, URL } from 'node:url'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig, loadEnv } from 'vite'
import { mockAuth } from './mock/auth.ts'

// https://vite.dev/config/
export default defineConfig(({ command, mode, isPreview }) => {
  const env = command === 'serve' && !isPreview
    ? loadEnv(mode, process.cwd(), ['API_PROXY_', 'MOCK_AUTH_', 'VITE_API_BASE_URL'])
    : {}
  const proxyTarget = env.API_PROXY_TARGET?.trim()
  const mockEnabled = env.MOCK_AUTH_ENABLED?.trim() === 'true'

  if (mockEnabled) {
    if (proxyTarget) {
      throw new Error('启用 Mock 认证时请清空 API_PROXY_TARGET')
    }
    const baseUrl = env.VITE_API_BASE_URL?.trim() || '/api'
    if (baseUrl !== '/api' && baseUrl !== '/api/') {
      throw new Error('启用 Mock 认证时 VITE_API_BASE_URL 必须使用同源 /api')
    }
  }

  if (proxyTarget) {
    let target: URL
    try {
      target = new URL(proxyTarget)
    } catch {
      throw new Error('API_PROXY_TARGET 必须是有效的 HTTP(S) 源地址，例如 http://localhost:8080')
    }

    if (
      !/^https?:\/\//i.test(proxyTarget) || proxyTarget.includes('\\') ||
      !['http:', 'https:'].includes(target.protocol) ||
      target.pathname !== '/' || target.search || target.hash ||
      target.username || target.password
    ) {
      throw new Error('API_PROXY_TARGET 只允许 HTTP(S) 源地址，不能包含路径、凭据、查询参数或片段')
    }
  }

  return {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    plugins: [
      react(),
      babel({ presets: [reactCompilerPreset()] }),
      mockEnabled && mockAuth(),
    ],
    server: {
      proxy: proxyTarget ? {
        '^/api(?:/|[?]|$)': {
          target: proxyTarget,
          changeOrigin: true,
        },
      } : undefined,
    },
  }
})
