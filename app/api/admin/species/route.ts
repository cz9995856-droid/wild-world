import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { mutateStore } from "@/lib/store/content-store";
import { getAllSpecies, getSpeciesBySlug } from "@/lib/repository";
import type { ReviewStatus, Species } from "@/lib/types";

export const dynamic = "force-dynamic";

const statusEnum = z.enum(["LC", "NT", "VU", "EN", "CR", "EW", "EX", "DD", "NE"]);
const reviewEnum = z.enum(["verified", "editorial", "pending_review", "sample"]);
const dataStatusEnum = z.enum(["live", "curated", "pending", "unconfigured"]);

const patchSchema = z.object({
  name_cn: z.string().min(1).max(60).optional(),
  name_en: z.string().min(1).max(120).optional(),
  scientific_name: z.string().min(3).max(120).optional(),
  tagline: z.string().max(200).optional(),
  summary: z.string().max(2000).optional(),
  appearance: z.string().max(2000).optional(),
  behavior: z.string().max(2000).optional(),
  diet: z.string().max(2000).optional(),
  habitat: z.string().max(2000).optional(),
  reproduction: z.string().max(2000).optional(),
  weight_min_kg: z.number().nonnegative().optional(),
  weight_max_kg: z.number().nonnegative().optional(),
  lifespan_min: z.number().nonnegative().optional(),
  lifespan_max: z.number().nonnegative().optional(),
  conservation_status: statusEnum.optional(),
  conservation_trend: z.enum(["decreasing", "stable", "increasing", "unknown"]).optional(),
  assessment_year: z.number().int().min(1900).max(2100).optional(),
  population_note: z.string().max(1500).optional(),
  featured: z.boolean().optional(),
  review_status: reviewEnum.optional(),
  data_status: dataStatusEnum.optional(),
});

const createSchema = z.object({
  slug: z.string().min(2).max(80).regex(/^[a-z0-9-]+$/),
  name_cn: z.string().min(1).max(60),
  name_en: z.string().min(1).max(120),
  scientific_name: z.string().min(3).max(120),
  group: z.enum(["mammal", "bird", "reptile", "amphibian", "insect"]),
  tagline: z.string().min(2).max(200),
  summary: z.string().min(10).max(2000),
  diet: z.string().max(2000).default("资料待补充"),
  habitat: z.string().max(2000).default("资料待补充"),
  conservation_status: statusEnum.default("NE"),
  assessment_year: z.number().int().min(1900).max(2100).default(new Date().getFullYear()),
  weight_min_kg: z.number().nonnegative().default(0.1),
  weight_max_kg: z.number().nonnegative().default(1),
  lifespan_min: z.number().nonnegative().default(1),
  lifespan_max: z.number().nonnegative().default(10),
});

const bodySchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("update"), slug: z.string(), patch: patchSchema }),
  z.object({ action: z.literal("create"), species: createSchema }),
  z.object({ action: z.literal("delete"), slug: z.string() }),
  z.object({ action: z.literal("verify"), slug: z.string(), review_status: reviewEnum }),
]);

const GROUP_LABEL: Record<string, string> = {
  mammal: "哺乳动物",
  bird: "鸟类",
  reptile: "爬行动物",
  amphibian: "两栖动物",
  insect: "昆虫",
};

