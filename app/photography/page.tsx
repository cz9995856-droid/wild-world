import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";
import { PhotographyBrowser } from "@/components/photography/photography-browser";
import { getAllSpecies, getIntegrationStatus, getMediaAssets } from "@/lib/repository";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "高清摄影馆",
  description: "逐张标注作者、来源、许可证、获取时间与商用权限的野生动物影像馆。",
};

export default async function PhotographyPage() {
  const [photos, species, integration] = await Promise.all([
    getMediaAssets(),
    getAllSpecies(),
    getIntegrationStatus(),
  ]);
  const byId = new Map(species.map((s) => [s.id, s]));
  const normalized = photos.map((p) => ({
    ...p,
    category: p.species_id ? byId.get(p.species_id)?.group : p.category,
    title: p.species_id
      ? `${byId.get(p.species_id)?.name_cn ?? "物种"} · ${p.title.split("·").pop()?.trim() ?? "影像"}`
      : p.title,
  }));

  return (
    <>
      <PageHeader
        kicker="Photography · 高清摄影馆"
        title="影像不是装饰，是可追溯的记录"
        description="这里的每一张照片都保存原始记录 ID、作者署名、许可证与获取时间。打开任意一张可查看完整元数据；只有许可允许时才提供下载。"
        breadcrumbs={[{ label: "摄影馆" }]}
        meta={
          <div className="flex flex-wrap gap-2 lg:justify-end">
            <span className="chip">{photos.length} 张授权影像</span>
            <span className="chip">来源：iNaturalist Open Data</span>
            <span className="chip">更新 {integration.generated_at ? formatDate(integration.generated_at) : "待生成"}</span>
          </div>
        }
      />
      <div className="container-museum pb-20 pt-8">
        <PhotographyBrowser photos={normalized} />
      </div>
    </>
  );
}