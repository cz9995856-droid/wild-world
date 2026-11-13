import { NextResponse } from "next/server";
import { getAllSpecies, getNews } from "@/lib/repository";
import { searchAll } from "@/lib/search";
import type { SearchHit } from "@/lib/search";

export const dynamic = "force-dynamic";

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
  const results = searchAll(q, species, news, { limit, types });
  const all = searchAll(q, species, news, { limit: 500 });
  const counts = {
    species: all.filter((r) => r.type === "species").length,
    news: all.filter((r) => r.type === "news").length,
    page: all.filter((r) => r.type === "page").length,
  };

  return NextResponse.json({ query: q, counts, results });
}