# WILD WORLD · 全球数字动物自然博物馆

一座真正可运行、数据来源清晰、可继续扩展的数字动物自然博物馆。中文优先，支持中英文界面切换；森林绿与米白视觉；桌面、平板与手机响应式。

- 技术栈：Next.js 15 App Router · React 19 · TypeScript · Tailwind CSS 3 · MapLibre GL · React Three Fiber
- 数据层：Supabase / PostgreSQL 迁移与种子已提供；未配置数据库时使用本地种子 + `.data` 文件仓库
- 真实素材：94 张 iNaturalist 授权影像、9 条野外录音、4 张首屏授权影像；逐张记录作者、来源、许可与获取时间
- 真实新闻：60 条来自 Mongabay / Nature / ScienceDaily / Phys.org 的 RSS 条目；标题、发布日期与原文链接均来自源站
- 状态透明：已核验 / 编辑整理 / 待审核 / 示例；未连接的接口明确显示未配置，不伪造连接状态

> 当前环境说明：本项目已完成页面联调、**生产构建（npm run build）**、类型检查、ESLint 与 39 个单元测试。由于执行环境限制，**Playwright 浏览器测试未能运行**；用例已提供。详见 [`TEST_REPORT.md`](./TEST_REPORT.md)。

---

## 1. 当前交付状态

### 已实现并验证

- 首页：全屏授权影像首屏、品牌标题、搜索、SCROLL TO EXPLORE、新闻中心、随机探索、分类、精选百科、实验室、地图、濒危、摄影馆、纪录片、每日动物、排行榜等 14 个区域。
- 首页区域可自定义：显示 / 隐藏 / 上移 / 下移 / 恢复默认，偏好保存在本机。
- 动物百科：24 件物种档案、搜索、类群筛选、保护等级筛选、排序、详情页、收藏、对比、随机探索。
- 新闻中心：真实 RSS 快照、分类与来源筛选、搜索、加载更多、详情页、编辑翻译、审核状态、人工导入、RSS 同步、失败日志。
- 全球地图：MapLibre 底图 + GBIF / iNaturalist 实时观测点、图层开关、区域筛选、记录弹窗、原始记录链接、失败状态。
- 摄影馆：授权影像筛选、全屏查看器、作者 / 许可 / 商用与下载权限。
- 纪录片：8 个官方观看入口，逐条注明不内嵌未授权片源。
- 互动实验室：程序化 3D 模型（旋转 / 缩放 / 多种动物）、身体结构热点（外部 / 骨骼 / 肌肉）、声音波形与频谱、地理观测、12 题知识挑战、食性模拟。
- 濒危专题：保护等级、评估年份、趋势、威胁、措施、来源。
- 进化时间线 + 分类树 + 分类 / 系统发育边界说明。
- AI 问答：本地知识库检索模式；配置 `AI_API_KEY` 后切换为 LLM + 检索；未知信息明确说明。
- 数据与许可页：来源清单、连接状态、许可边界、待授权清单。
- 后台：登录、角色（admin / editor / viewer）、物种编辑与新增、新闻审核与导入、媒体审核标记、来源备注、RSS 同步与日志、首页设置、推荐区默认顺序、完整 JSON 导出。
- 数据库：`supabase/migrations/0001_init.sql` 全量 schema（物种、事实、分类、媒体、许可、视频、声音、观测、保护评估、新闻、3D、解剖、题库、进化、来源、同步日志、用户、收藏、偏好）与索引、RLS、触发器；`supabase/seed.sql` 自动生成种子。
- 响应式、深色模式、骨架屏组件、空状态、错误状态、键盘可访问、`prefers-reduced-motion` 支持、⌘K 全站搜索。

### 待配置（需要运行环境）

