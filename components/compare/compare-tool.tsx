"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Plus, X } from "lucide-react";
import type { Species } from "@/lib/types";
import { ConservationBadge } from "@/components/ui/badges";
import { CONSERVATION_META, TREND_LABEL, formatRange, formatWeight } from "@/lib/utils";

const ROWS: Array<{
  label: string;
  get: (s: Species) => string;
  note?: string;
}> = [
  { label: "中文名", get: (s) => s.name_cn },
  { label: "英文名", get: (s) => s.name_en },
  { label: "学名", get: (s) => s.scientific_name },
  { label: "类群", get: (s) => s.group_label },
  { label: "目 / 科", get: (s) => `${s.taxonomy.order} / ${s.taxonomy.family}` },
  { label: "体长", get: (s) => formatRange(s.size.length_cm, "厘米"), note: "成体范围，测量口径见物种页" },
  { label: "肩高 / 体高", get: (s) => formatRange(s.size.height_cm, "厘米") },
  { label: "体重", get: (s) => formatWeight(s.weight.min_kg, s.weight.max_kg), note: "成体范围" },
  { label: "寿命", get: (s) => formatRange(s.lifespan_years, "年"), note: "上限估计，圈养与野外可能不同" },
  { label: "速度", get: (s) => (s.speed_kmh ? `${s.speed_kmh} km/h` : "资料待补充"), note: "运动口径不同，不宜直接横向比较生态意义" },
  { label: "食性", get: (s) => `${s.diet_type.join(" / ")}｜${s.diet}` },
  { label: "栖息地", get: (s) => s.habitat },
  { label: "分布区域", get: (s) => s.distribution.countries.join("、") },
  { label: "保护等级", get: (s) => `${s.conservation.status_label}（${s.conservation.status}）` },
  { label: "评估年份", get: (s) => `${s.conservation.assessment_year} 年` },
  { label: "种群趋势", get: (s) => TREND_LABEL[s.conservation.trend] },
];

export function CompareTool({
  species,
  covers,
  initialSlug,
}: {
  species: Species[];
  covers: Record<string, string>;
  initialSlug?: string;
}) {
  const fallback = [
    species.find((s) => s.slug === initialSlug)?.slug,
    species.find((s) => s.slug !== initialSlug)?.slug,
    species.filter((s) => ![initialSlug].includes(s.slug))[2]?.slug,
  ].filter(Boolean) as string[];

  const [slots, setSlots] = useState<string[]>(fallback.slice(0, 3));
  const selected = slots.map((slug) => species.find((s) => s.slug === slug) ?? null);

  function update(index: number, slug: string) {
    const next = [...slots];
    next[index] = slug;
    setSlots(next);
    const url = new URL(window.location.href);
    next.forEach((v, i) => url.searchParams.set(["a", "b", "c"][i], v));
    window.history.replaceState(null, "", url.toString());
  }

  function add() {
    if (slots.length < 3) setSlots([...slots, species.find((s) => !slots.includes(s.slug))?.slug ?? species[0].slug]);
  }

  const valid = selected.filter((s): s is Species => Boolean(s));

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((index) => {
          const sp = selected[index];
          return (
            <div key={index} className="border border-[var(--line)] bg-[var(--surface)]">
              {sp ? (
                <>
                  <div className="relative aspect-[16/10] overflow-hidden">
                    {covers[sp.slug] ? (
                      <Image src={covers[sp.slug]} alt={sp.name_cn} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" />
                    ) : (
                      <div className="h-full w-full bg-[var(--surface-2)]" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3 text-white">
                      <p className="display text-[24px]">{sp.name_cn}</p>
                      <p className="text-[10px] italic text-white/60">{sp.scientific_name}</p>
                    </div>
                    {slots.length > 1 && (
                      <button
                        onClick={() => setSlots(slots.filter((_, i) => i !== index))}
                        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white"
                        aria-label={`移除 ${sp.name_cn}`}
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                  <div className="p-3">
                    <select value={sp.slug} onChange={(e) => update(index, e.target.value)} className="select-field text-[11px]" aria-label="选择物种">
                      {species.map((s) => (
                        <option key={s.slug} value={s.slug}>{s.name_cn} · {s.name_en}</option>
                      ))}
                    </select>
                    <div className="mt-2 flex items-center justify-between">
                      <ConservationBadge code={sp.conservation.status} label={sp.conservation.status_label} />
                      <Link href={`/encyclopedia/${sp.slug}`} className="text-[10px] underline">档案 →</Link>
                    </div>
                  </div>
                </>
              ) : (
                <button
                  onClick={add}
                  className="flex min-h-[260px] w-full flex-col items-center justify-center gap-2 border-dashed text-[var(--muted)] hover:text-[var(--ink)]"
                >
                  <Plus size={18} />
                  <span className="text-[11px]">添加对比物种</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {slots.length < 3 && (
        <button onClick={add} className="btn-outline mt-3">
          <Plus size={14} /> 添加第三个物种
        </button>
      )}

      <div className="mt-8 overflow-x-auto border border-[var(--line)]">
        <table className="w-full min-w-[760px] border-collapse text-left text-[12px]">
          <thead>
            <tr className="bg-[var(--surface-2)]">
              <th className="w-32 border-b border-[var(--line)] p-3 text-[9px] uppercase tracking-widest text-[var(--muted)]">字段</th>
              {valid.map((s) => (
                <th key={s.slug} className="border-b border-[var(--line)] p-3">
                  <span className="text-[12px] font-medium">{s.name_cn}</span>
                  <span className="ml-2 font-mono text-[9px] text-[var(--muted)]">{s.conservation.status}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.label} className="border-b border-[var(--line)] last:border-0">
                <th className="p-3 align-top text-[10px] font-normal text-[var(--muted)]">
                  {row.label}
                  {row.note && <span className="mt-1 block text-[8.5px] leading-relaxed opacity-70">{row.note}</span>}
                </th>
                {valid.map((s) => (
                  <td key={s.slug} className="p-3 align-top text-[11.5px] leading-relaxed text-[var(--ink-soft)]">
                    {row.get(s)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="border border-[var(--line)] bg-[var(--surface-2)] p-4 text-[10px] leading-relaxed text-[var(--muted)]">
          <p className="text-[var(--ink-soft)]">比较规则</p>
          <p className="mt-2">
            缺失值显示为「资料待补充」，不会补零或猜测。不同来源的体长/寿命定义可能不同；冲突数据会保留出处，
            并在对应物种页标记待审核。速度的数字口径不同（冲刺、俯冲、游泳），表格不据此推断生态优势。
          </p>
        </div>
        <div className="border border-[var(--line)] bg-[var(--surface-2)] p-4 text-[10px] leading-relaxed text-[var(--muted)]">
          <p className="text-[var(--ink-soft)]">保护等级提示</p>
          <p className="mt-2">
            等级为 {valid.map((s) => `${s.conservation.assessment_year}`).join(" / ")} 年的评估结果，分类单元可能不同。
            保护等级不直接等于种群数量，也不代表未来趋势。
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {valid.map((s) => (
              <span key={s.slug} className="chip">
                {s.name_cn} · {CONSERVATION_META[s.conservation.status]?.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Link href="/rankings" className="inline-flex items-center gap-1.5 text-[11px] text-[var(--muted)] hover:text-[var(--ink)]">
          看看排行榜 <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}