import fs from "fs";

const key = process.env.TROPICALS_API_KEY;
if (!key) {
  console.error("缺少 TROPICALS_API_KEY 环境变量");
  process.exit(1);
}

const cache = JSON.parse(fs.readFileSync("/tmp/trop-resolve-cache.json", "utf8"));
const detailPath = "/tmp/trop-detail-cache.json";
const detail = fs.existsSync(detailPath) ? JSON.parse(fs.readFileSync(detailPath, "utf8")) : {};

const targets = [];
for (const [slug, entry] of Object.entries(cache)) {
  const match = (entry.matches ?? [])[0];
  if (!match) continue;
  if (detail[slug]) continue;
  targets.push({ slug, tropicalsSlug: match.slug });
}

console.log("pending", targets.length);

for (let i = 0; i < targets.length; i += 1) {
  const item = targets[i];
  const res = await fetch(`https://tropicals.cn/api/v1/species/${item.tropicalsSlug}`, {
    headers: { "X-Api-Key": key },
  });
  if (res.status === 429) {
    const wait = Number(res.headers.get("retry-after") ?? 5);
    console.log("429 wait", wait);
    await new Promise((resolve) => setTimeout(resolve, (wait + 1) * 1000));
    i -= 1;
    continue;
  }
  if (!res.ok) {
    console.log("fail", item.tropicalsSlug, res.status);
    continue;
  }
  const payload = await res.json();
  const species = payload.species ?? {};
  const attributes = species.extraAttributes ?? {};
  detail[item.slug] = {
    tropicalsId: species.id ?? null,
    tropicalsSlug: species.slug ?? item.tropicalsSlug,
    name: species.name ?? null,
    nameEn: species.nameEn ?? null,
    scientificName: species.scientificName ?? null,
    nameAuthorship: species.nameAuthorship ?? null,
    taxonRank: species.taxonRank ?? null,
    taxonomicStatus: species.taxonomicStatus ?? null,
    acceptedScientificName: species.acceptedScientificName ?? null,
    cnNameSource: species.cnNameSource ?? null,
    cnNameConfidence: species.cnNameConfidence ?? null,
    alias: species.alias ?? null,
    gbifUsageKey: species.gbifUsageKey ?? null,
    colId: species.colId ?? null,
    wikidataQid: species.wikidataQid ?? null,
    taxonomy: {
      kingdom: attributes.kingdom ?? null,
      phylum: attributes.phylum ?? null,
      class: attributes.class ?? null,
      order: attributes.order ?? null,
      family: attributes.family ?? null,
      genus: attributes.genus ?? null,
    },
  };
  if ((i + 1) % 20 === 0) {
    fs.writeFileSync(detailPath, JSON.stringify(detail, null, 1));
    console.log("done", i + 1, "daily-left", res.headers.get("x-daily-remaining"));
  }
  await new Promise((resolve) => setTimeout(resolve, 2200));
}

fs.writeFileSync(detailPath, JSON.stringify(detail, null, 1));
console.log("total", Object.keys(detail).length);