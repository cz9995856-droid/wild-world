import fs from "fs";

const key = process.env.TROPICALS_API_KEY;
if (!key) {
  console.error("缺少 TROPICALS_API_KEY");
  process.exit(1);
}

const source = fs.readFileSync("lib/wildchina/species.ts", "utf8");
const pairs = [...source.matchAll(/slug: "([a-z0-9-]+)",[\s\S]{0,500}?scientificName: "([^"]+)"/g)]
  .slice(0, 13)
  .map((m) => ({ slug: m[1], scientificName: m[2] }));

const resolvePath = "/tmp/trop-resolve-cache.json";
const cache = JSON.parse(fs.readFileSync(resolvePath, "utf8"));
const pending = pairs.filter((item) => !cache[item.slug]);

console.log("base", pairs.length, "pending", pending.length);
if (!pending.length) process.exit(0);

const res = await fetch("https://tropicals.cn/api/v1/names/resolve-batch", {
  method: "POST",
  headers: { "X-Api-Key": key, "Content-Type": "application/json" },
  body: JSON.stringify({ queries: pending.map((item) => item.scientificName), limit_per_query: 1, type: "scientific" }),
});
const data = await res.json();
data.results.forEach((row, index) => {
  const item = pending[index];
  cache[item.slug] = { input: row.input, matches: (row.matches ?? []).filter((m) => m.category === "tropical_pets") };
});
fs.writeFileSync(resolvePath, JSON.stringify(cache, null, 1));
console.log("resolved", Object.keys(cache).length, "left", res.headers.get("x-daily-remaining"));
