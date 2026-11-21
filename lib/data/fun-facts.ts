import { SPECIES } from "@/lib/data/species";

export interface FunFact {
  text: string;
  source: string;
  url: string;
  speciesSlug?: string;
}

const HIGHLIGHTS: FunFact[] = [
  {
    text: "大熊猫抓竹子的「第六根手指」不是手指，是腕部一块变大的籽骨。",
    source: "动物卡 · 大熊猫",
    url: "https://www.inaturalist.org/taxa/search?q=Ailuropoda%20melanoleuca",
    speciesSlug: "giant-panda",
  },
  {
    text: "大鲵没有发育良好的肺，主要靠皮肤和口腔黏膜呼吸，所以水质一变它就撑不住。",
    source: "动物卡 · 大鲵",
    url: "https://www.inaturalist.org/taxa/search?q=Andrias%20davidianus",
    speciesSlug: "chinese-giant-salamander",
  },
  {
    text: "朱鹮繁殖期的粉色来自食物里的类胡萝卜素，不是天生粉。",
    source: "动物卡 · 朱鹮",
    url: "https://www.inaturalist.org/taxa/search?q=Nipponia%20nippon",
    speciesSlug: "crested-ibis",
  },
];

const speciesFacts: FunFact[] = SPECIES.flatMap((species) =>
  (species.fun_facts ?? []).map((fact) => ({
    text: fact,
    source: `动物卡 · ${species.name_cn}`,
    url: `https://www.inaturalist.org/taxa/search?q=${encodeURIComponent(species.scientific_name)}`,
    speciesSlug: species.slug,
  }))
);

const seen = new Set<string>();
export const FUN_FACTS: FunFact[] = [...HIGHLIGHTS, ...speciesFacts].filter((fact) => {
  if (seen.has(fact.text)) return false;
  seen.add(fact.text);
  return true;
});