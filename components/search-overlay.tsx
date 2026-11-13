"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, CornerDownLeft, Loader2, Search, X } from "lucide-react";
import { useUI } from "@/components/providers";

interface Hit {
  type: "species" | "news" | "page";
  id: string;
  title: string;
  subtitle: string;
  href: string;
  badge?: string;
}

const TYPE_LABEL: Record<Hit["type"], string> = {
  species: "物种",
  news: "新闻",
  page: "专区",
};

const RECENT_KEY = "ww_recent_searches";

export function SearchOverlay() {
  const { searchOpen, setSearchOpen, locale } = useUI();
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!searchOpen) return;
    setQuery("");
    setHits([]);
    setActive(0);
    try {
      const raw = window.localStorage.getItem(RECENT_KEY);
      setRecent(raw ? JSON.parse(raw) : []);
    } catch {
      setRecent([]);
    }
    const t = window.setTimeout(() => inputRef.current?.focus(), 60);
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = "";
    };
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    if (query.trim().length < 1) {
      setHits([]);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=12`, {
          signal: controller.signal,
        });
        if (res.ok) {
          const data = (await res.json()) as { results: Hit[] };
          setHits(data.results ?? []);
          setActive(0);
        }
      } catch {
        // aborted or offline; keep previous results
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query, searchOpen]);

  function remember(term: string) {
    const next = [term, ...recent.filter((r) => r !== term)].slice(0, 6);
    setRecent(next);
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  }

  function go(hit: Hit) {
    remember(query);
    setSearchOpen(false);
    window.location.href = hit.href;
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => Math.min(i + 1, hits.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter") {
      if (hits[active]) {
        go(hits[active]);
      } else if (query.trim()) {
        remember(query);
        setSearchOpen(false);
        window.location.href = `/search?q=${encodeURIComponent(query)}`;
      }
    }
  }

  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!searchOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-[rgba(8,23,17,0.62)] px-4 pt-[8vh] backdrop-blur-sm sm:pt-[12vh]"
      role="dialog"
      aria-modal="true"
      aria-label={locale === "zh" ? "全站搜索" : "Site search"}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setSearchOpen(false);
      }}
    >
      <div className="w-full max-w-2xl overflow-hidden rounded-sm border border-[var(--line-strong)] bg-[var(--surface)] shadow-2xl">
        <div className="flex items-center gap-3 border-b border-[var(--line)] px-4">
          <Search size={18} className="text-[var(--muted)]" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={locale === "zh" ? "搜索物种、学名、新闻或专区…" : "Search species, scientific names, news…"}
            className="h-14 flex-1 bg-transparent text-[15px] outline-none placeholder:text-[var(--muted)]"
            aria-label={locale === "zh" ? "搜索关键词" : "Search terms"}
          />
          {loading && <Loader2 size={16} className="animate-spin text-[var(--muted)]" />}
          <button
            onClick={() => setSearchOpen(false)}
            className="rounded-xs border border-[var(--line)] p-1.5 text-[var(--muted)] hover:text-[var(--ink)]"
            aria-label={locale === "zh" ? "关闭搜索" : "Close search"}
          >
            <X size={15} />
          </button>
        </div>

        <div ref={listRef} className="max-h-[58vh] overflow-y-auto">
          {!query && (
            <div className="p-5">
              {recent.length > 0 && (
                <>
                  <p className="label mb-3 text-[var(--muted)]">最近搜索</p>
                  <div className="mb-5 flex flex-wrap gap-2">
                    {recent.map((term) => (
                      <button
                        key={term}
                        onClick={() => setQuery(term)}
                        className="chip hover:border-[var(--ink)] hover:text-[var(--ink)]"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </>
              )}
              <p className="label mb-3 text-[var(--muted)]">快速进入</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {[
                  { label: "动物百科", href: "/encyclopedia" },
                  { label: "新闻中心", href: "/news" },
                  { label: "互动实验室", href: "/lab" },
                  { label: "全球地图", href: "/map" },
                  { label: "濒危专题", href: "/conservation" },
                  { label: "AI 问答", href: "/ai" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSearchOpen(false)}
                    className="rounded-xs border border-[var(--line)] px-3 py-2.5 text-[12px] hover:border-[var(--line-strong)]"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {query && !loading && hits.length === 0 && (
            <div className="px-5 py-10 text-center">
              <p className="text-[14px]">未找到与「{query}」匹配的内容。</p>
              <p className="mt-1 text-[12px] text-[var(--muted)]">
                可尝试中文名、英文名或拉丁学名。馆藏尚未收录的物种不会被编造。
              </p>
            </div>
          )}

          {hits.map((hit, index) => (
            <button
              key={hit.id}
              data-index={index}
              onMouseEnter={() => setActive(index)}
              onClick={() => go(hit)}
              className={`flex w-full items-center gap-3 border-b border-[var(--line)] px-4 py-3 text-left transition-colors ${
                active === index ? "bg-[var(--surface-2)]" : ""
              }`}
            >
              <span className="label w-8 shrink-0 text-[var(--muted)]">{TYPE_LABEL[hit.type]}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13.5px] font-medium">{hit.title}</span>
                <span className="block truncate text-[11px] text-[var(--muted)]">{hit.subtitle}</span>
              </span>
              {hit.badge && <span className="chip shrink-0">{hit.badge}</span>}
              {active === index ? (
                <CornerDownLeft size={14} className="text-[var(--muted)]" />
              ) : (
                <ArrowRight size={14} className="text-transparent" />
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-[var(--line)] bg-[var(--surface-2)] px-4 py-2.5">
          <span className="label text-[var(--muted)]">⌘K 打开 · ESC 关闭 · ↑↓ 选择</span>
          {query && (
            <Link
              href={`/search?q=${encodeURIComponent(query)}`}
              onClick={() => {
                remember(query);
                setSearchOpen(false);
              }}
              className="text-[11px] text-[var(--muted)] hover:text-[var(--ink)]"
            >
              查看全部结果 →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}