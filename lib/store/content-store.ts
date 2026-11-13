import "server-only";
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
  live_news: NewsArticle[];
  news_live_updated_at?: string;
  source_overrides: Record<string, Partial<DataSourceConfig>>;
  media_overrides: Record<string, MediaReviewOverride>;
  section_overrides: Record<string, SectionOverride>;
  settings: StoreSettings;
  sync_logs: SyncLogEntry[];
  updated_at: string;
}

function emptyStore(): StoreShape {
  return {
    version: 1,
    species_overrides: {},
    new_species: [],
    deleted_species: [],
    news_overrides: {},
    news_manual: [],
    news_deleted: [],
    live_news: [],
    source_overrides: {},
    media_overrides: {},
    section_overrides: {},
    settings: {},
    sync_logs: [],
    updated_at: new Date(0).toISOString(),
  };
}

export const EMPTY_STORE: StoreShape = emptyStore();

const STORE_PATH = ".data/content.json";

let writeLock: Promise<void> = Promise.resolve();
let schemaReady: Promise<void> | null = null;

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(): Promise<T | null>;
  run(): Promise<unknown>;
}

interface D1DatabaseLike {
  prepare(query: string): D1PreparedStatement;
}

async function getD1(): Promise<D1DatabaseLike | null> {
  if (process.env.STORAGE_DRIVER !== "d1") return null;
  try {
    const mod = await import("@opennextjs/cloudflare");
    const context = mod.getCloudflareContext();
    const db = (context?.env as { DB?: D1DatabaseLike } | undefined)?.DB;
    return db ?? null;
  } catch {
    return null;
  }
}

async function ensureSchema(db: D1DatabaseLike): Promise<void> {
  if (!schemaReady) {
    schemaReady = db
      .prepare(
        "CREATE TABLE IF NOT EXISTS content_store (id TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL)"
      )
      .run()
      .then(() => undefined)
      .catch((err) => {
        schemaReady = null;
        throw err;
      });
  }
  await schemaReady;
}

function normalizeStore(parsed: Partial<StoreShape>): StoreShape {
  return {
    ...emptyStore(),
    ...parsed,
    version: parsed.version ?? 1,
    species_overrides: parsed.species_overrides ?? {},
    new_species: parsed.new_species ?? [],
    deleted_species: parsed.deleted_species ?? [],
    news_overrides: parsed.news_overrides ?? {},
    news_manual: parsed.news_manual ?? [],
    news_deleted: parsed.news_deleted ?? [],
    live_news: parsed.live_news ?? [],
    source_overrides: parsed.source_overrides ?? {},
    media_overrides: parsed.media_overrides ?? {},
    section_overrides: parsed.section_overrides ?? {},
    settings: parsed.settings ?? {},
    sync_logs: parsed.sync_logs ?? [],
  };
}

async function readFileStore(): Promise<StoreShape> {
  try {
    const { readFile } = await import("node:fs/promises");
    const path = await import("node:path");
    const raw = await readFile(path.join(process.cwd(), STORE_PATH), "utf8");
    return normalizeStore(JSON.parse(raw) as Partial<StoreShape>);
  } catch {
    return emptyStore();
  }
}

export async function readStore(): Promise<StoreShape> {
  const db = await getD1();
  if (db) {
    await ensureSchema(db);
    const row = await db
      .prepare("SELECT value FROM content_store WHERE id = ?")
      .bind("store")
      .first<{ value: string }>();
    if (!row?.value) return emptyStore();
    try {
      return normalizeStore(JSON.parse(row.value) as Partial<StoreShape>);
    } catch {
      return emptyStore();
    }
  }
  return readFileStore();
}

async function writeStoreDirect(store: StoreShape): Promise<void> {
  const db = await getD1();
  if (db) {
    await ensureSchema(db);
    await db
      .prepare(
        "INSERT INTO content_store (id, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at"
      )
      .bind("store", JSON.stringify(store), new Date().toISOString())
      .run();
    return;
  }

  const { writeFile, mkdir, rename } = await import("node:fs/promises");
  const path = await import("node:path");
  const dataDir = path.join(process.cwd(), ".data");
  const storePath = path.join(process.cwd(), STORE_PATH);
  await mkdir(dataDir, { recursive: true });
  const tmp = `${storePath}.tmp`;
  await writeFile(tmp, JSON.stringify(store, null, 2), "utf8");
  await writeFile(storePath, JSON.stringify(store, null, 2), "utf8");
  try {
    await rename(tmp, storePath);
  } catch {
    // The direct write above is the fallback on volumes that reject rename.
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