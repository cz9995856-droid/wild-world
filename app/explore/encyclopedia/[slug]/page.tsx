import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ExternalLink } from "lucide-react";
import { WcHeader } from "@/components/wildchina/wc-header";
import { WcPhoto, WcCredit } from "@/components/wildchina/wc-photo";
import { SpeciesCard } from "@/components/species/species-card";
import { ShareCardButton } from "@/components/species/share-card-button";
import { CHINA_SPECIES, CHINA_SPECIES_BY_SLUG, speciesHref } from "@/lib/wildchina/species";
import { getSpeciesImage, thumbUrl } from "@/lib/wildchina/media";
import { taxonCn } from "@/lib/wildchina/taxonomy";

export function generateStaticParams() {
  return CHINA_SPECIES.map((species) => ({ slug: species.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const species = CHINA_SPECIES_BY_SLUG.get(slug);
  if (!species) return { title: "物种未找到" };
  return {
    title: `${species.nameCn} · 物种档案`,
    description: `${species.nameCn}（${species.scientificName}）：${species.distribution}。`,
  };
}

const NONE = "暂无记录";

const GROUP_ACCENT: Record<string, string> = {
  mammal: "var(--tax-mammal)",
  bird: "var(--tax-bird)",
  amphibian: "var(--tax-amphibian)",
  reptile: "var(--tax-reptile)",
  fish: "var(--tax-fish)",
};

const GROUP_HEX: Record<string, string> = {
  mammal: "#b45309",
  bird: "#0369a1",
  amphibian: "#4d7c0f",
  reptile: "#9a3412",
  fish: "#3730a3",
};

export default async function ChinaSpeciesDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const species = CHINA_SPECIES_BY_SLUG.get(slug);
  if (!species) notFound();

  const hero = getSpeciesImage(slug, "hero") ?? getSpeciesImage(slug, "full");
  const habitat = getSpeciesImage(slug, "habitat");
  const full = getSpeciesImage(slug, "full");
  const index = CHINA_SPECIES.findIndex((item) => item.slug === slug);
  const code = String(index + 1).padStart(3, "0");
  const accent = GROUP_ACCENT[species.group] ?? "var(--ink)";

  const oneLine =
    species.endemic === "strict"
      ? `全世界只有中国有野外种群的${species.nameCn}。`
      : `主要生活在中国，周边国家只有零星记录的${species.nameCn}。`;

  const related = CHINA_SPECIES.filter((item) => item.slug !== slug && item.group === species.group).slice(0, 3);

  const neighbours = species.provinces.length
    ? CHINA_SPECIES.filter((item) => item.slug !== slug && item.provinces.some((province) => species.provinces.includes(province)))
        .map((item) => ({
          item,
          overlap: item.provinces.filter((province) => species.provinces.includes(province)).length,
        }))
        .sort((a, b) => b.overlap - a.overlap)
        .slice(0, 8)
        .map((entry) => entry.item)
    : [];

  return (
    <div className="wc-frame">
      <WcHeader />

      <nav className="mt-4 flex flex-wrap items-center gap-2 text-[10.5px] text-[var(--muted)]" aria-label="面包屑">
        <Link href="/explore" className="hover:text-[var(--forest)]">探索</Link>
        <span>/</span>
        <Link href="/explore/encyclopedia" className="hover:text-[var(--forest)]">物种图鉴</Link>
        <span>/</span>
        <span className="text-[var(--ink-soft)]">{species.nameCn}</span>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,460px)_1fr] lg:items-start">
        <div className="mx-auto w-full max-w-[460px] lg:sticky lg:top-24">
          <SpeciesCard
            slug={species.slug}
            code={code}
            nameCn={species.nameCn}
            scientificName={species.scientificName}
            englishName={species.englishName}
            group={species.group}
            groupLabel={species.groupLabel}
            endemicLine={oneLine}
            conservation={{ label: species.conservation.label, status: species.conservation.status, year: species.conservation.year }}
            image={hero?.url ?? null}
            imageCredit={hero ? `${hero.author} · ${hero.license}` : null}
            morphology={species.morphology}
            taxonomy={[
              ["纲", taxonCn(species.taxonomy.class)],
              ["目", taxonCn(species.taxonomy.order)],
              ["科", taxonCn(species.taxonomy.family)],
              ["属", taxonCn(species.taxonomy.genus)],
            ]}
            distribution={species.distribution}
            habitats={species.habitats.join("、")}
          />
        </div>

        <div>
          <p className="hb-hand">野外手册 · 第 {code} 页</p>
          <h1 className="hb-display mt-2 text-[clamp(40px,6.4vw,68px)]">{species.nameCn}</h1>
          <p className="mt-3 font-serif text-[14px] italic text-[var(--muted)]">
            {species.scientificName} · {species.englishName}
          </p>

          <p className="mt-5 border-l-4 pl-4 text-[19px] font-bold leading-snug" style={{ borderColor: accent }}>
            {oneLine}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <ShareCardButton
              code={code}
              nameCn={species.nameCn}
              scientificName={species.scientificName}
              groupLabel={species.groupLabel}
              oneLine={oneLine}
              distribution={species.distribution}
              slogan="WildChina · 中国特有脊椎动物探索者计划"
              accent={GROUP_HEX[species.group] ?? "#1c1a17"}
              imageUrl={thumbUrl(hero?.url ?? null) || null}
            />
            <Link href={`/explore/lab?species=${species.slug}#three-d`} className="hb-btn text-[12px]">
              进入生命实验室 <ExternalLink size={14} />
            </Link>
            <Link href="/explore/challenge" className="hb-btn hb-btn-ghost text-[12px]">
              相关挑战 <ArrowRight size={14} />
            </Link>
          </div>

          <div className="mt-7 space-y-2.5">
            <DetailPanel title="分类系统" defaultOpen>
              <dl className="grid grid-cols-2 gap-3">
                {[
                  ["纲", taxonCn(species.taxonomy.class)],
                  ["目", taxonCn(species.taxonomy.order)],
                  ["科", taxonCn(species.taxonomy.family)],
                  ["属", taxonCn(species.taxonomy.genus)],
                ].map(([label, value]) => (
                  <div key={label} className="border-t border-[var(--line)] pt-2">
                    <dt className="text-[9.5px] text-[var(--muted)]">{label}</dt>
                    <dd className="mt-0.5 text-[12.5px] text-[var(--ink-soft)]">{value || "待核验"}</dd>
                  </div>
                ))}
              </dl>
              {species.aliases.length > 0 && <p className="mt-3 text-[11.5px] text-[var(--muted)]">别名：{species.aliases.join("、")}</p>}
            </DetailPanel>

            <DetailPanel title="中国分布">
              <p className="text-[13px] leading-relaxed text-[var(--ink-soft)]">{species.distribution}</p>
              {species.provinces.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {species.provinces.map((province) => (
                    <Link
                      key={province}
                      href={`/explore/encyclopedia?province=${encodeURIComponent(province)}`}
                      className="border border-[var(--line-strong)] px-2 py-1 text-[10.5px]"
                    >
                      {province}
                    </Link>
                  ))}
                </div>
              )}
              <p className="mt-2 text-[10px] leading-relaxed text-[var(--muted)]">{species.endemicNote}</p>
            </DetailPanel>

            <DetailPanel title="形态与习性">
              <SubBlock label="外貌及形态特征">{species.morphology}</SubBlock>
              <SubBlock label="生活习性">{species.behavior}</SubBlock>
              <SubBlock label="食性与繁殖">{species.dietReproduction}</SubBlock>
            </DetailPanel>

            <DetailPanel title="栖息环境">
              <div className="grid gap-3 sm:grid-cols-[140px_1fr]">
                <div className="relative aspect-[4/3] overflow-hidden border border-[var(--line)] bg-[var(--surface-2)]">
                  <WcPhoto src={habitat?.url ?? null} alt={`${species.nameCn} 栖息环境`} sizes="160px" fallbackLabel="环境影像待补" fallbackNote="尚未取得可核验的授权环境照片" />
                </div>
                <p className="text-[13px] leading-relaxed text-[var(--ink-soft)]">{species.habitats.join("、") || NONE}</p>
              </div>
            </DetailPanel>

            <DetailPanel title="保护现状">
              <div className="flex flex-wrap items-baseline gap-3">
                <p className="text-[26px] font-black" style={{ color: accent }}>{species.conservation.label}</p>
                <p className="text-[11px] text-[var(--muted)]">
                  {species.conservation.status} · {species.conservation.year ? `${species.conservation.year} 年评估` : "评估年份待核验"}
                </p>
              </div>
              <p className="mt-2 text-[12.5px] leading-relaxed text-[var(--ink-soft)]">{species.conservation.note}</p>
              <p className="mt-2 text-[10px] leading-relaxed text-[var(--muted)]">
                NE（未评估）不代表无危。本站约六成物种尚无正式评估等级，引用时请回到原始名录核对。
              </p>
            </DetailPanel>
          </div>
        </div>
      </div>

      {full && (
        <section className="mt-10">
          <h2 className="hb-h2">完整形态影像</h2>
          <figure className="relative mt-3 aspect-[16/9] overflow-hidden border border-[var(--line)] bg-[var(--surface-2)]">
            <WcPhoto src={full.url} alt={`${species.nameCn} 完整形态`} sizes="100vw" />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0b2016]/80 to-transparent px-4 pb-3 pt-10 text-[9px] text-[#f3ede1]/80">
              {full.source_name} · {full.author} · {full.license}
              <a href={full.source_url} target="_blank" rel="noreferrer" className="ml-2 underline">
                原始页面
              </a>
            </figcaption>
          </figure>
        </section>
      )}

      {neighbours.length > 0 && (
        <section className="mt-10">
          <div className="flex items-end justify-between gap-3">
            <h2 className="hb-h2">同一片地方的邻居</h2>
            <p className="text-[10px] text-[var(--muted)]">按省份重合度排序 · 滑动查看</p>
          </div>
          <div className="hb-snap-row mt-3 flex gap-3 overflow-x-auto pb-2">
            {neighbours.map((item) => {
              const image = getSpeciesImage(item.slug, "hero") ?? getSpeciesImage(item.slug, "full");
              return (
                <Link key={item.slug} href={speciesHref(item.slug)} className="hb-card hb-card-lift w-[168px] shrink-0">
                  <div className="relative aspect-[5/4] overflow-hidden bg-[var(--surface-2)]">
                    <WcPhoto src={thumbUrl(image?.url) || null} alt={item.nameCn} sizes="168px" />
                  </div>
                  <div className="px-2.5 py-2">
                    <p className="truncate text-[13px] font-bold">{item.nameCn}</p>
                    <p className="mt-0.5 text-[9px] text-[var(--muted)]">{item.provinces.slice(0, 3).join(" · ")}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-10">
          <div className="flex items-end justify-between gap-3">
            <h2 className="hb-h2">相似的物种</h2>
            <p className="text-[10px] text-[var(--muted)]">同属{species.groupLabel} · 滑动查看</p>
          </div>
          <div className="hb-snap-row mt-3 flex gap-3 overflow-x-auto pb-2">
            {related.map((item) => {
              const image = getSpeciesImage(item.slug, "hero") ?? getSpeciesImage(item.slug, "full");
              return (
                <Link key={item.slug} href={speciesHref(item.slug)} className="hb-card hb-card-lift w-[220px] shrink-0">
                  <div className="relative aspect-[5/4] overflow-hidden bg-[var(--surface-2)]">
                    <WcPhoto src={thumbUrl(image?.url) || null} alt={item.nameCn} sizes="220px" />
                  </div>
                  <div className="px-3 py-2.5">
                    <p className="truncate text-[14px] font-bold">{item.nameCn}</p>
                    <p className="mt-0.5 font-serif text-[10px] italic text-[var(--muted)]">{item.scientificName}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <details className="mt-10 border-t border-[var(--line)] pt-4">
        <summary className="cursor-pointer text-[12px] text-[var(--ink-soft)]">数据说明 · 来源、日期与口径</summary>
        <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <div>
              <p className="text-[10px] text-[var(--muted)]">分布口径</p>
              <p className="mt-1 text-[11.5px] leading-relaxed text-[var(--ink-soft)]">{species.endemicNote}</p>
            </div>
            <div>
              <p className="text-[10px] text-[var(--muted)]">保护等级口径</p>
              <p className="mt-1 text-[11.5px] leading-relaxed text-[var(--ink-soft)]">{species.conservation.note}</p>
            </div>
            <div>
              <p className="text-[10px] text-[var(--muted)]">资料来源</p>
              <ul className="mt-1.5 space-y-1.5 text-[11.5px]">
                {species.sources.map((source) => (
                  <li key={source.url}>
                    <a href={source.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline">
                      {source.name} <ExternalLink size={10} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-[10px] leading-relaxed text-[var(--muted)]">
              SP2000 物种标识：{species.sp2000.id ?? "暂无记录"}。
              {species.sp2000.id === null && " Species 2000 China 未开放可编程详情接口，本站不编造记录编号。"}
            </p>
            <p className="text-[10px] leading-relaxed text-[var(--muted)]">
              省级分布来自 GBIF occurrence 记录汇总，存在采样偏差，不代表完整分布区。影像授权信息随图标注，未取得授权的示意内容会明确标注。
            </p>
          </div>
          <aside className="border border-[var(--line)] bg-[var(--surface-2)] p-4">
            <p className="text-[10px] text-[var(--muted)]">档案状态</p>
            <p className="mt-1 text-[12px]">{species.verified ? "编辑整理，来源可追溯" : "待审核"}</p>
            <p className="mt-3 text-[10px] leading-relaxed text-[var(--muted)]">
              收录编号 NO. {code} · 共 {CHINA_SPECIES.length} 种
            </p>
          </aside>
        </div>
      </details>

      <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] pt-4">
        <Link href="/explore/encyclopedia" className="text-[11px] underline">← 返回物种图鉴</Link>
        <WcCredit>数据说明可展开查看每条来源与统计口径</WcCredit>
      </footer>
    </div>
  );
}

function DetailPanel({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  return (
    <details open={defaultOpen} className="border border-[var(--line)] bg-[var(--surface)]">
      <summary className="cursor-pointer px-4 py-3 text-[13px] font-bold">{title}</summary>
      <div className="border-t border-[var(--line)] px-4 py-3">{children}</div>
    </details>
  );
}

function SubBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-2 first:mt-0">
      <p className="text-[9.5px] text-[var(--muted)]">{label}</p>
      <p className="mt-1 text-[12.5px] leading-relaxed text-[var(--ink-soft)]">{children}</p>
    </div>
  );
}