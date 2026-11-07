# JustAdmin

项目定位为一套基于 React、TypeScript 和 Vite 的成熟中后台前端模板，提供完整的布局、常用页面和可复用组件，支持便捷接入后端 API，作为快速搭建 VP 的前端基础项目。

当前处于模板初始化阶段，上述能力为建设目标，尚未完成。阶段交付物与验收标准见[后续开发计划](docs/DEVELOPMENT_PLAN.md)。

## 本地开发

使用 pnpm 管理依赖，提交依赖变更时同步提交 `pnpm-lock.yaml`，不要混用 npm 或 Yarn 锁文件。

```sh
pnpm install
pnpm dev
```

## 常用命令

| 命令 | 用途 |
| --- | --- |
| `pnpm dev` | 启动本地开发服务 |
| `pnpm lint` | 执行 Oxlint 检查 |
| `pnpm build` | 执行 TypeScript 检查并构建生产产物 |
| `pnpm preview` | 本地预览构建产物，需先执行构建 |

## 项目约定

### 应用基础信息

统一在 `src/config/app.ts` 的 `appConfig` 中维护：

| 字段 | 用途 | 默认值 |
| --- | --- | --- |
| `name` | 应用名称，用于浏览器标题，后续供布局和登录页复用 | `JustAdmin` |
| `description` | 应用简介，用于页面描述 | 可复用的中后台前端基础项目 |
| `homePath` | 首页路由地址，后续供默认跳转复用 | `/` |

应用启动时会从配置设置浏览器标题和页面描述。修改 `name` 或 `description` 时，同步更新 `index.html` 中的默认标题和描述，保持 JavaScript 执行前后的内容一致；修改应用名称时也同步更新本文档标题。`homePath` 当前直接用于首页路由定义，修改后首页地址会随之变化，不会自动保留旧地址的重定向。

基础信息配置随代码管理，API 地址等环境差异通过下面的环境变量配置。

### 环境变量与开发代理

将 `.env.example` 复制为 `.env.local` 后按需修改；不创建本地配置也可以启动。修改后重启开发服务。

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `/api` | 前端 API 基础地址，通过 `@/config/env.ts` 的 `envConfig.apiBaseUrl` 读取 |
| `API_PROXY_TARGET` | 空 | 仅 Vite 开发服务器使用，留空不启用代理；填写源地址，例如 `http://localhost:8080` |
| `MOCK_AUTH_ENABLED` | `false` | 设置为 `true` 时启用本地 Mock 接口 |

应用启动时校验前端配置。API 基础地址支持以 `/` 开头的同源路径或完整 HTTP(S) 地址，不支持协议相对地址、凭据、查询参数和片段。空值使用默认 `/api`。

业务接口通过 `src/services/http.ts` 的 `request<T>()` 发起请求。传入相对于 API 基础地址的路径，默认超时 10 秒，成功时返回响应体。需要取消请求时传入 `signal`。失败时可通过 `HttpError.kind` 区分 HTTP 错误、超时、网络失败、取消及其他错误，通过 `status` 读取 HTTP 状态码。响应数据的类型由各业务接口定义。

配置 `API_PROXY_TARGET=http://localhost:8080` 后，开发时 `/api/users` 转发至 `http://localhost:8080/api/users`，保留前缀；代理目标不带路径，其他前端路径不转发。使用完整 API 地址会绕过开发代理，由后端处理 CORS；自定义同源前缀也需要相应调整代理规则。

Vite 开发代理不参与生产运行，`pnpm preview` 也不提供该 API 代理。生产使用默认 `/api` 时，需要部署服务器配置反向代理；使用完整地址时，在构建前配置 `VITE_API_BASE_URL`。该变量在构建时写入前端产物，部署后修改环境变量不会改变已有产物。

Vite 按模式读取 `.env`、`.env.local`、`.env.[mode]`、`.env.[mode].local`，模式配置优先于通用配置，已有进程环境变量优先级最高。实际环境文件已忽略，仅提交 `.env.example`。所有 `VITE_` 变量均可被浏览器读取，不存放密钥或凭据；`API_PROXY_TARGET` 不使用 `VITE_` 前缀，也不注入前端。

### 本地 Mock 接口

在 `.env.local` 设置以下内容后重启 `pnpm dev`：

```dotenv
VITE_API_BASE_URL=/api
API_PROXY_TARGET=
MOCK_AUTH_ENABLED=true
```

在 `/login` 使用演示账号 `admin`（管理员）或 `viewer`（只读用户）登录，演示密码均为 `demo123`。认证使用以下接口。

