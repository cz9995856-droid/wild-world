import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { mutateStore, appendSyncLog } from "@/lib/store/content-store";
import { getNews } from "@/lib/repository";
import { syncAllFeeds } from "@/lib/adapters/news-rss";
import { slugify } from "@/lib/utils";
import type { NewsArticle, NewsCategory, ReviewStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const categoryEnum = z.enum(["new_species", "conservation", "research", "environment", "incident", "zoo"]);
const reviewEnum = z.enum(["verified", "editorial", "pending_review", "sample"]);

const bodySchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("update"),
    id: z.string(),
    patch: z.object({
      title_cn: z.string().max(300).nullable().optional(),
      summary_cn: z.string().max(2000).nullable().optional(),
      keywords: z.array(z.string().max(40)).max(10).optional(),
      category: categoryEnum.optional(),
      review_status: reviewEnum.optional(),
      featured: z.boolean().optional(),
      title_original: z.string().max(300).optional(),
    }),
  }),
  z.object({ action: z.literal("delete"), id: z.string() }),
  z.object({
    action: z.literal("import"),
    article: z.object({
      title_original: z.string().min(2).max(300),
      title_cn: z.string().max(300).optional(),
      summary_cn: z.string().max(2000).optional(),
      original_url: z.string().url(),
      source_name: z.string().min(1).max(80),
      published_at: z.string().min(4),
      category: categoryEnum,
      keywords: z.array(z.string().max(40)).max(10).default([]),
    }),
  }),
  z.object({ action: z.literal("sync") }),
]);

export async function POST(request: Request) {
  const session = await requireAdmin(["admin", "editor"]);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "validation_failed", issues: parsed.error.issues }, { status: 400 });
  const input = parsed.data;

  if (input.action === "sync") {
    const started_at = new Date().toISOString();
    const { articles, logs } = await syncAllFeeds();
    let writeError: string | null = null;
    try {
      const { writeFile, mkdir } = await import("node:fs/promises");
      const path = await import("node:path");
      await mkdir(path.join(process.cwd(), ".data"), { recursive: true });
      const file = path.join(process.cwd(), ".data/news-live.json");
      let previous: NewsArticle[] = [];
      try {
        const raw = await import("node:fs/promises").then((fs) => fs.readFile(file, "utf8"));
        previous = (JSON.parse(raw) as { articles?: NewsArticle[] }).articles ?? [];
      } catch {
        previous = [];
      }
      const seen = new Set<string>();
      const merged = [...articles, ...previous].filter((a) => {
        const key = a.title_original.toLowerCase().replace(/\s+/g, " ").trim();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      await writeFile(file, JSON.stringify({ generated_at: started_at, articles: merged }, null, 2));
    } catch (err) {
      writeError = err instanceof Error ? err.message : String(err);
    }
    const failed = logs.filter((l) => !l.ok);
    await appendSyncLog({
      job: "news-rss",
      status: failed.length === 0 ? "success" : failed.length === logs.length ? "failed" : "partial",
      message:
        (writeError ? `抓取成功但写入快照失败：${writeError}。` : `写入 ${articles.length} 条待审核条目。`) +
        " " +
        logs.map((l) => `${l.source_name}:${l.ok ? l.count : "失败"}`).join("; "),
      items: articles.length,
      actor: session.role,
      started_at,
      finished_at: new Date().toISOString(),
    });
    return NextResponse.json({
      ok: true,
      logs,
      written: articles.length,
      write_error: writeError,
      note: "抓取结果进入待审核状态，标题、日期与链接来自源站；中文摘要需人工或已配置的 AI 处理后发布。",
    });
  }

  const news = await getNews();

  if (input.action === "delete") {
    if (session.role !== "admin" && session.role !== "editor") {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    const target = news.find((n) => n.id === input.id);
    if (!target) return NextResponse.json({ error: "not_found" }, { status: 404 });
    const res = await mutateStore((store) => {
      if (!store.news_deleted.includes(input.id)) store.news_deleted.push(input.id);
      store.news_manual = store.news_manual.filter((n) => n.id !== input.id);
    });
    if (!res.ok) return NextResponse.json({ error: "write_failed", message: res.error }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (input.action === "import") {
    const a = input.article;
    const published = new Date(a.published_at);
    if (Number.isNaN(published.getTime())) {
      return NextResponse.json({ error: "invalid_date" }, { status: 400 });
    }
    const id = `manual-${Buffer.from(a.original_url).toString("base64url").slice(-12)}`;
    const article: NewsArticle = {
      id,
      slug: `${slugify(a.title_original).slice(0, 60) || "article"}-${id.slice(-6)}`,
      title_original: a.title_original,
      title_cn: a.title_cn ?? null,
      excerpt_original: a.summary_cn ?? "人工导入条目，未提供摘要。",
      summary_cn: a.summary_cn ?? null,
      summary_status: a.summary_cn ? "manual" : "pending_ai",
      keywords: a.keywords,
      category: a.category as NewsCategory,
      source_name: a.source_name,
      source_id: "manual",
      source_url: a.original_url,
      original_url: a.original_url,
      image_url: null,
      language: /[\u4e00-\u9fa5]/.test(a.title_original) ? "zh" : "en",
      published_at: published.toISOString(),
      retrieved_at: new Date().toISOString(),
      license_note: "人工导入：仅使用标题、摘要与链接。导入者需自行确认转载与引用权限。",
      review_status: "pending_review",
      verified: false,
      ai_generated: false,
      featured: false,
    };
    const res = await mutateStore((store) => {
      store.news_manual.unshift(article);
    });
    if (!res.ok) return NextResponse.json({ error: "write_failed", message: res.error }, { status: 500 });
    return NextResponse.json({ ok: true, article });
  }

  const target = news.find((n) => n.id === input.id);
  if (!target) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const p = input.patch;
  const res = await mutateStore((store) => {
    const prev = store.news_overrides[input.id] ?? {};
    store.news_overrides[input.id] = {
      ...prev,
      ...(p.title_cn !== undefined ? { title_cn: p.title_cn } : {}),
      ...(p.summary_cn !== undefined
        ? { summary_cn: p.summary_cn, summary_status: p.summary_cn ? "manual" : "pending_ai" }
        : {}),
      ...(p.keywords !== undefined ? { keywords: p.keywords } : {}),
      ...(p.category !== undefined ? { category: p.category as NewsCategory } : {}),
      ...(p.review_status !== undefined
        ? {
            review_status: p.review_status as ReviewStatus,
            verified: p.review_status === "verified",
          }
        : {}),
      ...(p.featured !== undefined ? { featured: p.featured } : {}),
      ...(p.title_original !== undefined ? { title_original: p.title_original } : {}),
    };
  });
  if (!res.ok) return NextResponse.json({ error: "write_failed", message: res.error }, { status: 500 });
  return NextResponse.json({ ok: true });
}