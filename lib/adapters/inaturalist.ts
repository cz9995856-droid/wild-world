import "server-only";

const BASE = process.env.INATURALIST_API_BASE || "https://api.inaturalist.org/v1";

export interface ObservationPoint {
  id: number;
  lat: number;
  lng: number;
  place: string | null;
  observedOn: string | null;
  quality: string | null;
  license: string | null;
  photoUrl: string | null;
  sourceUrl: string;
}

export interface ObservationResult {
  state: "live" | "error" | "unconfigured";
  source: "iNaturalist";
  message: string;
  retrieved_at: string;
  total: number;
  records: ObservationPoint[];
  disclaimer: string;
}

export async function fetchObservations(params: {
  taxonId?: number | null;
  scientificName?: string;
  limit?: number;
  qualityGrade?: "research" | "any";
}): Promise<ObservationResult> {
  const retrieved_at = new Date().toISOString();
  if (!params.taxonId && !params.scientificName) {
    return {
      state: "unconfigured",
      source: "iNaturalist",
      message: "缺少物种标识，无法查询 iNaturalist 观测记录。",
      retrieved_at,
      total: 0,
      records: [],
      disclaimer: "请先选择物种。",
    };
  }
  const limit = Math.min(Math.max(params.limit ?? 100, 1), 200);
  const query = new URLSearchParams({ per_page: String(limit), page: "1", geo: "true" });
  if (params.taxonId) query.set("taxon_id", String(params.taxonId));
  else if (params.scientificName) query.set("taxon_name", params.scientificName);
  query.set("quality_grade", params.qualityGrade ?? "research");
  query.set("order_by", "observed_on");

  try {
    const res = await fetch(`${BASE}/observations?${query.toString()}`, {
      headers: { "User-Agent": process.env.NEWS_USER_AGENT || "WILDWORLD-Museum/1.0" },
      signal: AbortSignal.timeout(15000),
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`iNaturalist HTTP ${res.status}`);
    const json = (await res.json()) as {
      total_results?: number;
      results?: Array<{
        id: number;
        location?: string;
        place_guess?: string;
        observed_on?: string;
        quality_grade?: string;
        license_code?: string;
        photos?: Array<{ url?: string; medium_url?: string }>;
      }>;
    };
    const records: ObservationPoint[] = [];
    for (const o of json.results ?? []) {
      if (!o.location) continue;
      const [lat, lng] = o.location.split(",").map(Number);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
      records.push({
        id: o.id,
        lat,
        lng,
        place: o.place_guess ?? null,
        observedOn: o.observed_on ?? null,
        quality: o.quality_grade ?? null,
        license: o.license_code ?? null,
        photoUrl: o.photos?.[0]?.medium_url ?? o.photos?.[0]?.url ?? null,
        sourceUrl: `https://www.inaturalist.org/observations/${o.id}`,
      });
    }
    return {
      state: "live",
      source: "iNaturalist",
      message: `iNaturalist 实时返回 ${records.length} 条研究级观察记录。`,
      retrieved_at,
      total: json.total_results ?? records.length,
      records,
      disclaimer: "观察点反映公民科学采样位置，不等同于完整分布范围。",
    };
  } catch (err) {
    return {
      state: "error",
      source: "iNaturalist",
      message: `iNaturalist 请求失败：${err instanceof Error ? err.message : String(err)}`,
      retrieved_at,
      total: 0,
      records: [],
      disclaimer: "外部接口不可用时不展示任何模拟点位。",
    };
  }
}