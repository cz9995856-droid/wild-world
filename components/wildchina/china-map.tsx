"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl, { type Map as MlMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Loader2 } from "lucide-react";
import mapLayerData from "@/public/data/map-layers.json";
import { cn } from "@/lib/utils";

type GeoFeature = {
  type: "Feature";
  properties: { name?: string; adcode?: number; [key: string]: unknown };
  geometry: unknown;
};

type ProvinceCollection = { type: "FeatureCollection"; features: GeoFeature[] };

type OverlayPoint = { name: string; lat: number; lng: number; radius?: number; note?: string; province?: string };

const LAYERS = [
  { id: "species", label: "动物分布", ready: true, note: "省级记录索引" },
  { id: "habitat", label: "生态环境", ready: true, note: "生态区示意" },
  { id: "reserve", label: "自然保护区", ready: true, note: "国家级保护区示意点位" },
  { id: "priority", label: "重点保护区域", ready: true, note: "生物多样性优先区示意点位" },
] as const;

const OVERLAYS: Record<string, OverlayPoint[]> = {
  habitat: (mapLayerData.ecoregions ?? []) as OverlayPoint[],
  reserve: (mapLayerData.reserves ?? []) as OverlayPoint[],
  priority: (mapLayerData.priorities ?? []) as OverlayPoint[],
};

function normalizeProvince(name: string) {
  return name
    .replace(/(省|市|自治区|特别行政区|壮族|回族|维吾尔|自治州)$/g, "")
    .replace(/内蒙古.*/, "内蒙古")
    .replace(/广西.*/, "广西")
    .replace(/宁夏.*/, "宁夏")
    .replace(/新疆.*/, "新疆")
    .replace(/西藏.*/, "西藏")
    .trim();
}

export interface LiteSpecies {
  slug: string;
  cn: string;
  groupLabel: string;
  status: string;
  provinces: string[];
}

