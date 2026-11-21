import fs from "fs";
import path from "path";
import sharp from "sharp";

const root = process.cwd();
const species = JSON.parse(fs.readFileSync(path.join(root, "public/data/china-species-amphibians.json"), "utf8"));
const sourced = JSON.parse(fs.readFileSync(path.join(root, "public/data/china-media-amphibians-sourced.json"), "utf8"))
  .species;
const existing = {
  ...JSON.parse(fs.readFileSync(path.join(root, "public/data/china-media.json"), "utf8")).species,
  ...JSON.parse(fs.readFileSync(path.join(root, "public/data/china-media-amphibians.json"), "utf8")).species,
  ...JSON.parse(fs.readFileSync(path.join(root, "public/data/china-media-extra.json"), "utf8")).species,
};

const outDir = path.join(root, "public/media/species/amph-illustration");
const thumbDir = path.join(root, "public/media/thumbs/species/amph-illustration");
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(thumbDir, { recursive: true });

const PAPER = "#f6f1e7";
const INK = "#1c1a17";
const ACCENT = "#4d7c0f";
const ACCENT_SOFT = "#c6e08a";

function silhouette(order) {
  const o = String(order ?? "");
  if (o.includes("Caudata")) {
    return `
      <g fill="${INK}" opacity="0.9">
        <path d="M 336 520 C 400 492 500 490 600 506 C 700 522 780 548 840 584 C 900 620 950 668 986 716 C 998 734 992 748 978 748 C 964 748 952 736 944 720 C 906 656 850 616 780 590 C 700 560 600 550 500 548 C 420 546 370 560 336 520 Z"/>
        <path d="M 336 520 C 300 500 276 508 268 526 C 260 546 274 566 300 570 C 330 574 356 560 360 542 Z"/>
        <path d="M 470 552 C 466 596 448 632 418 654 C 410 660 402 656 400 648 C 420 632 436 606 440 548 Z"/>
        <path d="M 720 566 C 716 610 698 646 668 668 C 660 674 652 670 650 662 C 670 646 686 620 690 562 Z"/>
      </g>
      <g fill="${PAPER}">
        <circle cx="298" cy="512" r="4"/>
      </g>`;
  }
  if (o.includes("Gymnophiona")) {
    return `
      <g fill="none" stroke="${INK}" stroke-opacity="0.9" stroke-linecap="round">
        <path d="M 430 646 C 362 604 364 520 438 480 C 528 430 648 432 748 472 C 838 508 890 572 858 618 C 826 664 754 668 704 634 C 654 600 664 534 724 516" stroke-width="88"/>
      </g>
      <g fill="none" stroke="${PAPER}" stroke-width="6" opacity="0.5">
        <path d="M 430 646 C 362 604 364 520 438 480 C 528 430 648 432 748 472 C 838 508 890 572 858 618 C 826 664 754 668 704 634 C 654 600 664 534 724 516"/>
      </g>
      <g fill="${INK}" opacity="0.9">
        <ellipse cx="726" cy="516" rx="54" ry="42"/>
      </g>
      <g fill="${PAPER}">
        <circle cx="710" cy="504" r="7"/>
        <circle cx="740" cy="504" r="7"/>
      </g>`;
  }
  return `
    <g fill="${INK}" opacity="0.9">
      <path d="M 402 556 C 402 494 452 436 522 412 C 562 398 640 398 680 412 C 750 436 800 494 800 556 C 800 610 752 642 690 642 C 620 642 560 642 510 642 C 440 642 402 610 402 556 Z"/>
      <ellipse cx="538" cy="404" rx="48" ry="44"/>
      <ellipse cx="702" cy="404" rx="48" ry="44"/>
      <path d="M 432 566 C 380 606 374 670 416 700 C 452 726 498 704 508 668 C 468 658 448 628 464 592 Z"/>
      <path d="M 768 566 C 820 606 826 670 784 700 C 748 726 702 704 692 668 C 732 658 752 628 736 592 Z"/>
      <path d="M 546 642 C 536 692 516 722 486 738 L 472 716 C 500 704 516 678 522 640 Z"/>
      <path d="M 660 642 C 670 692 690 722 720 738 L 734 716 C 706 704 690 678 684 640 Z"/>
    </g>
    <g fill="${PAPER}">
      <circle cx="538" cy="396" r="15"/>
      <circle cx="702" cy="396" r="15"/>
    </g>`;
}

