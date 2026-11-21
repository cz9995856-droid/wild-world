import fs from "fs";
import path from "path";
import sharp from "sharp";

const root = process.cwd();
const source = JSON.parse(fs.readFileSync(path.join(root, "public/data/china-media-amphibians.json"), "utf8")).species;

const outDir = path.join(root, "public/media/species/amph-inat");
const thumbDir = path.join(root, "public/media/thumbs/species/amph-inat");
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(thumbDir, { recursive: true });

const statePath = "/tmp/inat-state.json";
const state = fs.existsSync(statePath) ? JSON.parse(fs.readFileSync(statePath, "utf8")) : {};

const ND = /\bnd\b|by-nc-nd/i;
const tasks = Object.entries(source).filter(([, entry]) => {
  const hero = entry.hero;
  if (!hero?.url || hero.url.startsWith("/media/")) return false;
  if (ND.test(hero.license ?? "")) return false;
  return true;
});

async function fetchImage(url) {
  const attempts = [url.replace(/\/(large|medium|small)\.(jpe?g|png)$/i, "/original.$2"), url];
  for (const target of attempts) {
    try {
      const res = await fetch(target, {
        headers: { "User-Agent": "WildChinaEducation/1.0 (+https://wild-world-museum.pages.dev)" },
        signal: AbortSignal.timeout(20000),
      });
      if (!res.ok) continue;
      const type = res.headers.get("content-type") ?? "";
      if (!type.startsWith("image/")) continue;
      const buffer = Buffer.from(await res.arrayBuffer());
      if (buffer.length < 15000) continue;
      return buffer;
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
  if (fs.existsSync(path.join(outDir, `${slug}.webp`)) && fs.existsSync(path.join(thumbDir, `${slug}.webp`))) {
    state[slug] = {
      url: `/media/species/amph-inat/${slug}.webp`,
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
    continue;
  }
  const buffer = await fetchImage(hero.url);
  if (!buffer) {
    skipped += 1;
    console.log("skip", slug);
    continue;
  }
  try {
    const svgBuffer = await sharp(buffer).rotate().toBuffer();
    await sharp(svgBuffer)
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 86 })
      .toFile(path.join(outDir, `${slug}.webp`));
    await sharp(svgBuffer)
      .resize({ width: 800, height: 800, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(path.join(thumbDir, `${slug}.webp`));
    state[slug] = {
      url: `/media/species/amph-inat/${slug}.webp`,
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
    if (done % 25 === 0) {
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
  source: "iNaturalist 开放数据（经 GBIF / iNaturalist 开放数据镜像）",
  retrievedAt: "2026-11-19",
  note: "保留原始授权与作者署名。CC BY-NC / CC BY-NC-SA 图片仅用于本站非商业科普展示；CC BY-NC-ND 图片未做裁剪或再加工，故未列入本文件。",
  species: Object.fromEntries(Object.entries(state).map(([slug, hero]) => [slug, { hero }])),
};
fs.writeFileSync(path.join(root, "public/data/china-media-amphibians-localized.json"), JSON.stringify(payload, null, 1));

console.log(JSON.stringify({ done, skipped, tasks: tasks.length }, null, 1));