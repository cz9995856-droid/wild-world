# 部署指南 · WILD WORLD

本指南覆盖：Node 部署、Vercel 部署、Supabase 数据库、媒体存储、后台安全、RSS 同步、回滚与备份。

## 1. 环境要求

- Node.js **22.13+**（推荐 22 LTS 或 24）
- npm 10+
- 可选：Supabase 项目（PostgreSQL 15+）
- 可选：对象存储 / CDN（生产图片与音频）
- HTTPS（后台登录 Cookie 在生产环境带 `Secure`）

## 2. 本地 / 自托管

```bash
npm ci
cp .env.example .env.local
# 编辑 .env.local
npm run build
npm start   # 默认 3000 端口
```

使用 PM2 / systemd / Docker 反向代理到 `127.0.0.1:3000`。务必设置：

```env
NEXT_PUBLIC_SITE_URL=https://your-domain.example
ADMIN_PASSWORD=<强密码>
ADMIN_SESSION_SECRET=<至少 32 位随机字符串>
```

> 修改环境变量后必须重启进程。

### Nginx 片段

```nginx
server {
  listen 443 ssl http2;
  server_name your-domain.example;
  client_max_body_size 20m;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

## 3. Vercel

1. 导入仓库，Framework Preset 选择 Next.js。
2. Build Command: `npm run build`；Output: 默认。
3. 在 Project → Settings → Environment Variables 添加上表变量。
4. 部署后验证：
   - `/` 首屏图片加载；
   - `/api/search?q=雪豹` 返回 JSON；
   - `/api/occurrences?slug=giant-panda&source=gbif` 返回 `state: "live"` 或明确的 `error`；
   - `/admin` 能登录。

> Vercel 的函数文件系统只读。当前后台写入 `.data/content.json` 在 Vercel 上会失败（会返回 `write_failed`，不会假装成功）。要获得可持久化后台，请使用 Supabase 仓库或挂载持久磁盘的自托管部署。

## 4. Supabase 数据库

### 4.1 创建与迁移

```bash
npm i -g supabase
supabase login
supabase link --project-ref <your-project-ref>
supabase db push          # 应用 supabase/migrations/0001_init.sql
```

或在 Supabase Dashboard → SQL Editor 中依次执行：

1. `supabase/migrations/0001_init.sql`
2. `supabase/seed.sql`

`seed.sql` 由后台导出自动生成，包含 24 个物种、96 张媒体、20 条录音、48 条新闻、8 个视频条目、12 道题、7 个时间线节点、来源与首页配置。

### 4.2 环境变量

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

- `SERVICE_ROLE_KEY` 仅服务端使用，绝不能加 `NEXT_PUBLIC_` 前缀。
- RLS 已开启：公开内容只读；写操作要求 `auth.jwt().app_metadata.role = 'admin'`；用户收藏与偏好仅本人可读写。
- `users` 表与 `auth.users` 关联；管理员角色建议写入 `app_metadata.role`。

### 4.3 运行时切换说明

当前 `lib/repository.ts` 默认读取 `public/data` 种子与 `.data/content.json`，以便在没有数据库时也能完整运行。

Supabase 已配置时：

- `lib/supabase.ts` 会检测连接并提供健康检查；
- 需要在 `repository.ts` 中把物种 / 新闻 / 媒体查询替换为对 `species` / `news_articles` / `media_assets` 等表的查询；
- 后台 `mutateStore` 需要改为写入对应表或 `site_settings.value`。

**未完成这一替换前，UI 不会显示“Supabase 已连接”**，只显示环境变量是否存在。这是刻意的真实性约束。

### 4.4 媒体文件

`media_assets.url` 当前为 `/media/...`。迁移到 Supabase Storage 时：

1. 创建公开 bucket（例如 `media`）。
2. 上传 `public/media/**`，保留原相对路径。
3. 将 `media_assets.url` 更新为 `https://<project>.supabase.co/storage/v1/object/public/media/...`。
4. 保留 `source_url`、`license`、`attribution`、`commercial_use` 字段不变。

CDN 缓存建议：图片 1 年 immutable，API 1 小时。

## 5. 后台安全

- 必须设置 `ADMIN_PASSWORD` 与 `ADMIN_SESSION_SECRET`，否则 `/admin` 关闭。
- 角色：
  - `admin`：全部（删除、设置、同步、导出）
  - `editor`：物种 / 新闻 / 媒体审核 / 来源备注
  - `viewer`：只读
- 会话：HMAC-SHA256 签名 Cookie，HttpOnly、SameSite=Lax、生产 Secure，8 小时过期。
- 登录限流：同 IP 15 分钟 10 次失败后暂时拒绝。
- 反向代理需传递 `X-Forwarded-For`，否则限流按代理 IP 计算。
- 建议额外加 IP 白名单 / Cloudflare Access。

## 6. 新闻同步

### 手动（当前实现）

后台 → 同步与日志 → 运行同步。结果写入 `.data/news-live.json` 并记录 `sync_logs`。

### 定时（建议扩展）

当前同步接口要求管理员会话。生产环境可：

1. 新增受 `CRON_SECRET` 保护的 `/api/cron/news` 路由，内部调用 `syncAllFeeds()`；
2. Vercel Cron：`0 */6 * * *` 请求该路由；
3. 或使用 GitHub Actions / 服务器 crontab。

BBC 与 WWF 在当前网络下会失败（HTTP 000 / 403），系统会记录失败原因，不伪造成功。

## 7. 媒体重新抓取

```bash
npm run fetch:media
npm run sync:news
```

- iNaturalist 匿名 API 约 60 次/分钟；脚本内置间隔与重试。
- 脚本会跳过已存在文件，支持断点续抓。
- 抓取完成后生成 `public/data/integration.json`，包含作者、许可、来源记录 ID、获取时间。
- **每次抓取后需重新核验许可**；作者可能在来源页更新许可证。

## 8. 备份与迁移

- 后台 → 导出数据 → 下载 `wildworld-export-YYYY-MM-DD.json`。
- 使用 `node scripts/json-to-seed-sql.mjs <export.json> supabase/seed.sql` 生成 SQL。
- 数据库备份使用 Supabase 自动备份 + `pg_dump`。
- 媒体目录 `public/media` 单独备份；建议对象存储版本化。

## 9. 上线检查清单

- [ ] `npm run typecheck`、`npm run lint`、`npm test` 全部通过
- [ ] `npm run build` 成功
- [ ] `NEXT_PUBLIC_SITE_URL` 为 HTTPS 正式域名
- [ ] 后台密码强且唯一，`ADMIN_SESSION_SECRET` 随机
- [ ] `/admin` 在未登录时不可访问敏感数据
- [ ] `/api/ai` 限流生效；未配置密钥时明确显示本地模式
- [ ] 地图接口失败时显示错误而不是空白或假点
- [ ] 图片许可逐张显示；NC 素材无直接下载
- [ ] 新闻详情包含原文链接、发布日期、来源与审核状态
- [ ] 404 返回 HTTP 404（根级 loading 边界会破坏状态码，已移除）
- [ ] 备份与导出可用
- [ ] 隐私说明（收藏仅本机；AI 问题不落库）与实际一致

## 10. 常见问题

**Q：地图空白？** 检查浏览器能否访问 `demotiles.maplibre.org`；底图失败时页面显示“底图加载失败”，不会显示假点。

**Q：GBIF 超时？** 首次请求可能较慢，适配层超时 30 秒；失败会在数据状态面板显示原因。可配置 `GBIF_API_BASE` 代理。

**Q：后台写入失败？** 在 Vercel 只读文件系统上属预期；请配置持久磁盘或 Supabase。

**Q：图片不显示？** 确认 `public/media` 随构建产物部署；Next Image 优化需要 `sharp`（Next 15 在部分环境会自动使用内置实现）。若部署平台不支持，设置 `images.unoptimized = true`。

**Q：Node 版本警告？** `eslint-visitor-keys` 要求 Node 22.13+；升级 Node 即可。