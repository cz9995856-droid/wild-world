"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Database,
  Download,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Loader2,
  LogOut,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Settings,
  Shield,
  Trash2,
  X,
} from "lucide-react";
import type { AdminRole } from "@/lib/auth";

interface SpeciesRow {
  slug: string;
  name_cn: string;
  name_en: string;
  scientific_name: string;
  group: string;
  group_label: string;
  status: string;
  status_label: string;
  year: number;
  trend: string;
  featured: boolean;
  review_status: string;
  data_status: string;
  tagline: string;
  summary: string;
  diet: string;
  habitat: string;
  population_note: string;
  weight: [number, number];
  lifespan: [number, number];
}

interface NewsRow {
  id: string;
  slug: string;
  title_cn: string | null;
  title_original: string;
  source_name: string;
  published_at: string;
  category: string;
  review_status: string;
  featured: boolean;
  summary_cn: string | null;
  original_url: string;
}

interface SourceRow {
  id: string;
  name: string;
  homepage: string;
  access: string;
  configured: boolean;
  live: boolean;
  status_note: string;
  license_note: string;
  env_vars: string[];
}

interface MediaRow {
  id: string;
  title: string;
  author: string;
  license: string;
  commercial_use: boolean;
  download_allowed: boolean;
  source_name: string;
  source_url: string;
  review_status: string;
}

interface LogRow {
  id: string;
  job: string;
  status: string;
  message: string;
  started_at: string;
  finished_at: string;
  items: number;
  actor: string;
}

interface SettingsRow {
  hero_video_url: string;
  hero_poster: string;
  hero_video_credit: string;
  daily_species_slug: string | null;
  announcement: string | null;
}

interface SectionRow {
  id: string;
  label: string;
  description: string;
  default_visible: boolean;
  order: number;
}

const TABS = [
  { id: "overview", label: "概览", icon: Database },
  { id: "species", label: "物种档案", icon: FileText },
  { id: "news", label: "新闻审核", icon: Shield },
  { id: "media", label: "媒体资源", icon: ImageIcon },
  { id: "sources", label: "来源与许可", icon: ExternalLink },
  { id: "sync", label: "同步与日志", icon: RefreshCw },
  { id: "settings", label: "站点设置", icon: Settings },
] as const;

type TabId = (typeof TABS)[number]["id"];

function Toast({ message, tone }: { message: string; tone: "ok" | "error" }) {
  return (
    <div
      className={`fixed bottom-5 right-5 z-[130] max-w-sm border p-3 text-[11px] shadow-lg ${
        tone === "ok" ? "border-[#2A6B51]/40 bg-[#2A6B51] text-white" : "border-[var(--clay)] bg-[var(--clay)] text-white"
      }`}
      role="status"
    >
      {message}
    </div>
  );
}

