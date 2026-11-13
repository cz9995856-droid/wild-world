const WORKER_ORIGIN = "__WORKER_ORIGIN__";

export async function onRequest(context) {
  const incoming = new URL(context.request.url);
  const target = new URL(WORKER_ORIGIN);
  target.pathname = incoming.pathname;
  target.search = incoming.search;

  const headers = new Headers(context.request.headers);
  headers.delete("host");
  headers.set("x-forwarded-host", incoming.host);
  headers.set("x-forwarded-proto", "https");

  const init = {
    method: context.request.method,
    headers,
    redirect: "manual",
  };
  if (context.request.method !== "GET" && context.request.method !== "HEAD") {
    init.body = context.request.body;
  }

  const response = await fetch(target.toString(), init);
  const outHeaders = new Headers(response.headers);

  const location = outHeaders.get("location");
  if (location) {
    try {
      const loc = new URL(location);
      if (loc.origin === target.origin) {
        loc.protocol = incoming.protocol;
        loc.host = incoming.host;
        outHeaders.set("location", loc.toString());
      }
    } catch {
      // Relative redirects are fine.
    }
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: outHeaders,
  });
}