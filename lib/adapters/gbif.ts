import "server-only";

const BASE = process.env.GBIF_API_BASE || "https://api.gbif.org/v1";
const UA = process.env.NEWS_USER_AGENT || "WILDWORLD-Museum/1.0";

export interface OccurrencePoint {
  id: string;
  decimalLatitude: number;
  decimalLongitude: number;
  country: string | null;
  locality: string | null;
  eventDate: string | null;
  basisOfRecord: string | null;
  recordedBy: string | null;
  datasetKey: string | null;
  datasetTitle: string | null;
  license: string | null;
  sourceUrl: string;
}

export interface OccurrenceResult {
  state: "live" | "error";
  source: "GBIF";
  message: string;
  retrieved_at: string;
  total: number;
  records: OccurrencePoint[];
  disclaimer: string;
}

interface GbifOccurrence {
  key?: number | string;
  decimalLatitude?: number;
  decimalLongitude?: number;
  country?: string;
  locality?: string;
  eventDate?: string;
  basisOfRecord?: string;
  recordedBy?: string;
  datasetKey?: string;
  datasetTitle?: string;
  license?: string;
  occurrenceID?: string;
}

export async function fetchOccurrences(params: {
  taxonKey?: number | null;
  scientificName?: string;
  limit?: number;
  country?: string;
  year?: string;
}): Promise<OccurrenceResult> {
  const limit = Math.min(Math.max(params.limit ?? 150, 1), 300);
  const query = new URLSearchParams({
    hasCoordinate: "true",
    hasGeospatialIssue: "false",
    limit: String(limit),
    offset: "0",
  });
  if (params.taxonKey) query.set("taxonKey", String(params.taxonKey));
  else if (params.scientificName) query.set("scientificName", params.scientificName);
  if (params.country) query.set("country", params.country);
  if (params.year) query.set("year", params.year);

  const retrieved_at = new Date().toISOString();
  try {
    const res = await fetch(`${BASE}/occurrence/search?${query.toString()}`, {
      headers: { "User-Agent": UA, Accept: "application/json" },
      signal: AbortSignal.timeout(15000),
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`GBIF HTTP ${res.status}`);
    const json = (await res.json()) as { count?: number; results?: GbifOccurrence[] };
    const records = (json.results ?? [])
      .filter((r) => typeof r.decimalLatitude === "number" && typeof r.decimalLongitude === "number")
      .map((r) => ({
        id: String(r.key ?? r.occurrenceID ?? `${r.decimalLatitude},${r.decimalLongitude}`),
        decimalLatitude: r.decimalLatitude as number,
        decimalLongitude: r.decimalLongitude as number,
        country: r.country ?? null,
        locality: r.locality ?? null,
        eventDate: r.eventDate ?? null,
        basisOfRecord: r.basisOfRecord ?? null,
        recordedBy: r.recordedBy ?? null,
        datasetKey: r.datasetKey ?? null,
        datasetTitle: r.datasetTitle ?? null,
        license: r.license ?? null,
        sourceUrl: r.key ? `https://www.gbif.org/occurrence/${r.key}` : "https://www.gbif.org/occurrence/search",
      }));
    return {
      state: "live",
      source: "GBIF",
      message: `GBIF 实时返回 ${records.length} 条带坐标记录。`,
      retrieved_at,
      total: json.count ?? records.length,
      records,
      disclaimer:
        "地图上的点为实际观测记录，并不代表完整自然分布范围。记录可能存在采样偏差，且受数据提交者许可约束。",
    };
  } catch (err) {
    return {
      state: "error",
      source: "GBIF",
      message: `GBIF 请求失败：${err instanceof Error ? err.message : String(err)}`,
      retrieved_at,
      total: 0,
      records: [],
      disclaimer: "外部接口不可用时不展示任何模拟点位。",
    };
  }
}

export async function matchSpecies(name: string): Promise<{ key: number | null; status: string | null; rank: string | null }> {
  try {
    const res = await fetch(`${BASE}/species/match?name=${encodeURIComponent(name)}`, {
      headers: { "User-Agent": UA },
      signal: AbortSignal.timeout(10000),
      next: { revalidate: 86400 },
    });
    if (!res.ok) return { key: null, status: null, rank: null };
    const json = (await res.json()) as { usageKey?: number; status?: string; rank?: string };
    return { key: json.usageKey ?? null, status: json.status ?? null, rank: json.rank ?? null };
  } catch {
    return { key: null, status: null, rank: null };
  }
}