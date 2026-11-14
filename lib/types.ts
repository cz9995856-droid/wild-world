export type ReviewStatus = "verified" | "editorial" | "pending_review" | "sample";
export type DataStatus = "live" | "curated" | "pending" | "unconfigured";

export type ConservationCode =
  | "LC"
  | "NT"
  | "VU"
  | "EN"
  | "CR"
  | "EW"
  | "EX"
  | "DD"
  | "NE";

export type Trend = "decreasing" | "stable" | "increasing" | "unknown";

export interface SourceRef {
  source_name: string;
  source_url: string;
  source_record_id?: string;
  license: string;
  retrieved_at: string;
  published_at?: string;
  verified: boolean;
  review_status: ReviewStatus;
  note?: string;
}

export interface MediaAsset {
  id: string;
  species_id: string | null;
  kind: "photo" | "video" | "audio" | "model";
  title: string;
  url: string;
  thumbnail_url?: string;
  width?: number;
  height?: number;
  author: string;
  source_name: string;
  source_url: string;
  source_record_id: string;
  license: string;
  license_url?: string;
  attribution: string;
  commercial_use: boolean;
  derivatives_allowed: boolean;
  download_allowed: boolean;
  location?: string;
  captured_at?: string;
  retrieved_at: string;
  verified: boolean;
  review_status: ReviewStatus;
  category?: string;
}

export interface Taxonomy {
  kingdom: string;
  phylum: string;
  class: string;
  order: string;
  family: string;
  genus: string;
}

export interface ConservationAssessment {
  status: ConservationCode;
  status_label: string;
  trend: Trend;
  assessment_year: number;
  population_note: string;
  threats: string[];
  measures: string[];
  source: SourceRef;
}

export interface Distribution {
  regions: string[];
  countries: string[];
  biomes: string[];
  note: string;
  gbif_taxon_key?: number;
}

export interface Species {
  id: string;
  slug: string;
  name_cn: string;
  name_en: string;
  scientific_name: string;
  aliases: string[];
  group: string;
  group_label: string;
  tagline: string;
  summary: string;
  appearance: string;
  behavior: string;
  diet: string;
  diet_type: string[];
  habitat: string;
  reproduction: string;
  size: { length_cm: [number, number] | null; height_cm: [number, number] | null };
  weight: { min_kg: number; max_kg: number };
  lifespan_years: [number, number];
  speed_kmh: number | null;
  fun_facts: string[];
  conservation: ConservationAssessment;
  distribution: Distribution;
  taxonomy: Taxonomy;
  media_ids: string[];
  audio_ids: string[];
  related_slugs: string[];
  sources: SourceRef[];
  data_status: DataStatus;
  review_status: ReviewStatus;
  verified: boolean;
  featured: boolean;
  updated_at: string;
  palette: { base: string; deep: string; accent: string };
  artwork: "bear" | "cat" | "elephant" | "whale" | "giraffe" | "primate" | "bird" | "reptile" | "amphibian" | "insect" | "canine" | "antelope" | "fish" | "invertebrate";
}

export type NewsCategory =
  | "new_species"
  | "conservation"
  | "research"
  | "environment"
  | "incident"
  | "zoo";

export interface NewsArticle {
  id: string;
  slug: string;
  title_original: string;
  title_cn: string | null;
  excerpt_original: string;
  summary_cn: string | null;
  summary_status: "pending_ai" | "generated" | "manual";
  keywords: string[];
  category: NewsCategory;
  source_name: string;
  source_id: string;
  source_url: string;
  original_url: string;
  image_url: string | null;
  language: string;
  published_at: string;
  retrieved_at: string;
  license_note: string;
  review_status: ReviewStatus;
  verified: boolean;
  ai_generated: boolean;
  featured: boolean;
}

export interface VideoEntry {
  id: string;
  slug: string;
  title_cn: string;
  title_en: string;
  description: string;
  producer: string;
  producer_url: string;
  official_url: string;
  duration: string;
  year: number;
  species_slugs: string[];
  cover_url: string;
  embed_allowed: boolean;
  license_note: string;
  region: string;
  review_status: ReviewStatus;
}

export interface AudioEntry {
  id: string;
  species_id: string;
  species_slug: string;
  title: string;
  url: string;
  source_name: string;
  source_url: string;
  recordist: string;
  license: string;
  license_url: string;
  location: string;
  recorded_at: string;
  sound_type: string;
  retrieved_at: string;
  commercial_use: boolean;
  verified: boolean;
  review_status: ReviewStatus;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  answer_index: number;
  explanation: string;
  difficulty: 1 | 2 | 3;
  category: string;
  source_name: string;
  source_url: string;
}

export interface TimelineEra {
  id: string;
  title: string;
  range_label: string;
  mya_start: number;
  mya_end: number;
  description: string;
  highlights: string[];
  species_slugs: string[];
  source_name: string;
  source_url: string;
  node_kind: "era" | "fossil" | "node";
}

export interface FeedingPlan {
  species_slug: string;
  diet_summary: string;
  items: {
    name: string;
    share_pct: number;
    note: string;
    caution?: string;
  }[];
  daily_energy_kcal: number | null;
  feeding_frequency: string;
  simulation_note: string;
  sources: SourceRef[];
}

export interface SiteSectionConfig {
  id: string;
  label: string;
  href: string;
  description: string;
  default_visible: boolean;
  kind: "home" | "page";
}

export interface DataSourceConfig {
  id: string;
  name: string;
  homepage: string;
  purpose: string;
  access: "no_key" | "api_key" | "oauth" | "manual" | "permission";
  configured: boolean;
  live: boolean;
  license_note: string;
  env_vars: string[];
  adapter: string;
  status_note: string;
  commercial_restriction: string;
  last_checked_at: string;
}