function escapeXml(value) {
  return String(value).replace(/[<>&'"]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[char]);
}

function buildSvg(item) {
  const name = escapeXml(item.nameCn);
  const latin = escapeXml(item.scientificName);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" width="1200" height="900">
  <rect width="1200" height="900" fill="${PAPER}"/>
  <g stroke="${INK}" stroke-opacity="0.08" stroke-width="1">
    ${Array.from({ length: 11 }, (_, i) => `<line x1="0" y1="${90 * i}" x2="1200" y2="${90 * i}"/>`).join("")}
    ${Array.from({ length: 13 }, (_, i) => `<line x1="${100 * i}" y1="0" x2="${100 * i}" y2="900"/>`).join("")}
  </g>
  <circle cx="600" cy="450" r="286" fill="${ACCENT_SOFT}" opacity="0.55"/>
  <circle cx="600" cy="450" r="286" fill="none" stroke="${ACCENT}" stroke-opacity="0.35" stroke-width="2"/>
  <text x="64" y="86" font-family="Noto Sans CJK SC, sans-serif" font-size="20" letter-spacing="4" fill="${INK}" opacity="0.5">WILDCHINA · 图鉴示意</text>
  ${silhouette(item.taxonomy?.order)}
  <text x="64" y="852" font-family="Noto Sans CJK SC, sans-serif" font-size="22" fill="${INK}" opacity="0.55">示意图 · 本站自绘 · CC BY 4.0</text>
</svg>`;
}

const media = {};
let generated = 0;
const skipped = [];

const ND = /by-nc-nd/i;

for (const item of species) {
  const hero = existing[item.slug]?.hero;
  const needsIllustration = !hero || (ND.test(hero.license ?? "") && String(hero.url ?? "").startsWith("http"));
  if (sourced[item.slug] || !needsIllustration) continue;
  if (fs.existsSync(path.join(outDir, `${item.slug}.webp`))) {
    media[item.slug] = { hero: illustrationEntry(item) };
    generated += 1;
    continue;
  }
  try {
    const svg = Buffer.from(buildSvg(item));
    await sharp(svg).webp({ quality: 88 }).toFile(path.join(outDir, `${item.slug}.webp`));
    await sharp(svg)
      .resize({ width: 800 })
      .webp({ quality: 80 })
      .toFile(path.join(thumbDir, `${item.slug}.webp`));
    media[item.slug] = { hero: illustrationEntry(item) };
    generated += 1;
    if (generated % 40 === 0) console.log("generated", generated);
  } catch (error) {
    skipped.push(`${item.slug}: ${String(error).slice(0, 60)}`);
  }
}

function illustrationEntry(item) {
  return {
    url: `/media/species/amph-illustration/${item.slug}.webp`,
    author: "WildChina 编辑部",
    source_name: "本站自绘示意图",
    source_url: "/sources",
    license: "CC BY 4.0",
    license_url: "https://creativecommons.org/licenses/by/4.0/",
    commercial_use: true,
    verified: false,
    review_status: "illustration",
    ai_generated: false,
  };
}

const payload = {
  source: "WildChina 编辑部自绘 SVG 示意图",
  retrievedAt: "2026-11-19",
  note: "统一风格的 2D 图鉴示意，用于尚无可用授权照片的物种；不代表真实个体形态细节。",
  species: media,
};
fs.writeFileSync(
  path.join(root, "public/data/china-media-amphibians-illustration.json"),
  JSON.stringify(payload, null, 1)
);

console.log(JSON.stringify({ generated, skipped: skipped.length, total: species.length }, null, 1));
if (skipped.length) console.log(skipped.slice(0, 5).join("\n"));