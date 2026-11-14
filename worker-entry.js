import handler from "./.open-next/worker.js";

const PAGES_ORIGIN = "https://wild-world-museum.pages.dev";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/media/")) {
      const target = new URL(url.pathname + url.search, PAGES_ORIGIN);
      const response = await fetch(target, {
        headers: {
          "User-Agent": "WILDWORLD-Worker/1.0",
          Accept: request.headers.get("accept") || "*/*",
        },
        cf: { cacheEverything: true, cacheTtl: 86400 },
      });
      const headers = new Headers(response.headers);
      headers.set("Cache-Control", "public, max-age=31536000, immutable");
      headers.set("Access-Control-Allow-Origin", "*");
      return new Response(response.body, { status: response.status, headers });
    }
    return handler.fetch(request, env, ctx);
  },
};