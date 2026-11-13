import type { ConservationCode, Trend } from "@/lib/types";

export const CONSERVATION_META: Record<
  ConservationCode,
  { label: string; labelEn: string; className: string; dot: string; order: number }
> = {
  EX: { label: "灭绝", labelEn: "Extinct", className: "bg-[#1b1b1b] text-[#e8e2d4]", dot: "#1b1b1b", order: 9 },
  EW: { label: "野外灭绝", labelEn: "Extinct in the Wild", className: "bg-[#3a2f2a] text-[#e8e2d4]", dot: "#3a2f2a", order: 8 },
  CR: { label: "极危", labelEn: "Critically Endangered", className: "bg-[#8f2f24] text-[#fdf6e8]", dot: "#8f2f24", order: 7 },
  EN: { label: "濒危", labelEn: "Endangered", className: "bg-[#b4552f] text-[#fdf6e8]", dot: "#b4552f", order: 6 },
  VU: { label: "易危", labelEn: "Vulnerable", className: "bg-[#c08a3e] text-[#241a0d]", dot: "#c08a3e", order: 5 },
  NT: { label: "近危", labelEn: "Near Threatened", className: "bg-[#b6a56a] text-[#241f0d]", dot: "#b6a56a", order: 4 },
  LC: { label: "无危", labelEn: "Least Concern", className: "bg-[#5f7d5c] text-[#f3f0e5]", dot: "#5f7d5c", order: 3 },
  DD: { label: "数据缺乏", labelEn: "Data Deficient", className: "bg-[#7d7a6b] text-[#f3f0e5]", dot: "#7d7a6b", order: 2 },
  NE: { label: "未评估", labelEn: "Not Evaluated", className: "bg-[#8a8578] text-[#f3f0e5]", dot: "#8a8578", order: 1 },
};

export const TREND_LABEL: Record<Trend, string> = {
  decreasing: "下降",
  stable: "稳定",
  increasing: "上升",
  unknown: "不确定",
};

export const TREND_ARROW: Record<Trend, string> = {
  decreasing: "↓",
  stable: "→",
  increasing: "↑",
  unknown: "?",
};

export function formatDate(input: string | Date, locale = "zh-CN"): string {
  const date = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return "日期待核验";
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function formatDateTime(input: string | Date): string {
  const date = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return "时间待核验";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function relativeTime(input: string): string {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "时间待核验";
  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / 86400000);
  if (days <= 0) return "今天";
  if (days === 1) return "昨天";
  if (days < 30) return `${days} 天前`;
  if (days < 365) return `${Math.floor(days / 30)} 个月前`;
  return `${Math.floor(days / 365)} 年前`;
}

export function formatWeight(min: number, max: number): string {
  const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)} 吨` : `${n} 公斤`);
  if (min === max) return fmt(min);
  if (min < 1 && max < 1) {
    const grams = (n: number) => (n < 0.01 ? (n * 1000).toFixed(1) : String(Math.round(n * 1000)));
    return `${grams(min)}–${grams(max)} 克`;
  }
  return `${fmt(min)} – ${fmt(max)}`;
}

export function formatRange(range: [number, number] | null, unit: string): string {
  if (!range) return "资料待补充";
  return range[0] === range[1] ? `${range[0]} ${unit}` : `${range[0]}–${range[1]} ${unit}`;
}

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function truncate(input: string, max = 160): string {
  if (input.length <= max) return input;
  return `${input.slice(0, max).trim()}…`;
}

export function plural(n: number, zh: string, en: string, locale = "zh"): string {
  return locale === "zh" ? `${n} ${zh}` : `${n} ${en}${n === 1 ? "" : "s"}`;
}

export function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export const DATA_STATUS_META: Record<string, { label: string; tone: string; description: string }> = {
  live: { label: "实时", tone: "text-[#2A6B51] border-[#2A6B51]/30 bg-[#2A6B51]/8", description: "来自已连接的外部接口，页面标注获取时间。" },
  verified: { label: "已核验", tone: "text-[#2A6B51] border-[#2A6B51]/30 bg-[#2A6B51]/8", description: "已由编辑人员对照来源逐条核对。" },
  editorial: { label: "编辑整理", tone: "text-[#8A6A28] border-[#C29B4A]/40 bg-[#C29B4A]/10", description: "由馆方编辑依据公开来源整理，尚未逐条复核原始文献。" },
  pending_review: { label: "待审核", tone: "text-[#A96246] border-[#A96246]/40 bg-[#A96246]/10", description: "等待编辑审核，可能尚未对外发布。" },
  curated: { label: "馆藏整理", tone: "text-[#8A6A28] border-[#C29B4A]/40 bg-[#C29B4A]/10", description: "馆方整理的精选内容，附来源链接与更新时间。" },
  pending: { label: "待配置", tone: "text-[#6b6b6b] border-[#6b6b6b]/30 bg-[#6b6b6b]/8", description: "尚未连接或尚未核验。" },
  sample: { label: "示例", tone: "text-[#A96246] border-[#A96246]/40 bg-[#A96246]/10", description: "明确标注的示例内容，不代表真实数据。" },
  unconfigured: { label: "未配置", tone: "text-[#6b6b6b] border-[#6b6b6b]/30 bg-[#6b6b6b]/8", description: "需要密钥、授权或人工配置。" },
};