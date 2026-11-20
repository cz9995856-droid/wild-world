"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mascot } from "@/components/youth/mascot";
import { useUI } from "@/components/providers";

export interface MiniSpecies {
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

export function KnownCounter({ total }: { total: number }) {
  const { favorites } = useUI();
  return (
    <Link
      prefetch={false}
      href="/explore/collection"
      className="y-tag y-press bg-[var(--surface)] text-[13px]"
      aria-label={`你已认识 ${favorites.length} 种，共 ${total} 种，点击查看收集册`}
    >
      你认识 {favorites.length} / {total}
    </Link>
  );
}

export function DailyQuiz({ cards, answerSlug }: { cards: MiniSpecies[]; answerSlug: string }) {
  const [picked, setPicked] = useState<string | null>(null);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const correct = picked === answerSlug;

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("wildchina.quiz.daily");
      const data = raw ? (JSON.parse(raw) as { xp?: number; streak?: number }) : {};
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

  const mood = picked === null ? "happy" : correct ? "cheer" : "wow";

  return (
    <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-start">
      <div className="flex items-center gap-3 sm:flex-col sm:items-start">
        <Mascot mood={mood} />
        <div className="y-tag bg-[var(--surface)]">+{xp} 经验 · 连续 {streak} 天</div>
      </div>

      <div>
        <h2 className="y-title text-[26px]">哪一种不是两栖动物？</h2>
        <p className="mt-1 text-[13px] font-medium">点一张卡，马上知道答案。</p>

        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {cards.map((card) => {
            const chosen = picked === card.slug;
            const isAnswer = card.slug === answerSlug;
            const dim = picked && !isAnswer && !chosen;
            return (
              <button
                key={card.slug}
                type="button"
                onClick={() => pick(card.slug)}
                disabled={Boolean(picked)}
                className={`y-card y-press overflow-hidden text-left ${dim ? "opacity-45" : ""}`}
                style={{
                  borderColor: isAnswer && picked ? "var(--tax-reptile)" : chosen && !correct ? "var(--tax-amphibian)" : "var(--ink)",
                  aspectRatio: "3 / 4",
                }}
              >
                <span
                  className="block w-full bg-cover bg-center"
                  style={{ backgroundImage: card.thumb ? `url("${card.thumb}")` : undefined, aspectRatio: "1 / 1" }}
                  aria-hidden="true"
                />
                <span className="block px-2.5 py-2">
                  <span className="block truncate text-[12.5px] font-bold">{card.nameCn}</span>
                  <span className="mt-0.5 block text-[10px] font-medium" style={{ color: picked ? GROUP_COLOR[card.group] : "var(--muted)" }}>
                    {picked ? card.groupLabel : "猜猜它是谁"}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-3 min-h-[26px] text-[13px] font-bold">
          {picked === null && <span>提示：看皮肤、看幼体，不看长相。</span>}
          {picked !== null && correct && <span>答对了！它其实属于{ cards.find((c) => c.slug === answerSlug)?.groupLabel }，经验 +10。</span>}
          {picked !== null && !correct && <span>差一点点！正确答案标出来了，再看一眼它的类群。</span>}
        </div>
      </div>
    </div>
  );
}

export function ProvincePreview({ provinces }: { provinces: Array<{ name: string; count: number }> }) {
  const [active, setActive] = useState<string | null>(null);
  const current = provinces.find((item) => item.name === active);
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 className="y-title text-[26px]">它们住在中国哪里？</h2>
        <span className="y-tag bg-[var(--surface)]">点一个省份试试</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {provinces.map((province) => (
          <button
            key={province.name}
            type="button"
            onClick={() => setActive(province.name)}
            className="y-tag y-press bg-[var(--surface)] text-[12px]"
            style={{ borderColor: active === province.name ? "var(--ink)" : "rgba(27,26,23,0.4)" }}
          >
            {province.name}
          </button>
        ))}
      </div>
      <div className="mt-4 flex min-h-[52px] items-center gap-3 rounded-[var(--r-md)] border-2 border-[var(--ink)] bg-[var(--surface)] px-4 py-3">
        <Mascot mood={active ? "cheer" : "happy"} className="!h-12 !w-12" />
        <p className="text-[13px] font-medium">
          {current ? `${current.name}记录到 ${current.count} 种中国特有动物。` : "全国 31 个省级记录在这里，先点一个你熟悉的。"}
        </p>
        {current && (
          <Link prefetch={false} href={`/explore/encyclopedia?province=${encodeURIComponent(current.name)}`} className="y-btn ml-auto text-[12px]">
            去看动物卡
          </Link>
        )}
      </div>
    </div>
  );
}

export function CollectionProgress({
  groups,
}: {
  groups: Array<{ group: string; label: string; total: number; slugs: string[] }>;
}) {
  const { favorites } = useUI();
  return (
    <div>
      <div className="flex items-end justify-between gap-2">
        <h2 className="y-title text-[26px]">我的收集进度</h2>
        <Link prefetch={false} href="/explore/collection" className="y-tag y-press bg-[var(--surface)]">
          打开收集册
        </Link>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {groups.map((group) => {
          const got = favorites.filter((slug) => group.slugs.includes(slug)).length;
          return (
            <div key={group.group} className="y-card bg-[var(--surface)] p-3 text-center">
              <p className="text-[12px] font-bold">{group.label}</p>
              <p className="y-title mt-1 text-[24px]">{got}</p>
              <p className="text-[10px] font-medium">/ {group.total} 种</p>
              <span className="mx-auto mt-2 block h-1.5 w-full rounded-full" style={{ background: GROUP_COLOR[group.group] }} />
            </div>
          );
        })}
      </div>
    </div>
  );
}