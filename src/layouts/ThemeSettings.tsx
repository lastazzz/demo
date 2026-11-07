import { SettingDrawer } from '@ant-design/pro-components/layout'
import { Button, Flex, InputNumber, Switch, message } from 'antd'
import { sidebarWidthRange } from '@/config/layout.ts'
import type { LayoutConfig } from '@/config/layout.ts'
import styles from './AdminLayout.module.css'
import { useLayoutPreferences } from './layoutPreferences.ts'

export default function ThemeSettings({ open, onOpenChange }: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { settings, updateSettings, resetSettings } = useLayoutPreferences()
  const [messages, messageHolder] = message.useMessage()

  async function copySettings() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(settings, null, 2))
      void messages.success('主题配置已复制')
    } catch {
      void messages.error('无法复制主题配置，请检查浏览器的剪贴板权限。')
    }
  }

  function applySettings(next: LayoutConfig) {
    if (Object.entries(next).some(([key, value]) => settings[key as keyof LayoutConfig] !== value)) {
      updateSettings(next)
    }
  }

  return (
    <>
      {messageHolder}
      <SettingDrawer
        prefixCls="justadmin-pro"
        collapse={open}
        onCollapseChange={onOpenChange}
        enableDarkTheme
        disableUrlParams
        hideHintAlert
        hideCopyButton
        settings={{
          layout: settings.mode,
          navTheme: settings.navTheme,
          colorPrimary: settings.colorPrimary,
          colorWeak: settings.colorWeak,
          siderMenuType: settings.siderMenuType,
          splitMenus: settings.splitMenus,
          contentWidth: settings.contentWidth === 'fixed' ? 'Fixed' : 'Fluid',
          fixedHeader: settings.fixedHeader,
          fixSiderbar: settings.fixedSidebar,
          headerRender: settings.showHeader ? undefined : false,
          footerRender: settings.showFooter ? undefined : false,
          menuRender: settings.showMenu ? undefined : false,
          menuHeaderRender: settings.showMenuHeader ? undefined : false,
        }}
        onSettingChange={(next) => applySettings({
          ...settings,
          mode: next.layout ?? settings.mode,
          navTheme: next.navTheme ?? settings.navTheme,
          colorPrimary: next.colorPrimary ?? settings.colorPrimary,
          colorWeak: next.colorWeak ?? settings.colorWeak,
          siderMenuType: next.siderMenuType ?? settings.siderMenuType,
          splitMenus: next.splitMenus ?? settings.splitMenus,
          contentWidth: next.contentWidth === 'Fixed' ? 'fixed' : 'fluid',
          fixedHeader: next.fixedHeader ?? settings.fixedHeader,
          fixedSidebar: next.fixSiderbar ?? settings.fixedSidebar,
          showHeader: next.headerRender !== false,
          showFooter: next.footerRender !== false,
          showMenu: next.menuRender !== false,
          showMenuHeader: next.menuHeaderRender !== false,
        })}
        drawerProps={{
          title: '主题设置',
          closable: true,
          size: 'min(360px, 100vw)',
          className: !settings.showHeader || settings.mode === 'mix'
            ? styles.hideFixedHeader
            : settings.mode === 'side' ? styles.hideDesktopFixedHeader : undefined,
          footer: (
            <>
              <div className={styles.optionRow}>
                <span id="theme-breadcrumb-label">显示面包屑</span>
                <Switch
                  aria-labelledby="theme-breadcrumb-label"
                  checked={settings.showBreadcrumb}
                  onChange={(showBreadcrumb) => updateSettings({ ...settings, showBreadcrumb })}
                />
              </div>
              {settings.mode !== 'top' && (
                <div className={styles.optionRow}>
                  <label htmlFor="theme-sidebar-width">侧栏宽度（px）</label>
                  <InputNumber
                    id="theme-sidebar-width"
                    size="small"
                    {...sidebarWidthRange}
                    precision={0}
                    value={settings.sidebarWidth}
                    onChange={(sidebarWidth) => {
                      if (sidebarWidth !== null) updateSettings({ ...settings, sidebarWidth })
                    }}
                  />
                </div>
              )}
              <Flex gap={8}>
                <Button type="primary" onClick={() => void copySettings()}>复制配置</Button>
                <Button onClick={resetSettings}>恢复默认</Button>
              </Flex>
            </>
          ),
        }}
      />
    </>
  )
}
