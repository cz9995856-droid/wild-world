import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const FILE = path.join(ROOT, "public/data/china-species-amphibians.json");
const KEY = process.env.ZOOLOGY_API_KEY;
const DBASE = process.env.ZOOLOGY_DBASE ?? "中国两栖动物";
const CONCURRENCY = Number(process.argv[2] ?? 3);

if (!KEY) {
  console.error("missing ZOOLOGY_API_KEY");
  process.exit(1);
}

const species = JSON.parse(await readFile(FILE, "utf8"));
console.log(`dbase=${DBASE} species=${species.length}`);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchDescription(name) {
  const body = new URLSearchParams({ scientificName: name, dbaseName: DBASE, descriptionType: "1" });
  const res = await fetch(`http://zoology.especies.cn/api/v1/description?apiKey=${encodeURIComponent(KEY)}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

let cursor = 0;
let filled = 0;
let empty = 0;
let failed = 0;

async function persist() {
  await writeFile(FILE, JSON.stringify(species, null, 1));
}

async function worker() {
  while (cursor < species.length) {
    const s = species[cursor++];
    try {
      const data = await fetchDescription(s.scientificName);
      const info = data?.data?.DescriptionInfo ?? [];
      const desc = info.map((x) => x.descontent).filter(Boolean).join("\n");
      if (data?.code === 200 && desc) {
        s.morphology = desc.slice(0, 900);
        const refs = info.flatMap((x) => x.refs ?? []).filter(Boolean).slice(0, 3);
        const sources = s.sources ?? [];
        if (!sources.some((x) => x.name.includes("中国动物志"))) {
          sources.push({
            name: "中国动物志（动物科普数据 API）",
            url: "http://zoology.especies.cn/",
          });
          if (refs.length) {
            sources.push({ name: refs[0].slice(0, 120), url: "http://zoology.especies.cn/" });
          }
          s.sources = sources;
        }
        filled += 1;
        if (filled % 10 === 0) {
          console.log(`progress filled=${filled} empty=${empty} failed=${failed} total=${cursor}/${species.length}`);
          await persist();
        }
      } else {
        empty += 1;
      }
      await sleep(250);
    } catch (e) {
      failed += 1;
      console.log(`fail ${s.slug}: ${String(e?.message ?? e).slice(0, 70)}`);
      await sleep(1200);
    }
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, worker));
await persist();
console.log(`done filled=${filled} empty=${empty} failed=${failed} total=${species.length}`);