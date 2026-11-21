import { XMLParser } from "fast-xml-parser";
import type { NewsArticle } from "@/lib/types";

const UA = process.env.NEWS_USER_AGENT || "WILDWORLD-Museum/1.0 (+https://wild-world-museum.pages.dev)";
const MAX_ITEMS = Number(process.env.NEWS_SYNC_MAX_ITEMS || 120);

const FEEDS = [
  { id: "mongabay", name: "Mongabay", url: "https://news.mongabay.com/feed/", fallback: "conservation" },
  { id: "nature", name: "Nature", url: "https://www.nature.com/nature.rss", fallback: "research" },
  { id: "sciencedaily", name: "ScienceDaily", url: "https://www.sciencedaily.com/rss/plants_animals.xml", fallback: "research" },
  { id: "physorg", name: "Phys.org", url: "https://phys.org/rss-feed/biology-news/plants-animals/", fallback: "research" },
];

const RULES = [
  { category: "new_species", words: ["new species", "described", "discovered", "newly identified"] },
  { category: "conservation", words: ["conservation", "protect", "endangered", "extinct", "poach", "wildlife trade", "sanctuary"] },
  { category: "environment", words: ["climate", "forest", "ocean", "habitat", "pollution", "drought", "warming", "ecosystem"] },
  { category: "incident", words: ["killed", "attack", "oil spill", "stranded", "conflict", "wildfire", "died"] },
  { category: "zoo", words: ["zoo", "aquarium", "captive", "breeding program", "safari park"] },
  { category: "research", words: ["study", "research", "scientists", "genome", "evolution", "fossil", "behavior"] },
];

const RELEVANCE = [
  "species", "wildlife", "animal", "animals", "bird", "birds", "fish", "fisheries", "mammal", "insect",
  "elephant", "rhino", "tiger", "jaguar", "monkey", "parrot", "whale", "dolphin", "turtle", "frog",
  "newt", "squirrel", "ant", "bee", "crow", "cat", "cats", "dog", "dogs", "gorilla", "orangutan",
  "panda", "leopard", "cheetah", "lion", "bear", "deer", "bat", "salamander", "lizard", "snake",
  "butterfly", "moth", "coral", "reef", "ocean", "marine", "forest", "rainforest", "biodiversity",
  "conservation", "ecosystem", "habitat", "extinction", "endangered", "predator", "river", "wetland",
  "mangrove", "savanna", "kelp", "plankton", "migration", "nesting", "breeding", "poaching", "wild",
];
const EXCLUDE = ["vaccine", "vaccines", "crispr", "cancer", "ebola", "rna", "clinical", "patients", "therapy", "brain region", "immune", "outbreak", "hallucinogen", "fda approval"];

export interface NewsSnapshot {
  generated_at: string;
  mode: string;
  disclaimer: string;
  articles: NewsArticle[];
  errors: Array<{ source_id: string; message: string; at: string }>;
}

function decodeEntities(input: string): string {
  return String(input)
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#39;/g, "'")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&hellip;/g, "…")
    .replace(/&rsquo;|&lsquo;/g, "’")
    .replace(/&ldquo;|&rdquo;/g, "”");
}

function stripHtml(input: string): string {
  return decodeEntities(String(input || ""))
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function asArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function relevant(title: string, sourceId: string): boolean {
  if (sourceId !== "nature" && sourceId !== "mongabay") return true;
  const lower = title.toLowerCase();
  if (EXCLUDE.some((word) => lower.includes(word))) return false;
  return RELEVANCE.some((word) => lower.includes(word));
}

function categorize(text: string, fallback: string): string {
  const lower = text.toLowerCase();
  for (const rule of RULES) if (rule.words.some((word) => lower.includes(word))) return rule.category;
  return fallback;
}

function textOf(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (typeof record.__cdata === "string") return record.__cdata;
    if (typeof record["#text"] === "string") return record["#text"] as string;
    if (typeof record["@_href"] === "string") return record["@_href"] as string;
  }
  return "";
}

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_", cdataPropName: "__cdata", trimValues: true });

export async function fetchNewsSnapshot(): Promise<NewsSnapshot> {
  const articles: NewsArticle[] = [];
  const errors: NewsSnapshot["errors"] = [];

  await Promise.all(
    FEEDS.map(async (feed) => {
      try {
        const res = await fetch(feed.url, {
          headers: { "User-Agent": UA, Accept: "application/rss+xml, application/xml, text/xml;q=0.9,*/*;q=0.8" },
          redirect: "follow",
          signal: AbortSignal.timeout(25000),
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const doc = parser.parse(await res.text());
        const items = asArray(doc.rss?.channel?.item || doc["rdf:RDF"]?.item);
        for (const item of items.slice(0, 24)) {
          const title = stripHtml(textOf(item.title));
          const link = textOf(item.link);
          if (!title || !link) continue;
          if (!relevant(title, feed.id)) continue;
          const excerpt = stripHtml(textOf(item.description ?? item["content:encoded"] ?? item.summary)).slice(0, 420);
          const rawDate = textOf(item.pubDate) || textOf(item["dc:date"]) || textOf(item.published);
          const date = rawDate ? new Date(rawDate) : new Date();
          const publishedAt = Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
          const id = `${feed.id}-${Buffer.from(link).toString("base64url").slice(-12)}`;
          const slugBase = title.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "article";
          articles.push({
            id,
            slug: `${slugBase}-${id.slice(-6)}`,
            title_original: title,
            title_cn: null,
            excerpt_original: excerpt || "RSS 未提供摘要，请前往原文阅读。",
            summary_cn: null,
            summary_status: "pending_ai",
            keywords: [],
            category: categorize(`${title} ${excerpt}`, feed.fallback) as NewsArticle["category"],
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
          } as NewsArticle);
        }
      } catch (error) {
        errors.push({ source_id: feed.id, message: String((error as Error).message || error), at: new Date().toISOString() });
      }
    })
  );

  const seen = new Set<string>();
  const deduped = articles
    .sort((a, b) => +new Date(b.published_at) - +new Date(a.published_at))
    .filter((article) => {
      const key = article.title_original.toLowerCase().replace(/\s+/g, " ").trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

  return {
    generated_at: new Date().toISOString(),
    mode: "rss-snapshot",
    disclaimer: "本文件由 RSS 抓取生成。标题、摘要、发布日期与链接来自原始源站；中文摘要与审核状态需人工或 AI 处理后生效。",
    articles: deduped.slice(0, MAX_ITEMS),
    errors,
  };
}