export function AdminApp({
  role,
  counts,
  species,
  news,
  sources,
  media,
  logs,
  settings,
  sections,
  integration,
}: {
  role: AdminRole;
  counts: { species: number; news: number; pending: number; media: number; audio: number; sources: number };
  species: SpeciesRow[];
  news: NewsRow[];
  sources: SourceRow[];
  media: MediaRow[];
  logs: LogRow[];
  settings: SettingsRow;
  sections: SectionRow[];
  integration: { generated_at: string | null; photo_count: number; errors: number };
}) {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>("overview");
  const [toast, setToast] = useState<{ message: string; tone: "ok" | "error" } | null>(null);
  const [busy, setBusy] = useState(false);
  const canEdit = role === "admin" || role === "editor";
  const isAdmin = role === "admin";

  function notify(message: string, tone: "ok" | "error" = "ok") {
    setToast({ message, tone });
    window.setTimeout(() => setToast(null), 4000);
  }

  async function post(url: string, body: unknown, success: string) {
    setBusy(true);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as { message?: string; note?: string; error?: string };
      if (!res.ok) throw new Error(json.message ?? json.note ?? json.error ?? `HTTP ${res.status}`);
      notify(json.note ?? success);
      router.refresh();
      return json;
    } catch (err) {
      notify(err instanceof Error ? err.message : String(err), "error");
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[var(--paper)] pb-16 pt-[76px]">
      <div className="container-museum">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] py-5">
          <div>
            <p className="label text-[var(--muted)]">Curator console</p>
            <h1 className="display mt-1 text-[30px]">WILD WORLD 后台</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip">角色：{role}</span>
            <a href="/api/admin/export" className="btn-outline">
              <Download size={13} /> 导出数据
            </a>
            <button onClick={logout} className="btn-outline">
              <LogOut size={13} /> 退出
            </button>
          </div>
        </div>

        <div className="grid gap-6 py-6 lg:grid-cols-[200px_1fr]">
          <nav className="no-scrollbar flex gap-1 overflow-x-auto lg:flex-col" aria-label="后台导航">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex min-w-[120px] items-center gap-2 border px-3 py-2.5 text-left text-[11.5px] lg:w-full ${
                    active ? "border-[var(--forest)] bg-[var(--forest)] text-[#F5F1E7]" : "border-[var(--line)]"
                  }`}
                >
                  <Icon size={13} /> {t.label}
                </button>
              );
            })}
          </nav>

          <div className="min-w-0">
            {tab === "overview" && (
              <section>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
                  {[
                    ["物种档案", counts.species],
                    ["新闻条目", counts.news],
                    ["待审核", counts.pending],
                    ["影像", counts.media],
                    ["录音", counts.audio],
                    ["来源", counts.sources],
                  ].map(([label, value]) => (
                    <div key={label as string} className="border border-[var(--line)] bg-[var(--surface)] p-4">
                      <p className="display text-[28px]">{value as number}</p>
                      <p className="mt-1 text-[9px] uppercase tracking-widest text-[var(--muted)]">{label as string}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 grid gap-3 lg:grid-cols-2">
                  <div className="border border-[var(--line)] bg-[var(--surface)] p-5">
                    <p className="label text-[var(--muted)]">Runtime status</p>
                    <ul className="mt-3 space-y-2 text-[10.5px]">
                      <li className="flex justify-between"><span className="text-[var(--muted)]">本地内容仓库</span><span>启用的回退仓库</span></li>
                      <li className="flex justify-between"><span className="text-[var(--muted)]">Supabase</span><span>{process.env.NEXT_PUBLIC_SUPABASE_URL ? "环境变量存在" : "未配置"}</span></li>
                      <li className="flex justify-between"><span className="text-[var(--muted)]">媒体集成</span><span>{integration.photo_count} 张 · {integration.errors} 个错误</span></li>
                      <li className="flex justify-between"><span className="text-[var(--muted)]">媒体生成时间</span><span>{integration.generated_at?.slice(0, 16).replace("T", " ") ?? "未生成"}</span></li>
                      <li className="flex justify-between"><span className="text-[var(--muted)]">最近同步</span><span>{logs[0] ? `${logs[0].job} · ${logs[0].status}` : "无记录"}</span></li>
                    </ul>
                    <p className="mt-3 border-t border-[var(--line)] pt-3 text-[9px] leading-relaxed text-[var(--muted)]">
                      连接状态只由环境变量与实际探测决定。后台可以记录审核与备注，但不能把未连接的数据源标记为已连接。
                    </p>
                  </div>
                  <div className="border border-[var(--line)] bg-[var(--surface)] p-5">
                    <p className="label text-[var(--muted)]">Quick actions</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button onClick={() => setTab("news")} className="btn-outline">审核新闻（{counts.pending}）</button>
                      <button onClick={() => setTab("species")} className="btn-outline">编辑物种</button>
                      <button onClick={() => setTab("sync")} className="btn-outline">运行 RSS 同步</button>
                      <button onClick={() => setTab("settings")} className="btn-outline">首页设置</button>
                    </div>
                    <p className="mt-4 text-[9px] leading-relaxed text-[var(--muted)]">
                      viewer 角色只读；editor 可编辑内容与审核；admin 额外可删除、修改站点设置与运行同步。
                    </p>
                  </div>
                </div>
              </section>
            )}

            {tab === "species" && (
              <SpeciesPanel
                species={species}
                canEdit={canEdit}
                isAdmin={isAdmin}
                busy={busy}
                post={post}
              />
            )}
            {tab === "news" && (
              <NewsPanel news={news} canEdit={canEdit} busy={busy} post={post} />
            )}
            {tab === "media" && (
              <MediaPanel media={media} canEdit={canEdit} post={post} />
            )}
            {tab === "sources" && (
              <SourcesPanel sources={sources} canEdit={canEdit} post={post} />
            )}
            {tab === "sync" && (
              <SyncPanel logs={logs} canEdit={canEdit} isAdmin={isAdmin} busy={busy} post={post} lastRun={integration.generated_at} />
            )}
            {tab === "settings" && (
              <SettingsPanel settings={settings} sections={sections} species={species} isAdmin={isAdmin} post={post} />
            )}
          </div>
        </div>
      </div>
      {toast && <Toast message={toast.message} tone={toast.tone} />}
    </div>
  );
}

function SpeciesPanel({
  species,
  canEdit,
  isAdmin,
  busy,
  post,
}: {
  species: SpeciesRow[];
  canEdit: boolean;
  isAdmin: boolean;
  busy: boolean;
  post: (url: string, body: unknown, success: string) => Promise<unknown>;
}) {
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<SpeciesRow | null>(null);
  const [creating, setCreating] = useState(false);
  const filtered = species.filter((s) =>
    `${s.name_cn} ${s.name_en} ${s.scientific_name} ${s.status}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <section>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索物种…" className="field flex-1" aria-label="搜索物种" />
        {canEdit && (
          <button onClick={() => setCreating(true)} className="btn-primary">
            <Plus size={14} /> 新增物种
          </button>
        )}
        <span className="text-[10px] text-[var(--muted)]">{filtered.length} 条</span>
      </div>

      <div className="overflow-x-auto border border-[var(--line)]">
        <table className="w-full min-w-[860px] border-collapse text-left text-[11px]">
          <thead className="bg-[var(--surface-2)] text-[9px] uppercase tracking-widest text-[var(--muted)]">
            <tr>
              <th className="p-2.5 font-normal">物种</th>
              <th className="p-2.5 font-normal">类群</th>
              <th className="p-2.5 font-normal">保护等级</th>
              <th className="p-2.5 font-normal">状态</th>
              <th className="p-2.5 font-normal">精选</th>
              <th className="p-2.5 font-normal">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.slug} className="border-t border-[var(--line)]">
                <td className="p-2.5">
                  <Link href={`/encyclopedia/${s.slug}`} target="_blank" className="hover:underline">{s.name_cn}</Link>
                  <span className="ml-1 text-[9px] text-[var(--muted)]">{s.name_en}</span>
                  <p className="font-mono text-[8.5px] italic text-[var(--muted)]">{s.scientific_name}</p>
                </td>
                <td className="p-2.5 text-[var(--muted)]">{s.group_label}</td>
                <td className="p-2.5">{s.status_label} <span className="font-mono text-[9px] text-[var(--muted)]">{s.status}/{s.year}</span></td>
                <td className="p-2.5 text-[10px]">{s.review_status}</td>
                <td className="p-2.5">{s.featured ? "是" : "—"}</td>
                <td className="p-2.5">
                  <div className="flex gap-2">
                    {canEdit && (
                      <button onClick={() => setEditing(s)} className="inline-flex items-center gap-1 underline">
                        <Pencil size={10} /> 编辑
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => {
                          if (window.confirm(`确认从馆藏中移除 ${s.name_cn}？`)) {
                            post("/api/admin/species", { action: "delete", slug: s.slug }, "已移除");
                          }
                        }}
                        className="inline-flex items-center gap-1 text-[var(--clay)] underline"
                      >
                        <Trash2 size={10} /> 删除
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && <SpeciesEditModal row={editing} post={post} onClose={() => setEditing(null)} />}
      {creating && <SpeciesCreateModal post={post} onClose={() => setCreating(false)} busy={busy} />}
    </section>
  );
}

