import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  MapPin,
  Ruler,
  Scale,
  Timer,
  Utensils,
  Activity,
  ShieldAlert,
} from "lucide-react";
import { getSpeciesAudio, getSpeciesBySlug, getSpeciesForSlugs, getSpeciesMedia, getVideos } from "@/lib/repository";
import { ConservationBadge, DataBadge } from "@/components/ui/badges";
import { FavoriteButton } from "@/components/favorite-button";
import { MediaGallery } from "@/components/media-gallery";
import { WaveformPlayer } from "@/components/audio/waveform-player";
import { SpeciesCard, CoverImage } from "@/components/species-card";
import { CONSERVATION_META, TREND_ARROW, TREND_LABEL, formatRange, formatWeight, formatDate } from "@/lib/utils";
import { FEEDING_BY_SLUG } from "@/lib/data/feeding";
import { GROUPS } from "@/lib/data/species";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const species = await getSpeciesBySlug(slug);
  if (!species) return { title: "物种未找到" };
  return {
    title: `${species.name_cn} ${species.name_en}`,
    description: `${species.name_cn}（${species.scientific_name}）：${species.tagline} 保护等级 ${species.conservation.status_label}（${species.conservation.assessment_year} 评估）。`,
  };
}

function InfoCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="border-b border-[var(--line)] py-3 last:border-0">
      <div className="flex items-center gap-2 text-[9.5px] uppercase tracking-[0.14em] text-[var(--muted)]">
        {icon}
        {label}
      </div>
      <p className="mt-1.5 text-[13px]">{value}</p>
      {hint && <p className="mt-1 text-[9.5px] leading-relaxed text-[var(--muted)]">{hint}</p>}
    </div>
  );
}

