import type { Metadata } from "next";
import { WcHeader } from "@/components/wildchina/wc-header";
import { LabTabs } from "@/components/lab/lab-tabs";
import { getAllSpecies, getAudioEntries, getQuiz, getSiteSettings } from "@/lib/repository";
import { FEEDING_PLANS } from "@/lib/data/feeding";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "生命实验室",
  description: "身体结构、动物能力对比、生命知识挑战与声音、地理、食性交互模块。",
};

export default async function ChinaLabPage() {
  const [species, recordings, settings] = await Promise.all([
    getAllSpecies(),
    getAudioEntries(),
    getSiteSettings(),
  ]);
  const quiz = getQuiz();
  const initialSlug = species.find((s) => s.slug === "giant-panda")?.slug ?? species[0]?.slug ?? "";

  return (
    <div className="wc-frame">
      <WcHeader />
      <div className="wc-page-head">
        <div>
          <p className="wc-kicker">Life Lab</p>
          <h1 className="display mt-2 text-[38px] sm:text-[50px]">生命实验室</h1>
          <p className="wc-prose mt-3">
            从身体结构、能力对比到知识挑战，用交互理解动物如何生存。原创模型用于理解结构，授权录音用于听辨，实时观测用于理解分布。
          </p>
        </div>
        <p className="text-[11px] leading-relaxed text-[var(--muted)]">
          {recordings.length} 条授权录音 · {quiz.length} 道题 · {FEEDING_PLANS.length} 组食性方案
          <br />
          影像更新 {settings.integration_generated_at?.slice(0, 10) ?? "待生成"}
        </p>
      </div>
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
      <p className="mt-6 text-[10.5px] leading-relaxed text-[var(--muted)]">
        3D 模型为馆方原创程序化几何，不是标本扫描；对比数据标注测量口径，缺失数据不参与计算。
      </p>
    </div>
  );
}