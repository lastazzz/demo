import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import '@/config/env.ts'
import AppProviders from '@/app/AppProviders.tsx'
import { appConfig } from '@/config/app.ts'

document.title = appConfig.name
document
  .querySelector<HTMLMetaElement>('meta[name="description"]')
  ?.setAttribute('content', appConfig.description)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders />
  </StrictMode>,
)
