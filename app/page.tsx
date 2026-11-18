import type { Metadata } from "next";
import { shanghaiDateKey } from "@/lib/wildchina/daily";
import { getSpeciesImage } from "@/lib/wildchina/media";
import { CHINA_SPECIES } from "@/lib/wildchina/species";
import { DailyRotator, type AnimalMomentItem } from "@/components/wildchina/daily-rotator";
import { WcHeader } from "@/components/wildchina/wc-header";
import lqipData from "@/public/data/home-lqip.json";

const LQIP = (lqipData.placeholders ?? {}) as Record<string, string>;

export const metadata: Metadata = {
  title: { absolute: "WildChina · 中国特有脊椎动物数字自然博物馆" },
  description:
    "WildChina（野性中国）数字自然博物馆：每次刷新认识一种中国特有脊椎动物，从可追溯的物种档案进入中国野生生命。",
};

const PER_GROUP = 10;
const GROUPS = ["mammal", "bird", "reptile", "fish", "amphibian"] as const;

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
      <DailyRotator items={items} dateKey={dateKey} />
    </div>
  );
}