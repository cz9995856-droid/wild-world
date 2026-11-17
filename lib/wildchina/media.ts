import raw from "@/public/data/china-media.json";
import amphibianRaw from "@/public/data/china-media-amphibians.json";
import extraRaw from "@/public/data/china-media-extra.json";
import habitatRaw from "@/public/data/china-media-habitat.json";

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
  ...(raw.species as Record<string, ChinaMediaEntry>),
  ...(amphibianRaw.species as Record<string, ChinaMediaEntry>),
  ...(extraRaw.species as Record<string, ChinaMediaEntry>),
};

const HABITAT_MEDIA = (habitatRaw.species ?? {}) as Record<string, ChinaMediaEntry>;

export const CHINA_MEDIA = Object.entries(HABITAT_MEDIA).reduce<Record<string, ChinaMediaEntry>>(
  (acc, [slug, entry]) => {
    acc[slug] = { ...(acc[slug] ?? {}), ...entry };
    return acc;
  },
  { ...BASE_MEDIA }
);

export function getSpeciesImage(slug: string, slot: ChinaMediaSlot): ChinaImage | null {
  return CHINA_MEDIA[slug]?.[slot] ?? null;
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