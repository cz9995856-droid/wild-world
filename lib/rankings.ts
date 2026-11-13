import type { Species } from "@/lib/types";

export interface RankingEntry {
  species: Species;
  value: number;
  display: string;
}

export interface RankingBoard {
  id: string;
  title: string;
  subtitle: string;
  unit: string;
  caveat: string;
  source: string;
  source_url: string;
  entries: RankingEntry[];
}

function board(
  id: string,
  title: string,
  subtitle: string,
  unit: string,
  caveat: string,
  source: string,
  source_url: string,
  species: Species[],
  pick: (s: Species) => number | null,
  display: (v: number, s: Species) => string,
  direction: "desc" | "asc" = "desc"
): RankingBoard {
  const entries = species
    .map((s) => ({ species: s, value: pick(s) }))
    .filter((x): x is { species: Species; value: number } => typeof x.value === "number")
    .sort((a, b) => (direction === "desc" ? b.value - a.value : a.value - b.value))
    .map((x) => ({ species: x.species, value: x.value, display: display(x.value, x.species) }))
    .slice(0, 10);
  return { id, title, subtitle, unit, caveat, source, source_url, entries };
}

export function buildRankings(species: Species[]): RankingBoard[] {
  return [
    board(
      "weight",
      "体重之最",
      "现存物种中的最大体重记录（成体上限）",
      "公斤",
      "不同物种的体重数据来源与测量方法不同；蓝鲸为海洋哺乳动物，与陆生物种并列仅作科普参考。",
      "馆藏整理（参考 IUCN / ADW / 官方物种资料）",
      "https://animaldiversity.org/",
      species,
      (s) => s.weight.max_kg,
      (v) => (v >= 1000 ? `${(v / 1000).toFixed(1)} 吨` : `${v} 公斤`)
    ),
    board(
      "length",
      "体长之最",
      "以成体最大体长排序（厘米）",
      "厘米",
      "体长定义不一致：鱼类与鲸类常计全长，鸟类多用体长，昆虫以翅展或体长计。本站仅在标注字段内比较。",
      "馆藏整理（参考 ADW / 官方物种资料）",
      "https://animaldiversity.org/",
      species,
      (s) => s.size.length_cm?.[1] ?? null,
      (v) => `${v} 厘米`
    ),
    board(
      "lifespan",
      "寿命之最",
      "以成体寿命上限排序（年）",
      "年",
      "圈养与野外寿命差异很大；部分物种寿命数据稀少。本站采用上限估计，不代表平均寿命。",
      "馆藏整理（参考 ADW / IUCN）",
      "https://www.iucnredlist.org/",
      species,
      (s) => s.lifespan_years[1],
      (v) => `${v} 年`
    ),
    board(
      "speed",
      "速度之最",
      "以公开记录的最大运动速度排序（km/h）",
      "km/h",
      "速度口径不同：游隼为俯冲极值，陆生哺乳类为短时冲刺，企鹅与海龟为游泳速度。不可直接横向比较生态意义。",
      "馆藏整理（参考 The Peregrine Fund / ADW）",
      "https://peregrinefund.org/",
      species,
      (s) => s.speed_kmh,
      (v) => `${v} km/h`
    ),
    board(
      "endangered",
      "最濒危",
      "按 IUCN 保护等级排序（极危在前）",
      "等级",
      "等级为物种级评估结果，评估年份不同；亚种与区域种群可能另有结论。排序不是数量多少的排名。",
      "IUCN Red List（编辑整理，待 API 接入复核）",
      "https://www.iucnredlist.org/",
      species,
      (s) => {
        const order: Record<string, number> = { CR: 5, EN: 4, VU: 3, NT: 2, LC: 1, DD: 0, NE: 0 };
        return order[s.conservation.status] ?? null;
      },
      (v, s) => `${s.conservation.status_label}（${s.conservation.status}）`
    ),
  ];
}

export function extremeSpecies(species: Species[], key: "weight" | "lifespan" | "speed" | "endangered"): Species | null {
  const boards = buildRankings(species);
  const id = key === "weight" ? "weight" : key;
  const found = boards.find((b) => b.id === id);
  return found?.entries[0]?.species ?? null;
}