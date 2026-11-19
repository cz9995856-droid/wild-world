"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Activity, Box, Bone, Globe2, Sparkles, Trophy } from "lucide-react";
import { AnatomyExplorer } from "@/components/lab/anatomy-explorer";
import { ChallengeCenter } from "@/components/quiz/challenge-center";
import { MentorChat } from "@/components/mentor/mentor-chat";
import type { ModelOption } from "@/lib/wildchina/model-map";
import { WorldMapLoader } from "@/components/map/world-map-loader";
import { DataBadge } from "@/components/ui/badges";

const Lab3D = dynamic(() => import("@/components/lab/lab-3d").then((m) => m.Lab3D), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[440px] items-center justify-center border border-[var(--line)] bg-[var(--surface-2)] text-[12px] text-[var(--muted)]">
      正在初始化 3D 渲染…
    </div>
  ),
});

const TABS = [
  { id: "three-d", label: "3D 探索", icon: Box, source: "原创模型" },
  { id: "anatomy", label: "身体结构", icon: Bone, source: "原创示意" },
  { id: "geo", label: "地理探索", icon: Globe2, source: "GBIF / iNat 实时" },
  { id: "quiz", label: "知识挑战", icon: Trophy, source: "馆方题库" },
  { id: "mentor", label: "AI 导师", icon: Sparkles, source: "馆藏问答" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function LabTabs({
  speciesCount,
  mapOptions,
  initialSlug,
  initialGroup,
  models,
}: {
  speciesCount: number;
  mapOptions: Array<{ slug: string; name_cn: string; name_en: string; scientific_name: string; gbif_taxon_key: number | null }>;
  initialSlug: string;
  initialGroup?: string;
  models?: ModelOption[];
}) {
  const [active, setActive] = useState<TabId>("three-d");

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (TABS.some((t) => t.id === hash)) setActive(hash as TabId);
  }, []);

  function select(id: TabId) {
    setActive(id);
    window.history.replaceState(null, "", `#${id}`);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <nav className="no-scrollbar flex gap-1 overflow-x-auto lg:flex-col" aria-label="实验室模块">
          {TABS.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = active === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => select(tab.id)}
                className={`flex min-w-[150px] items-start gap-3 border px-3 py-3 text-left transition-colors lg:min-w-0 lg:w-full ${
                  isActive
                    ? "border-[var(--forest)] bg-[var(--forest)] text-[#F5F1E7]"
                    : "border-[var(--line)] hover:border-[var(--line-strong)]"
                }`}
                aria-current={isActive ? "true" : undefined}
              >
                <Icon size={15} className={isActive ? "text-[#EDE8DC]" : "text-[var(--muted)]"} />
                <span>
                  <span className="block text-[11.5px]">{tab.label}</span>
                  <span className={`mt-0.5 block text-[8.5px] ${isActive ? "text-white/55" : "text-[var(--muted)]"}`}>
                    0{index + 1} · {tab.source}
                  </span>
                </span>
              </button>
            );
          })}
        </nav>

        <div className="mt-4 hidden border border-[var(--line)] bg-[var(--surface-2)] p-4 lg:block">
          <p className="flex items-center gap-1.5 text-[10px] text-[var(--muted)]">
            <Activity size={12} /> Data provenance
          </p>
          <p className="mt-2 text-[9.5px] leading-relaxed text-[var(--muted)]">
            原创教学模型（非扫描）与实时观测（外部接口）分开标注。页面会分别显示状态。
          </p>
          <p className="mt-2 text-[9px] text-[var(--muted)]">已覆盖 {speciesCount} 种动物</p>
          <DataBadge status="editorial" className="mt-2" />
        </div>
      </aside>

      <div className="min-w-0">
        <div className="mb-5">
          <p className="label text-[var(--muted)]">Module {String(TABS.findIndex((t) => t.id === active) + 1).padStart(2, "0")}</p>
          <h2 className="display mt-2 text-[30px] sm:text-[36px]">
            {TABS.find((t) => t.id === active)?.label}
          </h2>
        </div>

        {active === "three-d" && <Lab3D initialSlug={initialSlug} group={initialGroup} models={models} />}
        {active === "anatomy" && (
          <AnatomyExplorer
            initialSlug={initialSlug}
            group={initialGroup}
            options={models?.map((m) => ({ slug: m.slug, label: m.label, group: m.group, note: m.note }))}
          />
        )}
        {active === "geo" && (
          <div>
            <div className="mb-3 border border-[var(--line)] bg-[var(--surface-2)] p-4 text-[10.5px] leading-relaxed text-[var(--muted)]">
              选择一个物种，查看 GBIF 与 iNaturalist 的实时观测记录。地图的空白可能是未采样，不是“没有分布”。
            </div>
            <WorldMapLoader options={mapOptions} initialSlug={initialSlug} height="min-h-[560px]" />
          </div>
        )}
        {active === "quiz" && <ChallengeCenter />}
        {active === "mentor" && <MentorChat />}

        <div className="mt-8 border-t border-[var(--line)] pt-4 text-[9.5px] leading-relaxed text-[var(--muted)]">
          实验室使用的模型与示意为馆方原创，题库为编辑整理；外部观测记录逐条标注来源。
          发现错误？请在 <a href="/sources" className="underline">数据与许可</a> 页查看更正流程。
        </div>
      </div>
    </div>
  );
}