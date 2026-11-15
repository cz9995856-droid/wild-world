import type { Metadata } from "next";
import { WcHeader } from "@/components/wildchina/wc-header";
import { LabTabs } from "@/components/lab/lab-tabs";
import { getSiteSettings } from "@/lib/repository";
import { CHINA_SPECIES } from "@/lib/wildchina/species";
import { QUIZ_BANK } from "@/lib/wildchina/quiz-bank";
import { hashTint, modelForSlug, type ModelOption } from "@/lib/wildchina/model-map";

const MODEL_LIMIT = 120;

function buildModelOptions(): ModelOption[] {
  const byGroup = new Map<string, typeof CHINA_SPECIES>();
  for (const s of CHINA_SPECIES) {
    const list = byGroup.get(s.group) ?? [];
    list.push(s);
    byGroup.set(s.group, list);
  }
  const groups = [...byGroup.values()];
  const maxLen = Math.max(...groups.map((g) => g.length));
  const out: ModelOption[] = [];
  for (let i = 0; i < maxLen && out.length < MODEL_LIMIT; i += 1) {
    for (const group of groups) {
      const s = group[i];
      if (!s || out.length >= MODEL_LIMIT) continue;
      out.push({
        slug: s.slug,
        label: s.nameCn,
        note: `${s.groupLabel} · ${s.taxonomy.family || "分类待核验"}`,
        kind: modelForSlug(s.slug, s.group),
        tint: hashTint(s.slug),
        group: s.group,
      });
    }
  }
  return out;
}

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
  const settings = await getSiteSettings();
  const requested = typeof params.species === "string" ? params.species : "";
  const target =
    CHINA_SPECIES.find((s) => s.slug === requested) ??
    CHINA_SPECIES.find((s) => s.slug === "giant-panda") ??
    CHINA_SPECIES[0];

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
          {CHINA_SPECIES.length} 种动物 · {QUIZ_BANK.length} 道题
          <br />
          {target ? `当前物种：${target.nameCn}` : "选择物种开始"}
          <br />
          影像更新 {settings.integration_generated_at?.slice(0, 10) ?? "待生成"}
        </p>
      </div>
      <LabTabs
        speciesCount={CHINA_SPECIES.length}
        models={buildModelOptions()}
        mapOptions={CHINA_SPECIES.map((s) => ({
          slug: s.slug,
          name_cn: s.nameCn,
          name_en: s.englishName,
          scientific_name: s.scientificName,
          gbif_taxon_key: null,
        }))}
        initialSlug={target?.slug ?? ""}
        initialGroup={target?.group}
      />
      <p className="mt-6 text-[10.5px] leading-relaxed text-[var(--muted)]">
        3D 模型为馆方原创程序化几何，不是标本扫描；对比数据标注测量口径，缺失数据不参与计算。
      </p>
    </div>
  );
}