"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LockKeyhole } from "lucide-react";

export function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = (await res.json()) as { message?: string; error?: string };
      if (!res.ok) throw new Error(json.message ?? json.error ?? `HTTP ${res.status}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[78vh] items-center justify-center px-5 pt-24">
      <form onSubmit={submit} className="w-full max-w-sm border border-[var(--line)] bg-[var(--surface)] p-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--line-strong)]">
          <LockKeyhole size={18} />
        </div>
        <p className="label mt-5 text-[var(--muted)]">Curator access</p>
        <h1 className="display mt-2 text-[28px]">后台管理登录</h1>
        <p className="mt-2 text-[10.5px] leading-relaxed text-[var(--muted)]">
          请输入管理员密码。角色由服务端环境变量决定：admin / editor / viewer。
        </p>
        <label className="label mt-6 block text-[var(--muted)]" htmlFor="admin-password">密码</label>
        <input
          id="admin-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          className="field mt-2"
          required
        />
        {error && <p className="mt-3 text-[10.5px] text-[var(--clay)]">{error}</p>}
        <button type="submit" disabled={loading || !password} className="btn-primary mt-5 w-full disabled:opacity-40">
          {loading ? <Loader2 size={14} className="animate-spin" /> : null}
          {loading ? "验证中…" : "登录"}
        </button>
        <p className="mt-5 border-t border-[var(--line)] pt-4 text-[9px] leading-relaxed text-[var(--muted)]">
          登录会话使用 HMAC 签名的 HttpOnly Cookie，有效期 8 小时。密码不会写入浏览器存储。
        </p>
      </form>
    </div>
  );
}