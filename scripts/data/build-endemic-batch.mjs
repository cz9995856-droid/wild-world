import fs from "fs";
import path from "path";

const root = process.cwd();
const list = JSON.parse(fs.readFileSync(path.join(root, "scripts/data/endemic-mammals-birds.json"), "utf8"));
const gbif = JSON.parse(fs.readFileSync(path.join(root, "public/data/china-gbif-batch.json"), "utf8")).species;
const mediaPath = path.join(root, "public/data/china-media-batch.json");
const media = fs.existsSync(mediaPath) ? JSON.parse(fs.readFileSync(mediaPath, "utf8")).species : {};

const SP2000 = "https://www.sp2000.org.cn/";
const IUCN = "https://www.iucnredlist.org/";
const GROUP_LABEL = { mammal: "哺乳纲", bird: "鸟纲" };

function distributionOf(entry) {
  const provinces = entry?.provinces ?? [];
  if (!provinces.length) {
    return "GBIF 中国观测记录不足，分布待进一步核验。";
  }
  const shown = provinces.slice(0, 6).join("、");
  return `GBIF 在中国记录于${shown}${provinces.length > 6 ? " 等" : ""}（${provinces.length} 个省级行政区；观测记录汇总，非完整分布区）。`;
}

const species = list.map((item) => {
  const entry = gbif[item.slug];
  const provinces = entry?.provinces ?? [];
  return {
    slug: item.slug,
    nameCn: item.cn,
    aliases: [],
    scientificName: item.sci,
    englishName: item.en,
    group: item.group,
    groupLabel: GROUP_LABEL[item.group],
    taxonomy: {
      class: entry?.class ?? (item.group === "mammal" ? "Mammalia" : "Aves"),
      order: entry?.order ?? "",
      family: entry?.family ?? "",
      genus: entry?.genus ?? "",
    },
    distribution: distributionOf(entry),
    provinces,
    habitats: [],
    conservation: {
      status: "NE",
      label: "未评估",
      year: null,
      note: "等级待接入权威评估后复核。",
    },
    morphology: "形态描述待补充，待依据权威图鉴核验后更新。",
    behavior: "行为与生境信息待补充，待依据权威资料核验后更新。",
    dietReproduction: "食性与繁殖信息待补充，待依据权威资料核验后更新。",
    endemic: item.endemic,
    endemicNote:
      item.endemic === "strict"
        ? "按中国特有物种收录，待名录复核。"
        : "按主要分布于中国收录，待名录复核。",
    sp2000: { id: null, url: SP2000 },
    sources: [
      ...(entry?.usageKey
        ? [{ name: `GBIF 分类与观测记录 · taxon ${entry.usageKey}`, url: `https://www.gbif.org/species/${entry.usageKey}` }]
        : [{ name: "GBIF Global Biodiversity Information Facility", url: "https://www.gbif.org/" }]),
      { name: "IUCN Red List（等级待核验）", url: IUCN },
    ],
    verified: false,
    externalIds: { gbif: entry?.usageKey ?? null },
  };
});

fs.writeFileSync(path.join(root, "public/data/china-species-batch.json"), JSON.stringify(species, null, 1));

const withMedia = species.filter((item) => media[item.slug]?.hero).length;
const withProvinces = species.filter((item) => item.provinces.length).length;
console.log(
  JSON.stringify(
    {
      species: species.length,
      mammal: species.filter((item) => item.group === "mammal").length,
      bird: species.filter((item) => item.group === "bird").length,
      withProvinces,
      withMedia,
      withoutMedia: species.filter((item) => !media[item.slug]?.hero).map((item) => item.slug),
    },
    null,
    1
  )
);