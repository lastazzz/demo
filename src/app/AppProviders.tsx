import { useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConfigProvider, theme } from 'antd'
import { layoutConfig } from '@/config/layout.ts'
import type { LayoutConfig } from '@/config/layout.ts'
import { RouterProvider } from 'react-router/dom'
import { themeConfig } from '@/config/theme.ts'
import { router } from '@/routes/index.tsx'
import {
  LayoutPreferencesContext,
  loadLayoutPreferences,
  saveLayoutPreferences,
} from '@/layouts/layoutPreferences.ts'

const queryClient = new QueryClient()

function AppProviders() {
  const [settings, setSettings] = useState(loadLayoutPreferences)

  useEffect(() => {
    document.body.style.filter = settings.colorWeak ? 'invert(80%)' : ''
  }, [settings.colorWeak])

  function updateSettings(next: LayoutConfig) {
    setSettings(next)
    saveLayoutPreferences(next)
  }

  function resetSettings() {
    setSettings(layoutConfig)
    saveLayoutPreferences()
  }

  return (
    <LayoutPreferencesContext value={{ settings, updateSettings, resetSettings }}>
      <ConfigProvider theme={{
        ...themeConfig,
        algorithm: settings.navTheme === 'realDark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: { ...themeConfig.token, colorPrimary: settings.colorPrimary },
      }}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider
            router={router}
            onError={(error) => {
              if (import.meta.env.DEV) console.error(error)
            }}
          />
        </QueryClientProvider>
      </ConfigProvider>
    </LayoutPreferencesContext>
  )
}

export default AppProviders
