import { Card, Typography } from 'antd'
import type { ReactNode } from 'react'

export default function RoutePage({ title, description, children }: {
  title: string
  description?: string
  children?: ReactNode
}) {
  return (
    <Card>
      <Typography.Title level={1}>{title}</Typography.Title>
      {description && <Typography.Paragraph>{description}</Typography.Paragraph>}
      {children}
    </Card>
  )
}
