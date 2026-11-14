"use client";

import { Heart } from "lucide-react";
import { useUI } from "@/components/providers";
import { cn } from "@/lib/utils";

export function ChinaFavoriteButton({
  slug,
  className,
  label = "收藏",
}: {
  slug: string;
  className?: string;
  label?: string;
}) {
  const { isFavorite, toggleFavorite } = useUI();
  const active = isFavorite(slug);

  return (
    <button
      type="button"
      onClick={() => toggleFavorite(slug)}
      aria-pressed={active}
      aria-label={active ? `取消收藏 ${label}` : `收藏 ${label}`}
      className={cn(
        "inline-flex items-center gap-1.5 border border-[var(--line-strong)] bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] px-3 py-2 text-[11px] text-[var(--ink-soft)] backdrop-blur transition-colors hover:border-[var(--forest)]",
        active && "border-[var(--clay)] text-[var(--clay)]",
        className
      )}
    >
      <Heart size={13} fill={active ? "currentColor" : "none"} />
      {active ? "已收藏" : "收藏"}
    </button>
  );
}