import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const SITE = process.env.SITE_URL ?? "https://wild-world-museum.pages.dev";
const OUT = path.join(ROOT, "public/data/home-lqip.json");
const PER_GROUP = 10;
const CONCURRENCY = 4;

const groups = ["mammal", "bird", "reptile", "fish", "amphibian"];
const species = [];
for (const f of ["china-species-amphibians.json", "china-species-extra.json"]) {
  try {
    species.push(...JSON.parse(await readFile(path.join(ROOT, "public/data", f), "utf8")));
  } catch {
    // ignore
  }
}

const media = {};
for (const f of ["china-media.json", "china-media-amphibians.json", "china-media-extra.json", "china-media-habitat.json"]) {
  try {
    Object.assign(media, JSON.parse(await readFile(path.join(ROOT, "public/data", f), "utf8")).species ?? {});
  } catch {
    // ignore
  }
}

const targets = [];
for (const group of groups) {
  const list = species.filter((s) => s.group === group && media[s.slug]?.hero);
  targets.push(...list.slice(0, PER_GROUP).map((s) => ({ slug: s.slug, url: media[s.slug].hero.url })));
}
console.log(`targets=${targets.length}`);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const out = {};
let done = 0;
let failed = 0;

async function one(target) {
  const absolute = target.url.startsWith("http") ? target.url : `${SITE}${target.url}`;
  const res = await fetch(absolute, { signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const small = await sharp(buf).resize({ width: 24 }).webp({ quality: 40 }).toBuffer();
  out[target.slug] = `data:image/webp;base64,${small.toString("base64")}`;
}

let cursor = 0;
async function worker() {
  while (cursor < targets.length) {
    const target = targets[cursor++];
    try {
      await one(target);
      done += 1;
      if (done % 10 === 0) console.log(`progress ${done}/${targets.length}`);
      await sleep(200);
    } catch (e) {
      failed += 1;
      console.log(`fail ${target.slug}: ${String(e?.message ?? e).slice(0, 50)}`);
      await sleep(400);
    }
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, worker));
await writeFile(OUT, JSON.stringify({ generated_at: new Date().toISOString(), placeholders: out }, null, 1));
console.log(`done ok=${done} failed=${failed}`);