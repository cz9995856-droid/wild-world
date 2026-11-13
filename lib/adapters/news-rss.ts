import "server-only";
import { XMLParser } from "fast-xml-parser";
import type { NewsArticle, NewsCategory } from "@/lib/types";
import { slugify } from "@/lib/utils";

const UA = process.env.NEWS_USER_AGENT || "WILDWORLD-Museum/1.0 (+https://wildworld.example.org)";

export const RSS_FEEDS = [
  { id: "mongabay", name: "Mongabay", url: "https://news.mongabay.com/feed/", fallback: "conservation" as NewsCategory },
  { id: "nature", name: "Nature", url: "https://www.nature.com/nature.rss", fallback: "research" as NewsCategory },
  {
    id: "sciencedaily",
    name: "ScienceDaily",
    url: "https://www.sciencedaily.com/rss/plants_animals.xml",
    fallback: "research" as NewsCategory,
  },
  {
    id: "physorg",
    name: "Phys.org",
    url: "https://phys.org/rss-feed/biology-news/plants-animals/",
    fallback: "research" as NewsCategory,
  },
];

const RULES: Array<{ category: NewsCategory; words: string[] }> = [
  { category: "new_species", words: ["new species", "described", "discovered", "newly identified"] },
  { category: "conservation", words: ["conservation", "protect", "endangered", "extinct", "poach", "wildlife trade", "sanctuary"] },
  { category: "environment", words: ["climate", "forest", "ocean", "habitat", "pollution", "drought", "warming", "ecosystem"] },
  { category: "incident", words: ["killed", "attack", "oil spill", "stranded", "conflict", "wildfire", "died"] },
  { category: "zoo", words: ["zoo", "aquarium", "captive", "breeding program", "safari park"] },
  { category: "research", words: ["study", "research", "scientists", "genome", "evolution", "fossil", "behavior"] },
];

function categorize(text: string, fallback: NewsCategory): NewsCategory {
  const lower = text.toLowerCase();
  for (const rule of RULES) {
    if (rule.words.some((w) => lower.includes(w))) return rule.category;
  }
  return fallback;
}

function stripHtml(input: unknown): string {
  return String(input ?? "")
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function asArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  cdataPropName: "__cdata",
  trimValues: true,
});

interface ItemLike {
  title?: unknown;
  link?: unknown;
  description?: unknown;
  "content:encoded"?: unknown;
  summary?: unknown;
  pubDate?: unknown;
  "dc:date"?: unknown;
  published?: unknown;
}

function textOf(v: unknown): string {
  if (typeof v === "string") return v;
  if (v && typeof v === "object") {
    const obj = v as Record<string, unknown>;
    if (typeof obj.__cdata === "string") return obj.__cdata;
    if (typeof obj["#text"] === "string") return obj["#text"];
    if (typeof obj["@_href"] === "string") return obj["@_href"];
  }
  return "";
}

export async function fetchRssFeed(feed: (typeof RSS_FEEDS)[number], max = 16): Promise<NewsArticle[]> {
  const res = await fetch(feed.url, {
    headers: { "User-Agent": UA, Accept: "application/rss+xml, application/xml, text/xml;q=0.9,*/*;q=0.8" },
    redirect: "follow",
    signal: AbortSignal.timeout(20000),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const xml = await res.text();
  const doc = parser.parse(xml) as Record<string, unknown>;
  const rss = doc.rss as { channel?: { item?: ItemLike | ItemLike[] } } | undefined;
  const rdf = doc["rdf:RDF"] as { item?: ItemLike | ItemLike[]; channel?: unknown } | undefined;
  const items = asArray(rss?.channel?.item ?? rdf?.item);
  const out: NewsArticle[] = [];
  for (const item of items.slice(0, max)) {
    const title = stripHtml(textOf(item.title));
    if (!title) continue;
    const link = textOf(item.link);
    if (!link) continue;
    const rawDesc = item.description ?? item["content:encoded"] ?? item.summary;
    const excerpt = stripHtml(textOf(rawDesc)).slice(0, 420);
    const pubRaw = textOf(item.pubDate) || textOf(item["dc:date"]) || textOf(item.published);
    const pub = pubRaw ? new Date(pubRaw) : new Date();
    const publishedAt = Number.isNaN(pub.getTime()) ? new Date().toISOString() : pub.toISOString();
    const id = `${feed.id}-${Buffer.from(link).toString("base64url").slice(-12)}`;
    out.push({
      id,
      slug: `${slugify(title).slice(0, 60) || "article"}-${id.slice(-6)}`,
      title_original: title,
      title_cn: null,
      excerpt_original: excerpt || "RSS 未提供摘要，请前往原文阅读。",
      summary_cn: null,
      summary_status: "pending_ai",
      keywords: [],
      category: categorize(`${title} ${excerpt}`, feed.fallback),
      source_name: feed.name,
      source_id: feed.id,
      source_url: feed.url,
      original_url: link,
      image_url: null,
      language: /[\u4e00-\u9fa5]/.test(title) ? "zh" : "en",
      published_at: publishedAt,
      retrieved_at: new Date().toISOString(),
      license_note: "仅使用 RSS 标题、摘要与链接；未转载全文与图片。版权归原作者与出版机构。",
      review_status: "pending_review",
      verified: false,
      ai_generated: false,
      featured: false,
    });
  }
  return out;
}

export interface SyncResult {
  source_id: string;
  source_name: string;
  ok: boolean;
  count: number;
  message: string;
  at: string;
}

export async function syncAllFeeds(): Promise<{ articles: NewsArticle[]; logs: SyncResult[] }> {
  const articles: NewsArticle[] = [];
  const logs: SyncResult[] = [];
  for (const feed of RSS_FEEDS) {
    try {
      const items = await fetchRssFeed(feed);
      articles.push(...items);
      logs.push({
        source_id: feed.id,
        source_name: feed.name,
        ok: true,
        count: items.length,
        message: `成功获取 ${items.length} 条 RSS 条目（待审核）。`,
        at: new Date().toISOString(),
      });
    } catch (err) {
      logs.push({
        source_id: feed.id,
        source_name: feed.name,
        ok: false,
        count: 0,
        message: `失败：${err instanceof Error ? err.message : String(err)}`,
        at: new Date().toISOString(),
      });
    }
  }
  const seen = new Set<string>();
  const deduped = articles
    .sort((a, b) => +new Date(b.published_at) - +new Date(a.published_at))
    .filter((a) => {
      const key = a.title_original.toLowerCase().replace(/\s+/g, " ").trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  return { articles: deduped, logs };
}