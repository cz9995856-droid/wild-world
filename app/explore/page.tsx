import type { Metadata } from "next";
import { WcHeader } from "@/components/wildchina/wc-header";
import { FeatureGrid } from "@/components/wildchina/feature-grid";

export const metadata: Metadata = {
  title: "探索",
  description: "WildChina 四大入口：物种图鉴、生态地图、生命实验室、保护与发现。",
};

export default function ExplorePage() {
  return (
    <div className="wc-frame">
      <WcHeader />
      <FeatureGrid />
    </div>
  );
}