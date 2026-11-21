import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const KEY = process.env.ZHIPU_API_KEY;
const CONCURRENCY = Number(process.argv[2] ?? 2);
const LIMIT = Number(process.argv[3] ?? 0);

if (!KEY) {
  console.error("missing ZHIPU_API_KEY");
  process.exit(1);
}

const FILE = path.join(ROOT, "public/data/news-snapshot.json");
const snapshot = JSON.parse(await readFile(FILE, "utf8"));
const articles = snapshot.articles ?? [];
const targets = articles.filter((a) => !a.title_cn).slice(0, LIMIT || undefined);
console.log(`total=${articles.length} to-translate=${targets.length}`);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function translate(article) {
  const body = {
    model: "glm-4-flash",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content:
          "你是科学新闻译者。把英文标题与摘要翻译成简体中文，保留机构、物种、地名的通用中文译名，不添加原文没有的信息。只输出 JSON：{\"title\":\"...\",\"summary\":\"...\"}",
      },
      {
        role: "user",
        content: `标题：${article.title_original}\n摘要：${(article.excerpt_original || "").slice(0, 700)}`,
      },
    ],
  };
  const res = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(60000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content ?? "";
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("no json");
  const parsed = JSON.parse(match[0]);
  return { title: String(parsed.title ?? "").trim(), summary: String(parsed.summary ?? "").trim() };
}

let cursor = 0;
let done = 0;
let failed = 0;

async function persist() {
  await writeFile(
    FILE,
    JSON.stringify({ ...snapshot, articles, translated_at: new Date().toISOString() }, null, 1)
  );
}

async function worker() {
  while (cursor < targets.length) {
    const article = targets[cursor++];
    try {
      const result = await translate(article);
      if (!result.title) throw new Error("empty title");
      article.title_cn = result.title;
      article.summary_cn = result.summary || article.summary_cn || "";
      article.summary_status = "pending_ai";
      article.translated_at = new Date().toISOString();
      done += 1;
      if (done % 5 === 0) {
        console.log(`progress ${done}/${targets.length} failed=${failed}`);
        await persist();
      }
      await sleep(1200);
    } catch (e) {
      failed += 1;
      console.log(`fail ${article.slug}: ${String(e?.message ?? e).slice(0, 60)}`);
      await sleep(3000);
    }
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, worker));
await persist();
console.log(`done translated=${done} failed=${failed}`);