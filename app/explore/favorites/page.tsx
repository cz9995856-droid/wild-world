"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { WcHeader } from "@/components/wildchina/wc-header";
import { WcPhoto } from "@/components/wildchina/wc-photo";
import { ChinaFavoriteButton } from "@/components/wildchina/china-favorite-button";
import { useEffect, useState } from "react";
import { useUI } from "@/components/providers";

export default function FavoritesPage() {
  const { favorites, clearFavorites } = useUI();
  const [items, setItems] = useState<Array<{ slug: string; cn: string; sci: string; thumb: string }>>([]);

  useEffect(() => {
    fetch("/data/species-lite.json")
      .then((res) => res.json())
      .then((data) => setItems(data.items ?? []))
      .catch(() => undefined);
  }, []);

  const saved = items.filter((species) => favorites.includes(species.slug));

  return (
    <div className="wc-frame">
      <WcHeader />

      <div className="wc-page-head">
        <div>
          <p className="wc-kicker">My Collection</p>
          <h1 className="display mt-2 text-[38px] sm:text-[50px]">我的收集册</h1>
          <p className="wc-prose mt-3">收藏保存在当前浏览器本地，不会上传到服务器。</p>
        </div>
        {saved.length > 0 && (
          <button onClick={clearFavorites} className="btn-outline">清空收藏</button>
        )}
      </div>

      {saved.length === 0 ? (
        <div className="border border-[var(--line)] bg-[var(--surface)] p-10 text-center">
          <Heart size={22} className="mx-auto text-[var(--clay)]" />
          <p className="display mt-4 text-[24px]">还没有收藏物种</p>
          <p className="mt-2 text-[12px] text-[var(--muted)]">在动物卡上点「我见过它」，就会进收集册。</p>
          <Link href="/explore/encyclopedia" className="btn-primary mt-5">前往物种图鉴</Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {saved.map((species) => {
            const image = { url: species.thumb || null };
            return (
              <article key={species.slug} className="relative border border-[var(--line)] bg-[var(--surface)]">
                <Link href={`/explore/encyclopedia/${species.slug}`}>
                  <div className="relative aspect-[16/10] overflow-hidden bg-[var(--surface-2)]">
                    <WcPhoto src={image?.url ?? null} alt={species.cn} sizes="33vw" />
                  </div>
                  <div className="p-4">
                    <p className="text-[18px]">{species.cn}</p>
                    <p className="mt-1 font-serif text-[11px] italic text-[var(--muted)]">{species.sci}</p>
                  </div>
                </Link>
                <div className="absolute right-3 top-3">
                  <ChinaFavoriteButton slug={species.slug} label={species.cn} />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}