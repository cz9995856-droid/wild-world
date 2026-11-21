import type { MediaAsset, NewsCategory, Species } from "@/lib/types";

export interface NewsVisual {
  url: string;
  width?: number;
  height?: number;
  author: string;
  license: string;
  source_url: string;
  species_name: string;
  species_slug?: string;
}

const CATEGORY_GROUP: Record<NewsCategory, string> = {
  new_species: "insect",
  conservation: "mammal",
  research: "bird",
  environment: "amphibian",
  incident: "reptile",
  zoo: "mammal",
};

function isLandscape(asset: MediaAsset) {
  return (asset.width ?? 0) >= (asset.height ?? 0);
}

function toVisual(asset: MediaAsset, speciesById: Map<string, Species>): NewsVisual {
  const sp = asset.species_id ? speciesById.get(asset.species_id) : undefined;
  return {
    url: asset.url,
    width: asset.width,
    height: asset.height,
    author: asset.author,
    license: asset.license,
    source_url: asset.source_url,
    species_name: sp?.name_cn ?? "馆藏物种",
    species_slug: sp?.slug,
  };
}

export function buildNewsVisuals(media: MediaAsset[], species: Species[]): Record<string, NewsVisual> {
  const speciesById = new Map(species.map((s) => [s.id, s]));
  const pool = media.filter(
    (m) => m.kind === "photo" && m.verified !== false && m.commercial_use !== false,
  );
  const usable = pool.length > 0 ? pool : media;
  const fallback =
    usable.find((m) => isLandscape(m) && m.category === "mammal") ??
    usable.find(isLandscape) ??
    usable[0];

  const result: Record<string, NewsVisual> = {};
  for (const [category, group] of Object.entries(CATEGORY_GROUP)) {
    const candidates = usable.filter((m) => m.category === group);
    const asset = candidates.find(isLandscape) ?? candidates[0] ?? fallback;
    if (!asset) continue;
    result[category] = toVisual(asset, speciesById);
  }
  return result;
}

export function visualFor(visuals: Record<string, NewsVisual> | undefined, category: NewsCategory): NewsVisual | null {
  return visuals?.[category] ?? null;
}