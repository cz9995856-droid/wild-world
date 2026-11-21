import { readFile, writeFile, mkdir, stat } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import path from "node:path";

const ROOT = process.cwd();
const KEY = process.env.ZHIPU_API_KEY ?? "7c61ffeb65bc41d8aed1e65b9abca6a7.1fhPXM2NkrBTb6sY";
const MODEL = process.env.ZHIPU_IMAGE_MODEL ?? "cogview-3-flash";
const CONCURRENCY = Number(process.argv[2] ?? 2);
const LIMIT = Number(process.argv[3] ?? 0);

const FILES = ["china-media.json", "china-media-amphibians.json", "china-media-extra.json"];
const OUT = path.join(ROOT, "public/data/china-media-habitat.json");
const IMG_DIR = path.join(ROOT, "public/media/habitat");

const media = {};
for (const f of FILES) {
  try {
    const d = JSON.parse(await readFile(path.join(ROOT, "public/data", f), "utf8"));
    Object.assign(media, d.species ?? {});
  } catch {
    // missing file
  }
}

const speciesLists = [];
for (const f of ["china-species-amphibians.json", "china-species-extra.json"]) {
  try {
    speciesLists.push(...JSON.parse(await readFile(path.join(ROOT, "public/data", f), "utf8")));
  } catch {
    // ignore
  }
}

const BASE_SPECIES = [
  { slug: "giant-panda", group: "mammal" },
  { slug: "chinese-alligator", group: "reptile" },
  { slug: "milu", group: "mammal" },
  { slug: "sichuan-snub-nosed-monkey", group: "mammal" },
  { slug: "yunnan-snub-nosed-monkey", group: "mammal" },
  { slug: "guizhou-snub-nosed-monkey", group: "mammal" },
  { slug: "hainan-gibbon", group: "mammal" },
  { slug: "south-china-tiger", group: "mammal" },
  { slug: "przewalski-gazelle", group: "mammal" },
  { slug: "tibetan-antelope", group: "mammal" },
  { slug: "brown-eared-pheasant", group: "bird" },
  { slug: "chinese-monal", group: "bird" },
  { slug: "chinese-giant-salamander", group: "amphibian" },
  { slug: "baiji", group: "mammal" },
];
speciesLists.push(...BASE_SPECIES);

const need = speciesLists.filter((s) => !media[s.slug]?.habitat).slice(0, LIMIT || undefined);
console.log(`total=${speciesLists.length} need-habitat=${need.length}`);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const HABITAT = {
  mammal: "temperate mountain forest, mossy rocks and understory, misty morning light",
  bird: "montane forest edge and wetland, reeds and scattered trees, soft daylight",
  reptile: "rocky forest slope with leaf litter, dappled light, damp microhabitat",
  fish: "clear freshwater river with gravel bed and flowing water, submerged stones",
  amphibian: "mountain stream with mossy stones and clear flowing water, humid forest",
};

async function generate(s) {
  const dest = path.join(IMG_DIR, `${s.slug}-habitat-ai.png`);
  try {
    const st = await stat(dest);
    if (st.size > 10000) return true;
  } catch {
    // miss
  }
  const prompt = `natural habitat landscape of ${HABITAT[s.group] ?? HABITAT.mammal}, no animals, no people, no text, realistic nature documentary photography, China`;
  const res = await fetch("https://open.bigmodel.cn/api/paas/v4/images/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODEL, prompt, size: "1024x1024" }),
    signal: AbortSignal.timeout(120000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const url = data?.data?.[0]?.url;
  if (!url) throw new Error("no image url");
  const img = await fetch(url, { signal: AbortSignal.timeout(60000) });
  if (!img.ok) throw new Error(`download ${img.status}`);
  await mkdir(IMG_DIR, { recursive: true });
  await pipeline(img.body, createWriteStream(dest));
  return false;
}

const out = {};
let cursor = 0;
let done = 0;
let failed = 0;

async function persist() {
  await writeFile(
    OUT,
    JSON.stringify({ generated_at: new Date().toISOString(), note: "栖息环境示意图（AI 生成，仅示意）", species: out }, null, 1)
  );
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
      await sleep(5000);
      return generateWithRetry(s, attempt + 1);
    }
    throw e;
  }
}

async function worker() {
  while (cursor < need.length) {
    const s = need[cursor++];
    try {
      await generateWithRetry(s);
      out[s.slug] = {
        habitat: {
          url: `/media/habitat/${s.slug}-habitat-ai.png`,
          author: "AI 生成（智谱 CogView）",
          source_name: "智谱 AI",
          source_url: "https://open.bigmodel.cn",
          license: "AI 生成生境示意图，非实地摄影",
          license_url: "",
          commercial_use: false,
          verified: false,
          review_status: "sample",
          ai_generated: true,
        },
      };
      done += 1;
      if (done % 10 === 0) {
        console.log(`progress ${done}/${need.length} failed=${failed}`);
        await persist();
      }
      await sleep(2500);
    } catch (e) {
      failed += 1;
      if (failed % 10 === 0) console.log(`fail ${s.slug}: ${String(e?.message ?? e).slice(0, 60)}`);
      await sleep(3000);
    }
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, worker));
await persist();
console.log(`done generated=${done} failed=${failed} total=${Object.keys(out).length}`);