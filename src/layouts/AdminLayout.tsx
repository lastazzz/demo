import { useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { ProLayout, RouteContext } from '@ant-design/pro-components/layout'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Avatar, Breadcrumb, Button, Dropdown, message, theme } from 'antd'
import { Link, Outlet, useLocation, useMatches, useNavigate, useOutletContext } from 'react-router'
import { appConfig } from '@/config/app.ts'
import { getAccessibleNavigation, homeNavigation, navigation } from '@/routes/navigation.ts'
import { logout } from '@/services/auth.ts'
import type { AuthUser } from '@/services/auth.ts'
import styles from './AdminLayout.module.css'
import ThemeSettings from './ThemeSettings.tsx'
import { useLayoutPreferences } from './layoutPreferences.ts'

function MenuLink({ path, children, onMobileSelect }: {
  path: string
  children: ReactNode
  onMobileSelect: () => void
}) {
  const { isMobile } = useContext(RouteContext)

  return (
    <Link
      to={path}
      onClick={(event) => {
        if (isMobile && !event.metaKey && !event.ctrlKey && !event.altKey && !event.shiftKey) {
          onMobileSelect()
        }
      }}
    >
      {children}
    </Link>
  )
}

export default function AdminLayout() {
  const { pathname } = useLocation()
  const matches = useMatches()
  const isListPage = matches.some(({ handle }) =>
    handle && typeof handle === 'object' && 'listPage' in handle && handle.listPage === true,
  )
  const user = useOutletContext<AuthUser | null>()
  const { token } = theme.useToken()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [messages, messageHolder] = message.useMessage()
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      await queryClient.cancelQueries()
      await navigate('/login', { replace: true })
      queryClient.clear()
    },
    onError: () => { void messages.error('退出登录失败，请重试。') },
  })
  const [collapsed, setCollapsed] = useState<boolean>()
  const { settings } = useLayoutPreferences()
  const [settingsOpen, setSettingsOpen] = useState(false)

  const trail = matches.flatMap(({ pathname: path, handle }) => {
    if (!handle || typeof handle !== 'object' ||
      !('breadcrumb' in handle) || typeof handle.breadcrumb !== 'string' ||
      !('title' in handle) || typeof handle.title !== 'string') return []
    return [{ path, label: handle.breadcrumb, title: handle.title }]
  })
  const currentPage = trail.at(-1)
  const pageTitle = currentPage ? `${currentPage.title} · ${appConfig.name}` : appConfig.name
  const breadcrumbs = trail.some((item) => item.path === homeNavigation.path)
    ? trail
    : [{ path: homeNavigation.path, label: homeNavigation.name }, ...trail]

  const displayName = user?.displayName.trim() || user?.username || ''

  function renderAccountMenu(compact = false) {
    if (!user) return null

    return (
      <Dropdown
        trigger={['click']}
        disabled={logoutMutation.isPending}
        menu={{
          items: [
            { key: 'theme', label: '主题设置' },
            { key: 'logout', label: '退出登录', danger: true },
          ],
          onClick: ({ key }) => {
            if (key === 'theme') setSettingsOpen(true)
            if (key === 'logout' && !logoutMutation.isPending) logoutMutation.mutate()
          },
        }}
      >
        <Button
          aria-label={`用户菜单（${displayName}）`}
          aria-haspopup="menu"
          title={displayName}
          loading={logoutMutation.isPending}
          type="text"
          icon={<Avatar aria-hidden="true" size="small">{Array.from(displayName)[0]}</Avatar>}
        >
          {!compact && <span className={styles.accountName}>{displayName}</span>}
        </Button>
      </Dropdown>
    )
  }

  return (
    <div className={styles.layoutShell}>
      {messageHolder}
      <ProLayout
        ErrorBoundary={false}
        title={appConfig.name}
        pageTitleRender={() => pageTitle}
        logo={<strong aria-hidden="true">J</strong>}
        layout={settings.mode}
        navTheme={settings.navTheme}
        colorPrimary={settings.colorPrimary}
        siderMenuType={settings.siderMenuType}
        contentWidth={settings.contentWidth === 'fixed' ? 'Fixed' : 'Fluid'}
        contentStyle={isListPage ? { padding: 'var(--justadmin-list-gutter)' } : undefined}
        splitMenus={settings.mode === 'mix' && settings.splitMenus}
        fixedHeader={settings.fixedHeader}
        fixSiderbar={settings.fixedSidebar}
        siderWidth={settings.sidebarWidth}
        suppressSiderWhenMenuEmpty
        location={{ pathname }}
        route={{
          path: '/',
          children: settings.showMenu ? getAccessibleNavigation(navigation, user?.permissions ?? []) : [],
        }}
        collapsed={collapsed}
        onCollapse={setCollapsed}
        menuRender={settings.showMenu ? undefined : false}
        menuHeaderRender={settings.showMenuHeader ? undefined : false}
        footerRender={settings.showFooter
          ? () => <footer className={styles.layoutFooter} style={{ color: token.colorTextSecondary }}>{appConfig.name}</footer>
          : false}
        headerRender={settings.showHeader ? undefined : false}
        avatarProps={user ? {
          render: (_, _avatar, props) => (
            <div className={styles.accountSlot}>
              {renderAccountMenu(props?.layout === 'side' && !props.isMobile && props.collapsed)}
            </div>
          ),
        } : undefined}
        menuItemRender={(item, content) =>
          item.path ? (
            <MenuLink path={item.path} onMobileSelect={() => setCollapsed(true)}>
              {content}
            </MenuLink>
          ) : content
        }
      >
        <div className={settings.contentWidth === 'fixed' ? styles.fixedContent : undefined}>
          {settings.showBreadcrumb && currentPage && (
            <Breadcrumb
              aria-label="面包屑"
              className={styles.breadcrumb}
              items={breadcrumbs.map(({ path, label }, index) => ({
                key: path,
                title: index === breadcrumbs.length - 1
                  ? <span aria-current="page">{label}</span>
                  : <Link to={path}>{label}</Link>,
              }))}
            />
          )}
          <Outlet context={user} />
        </div>
      </ProLayout>
      {user && (
        <>
          <div className={styles.fallbackAccount} style={{ backgroundColor: token.colorBgElevated }}>
            {renderAccountMenu(true)}
          </div>
          <ThemeSettings open={settingsOpen} onOpenChange={setSettingsOpen} />
        </>
      )}
    </div>
  )
}
