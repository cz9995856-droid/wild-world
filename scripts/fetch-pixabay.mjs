import { readFile, writeFile, mkdir, stat } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const API = "https://pixabay.com/api/";
const LICENSE = "Pixabay Content License";
const LICENSE_URL = "https://pixabay.com/service/license-summary/";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function loadKey() {
  if (process.env.PIXABAY_API_KEY) return process.env.PIXABAY_API_KEY.trim();
  try {
    const text = await readFile(path.join(ROOT, ".env.local"), "utf8");
    const line = text.split(/\r?\n/).find((l) => l.trim().startsWith("PIXABAY_API_KEY="));
    if (line) return line.slice(line.indexOf("=") + 1).trim().replace(/^["']|["']$/g, "");
  } catch {
    // no .env.local
  }
  return "";
}

const key = await loadKey();
if (!key) {
  console.error("缺少 PIXABAY_API_KEY（写入 .env.local 或环境变量后重试）。");
  process.exit(1);
}

const species = JSON.parse(await readFile(path.join(ROOT, "scripts/species.json"), "utf8"));
const integration = JSON.parse(await readFile(path.join(ROOT, "public/data/integration.json"), "utf8"));

const existingIds = new Set(integration.photos.map((p) => p.id));
const existingSlugs = new Set(
  integration.photos.filter((p) => p.source_name === "Pixabay").map((p) => p.species_slug),
);

async function getJSON(url, attempt = 0) {
  const res = await fetch(url, {
    headers: { "User-Agent": "WILDWORLD-Museum/1.0", Accept: "application/json" },
  });
  if (res.status === 429) {
    if (attempt > 3) throw new Error("rate limited");
    await sleep(6000 * (attempt + 1));
    return getJSON(url, attempt + 1);
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function download(url, dest) {
  const res = await fetch(url, { headers: { "User-Agent": "WILDWORLD-Museum/1.0" } });
  if (!res.ok) throw new Error(`download HTTP ${res.status}`);
  const type = res.headers.get("content-type") || "";
  if (!/image/.test(type)) throw new Error(`unexpected content-type ${type}`);
  await mkdir(path.dirname(dest), { recursive: true });
  await pipeline(res.body, createWriteStream(dest));
}

const photos = [...integration.photos];
const errors = [];
let added = 0;

for (const s of species) {
  if (existingSlugs.has(s.slug)) {
    console.log(`skip ${s.slug} (already has Pixabay photo)`);
    continue;
  }
  try {
    const query = encodeURIComponent(s.en);
    const url = `${API}?key=${encodeURIComponent(key)}&q=${query}&image_type=photo&orientation=horizontal&safesearch=true&category=animals&per_page=6&order=popular`;
    const json = await getJSON(url);
    const hits = (json.hits ?? []).filter(
      (h) =>
        h.imageWidth >= 1000 &&
        h.imageHeight >= 600 &&
        h.largeImageURL &&
        !existingIds.has(`ph-pixabay-${h.id}`),
    );
    const hit = hits[0];
    if (!hit) throw new Error("no suitable horizontal photo");
    const file = `public/media/pixabay/${s.slug}.jpg`;
    const existing = await stat(path.join(ROOT, file)).catch(() => null);
    if (!existing || existing.size < 1000) {
      const tmp = path.join(ROOT, file);
      await download(hit.largeImageURL, tmp);
      const buffer = await readFile(tmp);
      const output = await sharp(buffer)
        .rotate()
        .resize({ width: 1280, withoutEnlargement: true })
        .jpeg({ quality: 72, mozjpeg: true })
        .toBuffer();
      await writeFile(tmp, output);
    }
    photos.push({
      id: `ph-pixabay-${hit.id}`,
      species_slug: s.slug,
      url: `/${file.replace(/^public\//, "")}`,
      width: 1280,
      height: Math.round((1280 * hit.imageHeight) / hit.imageWidth),
      author: hit.user || "Pixabay contributor",
      source_name: "Pixabay",
      source_url: hit.pageURL,
      source_record_id: String(hit.id),
      license: LICENSE,
      license_url: LICENSE_URL,
      attribution: `${hit.user || "Pixabay contributor"} / Pixabay`,
      commercial_use: true,
      derivatives_allowed: true,
      download_allowed: true,
      retrieved_at: new Date().toISOString(),
      verified: true,
      review_status: "editorial",
    });
    added += 1;
    console.log(`ok ${s.slug} pixabay=${hit.id} by=${hit.user}`);
  } catch (e) {
    errors.push({ slug: s.slug, message: String(e.message || e) });
    console.error(`fail ${s.slug}: ${e.message || e}`);
  }
  await sleep(700);
}

const dedupe = (list) => {
  const map = new Map();
  for (const item of list) map.set(item.id, item);
  return [...map.values()];
};

await writeFile(
  path.join(ROOT, "public/data/integration.json"),
  JSON.stringify(
    {
      ...integration,
      photos: dedupe(photos),
      pixabay_generated_at: new Date().toISOString(),
      pixabay_errors: errors,
    },
    null,
    2,
  ),
);

console.log(`done added=${added} photos=${dedupe(photos).length} errors=${errors.length}`);