import raw from "@/public/data/china-media.json";

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
}

export type ChinaMediaSlot = "hero" | "habitat" | "full";

interface ChinaMediaEntry {
  hero?: ChinaImage;
  habitat?: ChinaImage;
  full?: ChinaImage;
}

export const CHINA_MEDIA = raw.species as Record<string, ChinaMediaEntry>;

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