function SectionBlock({
  id,
  index,
  title,
  children,
}: {
  id: string;
  index: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-32 border-t border-[var(--line)] py-9 first:border-0 first:pt-0">
      <div className="mb-4 flex items-center gap-3">
        <span className="font-mono text-[10px] tracking-widest text-[var(--muted)]">{index}</span>
        <h2 className="display text-[24px] sm:text-[28px]">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export default async function SpeciesDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const species = await getSpeciesBySlug(slug);
  if (!species) notFound();

  const [media, sounds, related, videos] = await Promise.all([
    getSpeciesMedia(slug),
    getSpeciesAudio(slug),
    getSpeciesForSlugs(species.related_slugs),
    Promise.resolve(getVideos()),
  ]);
  const cover = media[0]?.url;
  const coverAsset = media[0];
  const feeding = FEEDING_BY_SLUG.get(slug);
  const relatedVideos = videos.filter((v) => v.species_slugs.includes(slug));
  const group = GROUPS.find((g) => g.key === species.group);
  const meta = CONSERVATION_META[species.conservation.status];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Taxon",
    name: species.name_cn,
    alternateName: [species.name_en, species.scientific_name],
    description: species.summary,
    parentTaxon: species.taxonomy.family,
    url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/encyclopedia/${species.slug}`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="relative min-h-[68vh] bg-[#0B2118] pt-[68px] text-[#F5F1E7] lg:min-h-[76vh]">
        <div className="absolute inset-0">
          {cover ? (
            <Image
              src={cover}
              alt={`${species.name_cn} 野外影像`}
              fill
              priority
              sizes="100vw"
              quality={85}
              className="object-cover"
            />
          ) : (
            <CoverImage src={null} alt={species.name_cn} species={species} sizes="100vw" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#061009] via-[#061009]/55 to-[#061009]/20" />
        </div>
        <div className="container-museum relative flex min-h-[calc(68vh-68px)] flex-col justify-between pb-8 pt-8 lg:min-h-[calc(76vh-76px)]">
          <nav className="flex flex-wrap items-center gap-2 text-[10px] text-white/60" aria-label="面包屑">
            <Link href="/" className="hover:text-white">首页</Link>
            <span>/</span>
            <Link href="/encyclopedia" className="hover:text-white">动物百科</Link>
            <span>/</span>
            <Link href={`/encyclopedia?group=${species.group}`} className="hover:text-white">
              {group?.label ?? species.group_label}
            </Link>
            <span>/</span>
            <span className="text-white/90">{species.name_cn}</span>
          </nav>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2 text-[9.5px] uppercase tracking-[0.18em] text-white/60">
                <span>{species.group_label}</span>
                <span>·</span>
                <span>{species.taxonomy.order}</span>
                <span>·</span>
                <span>{species.taxonomy.family}</span>
              </div>
              <h1 className="display text-[46px] leading-[0.96] sm:text-[68px] lg:text-[86px]">{species.name_cn}</h1>
              <p className="mt-2 font-serif text-[17px] italic text-white/70 sm:text-[20px]">{species.scientific_name}</p>
              <p className="mt-1 text-[12px] text-white/55">{species.name_en}</p>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <ConservationBadge code={species.conservation.status} label={species.conservation.status_label} size="md" />
                <span className="rounded-xs border border-white/25 bg-black/25 px-2.5 py-1 text-[10px] text-white/75 backdrop-blur">
                  评估年份 {species.conservation.assessment_year}
                </span>
                <span className="rounded-xs border border-white/25 bg-black/25 px-2.5 py-1 text-[10px] text-white/75 backdrop-blur">
                  趋势 {TREND_LABEL[species.conservation.trend]} {TREND_ARROW[species.conservation.trend]}
                </span>
                <DataBadge status={species.data_status} className="border-white/25 bg-black/25 text-white/80" />
              </div>
            </div>

            <div className="flex flex-col items-start gap-3 lg:items-end">
              <FavoriteButton slug={species.slug} className="!border-white/40 !bg-transparent !text-white hover:!bg-white/10" />
              <Link
                href={`/compare?a=${species.slug}`}
                className="inline-flex items-center gap-1.5 text-[11px] text-white/70 hover:text-white"
              >
                加入对比 <ArrowRight size={12} />
              </Link>
              {coverAsset && (
                <p className="max-w-[250px] text-left text-[9px] leading-relaxed text-white/35 lg:text-right">
                  封面影像 © {coverAsset.author} · {coverAsset.license} ·{" "}
                  <a href={coverAsset.source_url} target="_blank" rel="noreferrer" className="underline">
                    {coverAsset.source_name}
                  </a>
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="border-b border-[var(--line)] bg-[var(--surface-2)]">
        <div className="container-museum flex flex-wrap items-center gap-x-6 gap-y-2 py-3 text-[10px] text-[var(--muted)]">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--amber)]" />
            资料状态：编辑整理（未逐条核验原始文献）
          </span>
          <span>更新时间：{formatDate(species.updated_at)}</span>
          <span>不同来源冲突时保留出处并标记待审核</span>
          <Link href="/about#method" className="link-underline ml-auto">阅读数据方法 →</Link>
        </div>
      </div>

      <div className="container-museum grid gap-10 pb-20 pt-10 lg:grid-cols-[260px_1fr] lg:gap-16">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="border border-[var(--line)] bg-[var(--surface)] p-4">
            <p className="label mb-2 text-[var(--muted)]">Quick facts · 基本档案</p>
            <InfoCard icon={<Ruler size={11} />} label="体长" value={formatRange(species.size.length_cm, "厘米")} />
            <InfoCard icon={<Ruler size={11} />} label="肩高 / 体高" value={formatRange(species.size.height_cm, "厘米")} />
            <InfoCard icon={<Scale size={11} />} label="体重" value={formatWeight(species.weight.min_kg, species.weight.max_kg)} />
            <InfoCard icon={<Timer size={11} />} label="寿命" value={formatRange(species.lifespan_years, "年")} hint="圈养与野外数据可能不同，此处为上限估计。" />
            <InfoCard icon={<Activity size={11} />} label="速度" value={species.speed_kmh ? `${species.speed_kmh} km/h` : "资料待补充"} hint="口径以右侧说明为准，不与其他运动方式直接比较。" />
            <InfoCard icon={<Utensils size={11} />} label="食性" value={species.diet_type.join(" / ")} />
            <InfoCard icon={<MapPin size={11} />} label="分布区域" value={species.distribution.regions.join("、")} />
          </div>

          <div className={`mt-4 border p-4 ${meta.className.replace("bg-", "border-").split(" ")[0]}`}>
            <div className="flex items-center justify-between">
              <p className="label opacity-80">IUCN Red List</p>
              <ShieldAlert size={14} />
            </div>
            <p className="mt-2 text-[15px] font-medium">
              {species.conservation.status_label} · {species.conservation.status}
            </p>
            <p className="mt-1 text-[10px] opacity-80">
              {species.conservation.assessment_year} 年评估 · 趋势 {TREND_LABEL[species.conservation.trend]}
            </p>
            <a
              href={species.conservation.source.source_url}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 border border-current/40 px-2.5 py-1.5 text-[10.5px] font-medium opacity-95 transition-opacity hover:opacity-70"
            >
              官方来源 · IUCN 评估 <ExternalLink size={11} />
            </a>
          </div>

          <nav className="mt-4 hidden border border-[var(--line)] p-3 text-[11px] text-[var(--muted)] lg:block" aria-label="本页目录">
            {[
              ["overview", "概述"],
              ["appearance", "外形特征"],
              ["behavior", "生活习性"],
              ["diet", "食物"],
              ["habitat", "栖息地"],
              ["reproduction", "繁殖方式"],
              ["conservation", "保护状况"],
              ["distribution", "地理分布"],
              ["gallery", "影像档案"],
              ["sounds", "声音"],
              ["related", "相关物种"],
              ["sources", "资料来源"],
            ].map(([id, label]) => (
              <a key={id} href={`#${id}`} className="block border-b border-[var(--line)] py-1.5 last:border-0 hover:text-[var(--ink)]">
                {label}
              </a>
            ))}
          </nav>
        </aside>

        <div className="min-w-0">
          <div className="mb-6 border-l-2 border-[var(--amber)] pl-4">
            <p className="text-[13.5px] leading-relaxed text-[var(--ink-soft)]">{species.summary}</p>
          </div>

          <SectionBlock id="overview" index="01" title="概述">
            <p className="prose-museum">{species.tagline}</p>
            <p className="mt-4 text-[12px] leading-relaxed text-[var(--muted)]">
              分类路径：{species.taxonomy.kingdom} → {species.taxonomy.phylum} → {species.taxonomy.class} →{" "}
              {species.taxonomy.order} → {species.taxonomy.family} → {species.taxonomy.genus}。
              分类阶元用于检索，不直接等同于演化距离。
            </p>
          </SectionBlock>

          <SectionBlock id="appearance" index="02" title="外形特征">
            <p className="prose-museum">{species.appearance}</p>
          </SectionBlock>

          <SectionBlock id="behavior" index="03" title="生活习性">
            <p className="prose-museum">{species.behavior}</p>
          </SectionBlock>

          <SectionBlock id="diet" index="04" title="食物">
            <p className="prose-museum">{species.diet}</p>
            {feeding && (
              <div className="mt-5 border border-[var(--line)] bg-[var(--surface-2)] p-4">
                <p className="text-[11px] text-[var(--muted)]">
                  食性结构可用于实验室的喂养模拟。模拟不是现实饲养建议。
                </p>
                <Link href={`/lab#feeding`} className="mt-2 inline-flex items-center gap-1 text-[11px] text-[var(--ink-soft)] underline">
                  打开喂养模拟 <ArrowRight size={11} />
                </Link>
              </div>
            )}
          </SectionBlock>

          <SectionBlock id="habitat" index="05" title="栖息地">
            <p className="prose-museum">{species.habitat}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {species.distribution.biomes.map((b) => (
                <span key={b} className="chip">{b}</span>
              ))}
            </div>
          </SectionBlock>

          <SectionBlock id="reproduction" index="06" title="繁殖方式">
            <p className="prose-museum">{species.reproduction}</p>
          </SectionBlock>

          <SectionBlock id="conservation" index="07" title="保护状况">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="border border-[var(--line)] p-4">
                <p className="label text-[var(--muted)]">评估结论</p>
                <p className="mt-2 text-[13px]">
                  {species.conservation.status_label}（{species.conservation.status}）· {species.conservation.assessment_year} 年
                </p>
                <p className="mt-2 text-[11px] leading-relaxed text-[var(--muted)]">{species.conservation.population_note}</p>
              </div>
              <div className="border border-[var(--line)] p-4">
                <p className="label text-[var(--muted)]">主要威胁</p>
                <ul className="mt-2 space-y-1.5 text-[11.5px] text-[var(--ink-soft)]">
                  {species.conservation.threats.map((t) => (
                    <li key={t} className="flex gap-2"><span className="text-[var(--clay)]">·</span>{t}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-4 border border-[var(--line)] p-4">
              <p className="label text-[var(--muted)]">保护措施</p>
              <ul className="mt-2 grid gap-1.5 text-[11.5px] text-[var(--ink-soft)] sm:grid-cols-2">
                {species.conservation.measures.map((m) => (
                  <li key={m} className="flex gap-2"><span className="text-[var(--forest)]">✓</span>{m}</li>
                ))}
              </ul>
            </div>
            <p className="mt-4 text-[10px] leading-relaxed text-[var(--muted)]">
              保护等级与种群数量必须结合评估年份与分类单元理解。IUCN API 未接入，当前等级为编辑整理并待复核。
            </p>
          </SectionBlock>

          <SectionBlock id="distribution" index="08" title="地理分布">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="label text-[var(--muted)]">区域与国家</p>
                <p className="mt-2 text-[12.5px] leading-relaxed">{species.distribution.countries.join("、")}</p>
                <p className="mt-3 label text-[var(--muted)]">生态区</p>
                <p className="mt-2 text-[12.5px] leading-relaxed">{species.distribution.biomes.join("、")}</p>
              </div>
              <div className="border border-[var(--line)] bg-[var(--surface-2)] p-4">
                <p className="label text-[var(--muted)]">分布说明</p>
                <p className="mt-2 text-[11px] leading-relaxed text-[var(--muted)]">{species.distribution.note}</p>
                <p className="mt-3 text-[10px] text-[var(--muted)]">
                  {species.distribution.gbif_taxon_key
                    ? `GBIF taxonKey：${species.distribution.gbif_taxon_key}`
                    : "GBIF 分类键待连接后写入"}
                </p>
                <Link href={`/map?species=${species.slug}`} className="mt-3 inline-flex items-center gap-1 text-[11px] underline">
                  在地图上查看真实观测点 <ArrowRight size={11} />
                </Link>
              </div>
            </div>
          </SectionBlock>

          <SectionBlock id="gallery" index="09" title="影像档案">
            {media.length > 0 ? (
              <>
                <MediaGallery assets={media} title={species.name_cn} />
                <p className="mt-3 text-[9.5px] text-[var(--muted)]">
                  {media.length} 张影像 · 逐张记录作者、许可与来源。标记为 NC 的素材仅用于非商业展示。
                </p>
              </>
            ) : (
              <p className="text-[12px] text-[var(--muted)]">
                暂无可用授权影像。本馆不会用无关图片填充物种档案。
              </p>
            )}
          </SectionBlock>

          <SectionBlock id="sounds" index="10" title="动物声音">
            {sounds.length > 0 ? (
              <div className="space-y-3">
                {sounds.map((a) => (
                  <WaveformPlayer key={a.id} audio={a} />
                ))}
                <p className="text-[9.5px] leading-relaxed text-[var(--muted)]">
                  录音来自 iNaturalist 授权素材，逐条标注录音者、地点、许可与原始记录。Xeno-canto 与 Macaulay Library 需要授权，尚未接入。
                </p>
              </div>
            ) : (
              <div className="border border-dashed border-[var(--line-strong)] p-5 text-[11.5px] leading-relaxed text-[var(--muted)]">
                该物种暂无可用的授权录音。声音实验室仅使用许可明确的素材，不以模拟音替代。
                <Link href="/lab#sound" className="ml-1 underline">查看已有的录音目录 →</Link>
              </div>
            )}
          </SectionBlock>

          <SectionBlock id="videos" index="11" title="相关影片">
            {relatedVideos.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {relatedVideos.map((v) => (
                  <a
                    key={v.id}
                    href={v.official_url}
                    target="_blank"
                    rel="noreferrer"
                    className="group border border-[var(--line)] p-4 hover:border-[var(--line-strong)]"
                  >
                    <p className="label text-[var(--muted)]">{v.producer}</p>
                    <p className="mt-2 text-[13px]">{v.title_cn}</p>
                    <p className="mt-2 text-[10px] text-[var(--muted)]">{v.duration}</p>
                    <p className="mt-3 flex items-center gap-1 text-[10px] text-[var(--ink-soft)]">
                      官方页面 <ExternalLink size={10} />
                    </p>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-[12px] text-[var(--muted)]">暂时没有与该物种关联的官方影片条目。</p>
            )}
          </SectionBlock>

          <SectionBlock id="related" index="12" title="相关物种">
            {related.length > 0 ? (
              <div className="grid gap-x-4 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
                {related.map((s, i) => (
                  <SpeciesCard key={s.slug} species={s} index={i} />
                ))}
              </div>
            ) : (
              <p className="text-[12px] text-[var(--muted)]">暂无相关物种推荐。</p>
            )}
          </SectionBlock>

          <SectionBlock id="sources" index="13" title="资料来源与许可">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] border-collapse text-left text-[11px]">
                <thead className="border-b border-[var(--line-strong)] text-[9px] uppercase tracking-widest text-[var(--muted)]">
                  <tr>
                    <th className="py-2 pr-3 font-normal">来源</th>
                    <th className="py-2 pr-3 font-normal">许可</th>
                    <th className="py-2 pr-3 font-normal">获取时间</th>
                    <th className="py-2 pr-3 font-normal">状态</th>
                    <th className="py-2 font-normal">说明</th>
                  </tr>
                </thead>
                <tbody>
                  {species.sources.map((source) => (
                    <tr key={source.source_name + source.source_url} className="border-b border-[var(--line)] align-top">
                      <td className="py-3 pr-3">
                        <a href={source.source_url} target="_blank" rel="noreferrer" className="link-underline">
                          {source.source_name}
                        </a>
                      </td>
                      <td className="py-3 pr-3 text-[var(--muted)]">{source.license}</td>
                      <td className="py-3 pr-3 text-[var(--muted)]">{formatDate(source.retrieved_at)}</td>
                      <td className="py-3 pr-3">
                        <DataBadge status={source.review_status} />
                      </td>
                      <td className="py-3 text-[10.5px] leading-relaxed text-[var(--muted)]">{source.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-[10px] leading-relaxed text-[var(--muted)]">
              资料冲突处理：当不同来源对体长、寿命或保护等级给出不一致数据时，本馆保留各自出处并标记「待审核」，不会取平均值伪装为确定结论。
              更新时间：{formatDate(species.updated_at)}。
            </p>
          </SectionBlock>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--line)] pt-6">
            <Link href="/encyclopedia" className="inline-flex items-center gap-2 text-[12px] text-[var(--muted)] hover:text-[var(--ink)]">
              <ArrowLeft size={14} /> 返回动物百科
            </Link>
            <div className="flex items-center gap-3">
              <FavoriteButton slug={species.slug} />
              <Link href={`/compare?a=${species.slug}`} className="btn-outline">
                加入对比
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}