# 数据源、许可与待授权清单

版本：2026-11-14 · 所有“已连接”状态均经过实际请求验证；未验证的项目明确标记。

## 1. 已接入并实际使用

| 来源 | 用途 | 接口 / 方式 | 当前状态 | 许可与商用 |
| --- | --- | --- | --- | --- |
| [GBIF](https://www.gbif.org/) | 物种分类键、观测记录 | `https://api.gbif.org/v1/species/match`、`/occurrence/search` | **实时可用**，无需密钥 | 各数据集许可不同（CC0 / CC BY / CC BY-NC）；逐条记录 `datasetKey` 与许可；商用需逐条核对 |
| [iNaturalist](https://www.inaturalist.org/) | 物种图片、野外录音、观测点 | `https://api.inaturalist.org/v1/taxa`、`/observations`；媒体文件 `inaturalist-open-data.s3.amazonaws.com` | **已抓取**：144 张图（36 物种 × 4）、36 条录音（本地 30 秒试听预览）；观测点实时 | 逐张 CC BY / CC BY-NC / CC BY-NC-SA 等；NC 不商用；本站不提供 NC 素材直接下载 |
| [Pixabay](https://pixabay.com/) | 高清野生动物照片扩展 | `https://pixabay.com/api/`（官方 API）+ 本地压缩入库 | **已抓取**：35 张横版图（每物种 1 张；vaquita 无合适横版图未使用替代品） | Pixabay Content License：可商用与改编；禁止转售未改编素材与暗示背书；逐张保留作者与页面链接 |
| [Mongabay RSS](https://news.mongabay.com/feed/) | 保护与环境新闻 | RSS | **已连接**（32 条原始条目） | 仅标题 / 摘要 / 链接；版权归 Mongabay |
| [Nature RSS](https://www.nature.com/nature.rss) | 动物学研究 | RSS | **已连接**（按动物相关性过滤） | 仅标题 / 摘要 / 链接；版权归 Nature Portfolio |
| [ScienceDaily](https://www.sciencedaily.com/rss/plants_animals.xml) | 动植物研究 | RSS | **已连接** | 仅标题 / 摘要 / 链接 |
| [Phys.org](https://phys.org/rss-feed/biology-news/plants-animals/) | 生物学研究 | RSS | **已连接** | 仅标题 / 摘要 / 链接 |
| [Natural Earth](https://www.naturalearthdata.com/) | 世界边界底图 | `public/data/world-land.json`、`world-graticule.json`（world-atlas + topojson-client 离线生成） | **本地离线可用**，不依赖公共 tile 服务 | 公共领域 |

### 抓取结果（`public/data/integration.json`）

- 生成时间：2026-11-14
- 物种：36 / 36 有档案，36 / 36 有可用授权照片
- 图片：179 张（144 张 iNaturalist + 35 张 Pixabay），全部保存作者、许可、原始记录 ID、获取时间
- 录音：36 条（iNaturalist，许可与录音者逐条记录；本地为 30 秒试听预览，完整录音见来源页）
- 首屏：4 张横向授权照片（`public/media/hero`）+ 馆方用授权图片生成的 22 秒循环短片（`wild-world-loop.mp4`）
- 已知限制：98 张 iNaturalist 素材为 CC BY-NC，仅用于非商业展示；新闻配图只选可商用影像，并标注“示意图”

> 媒体文件已本地化到 `public/media`，避免外链失效。许可元数据仍指向原始记录页。

## 2. 已实现适配层，但未连接（需要密钥 / 授权）

| 来源 | 用途 | 需要的配置 | 当前行为 |
| --- | --- | --- | --- |
| [IUCN Red List](https://www.iucnredlist.org/) | 保护等级、趋势、威胁 | `IUCN_API_TOKEN`，并确认商业使用许可 | `lib/adapters/iucn.ts` 返回 `unconfigured`；页面使用编辑整理等级，标注评估年份、待复核 |
| [Xeno-canto](https://xeno-canto.org/) | 鸟类录音 | `XENO_CANTO_API_KEY`（API v3） | `lib/adapters/xenocanto.ts` 返回未配置；声音实验室使用 iNaturalist |
| [Macaulay Library](https://www.macaulaylibrary.org/) | 鸟类声音 / 影像 | `MACAULAY_LIBRARY_API_KEY` + 机构授权 | `lib/adapters/macaulay.ts` 返回未配置 |
| [Smithsonian Open Access](https://www.si.edu/openaccess) | 藏品影像 / 3D | `SMITHSONIAN_API_KEY` | `searchSmithsonian()` 返回未配置；3D 使用馆方原创程序化模型 |
| [Animal Diversity Web](https://animaldiversity.org/) | 形态 / 行为 / 繁殖 | 无公开 API，需人工阅读 | `getAdwReference()` 仅返回引用入口，不抓取 |
| [Wikipedia](https://www.wikipedia.org/) / [Wikidata](https://www.wikidata.org/) | 辅助核对 | 无密钥 | `fetchWikipediaSummary()` 可实时读取摘要，但默认页面内容仍为编辑整理 |
| [Catalogue of Life](https://www.catalogueoflife.org/) | 分类核对 | 无密钥 / 下载 | 分类以 GBIF Backbone 为准，CoL 作为核对来源 |
| [Paleobiology Database](https://paleobiodb.org/) | 化石与年代 | 无密钥 | 时间线引用公开资料，未自动同步 |
| [Open Tree of Life](https://tree.opentreeoflife.org/) | 系统发育 | 公开 | 时间线引用，分类树明确区别于系统发育树 |
| [BBC Science & Environment RSS](https://feeds.bbci.co.uk/news/science_and_environment/rss.xml) | 新闻 | 无 | **失败**：当前网络返回 HTTP 000；后台记录失败 |
| [WWF RSS](https://www.worldwildlife.org/rss/news) | 保护新闻 | 无 | **失败**：HTTP 403（Cloudflare） |
| National Geographic / Smithsonian 影片 | 纪录片 | 嵌入 / 转载授权 | 仅外链官方页面，不内嵌 |

### 适配层文件

```
lib/adapters/gbif.ts          已连接，实时观测
lib/adapters/inaturalist.ts   已连接，实时观测
lib/adapters/news-rss.ts      已连接，RSS 同步 + 失败日志
lib/adapters/iucn.ts          未配置（需 Token）
lib/adapters/xenocanto.ts     未配置（需 Key）
lib/adapters/macaulay.ts      未配置（需 Key / 授权）
lib/adapters/smithsonian.ts   未配置（需 Key）
lib/adapters/wikipedia.ts     实时摘要 + ADW 人工引用
lib/adapters/adw.ts           人工引用入口
```

## 3. 需要你提供或确认

### 3.1 API 密钥

| 变量 | 用途 | 获取方式 |
| --- | --- | --- |
| `IUCN_API_TOKEN` | 保护等级自动同步 | IUCN 官方申请，确认商业用途 |
| `XENO_CANTO_API_KEY` | 鸟类录音 | <https://xeno-canto.org/explore/api> |
| `MACAULAY_LIBRARY_API_KEY` | 声音 / 影像 | 康奈尔实验室授权 |
| `SMITHSONIAN_API_KEY` | 藏品与 3D | <https://api.data.gov/signup/> |
| `AI_API_KEY` / `AI_BASE_URL` / `AI_MODEL` | AI 问答 | OpenAI 或兼容服务 |
| `NEXT_PUBLIC_SUPABASE_URL` / `..._ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` | 数据库 | Supabase 项目设置 |

### 3.2 授权

- **首页视频**：提供你拥有商用授权的 4K 野生动植物视频（MP4 直链或对象存储地址）及署名。
- **纪录片**：BBC / PBS / National Geographic / Smithsonian 的嵌入或转载许可；否则保持官方外链。
- **商业影像**：若用于商业场景，需逐张确认 `commercial_use=true` 的素材；NC 素材必须替换。
- **IUCN 数据**：确认 API 条款与商业使用范围。

### 3.3 内容

- 中文物种正文如需英文版，请提供翻译或授权译者。
- 新闻中文摘要当前为编辑翻译 / 待生成；如需全量翻译，需要 AI 密钥或人工编辑。

## 4. 许可核验方法

### 图片

1. 打开摄影馆 → 点击图片。
2. 查看器显示：作者、来源、许可、获取时间、商用 / 演绎 / 下载权限。
3. 点击“来源页”跳转 iNaturalist 原始照片记录，核对作者与许可证。
4. 许可为 `CC BY-NC*` 时，不得商业使用；本站也不提供直接下载。

### 录音

1. 声音实验室 → 选择录音。
2. 查看录音者、地点、录制日期、声音类型、许可。
3. 打开“原始记录”核对 iNaturalist observation。
4. 商业用途需逐条确认；NC 录音不得商用。

### 新闻

- 详情页显示源站原始标题、发布日期、获取时间、RSS 源地址与原文链接。
- 本站不保存全文与图片；中文摘要明确标注为“编辑翻译”或“待生成”。

## 5. 数据质量规则

- 保护等级：必须带评估年份、分类单元与来源；IUCN 未接入前标记 `editorial`。
- 种群数字：没有明确来源不写具体数字；已知估计必须说明年份与不确定性。
- 分类与进化：分类树 ≠ 系统发育树；不凭外形相似推断亲缘。
- 观测点：只绘制真实记录；不把点变成分布面；说明采样偏差。
- 媒体：无来源、无许可的素材不进入馆藏；不使用占位图冒充真实摄影。
- 新闻：不伪造日期、来源、链接；AI 摘要未经审核不发布。

## 6. 更正流程

发现错误时请记录：

- 页面 URL
- 字段（学名 / 等级 / 年份 / 许可 / 链接）
- 你的来源与访问日期

管理员可在后台逐条修订审核状态与备注。原始来源记录（`source_url` / `source_record_id`）不应被覆盖。

当前未实现公开错误提交表单（避免用空按钮冒充功能）；可通过部署方管理员处理。