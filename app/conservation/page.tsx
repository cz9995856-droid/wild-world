import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { ConservationBrowser } from "@/components/conservation/conservation-browser";
import { getAllSpecies, getMediaAssets } from "@/lib/repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "濒危动物专题",
  description: "保护等级、种群趋势、威胁因素、分布与保护措施，逐项标注评估年份与来源。",
};

export default async function ConservationPage() {
  const [species, media] = await Promise.all([getAllSpecies(), getMediaAssets()]);
  const covers: Record<string, string> = {};
  for (const asset of media) {
    const sp = species.find((s) => s.id === asset.species_id);
    if (sp && !covers[sp.slug]) covers[sp.slug] = asset.url;
  }
  const threatened = species
    .filter((s) => ["CR", "EN", "VU", "NT"].includes(s.conservation.status))
    .sort((a, b) => (["CR", "EN", "VU", "NT"].indexOf(a.conservation.status) - ["CR", "EN", "VU", "NT"].indexOf(b.conservation.status)));
  const cr = threatened.filter((s) => s.conservation.status === "CR").length;

  return (
    <>
      <PageHeader
        kicker="Red List · 濒危动物专题"
        title="保护等级，有时间、有出处、有边界"
        description="本页只呈现馆藏物种中受威胁的档案。每个等级都标注评估年份与来源；种群数字若缺乏具体出处，会明确说明而不是编造。"
        breadcrumbs={[{ label: "濒危动物" }]}
        meta={
          <div className="flex flex-wrap gap-2 lg:justify-end">
            <span className="chip">{threatened.length} 件受威胁档案</span>
            <span className="chip">{cr} 件极危</span>
            <span className="chip">IUCN API：未接入</span>
          </div>
        }
      />
      <div className="container-museum pb-20 pt-8">
        <ConservationBrowser species={threatened} covers={covers} />
      </div>
    </>
  );
}