function SpeciesEditModal({
  row,
  post,
  onClose,
}: {
  row: SpeciesRow;
  post: (url: string, body: unknown, success: string) => Promise<unknown>;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name_cn: row.name_cn,
    name_en: row.name_en,
    scientific_name: row.scientific_name,
    tagline: row.tagline,
    summary: row.summary,
    diet: row.diet,
    habitat: row.habitat,
    conservation_status: row.status,
    assessment_year: row.year,
    population_note: row.population_note,
    review_status: row.review_status,
    data_status: row.data_status,
  });

  return (
    <div className="fixed inset-0 z-[120] bg-black/40 p-4" role="dialog" aria-modal="true">
      <div className="mx-auto max-h-[92vh] max-w-2xl overflow-y-auto border border-[var(--line)] bg-[var(--paper)] p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="label text-[var(--muted)]">Edit species</p>
            <h2 className="display mt-1 text-[24px]">{row.name_cn}</h2>
          </div>
          <button onClick={onClose} aria-label="关闭"><X size={18} /></button>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {[
            ["name_cn", "中文名"],
            ["name_en", "英文名"],
            ["scientific_name", "学名"],
            ["tagline", "一句话概述"],
          ].map(([key, label]) => (
            <label key={key} className="block">
              <span className="label text-[var(--muted)]">{label}</span>
              <input
                value={String(form[key as keyof typeof form])}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="field mt-1"
              />
            </label>
          ))}
        </div>
        <label className="mt-3 block">
          <span className="label text-[var(--muted)]">概述</span>
          <textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} rows={4} className="field mt-1 h-auto py-2" />
        </label>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="label text-[var(--muted)]">食性</span>
            <textarea value={form.diet} onChange={(e) => setForm({ ...form, diet: e.target.value })} rows={2} className="field mt-1 h-auto py-2" />
          </label>
          <label className="block">
            <span className="label text-[var(--muted)]">栖息地</span>
            <textarea value={form.habitat} onChange={(e) => setForm({ ...form, habitat: e.target.value })} rows={2} className="field mt-1 h-auto py-2" />
          </label>
          <label className="block">
            <span className="label text-[var(--muted)]">保护等级</span>
            <select value={form.conservation_status} onChange={(e) => setForm({ ...form, conservation_status: e.target.value })} className="select-field mt-1">
              {["LC", "NT", "VU", "EN", "CR", "EW", "EX", "DD", "NE"].map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="label text-[var(--muted)]">评估年份</span>
            <input type="number" value={form.assessment_year} onChange={(e) => setForm({ ...form, assessment_year: Number(e.target.value) })} className="field mt-1" />
          </label>
          <label className="block">
            <span className="label text-[var(--muted)]">审核状态</span>
            <select value={form.review_status} onChange={(e) => setForm({ ...form, review_status: e.target.value })} className="select-field mt-1">
              {["verified", "editorial", "pending_review", "sample"].map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="label text-[var(--muted)]">数据状态</span>
            <select value={form.data_status} onChange={(e) => setForm({ ...form, data_status: e.target.value })} className="select-field mt-1">
              {["curated", "live", "pending", "unconfigured"].map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
        </div>
        <label className="mt-3 block">
          <span className="label text-[var(--muted)]">种群说明（必须保留来源语义）</span>
          <textarea value={form.population_note} onChange={(e) => setForm({ ...form, population_note: e.target.value })} rows={3} className="field mt-1 h-auto py-2" />
        </label>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="btn-outline">取消</button>
          <button
            onClick={async () => {
              const res = await post("/api/admin/species", { action: "update", slug: row.slug, patch: { ...form, assessment_year: Number(form.assessment_year) } }, "已保存");
              if (res) onClose();
            }}
            className="btn-primary"
          >
            <Save size={13} /> 保存
          </button>
        </div>
      </div>
    </div>
  );
}

function SpeciesCreateModal({
  post,
  onClose,
  busy,
}: {
  post: (url: string, body: unknown, success: string) => Promise<unknown>;
  onClose: () => void;
  busy: boolean;
}) {
  const [form, setForm] = useState({
    slug: "",
    name_cn: "",
    name_en: "",
    scientific_name: "",
    group: "mammal",
    tagline: "",
    summary: "",
    diet: "",
    habitat: "",
    conservation_status: "NE",
    assessment_year: new Date().getFullYear(),
    weight_min_kg: 1,
    weight_max_kg: 10,
    lifespan_min: 1,
    lifespan_max: 10,
  });

  return (
    <div className="fixed inset-0 z-[120] bg-black/40 p-4" role="dialog" aria-modal="true">
      <div className="mx-auto max-h-[92vh] max-w-2xl overflow-y-auto border border-[var(--line)] bg-[var(--paper)] p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="label text-[var(--muted)]">New species</p>
            <h2 className="display mt-1 text-[24px]">新增物种档案</h2>
            <p className="mt-1 text-[10px] text-[var(--muted)]">新增条目默认进入「待审核」，不会自动标记为已核验。</p>
          </div>
          <button onClick={onClose} aria-label="关闭"><X size={18} /></button>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {[
            ["slug", "URL slug（小写字母/数字/连字符）"],
            ["name_cn", "中文名"],
            ["name_en", "英文名"],
            ["scientific_name", "学名"],
          ].map(([key, label]) => (
            <label key={key} className="block">
              <span className="label text-[var(--muted)]">{label}</span>
              <input value={String(form[key as keyof typeof form])} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="field mt-1" />
            </label>
          ))}
          <label className="block">
            <span className="label text-[var(--muted)]">类群</span>
            <select value={form.group} onChange={(e) => setForm({ ...form, group: e.target.value })} className="select-field mt-1">
              <option value="mammal">哺乳动物</option>
              <option value="bird">鸟类</option>
              <option value="reptile">爬行动物</option>
              <option value="amphibian">两栖动物</option>
              <option value="insect">昆虫</option>
            </select>
          </label>
          <label className="block">
            <span className="label text-[var(--muted)]">保护等级</span>
            <select value={form.conservation_status} onChange={(e) => setForm({ ...form, conservation_status: e.target.value })} className="select-field mt-1">
              {["LC", "NT", "VU", "EN", "CR", "DD", "NE"].map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
        </div>
        <label className="mt-3 block">
          <span className="label text-[var(--muted)]">一句话概述</span>
          <input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} className="field mt-1" />
        </label>
        <label className="mt-3 block">
          <span className="label text-[var(--muted)]">概述</span>
          <textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} rows={3} className="field mt-1 h-auto py-2" />
        </label>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="label text-[var(--muted)]">食性</span>
            <textarea value={form.diet} onChange={(e) => setForm({ ...form, diet: e.target.value })} rows={2} className="field mt-1 h-auto py-2" />
          </label>
          <label className="block">
            <span className="label text-[var(--muted)]">栖息地</span>
            <textarea value={form.habitat} onChange={(e) => setForm({ ...form, habitat: e.target.value })} rows={2} className="field mt-1 h-auto py-2" />
          </label>
          <label className="block">
            <span className="label text-[var(--muted)]">体重范围（kg）</span>
            <div className="mt-1 flex gap-2">
              <input type="number" value={form.weight_min_kg} onChange={(e) => setForm({ ...form, weight_min_kg: Number(e.target.value) })} className="field" aria-label="最小体重" />
              <input type="number" value={form.weight_max_kg} onChange={(e) => setForm({ ...form, weight_max_kg: Number(e.target.value) })} className="field" aria-label="最大体重" />
            </div>
          </label>
          <label className="block">
            <span className="label text-[var(--muted)]">寿命范围（年）</span>
            <div className="mt-1 flex gap-2">
              <input type="number" value={form.lifespan_min} onChange={(e) => setForm({ ...form, lifespan_min: Number(e.target.value) })} className="field" aria-label="最小寿命" />
              <input type="number" value={form.lifespan_max} onChange={(e) => setForm({ ...form, lifespan_max: Number(e.target.value) })} className="field" aria-label="最大寿命" />
            </div>
          </label>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="btn-outline">取消</button>
          <button
            disabled={busy}
            onClick={async () => {
              const res = await post("/api/admin/species", { action: "create", species: form }, "已创建，状态为待审核");
              if (res) onClose();
            }}
            className="btn-primary disabled:opacity-40"
          >
            {busy ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />} 创建
          </button>
        </div>
      </div>
    </div>
  );
}

