"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl, { type LngLatBoundsLike, type Map as MlMap } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Layers, Loader2, MapPin, RotateCcw } from "lucide-react";

interface SpeciesOption {
  slug: string;
  name_cn: string;
  name_en: string;
  scientific_name: string;
  gbif_taxon_key: number | null;
}

interface Occurrence {
  id: string;
  decimalLatitude: number;
  decimalLongitude: number;
  country: string | null;
  locality: string | null;
  eventDate: string | null;
  basisOfRecord: string | null;
  recordedBy: string | null;
  datasetTitle: string | null;
  license: string | null;
  sourceUrl: string;
}

interface Observation {
  id: number;
  lat: number;
  lng: number;
  place: string | null;
  observedOn: string | null;
  quality: string | null;
  license: string | null;
  photoUrl: string | null;
  sourceUrl: string;
}

interface OccurrenceResponse {
  species: {
    slug: string;
    name_cn: string;
    name_en: string;
    scientific_name: string;
    gbif_taxon_key: number | null;
    distribution_note: string;
    countries: string[];
    biomes: string[];
  };
  gbif: {
    state: string;
    message: string;
    retrieved_at: string;
    total: number;
    records: Occurrence[];
    disclaimer: string;
  } | null;
  inat: {
    state: string;
    message: string;
    retrieved_at: string;
    total: number;
    records: Observation[];
    disclaimer: string;
  } | null;
  fetched_at: string;
  disclaimer: string;
}

function boundsOf(coords: Array<[number, number]>): LngLatBoundsLike | null {
  if (coords.length === 0) return null;
  let minLng = coords[0][0];
  let maxLng = coords[0][0];
  let minLat = coords[0][1];
  let maxLat = coords[0][1];
  for (const [lng, lat] of coords) {
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  }
  return [
    [minLng - 2, minLat - 2],
    [maxLng + 2, maxLat + 2],
  ];
}

