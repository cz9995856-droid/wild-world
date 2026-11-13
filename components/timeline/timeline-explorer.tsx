"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, GitBranch, Info } from "lucide-react";
import type { Species, TimelineEra } from "@/lib/types";
import { PHYLOGENY_NOTES, TAXONOMY_SOURCE } from "@/lib/data/timeline";

export function TimelineExplorer({ eras, species }: { eras: TimelineEra[]; species: Species[] }) {
  const [active, setActive] = useState(eras[0]?.id ?? "");
  const current = eras.find((e) => e.id === active) ?? eras[0];
  const related = useMemo(
    () => current?.species_slugs.map((slug) => species.find((s) => s.slug === slug)).filter((s): s is Species => Boolean(s)) ?? [],
    [current, species]
  );

  const total = eras.reduce((sum, e) => sum + Math.max(e.mya_start - e.mya_end, 0.6), 0);

  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
      <div>
        <div className="mb-6">
          <div className="flex h-3 w-full overflow-hidden border border-[var(--line)]">
            {eras.map((era, i) => {
              const width = (Math.max(era.mya_start - era.mya_end, 0.6) / total) * 100;
              const colors = ["#1B3A2D", "#2A6B51", "#6F8F72", "#A9BFA8", "#C29B4A", "#A96246", "#5D5B4F"];
              return (
                <button
                  key={era.id}
                  onClick={() => setActive(era.id)}
                  style={{ width: `${width}%`, background: colors[i % colors.length] }}
                  className={`relative h-full transition-opacity ${active === era.id ? "opacity-100" : "opacity-60 hover:opacity-90"}`}
                  aria-label={`选择 ${era.title}`}
                  title={era.title}
                />
              );
            })}
          </div>
          <div className="mt-2 flex justify-between font-mono text-[9px] text-[var(--muted)]">
            <span>538.8 Ma</span>
            <span>显生宙 · Phanerozoic</span>
            <span>今天</span>
          </div>
        </div>

        <ol className="relative border-l border-[var(--line-strong)] pl-6">
          {eras.map((era) => {
            const isActive = era.id === active;
            return (
              <li key={era.id} className="relative pb-6 last:pb-0">
                <span
                  className={`absolute -left-[31px] top-1 flex h-3 w-3 items-center justify-center rounded-full border-2 ${
                    isActive ? "border-[var(--forest)] bg-[var(--forest)]" : "border-[var(--line-strong)] bg-[var(--paper)]"
                  }`}
                />
                <button onClick={() => setActive(era.id)} className="w-full text-left">
                  <div className="flex flex-wrap items-baseline gap-3">
                    <span className="font-mono text-[9.5px] tracking-wider text-[var(--muted)]">{era.range_label}</span>
                    <span className={`text-[10px] ${isActive ? "text-[var(--clay)]" : "text-[var(--muted)]"}`}>
                      {era.node_kind === "fossil" ? "化石记录" : era.node_kind === "node" ? "关键节点" : "时期"}
                    </span>
                  </div>
                  <h3 className={`display mt-1 text-[24px] transition-colors ${isActive ? "text-[var(--ink)]" : "text-[var(--ink-soft)]"}`}>
                    {era.title}
                  </h3>
                  {isActive && (
                    <div className="mt-3">
                      <p className="max-w-xl text-[11.5px] leading-relaxed text-[var(--muted)]">{era.description}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {era.highlights.map((h) => (
                          <span key={h} className="chip">{h}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      <aside className="space-y-4">
        <div className="border border-[var(--line)] bg-[var(--surface)] p-5">
          <p className="label text-[var(--muted)]">Selected node</p>
          <h2 className="display mt-2 text-[28px]">{current?.title}</h2>
          <p className="mt-1 font-mono text-[10px] text-[var(--muted)]">{current?.range_label}</p>
          <p className="mt-4 text-[11.5px] leading-relaxed text-[var(--muted)]">{current?.description}</p>
          {related.length > 0 && (
            <>
              <p className="label mt-5 text-[var(--muted)]">相关馆藏</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {related.map((s) => (
                  <Link key={s.slug} href={`/encyclopedia/${s.slug}`} className="chip hover:border-[var(--ink)]">
                    {s.name_cn}
                  </Link>
                ))}
              </div>
            </>
          )}
          <a
            href={current?.source_url}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex items-center gap-1 text-[10px] underline"
          >
            {current?.source_name} <ExternalLink size={10} />
          </a>
        </div>

        <div className="border border-[var(--line)] bg-[var(--surface-2)] p-5">
          <p className="flex items-center gap-2 text-[11px] font-medium">
            <Info size={13} className="text-[var(--clay)]" /> 证据边界
          </p>
          <p className="mt-2 text-[10.5px] leading-relaxed text-[var(--muted)]">
            时间线中的年代为公开资料的编辑整理，具体节点年代会随研究修订。本站不提供未标注来源的“最新发现”，
            也不根据外形相似推断亲缘关系。
          </p>
        </div>
      </aside>
    </div>
  );
}

export function TaxonomyTree({ species }: { species: Species[] }) {
  const tree = useMemo(() => {
    const classes = new Map<string, Map<string, Map<string, Species[]>>>();
    for (const s of species) {
      if (!classes.has(s.taxonomy.class)) classes.set(s.taxonomy.class, new Map());
      const orders = classes.get(s.taxonomy.class)!;
      if (!orders.has(s.taxonomy.order)) orders.set(s.taxonomy.order, new Map());
      const families = orders.get(s.taxonomy.order)!;
      if (!families.has(s.taxonomy.family)) families.set(s.taxonomy.family, []);
      families.get(s.taxonomy.family)!.push(s);
    }
    return [...classes.entries()];
  }, [species]);

  return (
    <div>
      <div className="mb-4 flex items-center gap-2 text-[10px] text-[var(--muted)]">
        <GitBranch size={13} />
        林奈分类树（taxonomic classification）· 不是系统发育树
      </div>
      <div className="space-y-2">
        {tree.map(([className, orders]) => (
          <details key={className} className="group border border-[var(--line)] bg-[var(--surface)]">
            <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-[12.5px]">
              <span>{className}</span>
              <span className="font-mono text-[9px] text-[var(--muted)]">
                {[...orders.values()].reduce((n, f) => n + [...f.values()].reduce((m, arr) => m + arr.length, 0), 0)} 种
              </span>
            </summary>
            <div className="border-t border-[var(--line)] px-4 py-2">
              {[...orders.entries()].map(([orderName, families]) => (
                <details key={orderName} className="border-b border-[var(--line)] py-2 last:border-0">
                  <summary className="flex cursor-pointer items-center justify-between text-[11.5px] text-[var(--ink-soft)]">
                    <span>{orderName}</span>
                    <span className="font-mono text-[9px] text-[var(--muted)]">
                      {[...families.values()].reduce((m, arr) => m + arr.length, 0)}
                    </span>
                  </summary>
                  <div className="mt-2 space-y-2 pl-3">
                    {[...families.entries()].map(([familyName, list]) => (
                      <div key={familyName}>
                        <p className="text-[10px] uppercase tracking-wide text-[var(--muted)]">{familyName}</p>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {list.map((s) => (
                            <Link key={s.slug} href={`/encyclopedia/${s.slug}`} className="chip hover:border-[var(--ink)]">
                              {s.name_cn}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </details>
        ))}
      </div>
      <p className="mt-3 text-[9.5px] leading-relaxed text-[var(--muted)]">
        {TAXONOMY_SOURCE.note}{" "}
        <a href={TAXONOMY_SOURCE.url} target="_blank" rel="noreferrer" className="underline">
          {TAXONOMY_SOURCE.name}
        </a>
      </p>
    </div>
  );
}

export function PhylogenyNotes() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {PHYLOGENY_NOTES.map((note) => (
        <div key={note.title} className="border border-[var(--line)] bg-[var(--surface)] p-5">
          <h3 className="text-[12.5px] font-medium">{note.title}</h3>
          <p className="mt-2 text-[10.5px] leading-relaxed text-[var(--muted)]">{note.body}</p>
        </div>
      ))}
    </div>
  );
}