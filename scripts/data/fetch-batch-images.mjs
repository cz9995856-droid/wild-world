import fs from "fs";
import path from "path";
import sharp from "sharp";

const root = process.cwd();
const list = JSON.parse(fs.readFileSync(path.join(root, "scripts/data/endemic-mammals-birds.json"), "utf8"));
const gbifBatch = JSON.parse(fs.readFileSync(path.join(root, "public/data/china-gbif-batch.json"), "utf8")).species;

const UA = "WILDWORLD-Museum/1.0 (+https://wild-world-museum.pages.dev; educational project)";
const INAT = "https://api.inaturalist.org/v1";
const OUT_DIR = path.join(root, "public/media/batch");
const CACHE_PATH = "/tmp/batch-images-cache.json";
const cache = fs.existsSync(CACHE_PATH) ? JSON.parse(fs.readFileSync(CACHE_PATH, "utf8")) : {};

fs.mkdirSync(OUT_DIR, { recursive: true });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getJSON(url, attempt = 0) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "application/json" },
      signal: AbortSignal.timeout(30000),
    });
    if (res.status === 429 && attempt < 4) {
      await sleep(4000 * (attempt + 1));
      return getJSON(url, attempt + 1);
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    if (attempt < 2) {
      await sleep(1500 * (attempt + 1));
      return getJSON(url, attempt + 1);
    }
    throw error;
  }
}

async function download(url, dest, attempt = 0) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "image/*" },
      signal: AbortSignal.timeout(90000),
    });
    if (res.status === 429 && attempt < 6) {
      await sleep(5000 * (attempt + 1));
      return download(url, dest, attempt + 1);
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const type = res.headers.get("content-type") ?? "";
    if (type && !/image\//i.test(type)) throw new Error(`not image: ${type.slice(0, 40)}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length < 2048) throw new Error(`too small: ${buffer.length}`);
    fs.writeFileSync(dest, buffer);
    return buffer.length;
  } catch (error) {
    if (attempt < 4) {
      await sleep(2600 * (attempt + 1));
      return download(url, dest, attempt + 1);
    }
    throw error;
  }
}

function sizedUrls(url) {
  const match = url.match(/\/(square|small|medium)\.(jpe?g|png)(\?.*)?$/i);
  if (!match) return [url];
  const stem = url.replace(/\/(square|small|medium)\.[a-z]+(\?.*)?$/i, "");
  const ext = match[2];
  return [`${stem}/large.${ext}`, `${stem}/medium.${ext}`, `${stem}/original.${ext}`];
}

async function downloadFirst(urls, dest) {
  const errors = [];
  for (const url of urls) {
    try {
      const size = await download(url, dest);
      return { url, size };
    } catch (error) {
      errors.push(`${url.split("/").slice(-1)[0]}: ${String(error).slice(0, 80)}`);
    }
  }
  throw new Error(errors.join(" | "));
}

