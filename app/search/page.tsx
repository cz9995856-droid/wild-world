import type { Metadata } from "next";
import Link from "next/link";
import { Search as SearchIcon } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { getAllSpecies, getNews } from "@/lib/repository";
import { searchAll, suggestSpecies } from "@/lib/search";
import { ConservationBadge, DataBadge } from "@/components/ui/badges";
import { GROUPS } from "@/lib/data/species";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "搜索",
  description: "搜索 WILD WORLD 的物种档案、新闻、专区与实验室内容。",
};

const TYPE_LABEL = { species: "物种档案", news: "新闻", page: "专区" } as const;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const type = typeof params.type === "string" ? params.type : "all";
  const [species, news] = await Promise.all([getAllSpecies(), getNews()]);

  const results = q
    ? searchAll(q, species, news, {
        limit: 60,
        types: type === "all" ? ["species", "news", "page"] : [type as "species" | "news" | "page"],
      })
    : [];
  const suggestions = q ? suggestSpecies(q, species, 6) : [];
  const counts = q ? searchAll(q, species, news, { limit: 500 }) : [];
  const countOf = (t: string) => counts.filter((r) => r.type === t).length;

  return (
    <>
      <PageHeader
        kicker="Search · 全站搜索"
        title={q ? `「${q}」的搜索结果` : "搜索博物馆"}
        description="覆盖物种档案、新闻与专区页面。搜索基于本站已收录内容，不会凭空生成未收录的物种或新闻。"
        breadcrumbs={[{ label: "搜索" }]}
      />
      <div className="container-museum pb-20">
        <form action="/search" method="get" className="relative mb-8 max-w-3xl">
          <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="输入物种名、学名、关键词…"
            className="field h-14 pl-12 pr-28 text-[15px]"
            aria-label="搜索关键词"
          />
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary h-10">
            搜索
          </button>
        </form>

        {!q && (
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
            <div>
              <p className="label text-[var(--muted)]">Browse by group · 按类群浏览</p>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {GROUPS.filter((g) => g.key !== "all").map((g) => (
                  <Link
                    key={g.key}
                    href={`/encyclopedia?group=${g.key}`}
                    className="flex items-center justify-between border border-[var(--line)] px-4 py-3 text-[12px] hover:border-[var(--line-strong)]"
                  >
                    {g.label}
                    <span className="font-mono text-[9px] text-[var(--muted)]">
                      {species.filter((s) => s.group === g.key).length}
                    </span>
                  </Link>
                ))}
              </div>
              <div className="mt-8">
                <p className="label text-[var(--muted)]">Try · 试着搜索</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["大熊猫", "雪豹", "蓝鲸", "声音", "地图", "保护等级", "纪录片"].map((term) => (
                    <Link key={term} href={`/search?q=${encodeURIComponent(term)}`} className="chip hover:border-[var(--ink)]">
                      {term}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <p className="label text-[var(--muted)]">Popular species · 热门档案</p>
              <div className="mt-4 divide-y divide-[var(--line)] border-y border-[var(--line)]">
                {species.filter((s) => s.featured).slice(0, 6).map((s) => (
                  <Link key={s.slug} href={`/encyclopedia/${s.slug}`} className="flex items-center gap-3 py-3 hover:text-[var(--forest)]">
                    <span className="w-8 font-mono text-[9px] text-[var(--muted)]">{s.group_label}</span>
                    <span className="flex-1 text-[13px]">{s.name_cn} <span className="text-[10px] text-[var(--muted)]">{s.name_en}</span></span>
                    <ConservationBadge code={s.conservation.status} label={s.conservation.status_label} />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {q && (
          <>
            <div className="mb-6 flex flex-wrap items-center gap-2">
              {[
                { key: "all", label: "全部", count: counts.length },
                { key: "species", label: "物种档案", count: countOf("species") },
                { key: "news", label: "新闻", count: countOf("news") },
                { key: "page", label: "专区", count: countOf("page") },
              ].map((tab) => (
                <Link
                  key={tab.key}
                  href={`/search?q=${encodeURIComponent(q)}${tab.key === "all" ? "" : `&type=${tab.key}`}`}
                  className={`rounded-full border px-3.5 py-1.5 text-[11px] ${
                    type === tab.key
                      ? "border-[var(--forest)] bg-[var(--forest)] text-[#F5F1E7]"
                      : "border-[var(--line-strong)] text-[var(--muted)] hover:text-[var(--ink)]"
                  }`}
                >
                  {tab.label} <span className="ml-1 font-mono text-[9px] opacity-60">{tab.count}</span>
                </Link>
              ))}
              <span className="ml-auto text-[10px] text-[var(--muted)]">{results.length} 条结果</span>
            </div>

            {suggestions.length > 0 && type !== "news" && type !== "page" && (
              <div className="mb-6 flex flex-wrap items-center gap-2 text-[10px] text-[var(--muted)]">
                <span>相近物种：</span>
                {suggestions.map((s) => (
                  <Link key={s.slug} href={`/encyclopedia/${s.slug}`} className="chip hover:border-[var(--ink)]">
                    {s.name_cn}
                  </Link>
                ))}
              </div>
            )}

            {results.length === 0 ? (
              <div className="border border-dashed border-[var(--line-strong)] px-6 py-16 text-center">
                <p className="text-[14px]">没有找到匹配「{q}」的内容。</p>
                <p className="mt-2 text-[11.5px] leading-relaxed text-[var(--muted)]">
                  试试中文名、英文名或拉丁学名。馆藏未收录的物种不会被臆造。
                </p>
                <Link href="/encyclopedia" className="mt-5 inline-block btn-outline">浏览全部馆藏</Link>
              </div>
            ) : (
              <div className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
                {results.map((r) => (
                  <Link key={`${r.type}-${r.id}`} href={r.href} className="group flex items-start gap-4 py-5 hover:bg-[var(--surface-2)] sm:px-2">
                    <span className="mt-0.5 w-16 shrink-0 text-[9px] uppercase tracking-widest text-[var(--muted)]">
                      {TYPE_LABEL[r.type]}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] leading-snug group-hover:text-[var(--forest)]">{r.title}</span>
                      <span className="mt-1 block text-[11px] text-[var(--muted)]">{r.subtitle}</span>
                    </span>
                    {r.badge && <DataBadge status={r.type === "news" ? "pending" : "editorial"} className="hidden sm:inline-flex" />}
                    <span className="text-[var(--muted)] group-hover:translate-x-1">→</span>
                  </Link>
                ))}
              </div>
            )}

            <p className="mt-6 text-[10px] text-[var(--muted)]">
              新闻结果会显示源站发布日期（{formatDate(new Date())} 更新）。搜索索引仅包含本站已收录内容。
            </p>
          </>
        )}
      </div>
    </>
  );
}