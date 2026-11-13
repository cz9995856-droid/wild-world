"use client";

import { useState } from "react";
import Link from "next/link";
import { Headphones, Radio } from "lucide-react";
import type { AudioEntry } from "@/lib/types";
import { WaveformPlayer } from "@/components/audio/waveform-player";
import { EmptyState } from "@/components/ui/states";

export function SoundLab({
  recordings,
  speciesBySlug,
}: {
  recordings: AudioEntry[];
  speciesBySlug: Record<string, string>;
}) {
  const [active, setActive] = useState(0);
  const current = recordings[active];

  return (
    <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
      <div className="border border-[var(--line)] bg-[var(--surface)]">
        <div className="flex items-center justify-between border-b border-[var(--line)] p-4">
          <div className="flex items-center gap-2 text-[11px]">
            <Headphones size={13} /> 录音目录
          </div>
          <span className="font-mono text-[9px] text-[var(--muted)]">{recordings.length} 条</span>
        </div>
        {recordings.length === 0 ? (
          <div className="p-4 text-[10.5px] leading-relaxed text-[var(--muted)]">
            尚未载入授权录音。可运行 <code className="font-mono">npm run fetch:sounds</code> 从 iNaturalist 抓取许可明确的素材。
          </div>
        ) : (
          <ul className="max-h-[420px] divide-y divide-[var(--line)] overflow-y-auto">
            {recordings.map((a, i) => (
              <li key={a.id}>
                <button
                  onClick={() => setActive(i)}
                  className={`w-full px-4 py-3 text-left transition-colors ${i === active ? "bg-[var(--surface-2)]" : "hover:bg-[var(--surface-2)]"}`}
                >
                  <p className="text-[11.5px]">{speciesBySlug[a.species_slug] ?? a.title}</p>
                  <p className="mt-1 text-[9px] text-[var(--muted)]">
                    {a.recordist} · {a.location}
                  </p>
                  <p className="mt-0.5 text-[9px] text-[var(--clay)]">{a.license}</p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        {current ? (
          <>
            <WaveformPlayer key={current.id} audio={current} />
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="border border-[var(--line)] bg-[var(--surface)] p-4">
                <p className="label text-[var(--muted)]">Recording metadata</p>
                <dl className="mt-2 space-y-1.5 text-[10.5px]">
                  <div className="flex justify-between gap-3"><dt className="text-[var(--muted)]">物种</dt><dd>{speciesBySlug[current.species_slug] ?? "—"}</dd></div>
                  <div className="flex justify-between gap-3"><dt className="text-[var(--muted)]">录音者</dt><dd>{current.recordist}</dd></div>
                  <div className="flex justify-between gap-3"><dt className="text-[var(--muted)]">地点</dt><dd className="text-right">{current.location}</dd></div>
                  <div className="flex justify-between gap-3"><dt className="text-[var(--muted)]">录制日期</dt><dd>{current.recorded_at || "未公开"}</dd></div>
                  <div className="flex justify-between gap-3"><dt className="text-[var(--muted)]">声音类型</dt><dd>{current.sound_type}</dd></div>
                  <div className="flex justify-between gap-3"><dt className="text-[var(--muted)]">许可</dt><dd>{current.license}</dd></div>
                </dl>
              </div>
              <div className="border border-[var(--line)] bg-[var(--surface-2)] p-4 text-[10px] leading-relaxed text-[var(--muted)]">
                <p className="text-[var(--ink-soft)]">声音来源状态</p>
                <p className="mt-2">
                  iNaturalist：已接入，逐条核验许可。Xeno-canto API v3 需要申请密钥；Macaulay Library 需要机构授权。
                  两者均未连接，不以模拟音代替。
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="chip"><Radio size={9} /> iNaturalist · 已接入</span>
                  <span className="chip"><Radio size={9} /> Xeno-canto · 待授权</span>
                  <span className="chip"><Radio size={9} /> Macaulay · 待授权</span>
                </div>
                <Link href="/sources" className="mt-3 inline-block underline">查看授权清单 →</Link>
              </div>
            </div>
          </>
        ) : (
          <EmptyState
            title="还没有可播放的授权录音"
            description="声音实验室只使用许可明确的录音。运行媒体抓取脚本或接入授权数据源后，这里会自动出现条目。"
          />
        )}
      </div>
    </div>
  );
}