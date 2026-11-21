import fs from "fs";
import path from "path";

const root = process.cwd();
const key = process.env.TROPICALS_API_KEY;
if (!key) {
  console.error("缺少 TROPICALS_API_KEY 环境变量");
  process.exit(1);
}

const species = JSON.parse(fs.readFileSync(path.join(root, "public/data/china-species-amphibians.json"), "utf8"));
const extra = JSON.parse(fs.readFileSync(path.join(root, "public/data/china-species-extra.json"), "utf8"));

const sourceText = fs.readFileSync(path.join(root, "lib/wildchina/species.ts"), "utf8");
const baseSlugs = [...sourceText.matchAll(/slug: "([a-z0-9-]+)"/g)].map((m) => m[1]).slice(0, 13);
const baseSpecies = baseSlugs.map((slug) => ({ slug, scientificName: null }));

const list = [
  ...baseSpecies,
  ...species.map((s) => ({ slug: s.slug, scientificName: s.scientificName })),
  ...extra.map((s) => ({ slug: s.slug, scientificName: s.scientificName })),
];

const cachePath = "/tmp/trop-resolve-cache.json";
const cache = fs.existsSync(cachePath) ? JSON.parse(fs.readFileSync(cachePath, "utf8")) : {};

const pending = list.filter((item) => item.scientificName && !cache[item.slug]);
console.log("total", list.length, "pending", pending.length);

const BATCH = 50;

for (let i = 0; i < pending.length; i += BATCH) {
  const batch = pending.slice(i, i + BATCH);
  const body = { queries: batch.map((item) => item.scientificName), limit_per_query: 2, type: "scientific" };
  const res = await fetch("https://tropicals.cn/api/v1/names/resolve-batch", {
    method: "POST",
    headers: { "X-Api-Key": key, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    console.log("batch failed", res.status, await res.text().then((t) => t.slice(0, 200)));
    break;
  }
  const data = await res.json();
  data.results.forEach((row, index) => {
    const item = batch[index];
    const matches = (row.matches ?? []).filter((m) => m.category === "tropical_pets");
    cache[item.slug] = { input: row.input, matches, detected: row.input_type_detected };
  });
  fs.writeFileSync(cachePath, JSON.stringify(cache, null, 1));
  console.log("resolved", Object.keys(cache).length, "daily-left", res.headers.get("x-daily-remaining"));
  await new Promise((resolve) => setTimeout(resolve, 2200));
}

fs.writeFileSync(cachePath, JSON.stringify(cache, null, 1));
const hit = Object.values(cache).filter((entry) => entry.matches?.length).length;
console.log(JSON.stringify({ cached: Object.keys(cache).length, hit }, null, 1));