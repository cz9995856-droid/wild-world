import { describe, expect, it } from "vitest";
import { searchAll, suggestSpecies } from "@/lib/search";
import { SPECIES } from "@/lib/data/species";
import type { NewsArticle } from "@/lib/types";

const news: NewsArticle[] = [
  {
    id: "n1",
    slug: "panda-news",
    title_original: "Panda conservation update",
    title_cn: "大熊猫保护进展",
    excerpt_original: "A new survey of giant pandas.",
    summary_cn: "一项关于大熊猫的新调查。",
    summary_status: "manual",
    keywords: ["大熊猫", "保护"],
    category: "conservation",
    source_name: "Mongabay",
    source_id: "mongabay",
    source_url: "https://news.mongabay.com/feed/",
    original_url: "https://news.mongabay.com/example",
    image_url: null,
    language: "zh",
    published_at: "2026-11-01T00:00:00.000Z",
    retrieved_at: "2026-11-02T00:00:00.000Z",
    license_note: "RSS summary only",
    review_status: "editorial",
    verified: false,
    ai_generated: false,
    featured: false,
  },
];

describe("searchAll", () => {
  it("finds a species by Chinese name", () => {
    const hits = searchAll("大熊猫", SPECIES, news);
    expect(hits[0]?.type).toBe("species");
    expect(hits[0]?.title).toBe("大熊猫");
  });

  it("finds a species by Latin name", () => {
    const hits = searchAll("Panthera uncia", SPECIES, news, { types: ["species"] });
    expect(hits[0]?.id).toBe("sp-003");
  });

  it("finds news by Chinese summary", () => {
    const hits = searchAll("调查", SPECIES, news, { types: ["news"] });
    expect(hits).toHaveLength(1);
    expect(hits[0]?.href).toBe("/news/panda-news");
  });

  it("returns pages for section keywords", () => {
    const hits = searchAll("地图", SPECIES, news, { types: ["page"] });
    expect(hits.some((h) => h.href === "/map")).toBe(true);
  });

  it("returns nothing for an unknown query", () => {
    expect(searchAll("zzzz-no-such-animal", SPECIES, news)).toEqual([]);
  });

  it("respects the category filter", () => {
    const birds = searchAll("鸟", SPECIES, news, { types: ["species"], category: "bird" });
    expect(birds.every((h) => ["sp-010", "sp-013", "sp-017", "sp-020", "sp-023", "sp-024"].includes(h.id))).toBe(true);
  });

  it("returns suggestions ranked by name match", () => {
    const suggestions = suggestSpecies("雪", SPECIES);
    expect(suggestions[0]?.slug).toBe("snow-leopard");
  });
});