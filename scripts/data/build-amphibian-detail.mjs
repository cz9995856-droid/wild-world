import fs from "fs";
import path from "path";

const root = process.cwd();
const localPath = path.join(root, "public/data/china-species-amphibians.json");
const remotePath = path.join(root, "public/data/china-amphibiachina.json");
const outPath = path.join(root, "public/data/china-amphibians-detail.json");

const local = JSON.parse(fs.readFileSync(localPath, "utf8"));
const remoteRaw = JSON.parse(fs.readFileSync(remotePath, "utf8"));
const remote = remoteRaw.species;

const byLatin = new Map(Object.entries(remote));
const byCn = new Map();
for (const [key, value] of Object.entries(remote)) {
  if (value.nameCn && !byCn.has(value.nameCn)) byCn.set(value.nameCn, { ...value, latinKey: key });
}

const IUCN_LABEL = {
  EX: "灭绝",
  EW: "野外灭绝",
  CR: "极危",
  EN: "濒危",
  VU: "易危",
  NT: "近危",
  LC: "无危",
  DD: "数据缺乏",
  NE: "未评估",
};

function tidyMorphology(text) {
  if (!text) return "";
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
  const pairs = [];
  let pendingLabel = "";
  for (const line of lines) {
    const labelMatch = line.match(/^([\u4e00-\u9fa5、]{1,14})\s*[:：]\s*(.*)$/);
    if (labelMatch) {
      const [, label, rest] = labelMatch;
      if (rest) {
        pairs.push(`${label}：${rest.replace(/。$/, "")}`);
        pendingLabel = "";
      } else {
        pendingLabel = label;
      }
      continue;
    }
    if (pendingLabel) {
      pairs.push(`${pendingLabel}：${line.replace(/。$/, "")}`);
      pendingLabel = "";
    } else {
      pairs.push(line.replace(/。$/, ""));
    }
  }
  if (pendingLabel) pairs.push(pendingLabel);
  const cleaned = pairs.filter((pair) => {
    const [, value = ""] = pair.split("：");
    return value.trim().length > 0;
  });
  return cleaned.join("；").slice(0, 1200);
}

const NH_LABELS = [
  ["habitat", "生境"],
  ["habit", "习性"],
  ["reproduction", "繁殖季节"],
  ["reproduction", "繁殖"],
  ["diet", "食性"],
  ["diet", "食物"],
];

function splitNaturalHistory(text) {
  const empty = { habitat: "", habit: "", reproduction: "", diet: "", raw: "" };
  if (!text) return empty;
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
  const buckets = { habitat: [], habit: [], reproduction: [], diet: [] };
  let current = null;
  for (const line of lines) {
    const matched = NH_LABELS.find(([, label]) => line.startsWith(label));
    if (matched) {
      current = matched[0];
      const rest = line.slice(matched[1].length).replace(/^\s*[:：]\s*/, "");
      if (rest) buckets[current].push(rest);
      continue;
    }
    if (current) buckets[current].push(line);
  }
  return {
    habitat: buckets.habitat.join(" ").slice(0, 400),
    habit: buckets.habit.join(" ").slice(0, 600),
    reproduction: buckets.reproduction.join(" ").slice(0, 400),
    diet: buckets.diet.join(" ").slice(0, 400),
    raw: lines.join(" ").slice(0, 1200),
  };
}

const HABITAT_KEYS = [
  ["森林", ["林", "灌丛", "乔木", "树"]],
  ["草原", ["草原", "草甸", "草地"]],
  ["湿地", ["溪", "流", "水", "池", "沼", "塘", "湿地", "稻田", "水田"]],
  ["荒漠", ["荒漠", "沙", "戈壁"]],
  ["高山", ["高山", "海拔", "高原", "山地"]],
  ["海洋", ["海"]],
];

function guessHabitats(text) {
  if (!text) return [];
  const hits = HABITAT_KEYS.filter(([, words]) => words.some((word) => text.includes(word))).map(([key]) => key);
  return hits.slice(0, 3);
}

const detail = {};
let latinHit = 0;
let cnHit = 0;
const missing = [];

for (const species of local) {
  const latinKey = String(species.scientificName ?? "").trim().toLowerCase();
  let entry = byLatin.get(latinKey);
  let matchedBy = "latin";
  if (entry) {
    latinHit += 1;
  } else {
    entry = byCn.get(species.nameCn);
    matchedBy = "cn";
    if (entry) cnHit += 1;
  }
  if (!entry) {
    missing.push(`${species.slug} ${species.nameCn} ${species.scientificName}`);
    continue;
  }

  const natural = splitNaturalHistory(entry.naturalHistory);
  const morphology = tidyMorphology(entry.morphology);
  const iucn = String(entry.iucn ?? "").trim().toUpperCase();
  const status = /^[A-Z]{2}$/.test(iucn) && iucn !== "NE" ? iucn : "";

  detail[species.slug] = {
    acId: entry.id,
    acUrl: `https://amphibiachina.org/species/${entry.id}`,
    acNameCn: entry.nameCn,
    acScientificName: entry.scientificName,
    matchedBy,
    diagnosis: (entry.diagnosis ?? "").slice(0, 800),
    morphology,
    habitat: natural.habitat,
    habit: natural.habit,
    reproduction: natural.reproduction,
    diet: natural.diet,
    naturalHistory: natural.raw,
    distribution: (entry.distribution ?? "").slice(0, 500),
    iucn: status,
    iucnLabel: status ? IUCN_LABEL[status] ?? status : "",
    nationalProtection: entry.nationalProtection && entry.nationalProtection !== "-" ? entry.nationalProtection : "",
    cites: entry.cites && entry.cites !== "-" ? entry.cites : "",
    habitats: guessHabitats(natural.habitat),
    citation: entry.citation ?? "",
  };
}

const payload = {
  source: remoteRaw.source,
  publisher: remoteRaw.publisher,
  url: remoteRaw.url,
  citation: remoteRaw.citation,
  retrievedAt: remoteRaw.retrievedAt,
  licenseNote: remoteRaw.licenseNote,
  stats: { total: Object.keys(detail).length, latinHit, cnHit, missing: missing.length },
  species: detail,
};

fs.writeFileSync(outPath, JSON.stringify(payload, null, 1));

const coverage = {
  total: Object.keys(detail).length,
  morphology: Object.values(detail).filter((item) => item.morphology).length,
  habit: Object.values(detail).filter((item) => item.habit).length,
  habitat: Object.values(detail).filter((item) => item.habitat).length,
  reproduction: Object.values(detail).filter((item) => item.reproduction).length,
  diet: Object.values(detail).filter((item) => item.diet).length,
  distribution: Object.values(detail).filter((item) => item.distribution).length,
  iucn: Object.values(detail).filter((item) => item.iucn).length,
};

console.log(JSON.stringify({ coverage, missing }, null, 1));
console.log("size(MB)", (fs.statSync(outPath).size / 1024 / 1024).toFixed(2));