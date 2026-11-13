import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { LabTabs } from "@/components/lab/lab-tabs";
import { getAllSpecies, getAudioEntries, getQuiz, getSiteSettings } from "@/lib/repository";
import { FEEDING_PLANS } from "@/lib/data/feeding";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "互动实验室",
  description: "3D 动物形体、身体结构、声音波形、地理观测、知识挑战与食性模拟六个交互模块。",
};

export default async function LabPage() {
  const [species, recordings, settings] = await Promise.all([
    getAllSpecies(),
    getAudioEntries(),
    getSiteSettings(),
  ]);
  const quiz = getQuiz();
  const initialSlug =
    species.find((s) => s.slug === "giant-panda")?.slug ?? species[0]?.slug ?? "";

  return (
    <>
      <PageHeader
        kicker="Interaction Lab · 互动实验室"
        title="动手之后，知识才留下来"
        description="六个独立模块。原创模型用于理解结构，授权录音用于听辨，实时观测用于理解分布；每类内容的数据状态都在界面上明确标注。"
        breadcrumbs={[{ label: "互动实验室" }]}
        meta={
          <div className="flex flex-wrap gap-2 lg:justify-end">
            <span className="chip">{recordings.length} 条授权录音</span>
            <span className="chip">{quiz.length} 道题</span>
            <span className="chip">{FEEDING_PLANS.length} 组食性方案</span>
            <span className="chip">影像更新 {settings.integration_generated_at?.slice(0, 10) ?? "待生成"}</span>
          </div>
        }
      />
      <div className="container-museum pb-20 pt-8">
        <LabTabs
          species={species}
          recordings={recordings}
          quiz={quiz}
          feeding={FEEDING_PLANS}
          mapOptions={species.map((s) => ({
            slug: s.slug,
            name_cn: s.name_cn,
            name_en: s.name_en,
            scientific_name: s.scientific_name,
            gbif_taxon_key: s.distribution.gbif_taxon_key ?? null,
          }))}
          initialSlug={initialSlug}
        />
      </div>
    </>
  );
}