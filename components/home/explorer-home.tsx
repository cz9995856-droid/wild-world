"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, Flame, MapPin, Sparkles, X } from "lucide-react";
import { useUI } from "@/components/providers";
import { cn } from "@/lib/utils";

interface MiniSpecies {
  slug: string;
  nameCn: string;
  group: string;
  groupLabel: string;
  thumb: string;
}

const GROUP_COLOR: Record<string, string> = {
  mammal: "var(--tax-mammal)",
  bird: "var(--tax-bird)",
  amphibian: "var(--tax-amphibian)",
  reptile: "var(--tax-reptile)",
  fish: "var(--tax-fish)",
};

const PROVINCE_DOTS: Array<{ name: string; x: number; y: number }> = [
  { name: "黑龙江", x: 86, y: 10 },
  { name: "吉林", x: 84, y: 17 },
  { name: "辽宁", x: 80, y: 23 },
  { name: "内蒙古", x: 63, y: 16 },
  { name: "北京", x: 72, y: 26 },
  { name: "天津", x: 75, y: 27 },
  { name: "河北", x: 71, y: 30 },
  { name: "山西", x: 67, y: 34 },
  { name: "山东", x: 76, y: 34 },
  { name: "河南", x: 69, y: 40 },
  { name: "陕西", x: 61, y: 40 },
  { name: "宁夏", x: 58, y: 34 },
  { name: "甘肃", x: 50, y: 34 },
  { name: "青海", x: 40, y: 36 },
  { name: "新疆", x: 20, y: 24 },
  { name: "西藏", x: 26, y: 46 },
  { name: "四川", x: 54, y: 47 },
  { name: "重庆", x: 62, y: 47 },
  { name: "湖北", x: 68, y: 45 },
  { name: "安徽", x: 74, y: 42 },
  { name: "江苏", x: 79, y: 40 },
  { name: "上海", x: 83, y: 42 },
  { name: "浙江", x: 80, y: 47 },
  { name: "江西", x: 75, y: 50 },
  { name: "湖南", x: 68, y: 51 },
  { name: "贵州", x: 60, y: 53 },
  { name: "云南", x: 52, y: 60 },
  { name: "广西", x: 62, y: 61 },
  { name: "广东", x: 70, y: 60 },
  { name: "福建", x: 76, y: 54 },
  { name: "海南", x: 68, y: 70 },
  { name: "台湾", x: 84, y: 57 },
];

