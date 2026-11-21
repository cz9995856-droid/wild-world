import { NextResponse } from "next/server";
import { getNews, getNewsMeta } from "@/lib/repository";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const force = new URL(request.url).searchParams.get("refresh") === "1";
  const [articles, meta] = await Promise.all([getNews({ forceRefresh: force }), getNewsMeta({ forceRefresh: force })]);
  return NextResponse.json(
    {
      generated_at: meta.generated_at,
      count: meta.count,
      errors: meta.errors,
      articles,
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}