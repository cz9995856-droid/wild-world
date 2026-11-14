import { readFile, writeFile, unlink, stat, rename } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";

const ROOT = process.cwd();
const ffmpeg = process.env.FFMPEG_PATH || path.join(ROOT, "node_modules/@ffmpeg-installer/linux-arm64/ffmpeg");
const integrationPath = path.join(ROOT, "public/data/integration.json");
const PREVIEW_SECONDS = 30;

const integration = JSON.parse(await readFile(integrationPath, "utf8"));
const sounds = integration.sounds ?? [];
let converted = 0;
let failed = 0;

for (const sound of sounds) {
  const inputRel = sound.url.replace(/^\//, "");
  const input = path.join(ROOT, "public", inputRel);
  const info = await stat(input).catch(() => null);
  if (!info) {
    console.error(`missing ${sound.url}`);
    failed += 1;
    continue;
  }
  const base = path.basename(input, path.extname(input));
  const outputRel = `/media/sounds/${base}.mp3`;
  const output = path.join(ROOT, "public", outputRel);
  const tmp = `${output}.tmp.mp3`;

  const result = spawnSync(
    ffmpeg,
    ["-y", "-loglevel", "error", "-i", input, "-t", String(PREVIEW_SECONDS), "-ac", "1", "-ar", "32000", "-b:a", "48k", "-vn", tmp],
    { encoding: "utf8" },
  );

  if (result.status !== 0) {
    console.error(`fail ${sound.species_slug}: ${result.stderr?.slice(0, 200) || "ffmpeg error"}`);
    failed += 1;
    continue;
  }

  await unlink(output).catch(() => null);
  await rename(tmp, output);
  if (input !== output) await unlink(input).catch(() => null);

  sound.url = outputRel;
  sound.preview_seconds = PREVIEW_SECONDS;
  sound.preview_note = `30 秒试听预览；完整录音请访问来源记录页。`;
  converted += 1;
  console.log(`ok ${sound.species_slug} -> ${outputRel}`);
}

integration.sounds = sounds;
integration.sounds_preview_generated_at = new Date().toISOString();

await writeFile(integrationPath, JSON.stringify(integration, null, 2));
console.log(`done converted=${converted} failed=${failed}`);