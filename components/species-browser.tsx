"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { Species } from "@/lib/types";
import { SpeciesCard } from "@/components/species-card";
import { GROUPS } from "@/lib/data/species";
import { EmptyState } from "@/components/ui/states";
import { CONSERVATION_META } from "@/lib/utils";

const SORTS = [
  { key: "curated", label: "馆藏顺序" },
  { key: "name", label: "按中文名" },
  { key: "status", label: "按保护等级" },
  { key: "weight", label: "按体重" },
  { key: "lifespan", label: "按寿命" },
];

export function SpeciesBrowser({
  species,
  covers,
  initialGroup = "all",
}: {
  species: Species[];
  covers: Record<string, string>;
  initialGroup?: string;
}) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState(initialGroup);
  const [sort, setSort] = useState("curated");
  const [statusFilter, setStatusFilter] = useState("all");
  const [limit, setLimit] = useState(12);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    let list = species.filter((s) => {
      if (group !== "all" && s.group !== group) return false;
      if (statusFilter !== "all" && s.conservation.status !== statusFilter) return false;
      if (!q) return true;
      return [s.name_cn, s.name_en, s.scientific_name, s.tagline, s.aliases.join(" "), s.taxonomy.family, s.taxonomy.order]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
    if (sort === "name") list = [...list].sort((a, b) => a.name_cn.localeCompare(b.name_cn, "zh"));
    if (sort === "status")
      list = [...list].sort(
        (a, b) => (CONSERVATION_META[b.conservation.status]?.order ?? 0) - (CONSERVATION_META[a.conservation.status]?.order ?? 0)
      );
    if (sort === "weight") list = [...list].sort((a, b) => b.weight.max_kg - a.weight.max_kg);
    if (sort === "lifespan") list = [...list].sort((a, b) => b.lifespan_years[1] - a.lifespan_years[1]);
    return list;
  }, [species, query, group, sort, statusFilter]);

  const shown = filtered.slice(0, limit);
  const activeFilters = (group !== "all" ? 1 : 0) + (statusFilter !== "all" ? 1 : 0) + (query ? 1 : 0);

  return (
    <div>
      <div className="sticky top-[106px] z-20 -mx-5 border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--paper)_93%,transparent)] px-5 py-3 backdrop-blur sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12 xl:-mx-16 xl:px-16">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setLimit(12);
                }}
                placeholder="搜索中文名、英文名、学名、科或目…"
                className="field pl-9"
                aria-label="搜索馆藏物种"
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
              <label className="sr-only" htmlFor="status-filter">保护等级</label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setLimit(12);
                }}
                className="select-field sm:w-40"
              >
                <option value="all">全部等级</option>
                {["CR", "EN", "VU", "NT", "LC"].map((code) => (
                  <option key={code} value={code}>
                    {CONSERVATION_META[code as keyof typeof CONSERVATION_META]?.label} {code}
                  </option>
                ))}
              </select>
              <label className="sr-only" htmlFor="sort-select">排序</label>
              <select
                id="sort-select"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="select-field sm:w-36"
              >
                {SORTS.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-0.5">
            {GROUPS.map((g) => {
              const active = group === g.key;
              return (
                <button
                  key={g.key}
                  onClick={() => {
                    setGroup(g.key);
                    setLimit(12);
                  }}
                  aria-pressed={active}
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-[11px] transition-colors ${
                    active
                      ? "border-[var(--forest)] bg-[var(--forest)] text-[#F5F1E7]"
                      : "border-[var(--line-strong)] text-[var(--muted)] hover:text-[var(--ink)]"
                  }`}
                >
                  {g.label}
                  <span className="ml-1.5 font-mono text-[9px] opacity-60">
                    {g.key === "all" ? species.length : species.filter((s) => s.group === g.key).length}
                  </span>
                </button>
              );
            })}
            <span className="ml-auto shrink-0 text-[10px] text-[var(--muted)]">
              <SlidersHorizontal size={11} className="mr-1 inline" />
              {filtered.length} / {species.length} 件档案
            </span>
          </div>
        </div>
      </div>

      <div className="pt-8">
        {shown.length === 0 ? (
          <EmptyState
            title="没有符合条件的物种"
            description="尝试减少筛选条件，或改用中文名、英文名与拉丁学名搜索。馆藏不包含未收录的物种。"
            action={
              <button
                onClick={() => {
                  setQuery("");
                  setGroup("all");
                  setStatusFilter("all");
                }}
                className="btn-outline"
              >
                重置筛选
              </button>
            }
          />
        ) : (
          <>
            <div className="grid gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {shown.map((s, i) => (
                <SpeciesCard key={s.slug} species={s} photo={covers[s.slug]} index={i} />
              ))}
            </div>
            {shown.length < filtered.length && (
              <div className="mt-12 flex flex-col items-center gap-3">
                <p className="text-[10px] text-[var(--muted)]">
                  已显示 {shown.length} / {filtered.length}
                </p>
                <button onClick={() => setLimit((l) => l + 12)} className="btn-outline">
                  加载更多档案
                </button>
              </div>
            )}
          </>
        )}
        {activeFilters > 0 && (
          <p className="mt-8 text-[10px] text-[var(--muted)]">
            已应用 {activeFilters} 个筛选条件 · 数据为「编辑整理」，点击档案查看来源与审核状态
          </p>
        )}
      </div>
    </div>
  );
}