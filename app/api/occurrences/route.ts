import { NextResponse } from "next/server";
import { getSpeciesBySlug } from "@/lib/repository";
import { fetchOccurrences } from "@/lib/adapters/gbif";
import { fetchObservations } from "@/lib/adapters/inaturalist";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug") ?? "";
  const source = searchParams.get("source") ?? "both";
  const country = searchParams.get("country") ?? "";
  const species = await getSpeciesBySlug(slug);
  if (!species) return NextResponse.json({ error: "species_not_found" }, { status: 404 });

  const gbifKey = species.distribution.gbif_taxon_key ?? null;
  const jobs: Array<Promise<unknown>> = [];
  let gbif: Awaited<ReturnType<typeof fetchOccurrences>> | null = null;
  let inat: Awaited<ReturnType<typeof fetchObservations>> | null = null;

  if (source === "gbif" || source === "both") {
    jobs.push(
      fetchOccurrences({
        taxonKey: gbifKey,
        scientificName: species.scientific_name,
        limit: 200,
        country: country || undefined,
      }).then((r) => {
        gbif = r;
      })
    );
  }
  if (source === "inat" || source === "both") {
    jobs.push(
      fetchObservations({
        scientificName: species.scientific_name,
        limit: 150,
      }).then((r) => {
        inat = r;
      })
    );
  }
  await Promise.all(jobs);

  return NextResponse.json({
    species: {
      slug: species.slug,
      name_cn: species.name_cn,
      name_en: species.name_en,
      scientific_name: species.scientific_name,
      gbif_taxon_key: gbifKey,
      distribution_note: species.distribution.note,
      countries: species.distribution.countries,
      biomes: species.distribution.biomes,
    },
    gbif,
    inat,
    fetched_at: new Date().toISOString(),
    disclaimer:
      "观测点来自 GBIF 与 iNaturalist 的实时记录，代表采样位置，不代表完整自然分布范围。每个点均可追溯至原始记录。",
  });
}