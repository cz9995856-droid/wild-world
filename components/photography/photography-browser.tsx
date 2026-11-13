"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { MediaAsset } from "@/lib/types";
import { MediaGallery } from "@/components/media-gallery";
import { EmptyState } from "@/components/ui/states";

const LICENSE_FILTERS = [
  { key: "all", label: "全部许可" },
  { key: "commercial", label: "允许商业使用" },
  { key: "noncommercial", label: "仅非商业" },
  { key: "download", label: "可下载" },
];

const GROUP_LABELS: Record<string, string> = {
  mammal: "哺乳动物",
  bird: "鸟类",
  reptile: "爬行动物",
  amphibian: "两栖动物",
  insect: "昆虫",
};

export function PhotographyBrowser({ photos }: { photos: MediaAsset[] }) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("all");
  const [license, setLicense] = useState("all");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return photos.filter((p) => {
      if (group !== "all" && p.category !== group) return false;
      if (license === "commercial" && !p.commercial_use) return false;
      if (license === "noncommercial" && p.commercial_use) return false;
      if (license === "download" && !p.download_allowed) return false;
      if (!q) return true;
      return `${p.title} ${p.author} ${p.license} ${p.source_name}`.toLowerCase().includes(q);
    });
  }, [photos, query, group, license]);

  const commercial = photos.filter((p) => p.commercial_use).length;
  const downloadable = photos.filter((p) => p.download_allowed).length;
  const licenses = Array.from(new Set(photos.map((p) => p.license))).sort();

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "影像总数", value: photos.length },
          { label: "允许商业使用", value: commercial },
          { label: "可提供下载", value: downloadable },
          { label: "许可类型", value: licenses.length },
        ].map((stat) => (
          <div key={stat.label} className="border border-[var(--line)] bg-[var(--surface)] p-4">
            <p className="display text-[30px]">{stat.value}</p>
            <p className="mt-1 text-[9.5px] uppercase tracking-[0.14em] text-[var(--muted)]">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mb-6 flex flex-col gap-3 border border-[var(--line)] bg-[var(--surface-2)] p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索物种、摄影者或许可…"
            className="field pl-8"
            aria-label="搜索影像"
          />
        </div>
        <select value={group} onChange={(e) => setGroup(e.target.value)} className="select-field sm:w-36" aria-label="类群">
          <option value="all">全部类群</option>
          {Object.entries(GROUP_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <select value={license} onChange={(e) => setLicense(e.target.value)} className="select-field sm:w-40" aria-label="许可筛选">
          {LICENSE_FILTERS.map((l) => (
            <option key={l.key} value={l.key}>{l.label}</option>
          ))}
        </select>
        <span className="text-[10px] text-[var(--muted)]">{filtered.length} 张</span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="没有符合条件的影像"
          description="馆藏影像来自 iNaturalist 开放数据。未被收录或未获许可的照片不会用占位图替代。"
          action={
            <button
              onClick={() => {
                setQuery("");
                setGroup("all");
                setLicense("all");
              }}
              className="btn-outline"
            >
              重置筛选
            </button>
          }
        />
      ) : (
        <MediaGallery assets={filtered} title="WILD WORLD 摄影馆" />
      )}

      <div className="mt-8 border border-[var(--line)] bg-[var(--surface)] p-5">
        <p className="label text-[var(--muted)]">许可说明</p>
        <div className="mt-3 grid gap-4 text-[10.5px] leading-relaxed text-[var(--muted)] sm:grid-cols-2">
          <p>
            每张照片在查看器中显示作者、来源、许可、获取时间与商用/演绎权限。许可元数据来自来源接口，
            下载前仍建议在来源页复核一次；许可证可能由作者变更。
          </p>
          <p>
            标记为 CC BY-NC 或 CC BY-NC-SA 的素材仅用于本站非商业展示，不提供直接下载。CC BY / CC BY-SA / CC0
            素材按署名要求使用。任何图片都不默认「全部可商用」。
          </p>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {licenses.map((l) => (
            <span key={l} className="chip">{l}</span>
          ))}
        </div>
      </div>
    </div>
  );
}