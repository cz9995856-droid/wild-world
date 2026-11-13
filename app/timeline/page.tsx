import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { PhylogenyNotes, TaxonomyTree, TimelineExplorer } from "@/components/timeline/timeline-explorer";
import { getAllSpecies, getTimeline } from "@/lib/repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "进化时间线与分类关系",
  description: "从寒武纪到第四纪的演化节点，附分类树与系统发育说明，严格区分分类关系与进化关系。",
};

export default async function TimelinePage() {
  const species = await getAllSpecies();
  const timeline = getTimeline();
  const eras = timeline;

  return (
    <>
      <PageHeader
        kicker="Deep Time · 进化时间线"
        title="五点三八亿年，压缩成一条线"
        description="时间线引用 Paleobiology Database、Open Tree of Life 与 Catalogue of Life 的公开资料。分类树用于检索，系统发育树才表达演化分支；两者不混用。"
        breadcrumbs={[{ label: "进化时间线" }]}
        meta={
          <div className="flex flex-wrap gap-2 lg:justify-end">
            <span className="chip">7 个演化节点</span>
            <span className="chip">PBDB · Open Tree of Life</span>
            <span className="chip">分类核对：GBIF / CoL</span>
          </div>
        }
      />

      <div className="container-museum pb-20 pt-8">
        <section className="border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="display text-[26px]">可交互时间线</h2>
            <span className="text-[10px] text-[var(--muted)]">点击节点查看描述与来源</span>
          </div>
          <TimelineExplorer eras={eras} species={species} />
        </section>

        <section className="mt-12">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="label text-[var(--muted)]">Classification · 分类关系</p>
              <h2 className="display mt-2 text-[28px]">馆藏物种的分类树</h2>
            </div>
            <a
              href="https://tree.opentreeoflife.org/"
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-1 text-[10px] underline sm:flex"
            >
              打开 Open Tree of Life <ExternalLink size={10} />
            </a>
          </div>
          <TaxonomyTree species={species} />
        </section>

        <section className="mt-12">
          <p className="label mb-5 text-[var(--muted)]">How to read · 如何避免误读</p>
          <PhylogenyNotes />
        </section>

        <section className="mt-12 grid gap-6 border border-[var(--line)] bg-[var(--surface-2)] p-5 sm:p-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <div>
            <p className="label text-[var(--muted)]">Fossil record · 化石记录</p>
            <h2 className="display mt-2 text-[28px]">化石不是“祖先照片”</h2>
            <p className="mt-3 max-w-xl text-[11.5px] leading-relaxed text-[var(--muted)]">
              Paleobiology Database 记录的是化石产出与分类归属，不是一条完整的祖先—后代链。时间线上的物种与远祖之间隔着大量未保存的支系。
              本站不使用“某动物直接进化自某化石”的简化叙事。
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href="https://paleobiodb.org/" target="_blank" rel="noreferrer" className="btn-outline">
                Paleobiology Database <ExternalLink size={11} />
              </a>
              <a href="https://tree.opentreeoflife.org/" target="_blank" rel="noreferrer" className="btn-outline">
                Open Tree of Life <ExternalLink size={11} />
              </a>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden bg-[#0B2118]">
            <div className="absolute inset-0 opacity-30">
              <svg viewBox="0 0 400 300" className="h-full w-full" aria-hidden="true">
                <g fill="none" stroke="#EDE8DC" strokeWidth="0.8">
                  <path d="M20 250c60-30 70-90 130-110s70-50 110-60 60-20 110-40" />
                  <path d="M20 270c70-20 80-80 150-90s80-40 120-50 50-20 90-40" />
                  <path d="M40 285c80-10 90-60 160-60s80-20 120-30 60-10 60-10" />
                  {Array.from({ length: 14 }, (_, i) => (
                    <circle key={i} cx={30 + i * 25} cy={250 - i * 12} r="1.5" fill="#C29B4A" stroke="none" />
                  ))}
                </g>
              </svg>
            </div>
            <div className="absolute inset-0 grain" />
            <div className="absolute bottom-4 left-4 text-[9px] uppercase tracking-[0.2em] text-[#A9BFA8]">
              Deep time · schematic only
            </div>
          </div>
        </section>

        <div className="mt-10 flex justify-end">
          <Link href="/encyclopedia" className="inline-flex items-center gap-1.5 text-[11px] text-[var(--muted)] hover:text-[var(--ink)]">
            回到动物百科 <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </>
  );
}