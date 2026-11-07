import { createContext, useContext } from 'react'
import { layoutConfig, sidebarWidthRange } from '@/config/layout.ts'
import type { LayoutConfig } from '@/config/layout.ts'

const storageKey = 'justadmin:layout:v1'

interface LayoutPreferences {
  settings: LayoutConfig
  updateSettings: (settings: LayoutConfig) => void
  resetSettings: () => void
}

export const LayoutPreferencesContext = createContext<LayoutPreferences | null>(null)

export function useLayoutPreferences() {
  const preferences = useContext(LayoutPreferencesContext)
  if (!preferences) throw new Error('LayoutPreferencesContext is unavailable')
  return preferences
}

export function loadLayoutPreferences(): LayoutConfig {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(storageKey) ?? 'null')
    if (!saved || typeof saved !== 'object') return layoutConfig

    const values = saved as Record<string, unknown>
    const { mode, sidebarWidth, contentWidth, navTheme, colorPrimary, siderMenuType } = values
    const readFlag = (key: keyof LayoutConfig, fallback: boolean) => {
      const value = values[key]
      return typeof value === 'boolean' ? value : fallback
    }

    return {
      mode: mode === 'side' || mode === 'top' || mode === 'mix' ? mode : layoutConfig.mode,
      fixedHeader: readFlag('fixedHeader', layoutConfig.fixedHeader),
      fixedSidebar: readFlag('fixedSidebar', layoutConfig.fixedSidebar),
      sidebarWidth: typeof sidebarWidth === 'number' &&
        Number.isInteger(sidebarWidth) &&
        sidebarWidth >= sidebarWidthRange.min &&
        sidebarWidth <= sidebarWidthRange.max
        ? sidebarWidth
        : layoutConfig.sidebarWidth,
      contentWidth: contentWidth === 'fluid' || contentWidth === 'fixed'
        ? contentWidth
        : layoutConfig.contentWidth,
      showBreadcrumb: readFlag('showBreadcrumb', layoutConfig.showBreadcrumb),
      navTheme: navTheme === 'realDark' || navTheme === 'light' ? navTheme : layoutConfig.navTheme,
      colorPrimary: typeof colorPrimary === 'string' && /^#[0-9a-f]{6}$/i.test(colorPrimary)
        ? colorPrimary
        : layoutConfig.colorPrimary,
      colorWeak: readFlag('colorWeak', layoutConfig.colorWeak),
      siderMenuType: siderMenuType === 'sub' || siderMenuType === 'group'
        ? siderMenuType
        : layoutConfig.siderMenuType,
      splitMenus: readFlag('splitMenus', layoutConfig.splitMenus),
      showHeader: readFlag('showHeader', layoutConfig.showHeader),
      showFooter: readFlag('showFooter', layoutConfig.showFooter),
      showMenu: readFlag('showMenu', layoutConfig.showMenu),
      showMenuHeader: readFlag('showMenuHeader', layoutConfig.showMenuHeader),
    }
  } catch {
    return layoutConfig
  }
}

export function saveLayoutPreferences(settings?: LayoutConfig) {
  try {
    if (settings) localStorage.setItem(storageKey, JSON.stringify(settings))
    else localStorage.removeItem(storageKey)
  } catch {
    // Layout changes remain available for the current session when storage is blocked.
  }
}
