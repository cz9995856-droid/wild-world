import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ExternalLink } from "lucide-react";
import { WcHeader } from "@/components/wildchina/wc-header";
import { WcPhoto, WcCredit } from "@/components/wildchina/wc-photo";
import { ChinaFavoriteButton } from "@/components/wildchina/china-favorite-button";
import {
  CHINA_SPECIES,
  CHINA_SPECIES_BY_SLUG,
  speciesHref,
} from "@/lib/wildchina/species";
import { getSpeciesImage } from "@/lib/wildchina/media";
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

export default async function ChinaSpeciesDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const species = CHINA_SPECIES_BY_SLUG.get(slug);
  if (!species) notFound();

  const hero = getSpeciesImage(slug, "hero") ?? getSpeciesImage(slug, "full");
  const habitat = getSpeciesImage(slug, "habitat");
  const full = getSpeciesImage(slug, "full");
  const related = CHINA_SPECIES.filter((item) => item.slug !== slug && item.group === species.group).slice(0, 3);

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

      <header className="mt-4 grid gap-6 border-b border-[var(--line)] pb-8 lg:grid-cols-[1.2fr_1fr] lg:items-end">
        <div>
          <p className="wc-kicker">
            {species.groupLabel} · {species.endemic === "strict" ? "严格中国特有" : "主要分布于中国"}
          </p>
          <h1 className="display mt-3 text-[44px] leading-[0.96] sm:text-[62px]">{species.nameCn}</h1>
          <p className="mt-3 font-serif text-[15px] italic text-[var(--muted)]">
            {species.scientificName} · {species.englishName}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2 text-[10.5px]">
            <span className="border border-[var(--line-strong)] px-2.5 py-1">{species.conservation.label}（{species.conservation.status}）</span>
            <span className="border border-[var(--line-strong)] px-2.5 py-1">{species.endemicNote}</span>
            <ChinaFavoriteButton slug={species.slug} label={species.nameCn} />
          </div>
        </div>
        <p className="wc-prose lg:justify-self-end">{species.distribution}</p>
      </header>

      <section className="mt-6 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <figure className="relative min-h-[320px] overflow-hidden border border-[var(--line)] bg-[var(--surface-2)] sm:min-h-[440px]">
          <WcPhoto src={hero?.url ?? null} alt={`${species.nameCn} 主视觉`} priority sizes="(max-width: 1024px) 100vw, 60vw" />
          {hero && (
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0b2016]/80 to-transparent px-4 pb-3 pt-10 text-[9px] text-[#f3ede1]/80">
              {hero.source_name} · {hero.author} · {hero.license}
              <a href={hero.source_url} target="_blank" rel="noreferrer" className="ml-2 underline">
                原始页面
              </a>
            </figcaption>
          )}
        </figure>
        <div className="grid gap-4">
          <figure className="relative min-h-[180px] overflow-hidden border border-[var(--line)] bg-[var(--surface-2)]">
            <WcPhoto src={habitat?.url ?? null} alt={`${species.nameCn} 栖息环境`} sizes="(max-width: 1024px) 100vw, 40vw" fallbackLabel="栖息环境影像待补" fallbackNote="尚未取得可核验的授权环境照片" />
          </figure>
          <figure className="relative min-h-[180px] overflow-hidden border border-[var(--line)] bg-[var(--surface-2)]">
            <WcPhoto src={full?.url ?? null} alt={`${species.nameCn} 完整形态`} sizes="(max-width: 1024px) 100vw, 40vw" fallbackLabel="完整形态影像待补" fallbackNote="尚未取得可核验的授权形态照片" />
          </figure>
        </div>
      </section>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          <InfoBlock title="基础分类信息">
            <dl className="grid gap-3 sm:grid-cols-2">
              {[
                ["纲", taxonCn(species.taxonomy.class) || "待核验"],
                ["目", taxonCn(species.taxonomy.order) || "待核验"],
                ["科", taxonCn(species.taxonomy.family) || "待核验"],
                ["属", taxonCn(species.taxonomy.genus) || "待核验"],
              ].map(([label, value]) => (
                <div key={label} className="border-t border-[var(--line)] pt-2">
                  <dt className="wc-field-label">{label}</dt>
                  <dd className="mt-1 text-[13.5px] text-[var(--ink-soft)]">{value || NONE}</dd>
                </div>
              ))}
            </dl>
          </InfoBlock>

          <InfoBlock title="中文分布区域">{species.distribution}</InfoBlock>

          <div className="grid gap-2 sm:grid-cols-2">
            <Link
              href={`/explore/lab?species=${species.slug}#three-d`}
              className="flex items-center justify-between gap-3 border border-[var(--forest)] bg-[var(--forest)] px-4 py-3 text-[#F5F1E7] transition-opacity hover:opacity-90"
            >
              <span>
                <span className="block text-[12.5px]">进入生命实验室</span>
                <span className="mt-0.5 block text-[9.5px] text-white/60">
                  查看 3D 模型与身体结构
                </span>
              </span>
              <ExternalLink size={15} />
            </Link>
            <Link
              href="/explore/challenge"
              className="flex items-center justify-between gap-3 border border-[var(--line-strong)] bg-[var(--surface)] px-4 py-3 transition-colors hover:border-[var(--forest)]"
            >
              <span>
                <span className="block text-[12.5px]">生命探索挑战</span>
                <span className="mt-0.5 block text-[9.5px] text-[var(--muted)]">
                  在题库中检验对该类群的理解
                </span>
              </span>
              <ArrowRight size={15} />
            </Link>
          </div>

          {species.aliases.length > 0 && (
            <InfoBlock title="别名">{species.aliases.join("、")}</InfoBlock>
          )}
          <InfoBlock title="外貌及形态特征">{species.morphology}</InfoBlock>
          <InfoBlock title="生活习性">{species.behavior}</InfoBlock>
          <InfoBlock title="食性与繁殖">{species.dietReproduction}</InfoBlock>
          <InfoBlock title="栖息环境">{species.habitats.join("、") || NONE}</InfoBlock>
        </div>

        <aside className="space-y-5">
          <div className="border border-[var(--line)] bg-[var(--surface)] p-5">
            <p className="wc-field-label">保护等级</p>
            <p className="mt-2 display text-[30px]">{species.conservation.label}</p>
            <p className="mt-1 text-[11px] text-[var(--muted)]">
              {species.conservation.status} · {species.conservation.year ? `${species.conservation.year} 年评估` : "评估年份待核验"}
            </p>
            <p className="mt-3 text-[11px] leading-relaxed text-[var(--ink-soft)]">{species.conservation.note}</p>
          </div>

          <div className="border border-[var(--line)] bg-[var(--surface-2)] p-5">
            <p className="wc-field-label">相关资料来源</p>
            <ul className="mt-3 space-y-2 text-[11.5px]">
              {species.sources.map((source) => (
                <li key={source.url}>
                  <a href={source.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline">
                    {source.name} <ExternalLink size={10} />
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-4 border-t border-[var(--line)] pt-3 text-[10px] leading-relaxed text-[var(--muted)]">
              SP2000 物种标识：{species.sp2000.id ?? "暂无记录"}。
              {species.sp2000.id === null && " Species 2000 China 未开放可编程详情接口，本站不编造记录编号。"}
            </p>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-12 border-t border-[var(--line)] pt-8">
          <p className="wc-kicker">Related Species</p>
          <h2 className="display mt-2 text-[28px]">同类群物种</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {related.map((item) => {
              const image = getSpeciesImage(item.slug, "hero") ?? getSpeciesImage(item.slug, "full");
              return (
                <Link key={item.slug} href={speciesHref(item.slug)} className="group border border-[var(--line)] bg-[var(--surface)]">
                  <div className="relative aspect-[16/10] overflow-hidden bg-[var(--surface-2)]">
                    <WcPhoto src={image?.url ?? null} alt={item.nameCn} sizes="33vw" className="transition-transform duration-700 group-hover:scale-[1.04]" />
                  </div>
                  <div className="p-3">
                    <p className="text-[15px]">{item.nameCn}</p>
                    <p className="mt-0.5 font-serif text-[10.5px] italic text-[var(--muted)]">{item.scientificName}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <footer className="mt-10 flex items-center justify-between border-t border-[var(--line)] pt-4">
        <Link href="/explore/encyclopedia" className="text-[11px] underline">← 返回物种图鉴</Link>
        <WcCredit>档案状态：{species.verified ? "编辑整理，来源可追溯" : "待审核"}</WcCredit>
      </footer>
    </div>
  );
}

function InfoBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="display text-[24px]">{title}</h2>
      <div className="wc-prose-lg mt-2">{children}</div>
    </section>
  );
}