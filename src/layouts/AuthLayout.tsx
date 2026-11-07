import { Avatar, Card, theme } from 'antd'
import { Outlet } from 'react-router'
import { appConfig } from '@/config/app.ts'
import styles from './AuthLayout.module.css'

export default function AuthLayout() {
  const { token } = theme.useToken()

  return (
    <main className={styles.shell} style={{ backgroundColor: token.colorBgLayout }}>
      <Card className={styles.card}>
        <header className={styles.brand}>
          <Avatar
            aria-hidden="true"
            shape="square"
            size={40}
            style={{ backgroundColor: token.colorPrimary, color: token.colorTextLightSolid }}
          >
            {appConfig.name.charAt(0)}
          </Avatar>
          <strong style={{ color: token.colorTextHeading }}>{appConfig.name}</strong>
        </header>
        <Outlet />
      </Card>
    </main>
  )
}
