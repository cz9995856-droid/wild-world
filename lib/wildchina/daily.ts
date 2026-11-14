import { CHINA_SPECIES, type ChinaSpecies } from "@/lib/wildchina/species";
import { hasHero } from "@/lib/wildchina/media";

const SHANGHAI_DATE = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Shanghai",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function shanghaiDateKey(date: Date = new Date()): string {
  return SHANGHAI_DATE.format(date);
}

export function dayNumber(dateKey: string): number {
  const [year, month, day] = dateKey.split("-").map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

function dailyPool(): ChinaSpecies[] {
  const withHero = CHINA_SPECIES.filter((s) => hasHero(s.slug));
  return withHero.length > 0 ? withHero : CHINA_SPECIES;
}

export function getDailySpecies(dateKey: string = shanghaiDateKey()): ChinaSpecies {
  const pool = dailyPool();
  return pool[dayNumber(dateKey) % pool.length];
}

export function getRecentPicks(dateKey: string = shanghaiDateKey(), days = 7): ChinaSpecies[] {
  const pool = dailyPool();
  const today = dayNumber(dateKey);
  const picks: ChinaSpecies[] = [];
  for (let offset = 0; offset < Math.min(days, pool.length); offset += 1) {
    picks.push(pool[((today - offset) % pool.length + pool.length) % pool.length]);
  }
  return picks;
}

export function getNextPick(dateKey: string = shanghaiDateKey()): ChinaSpecies {
  const pool = dailyPool();
  return pool[(dayNumber(dateKey) + 1) % pool.length];
}