| 项目 | 需要的变量 | 影响 |
| --- | --- | --- |
| 后台登录 | `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` | 未设置时 `/admin` 只显示配置说明 |
| Supabase | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | 当前默认本地文件仓库；切库需按部署文档完成 |
| AI 模型 | `AI_API_KEY`, `AI_BASE_URL`, `AI_MODEL` | 未设置时使用本地检索回答 |
| 首屏视频 | 后台设置或 `NEXT_PUBLIC_HERO_VIDEO_URL` | 未设置时使用授权摄影序列 |
| 定时新闻同步 | 外部调度 + 管理员会话（或自行扩展 cron secret） | 当前可后台手动同步 |

### 待授权（需要你提供）

| 数据源 | 需要 | 当前替代 |
| --- | --- | --- |
| IUCN Red List API | Token + 商业使用许可确认 | 编辑整理等级，标注评估年份，待复核 |
| Xeno-canto API v3 | API Key | 使用 iNaturalist 授权录音 |
| Macaulay Library | 机构授权与 Key | 未接入 |
| Smithsonian Open Access | api.data.gov Key | 影像来自 iNaturalist；3D 为原创程序化模型 |
| BBC / National Geographic / Smithsonian 影片 | 嵌入或转载授权 | 仅官方外链 |
| 首页 4K 授权视频 | 你拥有商用授权的片源 | 授权图片序列 |

---

## 2. 推送到 GitHub

项目已在本地初始化为 `main` 分支并完成提交（`085d5b0`）。当前执行环境没有 GitHub 登录凭证，因此需要你在自己的账号下创建空仓库并推送：

```bash
# 1) 在 GitHub 创建空仓库：cz9995856-droid/wild-world（不要初始化 README）
# 2) 在当前目录执行：
git remote add origin https://github.com/cz9995856-droid/wild-world.git
git push -u origin main
```

或使用 GitHub CLI：

```bash
gh auth login
gh repo create cz9995856-droid/wild-world --public --source=. --remote=origin --push
```

推送完成后，可在 Vercel 中导入该仓库，按 [DEPLOYMENT.md](./DEPLOYMENT.md) 配置环境变量；若要后台写入持久化，请使用 Supabase 或自托管服务器，不要只依赖 Vercel 只读文件系统。

## 2. 快速开始

要求：Node.js **22.13+**（`eslint-visitor-keys@5` 要求 `^20.19 || ^22.13 || >=24`；本环境为 22.11，仅有引擎警告）。

```bash
npm install
cp .env.example .env.local
# 至少设置：
# ADMIN_PASSWORD=...
# ADMIN_SESSION_SECRET=至少 32 位随机字符串
# NEXT_PUBLIC_SITE_URL=http://localhost:3000
npm run dev
```

打开 <http://localhost:3000>。后台：<http://localhost:3000/admin>。

### 环境变量

见 [`.env.example`](./.env.example)。所有密钥只在服务端读取；`NEXT_PUBLIC_` 前缀变量会暴露给浏览器，请勿放密钥。

| 变量 | 必填 | 说明 |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | 部署时 | 站点绝对 URL，用于 metadata / sitemap |
| `ADMIN_PASSWORD` | 后台 | 管理员密码 |
| `ADMIN_SESSION_SECRET` | 后台 | HMAC 签名密钥（32 位以上） |
| `ADMIN_EDITOR_PASSWORD` | 可选 | 内容编辑角色 |
| `ADMIN_VIEWER_PASSWORD` | 可选 | 只读角色 |
| `NEXT_PUBLIC_SUPABASE_URL` / `..._ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` | 可选 | Supabase |
| `AI_API_KEY` / `AI_BASE_URL` / `AI_MODEL` | 可选 | OpenAI 兼容接口 |
| `NEWS_USER_AGENT` | 可选 | RSS 与媒体请求 UA |
| `GBIF_API_BASE` / `INATURALIST_API_BASE` | 可选 | 覆盖公开 API 地址 |
| `IUCN_API_TOKEN` / `XENO_CANTO_API_KEY` / `MACAULAY_LIBRARY_API_KEY` / `SMITHSONIAN_API_KEY` | 待授权 | 适配层已存在，未配置时明确返回未连接 |
| `NEXT_PUBLIC_HERO_VIDEO_URL` / `..._POSTER` / `..._CREDIT` | 可选 | 首屏授权视频 |

