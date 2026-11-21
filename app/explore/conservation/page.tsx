import type { Metadata } from "next";
import { WcHeader } from "@/components/wildchina/wc-header";
import { NewsBrowser } from "@/components/news/news-browser";
import { getAllSpecies, getMediaAssets, getNews, getNewsMeta } from "@/lib/repository";
import { buildNewsVisuals } from "@/lib/news-visual";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "保护与发现",
  description: "中国动物新闻、新物种发现、科研成果与生态保护动态，只呈现可追溯的公开来源。",
};

export default async function ConservationPage() {
  const [articles, species, media, meta] = await Promise.all([getNews(), getAllSpecies(), getMediaAssets(), getNewsMeta()]);
  const visuals = buildNewsVisuals(media, species);

  return (
    <div className="wc-frame">
      <WcHeader />
      <div className="wc-page-head">
        <div>
          <p className="wc-kicker">保护与发现</p>
          <h1 className="display mt-2 text-[38px] sm:text-[50px]">保护与发现</h1>
          <p className="wc-prose mt-3">
            聚合中国动物新闻、新物种发现、科研成果与保护动态。标题、发布时间与来源均来自公开 RSS 快照；不虚构新闻，不把旧闻伪装成最新。
          </p>
        </div>
        <p className="text-[11px] leading-relaxed text-[var(--muted)]">
          当前 {articles.length} 条
          <br />
          最近同步 {meta.generated_at ? new Date(meta.generated_at).toLocaleString("zh-CN", { hour12: false }) : "待同步"}
          <br />
          快照超过 12 小时自动重新抓取 RSS
        </p>
      </div>
      <NewsBrowser articles={articles} visuals={visuals} generatedAt={meta.generated_at} />
      <p className="mt-6 text-[10.5px] leading-relaxed text-[var(--muted)]">
        新闻图片为馆藏授权影像的示意图，并非原文配图；原文版权归来源媒体所有。中国官方来源（国家林草局、中科院、新华社等）的 RSS/API 可用性正在逐项核验，未接通前不会伪造抓取状态。
      </p>
    </div>
  );
}