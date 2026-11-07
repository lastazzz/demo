import { useEffect, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Alert, Button, Form, Input, Typography } from 'antd'
import { useLocation, useNavigate } from 'react-router'
import { appConfig } from '@/config/app.ts'
import { login, sessionQuery } from '@/services/auth.ts'
import { HttpError } from '@/services/http.ts'

const title = '登录'

function getReturnPath(state: unknown) {
  if (state && typeof state === 'object' && 'returnTo' in state &&
    typeof state.returnTo === 'string' && state.returnTo.startsWith('/') &&
    URL.canParse(state.returnTo, window.location.origin)) {
    const url = new URL(state.returnTo, window.location.origin)
    if (url.origin === window.location.origin && !url.pathname.startsWith('//') &&
      url.pathname.replace(/\/+$/, '').toLowerCase() !== '/login') {
      return url.pathname + url.search + url.hash
    }
  }

  return appConfig.homePath
}

export default function LoginPage() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const submitting = useRef(false)
  const mutation = useMutation({
    mutationFn: login,
    gcTime: 0,
    onSuccess: () => queryClient.removeQueries({ queryKey: sessionQuery.queryKey }),
    onSettled: () => { submitting.current = false },
  })

  const error = mutation.error
  const errorMessage = error instanceof HttpError
    ? error.status === 401 ? '账号或密码错误' : error.message
    : '登录失败，请稍后重试'

  useEffect(() => {
    document.title = `${title} · ${appConfig.name}`
  }, [])

  return (
    <section aria-labelledby="login-title">
      <Typography.Title id="login-title" level={1}>{title}</Typography.Title>
      <Form<Parameters<typeof login>[0]>
        layout="vertical"
        requiredMark={false}
        onFinish={(credentials) => {
          if (submitting.current) return
          submitting.current = true
          mutation.mutate(credentials, {
            onSuccess: () => { void navigate(getReturnPath(state), { replace: true }) },
          })
        }}
      >
        {mutation.isError && <Alert type="error" title={errorMessage} showIcon />}
        <Form.Item name="username" label="账号" rules={[{ required: true, whitespace: true, message: '请输入账号' }]}>
          <Input autoComplete="username" disabled={mutation.isPending} />
        </Form.Item>
        <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
          <Input.Password autoComplete="current-password" disabled={mutation.isPending} />
        </Form.Item>
        <Button block type="primary" htmlType="submit" loading={mutation.isPending}>登录</Button>
      </Form>
    </section>
  )
}
