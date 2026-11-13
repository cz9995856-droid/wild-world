import "server-only";

export interface IUCNResult {
  state: "unconfigured" | "live" | "error";
  message: string;
  required_env: string[];
  docs_url: string;
  records: Array<Record<string, unknown>>;
}

/**
 * IUCN Red List API 适配层。
 * 访问前需确认 API Token、许可与商业用途限制。未配置 Token 时绝不返回伪造等级。
 */
export async function fetchIUCNAssessment(scientificName: string): Promise<IUCNResult> {
  const token = process.env.IUCN_API_TOKEN;
  if (!token) {
    return {
      state: "unconfigured",
      message: "未配置 IUCN_API_TOKEN。当前页面使用编辑整理的保护等级，并标注评估年份待复核。",
      required_env: ["IUCN_API_TOKEN"],
      docs_url: "https://www.iucnredlist.org/",
      records: [],
    };
  }
  try {
    const res = await fetch(
      `https://api.iucnredlist.org/api/v4/taxa/scientific_name/${encodeURIComponent(scientificName)}`,
      {
        headers: { Authorization: token, Accept: "application/json" },
        signal: AbortSignal.timeout(20000),
        cache: "no-store",
      }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = (await res.json()) as unknown;
    return {
      state: "live",
      message: "IUCN API 返回实时评估结果。",
      required_env: ["IUCN_API_TOKEN"],
      docs_url: "https://www.iucnredlist.org/",
      records: Array.isArray(json) ? (json as Array<Record<string, unknown>>) : [json as Record<string, unknown>],
    };
  } catch (err) {
    return {
      state: "error",
      message: `IUCN 请求失败：${err instanceof Error ? err.message : String(err)}`,
      required_env: ["IUCN_API_TOKEN"],
      docs_url: "https://www.iucnredlist.org/",
      records: [],
    };
  }
}