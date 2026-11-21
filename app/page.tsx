import type { Metadata } from "next";
import Link from "next/link";
import { Mascot } from "@/components/youth/mascot";
import { Band, EntryCard } from "@/components/youth/band";
import { WcHeader } from "@/components/wildchina/wc-header";
import { CollectionProgress, DailyQuiz, KnownCounter, ProvincePreview } from "@/components/home/explorer-home";
import { ScrollRail } from "@/components/ui/scroll-rail";
import { SpeciesTypeCard } from "@/components/species/species-type-card";
import { cardUrl, getSpeciesImage } from "@/lib/wildchina/media";
import { CHINA_SPECIES } from "@/lib/wildchina/species";

export const metadata: Metadata = {
  title: { absolute: "WildChina · 中国特有动物卡" },
  description: "翻开动物卡，认识只在中国生活的动物。答题、收集、查分布，一天认识一种。",
};

const GROUP_ENTRIES = [
  { key: "mammal", title: "兽类", color: "var(--band-mammal)", icon: "paw" as const },
  { key: "bird", title: "鸟类", color: "var(--band-bird)", icon: "spark" as const },
  { key: "amphibian", title: "两栖", color: "var(--band-amphibian)", icon: "book" as const },
  { key: "reptile", title: "爬行", color: "var(--band-reptile)", icon: "cards" as const },
  { key: "fish", title: "鱼类", color: "var(--band-fish)", icon: "target" as const },
];

const RARE_BY_GROUP: Record<string, string[]> = {
  mammal: ["complex-toothed-flying-squirrel", "chinese-pangolin"],
  bird: ["crested-ibis", "chinese-thrush"],
  amphibian: ["vibrissaphora-boringii", "chinese-giant-salamander"],
  reptile: ["mangshan-pit-viper", "chinese-alligator"],
  fish: ["chinese-sturgeon", "chinese-sucker"],
};

const QUIZ_SLUGS = ["odorrana-wuchuanensis", "hynobius-fucus", "andrias-davidianus", "giant-panda"];

const FACTS = [
  {
    text: "大熊猫抓竹子的「第六根手指」不是手指，是腕部一块变大的籽骨。",
    source: "动物卡 · 大熊猫",
    url: "https://www.inaturalist.org/taxa/search?q=Ailuropoda%20melanoleuca",
  },
  {
    text: "大鲵没有发育良好的肺，主要靠皮肤和口腔黏膜呼吸，所以水质一变它就撑不住。",
    source: "动物卡 · 大鲵",
    url: "https://www.inaturalist.org/taxa/search?q=Andrias%20davidianus",
  },
  {
    text: "朱鹮繁殖期的粉色来自食物里的类胡萝卜素，不是天生粉。",
    source: "动物卡 · 朱鹮",
    url: "https://www.inaturalist.org/taxa/search?q=Nipponia%20nippon",
  },
];

function mini(slug: string) {
  const species = CHINA_SPECIES.find((item) => item.slug === slug);
  if (!species) return null;
  return {
    slug: species.slug,
    nameCn: species.nameCn,
    scientificName: species.scientificName,
    group: species.group,
    groupLabel: species.groupLabel,
    thumb: cardUrl(getSpeciesImage(species.slug, "hero")?.url),
  };
}

