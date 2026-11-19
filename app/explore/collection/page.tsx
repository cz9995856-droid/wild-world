import type { Metadata } from "next";
import { WcHeader } from "@/components/wildchina/wc-header";
import { CollectionBoard, type CollectionItem } from "@/components/explorer/collection-board";
import { CHINA_SPECIES } from "@/lib/wildchina/species";
import { getSpeciesImage, thumbUrl } from "@/lib/wildchina/media";

export const metadata: Metadata = {
  title: "收集册",
  description: "记录你在探索中收藏的中国特有脊椎动物，查看各类群收集进度。",
};

const items: CollectionItem[] = CHINA_SPECIES.map((s, index) => ({
  slug: s.slug,
  nameCn: s.nameCn,
  groupLabel: s.groupLabel,
  group: s.group,
  thumb: thumbUrl(getSpeciesImage(s.slug, "hero")?.url),
  code: String(index + 1).padStart(3, "0"),
  conservationLabel: s.conservation.label,
  conservationStatus: s.conservation.status,
}));

export default function CollectionPage() {
  return (
    <div className="wc-frame">
      <WcHeader />
      <div className="wc-page-head">
        <div>
          <p className="hb-hand">野外手册 · 收集册</p>
          <h1 className="hb-display mt-2 text-[38px] sm:text-[50px]">我的收集</h1>
          <p className="wc-prose mt-3">
            收藏过的物种会进入收集册。收集不是竞赛，而是你与中国特有动物之间建立的联系记录。
          </p>
        </div>
        <p className="text-[11px] leading-relaxed text-[var(--muted)]">
          {items.length} 种可收集
          <br />
          收藏保存在本机
        </p>
      </div>
      <CollectionBoard items={items} />
    </div>
  );
}