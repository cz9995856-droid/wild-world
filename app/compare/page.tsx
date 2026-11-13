import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { CompareTool } from "@/components/compare/compare-tool";
import { getAllSpecies, getMediaAssets } from "@/lib/repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "动物对比",
  description: "并排比较体长、体重、寿命、速度、食性、栖息地与保护等级，缺失值明确标注。",
};

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const [species, media] = await Promise.all([getAllSpecies(), getMediaAssets()]);
  const covers: Record<string, string> = {};
  for (const asset of media) {
    const sp = species.find((s) => s.id === asset.species_id);
    if (sp && !covers[sp.slug]) covers[sp.slug] = asset.url;
  }
  const initial = typeof params.a === "string" ? params.a : undefined;

  return (
    <>
      <PageHeader
        kicker="Compare · 动物对比"
        title="同一种问题，三种生命"
        description="选择最多三种动物，并排查看可比较字段。表格不混合不可比较的数据，也不把缺失值伪装成零。"
        breadcrumbs={[{ label: "动物对比" }]}
        meta={<span className="chip">{species.length} 种可选</span>}
      />
      <div className="container-museum pb-20 pt-8">
        <CompareTool species={species} covers={covers} initialSlug={initial} />
      </div>
    </>
  );
}