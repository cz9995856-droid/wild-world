"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Heart, Moon, Search, Sun } from "lucide-react";
import { useUI } from "@/components/providers";
import { WcBrand } from "@/components/wildchina/wc-brand";

export function WcHeader({ query = "" }: { query?: string }) {
  const router = useRouter();
  const { theme, toggleTheme, favorites } = useUI();
  const [value, setValue] = useState(query);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = value.trim();
    router.push(q ? `/explore/encyclopedia?q=${encodeURIComponent(q)}` : "/explore/encyclopedia");
  }

  return (
    <header className="wc-nav">
      <WcBrand />

      <form className="wc-search" onSubmit={submit} role="search">
        <Search size={18} className="shrink-0 text-[var(--muted)]" aria-hidden="true" />
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="搜索中文名、别名或拉丁学名"
          aria-label="搜索物种中文名、别名或拉丁学名"
          name="q"
        />
        <button type="submit" className="shrink-0 text-[11px] tracking-[0.18em] text-[var(--muted)]">
          搜索
        </button>
      </form>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleTheme}
          className="wc-icon-btn"
          aria-label={theme === "dark" ? "切换到浅色模式" : "切换到深色模式"}
          title={theme === "dark" ? "切换到浅色模式" : "切换到深色模式"}
        >
          {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
        </button>
        <Link
          href="/explore/favorites"
          className="wc-icon-btn relative"
          aria-label="我的收藏"
          title="我的收藏"
        >
          <Heart size={17} />
          {favorites.length > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--clay)] px-1 text-[9px] font-semibold text-[#f3ede1]">
              {favorites.length}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}