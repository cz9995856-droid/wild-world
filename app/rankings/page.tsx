import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { getAllSpecies } from "@/lib/repository";
import { buildRankings } from "@/lib/rankings";
import { ConservationBadge } from "@/components/ui/badges";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "动物排行榜",
  description: "体重、体长、寿命、速度与保护等级榜单，逐项标注数据条件、来源与不可比性说明。",
};

export default async function RankingsPage() {
  const species = await getAllSpecies();
  const boards = buildRankings(species);

  return (
    <>
      <PageHeader
        kicker="Rankings · 排行榜"
        title="只比较可比的数据"
        description="每个榜单都有明确口径。我们不把俯冲速度与巡航速度混为一谈，不把圈养寿命当成野外寿命，也不把不同年份的保护等级当成同一把尺子。"
        breadcrumbs={[{ label: "排行榜" }]}
        meta={<span className="chip">{boards.length} 个榜单 · 最多 10 位</span>}
      />
      <div className="container-museum pb-20 pt-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {boards.map((board) => {
            const max = Math.max(...board.entries.map((e) => e.value), 1);
            return (
              <section key={board.id} className="border border-[var(--line)] bg-[var(--surface)]">
                <div className="border-b border-[var(--line)] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="display text-[26px]">{board.title}</h2>
                      <p className="mt-1 text-[10.5px] text-[var(--muted)]">{board.subtitle}</p>
                    </div>
                    <span className="label text-[var(--muted)]">{board.unit}</span>
                  </div>
                </div>
                <ol className="divide-y divide-[var(--line)]">
                  {board.entries.map((entry, index) => (
                    <li key={entry.species.slug} className="group relative">
                      <Link href={`/encyclopedia/${entry.species.slug}`} className="block px-5 py-3">
                        <div className="flex items-center gap-3">
                          <span className="w-6 font-mono text-[10px] text-[var(--muted)]">{String(index + 1).padStart(2, "0")}</span>
                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-center gap-2">
                              <span className="text-[13px]">{entry.species.name_cn}</span>
                              <span className="text-[10px] text-[var(--muted)]">{entry.species.name_en}</span>
                              <ConservationBadge code={entry.species.conservation.status} label={entry.species.conservation.status_label} />
                            </span>
                            <span className="mt-1.5 block h-[3px] w-full bg-[var(--surface-2)]">
                              <span
                                className="block h-full bg-[var(--forest)] opacity-60 transition-all group-hover:opacity-100"
                                style={{ width: `${Math.max(4, (entry.value / max) * 100)}%` }}
                              />
                            </span>
                          </span>
                          <span className="shrink-0 font-mono text-[11px] text-[var(--ink-soft)]">{entry.display}</span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ol>
                <div className="border-t border-[var(--line)] p-4 text-[9.5px] leading-relaxed text-[var(--muted)]">
                  <p>{board.caveat}</p>
                  <a href={board.source_url} target="_blank" rel="noreferrer" className="mt-2 inline-block underline">
                    来源：{board.source} ↗
                  </a>
                </div>
              </section>
            );
          })}
        </div>

        <div className="mt-10 border border-[var(--line)] bg-[var(--surface-2)] p-5">
          <p className="label text-[var(--muted)]">Method · 口径说明</p>
          <ul className="mt-3 grid gap-2 text-[10.5px] leading-relaxed text-[var(--muted)] sm:grid-cols-2">
            <li>体重、体长取馆藏记录中成体范围的上限；不同物种测量方法可能不同。</li>
            <li>寿命为公开资料中的上限估计，不代表平均寿命；圈养数据单独标注。</li>
            <li>速度口径包括冲刺、俯冲与游泳，不能直接比较生态意义。</li>
            <li>保护等级按 IUCN 等级序列排序，评估年份与分类单元可能不同。</li>
            <li>所有数据当前为编辑整理，接入 IUCN / ADW 授权后需重新核验。</li>
            <li>榜单不包含馆藏中缺少对应字段的物种，也不猜测缺失值。</li>
          </ul>
        </div>
      </div>
    </>
  );
}