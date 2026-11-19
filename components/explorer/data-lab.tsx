"use client";

import { useState } from "react";
import { BarChart3 } from "lucide-react";

type Row = { label: string; value: number };

const TABS = [
  { id: "groups", label: "类群构成" },
  { id: "statuses", label: "保护等级" },
  { id: "provinces", label: "省域记录" },
] as const;

export function DataLab({
  groups,
  statuses,
  provinces,
  withRecords,
  withoutRecords,
}: {
  groups: Row[];
  statuses: Row[];
  provinces: Row[];
  withRecords: number;
  withoutRecords: number;
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("groups");
  const rows = tab === "groups" ? groups : tab === "statuses" ? statuses : provinces;
  const max = Math.max(...rows.map((row) => row.value), 1);
  const total = rows.reduce((sum, row) => sum + row.value, 0) || 1;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-px border border-[var(--line)] bg-[var(--line)] sm:grid-cols-4">
        <div className="bg-[var(--surface)] px-4 py-3">
          <p className="display text-[26px] leading-none">{groups.reduce((s, g) => s + g.value, 0)}</p>
          <p className="mt-1 text-[9.5px] tracking-[0.16em] text-[var(--muted)]">物种总数</p>
        </div>
        <div className="bg-[var(--surface)] px-4 py-3">
          <p className="display text-[26px] leading-none">{withRecords}</p>
          <p className="mt-1 text-[9.5px] tracking-[0.16em] text-[var(--muted)]">有省级记录</p>
        </div>
        <div className="bg-[var(--surface)] px-4 py-3">
          <p className="display text-[26px] leading-none">{withoutRecords}</p>
          <p className="mt-1 text-[9.5px] tracking-[0.16em] text-[var(--muted)]">无省级记录</p>
        </div>
        <div className="bg-[var(--surface)] px-4 py-3">
          <p className="display text-[26px] leading-none">
            {groups.length}
          </p>
          <p className="mt-1 text-[9.5px] tracking-[0.16em] text-[var(--muted)]">类群</p>
        </div>
      </div>

      <section className="border border-[var(--line)] bg-[var(--surface)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-[12px]">
            <BarChart3 size={14} className="text-[var(--forest)]" /> 馆藏构成
          </p>
          <div className="flex gap-1">
            {TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`border px-3 py-1.5 text-[10.5px] transition-colors ${
                  tab === item.id
                    ? "border-[var(--forest)] bg-[var(--forest)] text-[#F5F1E7]"
                    : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--line-strong)]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {rows.map((row) => (
            <div key={row.label} className="grid grid-cols-[88px_1fr_52px] items-center gap-3">
              <span className="truncate text-[11px] text-[var(--ink-soft)]">{row.label}</span>
              <span className="h-2 w-full bg-[var(--surface-2)]">
                <span
                  className="block h-full bg-[var(--forest)] transition-all"
                  style={{ width: `${Math.max(2, (row.value / max) * 100)}%` }}
                />
              </span>
              <span className="text-right font-mono text-[10.5px] text-[var(--muted)]">{row.value}</span>
            </div>
          ))}
        </div>

        <p className="mt-4 border-t border-[var(--line)] pt-3 text-[9.5px] leading-relaxed text-[var(--muted)]">
          {tab === "groups" && "类群构成为馆藏收录数量，不代表中国实际物种总数。"}
          {tab === "statuses" && `未评估（NE）占 ${Math.round(((statuses.find((s) => s.label === "未评估")?.value ?? 0) / total) * 100)}%，说明多数物种尚缺乏权威评估，不能视为安全。`}
          {tab === "provinces" && "省域计数为「有该省记录的物种数」，受调查与观测密度影响，不能当作真实分布面积。"}
        </p>
      </section>
    </div>
  );
}