const STATUS_LABEL: Record<string, string> = {
  LC: "无危",
  NT: "近危",
  VU: "易危",
  EN: "濒危",
  CR: "极危",
  EW: "野外灭绝",
  EX: "灭绝",
  DD: "数据缺乏",
  NE: "未评估",
};

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
  if (!parsed.success) {
    return NextResponse.json({ error: "validation_failed", issues: parsed.error.issues }, { status: 400 });
  }
  const input = parsed.data;

  if (input.action === "create") {
    const exists = await getSpeciesBySlug(input.species.slug);
    if (exists) return NextResponse.json({ error: "slug_exists" }, { status: 409 });
    const c = input.species;
    const today = new Date().toISOString().slice(0, 10);
    const species: Species = {
      id: `sp-custom-${c.slug}`,
      slug: c.slug,
      name_cn: c.name_cn,
      name_en: c.name_en,
      scientific_name: c.scientific_name,
      aliases: [],
      group: c.group,
      group_label: GROUP_LABEL[c.group],
      tagline: c.tagline,
      summary: c.summary,
      appearance: "资料待补充：本条目由后台新增，尚未完成形态描述。",
      behavior: "资料待补充：本条目由后台新增，尚未完成行为描述。",
      diet: c.diet,
      diet_type: ["资料待补充"],
      habitat: c.habitat,
      reproduction: "资料待补充。",
      size: { length_cm: null, height_cm: null },
      weight: { min_kg: c.weight_min_kg, max_kg: Math.max(c.weight_min_kg, c.weight_max_kg) },
      lifespan_years: [c.lifespan_min, Math.max(c.lifespan_min, c.lifespan_max)],
      speed_kmh: null,
      fun_facts: [],
      conservation: {
        status: c.conservation_status,
        status_label: STATUS_LABEL[c.conservation_status],
        trend: "unknown",
        assessment_year: c.assessment_year,
        population_note: "后台新增条目：种群说明待补充。",
        threats: ["资料待补充"],
        measures: ["资料待补充"],
        source: {
          source_name: "待补充来源",
          source_url: "https://www.iucnredlist.org/",
          license: "待核验",
          retrieved_at: today,
          verified: false,
          review_status: "pending_review",
          note: "由后台创建，尚未关联具体来源。",
        },
      },
      distribution: { regions: ["待补充"], countries: ["待补充"], biomes: ["待补充"], note: "分布资料待补充。" },
      taxonomy: {
        kingdom: "动物界 Animalia",
        phylum: "脊索动物门 Chordata",
        class: "待核对",
        order: "待核对",
        family: "待核对",
        genus: "待核对",
      },
      media_ids: [],
      audio_ids: [],
      related_slugs: [],
      sources: [],
      data_status: "pending",
      review_status: "pending_review",
      verified: false,
      featured: false,
      updated_at: today,
      palette: { base: "#D9D0BE", deep: "#16251D", accent: "#6F8F72" },
      artwork: "bear",
    };
    const res = await mutateStore((store) => {
      store.new_species.push(species);
    });
    if (!res.ok) return NextResponse.json({ error: "write_failed", message: res.error }, { status: 500 });
    return NextResponse.json({ ok: true, species });
  }

  if (input.action === "delete") {
    if (session.role !== "admin") return NextResponse.json({ error: "forbidden" }, { status: 403 });
    const res = await mutateStore((store) => {
      if (!store.deleted_species.includes(input.slug)) store.deleted_species.push(input.slug);
      store.new_species = store.new_species.filter((s) => s.slug !== input.slug);
      delete store.species_overrides[input.slug];
    });
    if (!res.ok) return NextResponse.json({ error: "write_failed", message: res.error }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  if (input.action === "verify") {
    if (session.role !== "admin") return NextResponse.json({ error: "forbidden" }, { status: 403 });
    const res = await mutateStore((store) => {
      store.species_overrides[input.slug] = {
        ...(store.species_overrides[input.slug] ?? {}),
        review_status: input.review_status as ReviewStatus,
        verified: input.review_status === "verified",
        updated_at: new Date().toISOString().slice(0, 10),
      };
    });
    if (!res.ok) return NextResponse.json({ error: "write_failed", message: res.error }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  const species = await getSpeciesBySlug(input.slug);
  if (!species) return NextResponse.json({ error: "species_not_found" }, { status: 404 });
  const existing = await getAllSpecies();
  const current = existing.find((s) => s.slug === input.slug);
  if (!current) return NextResponse.json({ error: "species_not_found" }, { status: 404 });
  const p = input.patch;

  const result = await mutateStore((store) => {
    const prev = store.species_overrides[input.slug] ?? {};
    const next: Partial<Species> = { ...prev };
    if (p.name_cn !== undefined) next.name_cn = p.name_cn;
    if (p.name_en !== undefined) next.name_en = p.name_en;
    if (p.scientific_name !== undefined) next.scientific_name = p.scientific_name;
    if (p.tagline !== undefined) next.tagline = p.tagline;
    if (p.summary !== undefined) next.summary = p.summary;
    if (p.appearance !== undefined) next.appearance = p.appearance;
    if (p.behavior !== undefined) next.behavior = p.behavior;
    if (p.diet !== undefined) next.diet = p.diet;
    if (p.habitat !== undefined) next.habitat = p.habitat;
    if (p.reproduction !== undefined) next.reproduction = p.reproduction;
    if (p.weight_min_kg !== undefined || p.weight_max_kg !== undefined) {
      next.weight = {
        min_kg: p.weight_min_kg ?? current.weight.min_kg,
        max_kg: p.weight_max_kg ?? current.weight.max_kg,
      };
    }
    if (p.lifespan_min !== undefined || p.lifespan_max !== undefined) {
      next.lifespan_years = [
        p.lifespan_min ?? current.lifespan_years[0],
        p.lifespan_max ?? current.lifespan_years[1],
      ];
    }
    if (
      p.conservation_status !== undefined ||
      p.conservation_trend !== undefined ||
      p.assessment_year !== undefined ||
      p.population_note !== undefined
    ) {
      next.conservation = {
        ...current.conservation,
        status: p.conservation_status ?? current.conservation.status,
        status_label: STATUS_LABEL[p.conservation_status ?? current.conservation.status],
        trend: p.conservation_trend ?? current.conservation.trend,
        assessment_year: p.assessment_year ?? current.conservation.assessment_year,
        population_note: p.population_note ?? current.conservation.population_note,
      };
    }
    if (p.featured !== undefined) next.featured = p.featured;
    if (p.review_status !== undefined) {
      next.review_status = p.review_status as ReviewStatus;
      next.verified = p.review_status === "verified";
    }
    if (p.data_status !== undefined) next.data_status = p.data_status;
    next.updated_at = new Date().toISOString().slice(0, 10);
    store.species_overrides[input.slug] = next;
  });

  if (!result.ok) return NextResponse.json({ error: "write_failed", message: result.error }, { status: 500 });
  return NextResponse.json({ ok: true });
}