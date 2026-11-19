"use client";

import Link from "next/link";
import { useUI } from "@/components/providers";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CollectionItem {
  slug: string;
  nameCn: string;
  groupLabel: string;
  group: string;
  thumb: string;
  code: string;
  conservationLabel: string;
  conservationStatus: string;
}

const GROUP_ACCENT: Record<string, string> = {
  mammal: "var(--tax-mammal)",
  bird: "var(--tax-bird)",
  amphibian: "var(--tax-amphibian)",
  reptile: "var(--tax-reptile)",
  fish: "var(--tax-fish)",
};

const GROUP_TAG: Record<string, string> = {
  mammal: "hb-tag-mammal",
  bird: "hb-tag-bird",
  amphibian: "hb-tag-amphibian",
  reptile: "hb-tag-reptile",
  fish: "hb-tag-fish",
};

const GROUP_ORDER = ["amphibian", "mammal", "bird", "reptile", "fish"];

export function CollectionBoard({ items }: { items: CollectionItem[] }) {
  const { favorites } = useUI();
  const owned = items.filter((item) => favorites.includes(item.slug));
  const missing = items.filter((item) => !favorites.includes(item.slug));
  const percent = items.length === 0 ? 0 : Math.round((owned.length / items.length) * 100);

  const byGroup = GROUP_ORDER.map((group) => {
    const list = items.filter((item) => item.group === group);
    const got = list.filter((item) => favorites.includes(item.slug)).length;
    return { group, label: list[0]?.groupLabel ?? group, total: list.length, got };
  });

  const next = byGroup
    .filter((group) => group.got < group.total)
    .sort((a, b) => b.got / (b.total || 1) - a.got / (a.total || 1))[0];

  const nextSpecies = next ? missing.find((item) => item.group === next.group) : undefined;

  return (
    <div className="space-y-6">
      <section className="border border-[var(--line)] bg-[var(--surface)] p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="hb-hand">我的收集进度</p>
            <p className="mt-1 text-[38px] font-black leading-none">
              {owned.length} <span className="text-[16px] font-normal text-[var(--muted)]">/ {items.length}</span>
            </p>
          </div>
          <p className="text-[11px] text-[var(--muted)]">收藏保存在本机，换设备不会同步</p>
        </div>
        <div className="mt-3 h-2 w-full bg-[var(--surface-2)]">
          <div className="h-full transition-all" style={{ width: `${percent}%`, background: "var(--amber)" }} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {byGroup.map((group) => (
            <div
              key={group.group}
              className="border border-[var(--line)] px-3 py-2"
              style={{ borderLeft: `3px solid ${GROUP_ACCENT[group.group]}` }}
            >
              <p className="text-[10.5px]">{group.label}</p>
              <p className="mt-1 text-[10px] text-[var(--muted)]">
                {group.got} / {group.total}
              </p>
            </div>
          ))}
        </div>
        {nextSpecies && (
          <p className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-[var(--ink-soft)]">
            <Sparkles size={13} className="text-[var(--amber)]" />
            下一个最接近解锁：
            <Link href={`/explore/encyclopedia/${nextSpecies.slug}`} className="underline">
              {nextSpecies.nameCn}
            </Link>
            <span className="text-[10px] text-[var(--muted)]">（{next?.label}）</span>
          </p>
        )}
      </section>

      {owned.length === 0 ? (
        <section className="border border-[var(--line)] bg-[var(--surface-2)] p-6 text-center">
          <p className="flex items-center justify-center gap-2 text-[13px]">
            <Sparkles size={15} className="text-[var(--amber)]" /> 收集册还是空的
          </p>
          <p className="mt-2 text-[11px] text-[var(--muted)]">
            在物种卡牌上点「我见过它」，这张卡就进你的收集册。
          </p>
          <Link href="/explore/encyclopedia" className="hb-btn mt-4 text-[12px]">
            去发现物种 <ArrowRight size={14} />
          </Link>
        </section>
      ) : (
        <section>
          <h2 className="hb-h2">已收集 · {owned.length} 张</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {owned.map((item) => (
              <Link
                key={item.slug}
                href={`/explore/encyclopedia/${item.slug}`}
                className="hb-card hb-card-lift block overflow-hidden"
                style={{ borderTop: `4px solid ${GROUP_ACCENT[item.group]}` }}
              >
                <span
                  className="block aspect-[4/3] w-full bg-cover bg-center"
                  style={{ backgroundImage: item.thumb ? `url("${item.thumb}")` : undefined }}
                  aria-hidden="true"
                />
                <span className="block px-3 py-2.5">
                  <span className="block text-[9px] tracking-[0.18em] text-[var(--muted)]">NO. {item.code}</span>
                  <span className="mt-0.5 block truncate text-[15px] font-bold">{item.nameCn}</span>
                  <span className="mt-1.5 flex items-center justify-between gap-1">
                    <span className={cn("hb-tag py-0 text-[9px]", GROUP_TAG[item.group])}>{item.groupLabel}</span>
                    <span className="text-[9px] text-[var(--muted)]">
                      {item.conservationLabel} · {item.conservationStatus}
                    </span>
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {missing.length > 0 && (
        <details className="border border-[var(--line)] bg-[var(--surface)] px-4 py-3">
          <summary className="cursor-pointer text-[12px]">还没收集的 {missing.length} 种</summary>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-8">
            {missing.map((item) => (
              <Link
                key={item.slug}
                href={`/explore/encyclopedia/${item.slug}`}
                className="border border-[var(--line)] bg-[var(--surface-2)] p-2 text-center"
                style={{ borderTop: `3px solid ${GROUP_ACCENT[item.group]}` }}
              >
                <span className="mx-auto block h-10 w-full bg-[color-mix(in_srgb,var(--ink)_12%,transparent)]" aria-hidden="true" />
                <span className="mt-1 block truncate text-[9px] text-[var(--muted)]">{item.code}</span>
              </Link>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}