"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ExternalLink, Play } from "lucide-react";
import type { VideoEntry } from "@/lib/types";

export function VideoBrowser({ videos, credits }: { videos: VideoEntry[]; credits?: Record<string, { author: string; license: string; source_url: string }> }) {
  const [producer, setProducer] = useState("all");
  const [region, setRegion] = useState("all");
  const [query, setQuery] = useState("");

  const producers = Array.from(new Set(videos.map((v) => v.producer)));
  const regions = Array.from(new Set(videos.map((v) => v.region)));

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return videos.filter((v) => {
      if (producer !== "all" && v.producer !== producer) return false;
      if (region !== "all" && v.region !== region) return false;
      if (q && !`${v.title_cn} ${v.title_en} ${v.description} ${v.producer}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [videos, producer, region, query]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 border border-[var(--line)] bg-[var(--surface-2)] p-4 sm:flex-row sm:items-center">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索影片、机构或主题…"
          className="field flex-1"
          aria-label="搜索影片"
        />
        <select value={producer} onChange={(e) => setProducer(e.target.value)} className="select-field sm:w-52" aria-label="制作机构">
          <option value="all">全部制作机构</option>
          {producers.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <select value={region} onChange={(e) => setRegion(e.target.value)} className="select-field sm:w-32" aria-label="地区">
          <option value="all">全部地区</option>
          {regions.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((v) => (
          <article key={v.id} className="group border border-[var(--line)] bg-[var(--surface)]">
            <a
              href={v.official_url}
              target="_blank"
              rel="noreferrer"
              className="relative block aspect-[16/9] overflow-hidden"
              aria-label={`前往 ${v.producer} 官方页面观看`}
            >
              <Image
                src={v.cover_url}
                alt=""
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-[#07120c]/40" />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/40 bg-black/30 text-white backdrop-blur transition-transform group-hover:scale-110">
                  <Play size={18} className="ml-0.5" />
                </span>
              </span>
              <span className="absolute left-3 top-3 border border-white/30 bg-black/30 px-2 py-1 text-[8.5px] uppercase tracking-widest text-white backdrop-blur">
                Official link only
              </span>
              {credits?.[v.cover_url] && (
                <span className="absolute bottom-2 left-3 text-[8px] text-white/55">
                  封面 © {credits[v.cover_url].author} · {credits[v.cover_url].license}
                </span>
              )}
            </a>
            <div className="p-5">
              <p className="text-[9px] uppercase tracking-[0.18em] text-[var(--muted)]">
                {v.producer} · {v.region} · {v.year}
              </p>
              <h3 className="display mt-2 text-[21px] leading-snug">{v.title_cn}</h3>
              <p className="mt-1 font-serif text-[11px] italic text-[var(--muted)]">{v.title_en}</p>
              <p className="mt-3 line-clamp-3 text-[11px] leading-relaxed text-[var(--muted)]">{v.description}</p>
              <dl className="mt-4 grid grid-cols-2 gap-2 border-t border-[var(--line)] pt-3 text-[9.5px]">
                <div>
                  <dt className="text-[var(--muted)]">时长口径</dt>
                  <dd className="mt-0.5">{v.duration}</dd>
                </div>
                <div>
                  <dt className="text-[var(--muted)]">关联物种</dt>
                  <dd className="mt-0.5">{v.species_slugs.length} 种</dd>
                </div>
              </dl>
              <a
                href={v.official_url}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-[11px] underline"
              >
                官方观看入口 <ExternalLink size={11} />
              </a>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-10 border border-[var(--line)] bg-[var(--surface)] p-5">
        <p className="label text-[var(--muted)]">为什么没有内嵌播放器</p>
        <p className="mt-2 max-w-3xl text-[11px] leading-relaxed text-[var(--muted)]">
          本馆未获得这些纪录片的转载或嵌入授权，因此只提供官方观看入口，不下载、不转存、不镜像完整影片。
          若未来取得明确的嵌入许可，会在条目上逐条标注并启用播放器。纪录片版权归各制作机构所有。
        </p>
      </div>
    </div>
  );
}