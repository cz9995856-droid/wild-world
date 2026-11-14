import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export function OfficialSourceBar({
  href,
  name,
  note,
  cta = "前往官方网站",
  className,
}: {
  href: string;
  name: string;
  note?: string;
  cta?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-l-2 border-[var(--forest)] bg-[var(--surface-2)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-5",
        className
      )}
    >
      <div className="min-w-0">
        <p className="label text-[var(--clay)]">Official source · 官方来源</p>
        <p className="mt-1 truncate text-[13px] font-medium text-[var(--ink-soft)]">{name}</p>
        {note && <p className="mt-0.5 text-[10.5px] leading-relaxed text-[var(--muted)]">{note}</p>}
      </div>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary shrink-0 justify-center"
      >
        {cta} <ExternalLink size={13} />
      </a>
    </div>
  );
}