export default function HomePage() {
  const total = CHINA_SPECIES.length;
  const groupCounts = new Map<string, number>();
  for (const species of CHINA_SPECIES) groupCounts.set(species.group, (groupCounts.get(species.group) ?? 0) + 1);

  const rare = GROUP_ENTRIES.flatMap((entry) => (RARE_BY_GROUP[entry.key] ?? []).map(mini)).filter(
    (item): item is NonNullable<typeof item> => Boolean(item)
  );

  const quiz = QUIZ_SLUGS.map(mini).filter((item): item is NonNullable<typeof item> => Boolean(item));
  const quizAnswer = "giant-panda";

  const provinceCounts = new Map<string, number>();
  for (const species of CHINA_SPECIES) {
    for (const province of species.provinces ?? []) {
      provinceCounts.set(province, (provinceCounts.get(province) ?? 0) + 1);
    }
  }
  const provinces = [...provinceCounts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 16);

  const groups = GROUP_ENTRIES.map((entry) => ({
    group: entry.key,
    label: entry.title,
    total: groupCounts.get(entry.key) ?? 0,
    slugs: CHINA_SPECIES.filter((species) => species.group === entry.key).map((species) => species.slug),
  }));

  const hero = rare[0];
  const heroImage = hero ? getSpeciesImage(hero.slug, "hero") : null;

  return (
    <div className="wc-frame y-body">
      <WcHeader />

      <Band color="var(--band-yellow)" hero className="mt-4">
        <div className="grid items-center gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="flex items-center gap-3">
              <Mascot mood="happy" />
              <KnownCounter total={total} />
            </div>
            <h1 className="y-title mt-4 text-[clamp(38px,6.6vw,68px)]">
              今天，你能认出几种？
            </h1>
            <p className="mt-3 max-w-[520px] text-[15px] font-medium leading-relaxed">
              翻开一张动物卡，看看只在中国生活的它们。答一题、收一张，每天多认识一种。
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link prefetch={false} href="/explore/encyclopedia" className="y-btn">
                开始探索
              </Link>
              <Link prefetch={false} href={`/explore/encyclopedia/${hero?.slug ?? "giant-panda"}`} className="y-btn y-btn-ghost">
                今日神秘动物
              </Link>
            </div>
          </div>

          {heroImage && (
            <Link prefetch={false} href={`/explore/encyclopedia/${hero?.slug}`} className="y-card y-card-hover block p-3">
              <span
                className="y-img block w-full bg-cover bg-center"
                style={{ backgroundImage: `url("${cardUrl(heroImage.url)}")`, aspectRatio: "4 / 3" }}
                aria-hidden="true"
              />
              <span className="mt-3 flex items-center justify-between gap-2 px-1">
                <span className="y-title text-[22px]">{hero?.nameCn}</span>
                <span className="y-tag bg-[var(--surface)]">{hero?.groupLabel}</span>
              </span>
            </Link>
          )}
        </div>
      </Band>

      <section className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {GROUP_ENTRIES.map((entry) => (
          <EntryCard
            key={entry.key}
            href={`/explore/encyclopedia?group=${entry.key}`}
            icon={entry.icon}
            title={entry.title}
            desc={`${groupCounts.get(entry.key) ?? 0} 种等你翻牌`}
            color={entry.color}
          />
        ))}
      </section>

      <div className="mt-5">
        <Band color="var(--band-bird)">
          <DailyQuiz cards={quiz} answerSlug={quizAnswer} />
        </Band>
      </div>

      <div className="mt-5">
        <Band color="var(--band-amphibian)">
          <div className="flex items-end justify-between gap-3">
            <h2 className="y-title text-[26px]">冷门，但超有意思</h2>
            <Link prefetch={false} href="/explore/encyclopedia" className="y-tag y-press bg-[var(--surface)]">
              全部动物卡
            </Link>
          </div>
          <ScrollRail className="mt-4" itemWidth={202}>
            {rare.map((item) => (
              <Link
                prefetch={false}
                key={item.slug}
                href={`/explore/encyclopedia/${item.slug}`}
                className="y-card y-card-hover w-[190px] shrink-0 snap-start overflow-hidden"
              >
                {item.thumb ? (
                <span
                  className="block w-full bg-cover bg-center"
                  style={{ backgroundImage: `url("${item.thumb}")`, aspectRatio: "1 / 1" }}
                  aria-hidden="true"
                />
              ) : (
                <SpeciesTypeCard
                  nameCn={item.nameCn}
                  scientificName={item.scientificName ?? ""}
                  groupLabel={item.groupLabel}
                  group={item.group}
                  aspectRatio="1 / 1"
                />
              )}
                <span className="block px-3 py-2.5">
                  <span className="block truncate text-[15px] font-bold">{item.nameCn}</span>
                  <span className="mt-0.5 block text-[11px] font-medium">{item.groupLabel} · 点开看看</span>
                </span>
              </Link>
            ))}
          </ScrollRail>
        </Band>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Band color="var(--band-reptile)">
          <ProvincePreview provinces={provinces} />
        </Band>
        <Band color="var(--band-fish)">
          <CollectionProgress groups={groups} />
        </Band>
      </div>

      <div className="mt-5">
        <Band color="var(--band-mammal)">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Mascot mood="cheer" className="!h-14 !w-14" />
              <h2 className="y-title text-[26px]">你知道吗</h2>
            </div>
            <Link prefetch={false} href="/explore/fun-facts" className="y-tag y-press bg-[var(--surface)]">
              更多冷知识
            </Link>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {FACTS.map((fact) => (
              <a
                key={fact.text}
                href={fact.url}
                target="_blank"
                rel="noreferrer"
                className="y-card y-card-hover block bg-[var(--surface)] p-4"
              >
                <p className="text-[13px] font-medium leading-relaxed">{fact.text}</p>
                <p className="mt-2 text-[10px] font-bold">{fact.source} ↗</p>
              </a>
            ))}
          </div>
        </Band>
      </div>

      <p className="mt-6 flex flex-wrap items-center gap-3 text-[11px] font-medium text-[var(--muted)]">
        <Link prefetch={false} href="/explore/data" className="underline">
          数据说明
        </Link>
        <Link prefetch={false} href="/sources" className="underline">
          影像与授权
        </Link>
        <Link prefetch={false} href="/explore/collection" className="underline">
          我的收集册
        </Link>
      </p>
    </div>
  );
}