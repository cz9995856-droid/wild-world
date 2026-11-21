import { NextResponse } from "next/server";
import { getAllSpecies, getNews } from "@/lib/repository";
import { searchAll } from "@/lib/search";
import type { SearchHit } from "@/lib/search";
import speciesIndexData from "@/public/data/species-index.json";

export const dynamic = "force-dynamic";

interface IndexItem {
  slug: string;
  cn: string;
  en: string;
  sci: string;
  aliases: string[];
  group: string;
  family: string;
  order: string;
}

const CHINA_INDEX = (speciesIndexData as unknown as { items: IndexItem[] }).items ?? [];

function normalize(input: string): string {
  return input.toLowerCase().replace(/\s+/g, " ").trim();
}

function fieldScore(value: string | undefined, needle: string): number {
  if (!value) return 0;
  const hay = normalize(value);
  if (hay === needle) return 100;
  if (hay.startsWith(needle)) return 70;
  if (hay.includes(needle)) return 45;
  return 0;
}

function searchChinaSpecies(query: string): SearchHit[] {
  const q = normalize(query);
  if (!q) return [];
  const terms = q.split(" ").filter(Boolean);
  const hits: SearchHit[] = [];
  for (const item of CHINA_INDEX) {
    const aliases = item.aliases ?? [];
    const haystack = normalize(
      [item.cn, item.en, item.sci, ...aliases, item.family, item.order, item.group].join(" ")
    );
    if (!terms.every((term) => haystack.includes(term))) continue;
    const score =
      fieldScore(item.cn, q) * 3 +
      fieldScore(item.en, q) * 2.4 +
      fieldScore(item.sci, q) * 2.2 +
      fieldScore(aliases.join(" "), q) * 1.4 +
      fieldScore(`${item.family} ${item.order} ${item.group}`, q) * 0.4;
    if (score <= 0) continue;
    hits.push({
      type: "species",
      id: item.slug,
      title: item.cn,
      subtitle: `${item.en || item.sci} · ${item.sci}`,
      href: `/explore/encyclopedia/${item.slug}`,
      keywords: [item.family, item.order].filter(Boolean),
      score,
      badge: item.group,
    });
  }
  return hits.sort((a, b) => b.score - a.score);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const limit = Math.min(Number(searchParams.get("limit") ?? 20) || 20, 50);
  const typeParam = searchParams.get("type");
  const types: Array<SearchHit["type"]> =
    typeParam === "species" || typeParam === "news" || typeParam === "page" ? [typeParam] : ["species", "news", "page"];

  if (!q.trim()) {
    return NextResponse.json({ query: q, counts: { species: 0, news: 0, page: 0 }, results: [] });
  }

  const [species, news] = await Promise.all([getAllSpecies(), getNews()]);
  const chinaHits = types.includes("species") ? searchChinaSpecies(q) : [];
  const legacy = searchAll(q, species, news, { limit: 500, types }).filter((hit) => hit.type !== "species");
  const results = [...chinaHits, ...legacy].sort((a, b) => b.score - a.score).slice(0, limit);
  const counts = {
    species: chinaHits.length,
    news: legacy.filter((hit) => hit.type === "news").length,
    page: legacy.filter((hit) => hit.type === "page").length,
  };

  return NextResponse.json({ query: q, counts, results });
}