import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, ShieldCheck, TriangleAlert } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { getIntegrationStatus, getSourceRegistry, getMediaAssets, getAudioEntries } from "@/lib/repository";
import { PENDING_ITEMS } from "@/lib/sources/registry";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "数据来源与许可",
  description: "WILD WORLD 的数据源清单、接入状态、许可边界、待授权事项与更正流程。",
};

const ACCESS_LABEL: Record<string, string> = {
  no_key: "公开接口 / 无需密钥",
  api_key: "需要 API Key",
  oauth: "需要 OAuth",
  manual: "人工导入",
  permission: "需要机构授权",
};

export default async function SourcesPage() {
  const [sources, integration, media, audio] = await Promise.all([
    getSourceRegistry(),
    getIntegrationStatus(),
    getMediaAssets(),
    getAudioEntries(),
  ]);
  const configured = sources.filter((s) => s.configured);
  const commercial = media.filter((m) => m.commercial_use).length;

  return (
    <>
      <PageHeader
        kicker="Provenance · 数据与许可"
        title="我们用了什么，没用什么"
        description="这份清单区分已连接、待配置与待授权。没有密钥或授权时，界面显示真实状态；不会把未连接的数据源写成已接入。"
        breadcrumbs={[{ label: "数据与许可" }]}
        meta={
          <div className="flex flex-wrap gap-2 lg:justify-end">
            <span className="chip">{configured.length} / {sources.length} 个来源已配置</span>
            <span className="chip">{media.length} 张影像 · {audio.length} 条录音</span>
            <span className="chip">其中 {commercial} 张标记可商用</span>
          </div>
        }
      />

      <div className="container-museum pb-20 pt-8">
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="border border-[var(--line)] bg-[var(--surface)] p-5">
            <p className="label text-[var(--muted)]">Media integration</p>
            <p className="display mt-2 text-[34px]">{media.length}</p>
            <p className="text-[10px] text-[var(--muted)]">张本地化授权影像</p>
            <p className="mt-2 text-[9.5px] leading-relaxed text-[var(--muted)]">
              生成时间：{integration.generated_at ? formatDate(integration.generated_at) : "待生成"}。
              来源：{integration.provider}。
            </p>
          </div>
          <div className="border border-[var(--line)] bg-[var(--surface)] p-5">
            <p className="label text-[var(--muted)]">Audio</p>
            <p className="display mt-2 text-[34px]">{audio.length}</p>
            <p className="text-[10px] text-[var(--muted)]">条野外录音（iNaturalist）</p>
            <p className="mt-2 text-[9.5px] leading-relaxed text-[var(--muted)]">
              Xeno-canto API v3 与 Macaulay Library 尚未接入，需要密钥或机构授权。
            </p>
          </div>
          <div className="border border-[var(--line)] bg-[var(--surface)] p-5">
            <p className="label text-[var(--muted)]">Database</p>
            <p className="display mt-2 text-[34px]">{process.env.NEXT_PUBLIC_SUPABASE_URL ? "已配置" : "本地文件"}</p>
            <p className="mt-2 text-[9.5px] leading-relaxed text-[var(--muted)]">
              {process.env.NEXT_PUBLIC_SUPABASE_URL
                ? "Supabase 环境变量已设置，但需执行迁移与种子脚本后才能切换仓库。"
                : "未配置 Supabase：使用种子数据 + .data 文件仓库。迁移与种子 SQL 已提供，可随时切换。"}
            </p>
          </div>
        </div>

        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="label text-[var(--muted)]">Registry</p>
              <h2 className="display mt-2 text-[28px]">数据源清单</h2>
            </div>
            <span className="text-[10px] text-[var(--muted)]">最近检查：2026-11-13</span>
          </div>
          <div className="overflow-x-auto border border-[var(--line)]">
            <table className="w-full min-w-[900px] border-collapse text-left text-[11px]">
              <thead className="bg-[var(--surface-2)] text-[9px] uppercase tracking-widest text-[var(--muted)]">
                <tr>
                  <th className="p-3 font-normal">来源</th>
                  <th className="p-3 font-normal">用途</th>
                  <th className="p-3 font-normal">访问方式</th>
                  <th className="p-3 font-normal">状态</th>
                  <th className="p-3 font-normal">许可 / 商用限制</th>
                  <th className="p-3 font-normal">说明</th>
                </tr>
              </thead>
              <tbody>
                {sources.map((s) => (
                  <tr key={s.id} className="border-t border-[var(--line)] align-top">
                    <td className="p-3">
                      <a href={s.homepage} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium hover:underline">
                        {s.name} <ExternalLink size={9} />
                      </a>
                    </td>
                    <td className="p-3 text-[var(--muted)]">{s.purpose}</td>
                    <td className="p-3 text-[var(--muted)]">{ACCESS_LABEL[s.access] ?? s.access}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1.5 text-[10px]">
                        <span className={`h-1.5 w-1.5 rounded-full ${s.configured ? "bg-[#2A6B51]" : s.access === "permission" ? "bg-[var(--clay)]" : "bg-[var(--muted)]"}`} />
                        {s.configured ? "已配置" : "未配置"}
                        {s.live ? " · 实时" : ""}
                      </span>
                    </td>
                    <td className="p-3 text-[10px] leading-relaxed text-[var(--muted)]">
                      {s.license_note}
                      <br />
                      <span className="text-[var(--clay)]">{s.commercial_restriction}</span>
                    </td>
                    <td className="p-3 text-[10px] leading-relaxed text-[var(--muted)]">
                      {s.status_note}
                      {s.env_vars.length > 0 && (
                        <span className="mt-1 block font-mono text-[9px] opacity-70">{s.env_vars.join(", ")}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="pending" className="mt-12 scroll-mt-28">
          <div className="mb-4">
            <p className="label text-[var(--muted)]">Pending · 待授权 / 待配置</p>
            <h2 className="display mt-2 text-[28px]">需要你提供或确认的事项</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {PENDING_ITEMS.map((item, i) => (
              <div key={item.title} className="border border-[var(--line)] bg-[var(--surface)] p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[12.5px] font-medium">{item.title}</p>
                  <span className="font-mono text-[9px] text-[var(--muted)]">0{i + 1}</span>
                </div>
                <p className="mt-2 text-[10px] text-[var(--clay)]">需要：{item.need}</p>
                <p className="mt-1 text-[10px] leading-relaxed text-[var(--muted)]">影响：{item.impact}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="licenses" className="mt-12 scroll-mt-28">
          <div className="mb-4">
            <p className="label text-[var(--muted)]">License policy</p>
            <h2 className="display mt-2 text-[28px]">影像、声音与文本的许可规则</h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="border border-[var(--line)] p-5">
              <ShieldCheck size={16} className="text-[#2A6B51]" />
              <h3 className="mt-3 text-[12.5px] font-medium">逐条记录</h3>
              <p className="mt-2 text-[10px] leading-relaxed text-[var(--muted)]">
                每张图片、每条录音都保存 source_name、source_url、source_record_id、license、retrieved_at、verified 与 review_status。
                没有来源的素材不进入馆藏。
              </p>
            </div>
            <div className="border border-[var(--line)] p-5">
              <TriangleAlert size={16} className="text-[var(--amber)]" />
              <h3 className="mt-3 text-[12.5px] font-medium">不默认商用</h3>
              <p className="mt-2 text-[10px] leading-relaxed text-[var(--muted)]">
                CC BY-NC / CC BY-NC-SA 素材仅用于本站非商业展示，不提供直接下载。CC BY / CC BY-SA 需署名；
                CC0 允许更广泛使用。许可可能由作者变更，使用前请在来源页复核。
              </p>
            </div>
            <div className="border border-[var(--line)] p-5">
              <ShieldCheck size={16} className="text-[#2A6B51]" />
              <h3 className="mt-3 text-[12.5px] font-medium">文本与新闻</h3>
              <p className="mt-2 text-[10px] leading-relaxed text-[var(--muted)]">
                新闻仅使用 RSS 标题、摘要与链接，不转载全文与图片。馆藏物种描述为编辑整理，引用 Wikipedia / ADW 等公开来源，
                不整段复制受版权保护的文本。
              </p>
            </div>
          </div>
        </section>

        <section id="corrections" className="mt-12 scroll-mt-28 border border-[var(--line)] bg-[var(--surface-2)] p-5 sm:p-8">
          <p className="label text-[var(--muted)]">Corrections</p>
          <h2 className="display mt-2 text-[26px]">发现错误怎么办</h2>
          <p className="mt-3 max-w-3xl text-[11px] leading-relaxed text-[var(--muted)]">
            本馆将资料冲突视为需要保留的信息，而不是需要抹平的噪声。若你发现等级、分类或影像许可有误，
            请记录页面 URL、字段、你的来源与日期。管理员可在后台逐条修订审核状态；修订不会覆盖原始来源记录。
            当前没有公开的错误提交表单（未实现的功能不会用空按钮伪装）。
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/about#method" className="btn-outline">阅读数据方法</Link>
            <Link href="/admin" className="btn-outline">管理后台</Link>
            <span className="chip">审核状态：verified / editorial / pending_review</span>
          </div>
        </section>
      </div>
    </>
  );
}