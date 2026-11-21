import { readFile, writeFile, mkdir, stat } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import path from "node:path";

const ROOT = process.cwd();
const IMG_DIR = path.join(ROOT, "public/media/endemic");
const SPECIES_FILE = path.join(ROOT, "public/data/china-species-amphibians.json");
const MEDIA_FILE = path.join(ROOT, "public/data/china-media-amphibians.json");
const CONCURRENCY = Number(process.argv[2] ?? 2);

const species = JSON.parse(await readFile(SPECIES_FILE, "utf8"));
const media = JSON.parse(await readFile(MEDIA_FILE, "utf8"));
const map = media.species ?? {};
const missing = species.filter((s) => !map[s.slug]);

console.log(`species=${species.length} with-image=${Object.keys(map).length} missing=${missing.length}`);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) h = (h * 31 + str.charCodeAt(i)) | 0;
  return h;
}

async function generateOnce(s) {
  const dest = path.join(IMG_DIR, `${s.slug}-ai.jpg`);
  try {
    const st = await stat(dest);
    if (st.size > 5000) return true;
  } catch {
    // miss
  }
  const prompt = `wildlife photography of ${s.scientificName}, ${s.englishName} in natural habitat, realistic, detailed, soft natural light, no text, no watermark`;
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=768&height=512&nologo=true&seed=${Math.abs(hash(s.slug))}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(120000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const type = res.headers.get("content-type") || "";
  if (!/image/.test(type)) throw new Error(`unexpected ${type}`);
  await mkdir(IMG_DIR, { recursive: true });
  await pipeline(res.body, createWriteStream(dest));
  return true;
}

async function generate(s, attempt = 0) {
  try {
    return await generateOnce(s);
  } catch (e) {
    if (attempt < 3) {
      await sleep(4000 * (attempt + 1));
      return generate(s, attempt + 1);
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

async function worker() {
  while (cursor < missing.length) {
    const s = missing[cursor++];
    try {
      await generate(s);
      map[s.slug] = {
        hero: {
          url: `/media/endemic/${s.slug}-ai.jpg`,
          author: "AI 生成（Pollinations）",
          source_name: "Pollinations.ai",
          source_url: "https://pollinations.ai",
          license: "AI 生成示意图，非真实摄影",
          license_url: "",
          commercial_use: false,
          verified: false,
          review_status: "sample",
          ai_generated: true,
        },
        full: {
          url: `/media/endemic/${s.slug}-ai.jpg`,
          author: "AI 生成（Pollinations）",
          source_name: "Pollinations.ai",
          source_url: "https://pollinations.ai",
          license: "AI 生成示意图，非真实摄影",
          license_url: "",
          commercial_use: false,
          verified: false,
          review_status: "sample",
          ai_generated: true,
        },
      };
      done += 1;
      if (done % 10 === 0) {
        console.log(`progress ${done}/${missing.length} failed=${failed}`);
        await persist();
      }
    } catch (e) {
      failed += 1;
      console.log(`fail ${s.slug}: ${String(e?.message ?? e).slice(0, 60)}`);
    }
    await sleep(800);
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, worker));
await persist();
console.log(`done generated=${done} failed=${failed} total=${Object.keys(map).length}`);