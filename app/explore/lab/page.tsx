import type { Metadata } from "next";
import { WcHeader } from "@/components/wildchina/wc-header";
import { LabTabs } from "@/components/lab/lab-tabs";
import { getAllSpecies, getQuiz, getSiteSettings } from "@/lib/repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "生命实验室",
  description: "中国特有动物的身体结构、3D 模型、地理探索与生命知识挑战。",
};

export default async function ChinaLabPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const [species, settings] = await Promise.all([getAllSpecies(), getSiteSettings()]);
  const quiz = getQuiz();
  const requested = typeof params.species === "string" ? params.species : "";
  const target =
    species.find((s) => s.slug === requested) ??
    species.find((s) => s.slug === "giant-panda") ??
    species[0];
  const initialSlug = target?.slug ?? "";
  const initialGroup = target?.group;

  return (
    <div className="wc-frame">
      <WcHeader />
      <div className="wc-page-head">
        <div>
          <p className="wc-kicker">Life Lab</p>
          <h1 className="display mt-2 text-[38px] sm:text-[50px]">生命实验室</h1>
          <p className="wc-prose mt-3">
            从中国特有动物的身体结构、3D 模型到生命知识挑战，用交互理解它们如何生存。原创模型用于理解结构，实时观测用于理解分布。
          </p>
        </div>
        <p className="text-[11px] leading-relaxed text-[var(--muted)]">
          {species.length} 种动物 · {quiz.length} 道题
          <br />
          {target ? `当前物种：${target.name_cn}` : "选择物种开始"}
          <br />
          影像更新 {settings.integration_generated_at?.slice(0, 10) ?? "待生成"}
        </p>
      </div>
      <LabTabs
        species={species}
        quiz={quiz}
        mapOptions={species.map((s) => ({
          slug: s.slug,
          name_cn: s.name_cn,
          name_en: s.name_en,
          scientific_name: s.scientific_name,
          gbif_taxon_key: s.distribution.gbif_taxon_key ?? null,
        }))}
        initialSlug={initialSlug}
        initialGroup={initialGroup}
      />
      <p className="mt-6 text-[10.5px] leading-relaxed text-[var(--muted)]">
        3D 模型为馆方原创程序化几何，不是标本扫描；对比数据标注测量口径，缺失数据不参与计算。
      </p>
    </div>
  );
}