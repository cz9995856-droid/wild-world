import type { Metadata } from "next";
import { WcHeader } from "@/components/wildchina/wc-header";
import { MissionBoard } from "@/components/explorer/mission-board";
import { buildMissions } from "@/lib/explorer/missions";
import { shanghaiDateKey } from "@/lib/wildchina/daily";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "探索任务",
  description: "按日期生成的中国特有脊椎动物探索任务，完成后打卡记录连续天数。",
};

export default function MissionsPage() {
  const today = shanghaiDateKey();
  const missions = buildMissions(today, 7);

  return (
    <div className="wc-frame">
      <WcHeader />
      <div className="wc-page-head">
        <div>
          <p className="wc-kicker">探索任务 · FIELD WORK</p>
          <h1 className="display mt-2 text-[38px] sm:text-[50px]">今日任务</h1>
          <p className="wc-prose mt-3">
            每天一个基于真实省级记录的任务。完成不是目的——目的是让你知道这些动物具体住在哪里、需要什么环境。
          </p>
        </div>
        <p className="text-[11px] leading-relaxed text-[var(--muted)]">
          未来 7 天任务已生成
          <br />
          打卡记录保存在本机
        </p>
      </div>
      <MissionBoard missions={missions} today={today} />
      <p className="mt-6 text-[10.5px] leading-relaxed text-[var(--muted)]">
        任务条件（省份、类群、数量）来自馆藏真实的省级记录筛选，不是随机虚构。省级记录本身存在采样偏差，请结合物种档案中的分布说明理解。
      </p>
    </div>
  );
}