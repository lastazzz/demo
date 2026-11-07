import { Button, Result } from 'antd'
import { appConfig } from '@/config/app.ts'

const messages = {
  403: { title: '无权访问', description: '当前账号没有访问此页面的权限。' },
  404: { title: '页面不存在', description: '请检查地址是否正确，或返回首页继续浏览。' },
  500: { title: '页面出错', description: '暂时无法显示此页面，请重新加载后再试。' },
}

export default function ErrorPage({ status }: { status: keyof typeof messages }) {
  const { title, description } = messages[status]

  return (
    <Result
      status={status}
      title={<h1>{status} {title}</h1>}
      subTitle={description}
      extra={[
        <Button key="home" type="primary" href={appConfig.homePath}>返回首页</Button>,
        status === 500 && (
          <Button key="reload" onClick={() => window.location.reload()}>重新加载</Button>
        ),
      ]}
    />
  )
}
