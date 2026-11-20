import fs from "fs";
import path from "path";
import sharp from "sharp";

const root = process.cwd();
const slugs = [
  "complex-toothed-flying-squirrel",
  "chinese-pangolin",
  "crested-ibis",
  "chinese-thrush",
  "vibrissaphora-boringii",
  "chinese-giant-salamander",
  "mangshan-pit-viper",
  "chinese-alligator",
  "chinese-sturgeon",
  "chinese-sucker",
  "odorrana-wuchuanensis",
  "hynobius-fucus",
  "andrias-davidianus",
  "giant-panda",
];

const media = {};
for (const file of [
  "china-media.json",
  "china-media-amphibians.json",
  "china-media-extra.json",
  "china-media-amphibians-illustration.json",
  "china-media-amphibians-sourced.json",
  "china-media-amphibians-localized.json",
  "china-media-extra-localized.json",
]) {
  Object.assign(media, JSON.parse(fs.readFileSync(path.join(root, "public/data", file), "utf8")).species);
}

let made = 0;
for (const slug of slugs) {
  const url = media[slug]?.hero?.url ?? media[slug]?.full?.url;
  if (!url || !url.startsWith("/media/")) {
    console.log("no local", slug);
    continue;
  }
  const rest = url.slice("/media/".length).replace(/\.(jpe?g|png|webp)$/i, ".webp");
  const target = path.join(root, "public/media/cards", rest);
  if (fs.existsSync(target)) {
    made += 1;
    continue;
  }
  fs.mkdirSync(path.dirname(target), { recursive: true });
  await sharp(path.join(root, "public", url.slice(1)))
    .rotate()
    .resize({ width: 480, height: 480, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 72 })
    .toFile(target);
  const size = fs.statSync(target).size / 1024;
  made += 1;
  console.log(slug, size.toFixed(1) + "KB");
}
console.log("made", made);