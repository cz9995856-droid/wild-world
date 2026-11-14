import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { NewsBrowser } from "@/components/news/news-browser";
import { getAllSpecies, getMediaAssets, getNews } from "@/lib/repository";
import { NEWS_SOURCES } from "@/lib/data/news-meta";
import { formatDate } from "@/lib/utils";
import { buildNewsVisuals } from "@/lib/news-visual";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "新闻中心",
  description: "只聚合允许的 RSS 来源，展示真实标题、发布日期、来源、原文链接与审核状态。",
};

export default async function NewsPage() {
  const [articles, species, media] = await Promise.all([getNews(), getAllSpecies(), getMediaAssets()]);
  const visuals = buildNewsVisuals(media, species);
  const connected = NEWS_SOURCES.filter((s) => s.status === "connected");

  return (
    <>
      <PageHeader
        kicker="Newsroom · 新闻中心"
        title="来自源站的野生动物新闻"
        description="这里不是虚构的“实时资讯”。标题、发布日期与链接来自允许的 RSS 源；中文摘要标注为编辑翻译或待生成，所有条目在发布前保留审核状态。"
        breadcrumbs={[{ label: "新闻中心" }]}
        meta={
          <div className="flex flex-wrap gap-2 lg:justify-end">
            <span className="chip">当前 {articles.length} 条</span>
            <span className="chip">{connected.length} 个源已连接</span>
            <span className="chip">最近同步 {articles[0] ? formatDate(articles[0].retrieved_at) : "待同步"}</span>
          </div>
        }
      />

      <div className="container-museum pb-20 pt-6">
        <div className="mb-8 grid gap-4 border border-[var(--line)] bg-[var(--surface-2)] p-4 sm:grid-cols-[1.4fr_1fr] sm:p-5">
          <div>
            <p className="label text-[var(--muted)]">Source status · 来源状态</p>
            <ul className="mt-3 grid gap-2 text-[11px] sm:grid-cols-2">
              {NEWS_SOURCES.map((s) => (
                <li key={s.id} className="flex items-start gap-2">
                  <span
                    className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                      s.status === "connected" ? "bg-[#2A6B51]" : s.status === "blocked" ? "bg-[var(--clay)]" : "bg-[var(--muted)]"
                    }`}
                  />
                  <span>
                    <a href={s.homepage} target="_blank" rel="noreferrer" className="hover:underline">{s.name}</a>
                    <span className="text-[var(--muted)]">
                      {" "}
                      · {s.status === "connected" ? "RSS 已连接" : s.status === "blocked" ? "网络阻断 / 失败" : "需授权"}
                    </span>
                    {s.note && <span className="mt-0.5 block text-[9.5px] leading-relaxed text-[var(--muted)]">{s.note}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div className="border-t border-[var(--line)] pt-4 text-[10px] leading-relaxed text-[var(--muted)] sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
            <p className="text-[var(--ink-soft)]">内容使用边界</p>
            <p className="mt-2">
              仅使用 RSS 提供的标题、摘要与链接，不转载全文与图片。发布日期来自源站；中文摘要不冒充 AI 自动生成，也不替代原文。
            </p>
            <Link href="/sources" className="mt-3 inline-block underline">查看完整来源与许可清单 →</Link>
          </div>
        </div>

        <NewsBrowser articles={articles} visuals={visuals} />
      </div>
    </>
  );
}