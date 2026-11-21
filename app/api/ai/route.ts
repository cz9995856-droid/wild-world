import { NextResponse } from "next/server";
import { getNews } from "@/lib/repository";
import { CHINA_SPECIES } from "@/lib/wildchina/species";
import type { Species } from "@/lib/types";
import { answerQuestion, isLlmConfigured } from "@/lib/ai/answer";

export const dynamic = "force-dynamic";

const buckets = new Map<string, { count: number; reset: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const bucket = buckets.get(ip);
  if (!bucket || bucket.reset < now) {
    buckets.set(ip, { count: 1, reset: now + 60 * 60 * 1000 });
    return false;
  }
  if (bucket.count >= 30) return true;
  bucket.count += 1;
  return false;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "rate_limited", message: "提问过于频繁，请稍后再试。" }, { status: 429 });
  }

  let body: { question?: unknown; locale?: unknown; history?: unknown };
  try {
    body = (await request.json()) as { question?: unknown; locale?: unknown; history?: unknown };
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const question = typeof body.question === "string" ? body.question.trim() : "";
  const locale = body.locale === "en" ? "en" : "zh";
  if (question.length < 2) {
    return NextResponse.json({ error: "question_too_short", message: "请输入至少两个字符的问题。" }, { status: 400 });
  }
  if (question.length > 500) {
    return NextResponse.json({ error: "question_too_long", message: "问题请控制在 500 字以内。" }, { status: 400 });
  }

  const historyInput = Array.isArray(body.history) ? body.history : [];
  const history = historyInput
    .filter((item): item is { role: "user" | "assistant"; content: string } => {
      if (!item || typeof item !== "object") return false;
      const record = item as Record<string, unknown>;
      return (record.role === "user" || record.role === "assistant") && typeof record.content === "string";
    })
    .slice(-4)
    .map((item) => ({ role: item.role, content: item.content.slice(0, 600) }));

  const [news] = await Promise.all([getNews()]);
  const species = CHINA_SPECIES.map((s) => ({
    id: s.slug,
    slug: s.slug,
    name_cn: s.nameCn,
    name_en: s.englishName,
    scientific_name: s.scientificName,
    aliases: s.aliases,
    group: s.group,
    group_label: s.groupLabel,
    tagline: "",
    summary: s.distribution ? `${s.nameCn}：${s.distribution}` : "",
    appearance: s.morphology,
    behavior: s.behavior,
    diet: s.dietReproduction,
    diet_type: [],
    habitat: (s.habitats ?? []).join("、") || s.distribution,
    reproduction: s.dietReproduction,
    size: { length_cm: null, height_cm: null },
    weight: { min_kg: 0, max_kg: 0 },
    lifespan_years: [0, 0] as [number, number],
    speed_kmh: null,
    fun_facts: [],
    conservation: {
      status: s.conservation.status,
      status_label: s.conservation.label,
      trend: "unknown" as const,
      assessment_year: s.conservation.year,
      population_note: s.conservation.note,
      threats: [],
      measures: [],
      source: {
        source_name: "馆藏编辑整理",
        source_url: "",
        license: "",
        retrieved_at: new Date().toISOString(),
        verified: false,
        review_status: "editorial" as const,
      },
    },
    distribution: { regions: s.provinces ?? [], countries: ["CN"], biomes: [], note: s.distribution },
    taxonomy: s.taxonomy,
    media_ids: [],
    audio_ids: [],
    related_slugs: [],
    sources: (s.sources ?? []).map((src) => ({
      source_name: src.name,
      source_url: src.url,
      license: "",
      retrieved_at: new Date().toISOString(),
      verified: false,
      review_status: "editorial" as const,
    })),
    data_status: "curated" as const,
    review_status: "pending_review" as const,
    verified: false,
    featured: false,
    updated_at: new Date().toISOString(),
    palette: { base: "#1F4D3A", deep: "#0B241C", accent: "#C8A96A" },
    artwork: "mammal",
  })) as unknown as Species[];
  const result = await answerQuestion(question, species, news, locale, history);
  return NextResponse.json({
    ...result,
    provider_configured: isLlmConfigured(),
    privacy: "问题不会写入本站数据库；仅在你配置了语言模型时，问题与检索到的馆藏片段会发送给该服务提供方。",
  });
}

export async function GET() {
  return NextResponse.json({
    configured: isLlmConfigured(),
    mode: isLlmConfigured() ? "llm+local-retrieval" : "local-retrieval",
    message: isLlmConfigured()
      ? "已配置语言模型。回答将先检索馆藏，再由模型组织。"
      : "未配置 AI_API_KEY，使用本地知识库检索模式；不会伪造模型回答。",
  });
}