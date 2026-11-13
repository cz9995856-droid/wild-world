"use client";

import Link from "next/link";
import { useUI } from "@/components/providers";
import type { Species } from "@/lib/types";
import { SpeciesCard } from "@/components/species-card";
import { EmptyState } from "@/components/ui/states";

export function FavoritesList({
  species,
  covers,
}: {
  species: Species[];
  covers: Record<string, string>;
}) {
  const { favorites, clearFavorites, locale } = useUI();
  const selected = favorites
    .map((slug) => species.find((s) => s.slug === slug))
    .filter((s): s is Species => Boolean(s));

  if (selected.length === 0) {
    return (
      <EmptyState
        title={locale === "zh" ? "收藏夹还是空的" : "Your collection is empty"}
        description={
          locale === "zh"
            ? "在任意物种档案页点击「收藏」，它会保存在本机浏览器中。收藏不上传服务器，也不用于画像或推荐。"
            : "Use the save button on any species page. Favourites are stored in this browser and are never uploaded."
        }
        action={
          <Link href="/encyclopedia" className="btn-primary">
            {locale === "zh" ? "去动物百科看看 →" : "Browse the encyclopedia →"}
          </Link>
        }
      />
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] pb-4">
        <p className="text-[12px] text-[var(--muted)]">
          {locationText(selected, favorites, locale)}
        </p>
        <button onClick={clearFavorites} className="btn-ghost">
          {locale === "zh" ? "清空收藏" : "Clear all"}
        </button>
      </div>
      <div className="grid gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {selected.map((s, i) => (
          <SpeciesCard key={s.slug} species={s} photo={covers[s.slug]} index={i} />
        ))}
      </div>
      <p className="mt-10 text-[10px] leading-relaxed text-[var(--muted)]">
        {locale === "zh"
          ? "提示：收藏仅保存在当前浏览器。清理浏览器数据会移除收藏；登录与云端同步尚未启用。"
          : "Note: favourites live in this browser only. Cloud sync and accounts are not enabled yet."}
      </p>
    </div>
  );
}

function locationText(selected: Species[], favorites: string[], locale: string) {
  if (locale !== "zh") return `${selected.length} of ${favorites.length} saved species available`;
  return `已收藏 ${selected.length} 件物种档案${favorites.length > selected.length ? "（部分条目已不在馆藏中）" : ""}`;
}