"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, ImageIcon, Play, Search } from "lucide-react";
import { useUI } from "@/components/providers";

export interface HeroCredit {
  author: string;
  license: string;
  source_url: string;
  source_name: string;
  commercial_use: boolean;
}

export function HomeHero({
  images,
  credits,
  videoUrl,
  poster,
  videoCredit,
  newsCount,
  sourceCount,
  speciesCount,
}: {
  images: string[];
  credits: Array<HeroCredit | null>;
  videoUrl: string;
  poster: string;
  videoCredit: string;
  newsCount: number;
  sourceCount: number;
  speciesCount: number;
}) {
  const { locale } = useUI();
  const [index, setIndex] = useState(0);
  const [posterFailed, setPosterFailed] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [paused, setPaused] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasVideo = Boolean(videoUrl);
  const slides = images.length > 0 ? images : poster ? [poster] : [];

  useEffect(() => {
    if (hasVideo || slides.length < 2 || paused) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [hasVideo, slides.length, paused]);

  useEffect(() => {
    if (hasVideo && videoRef.current && !videoFailed) {
      videoRef.current.play().catch(() => setVideoFailed(true));
    }
  }, [hasVideo, videoFailed]);

  const currentCredit = credits[index] ?? credits[0] ?? null;

  function scrollToNews() {
    document.getElementById("news")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section
      className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden bg-[#081711] text-[#F5F1E7]"
      aria-label="WILD WORLD 首屏"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="absolute inset-0">
        {hasVideo && !videoFailed ? (
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            src={videoUrl}
            poster={poster}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            onError={() => setVideoFailed(true)}
            aria-hidden="true"
          />
        ) : (
          slides.map((src, i) => (
            <Image
              key={src}
              src={src}
              alt={i === index ? "WILD WORLD 首屏野生动物影像" : ""}
              fill
              priority={i === 0}
              sizes="100vw"
              quality={82}
              onError={i === 0 ? () => setPosterFailed(true) : undefined}
              className={`object-cover transition-opacity duration-[1800ms] ease-out ${
                i === index ? "opacity-100 animate-kenburns" : "opacity-0"
              }`}
            />
          ))
        )}
        {posterFailed && slides.length === 0 && (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#0B2118] to-[#081711]">
            <span className="text-[11px] uppercase tracking-[0.3em] text-white/40">Image unavailable</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#061009] via-[#061009]/55 to-[#061009]/25" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgba(194,155,74,0.16),transparent_55%)]" />
        <div className="absolute inset-0 grain" />
      </div>

      <div className="relative z-10 container-museum flex flex-1 flex-col justify-end pb-24 pt-32 sm:pb-28 lg:pb-32">
        <div className="grid gap-10 lg:grid-cols-[1.55fr_0.45fr] lg:items-end">
          <div>
            <div className="mb-6 flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-white/65">
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#C29B4A]" />
                Global Digital Museum
              </span>
              <span className="h-[1px] w-8 bg-white/30" />
              <span>Est. 2026</span>
            </div>

            <h1 className="display text-[54px] leading-[0.92] tracking-[0.02em] sm:text-[82px] lg:text-[112px] xl:text-[128px]">
              WILD
              <br className="sm:hidden" />
              <span className="hidden sm:inline"> </span>
              WORLD
            </h1>

            <p className="mt-5 max-w-xl text-[14px] leading-relaxed text-white/75 sm:text-[15px]">
              {locale === "zh"
                ? "看见野性的边界。以可追溯的数据、逐张核验的影像许可与沉浸式叙事，走进地球上的动物世界。"
                : "See the edges of the wild. A museum built on traceable data, individually verified image licenses and immersive storytelling."}
            </p>

            <form
              action="/search"
              method="get"
              className="mt-8 flex max-w-xl items-center gap-0 border border-white/25 bg-black/20 backdrop-blur-md"
              role="search"
            >
              <Search size={17} className="ml-4 shrink-0 text-white/60" />
              <input
                type="search"
                name="q"
                placeholder={
                  locale === "zh" ? "搜索物种、学名或关键词" : "Search species, scientific names or keywords"
                }
                className="h-12 min-w-0 flex-1 bg-transparent px-3 text-[13px] text-white outline-none placeholder:text-white/45"
                aria-label={locale === "zh" ? "全站搜索" : "Site search"}
              />
              <button
                type="submit"
                className="mr-1 flex h-10 items-center gap-1.5 bg-[#F5F1E7] px-4 text-[12px] font-medium text-[#0B2118] transition-colors hover:bg-white"
              >
                {locale === "zh" ? "搜索" : "Search"}
                <ArrowRight size={14} />
              </button>
            </form>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] text-white/50">
              <Link href="/encyclopedia" className="link-underline hover:text-white">
                {speciesCount} 件物种档案 →
              </Link>
              <Link href="/news" className="link-underline hover:text-white">
                {newsCount} 条真实新闻 →
              </Link>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-[#8FBF9A]" />
                {sourceCount} 个数据源已接入
              </span>
            </div>
          </div>

          <div className="hidden flex-col items-end gap-6 text-right lg:flex">
            <div className="flex items-center gap-2 border border-white/20 bg-black/20 px-3 py-2 text-[9.5px] uppercase tracking-[0.16em] text-white/70 backdrop-blur">
              {hasVideo && !videoFailed ? <Play size={11} /> : <ImageIcon size={11} />}
              {hasVideo && !videoFailed
                ? "Licensed film · muted loop"
                : locale === "zh"
                  ? "授权摄影影像序列"
                  : "Licensed photo sequence"}
            </div>
            {currentCredit && (
              <div className="max-w-[230px] text-[9.5px] leading-relaxed text-white/45">
                <p>
                  © {currentCredit.author} · {currentCredit.license}
                </p>
                <a
                  href={currentCredit.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-block underline underline-offset-2 hover:text-white/80"
                >
                  {currentCredit.source_name} 来源页
                </a>
              </div>
            )}
            <div className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-white/50">
              {slides.map((src, i) => (
                <button
                  key={src}
                  onClick={() => setIndex(i)}
                  aria-label={`切换到第 ${i + 1} 张首屏影像`}
                  className={`h-[2px] transition-all ${i === index ? "w-8 bg-white" : "w-4 bg-white/35"}`}
                />
              ))}
              <span className="ml-2">
                {String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
              </span>
            </div>
            {!hasVideo && (
              <p className="max-w-[230px] text-[9px] leading-relaxed text-white/35">
                {locale === "zh"
                  ? "未配置授权视频源；首屏使用逐张署名的授权摄影序列。可在后台配置合法视频。"
                  : "No licensed video configured. The hero uses credited licensed photography; a licensed video can be configured in admin."}
              </p>
            )}
            {hasVideo && videoCredit && <p className="max-w-[230px] text-[9px] text-white/35">{videoCredit}</p>}
          </div>
        </div>
      </div>

      <button
        onClick={scrollToNews}
        className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-[9px] uppercase tracking-[0.3em] text-white/65 transition-colors hover:text-white sm:bottom-8"
        aria-label={locale === "zh" ? "向下滚动到新闻中心" : "Scroll down to the newsroom"}
      >
        <span>Scroll to explore</span>
        <span className="animate-floaty">
          <ArrowDown size={16} />
        </span>
      </button>
    </section>
  );
}