"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, X } from "lucide-react";

interface IndexItem {
  slug: string;
  cn: string;
  en: string;
  sci: string;
  aliases: string[];
  group: string;
  family: string;
  order: string;
}

let cached: IndexItem[] | null = null;
let pending: Promise<IndexItem[]> | null = null;

async function loadIndex(): Promise<IndexItem[]> {
  if (cached) return cached;
  if (!pending) {
    pending = fetch("/data/species-index.json")
      .then((r) => r.json())
      .then((data) => {
        cached = (data.items ?? []) as IndexItem[];
        return cached;
      })
      .catch(() => {
        pending = null;
        return [] as IndexItem[];
      });
  }
  return pending;
}

function normalize(text: string) {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

function match(items: IndexItem[], query: string): IndexItem[] {
  const terms = normalize(query).split(" ").filter(Boolean);
  if (terms.length === 0) return [];
  const scored: Array<{ item: IndexItem; score: number }> = [];

  for (const item of items) {
    const haystack = normalize([item.cn, item.en, item.sci, ...item.aliases, item.family, item.order, item.group].join(" "));
    if (!terms.every((term) => haystack.includes(term))) continue;

    const first = terms[0];
    const cn = normalize(item.cn);
    let score = 10;
    if (cn === first) score += 120;
    else if (cn.startsWith(first)) score += 80;
    else if (cn.includes(first)) score += 50;
    if (normalize(item.sci).includes(first)) score += 25;
    if (item.aliases.some((a) => normalize(a).includes(first))) score += 20;
    if (normalize(item.family) === first || normalize(item.order) === first) score += 30;
    scored.push({ item, score });
  }

  return scored.sort((a, b) => b.score - a.score).slice(0, 8).map((x) => x.item);
}

export function SearchSuggest({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);
  const [items, setItems] = useState<IndexItem[]>([]);
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(-1);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const query = value.trim();
    if (!query) {
      setItems([]);
      setOpen(false);
      return;
    }
    let active = true;
    const timer = window.setTimeout(async () => {
      const index = await loadIndex();
      if (!active) return;
      const result = match(index, query);
      setItems(result);
      setOpen(result.length > 0);
      setCursor(-1);
    }, 140);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [value]);

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (!boxRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function go(slug: string) {
    setOpen(false);
    router.push(`/explore/encyclopedia/${slug}`);
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = value.trim();
    if (!query) {
      router.push("/explore/encyclopedia");
      return;
    }
    if (cursor >= 0 && items[cursor]) {
      go(items[cursor].slug);
      return;
    }
    router.push(`/explore/encyclopedia?q=${encodeURIComponent(query)}`);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setCursor((c) => Math.min(c + 1, items.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setCursor((c) => Math.max(c - 1, -1));
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={boxRef} className="relative">
      <form className="wc-search" onSubmit={submit} role="search">
        <Search size={18} className="shrink-0 text-[var(--muted)]" aria-hidden="true" />
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onFocus={() => items.length > 0 && setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="搜索中文名、别名、学名或科名"
          aria-label="搜索物种中文名、别名、学名或科名"
          name="q"
          autoComplete="off"
        />
        {value ? (
          <button
            type="button"
            onClick={() => {
              setValue("");
              setOpen(false);
            }}
            className="shrink-0 p-1 text-[var(--muted)]"
            aria-label="清除搜索"
          >
            <X size={15} />
          </button>
        ) : null}
        <button type="submit" className="shrink-0 text-[11px] tracking-[0.18em] text-[var(--muted)]">
          搜索
        </button>
      </form>

      {open && items.length > 0 && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 border border-[var(--line-strong)] bg-[var(--surface)] shadow-[0_18px_40px_-24px_rgba(11,32,22,0.5)]">
          {items.map((item, i) => (
            <button
              key={item.slug}
              type="button"
              onMouseEnter={() => setCursor(i)}
              onClick={() => go(item.slug)}
              className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition-colors ${
                cursor === i ? "bg-[var(--forest)]/10" : "hover:bg-[var(--surface-2)]"
              }`}
            >
              <span className="min-w-0">
                <span className="block truncate text-[12.5px]">{item.cn}</span>
                <span className="mt-0.5 block truncate font-serif text-[10px] italic text-[var(--muted)]">{item.sci}</span>
              </span>
              <span className="shrink-0 text-[9.5px] text-[var(--muted)]">{item.family || item.group}</span>
            </button>
          ))}
          <Link
            href={`/explore/encyclopedia?q=${encodeURIComponent(value.trim())}`}
            className="block border-t border-[var(--line)] px-3 py-2 text-[10.5px] text-[var(--muted)] hover:text-[var(--ink)]"
          >
            查看全部「{value.trim()}」的结果 →
          </Link>
        </div>
      )}
    </div>
  );
}