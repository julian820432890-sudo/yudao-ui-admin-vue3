# 安天智能物流 · 系统管理前端

当前分支：`master-base-system`，从 `master-base` 分出。

保留管理概览、系统管理、登录（含企业微信入口）、个人中心及公共 UI 组件。其他业务页面、API、静态业务路由和流程/商城设计器已移除。动态菜单仅接受系统管理模块，角色授权和数据库记录保持不变。

## 本地运行

1. 使用 Node.js 20.19+，安装 pnpm。
2. 执行 `pnpm install`，再执行 `pnpm dev`。
3. 后端使用 `master-jdk17-base-system`，仅运行网关 `48080` 和系统服务 `48081`，并提供 MySQL、Redis、Nacos。
4. 本地 API 指向 `.env.local` 配置的网关；访问 `http://localhost`，登录后进入“管理概览”。
5. 生产构建执行 `pnpm build:prod`，本地构建执行 `pnpm build:local`。

现有品牌图片、登录页面和系统管理权限保留。上传等公共能力位于 `src/api/system/support`，沿用兼容的后端文件接口路径。
