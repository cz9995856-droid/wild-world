import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BrandMark } from "@/components/site-header";
import { FOOTER_GROUPS, SITE } from "@/lib/site-config";

export function SiteFooter() {
  return (
    <footer className="relative mt-24 overflow-hidden bg-[#0B2118] text-[#EDE8DC]">
      <div className="pointer-events-none absolute inset-0 opacity-[0.07]">
        <div className="absolute -right-24 top-0 h-[420px] w-[420px] rounded-full border border-[#EDE8DC]" />
        <div className="absolute -right-10 top-16 h-[300px] w-[300px] rounded-full border border-[#EDE8DC]" />
        <div className="absolute bottom-0 left-1/4 h-[1px] w-[40%] bg-[#EDE8DC]" />
      </div>
      <div className="container-museum relative py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <div className="flex items-center gap-3 text-[#E9E2D3]">
              <BrandMark light />
              <div>
                <p className="display text-[24px] tracking-[0.16em]">WILD WORLD</p>
                <p className="mt-1 text-[9px] uppercase tracking-[0.34em] text-[#A9BFA8]">
                  {SITE.taglineEn}
                </p>
              </div>
            </div>
            <p className="mt-6 max-w-md text-[13px] leading-relaxed text-[#C7CEC2]">
              {SITE.tagline}。以可追溯的来源、逐张核验的影像许可和可交互的科学叙事，呈现地球上的野生生命。
              我们宁可显示“未连接”，也不伪造一条数据。
            </p>
            <div className="mt-8 grid max-w-sm grid-cols-3 gap-4 border-t border-white/15 pt-5">
              <div>
                <p className="display text-[26px]">24</p>
                <p className="mt-1 text-[9px] uppercase tracking-[0.2em] text-[#A9BFA8]">馆藏物种</p>
              </div>
              <div>
                <p className="display text-[26px]">6</p>
                <p className="mt-1 text-[9px] uppercase tracking-[0.2em] text-[#A9BFA8]">实验室模块</p>
              </div>
              <div>
                <p className="display text-[26px]">2026</p>
                <p className="mt-1 text-[9px] uppercase tracking-[0.2em] text-[#A9BFA8]">建馆</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {FOOTER_GROUPS.map((group) => (
              <div key={group.title}>
                <p className="label mb-4 text-[#A9BFA8]">{group.title}</p>
                <ul className="space-y-2.5">
                  {group.links.map((link) => (
                    <li key={link.href + link.label}>
                      <Link href={link.href} className="text-[12.5px] text-[#D9DED2] hover:text-white">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/15 pt-6 text-[10.5px] text-[#A9BFA8] sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} WILD WORLD · 数字自然博物馆 · 内容仅用于教育与研究，不替代现场保护行动
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/sources" className="inline-flex items-center gap-1 hover:text-white">
              数据来源与许可 <ArrowUpRight size={11} />
            </Link>
            <Link href="/about#method" className="hover:text-white">数据方法</Link>
            <span className="hidden sm:inline">影像：iNaturalist 授权素材 · 逐张署名</span>
          </div>
        </div>
      </div>
    </footer>
  );
}