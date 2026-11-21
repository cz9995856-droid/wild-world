import fs from "fs";
import path from "path";
import sharp from "sharp";

const root = process.cwd();
const outDir = path.join(root, "public/media/habitat-illustrations");
fs.mkdirSync(outDir, { recursive: true });

const PAPER = "#f6f1e7";
const INK = "#1b1a17";

function frame(inner, accent, label) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1200" height="800">
  <rect width="1200" height="800" fill="${PAPER}"/>
  <circle cx="600" cy="400" r="300" fill="${accent}" opacity="0.45"/>
  ${inner}
  <text x="60" y="748" font-family="Noto Sans CJK SC, sans-serif" font-size="26" fill="${INK}" opacity="0.62">生境示意 · ${label} · 非该物种实拍</text>
</svg>`;
}

const TREE = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})" fill="${INK}">
  <path d="M0 0 L26 -70 L52 0 Z"/><path d="M6 -34 L26 -92 L46 -34 Z"/><rect x="21" y="0" width="10" height="26"/>
</g>`;

const SCENES = {
  forest: ['#9bd34a', "森林与林缘", `${TREE(360, 560, 1.5)}${TREE(520, 590, 1.1)}${TREE(690, 560, 1.7)}${TREE(830, 600, 1.0)}<path d="M120 620 Q600 540 1080 620" stroke="${INK}" stroke-width="5" fill="none" opacity="0.5"/><circle cx="900" cy="240" r="52" fill="${INK}" opacity="0.75"/>`],
  alpine: ['#8e95f0', "高山与草甸", `<g fill="${INK}"><path d="M180 600 L420 300 L520 400 L660 240 L900 600 Z" opacity="0.85"/><path d="M420 300 L470 360 L520 400 L560 350 L660 240 L700 300 L640 330 L600 300 L540 380 Z" fill="${PAPER}" opacity="0.8"/><path d="M180 640 Q600 590 1020 640 L1020 680 L180 680 Z" opacity="0.4"/></g>`],
  wetland: ['#4fa8e8', "湿地与溪流", `<g stroke="${INK}" stroke-width="6" fill="none" stroke-linecap="round"><path d="M180 520 Q300 480 420 520 T660 520 T900 520 T1140 520" opacity="0.8"/><path d="M120 580 Q240 540 360 580 T600 580 T840 580 T1080 580" opacity="0.55"/><path d="M240 660 Q360 620 480 660 T720 660 T960 660" opacity="0.4"/></g><g stroke="${INK}" stroke-width="5" stroke-linecap="round"><path d="M330 470 L330 340 M360 470 L372 330 M390 470 L402 350"/><path d="M330 340 q-26 -26 -8 -52 q26 6 26 30"/><path d="M372 330 q24 -30 44 -14 q-4 26 -30 30"/></g>`],
  river: ['#4fa8e8', "江河干流", `<g fill="${INK}" opacity="0.85"><path d="M0 470 Q300 430 600 470 T1200 470 L1200 640 Q900 600 600 640 T0 640 Z"/></g><g stroke="${PAPER}" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.65"><path d="M120 540 Q260 510 400 540 T680 540 T960 540"/><path d="M200 600 Q340 570 480 600 T760 600 T1040 600"/></g>`],
  desert: ['#e8a33d', "荒漠与戈壁", `<g fill="${INK}" opacity="0.8"><path d="M120 600 Q360 460 640 560 Q900 660 1120 540 L1120 680 L120 680 Z"/><circle cx="880" cy="250" r="58"/></g>`],
  ocean: ['#8e95f0', "海洋与海岸", `<g stroke="${INK}" stroke-width="6" fill="none" stroke-linecap="round"><path d="M100 480 Q220 430 340 480 T580 480 T820 480 T1060 480" opacity="0.8"/><path d="M60 560 Q180 510 300 560 T540 560 T780 560 T1020 560" opacity="0.55"/><path d="M160 640 Q280 590 400 640 T640 640 T880 640" opacity="0.4"/></g><circle cx="600" cy="270" r="60" fill="${INK}" opacity="0.7"/>`],
};

for (const [key, [accent, label, inner]] of Object.entries(SCENES)) {
  const buffer = Buffer.from(frame(inner, accent, label));
  await sharp(buffer).webp({ quality: 86 }).toFile(path.join(outDir, `${key}.webp`));
  await sharp(buffer).resize({ width: 480 }).webp({ quality: 74 }).toFile(path.join(outDir, `${key}-card.webp`));
}

const amphibians = JSON.parse(fs.readFileSync(path.join(root, "public/data/china-species-amphibians.json"), "utf8"));
const extra = JSON.parse(fs.readFileSync(path.join(root, "public/data/china-species-extra.json"), "utf8"));
const habitatMedia = JSON.parse(fs.readFileSync(path.join(root, "public/data/china-media-habitat.json"), "utf8")).species ?? {};

function sceneFor(habitats) {
  const text = (habitats ?? []).join("、");
  if (!text) return "forest";
  if (/荒漠|沙漠|戈壁/.test(text)) return "desert";
  if (/海洋|海岸|海水/.test(text)) return "ocean";
  if (/江河|干流|大江/.test(text)) return "river";
  if (/湿地|溪流|水田|池塘|沼|芦苇|河|溪|湖|水/.test(text)) return "wetland";
  if (/高山|高寒|草甸|高原|山地|海拔/.test(text)) return "alpine";
  return "forest";
}

const mapping = {};
for (const item of [...amphibians, ...extra]) {
  if (habitatMedia[item.slug]?.habitat) continue;
  mapping[item.slug] = sceneFor(item.habitats);
}
fs.writeFileSync(
  path.join(root, "public/data/china-habitat-illustrations.json"),
  JSON.stringify({ retrievedAt: "2026-11-19", note: "生境类型示意图，非该物种实拍。", species: mapping }, null, 1)
);
console.log("scenes 6, mapped", Object.keys(mapping).length);