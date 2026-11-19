import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { shanghaiDateKey } from "@/lib/wildchina/daily";
import { getSpeciesImage, thumbUrl } from "@/lib/wildchina/media";
import { CHINA_SPECIES } from "@/lib/wildchina/species";
import { WcHeader } from "@/components/wildchina/wc-header";
import { CollectionRings, DailyQuiz, ProvincePreview } from "@/components/home/explorer-home";

export const metadata: Metadata = {
  title: { absolute: "WildChina · 中国特有脊椎动物探索者计划" },
  description:
    "面向中学生的中国特有脊椎动物探索者计划：每天认识一种只在中国生活的动物，收集、挑战、查证真实数据。",
};

const RARE_SLUGS = [
  "ichthyophis-bannanicus",
  "vibrissaphora-boringii",
  "chinese-giant-salamander",
  "complex-toothed-flying-squirrel",
  "chinese-pangolin",
  "mangshan-pit-viper",
  "crested-ibis",
  "hynobius-amjiensis",
];

const QUIZ_SLUGS = ["odorrana-wuchuanensis", "giant-panda", "crested-ibis", "chinese-alligator"];

const FACTS = [
  {
    text: "馆藏 361 种里，超过六成还没有正式的保护等级评估。未评估不等于安全。",
    source: "数据实验室",
  },
  {
    text: "大熊猫抓竹子的「第六根手指」不是手指，是腕部一块变大的籽骨。",
    source: "物种档案 · 大熊猫",
  },
  {
    text: "大鲵没有发育良好的肺，主要靠皮肤和口腔黏膜呼吸，所以水质一变它就撑不住。",
    source: "物种档案 · 大鲵",
  },
  {
    text: "莽山烙铁头直到 1990 年代才被科学描述，此前当地一直有它的传说。",
    source: "物种档案 · 莽山烙铁头",
  },
  {
    text: "朱鹮繁殖期的粉色不是色素基因，来自食物里的类胡萝卜素沉积。",
    source: "物种档案 · 朱鹮",
  },
];

const GROUP_ORDER: Array<[string, string]> = [
  ["amphibian", "两栖"],
  ["mammal", "兽类"],
  ["bird", "鸟类"],
  ["reptile", "爬行"],
  ["fish", "鱼类"],
];

function mini(slug: string) {
  const species = CHINA_SPECIES.find((s) => s.slug === slug);
  if (!species) return null;
  return {
    slug: species.slug,
    nameCn: species.nameCn,
    group: species.group,
    groupLabel: species.groupLabel,
    thumb: thumbUrl(getSpeciesImage(species.slug, "hero")?.url),
  };
}

