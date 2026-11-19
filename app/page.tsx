import type { Metadata } from "next";
import Link from "next/link";
import { shanghaiDateKey } from "@/lib/wildchina/daily";
import { getSpeciesImage } from "@/lib/wildchina/media";
import { CHINA_SPECIES } from "@/lib/wildchina/species";
import { DailyRotator, type AnimalMomentItem } from "@/components/wildchina/daily-rotator";
import { WcHeader } from "@/components/wildchina/wc-header";
import { MissionCard } from "@/components/explorer/mission-card";
import lqipData from "@/public/data/home-lqip.json";

const LQIP = (lqipData.placeholders ?? {}) as Record<string, string>;

export const metadata: Metadata = {
  title: { absolute: "WildChina · 中国特有脊椎动物探索者计划" },
  description:
    "面向青少年的中国特有脊椎动物探索者计划：真实馆藏、每日任务、物种档案与互动实验，用可追溯的数据理解中国野生生命。",
};

const PER_GROUP = 10;
const GROUPS = ["mammal", "bird", "reptile", "fish", "amphibian"] as const;

const MISSION_PROVINCES = ["云南", "四川", "贵州", "广西", "海南", "台湾", "西藏", "青海", "广东", "福建"];
const MISSION_GROUPS = [
  ["amphibian", "两栖动物"],
  ["mammal", "哺乳动物"],
  ["bird", "鸟类"],
  ["reptile", "爬行动物"],
] as const;

function hashText(text: string): number {
  let h = 0;
  for (let i = 0; i < text.length; i += 1) h = (h * 31 + text.charCodeAt(i)) | 0;
  return Math.abs(h);
}

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

  const stats = [
    { label: "物种档案", value: CHINA_SPECIES.length },
    { label: "类群", value: new Set(CHINA_SPECIES.map((s) => s.group)).size },
    { label: "科", value: new Set(CHINA_SPECIES.map((s) => s.taxonomy.family).filter(Boolean)).size },
    { label: "有省级记录", value: CHINA_SPECIES.filter((s) => (s.provinces ?? []).length > 0).length },
  ];

  const seed = hashText(dateKey);
  const province = MISSION_PROVINCES[seed % MISSION_PROVINCES.length];
  const [group, groupLabel] = MISSION_GROUPS[Math.floor(seed / 7) % MISSION_GROUPS.length];
  const missionHref = `/explore/encyclopedia?province=${encodeURIComponent(province)}&group=${group}`;

  return (
    <div className="wc-frame">
      <WcHeader />

      <section className="mt-4 grid grid-cols-2 gap-px border border-[var(--line)] bg-[var(--line)] sm:grid-cols-4" aria-label="馆藏统计">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-[var(--surface)] px-4 py-4">
            <p className="display text-[30px] leading-none text-[var(--ink)]">{stat.value}</p>
            <p className="mt-1.5 text-[9.5px] tracking-[0.16em] text-[var(--muted)]">{stat.label}</p>
          </div>
        ))}
      </section>

      <div className="mt-4">
        <MissionCard
          dateKey={dateKey}
          province={province}
          group={group}
          groupLabel={groupLabel}
          count={2}
          href={missionHref}
        />
      </div>

      <DailyRotator items={items} dateKey={dateKey} />

      <nav className="mt-4 grid gap-3 sm:grid-cols-3" aria-label="探索入口">
        <Link
          href="/explore/encyclopedia"
          className="border border-[var(--line)] bg-[var(--surface)] px-4 py-3 transition-colors hover:border-[var(--forest)]"
        >
          <span className="block text-[13px]">物种档案 · 查</span>
          <span className="mt-0.5 block text-[10px] text-[var(--muted)]">按类群、分布地与保护等级检索</span>
        </Link>
        <Link
          href="/explore/lab"
          className="border border-[var(--line)] bg-[var(--surface)] px-4 py-3 transition-colors hover:border-[var(--forest)]"
        >
          <span className="block text-[13px]">生命实验室 · 做</span>
          <span className="mt-0.5 block text-[10px] text-[var(--muted)]">3D、身体结构、答题与 AI 导师</span>
        </Link>
        <Link
          href="/explore/map"
          className="border border-[var(--line)] bg-[var(--surface)] px-4 py-3 transition-colors hover:border-[var(--forest)]"
        >
          <span className="block text-[13px]">生态地图 · 找</span>
          <span className="mt-0.5 block text-[10px] text-[var(--muted)]">分布记录、生态区与保护地</span>
        </Link>
      </nav>
    </div>
  );
}