import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { SPECIES, GROUPS } from "@/lib/data/species";
import { VIDEOS } from "@/lib/data/videos";
import { QUIZ_QUESTIONS } from "@/lib/data/quiz";
import { TIMELINE } from "@/lib/data/timeline";
import { FEEDING_PLANS } from "@/lib/data/feeding";
import { SOURCE_REGISTRY } from "@/lib/sources/registry";

const root = process.cwd();
const integration = JSON.parse(readFileSync(path.join(root, "public/data/integration.json"), "utf8")) as {
  photos: Array<{
    id: string;
    species_slug: string;
    url: string;
    author: string;
    license: string;
    source_url: string;
    retrieved_at: string;
    commercial_use: boolean;
  }>;
  sounds: Array<{
    id: string;
    species_slug: string;
    url: string;
    recordist: string;
    license: string;
    source_url: string;
    commercial_use: boolean;
  }>;
  hero: string[];
};
const news = JSON.parse(readFileSync(path.join(root, "public/data/news-snapshot.json"), "utf8")) as {
  articles: Array<{ id: string; slug: string; original_url: string; published_at: string; retrieved_at: string; review_status: string; title_original: string }>;
};

describe("species data integrity", () => {
  it("contains a full catalogue", () => {
    expect(SPECIES.length).toBeGreaterThanOrEqual(20);
    expect(SPECIES.length).toBeGreaterThanOrEqual(30);
  });

  it("has unique ids and slugs", () => {
    expect(new Set(SPECIES.map((s) => s.id)).size).toBe(SPECIES.length);
    expect(new Set(SPECIES.map((s) => s.slug)).size).toBe(SPECIES.length);
  });

  it("only uses known groups", () => {
    const keys = new Set<string>(GROUPS.map((g) => g.key));
    for (const s of SPECIES) expect(keys.has(s.group)).toBe(true);
  });

  it("has valid related species references", () => {
    const slugs = new Set(SPECIES.map((s) => s.slug));
    for (const s of SPECIES) {
      for (const rel of s.related_slugs) expect(slugs.has(rel)).toBe(true);
      expect(s.related_slugs).not.toContain(s.slug);
    }
  });

  it("has sourced conservation assessments with years", () => {
    for (const s of SPECIES) {
      expect(s.conservation.assessment_year).toBeGreaterThan(1990);
      expect(s.conservation.assessment_year).toBeLessThanOrEqual(new Date().getFullYear());
      expect(s.conservation.source.source_url).toMatch(/^https:\/\//);
      expect(s.conservation.population_note.length).toBeGreaterThan(10);
    }
  });

  it("does not silently mark editorial content as verified", () => {
    for (const s of SPECIES) {
      expect(s.review_status).toBe("editorial");
      expect(s.verified).toBe(false);
      expect(s.sources.every((src) => src.verified === false)).toBe(true);
    }
  });

  it("supports feeding simulations with explicit disclaimers", () => {
    for (const plan of FEEDING_PLANS) {
      expect(plan.items.reduce((sum, item) => sum + item.share_pct, 0)).toBe(100);
      expect(plan.simulation_note).toContain("不是现实饲养建议");
      expect(SPECIES.some((s) => s.slug === plan.species_slug)).toBe(true);
    }
  });
});

describe("media provenance", () => {
  it("has downloaded landscape hero assets", () => {
    expect(integration.hero.length).toBeGreaterThanOrEqual(3);
    for (const src of integration.hero) {
      expect(existsSync(path.join(root, "public", src.replace(/^\//, "")))).toBe(true);
    }
  });

  it("records license, author and source for every photo", () => {
    expect(integration.photos.length).toBeGreaterThan(50);
    for (const photo of integration.photos) {
      expect(photo.license).toBeTruthy();
      expect(photo.author).toBeTruthy();
      expect(photo.source_url).toMatch(/^https:\/\/www\.inaturalist\.org\/photos\//);
      expect(photo.retrieved_at).toBeTruthy();
      expect(SPECIES.some((s) => s.slug === photo.species_slug)).toBe(true);
      expect(existsSync(path.join(root, "public", photo.url.replace(/^\//, "")))).toBe(true);
      if (photo.license.includes("NC")) expect(photo.commercial_use).toBe(false);
    }
  });

  it("records license and recordist for every sound", () => {
    for (const sound of integration.sounds) {
      expect(sound.license).toBeTruthy();
      expect(sound.recordist).toBeTruthy();
      expect(sound.source_url).toMatch(/^https:\/\/www\.inaturalist\.org\/observations\//);
      expect(existsSync(path.join(root, "public", sound.url.replace(/^\//, "")))).toBe(true);
    }
  });
});

describe("news snapshot integrity", () => {
  it("contains real items with dates and links", () => {
    expect(news.articles.length).toBeGreaterThan(20);
    for (const a of news.articles) {
      expect(a.title_original.length).toBeGreaterThan(5);
      expect(a.original_url).toMatch(/^https:\/\//);
      expect(Number.isNaN(new Date(a.published_at).getTime())).toBe(false);
      expect(Number.isNaN(new Date(a.retrieved_at).getTime())).toBe(false);
      expect(["pending_review", "editorial", "verified"]).toContain(a.review_status);
    }
  });

  it("deduplicates titles", () => {
    const keys = news.articles.map((a) => a.title_original.trim().toLowerCase());
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe("supporting content", () => {
  it("links videos only to official pages", () => {
    for (const v of VIDEOS) {
      expect(v.official_url).toMatch(/^https:\/\//);
      expect(v.embed_allowed).toBe(false);
      expect(v.license_note).toContain("未下载");
    }
  });

  it("has quiz questions with valid answers and sources", () => {
    for (const q of QUIZ_QUESTIONS) {
      expect(q.options.length).toBeGreaterThanOrEqual(2);
      expect(q.answer_index).toBeGreaterThanOrEqual(0);
      expect(q.answer_index).toBeLessThan(q.options.length);
      expect(q.source_url).toMatch(/^https:\/\//);
      expect(q.explanation.length).toBeGreaterThan(10);
    }
  });

  it("keeps timeline eras ordered and sourced", () => {
    for (const era of TIMELINE) {
      expect(era.mya_start).toBeGreaterThanOrEqual(era.mya_end);
      expect(era.source_url).toMatch(/^https:\/\//);
    }
    expect(TIMELINE[0].mya_start).toBeGreaterThan(TIMELINE[TIMELINE.length - 1].mya_start);
  });

  it("does not mark unconfigured sources as live", () => {
    for (const source of SOURCE_REGISTRY) {
      if (!source.configured) expect(source.live).toBe(false);
      if (source.live) expect(source.configured).toBe(true);
    }
  });
});