export function WorldMap({
  options,
  initialSlug,
  initialSource = "both",
  height = "min-h-[560px]",
}: {
  options: SpeciesOption[];
  initialSlug: string;
  initialSource?: "gbif" | "inat" | "both";
  height?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MlMap | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [slug, setSlug] = useState(initialSlug);
  const source = initialSource;
  const [showGbif, setShowGbif] = useState(true);
  const [showInat, setShowInat] = useState(true);
  const [country, setCountry] = useState("all");
  const [data, setData] = useState<OccurrenceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [25, 18],
      zoom: 1.4,
      attributionControl: { compact: true },
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.addControl(new maplibregl.ScaleControl({ maxWidth: 90, unit: "metric" }), "bottom-left");
    map.on("load", () => {
      setMapReady(true);
      setMapError(false);
    });
    map.on("error", () => {
      // Tile-level errors are common and should not replace a working basemap.
      if (!map.isStyleLoaded()) setMapError(true);
    });
    const fallbackTimer = window.setTimeout(() => {
      if (!map.loaded()) setMapError(true);
    }, 15000);
    mapRef.current = map;
    return () => {
      window.clearTimeout(fallbackTimer);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    fetch(`/api/occurrences?slug=${encodeURIComponent(slug)}&source=${source}`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return (await res.json()) as OccurrenceResponse;
      })
      .then((json) => setData(json))
      .catch((err) => {
        if (err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [slug, source]);

  const allCountries = Array.from(
    new Set([
      ...(data?.gbif?.records.map((r) => r.country).filter(Boolean) as string[] | undefined) ?? [],
      ...(data?.inat?.records.map((r) => r.place).filter(Boolean) as string[] | undefined) ?? [],
    ])
  );

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || !data) return;

    const gbifRecords = (showGbif ? data.gbif?.records ?? [] : []).filter((r) =>
      country === "all" ? true : (r.country ?? "").toLowerCase().includes(country.toLowerCase())
    );
    const inatRecords = (showInat ? data.inat?.records ?? [] : []).filter((r) =>
      country === "all" ? true : (r.place ?? "").toLowerCase().includes(country.toLowerCase())
    );

    for (const id of ["gbif-circle", "inat-circle", "gbif-points", "inat-points"]) {
      if (map.getLayer(id)) map.removeLayer(id);
      if (map.getSource(id)) map.removeSource(id);
    }

    if (gbifRecords.length > 0) {
      map.addSource("gbif-points", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: gbifRecords.map((r) => ({
            type: "Feature",
            geometry: { type: "Point", coordinates: [r.decimalLongitude, r.decimalLatitude] },
            properties: { ...r },
          })),
        },
      });
      map.addLayer({
        id: "gbif-circle",
        type: "circle",
        source: "gbif-points",
        paint: {
          "circle-color": "#C29B4A",
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 1, 2.5, 5, 4],
          "circle-opacity": 0.78,
          "circle-stroke-width": 0.7,
          "circle-stroke-color": "#F5F1E7",
        },
      });
    }

    if (inatRecords.length > 0) {
      map.addSource("inat-points", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: inatRecords.map((r) => ({
            type: "Feature",
            geometry: { type: "Point", coordinates: [r.lng, r.lat] },
            properties: { ...r },
          })),
        },
      });
      map.addLayer({
        id: "inat-circle",
        type: "circle",
        source: "inat-points",
        paint: {
          "circle-color": "#2A6B51",
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 1, 2, 5, 3.5],
          "circle-opacity": 0.72,
          "circle-stroke-width": 0.6,
          "circle-stroke-color": "#F5F1E7",
        },
      });
    }

    const coords: Array<[number, number]> = [
      ...gbifRecords.map((r) => [r.decimalLongitude, r.decimalLatitude] as [number, number]),
      ...inatRecords.map((r) => [r.lng, r.lat] as [number, number]),
    ];
    const bounds = boundsOf(coords);
    if (bounds) map.fitBounds(bounds, { padding: 40, maxZoom: 6, duration: 900 });

    const gbifPopup = new maplibregl.Popup({ closeButton: false, offset: 6 });
    const inatPopup = new maplibregl.Popup({ closeButton: false, offset: 6 });

    const escapeHtml = (value: unknown): string =>
      String(value ?? "").replace(/[&<>"']/g, (char) => {
        const map: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
        return map[char] ?? char;
      });
    const safeUrl = (value: unknown): string => {
      const url = String(value ?? "");
      return /^https?:\/\//i.test(url) ? escapeHtml(url) : "#";
    };

    const gbifClick = (e: maplibregl.MapLayerMouseEvent) => {
      const f = e.features?.[0];
      if (!f) return;
      const p = f.properties as Record<string, string>;
      gbifPopup
        .setLngLat(e.lngLat)
        .setHTML(
          `<strong>${escapeHtml(p.country ?? "地点未标注")}</strong><br/>${escapeHtml(p.locality ?? "")}<br/>${escapeHtml(p.eventDate ?? "日期未知")}<br/>${escapeHtml(p.basisOfRecord ?? "")}<br/><a href="${safeUrl(p.sourceUrl)}" target="_blank" rel="noreferrer">GBIF 原始记录 ↗</a><br/><span style="opacity:.6">${escapeHtml(p.license ?? "")}</span>`
        )
        .addTo(map);
    };
    const inatClick = (e: maplibregl.MapLayerMouseEvent) => {
      const f = e.features?.[0];
      if (!f) return;
      const p = f.properties as Record<string, string>;
      inatPopup
        .setLngLat(e.lngLat)
        .setHTML(
          `<strong>${escapeHtml(p.place ?? "地点未公开")}</strong><br/>${escapeHtml(p.observedOn ?? "日期未知")} · ${escapeHtml(p.quality ?? "")}<br/><a href="${safeUrl(p.sourceUrl)}" target="_blank" rel="noreferrer">iNaturalist 原始记录 ↗</a><br/><span style="opacity:.6">${escapeHtml(p.license ?? "")}</span>`
        )
        .addTo(map);
    };

    if (map.getLayer("gbif-circle")) {
      map.on("click", "gbif-circle", gbifClick);
      map.on("mouseenter", "gbif-circle", () => (map.getCanvas().style.cursor = "pointer"));
      map.on("mouseleave", "gbif-circle", () => (map.getCanvas().style.cursor = ""));
    }
    if (map.getLayer("inat-circle")) {
      map.on("click", "inat-circle", inatClick);
      map.on("mouseenter", "inat-circle", () => (map.getCanvas().style.cursor = "pointer"));
      map.on("mouseleave", "inat-circle", () => (map.getCanvas().style.cursor = ""));
    }

    return () => {
      map.off("click", "gbif-circle", gbifClick);
      map.off("click", "inat-circle", inatClick);
    };
  }, [data, showGbif, showInat, country, mapReady]);

  function resetView() {
    const map = mapRef.current;
    if (!map) return;
    map.flyTo({ center: [25, 18], zoom: 1.4, duration: 800 });
  }

  const gbifCount = showGbif
    ? (data?.gbif?.records ?? []).filter((r) => country === "all" || (r.country ?? "").toLowerCase().includes(country.toLowerCase())).length
    : 0;
  const inatCount = showInat
    ? (data?.inat?.records ?? []).filter((r) => country === "all" || (r.place ?? "").toLowerCase().includes(country.toLowerCase())).length
    : 0;

  return (
    <div className={`grid gap-4 lg:grid-cols-[1fr_320px] ${height}`}>
      <div className="relative min-h-[420px] overflow-hidden border border-[var(--line)] bg-[var(--surface-2)]">
        <div ref={containerRef} className="absolute inset-0" />
        {!mapReady && !mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--surface-2)] text-[12px] text-[var(--muted)]">
            <Loader2 size={16} className="mr-2 animate-spin" /> 正在加载 MapLibre 底图…
          </div>
        )}
        {mapError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--surface-2)] p-6 text-center">
            <MapPin size={22} className="text-[var(--clay)]" />
            <p className="mt-3 text-[13px]">底图加载失败</p>
            <p className="mt-1 max-w-sm text-[11px] leading-relaxed text-[var(--muted)]">
              地图样式来自 MapLibre 公共 demo。网络不可用时不会显示伪造点位。
            </p>
            <button onClick={() => window.location.reload()} className="btn-outline mt-4">
              重试
            </button>
          </div>
        )}
        <div className="pointer-events-none absolute left-3 top-3 z-10 border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-[9.5px] text-[var(--muted)] shadow-sm">
          <p className="text-[var(--ink-soft)]">图例 / Legend</p>
          <p className="mt-1 flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#C29B4A]" /> GBIF {gbifCount}</p>
          <p className="mt-0.5 flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#2A6B51]" /> iNaturalist {inatCount}</p>
        </div>
        <button
          onClick={resetView}
          className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 border border-[var(--line-strong)] bg-[var(--surface)] px-3 py-2 text-[10px] shadow-sm"
        >
          <RotateCcw size={11} /> 重置视图
        </button>
      </div>

      <aside className="space-y-3">
        <div className="border border-[var(--line)] bg-[var(--surface)] p-4">
          <label className="label text-[var(--muted)]" htmlFor="map-species">物种</label>
          <select
            id="map-species"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="select-field mt-2"
          >
            {options.map((o) => (
              <option key={o.slug} value={o.slug}>
                {o.name_cn} · {o.name_en}
              </option>
            ))}
          </select>
          <p className="mt-2 text-[9.5px] italic text-[var(--muted)]">
            {data?.species.scientific_name}
          </p>

          <div className="mt-4 flex items-center justify-between">
            <span className="label text-[var(--muted)]">图层</span>
            <Layers size={12} className="text-[var(--muted)]" />
          </div>
          <div className="mt-2 space-y-2">
            <label className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#C29B4A]" /> GBIF 观测</span>
              <input type="checkbox" checked={showGbif} onChange={(e) => setShowGbif(e.target.checked)} className="accent-[var(--forest)]" />
            </label>
            <label className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#2A6B51]" /> iNaturalist 观测</span>
              <input type="checkbox" checked={showInat} onChange={(e) => setShowInat(e.target.checked)} className="accent-[var(--forest)]" />
            </label>
          </div>

          {allCountries.length > 0 && (
            <>
              <label className="label mt-4 block text-[var(--muted)]" htmlFor="map-country">区域过滤</label>
              <select id="map-country" value={country} onChange={(e) => setCountry(e.target.value)} className="select-field mt-2">
                <option value="all">全部记录地点</option>
                {allCountries.slice(0, 60).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </>
          )}
        </div>

        <div className="border border-[var(--line)] p-4">
          <p className="label text-[var(--muted)]">Data status</p>
          {loading ? (
            <p className="mt-2 flex items-center gap-2 text-[11px] text-[var(--muted)]">
              <Loader2 size={12} className="animate-spin" /> 正在请求 GBIF 与 iNaturalist…
            </p>
          ) : error ? (
            <p className="mt-2 text-[10.5px] leading-relaxed text-[var(--clay)]">
              请求失败：{error}。未显示任何模拟点位。
            </p>
          ) : data ? (
            <div className="mt-2 space-y-2 text-[10px] leading-relaxed text-[var(--muted)]">
              <p className={data.gbif?.state === "live" ? "text-[var(--ink-soft)]" : "text-[var(--clay)]"}>
                GBIF：{data.gbif?.state === "live" ? `实时 · ${data.gbif.records.length} 条带坐标记录` : data.gbif?.message ?? "未请求"}
              </p>
              <p className={data.inat?.state === "live" ? "text-[var(--ink-soft)]" : "text-[var(--clay)]"}>
                iNaturalist：{data.inat?.state === "live" ? `实时 · ${data.inat.records.length} 条研究级记录` : data.inat?.message ?? "未请求"}
              </p>
              <p>获取时间：{new Date(data.fetched_at).toLocaleString("zh-CN")}</p>
              <p className="border-t border-[var(--line)] pt-2">
                当前筛选：GBIF {gbifCount} 点 · iNaturalist {inatCount} 点
              </p>
            </div>
          ) : null}
        </div>

        <div className="border border-[var(--line)] bg-[var(--surface-2)] p-4">
          <p className="label text-[var(--muted)]">分布说明（不是点位）</p>
          <p className="mt-2 text-[10.5px] leading-relaxed text-[var(--muted)]">
            {data?.species.distribution_note ?? "选择物种后显示。"}
          </p>
          <p className="mt-2 text-[9.5px] leading-relaxed text-[var(--muted)]">
            生态区：{data?.species.biomes.join("、") ?? "—"}
          </p>
        </div>

        <p className="text-[9px] leading-relaxed text-[var(--muted)]">
          {data?.disclaimer ?? "观测点来自公开接口，不代表完整分布范围。"} 底图：MapLibre demo tiles / Natural Earth。
        </p>
      </aside>
    </div>
  );
}