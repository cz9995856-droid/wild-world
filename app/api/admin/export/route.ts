import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { readStore } from "@/lib/store/content-store";
import { getAllSpecies, getNews, getSourceRegistry, getIntegrationStatus, getMediaAssets, getVideos, getQuiz, getTimeline } from "@/lib/repository";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireAdmin(["admin"]);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const [store, species, news, sources, integration, media] = await Promise.all([
    readStore(),
    getAllSpecies(),
    getNews(),
    getSourceRegistry(),
    getIntegrationStatus(),
    getMediaAssets(),
  ]);
  const payload = {
    exported_at: new Date().toISOString(),
    schema_version: 1,
    note:
      "导出包含馆藏合并数据与后台本地覆盖。外部图片/音频文件不在 JSON 中，仅保留其路径与许可元数据。",
    species,
    news,
    sources,
    media,
    videos: getVideos(),
    quiz: getQuiz(),
    timeline: getTimeline(),
    store,
    integration,
  };
  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="wildworld-export-${new Date().toISOString().slice(0, 10)}.json"`,
      "Cache-Control": "no-store",
    },
  });
}