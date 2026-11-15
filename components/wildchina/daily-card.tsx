import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { ChinaSpecies } from "@/lib/wildchina/species";
import type { ChinaImage } from "@/lib/wildchina/media";
import { WcPhoto } from "@/components/wildchina/wc-photo";
import { taxonomyLine } from "@/lib/wildchina/taxonomy";

const NONE = "暂无记录";

export function DailyCard({
  species,
  image,
  dateKey,
}: {
  species: ChinaSpecies;
  image: ChinaImage | null;
  dateKey: string;
}) {
  return (
    <section className="wc-hero-card" aria-label="动物时刻">
      <div className="wc-hero-photo">
        <WcPhoto
          src={image?.url ?? null}
          alt={`${species.nameCn} ${species.scientificName}`}
          priority
          sizes="(max-width: 1023px) 100vw, 55vw"
          fallbackLabel="动物时刻影像待补充"
          fallbackNote="该物种尚未取得可核验的主视觉照片"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0b2016]/70 via-transparent to-[#0b2016]/25" />
        <div className="absolute left-0 top-0 p-5 text-[#f3ede1] sm:p-7">
          <p className="wc-kicker text-[#f3ede1]/70">动物时刻</p>
          <p className="mt-1 text-[15px] tracking-[0.24em]">{species.groupLabel}</p>
        </div>
        {image && (
          <p className="absolute bottom-3 left-0 right-0 px-5 text-[9px] text-[#f3ede1]/75 sm:px-7">
            影像：{image.source_name} · {image.author} · {image.license}
          </p>
        )}
      </div>

      <div className="wc-hero-panel">
        <div className="flex items-center justify-between gap-4">
          <span className="wc-kicker">物种档案</span>
          <span className="text-[10px] text-[var(--muted)]">{dateKey} · 北京时间</span>
        </div>

        <div className="mt-6 sm:mt-8">
          <p className="wc-field-label">中文名</p>
          <h1 className="display mt-2 text-[40px] leading-[0.98] sm:text-[54px] lg:text-[62px]">
            {species.nameCn}
          </h1>
          <p className="mt-3 font-serif text-[14px] italic text-[var(--muted)]">{species.scientificName}</p>
        </div>

        <dl className="mt-5 flex-1">
          {species.aliases.length > 0 && (
            <div className="wc-field">
              <dt className="wc-field-label">别名</dt>
              <dd className="wc-field-value mt-1">{species.aliases.join(" / ")}</dd>
            </div>
          )}
          <div className="wc-field">
            <dt className="wc-field-label">分类系统</dt>
            <dd className="wc-field-value mt-1">{taxonomyLine(species.taxonomy) || NONE}</dd>
          </div>
          <div className="wc-field">
            <dt className="wc-field-label">分布地</dt>
            <dd className="wc-field-value mt-1">{species.distribution || NONE}</dd>
          </div>
          <div className="wc-field">
            <dt className="wc-field-label">更多</dt>
            <dd className="mt-1 flex flex-wrap gap-2">
              <Link href={`/explore/encyclopedia/${species.slug}`} className="btn-primary">
                查看完整物种档案 <ArrowUpRight size={14} />
              </Link>
              <Link href={`/explore/lab?species=${species.slug}#three-d`} className="btn-outline">
                进入生命实验室
              </Link>
            </dd>
          </div>
        </dl>

        <div className="mt-6 flex justify-end">
          <Link href="/explore" className="btn-primary">
            探索更多 <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}