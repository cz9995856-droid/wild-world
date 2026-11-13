import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { WorldMapLoader } from "@/components/map/world-map-loader";
import { getAllSpecies, getIntegrationStatus, getSourceRegistry } from "@/lib/repository";
import { DataBadge } from "@/components/ui/badges";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "全球动物地图",
  description: "使用 MapLibre 展示 GBIF 与 iNaturalist 的真实观测记录，严格区分观测点与自然分布范围。",
};

export default async function MapPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const [species, integration, sources] = await Promise.all([
    getAllSpecies(),
    getIntegrationStatus(),
    getSourceRegistry(),
  ]);
  const initialSlug =
    (typeof params.species === "string" && species.find((s) => s.slug === params.species)?.slug) ||
    species.find((s) => s.slug === "giant-panda")?.slug ||
    species[0]?.slug ||
    "";
  const gbif = sources.find((s) => s.id === "gbif");
  const inat = sources.find((s) => s.id === "inaturalist");

  return (
    <>
      <PageHeader
        kicker="Atlas · 全球动物地图"
        title="真实的点，谨慎的解释"
        description="地图请求 GBIF 与 iNaturalist 的实时接口，只绘制带有坐标的记录。观测点是采样位置，不是完整分布范围；点密集处可能只是采样更密集。"
        breadcrumbs={[{ label: "全球动物地图" }]}
        meta={
          <div className="flex flex-wrap gap-2 lg:justify-end">
            <span className="chip">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2A6B51]" /> GBIF 公开 API
            </span>
            <span className="chip">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2A6B51]" /> iNaturalist 公开 API
            </span>
            <span className="chip">IUCN 分布层：需授权</span>
          </div>
        }
      />

      <div className="container-museum pb-20 pt-6">
        <div className="mb-5 grid gap-3 border border-[var(--line)] bg-[var(--surface-2)] p-4 text-[10.5px] leading-relaxed text-[var(--muted)] sm:grid-cols-3">
          <div>
            <p className="label text-[var(--ink-soft)]">GBIF</p>
            <p className="mt-1">物种分类键与观测记录。{gbif?.status_note}</p>
            <a href={gbif?.homepage} target="_blank" rel="noreferrer" className="mt-1 inline-block underline">gbif.org ↗</a>
          </div>
          <div>
            <p className="label text-[var(--ink-soft)]">iNaturalist</p>
            <p className="mt-1">研究级公民科学记录，逐条带原始记录链接。{inat?.status_note}</p>
            <a href={inat?.homepage} target="_blank" rel="noreferrer" className="mt-1 inline-block underline">inaturalist.org ↗</a>
          </div>
          <div>
            <p className="label text-[var(--ink-soft)]">本地媒体集成</p>
            <p className="mt-1">
              {integration.photo_count} 张授权影像、{integration.sound_count} 条录音的元数据已记录，
              生成时间 {integration.generated_at ? integration.generated_at.slice(0, 10) : "待生成"}。
            </p>
            <DataBadge status={integration.errors.length > 0 ? "editorial" : "live"} className="mt-2" />
          </div>
        </div>

        <WorldMapLoader
          options={species.map((s) => ({
            slug: s.slug,
            name_cn: s.name_cn,
            name_en: s.name_en,
            scientific_name: s.scientific_name,
            gbif_taxon_key: s.distribution.gbif_taxon_key ?? null,
          }))}
          initialSlug={initialSlug}
        />

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div>
            <h2 className="display text-[24px]">如何正确阅读这张地图</h2>
            <ul className="mt-4 space-y-2.5 text-[11.5px] leading-relaxed text-[var(--muted)]">
              <li><span className="text-[var(--clay)]">01</span> 每个点是一条可追溯的观测记录，点击可打开原始数据库页面。</li>
              <li><span className="text-[var(--clay)]">02</span> 点不代表分布边界；空白区域可能是未采样，而非没有该物种。</li>
              <li><span className="text-[var(--clay)]">03</span> GBIF 汇集多机构数据集，许可逐条不同；商业使用需单独核对。</li>
              <li><span className="text-[var(--clay)]">04</span> IUCN 的分布范围图层需要 API 授权，本站尚未接入，也不会用观测点「补」成分布面。</li>
            </ul>
          </div>
          <div className="border border-[var(--line)] bg-[var(--surface)] p-5">
            <p className="label text-[var(--muted)]">相关入口</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href="/conservation" className="chip hover:border-[var(--ink)]">濒危专题</Link>
              <Link href="/lab#geo" className="chip hover:border-[var(--ink)]">地理实验室</Link>
              <Link href="/sources" className="chip hover:border-[var(--ink)]">来源与许可</Link>
              <Link href="/encyclopedia" className="chip hover:border-[var(--ink)]">物种档案</Link>
            </div>
            <p className="mt-4 text-[10px] leading-relaxed text-[var(--muted)]">
              接口失败时页面会显示真实的失败状态与原因，不会绘制演示点位冒充实时数据。
            </p>
          </div>
        </div>
      </div>
    </>
  );
}