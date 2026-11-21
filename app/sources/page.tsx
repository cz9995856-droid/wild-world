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

        <section id="endemic-provenance" className="mt-12 scroll-mt-28">
          <div className="mb-4">
            <p className="label text-[var(--muted)]">Endemic species · 2026-11-19</p>
            <h2 className="display mt-2 text-[28px]">中国特有脊椎动物专题的新增来源</h2>
            <p className="mt-2 max-w-3xl text-[11px] leading-relaxed text-[var(--muted)]">
              物种卡牌中的形态、生境、习性与保护等级来自下列来源，逐条保留了抓取日期与原文引用。抓取只保存文字与可再使用的图片，不转载来源站点的排版与图库。
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="border border-[var(--line)] bg-[var(--surface)] p-5">
              <p className="text-[12.5px] font-medium">中国两栖类信息系统（AmphibiaChina）</p>
              <p className="mt-2 text-[10px] leading-relaxed text-[var(--muted)]">
                中国科学院昆明动物研究所。用于两栖类的形态特征、生境、习性、繁殖、地理分布与 IUCN 等级。295 种完成匹配，字段级来源见各物种页「数据说明」。
              </p>
              <p className="mt-2 text-[9.5px] leading-relaxed text-[var(--muted)]">
                引用：AmphibiaChina. 2026. The database of Chinese amphibians. http://www.amphibiachina.org/
              </p>
              <a href="http://www.amphibiachina.org/" target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-[10px] underline">
                访问来源 <ExternalLink size={10} />
              </a>
            </div>
            <div className="border border-[var(--line)] bg-[var(--surface)] p-5">
              <p className="text-[12.5px] font-medium">iNaturalist 开放数据（经 GBIF 镜像）</p>
              <p className="mt-2 text-[10px] leading-relaxed text-[var(--muted)]">
                两栖类补充照片。仅采用授权明确的作品，作者与原始页面随图标注；CC BY-NC 与 CC BY-NC-SA 作品仅用于本站非商业科普展示。
              </p>
              <p className="mt-2 text-[9.5px] leading-relaxed text-[var(--muted)]">
                图片已本地化，避免第三方 CDN 失效；许可与作者信息保留在媒体记录中。
              </p>
              <a href="https://www.inaturalist.org/" target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-[10px] underline">
                访问来源 <ExternalLink size={10} />
              </a>
            </div>
            <div className="border border-[var(--line)] bg-[var(--surface)] p-5">
              <p className="text-[12.5px] font-medium">本站自绘 2D 示意图</p>
              <p className="mt-2 text-[10px] leading-relaxed text-[var(--muted)]">
                对尚无可用授权照片的物种，使用统一风格的矢量示意图，明确标注「示意图 · 非实拍」，不冒充真实个体影像。
              </p>
              <p className="mt-2 text-[9.5px] leading-relaxed text-[var(--muted)]">
                许可：CC BY 4.0，署名 WildChina 编辑部；示意图不用于物种鉴定。
              </p>
            </div>
          </div>
          <div className="mt-4 border border-[var(--line)] bg-[var(--surface)] p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-[12.5px] font-medium">Tropicals.cn · 名称与分类校对</p>
              <span className="text-[9.5px] text-[var(--muted)]">CC BY 4.0 · 2026-11-19</span>
            </div>
            <p className="mt-2 max-w-4xl text-[10px] leading-relaxed text-[var(--muted)]">
              用于核对 312 种脊椎动物的中文名、英文名、别名与分类，并为每个物种保存 GBIF / Catalogue of Life / Wikidata 外部 ID。
              本站只保存名称、分类与外部 ID 这些 CC BY 4.0 字段；产地、百科正文与性状字段未写入本站数据集。
              署名：Tropicals.cn（CC BY 4.0）。
            </p>
            <a href="https://tropicals.cn/" target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-[10px] underline">
              访问来源 <ExternalLink size={10} />
            </a>
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
                新闻仅使用来源标题、摘要与链接，不转载全文与图片。馆藏物种描述为编辑整理，引用 Wikipedia / ADW 等公开来源，
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