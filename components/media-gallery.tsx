"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Download, ExternalLink, Info, X } from "lucide-react";
import type { MediaAsset } from "@/lib/types";

export function MediaGallery({ assets, title }: { assets: MediaAsset[]; title: string }) {
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((i) => (i === null ? null : (i + 1) % assets.length));
      if (e.key === "ArrowLeft") setOpen((i) => (i === null ? null : (i - 1 + assets.length) % assets.length));
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, assets.length]);

  if (assets.length === 0) return null;
  const current = open === null ? null : assets[open];

  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3">
        {assets.map((asset, index) => (
          <button
            key={asset.id}
            onClick={() => setOpen(index)}
            className={`group relative overflow-hidden rounded-xs bg-[var(--surface-2)] ${
              index === 0 ? "col-span-2 row-span-2 aspect-[4/3] lg:col-span-2 lg:row-span-2" : "aspect-square"
            }`}
            aria-label={`打开图片：${asset.title}`}
          >
            <Image
              src={asset.url}
              alt={`${asset.title} · 摄影：${asset.author}`}
              fill
              sizes={index === 0 ? "(max-width: 1024px) 100vw, 60vw" : "(max-width: 1024px) 50vw, 30vw"}
              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <span className="absolute bottom-2 left-2 right-2 hidden text-left text-[10px] text-white/90 group-hover:block">
              © {asset.author} · {asset.license}
            </span>
          </button>
        ))}
      </div>

      {current && (
        <div
          className="fixed inset-0 z-[120] flex flex-col bg-[rgba(5,13,9,0.96)] text-[#EDE8DC]"
          role="dialog"
          aria-modal="true"
          aria-label={`${title} 图片查看器`}
        >
          <div className="flex items-center justify-between border-b border-white/15 px-4 py-3 sm:px-6">
            <div className="min-w-0">
              <p className="truncate text-[13px]">{current.title}</p>
              <p className="mt-0.5 truncate text-[10px] text-white/55">
                {open! + 1} / {assets.length} · © {current.author} · {current.license}
              </p>
            </div>
            <button
              onClick={() => setOpen(null)}
              className="ml-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 hover:bg-white/10"
              aria-label="关闭图片查看器"
            >
              <X size={16} />
            </button>
          </div>

          <div className="relative flex flex-1 items-center justify-center overflow-hidden p-3 sm:p-8">
            <div className="relative h-full w-full">
              <Image
                src={current.url}
                alt={`${current.title} · 摄影：${current.author}`}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </div>
            <button
              onClick={() => setOpen((i) => (i === null ? null : (i - 1 + assets.length) % assets.length))}
              className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 hover:bg-black/70 sm:left-5"
              aria-label="上一张"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setOpen((i) => (i === null ? null : (i + 1) % assets.length))}
              className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 hover:bg-black/70 sm:right-5"
              aria-label="下一张"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="grid gap-3 border-t border-white/15 px-4 py-4 text-[11px] sm:grid-cols-[1fr_auto] sm:px-6">
            <div className="space-y-1 text-white/65">
              <p className="flex items-center gap-1.5">
                <Info size={12} />
                来源：{current.source_name} · 记录 ID：{current.source_record_id}
              </p>
              <p>
                许可：{current.license}
                {current.license_url && (
                  <a href={current.license_url} target="_blank" rel="noreferrer" className="ml-1 underline">
                    许可文本
                  </a>
                )}
                {" · "}
                {current.commercial_use ? "许可允许商业使用" : "仅限非商业使用"}
                {" · "}
                {current.derivatives_allowed ? "允许演绎" : "不允许演绎"}
              </p>
              <p className="text-white/45">获取时间：{current.retrieved_at.slice(0, 10)} · 许可已按来源元数据记录，下载前请自行复核。</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={current.source_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xs border border-white/25 px-3 py-2 hover:bg-white/10"
              >
                <ExternalLink size={12} /> 来源页
              </a>
              {current.download_allowed ? (
                <a
                  href={current.url}
                  download
                  className="inline-flex items-center gap-1.5 rounded-xs bg-[#EDE8DC] px-3 py-2 text-[#0B2118] hover:bg-white"
                >
                  <Download size={12} /> 下载
                </a>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-xs border border-white/20 px-3 py-2 text-white/50">
                  <Download size={12} /> 该许可不提供直接下载
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}