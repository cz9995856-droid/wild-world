"use client";

import { useEffect, useMemo, useState } from "react";
import { DailyCard } from "@/components/wildchina/daily-card";
import type { CardSpecies } from "@/components/wildchina/daily-card";
import type { ChinaImage } from "@/lib/wildchina/media";

export interface AnimalMomentItem {
  species: CardSpecies;
  image: ChinaImage | null;
  placeholder?: string;
}

export function DailyRotator({ items, dateKey }: { items: AnimalMomentItem[]; dateKey: string }) {
  const groups = useMemo(() => {
    const map = new Map<string, AnimalMomentItem[]>();
    for (const item of items) {
      const key = item.species.group || "other";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    return [...map.values()];
  }, [items]);

  const [current, setCurrent] = useState<AnimalMomentItem | null>(items[0] ?? null);

  useEffect(() => {
    if (groups.length === 0) return;
    const group = groups[Math.floor(Math.random() * groups.length)];
    const next = group[Math.floor(Math.random() * group.length)];
    if (!next?.image?.url) {
      setCurrent(next);
      return;
    }
    let settled = false;
    const apply = () => {
      if (settled) return;
      settled = true;
      setCurrent(next);
    };
    const img = new Image();
    img.onload = apply;
    img.onerror = apply;
    img.src = next.image.url;
    const timer = window.setTimeout(apply, 2500);
    return () => {
      window.clearTimeout(timer);
      img.onload = null;
      img.onerror = null;
    };
  }, [groups]);

  if (!current) return null;

  return (
    <DailyCard
      species={current.species}
      image={current.image}
      placeholder={current.placeholder}
      dateKey={dateKey}
    />
  );
}