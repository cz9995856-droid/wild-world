import fs from "fs";
import path from "path";

const root = process.cwd();
const species = JSON.parse(fs.readFileSync(path.join(root, "public/data/china-species-amphibians.json"), "utf8"));
const media = {
  ...JSON.parse(fs.readFileSync(path.join(root, "public/data/china-media.json"), "utf8")).species,
  ...JSON.parse(fs.readFileSync(path.join(root, "public/data/china-media-amphibians.json"), "utf8")).species,
  ...JSON.parse(fs.readFileSync(path.join(root, "public/data/china-media-extra.json"), "utf8")).species,
  ...JSON.parse(fs.readFileSync(path.join(root, "public/data/china-media-habitat.json"), "utf8")).species,
};

const missing = species.filter((item) => {
  const entry = media[item.slug] ?? {};
  return !entry.hero && !entry.full;
});

const limit = Number(process.argv[2] ?? 30);
const target = missing.slice(0, limit);

const ALLOWED = [
  "cc0",
  "publicdomain",
  "by/4.0",
  "by/3.0",
  "by/2.0",
  "by-sa",
];

function licenseOk(url) {
  const lowered = String(url ?? "").toLowerCase();
  if (!lowered) return false;
  if (lowered.includes("by-nc") || lowered.includes("by-nd")) return false;
  return ALLOWED.some((token) => lowered.includes(token));
}

async function json(url) {
  const res = await fetch(url, { headers: { "User-Agent": "WildChinaEducation/1.0" } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

async function scan(item) {
  const match = await json(`https://api.gbif.org/v1/species/match?name=${encodeURIComponent(item.scientificName)}`);
  if (!match.usageKey || match.matchType === "NONE") return { slug: item.slug, name: item.nameCn, status: "no-taxon" };
  const occ = await json(
    `https://api.gbif.org/v1/occurrence/search?taxonKey=${match.usageKey}&mediaType=StillImage&limit=20`
  );
  const candidates = [];
  for (const record of occ.results ?? []) {
    for (const m of record.media ?? []) {
      if (!m.identifier) continue;
      if (!licenseOk(m.license)) continue;
      candidates.push({
        url: m.identifier,
        license: m.license,
        creator: m.creator ?? m.rightsHolder ?? "",
        publisher: record.publisher ?? record.institutionCode ?? "",
        page: m.references ?? "",
      });
    }
  }
  return {
    slug: item.slug,
    name: item.nameCn,
    scientificName: item.scientificName,
    usageKey: match.usageKey,
    count: occ.count ?? 0,
    candidates: candidates.slice(0, 3),
    status: candidates.length ? "ok" : occ.count ? "only-nc" : "none",
  };
}

const results = [];
for (let i = 0; i < target.length; i += 4) {
  const batch = target.slice(i, i + 4);
  const settled = await Promise.all(
    batch.map((item) =>
      scan(item).catch((error) => ({ slug: item.slug, name: item.nameCn, status: "error", error: String(error) }))
    )
  );
  results.push(...settled);
  await new Promise((resolve) => setTimeout(resolve, 600));
  console.log(`scanned ${results.length}/${target.length}`);
}

fs.writeFileSync("/tmp/img-scan.json", JSON.stringify({ missing: missing.length, results }, null, 1));
const summary = {};
for (const item of results) summary[item.status] = (summary[item.status] ?? 0) + 1;
console.log(JSON.stringify({ missing: missing.length, summary }, null, 1));