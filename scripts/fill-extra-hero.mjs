import { readFile, writeFile, mkdir, stat } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import path from "node:path";

const ROOT = process.cwd();
const KEY = process.env.ZHIPU_API_KEY ?? "7c61ffeb65bc41d8aed1e65b9abca6a7.1fhPXM2NkrBTb6sY";
const SPECIES = path.join(ROOT, "public/data/china-species-extra.json");
const MEDIA = path.join(ROOT, "public/data/china-media-extra.json");
const IMG_DIR = path.join(ROOT, "public/media/extra");

const species = JSON.parse(await readFile(SPECIES, "utf8"));
const media = JSON.parse(await readFile(MEDIA, "utf8"));
const map = media.species ?? {};
const missing = species.filter((s) => !map[s.slug]?.hero);
console.log(`missing hero: ${missing.length}`);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function generateOnce(s) {
  const dest = path.join(IMG_DIR, `${s.slug}-ai.png`);
  try {
    const st = await stat(dest);
    if (st.size > 10000) return;
  } catch {
    // miss
  }
  const prompt = `realistic wildlife photograph of ${s.scientificName} (${s.nameCn}) in natural habitat, full body, scientific reference, no text, no watermark`;
  const res = await fetch("https://open.bigmodel.cn/api/paas/v4/images/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "cogview-3-flash", prompt, size: "1024x1024" }),
    signal: AbortSignal.timeout(120000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const url = data?.data?.[0]?.url;
  if (!url) throw new Error("no url");
  const img = await fetch(url, { signal: AbortSignal.timeout(60000) });
  if (!img.ok) throw new Error(`download ${img.status}`);
  await mkdir(IMG_DIR, { recursive: true });
  await pipeline(img.body, createWriteStream(dest));
}

async function generate(s, attempt = 0) {
  try {
    return await generateOnce(s);
  } catch (e) {
    if (String(e?.message ?? e).includes("429") && attempt < 5) {
      await sleep(15000);
      return generate(s, attempt + 1);
    }
    if (attempt < 2) {
      await sleep(5000);
      return generate(s, attempt + 1);
    }
    throw e;
  }
}

let ok = 0;
let failed = 0;
for (const s of missing) {
  try {
    await generate(s);
    const image = {
      url: `/media/extra/${s.slug}-ai.png`,
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
    map[s.slug] = { ...(map[s.slug] ?? {}), hero: image, full: image };
    ok += 1;
    console.log(`ok ${s.slug}`);
  } catch (e) {
    failed += 1;
    console.log(`fail ${s.slug}: ${String(e?.message ?? e).slice(0, 60)}`);
  }
  await sleep(2500);
}

await writeFile(MEDIA, JSON.stringify({ ...media, species: map }, null, 1));
console.log(`done ok=${ok} failed=${failed}`);