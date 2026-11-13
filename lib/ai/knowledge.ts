import type { NewsArticle, Species } from "@/lib/types";

export interface KnowledgeMatch {
  species: Species;
  score: number;
  reasons: string[];
}

const FIELD_INTENTS: Array<{ key: string; words: string[]; label: string }> = [
  { key: "diet", words: ["吃", "食物", "食性", "喂", "捕食", "diet", "eat"], label: "食性" },
  { key: "size", words: ["多大", "体长", "身高", "体型", "size", "length", "height"], label: "体型" },
  { key: "weight", words: ["重", "体重", "weight"], label: "体重" },
  { key: "lifespan", words: ["寿命", "活多久", "lifespan", "live"], label: "寿命" },
  { key: "speed", words: ["速度", "跑", "快", "speed", "fast"], label: "速度" },
  { key: "habitat", words: ["栖息", "生活在哪里", "分布", "产地", "habitat", "where"], label: "栖息地" },
  { key: "reproduction", words: ["繁殖", "生育", "怀孕", "繁殖", "reproduce", "breeding"], label: "繁殖" },
  { key: "conservation", words: ["保护", "濒危", "灭绝", "等级", "conservation", "endangered", "iucn"], label: "保护状况" },
  { key: "taxonomy", words: ["分类", "学名", "科", "属", "taxonomy", "scientific"], label: "分类" },
  { key: "behavior", words: ["习性", "行为", "社会", "behavior"], label: "行为" },
];

export function detectIntents(question: string): string[] {
  const q = question.toLowerCase();
  return FIELD_INTENTS.filter((f) => f.words.some((w) => q.includes(w))).map((f) => f.key);
}

