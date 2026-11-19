"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Target } from "lucide-react";

export function MissionCard({
  dateKey,
  province,
  group,
  groupLabel,
  count,
  href,
}: {
  dateKey: string;
  province: string;
  group: string;
  groupLabel: string;
  count: number;
  href: string;
}) {
  const storageKey = `wildchina.mission.${dateKey}`;
  const [done, setDone] = useState(false);

  useEffect(() => {
    try {
      setDone(window.localStorage.getItem(storageKey) === "done");
    } catch {
      // ignore
    }
  }, [storageKey]);

  function markDone() {
    try {
      window.localStorage.setItem(storageKey, "done");
    } catch {
      // ignore
    }
    setDone(true);
  }

  return (
    <section className="border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-[10px] tracking-[0.22em] text-[var(--clay)]">
            <Target size={13} /> 今日探索任务
          </p>
          <p className="mt-2 text-[15px] leading-relaxed text-[var(--ink)]">
            在 <span className="font-medium text-[var(--forest)]">{province}</span> 找到{" "}
            <span className="font-medium text-[var(--forest)]">{count}</span> 种{groupLabel}，并说出它们各自的栖息环境。
          </p>
          <p className="mt-1.5 text-[10.5px] text-[var(--muted)]">
            任务基于馆藏真实省级记录生成，完成后可打卡记录连续天数。
          </p>
        </div>
        {done ? (
          <span className="inline-flex items-center gap-1.5 border border-[var(--forest)] px-3 py-2 text-[11px] text-[var(--forest)]">
            <Check size={13} /> 今日已完成
          </span>
        ) : (
          <button
            type="button"
            onClick={markDone}
            className="btn-outline shrink-0 px-4 py-2 text-[11px]"
          >
            完成打卡
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Link href={href} className="btn-primary px-5 py-2.5 text-[12px]">
          开始任务 <ArrowRight size={14} />
        </Link>
        <span className="text-[10px] text-[var(--muted)]">
          进入图鉴后可用「分布地区」筛选{province}、用类群筛选{groupLabel}
        </span>
      </div>
    </section>
  );
}