import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, ArrowLeft, ShieldCheck } from "lucide-react";
import { getNews, getNewsBySlug, getAllSpecies } from "@/lib/repository";
import { NEWS_CATEGORY_LABEL, NEWS_SOURCES } from "@/lib/data/news-meta";
import { DataBadge } from "@/components/ui/badges";
import { OfficialSourceBar } from "@/components/ui/official-source";
import { formatDate, formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getNewsBySlug(slug);
  if (!article) return { title: "新闻未找到" };
  return {
    title: article.title_cn ?? article.title_original,
    description: (article.summary_cn ?? article.excerpt_original).slice(0, 150),
  };
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getNewsBySlug(slug);
  if (!article) notFound();
  const [all, species] = await Promise.all([getNews(), getAllSpecies()]);
  const related = all
    .filter((a) => a.id !== article.id && (a.category === article.category || a.source_name === article.source_name))
    .slice(0, 4);
  const relatedSpecies = species
    .filter((s) =>
      article.keywords.some((k) => s.name_cn.includes(k) || k.includes(s.name_cn) || s.name_en.toLowerCase().includes(k.toLowerCase()))
    )
    .slice(0, 3);
  const sourceInfo = NEWS_SOURCES.find((s) => s.id === article.source_id);

  return (
    <article className="pb-20 pt-[104px] sm:pt-[124px]">
      <div className="container-museum">
        <nav className="mb-8 flex flex-wrap items-center gap-2 text-[10px] text-[var(--muted)]" aria-label="面包屑">
          <Link href="/" className="hover:text-[var(--ink)]">首页</Link>
          <span>/</span>
          <Link href="/news" className="hover:text-[var(--ink)]">新闻中心</Link>
          <span>/</span>
          <span className="text-[var(--ink-soft)]">{NEWS_CATEGORY_LABEL[article.category]}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1fr_300px] lg:gap-16">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-[10px]">
              <span className="border border-[var(--line-strong)] px-2 py-1 text-[var(--clay)]">
                {NEWS_CATEGORY_LABEL[article.category]}
              </span>
              <span className="text-[var(--muted)]">{article.source_name}</span>
              <span className="text-[var(--muted)]">·</span>
              <time dateTime={article.published_at} className="text-[var(--muted)]">
                {formatDate(article.published_at)}
              </time>
              <DataBadge status={article.review_status} />
            </div>

            <h1 className="display mt-5 text-[34px] leading-[1.08] sm:text-[44px]">
              {article.title_cn ?? article.title_original}
            </h1>
            {article.title_cn && (
              <p className="mt-3 font-serif text-[15px] italic leading-relaxed text-[var(--muted)]">{article.title_original}</p>
            )}

            <OfficialSourceBar
              href={article.original_url}
              name={`${article.source_name} · ${article.title_original}`}
              note={`该报道发布于 ${formatDate(article.published_at)}，版权归原媒体所有。本馆只提供官方原文入口，不转载全文与图片。`}
              cta="阅读官方原文"
              className="mt-7"
            />

            <div className="mt-5 border-y border-[var(--line)] py-4">
              <p className="text-[13.5px] leading-relaxed text-[var(--ink-soft)]">
                {article.summary_cn ?? article.excerpt_original}
              </p>
              {article.summary_cn && (
                <p className="mt-3 text-[10px] leading-relaxed text-[var(--muted)]">
                  中文摘要为馆方编辑依据 RSS 摘要整理，未逐句核对原文。完整内容请阅读原文。
                </p>
              )}
            </div>

            <div className="mt-6 space-y-4 text-[12px] leading-relaxed text-[var(--muted)]">
              <p>
                本馆未转载原文全文与图片。下方提供源站链接，发布日期与标题以源站为准。若源站内容更新或撤稿，本条目不会自动改写原文。
              </p>
              <p>
                获取时间：{formatDateTime(article.retrieved_at)} · 语言：{article.language === "zh" ? "中文" : "英文"} ·
                摘要状态：
                {article.summary_status === "manual" && " 编辑翻译"}
                {article.summary_status === "pending_ai" && " 待生成（未配置 AI 摘要服务或尚未审核）"}
                {article.summary_status === "generated" && " AI 生成并经审核"}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href={article.original_url}
                target="_blank"
                rel="noreferrer"
                className="btn-primary"
              >
                阅读原文 <ExternalLink size={14} />
              </a>
              <a href={article.source_url} target="_blank" rel="noreferrer" className="btn-outline">
                {article.source_name} RSS
              </a>
            </div>

            {article.keywords.length > 0 && (
              <div className="mt-8">
                <p className="label text-[var(--muted)]">关键词</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {article.keywords.map((k) => (
                    <Link key={k} href={`/search?q=${encodeURIComponent(k)}`} className="chip hover:border-[var(--ink)]">
                      {k}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {article.review_status === "pending_review" && (
              <div className="mt-8 border border-[#A96246]/30 bg-[#A96246]/5 p-4">
                <p className="flex items-center gap-2 text-[12px] font-medium">
                  <ShieldCheck size={14} className="text-[var(--clay)]" />
                  该条目仍在审核队列
                </p>
                <p className="mt-2 text-[11px] leading-relaxed text-[var(--muted)]">
                  当前展示的是源站原始标题与 RSS 摘要，尚未完成中文编辑与事实复核。审核通过后会标记为「编辑整理」或「已核验」。
                </p>
              </div>
            )}

            {relatedSpecies.length > 0 && (
              <div className="mt-10 border-t border-[var(--line)] pt-6">
                <p className="label text-[var(--muted)]">馆藏关联物种</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {relatedSpecies.map((s) => (
                    <Link key={s.slug} href={`/encyclopedia/${s.slug}`} className="chip hover:border-[var(--ink)]">
                      {s.name_cn} · {s.name_en}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <div className="border border-[var(--line)] bg-[var(--surface)] p-4">
              <p className="label text-[var(--muted)]">Source · 来源</p>
              <p className="mt-3 text-[13px]">{article.source_name}</p>
              {sourceInfo && (
                <>
                  <p className="mt-1 text-[10.5px] leading-relaxed text-[var(--muted)]">{sourceInfo.focus}</p>
                  <p className="mt-3 text-[10px] text-[var(--muted)]">
                    状态：{sourceInfo.status === "connected" ? "RSS 已连接" : sourceInfo.status === "blocked" ? "网络阻断" : "需授权"}
                  </p>
                </>
              )}
              <a
                href={article.source_url}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-[10.5px] underline"
              >
                RSS 源地址 <ExternalLink size={10} />
              </a>
            </div>

            <div className="border border-[var(--line)] p-4">
              <p className="label text-[var(--muted)]">Rights · 版权说明</p>
              <p className="mt-2 text-[10px] leading-relaxed text-[var(--muted)]">{article.license_note}</p>
            </div>

            <div className="border border-[var(--line)] p-4">
              <p className="label text-[var(--muted)]">Timestamps</p>
              <dl className="mt-2 space-y-2 text-[10px] text-[var(--muted)]">
                <div><dt className="text-[var(--ink-soft)]">源站发布</dt><dd>{formatDateTime(article.published_at)}</dd></div>
                <div><dt className="text-[var(--ink-soft)]">本站获取</dt><dd>{formatDateTime(article.retrieved_at)}</dd></div>
              </dl>
            </div>

            <Link href="/news" className="inline-flex items-center gap-2 text-[11px] text-[var(--muted)] hover:text-[var(--ink)]">
              <ArrowLeft size={13} /> 返回新闻中心
            </Link>
          </aside>
        </div>

        {related.length > 0 && (
          <div className="mt-16 border-t border-[var(--line)] pt-8">
            <div className="mb-5 flex items-end justify-between">
              <h2 className="display text-[26px]">相关新闻</h2>
              <Link href="/news" className="text-[10px] text-[var(--muted)]">全部 →</Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((a) => (
                <Link key={a.id} href={`/news/${a.slug}`} className="group border border-[var(--line)] p-4 hover:border-[var(--line-strong)]">
                  <p className="text-[9px] uppercase tracking-widest text-[var(--clay)]">
                    {NEWS_CATEGORY_LABEL[a.category]}
                  </p>
                  <p className="mt-2 line-clamp-3 text-[12.5px] leading-snug">{a.title_cn ?? a.title_original}</p>
                  <p className="mt-3 text-[9.5px] text-[var(--muted)]">{a.source_name} · {formatDate(a.published_at)}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}