import "server-only";

/** Wikipedia 摘要接口：公开可用，但只用于辅助核对，不整段复制正文。 */
export async function fetchWikipediaSummary(title: string, lang = "en"): Promise<{
  state: "live" | "error";
  message: string;
  title: string;
  extract: string | null;
  sourceUrl: string;
  license: string;
}> {
  const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, "_"))}`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": process.env.NEWS_USER_AGENT || "WILDWORLD-Museum/1.0" },
      signal: AbortSignal.timeout(15000),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = (await res.json()) as { title?: string; extract?: string };
    return {
      state: "live",
      message: "Wikipedia 摘要获取成功。仅作辅助核对，正文引用需署名并遵循 CC BY-SA。",
      title: json.title ?? title,
      extract: json.extract ?? null,
      sourceUrl: url,
      license: "CC BY-SA 4.0",
    };
  } catch (err) {
    return {
      state: "error",
      message: `Wikipedia 请求失败：${err instanceof Error ? err.message : String(err)}`,
      title,
      extract: null,
      sourceUrl: url,
      license: "CC BY-SA 4.0",
    };
  }
}

/**
 * Animal Diversity Web 没有公开 API。本适配层只返回人工引用入口，
 * 不进行抓取，也不把页面内容缓存进馆藏。
 */
export async function getAdwReference(path: string): Promise<{
  state: "manual";
  message: string;
  sourceUrl: string;
  license: string;
}> {
  return {
    state: "manual",
    message: "ADW 无公开 API：需人工阅读并逐页核对许可（通常为 CC BY-NC-SA）。",
    sourceUrl: `https://animaldiversity.org/accounts/${encodeURIComponent(path)}/`,
    license: "CC BY-NC-SA 3.0（需逐页核对）",
  };
}