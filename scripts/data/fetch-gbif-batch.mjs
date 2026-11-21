import fs from "fs";
import path from "path";

const root = process.cwd();
const list = JSON.parse(fs.readFileSync(path.join(root, "scripts/data/endemic-mammals-birds.json"), "utf8"));

const PROVINCE_CN = [
  "内蒙古", "黑龙江", "北京", "天津", "河北", "山西", "辽宁", "吉林", "上海", "江苏",
  "浙江", "安徽", "福建", "江西", "山东", "河南", "湖北", "湖南", "广东", "广西",
  "海南", "重庆", "四川", "贵州", "云南", "西藏", "陕西", "甘肃", "青海", "宁夏",
  "新疆", "台湾", "香港", "澳门",
];

const EN_TO_CN = {
  Beijing: "北京", Tianjin: "天津", Hebei: "河北", Shanxi: "山西", "Inner Mongolia": "内蒙古",
  Neimenggu: "内蒙古", Liaoning: "辽宁", Jilin: "吉林", Heilongjiang: "黑龙江", Shanghai: "上海",
  Jiangsu: "江苏", Zhejiang: "浙江", Anhui: "安徽", Fujian: "福建", Jiangxi: "江西",
  Shandong: "山东", Henan: "河南", Hubei: "湖北", Hunan: "湖南", Guangdong: "广东",
  Guangxi: "广西", Hainan: "海南", Chongqing: "重庆", Sichuan: "四川", Szechuan: "四川",
  Guizhou: "贵州", Yunnan: "云南", Tibet: "西藏", Xizang: "西藏", Shaanxi: "陕西",
  Gansu: "甘肃", Qinghai: "青海", Ningxia: "宁夏", Xinjiang: "新疆", Taiwan: "台湾",
  "Hong Kong": "香港", Macau: "澳门", Macao: "澳门",
};

const EN_KEYS = Object.keys(EN_TO_CN).sort((a, b) => b.length - a.length);

function parseProvince(raw) {
  const value = String(raw ?? "").trim();
  if (!value) return null;
  const cnHit = PROVINCE_CN.find((name) => value.includes(name));
  if (cnHit) return cnHit;
  if (EN_TO_CN[value]) return EN_TO_CN[value];
  const key = EN_KEYS.find((name) => value.toLowerCase().includes(name.toLowerCase()));
  return key ? EN_TO_CN[key] : null;
}

const cachePath = "/tmp/gbif-batch-cache.json";
const cache = fs.existsSync(cachePath) ? JSON.parse(fs.readFileSync(cachePath, "utf8")) : {};

async function json(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(String(res.status));
  return res.json();
}

const pending = list.filter((item) => !cache[item.slug]);
console.log("total", list.length, "pending", pending.length);

for (let i = 0; i < pending.length; i += 3) {
  const batch = pending.slice(i, i + 3);
  await Promise.all(
    batch.map(async (item) => {
      const entry = { slug: item.slug, scientificName: item.sci, group: item.group, endemic: item.endemic };
      try {
        const match = await json(`https://api.gbif.org/v1/species/match?name=${encodeURIComponent(item.sci)}`);
        entry.usageKey = match.usageKey ?? null;
        entry.matchType = match.matchType ?? null;
        entry.rank = match.rank ?? null;
        entry.status = match.status ?? null;
        entry.class = match.class ?? null;
        entry.order = match.order ?? null;
        entry.family = match.family ?? null;
        entry.genus = match.genus ?? null;
        entry.gbifScientificName = match.scientificName ?? null;
        if (entry.usageKey && entry.rank === "SPECIES" && ["EXACT", "FUZZY"].includes(entry.matchType)) {
          const occ = await json(
            `https://api.gbif.org/v1/occurrence/search?taxonKey=${entry.usageKey}&country=CN&facet=stateProvince&facetLimit=40&limit=0`
          );
          entry.occurrenceCount = occ.count ?? 0;
          const rawProvinces = (occ.facets?.[0]?.counts ?? []).map((c) => c.name);
          entry.provinces = [...new Set(rawProvinces.map(parseProvince).filter(Boolean))];
        } else {
          entry.occurrenceCount = null;
          entry.provinces = [];
          entry.note = "GBIF 未精确匹配到种级分类单元";
        }
      } catch (error) {
        entry.error = String(error).slice(0, 120);
      }
      cache[item.slug] = entry;
    })
  );
  if ((i + 3) % 30 === 0) {
    fs.writeFileSync(cachePath, JSON.stringify(cache, null, 1));
    console.log("done", i + 3);
  }
  await new Promise((resolve) => setTimeout(resolve, 260));
}

fs.writeFileSync(cachePath, JSON.stringify(cache, null, 1));

const valid = Object.values(cache).filter((entry) => !entry.error && entry.rank === "SPECIES" && entry.usageKey);
const rejected = Object.values(cache).filter((entry) => entry.error || entry.rank !== "SPECIES" || !entry.usageKey);

console.log(
  JSON.stringify(
    {
      total: Object.keys(cache).length,
      accepted: valid.length,
      withProvinces: valid.filter((entry) => entry.provinces.length).length,
      rejected: rejected.map((entry) => ({ slug: entry.slug, matchType: entry.matchType, rank: entry.rank, error: entry.error })),
    },
    null,
    1
  )
);

if (process.argv.includes("--write")) {
  const species = {};
  for (const entry of valid) {
    species[entry.slug] = {
      usageKey: entry.usageKey,
      class: entry.class,
      order: entry.order,
      family: entry.family,
      genus: entry.genus,
      scientificName: entry.gbifScientificName,
      matchType: entry.matchType,
      status: entry.status,
      provinces: entry.provinces,
      occurrenceCount: entry.occurrenceCount,
    };
  }
  fs.writeFileSync(
    path.join(root, "public/data/china-gbif-batch.json"),
    JSON.stringify(
      {
        source: "GBIF",
        url: "https://www.gbif.org/",
        retrievedAt: new Date().toISOString().slice(0, 10),
        note: "分类单元与省级观测记录来自 GBIF；省级分布为观测记录汇总，存在采样偏差，不代表完整分布区。",
        species,
      },
      null,
      1
    )
  );
  console.log(`written public/data/china-gbif-batch.json with ${valid.length} species`);
}