export function retrieveSpecies(question: string, species: Species[], limit = 3): KnowledgeMatch[] {
  const q = question.toLowerCase().trim();
  if (!q) return [];
  const matches: KnowledgeMatch[] = [];
  for (const s of species) {
    let score = 0;
    const reasons: string[] = [];
    const names = [s.name_cn, s.name_en, s.scientific_name, ...s.aliases];
    for (const name of names) {
      if (name && q.includes(name.toLowerCase())) {
        score += name === s.name_cn ? 120 : 90;
        reasons.push(`名称命中：${name}`);
      }
    }
    const fields = [
      { text: s.summary, weight: 2, label: "概述" },
      { text: s.diet, weight: 3, label: "食性" },
      { text: s.habitat, weight: 2, label: "栖息地" },
      { text: s.behavior, weight: 2, label: "行为" },
      { text: s.fun_facts.join(" "), weight: 1.5, label: "趣闻" },
      { text: `${s.taxonomy.order} ${s.taxonomy.family} ${s.group_label}`, weight: 1, label: "分类" },
      { text: s.conservation.population_note, weight: 1, label: "保护" },
    ];
    for (const f of fields) {
      if (!f.text) continue;
      const lower = f.text.toLowerCase();
      if (q.length >= 2 && lower.includes(q)) {
        score += 20 * f.weight;
        reasons.push(`${f.label}段落直接命中`);
      }
    }
    const intents = detectIntents(question);
    if (intents.length > 0 && score > 0) {
      score += 8;
      reasons.push(`意图：${intents.join("/")}`);
    }
    if (score > 0) matches.push({ species: s, score, reasons });
  }
  return matches.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function retrieveNews(question: string, news: NewsArticle[], limit = 3): NewsArticle[] {
  const q = question.toLowerCase().trim();
  if (q.length < 2) return [];
  return news
    .filter((n) => `${n.title_cn ?? ""} ${n.title_original} ${n.summary_cn ?? ""} ${n.keywords.join(" ")}`.toLowerCase().includes(q))
    .slice(0, limit);
}

export function buildContext(matches: KnowledgeMatch[], news: NewsArticle[], intents: string[]): string {
  const blocks: string[] = [];
  for (const { species: s } of matches) {
    const lines = [
      `物种：${s.name_cn}（${s.name_en} / ${s.scientific_name}）`,
      `分类：${s.taxonomy.class} > ${s.taxonomy.order} > ${s.taxonomy.family}`,
      `概述：${s.summary}`,
      `外形：${s.appearance}`,
      `行为：${s.behavior}`,
      `食性：${s.diet}（类型：${s.diet_type.join("、")}）`,
      `栖息地：${s.habitat}`,
      `繁殖：${s.reproduction}`,
      `体长：${s.size.length_cm ? `${s.size.length_cm[0]}–${s.size.length_cm[1]} 厘米` : "资料待补充"}`,
      `体重：${s.weight.min_kg}–${s.weight.max_kg} 公斤`,
      `寿命：${s.lifespan_years[0]}–${s.lifespan_years[1]} 年`,
      `保护等级：${s.conservation.status_label}（${s.conservation.status}），${s.conservation.assessment_year} 年评估，趋势 ${s.conservation.trend}`,
      `保护说明：${s.conservation.population_note}`,
      `分布：${s.distribution.regions.join("、")}；${s.distribution.countries.join("、")}`,
      `来源：${s.sources.map((src) => `${src.source_name}（${src.source_url}）`).join("；")}`,
    ];
    blocks.push(lines.join("\n"));
  }
  for (const n of news) {
    blocks.push(
      `新闻：${n.title_cn ?? n.title_original}｜来源：${n.source_name}｜发布日期：${n.published_at.slice(0, 10)}｜原文：${n.original_url}`
    );
  }
  if (intents.length > 0) blocks.push(`用户关注维度：${intents.join("、")}`);
  return blocks.join("\n\n");
}

export function localAnswer(
  question: string,
  matches: KnowledgeMatch[],
  news: NewsArticle[],
  intents: string[]
): string {
  if (matches.length === 0 && news.length === 0) {
    return [
      "馆藏知识库暂未收录与该问题直接相关的内容。",
      "",
      "我可以基于站内已核验来源回答物种分类、形态、食性、栖息地、繁殖、保护等级与观测分布等问题。",
      "请尝试使用具体物种名（例如「大熊猫」「雪豹」「蓝鲸」），或浏览动物百科。",
      "",
      "说明：当前为本地知识库检索模式，未调用语言模型，也不会编造未收录的信息。",
    ].join("\n");
  }

  const lines: string[] = [];
  if (matches.length > 0) {
    const s = matches[0].species;
    lines.push(`关于「${s.name_cn}（${s.name_en}）」，馆藏档案提供以下信息：`);
    lines.push("");
    const intentSet = new Set(intents);
    const push = (key: string, text: string) => {
      lines.push(`• ${text}`);
    };
    if (intentSet.has("diet")) push("diet", `食性：${s.diet}（${s.diet_type.join(" / ")}）`);
    if (intentSet.has("size")) push("size", `体型：${s.size.length_cm ? `体长 ${s.size.length_cm[0]}–${s.size.length_cm[1]} 厘米` : "体长资料待补充"}${s.size.height_cm ? `；体高 ${s.size.height_cm[0]}–${s.size.height_cm[1]} 厘米` : ""}`);
    if (intentSet.has("weight")) push("weight", `体重：${s.weight.min_kg}–${s.weight.max_kg} 公斤`);
    if (intentSet.has("lifespan")) push("lifespan", `寿命：${s.lifespan_years[0]}–${s.lifespan_years[1]} 年（上限估计）`);
    if (intentSet.has("speed")) push("speed", `速度：${s.speed_kmh ? `${s.speed_kmh} km/h（口径以档案说明为准）` : "资料待补充"}`);
    if (intentSet.has("habitat")) push("habitat", `栖息地：${s.habitat}`);
    if (intentSet.has("reproduction")) push("reproduction", `繁殖：${s.reproduction}`);
    if (intentSet.has("conservation")) {
      push("conservation", `保护状况：${s.conservation.status_label}（${s.conservation.status}），${s.conservation.assessment_year} 年评估，趋势 ${s.conservation.trend}。${s.conservation.population_note}`);
    }
    if (intentSet.has("taxonomy")) push("taxonomy", `分类：${s.taxonomy.class} > ${s.taxonomy.order} > ${s.taxonomy.family} > ${s.taxonomy.genus}`);
    if (intentSet.has("behavior")) push("behavior", `行为与习性：${s.behavior}`);

    if (intentSet.size === 0) {
      lines.push(`• ${s.summary}`);
      lines.push(`• 食性：${s.diet}`);
      lines.push(`• 保护等级：${s.conservation.status_label}（${s.conservation.status}，${s.conservation.assessment_year} 年评估）`);
    }
    lines.push("");
    lines.push(`来源：${s.sources.map((src) => `${src.source_name}：${src.source_url}`).join("；")}`);
    if (matches.length > 1) {
      lines.push("");
      lines.push(`馆藏中还有：${matches.slice(1).map((m) => m.species.name_cn).join("、")}，可在动物百科继续查看。`);
    }
  }

  if (news.length > 0) {
    lines.push("");
    lines.push("相关新闻（来自已接入的 RSS 源，中文摘要可能待审核）：");
    for (const n of news) {
      lines.push(`• ${n.title_cn ?? n.title_original}（${n.source_name}，${n.published_at.slice(0, 10)}）${n.original_url}`);
    }
  }

  lines.push("");
  lines.push(
    "说明：当前为本地知识库检索模式，未调用语言模型。答案只来自馆藏编辑整理内容，资料状态为「编辑整理」，未逐条核验原始文献；保护等级以 IUCN 官方页面为准。"
  );
  return lines.join("\n");
}