function NewsPanel({
  news,
  canEdit,
  busy,
  post,
}: {
  news: NewsRow[];
  canEdit: boolean;
  busy: boolean;
  post: (url: string, body: unknown, success: string) => Promise<unknown>;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [editing, setEditing] = useState<NewsRow | null>(null);
  const [importing, setImporting] = useState(false);
  const filtered = useMemo(
    () =>
      news.filter((n) => {
        if (status !== "all" && n.review_status !== status) return false;
        return `${n.title_cn ?? ""} ${n.title_original} ${n.source_name}`.toLowerCase().includes(query.toLowerCase());
      }),
    [news, query, status]
  );

  return (
    <section>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="搜索标题或来源…" className="field flex-1" aria-label="搜索新闻" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="select-field sm:w-40" aria-label="审核状态">
          <option value="all">全部状态</option>
          <option value="pending_review">待审核</option>
          <option value="editorial">编辑整理</option>
          <option value="verified">已核验</option>
        </select>
        {canEdit && (
          <>
            <button onClick={() => setImporting(true)} className="btn-outline"><Plus size={13} /> 人工导入</button>
            <button
              onClick={() => post("/api/admin/news", { action: "sync" }, "RSS 同步任务已执行")}
              disabled={busy}
              className="btn-primary disabled:opacity-40"
            >
              {busy ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />} 立即同步
            </button>
          </>
        )}
      </div>
      <div className="overflow-x-auto border border-[var(--line)]">
        <table className="w-full min-w-[900px] border-collapse text-left text-[11px]">
          <thead className="bg-[var(--surface-2)] text-[9px] uppercase tracking-widest text-[var(--muted)]">
            <tr>
              <th className="p-2.5 font-normal">标题</th>
              <th className="p-2.5 font-normal">来源 / 日期</th>
              <th className="p-2.5 font-normal">分类</th>
              <th className="p-2.5 font-normal">状态</th>
              <th className="p-2.5 font-normal">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((n) => (
              <tr key={n.id} className="border-t border-[var(--line)] align-top">
                <td className="max-w-[380px] p-2.5">
                  <p className="line-clamp-2">{n.title_cn ?? n.title_original}</p>
                  {n.title_cn && <p className="mt-0.5 line-clamp-1 text-[9px] italic text-[var(--muted)]">{n.title_original}</p>}
                  {n.featured && <span className="mt-1 inline-block text-[8px] uppercase tracking-widest text-[var(--amber)]">Featured</span>}
                </td>
                <td className="p-2.5 text-[10px] text-[var(--muted)]">
                  {n.source_name}
                  <br />
                  {n.published_at.slice(0, 10)}
                </td>
                <td className="p-2.5 text-[10px] text-[var(--muted)]">{n.category}</td>
                <td className="p-2.5 text-[10px]">{n.review_status}</td>
                <td className="p-2.5">
                  <div className="flex flex-wrap gap-2 text-[10px]">
                    <a href={`/news/${n.slug}`} target="_blank" className="underline">查看</a>
                    {canEdit && (
                      <>
                        <button onClick={() => setEditing(n)} className="underline">编辑</button>
                        <button
                          onClick={() => post("/api/admin/news", { action: "update", id: n.id, patch: { review_status: "editorial" } }, "已标记为编辑整理")}
                          className="underline"
                        >
                          通过
                        </button>
                        <button
                          onClick={() => post("/api/admin/news", { action: "update", id: n.id, patch: { featured: !n.featured } }, "已更新精选")}
                          className="underline"
                        >
                          {n.featured ? "取消精选" : "设为精选"}
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm("确认移除该新闻条目？")) post("/api/admin/news", { action: "delete", id: n.id }, "已移除");
                          }}
                          className="text-[var(--clay)] underline"
                        >
                          移除
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[9.5px] leading-relaxed text-[var(--muted)]">
        共 {news.length} 条；当前筛选 {filtered.length} 条。审核不会改写源站标题与日期，只更新中文编辑内容与状态。
      </p>

      {editing && <NewsEditModal row={editing} post={post} onClose={() => setEditing(null)} />}
      {importing && <NewsImportModal post={post} onClose={() => setImporting(false)} busy={busy} />}
    </section>
  );
}

function NewsEditModal({
  row,
  post,
  onClose,
}: {
  row: NewsRow;
  post: (url: string, body: unknown, success: string) => Promise<unknown>;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    title_cn: row.title_cn ?? "",
    summary_cn: row.summary_cn ?? "",
    category: row.category,
    review_status: row.review_status,
  });
  return (
    <div className="fixed inset-0 z-[120] bg-black/40 p-4" role="dialog" aria-modal="true">
      <div className="mx-auto mt-[6vh] max-h-[86vh] max-w-xl overflow-y-auto border border-[var(--line)] bg-[var(--paper)] p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="label text-[var(--muted)]">Review article</p>
            <h2 className="display mt-1 text-[22px]">编辑新闻</h2>
          </div>
          <button onClick={onClose} aria-label="关闭"><X size={18} /></button>
        </div>
        <p className="mt-3 border-l-2 border-[var(--amber)] pl-3 font-serif text-[11px] italic leading-relaxed text-[var(--muted)]">
          {row.title_original}
        </p>
        <label className="mt-4 block">
          <span className="label text-[var(--muted)]">中文标题（编辑翻译）</span>
          <input value={form.title_cn} onChange={(e) => setForm({ ...form, title_cn: e.target.value })} className="field mt-1" />
        </label>
        <label className="mt-3 block">
          <span className="label text-[var(--muted)]">中文摘要（依据 RSS 摘要整理）</span>
          <textarea value={form.summary_cn} onChange={(e) => setForm({ ...form, summary_cn: e.target.value })} rows={4} className="field mt-1 h-auto py-2" />
        </label>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="label text-[var(--muted)]">分类</span>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="select-field mt-1">
              {["new_species", "conservation", "research", "environment", "incident", "zoo"].map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="label text-[var(--muted)]">审核状态</span>
            <select value={form.review_status} onChange={(e) => setForm({ ...form, review_status: e.target.value })} className="select-field mt-1">
              {["pending_review", "editorial", "verified"].map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="btn-outline">取消</button>
          <button
            onClick={async () => {
              const res = await post(
                "/api/admin/news",
                {
                  action: "update",
                  id: row.id,
                  patch: {
                    title_cn: form.title_cn || null,
                    summary_cn: form.summary_cn || null,
                    category: form.category,
                    review_status: form.review_status,
                  },
                },
                "新闻已更新"
              );
              if (res) onClose();
            }}
            className="btn-primary"
          >
            <Save size={13} /> 保存
          </button>
        </div>
      </div>
    </div>
  );
}

function NewsImportModal({
  post,
  onClose,
  busy,
}: {
  post: (url: string, body: unknown, success: string) => Promise<unknown>;
  onClose: () => void;
  busy: boolean;
}) {
  const [form, setForm] = useState({
    title_original: "",
    title_cn: "",
    summary_cn: "",
    original_url: "",
    source_name: "",
    published_at: new Date().toISOString().slice(0, 10),
    category: "conservation",
    keywords: "",
  });
  return (
    <div className="fixed inset-0 z-[120] bg-black/40 p-4" role="dialog" aria-modal="true">
      <div className="mx-auto mt-[6vh] max-h-[86vh] max-w-xl overflow-y-auto border border-[var(--line)] bg-[var(--paper)] p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="label text-[var(--muted)]">Manual import</p>
            <h2 className="display mt-1 text-[22px]">人工导入新闻</h2>
            <p className="mt-1 text-[9.5px] text-[var(--muted)]">仅导入标题、摘要与链接；需自行确认引用权限。</p>
          </div>
          <button onClick={onClose} aria-label="关闭"><X size={18} /></button>
        </div>
        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="label text-[var(--muted)]">原文标题 *</span>
            <input value={form.title_original} onChange={(e) => setForm({ ...form, title_original: e.target.value })} className="field mt-1" />
          </label>
          <label className="block">
            <span className="label text-[var(--muted)]">原文链接 *</span>
            <input value={form.original_url} onChange={(e) => setForm({ ...form, original_url: e.target.value })} className="field mt-1" placeholder="https://…" />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="label text-[var(--muted)]">来源机构 *</span>
              <input value={form.source_name} onChange={(e) => setForm({ ...form, source_name: e.target.value })} className="field mt-1" />
            </label>
            <label className="block">
              <span className="label text-[var(--muted)]">发布日期 *</span>
              <input type="date" value={form.published_at} onChange={(e) => setForm({ ...form, published_at: e.target.value })} className="field mt-1" />
            </label>
          </div>
          <label className="block">
            <span className="label text-[var(--muted)]">中文标题（可选）</span>
            <input value={form.title_cn} onChange={(e) => setForm({ ...form, title_cn: e.target.value })} className="field mt-1" />
          </label>
          <label className="block">
            <span className="label text-[var(--muted)]">中文摘要（可选）</span>
            <textarea value={form.summary_cn} onChange={(e) => setForm({ ...form, summary_cn: e.target.value })} rows={3} className="field mt-1 h-auto py-2" />
          </label>
          <label className="block">
            <span className="label text-[var(--muted)]">关键词（逗号分隔）</span>
            <input value={form.keywords} onChange={(e) => setForm({ ...form, keywords: e.target.value })} className="field mt-1" />
          </label>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="btn-outline">取消</button>
          <button
            disabled={busy}
            onClick={async () => {
              const res = await post(
                "/api/admin/news",
                {
                  action: "import",
                  article: {
                    ...form,
                    keywords: form.keywords.split(",").map((k) => k.trim()).filter(Boolean).slice(0, 10),
                  },
                },
                "已导入，状态为待审核"
              );
              if (res) onClose();
            }}
            className="btn-primary disabled:opacity-40"
          >
            {busy ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />} 导入
          </button>
        </div>
      </div>
    </div>
  );
}

function MediaPanel({
  media,
  canEdit,
  post,
}: {
  media: MediaRow[];
  canEdit: boolean;
  post: (url: string, body: unknown, success: string) => Promise<unknown>;
}) {
  return (
    <section>
      <div className="mb-4 border border-[var(--line)] bg-[var(--surface-2)] p-4 text-[10px] leading-relaxed text-[var(--muted)]">
        媒体资源来自 iNaturalist 开放数据，本地化保存在 <code className="font-mono">public/media</code>。
        这里只能更新审核标记，不能修改原始许可。替换文件需重新运行 <code className="font-mono">npm run fetch:media</code> 或通过 Supabase 迁移导入。
      </div>
      <div className="overflow-x-auto border border-[var(--line)]">
        <table className="w-full min-w-[900px] border-collapse text-left text-[11px]">
          <thead className="bg-[var(--surface-2)] text-[9px] uppercase tracking-widest text-[var(--muted)]">
            <tr>
              <th className="p-2.5 font-normal">影像</th>
              <th className="p-2.5 font-normal">作者</th>
              <th className="p-2.5 font-normal">许可</th>
              <th className="p-2.5 font-normal">商用 / 下载</th>
              <th className="p-2.5 font-normal">审核</th>
              <th className="p-2.5 font-normal">操作</th>
            </tr>
          </thead>
          <tbody>
            {media.slice(0, 80).map((m) => (
              <tr key={m.id} className="border-t border-[var(--line)]">
                <td className="max-w-[220px] p-2.5">
                  <p className="truncate">{m.title}</p>
                  <a href={m.source_url} target="_blank" rel="noreferrer" className="text-[9px] underline">{m.source_name}</a>
                </td>
                <td className="p-2.5 text-[10px] text-[var(--muted)]">{m.author}</td>
                <td className="p-2.5 font-mono text-[9px]">{m.license}</td>
                <td className="p-2.5 text-[9.5px]">
                  {m.commercial_use ? "可商用" : "非商业"} / {m.download_allowed ? "可下载" : "不可下载"}
                </td>
                <td className="p-2.5 text-[9.5px]">{m.review_status}</td>
                <td className="p-2.5">
                  {canEdit && m.review_status !== "verified" && (
                    <button
                      onClick={() => post("/api/admin/sources", { action: "media-review", id: m.id, review_status: "verified" }, "影像已标记为已核验")}
                      className="inline-flex items-center gap-1 underline"
                    >
                      <Check size={10} /> 标记已核验
                    </button>
                  )}
                  {m.review_status === "verified" && <span className="inline-flex items-center gap-1 text-[#2A6B51]"><Check size={10} /> 已核验</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[9.5px] text-[var(--muted)]">显示前 80 条；共 {media.length} 张授权影像。</p>
    </section>
  );
}

function SourcesPanel({
  sources,
  canEdit,
  post,
}: {
  sources: SourceRow[];
  canEdit: boolean;
  post: (url: string, body: unknown, success: string) => Promise<unknown>;
}) {
  return (
    <section className="space-y-3">
      <div className="border border-[var(--line)] bg-[var(--surface-2)] p-4 text-[10px] leading-relaxed text-[var(--muted)]">
        连接状态（已配置 / 实时）由服务端环境变量与实际探测决定。这里可以维护许可说明、检查时间与备注，
        但不能把未连接的来源标记为已连接。
      </div>
      {sources.map((s) => (
        <SourceCard key={s.id} source={s} canEdit={canEdit} post={post} />
      ))}
    </section>
  );
}

function SourceCard({
  source,
  canEdit,
  post,
}: {
  source: SourceRow;
  canEdit: boolean;
  post: (url: string, body: unknown, success: string) => Promise<unknown>;
}) {
  const [note, setNote] = useState(source.status_note);
  const [license, setLicense] = useState(source.license_note);
  return (
    <div className="border border-[var(--line)] bg-[var(--surface)] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[12.5px] font-medium">{source.name}</p>
          <a href={source.homepage} target="_blank" rel="noreferrer" className="text-[9px] text-[var(--muted)] underline">{source.homepage}</a>
        </div>
        <div className="flex items-center gap-2 text-[9.5px]">
          <span className={`h-1.5 w-1.5 rounded-full ${source.configured ? "bg-[#2A6B51]" : "bg-[var(--clay)]"}`} />
          {source.configured ? "已配置" : "未配置"}
          {source.live ? " · 实时" : ""}
        </div>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <label className="block">
          <span className="label text-[var(--muted)]">状态备注</span>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} disabled={!canEdit} className="field mt-1 h-auto py-2 text-[10px]" />
        </label>
        <label className="block">
          <span className="label text-[var(--muted)]">许可说明</span>
          <textarea value={license} onChange={(e) => setLicense(e.target.value)} rows={2} disabled={!canEdit} className="field mt-1 h-auto py-2 text-[10px]" />
        </label>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-[8.5px] text-[var(--muted)]">ENV: {source.env_vars.join(", ") || "—"}</p>
        {canEdit && (
          <button
            onClick={() =>
              post(
                "/api/admin/sources",
                { action: "update-source", id: source.id, patch: { status_note: note, license_note: license, last_checked_at: new Date().toISOString().slice(0, 10) } },
                "来源信息已保存"
              )
            }
            className="btn-outline h-8 px-3 text-[10px]"
          >
            <Save size={11} /> 保存
          </button>
        )}
      </div>
    </div>
  );
}

function SyncPanel({
  logs,
  canEdit,
  isAdmin,
  busy,
  post,
  lastRun,
}: {
  logs: LogRow[];
  canEdit: boolean;
  isAdmin: boolean;
  busy: boolean;
  post: (url: string, body: unknown, success: string) => Promise<unknown>;
  lastRun: string | null;
}) {
  const [result, setResult] = useState<{ logs?: Array<{ source_name: string; ok: boolean; count: number; message: string }>; write_error?: string | null } | null>(null);
  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3 border border-[var(--line)] bg-[var(--surface)] p-4">
        <div>
          <p className="text-[12px]">RSS 新闻同步任务</p>
          <p className="mt-1 text-[9.5px] text-[var(--muted)]">
            同步 Mongabay / Nature / ScienceDaily / Phys.org；结果写入待审核队列。BBC 与 WWF 在当前网络下会失败并记录原因。
          </p>
          <p className="mt-1 text-[9px] text-[var(--muted)]">最近媒体集成：{lastRun?.slice(0, 16).replace("T", " ") ?? "未生成"}</p>
        </div>
        <button
          onClick={async () => {
            const res = (await post("/api/admin/news", { action: "sync" }, "同步任务已完成")) as typeof result;
            if (res) setResult(res);
          }}
          disabled={!canEdit || busy}
          className="btn-primary disabled:opacity-40"
        >
          {busy ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />} 运行同步
        </button>
      </div>

      {result?.logs && (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {result.logs.map((l) => (
            <div key={l.source_name} className={`border p-3 text-[10px] ${l.ok ? "border-[#2A6B51]/30 bg-[#2A6B51]/5" : "border-[#A96246]/30 bg-[#A96246]/5"}`}>
              <p className="font-medium">{l.source_name} · {l.ok ? `成功 ${l.count} 条` : "失败"}</p>
              <p className="mt-1 text-[var(--muted)]">{l.message}</p>
            </div>
          ))}
          {result.write_error && <p className="text-[10px] text-[var(--clay)]">写入失败：{result.write_error}</p>}
        </div>
      )}

      <div className="mt-4 overflow-x-auto border border-[var(--line)]">
        <table className="w-full min-w-[760px] border-collapse text-left text-[10.5px]">
          <thead className="bg-[var(--surface-2)] text-[9px] uppercase tracking-widest text-[var(--muted)]">
            <tr>
              <th className="p-2.5 font-normal">任务</th>
              <th className="p-2.5 font-normal">状态</th>
              <th className="p-2.5 font-normal">条目</th>
              <th className="p-2.5 font-normal">执行者</th>
              <th className="p-2.5 font-normal">时间</th>
              <th className="p-2.5 font-normal">信息</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-t border-[var(--line)] align-top">
                <td className="p-2.5">{l.job}</td>
                <td className="p-2.5 text-[var(--muted)]">{l.status}</td>
                <td className="p-2.5">{l.items}</td>
                <td className="p-2.5 text-[var(--muted)]">{l.actor}</td>
                <td className="p-2.5 text-[var(--muted)]">{l.finished_at.slice(0, 16).replace("T", " ")}</td>
                <td className="p-2.5 text-[9.5px] text-[var(--muted)]">{l.message}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr><td colSpan={6} className="p-4 text-center text-[var(--muted)]">暂无同步记录。</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[9px] leading-relaxed text-[var(--muted)]">
        失败日志保留最近 200 条。{isAdmin ? "管理员可修改站点设置与删除内容。" : "当前角色不能修改站点设置。"}
      </p>
    </section>
  );
}

function SettingsPanel({
  settings,
  sections,
  species,
  isAdmin,
  post,
}: {
  settings: SettingsRow;
  sections: SectionRow[];
  species: SpeciesRow[];
  isAdmin: boolean;
  post: (url: string, body: unknown, success: string) => Promise<unknown>;
}) {
  const [form, setForm] = useState({
    hero_video_url: settings.hero_video_url,
    hero_poster: settings.hero_poster,
    hero_video_credit: settings.hero_video_credit,
    daily_species_slug: settings.daily_species_slug ?? "",
    announcement: settings.announcement ?? "",
  });
  const [sectionState, setSectionState] = useState(
    sections.map((s) => ({ id: s.id, label: s.label, visible: s.default_visible, order: s.order }))
  );

  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= sectionState.length) return;
    const next = [...sectionState];
    [next[index], next[target]] = [next[target], next[index]];
    setSectionState(next.map((s, i) => ({ ...s, order: i })));
  }

  return (
    <section className="space-y-4">
      {!isAdmin && <p className="border border-[#C29B4A]/40 bg-[#C29B4A]/5 p-3 text-[10px] text-[#8A6A28]">只有 admin 角色可以修改站点设置。</p>}
      <div className="border border-[var(--line)] bg-[var(--surface)] p-5">
        <p className="label text-[var(--muted)]">Hero · 首屏影像</p>
        <p className="mt-2 text-[9.5px] leading-relaxed text-[var(--muted)]">
          留空视频地址时使用本地授权摄影序列。视频地址必须是你拥有授权的直链，并填写署名。
        </p>
        <div className="mt-3 space-y-3">
          <label className="block">
            <span className="label text-[var(--muted)]">视频直链（可选）</span>
            <input value={form.hero_video_url} onChange={(e) => setForm({ ...form, hero_video_url: e.target.value })} className="field mt-1" placeholder="https://…/licensed-film.mp4" disabled={!isAdmin} />
          </label>
          <label className="block">
            <span className="label text-[var(--muted)]">视频署名</span>
            <input value={form.hero_video_credit} onChange={(e) => setForm({ ...form, hero_video_credit: e.target.value })} className="field mt-1" disabled={!isAdmin} />
          </label>
          <label className="block">
            <span className="label text-[var(--muted)]">海报 / 回退图片</span>
            <input value={form.hero_poster} onChange={(e) => setForm({ ...form, hero_poster: e.target.value })} className="field mt-1" placeholder="/media/hero/hero-01.jpg" disabled={!isAdmin} />
          </label>
        </div>
      </div>

      <div className="border border-[var(--line)] bg-[var(--surface)] p-5">
        <p className="label text-[var(--muted)]">Daily & announcement</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="label text-[var(--muted)]">每日动物（指定物种）</span>
            <select value={form.daily_species_slug} onChange={(e) => setForm({ ...form, daily_species_slug: e.target.value })} className="select-field mt-1" disabled={!isAdmin}>
              <option value="">按日期自动抽取</option>
              {species.map((s) => <option key={s.slug} value={s.slug}>{s.name_cn}</option>)}
            </select>
          </label>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            disabled={!isAdmin}
            onClick={() =>
              post(
                "/api/admin/settings",
                {
                  settings: {
                    hero_video_url: form.hero_video_url,
                    hero_poster: form.hero_poster,
                    hero_video_credit: form.hero_video_credit,
                    daily_species_slug: form.daily_species_slug || null,
                  },
                },
                "站点设置已保存"
              )
            }
            className="btn-primary disabled:opacity-40"
          >
            <Save size={13} /> 保存站点设置
          </button>
        </div>
      </div>

      <div className="border border-[var(--line)] bg-[var(--surface)] p-5">
        <p className="label text-[var(--muted)]">Home sections · 推荐区默认顺序</p>
        <p className="mt-2 text-[9.5px] text-[var(--muted)]">用户本机的自定义偏好优先于站点默认值。</p>
        <ul className="mt-3 space-y-1.5">
          {sectionState.map((s, i) => (
            <li key={s.id} className="flex items-center gap-2 border border-[var(--line)] px-3 py-2 text-[10.5px]">
              <span className="w-5 font-mono text-[9px] text-[var(--muted)]">{String(i + 1).padStart(2, "0")}</span>
              <span className={`flex-1 ${s.visible ? "" : "text-[var(--muted)] line-through"}`}>{s.label}</span>
              <button onClick={() => move(i, -1)} disabled={i === 0 || !isAdmin} className="p-1 disabled:opacity-30" aria-label="上移"><ArrowUp size={11} /></button>
              <button onClick={() => move(i, 1)} disabled={i === sectionState.length - 1 || !isAdmin} className="p-1 disabled:opacity-30" aria-label="下移"><ArrowDown size={11} /></button>
              <button
                onClick={() => setSectionState((prev) => prev.map((x) => (x.id === s.id ? { ...x, visible: !x.visible } : x)))}
                disabled={!isAdmin}
                className="border border-[var(--line)] px-2 py-0.5 text-[9px] disabled:opacity-30"
              >
                {s.visible ? "显示" : "隐藏"}
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-end">
          <button
            disabled={!isAdmin}
            onClick={() =>
              post(
                "/api/admin/settings",
                { sections: sectionState.map((s) => ({ id: s.id, visible: s.visible, order: s.order })) },
                "推荐区默认顺序已保存"
              )
            }
            className="btn-primary disabled:opacity-40"
          >
            <Save size={13} /> 保存顺序
          </button>
        </div>
      </div>

      <div className="border border-[var(--line)] bg-[var(--surface-2)] p-4 text-[9.5px] leading-relaxed text-[var(--muted)]">
        数据导入导出：使用右上角「导出数据」下载完整 JSON（含来源、许可与审核状态）。
        生产环境建议将 Supabase 作为主仓库并保留导出作为备份。
      </div>
    </section>
  );
}