# demo

基于 React、TypeScript 和 Vite 的前端项目，目前处于模板初始化阶段。

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

- [开发规范](docs/CONTRIBUTING.md)：目录组织、编码、接口、样式、验证和提交流程。
- [协作约定](AGENTS.md)：适用于本仓库的代码协作和 AI 修改要求。
- `.editorconfig`：统一基础编辑器格式；Oxlint 配置见 `.oxlintrc.json`。

已安装的业务技术栈包括 Ant Design、React Router、TanStack React Query、Axios 和 Zustand；按业务需要接入。
