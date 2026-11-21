import type { QuizQuestion } from "@/lib/types";
import { CHINA_SPECIES, CHINA_SPECIES_BY_SLUG, type ChinaSpecies } from "./species";
import { taxonCn } from "./taxonomy";

const STATUS_LABELS = ["极危 CR", "濒危 EN", "易危 VU", "近危 NT", "无危 LC", "未评估 NE"];

function pickDistractors(correct: string, pool: string[], count = 3): string[] {
  const unique = [...new Set(pool)].filter((item) => item && item !== correct);
  const seed = correct.length * 7 + unique.length;
  const shuffled = unique
    .map((item, index) => ({ item, key: (index * 31 + seed) % 97 }))
    .sort((a, b) => a.key - b.key)
    .map((entry) => entry.item);
  return shuffled.slice(0, count);
}

function shuffle<T>(items: T[], seed: number): T[] {
  return items
    .map((item, index) => ({ item, key: (index * 17 + seed) % 89 }))
    .sort((a, b) => a.key - b.key)
    .map((entry) => entry.item);
}

function makeQuestion(
  slug: string,
  index: number,
  question: string,
  correct: string,
  pool: string[],
  explanation: string
): QuizQuestion | null {
  const distractors = pickDistractors(correct, pool);
  if (distractors.length < 2) return null;
  const options = shuffle([correct, ...distractors], slug.length + index);
  return {
    id: `card-${slug}-${index}`,
    topic: "species",
    type: "single",
    question,
    options,
    answer_index: options.indexOf(correct),
    answer: [options.indexOf(correct)],
    explanation,
    difficulty: 1,
    category: "物种探索",
    species_slug: slug,
    source_name: "馆藏物种卡 · 基于 GBIF 与馆藏结构化数据生成",
    source_url: `/explore/encyclopedia/${slug}`,
    updated_at: "2026-11-21",
    verified: true,
  };
}

export function speciesCardQuestions(slug: string): QuizQuestion[] {
  const species = CHINA_SPECIES_BY_SLUG.get(slug);
  if (!species) return [];
  const questions: QuizQuestion[] = [];
  const peers = CHINA_SPECIES.filter((item) => item.group === species.group && item.slug !== slug);

  const familyCn = taxonCn(species.taxonomy.family);
  if (familyCn) {
    const q = makeQuestion(
      slug,
      1,
      `${species.nameCn}在分类上属于哪个科？`,
      familyCn,
      peers.map((item) => taxonCn(item.taxonomy.family)),
      `${species.nameCn}的学名为 ${species.scientificName}，隶属于${familyCn}。`
    );
    if (q) questions.push(q);
  }

  if (species.provinces.length) {
    const province = species.provinces[0];
    const allProvinces = CHINA_SPECIES.flatMap((item) => item.provinces);
    const q = makeQuestion(
      slug,
      2,
      `根据 GBIF 观测记录，${species.nameCn}在以下哪个省份有分布记录？`,
      province,
      allProvinces.filter((item) => !species.provinces.includes(item)),
      `GBIF 在中国记录于${species.provinces.slice(0, 4).join("、")}等地。观测记录存在采样偏差，不代表完整分布区。`
    );
    if (q) questions.push(q);
  }

  if (species.conservation.status) {
    const label = `${species.conservation.label} ${species.conservation.status}`;
    const q = makeQuestion(
      slug,
      3,
      `${species.nameCn}当前的馆藏保护等级标注为？`,
      label,
      STATUS_LABELS,
      `${species.nameCn}的馆藏保护等级为${label}。${species.conservation.note}`
    );
    if (q) questions.push(q);
  }

  const orderCn = taxonCn(species.taxonomy.order);
  if (orderCn) {
    const q = makeQuestion(
      slug,
      4,
      `${species.nameCn}属于以下哪个目？`,
      orderCn,
      CHINA_SPECIES.map((item) => taxonCn(item.taxonomy.order)),
      `${species.nameCn}隶属于${orderCn}，${familyCn || "科级待核验"}。`
    );
    if (q) questions.push(q);
  }

  return questions;
}

export function speciesCardSummary(slug: string): Pick<
  ChinaSpecies,
  "slug" | "nameCn" | "scientificName" | "englishName" | "groupLabel" | "distribution" | "provinces" | "conservation"
> | null {
  const species = CHINA_SPECIES_BY_SLUG.get(slug);
  if (!species) return null;
  return {
    slug: species.slug,
    nameCn: species.nameCn,
    scientificName: species.scientificName,
    englishName: species.englishName,
    groupLabel: species.groupLabel,
    distribution: species.distribution,
    provinces: species.provinces,
    conservation: species.conservation,
  };
}