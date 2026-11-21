"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { RefreshCw, Search, X } from "lucide-react";
import type { NewsArticle } from "@/lib/types";
import { NEWS_CATEGORIES } from "@/lib/data/news-meta";
import { DataBadge } from "@/components/ui/badges";
import { EmptyState } from "@/components/ui/states";
import { formatDate, relativeTime } from "@/lib/utils";
import { NewsArt } from "@/components/news/news-art";
import type { NewsVisual } from "@/lib/news-visual";

export function NewsBrowser({
  articles,
  visuals,
  generatedAt: initialGeneratedAt,
}: {
  articles: NewsArticle[];
  visuals?: Record<string, NewsVisual>;
  generatedAt?: string | null;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [source, setSource] = useState("all");
  const [status, setStatus] = useState("all");
  const [limit, setLimit] = useState(10);
  const [items, setItems] = useState(articles);
  const [generatedAt, setGeneratedAt] = useState<string | null>(initialGeneratedAt ?? null);
  const [refreshing, setRefreshing] = useState(false);

  async function refreshNews() {
    setRefreshing(true);
    try {
      const res = await fetch("/api/news", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.articles) && data.articles.length) {
          setItems(data.articles);
          setGeneratedAt(data.generated_at ?? null);
        }
      }
    } catch {
      // 网络失败时保留当前数据
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    refreshNews();
  }, []);

  const sources = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of items) map.set(a.source_name, (map.get(a.source_name) ?? 0) + 1);
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return items.filter((a) => {
      if (category !== "all" && a.category !== category) return false;
      if (source !== "all" && a.source_name !== source) return false;
      if (status !== "all" && a.review_status !== status) return false;
      if (!q) return true;
      return [a.title_original, a.title_cn ?? "", a.summary_cn ?? "", a.excerpt_original, a.keywords.join(" "), a.source_name]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [items, query, category, source, status]);

  const shown = filtered.slice(0, limit);

  return (
    <div>
      <div className="sticky top-[106px] z-20 -mx-5 border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--paper)_93%,transparent)] px-5 py-3 backdrop-blur sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12 xl:-mx-16 xl:px-16">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setLimit(10);
              }}
              placeholder="搜索标题、摘要、关键词或来源…"
              className="field pl-9"
              aria-label="搜索新闻"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[var(--muted)]"
                aria-label="清除搜索"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <select value={source} onChange={(e) => setSource(e.target.value)} className="select-field sm:w-40" aria-label="新闻来源">
              <option value="all">全部来源</option>
              {sources.map(([name, count]) => (
                <option key={name} value={name}>{name}（{count}）</option>
              ))}
            </select>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="select-field sm:w-36" aria-label="审核状态">
              <option value="all">全部状态</option>
              <option value="editorial">编辑整理</option>
              <option value="pending_review">待审核</option>
              <option value="verified">已核验</option>
            </select>
          </div>
        </div>
        <div className="no-scrollbar mt-3 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setCategory("all")}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] ${
              category === "all" ? "border-[var(--forest)] bg-[var(--forest)] text-[#F5F1E7]" : "border-[var(--line-strong)] text-[var(--muted)]"
            }`}
          >
            全部
          </button>
          {NEWS_CATEGORIES.map((c) => {
            const count = items.filter((a) => a.category === c.key).length;
            return (
              <button
                key={c.key}
                onClick={() => {
                  setCategory(c.key);
                  setLimit(10);
                }}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] ${
                  category === c.key
                    ? "border-[var(--forest)] bg-[var(--forest)] text-[#F5F1E7]"
                    : "border-[var(--line-strong)] text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                {c.label}
                <span className="ml-1.5 font-mono text-[9px] opacity-60">{count}</span>
              </button>
            );
          })}
          <span className="ml-auto shrink-0 text-[10px] text-[var(--muted)]">{filtered.length} 条</span>
        </div>
        <div className="mt-2 flex items-center gap-3 text-[10px] text-[var(--muted)]">
          <span>最近同步 {generatedAt ? new Date(generatedAt).toLocaleString("zh-CN", { hour12: false }) : "待同步"}</span>
          <button
            onClick={refreshNews}
            disabled={refreshing}
            className="inline-flex items-center gap-1 underline disabled:opacity-50"
            aria-label="检查新闻更新"
          >
            <RefreshCw size={11} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "正在检查更新…" : "检查更新"}
          </button>
        </div>
      </div>

      <div className="pt-4">
        {shown.length === 0 ? (
          <EmptyState
            title="没有匹配的新闻"
            description="尝试更换关键词或分类。新闻聚合只包含已接入的 RSS 源，未接入的媒体不会被伪造为已同步。"
            action={
              <button
                onClick={() => {
                  setQuery("");
                  setCategory("all");
                  setSource("all");
                  setStatus("all");
                }}
                className="btn-outline"
              >
                重置筛选
              </button>
            }
          />
        ) : (
          <div className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {shown.map((a) => (
              <article key={a.id} className="group grid gap-3 py-6 sm:grid-cols-[130px_1fr_auto] sm:gap-6">
                <div className="flex flex-row items-center gap-2 text-[9.5px] uppercase tracking-[0.12em] text-[var(--muted)] sm:flex-col sm:items-start sm:gap-1">
                  <span className="text-[var(--clay)]">{NEWS_CATEGORIES.find((c) => c.key === a.category)?.label}</span>
                  <time dateTime={a.published_at}>{formatDate(a.published_at)}</time>
                  <span>{relativeTime(a.published_at)}</span>
                </div>
                <div className="min-w-0">
                  <Link href={`/news/${a.slug}`} className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                    <NewsArt
                      visual={visuals?.[a.category] ?? null}
                      category={a.category}
                      className="h-36 w-full shrink-0 sm:h-24 sm:w-36"
                      sizes="(max-width: 640px) 100vw, 144px"
                    />
                    <div className="min-w-0">
                    <h3 className="text-[17px] leading-snug transition-colors group-hover:text-[var(--forest)] sm:text-[19px]">
                      {a.title_cn ?? a.title_original}
                    </h3>
                    {a.title_cn && (
                      <p className="mt-1 line-clamp-1 font-serif text-[10.5px] italic text-[var(--muted)]">英文原题：{a.title_original}</p>
                    )}
                    <p className="mt-2 line-clamp-2 text-[11.5px] leading-relaxed text-[var(--muted)]">
                      {a.summary_cn ?? "中文摘要待生成"}
                    </p>
                    </div>
                  </Link>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-[9.5px] text-[var(--muted)]">
                    <span>{a.source_name}</span>
                    <span>·</span>
                    <span>获取于 {a.retrieved_at.slice(0, 10)}</span>
                    <DataBadge status={a.review_status} />
                    {a.summary_status === "pending_ai" && <span className="text-[var(--clay)]">中文摘要待生成</span>}
                    {a.summary_status === "manual" && <span>中文摘要：编辑翻译</span>}
                  </div>
                </div>
                <div className="flex items-start justify-end">
                  <Link href={`/news/${a.slug}`} className="text-[11px] text-[var(--muted)] group-hover:text-[var(--ink)]">
                    阅读 →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {shown.length < filtered.length && (
          <div className="mt-10 flex flex-col items-center gap-3">
            <p className="text-[10px] text-[var(--muted)]">已显示 {shown.length} / {filtered.length}</p>
            <button onClick={() => setLimit((l) => l + 10)} className="btn-outline">加载更多新闻</button>
          </div>
        )}
      </div>
    </div>
  );
}