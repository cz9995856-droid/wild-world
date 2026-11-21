import fs from "fs";
import path from "path";

const root = process.cwd();
const amphibians = JSON.parse(fs.readFileSync(path.join(root, "public/data/china-species-amphibians.json"), "utf8"));
const extra = JSON.parse(fs.readFileSync(path.join(root, "public/data/china-species-extra.json"), "utf8"));
const batch = JSON.parse(fs.readFileSync(path.join(root, "public/data/china-species-batch.json"), "utf8"));
const batch2 = JSON.parse(fs.readFileSync(path.join(root, "public/data/china-species-batch2.json"), "utf8"));

const media = {
  ...JSON.parse(fs.readFileSync(path.join(root, "public/data/china-media.json"), "utf8")).species,
  ...JSON.parse(fs.readFileSync(path.join(root, "public/data/china-media-amphibians.json"), "utf8")).species,
  ...JSON.parse(fs.readFileSync(path.join(root, "public/data/china-media-extra.json"), "utf8")).species,
  ...JSON.parse(fs.readFileSync(path.join(root, "public/data/china-media-amphibians-illustration.json"), "utf8")).species,
  ...JSON.parse(fs.readFileSync(path.join(root, "public/data/china-media-amphibians-sourced.json"), "utf8")).species,
  ...JSON.parse(fs.readFileSync(path.join(root, "public/data/china-media-amphibians-localized.json"), "utf8")).species,
  ...JSON.parse(fs.readFileSync(path.join(root, "public/data/china-media-batch.json"), "utf8")).species,
};

const gbif = JSON.parse(fs.readFileSync(path.join(root, "public/data/china-gbif-enrichment.json"), "utf8")).species;

const source = fs.readFileSync(path.join(root, "lib/wildchina/species.ts"), "utf8");
const baseBlocks = source.split(/\n  \{\n/).filter((block) => block.includes('slug: "')).slice(0, 13);
const baseEntries = baseBlocks.map((block) => ({
  slug: block.match(/slug: "([^"]+)"/)?.[1] ?? "",
  cn: block.match(/nameCn: "([^"]+)"/)?.[1] ?? "",
  sci: block.match(/scientificName: "([^"]+)"/)?.[1] ?? "",
  group: block.match(/group: "([^"]+)"/)?.[1] ?? "mammal",
  groupLabel: block.match(/groupLabel: "([^"]+)"/)?.[1] ?? "",
  status: block.match(/status: "([A-Z]+)"/)?.[1] ?? "NE",
  provinces: (block.match(/provinces: \[([^\]]*)\]/)?.[1] ?? "")
    .split(",")
    .map((item) => item.replace(/["\s]/g, ""))
    .filter(Boolean),
}));

function thumb(url) {
  if (!url || !url.startsWith("/media/")) return url ?? "";
  const rest = url.slice("/media/".length);
  const dir = rest.split("/")[0];
  if (!["species", "pixabay", "habitat", "extra", "hero"].includes(dir)) return url;
  return `/media/thumbs/${rest.replace(/\.(jpe?g|png|webp)$/i, ".webp")}`;
}

const items = [...amphibians, ...extra, ...batch, ...batch2].map((s) => ({
  slug: s.slug,
  cn: s.nameCn,
  sci: s.scientificName,
  group: s.group,
  groupLabel: s.groupLabel,
  status: s.conservation?.status ?? "NE",
  provinces: (s.provinces ?? []).length ? s.provinces : gbif[s.slug]?.provinces ?? [],
  thumb: thumb(media[s.slug]?.hero?.url ?? media[s.slug]?.full?.url),
}));

for (const entry of baseEntries) {
  if (items.some((item) => item.slug === entry.slug)) continue;
  items.push({
    slug: entry.slug,
    cn: entry.cn,
    sci: entry.sci,
    group: entry.group,
    groupLabel: entry.groupLabel,
    status: entry.status,
    provinces: entry.provinces,
    thumb: thumb(media[entry.slug]?.hero?.url ?? media[entry.slug]?.full?.url),
  });
}

fs.writeFileSync(path.join(root, "public/data/species-lite.json"), JSON.stringify({ count: items.length, items }, null, 0));
console.log("lite", items.length, "KB", (fs.statSync(path.join(root, "public/data/species-lite.json")).size / 1024).toFixed(1));