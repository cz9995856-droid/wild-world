import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { mutateStore } from "@/lib/store/content-store";
import { HOME_SECTIONS } from "@/lib/data/sections";
import { getAllSpecies } from "@/lib/repository";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  settings: z
    .object({
      hero_video_url: z.string().max(800).optional(),
      hero_poster: z.string().max(800).optional(),
      hero_video_credit: z.string().max(300).optional(),
      daily_species_slug: z.string().max(120).nullable().optional(),
      announcement: z.string().max(300).nullable().optional(),
    })
    .optional(),
  sections: z
    .array(
      z.object({
        id: z.string(),
        visible: z.boolean(),
        order: z.number().int().min(0).max(50),
      })
    )
    .optional(),
});

export async function POST(request: Request) {
  const session = await requireAdmin(["admin"]);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "validation_failed", issues: parsed.error.issues }, { status: 400 });

  const heroUrl = parsed.data.settings?.hero_video_url;
  if (heroUrl && !/^(https?:\/\/|\/)/.test(heroUrl)) {
    return NextResponse.json({ error: "invalid_url", message: "视频地址必须是 http(s) 直链或站内路径。" }, { status: 400 });
  }
  const poster = parsed.data.settings?.hero_poster;
  if (poster && !/^(https?:\/\/|\/)/.test(poster)) {
    return NextResponse.json({ error: "invalid_poster" }, { status: 400 });
  }
  if (parsed.data.settings?.daily_species_slug) {
    const species = await getAllSpecies();
    if (!species.some((s) => s.slug === parsed.data.settings?.daily_species_slug)) {
      return NextResponse.json({ error: "unknown_species" }, { status: 400 });
    }
  }
  if (parsed.data.sections) {
    const allowed = new Set(HOME_SECTIONS.map((s) => s.id));
    const invalid = parsed.data.sections.find((s) => !allowed.has(s.id));
    if (invalid) return NextResponse.json({ error: "unknown_section", id: invalid.id }, { status: 400 });
  }

  const res = await mutateStore((store) => {
    if (parsed.data.settings) {
      store.settings = {
        ...store.settings,
        ...parsed.data.settings,
        daily_species_slug: parsed.data.settings.daily_species_slug || undefined,
        announcement: parsed.data.settings.announcement || undefined,
      };
    }
    if (parsed.data.sections) {
      for (const section of parsed.data.sections) {
        store.section_overrides[section.id] = { visible: section.visible, order: section.order };
      }
    }
  });
  if (!res.ok) return NextResponse.json({ error: "write_failed", message: res.error }, { status: 500 });
  return NextResponse.json({ ok: true });
}