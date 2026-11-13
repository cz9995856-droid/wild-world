import "server-only";

export interface MediaProviderStatus {
  state: "unconfigured" | "live" | "error";
  message: string;
  required_env: string[];
  docs_url: string;
  assets: Array<Record<string, unknown>>;
}

export async function searchMacaulay(query: string): Promise<MediaProviderStatus> {
  const key = process.env.MACAULAY_LIBRARY_API_KEY;
  if (!key) {
    return {
      state: "unconfigured",
      message: "未配置 MACAULAY_LIBRARY_API_KEY，且需要机构授权后才能使用声音与影像。",
      required_env: ["MACAULAY_LIBRARY_API_KEY"],
      docs_url: "https://www.macaulaylibrary.org/",
      assets: [],
    };
  }
  try {
    const res = await fetch(
      `https://search.macaulaylibrary.org/api/v1/search?q=${encodeURIComponent(query)}&count=20`,
      {
        headers: { "x-ebra-api-key": key },
        signal: AbortSignal.timeout(25000),
        cache: "no-store",
      }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = (await res.json()) as unknown;
    const items = Array.isArray(json) ? json : ((json as { results?: unknown[] }).results ?? []);
    return {
      state: "live",
      message: `Macaulay Library 返回 ${items.length} 条结果；逐条核验授权后方可使用。`,
      required_env: ["MACAULAY_LIBRARY_API_KEY"],
      docs_url: "https://www.macaulaylibrary.org/",
      assets: items as Array<Record<string, unknown>>,
    };
  } catch (err) {
    return {
      state: "error",
      message: `Macaulay 请求失败：${err instanceof Error ? err.message : String(err)}`,
      required_env: ["MACAULAY_LIBRARY_API_KEY"],
      docs_url: "https://www.macaulaylibrary.org/",
      assets: [],
    };
  }
}

export async function searchSmithsonian(query: string): Promise<MediaProviderStatus> {
  const key = process.env.SMITHSONIAN_API_KEY;
  if (!key) {
    return {
      state: "unconfigured",
      message: "未配置 SMITHSONIAN_API_KEY。高清藏品影像与 3D 扫描尚未接入。",
      required_env: ["SMITHSONIAN_API_KEY"],
      docs_url: "https://www.si.edu/openaccess",
      assets: [],
    };
  }
  try {
    const res = await fetch(
      `https://api.si.edu/openaccess/api/v1.0/search?q=${encodeURIComponent(query)}&rows=20&api_key=${encodeURIComponent(key)}`,
      { signal: AbortSignal.timeout(25000), cache: "no-store" }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = (await res.json()) as { response?: { rows?: unknown[] } };
    const rows = json.response?.rows ?? [];
    return {
      state: "live",
      message: `Smithsonian Open Access 返回 ${rows.length} 条结果；需逐条核对 CC0/授权状态。`,
      required_env: ["SMITHSONIAN_API_KEY"],
      docs_url: "https://www.si.edu/openaccess",
      assets: rows as Array<Record<string, unknown>>,
    };
  } catch (err) {
    return {
      state: "error",
      message: `Smithsonian 请求失败：${err instanceof Error ? err.message : String(err)}`,
      required_env: ["SMITHSONIAN_API_KEY"],
      docs_url: "https://www.si.edu/openaccess",
      assets: [],
    };
  }
}