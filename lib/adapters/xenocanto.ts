import "server-only";

export interface RecordingSearchResult {
  state: "unconfigured" | "live" | "error";
  message: string;
  required_env: string[];
  docs_url: string;
  recordings: Array<{
    id: string;
    species: string;
    recordist: string;
    license: string;
    location: string;
    recordedAt: string;
    soundType: string;
    fileUrl: string | null;
    sourceUrl: string;
  }>;
}

/** Xeno-canto API v3 适配层。v2 已停用；未配置 Key 时返回明确的未配置状态。 */
export async function searchXenoCanto(query: string, limit = 20): Promise<RecordingSearchResult> {
  const key = process.env.XENO_CANTO_API_KEY;
  if (!key) {
    return {
      state: "unconfigured",
      message: "未配置 XENO_CANTO_API_KEY。声音实验室使用 iNaturalist 授权录音。",
      required_env: ["XENO_CANTO_API_KEY"],
      docs_url: "https://xeno-canto.org/explore/api",
      recordings: [],
    };
  }
  try {
    const url = `https://xeno-canto.org/api/3/recordings?query=${encodeURIComponent(query)}&key=${encodeURIComponent(key)}&per_page=${limit}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(25000), cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = (await res.json()) as {
      recordings?: Array<{
        id: string;
        en?: string;
        gen?: string;
        sp?: string;
        rec?: string;
        lic?: string;
        loc?: string;
        date?: string;
        type?: string;
        file?: string;
        url?: string;
      }>;
    };
    const recordings = (json.recordings ?? []).map((r) => ({
      id: r.id,
      species: r.en ?? `${r.gen} ${r.sp}`,
      recordist: r.rec ?? "",
      license: r.lic ?? "",
      location: r.loc ?? "",
      recordedAt: r.date ?? "",
      soundType: r.type ?? "",
      fileUrl: r.file ?? null,
      sourceUrl: r.url ?? `https://xeno-canto.org/${r.id}`,
    }));
    return {
      state: "live",
      message: `Xeno-canto 返回 ${recordings.length} 条录音（使用前需逐条核验许可）。`,
      required_env: ["XENO_CANTO_API_KEY"],
      docs_url: "https://xeno-canto.org/explore/api",
      recordings,
    };
  } catch (err) {
    return {
      state: "error",
      message: `Xeno-canto 请求失败：${err instanceof Error ? err.message : String(err)}`,
      required_env: ["XENO_CANTO_API_KEY"],
      docs_url: "https://xeno-canto.org/explore/api",
      recordings: [],
    };
  }
}