import raw from "@/public/data/china-media.json";
import amphibianRaw from "@/public/data/china-media-amphibians.json";
import extraRaw from "@/public/data/china-media-extra.json";
import habitatRaw from "@/public/data/china-media-habitat.json";
import amphibianSourcedRaw from "@/public/data/china-media-amphibians-sourced.json";
import amphibianLocalizedRaw from "@/public/data/china-media-amphibians-localized.json";
import amphibianIllustrationRaw from "@/public/data/china-media-amphibians-illustration.json";
import extraLocalizedRaw from "@/public/data/china-media-extra-localized.json";
import habitatIllustrationsRaw from "@/public/data/china-habitat-illustrations.json";
import batchRaw from "@/public/data/china-media-batch.json";

export interface ChinaImage {
  url: string;
  author: string;
  source_name: string;
  source_url: string;
  license: string;
  license_url?: string;
  commercial_use: boolean;
  verified: boolean;
  review_status: string;
  ai_generated?: boolean;
}

export type ChinaMediaSlot = "hero" | "habitat" | "full";

interface ChinaMediaEntry {
  hero?: ChinaImage;
  habitat?: ChinaImage;
  full?: ChinaImage;
}

const BASE_MEDIA = {
  ...(batchRaw.species as Record<string, ChinaMediaEntry>),
  ...(raw.species as Record<string, ChinaMediaEntry>),
  ...(amphibianIllustrationRaw.species as Record<string, ChinaMediaEntry>),
  ...(amphibianRaw.species as Record<string, ChinaMediaEntry>),
  ...(extraRaw.species as Record<string, ChinaMediaEntry>),
  ...(amphibianSourcedRaw.species as Record<string, ChinaMediaEntry>),
  ...(amphibianLocalizedRaw.species as Record<string, ChinaMediaEntry>),
  ...(extraLocalizedRaw.species as Record<string, ChinaMediaEntry>),
};

const HABITAT_MEDIA = (habitatRaw.species ?? {}) as Record<string, ChinaMediaEntry>;

export const CHINA_MEDIA = Object.entries(HABITAT_MEDIA).reduce<Record<string, ChinaMediaEntry>>(
  (acc, [slug, entry]) => {
    acc[slug] = { ...(acc[slug] ?? {}), ...entry };
    return acc;
  },
  { ...BASE_MEDIA }
);

const ILLUSTRATIONS = amphibianIllustrationRaw.species as Record<string, ChinaMediaEntry>;
const ND_LICENSE = /by-nc-nd/i;

for (const [slug, entry] of Object.entries(ILLUSTRATIONS)) {
  const current = CHINA_MEDIA[slug]?.hero;
  const needsReplace = !current || (ND_LICENSE.test(current.license ?? "") && /^https?:/.test(current.url ?? ""));
  if (needsReplace && entry.hero) {
    CHINA_MEDIA[slug] = { ...(CHINA_MEDIA[slug] ?? {}), hero: entry.hero };
  }
}

const HABITAT_ILLUSTRATIONS = (habitatIllustrationsRaw as unknown as { species: Record<string, string> }).species;

export function getSpeciesImage(slug: string, slot: ChinaMediaSlot): ChinaImage | null {
  // 全部物种统一使用汉字卡片，真实影像通过卡片内的外部链接查看
  if (slot !== "habitat") return null;
  const direct = CHINA_MEDIA[slug]?.[slot] ?? null;
  if (direct || slot !== "habitat") return direct;
  const scene = HABITAT_ILLUSTRATIONS[slug];
  if (!scene) return null;
  return {
    url: `/media/habitat-illustrations/${scene}.webp`,
    author: "WildChina 编辑部",
    source_name: "生境类型示意图",
    source_url: "/sources",
    license: "CC BY 4.0",
    license_url: "https://creativecommons.org/licenses/by/4.0/",
    commercial_use: true,
    verified: false,
    review_status: "illustration",
    ai_generated: false,
  };
}

const THUMB_DIRS = new Set(["species", "pixabay", "habitat", "extra", "hero", "batch"]);

export function thumbUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (!url.startsWith("/media/")) return url;
  const rest = url.slice("/media/".length);
  const dir = rest.split("/")[0];
  if (!THUMB_DIRS.has(dir)) return url;
  return `/media/thumbs/${rest.replace(/\.(jpe?g|png|webp)$/i, ".webp")}`;
}

export function cardUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (!url.startsWith("/media/")) return url;
  const rest = url.slice("/media/".length).replace(/\.(jpe?g|png|webp)$/i, ".webp");
  return `/media/cards/${rest}`;
}

export function hasHero(slug: string): boolean {
  return Boolean(CHINA_MEDIA[slug]?.hero);
}

export function imageCredit(image: ChinaImage): string {
  return `${image.source_name} · ${image.author} · ${image.license}`;
}

export function imageIsCommercial(image: ChinaImage): boolean {
  return image.commercial_use;
}