"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Flame, Target } from "lucide-react";
import type { ExplorerMission } from "@/lib/explorer/missions";

const KEY = "wildchina.missions.v1";

function computeStreak(done: Record<string, boolean>, today: string): number {
  let streak = 0;
  const base = new Date(`${today}T00:00:00+08:00`);
  for (let i = 0; i < 365; i += 1) {
    const day = new Date(base.getTime() - i * 86400000).toISOString().slice(0, 10);
    if (done[day]) streak += 1;
    else if (i > 0) break;
  }
  return streak;
}

export function MissionBoard({ missions, today }: { missions: ExplorerMission[]; today: string }) {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      setDone(JSON.parse(window.localStorage.getItem(KEY) ?? "{}") as Record<string, boolean>);
    } catch {
      setDone({});
    }
    setMounted(true);
  }, []);

  function complete(date: string) {
    const next = { ...done, [date]: true };
    setDone(next);
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }

  const streak = mounted ? computeStreak(done, today) : 0;
  const total = mounted ? Object.keys(done).length : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-px border border-[var(--line)] bg-[var(--line)] sm:grid-cols-3">
        <div className="bg-[var(--surface)] px-4 py-3">
          <p className="display text-[26px] leading-none">{streak}</p>
          <p className="mt-1 text-[9.5px] tracking-[0.16em] text-[var(--muted)]">连续天数</p>
        </div>
        <div className="bg-[var(--surface)] px-4 py-3">
          <p className="display text-[26px] leading-none">{total}</p>
          <p className="mt-1 text-[9.5px] tracking-[0.16em] text-[var(--muted)]">累计完成</p>
        </div>
        <div className="col-span-2 bg-[var(--surface)] px-4 py-3 sm:col-span-1">
          <p className="text-[10.5px] leading-relaxed text-[var(--muted)]">
            打卡记录保存在本机，清除浏览器数据会重置。
          </p>
        </div>
      </div>

      <div className="space-y-2.5">
        {missions.map((mission) => {
          const isToday = mission.date === today;
          const isDone = done[mission.date];
          return (
            <article
              key={mission.date}
              className={`border p-4 transition-colors ${
                isToday ? "border-[var(--forest)] bg-[var(--surface)]" : "border-[var(--line)] bg-[var(--surface)]"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-[9.5px] tracking-[0.18em] text-[var(--muted)]">
                    {isToday ? <Flame size={11} className="text-[var(--clay)]" /> : <Target size={11} />}
                    {mission.date}
                    {isToday ? " · 今天" : ""}
                  </p>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed">
                    在 <span className="text-[var(--forest)]">{mission.province}</span> 找到{" "}
                    <span className="text-[var(--forest)]">{mission.count}</span> 种{mission.groupLabel}，并说出它们的栖息环境。
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Link href={mission.href} className="btn-outline px-3 py-1.5 text-[10.5px]">
                    去完成 <ArrowRight size={12} />
                  </Link>
                  {isDone ? (
                    <span className="inline-flex items-center gap-1 border border-[var(--forest)] px-3 py-1.5 text-[10.5px] text-[var(--forest)]">
                      <Check size={12} /> 已完成
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => complete(mission.date)}
                      className="border border-[var(--line-strong)] px-3 py-1.5 text-[10.5px] transition-colors hover:border-[var(--forest)]"
                    >
                      打卡
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}