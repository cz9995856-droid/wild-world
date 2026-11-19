"use client";

import Link from "next/link";
import { useUI } from "@/components/providers";
import { ArrowRight, Heart, Sparkles } from "lucide-react";

export interface CollectionItem {
  slug: string;
  nameCn: string;
  groupLabel: string;
  group: string;
  thumb: string;
}

export function CollectionBoard({ items }: { items: CollectionItem[] }) {
  const { favorites } = useUI();
  const owned = items.filter((item) => favorites.includes(item.slug));
  const percent = items.length === 0 ? 0 : Math.round((owned.length / items.length) * 100);

  const byGroup = ["amphibian", "mammal", "bird", "reptile", "fish"].map((group) => {
    const list = items.filter((item) => item.group === group);
    const got = list.filter((item) => favorites.includes(item.slug)).length;
    return {
      group,
      label: list[0]?.groupLabel ?? group,
      total: list.length,
      got,
    };
  });

  return (
    <div className="space-y-5">
      <section className="border border-[var(--line)] bg-[var(--surface)] p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="wc-field-label">收集进度</p>
            <p className="display mt-1 text-[34px] leading-none">
              {owned.length} <span className="text-[16px] text-[var(--muted)]">/ {items.length}</span>
            </p>
          </div>
          <p className="text-[11px] text-[var(--muted)]">收藏即进入收集册，保存在本机</p>
        </div>
        <div className="mt-3 h-1.5 w-full bg-[var(--surface-2)]">
          <div className="h-full bg-[var(--forest)] transition-all" style={{ width: `${percent}%` }} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {byGroup.map((group) => (
            <div key={group.group} className="border border-[var(--line)] px-3 py-2">
              <p className="text-[10.5px]">{group.label}</p>
              <p className="mt-1 text-[10px] text-[var(--muted)]">
                {group.got} / {group.total}
              </p>
            </div>
          ))}
        </div>
      </section>

      {owned.length === 0 ? (
        <section className="border border-[var(--line)] bg-[var(--surface-2)] p-6 text-center">
          <p className="flex items-center justify-center gap-2 text-[13px]">
            <Sparkles size={15} className="text-[var(--forest)]" /> 收集册还是空的
          </p>
          <p className="mt-2 text-[11px] text-[var(--muted)]">
            在物种档案页点右上角「收藏」，该物种就会收入你的收集册。
          </p>
          <Link href="/explore/encyclopedia" className="btn-primary mt-4 px-5 py-2.5 text-[12px]">
            去物种档案 <ArrowRight size={14} />
          </Link>
        </section>
      ) : (
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {owned.map((item) => (
            <Link
              key={item.slug}
              href={`/explore/encyclopedia/${item.slug}`}
              className="group flex items-center gap-3 border border-[var(--line)] bg-[var(--surface)] p-3 transition-colors hover:border-[var(--forest)]"
            >
              <span
                className="h-14 w-14 shrink-0 bg-cover bg-center"
                style={{ backgroundImage: item.thumb ? `url("${item.thumb}")` : undefined }}
                aria-hidden="true"
              />
              <span className="min-w-0">
                <span className="block truncate text-[12.5px]">{item.nameCn}</span>
                <span className="mt-0.5 block text-[9.5px] text-[var(--muted)]">{item.groupLabel}</span>
              </span>
              <Heart size={13} className="ml-auto shrink-0 text-[var(--clay)]" fill="currentColor" />
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}