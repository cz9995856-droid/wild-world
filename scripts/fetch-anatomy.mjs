import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const MODELS_FILE = path.join(ROOT, "lib/wildchina/endemic-models.ts");
const OUT_FILE = path.join(ROOT, "public/data/endemic-anatomy.json");
const KEY = process.env.ZOOLOGY_API_KEY ?? "60803da48d6f4f2cb94ea6e05ed50688";
const CONCURRENCY = Number(process.argv[2] ?? 4);

const DBASE = {
  mammal: "中国哺乳动物数据库",
  bird: "中国鸟类数据库",
  reptile: "中国爬行动物数据库",
  fish: "中国内陆水体鱼类数据库",
  amphibian: "中国两栖动物",
};

const ts = await readFile(MODELS_FILE, "utf8");
const entries = [];
for (const m of ts.matchAll(/\{ slug: "([^"]+)", label: "([^"]+)", group: "([^"]+)", kind: "([a-z-]+)", scientificName: "([^"]+)" \}/g)) {
  entries.push({ slug: m[1], label: m[2], group: m[3], kind: m[4], scientificName: m[5] });
}
console.log(`entries=${entries.length}`);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchDescription(entry) {
  const body = new URLSearchParams({
    scientificName: entry.scientificName,
    dbaseName: DBASE[entry.group] ?? "中国动物志数据库",
    descriptionType: "1",
  });
  const res = await fetch(`http://zoology.especies.cn/api/v1/description?apiKey=${encodeURIComponent(KEY)}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

const out = {};
let cursor = 0;
let filled = 0;
let empty = 0;
let failed = 0;

async function persist() {
  await mkdir(path.dirname(OUT_FILE), { recursive: true });
  await writeFile(
    OUT_FILE,
    JSON.stringify({ generated_at: new Date().toISOString(), source: "动物科普数据 API（中国动物志/鸟类志等）", count: filled, entries: out }, null, 1)
  );
}

async function worker() {
  while (cursor < entries.length) {
    const e = entries[cursor++];
    try {
      const data = await fetchDescription(e);
      const info = data?.data?.DescriptionInfo ?? [];
      const text = info
        .map((x) => (x.descontent || "").replace(/<br\s*\/?>/g, "\n").replace(/<[^>]+>/g, "").trim())
        .filter(Boolean)
        .join("\n");
      if (data?.code === 200 && text) {
        const refs = info.flatMap((x) => x.refs ?? []).filter(Boolean).slice(0, 2);
        out[e.slug] = {
          scientificName: e.scientificName,
          label: e.label,
          group: e.group,
          description: text,
          refs,
          source_name: "动物科普数据 API",
          source_url: "http://zoology.especies.cn/",
        };
        filled += 1;
        if (filled % 10 === 0) {
          console.log(`progress filled=${filled} empty=${empty} failed=${failed} total=${cursor}/${entries.length}`);
          await persist();
        }
      } else {
        empty += 1;
      }
      await sleep(250);
    } catch (err) {
      failed += 1;
      console.log(`fail ${e.slug}: ${String(err?.message ?? err).slice(0, 60)}`);
      await sleep(1200);
    }
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, worker));
await persist();
console.log(`done filled=${filled} empty=${empty} failed=${failed}`);