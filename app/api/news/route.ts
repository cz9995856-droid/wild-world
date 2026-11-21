import { NextResponse } from "next/server";
import { getNews, getNewsMeta } from "@/lib/repository";

export const dynamic = "force-dynamic";

export async function GET() {
  const [articles, meta] = await Promise.all([getNews(), getNewsMeta()]);
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