"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Menu, Moon, Search, Sun, X } from "lucide-react";
import { useUI } from "@/components/providers";
import { NAV_ITEMS } from "@/lib/site-config";
import { t } from "@/lib/i18n";

export function BrandMark({ light = false }: { light?: boolean }) {
  return (
    <svg width="34" height="34" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <circle cx="20" cy="20" r="18.5" stroke={light ? "#E9E2D3" : "currentColor"} strokeOpacity="0.5" />
      <path
        d="M11 27c2.6-6 5.2-9.4 8.2-11.8 1.7-1.4 3.6-2.4 5.6-3.2-.6 2-.5 3.8.2 5.5.9 2.3 2.5 4 4 6.2-3-1-5.6-2.5-7.8-4.6-1.4 3.6-3.4 6.1-6 7.9H11Z"
        fill={light ? "#E9E2D3" : "currentColor"}
      />
      <circle cx="26.4" cy="14.2" r="1.15" fill={light ? "#0B2118" : "#F5F1E7"} />
    </svg>
  );
}

export function SiteHeader({ initialLocale }: { initialLocale: "zh" | "en" }) {
  const { locale, setLocale, theme, toggleTheme, setSearchOpen, favorites } = useUI();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (locale !== initialLocale) {
      document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
    }
  }, [locale, initialLocale]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const isHome = pathname === "/";
  const solid = scrolled || !isHome || menuOpen;

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:bg-[var(--surface)] focus:px-4 focus:py-2 focus:text-sm"
      >
        跳到主要内容
      </a>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          solid
            ? "border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--paper)_92%,transparent)] backdrop-blur-md"
            : "border-b border-white/10 bg-transparent text-[#F5F1E7]"
        }`}
      >
        <div className="container-museum flex h-[68px] items-center justify-between gap-4 lg:h-[76px]">
          <Link href="/" className="group flex items-center gap-3" aria-label="WILD WORLD 首页">
            <span className={solid ? "text-[var(--forest)]" : "text-[#E9E2D3]"}>
              <BrandMark light={!solid} />
            </span>
            <span className="leading-none">
              <span className="display block text-[19px] tracking-[0.16em] sm:text-[21px]">WILD WORLD</span>
              <span
                className={`mt-1 hidden text-[8.5px] uppercase tracking-[0.34em] sm:block ${
                  solid ? "text-[var(--muted)]" : "text-[#E9E2D3]/70"
                }`}
              >
                Museum of Animal Life
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-6 xl:flex" aria-label="主导航">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`link-underline text-[12.5px] tracking-wide transition-opacity ${
                    active ? "opacity-100" : "opacity-75 hover:opacity-100"
                  }`}
                >
                  {t(`nav.${item.href.slice(1)}`, locale)}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex h-10 items-center gap-2 rounded-full px-2.5 text-[12px] transition-colors hover:bg-black/5 sm:px-3 dark:hover:bg-white/10"
              aria-label={t("nav.search", locale)}
            >
              <Search size={16} />
              <span className="hidden lg:inline text-[var(--muted)]">⌘K</span>
            </button>

            <Link
              href="/favorites"
              className="relative flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-black/5 dark:hover:bg-white/10"
              aria-label={t("nav.favorites", locale)}
            >
              <Heart size={16} />
              {favorites.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--amber)] px-1 text-[9px] font-semibold text-[#122019]">
                  {favorites.length}
                </span>
              )}
            </Link>

            <button
              onClick={() => setLocale(locale === "zh" ? "en" : "zh")}
              className="hidden h-10 items-center rounded-full border border-current/20 px-2.5 text-[11px] tracking-wider sm:flex"
              aria-label={locale === "zh" ? "Switch to English" : "切换到中文"}
              title={locale === "zh" ? "Switch to English" : "切换到中文"}
            >
              {locale === "zh" ? "EN" : "中文"}
            </button>

            <button
              onClick={toggleTheme}
              className="hidden h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-black/5 sm:flex dark:hover:bg-white/10"
              aria-label={theme === "dark" ? "切换到浅色模式" : "切换到深色模式"}
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <button
              onClick={() => setMenuOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full xl:hidden"
              aria-label={t("nav.menu", locale)}
              aria-expanded={menuOpen}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-[90] bg-[var(--paper)] xl:hidden">
          <div className="container-museum flex h-[68px] items-center justify-between">
            <span className="display text-[19px] tracking-[0.16em]">WILD WORLD</span>
            <button
              onClick={() => setMenuOpen(false)}
              className="flex h-10 w-10 items-center justify-center"
              aria-label={t("nav.close", locale)}
            >
              <X size={22} />
            </button>
          </div>
          <nav className="container-museum mt-6" aria-label="移动导航">
            {[...NAV_ITEMS, { href: "/conservation", label: "濒危动物", en: "Conservation" }, { href: "/timeline", label: "进化时间线", en: "Timeline" }, { href: "/ai", label: "AI 问答", en: "AI Q&A" }].map(
              (item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-baseline justify-between border-b border-[var(--line)] py-4"
                >
                  <span className="display text-[26px]">{locale === "zh" ? item.label : item.en}</span>
                  <span className="label text-[var(--muted)]">0{index + 1}</span>
                </Link>
              )
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => {
                  setLocale(locale === "zh" ? "en" : "zh");
                  setMenuOpen(false);
                }}
                className="btn-outline"
              >
                {locale === "zh" ? "English" : "中文"}
              </button>
              <button onClick={toggleTheme} className="btn-outline">
                {theme === "dark" ? "浅色模式" : "深色模式"}
              </button>
              <Link href="/favorites" className="btn-primary">
                <Heart size={14} /> {t("nav.favorites", locale)} ({favorites.length})
              </Link>
            </div>
            <p className="mt-8 max-w-sm text-[11px] leading-relaxed text-[var(--muted)]">
              全站内容标注数据来源与审核状态。未接入的接口不会显示为已连接，未核验的图片不会默认授权商用。
            </p>
          </nav>
        </div>
      )}
    </>
  );
}