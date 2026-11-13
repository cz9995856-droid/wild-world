"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Target, Utensils } from "lucide-react";
import type { FeedingPlan, Species } from "@/lib/types";

export function FeedingLab({
  plans,
  species,
}: {
  plans: FeedingPlan[];
  species: Species[];
}) {
  const [slug, setSlug] = useState(plans[0]?.species_slug ?? "");
  const plan = plans.find((p) => p.species_slug === slug) ?? plans[0];
  const sp = species.find((s) => s.slug === slug);
  const [mix, setMix] = useState<Record<string, number>>(() =>
    Object.fromEntries((plans[0]?.items ?? []).map((item, i) => [item.name, i === 0 ? 55 : 15]))
  );
  const [checked, setChecked] = useState(false);

  const total = useMemo(() => Object.values(mix).reduce((a, b) => a + b, 0), [mix]);
  const normalized = useMemo(() => {
    if (!plan) return {} as Record<string, number>;
    const values = plan.items.map((item) => mix[item.name] ?? 0);
    const sum = values.reduce((a, b) => a + b, 0) || 1;
    return Object.fromEntries(plan.items.map((item, i) => [item.name, Math.round((values[i] / sum) * 100)]));
  }, [mix, plan]);

  const deviation = useMemo(() => {
    if (!plan) return 0;
    return plan.items.reduce((sum, item) => sum + Math.abs((normalized[item.name] ?? 0) - item.share_pct), 0) / 2;
  }, [normalized, plan]);

  function switchSpecies(next: string) {
    setSlug(next);
    const p = plans.find((x) => x.species_slug === next);
    setMix(Object.fromEntries((p?.items ?? []).map((item, i) => [item.name, i === 0 ? 55 : 15])));
    setChecked(false);
  }

  if (!plan || !sp) return null;

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 border border-[var(--line)] bg-[var(--surface-2)] p-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="label text-[var(--muted)]" htmlFor="feed-species">选择物种</label>
          <select id="feed-species" value={slug} onChange={(e) => switchSpecies(e.target.value)} className="select-field mt-2">
            {plans.map((p) => {
              const s = species.find((x) => x.slug === p.species_slug);
              return (
                <option key={p.species_slug} value={p.species_slug}>
                  {s?.name_cn ?? p.species_slug} · {s?.name_en ?? ""}
                </option>
              );
            })}
          </select>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-[var(--muted)]">
          <Utensils size={13} />
          食性结构模拟 · 非饲养建议
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="border border-[var(--line)] bg-[var(--surface)] p-5">
          <h3 className="display text-[24px]">{sp.name_cn} 的食性结构</h3>
          <p className="mt-2 text-[11.5px] leading-relaxed text-[var(--muted)]">{plan.diet_summary}</p>
          <p className="mt-2 text-[10px] text-[var(--muted)]">摄食节律：{plan.feeding_frequency}</p>

          <div className="mt-6 space-y-5">
            {plan.items.map((item) => (
              <div key={item.name}>
                <div className="flex items-baseline justify-between gap-3">
                  <label htmlFor={`mix-${item.name}`} className="text-[12px]">{item.name}</label>
                  <span className="font-mono text-[11px] text-[var(--muted)]">
                    {mix[item.name] ?? 0} → {normalized[item.name] ?? 0}%
                  </span>
                </div>
                <input
                  id={`mix-${item.name}`}
                  type="range"
                  min={0}
                  max={100}
                  value={mix[item.name] ?? 0}
                  onChange={(e) => {
                    setMix((m) => ({ ...m, [item.name]: Number(e.target.value) }));
                    setChecked(false);
                  }}
                  className="mt-2 h-1 w-full accent-[var(--forest)]"
                />
                <p className="mt-1 text-[9.5px] leading-relaxed text-[var(--muted)]">{item.note}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-[var(--line)] pt-4">
            <p className="text-[10px] text-[var(--muted)]">滑块总值 {total}，计算时按比例归一化</p>
            <button onClick={() => setChecked(true)} className="btn-primary">
              <Target size={14} /> 对照参考结构
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="border border-[var(--line)] bg-[var(--surface-2)] p-4">
            <p className="label text-[var(--muted)]">Reference · 参考比例</p>
            <div className="mt-3 space-y-2">
              {plan.items.map((item) => (
                <div key={item.name}>
                  <div className="flex justify-between text-[10px]">
                    <span>{item.name}</span>
                    <span className="font-mono">{item.share_pct}%</span>
                  </div>
                  <div className="mt-1 h-[4px] bg-[var(--paper)]">
                    <div className="h-full bg-[var(--sage)]" style={{ width: `${item.share_pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {checked && (
            <div className={`border p-4 ${deviation <= 15 ? "border-[#2A6B51]/40 bg-[#2A6B51]/5" : "border-[#A96246]/40 bg-[#A96246]/5"}`}>
              <p className="text-[12px] font-medium">
                {deviation <= 15 ? "结构接近参考" : "与参考结构差异较大"}
              </p>
              <p className="mt-1 font-mono text-[24px]">{Math.round(100 - deviation)} / 100</p>
              <p className="mt-2 text-[10px] leading-relaxed text-[var(--muted)]">
                差异值按各项百分比差的绝对值总和的一半计算。分数只反映结构相似度，不代表营养是否合理。
              </p>
            </div>
          )}

          <div className="flex items-start gap-2 border border-[#C29B4A]/40 bg-[#C29B4A]/5 p-3 text-[9.5px] leading-relaxed">
            <AlertTriangle size={13} className="mt-0.5 shrink-0 text-[#8A6A28]" />
            <div>
              <p className="font-medium text-[#8A6A28]">这是教育模拟</p>
              <p className="mt-1 text-[var(--muted)]">{plan.simulation_note}</p>
            </div>
          </div>

          <div className="border border-[var(--line)] p-3">
            <p className="label text-[var(--muted)]">Reference source</p>
            {plan.sources.map((s) => (
              <a key={s.source_url} href={s.source_url} target="_blank" rel="noreferrer" className="mt-2 block text-[10px] underline">
                {s.source_name} ↗
              </a>
            ))}
            <Link href={`/encyclopedia/${slug}`} className="mt-2 block text-[10px] text-[var(--muted)]">
              打开物种档案 →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}