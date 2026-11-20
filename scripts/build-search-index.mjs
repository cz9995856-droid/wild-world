import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "public/data/species-index.json");

const taxonomyCn = JSON.parse(await readFile(path.join(ROOT, "lib/wildchina/taxonomy-cn.json"), "utf8")).names ?? {};
const gbif = JSON.parse(await readFile(path.join(ROOT, "public/data/china-gbif-enrichment.json"), "utf8")).species;

function cn(latin) {
  if (!latin) return "";
  if (/[\u4e00-\u9fa5]/.test(latin)) {
    return latin.replace(/[A-Za-z][A-Za-z .'-]*/g, "").replace(/[（()）]/g, "").replace(/\s+/g, " ").trim();
  }
  return taxonomyCn[latin] ?? "";
}

const items = [];

// 两栖 + 新增物种
for (const f of ["china-species-amphibians.json", "china-species-extra.json"]) {
  try {
    const list = JSON.parse(await readFile(path.join(ROOT, "public/data", f), "utf8"));
    for (const s of list) {
      items.push({
        slug: s.slug,
        cn: s.nameCn,
        en: s.englishName ?? "",
        sci: s.scientificName,
        aliases: s.aliases ?? [],
        group: s.groupLabel ?? "",
        family: cn(s.taxonomy?.family || gbif[s.slug]?.family),
        order: cn(s.taxonomy?.order || gbif[s.slug]?.order),
      });
    }
  } catch {
    // ignore
  }
}

// 基础 14 个物种：从 species.ts 解析
try {
  const ts = await readFile(path.join(ROOT, "lib/wildchina/species.ts"), "utf8");
  for (const m of ts.matchAll(/slug:\s*"([^"]+)"/g)) {
    const seg = ts.slice(m.index, m.index + 900);
    const nameCn = seg.match(/nameCn:\s*"([^"]+)"/)?.[1];
    const sci = seg.match(/scientificName:\s*"([^"]+)"/)?.[1];
    const en = seg.match(/englishName:\s*"([^"]+)"/)?.[1];
    const family = seg.match(/family:\s*"([^"]+)"/)?.[1];
    const order = seg.match(/order:\s*"([^"]+)"/)?.[1];
    if (!nameCn) continue;
    if (items.some((x) => x.slug === m[1])) continue;
    items.push({
      slug: m[1],
      cn: nameCn,
      en: en ?? "",
      sci: sci ?? "",
      aliases: [],
      group: "",
      family: cn(family ?? ""),
      order: cn(order ?? ""),
    });
  }
} catch {
  // ignore
}

// 去重
const map = new Map();
for (const item of items) if (!map.has(item.slug)) map.set(item.slug, item);

// Tropicals.cn 名称校对（CC BY 4.0）
try {
  const tropRaw = JSON.parse(await readFile(path.join(ROOT, "public/data/china-species-tropicals.json"), "utf8"));
  const trop = tropRaw.species ?? {};
  for (const [slug, item] of map) {
    const entry = trop[slug];
    if (!entry) continue;
    if (entry.useEnglishName && (/^[\x00-\x7F]*$/.test(item.en ?? "") === false || !item.en || item.en === item.cn)) {
      item.en = entry.useEnglishName;
    }
    const extra = [entry.nameCn, ...(entry.aliases ?? [])].filter((name) => name && name !== item.cn);
    item.aliases = [...new Set([...(item.aliases ?? []), ...extra])];
  }
} catch {
  // ignore
}

const final = [...map.values()];

await writeFile(OUT, JSON.stringify({ generated_at: new Date().toISOString(), count: final.length, items: final }, null, 1));
console.log(`index=${final.length}`);
console.log(final.slice(0, 2));