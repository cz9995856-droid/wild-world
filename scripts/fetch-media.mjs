import { readFile, writeFile, mkdir, stat, copyFile } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import path from "node:path";

const ROOT = process.cwd();
const UA = "WILDWORLD-Museum/1.0 (+https://wildworld.example.org; educational museum project)";
const INAT = "https://api.inaturalist.org/v1";
const GBIF = "https://api.gbif.org/v1";
const SPECIES = JSON.parse(await readFile(path.join(ROOT, "scripts/species.json"), "utf8"));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJSON(url, attempt = 0) {
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" } });
    if (res.status === 429) {
      if (attempt > 3) throw new Error("rate limited");
      await sleep(5000 * (attempt + 1));
      return getJSON(url, attempt + 1);
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    if (attempt < 2) {
      await sleep(1500);
      return getJSON(url, attempt + 1);
    }
    throw err;
  }
}

const LICENSE_URL = {
  cc0: "https://creativecommons.org/publicdomain/zero/1.0/",
  "cc-by": "https://creativecommons.org/licenses/by/4.0/",
  "cc-by-sa": "https://creativecommons.org/licenses/by-sa/4.0/",
  "cc-by-nc": "https://creativecommons.org/licenses/by-nc/4.0/",
  "cc-by-nc-sa": "https://creativecommons.org/licenses/by-nc-sa/4.0/",
  "cc-by-nd": "https://creativecommons.org/licenses/by-nd/4.0/",
  "cc-by-nc-nd": "https://creativecommons.org/licenses/by-nc-nd/4.0/",
};

const licenseOf = (code) => (code || "").toLowerCase();
const commercial = (code) => ["cc0", "cc-by", "cc-by-sa"].includes(licenseOf(code));
const derivatives = (code) => !licenseOf(code).endsWith("-nd");
const redistributable = (code) => ["cc0", "cc-by", "cc-by-sa"].includes(licenseOf(code));

async function exists(dest) {
  try {
    const s = await stat(dest);
    return s.size > 1000;
  } catch {
    return false;
  }
}

async function download(url, dest) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`download HTTP ${res.status}`);
  const type = res.headers.get("content-type") || "";
  if (!/image|audio|mpeg|octet/.test(type)) throw new Error(`unexpected content-type ${type}`);
  await mkdir(path.dirname(dest), { recursive: true });
  await pipeline(res.body, createWriteStream(dest));
}

const photos = [];
const sounds = [];
const external = {};
const errors = [];

async function writeIntegration(hero = []) {
  await mkdir(path.join(ROOT, "public/data"), { recursive: true });
  await writeFile(
    path.join(ROOT, "public/data/integration.json"),
    JSON.stringify(
      {
        generated_at: new Date().toISOString(),
        provider: "iNaturalist Open Data + GBIF Species API",
        photos,
        sounds,
        species: external,
        hero,
        errors,
      },
      null,
      2
    )
  );
}

