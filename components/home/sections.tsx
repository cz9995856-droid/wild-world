import Link from "next/link";
import Image from "next/image";
import type { MediaAsset, NewsArticle, Species, VideoEntry } from "@/lib/types";
import { SectionHeading } from "@/components/ui/section";
import { SpeciesCard } from "@/components/species-card";
import { ConservationBadge, DataBadge } from "@/components/ui/badges";
import { FavoriteButton } from "@/components/favorite-button";
import { Reveal } from "@/components/ui/reveal";
import { GROUPS } from "@/lib/data/species";
import { NEWS_CATEGORY_LABEL } from "@/lib/data/news-meta";
import { TREND_ARROW, TREND_LABEL, formatDate, relativeTime } from "@/lib/utils";
import { buildRankings } from "@/lib/rankings";
import { TIMELINE } from "@/lib/data/timeline";
import { NewsArt } from "@/components/news/news-art";
import type { NewsVisual } from "@/lib/news-visual";

export function NewsSection({
  news,
  total,
  sources,
  generatedAt,
  visuals,
}: {
  news: NewsArticle[];
  total: number;
  sources: number;
  generatedAt: string | null;
  visuals?: Record<string, NewsVisual>;
}) {
  const [lead, ...rest] = news;
  if (!lead) return null;
  return (
    <section id="news" className="relative scroll-mt-20 border-b border-[var(--line)] py-16 sm:py-20 lg:py-24">
      <div className="container-museum">
        <SectionHeading
          index="01"
          kicker="Newsroom · 新闻中心"
          title="来自野外的消息"
          description={
            <>
              聚合 {sources} 个允许 RSS 的公开来源，当前收录 {total} 条真实条目。标题、日期与原文链接均来自源站，
              中文摘要标注为编辑翻译或待审核，不伪造实时新闻。
            </>
          }
          action={
            <Link href="/news" className="btn-outline">
              进入新闻中心 →
            </Link>
          }
        />

        <div className="grid gap-4 lg:grid-cols-[1.45fr_1fr]">
          <Reveal>
            <Link
              href={`/news/${lead.slug}`}
              className="group relative flex h-full min-h-[360px] flex-col justify-between overflow-hidden border border-[#0B2118] bg-[#0B2118] p-6 text-[#EDE8DC] sm:p-9"
            >
              <div className="pointer-events-none absolute inset-0 opacity-[0.13]">
                <div className="absolute -right-16 -top-24 h-[360px] w-[360px] rounded-full border border-[#EDE8DC]" />
                <div className="absolute -right-2 -top-12 h-[240px] w-[240px] rounded-full border border-[#EDE8DC]" />
                <div className="absolute bottom-0 left-0 h-[1px] w-full bg-[#EDE8DC]" />
              </div>
              <div className="relative">
                <NewsArt
                  visual={visuals?.[lead.category] ?? null}
                  category={lead.category}
                  className="mb-7 aspect-[16/7] w-full border border-white/10"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  priority
                />
                <div className="flex flex-wrap items-center gap-2 text-[9.5px] uppercase tracking-[0.18em] text-[#A9BFA8]">
                  <span className="border border-[#A9BFA8]/40 px-2 py-0.5">
                    {NEWS_CATEGORY_LABEL[lead.category]}
                  </span>
                  <span>{lead.source_name}</span>
                  <span>·</span>
                  <span>{formatDate(lead.published_at)}</span>
                  <span className="ml-auto">
                    <DataBadge status={lead.review_status} />
                  </span>
                </div>
                <h3 className="display mt-8 max-w-[20ch] text-[30px] leading-[1.12] sm:text-[40px]">
                  {lead.title_cn ?? lead.title_original}
                </h3>
                {lead.title_cn && (
                  <p className="mt-3 line-clamp-2 max-w-2xl font-serif text-[12px] italic text-white/45">
                    {lead.title_original}
                  </p>
                )}
                <p className="mt-5 max-w-2xl text-[12.5px] leading-relaxed text-[#C7CEC2]">
                  {lead.summary_cn ?? lead.excerpt_original}
                </p>
              </div>
              <div className="relative mt-8 flex items-end justify-between gap-4 border-t border-white/15 pt-4">
                <div className="flex flex-wrap gap-2">
                  {lead.keywords.slice(0, 3).map((k) => (
                    <span key={k} className="border border-white/20 px-2 py-1 text-[9.5px] text-white/70">
                      {k}
                    </span>
                  ))}
                </div>
                <span className="inline-flex items-center gap-2 text-[11px] text-[#EDE8DC] transition-transform group-hover:translate-x-1">
                  阅读与原文链接 <span aria-hidden="true">→</span>
                </span>
              </div>
            </Link>
          </Reveal>

          <div className="flex flex-col divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {rest.slice(0, 4).map((article, index) => (
              <Reveal key={article.id} delay={80 + index * 50}>
                <Link href={`/news/${article.slug}`} className="group flex gap-4 py-4">
                  <NewsArt
                    visual={visuals?.[article.category] ?? null}
                    category={article.category}
                    className="h-20 w-24 shrink-0"
                    sizes="96px"
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-[9.5px] uppercase tracking-[0.14em] text-[var(--muted)]">
                      <span className="text-[var(--clay)]">{NEWS_CATEGORY_LABEL[article.category]}</span>
                      <span>·</span>
                      <span>{article.source_name}</span>
                      <span>·</span>
                      <span>{relativeTime(article.published_at)}</span>
                    </div>
                    <h4 className="mt-2 text-[14px] leading-snug transition-colors group-hover:text-[var(--forest)]">
                      {article.title_cn ?? article.title_original}
                    </h4>
                    <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-[var(--muted)]">
                      {article.summary_cn ?? article.excerpt_original}
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
            <div className="mt-auto flex items-center justify-between pt-4 text-[10px] text-[var(--muted)]">
              <span>
                RSS 快照 · {generatedAt ? formatDate(generatedAt) : "待同步"} · 抓取后进入审核队列
              </span>
              <Link href="/news" className="link-underline">
                全部 {total} 条 →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CategorySection({
  counts,
  images,
}: {
  counts: Record<string, number>;
  images: Record<string, string>;
}) {
  const tiles = GROUPS.filter((g) => g.key !== "all").map((g) => ({
    ...g,
    count: counts[g.key] ?? 0,
    image: images[g.key] ?? null,
  }));
  return (
    <section className="border-b border-[var(--line)] py-16 sm:py-20 lg:py-24">
      <div className="container-museum">
        <SectionHeading
          index="03"
          kicker="Taxonomy · 动物分类"
          title="按生命之树浏览馆藏"
          description="分类阶元来自 GBIF 分类骨架，物种页标注学名与分类路径。分类是检索工具，不等于演化距离。"
          action={
            <Link href="/encyclopedia" className="btn-outline">
              浏览全部物种 →
            </Link>
          }
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tiles.map((tile, index) => (
            <Reveal key={tile.key} delay={index * 60}>
              <Link
                href={`/encyclopedia?group=${tile.key}`}
                className="group relative flex aspect-[16/10] items-end overflow-hidden border border-[var(--line)]"
              >
                {tile.image ? (
                  <Image
                    src={tile.image}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[var(--surface-2)]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#07120c]/85 via-[#07120c]/20 to-transparent" />
                <div className="relative flex w-full items-end justify-between p-5 text-[#F5F1E7]">
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/55">
                      0{index + 1} / {tile.en}
                    </p>
                    <h3 className="display mt-1 text-[26px]">{tile.label}</h3>
                  </div>
                  <span className="font-mono text-[11px] text-white/70">{tile.count} 种</span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeaturedSection({ species, covers }: { species: Species[]; covers: Record<string, string> }) {
  return (
    <section className="border-b border-[var(--line)] bg-[var(--surface-2)] py-16 sm:py-20 lg:py-24">
      <div className="container-museum">
        <SectionHeading
          index="04"
          kicker="Collection · 精选百科"
          title="馆藏档案，逐条标注来源"
          description="每个物种档案都包含分类、形态、食性、繁殖、保护等级与地理分布。资料状态为「编辑整理」，等待逐条复核。"
          action={
            <Link href="/encyclopedia" className="btn-outline">
              全部 {species.length} 件档案 →
            </Link>
          }
        />
        <div className="grid gap-x-4 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
          {species.slice(0, 4).map((s, i) => (
            <Reveal key={s.slug} delay={i * 60}>
              <SpeciesCard species={s} photo={covers[s.slug]} index={i} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LabTeaser({ locale = "zh" }: { locale?: string }) {
  const modules = [
    { n: "01", title: "3D 动物形体", desc: "旋转、缩放，从多角度观察原创程序化教学模型。", href: "/lab#three-d" },
    { n: "02", title: "身体结构探索", desc: "点击象鼻、耳、眼、四肢，了解结构与功能。", href: "/lab#anatomy" },
    { n: "03", title: "声音实验室", desc: "播放田野录音，查看实时波形与频谱。", href: "/lab#sound" },
    { n: "04", title: "全球地理探索", desc: "在真实观测点上理解分布与采样的差异。", href: "/lab#geo" },
    { n: "05", title: "知识挑战", desc: "12 道题，含解释、难度与来源。", href: "/lab#quiz" },
    { n: "06", title: "喂养模拟", desc: "基于审核食性的教学模拟，明确非饲养建议。", href: "/lab#feeding" },
  ];
  return (
    <section className="relative overflow-hidden bg-[#0B2118] py-16 text-[#EDE8DC] sm:py-20 lg:py-24">
      <div className="absolute inset-0 opacity-[0.06]">
        <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full border border-white" />
        <div className="absolute left-1/2 top-24 h-[380px] w-[380px] -translate-x-1/2 rounded-full border border-white" />
      </div>
      <div className="container-museum relative">
        <SectionHeading
          index="05"
          kicker="Interaction Lab · 互动实验室"
          title="用身体、声音与地理去理解动物"
          description="六个可交互模块。模型与示意为馆方原创教学材料；外部数据实时标注获取时间，接口失败时显示真实状态。"
          invert
          action={
            <Link href="/lab" className="btn border border-white/30 text-[#EDE8DC] hover:bg-white/10">
              进入实验室 →
            </Link>
          }
        />
        <div className="grid gap-px overflow-hidden border border-white/15 bg-white/15 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m) => (
            <Link key={m.n} href={m.href} className="group relative bg-[#0B2118] p-6 transition-colors hover:bg-[#123526]">
              <div className="flex items-start justify-between">
                <span className="font-mono text-[10px] tracking-widest text-[#A9BFA8]">{m.n}</span>
                <span className="text-[#A9BFA8] transition-transform group-hover:translate-x-1">↗</span>
              </div>
              <h3 className="display mt-10 text-[22px]">{m.title}</h3>
              <p className="mt-2 text-[11.5px] leading-relaxed text-[#A9BFA8]">{m.desc}</p>
            </Link>
          ))}
        </div>
        <p className="mt-4 text-[10px] text-[#7F9688]">
          {locale === "zh"
            ? "3D 模型为馆方原创程序化几何，不是标本扫描；喂养模拟不是现实饲养建议。"
            : "3D models are original procedural geometry, not specimen scans. Feeding simulation is not husbandry advice."}
        </p>
      </div>
    </section>
  );
}

export function MapTeaser({ gbifReady }: { gbifReady: boolean }) {
  return (
    <section className="border-b border-[var(--line)] py-16 sm:py-20 lg:py-24">
      <div className="container-museum grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <div className="mb-4 flex items-center gap-3 text-[var(--muted)]">
            <span className="label">06</span>
            <span className="h-[1px] w-8 bg-[var(--line-strong)]" />
            <span className="label">Atlas · 全球动物地图</span>
          </div>
          <h2 className="display max-w-[16ch] text-[34px] sm:text-[44px] lg:text-[52px]">
            观测点，不等于分布范围。
          </h2>
          <p className="mt-5 max-w-md text-[13px] leading-relaxed text-[var(--muted)]">
            地图叠加 GBIF 与 iNaturalist 的真实观测记录，并明确区分「物种自然分布说明」与「实际采样点」。
            观测密度受采样努力影响，不能直接解读为种群密度。
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link href="/map" className="btn-primary">
              打开全球地图 →
            </Link>
            <span className="chip">
              <span className={`h-1.5 w-1.5 rounded-full ${gbifReady ? "bg-[#2A6B51]" : "bg-[#A96246]"}`} />
              {gbifReady ? "GBIF 公开 API 已连接" : "接口待检测"}
            </span>
          </div>
        </div>

        <div className="relative overflow-hidden border border-[var(--line)] bg-[#0B2118] p-6 sm:p-10">
          <div className="absolute inset-0 opacity-[0.16]">
            <svg viewBox="0 0 400 240" className="h-full w-full" aria-hidden="true">
              <g fill="none" stroke="#EDE8DC" strokeWidth="0.7">
                <ellipse cx="200" cy="120" rx="150" ry="96" />
                <ellipse cx="200" cy="120" rx="150" ry="60" />
                <ellipse cx="200" cy="120" rx="150" ry="24" />
                <path d="M200 24v192M120 34c40 50 40 122 0 172M280 34c-40 50-40 122 0 172" />
                <path d="M50 120h300" />
              </g>
            </svg>
          </div>
          <div className="relative">
            <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.2em] text-[#A9BFA8]">
              <span>MapLibre GL · Natural Earth</span>
              <span>01° grid</span>
            </div>
            <div className="mt-6 space-y-3">
              {[
                ["图层 A", "GBIF 观测记录", "实时请求 · 逐条许可"],
                ["图层 B", "iNaturalist 研究级记录", "实时请求 · 逐条署名"],
                ["图层 C", "IUCN 分布范围", "需要 API 授权 · 未接入"],
              ].map(([tag, title, meta]) => (
                <div key={title} className="flex items-start justify-between gap-4 border-t border-white/15 pt-3">
                  <div>
                    <p className="text-[10px] text-[#A9BFA8]">{tag}</p>
                    <p className="mt-1 text-[13px] text-[#EDE8DC]">{title}</p>
                  </div>
                  <p className="max-w-[150px] text-right text-[9.5px] leading-relaxed text-[#8FA697]">{meta}</p>
                </div>
              ))}
            </div>
            <Link
              href="/map"
              className="mt-7 flex items-center justify-between border border-white/25 px-4 py-3 text-[11px] text-[#EDE8DC] hover:bg-white/10"
            >
              进入实时地图 <span>→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ConservationSection({ species, covers }: { species: Species[]; covers: Record<string, string> }) {
  const focus = species
    .filter((s) => ["CR", "EN"].includes(s.conservation.status))
    .sort((a) => (a.conservation.status === "CR" ? -1 : 1))
    .slice(0, 3);
  return (
    <section className="border-b border-[var(--line)] bg-[var(--surface-2)] py-16 sm:py-20 lg:py-24">
      <div className="container-museum">
        <SectionHeading
          index="07"
          kicker="Red List · 濒危动物"
          title="极危，不只是一个标签"
          description="保护等级、评估年份、种群趋势与威胁逐项标注。IUCN API 尚未接入，当前等级为编辑整理并明确标记待复核。"
          action={
            <Link href="/conservation" className="btn-outline">
              濒危专题 →
            </Link>
          }
        />
        <div className="grid gap-4 lg:grid-cols-3">
          {focus.map((s, index) => (
            <Reveal key={s.slug} delay={index * 80}>
              <Link href={`/conservation#${s.slug}`} className="group block border border-[var(--line)] bg-[var(--surface)]">
                <div className="relative aspect-[16/10] overflow-hidden">
                  {covers[s.slug] ? (
                    <Image
                      src={covers[s.slug]}
                      alt={s.name_cn}
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full bg-[var(--surface-2)]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07120c]/80 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white">
                    <div>
                      <p className="font-mono text-[9px] uppercase tracking-widest text-white/60">{s.group_label}</p>
                      <h3 className="display mt-1 text-[26px]">{s.name_cn}</h3>
                    </div>
                    <ConservationBadge code={s.conservation.status} label={s.conservation.status_label} />
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between text-[10px] text-[var(--muted)]">
                    <span>评估年份 {s.conservation.assessment_year}</span>
                    <span>
                      趋势 {TREND_LABEL[s.conservation.trend]} {TREND_ARROW[s.conservation.trend]}
                    </span>
                  </div>
                  <p className="mt-3 line-clamp-2 text-[11.5px] leading-relaxed text-[var(--muted)]">
                    威胁：{s.conservation.threats.join("、")}
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PhotographySection({ photos }: { photos: MediaAsset[] }) {
  const selected: MediaAsset[] = [];
  const seen = new Set<string>();
  for (const p of photos) {
    if (seen.has(p.species_id ?? "")) continue;
    seen.add(p.species_id ?? "");
    selected.push(p);
    if (selected.length >= 6) break;
  }
  return (
    <section className="border-b border-[var(--line)] py-16 sm:py-20 lg:py-24">
      <div className="container-museum">
        <SectionHeading
          index="08"
          kicker="Photography · 高清摄影馆"
          title="每一张照片，都有作者与许可"
          description="影像来自 iNaturalist 开放数据，逐张保存作者、来源、许可、尺寸与获取时间。标记为 NC 的素材不用于商业用途，也不提供直接下载。"
          action={
            <Link href="/photography" className="btn-outline">
              进入摄影馆 →
            </Link>
          }
        />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {selected.map((p, i) => (
            <Link
              key={p.id}
              href="/photography"
              className={`group relative overflow-hidden bg-[var(--surface-2)] ${
                i === 0 ? "col-span-2 row-span-2 aspect-square lg:col-span-2 lg:row-span-2" : "aspect-square"
              }`}
            >
              <Image
                src={p.url}
                alt={`${p.title} · © ${p.author}`}
                fill
                sizes={i === 0 ? "(max-width: 1024px) 50vw, 33vw" : "16vw"}
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="absolute inset-x-0 bottom-0 hidden p-2 text-[8.5px] text-white/85 group-hover:block">
                © {p.author} · {p.license}
              </div>
            </Link>
          ))}
        </div>
        <p className="mt-4 flex flex-wrap items-center gap-3 text-[10px] text-[var(--muted)]">
          <span>共 {photos.length} 张授权影像</span>
          <span>·</span>
          <span>无授权图片不会被“填充”为默认素材</span>
          <Link href="/sources" className="link-underline ml-auto">
            查看许可说明 →
          </Link>
        </p>
      </div>
    </section>
  );
}

export function VideosSection({ videos, credits }: { videos: VideoEntry[]; credits?: Record<string, { author: string; license: string; source_url: string }> }) {
  return (
    <section className="border-b border-[var(--line)] bg-[var(--surface-2)] py-16 sm:py-20 lg:py-24">
      <div className="container-museum">
        <SectionHeading
          index="09"
          kicker="Films · 纪录片"
          title="去官方平台，看完整的自然"
          description="本馆只提供制作机构的官方观看入口，不下载、不转存、不内嵌完整影片。每条记录标注制作机构、时长口径与许可说明。"
          action={
            <Link href="/videos" className="btn-outline">
              纪录片专区 →
            </Link>
          }
        />
        <div className="grid gap-4 lg:grid-cols-3">
          {videos.slice(0, 3).map((v, i) => (
            <Reveal key={v.id} delay={i * 70}>
              <a
                href={v.official_url}
                target="_blank"
                rel="noreferrer"
                className="group block border border-[var(--line)] bg-[var(--surface)]"
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image
                    src={v.cover_url}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-[#07120c]/35" />
                  <span className="absolute left-4 top-4 border border-white/30 bg-black/30 px-2 py-1 text-[9px] uppercase tracking-widest text-white backdrop-blur">
                    Official link
                  </span>
                  <span className="absolute bottom-4 right-4 text-[10px] text-white/75">{v.producer}</span>
                  {credits?.[v.cover_url] && (
                    <span className="absolute bottom-1 left-4 text-[8px] text-white/50">
                      © {credits[v.cover_url].author} · {credits[v.cover_url].license}
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <p className="font-mono text-[9px] uppercase tracking-widest text-[var(--muted)]">
                    {v.region} · {v.year}
                  </p>
                  <h3 className="display mt-2 text-[22px]">{v.title_cn}</h3>
                  <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-[var(--muted)]">{v.description}</p>
                  <p className="mt-4 flex items-center justify-between border-t border-[var(--line)] pt-3 text-[10px] text-[var(--muted)]">
                    <span>{v.duration}</span>
                    <span className="transition-transform group-hover:translate-x-1">官方页面 ↗</span>
                  </p>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function DailySection({ species, cover }: { species: Species; cover?: string }) {
  return (
    <section className="border-b border-[var(--line)] py-16 sm:py-20 lg:py-24">
      <div className="container-museum">
        <SectionHeading
          index="10"
          kicker="Daily Specimen · 每日动物"
          title="今天，遇见这一种生命"
          description="每日推荐由日期确定性抽取；管理员可在后台指定。表达以「编辑整理」内容为基础，来源与更新时间公开。"
          action={
            <Link href="/encyclopedia" className="btn-outline">
              浏览全部馆藏 →
            </Link>
          }
        />
        <div className="grid gap-8 border border-[var(--line)] bg-[var(--surface)] lg:grid-cols-[1.1fr_1fr]">
          <div className="relative min-h-[320px] overflow-hidden lg:min-h-[440px]">
            {cover ? (
              <Image src={cover} alt={species.name_cn} fill sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" />
            ) : (
              <div className="h-full w-full bg-[var(--surface-2)]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#07120c]/75 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between text-white">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/60">
                  {new Date().toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" })} ·
                  每日馆藏
                </p>
                <h3 className="display mt-2 text-[38px]">{species.name_cn}</h3>
                <p className="mt-1 text-[12px] italic text-white/65">{species.scientific_name}</p>
              </div>
              <ConservationBadge code={species.conservation.status} label={species.conservation.status_label} size="md" />
            </div>
          </div>
          <div className="flex flex-col p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <DataBadge status={species.data_status} />
              <span className="chip">{species.group_label}</span>
              <span className="chip">{species.diet_type.join(" / ")}</span>
            </div>
            <p className="mt-5 text-[13.5px] leading-relaxed text-[var(--ink-soft)]">{species.summary}</p>
            <ul className="mt-6 space-y-3">
              {species.fun_facts.slice(0, 2).map((fact, i) => (
                <li key={fact} className="flex gap-3 border-t border-[var(--line)] pt-3">
                  <span className="font-mono text-[10px] text-[var(--muted)]">0{i + 1}</span>
                  <span className="text-[11.5px] leading-relaxed text-[var(--muted)]">{fact}</span>
                </li>
              ))}
            </ul>
            <div className="mt-auto flex flex-wrap items-center gap-3 pt-6">
              <Link href={`/encyclopedia/${species.slug}`} className="btn-primary">
                打开物种档案 →
              </Link>
              <FavoriteButton slug={species.slug} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function RankingsSection({ species }: { species: Species[] }) {
  const boards = buildRankings(species);
  const weight = boards.find((b) => b.id === "weight");
  const speed = boards.find((b) => b.id === "speed");
  const endangered = boards.find((b) => b.id === "endangered");
  return (
    <section className="border-b border-[var(--line)] bg-[var(--surface-2)] py-16 sm:py-20 lg:py-24">
      <div className="container-museum">
        <SectionHeading
          index="11"
          kicker="Rankings · 排行榜"
          title="只比较可比的数据"
          description="每个榜单标注数据条件与来源。俯冲速度不与巡航速度并列，圈养寿命不与野外寿命混用，保护等级不与种群数量混排。"
          action={
            <Link href="/rankings" className="btn-outline">
              查看完整榜单 →
            </Link>
          }
        />
        <div className="grid gap-4 lg:grid-cols-3">
          {[weight, speed, endangered].map((board, bi) => (
            <div key={board?.id ?? bi} className="border border-[var(--line)] bg-[var(--surface)] p-5">
              <div className="flex items-center justify-between">
                <h3 className="display text-[21px]">{board?.title ?? "待补充"}</h3>
                <span className="label text-[var(--muted)]">{String(bi + 1).padStart(2, "0")}</span>
              </div>
              <p className="mt-1 text-[10px] text-[var(--muted)]">{board?.subtitle}</p>
              <ol className="mt-4 space-y-2.5">
                {board?.entries.slice(0, 3).map((entry, i) => (
                  <li key={entry.species.slug}>
                    <Link href={`/encyclopedia/${entry.species.slug}`} className="flex items-center gap-3 group">
                      <span className="font-mono text-[10px] text-[var(--muted)]">0{i + 1}</span>
                      <span className="flex-1 truncate text-[12px] group-hover:underline">{entry.species.name_cn}</span>
                      <span className="font-mono text-[11px] text-[var(--ink-soft)]">{entry.display}</span>
                    </Link>
                  </li>
                ))}
              </ol>
              <p className="mt-4 border-t border-[var(--line)] pt-3 text-[9.5px] leading-relaxed text-[var(--muted)]">
                {board?.caveat}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TimelineTeaser() {
  return (
    <section className="border-b border-[var(--line)] py-16 sm:py-20 lg:py-24">
      <div className="container-museum">
        <SectionHeading
          index="12"
          kicker="Deep Time · 进化时间线"
          title="把今天放回 5 亿年里"
          description="时间线引用 Paleobiology Database 与 Open Tree of Life 的公开资料。分类关系与进化关系分开表达，不凭外形相似推断亲缘。"
          action={
            <Link href="/timeline" className="btn-outline">
              打开时间线 →
            </Link>
          }
        />
        <div className="relative overflow-hidden border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-10">
          <div className="absolute inset-x-0 top-1/2 h-[1px] bg-[var(--line-strong)]" />
          <div className="relative grid gap-6 sm:grid-cols-4 lg:grid-cols-7">
            {TIMELINE.map((era) => (
              <div key={era.id} className="min-w-0">
                <div className="mb-4 flex h-3 items-center">
                  <span className="h-2 w-2 rounded-full border border-[var(--forest)] bg-[var(--paper)]" />
                </div>
                <p className="font-mono text-[9px] uppercase tracking-widest text-[var(--muted)]">{era.range_label}</p>
                <p className="mt-2 text-[12px] leading-snug">{era.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function AiTeaser() {
  return (
    <section className="border-b border-[var(--line)] bg-[var(--surface-2)] py-16 sm:py-20">
      <div className="container-museum flex flex-col items-start justify-between gap-6 border border-[var(--line)] bg-[var(--surface)] p-8 sm:flex-row sm:items-center sm:p-10">
        <div>
          <p className="label text-[var(--muted)]">AI Q&A · 动物问答</p>
          <h2 className="display mt-2 max-w-[24ch] text-[28px] sm:text-[36px]">
            先检索馆藏，再组织回答。
          </h2>
          <p className="mt-3 max-w-xl text-[12px] leading-relaxed text-[var(--muted)]">
            支持中英文。未配置模型密钥时，使用本地知识库检索模式；未知信息会明确说明，不编造保护等级或种群数量。
          </p>
        </div>
        <Link href="/ai" className="btn-primary shrink-0">
          向博物馆提问 →
        </Link>
      </div>
    </section>
  );
}

export function CompareTeaser({ species }: { species: Species[] }) {
  return (
    <section className="border-b border-[var(--line)] py-16">
      <div className="container-museum flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <p className="label text-[var(--muted)]">Compare · 动物对比</p>
          <h2 className="display mt-2 text-[26px]">把三种动物放在同一张桌上</h2>
          <p className="mt-2 text-[12px] text-[var(--muted)]">
            可比字段并排呈现：体长、体重、寿命、速度、食性、栖息地与保护等级。缺失值不会被补零。
          </p>
        </div>
        <Link href="/compare" className="btn-outline shrink-0">
          开始对比（{species.length} 种可选）→
        </Link>
      </div>
    </section>
  );
}