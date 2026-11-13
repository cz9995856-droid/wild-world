import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export type AdminRole = "admin" | "editor" | "viewer";

export const ADMIN_COOKIE = "ww_admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 8;

function secret(): string {
  return process.env.ADMIN_SESSION_SECRET || "";
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

function roleForPassword(password: string): AdminRole | null {
  const admin = process.env.ADMIN_PASSWORD;
  const editor = process.env.ADMIN_EDITOR_PASSWORD;
  const viewer = process.env.ADMIN_VIEWER_PASSWORD;
  if (admin && safeEqual(password, admin)) return "admin";
  if (editor && safeEqual(password, editor)) return "editor";
  if (viewer && safeEqual(password, viewer)) return "viewer";
  return null;
}

export function adminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_SESSION_SECRET);
}

export function createSessionToken(role: AdminRole): string {
  const payload = JSON.stringify({ role, exp: Date.now() + MAX_AGE_SECONDS * 1000 });
  const encoded = Buffer.from(payload).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function verifySessionToken(token: string | undefined): { role: AdminRole; exp: number } | null {
  if (!token || !secret()) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;
  if (!safeEqual(sign(encoded), signature)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as { role?: AdminRole; exp?: number };
    if (!parsed.role || !parsed.exp || parsed.exp < Date.now()) return null;
    return { role: parsed.role, exp: parsed.exp };
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<{ role: AdminRole; exp: number } | null> {
  const store = await cookies();
  return verifySessionToken(store.get(ADMIN_COOKIE)?.value);
}

export async function requireAdmin(roles: AdminRole[] = ["admin", "editor", "viewer"]) {
  const session = await getAdminSession();
  if (!session || !roles.includes(session.role)) return null;
  return session;
}

export async function login(password: string): Promise<{ ok: boolean; role?: AdminRole; error?: string }> {
  if (!adminConfigured()) {
    return { ok: false, error: "后台尚未配置：请在服务端设置 ADMIN_PASSWORD 与 ADMIN_SESSION_SECRET。" };
  }
  const role = roleForPassword(password);
  if (!role) return { ok: false, error: "密码不正确。" };
  const store = await cookies();
  store.set(ADMIN_COOKIE, createSessionToken(role), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
  return { ok: true, role };
}

export async function logout(): Promise<void> {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
}