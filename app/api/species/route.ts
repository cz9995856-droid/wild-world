import { NextResponse } from "next/server";
import { getAllSpecies } from "@/lib/repository";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const group = searchParams.get("group");
  const q = (searchParams.get("q") ?? "").toLowerCase().trim();
  const all = await getAllSpecies();
  const items = all.filter((s) => {
    if (group && group !== "all" && s.group !== group) return false;
    if (!q) return true;
    return `${s.name_cn} ${s.name_en} ${s.scientific_name} ${s.aliases.join(" ")}`.toLowerCase().includes(q);
  });
  return NextResponse.json({
    count: items.length,
    updated_at: new Date().toISOString(),
    data_status: "curated",
    disclaimer: "馆藏物种为编辑整理内容（editorial），附来源链接，未逐条核验原始文献。",
    species: items.map((s) => ({
      id: s.id,
      slug: s.slug,
      name_cn: s.name_cn,
      name_en: s.name_en,
      scientific_name: s.scientific_name,
      group: s.group,
      group_label: s.group_label,
      conservation: s.conservation.status,
      conservation_label: s.conservation.status_label,
      assessment_year: s.conservation.assessment_year,
      review_status: s.review_status,
      tagline: s.tagline,
      gbif_taxon_key: s.distribution.gbif_taxon_key ?? null,
    })),
  });
}