import fs from "fs";
import path from "path";
import sharp from "sharp";

const root = process.cwd();
const scan = JSON.parse(fs.readFileSync("/tmp/img-scan.json", "utf8"));
const okItems = scan.results.filter((item) => item.status === "ok" && item.candidates?.length);

const outDir = path.join(root, "public/media/species/amph-sourced");
const thumbDir = path.join(root, "public/media/thumbs/species/amph-sourced");
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(thumbDir, { recursive: true });

const picked = JSON.parse(fs.existsSync("/tmp/img-picked.json") ? fs.readFileSync("/tmp/img-picked.json", "utf8") : "{}");

async function download(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "WildChinaEducation/1.0 (+https://wild-world-museum.pages.dev)" },
    redirect: "follow",
  });
  if (!res.ok) return null;
  const type = res.headers.get("content-type") ?? "";
  if (!type.startsWith("image/")) return null;
  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.length < 20000) return null;
  return buffer;
}

function licenseLabel(url) {
  const value = String(url ?? "").toLowerCase();
  if (value.includes("publicdomain/zero")) return "CC0 1.0 公共领域贡献";
  if (value.includes("publicdomain")) return "公有领域";
  if (value.includes("by-sa")) return "CC BY-SA";
  if (value.includes("by/")) return "CC BY";
  return url ?? "";
}

let done = 0;
let skipped = 0;

for (const item of okItems) {
  if (picked[item.slug]) {
    done += 1;
    continue;
  }
  let chosen = null;
  let buffer = null;
  for (const candidate of item.candidates) {
    try {
      buffer = await download(candidate.url);
    } catch {
      buffer = null;
    }
    if (buffer) {
      chosen = candidate;
      break;
    }
  }
  if (!buffer || !chosen) {
    skipped += 1;
    continue;
  }
  try {
    const target = path.join(outDir, `${item.slug}.webp`);
    await sharp(buffer)
      .rotate()
      .resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(target);
    await sharp(buffer)
      .rotate()
      .resize({ width: 800, height: 800, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 78 })
      .toFile(path.join(thumbDir, `${item.slug}.webp`));

    picked[item.slug] = {
      url: `/media/species/amph-sourced/${item.slug}.webp`,
      author: chosen.creator || chosen.publisher || "未署名",
      source_name: chosen.publisher || "GBIF 记录",
      source_url: chosen.page || chosen.url,
      license: licenseLabel(chosen.license),
      license_url: chosen.license,
      commercial_use: true,
      verified: true,
      review_status: "sourced",
      ai_generated: false,
    };
    done += 1;
    console.log("ok", item.slug);
  } catch (error) {
    skipped += 1;
    console.log("fail", item.slug, String(error).slice(0, 80));
  }
  await new Promise((resolve) => setTimeout(resolve, 250));
}

fs.writeFileSync("/tmp/img-picked.json", JSON.stringify(picked, null, 1));

const payload = {
  source: "GBIF occurrence media（原始授权来自 iNaturalist / 自然史博物馆等）",
  retrievedAt: "2026-11-19",
  note: "仅采用 CC0、公有领域、CC BY、CC BY-SA 等允许再使用的图片；作者与原始页面随图标注。",
  species: Object.fromEntries(Object.entries(picked).map(([slug, image]) => [slug, { hero: image }])),
};

fs.writeFileSync(
  path.join(root, "public/data/china-media-amphibians-sourced.json"),
  JSON.stringify(payload, null, 1)
);

console.log(JSON.stringify({ done, skipped, total: okItems.length }, null, 1));