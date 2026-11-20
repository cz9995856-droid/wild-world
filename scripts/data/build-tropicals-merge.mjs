import fs from "fs";
import path from "path";

const root = process.cwd();
const resolve = JSON.parse(fs.readFileSync("/tmp/trop-resolve-cache.json", "utf8"));
const detailPath = "/tmp/trop-detail-cache.json";
const detail = fs.existsSync(detailPath) ? JSON.parse(fs.readFileSync(detailPath, "utf8")) : {};

const species = JSON.parse(fs.readFileSync(path.join(root, "public/data/china-species-amphibians.json"), "utf8"));
const extra = JSON.parse(fs.readFileSync(path.join(root, "public/data/china-species-extra.json"), "utf8"));
const index = JSON.parse(fs.readFileSync(path.join(root, "public/data/species-index.json"), "utf8")).items;
const local = new Map([...species, ...extra].map((item) => [item.slug, item]));
for (const item of index) {
  if (!local.has(item.slug)) {
    local.set(item.slug, { slug: item.slug, nameCn: item.cn, englishName: item.en, aliases: item.aliases ?? [] });
  }
}

const out = {};
let replacedEnglish = 0;
let addedAlias = 0;
let taxonomyChecked = 0;

function isChinese(value) {
  return /[\u4e00-\u9fa5]/.test(value ?? "");
}

for (const [slug, entry] of Object.entries(detail)) {
  const localSpecies = local.get(slug);
  if (!localSpecies) continue;

  const aliases = [];
  if (entry.name && entry.name !== localSpecies.nameCn) aliases.push(entry.name);
  if (entry.nameEn && entry.nameEn === localSpecies.englishName) continue;

  const englishIsPlaceholder =
    !localSpecies.englishName ||
    localSpecies.englishName === localSpecies.nameCn ||
    isChinese(localSpecies.englishName);

  const record = {
    tropicalsId: entry.tropicalsId,
    tropicalsSlug: entry.tropicalsSlug,
    nameCn: entry.name,
    nameEn: entry.nameEn,
    scientificName: entry.scientificName,
    nameAuthorship: entry.nameAuthorship,
    taxonomicStatus: entry.taxonomicStatus,
    acceptedScientificName: entry.acceptedScientificName,
    cnNameSource: entry.cnNameSource,
    cnNameConfidence: entry.cnNameConfidence,
    aliases: entry.alias ? entry.alias.split(/[,，]/).map((item) => item.trim()).filter(Boolean) : [],
    gbifUsageKey: entry.gbifUsageKey,
    colId: entry.colId,
    wikidataQid: entry.wikidataQid,
    taxonomy: entry.taxonomy,
    nameVerifiedAgainst: "Tropicals.cn",
  };

  if (englishIsPlaceholder && entry.nameEn) {
    record.useEnglishName = entry.nameEn;
    replacedEnglish += 1;
  }
  if (aliases.length) addedAlias += 1;
  if (entry.taxonomy?.class) taxonomyChecked += 1;
  out[slug] = record;
}

const payload = {
  source: "Tropicals.cn",
  url: "https://tropicals.cn/",
  license: "名称、分类与外部 ID 采用 CC BY 4.0；本站仅保存这些字段，未保存产地、百科正文、性状等受限字段。",
  attribution: "Tropicals.cn (CC BY 4.0)",
  retrievedAt: "2026-11-19",
  stats: { matched: Object.keys(out).length, replacedEnglish, addedAlias, taxonomyChecked },
  species: out,
};

fs.writeFileSync(path.join(root, "public/data/china-species-tropicals.json"), JSON.stringify(payload, null, 1));
console.log(JSON.stringify(payload.stats, null, 1));
console.log("size(KB)", (fs.statSync(path.join(root, "public/data/china-species-tropicals.json")).size / 1024).toFixed(1));