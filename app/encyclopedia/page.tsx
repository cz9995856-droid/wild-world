import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { SpeciesBrowser } from "@/components/species-browser";
import { getAllSpecies, getMediaAssets } from "@/lib/repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "动物百科",
  description: "按类群、保护等级与关键词浏览 WILD WORLD 馆藏物种档案，含学名、分类、习性、食性、保护状况与来源。",
};

export default async function EncyclopediaPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const [species, media] = await Promise.all([getAllSpecies(), getMediaAssets()]);
  const groupParam = typeof params.group === "string" ? params.group : "all";
  const covers: Record<string, string> = {};
  for (const asset of media) {
    const sp = species.find((s) => s.id === asset.species_id);
    if (sp && !covers[sp.slug]) covers[sp.slug] = asset.url;
  }

  return (
    <>
      <PageHeader
        kicker="Encyclopedia · 动物百科"
        title="馆藏物种档案"
        description="每一件档案都标注拉丁学名、分类路径、保护等级、评估年份与资料来源。资料为编辑整理，未逐条复核原始文献的内容会明确标记。"
        breadcrumbs={[{ label: "动物百科" }]}
        meta={
          <div className="flex flex-wrap items-center gap-2 text-[10px] text-[var(--muted)] lg:justify-end">
            <Link href="/taxonomy" className="chip border-[var(--forest)]/40 text-[var(--forest)] hover:border-[var(--forest)]">
              界 · 门 · 纲 · 目 · 科 · 属 · 种 →
            </Link>
            <span className="chip">{species.length} 件档案</span>
            <span className="chip">5 个类群</span>
            <span className="chip">来源：GBIF / IUCN / ADW / Wikipedia</span>
          </div>
        }
      />
      <div className="container-museum pb-20">
        <SpeciesBrowser species={species} covers={covers} initialGroup={groupParam} />
      </div>
    </>
  );
}