---

## 3. 内容与真实性规则

1. **不伪造接口状态**：GBIF / iNaturalist 失败时地图与页面显示真实错误；IUCN / Xeno-canto / Smithsonian / AI 未配置时显示“未配置”。
2. **不把示例当真实**：物种内容标记为 `editorial`（编辑整理），未逐条核验原始文献。示例只用于明确标注的场景。
3. **影像逐张许可**：每张图片保存 `source_name / source_url / source_record_id / author / license / retrieved_at / commercial_use / download_allowed`。NC 素材不商用、不提供直接下载。
4. **新闻只用 RSS 标题 / 摘要 / 链接**：不转载全文与图片。中文摘要为“编辑翻译”或“待生成”，不冒充 AI 自动生成。
5. **观测点 ≠ 分布范围**：地图不绘制模拟点，也不用观测点补成分布面。
6. **保护等级有年份与来源**：明确标注 IUCN API 未接入，等级为编辑整理、待复核。
7. **纪录片只外链**：未取得授权不内嵌完整影片。
8. **AI 不编造**：先检索馆藏；未覆盖时说明；模型失败回退本地检索，不重试伪造答案。

### 已接入的真实数据

| 数据 | 数量 | 来源 | 说明 |
| --- | --- | --- | --- |
| 物种档案 | 24 | 馆方编辑整理 + GBIF 分类键 | 每件附来源链接与审核状态 |
| 授权影像 | 94 | iNaturalist Open Data | 23 种有照片；kakapo 暂无可用授权照片，使用原创插画回退 |
| 首屏影像 | 4 | iNaturalist | `public/media/hero` |
| 野外录音 | 9 | iNaturalist | 本地保存在 `public/media/sounds`，逐条许可 |
| 新闻 | 60 | Mongabay / Nature / ScienceDaily / Phys.org | RSS 快照，8 条编辑翻译 |
| 视频入口 | 8 | BBC Earth / PBS / NatGeo / Smithsonian 等 | 仅官方链接 |

---

## 4. 页面地图

| 路由 | 内容 |
| --- | --- |
| `/` | 沉浸式首页 + 新闻中心 + 14 个可自定义区域 |
| `/encyclopedia` | 物种列表、搜索、筛选、排序、加载更多 |
| `/encyclopedia/[slug]` | 物种详情、事实卡、保护、地图入口、画廊、声音、来源表 |
| `/news` · `/news/[slug]` | RSS 新闻列表 / 详情、审核状态、原文链接 |
| `/map` | MapLibre + GBIF / iNaturalist 实时观测 |
| `/photography` | 摄影馆、许可筛选、全屏查看器 |
| `/videos` | 纪录片官方入口 |
| `/conservation` | 濒危专题 |
| `/lab` | 3D / 解剖 / 声音 / 地理 / 测验 / 喂养模拟 |
| `/compare` | 最多三种动物对比 |
| `/rankings` | 五个带口径说明的排行榜 |
| `/timeline` | 进化时间线 + 分类树 |
| `/ai` | 动物问答 |
| `/search` | 全站搜索结果 |
| `/favorites` | 本机收藏 |
| `/sources` | 数据源、许可与待授权清单 |
| `/about` | 理念、数据方法、交付状态 |
| `/admin` | 后台管理 |

### API

