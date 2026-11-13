"use client";

import { Heart } from "lucide-react";
import { useUI } from "@/components/providers";

export function FavoriteButton({
  slug,
  className = "",
  showLabel = true,
  variant = "outline",
}: {
  slug: string;
  className?: string;
  showLabel?: boolean;
  variant?: "outline" | "plain";
}) {
  const { isFavorite, toggleFavorite, locale } = useUI();
  const active = isFavorite(slug);

  return (
    <button
      onClick={() => toggleFavorite(slug)}
      aria-pressed={active}
      aria-label={active ? "取消收藏" : "收藏该物种"}
      className={
        variant === "outline"
          ? `btn ${active ? "border-[var(--clay)] bg-[var(--clay)] text-white" : "border-[var(--line-strong)]"} ${className}`
          : `inline-flex items-center gap-1.5 text-[11px] ${
              active ? "text-[var(--clay)]" : "text-[var(--muted)] hover:text-[var(--ink)]"
            } ${className}`
      }
    >
      <Heart size={variant === "outline" ? 15 : 13} fill={active ? "currentColor" : "none"} />
      {showLabel && (
        <span>{active ? (locale === "zh" ? "已收藏" : "Saved") : locale === "zh" ? "收藏" : "Save"}</span>
      )}
    </button>
  );
}

export function FavoriteCount() {
  const { favorites, locale } = useUI();
  return (
    <span className="text-[11px] text-[var(--muted)]">
      {favorites.length} {locale === "zh" ? "件收藏" : "saved"}
    </span>
  );
}