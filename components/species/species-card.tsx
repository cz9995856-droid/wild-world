"use client";

import { useRef, useState } from "react";
import { Check, Heart, RotateCcw } from "lucide-react";
import { WcPhoto } from "@/components/wildchina/wc-photo";
import { useUI } from "@/components/providers";
import { cn } from "@/lib/utils";

export interface SpeciesCardProps {
  slug: string;
  code: string;
  nameCn: string;
  scientificName: string;
  englishName: string;
  group: string;
  groupLabel: string;
  endemicLine: string;
  conservation: { label: string; status: string; year: number | null };
  image: string | null;
  imageCredit: string | null;
  morphology: string;
  taxonomy: Array<[string, string]>;
  distribution: string;
  habitats: string;
}

const GROUP_VAR: Record<string, string> = {
  mammal: "var(--tax-mammal)",
  bird: "var(--tax-bird)",
  amphibian: "var(--tax-amphibian)",
  reptile: "var(--tax-reptile)",
  fish: "var(--tax-fish)",
};

export function SpeciesCard(props: SpeciesCardProps) {
  const { slug, code, nameCn, scientificName, englishName, group, groupLabel, endemicLine, conservation, image, imageCredit, morphology, taxonomy, distribution, habitats } = props;
  const { isFavorite, toggleFavorite } = useUI();
  const seen = isFavorite(slug);
  const [flipped, setFlipped] = useState(false);
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [pop, setPop] = useState(false);
  const busy = useRef(false);

  const accent = GROUP_VAR[group] ?? "var(--ink)";
  const pending = morphology.includes("待编辑核验");

  function handleMove(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -10, y: px * 12 });
  }

  function handleLeave() {
    setTilt({ x: 0, y: 0 });
  }

  function handleSeen(event: React.MouseEvent) {
    event.stopPropagation();
    if (busy.current) return;
    busy.current = true;
    toggleFavorite(slug);
    setPop(true);
    window.setTimeout(() => {
      setPop(false);
      busy.current = false;
    }, 480);
  }

  const transform = `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`;

  return (
    <div className="select-none">
      <div
        className="hb-flip-scene"
        style={{ transform }}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
      >
        <div className={cn("hb-flip-inner", flipped && "is-flipped")} style={{ height: "clamp(460px, 76vh, 560px)" }}>
          <button
            type="button"
            onClick={() => setFlipped(false)}
            aria-hidden={!flipped}
            tabIndex={flipped ? 0 : -1}
            className={cn(
              "hb-face absolute inset-0 flex w-full flex-col text-left",
              flipped && "pointer-events-none"
            )}
            style={{ background: `color-mix(in srgb, ${accent} 10%, var(--surface))` }}
          >
            <span className="flex items-start justify-between px-4 pt-4">
              <span className="text-[10px] tracking-[0.22em] text-[var(--muted)]">NO. {code}</span>
              <span className="border border-[var(--line-strong)] px-2 py-1 text-[10px]" style={{ color: accent }}>
                {conservation.label} · {conservation.status}
              </span>
            </span>

            <span className="relative mx-4 mt-3 block flex-1 overflow-hidden border border-[var(--line-strong)] bg-[var(--surface-2)]">
              <WcPhoto src={image} alt={`${nameCn} 卡牌主视觉`} priority sizes="(max-width: 1024px) 100vw, 480px" fallbackLabel="影像待补" fallbackNote="尚未取得可核验的授权图片" />
            </span>

            <span className="block px-4 pb-3 pt-3">
              <span className="hb-tag block w-fit font-normal" style={{ ["--tag-color" as string]: accent }}>
                {groupLabel}
              </span>
              <span className="mt-2 block text-[30px] font-black leading-none tracking-tight">{nameCn}</span>
              <span className="mt-1.5 block font-serif text-[11.5px] italic text-[var(--muted)]">{scientificName}</span>
              <span className="mt-2 block text-[11px] text-[var(--ink-soft)]">{endemicLine}</span>
              <span className="mt-3 flex items-center justify-between gap-2">
                <span className="flex items-center gap-1 text-[9.5px] text-[var(--muted)]">
                  <RotateCcw size={11} /> 点卡面翻到背面
                </span>
                {imageCredit && <span className="truncate text-[8.5px] text-[var(--muted)]">{imageCredit}</span>}
              </span>
            </span>
          </button>

          <div className="hb-face hb-face-back flex flex-col" aria-hidden={!flipped}>
            <div className="flex items-center justify-between px-4 pt-4">
              <p className="text-[10px] tracking-[0.22em] text-[var(--muted)]">NO. {code} · 背面</p>
              <span className="text-[10px]" style={{ color: accent }}>
                {englishName}
              </span>
            </div>

            <div className="px-4 pt-3">
              <p className="text-[11px]" style={{ color: accent }}>
                身体数据
              </p>
              <p className={cn("mt-1.5 text-[12px] leading-relaxed", pending ? "text-[var(--muted)]" : "text-[var(--ink-soft)]")}>
                {pending ? "形态描述尚未完成核验，本站先不填数字。" : morphology}
              </p>
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2.5 px-4">
              {taxonomy.map(([label, value]) => (
                <div key={label} className="border-t border-[var(--line)] pt-1.5">
                  <dt className="text-[9px] text-[var(--muted)]">{label}</dt>
                  <dd className="text-[11.5px] text-[var(--ink-soft)]">{value || "待核验"}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-4 space-y-2.5 px-4 pb-4">
              <div>
                <p className="text-[9px] text-[var(--muted)]">分布</p>
                <p className="mt-0.5 text-[11.5px] leading-relaxed text-[var(--ink-soft)]">{distribution}</p>
              </div>
              <div>
                <p className="text-[9px] text-[var(--muted)]">栖息环境</p>
                <p className="mt-0.5 text-[11.5px] leading-relaxed text-[var(--ink-soft)]">{habitats || "待核验"}</p>
              </div>
              <div>
                <p className="text-[9px] text-[var(--muted)]">保护等级</p>
                <p className="mt-0.5 text-[11.5px] leading-relaxed text-[var(--ink-soft)]">
                  {conservation.label}（{conservation.status}）
                  {conservation.year ? ` · ${conservation.year} 年评估` : " · 评估年份待核验"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setFlipped(false)}
              tabIndex={flipped ? 0 : -1}
              className="mx-4 mb-4 mt-auto flex w-[calc(100%-2rem)] items-center justify-center gap-1.5 border border-[var(--line-strong)] py-2 text-[10.5px]"
            >
              <RotateCcw size={11} /> 翻回正面
            </button>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={handleSeen}
          aria-pressed={seen}
          style={seen ? { background: "var(--amber)", borderColor: "var(--amber)", color: "var(--paper)" } : undefined}
          className={cn("hb-btn flex-1 text-[13px]", !seen && "hb-btn-ghost", pop && "hb-seen-pop")}
        >
          {seen ? <Check size={15} /> : <Heart size={15} />}
          {seen ? "已收进收集册" : "我见过它"}
        </button>
        <button
          type="button"
          onClick={() => setFlipped((value) => !value)}
          className="hb-btn hb-btn-ghost shrink-0 text-[12px]"
        >
          {flipped ? "看正面" : "看背面"}
        </button>
      </div>
    </div>
  );
}