"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ExternalLink } from "lucide-react";
import type { Species } from "@/lib/types";
import { ConservationBadge, DataBadge } from "@/components/ui/badges";
import { CONSERVATION_META, TREND_ARROW, TREND_LABEL, formatDate } from "@/lib/utils";

export function ConservationBrowser({
  species,
  covers,
}: {
  species: Species[];
  covers: Record<string, string>;
}) {
  const [status, setStatus] = useState("all");
  const filtered = species.filter((s) => (status === "all" ? true : s.conservation.status === status));
  const codes = ["CR", "EN", "VU", "NT", "LC"] as const;

  return (
    <div>
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {codes.map((code) => {
          const meta = CONSERVATION_META[code];
          const count = species.filter((s) => s.conservation.status === code).length;
          return (
            <button
              key={code}
              onClick={() => setStatus(status === code ? "all" : code)}
              aria-pressed={status === code}
              className={`border p-4 text-left transition-all ${status === code ? "border-[var(--ink)] " : "border-[var(--line)] hover:border-[var(--line-strong)]"}`}
            >
              <span className="inline-flex items-center gap-1.5 text-[9.5px]">
                <span className="h-2 w-2 rounded-full" style={{ background: meta.dot }} />
                {meta.label} {code}
              </span>
              <p className="display mt-2 text-[30px]">{count}</p>
              <p className="text-[9px] text-[var(--muted)]">件馆藏档案</p>
            </button>
          );
        })}
      </div>

      <div className="space-y-5">
        {filtered.map((s) => (
          <article key={s.slug} id={s.slug} className="scroll-mt-28 border border-[var(--line)] bg-[var(--surface)]">
            <div className="grid gap-0 lg:grid-cols-[320px_1fr]">
              <Link href={`/encyclopedia/${s.slug}`} className="relative aspect-[16/10] overflow-hidden lg:aspect-auto">
                {covers[s.slug] ? (
                  <Image src={covers[s.slug]} alt={s.name_cn} fill sizes="(max-width: 1024px) 100vw, 320px" className="object-cover" />
                ) : (
                  <div className="h-full w-full bg-[var(--surface-2)]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent lg:bg-gradient-to-r" />
                <div className="absolute bottom-3 left-3 text-white">
                  <p className="font-mono text-[9px] uppercase tracking-widest text-white/60">{s.group_label}</p>
                  <p className="display mt-1 text-[24px]">{s.name_cn}</p>
                  <p className="text-[10px] italic text-white/60">{s.scientific_name}</p>
                </div>
              </Link>
              <div className="p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <ConservationBadge code={s.conservation.status} label={s.conservation.status_label} size="md" />
                    <span className="chip">评估 {s.conservation.assessment_year}</span>
                    <span className="chip">
                      趋势 {TREND_LABEL[s.conservation.trend]} {TREND_ARROW[s.conservation.trend]}
                    </span>
                    <DataBadge status={s.conservation.source.review_status} />
                  </div>
                  <Link href={`/encyclopedia/${s.slug}`} className="inline-flex items-center gap-1 text-[11px] text-[var(--muted)] hover:text-[var(--ink)]">
                    打开档案 <ArrowRight size={11} />
                  </Link>
                </div>

                <p className="mt-4 max-w-3xl text-[11.5px] leading-relaxed text-[var(--muted)]">
                  {s.conservation.population_note}
                </p>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="label text-[var(--muted)]">威胁</p>
                    <ul className="mt-2 space-y-1 text-[11px] text-[var(--ink-soft)]">
                      {s.conservation.threats.slice(0, 4).map((t) => (
                        <li key={t} className="flex gap-2"><span className="text-[var(--clay)]">·</span>{t}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="label text-[var(--muted)]">保护措施</p>
                    <ul className="mt-2 space-y-1 text-[11px] text-[var(--ink-soft)]">
                      {s.conservation.measures.slice(0, 3).map((m) => (
                        <li key={m} className="flex gap-2"><span className="text-[var(--forest)]">✓</span>{m}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] pt-3 text-[9.5px] text-[var(--muted)]">
                  <span>
                    来源：{s.conservation.source.source_name} · 获取 {formatDate(s.conservation.source.retrieved_at)} ·
                    数据版本待 IUCN API 接入复核
                  </span>
                  <a href={s.conservation.source.source_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline">
                    评估来源 <ExternalLink size={10} />
                  </a>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <p className="mt-8 text-[10px] leading-relaxed text-[var(--muted)]">
        「极危」不等于「即将灭绝」的精确时间表，「无危」也不代表没有威胁。保护等级是特定年份、特定分类单元的评估结论。
        本站不提供未经来源支持的种群数字；IUCN API 尚未接入，等级为编辑整理并明确标记待复核。
      </p>
    </div>
  );
}