export function ChinaMap({ height = "min-h-[62svh]" }: { height?: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MlMap | null>(null);
  const [mapSpecies, setMapSpecies] = useState<LiteSpecies[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/data/species-lite.json")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setMapSpecies(data.items ?? []);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);
  const [error, setError] = useState(false);
  const [layer, setLayer] = useState<(typeof LAYERS)[number]["id"]>("species");
  const [selected, setSelected] = useState<string | null>(null);
  const [collection, setCollection] = useState<ProvinceCollection | null>(null);
  const [overlayName, setOverlayName] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/data/china-provinces.json")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<ProvinceCollection>;
      })
      .then((json) => {
        if (cancelled) return;
        const features = json.features.map((feature) => {
          const name = String(feature.properties?.name ?? "");
          const count = mapSpecies.filter(
            (species) => species.provinces.some((p) => normalizeProvince(p) === normalizeProvince(name))
          ).length;
          return { ...feature, properties: { ...feature.properties, count } };
        });
        setCollection({ ...json, features });
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [mapSpecies]);

  useEffect(() => {
    if (!containerRef.current || !collection || mapRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          provinces: { type: "geojson", data: collection as unknown as GeoJSON.FeatureCollection },
          overlay: { type: "geojson", data: { type: "FeatureCollection", features: [] } as unknown as GeoJSON.FeatureCollection },
        },
        layers: [
          { id: "background", type: "background", paint: { "background-color": "#ede6d8" } },
          {
            id: "province-fill",
            type: "fill",
            source: "provinces",
            paint: {
              "fill-color": [
                "interpolate",
                ["linear"],
                ["get", "count"],
                0,
                "#efe8da",
                1,
                "#b9c7b2",
                3,
                "#6f9478",
                6,
                "#2f5c43",
              ],
              "fill-opacity": 0.92,
            },
          },
          {
            id: "province-line",
            type: "line",
            source: "provinces",
            paint: { "line-color": "#163a2b", "line-width": 0.7, "line-opacity": 0.45 },
          },
          {
            id: "overlay-fill",
            type: "circle",
            source: "overlay",
            paint: {
              "circle-radius": ["case", ["==", ["get", "kind"], "habitat"], 34, 6.5],
              "circle-color": [
                "match",
                ["get", "kind"],
                "habitat",
                "#6f9478",
                "reserve",
                "#2f5c43",
                "priority",
                "#C29B4A",
                "#2f5c43",
              ],
              "circle-opacity": ["case", ["==", ["get", "kind"], "habitat"], 0.28, 0.85],
              "circle-stroke-color": "#163a2b",
              "circle-stroke-width": 0.9,
            },
          },
        ],
      },
      center: [104, 35.5],
      zoom: 3.2,
      minZoom: 2.8,
      maxZoom: 8,
      maxBounds: [
        [70, 14],
        [140, 56],
      ],
      renderWorldCopies: false,
      attributionControl: false,
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.addControl(new maplibregl.ScaleControl({ maxWidth: 90, unit: "metric" }), "bottom-left");

    map.on("load", () => {
      setReady(true);
      map.resize();
    });
    map.on("click", "province-fill", (event) => {
      const name = event.features?.[0]?.properties?.name;
      if (typeof name === "string") setSelected(name);
    });
    map.on("click", "overlay-fill", (event) => {
      const name = event.features?.[0]?.properties?.name;
      if (typeof name === "string") setOverlayName(name);
    });
    map.on("mousemove", "overlay-fill", () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mousemove", "province-fill", () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", "province-fill", () => {
      map.getCanvas().style.cursor = "";
    });
    map.on("error", () => setError(true));

    const observer = new ResizeObserver(() => map.resize());
    observer.observe(containerRef.current);
    mapRef.current = map;

    return () => {
      observer.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, [collection]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const points = OVERLAYS[layer] ?? [];
    const data = {
      type: "FeatureCollection",
      features: points.map((point) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [point.lng, point.lat] },
        properties: { ...point, kind: layer },
      })),
    };
    const source = map.getSource("overlay") as maplibregl.GeoJSONSource | undefined;
    source?.setData(data as unknown as GeoJSON.FeatureCollection);
    setOverlayName(null);
  }, [layer, ready]);

  const selectedSpecies = useMemo(
    () =>
      selected
        ? mapSpecies.filter((species) => species.provinces.some((p) => normalizeProvince(p) === normalizeProvince(selected)))
        : [],
    [selected, mapSpecies]
  );
  const activeLayer = LAYERS.find((item) => item.id === layer);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px] lg:items-start">
      <div className={cn("relative overflow-hidden border border-[var(--line)] bg-[var(--surface-2)] lg:h-[68svh] lg:min-h-[460px]", height)}>
        <div className="absolute inset-0">
          <div ref={containerRef} className="h-full w-full" />
        </div>

        {!ready && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--surface-2)] text-[12px] text-[var(--muted)]">
            <Loader2 size={16} className="mr-2 animate-spin" /> 正在加载中国省界数据…
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[var(--surface-2)] p-6 text-center">
            <p className="text-[13px]">地图数据加载失败</p>
            <p className="text-[11px] text-[var(--muted)]">省界数据为本地文件，不会用虚构分布替代。</p>
          </div>
        )}

        <p className="pointer-events-none absolute bottom-1 right-3 z-10 text-[9px] text-[var(--muted)]">
          省界：阿里云 DataV GeoJSON · 公开数据；仅作索引，不代表物种真实分布范围
        </p>
      </div>

      <aside className="space-y-3 lg:max-h-[68svh] lg:overflow-y-auto lg:pr-1">
        {overlayName ? (
          <div className="border border-[var(--forest)] bg-[var(--surface)] p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="wc-field-label text-[var(--forest)]">选中点位</p>
              <button
                type="button"
                onClick={() => setOverlayName(null)}
                className="text-[10px] text-[var(--muted)] hover:text-[var(--ink)]"
                aria-label="关闭点位信息"
              >
                关闭
              </button>
            </div>
            <p className="mt-1 text-[14px]">{overlayName}</p>
            <p className="mt-2 text-[11px] leading-relaxed text-[var(--ink-soft)]">
              {OVERLAYS[layer]?.find((p) => p.name === overlayName)?.note ?? "示意点位，用于理解该区域的生态与保护意义。"}
            </p>
            <p className="mt-2 text-[9.5px] text-[var(--muted)]">点位为编辑整理示意，非官方边界。</p>
          </div>
        ) : null}
        <div className="border border-[var(--line)] bg-[var(--surface)] p-4">
          <p className="wc-field-label">图层切换</p>
          <div className="mt-3 space-y-1.5">
            {LAYERS.map((item) => (
              <button
                key={item.id}
                type="button"
                disabled={!item.ready}
                onClick={() => setLayer(item.id)}
                className={cn(
                  "flex w-full items-center justify-between border px-2.5 py-2 text-[11.5px] transition-colors",
                  item.ready
                    ? layer === item.id
                      ? "border-[var(--forest)] bg-[var(--forest)] text-[#f3ede1]"
                      : "border-[var(--line)] hover:border-[var(--forest)]"
                    : "cursor-not-allowed border-dashed border-[var(--line)] text-[var(--muted)] opacity-70"
                )}
              >
                <span>{item.label}</span>
                <span className="text-[9px]">{item.ready ? "可用" : "待接入"}</span>
              </button>
            ))}
          </div>
          {activeLayer && (
            <p className="mt-3 text-[10px] leading-relaxed text-[var(--muted)]">
              {activeLayer.ready
                ? `「${activeLayer.label}」：${activeLayer.note}。点位为编辑整理示意，非官方边界。`
                : `「${activeLayer.label}」图层尚未接入可核验数据。`}
            </p>
          )}
          {OVERLAYS[layer]?.length ? (
            <div className="mt-3 max-h-[220px] overflow-y-auto border-t border-[var(--line)] pt-2">
              {OVERLAYS[layer].map((point) => (
                <button
                  key={point.name}
                  type="button"
                  onClick={() => setOverlayName(point.name)}
                  className={cn(
                    "block w-full border-b border-[var(--line)] px-1 py-1.5 text-left text-[10.5px] transition-colors last:border-0",
                    overlayName === point.name ? "text-[var(--forest)]" : "text-[var(--ink-soft)] hover:text-[var(--forest)]"
                  )}
                >
                  {point.name}
                  {point.province ? <span className="ml-1 text-[9px] text-[var(--muted)]">{point.province}</span> : null}
                </button>
              ))}
            </div>
          ) : null}
          {overlayName ? (
            <p className="mt-2 text-[10px] leading-relaxed text-[var(--muted)]">
              {OVERLAYS[layer]?.find((p) => p.name === overlayName)?.note ?? "示意点位，用于理解该区域的生态与保护意义。"}
            </p>
          ) : null}
        </div>

        <div className="border border-[var(--line)] bg-[var(--surface)] p-4">
          <p className="wc-field-label">{selected ? `${selected} · ${selectedSpecies.length} 条记录` : "点击省份"}</p>
          {selected ? (
            selectedSpecies.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {selectedSpecies.map((species) => (
                  <li key={species.slug}>
                    <a href={`/explore/encyclopedia/${species.slug}`} className="flex items-baseline justify-between gap-2 border-b border-[var(--line)] pb-2 text-[12px] hover:text-[var(--forest)]">
                      <span>
                        {species.cn}
                        <span className="ml-1.5 text-[9px] text-[var(--muted)]">{species.groupLabel}</span>
                      </span>
                      <span className="text-[9.5px] text-[var(--muted)]">{species.status}</span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-[11px] leading-relaxed text-[var(--muted)]">
                该省暂无可核验的中国特有脊椎动物记录。缺少数据时不填充推测结果。
              </p>
            )
          ) : (
            <p className="mt-2 text-[11px] leading-relaxed text-[var(--muted)]">
              点击地图上的省份，查看当地记录到的中国特有脊椎动物。
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}