import { NextResponse } from "next/server";
import { login, logout, adminConfigured } from "@/lib/auth";

export const dynamic = "force-dynamic";

const attempts = new Map<string, { count: number; reset: number }>();

function limited(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || entry.reset < now) {
    attempts.set(ip, { count: 1, reset: now + 15 * 60 * 1000 });
    return false;
  }
  entry.count += 1;
  return entry.count > 10;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (limited(ip)) {
    return NextResponse.json({ error: "rate_limited", message: "尝试次数过多，请稍后再试。" }, { status: 429 });
  }
  if (!adminConfigured()) {
    return NextResponse.json(
      { error: "not_configured", message: "后台未配置：请设置 ADMIN_PASSWORD 与 ADMIN_SESSION_SECRET。" },
      { status: 503 }
    );
  }
  let body: { password?: unknown };
  try {
    body = (await request.json()) as { password?: unknown };
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const password = typeof body.password === "string" ? body.password : "";
  if (!password) return NextResponse.json({ error: "missing_password" }, { status: 400 });
  const result = await login(password);
  if (!result.ok) {
    return NextResponse.json({ error: "invalid_credentials", message: result.error ?? "登录失败" }, { status: 401 });
  }
  return NextResponse.json({ ok: true, role: result.role });
}

export async function DELETE() {
  await logout();
  return NextResponse.json({ ok: true });
}