| 路由 | 方法 | 说明 |
| --- | --- | --- |
| `/api/search` | GET | 物种 / 新闻 / 专区搜索 |
| `/api/species` | GET | 物种 JSON |
| `/api/occurrences` | GET | GBIF + iNaturalist 实时观测代理 |
| `/api/ai` | GET / POST | AI 状态 / 问答（服务端、限流） |
| `/api/admin/login` | POST / DELETE | 登录 / 退出 |
| `/api/admin/species` | POST | 新增 / 更新 / 删除 / 审核 |
| `/api/admin/news` | POST | 编辑 / 审核 / 导入 / 同步 |
| `/api/admin/settings` | POST | 首屏、每日动物、推荐区 |
| `/api/admin/sources` | POST | 来源备注 / 媒体审核标记 |
| `/api/admin/export` | GET | 导出完整 JSON |

---

## 5. 项目结构

```
app/                    页面、API 路由、metadata、sitemap
components/             头部/页脚、搜索、首页区域、物种、地图、实验室、后台
lib/
  data/                 物种种子、视频、题库、时间线、食性、新闻编辑翻译
  adapters/             GBIF / iNaturalist / RSS / IUCN / Xeno-canto / Smithsonian / Wikipedia
  ai/                   知识检索与本地/LLM 回答
  store/                文件仓库（.data/content.json）
  repository.ts         合并种子 + 媒体集成 + 后台覆盖
  supabase.ts           Supabase 客户端与健康检查
supabase/
  migrations/0001_init.sql
  seed.sql
scripts/               媒体抓取、RSS 同步、导出转 SQL
public/media/          授权图片与录音
public/data/           媒体集成清单、新闻快照
tests/                 Vitest 单元测试
e2e/                   Playwright 端到端用例
```

---

## 6. 脚本

```bash
npm run dev          # 开发
npm run build        # 生产构建
npm start            # 生产启动
npm run lint         # ESLint
npm run typecheck    # TypeScript
npm test             # Vitest（39 个用例）
npm run test:e2e     # Playwright（需先 npx playwright install chromium）
npm run fetch:media  # 从 iNaturalist/GBIF 抓取图片、录音、首屏图（可断点续抓）
npm run sync:news    # 生成 public/data/news-snapshot.json
node scripts/json-to-seed-sql.mjs /path/to/export.json supabase/seed.sql
```

---

## 7. 已知限制与后续

- **Playwright 浏览器测试未执行**：环境限制了浏览器启动；17 个用例已编写，可在本地运行。生产构建与单元测试已通过。
- **Supabase 尚未实际连接**：schema 与 seed 完整，但运行时默认读取本地种子。切换需要在 `lib/repository.ts` 中接入 Supabase 查询；`lib/supabase.ts` 已提供客户端与健康检查，UI 会显示“未配置”而不是假装连接。
- **物种资料未逐条核验**：`review_status=editorial`。IUCN API 接入后应重新核对等级、年份与分类单元。
- **新闻定时任务**：当前后台手动同步；生产环境建议加 cron secret 或受保护的定时路由。
- **图片托管**：当前本地文件；生产建议 Supabase Storage / CDN，并保留许可元数据。
- **AI**：本地模式只做字段级检索，不做复杂推理；配置模型后仍受系统提示约束。
- **中英文切换**：导航与通用界面文案可切换；物种正文以中文为主，英文正文待补齐。

---

## 8. 许可与使用

- 代码：可作为项目基础使用与修改。
- 物种文本：馆方编辑整理，引用来源包括 IUCN、Wikipedia、ADW、San Diego Zoo、Giraffe Conservation Foundation 等；不整段复制受版权文本。
- 影像与录音：许可逐张/逐条记录在 `public/data/integration.json` 与数据库 `media_assets`。**商业使用前必须逐条复核**；NC 素材不得商用。
- 新闻：版权归原出版机构，本站仅使用 RSS 提供的标题、摘要与链接。
- 纪录片：版权归制作机构，本站仅提供官方外链。

数据与许可详情：[`DATA_SOURCES.md`](./DATA_SOURCES.md) · 部署：[`DEPLOYMENT.md`](./DEPLOYMENT.md) · 测试：[`TEST_REPORT.md`](./TEST_REPORT.md)
<!-- cloudflare hybrid deployment: 2026-11-13T17:35:38Z -->