| 请求 | 行为 |
| --- | --- |
| `POST /api/auth/login` | 提交 JSON 字段 `username`、`password`。成功返回用户信息并设置会话 Cookie，凭据错误返回 401 |
| `GET /api/auth/me` | 有效会话返回用户信息和 `permissions` 权限码数组，未登录或会话失效返回 401 |
| `POST /api/auth/logout` | 清除会话和 Cookie，返回 204 |
| `GET /api/users` | 登录后可用。接收 `page`、`pageSize`、`keyword`、`status`，返回 `{ items, total }` |

会话保存在开发服务器内存中，最多保留一小时，重启服务后失效。Mock 只在 Vite 开发服务器生效。切换真实后端时设置 `MOCK_AUTH_ENABLED=false`，再填写代理地址。

两个演示账号均可通过「用户管理」访问 `/users`。列表支持按账号或显示名称搜索、筛选启用状态及分页。

### 主题配置

在 `src/config/theme.ts` 中维护 `themeConfig`，通过应用级 `ConfigProvider` 统一传入 Ant Design，采用默认浅色主题算法。

| Token | 用途 | 当前值 |
| --- | --- | --- |
| `colorPrimary` | 主色 | `#1677ff` |
| `borderRadius` | 基础圆角 | `6`（px） |
| `fontSize` | 基础字号 | `14`（px） |

后续品牌调整优先修改此处；Ant Design 会根据基础 token 派生组件样式，个别组件可通过 `themeConfig.components` 定向覆盖。自定义 React 组件需要使用主题值时，可通过 `theme.useToken()` 读取，不在页面重复硬编码。

登录后，从用户菜单打开「主题设置」，可即时切换浅色、深色和主题色，也可开启色弱模式。

### 布局

「主题设置」也提供侧边、顶部和混合导航切换、侧栏菜单类型、混合菜单分割及区域显隐。桌面侧边模式的用户菜单在侧栏底部，顶部、混合模式和窄屏下在顶栏。隐藏承载用户菜单的导航区域时，用户菜单移到右下角，便于恢复设置。

内容区可选择流式或最大宽度 1152px，顶部导航的定宽顶栏与内容区对齐。面包屑默认显示，可在主题设置中关闭。侧边和混合模式可设置固定侧栏及侧栏宽度。顶部导航和窄屏侧边导航可切换固定顶栏，混合模式的顶栏由 ProLayout 固定。

主题和布局偏好保存在当前浏览器，刷新后自动恢复。「复制配置」将当前偏好复制为可用于 `src/config/layout.ts` 的 JSON。「恢复默认」会清除浏览器中的偏好并重新使用项目默认值。

`src/routes/navigation.ts` 统一维护菜单和路由。页面名称默认用于菜单、面包屑和浏览器标题，可用 `pageTitle` 单独指定浏览器标题。设置 `hideInMenu: true` 后，页面仍可通过链接访问，并保留在面包屑中。分组地址默认跳转到第一个子页面。

布局组件将导航树和项目配置传给 ProLayout，页面通过 React Router 的 `Outlet` 渲染。ProComponents 固定为兼容 Ant Design 6 的 `3.1.15-9` 预发行版，升级时需回归三种导航与移动抽屉。

### 异常页面

`/403` 提供权限拦截后的入口，未匹配的地址在当前导航布局内显示 404。路由加载或渲染失败时由错误边界接管，500 页面提供重新加载和返回首页。

### 认证入口

`/login` 使用独立认证布局。访问后台业务页时会检查 Cookie 会话，未登录时跳转到登录页，登录后返回原先访问的站内页面。登录检查遇到网络问题时可重试。403 和 404 页面可直接访问。

登录后可在导航栏的用户菜单中退出。服务端确认退出后会清理当前用户和业务缓存，并返回登录页。

路由可通过 `permission` 声明所需权限。前端依据 `/auth/me` 返回的权限过滤菜单，无权访问的站内路由跳转至 `/403`。页面可使用 `PermissionGate` 控制操作入口。演示详情需要 `examples:details:read`，只有管理员可见菜单和「查看详情」入口。数据接口的权限由后端校验。

### 开发文档

- [开发规范](docs/CONTRIBUTING.md)：目录组织、编码、接口、样式、验证和提交流程。
- [开发计划](docs/DEVELOPMENT_PLAN.md)：建设目标、阶段顺序、交付物与验收标准。
- [协作约定](AGENTS.md)：适用于本仓库的代码协作和 AI 修改要求。
- `.editorconfig`：统一基础编辑器格式；Oxlint 配置见 `.oxlintrc.json`。

已安装的业务技术栈包括 Ant Design、React Router、TanStack React Query、Axios 和 Zustand；按业务需要接入。
