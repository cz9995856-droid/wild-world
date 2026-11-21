import type { Metadata } from "next";
import { WcHeader } from "@/components/wildchina/wc-header";
import { FUN_FACTS } from "@/lib/data/fun-facts";
import { ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "动物冷知识",
  description: "更多中国特有动物的趣味冷知识，每条都可跳转到相关知识网站继续探索。",
};

export default function FunFactsPage() {
  return (
    <div className="wc-frame">
      <WcHeader />
      <div className="wc-page-head">
        <div>
          <p className="wc-kicker">Fun Facts</p>
          <h1 className="display mt-2 text-[38px] sm:text-[50px]">动物冷知识</h1>
          <p className="wc-prose mt-3">
            共 {FUN_FACTS.length} 条冷知识。点击任意一条，跳转到相关知识网站（iNaturalist）继续探索该物种的真实影像与资料。
          </p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {FUN_FACTS.map((fact, index) => (
          <a
            key={`${fact.speciesSlug}-${index}`}
            href={fact.url}
            target="_blank"
            rel="noreferrer"
            className="hb-card hb-card-lift group block p-4"
          >
            <p className="text-[13px] font-medium leading-relaxed text-[var(--ink-soft)] group-hover:text-[var(--ink)]">
              {fact.text}
            </p>
            <p className="mt-3 flex items-center justify-between text-[10px] font-bold">
              <span>{fact.source}</span>
              <ExternalLink size={12} className="text-[var(--muted)]" />
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}