export function DailyQuiz({
  cards,
  answerSlug,
}: {
  cards: MiniSpecies[];
  answerSlug: string;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const correct = picked === answerSlug;

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("wildchina.quiz.daily");
      const data = raw ? (JSON.parse(raw) as { date?: string; xp?: number; streak?: number }) : {};
      setXp(data.xp ?? 0);
      setStreak(data.streak ?? 0);
    } catch {
      // ignore
    }
  }, []);

  function pick(slug: string) {
    if (picked) return;
    setPicked(slug);
    if (slug === answerSlug) {
      const nextXp = xp + 10;
      const nextStreak = streak + 1;
      setXp(nextXp);
      setStreak(nextStreak);
      try {
        window.localStorage.setItem(
          "wildchina.quiz.daily",
          JSON.stringify({ date: new Date().toISOString().slice(0, 10), xp: nextXp, streak: nextStreak })
        );
      } catch {
        // ignore
      }
    }
  }

  return (
    <section className="border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-[12px]">
          <Sparkles size={14} className="text-[var(--amber)]" /> 今日一题
        </p>
        <p className="flex items-center gap-3 text-[10px] text-[var(--muted)]">
          <span>+{xp} 经验</span>
          <span className="flex items-center gap-1">
            <Flame size={11} className="text-[var(--clay)]" /> {streak} 天
          </span>
        </p>
      </div>
      <p className="mt-2 text-[14px] leading-relaxed">下面四种动物，哪一种是两栖动物？</p>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {cards.map((card) => {
          const chosen = picked === card.slug;
          const isAnswer = card.slug === answerSlug;
          const state = !picked ? "idle" : isAnswer ? "right" : chosen ? "wrong" : "dim";
          return (
            <button
              key={card.slug}
              type="button"
              onClick={() => pick(card.slug)}
              disabled={Boolean(picked)}
              className={cn(
                "border p-2 text-left transition-all",
                state === "idle" && "hb-card-lift border-[var(--line)]",
                state === "right" && "border-[var(--tax-amphibian)] bg-[var(--tax-amphibian-3)]",
                state === "wrong" && "border-[var(--tax-reptile)] bg-[var(--tax-reptile-3)] opacity-80",
                state === "dim" && "border-[var(--line)] opacity-45"
              )}
            >
              <span
                className="block h-16 w-full bg-cover bg-center"
                style={{ backgroundImage: card.thumb ? `url("${card.thumb}")` : undefined }}
                aria-hidden="true"
              />
              <span className="mt-1.5 block truncate text-[11.5px]">{card.nameCn}</span>
              <span className="mt-0.5 flex items-center gap-1 text-[9px] text-[var(--muted)]">
                {picked ? (
                  <>
                    <span className="h-1.5 w-1.5" style={{ background: GROUP_COLOR[card.group] }} />
                    {card.groupLabel}
                  </>
                ) : (
                  <span>&nbsp;</span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 min-h-[22px] text-[11px]">
        {picked === null && <span className="text-[var(--muted)]">选一个，立刻知道答案。</span>}
        {picked !== null && correct && (
          <span className="flex items-center gap-1.5 text-[var(--tax-amphibian)]">
            <Check size={13} /> 对了，经验 +10。两栖动物皮肤裸露、幼体用鳃、成体用肺和皮肤呼吸。
          </span>
        )}
        {picked !== null && !correct && (
          <span className="flex items-center gap-1.5 text-[var(--tax-reptile)]">
            <X size={13} /> 不是它。另外三种分别是兽类、鸟类和爬行类，再看一眼。
          </span>
        )}
      </div>
    </section>
  );
}

export function ProvincePreview({
  provinceSpecies,
}: {
  provinceSpecies: Record<string, MiniSpecies[]>;
}) {
  const [active, setActive] = useState<string | null>(null);
  const list = active ? provinceSpecies[active] ?? [] : [];

  return (
    <section className="grid gap-4 lg:grid-cols-[1fr_260px]">
      <div className="relative border border-[var(--line)] bg-[var(--surface)] p-4">
        <p className="text-[12px]">点一个省份，看那里住着谁</p>
        <div className="relative mt-3 h-[260px] w-full">
          {PROVINCE_DOTS.map((dot) => {
            const species = provinceSpecies[dot.name] ?? [];
            const color = species.length ? GROUP_COLOR[species[0].group] : "var(--muted)";
            return (
              <button
                key={dot.name}
                type="button"
                onClick={() => setActive(dot.name)}
                style={{ left: `${dot.x}%`, top: `${dot.y}%`, borderColor: color, color }}
                className={cn(
                  "absolute -translate-x-1/2 -translate-y-1/2 border px-1.5 py-0.5 text-[8.5px] transition-transform hover:scale-110",
                  active === dot.name && "bg-[var(--ink)] text-[var(--paper)]"
                )}
                title={dot.name}
              >
                {dot.name}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-[9px] text-[var(--muted)]">点位为省域示意位置，不是实际分布点。</p>
      </div>

      <aside className="border border-[var(--line)] bg-[var(--surface-2)] p-4">
        {active ? (
          <>
            <p className="flex items-center gap-1.5 text-[11px] text-[var(--ink-soft)]">
              <MapPin size={12} /> {active}
            </p>
            <div className="mt-2 space-y-1.5">
              {list.slice(0, 3).map((species) => (
                <Link
                  key={species.slug}
                  href={`/explore/encyclopedia/${species.slug}`}
                  className="block border-b border-[var(--line)] pb-1.5 text-[11px] hover:text-[var(--forest)]"
                >
                  {species.nameCn}
                  <span className="ml-1.5 text-[9px] text-[var(--muted)]">{species.groupLabel}</span>
                </Link>
              ))}
              {list.length === 0 && <p className="text-[10px] text-[var(--muted)]">该省暂无馆藏记录。</p>}
            </div>
            <Link href={`/explore/encyclopedia?province=${encodeURIComponent(active)}`} className="mt-3 inline-block text-[10px] underline">
              查看全部 →
            </Link>
          </>
        ) : (
          <p className="text-[11px] leading-relaxed text-[var(--muted)]">
            选一个省份，这里会显示该省记录中的 3 种中国特有动物。
          </p>
        )}
      </aside>
    </section>
  );
}

export function CollectionRings({
  groups,
  groupSlugs,
}: {
  groups: Array<{ group: string; label: string; total: number }>;
  groupSlugs: Record<string, string[]>;
}) {
  const { favorites } = useUI();
  const totals = useMemo(() => {
    return groups.map((group) => {
      const slugs = groupSlugs[group.group] ?? [];
      const got = favorites.filter((slug) => slugs.includes(slug)).length;
      return { ...group, got };
    });
  }, [groups, groupSlugs, favorites]);

  return (
    <section className="border border-[var(--line)] bg-[var(--surface)] p-4">
      <div className="flex items-center justify-between">
        <p className="text-[12px]">收集进度</p>
        <Link href="/explore/collection" className="text-[10px] underline">
          查看收集册
        </Link>
      </div>
      <div className="mt-3 grid grid-cols-5 gap-2">
        {totals.map((group) => {
          const percent = group.total ? Math.min(100, (group.got / group.total) * 100) : 0;
          return (
            <div key={group.group} className="text-center">
              <svg viewBox="0 0 36 36" className="mx-auto h-12 w-12 -rotate-90">
                <circle cx="18" cy="18" r="15" fill="none" stroke="var(--line)" strokeWidth="3" />
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  fill="none"
                  stroke={GROUP_COLOR[group.group]}
                  strokeWidth="3"
                  strokeDasharray={`${(percent / 100) * 94.2} 94.2`}
                />
              </svg>
              <p className="mt-1 text-[9px] text-[var(--muted)]">{group.label}</p>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-[9px] text-[var(--muted)]">已收藏 {favorites.length} 种 · 收藏即入册</p>
    </section>
  );
}