import integrationJson from "@/public/data/integration.json";
import newsSnapshotJson from "@/public/data/news-snapshot.json";
import type { NewsArticle } from "@/lib/types";

export interface IntegrationSnapshot {
  generated_at: string | null;
  provider: string;
  photos: Array<{
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
  }>;
  sounds: Array<{
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
  }>;
  species: Record<
    string,
    {
      gbif_key: number | null;
      inat_taxon_id: number | null;
      inat_common_name?: string;
      gbif_status?: string | null;
      gbif_rank?: string | null;
    }
  >;
  hero: string[];
  errors: Array<{ slug: string; kind: string; message: string }>;
}

export interface NewsSnapshot {
  generated_at: string | null;
  mode?: string;
  articles: NewsArticle[];
  errors: Array<{ source_id: string; message: string; at: string }>;
}

export const INTEGRATION = integrationJson as unknown as IntegrationSnapshot;
export const NEWS_SNAPSHOT = newsSnapshotJson as unknown as NewsSnapshot;