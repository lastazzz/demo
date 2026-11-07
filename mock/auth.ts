import { randomUUID } from 'node:crypto'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'
import { hasPermission, readUsersPermission } from '../src/auth/permissions.ts'
import { listMockUsers } from './users.ts'

const loginPath = '/api/auth/login'
const userPath = '/api/auth/me'
const logoutPath = '/api/auth/logout'
const usersPath = '/api/users'
const cookieName = 'justadmin_mock_session'
const sessionLifetimeSeconds = 3_600
const demoUsers = [
  { id: 'demo-admin', username: 'admin', displayName: '演示管理员', permissions: ['examples:details:read', readUsersPermission] },
  { id: 'demo-viewer', username: 'viewer', displayName: '只读用户', permissions: [readUsersPermission] },
]

function sendJson(res: ServerResponse, status: number, data: unknown) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(data))
}

function sessionCookie(sessionId: string, maxAge: number, path = '/api') {
  return `${cookieName}=${sessionId}; Path=${path}; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`
}

// Remove the older auth-only cookie so it cannot shadow the wider session cookie.
const clearLegacySessionCookie = sessionCookie('', 0, '/api/auth')

function readSessionId(req: IncomingMessage) {
  return req.headers.cookie?.split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${cookieName}=`))
    ?.slice(cookieName.length + 1)
}

async function readJson(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = []
  let size = 0

  for await (const chunk of req.iterator({ destroyOnReturn: false })) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk))
    size += buffer.length
    if (size > 8_192) {
      req.resume()
      throw new RangeError('Mock login body is too large')
    }
    chunks.push(buffer)
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

export function mockAuth(): Plugin {
  const sessions = new Map<string, { user: typeof demoUsers[number]; expiresAt: number }>()

  return {
    name: 'justadmin-mock-auth',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const path = req.url?.split('?', 1)[0]
        if (path !== loginPath && path !== userPath && path !== logoutPath && path !== usersPath) {
          next()
          return
        }

        res.setHeader('Cache-Control', 'no-store')
        const method = path === userPath || path === usersPath ? 'GET' : 'POST'
        if (req.method !== method) {
          res.setHeader('Allow', method)
          sendJson(res, 405, { message: '请求方法不受支持' })
          return
        }

        const sessionId = readSessionId(req)
        if (path === logoutPath) {
          if (sessionId) sessions.delete(sessionId)
          res.setHeader('Set-Cookie', [sessionCookie('', 0), clearLegacySessionCookie])
          res.writeHead(204).end()
          return
        }

        const now = Date.now()
        if (path === userPath || path === usersPath) {
          const session = sessionId ? sessions.get(sessionId) : undefined
          if (!session || session.expiresAt <= now) {
            if (sessionId) sessions.delete(sessionId)
            sendJson(res, 401, { message: '请先登录或重新登录' })
          } else if (path === userPath) {
            sendJson(res, 200, session.user)
          } else if (!hasPermission(session.user.permissions, readUsersPermission)) {
            sendJson(res, 403, { message: '没有查看用户列表的权限' })
          } else {
            const params = new URL(req.url ?? usersPath, 'http://localhost').searchParams
            const result = listMockUsers(params)
            sendJson(res, result.status, result.data)
          }
          return
        }

        let body: unknown
        try {
          body = await readJson(req)
        } catch (error) {
          if (res.destroyed) return
          if (error instanceof RangeError) {
            sendJson(res, 413, { message: '请求体过大' })
          } else {
            sendJson(res, 400, { message: '请求体必须是有效的 JSON' })
          }
          return
        }

        const username = body && typeof body === 'object' && 'username' in body ? body.username : undefined
        const user = demoUsers.find((account) => account.username === username)
        if (!user || !body || typeof body !== 'object' || !('password' in body) || body.password !== 'demo123') {
          sendJson(res, 401, { message: '账号或密码错误' })
          return
        }

        if (sessionId) sessions.delete(sessionId)
        for (const [id, { expiresAt }] of sessions) {
          if (expiresAt <= now) sessions.delete(id)
        }
        const newSessionId = randomUUID()
        sessions.set(newSessionId, { user, expiresAt: now + sessionLifetimeSeconds * 1_000 })
        res.setHeader('Set-Cookie', [sessionCookie(newSessionId, sessionLifetimeSeconds), clearLegacySessionCookie])
        sendJson(res, 200, user)
      })
    },
  }
}
