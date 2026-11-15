import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const SPECIES_FILE = path.join(ROOT, "public/data/china-species-amphibians.json");
const MEDIA_FILE = path.join(ROOT, "public/data/china-media-amphibians.json");
const CONCURRENCY = Number(process.argv[2] ?? 3);

const species = JSON.parse(await readFile(SPECIES_FILE, "utf8"));
const media = JSON.parse(await readFile(MEDIA_FILE, "utf8"));
const map = media.species ?? {};
const missing = species.filter((s) => !map[s.slug]);
console.log(`species=${species.length} with-image=${Object.keys(map).length} missing=${missing.length}`);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJSON(url, attempt = 0) {
  try {
    const res = await fetch(url, { headers: { "User-Agent": "WILDWORLD-Museum/1.0" }, signal: AbortSignal.timeout(30000) });
    if (res.status === 429) {
      if (attempt >= 3) throw new Error("rate limited");
      await sleep(3000 * (attempt + 1));
      return getJSON(url, attempt + 1);
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    if (attempt < 2) {
      await sleep(1200);
      return getJSON(url, attempt + 1);
    }
    throw e;
  }
}

function licenseOf(url) {
  const s = String(url || "").toLowerCase();
  if (s.includes("publicdomain/zero")) return "cc0";
  if (s.includes("licenses/by-nc-sa")) return "cc-by-nc-sa";
  if (s.includes("licenses/by-nc-nd")) return "cc-by-nc-nd";
  if (s.includes("licenses/by-nc")) return "cc-by-nc";
  if (s.includes("licenses/by-sa")) return "cc-by-sa";
  if (s.includes("licenses/by-nd")) return "cc-by-nd";
  if (s.includes("licenses/by")) return "cc-by";
  return "";
}

function toImage(m) {
  const code = licenseOf(m.license);
  if (!code) return null;
  const url = m.identifier;
  if (!url || !/^https?:\/\//.test(url)) return null;
  return {
    url,
    author: m.creator || m.rightsHolder || "GBIF 记录贡献者",
    source_name: "GBIF / iNaturalist",
    source_url: m.references || url,
    license: code.toUpperCase().replace("CC-", "CC "),
    license_url: m.license,
    commercial_use: ["cc0", "cc-by", "cc-by-sa"].includes(code),
    verified: true,
    review_status: "editorial",
    ai_generated: false,
  };
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
      const match = await getJSON(`https://api.gbif.org/v1/species/match?name=${encodeURIComponent(s.scientificName)}`);
      await sleep(150);
      if (!match?.usageKey || match.matchType === "NONE") throw new Error("no gbif match");
      const occ = await getJSON(
        `https://api.gbif.org/v1/occurrence/search?taxonKey=${match.usageKey}&mediaType=StillImage&limit=8`
      );
      await sleep(150);
      const images = [];
      for (const r of occ.results ?? []) {
        for (const m of r.media ?? []) {
          const img = toImage(m);
          if (img && !images.some((x) => x.url === img.url)) images.push(img);
          if (images.length >= 2) break;
        }
        if (images.length >= 2) break;
      }
      if (images.length === 0) throw new Error("no cc image");
      map[s.slug] = { hero: images[0], full: images[1] ?? images[0] };
      done += 1;
      if (done % 10 === 0) {
        console.log(`progress ${done}/${missing.length} failed=${failed} total=${Object.keys(map).length}`);
        await persist();
      }
    } catch (e) {
      failed += 1;
      if (failed % 10 === 0) console.log(`failed so far ${failed}: ${String(e?.message ?? e).slice(0, 60)}`);
    }
    await sleep(250);
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, worker));
await persist();
console.log(`done filled=${done} failed=${failed} total=${Object.keys(map).length}`);