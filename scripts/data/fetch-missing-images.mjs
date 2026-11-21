import fs from "fs";
import path from "path";
import sharp from "sharp";

const root = process.cwd();
const mediaPath = path.join(root, "public/data/china-media-batch.json");
const media = JSON.parse(fs.readFileSync(mediaPath, "utf8"));
const gbifBatch = JSON.parse(fs.readFileSync(path.join(root, "public/data/china-gbif-batch.json"), "utf8")).species;
const list = JSON.parse(fs.readFileSync(path.join(root, "scripts/data/endemic-mammals-birds.json"), "utf8"));
const OUT_DIR = path.join(root, "public/media/batch");
fs.mkdirSync(OUT_DIR, { recursive: true });

const UA = "WILDWORLD-Museum/1.0 (+https://wild-world-museum.pages.dev; educational project)";
const missing = list.filter((item) => !media.species[item.slug]?.hero);
console.log("missing", missing.length, missing.map((item) => item.slug).join(", "));

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function prettyLicense(url) {
  const value = String(url ?? "").toLowerCase();
  if (value.includes("zero")) return "CC0 1.0";
  const m = value.match(/licenses\/([a-z-]+)\/(\d\.\d)/);
  if (m) return `CC ${m[1].toUpperCase()} ${m[2]}`;
  return url || "未标注";
}

async function fetchMedia(usageKey) {
  const res = await fetch(
    `https://api.gbif.org/v1/occurrence/search?taxonKey=${usageKey}&mediaType=StillImage&limit=30`,
    { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(30000) }
  );
  if (!res.ok) return [];
  const data = await res.json();
  const photos = [];
  for (const occ of data.results ?? []) {
    for (const m of occ.media ?? []) {
      const url = m.identifier;
      const license = String(m.license ?? m.rights ?? "");
      if (!url || !/^https?:/.test(url)) continue;
      const lic = license.toLowerCase();
      if (lic.includes("-nd") || lic.includes("/nd")) continue;
      const commercial =
        ((lic.includes("zero") || lic.includes("publicdomain")) && !lic.includes("nc")) ||
        ((lic.includes("/by/") || lic.includes("/by-sa/")) && !lic.includes("nc"));
      const rank = commercial ? 0 : lic.includes("nc") ? 1 : 99;
      if (rank === 99) continue;
      photos.push({
        url,
        author: m.rightsHolder || m.creator || occ.recordedBy || "GBIF 记录贡献者",
        license: prettyLicense(license),
        licenseUrl: license,
        sourceUrl: occ.references || `https://www.gbif.org/occurrence/${occ.key}`,
        sourceName: "GBIF 观测记录（全球）",
        commercial,
        rank,
      });
    }
  }
  return photos.sort((a, b) => a.rank - b.rank).slice(0, 4);
}

async function download(url, dest) {
  const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(60000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const type = res.headers.get("content-type") ?? "";
  if (type && !/image\//i.test(type)) throw new Error("not image");
  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.length < 2048) throw new Error("too small");
  fs.writeFileSync(dest, buffer);
}

let added = 0;
for (const item of missing) {
  const usageKey = gbifBatch[item.slug]?.usageKey;
  if (!usageKey) continue;
  try {
    const photos = await fetchMedia(usageKey);
    if (!photos.length) {
      console.log("no photo", item.slug);
      continue;
    }
    const photo = photos[0];
    const raw = path.join(OUT_DIR, `${item.slug}.raw`);
    await download(photo.url, raw);
    await sharp(raw)
      .rotate()
      .resize({ width: 1400, withoutEnlargement: true })
      .flatten({ background: "#ffffff" })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(path.join(OUT_DIR, `${item.slug}.jpg`));
    fs.unlinkSync(raw);
    media.species[item.slug] = {
      hero: {
        url: `/media/batch/${item.slug}.jpg`,
        author: photo.author,
        source_name: photo.sourceName,
        source_url: photo.sourceUrl,
        license: photo.license,
        license_url: photo.licenseUrl,
        commercial_use: photo.commercial,
        verified: true,
        review_status: "editorial",
        ai_generated: false,
      },
    };
    media.species[item.slug].full = media.species[item.slug].hero;
    added += 1;
    console.log("added", item.slug, photo.license);
  } catch (error) {
    console.log("failed", item.slug, String(error).slice(0, 100));
  }
  await sleep(400);
}

fs.writeFileSync(mediaPath, JSON.stringify(media, null, 1));
console.log("added total", added);