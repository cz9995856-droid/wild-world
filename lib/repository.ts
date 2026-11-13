import "server-only";
import type { AudioEntry, DataSourceConfig, MediaAsset, NewsArticle, Species } from "@/lib/types";
import { SPECIES, SPECIES_BY_SLUG } from "@/lib/data/species";
import { VIDEOS } from "@/lib/data/videos";
import { QUIZ_QUESTIONS } from "@/lib/data/quiz";
import { TIMELINE } from "@/lib/data/timeline";
import { HOME_SECTIONS } from "@/lib/data/sections";
import { SOURCE_REGISTRY } from "@/lib/sources/registry";
import { NEWS_SOURCES } from "@/lib/data/news-meta";
import { applyEditorial } from "@/lib/data/news-editorial";
import { INTEGRATION, NEWS_SNAPSHOT } from "@/lib/data/static-data";
import { readStore, type StoreShape } from "@/lib/store/content-store";
import { hashString } from "@/lib/utils";

interface IntegrationPhoto {
  id: string;
  species_slug: string;
  url: string;
  width: number | null;
  height: number | null;
  author: string;
  source_name: string;
  source_url: string;
  source_record_id: string;
  license: string;
  license_url: string | null;
  attribution: string;
  commercial_use: boolean;
  derivatives_allowed: boolean;
  download_allowed: boolean;
  retrieved_at: string;
  verified: boolean;
  review_status: "verified" | "editorial" | "pending_review" | "sample";
}

interface IntegrationSound {
  id: string;
  species_slug: string;
  title: string;
  url: string;
  source_name: string;
  source_url: string;
  source_record_id: string;
  recordist: string;
  license: string;
  license_url: string;
  location: string;
  recorded_at: string;
  sound_type: string;
  retrieved_at: string;
  commercial_use: boolean;
  derivatives_allowed: boolean;
  verified: boolean;
  review_status: "verified" | "editorial" | "pending_review" | "sample";
}

export interface IntegrationFile {
  generated_at: string | null;
  provider: string;
  photos: IntegrationPhoto[];
  sounds: IntegrationSound[];
  species: Record<
    string,
    { gbif_key: number | null; inat_taxon_id: number | null; inat_common_name?: string; gbif_status?: string | null; gbif_rank?: string | null }
  >;
  hero: string[];
  errors: Array<{ slug: string; kind: string; message: string }>;
}

const EMPTY_INTEGRATION: IntegrationFile = {
  generated_at: null,
  provider: "iNaturalist Open Data + GBIF Species API",
  photos: [],
  sounds: [],
  species: {},
  hero: [],
  errors: [],
};

const EMPTY_SNAPSHOT: IntegrationFile = { ...EMPTY_INTEGRATION };

export async function getIntegration(): Promise<IntegrationFile> {
  return {
    ...EMPTY_SNAPSHOT,
    ...INTEGRATION,
    photos: INTEGRATION.photos ?? [],
    sounds: INTEGRATION.sounds ?? [],
    species: INTEGRATION.species ?? {},
    hero: INTEGRATION.hero ?? [],
    errors: INTEGRATION.errors ?? [],
  };
}

function applyOverrides(species: Species, store: StoreShape): Species {
  const override = store.species_overrides[species.slug];
  if (!override) return species;
  return {
    ...species,
    ...override,
    distribution: { ...species.distribution, ...(override.distribution ?? {}) },
    conservation: { ...species.conservation, ...(override.conservation ?? {}) },
    taxonomy: { ...species.taxonomy, ...(override.taxonomy ?? {}) },
    review_status: override.review_status ?? species.review_status,
  };
}

export async function getAllSpecies(): Promise<Species[]> {
  const [integration, store] = await Promise.all([getIntegration(), readStore()]);
  const deleted = new Set(store.deleted_species);
  const base = [...SPECIES, ...store.new_species].filter((s) => !deleted.has(s.slug));
  const photoBySlug = new Map<string, string[]>();
  for (const p of integration.photos) {
    const list = photoBySlug.get(p.species_slug) ?? [];
    list.push(p.id);
    photoBySlug.set(p.species_slug, list);
  }
  const soundBySlug = new Map<string, string[]>();
  for (const s of integration.sounds) {
    const list = soundBySlug.get(s.species_slug) ?? [];
    list.push(s.id);
    soundBySlug.set(s.species_slug, list);
  }
  return base.map((raw) => {
    const merged = applyOverrides(raw, store);
    const ext = integration.species[merged.slug];
    return {
      ...merged,
      distribution: {
        ...merged.distribution,
        gbif_taxon_key: merged.distribution.gbif_taxon_key ?? ext?.gbif_key ?? undefined,
      },
      media_ids: [...new Set([...(merged.media_ids ?? []), ...(photoBySlug.get(merged.slug) ?? [])])],
      audio_ids: [...new Set([...(merged.audio_ids ?? []), ...(soundBySlug.get(merged.slug) ?? [])])],
    };
  });
}

