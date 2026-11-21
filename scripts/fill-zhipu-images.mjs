import { readFile, writeFile, mkdir, stat } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import path from "node:path";

const ROOT = process.cwd();
const IMG_DIR = path.join(ROOT, "public/media/endemic");
const SPECIES_FILE = path.join(ROOT, "public/data/china-species-amphibians.json");
const MEDIA_FILE = path.join(ROOT, "public/data/china-media-amphibians.json");
const KEY = process.env.ZHIPU_API_KEY;
const CONCURRENCY = Number(process.argv[2] ?? 2);
const MODEL = process.env.ZHIPU_IMAGE_MODEL ?? "cogview-3-flash";

if (!KEY) {
  console.error("missing ZHIPU_API_KEY");
  process.exit(1);
}

const species = JSON.parse(await readFile(SPECIES_FILE, "utf8"));
const media = JSON.parse(await readFile(MEDIA_FILE, "utf8"));
const map = media.species ?? {};
const missing = species.filter((s) => !map[s.slug]);
console.log(`model=${MODEL} species=${species.length} with-image=${Object.keys(map).length} missing=${missing.length}`);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function generate(s) {
  const dest = path.join(IMG_DIR, `${s.slug}-ai.png`);
  try {
    const st = await stat(dest);
    if (st.size > 10000) return { cached: true };
  } catch {
    // miss
  }
  const prompt = `realistic wildlife photograph of ${s.scientificName} (${s.englishName}), full body in natural habitat, scientific reference, soft natural light, no text`;
  const res = await fetch("https://open.bigmodel.cn/api/paas/v4/images/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODEL, prompt, size: "1024x1024" }),
    signal: AbortSignal.timeout(120000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${(await res.text()).slice(0, 120)}`);
  const data = await res.json();
  const url = data?.data?.[0]?.url;
  if (!url) throw new Error("no image url");
  const img = await fetch(url, { signal: AbortSignal.timeout(90000) });
  if (!img.ok) throw new Error(`download ${img.status}`);
  await mkdir(IMG_DIR, { recursive: true });
  await pipeline(img.body, createWriteStream(dest));
  return { cached: false };
}

async function generateWithRetry(s, attempt = 0) {
  try {
    return await generate(s);
  } catch (e) {
    const msg = String(e?.message ?? e);
    if (msg.includes("429") && attempt < 5) {
      await sleep(15000);
      return generateWithRetry(s, attempt + 1);
    }
    if (attempt < 2) {
      await sleep(4000);
      return generateWithRetry(s, attempt + 1);
    }
    throw e;
  }
}

let cursor = 0;
let done = 0;
let failed = 0;

async function persist() {
  await writeFile(MEDIA_FILE, JSON.stringify({ ...media, species: map, updated_at: new Date().toISOString() }, null, 1));
}

function entry(slug) {
  return {
    url: `/media/endemic/${slug}-ai.png`,
    author: "AI 生成（智谱 CogView）",
    source_name: "智谱 AI",
    source_url: "https://open.bigmodel.cn",
    license: "AI 生成示意图，非真实摄影",
    license_url: "",
    commercial_use: false,
    verified: false,
    review_status: "sample",
    ai_generated: true,
  };
}

async function worker() {
  while (cursor < missing.length) {
    const s = missing[cursor++];
    try {
      const r = await generateWithRetry(s);
      const e = entry(s.slug);
      map[s.slug] = { hero: e, habitat: e, full: e };
      done += 1;
      if (done % 10 === 0) {
        console.log(`progress ${done}/${missing.length} failed=${failed} total=${Object.keys(map).length}`);
        await persist();
      }
      await sleep(r.cached ? 0 : 3000);
    } catch (e) {
      failed += 1;
      console.log(`fail ${s.slug}: ${String(e?.message ?? e).slice(0, 90)}`);
      await sleep(1500);
    }
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, worker));
await persist();
console.log(`done generated=${done} failed=${failed} total=${Object.keys(map).length}`);