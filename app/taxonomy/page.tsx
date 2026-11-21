import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, GitBranch, Info } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { getAllSpecies } from "@/lib/repository";
import type { Species } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "动物分类树",
  description: "按界、门、纲、目、科、属、种浏览 WILD WORLD 馆藏，严格区分分类关系与系统发育关系。",
};

interface Node {
  name: string;
  children: Map<string, Node>;
  species: Species[];
}

function newNode(name: string): Node {
  return { name, children: new Map(), species: [] };
}

function buildTree(species: Species[]) {
  const root = newNode("动物界 Animalia");
  for (const s of species) {
    const path = [s.taxonomy.phylum, s.taxonomy.class, s.taxonomy.order, s.taxonomy.family, s.taxonomy.genus];
    let node = root;
    for (const key of path) {
      if (!node.children.has(key)) node.children.set(key, newNode(key));
      node = node.children.get(key)!;
    }
    node.species.push(s);
  }
  return root;
}

function count(node: Node): number {
  let n = node.species.length;
  for (const child of node.children.values()) n += count(child);
  return n;
}

function Branch({ node, depth }: { node: Node; depth: number }) {
  if (depth === 0) return null;
  return (
    <details open={depth <= 2} className="group border-l border-[var(--line)] pl-4">
      <summary className="flex cursor-pointer list-none items-center gap-2 py-2 text-[13px] hover:text-[var(--forest)]">
        <ChevronRight size={13} className="transition-transform group-open:rotate-90" />
        <span className={depth === 1 ? "font-medium" : "text-[var(--ink-soft)]"}>{node.name}</span>
        <span className="font-mono text-[10px] text-[var(--muted)]">{count(node)}</span>
      </summary>
      <div className="ml-2 border-l border-[var(--line)] pl-4">
        {node.species.map((s) => (
          <Link
            key={s.slug}
            href={`/encyclopedia/${s.slug}`}
            className="flex items-center justify-between gap-3 border-b border-[var(--line)] py-1.5 text-[12px] hover:text-[var(--forest)]"
          >
            <span>{s.name_cn}</span>
            <span className="font-mono text-[9px] italic text-[var(--muted)]">{s.scientific_name}</span>
          </Link>
        ))}
        {[...node.children.values()]
          .sort((a, b) => count(b) - count(a))
          .map((child) => (
            <Branch key={child.name} node={child} depth={depth + 1} />
          ))}
      </div>
    </details>
  );
}

export default async function TaxonomyPage() {
  const species = await getAllSpecies();
  const root = buildTree(species);

  return (
    <>
      <PageHeader
        kicker="Taxonomy · 分类树"
        title="界、门、纲、目、科、属、种"
        description="分类是检索工具，不是演化距离。这里展示的是林奈分类框架下的馆藏路径；系统发育关系请参考进化时间线与 Open Tree of Life。"
        breadcrumbs={[{ label: "动物百科", href: "/encyclopedia" }, { label: "分类树" }]}
        meta={
          <div className="flex flex-wrap gap-2 lg:justify-end">
            <span className="chip">{species.length} 个物种</span>
            <span className="chip">{root.children.size} 个门</span>
            <span className="chip">分类来源：GBIF / Catalogue of Life</span>
          </div>
        }
      />
      <div className="container-museum pb-20 pt-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
          <div className="border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-8">
            <div className="mb-5 flex items-center gap-2">
              <GitBranch size={16} className="text-[var(--forest)]" />
              <span className="text-[13px] font-medium">动物界 Animalia</span>
              <span className="font-mono text-[10px] text-[var(--muted)]">{species.length}</span>
            </div>
            {[...root.children.values()]
              .sort((a, b) => count(b) - count(a))
              .map((phylum) => (
                <Branch key={phylum.name} node={phylum} depth={1} />
              ))}
          </div>
          <aside className="space-y-4">
            <div className="border border-[var(--line)] bg-[var(--surface-2)] p-5">
              <p className="flex items-center gap-2 text-[12px] font-medium">
                <Info size={14} className="text-[var(--clay)]" /> 分类 ≠ 进化
              </p>
              <p className="mt-2 text-[11.5px] leading-relaxed text-[var(--muted)]">
                同一科的动物不一定比同目不同科的动物更“接近祖先”。分类等级是人为组织方式，
                真正的演化分支需要系统发育分析支持。
              </p>
            </div>
            <div className="border border-[var(--line)] bg-[var(--surface)] p-5">
              <p className="label text-[var(--muted)]">数据来源</p>
              <p className="mt-2 text-[11px] leading-relaxed text-[var(--muted)]">
                分类骨架参考 GBIF Backbone Taxonomy 与 Catalogue of Life；馆藏为编辑整理，待逐条复核。
              </p>
              <a href="https://www.catalogueoflife.org/" target="_blank" rel="noreferrer" className="mt-3 inline-block text-[11px] underline">
                Catalogue of Life ↗
              </a>
              <br />
              <a href="https://tree.opentreeoflife.org/" target="_blank" rel="noreferrer" className="mt-1 inline-block text-[11px] underline">
                Open Tree of Life ↗
              </a>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}