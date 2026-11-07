interface AppConfig {
  readonly name: string
  readonly description: string
  readonly homePath: `/${string}`
}

export const appConfig: AppConfig = {
  name: 'JustAdmin',
  description: '可复用的中后台前端基础项目',
  homePath: '/',
}
