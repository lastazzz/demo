import { themeConfig } from './theme.ts'

export interface LayoutConfig {
  readonly mode: 'side' | 'top' | 'mix'
  readonly fixedHeader: boolean
  readonly fixedSidebar: boolean
  readonly sidebarWidth: number
  readonly contentWidth: 'fluid' | 'fixed'
  readonly showBreadcrumb: boolean
  readonly navTheme: 'light' | 'realDark'
  readonly colorPrimary: string
  readonly colorWeak: boolean
  readonly siderMenuType: 'sub' | 'group'
  readonly splitMenus: boolean
  readonly showHeader: boolean
  readonly showFooter: boolean
  readonly showMenu: boolean
  readonly showMenuHeader: boolean
}

export const layoutConfig: LayoutConfig = {
  mode: 'side',
  fixedHeader: false,
  fixedSidebar: true,
  sidebarWidth: 256,
  contentWidth: 'fluid',
  showBreadcrumb: true,
  navTheme: 'light',
  colorPrimary: themeConfig.token?.colorPrimary?.toUpperCase() ?? '#1677FF',
  colorWeak: false,
  siderMenuType: 'sub',
  splitMenus: true,
  showHeader: true,
  showFooter: true,
  showMenu: true,
  showMenuHeader: true,
}

export const sidebarWidthRange = { min: 180, max: 320, step: 4 }
