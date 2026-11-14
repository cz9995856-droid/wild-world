import { readFile, writeFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.argv[2] || ".open-next/assets/media";
let before = 0;
let after = 0;
let optimized = 0;
let files = 0;

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full);
      continue;
    }
    if (!/\.(jpe?g|png)$/i.test(entry.name)) {
      const info = await stat(full);
      before += info.size;
      after += info.size;
      continue;
    }
    files += 1;
    const buffer = await readFile(full);
    before += buffer.length;
    try {
      const meta = await sharp(buffer).metadata();
      const isHero = full.includes(`${path.sep}hero${path.sep}`);
      const maxWidth = isHero ? 1920 : 1400;
      const needsResize = (meta.width ?? 0) > maxWidth || buffer.length > 220_000;
      if (needsResize) {
        const output = await sharp(buffer)
          .rotate()
          .resize({ width: maxWidth, withoutEnlargement: true })
          .jpeg({ quality: isHero ? 78 : 74, mozjpeg: true })
          .toBuffer();
        if (output.length < buffer.length) {
          await writeFile(full, output);
          after += output.length;
          optimized += 1;
          continue;
        }
      }
      after += buffer.length;
    } catch {
      after += buffer.length;
    }
  }
}

await walk(root);
console.log(
  `optimized ${optimized}/${files} images, ${(before / 1024 / 1024).toFixed(1)} MiB -> ${(after / 1024 / 1024).toFixed(1)} MiB`
);