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
      <span className="wc-brand text-[26px] sm:text-[30px]">WildChina</span>
      <span
        className={cn(
          "hidden text-[13px] tracking-[0.24em] sm:inline",
          light ? "text-[#f3ede1]/75" : "text-[var(--ink-soft)]"
        )}
      >
        中国特有脊椎动物
      </span>
    </Link>
  );
}