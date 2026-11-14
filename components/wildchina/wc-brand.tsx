import Link from "next/link";
import { cn } from "@/lib/utils";
import { WC } from "@/lib/wildchina/site";

export function WcBrand({ light = false, className }: { light?: boolean; className?: string }) {
  return (
    <Link
      href="/"
      aria-label={`${WC.name} 首页`}
      className={cn("inline-flex items-baseline gap-3", light ? "text-[#f3ede1]" : "text-[var(--ink)]", className)}
    >
      <span className="wc-brand text-[21px] sm:text-[24px]">WildChina</span>
      <span
        className={cn(
          "hidden text-[10px] tracking-[0.3em] sm:inline",
          light ? "text-[#f3ede1]/70" : "text-[var(--muted)]"
        )}
      >
        中国特有脊椎动物
      </span>
    </Link>
  );
}