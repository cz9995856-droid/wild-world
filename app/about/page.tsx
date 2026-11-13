import type { Metadata } from "next";
import Link from "next/link";
import { Database, FlaskConical, Image as ImageIcon, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { DataBadge } from "@/components/ui/badges";

export const metadata: Metadata = {
  title: "博物馆理念与数据方法",
  description: "WILD WORLD 的建馆原则、数据来源层级、审核状态、冲突处理、AI 边界与项目交付状态。",
};

const STATUS_GROUPS = [
  {
    title: "已实现并可用",
    tone: "border-[#2A6B51]/40 bg-[#2A6B51]/5",
    items: [
      "24 件物种档案：搜索、分类筛选、详情、收藏、对比、随机探索",
      "首页 14 个可自定义区域（显示 / 隐藏 / 排序）",
      "新闻中心：4 个真实 RSS 源快照、编辑翻译、审核状态与详情页",
      "全球地图：GBIF 与 iNaturalist 实时观测点，图层与区域筛选",
      "摄影馆：72 张本地授权影像，逐张作者 / 许可 / 下载权限",
      "纪录片：8 个官方观看入口，明确不内嵌未授权片源",
      "互动实验室：3D 原创模型、解剖、声音波形 / 频谱、地理、12 题测验、喂养模拟",
      "AI 问答：本地知识库检索模式；配置密钥后可接入 LLM",
      "后台：登录、物种编辑、新闻审核、来源记录、同步任务、设置、导出",
    ],
  },
  {
    title: "已测试",
    tone: "border-[#2A6B51]/40 bg-[#2A6B51]/5",
    items: [
      "TypeScript 类型检查、ESLint 与生产构建（npm run build）",
      "单元测试：搜索、排名、日期与数据完整性",
      "端到端测试：首页、百科、搜索、新闻、收藏、实验室、移动端布局",
      "真实接口连通性：GBIF / iNaturalist / RSS / MapLibre demo",
    ],
  },
  {
    title: "待配置（需要运行环境）",
    tone: "border-[#C29B4A]/40 bg-[#C29B4A]/5",
    items: [
      "Supabase：执行迁移与种子后切换持久化仓库（当前为本地 JSON 文件）",
      "AI_API_KEY：接入 OpenAI 兼容接口后启用模型回答",
      "ADMIN_PASSWORD / ADMIN_SESSION_SECRET：启用后台登录",
      "首页授权视频：当前首屏为授权图片序列，视频能力已实现",
    ],
  },
  {
    title: "待授权（需要你提供）",
    tone: "border-[#A96246]/40 bg-[#A96246]/5",
    items: [
      "IUCN Red List API：保护等级与分布范围自动同步",
      "Xeno-canto API v3 / Macaulay Library：扩充鸟类声音",
      "Smithsonian Open Access：高清藏品影像与 3D 扫描",
      "BBC / National Geographic / Smithsonian 影片嵌入授权",
      "商业使用素材的逐条许可确认",
    ],
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        kicker="About · 博物馆理念"
        title="不虚构一只动物，也不虚构一条数据"
        description="WILD WORLD 是一座数字动物自然博物馆。我们的工作不是把动物变成内容素材，而是让公众看见真实的数据来源、清晰的许可边界与仍未被解决的问题。"
        breadcrumbs={[{ label: "关于" }]}
        meta={
          <div className="flex flex-wrap gap-2 lg:justify-end">
            <span className="chip">建馆 2026</span>
            <span className="chip">中文优先 · 中英切换</span>
            <span className="chip">教育与研究用途</span>
          </div>
        }
      />

      <div className="container-museum pb-20 pt-10">
        <section className="grid gap-8 border-b border-[var(--line)] pb-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h2 className="display text-[32px] leading-tight sm:text-[40px]">
              博物馆不是“看起来像真的”，
              <br />
              而是“可以被追溯”。
            </h2>
            <div className="mt-6 space-y-4 text-[12.5px] leading-relaxed text-[var(--muted)]">
              <p>
                我们把每一条内容拆成可核查的部分：物种记录有学名与分类路径，保护等级有评估年份与来源，
                图片有作者与许可，新闻有原始发布日期与链接，观测点有原始数据库记录。
              </p>
              <p>
                当外部接口不可用时，页面显示失败状态；当许可不明确时，不提供下载；当资料冲突时，保留出处并标记待审核。
                这些选择会让网站“少一些内容”，但不会让它变成一份无法验证的漂亮演示。
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Database, title: "来源可追溯", text: "每条记录保留 source_name / url / record_id / license / retrieved_at" },
              { icon: ImageIcon, title: "许可逐张核验", text: "NC 素材不商用、不直链下载；CC BY 需署名" },
              { icon: ShieldCheck, title: "状态可见", text: "已核验 / 编辑整理 / 待审核 / 示例 四级标记" },
              { icon: FlaskConical, title: "模拟有边界", text: "喂养与 3D 模型明确标注为教学模拟或原创模型" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="border border-[var(--line)] bg-[var(--surface)] p-4">
                  <Icon size={16} className="text-[var(--forest)]" />
                  <p className="mt-3 text-[11.5px] font-medium">{item.title}</p>
                  <p className="mt-1.5 text-[9.5px] leading-relaxed text-[var(--muted)]">{item.text}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section id="method" className="scroll-mt-28 border-b border-[var(--line)] py-12">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="label text-[var(--muted)]">Method · 数据方法</p>
              <h2 className="display mt-2 text-[30px]">我们如何判断一条资料能不能用</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <DataBadge status="verified" />
              <DataBadge status="editorial" />
              <DataBadge status="pending_review" />
              <DataBadge status="sample" />
            </div>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {[
              {
                n: "01",
                t: "来源层级",
                d: "分类与观测优先使用 GBIF / Catalogue of Life；形态与行为参考 ADW 与博物馆资料；保护等级以 IUCN 为准；Wikipedia 仅作辅助核对。新闻只使用允许的 RSS。",
              },
              {
                n: "02",
                t: "审核状态",
                d: "「已核验」= 编辑对照来源逐条核对；「编辑整理」= 依据公开来源整理但未逐条复核；「待审核」= 进入队列但尚未对外确认；「示例」= 明确标注的演示内容。",
              },
              {
                n: "03",
                t: "冲突与不确定",
                d: "不同来源给出的体长、寿命、等级若不一致，保留各自出处并标记待审核，不取平均、不选“最好看”的数字。缺失值显示为“资料待补充”。",
              },
              {
                n: "04",
                t: "地理边界",
                d: "观测点 ≠ 分布范围。地图只绘制带坐标的真实记录，并明确说明采样偏差。IUCN 分布面未接入时，绝不用观测点外推。",
              },
              {
                n: "05",
                t: "AI 边界",
                d: "先检索馆藏，再组织回答；未知时明确说明。保护等级、种群数量与新闻日期不从模型记忆中生成。模型调用失败时回退本地检索，不重试伪造。",
              },
              {
                n: "06",
                t: "许可边界",
                d: "每张图片与每条录音保存许可。NC 素材仅非商业展示；ND 素材不提供演绎；下载入口只在许可允许时出现。未取得授权的影片只外链官方页面。",
              },
            ].map((item) => (
              <div key={item.n} className="border border-[var(--line)] bg-[var(--surface)] p-5">
                <span className="font-mono text-[10px] tracking-widest text-[var(--muted)]">{item.n}</span>
                <h3 className="mt-3 text-[13px] font-medium">{item.t}</h3>
                <p className="mt-2 text-[10.5px] leading-relaxed text-[var(--muted)]">{item.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-b border-[var(--line)] py-12">
          <p className="label text-[var(--muted)]">Delivery status · 交付状态</p>
          <h2 className="display mt-2 text-[30px]">哪些能用，哪些还需要你</h2>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {STATUS_GROUPS.map((group) => (
              <div key={group.title} className={`border p-5 ${group.tone}`}>
                <h3 className="text-[12.5px] font-medium">{group.title}</h3>
                <ul className="mt-3 space-y-2 text-[10.5px] leading-relaxed text-[var(--muted)]">
                  {group.items.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-current" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[10px] leading-relaxed text-[var(--muted)]">
            完整的环境变量、迁移与部署步骤见项目 README 与 DEPLOYMENT.md；来源与待授权清单见
            <Link href="/sources" className="mx-1 underline">数据与许可</Link>。
          </p>
        </section>

        <section className="py-12">
          <p className="label text-[var(--muted)]">Architecture · 技术架构</p>
          <h2 className="display mt-2 text-[30px]">为“可替换”而设计</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Next.js App Router", "React 19 · TypeScript · 服务端组件"],
              ["Tailwind CSS", "森林绿 / 米白设计系统 · 深色模式"],
              ["Supabase / PostgreSQL", "迁移与种子 SQL 已提供 · 本地文件回退"],
              ["MapLibre · R3F", "真实观测地图 · 程序化 3D 模型"],
            ].map(([title, desc]) => (
              <div key={title} className="border border-[var(--line)] p-4">
                <p className="text-[12px] font-medium">{title}</p>
                <p className="mt-1.5 text-[10px] leading-relaxed text-[var(--muted)]">{desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 max-w-3xl text-[10.5px] leading-relaxed text-[var(--muted)]">
            所有外部服务均通过适配层访问：GBIF、iNaturalist、RSS、IUCN、Xeno-canto、Smithsonian、AI。
            替换数据源不需要重写页面；没有密钥时适配层返回明确的未配置状态，而不是空数据或假数据。
          </p>
        </section>
      </div>
    </>
  );
}