for (const s of SPECIES) {
  try {
    const match = await getJSON(`${GBIF}/species/match?name=${encodeURIComponent(s.sci)}`);
    const gbifKey = match?.usageKey ?? null;
    const taxonSearch = await getJSON(`${INAT}/taxa?q=${encodeURIComponent(s.sci)}&per_page=10&locale=en`);
    const exact = (taxonSearch.results || []).find(
      (t) => t.name?.toLowerCase() === s.sci.toLowerCase() && t.is_active !== false
    );
    if (!exact) throw new Error("iNaturalist taxon not found");
    await sleep(500);
    const detail = await getJSON(`${INAT}/taxa/${exact.id}`);
    const taxon = detail.results?.[0] ?? exact;
    const candidates = (taxon.taxon_photos || []).map((p) => p.photo).filter(Boolean);
    if (taxon.default_photo) candidates.unshift(taxon.default_photo);
    const seen = new Set();
    const usable = candidates.filter((p) => {
      const code = licenseOf(p.license_code);
      if (!code || code === "all-rights-reserved") return false;
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });

    let index = 0;
    for (const p of usable.slice(0, 4)) {
      const src = (p.medium_url || p.url || "")
        .replace(/\/medium\.jpg$/, "/large.jpg")
        .replace(/\/square\.jpg$/, "/large.jpg");
      if (!src) continue;
      const file = `public/media/species/${s.slug}-${String(index + 1).padStart(2, "0")}.jpg`;
      if (!(await exists(path.join(ROOT, file)))) await download(src, path.join(ROOT, file));
      photos.push({
        id: `ph-inat-${p.id}`,
        species_slug: s.slug,
        url: `/${file.replace(/^public\//, "")}`,
        width: p.original_dimensions?.width ?? null,
        height: p.original_dimensions?.height ?? null,
        author: p.attribution_name || p.attribution || "iNaturalist contributor",
        source_name: "iNaturalist",
        source_url: `https://www.inaturalist.org/photos/${p.id}`,
        source_record_id: String(p.id),
        license: licenseOf(p.license_code).toUpperCase().replace("CC-", "CC "),
        license_url: LICENSE_URL[licenseOf(p.license_code)] ?? null,
        attribution: p.attribution || `${p.attribution_name || "Unknown"} (${p.license_code})`,
        commercial_use: commercial(p.license_code),
        derivatives_allowed: derivatives(p.license_code),
        download_allowed: redistributable(p.license_code),
        retrieved_at: new Date().toISOString(),
        verified: true,
        review_status: "verified",
      });
      index += 1;
      await sleep(250);
    }

    try {
      const obs = await getJSON(
        `${INAT}/observations?taxon_name=${encodeURIComponent(s.sci)}&sounds=true&quality_grade=research&per_page=8&order_by=observed_on`
      );
      let soundIndex = 0;
      for (const o of obs.results || []) {
        for (const snd of o.sounds || []) {
          const code = licenseOf(snd.license_code);
          if (!code) continue;
          const orig = snd.file_url || "";
          if (!orig) continue;
          const ext = (orig.split("?")[0].match(/\.(m4a|mp3|wav|ogg)$/i) || [])[1]?.toLowerCase() ?? "m4a";
          const name = `${s.slug}-${String(soundIndex + 1).padStart(2, "0")}.${ext}`;
          const local = `public/media/sounds/${name}`;
          if (!(await exists(path.join(ROOT, local)))) await download(orig, path.join(ROOT, local));
          sounds.push({
            id: `au-inat-${snd.id}`,
            species_slug: s.slug,
            title: `${s.cn} · 野外录音 ${soundIndex + 1}`,
            url: `/media/sounds/${name}`,
            source_name: "iNaturalist",
            source_url: `https://www.inaturalist.org/observations/${o.id}`,
            source_record_id: String(snd.id),
            recordist: snd.attribution_name || "iNaturalist contributor",
            license: code.toUpperCase().replace("CC-", "CC "),
            license_url: LICENSE_URL[code] ?? "",
            location: o.place_guess || "地点未公开",
            recorded_at: o.observed_on || o.time_observed_at || "",
            sound_type: snd.sound_type || "未标注",
            retrieved_at: new Date().toISOString(),
            commercial_use: commercial(code),
            derivatives_allowed: derivatives(code),
            verified: true,
            review_status: "verified",
          });
          soundIndex += 1;
          await sleep(200);
          if (soundIndex >= 2) break;
        }
        if (soundIndex >= 2) break;
      }
    } catch (e) {
      errors.push({ slug: s.slug, kind: "sounds", message: String(e.message || e) });
    }

    external[s.slug] = {
      gbif_key: gbifKey,
      inat_taxon_id: exact.id,
      inat_common_name: taxon.preferred_common_name || s.en,
      gbif_status: match?.status ?? null,
      gbif_rank: match?.rank ?? null,
    };
    console.log(`ok ${s.slug} photos=${index} gbif=${gbifKey} inat=${exact.id}`);
    await writeIntegration();
  } catch (e) {
    console.error(`fail ${s.slug}: ${e.message || e}`);
    errors.push({ slug: s.slug, kind: "taxon", message: String(e.message || e) });
    external[s.slug] = { gbif_key: null, inat_taxon_id: null };
  }
  await sleep(600);
}

const landscape = photos
  .filter((p) => p.width && p.height && p.width / p.height >= 1.25)
  .sort((a, b) => b.width * b.height - a.width * a.height);
const hero = [];
const picked = new Set();
for (const p of landscape) {
  if (picked.has(p.species_slug)) continue;
  picked.add(p.species_slug);
  const dest = `public/media/hero/hero-${String(hero.length + 1).padStart(2, "0")}.jpg`;
  await copyFile(path.join(ROOT, "public", p.url), path.join(ROOT, dest));
  hero.push(`/${dest.replace(/^public\//, "")}`);
  if (hero.length >= 4) break;
}

await writeIntegration(hero);
console.log(`done photos=${photos.length} sounds=${sounds.length} hero=${hero.length} errors=${errors.length}`);