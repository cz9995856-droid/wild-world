"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Moon, Sun } from "lucide-react";
import { useUI } from "@/components/providers";
import { WcBrand } from "@/components/wildchina/wc-brand";
import { SearchSuggest } from "@/components/wildchina/search-suggest";

const NAV = [
  { href: "/explore/encyclopedia", label: "发现" },
  { href: "/explore/collection", label: "收集" },
  { href: "/explore/lab", label: "挑战" },
];

export function WcHeader({ query = "" }: { query?: string }) {
  const { theme, toggleTheme, favorites } = useUI();
  const pathname = usePathname();

  return (
    <div className="wc-header-sticky">
      <header className="wc-nav">
        <WcBrand />

        <SearchSuggest initialQuery={query} />

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

      <nav className="wc-subnav" aria-label="主要展区">
        {NAV.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>

      <nav className="hb-bottom-nav" aria-label="移动端主导航">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={pathname?.startsWith(item.href) ? "page" : undefined}
          >
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}