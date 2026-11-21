import fs from "fs";
import path from "path";
import sharp from "sharp";

const ROOT = path.join(process.cwd(), "public/media");
const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const MAX_WIDTH = 1200;

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (IMAGE_EXT.has(path.extname(entry.name).toLowerCase())) yield full;
  }
}

let before = 0;
let after = 0;
let processed = 0;
let skipped = 0;

for (const file of walk(ROOT)) {
  const originalSize = fs.statSync(file).size;
  before += originalSize;
  const isThumb = file.includes(`${path.sep}thumbs${path.sep}`);
  const ext = path.extname(file).toLowerCase();
  try {
    const image = sharp(file, { failOn: "none" }).rotate();
    if (!isThumb) {
      image.resize({ width: MAX_WIDTH, withoutEnlargement: true });
    }
    let pipeline;
    if (ext === ".webp") {
      pipeline = image.webp({ quality: isThumb ? 58 : 72, effort: 5 });
    } else if (ext === ".png") {
      pipeline = image.png({ compressionLevel: 9, palette: true, quality: isThumb ? 60 : 75 });
    } else {
      pipeline = image.jpeg({ quality: isThumb ? 60 : 72, mozjpeg: true });
    }
    const buffer = await pipeline.toBuffer();
    if (buffer.length < originalSize * 0.96) {
      fs.writeFileSync(file, buffer);
      after += buffer.length;
      processed += 1;
    } else {
      after += originalSize;
      skipped += 1;
    }
  } catch (error) {
    after += originalSize;
    skipped += 1;
    console.log("skip", path.basename(file), String(error).slice(0, 60));
  }
  if (processed % 200 === 0 && processed > 0) {
    console.log(`progress ${processed} files, saved ${((before - after) / 1048576).toFixed(1)}MB`);
  }
}

console.log(
  JSON.stringify({
    beforeMB: +(before / 1048576).toFixed(1),
    afterMB: +(after / 1048576).toFixed(1),
    savedMB: +((before - after) / 1048576).toFixed(1),
    processed,
    skipped,
  })
);