import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { mutateStore } from "@/lib/store/content-store";
import { SOURCE_REGISTRY } from "@/lib/sources/registry";
import { getSourceRegistry } from "@/lib/repository";

export const dynamic = "force-dynamic";

const bodySchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("update-source"),
    id: z.string(),
    patch: z.object({
      license_note: z.string().max(1000).optional(),
      status_note: z.string().max(1000).optional(),
      commercial_restriction: z.string().max(1000).optional(),
      last_checked_at: z.string().max(40).optional(),
    }),
  }),
  z.object({
    action: z.literal("media-review"),
    id: z.string(),
    review_status: z.enum(["verified", "editorial", "pending_review", "sample"]),
    note: z.string().max(500).optional(),
  }),
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
  if (input.action === "media-review") {
    const res = await mutateStore((store) => {
      store.media_overrides[input.id] = {
        review_status: input.review_status,
        note: input.note,
      };
    });
    if (!res.ok) return NextResponse.json({ error: "write_failed", message: res.error }, { status: 500 });
    return NextResponse.json({
      ok: true,
      note: "仅更新审核标记，不改变素材的实际许可。许可文本仍以来源元数据为准。",
    });
  }

  const source = (await getSourceRegistry()).find((s) => s.id === input.id);
  if (!source) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (!SOURCE_REGISTRY.some((s) => s.id === input.id)) {
    return NextResponse.json({ error: "invalid_source" }, { status: 400 });
  }
  const res = await mutateStore((store) => {
    store.source_overrides[input.id] = {
      ...(store.source_overrides[input.id] ?? {}),
      ...input.patch,
    };
  });
  if (!res.ok) return NextResponse.json({ error: "write_failed", message: res.error }, { status: 500 });
  return NextResponse.json({
    ok: true,
    note: "已保存来源备注。连接状态（configured / live）只由服务端环境变量与实际探测决定，后台不能伪造。",
  });
}