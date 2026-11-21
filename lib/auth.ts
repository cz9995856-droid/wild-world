import "server-only";
import { cookies } from "next/headers";

export type AdminRole = "admin" | "editor" | "viewer";

export const ADMIN_COOKIE = "ww_admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 8;

function secret(): string {
  return process.env.ADMIN_SESSION_SECRET || "";
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): string {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (value.length % 4)) % 4);
  return atob(padded);
}

async function sign(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return toBase64Url(new Uint8Array(signature));
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function roleForPassword(password: string): AdminRole | null {
  const admin = process.env.ADMIN_PASSWORD;
  const editor = process.env.ADMIN_EDITOR_PASSWORD;
  const viewer = process.env.ADMIN_VIEWER_PASSWORD;
  if (admin && constantTimeEqual(password, admin)) return "admin";
  if (editor && constantTimeEqual(password, editor)) return "editor";
  if (viewer && constantTimeEqual(password, viewer)) return "viewer";
  return null;
}

export function adminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_SESSION_SECRET);
}

export async function createSessionToken(role: AdminRole): Promise<string> {
  const payload = JSON.stringify({ role, exp: Date.now() + MAX_AGE_SECONDS * 1000 });
  const encoded = toBase64Url(new TextEncoder().encode(payload));
  return `${encoded}.${await sign(encoded)}`;
}

export async function verifySessionToken(token: string | undefined): Promise<{ role: AdminRole; exp: number } | null> {
  if (!token || !secret()) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;
  if (!constantTimeEqual(await sign(encoded), signature)) return null;
  try {
    const parsed = JSON.parse(fromBase64Url(encoded)) as { role?: AdminRole; exp?: number };
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
  store.set(ADMIN_COOKIE, await createSessionToken(role), {
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