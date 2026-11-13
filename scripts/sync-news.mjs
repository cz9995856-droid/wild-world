import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { XMLParser } from "fast-xml-parser";

const ROOT = process.cwd();
const UA = process.env.NEWS_USER_AGENT || "WILDWORLD-Museum/1.0 (+https://wildworld.example.org)";
const MAX_ITEMS = Number(process.env.NEWS_SYNC_MAX_ITEMS || 60);

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

function decodeEntities(input) {
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

function stripHtml(input) {
  return decodeEntities(String(input || ""))
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function asArray(v) {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

function relevant(title, sourceId) {
  if (sourceId !== "nature" && sourceId !== "mongabay") return true;
  const lower = title.toLowerCase();
  if (EXCLUDE.some((w) => lower.includes(w))) return false;
  return RELEVANCE.some((w) => lower.includes(w));
}

function categorize(text, fallback) {
  const lower = text.toLowerCase();
  for (const rule of RULES) if (rule.words.some((w) => lower.includes(w))) return rule.category;
  return fallback;
}

function textOf(v) {
  if (typeof v === "string") return v;
  if (v && typeof v === "object") {
    if (typeof v.__cdata === "string") return v.__cdata;
    if (typeof v["#text"] === "string") return v["#text"];
    if (typeof v["@_href"] === "string") return v["@_href"];
  }
  return "";
}

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_", cdataPropName: "__cdata", trimValues: true });

const articles = [];
const errors = [];

for (const feed of FEEDS) {
  try {
    const res = await fetch(feed.url, {
      headers: { "User-Agent": UA, Accept: "application/rss+xml, application/xml, text/xml;q=0.9,*/*;q=0.8" },
      redirect: "follow",
      signal: AbortSignal.timeout(25000),
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
    console.log(`ok ${feed.id}: ${items.length} items`);
  } catch (err) {
    console.error(`fail ${feed.id}: ${err.message}`);
    errors.push({ source_id: feed.id, message: String(err.message || err), at: new Date().toISOString() });
  }
}

const seen = new Set();
const deduped = articles
  .sort((a, b) => +new Date(b.published_at) - +new Date(a.published_at))
  .filter((a) => {
    const key = a.title_original.toLowerCase().replace(/\s+/g, " ").trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

await mkdir(path.join(ROOT, "public/data"), { recursive: true });
await writeFile(
  path.join(ROOT, "public/data/news-snapshot.json"),
  JSON.stringify(
    {
      generated_at: new Date().toISOString(),
      mode: "rss-snapshot",
      disclaimer:
        "本文件由 RSS 抓取生成。标题、摘要、发布日期与链接来自原始源站；中文摘要与审核状态需人工或 AI 处理后生效。",
      articles: deduped.slice(0, MAX_ITEMS),
      errors,
    },
    null,
    2
  )
);
console.log(`done articles=${deduped.length} errors=${errors.length}`);