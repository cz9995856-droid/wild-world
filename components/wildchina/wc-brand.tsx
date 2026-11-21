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
      <span className="flex flex-col">
        <span className="wc-brand text-[24px] leading-none sm:text-[28px]">WildChina</span>
        <span
          className={cn(
            "mt-1 hidden text-[10px] tracking-[0.18em] sm:block",
            light ? "text-[#f3ede1]/70" : "text-[var(--ink-soft)]"
          )}
        >
          中国特有脊椎动物 · 探索者计划
        </span>
      </span>
    </Link>
  );
}