import "server-only";
import type { NewsArticle, Species } from "@/lib/types";
import { buildContext, detectIntents, localAnswer, retrieveNews, retrieveSpecies, type KnowledgeMatch } from "@/lib/ai/knowledge";

export interface AiAnswer {
  answer: string;
  mode: "local" | "llm";
  model: string | null;
  sources: Array<{ title: string; url: string; type: "species" | "news" }>;
  matched_species: Array<{ slug: string; name_cn: string; name_en: string }>;
  disclaimer: string;
  retrieved_at: string;
}

export function isLlmConfigured(): boolean {
  return Boolean(process.env.AI_API_KEY && process.env.AI_BASE_URL && process.env.AI_MODEL);
}

function collectSources(matches: KnowledgeMatch[], news: NewsArticle[]) {
  const sources: AiAnswer["sources"] = [];
  for (const m of matches) {
    for (const src of m.species.sources.slice(0, 2)) {
      sources.push({ title: `${m.species.name_cn} · ${src.source_name}`, url: src.source_url, type: "species" });
    }
    sources.push({
      title: `${m.species.name_cn} 馆藏档案`,
      url: `/encyclopedia/${m.species.slug}`,
      type: "species",
    });
  }
  for (const n of news) {
    sources.push({ title: n.title_cn ?? n.title_original, url: n.original_url, type: "news" });
  }
  const seen = new Set<string>();
  return sources.filter((s) => {
    if (seen.has(s.url)) return false;
    seen.add(s.url);
    return true;
  }).slice(0, 8);
}

const SYSTEM_PROMPT = `你是 WILD WORLD 全球数字动物自然博物馆的动物知识助理。必须遵守：
1. 只根据提供的馆藏资料回答，不得编造物种数据、保护等级、种群数量、发布日期或来源。
2. 资料不足时明确说明"馆藏资料未覆盖"，并给出可核实的方向；不要用常识补全不确定数字。
3. 保护等级必须附带评估年份与来源；种群数量若无明确来源则不要给出具体数字。
4. 回答使用用户提问的语言（中文或英文），结构清晰，先给结论再给依据。
5. 在末尾列出所用来源名称与链接。不要声称你访问了实时互联网。
6. 不要提供饲养、投喂野生动物或捕捉动物的操作性建议。`;

export async function answerQuestion(
  question: string,
  species: Species[],
  news: NewsArticle[],
  locale: "zh" | "en"
): Promise<AiAnswer> {
  const intents = detectIntents(question);
  const matches = retrieveSpecies(question, species, 3);
  const relevantNews = retrieveNews(question, news, 2);
  const sources = collectSources(matches, relevantNews);
  const retrieved_at = new Date().toISOString();
  const disclaimer =
    "馆藏内容为编辑整理，未逐条核验原始文献；保护等级与种群趋势以 IUCN 官方评估为准。本回答不构成饲养或野外操作建议。";

  if (!isLlmConfigured()) {
    return {
      answer: localAnswer(question, matches, relevantNews, intents),
      mode: "local",
      model: null,
      sources,
      matched_species: matches.map((m) => ({ slug: m.species.slug, name_cn: m.species.name_cn, name_en: m.species.name_en })),
      disclaimer,
      retrieved_at,
    };
  }

  const context = buildContext(matches, relevantNews, intents);
  const base = (process.env.AI_BASE_URL || "").replace(/\/$/, "");
  const model = process.env.AI_MODEL as string;
  try {
    const res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.AI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        max_tokens: 900,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `馆藏资料：\n${context || "（无匹配资料）"}\n\n用户问题：${question}\n\n请以${locale === "zh" ? "中文" : "English"}回答。`,
          },
        ],
      }),
      signal: AbortSignal.timeout(45000),
    });
    if (!res.ok) throw new Error(`AI provider HTTP ${res.status}`);
    const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = json.choices?.[0]?.message?.content?.trim();
    if (!content) throw new Error("AI provider returned an empty answer");
    return {
      answer: content,
      mode: "llm",
      model,
      sources,
      matched_species: matches.map((m) => ({ slug: m.species.slug, name_cn: m.species.name_cn, name_en: m.species.name_en })),
      disclaimer,
      retrieved_at,
    };
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    return {
      answer: `${localAnswer(question, matches, relevantNews, intents)}\n\n（语言模型调用失败：${reason}。已回退到本地知识库检索模式，未重试伪造答案。）`,
      mode: "local",
      model: null,
      sources,
      matched_species: matches.map((m) => ({ slug: m.species.slug, name_cn: m.species.name_cn, name_en: m.species.name_en })),
      disclaimer,
      retrieved_at,
    };
  }
}