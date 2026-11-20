import type { Metadata } from "next";
import { WcHeader } from "@/components/wildchina/wc-header";
import { DataLab } from "@/components/explorer/data-lab";
import { CHINA_SPECIES } from "@/lib/wildchina/species";

export const metadata: Metadata = {
  title: "数据实验室",
  description: "以真实馆藏记录统计中国特有脊椎动物的类群、保护等级与省域分布。",
};

const GROUP_LABEL: Record<string, string> = {
  amphibian: "两栖纲",
  mammal: "哺乳纲",
  bird: "鸟纲",
  reptile: "爬行纲",
  fish: "硬骨鱼纲",
};

const STATUS_LABEL: Record<string, string> = {
  CR: "极危",
  EN: "濒危",
  VU: "易危",
  NT: "近危",
  LC: "无危",
  DD: "数据缺乏",
  NE: "未评估",
};

export default function DataLabPage() {
  const groupCounts = Object.entries(
    CHINA_SPECIES.reduce<Record<string, number>>((acc, s) => {
      acc[s.group] = (acc[s.group] ?? 0) + 1;
      return acc;
    }, {})
  )
    .map(([key, value]) => ({ label: GROUP_LABEL[key] ?? key, value }))
    .sort((a, b) => b.value - a.value);

  const statusCounts = Object.entries(
    CHINA_SPECIES.reduce<Record<string, number>>((acc, s) => {
      const status = s.conservation.status;
      acc[status] = (acc[status] ?? 0) + 1;
      return acc;
    }, {})
  )
    .map(([key, value]) => ({ label: STATUS_LABEL[key] ?? key, value }))
    .sort((a, b) => b.value - a.value);

  const provinceCounts = Object.entries(
    CHINA_SPECIES.reduce<Record<string, number>>((acc, s) => {
      for (const province of s.provinces ?? []) acc[province] = (acc[province] ?? 0) + 1;
      return acc;
    }, {})
  )
    .map(([key, value]) => ({ label: key, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 12);

  const withRecords = CHINA_SPECIES.filter((s) => (s.provinces ?? []).length > 0).length;
  const noRecords = CHINA_SPECIES.length - withRecords;

  return (
    <div className="wc-frame">
      <WcHeader />
      <div className="wc-page-head">
        <div>
          <p className="wc-kicker">数据实验室 · DATA LAB</p>
          <h1 className="display mt-2 text-[38px] sm:text-[50px]">数据背后</h1>
          <p className="wc-prose mt-3">
            这些数字来自真实收录，也暴露了收录的局限——比如还有物种没有保护等级评估。
          </p>
        </div>
        <p className="text-[11px] leading-relaxed text-[var(--muted)]">
          {CHINA_SPECIES.length} 种 · 有省级记录 {withRecords}
          <br />
          无省级记录 {noRecords}
        </p>
      </div>
      <DataLab
        groups={groupCounts}
        statuses={statusCounts}
        provinces={provinceCounts}
        withRecords={withRecords}
        withoutRecords={noRecords}
      />
      <p className="mt-6 text-[10.5px] leading-relaxed text-[var(--muted)]">
        统计口径：物种总数为当前收录；两栖类保护等级优先采用中国两栖类信息系统收录的 IUCN 评估，其余来自 iNaturalist 同步的 IUCN 字段，未评估（NE）不等于无危；省域计数为有该省记录的物种数，受采样强度影响，不能当作真实分布面积。
      </p>
    </div>
  );
}