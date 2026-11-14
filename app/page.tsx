import type { Metadata } from "next";
import { getDailySpecies, shanghaiDateKey } from "@/lib/wildchina/daily";
import { getSpeciesImage } from "@/lib/wildchina/media";
import { DailyCard } from "@/components/wildchina/daily-card";
import { WcBrand } from "@/components/wildchina/wc-brand";

export const metadata: Metadata = {
  title: { absolute: "WildChina · 中国特有脊椎动物探索" },
  description: "每天认识一种中国特有脊椎动物，从可追溯的物种档案进入中国野生生命。",
};

export default function HomePage() {
  const dateKey = shanghaiDateKey();
  const species = getDailySpecies(dateKey);
  const image = getSpeciesImage(species.slug, "hero");

  return (
    <div className="wc-frame">
      <header className="flex items-center justify-between">
        <WcBrand />
      </header>
      <DailyCard species={species} image={image} dateKey={dateKey} />
    </div>
  );
}