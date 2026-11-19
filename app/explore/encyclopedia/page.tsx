import type { Metadata } from "next";
import Link from "next/link";
import { WcHeader } from "@/components/wildchina/wc-header";
import { WcPhoto } from "@/components/wildchina/wc-photo";
import { ChinaFavoriteButton } from "@/components/wildchina/china-favorite-button";
import {
  CHINA_GROUPS,
  CHINA_HABITATS,
  CHINA_SPECIES,
  speciesHref,
  type ChinaGroup,
} from "@/lib/wildchina/species";
import { getSpeciesImage, thumbUrl } from "@/lib/wildchina/media";
import { taxonCn } from "@/lib/wildchina/taxonomy";
import { cn } from "@/lib/utils";

const GROUP_ACCENT: Record<string, string> = {
  mammal: "var(--tax-mammal)",
  bird: "var(--tax-bird)",
  amphibian: "var(--tax-amphibian)",
  reptile: "var(--tax-reptile)",
  fish: "var(--tax-fish)",
};

const GROUP_TAG: Record<string, string> = {
  mammal: "hb-tag-mammal",
  bird: "hb-tag-bird",
  amphibian: "hb-tag-amphibian",
  reptile: "hb-tag-reptile",
  fish: "hb-tag-fish",
};

const CODE_BY_SLUG = new Map(CHINA_SPECIES.map((species, index) => [species.slug, String(index + 1).padStart(3, "0")]));

export const metadata: Metadata = {
  title: "物种图鉴",
  description: "按纲、分布地区、栖息环境与保护等级检索中国特有脊椎动物。",
};

interface Query {
  q?: string;
  group?: string;
  habitat?: string;
  status?: string;
  province?: string;
  page?: string;
}

