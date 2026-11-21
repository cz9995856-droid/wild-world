import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "lib/wildchina/taxonomy-cn.json");
const UA = "WILDWORLD-Museum/1.0";

const species = [];
for (const f of ["china-species-amphibians.json", "china-species-extra.json"]) {
  try {
    species.push(...JSON.parse(await readFile(path.join(ROOT, "public/data", f), "utf8")));
  } catch {
    // ignore
  }
}

const names = new Set();
for (const s of species) {
  for (const key of ["class", "order", "family", "genus"]) {
    const value = s.taxonomy?.[key];
    if (value && !/[\u4e00-\u9fa5]/.test(value)) names.add(value.trim());
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const out = {};
let cursor = 0;

const list = [...names];
console.log(`names=${list.length}`);

async function one(latin) {
  try {
    const res = await fetch(
      `https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(latin)}&locale=zh-CN&per_page=3`,
      { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(25000) }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const exact = (data.results ?? []).find((t) => (t.name || "").toLowerCase() === latin.toLowerCase());
    const cn = exact?.preferred_common_name;
    if (cn && /[\u4e00-\u9fa5]/.test(cn)) out[latin] = cn;
  } catch {
    // skip
  }
}

async function worker() {
  while (cursor < list.length) {
    const latin = list[cursor++];
    await one(latin);
    await sleep(250);
  }
}

await Promise.all(Array.from({ length: 3 }, worker));
await writeFile(OUT, JSON.stringify({ generated_at: new Date().toISOString(), names: out }, null, 1));
console.log(`mapped=${Object.keys(out).length}/${list.length}`);
console.log(JSON.stringify(out).slice(0, 400));