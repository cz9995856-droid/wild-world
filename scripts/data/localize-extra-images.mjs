import fs from "fs";
import path from "path";
import sharp from "sharp";

const root = process.cwd();
const ND = /by-nc-nd/i;

const sources = ["china-media.json", "china-media-extra.json"].map((file) =>
  JSON.parse(fs.readFileSync(path.join(root, "public/data", file), "utf8")).species
);
const merged = Object.assign({}, ...sources);

const outDir = path.join(root, "public/media/species/extra-local");
const thumbDir = path.join(root, "public/media/thumbs/species/extra-local");
const cardDir = path.join(root, "public/media/cards/species/extra-local");
for (const dir of [outDir, thumbDir, cardDir]) fs.mkdirSync(dir, { recursive: true });

const statePath = "/tmp/extra-local-state.json";
const state = fs.existsSync(statePath) ? JSON.parse(fs.readFileSync(statePath, "utf8")) : {};

const tasks = Object.entries(merged).filter(([slug, entry]) => {
  const hero = entry.hero;
  if (!hero?.url || hero.url.startsWith("/media/")) return false;
  if (ND.test(hero.license ?? "")) return false;
  return true;
});

console.log("tasks", tasks.length);

async function download(url) {
  const candidates = [url.replace(/\/(large|medium|small)\.(jpe?g|png)$/i, "/original.$2"), url];
  for (const target of candidates) {
    try {
      const res = await fetch(target, {
        headers: { "User-Agent": "WildChinaEducation/1.0" },
        signal: AbortSignal.timeout(20000),
      });
      if (!res.ok) continue;
      if (!(res.headers.get("content-type") ?? "").startsWith("image/")) continue;
      const buffer = Buffer.from(await res.arrayBuffer());
      if (buffer.length > 15000) return buffer;
    } catch {
      continue;
    }
  }
  return null;
}

let done = 0;
let skipped = 0;

for (const [slug, entry] of tasks) {
  if (state[slug]) {
    done += 1;
    continue;
  }
  const hero = entry.hero;
  const buffer = await download(hero.url);
  if (!buffer) {
    skipped += 1;
    console.log("skip", slug);
    continue;
  }
  try {
    const rotated = await sharp(buffer).rotate().toBuffer();
    await sharp(rotated)
      .resize({ width: 1400, height: 1400, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(path.join(outDir, `${slug}.webp`));
    await sharp(rotated)
      .resize({ width: 800, height: 800, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 78 })
      .toFile(path.join(thumbDir, `${slug}.webp`));
    await sharp(rotated)
      .resize({ width: 480, height: 480, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 72 })
      .toFile(path.join(cardDir, `${slug}.webp`));
    state[slug] = {
      url: `/media/species/extra-local/${slug}.webp`,
      author: hero.author ?? "未署名",
      source_name: hero.source_name ?? "iNaturalist",
      source_url: hero.source_url ?? hero.url,
      license: hero.license ?? "",
      license_url: hero.license_url ?? "",
      commercial_use: Boolean(hero.commercial_use),
      verified: true,
      review_status: "sourced",
      ai_generated: false,
    };
    done += 1;
    if (done % 15 === 0) {
      fs.writeFileSync(statePath, JSON.stringify(state, null, 1));
      console.log("done", done);
    }
  } catch (error) {
    skipped += 1;
    console.log("fail", slug, String(error).slice(0, 60));
  }
  await new Promise((resolve) => setTimeout(resolve, 200));
}

fs.writeFileSync(statePath, JSON.stringify(state, null, 1));
const payload = {
  source: "iNaturalist 开放数据（本地化）",
  retrievedAt: "2026-11-19",
  species: Object.fromEntries(Object.entries(state).map(([slug, hero]) => [slug, { hero }])),
};
fs.writeFileSync(path.join(root, "public/data/china-media-extra-localized.json"), JSON.stringify(payload, null, 1));
console.log(JSON.stringify({ done, skipped }, null, 1));