export async function getSpeciesBySlug(slug: string): Promise<Species | null> {
  const all = await getAllSpecies();
  return all.find((s) => s.slug === slug) ?? null;
}

export async function getSpeciesById(id: string): Promise<Species | null> {
  const all = await getAllSpecies();
  return all.find((s) => s.id === id) ?? null;
}

export async function getMediaAssets(): Promise<MediaAsset[]> {
  const [integration, species, store] = await Promise.all([getIntegration(), getAllSpecies(), readStore()]);
  const bySlug = new Map(species.map((s) => [s.slug, s]));
  const photos: MediaAsset[] = integration.photos
    .filter((p) => bySlug.has(p.species_slug))
    .map((p, i) => {
      const sp = bySlug.get(p.species_slug)!;
      return {
        id: p.id,
        species_id: sp.id,
        kind: "photo",
        title: `${sp.name_cn} · 野外影像 ${String((i % 4) + 1).padStart(2, "0")}`,
        url: p.url,
        thumbnail_url: p.url,
        width: p.width ?? undefined,
        height: p.height ?? undefined,
        author: p.author,
        source_name: p.source_name,
        source_url: p.source_url,
        source_record_id: p.source_record_id,
        license: p.license,
        license_url: p.license_url ?? undefined,
        attribution: p.attribution,
        commercial_use: p.commercial_use,
        derivatives_allowed: p.derivatives_allowed,
        download_allowed: p.download_allowed,
        retrieved_at: p.retrieved_at,
        verified: p.verified,
        review_status: store.media_overrides[p.id]?.review_status ?? p.review_status,
        category: sp.group,
        location: undefined,
      };
    });
  return photos;
}

export async function getSpeciesMedia(slug: string): Promise<MediaAsset[]> {
  const media = await getMediaAssets();
  const sp = await getSpeciesBySlug(slug);
  if (!sp) return [];
  return media.filter((m) => m.species_id === sp.id);
}

export async function getAudioEntries(): Promise<AudioEntry[]> {
  const [integration, species, store] = await Promise.all([getIntegration(), getAllSpecies(), readStore()]);
  const bySlug = new Map(species.map((s) => [s.slug, s]));
  return integration.sounds
    .filter((s) => bySlug.has(s.species_slug))
    .map((s) => {
      const sp = bySlug.get(s.species_slug)!;
      return {
        id: s.id,
        species_id: sp.id,
        species_slug: s.species_slug,
        title: s.title,
        url: s.url,
        source_name: s.source_name,
        source_url: s.source_url,
        recordist: s.recordist,
        license: s.license,
        license_url: s.license_url,
        location: s.location,
        recorded_at: s.recorded_at,
        sound_type: s.sound_type,
        retrieved_at: s.retrieved_at,
        commercial_use: s.commercial_use,
        verified: s.verified,
        review_status: store.media_overrides[s.id]?.review_status ?? s.review_status,
      };
    });
}

export async function getSpeciesAudio(slug: string): Promise<AudioEntry[]> {
  const all = await getAudioEntries();
  return all.filter((a) => a.species_slug === slug);
}

export async function getNews(): Promise<NewsArticle[]> {
  const store = await readStore();
  const snapshot = NEWS_SNAPSHOT.articles ?? [];
  const live = store.live_news ?? [];
  const deleted = new Set(store.news_deleted);
  const merged = new Map<string, NewsArticle>();
  for (const a of [...snapshot, ...live, ...store.news_manual]) {
    if (deleted.has(a.id)) continue;
    merged.set(a.id, { ...applyEditorial(a), ...(store.news_overrides[a.id] ?? {}) });
  }
  return [...merged.values()].sort((a, b) => +new Date(b.published_at) - +new Date(a.published_at));
}

