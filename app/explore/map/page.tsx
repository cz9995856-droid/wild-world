import type { Metadata } from "next";
import { WcHeader } from "@/components/wildchina/wc-header";
import { ChinaMap } from "@/components/wildchina/china-map";

export const metadata: Metadata = {
  title: "生态地图",
  description: "以省域为索引查看中国特有脊椎动物的分布记录、栖息环境与保护区域。",
};

export default function ChinaMapPage() {
  return (
    <div className="wc-frame">
      <WcHeader />
      <div className="wc-page-head">
        <div>
          <p className="wc-kicker">Ecological Atlas</p>
          <h1 className="display mt-2 text-[38px] sm:text-[50px]">生态地图</h1>
          <p className="wc-prose mt-3">
            用省级记录索引中国特有脊椎动物的分布。行政区划只是检索入口，不能等同于真实栖息地；地图不会用推测数据填满空白区域。
          </p>
        </div>
        <p className="text-[11px] leading-relaxed text-[var(--muted)]">
          当前可用图层：动物分布 · 生态环境 · 自然保护区 · 重点保护区域
          <br />
          生态与保护图层为编辑整理示意点位，非官方边界
        </p>
      </div>
      <ChinaMap />
      <p className="mt-6 text-[10.5px] leading-relaxed text-[var(--muted)]">
        省级记录来自本馆编辑整理的中国特有脊椎动物档案，不等同于完整分布范围。生态区与保护地图层为示意点位，用于理解地理格局，不作行政或法律依据；省界底图为公开 GeoJSON 数据，仅用于索引展示。
      </p>
    </div>
  );
}