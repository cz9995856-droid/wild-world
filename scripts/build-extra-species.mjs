import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const LIST = JSON.parse(await readFile(path.join(ROOT, "scripts/extra-species.json"), "utf8"));
const ZKEY = process.env.ZOOLOGY_API_KEY ?? "60803da48d6f4f2cb94ea6e05ed50688";
const CONCURRENCY = Number(process.argv[2] ?? 3);
const UA = "WILDWORLD-Museum/1.0";

const GROUP_META = {
  mammal: { label: "哺乳纲", cn: "哺乳动物" },
  bird: { label: "鸟纲", cn: "鸟类" },
  reptile: { label: "爬行纲", cn: "爬行动物" },
  fish: { label: "硬骨鱼纲", cn: "鱼类" },
};

const DBASE = {
  mammal: "中国哺乳动物数据库",
  bird: "中国鸟类数据库",
  reptile: "中国爬行动物数据库",
  fish: "中国内陆水体鱼类数据库",
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJSON(url, attempt = 0) {
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(30000) });
    if (res.status === 429 && attempt < 3) {
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

async function zoologyDescription(entry) {
  try {
    const body = new URLSearchParams({
      scientificName: entry.sci,
      dbaseName: DBASE[entry.group] ?? "中国动物志数据库",
      descriptionType: "1",
    });
    const res = await fetch(`http://zoology.especies.cn/api/v1/description?apiKey=${encodeURIComponent(ZKEY)}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) return "";
    const data = await res.json();
    const info = data?.data?.DescriptionInfo ?? [];
    return info
      .map((x) => (x.descontent || "").replace(/<br\s*\/?>/g, "\n").replace(/<[^>]+>/g, "").trim())
      .filter(Boolean)
      .join("\n");
  } catch {
    return "";
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

function pickPhotos(taxon) {
  const out = [];
  const seen = new Set();
  const list = [...(taxon.default_photo ? [taxon.default_photo] : []), ...(taxon.taxon_photos ?? []).map((p) => p.photo)];
  for (const p of list) {
    if (!p?.id) continue;
    const code = (p.license_code || "").toLowerCase();
    if (!code || code === "all-rights-reserved" || seen.has(p.id)) continue;
    seen.add(p.id);
    const url = (p.medium_url || p.url || "").replace(/\/medium\.(jpe?g)/, "/large.$1").replace(/\/square\.(jpe?g)/, "/large.$1");
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
    if (out.length >= 3) break;
  }
  return out;
}

const species = [];
const media = {};
let cursor = 0;
let failed = 0;

async function build(entry, index) {
  const search = await getJSON(`https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(entry.sci)}&locale=zh-CN&per_page=5`).catch(() => null);
  const exact = (search?.results ?? []).find((t) => (t.name || "").toLowerCase() === entry.sci.toLowerCase());
  let taxon = exact ?? null;
  if (exact) {
    const detail = await getJSON(`https://api.inaturalist.org/v1/taxa/${exact.id}?locale=zh-CN`).catch(() => null);
    taxon = detail?.results?.[0] ?? exact;
  }
  await sleep(250);
  const desc = await zoologyDescription(entry);
  await sleep(250);

  const taxonomy = {
    class: taxon?.ancestry ? "" : "",
    order: "",
    family: "",
    genus: entry.sci.split(" ")[0],
  };
  if (taxon?.ancestors) {
    for (const a of taxon.ancestors) {
      if (a.rank === "class") taxonomy.class = a.name;
      if (a.rank === "order") taxonomy.order = a.name;
      if (a.rank === "family") taxonomy.family = a.name;
    }
  }

  const photos = taxon ? pickPhotos(taxon) : [];
  const slug = entry.slug;
  if (photos[0]) media[slug] = { ...(media[slug] ?? {}), hero: photos[0], full: photos[1] ?? photos[0] };
  if (photos[2]) media[slug] = { ...media[slug], habitat: photos[2] };

  const meta = GROUP_META[entry.group];
  const commonName = taxon?.preferred_common_name || entry.cn;
  const summary = desc
    ? desc.split("\n")[0].slice(0, 180)
    : `${entry.cn}（${entry.sci}）是中国分布的${meta.cn}，形态与生态资料待补充核验。`;

  species.push({
    slug,
    nameCn: entry.cn,
    aliases: [],
    scientificName: entry.sci,
    englishName: commonName,
    group: entry.group,
    groupLabel: meta.label,
    taxonomy,
    distribution: "分布记录待核验",
    provinces: [],
    habitats: [],
    conservation: { status: "NE", label: "未评估", year: 2024, note: "等级待接入权威评估后复核。" },
    morphology: desc || "形态描述待补充。",
    behavior: "生活史与行为资料待补充核验。",
    dietReproduction: "食性与繁殖资料待补充核验。",
    endemic: "strict",
    endemicNote: "按中国特有或主要分布于中国收录，待名录复核。",
    sp2000: { id: null, url: "https://www.sp2000.org.cn/" },
    sources: [
      { name: "动物科普数据 API（中国动物志等）", url: "http://zoology.especies.cn/" },
      { name: "iNaturalist", url: `https://www.inaturalist.org/search?q=${encodeURIComponent(entry.sci)}` },
    ],
    verified: false,
  });
  console.log(`${index + 1}/${LIST.length} ${entry.cn} desc=${desc ? "yes" : "no"} photos=${photos.length}`);
}

for (let i = 0; i < LIST.length; i += 1) {
  try {
    await build(LIST[i], i);
  } catch (e) {
    failed += 1;
    console.log(`fail ${LIST[i].slug}: ${String(e?.message ?? e).slice(0, 60)}`);
  }
}

await mkdir(path.join(ROOT, "public/data"), { recursive: true });
await writeFile(path.join(ROOT, "public/data/china-species-extra.json"), JSON.stringify(species, null, 1));
await writeFile(
  path.join(ROOT, "public/data/china-media-extra.json"),
  JSON.stringify({ generated_at: new Date().toISOString(), species: media }, null, 1)
);
console.log(`done species=${species.length} media=${Object.keys(media).length} failed=${failed}`);