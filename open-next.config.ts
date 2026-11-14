import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// 不使用 R2 增量缓存，保持免费额度与最小依赖。
export default defineCloudflareConfig({});