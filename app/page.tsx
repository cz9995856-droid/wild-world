import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { shanghaiDateKey } from "@/lib/wildchina/daily";
import { getSpeciesImage } from "@/lib/wildchina/media";
import { CHINA_SPECIES } from "@/lib/wildchina/species";
import { DailyRotator, type AnimalMomentItem } from "@/components/wildchina/daily-rotator";
import { WcHeader } from "@/components/wildchina/wc-header";
import lqipData from "@/public/data/home-lqip.json";

const LQIP = (lqipData.placeholders ?? {}) as Record<string, string>;

export const metadata: Metadata = {
  title: { absolute: "WildChina · 中国特有脊椎动物探索者计划" },
  description:
    "面向中学生的中国特有脊椎动物探索者计划：每天认识一种只在中国生活的动物，收集、挑战、查证真实数据。",
};

const PER_GROUP = 10;
const GROUPS = ["mammal", "bird", "reptile", "fish", "amphibian"] as const;

const ENTRIES = [
  {
    href: "/explore/encyclopedia",
    label: "发现",
    line: "361 种只在中国生活的动物，按类群、省份、保护等级找。",
    color: "var(--tax-amphibian)",
  },
  {
    href: "/explore/collection",
    label: "收集",
    line: "收藏即入册。每天一个真实任务，打卡记录连续天数。",
    color: "var(--tax-mammal)",
  },
  {
    href: "/explore/lab",
    label: "挑战",
    line: "3D 模型、身体结构、知识闯关，还有能做研究助理的 AI。",
    color: "var(--tax-bird)",
  },
];

export default function HomePage() {
  const dateKey = shanghaiDateKey();
  const items: AnimalMomentItem[] = GROUPS.flatMap((group) =>
    CHINA_SPECIES.filter((s) => s.group === group && getSpeciesImage(s.slug, "hero"))
      .slice(0, PER_GROUP)
      .flatMap((s) => {
        const image = getSpeciesImage(s.slug, "hero");
        if (!image) return [];
        return [
          {
            species: {
              slug: s.slug,
              nameCn: s.nameCn,
              scientificName: s.scientificName,
              groupLabel: s.groupLabel,
              group: s.group,
              aliases: s.aliases,
              taxonomy: s.taxonomy,
              distribution: s.distribution,
              endemic: s.endemic,
            },
            image,
            placeholder: LQIP[s.slug],
          },
        ];
      })
  );

  return (
    <div className="wc-frame">
      <WcHeader />

      <section className="mt-6 max-w-[720px]">
        <p className="hb-hand">野外手册 · 每天一页</p>
        <h1 className="hb-display mt-2">
          你认识它吗？
        </h1>
        <p className="mt-3 max-w-[560px] text-[15px] leading-relaxed text-[var(--ink-soft)]">
          这里每一种动物都只在中国生活。点开卡片，看它住在哪、吃什么、为什么值得被记住。
        </p>
      </section>

      <div className="mt-6">
        <DailyRotator items={items} dateKey={dateKey} />
      </div>

      <nav className="mt-5 grid gap-3 sm:grid-cols-3" aria-label="探索入口">
        {ENTRIES.map((entry) => (
          <Link
            key={entry.href}
            href={entry.href}
            className="hb-card hb-card-lift group border-t-4 px-4 py-4"
            style={{ borderTopColor: entry.color }}
          >
            <span className="flex items-center justify-between">
              <span className="hb-h2">{entry.label}</span>
              <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
            </span>
            <span className="mt-1.5 block text-[12.5px] leading-relaxed text-[var(--muted)]">{entry.line}</span>
          </Link>
        ))}
      </nav>

      <p className="mt-5 flex flex-wrap items-center gap-3 text-[10.5px] text-[var(--muted)]">
        <Link href="/explore/data" className="underline">
          数据说明
        </Link>
        <span>来源、统计口径与未评估比例</span>
        <span>·</span>
        <Link href="/explore/missions" className="underline">
          今日任务
        </Link>
        <span>·</span>
        <Link href="/sources" className="underline">
          影像与授权
        </Link>
      </p>
    </div>
  );
}