export async function getNewsBySlug(slug: string): Promise<NewsArticle | null> {
  const all = await getNews();
  return all.find((n) => n.slug === slug) ?? null;
}

export async function getNewsMeta(): Promise<{ generated_at: string | null; errors: Array<{ source_id: string; message: string; at: string }>; count: number }> {
  const store = await readStore();
  return {
    generated_at: store.news_live_updated_at ?? NEWS_SNAPSHOT.generated_at ?? null,
    errors: NEWS_SNAPSHOT.errors ?? [],
    count: (NEWS_SNAPSHOT.articles?.length ?? 0) + (store.live_news?.length ?? 0),
  };
}

export async function getPublishedNews(): Promise<NewsArticle[]> {
  const all = await getNews();
  return all.filter((n) => n.review_status !== "pending_review" || n.title_original);
}

export function getVideos() {
  return VIDEOS;
}

export function getQuiz() {
  return QUIZ_QUESTIONS;
}

export function getTimeline() {
  return TIMELINE;
}

export async function getSourceRegistry(): Promise<DataSourceConfig[]> {
  const store = await readStore();
  return SOURCE_REGISTRY.map((source) => {
    const override = store.source_overrides[source.id];
    const configuredByEnv =
      source.env_vars.length > 0 &&
      source.env_vars.some((key) => Boolean(process.env[key]) && key !== "GBIF_API_BASE" && key !== "INATURALIST_API_BASE" && key !== "NEWS_USER_AGENT");
    return {
      ...source,
      ...override,
      configured: override?.configured ?? (source.configured || configuredByEnv),
    };
  });
}

export function getNewsSources() {
  return NEWS_SOURCES;
}

export async function getHomeSections() {
  const store = await readStore();
  return HOME_SECTIONS.map((section) => {
    const override = store.section_overrides[section.id];
    return {
      ...section,
      default_visible: override ? override.visible : section.default_visible,
      order: override ? override.order : HOME_SECTIONS.findIndex((s) => s.id === section.id),
    };
  }).sort((a, b) => a.order - b.order);
}

export async function getSiteSettings() {
  const store = await readStore();
  const integration = await getIntegration();
  const heroImages =
    integration.hero.length > 0
      ? integration.hero
      : Array.from(new Set(integration.photos.map((p) => p.url))).slice(0, 4);
  const heroCredits = heroImages.map((url) => {
    const photo = integration.photos.find((p) => p.url === url);
    return photo
      ? {
          author: photo.author,
          license: photo.license,
          source_url: photo.source_url,
          source_name: photo.source_name,
          commercial_use: photo.commercial_use,
        }
      : null;
  });
  return {
    hero_video_url: store.settings.hero_video_url ?? process.env.NEXT_PUBLIC_HERO_VIDEO_URL ?? "",
    hero_poster:
      store.settings.hero_poster ?? process.env.NEXT_PUBLIC_HERO_VIDEO_POSTER ?? heroImages[0] ?? "",
    hero_video_credit: store.settings.hero_video_credit ?? process.env.NEXT_PUBLIC_HERO_VIDEO_CREDIT ?? "",
    hero_images: heroImages,
    hero_credits: heroCredits,
    daily_species_slug: store.settings.daily_species_slug ?? null,
    announcement: store.settings.announcement ?? null,
    integration_generated_at: integration.generated_at,
    integration_errors: integration.errors,
  };
}

export async function getDailySpecies(date = new Date()): Promise<Species> {
  const all = await getAllSpecies();
  const settings = await getSiteSettings();
  if (settings.daily_species_slug) {
    const pinned = all.find((s) => s.slug === settings.daily_species_slug);
    if (pinned) return pinned;
  }
  const key = `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}`;
  return all[hashString(key) % all.length];
}

export async function getSpeciesForSlugs(slugs: string[]): Promise<Species[]> {
  const all = await getAllSpecies();
  const map = new Map(all.map((s) => [s.slug, s]));
  return slugs.map((slug) => map.get(slug)).filter((s): s is Species => Boolean(s));
}

export async function getIntegrationStatus() {
  const integration = await getIntegration();
  return {
    generated_at: integration.generated_at,
    photo_count: integration.photos.length,
    sound_count: integration.sounds.length,
    species_count: Object.keys(integration.species).length,
    errors: integration.errors,
    provider: integration.provider,
  };
}

export function findSeedSpecies(slug: string) {
  return SPECIES_BY_SLUG.get(slug) ?? null;
}