const LICENSE_URL = {
  cc0: "https://creativecommons.org/publicdomain/zero/1.0/",
  "cc-by": "https://creativecommons.org/licenses/by/4.0/",
  "cc-by-sa": "https://creativecommons.org/licenses/by-sa/4.0/",
  "cc-by-nc": "https://creativecommons.org/licenses/by-nc/4.0/",
  "cc-by-nc-sa": "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

function licenseRank(code) {
  const value = (code ?? "").toLowerCase();
  if (!value || value === "all-rights-reserved") return 99;
  if (value.endsWith("-nd")) return 99;
  if (["cc0", "cc-by", "cc-by-sa"].includes(value)) return 0;
  if (["cc-by-nc", "cc-by-nc-sa"].includes(value)) return 1;
  return 99;
}

function licenseLabel(code) {
  return (code ?? "").toUpperCase().replace("CC0", "CC0 1.0").replace("CC-", "CC ");
}

function stripHtml(value) {
  return String(value ?? "")
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

async function inatPhotos(sci) {
  const search = await getJSON(`${INAT}/taxa?q=${encodeURIComponent(sci)}&rank=species&per_page=5`);
  const match = (search.results ?? []).find((item) => item.name === sci);
  if (!match) return [];
  const detail = await getJSON(`${INAT}/taxa/${match.id}`);
  const taxon = (detail.results ?? [])[0];
  if (!taxon) return [];
  const photos = [];
  const seen = new Set();
  for (const item of [...(taxon.default_photo ? [{ photo: taxon.default_photo }] : []), ...(taxon.taxon_photos ?? [])]) {
    const photo = item.photo ?? item;
    if (!photo?.id || seen.has(photo.id)) continue;
    if (licenseRank(photo.license_code) > 1) continue;
    seen.add(photo.id);
    const url = photo.url ?? "";
    if (!url || !/^https?:/.test(url)) continue;
    photos.push({
      url,
      photoId: photo.id,
      author: photo.attribution_name || stripHtml(photo.attribution) || "iNaturalist contributor",
      licenseCode: (photo.license_code ?? "").toLowerCase(),
      license: licenseLabel(photo.license_code),
      licenseUrl: LICENSE_URL[(photo.license_code ?? "").toLowerCase()] ?? "",
      sourceUrl: `https://www.inaturalist.org/photos/${photo.id}`,
      rank: licenseRank(photo.license_code),
    });
  }
  return photos.sort((a, b) => a.rank - b.rank || a.photoId - b.photoId);
}

const FREE_LICENSE = /^(cc0|cc by|cc-by|public domain|pd|cc by-sa|cc-by-sa)/i;

async function wikimediaPhotos(sci) {
  const url =
    "https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=" +
    encodeURIComponent(`${sci} filetype:bitmap`) +
    "&gsrnamespace=6&gsrlimit=8&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=1280&format=json";
  const data = await getJSON(url);
  const pages = Object.values(data.query?.pages ?? {});
  const photos = [];
  for (const page of pages) {
    const info = page.imageinfo?.[0];
    if (!info?.thumburl) continue;
    const meta = info.extmetadata ?? {};
    const licenseName = stripHtml(meta.LicenseShortName?.value ?? "");
    if (!FREE_LICENSE.test(licenseName)) continue;
    const commercial = !/nc|non-?commercial/i.test(licenseName);
    if (!commercial) continue;
    photos.push({
      url: info.thumburl,
      author: stripHtml(meta.Artist?.value ?? "") || "Wikimedia Commons contributor",
      license: licenseName,
      licenseUrl: meta.LicenseUrl?.value ?? "",
      sourceUrl: info.descriptionurl ?? page.title,
      sourceName: "Wikimedia Commons",
      commercial: true,
      rank: 0,
    });
  }
  return photos;
}

function prettyLicense(url) {
  const value = String(url ?? "").toLowerCase();
  if (value.includes("zero")) return "CC0 1.0";
  const m = value.match(/licenses\/([a-z-]+)\/(\d\.\d)/);
  if (m) return `CC ${m[1].toUpperCase()} ${m[2]}`;
  return url || "未标注";
}

async function gbifMedia(usageKey) {
  if (!usageKey) return [];
  const data = await getJSON(
    `https://api.gbif.org/v1/occurrence/search?taxonKey=${usageKey}&country=CN&mediaType=StillImage&limit=30`
  );
  const photos = [];
  for (const occ of data.results ?? []) {
    for (const media of occ.media ?? []) {
      const url = media.identifier;
      const license = String(media.license ?? media.rights ?? "");
      if (!url || !/^https?:/.test(url)) continue;
      const lic = license.toLowerCase();
      if (lic.includes("-nd") || lic.includes("/nd")) continue;
      const commercial =
        ((lic.includes("zero") || lic.includes("publicdomain")) && !lic.includes("nc")) ||
        ((lic.includes("/by/") || lic.includes("/by-sa/")) && !lic.includes("nc"));
      const rank = commercial ? 0 : lic.includes("nc") ? 1 : 99;
      if (rank === 99) continue;
      photos.push({
        url,
        author: media.rightsHolder || media.creator || occ.recordedBy || "GBIF 记录贡献者",
        license: prettyLicense(license),
        licenseUrl: license,
        sourceUrl: occ.references || `https://www.gbif.org/occurrence/${occ.key}`,
        sourceName: "GBIF 观测记录",
        commercial,
        rank,
      });
    }
  }
  return photos.sort((a, b) => a.rank - b.rank).slice(0, 5);
}

const pending = list.filter((item) => !cache[item.slug]?.ok);
console.log("total", list.length, "pending", pending.length);

for (let i = 0; i < pending.length; i += 1) {
  const item = pending[i];
  const record = { slug: item.slug, sci: item.sci };
  try {
    let photo = null;
    let source = "iNaturalist";
    const inat = await inatPhotos(item.sci);
    if (inat.length) {
      photo = inat[0];
    } else {
      const gbifPhotos = await gbifMedia(gbifBatch[item.slug]?.usageKey);
      if (gbifPhotos.length) {
        photo = gbifPhotos[0];
        source = "GBIF 观测记录";
      } else {
        const wiki = await wikimediaPhotos(item.sci).catch(() => []);
        if (wiki.length) {
          photo = wiki[0];
          source = "Wikimedia Commons";
        }
      }
    }
    if (!photo) {
      record.ok = false;
      record.reason = "no licensed photo";
    } else {
      const rawFile = `${item.slug}.raw`;
      const candidates = source === "iNaturalist" ? sizedUrls(photo.url) : [photo.url];
      const saved = await downloadFirst(candidates, path.join(OUT_DIR, rawFile));
      const finalFile = `${item.slug}.jpg`;
      await sharp(path.join(OUT_DIR, rawFile))
        .rotate()
        .resize({ width: 1400, withoutEnlargement: true })
        .flatten({ background: "#ffffff" })
        .jpeg({ quality: 82, mozjpeg: true })
        .toFile(path.join(OUT_DIR, finalFile));
      fs.unlinkSync(path.join(OUT_DIR, rawFile));
      record.ok = true;
      record.file = finalFile;
      record.author = photo.author;
      record.license = photo.license;
      record.licenseUrl = photo.licenseUrl;
      record.sourceUrl = photo.sourceUrl;
      record.sourceName = photo.sourceName ?? source;
      record.commercial = source === "Wikimedia Commons" ? true : photo.commercial ?? photo.rank === 0;
      record.bytes = saved.size;
    }
  } catch (error) {
    record.ok = false;
    record.reason = String(error).slice(0, 140);
  }
  cache[item.slug] = record;
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 1));
  if ((i + 1) % 10 === 0) console.log("done", i + 1, "/", pending.length);
  await sleep(320);
}

fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 1));

const species = {};
for (const [slug, record] of Object.entries(cache)) {
  if (!record.ok || !record.file) continue;
  const image = {
    url: `/media/batch/${record.file}`,
    author: record.author,
    source_name: record.sourceName,
    source_url: record.sourceUrl,
    license: record.license,
    license_url: record.licenseUrl,
    commercial_use: Boolean(record.commercial),
    verified: true,
    review_status: "editorial",
    ai_generated: false,
  };
  species[slug] = { hero: image, full: image };
}

fs.writeFileSync(
  path.join(root, "public/data/china-media-batch.json"),
  JSON.stringify(
    {
      source: "iNaturalist / GBIF 观测媒体 / Wikimedia Commons",
      retrievedAt: new Date().toISOString().slice(0, 10),
      note: "逐张记录作者、来源、许可；NC 素材仅用于非商业展示。",
      species,
    },
    null,
    1
  )
);

const ok = Object.values(cache).filter((record) => record.ok).length;
const fail = Object.values(cache).filter((record) => !record.ok);
const commercial = Object.values(cache).filter((record) => record.ok && record.commercial).length;
console.log(
  JSON.stringify(
    {
      total: Object.keys(cache).length,
      withImage: ok,
      commercial,
      failed: fail.map((record) => ({ slug: record.slug, reason: record.reason })),
    },
    null,
    1
  )
);