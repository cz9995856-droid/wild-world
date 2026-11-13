import type { ConservationCode, ReviewStatus } from "@/lib/types";
import { CONSERVATION_META, DATA_STATUS_META, cn } from "@/lib/utils";

export function ConservationBadge({
  code,
  label,
  size = "sm",
  className,
}: {
  code: ConservationCode;
  label?: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const meta = CONSERVATION_META[code] ?? CONSERVATION_META.NE;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-xs font-medium tracking-wide",
        size === "sm" ? "px-2 py-1 text-[10px]" : "px-2.5 py-1.5 text-[11px]",
        meta.className,
        className
      )}
      title={`IUCN 保护等级：${meta.labelEn}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" aria-hidden="true" />
      {label ?? meta.label}
      <span className="font-mono opacity-70">{code}</span>
    </span>
  );
}

export function DataBadge({
  status,
  className,
  showDescription = false,
}: {
  status: ReviewStatus | "live" | "curated" | "pending" | "unconfigured";
  className?: string;
  showDescription?: boolean;
}) {
  const meta = DATA_STATUS_META[status] ?? DATA_STATUS_META.pending;
  return (
    <span
      className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[9.5px]", meta.tone, className)}
      title={meta.description}
    >
      <span className="h-1 w-1 rounded-full bg-current" aria-hidden="true" />
      {meta.label}
      {showDescription && <span className="opacity-70">· {meta.description}</span>}
    </span>
  );
}

export function SourceNote({
  name,
  url,
  retrieved,
  license,
  review,
  className,
}: {
  name: string;
  url: string;
  retrieved?: string;
  license?: string;
  review?: ReviewStatus;
  className?: string;
}) {
  return (
    <div className={cn("border-t border-[var(--line)] pt-3 text-[10.5px] leading-relaxed text-[var(--muted)]", className)}>
      <p>
        来源：
        <a href={url} target="_blank" rel="noopener noreferrer" className="link-underline text-[var(--ink-soft)]">
          {name}
        </a>
        {license && <span> · 许可：{license}</span>}
      </p>
      <p className="mt-1">
        {retrieved && <span>获取时间：{retrieved} </span>}
        {review && <span>· 审核状态：{DATA_STATUS_META[review]?.label ?? review}</span>}
      </p>
    </div>
  );
}