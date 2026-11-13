"use client";

import dynamic from "next/dynamic";

const WorldMap = dynamic(() => import("@/components/map/world-map").then((m) => m.WorldMap), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[420px] items-center justify-center border border-[var(--line)] bg-[var(--surface-2)] text-[12px] text-[var(--muted)]">
      正在加载地图引擎…
    </div>
  ),
});

export function WorldMapLoader(props: React.ComponentProps<typeof WorldMap>) {
  return <WorldMap {...props} />;
}