function hrefWith(current: Query, patch: Partial<Query>) {
  const params = new URLSearchParams();
  const merged = { ...current, ...patch };
  if (!("page" in patch)) delete merged.page;
  for (const [key, value] of Object.entries(merged)) {
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return query ? `/explore/encyclopedia?${query}` : "/explore/encyclopedia";
}

export default async function ChinaEncyclopediaPage({
  searchParams,
}: {
  searchParams: Promise<Query>;
}) {
  const current = await searchParams;
  const q = (current.q ?? "").trim().toLowerCase();

  const filtered = CHINA_SPECIES.filter((species) => {
    if (current.group && species.group !== (current.group as ChinaGroup)) return false;
    if (current.habitat && !species.habitats.includes(current.habitat)) return false;
    if (current.status && species.conservation.status !== current.status) return false;
    if (current.province && !species.provinces.includes(current.province)) return false;
    if (!q) return true;
    const terms = q.split(/\s+/).filter(Boolean);
    if (terms.length === 0) return true;
    const haystack = [
      species.nameCn,
      species.englishName,
      species.scientificName,
      ...species.aliases,
      species.groupLabel,
      species.taxonomy.family,
      taxonCn(species.taxonomy.family),
      species.taxonomy.order,
      taxonCn(species.taxonomy.order),
    ]
      .join(" ")
      .toLowerCase();
    return terms.every((term) => haystack.includes(term));
  });

  const provinces = [...new Set(CHINA_SPECIES.flatMap((species) => species.provinces))];
  const statuses = [...new Set(CHINA_SPECIES.map((species) => species.conservation.status))];

  const PAGE_SIZE = 36;
  const requestedPage = Math.max(1, Number(current.page ?? "1") || 1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages);
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pageHref = (target: number) => hrefWith({ ...current, page: undefined }, { page: target > 1 ? String(target) : undefined });

  return (
    <div className="wc-frame">
      <WcHeader query={current.q ?? ""} />

      <div className="wc-page-head">
        <div>
          <p className="hb-hand">野外手册 · 物种图鉴</p>
          <h1 className="display mt-2 text-[38px] sm:text-[50px]">物种图鉴</h1>
          <p className="wc-prose mt-3">
            以中国特有脊椎动物为核心的数字档案馆。分类、分布与保护信息逐条标注来源；缺少数据的字段显示「暂无记录」，不做推测。
          </p>
        </div>
        <p className="text-[11px] leading-relaxed text-[var(--muted)]">
          当前收录 {filtered.length} / {CHINA_SPECIES.length} 种
          <br />
          严格特有 {CHINA_SPECIES.filter((s) => s.endemic === "strict").length} 种 · 主要分布于中国{" "}
          {CHINA_SPECIES.filter((s) => s.endemic === "main").length} 种
        </p>
      </div>

      <section className="mb-6 space-y-3 border-y border-[var(--line)] py-4" aria-label="筛选条件">
        <FilterRow label="纲">
          <FilterChip href={hrefWith(current, { group: undefined })} active={!current.group}>
            全部
          </FilterChip>
          {CHINA_GROUPS.map((group) => (
            <FilterChip
              key={group.key}
              href={hrefWith(current, { group: group.key })}
              active={current.group === group.key}
            >
              {group.label}
            </FilterChip>
          ))}
        </FilterRow>
        <FilterRow label="栖息环境">
          <FilterChip href={hrefWith(current, { habitat: undefined })} active={!current.habitat}>
            全部
          </FilterChip>
          {CHINA_HABITATS.map((habitat) => (
            <FilterChip
              key={habitat}
              href={hrefWith(current, { habitat })}
              active={current.habitat === habitat}
            >
              {habitat}
            </FilterChip>
          ))}
        </FilterRow>
        <FilterRow label="分布地区">
          <FilterChip href={hrefWith(current, { province: undefined })} active={!current.province}>
            全部
          </FilterChip>
          {provinces.map((province) => (
            <FilterChip
              key={province}
              href={hrefWith(current, { province })}
              active={current.province === province}
            >
              {province}
            </FilterChip>
          ))}
        </FilterRow>
        <FilterRow label="保护等级">
          <FilterChip href={hrefWith(current, { status: undefined })} active={!current.status}>
            全部
          </FilterChip>
          {statuses.map((status) => (
            <FilterChip
              key={status}
              href={hrefWith(current, { status })}
              active={current.status === status}
            >
              {status}
            </FilterChip>
          ))}
        </FilterRow>
      </section>

      {filtered.length === 0 ? (
        <div className="border border-[var(--line)] bg-[var(--surface)] p-10 text-center">
          <p className="display text-[24px]">没有匹配的物种</p>
          <p className="mt-2 text-[12px] text-[var(--muted)]">清空筛选或换一个关键词再试。</p>
          <Link href="/explore/encyclopedia" className="btn-outline mt-5">
            清空筛选
          </Link>
        </div>
      ) : (
        <>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {pageItems.map((species) => {
            const image = getSpeciesImage(species.slug, "hero") ?? getSpeciesImage(species.slug, "full");
            return (
              <article
                key={species.slug}
                className="group hb-card hb-card-lift relative overflow-hidden border border-[var(--line)] bg-[var(--surface)]"
                style={{ borderTop: `4px solid ${GROUP_ACCENT[species.group] ?? "var(--ink)"}` }}
              >
                <Link href={speciesHref(species.slug)} className="block">
                  <div className="relative aspect-[4/3] overflow-hidden bg-[var(--surface-2)]">
                    <WcPhoto
                      src={thumbUrl(image?.url) || null}
                      alt={`${species.nameCn} ${species.scientificName}`}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="transition-transform duration-700 group-hover:scale-[1.04]"
                      fallbackNote="待人工审核的授权图片"
                    />
                    {image && (
                      <p className="absolute bottom-2 left-0 right-0 truncate px-3 text-[8.5px] text-[#f3ede1]/80">
                        {image.source_name} · {image.author}
                      </p>
                    )}
                    <div className="absolute inset-x-0 bottom-0 translate-y-full bg-[color-mix(in_srgb,var(--ink)_92%,transparent)] px-3 py-2 text-[10px] text-[var(--paper)] transition-transform duration-300 group-hover:translate-y-0">
                      保护等级：{species.conservation.label}（{species.conservation.status}）
                      {species.conservation.year ? ` · ${species.conservation.year} 年` : " · 评估年份待核验"}
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-[9.5px] tracking-[0.18em] text-[var(--muted)]">NO. {CODE_BY_SLUG.get(species.slug)}</p>
                    <h2 className="mt-1 text-[19px] leading-snug">{species.nameCn}</h2>
                    <p className="mt-1 font-serif text-[11.5px] italic text-[var(--muted)]">
                      {species.scientificName}
                    </p>
                    <p className="mt-2 flex flex-wrap gap-1.5 text-[9.5px] text-[var(--ink-soft)]">
                      <span className={cn("hb-tag py-0 text-[9.5px]", GROUP_TAG[species.group])}>{species.groupLabel}</span>
                      <span className="border border-[var(--line)] px-1.5 py-0.5">
                        {species.endemic === "strict" ? "中国特有" : "主要分布于中国"}
                      </span>
                    </p>
                  </div>
                </Link>
                <div className="absolute right-3 top-3">
                  <ChinaFavoriteButton slug={species.slug} label={species.nameCn} />
                </div>
              </article>
            );
          })}
        </div>
        {totalPages > 1 && (
          <nav className="mt-6 flex flex-wrap items-center justify-center gap-3" aria-label="分页">
            {page > 1 ? (
              <Link href={pageHref(page - 1)} className="border border-[var(--line)] px-4 py-2 text-[11px] hover:border-[var(--forest)]">
                上一页
              </Link>
            ) : null}
            <span className="text-[11px] text-[var(--muted)]">
              第 {page} / {totalPages} 页 · 每页 {PAGE_SIZE} 种
            </span>
            {page < totalPages ? (
              <Link href={pageHref(page + 1)} className="border border-[var(--line)] px-4 py-2 text-[11px] hover:border-[var(--forest)]">
                下一页
              </Link>
            ) : null}
          </nav>
        )}
        </>
      )}

      <p className="mt-8 text-[10.5px] leading-relaxed text-[var(--muted)]">
        物种分类与分布为编辑整理，优先参照 Species 2000 China；SP2000 未开放详情接口的字段标记为「暂无记录」。
      </p>
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 w-[62px] shrink-0 text-[10px] tracking-[0.16em] text-[var(--muted)]">{label}</span>
      {children}
    </div>
  );
}

function FilterChip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={cn(
        "border px-2.5 py-1 text-[11px] transition-colors",
        active
          ? "border-[var(--forest)] bg-[var(--forest)] text-[#f3ede1]"
          : "border-[var(--line)] text-[var(--ink-soft)] hover:border-[var(--forest)]"
      )}
    >
      {children}
    </Link>
  );
}