import { useEffect } from 'react'
import { isRouteErrorResponse, useRouteError } from 'react-router'
import { appConfig } from '@/config/app.ts'
import ErrorPage from '@/pages/ErrorPage.tsx'

export default function RouteErrorBoundary() {
  const error = useRouteError()
  const responseStatus = isRouteErrorResponse(error) ? error.status : undefined
  const status = responseStatus === 403 || responseStatus === 404 ? responseStatus : 500

  useEffect(() => {
    document.title = `${status} · ${appConfig.name}`
  }, [status])

  return <ErrorPage status={status} />
}
