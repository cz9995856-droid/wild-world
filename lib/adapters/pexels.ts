import "server-only";

export interface PexelsStatus {
  state: "unconfigured" | "live" | "error";
  message: string;
  required_env: string[];
  docs_url: string;
  photos: Array<{
    id: number;
    url: string;
    photographer: string;
    photographer_url: string;
    source_url: string;
    alt: string;
    width: number;
    height: number;
  }>;
}

/**
 * Pexels 官方 API 适配层。
 * 只能通过 api.pexels.com 官方接口访问，禁止抓取站内页面或绕过 API。
 * 未配置 PEXELS_API_KEY 时明确返回未配置，不伪造任何素材。
 */
export async function searchPexels(query: string, perPage = 12): Promise<PexelsStatus> {
  const key = process.env.PEXELS_API_KEY;
  if (!key) {
    return {
      state: "unconfigured",
      message: "未配置 PEXELS_API_KEY。高清图库扩展需要 Pexels 官方 API Key，当前图片仍来自馆藏 iNaturalist 授权影像。",
      required_env: ["PEXELS_API_KEY"],
      docs_url: "https://www.pexels.com/api/documentation/",
      photos: [],
    };
  }
  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape`,
      {
        headers: { Authorization: key },
        signal: AbortSignal.timeout(20000),
        cache: "no-store",
      }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = (await res.json()) as {
      photos?: Array<{
        id: number;
        url: string;
        photographer: string;
        photographer_url: string;
        alt: string;
        width: number;
        height: number;
        src?: { original?: string; large2x?: string };
      }>;
    };
    const photos = (json.photos ?? []).map((p) => ({
      id: p.id,
      url: p.src?.large2x ?? p.src?.original ?? "",
      photographer: p.photographer,
      photographer_url: p.photographer_url,
      source_url: p.url,
      alt: p.alt ?? "",
      width: p.width,
      height: p.height,
    })).filter((p) => p.url);
    return {
      state: "live",
      message: `Pexels 返回 ${photos.length} 张横向照片；使用前需保留摄影师署名与原始链接，并遵守 Pexels License。`,
      required_env: ["PEXELS_API_KEY"],
      docs_url: "https://www.pexels.com/api/documentation/",
      photos,
    };
  } catch (err) {
    return {
      state: "error",
      message: `Pexels 请求失败：${err instanceof Error ? err.message : String(err)}`,
      required_env: ["PEXELS_API_KEY"],
      docs_url: "https://www.pexels.com/api/documentation/",
      photos: [],
    };
  }
}