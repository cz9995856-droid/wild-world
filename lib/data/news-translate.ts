import type { NewsArticle } from "@/lib/types";

const KEY = process.env.ZHIPU_API_KEY ?? "7c61ffeb65bc41d8aed1e65b9abca6a7.1fhPXM2NkrBTb6sY";
const API = "https://open.bigmodel.cn/api/paas/v4/chat/completions";
const CONCURRENCY = 2;
const MAX_BATCH = 60;

interface TranslateResult {
  title: string;
  summary: string;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function translateOne(article: NewsArticle): Promise<TranslateResult | null> {
  const body = {
    model: "glm-4-flash",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content:
          "你是科学新闻译者。把英文标题与摘要翻译成简体中文，保留机构、物种、地名的通用中文译名，不添加原文没有的信息。只输出 JSON：{\"title\":\"...\",\"summary\":\"...\"}",
      },
      {
        role: "user",
        content: `标题：${article.title_original}\n摘要：${(article.excerpt_original || "").slice(0, 700)}`,
      },
    ],
  };
  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(45000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content ?? "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    const parsed = JSON.parse(match[0]) as TranslateResult;
    if (!parsed.title) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function translateArticles(articles: NewsArticle[]): Promise<NewsArticle[]> {
  const targets = articles.filter((article) => !article.title_cn).slice(0, MAX_BATCH);
  const result = [...articles];
  for (let i = 0; i < targets.length; i += CONCURRENCY) {
    const batch = targets.slice(i, i + CONCURRENCY);
    const translated = await Promise.all(
      batch.map(async (article) => {
        const output = await translateOne(article);
        return { article, output };
      })
    );
    for (const { article, output } of translated) {
      if (!output) continue;
      const index = result.findIndex((item) => item.id === article.id);
      if (index >= 0) {
        result[index] = {
          ...result[index],
          title_cn: output.title,
          summary_cn: output.summary,
          summary_status: "pending_ai",
        };
      }
    }
    await sleep(200);
  }
  return result;
}