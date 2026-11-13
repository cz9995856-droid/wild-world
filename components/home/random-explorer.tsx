"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Shuffle } from "lucide-react";
import type { Species } from "@/lib/types";
import { SpeciesCard } from "@/components/species-card";
import { GROUPS } from "@/lib/data/species";
import { useUI } from "@/components/providers";

function pickRandom(pool: Species[], count: number, seed = Math.random()): Species[] {
  const arr = [...pool];
  let s = Math.floor(seed * 1e9) || 1;
  const rand = () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, count);
}

export function RandomExplorer({
  species,
  covers,
  initial,
}: {
  species: Species[];
  covers: Record<string, string>;
  initial: Species[];
}) {
  const { locale } = useUI();
  const [group, setGroup] = useState("all");
  const [items, setItems] = useState<Species[]>(initial);
  const [round, setRound] = useState(0);

  const pool = useMemo(
    () => (group === "all" ? species : species.filter((s) => s.group === group)),
    [species, group]
  );

  function shuffle(nextGroup = group) {
    const nextPool = nextGroup === "all" ? species : species.filter((s) => s.group === nextGroup);
    setItems(pickRandom(nextPool, Math.min(4, nextPool.length), Math.random() + round * 0.01));
    setRound((r) => r + 1);
  }

  function changeGroup(next: string) {
    setGroup(next);
    setItems(pickRandom(next === "all" ? species : species.filter((s) => s.group === next), 4, Math.random()));
  }

  return (
    <section className="border-b border-[var(--line)] py-16 sm:py-20 lg:py-24">
      <div className="container-museum">
        <div className="mb-10 grid gap-6 lg:grid-cols-[1.35fr_1fr] lg:items-end">
          <div>
            <div className="mb-4 flex items-center gap-3 text-[var(--muted)]">
              <span className="label">02</span>
              <span className="h-[1px] w-8 bg-[var(--line-strong)]" />
              <span className="label">Serendipity · 随机探索</span>
            </div>
            <h2 className="display max-w-[18ch] text-[34px] sm:text-[44px] lg:text-[52px]">
              让下一次相遇，交给偶然。
            </h2>
          </div>
          <div className="flex flex-col gap-3 lg:items-end">
            <p className="max-w-md text-[13px] leading-relaxed text-[var(--muted)]">
              {locale === "zh"
                ? "从馆藏中随机抽取物种，可按类群筛选。随机结果只包含已录入的档案，不会生成不存在的物种。"
                : "Draw species at random from the collection. Only catalogued records are returned; no species are invented."}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[var(--muted)]">{pool.length} 种可选</span>
              <button onClick={() => shuffle()} className="btn-outline">
                <Shuffle size={14} />
                {locale === "zh" ? "换一批" : "Shuffle"}
              </button>
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {GROUPS.map((g) => {
            const active = group === g.key;
            return (
              <button
                key={g.key}
                onClick={() => changeGroup(g.key)}
                aria-pressed={active}
                className={`rounded-full border px-3.5 py-1.5 text-[11px] transition-colors ${
                  active
                    ? "border-[var(--forest)] bg-[var(--forest)] text-[#F5F1E7]"
                    : "border-[var(--line-strong)] text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                {locale === "zh" ? g.label : g.en}
              </button>
            );
          })}
        </div>

        <div className="grid gap-x-4 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((s, i) => (
            <SpeciesCard key={`${s.slug}-${round}`} species={s} photo={covers[s.slug]} index={i} />
          ))}
        </div>

        <p className="mt-6 text-[10px] text-[var(--muted)]">
          {locale === "zh" ? "想要更系统地浏览？" : "Prefer a systematic browse?"}{" "}
          <Link href="/encyclopedia" className="link-underline text-[var(--ink-soft)]">
            {locale === "zh" ? "进入动物百科 →" : "Open the encyclopedia →"}
          </Link>
        </p>
      </div>
    </section>
  );
}