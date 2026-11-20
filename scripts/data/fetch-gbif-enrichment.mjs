import fs from "fs";
import path from "path";

const root = process.cwd();
const amphibians = JSON.parse(fs.readFileSync(path.join(root, "public/data/china-species-amphibians.json"), "utf8"));
const extra = JSON.parse(fs.readFileSync(path.join(root, "public/data/china-species-extra.json"), "utf8"));
const list = [...amphibians, ...extra];

const PROVINCE_MAP = {
  Sichuan: "四川", Szechuan: "四川", Yunnan: "云南", Guizhou: "贵州", Guangxi: "广西",
  Guangdong: "广东", Hubei: "湖北", Hunan: "湖南", Hebei: "河北", Henan: "河南",
  Shandong: "山东", Shanxi: "山西", Shaanxi: "陕西", Gansu: "甘肃", Qinghai: "青海",
  Tibet: "西藏", Xizang: "西藏", Xinjiang: "新疆", "Inner Mongolia": "内蒙古", Neimenggu: "内蒙古",
  Heilongjiang: "黑龙江", Jilin: "吉林", Liaoning: "辽宁", Beijing: "北京", Tianjin: "天津",
  Shanghai: "上海", Chongqing: "重庆", Anhui: "安徽", Jiangsu: "江苏", Zhejiang: "浙江",
  Jiangxi: "江西", Fujian: "福建", Hainan: "海南", Taiwan: "台湾", "Hong Kong": "香港", Macau: "澳门", Macao: "澳门",
};

const cachePath = "/tmp/gbif-enrichment.json";
const cache = fs.existsSync(cachePath) ? JSON.parse(fs.readFileSync(cachePath, "utf8")) : {};

async function json(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(String(res.status));
  return res.json();
}

const pending = list.filter((item) => !cache[item.slug]);
console.log("pending", pending.length);

for (let i = 0; i < pending.length; i += 3) {
  const batch = pending.slice(i, i + 3);
  await Promise.all(
    batch.map(async (item) => {
      const entry = { slug: item.slug, scientificName: item.scientificName };
      try {
        const match = await json(`https://api.gbif.org/v1/species/match?name=${encodeURIComponent(item.scientificName)}`);
        entry.usageKey = match.usageKey ?? null;
        entry.matchType = match.matchType ?? null;
        entry.status = match.status ?? null;
        entry.class = match.class ?? null;
        entry.order = match.order ?? null;
        entry.family = match.family ?? null;
        entry.genus = match.genus ?? null;
        entry.gbifScientificName = match.scientificName ?? null;
        if (entry.usageKey && !(item.provinces ?? []).length) {
          const occ = await json(
            `https://api.gbif.org/v1/occurrence/search?taxonKey=${entry.usageKey}&country=CN&facet=stateProvince&facetLimit=40&limit=0`
          );
          entry.occurrenceCount = occ.count ?? 0;
          entry.provinces = [
            ...new Set((occ.facets?.[0]?.counts ?? []).map((c) => PROVINCE_MAP[c.name]).filter(Boolean)),
          ];
        }
      } catch (error) {
        entry.error = String(error).slice(0, 80);
      }
      cache[item.slug] = entry;
    })
  );
  if ((i + 3) % 30 === 0) {
    fs.writeFileSync(cachePath, JSON.stringify(cache, null, 1));
    console.log("done", i + 3);
  }
  await new Promise((resolve) => setTimeout(resolve, 280));
}

fs.writeFileSync(cachePath, JSON.stringify(cache, null, 1));
const output = {};
for (const [slug, record] of Object.entries(cache)) {
  if (record.error) continue;
  output[slug] = {
    usageKey: record.usageKey ?? null,
    class: record.class ?? null,
    order: record.order ?? null,
    family: record.family ?? null,
    genus: record.genus ?? null,
    scientificName: record.gbifScientificName ?? null,
    matchType: record.matchType ?? null,
    status: record.status ?? null,
    provinces: record.provinces ?? [],
    occurrenceCount: record.occurrenceCount ?? null,
  };
}

fs.writeFileSync(
  path.join(root, "public/data/china-gbif-enrichment.json"),
  JSON.stringify(
    {
      source: "GBIF",
      url: "https://www.gbif.org/",
      retrievedAt: "2026-11-19",
      note: "分类单元与省级观测记录来自 GBIF；省级分布为观测记录汇总，存在采样偏差，不代表完整分布区。",
      species: output,
    },
    null,
    1
  )
);
console.log(
  JSON.stringify(
    { species: Object.keys(output).length, withProvinces: Object.values(output).filter((x) => x.provinces.length).length },
    null,
    1
  )
);