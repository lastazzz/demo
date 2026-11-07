import { useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  Alert, Button, Card, ConfigProvider, Empty, Flex, Form, Grid, Input,
  Pagination, Select, Table, Tag, Typography,
} from 'antd'
import type { TableProps } from 'antd'
import { getUsers } from '@/services/users.ts'
import type { UserListParams, UserRow } from '@/types/users.ts'
import styles from './UsersPage.module.css'

type Filters = Pick<UserListParams, 'keyword' | 'status'>

const initialParams: UserListParams = { page: 1, pageSize: 10 }
const statusColumn = {
  title: '状态',
  width: 88,
  render: (_: unknown, user: UserRow) => user.status === 'active'
    ? <Tag color="success">启用</Tag>
    : <Tag>停用</Tag>,
}

const desktopColumns: TableProps<UserRow>['columns'] = [
  { title: '账号', dataIndex: 'username', width: '32%' },
  { title: '显示名称', dataIndex: 'displayName' },
  statusColumn,
]

const narrowColumns: TableProps<UserRow>['columns'] = [
  {
    title: '用户',
    render: (_, user) => (
      <div className={styles.userIdentity}>
        <Typography.Text strong>{user.displayName}</Typography.Text>
        <Typography.Text type="secondary">{user.username}</Typography.Text>
      </div>
    ),
  },
  statusColumn,
]

export default function UsersPage() {
  const [form] = Form.useForm<Filters>()
  const { sm } = Grid.useBreakpoint()
  const narrow = sm === false
  const [params, setParams] = useState(initialParams)
  const users = useQuery({
    queryKey: ['users', 'list', params],
    queryFn: ({ signal }) => getUsers(params, signal),
    placeholderData: keepPreviousData,
    retry: false,
  })

  function search(filters: Filters) {
    setParams((current) => ({
      page: 1,
      pageSize: current.pageSize,
      keyword: filters.keyword?.trim() || undefined,
      status: filters.status,
    }))
  }

  function resetFilters() {
    form.resetFields()
    search({})
  }

  const hasFilters = Boolean(params.keyword || params.status)
  const total = users.data?.total ?? 0
  const emptyState = users.isError ? (
    <Alert
      type="error"
      title="用户列表加载失败"
      showIcon
      action={<Button size="small" onClick={() => void users.refetch()}>重试</Button>}
    />
  ) : users.isPending ? (
    '正在加载用户'
  ) : (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={hasFilters ? '没有符合条件的用户' : '暂无用户'}
    >
      {hasFilters && <Button onClick={resetFilters}>重置筛选</Button>}
    </Empty>
  )

  return (
    <section className={styles.page} aria-labelledby="users-title">
      <header>
        <Typography.Title id="users-title" level={1} className={styles.title}>用户管理</Typography.Title>
      </header>
      <Card classNames={{ body: styles.cardBody }}>
        <Form
          form={form}
          layout="vertical"
          size={narrow ? 'large' : 'middle'}
          className={styles.filters}
          onFinish={search}
        >
          <Form.Item name="keyword" className={styles.keyword}>
            <Input aria-label="关键词" allowClear placeholder="搜索账号或显示名称" />
          </Form.Item>
          <Form.Item name="status" className={styles.status}>
            <Select
              aria-label="状态"
              allowClear
              virtual={false}
              placeholder="全部状态"
              options={[
                { label: '启用', value: 'active' },
                { label: '停用', value: 'disabled' },
              ]}
            />
          </Form.Item>
          <Flex gap={8}>
            <Button type="primary" htmlType="submit">搜索</Button>
            <Button onClick={resetFilters}>重置</Button>
          </Flex>
        </Form>
      </Card>
      <Card classNames={{ body: styles.cardBody }}>
        <ConfigProvider theme={{ components: { Table: { cellPaddingBlockSM: 11, cellPaddingInlineSM: 12 } } }}>
          <Table
            rowKey="id"
            columns={narrow ? narrowColumns : desktopColumns}
            dataSource={users.isError ? [] : users.data?.items ?? []}
            loading={users.isFetching}
            tableLayout="fixed"
            size="small"
            locale={{ emptyText: emptyState }}
            pagination={false}
          />
        </ConfigProvider>
        {!users.isError && total > 0 && (
          <div className={styles.pagination}>
            <Typography.Text type="secondary" aria-live="polite">共 {total} 条</Typography.Text>
            <Pagination
              current={params.page}
              pageSize={params.pageSize}
              total={total}
              simple={narrow ? { readOnly: true } : false}
              showSizeChanger={!narrow}
              pageSizeOptions={[10, 20, 50]}
              disabled={users.isFetching}
              onChange={(page, pageSize) => setParams((current) => ({
                ...current,
                page: pageSize === current.pageSize ? page : 1,
                pageSize,
              }))}
            />
          </div>
        )}
      </Card>
    </section>
  )
}
