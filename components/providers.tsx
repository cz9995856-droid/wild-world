"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Locale } from "@/lib/i18n";

type Theme = "light" | "dark";

interface UIContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  theme: Theme;
  toggleTheme: () => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  favorites: string[];
  toggleFavorite: (slug: string) => void;
  isFavorite: (slug: string) => boolean;
  clearFavorites: () => void;
}

const UIContext = createContext<UIContextValue | null>(null);

export function useUI(): UIContextValue {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used inside <Providers>");
  return ctx;
}

const FAVORITES_KEY = "ww_favorites";

export function Providers({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [theme, setTheme] = useState<Theme>("light");
  const [searchOpen, setSearchOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("ww_theme") as Theme | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const next = savedTheme ?? (prefersDark ? "dark" : "light");
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      const raw = window.localStorage.getItem(FAVORITES_KEY);
      if (raw) setFavorites(JSON.parse(raw));
    } catch {
      setFavorites([]);
    }
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    document.cookie = `ww_locale=${next}; path=/; max-age=31536000; samesite=lax`;
    const url = new URL(window.location.href);
    if (next === "en") url.searchParams.set("lang", "en");
    else url.searchParams.delete("lang");
    window.history.replaceState(null, "", url.toString());
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      document.documentElement.dataset.theme = next;
      window.localStorage.setItem("ww_theme", next);
      return next;
    });
  }, []);

  const toggleFavorite = useCallback((slug: string) => {
    setFavorites((prev) => {
      const next = prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug];
      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearFavorites = useCallback(() => {
    setFavorites([]);
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify([]));
  }, []);

  const isFavorite = useCallback((slug: string) => favorites.includes(slug), [favorites]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen((open) => !open);
      }
      if (event.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      theme,
      toggleTheme,
      searchOpen,
      setSearchOpen,
      favorites,
      toggleFavorite,
      isFavorite,
      clearFavorites,
    }),
    [locale, setLocale, theme, toggleTheme, searchOpen, favorites, toggleFavorite, isFavorite, clearFavorites]
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}