export default function HomePage() {
  const dateKey = shanghaiDateKey();

  const rare = RARE_SLUGS.map(mini).filter((item): item is NonNullable<typeof item> => Boolean(item));
  const quiz = QUIZ_SLUGS.map(mini).filter((item): item is NonNullable<typeof item> => Boolean(item));
  const quizAnswer = "odorrana-wuchuanensis";

  const provinceSpecies: Record<string, Array<NonNullable<ReturnType<typeof mini>>>> = {};
  for (const species of CHINA_SPECIES) {
    for (const province of species.provinces ?? []) {
      const list = provinceSpecies[province] ?? [];
      if (list.length >= 3) continue;
      const item = mini(species.slug);
      if (item) list.push(item);
      provinceSpecies[province] = list;
    }
  }

  const groups = GROUP_ORDER.map(([group, label]) => ({
    group,
    label,
    total: CHINA_SPECIES.filter((s) => s.group === group).length,
  }));
  const groupSlugs = Object.fromEntries(
    GROUP_ORDER.map(([group]) => [group, CHINA_SPECIES.filter((s) => s.group === group).map((s) => s.slug)])
  ) as Record<string, string[]>;

  const hero = rare[0];
  const heroImage = hero ? getSpeciesImage(hero.slug, "hero") : null;

  return (
    <div className="wc-frame">
      <WcHeader />

      <section className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="hb-hand">野外手册 · 第 001 页</p>
          <h1 className="hb-display mt-2">
            全世界只有中国
            <br />
            才有的动物，
            <br />
            你认识几种？
          </h1>
          <p className="mt-4 max-w-[520px] text-[15px] leading-relaxed text-[var(--ink-soft)]">
            这里不是百科。每一张卡牌都是一种只在中国生活的动物，点开它，看它住在哪、吃什么、为什么需要被记住。
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link href="/explore/encyclopedia" className="hb-btn">
              开始探索 <ArrowRight size={16} />
            </Link>
            <Link href="/explore/missions" className="hb-btn hb-btn-ghost">
              今天的任务
            </Link>
          </div>
          <p className="mt-4 flex items-center gap-2 text-[11px] text-[var(--muted)]">
            <span className="inline-block h-1.5 w-24 bg-[var(--line)]">
              <span className="block h-full w-1/12 bg-[var(--tax-amphibian)]" />
            </span>
            你已认识 0 / 361
          </p>
        </div>

        {heroImage && (
          <Link href={`/explore/encyclopedia/${hero?.slug}`} className="hb-card-tilt block">
            <div className="border border-[var(--line)] bg-[var(--surface)] p-2">
              <span
                className="block aspect-[4/3] w-full bg-cover bg-center"
                style={{ backgroundImage: `url("${thumbUrl(heroImage.url)}")` }}
                aria-hidden="true"
              />
              <div className="flex items-end justify-between gap-2 px-2 py-2">
                <div>
                  <p className="text-[9px] tracking-[0.18em] text-[var(--muted)]">NO. 001 · {dateKey}</p>
                  <p className="mt-1 text-[20px] font-extrabold">{hero?.nameCn}</p>
                </div>
                <span className="hb-tag hb-tag-amphibian">{hero?.groupLabel}</span>
              </div>
            </div>
          </Link>
        )}
      </section>

      <div className="mt-8">
        <DailyQuiz cards={quiz} answerSlug={quizAnswer} />
      </div>

      <section className="mt-8">
        <div className="flex items-end justify-between gap-3">
          <h2 className="hb-h2">冷门，但值得认识</h2>
          <Link href="/explore/encyclopedia" className="text-[10px] underline">
            全部物种
          </Link>
        </div>
        <div className="no-scrollbar mt-3 flex snap-x gap-3 overflow-x-auto pb-2">
          {rare.map((item, index) => (
            <Link
              key={item.slug}
              href={`/explore/encyclopedia/${item.slug}`}
              className="hb-card hb-card-lift w-[220px] shrink-0 snap-start"
            >
              <span
                className="block aspect-[5/4] w-full bg-cover bg-center"
                style={{ backgroundImage: `url("${item.thumb}")` }}
                aria-hidden="true"
              />
              <div className="px-3 py-2.5">
                <p className="text-[9px] tracking-[0.16em] text-[var(--muted)]">NO. {String(index + 2).padStart(3, "0")}</p>
                <p className="mt-1 truncate text-[14px] font-bold">{item.nameCn}</p>
                <p className="mt-1 line-clamp-2 text-[10.5px] leading-relaxed text-[var(--muted)]">
                  中国特有 · {item.groupLabel}。点开看它的分类与分布。
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="hb-h2">它住在中国哪里</h2>
        <div className="mt-3">
          <ProvincePreview provinceSpecies={provinceSpecies} />
        </div>
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <CollectionRings groups={groups} groupSlugs={groupSlugs} />
        <div className="border border-[var(--line)] bg-[var(--surface)] p-4">
          <p className="text-[12px]">你知道吗</p>
          <ul className="mt-3 space-y-2.5">
            {FACTS.map((fact) => (
              <li key={fact.text} className="border-b border-[var(--line)] pb-2.5 last:border-0">
                <p className="text-[11.5px] leading-relaxed text-[var(--ink-soft)]">{fact.text}</p>
                <p className="mt-1 text-[9px] text-[var(--muted)]">{fact.source}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <p className="mt-6 flex flex-wrap items-center gap-3 text-[10.5px] text-[var(--muted)]">
        <Link href="/explore/data" className="underline">
          数据说明
        </Link>
        <span>来源、统计口径与未评估比例</span>
        <span>·</span>
        <Link href="/sources" className="underline">
          影像与授权
        </Link>
      </p>
    </div>
  );
}