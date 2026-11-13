import { NextResponse } from "next/server";
import { getAllSpecies, getNews } from "@/lib/repository";
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

  let body: { question?: unknown; locale?: unknown };
  try {
    body = (await request.json()) as { question?: unknown; locale?: unknown };
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

  const [species, news] = await Promise.all([getAllSpecies(), getNews()]);
  const result = await answerQuestion(question, species, news, locale);
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