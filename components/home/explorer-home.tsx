"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mascot } from "@/components/youth/mascot";
import { useUI } from "@/components/providers";

export interface MiniSpecies {
  slug: string;
  nameCn: string;
  scientificName?: string;
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

const GROUP_INFO: Record<string, string> = {
  mammal: "哺乳纲：胎生哺乳、体表被毛、体温恒定",
  bird: "鸟纲：羽毛、卵生、前肢成翼",
  amphibian: "两栖纲：皮肤湿润、幼体多水生、成体可陆生",
  reptile: "爬行纲：鳞片覆盖、卵生、变温",
  fish: "鱼类：鳃呼吸、鳍游泳、终生水生",
};

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

interface QuizRound {
  cards: MiniSpecies[];
  answerSlug: string;
  groupLabel: string;
}

function buildRound(pool: MiniSpecies[]): QuizRound | null {
  const groups = [...new Set(pool.map((s) => s.group))];
  const group = groups[Math.floor(Math.random() * groups.length)];
  const same = shuffle(pool.filter((s) => s.group === group));
  const others = shuffle(pool.filter((s) => s.group !== group));
  if (same.length < 3 || others.length < 1) return null;
  const answer = others[0];
  return {
    cards: shuffle([...same.slice(0, 3), answer]),
    answerSlug: answer.slug,
    groupLabel: same[0].groupLabel,
  };
}

export function DailyQuiz({ pool }: { pool: MiniSpecies[] }) {
  const [round, setRound] = useState<QuizRound | null>(() => buildRound(pool));
  const [picked, setPicked] = useState<string | null>(null);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const correct = picked === round?.answerSlug;

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
    if (slug === round?.answerSlug) {
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
  if (!round) return null;

  return (
    <div>
      <div className="flex items-center gap-3">
        <Mascot mood={mood} />
        <div className="y-tag bg-[var(--surface)]">+{xp} 经验 · 连续 {streak} 天</div>
      </div>
      <h2 className="y-title mt-3 text-[26px]">哪一种不是{round.groupLabel}？</h2>
      <p className="mt-1 text-[13px] font-medium">点一张卡，马上知道答案。每次刷新题目都不一样。</p>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {round.cards.map((card) => {
          const chosen = picked === card.slug;
          const isAnswer = card.slug === round.answerSlug;
          const dim = picked && !isAnswer && !chosen;
          return (
            <button
              key={card.slug}
              type="button"
              onClick={() => pick(card.slug)}
              disabled={Boolean(picked)}
              className={`y-card y-press flex min-h-[120px] flex-col items-center justify-center gap-1 p-3 text-center ${dim ? "opacity-45" : ""}`}
              style={{ borderColor: isAnswer && picked ? "var(--tax-reptile)" : chosen && !correct ? "var(--tax-amphibian)" : "var(--ink)" }}
            >
              <span className="text-[17px] font-black leading-tight">{card.nameCn}</span>
              <span className="text-[10px] font-medium" style={{ color: picked ? GROUP_COLOR[card.group] : "var(--muted)" }}>
                {picked ? card.groupLabel : "猜猜它是谁"}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 text-[13px] font-bold">
        {picked === null && <span>提示：看类群特征，不看长相。</span>}
        {picked !== null && correct && <span>答对了！经验 +10。</span>}
        {picked !== null && !correct && <span>差一点点，正确答案已标出。</span>}
      </div>

      {picked !== null && (
        <div className="mt-3 space-y-1.5 border-t border-[var(--line)] pt-3">
          <p className="text-[11px] font-bold text-[var(--muted)]">答案解析</p>
          {round.cards.map((card) => (
            <p key={card.slug} className="text-[11.5px] leading-relaxed">
              <strong className={card.slug === round.answerSlug ? "text-[var(--tax-reptile)]" : ""}>{card.nameCn}</strong>
              ：{GROUP_INFO[card.group]}
              {card.slug === round.answerSlug ? "（因此它不属于本组）" : ""}
            </p>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          setPicked(null);
          setRound(buildRound(pool));
        }}
        className="mt-3 text-[11px] underline"
      >
        换一题
      </button>
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