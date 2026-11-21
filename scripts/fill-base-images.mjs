import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import path from "node:path";

const ROOT = process.cwd();
const SPECIES_FILE = path.join(ROOT, "lib/wildchina/species.ts");
const MEDIA_FILE = path.join(ROOT, "public/data/china-media.json");
const IMG_DIR = path.join(ROOT, "public/media/endemic");
const ZHIPU_KEY = process.env.ZHIPU_API_KEY ?? "";
const CONCURRENCY = Number(process.argv[2] ?? 2);

const ts = await readFile(SPECIES_FILE, "utf8");
const pairs = [];
for (const m of ts.matchAll(/slug:\s*"([^"]+)"/g)) {
  const seg = ts.slice(m.index, m.index + 600);
  const sci = seg.match(/scientificName:\s*"([^"]+)"/);
  if (sci) pairs.push({ slug: m[1], sci: sci[1] });
}
const media = JSON.parse(await readFile(MEDIA_FILE, "utf8"));
const map = media.species ?? {};
const missing = pairs.filter((p) => !map[p.slug]?.hero);
console.log(`base=${pairs.length} with-image=${pairs.length - missing.length} missing=${missing.length}`);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const UA = "WILDWORLD-Museum/1.0";

async function getJSON(url, attempt = 0) {
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(30000) });
    if (res.status === 429) {
      if (attempt >= 3) throw new Error("429");
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

const LICENSE_URL = {
  cc0: "https://creativecommons.org/publicdomain/zero/1.0/",
  "cc-by": "https://creativecommons.org/licenses/by/4.0/",
  "cc-by-sa": "https://creativecommons.org/licenses/by-sa/4.0/",
  "cc-by-nc": "https://creativecommons.org/licenses/by-nc/4.0/",
  "cc-by-nc-sa": "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

function licenseOf(url) {
  const s = String(url || "").toLowerCase();
  if (s.includes("publicdomain/zero")) return "cc0";
  if (s.includes("licenses/by-nc-sa")) return "cc-by-nc-sa";
  if (s.includes("licenses/by-nc")) return "cc-by-nc";
  if (s.includes("licenses/by-sa")) return "cc-by-sa";
  if (s.includes("licenses/by")) return "cc-by";
  return "";
}

async function fromINat(sci) {
  const search = await getJSON(`https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(sci)}&locale=zh-CN&per_page=5`);
  const exact = (search.results ?? []).find((t) => (t.name || "").toLowerCase() === sci.toLowerCase() && t.is_active !== false);
  if (!exact) return [];
  const detail = await getJSON(`https://api.inaturalist.org/v1/taxa/${exact.id}?locale=zh-CN`);
  const taxon = detail.results?.[0] ?? exact;
  const candidates = [...(taxon.default_photo ? [taxon.default_photo] : []), ...(taxon.taxon_photos ?? []).map((p) => p.photo)];
  const out = [];
  const seen = new Set();
  for (const p of candidates) {
    if (!p?.id) continue;
    const code = (p.license_code || "").toLowerCase();
    if (!code || code === "all-rights-reserved" || seen.has(p.id)) continue;
    seen.add(p.id);
    const url = (p.medium_url || p.url || "").replace("/medium.jpeg", "/large.jpeg").replace("/square.jpeg", "/large.jpeg");
    if (!url) continue;
    out.push({
      url,
      author: p.attribution_name || "iNaturalist contributor",
      source_name: "iNaturalist",
      source_url: `https://www.inaturalist.org/photos/${p.id}`,
      license: code.toUpperCase().replace("CC-", "CC "),
      license_url: LICENSE_URL[code] ?? "",
      commercial_use: ["cc0", "cc-by", "cc-by-sa"].includes(code),
      verified: true,
      review_status: "editorial",
      ai_generated: false,
    });
    if (out.length >= 2) break;
  }
  return out;
}

async function fromGBIF(sci) {
  const match = await getJSON(`https://api.gbif.org/v1/species/match?name=${encodeURIComponent(sci)}`);
  if (!match?.usageKey || match.matchType === "NONE") return [];
  const occ = await getJSON(`https://api.gbif.org/v1/occurrence/search?taxonKey=${match.usageKey}&mediaType=StillImage&limit=8`);
  const out = [];
  for (const r of occ.results ?? []) {
    for (const m of r.media ?? []) {
      const code = licenseOf(m.license);
      if (!code || !m.identifier) continue;
      if (out.some((x) => x.url === m.identifier)) continue;
      out.push({
        url: m.identifier,
        author: m.creator || m.rightsHolder || "GBIF 记录贡献者",
        source_name: "GBIF",
        source_url: m.references || m.identifier,
        license: code.toUpperCase().replace("CC-", "CC "),
        license_url: m.license,
        commercial_use: ["cc0", "cc-by", "cc-by-sa"].includes(code),
        verified: true,
        review_status: "editorial",
        ai_generated: false,
      });
      if (out.length >= 2) break;
    }
    if (out.length >= 2) break;
  }
  return out;
}

async function fromZhipu(slug, sci, cn) {
  if (!ZHIPU_KEY) return null;
  const dest = path.join(IMG_DIR, `${slug}-ai.png`);
  const prompt = `realistic wildlife photograph of ${sci} (${cn}), full body in natural habitat, scientific reference, soft natural light, no text`;
  const res = await fetch("https://open.bigmodel.cn/api/paas/v4/images/generations", {
    method: "POST",
    headers: { Authorization: `Bearer ${ZHIPU_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "cogview-3-flash", prompt, size: "1024x1024" }),
    signal: AbortSignal.timeout(120000),
  });
  if (!res.ok) throw new Error(`zhipu ${res.status}`);
  const data = await res.json();
  const url = data?.data?.[0]?.url;
  if (!url) throw new Error("no url");
  const img = await fetch(url, { signal: AbortSignal.timeout(90000) });
  if (!img.ok) throw new Error(`download ${img.status}`);
  await mkdir(IMG_DIR, { recursive: true });
  await pipeline(img.body, createWriteStream(dest));
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

let cursor = 0;
let done = 0;
let failed = 0;

async function worker() {
  while (cursor < missing.length) {
    const s = missing[cursor++];
    try {
      let imgs = [];
      try {
        imgs = await fromINat(s.sci);
      } catch {
        imgs = [];
      }
      if (imgs.length === 0) {
        try {
          imgs = await fromGBIF(s.sci);
        } catch {
          imgs = [];
        }
      }
      if (imgs.length === 0) {
        const ai = await fromZhipu(s.slug, s.sci, s.slug);
        if (ai) imgs = [ai, ai];
      }
      if (imgs.length === 0) throw new Error("no image source");
      map[s.slug] = { hero: imgs[0], full: imgs[1] ?? imgs[0] };
      done += 1;
      console.log(`ok ${s.slug} <- ${imgs[0].source_name}${imgs[0].ai_generated ? " (AI)" : ""}`);
      await writeFile(MEDIA_FILE, JSON.stringify({ ...media, species: map }, null, 1));
      await sleep(400);
    } catch (e) {
      failed += 1;
      console.log(`fail ${s.slug}: ${String(e?.message ?? e).slice(0, 70)}`);
      await sleep(1000);
    }
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, worker));
await writeFile(MEDIA_FILE, JSON.stringify({ ...media, species: map }, null, 1));
console.log(`done filled=${done} failed=${failed} total=${Object.keys(map).length}`);