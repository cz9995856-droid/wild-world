import { readdir, mkdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const SRC_DIRS = ["species", "pixabay", "habitat", "extra", "hero", "batch"];
const THUMB_ROOT = path.join(ROOT, "public/media/thumbs");
const WIDTH = 800;
const QUALITY = 90;

let done = 0;
let skipped = 0;
let failed = 0;

for (const dir of SRC_DIRS) {
  const srcDir = path.join(ROOT, "public/media", dir);
  if (!existsSync(srcDir)) continue;
  const files = (await readdir(srcDir)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
  for (const file of files) {
    const src = path.join(srcDir, file);
    const outDir = path.join(THUMB_ROOT, dir);
    const out = path.join(outDir, file.replace(/\.(jpe?g|png|webp)$/i, ".webp"));
    try {
      if (existsSync(out)) {
        const [a, b] = await Promise.all([stat(src), stat(out)]);
        if (b.mtimeMs >= a.mtimeMs) {
          skipped += 1;
          continue;
        }
      }
      await mkdir(outDir, { recursive: true });
      await sharp(src)
        .resize({ width: WIDTH, withoutEnlargement: true })
        .webp({ quality: QUALITY, effort: 4 })
        .toFile(out);
      done += 1;
      if (done % 40 === 0) console.log(`progress ${done}`);
    } catch (e) {
      failed += 1;
      console.log(`fail ${dir}/${file}: ${String(e?.message ?? e).slice(0, 60)}`);
    }
  }
}

console.log(`done generated=${done} skipped=${skipped} failed=${failed}`);