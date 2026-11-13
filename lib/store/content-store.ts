import "server-only";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import type { DataSourceConfig, NewsArticle, Species } from "@/lib/types";

export interface SectionOverride {
  visible: boolean;
  order: number;
}

export interface SyncLogEntry {
  id: string;
  job: string;
  status: "success" | "partial" | "failed";
  message: string;
  started_at: string;
  finished_at: string;
  items: number;
  actor: string;
}

export interface MediaReviewOverride {
  review_status: "verified" | "editorial" | "pending_review" | "sample";
  note?: string;
}

export interface StoreSettings {
  hero_video_url?: string;
  hero_poster?: string;
  hero_video_credit?: string;
  daily_species_slug?: string;
  announcement?: string;
}

export interface StoreShape {
  version: number;
  species_overrides: Record<string, Partial<Species>>;
  new_species: Species[];
  deleted_species: string[];
  news_overrides: Record<string, Partial<NewsArticle>>;
  news_manual: NewsArticle[];
  news_deleted: string[];
  source_overrides: Record<string, Partial<DataSourceConfig>>;
  media_overrides: Record<string, MediaReviewOverride>;
  section_overrides: Record<string, SectionOverride>;
  settings: StoreSettings;
  sync_logs: SyncLogEntry[];
  updated_at: string;
}

export const EMPTY_STORE: StoreShape = {
  version: 1,
  species_overrides: {},
  new_species: [],
  deleted_species: [],
  news_overrides: {},
  news_manual: [],
  news_deleted: [],
  source_overrides: {},
  media_overrides: {},
  section_overrides: {},
  settings: {},
  sync_logs: [],
  updated_at: new Date(0).toISOString(),
};

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_PATH = path.join(DATA_DIR, "content.json");

let writeLock: Promise<void> = Promise.resolve();

export async function readStore(): Promise<StoreShape> {
  try {
    const raw = await readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<StoreShape>;
    return {
      ...EMPTY_STORE,
      ...parsed,
      species_overrides: parsed.species_overrides ?? {},
      new_species: parsed.new_species ?? [],
      deleted_species: parsed.deleted_species ?? [],
      news_overrides: parsed.news_overrides ?? {},
      news_manual: parsed.news_manual ?? [],
      news_deleted: parsed.news_deleted ?? [],
      source_overrides: parsed.source_overrides ?? {},
      media_overrides: parsed.media_overrides ?? {},
      section_overrides: parsed.section_overrides ?? {},
      settings: parsed.settings ?? {},
      sync_logs: parsed.sync_logs ?? [],
    };
  } catch {
    return { ...EMPTY_STORE };
  }
}

async function writeStoreDirect(store: StoreShape): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  const tmp = `${STORE_PATH}.tmp`;
  await writeFile(tmp, JSON.stringify(store, null, 2), "utf8");
  await writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
  try {
    const { rename } = await import("node:fs/promises");
    await rename(tmp, STORE_PATH);
  } catch {
    // rename can fail on some mounted volumes; the direct write above is the fallback.
  }
}

export async function mutateStore<T>(
  mutator: (store: StoreShape) => T | Promise<T>
): Promise<{ ok: boolean; result?: T; error?: string }> {
  let release: () => void = () => {};
  const previous = writeLock;
  writeLock = new Promise<void>((resolve) => {
    release = resolve;
  });
  await previous;
  try {
    const store = await readStore();
    const result = await mutator(store);
    store.updated_at = new Date().toISOString();
    await writeStoreDirect(store);
    return { ok: true, result };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  } finally {
    release();
  }
}

export async function appendSyncLog(entry: Omit<SyncLogEntry, "id" | "started_at" | "finished_at"> & {
  started_at: string;
  finished_at: string;
}): Promise<void> {
  await mutateStore((store) => {
    store.sync_logs = [
      { ...entry, id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` },
      ...store.sync_logs,
    ].slice(0, 200);
  });
}

export function getStorePath(): string {
  return STORE_PATH;
}