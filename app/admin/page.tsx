import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, KeyRound } from "lucide-react";
import { AdminLogin } from "@/components/admin/admin-login";
import { AdminApp } from "@/components/admin/admin-app";
import { adminConfigured, getAdminSession } from "@/lib/auth";
import { readStore } from "@/lib/store/content-store";
import {
  getAllSpecies,
  getHomeSections,
  getIntegrationStatus,
  getMediaAssets,
  getNews,
  getSiteSettings,
  getSourceRegistry,
} from "@/lib/repository";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "后台管理",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  if (!adminConfigured()) {
    return (
      <div className="flex min-h-[78vh] items-center justify-center px-5 pt-24">
        <div className="w-full max-w-xl border border-[var(--line)] bg-[var(--surface)] p-6">
          <AlertTriangle size={24} className="text-[var(--amber)]" />
          <p className="label mt-4 text-[var(--muted)]">Setup required</p>
          <h1 className="display mt-2 text-[30px]">后台尚未启用</h1>
          <p className="mt-3 text-[11.5px] leading-relaxed text-[var(--muted)]">
            为避免默认密码风险，后台在未配置环境变量时保持关闭。请在服务器环境变量中设置以下两项后重启：
          </p>
          <pre className="mt-4 overflow-x-auto border border-[var(--line)] bg-[var(--surface-2)] p-3 font-mono text-[10px] leading-relaxed">
{`ADMIN_PASSWORD=your-strong-password
ADMIN_SESSION_SECRET=at-least-32-random-characters`}
          </pre>
          <p className="mt-3 text-[10px] leading-relaxed text-[var(--muted)]">
            可选：ADMIN_EDITOR_PASSWORD（内容编辑）、ADMIN_VIEWER_PASSWORD（只读）。角色权限在服务端判定。
            参见 <code className="font-mono">.env.example</code> 与 <code className="font-mono">DEPLOYMENT.md</code>。
          </p>
          <div className="mt-5 flex items-center gap-2">
            <KeyRound size={13} className="text-[var(--muted)]" />
            <Link href="/sources" className="text-[11px] underline">查看数据源与配置说明</Link>
          </div>
        </div>
      </div>
    );
  }

  const session = await getAdminSession();
  if (!session) return <AdminLogin />;

  const [store, species, news, sources, media, settings, sections, integration] = await Promise.all([
    readStore(),
    getAllSpecies(),
    getNews(),
    getSourceRegistry(),
    getMediaAssets(),
    getSiteSettings(),
    getHomeSections(),
    getIntegrationStatus(),
  ]);
  const syncLogs = store.sync_logs;

  return (
    <AdminApp
      role={session.role}
      counts={{
        species: species.length,
        news: news.length,
        pending: news.filter((n) => n.review_status === "pending_review").length,
        media: media.length,
        audio: integration.sound_count,
        sources: sources.length,
      }}
      species={species.map((s) => ({
        slug: s.slug,
        name_cn: s.name_cn,
        name_en: s.name_en,
        scientific_name: s.scientific_name,
        group: s.group,
        group_label: s.group_label,
        status: s.conservation.status,
        status_label: s.conservation.status_label,
        year: s.conservation.assessment_year,
        trend: s.conservation.trend,
        featured: s.featured,
        review_status: s.review_status,
        data_status: s.data_status,
        tagline: s.tagline,
        summary: s.summary,
        diet: s.diet,
        habitat: s.habitat,
        population_note: s.conservation.population_note,
        weight: [s.weight.min_kg, s.weight.max_kg],
        lifespan: [s.lifespan_years[0], s.lifespan_years[1]],
      }))}
      news={news.slice(0, 80).map((n) => ({
        id: n.id,
        slug: n.slug,
        title_cn: n.title_cn,
        title_original: n.title_original,
        source_name: n.source_name,
        published_at: n.published_at,
        category: n.category,
        review_status: n.review_status,
        featured: n.featured,
        summary_cn: n.summary_cn,
        original_url: n.original_url,
      }))}
      sources={sources.map((s) => ({
        id: s.id,
        name: s.name,
        homepage: s.homepage,
        access: s.access,
        configured: s.configured,
        live: s.live,
        status_note: s.status_note,
        license_note: s.license_note,
        env_vars: s.env_vars,
      }))}
      media={media.slice(0, 80).map((m) => ({
        id: m.id,
        title: m.title,
        author: m.author,
        license: m.license,
        commercial_use: m.commercial_use,
        download_allowed: m.download_allowed,
        source_name: m.source_name,
        source_url: m.source_url,
        review_status: m.review_status,
      }))}
      logs={syncLogs.map((l) => ({
        id: l.id,
        job: l.job,
        status: l.status,
        message: l.message,
        started_at: l.started_at,
        finished_at: l.finished_at,
        items: l.items,
        actor: l.actor,
      }))}
      settings={{
        hero_video_url: settings.hero_video_url,
        hero_poster: settings.hero_poster,
        hero_video_credit: settings.hero_video_credit,
        daily_species_slug: settings.daily_species_slug,
        announcement: settings.announcement,
      }}
      sections={sections.map((s) => ({
        id: s.id,
        label: s.label,
        description: s.description,
        default_visible: s.default_visible,
        order: s.order,
      }))}
      integration={{
        generated_at: integration.generated_at,
        photo_count: integration.photo_count,
        errors: integration.errors.length,
      }}
    />
  );
}