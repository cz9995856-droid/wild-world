import { readFile, writeFile, mkdir, stat } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import path from "node:path";

const ROOT = process.cwd();
const ZKEY = process.env.ZOOLOGY_API_KEY ?? "60803da48d6f4f2cb94ea6e05ed50688";
const ZHIPU = process.env.ZHIPU_API_KEY ?? "7c61ffeb65bc41d8aed1e65b9abca6a7.1fhPXM2NkrBTb6sY";
const UA = "WILDWORLD-Museum/1.0";

const TARGETS = [
  {
    slug: "crested-ibis",
    cn: "朱鹮",
    sci: "Nipponia nippon",
    group: "bird",
    label: "鸟纲",
    dbase: "中国鸟类数据库",
    habitat: "montane forest edge and wetland, reeds and scattered trees, soft daylight",
  },
  {
    slug: "chinese-paddlefish",
    cn: "白鲟",
    sci: "Psephurus gladius",
    group: "fish",
    label: "硬骨鱼纲",
    dbase: "中国内陆水体鱼类数据库",
    habitat: "clear freshwater river with gravel bed and flowing water, submerged stones",
  },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJSON(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

const LICENSE_URL = {
  cc0: "https://creativecommons.org/publicdomain/zero/1.0/",
  "cc-by": "https://creativecommons.org/licenses/by/4.0/",
  "cc-by-sa": "https://creativecommons.org/licenses/by-sa/4.0/",
  "cc-by-nc": "https://creativecommons.org/licenses/by-nc/4.0/",
  "cc-by-nc-sa": "https://creativecommons.org/licenses/by-nc-sa/4.0/",
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

async function aiImage(t) {
  const dest = path.join(ROOT, "public/media/extra", `${t.slug}-ai.png`);
  try {
    const st = await stat(dest);
    if (st.size > 10000) return { url: `/media/extra/${t.slug}-ai.png` };
  } catch {
    // miss
  }
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      const res = await fetch("https://open.bigmodel.cn/api/paas/v4/images/generations", {
        method: "POST",
        headers: { Authorization: `Bearer ${ZHIPU}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "cogview-3-flash",
          prompt: `realistic wildlife photograph of ${t.sci} (${t.cn}) in natural habitat, full body, scientific reference, no text`,
          size: "1024x1024",
        }),
        signal: AbortSignal.timeout(120000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const url = data?.data?.[0]?.url;
      if (!url) throw new Error("no url");
      const img = await fetch(url, { signal: AbortSignal.timeout(60000) });
      await mkdir(path.dirname(dest), { recursive: true });
      await pipeline(img.body, createWriteStream(dest));
      return { url: `/media/extra/${t.slug}-ai.png` };
    } catch (e) {
      await sleep(12000);
    }
  }
  return null;
}

const extraFile = path.join(ROOT, "public/data/china-species-extra.json");
const mediaFile = path.join(ROOT, "public/data/china-media-extra.json");
const species = JSON.parse(await readFile(extraFile, "utf8"));
const media = JSON.parse(await readFile(mediaFile, "utf8"));
const map = media.species ?? {};

for (const t of TARGETS) {
  if (species.some((s) => s.slug === t.slug)) {
    console.log(`skip existing ${t.slug}`);
    continue;
  }
  let taxon = null;
  try {
    const search = await getJSON(`https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(t.sci)}&locale=zh-CN&per_page=5`);
    const exact = (search?.results ?? []).find((x) => (x.name || "").toLowerCase() === t.sci.toLowerCase());
    if (exact) {
      const detail = await getJSON(`https://api.inaturalist.org/v1/taxa/${exact.id}?locale=zh-CN`).catch(() => null);
      taxon = detail?.results?.[0] ?? exact;
    }
  } catch {
    taxon = null;
  }
  await sleep(300);

  let desc = "";
  try {
    const body = new URLSearchParams({ scientificName: t.sci, dbaseName: t.dbase, descriptionType: "1" });
    const res = await fetch(`http://zoology.especies.cn/api/v1/description?apiKey=${encodeURIComponent(ZKEY)}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal: AbortSignal.timeout(30000),
    });
    if (res.ok) {
      const data = await res.json();
      desc = (data?.data?.DescriptionInfo ?? [])
        .map((x) => (x.descontent || "").replace(/<br\s*\/?>/g, "\n").replace(/<[^>]+>/g, "").trim())
        .filter(Boolean)
        .join("\n");
    }
  } catch {
    desc = "";
  }
  await sleep(300);

  const taxonomy = { class: "", order: "", family: "", genus: t.sci.split(" ")[0] };
  for (const a of taxon?.ancestors ?? []) {
    if (a.rank === "class") taxonomy.class = a.name;
    if (a.rank === "order") taxonomy.order = a.name;
    if (a.rank === "family") taxonomy.family = a.name;
  }

  const photos = taxon ? pickPhotos(taxon) : [];
  if (photos.length === 0) {
    const ai = await aiImage(t);
    if (ai) {
      const image = {
        url: ai.url,
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
      photos.push(image, image);
    }
  }
  if (photos[0]) {
    map[t.slug] = { hero: photos[0], full: photos[1] ?? photos[0] };
  }

  const isBird = t.group === "bird";
  species.push({
    slug: t.slug,
    nameCn: t.cn,
    aliases: [],
    scientificName: t.sci,
    englishName: taxon?.preferred_common_name || t.sci,
    group: t.group,
    groupLabel: t.label,
    taxonomy,
    distribution: isBird ? "历史分布于东亚，中国为主要繁殖地之一" : "长江水系，历史记录见于干流与大型支流",
    provinces: [],
    habitats: isBird ? ["湿地", "浅水农田", "溪流"] : ["江河干流", "砾石河段"],
    conservation: isBird
      ? { status: "EN", label: "濒危", year: 2018, note: "以 IUCN 评估为参考，具体版本待复核。" }
      : { status: "CR", label: "极危", year: 2022, note: "白鲟自 2003 年后无确证记录，评估状态待复核。" },
    morphology: desc || "形态描述待补充。",
    behavior: isBird
      ? "在湿地、浅水农田与溪流边觅食水生动物；繁殖期在树上营巢，对人为干扰敏感。"
      : "大型淡水鱼类，历史记录显示其在长江干流活动，具体生态习性资料极为有限。",
    dietReproduction: isBird
      ? "取食鱼类、两栖类与水生昆虫；繁殖期在乔木上筑巢，每窝产卵数较少。"
      : "以鱼类等水生动物为食；繁殖与洄游行为缺乏完整记录。",
    endemic: "main",
    endemicNote: "按主要分布于中国收录，待名录复核。",
    sp2000: { id: null, url: "https://www.sp2000.org.cn/" },
    sources: [
      { name: "动物科普数据 API（中国动物志等）", url: "http://zoology.especies.cn/" },
      { name: "iNaturalist", url: `https://www.inaturalist.org/search?q=${encodeURIComponent(t.sci)}` },
    ],
    verified: false,
  });
  console.log(`added ${t.slug} desc=${desc ? "yes" : "no"} photos=${photos.length}`);
  await sleep(400);
}

await writeFile(extraFile, JSON.stringify(species, null, 1));
await writeFile(mediaFile, JSON.stringify({ ...media, species: map }, null, 1));
console.log(`done species=${species.length} media=${Object.keys(map).length}`);