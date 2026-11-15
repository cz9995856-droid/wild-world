import type { Metadata } from "next";
import { shanghaiDateKey } from "@/lib/wildchina/daily";
import { getSpeciesImage } from "@/lib/wildchina/media";
import { CHINA_SPECIES } from "@/lib/wildchina/species";
import { DailyRotator, type AnimalMomentItem } from "@/components/wildchina/daily-rotator";
import { WcBrand } from "@/components/wildchina/wc-brand";

export const metadata: Metadata = {
  title: { absolute: "WildChina · 中国特有脊椎动物探索" },
  description: "每次刷新认识一种中国特有脊椎动物，从可追溯的物种档案进入中国野生生命。",
};

export default function HomePage() {
  const dateKey = shanghaiDateKey();
  const items: AnimalMomentItem[] = CHINA_SPECIES.flatMap((s) => {
    const image = getSpeciesImage(s.slug, "hero");
    if (!image) return [];
    return [
      {
        species: {
          slug: s.slug,
          nameCn: s.nameCn,
          aliases: s.aliases,
          scientificName: s.scientificName,
          englishName: s.englishName,
          group: s.group,
          groupLabel: s.groupLabel,
          taxonomy: s.taxonomy,
          distribution: s.distribution,
          provinces: [],
          habitats: [],
          conservation: s.conservation,
          morphology: "",
          behavior: "",
          dietReproduction: "",
          endemic: s.endemic,
          endemicNote: "",
          sp2000: s.sp2000,
          sources: [],
          verified: s.verified,
        },
        image,
      },
    ];
  });

  return (
    <div className="wc-frame">
      <header className="flex items-center justify-between">
        <WcBrand />
      </header>
      <DailyRotator items={items} dateKey={dateKey} />
    </div>
  );
}