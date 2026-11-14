import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const ACCOUNT = process.env.CLOUDFLARE_ACCOUNT_ID;
const WORKER_NAME = "wild-world-app";
const PAGES_PROJECT = "wild-world-museum";
const D1_NAME = "wild-world";

if (!TOKEN || !ACCOUNT) {
  console.error("CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID 未配置");
  process.exit(1);
}

const root = process.cwd();

async function cf(pathname, init = {}) {
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${ACCOUNT}${pathname}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  if (!res.ok || body?.success === false) {
    const message = body?.errors?.map((e) => `${e.code}: ${e.message}`).join("; ") ?? `HTTP ${res.status}`;
    const err = new Error(`${pathname} -> ${message}`);
    err.status = res.status;
    throw err;
  }
  return body.result;
}

async function ensureD1() {
  const list = await cf(`/d1/database`);
  const found = (list ?? []).find((db) => db.name === D1_NAME);
  if (found) return found.uuid;
  const created = await cf(`/d1/database`, {
    method: "POST",
    body: JSON.stringify({ name: D1_NAME }),
  });
  return created.uuid;
}

async function ensurePagesProject() {
  try {
    const project = await cf(`/pages/projects/${PAGES_PROJECT}`);
    return project;
  } catch (err) {
    if (err.status !== 404) throw err;
    return cf(`/pages/projects`, {
      method: "POST",
      body: JSON.stringify({ name: PAGES_PROJECT, production_branch: "main" }),
    });
  }
}

async function workersSubdomain() {
  try {
    const result = await cf(`/workers/subdomain`);
    if (result?.subdomain) return result.subdomain;
  } catch {
    // fall through to create
  }
  const candidate = `wildworld-${ACCOUNT.slice(0, 6).toLowerCase()}`;
  try {
    const created = await cf(`/workers/subdomain`, {
      method: "PUT",
      body: JSON.stringify({ subdomain: candidate }),
    });
    return created?.subdomain ?? candidate;
  } catch {
    return null;
  }
}

let stage = "d1";
console.log("stage: ensure D1");
const d1Id = await ensureD1();
stage = "d1-schema";
console.log("stage: apply D1 schema");
const schema = await readFile(path.join(root, "cloudflare/d1/schema.sql"), "utf8");
await cf(`/d1/database/${d1Id}/query`, {
  method: "POST",
  body: JSON.stringify({ sql: schema }),
});
console.log("D1 schema applied");
stage = "pages";
console.log("stage: ensure Pages project");
const pagesProject = await ensurePagesProject();
stage = "subdomain";
console.log("stage: ensure Workers subdomain");
const subdomain = await workersSubdomain();
if (!subdomain) {
  console.error("未找到 workers.dev 子域，请先在 Cloudflare Dashboard → Workers & Pages 设置 workers.dev 子域。");
  process.exit(1);
}

const workerUrl = `https://${WORKER_NAME}.${subdomain}.workers.dev`;
const pagesUrl = `https://${PAGES_PROJECT}.pages.dev`;

const wrangler = await readFile(path.join(root, "wrangler.jsonc"), "utf8");
const generated = wrangler.replace("00000000-0000-0000-0000-000000000000", d1Id);
await writeFile(path.join(root, "wrangler.generated.jsonc"), generated);

const fnPath = path.join(root, "functions", "[[path]].js");
const fn = await readFile(fnPath, "utf8");
await writeFile(fnPath, fn.replace(/__WORKER_ORIGIN__/g, workerUrl));

await writeFile(
  path.join(root, "cloudflare", "deploy-meta.json"),
  JSON.stringify({ workerUrl, pagesUrl, d1Id, pagesProject: pagesProject?.name ?? PAGES_PROJECT }, null, 2)
);

console.log(`D1 ready: ${d1Id}`);
console.log(`Worker: ${workerUrl}`);
console.log(`Pages:  ${pagesUrl}`);

if (process.env.GITHUB_ENV) {
  await writeFile(
    process.env.GITHUB_ENV,
    `WORKER_URL=${workerUrl}\nPAGES_URL=${pagesUrl}\nD1_ID=${d1Id}\n`,
    { flag: "a" }
  );
}
process.on("unhandledRejection", (err) => {
  console.error(`prepare failed: ${err?.stack || err}`);
  process.exit(1);
});
