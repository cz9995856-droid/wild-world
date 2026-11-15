"use client";

import { useEffect, useState } from "react";
import { DailyCard } from "@/components/wildchina/daily-card";
import type { CardSpecies } from "@/components/wildchina/daily-card";
import type { ChinaImage } from "@/lib/wildchina/media";

export interface AnimalMomentItem {
  species: CardSpecies;
  image: ChinaImage | null;
}

export function DailyRotator({ items, dateKey }: { items: AnimalMomentItem[]; dateKey: string }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    setIndex(Math.floor(Math.random() * items.length));
  }, [items.length]);

  const current = items[index] ?? items[0];
  if (!current) return null;

  return <DailyCard species={current.species} image={current.image} dateKey={dateKey} />;
}